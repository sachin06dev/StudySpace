-- ==============================================================================
-- Migration: Attendance & Timetable System (V1)
-- ==============================================================================
-- Tables created:
--   1. public.semesters
--   2. public.subjects
--   3. public.timetable_slots
--   4. public.timetable_exceptions
--   5. public.attendance_records
-- Altered:
--   public.user_settings  — default_attendance_target column
--
-- day_of_week convention: 0 = Monday … 6 = Sunday  (ISO 8601-aligned)
-- Time fields use TIME (no TZ); timezone handling is done in the app layer
-- via profiles.timezone, consistent with the existing analytics utilities.
-- ==============================================================================


-- ==============================================================================
-- 0. user_settings — add default attendance target
-- ==============================================================================
ALTER TABLE public.user_settings
    ADD COLUMN IF NOT EXISTS default_attendance_target NUMERIC(5,2) NOT NULL DEFAULT 75.00
        CONSTRAINT user_settings_default_attendance_target_check
            CHECK (default_attendance_target BETWEEN 0 AND 100);


-- ==============================================================================
-- 1. semesters
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.semesters (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name        TEXT        NOT NULL,
    start_date  DATE        NOT NULL,
    end_date    DATE        NOT NULL,
    -- Default false: the application layer must explicitly activate a semester.
    -- A new semester must never conflict with an already-active one.
    is_active   BOOLEAN     NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT semesters_end_after_start_check CHECK (end_date >= start_date)
);

-- Enforce at most one active semester per user at the database level.
CREATE UNIQUE INDEX IF NOT EXISTS uq_semesters_one_active_per_user
    ON public.semesters (user_id)
    WHERE is_active = true;

-- General lookup index.
CREATE INDEX IF NOT EXISTS idx_semesters_user_active
    ON public.semesters (user_id, is_active);

ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select own semesters"
    ON public.semesters FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "insert own semesters"
    ON public.semesters FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "update own semesters"
    ON public.semesters FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "delete own semesters"
    ON public.semesters FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);


-- ==============================================================================
-- 2. subjects
-- ==============================================================================
-- Application-layer FK ownership responsibilities:
--   • When inserting a subject, the server must verify that
--     semester_id belongs to the authenticated user (subjects.user_id = auth.uid()
--     is enforced by RLS, but semester_id cross-ownership must be checked in the
--     Server Action / data layer before the INSERT).
CREATE TABLE IF NOT EXISTS public.subjects (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    semester_id         UUID        NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
    name                TEXT        NOT NULL,
    code                TEXT,
    faculty             TEXT,
    default_room        TEXT,
    -- Allowed class types for V1
    class_type          TEXT        NOT NULL DEFAULT 'theory'
                            CONSTRAINT subjects_class_type_check
                                CHECK (class_type IN ('theory', 'lab', 'tutorial', 'other')),
    credits             NUMERIC(4,2),
    -- NULL means inherit user_settings.default_attendance_target
    target_percentage   NUMERIC(5,2)
                            CONSTRAINT subjects_target_percentage_check
                                CHECK (target_percentage BETWEEN 0 AND 100),
    baseline_attended   INTEGER     NOT NULL DEFAULT 0
                            CONSTRAINT subjects_baseline_attended_check
                                CHECK (baseline_attended >= 0),
    baseline_total      INTEGER     NOT NULL DEFAULT 0
                            CONSTRAINT subjects_baseline_total_check
                                CHECK (baseline_total >= 0),
    CONSTRAINT subjects_baseline_attended_le_total_check
        CHECK (baseline_attended <= baseline_total),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subjects_user_semester
    ON public.subjects (user_id, semester_id);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select own subjects"
    ON public.subjects FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "insert own subjects"
    ON public.subjects FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "update own subjects"
    ON public.subjects FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "delete own subjects"
    ON public.subjects FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);


-- ==============================================================================
-- 3. timetable_slots
-- ==============================================================================
-- Overlapping slots are intentionally allowed (no uniqueness constraint on
-- day_of_week + time).  Recurrence is virtual — only the weekly template is
-- stored here; no future occurrences are materialised.
--
-- Application-layer FK ownership responsibilities:
--   • subject_id must belong to the same user_id and semester_id as this slot.
--     The FK only checks referential integrity, not cross-column consistency.
--     The server data layer must assert: subject.user_id = auth.uid() AND
--     subject.semester_id = timetable_slots.semester_id before INSERT/UPDATE.
CREATE TABLE IF NOT EXISTS public.timetable_slots (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    semester_id         UUID        NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
    subject_id          UUID        NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    -- 0 = Monday, 1 = Tuesday, 2 = Wednesday, 3 = Thursday,
    -- 4 = Friday, 5 = Saturday, 6 = Sunday  (ISO 8601-aligned)
    day_of_week         SMALLINT    NOT NULL
                            CONSTRAINT timetable_slots_day_of_week_check
                                CHECK (day_of_week BETWEEN 0 AND 6),
    start_time          TIME        NOT NULL,
    end_time            TIME        NOT NULL,
    CONSTRAINT timetable_slots_end_after_start_check CHECK (end_time > start_time),
    -- Per-slot overrides; NULL means use the subject's default
    room_override       TEXT,
    faculty_override    TEXT,
    class_type_override TEXT
                            CONSTRAINT timetable_slots_class_type_override_check
                                CHECK (class_type_override IN ('theory', 'lab', 'tutorial', 'other')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_timetable_slots_user_semester_day
    ON public.timetable_slots (user_id, semester_id, day_of_week);

CREATE INDEX IF NOT EXISTS idx_timetable_slots_subject
    ON public.timetable_slots (subject_id);

ALTER TABLE public.timetable_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select own timetable_slots"
    ON public.timetable_slots FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "insert own timetable_slots"
    ON public.timetable_slots FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "update own timetable_slots"
    ON public.timetable_slots FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "delete own timetable_slots"
    ON public.timetable_slots FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);


-- ==============================================================================
-- 4. timetable_exceptions
-- ==============================================================================
-- Semantics by exception_type:
--
--   CANCELLED
--     timetable_slot_id  REQUIRED  — identifies the recurring slot being cancelled
--     exception_date     REQUIRED  — the specific calendar date cancelled
--     subject_id         NULL      — class is simply not happening; no replacement
--     start_time /
--     end_time           NULL      — original times come from the slot itself
--     replacement_date /
--     replacement_start_time /
--     replacement_end_time  NULL   — no replacement occurrence
--
--   EXTRA
--     timetable_slot_id  NULL      — not based on any recurring slot
--     subject_id         REQUIRED  — identifies the subject for this ad-hoc class
--     exception_date     REQUIRED  — the date the extra class occurs
--     start_time         REQUIRED  — extra class start time
--     end_time           REQUIRED  — extra class end time
--     replacement_date /
--     replacement_start_time /
--     replacement_end_time  NULL   — not applicable
--
--   RESCHEDULED
--     timetable_slot_id  REQUIRED  — the original recurring slot
--     exception_date     REQUIRED  — original date that is being moved
--     replacement_date   REQUIRED  — new date the class moves to
--     replacement_start_time REQUIRED — new start time
--     replacement_end_time   REQUIRED — new end time
--     subject_id         NULL (usually) — original slot's subject unless overridden
--     start_time /
--     end_time           NULL      — original times come from the slot itself
--
-- Application-layer FK ownership responsibilities:
--   • timetable_slot_id must belong to the same user_id and semester_id.
--   • subject_id (when set) must belong to the same user_id and semester_id.
--   • replacement_date (rescheduled) must fall within semester start/end bounds.
--   • exception_date must fall within semester start/end bounds.
--   These cross-row rules are enforced by the server data layer, not by DB constraints.
CREATE TABLE IF NOT EXISTS public.timetable_exceptions (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    semester_id             UUID        NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
    -- NULL for 'extra' — ad-hoc class that has no originating recurring slot
    timetable_slot_id       UUID        REFERENCES public.timetable_slots(id) ON DELETE SET NULL,
    -- The original/affected calendar date (all types)
    exception_date          DATE        NOT NULL,
    exception_type          TEXT        NOT NULL
                                CONSTRAINT timetable_exceptions_exception_type_check
                                    CHECK (exception_type IN ('cancelled', 'extra', 'rescheduled')),
    -- -----------------------------------------------------------------------
    -- 'extra' exception: time of the ad-hoc class on exception_date
    -- -----------------------------------------------------------------------
    start_time              TIME,       -- extra: class start
    end_time                TIME,       -- extra: class end
    CONSTRAINT timetable_exceptions_extra_end_after_start_check
        CHECK (end_time IS NULL OR start_time IS NULL OR end_time > start_time),
    -- -----------------------------------------------------------------------
    -- 'rescheduled' exception: the new occurrence
    -- Stores the full replacement schedule so both original and replacement
    -- can be displayed without joining back to timetable_slots each time.
    -- -----------------------------------------------------------------------
    replacement_date        DATE,       -- rescheduled: new calendar date
    replacement_start_time  TIME,       -- rescheduled: new start time
    replacement_end_time    TIME,       -- rescheduled: new end time
    CONSTRAINT timetable_exceptions_replacement_end_after_start_check
        CHECK (
            replacement_end_time IS NULL OR
            replacement_start_time IS NULL OR
            replacement_end_time > replacement_start_time
        ),
    -- -----------------------------------------------------------------------
    -- Optional overrides (shared across types where relevant)
    -- -----------------------------------------------------------------------
    -- subject_id: overrides the slot's subject (e.g. substitute class, extra class)
    subject_id              UUID        REFERENCES public.subjects(id) ON DELETE SET NULL,
    room                    TEXT,
    faculty                 TEXT,
    notes                   TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_timetable_exceptions_slot_date
    ON public.timetable_exceptions (timetable_slot_id, exception_date);

CREATE INDEX IF NOT EXISTS idx_timetable_exceptions_semester_date
    ON public.timetable_exceptions (semester_id, exception_date);

ALTER TABLE public.timetable_exceptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select own timetable_exceptions"
    ON public.timetable_exceptions FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "insert own timetable_exceptions"
    ON public.timetable_exceptions FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "update own timetable_exceptions"
    ON public.timetable_exceptions FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "delete own timetable_exceptions"
    ON public.timetable_exceptions FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);


-- ==============================================================================
-- 5. attendance_records
-- ==============================================================================
-- Multiple records for the same subject on the same date are allowed (e.g. a
-- double-period, or a makeup + regular class on the same day).
-- 'cancelled' status records must be excluded from attendance totals at the
-- application/query layer; no partial index enforces this to keep queries flexible.
--
-- Application-layer FK ownership responsibilities:
--   • subject_id must belong to the same user_id and semester_id as this record.
--   • timetable_slot_id (when set) must belong to the same user_id, semester_id,
--     and the same subject as this record.
--   • class_date must fall within semester start/end bounds.
--   These cross-row rules are enforced by the server data layer.
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    semester_id         UUID        NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
    subject_id          UUID        NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    -- NULL for ad-hoc / extra classes that have no originating timetable slot
    timetable_slot_id   UUID        REFERENCES public.timetable_slots(id) ON DELETE SET NULL,
    class_date          DATE        NOT NULL,
    start_time          TIME        NOT NULL,
    end_time            TIME        NOT NULL,
    CONSTRAINT attendance_records_end_after_start_check CHECK (end_time > start_time),
    status              TEXT        NOT NULL
                            CONSTRAINT attendance_records_status_check
                                CHECK (status IN ('present', 'absent', 'cancelled')),
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attendance_records_user_semester_date
    ON public.attendance_records (user_id, semester_id, class_date);

CREATE INDEX IF NOT EXISTS idx_attendance_records_subject_date
    ON public.attendance_records (subject_id, class_date);

ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select own attendance_records"
    ON public.attendance_records FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "insert own attendance_records"
    ON public.attendance_records FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "update own attendance_records"
    ON public.attendance_records FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "delete own attendance_records"
    ON public.attendance_records FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);
