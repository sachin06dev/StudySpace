-- ==============================================================================
-- StudySpace — Pre-Ship Supabase Security Advisor & RLS Hardening Fixes
-- ==============================================================================
-- Run this script in the Supabase SQL Editor to resolve:
-- 1. Security Advisor: anon_security_definer_function_executable on handle_new_user()
-- 2. Security Advisor: search_path and execution privileges on rls_auto_enable()
-- 3. Data Isolation: Drop overly permissive DELETE policy on shared playlist_items
-- 4. Storage Security: Add WITH CHECK clause on storage.objects UPDATE policy
-- 5. Defense-in-depth: Ensure RLS is active across all 13 tables
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Fix handle_new_user() (SECURITY DEFINER, Search Path & Execute Revocations)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, email, avatar_url, timezone)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1)
        ),
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url',
        'UTC'
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$;

-- Revoke direct execution permissions from public, anon, and authenticated
-- (Trigger will still execute safely via PostgreSQL trigger on auth.users)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;


-- ------------------------------------------------------------------------------
-- 2. Fix rls_auto_enable() if present (Search Path & Execute Revocations)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public' AND p.proname = 'rls_auto_enable'
    ) THEN
        -- Harden search path
        EXECUTE 'ALTER FUNCTION public.rls_auto_enable() SET search_path = pg_catalog';

        -- Revoke direct execution permissions
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC';
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon';
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM authenticated';
    END IF;
END $$;


-- ------------------------------------------------------------------------------
-- 3. Data Isolation: Remove Overly Permissive DELETE on playlist_items
-- ------------------------------------------------------------------------------
-- playlist_items is a shared global catalog linking playlists to videos.
-- Authenticated users should not be allowed to delete global playlist items.
DROP POLICY IF EXISTS "delete playlist_items" ON public.playlist_items;
DROP POLICY IF EXISTS "Anyone authenticated can delete playlist items" ON public.playlist_items;


-- ------------------------------------------------------------------------------
-- 4. Storage Security: Harden storage.objects UPDATE Policy with WITH CHECK
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "update own documents" ON storage.objects;

CREATE POLICY "Users can update their own documents"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'study-documents' AND
        (storage.foldername(name))[1] = (select auth.uid())::text
    )
    WITH CHECK (
        bucket_id = 'study-documents' AND
        (storage.foldername(name))[1] = (select auth.uid())::text
    );


-- ------------------------------------------------------------------------------
-- 5. Defense-in-depth: Ensure RLS is active on all StudySpace tables
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.youtube_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.saved_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.youtube_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.saved_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.video_timestamp_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.website_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_categories ENABLE ROW LEVEL SECURITY;
