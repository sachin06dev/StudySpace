-- ==============================================================================
-- Migration: Enable Supabase Realtime for attendance_records and documents
-- ==============================================================================

DO $$
BEGIN
    -- 1. Ensure public.attendance_records is published to supabase_realtime
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'attendance_records'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_records;
    END IF;

    -- 2. Ensure public.documents is published to supabase_realtime
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'documents'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
    END IF;
END $$;

-- 3. Set REPLICA IDENTITY FULL so UPDATE/DELETE events provide full record payloads
ALTER TABLE public.attendance_records REPLICA IDENTITY FULL;
ALTER TABLE public.documents REPLICA IDENTITY FULL;
