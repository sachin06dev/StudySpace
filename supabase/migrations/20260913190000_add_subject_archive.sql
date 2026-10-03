-- ==============================================================================
-- Migration: Add Subject Archiving Support
-- ==============================================================================
-- Adds is_archived flag to public.subjects to safely preserve historical attendance
-- records, calculations, and notes while removing archived subjects from active
-- weekly timetable schedules and today's class tracking.
-- ==============================================================================

ALTER TABLE public.subjects
    ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_subjects_user_semester_archived
    ON public.subjects (user_id, semester_id, is_archived);
