-- ==============================================================================
-- Migration: Enable Full Realtime Synchronization for all StudySpace tables
-- ==============================================================================

DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'tasks',
        'semesters',
        'subjects',
        'timetable_slots',
        'timetable_exceptions',
        'pomodoro_sessions',
        'user_settings',
        'website_resources',
        'saved_playlists',
        'saved_videos',
        'video_timestamp_notes',
        'user_devices',
        'profiles'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        -- Idempotently add table to supabase_realtime publication
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables
            WHERE pubname = 'supabase_realtime'
              AND schemaname = 'public'
              AND tablename = tbl
        ) THEN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I;', tbl);
        END IF;

        -- Set REPLICA IDENTITY FULL for full payload on UPDATE and DELETE under RLS
        EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY FULL;', tbl);
    END LOOP;
END $$;
