-- ==============================================================================
-- Migration: Admin Global System Analytics & Secure RPC Endpoints
-- ==============================================================================

-- 1. Ensure role column exists on public.profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

-- 2. Create index for fast role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 3. Create or update get_admin_dashboard_stats RPC function
-- Returns system-wide aggregates for all users to authorized admins only
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_catalog
AS $$
DECLARE
    v_is_admin boolean;
    v_result json;
    v_db_size bigint;
    v_user_count bigint;
BEGIN
    -- Security check: caller must be authenticated and have role = 'admin' in profiles
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (select auth.uid()) AND role = 'admin'
    ) INTO v_is_admin;

    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'Unauthorized: admin privilege required';
    END IF;

    -- Compute database size in bytes safely
    BEGIN
        SELECT pg_database_size(current_database()) INTO v_db_size;
    EXCEPTION WHEN OTHERS THEN
        v_db_size := 0;
    END;

    -- Count total registered authenticated users with fallback to profiles table
    BEGIN
        SELECT count(*) FROM auth.users INTO v_user_count;
    EXCEPTION WHEN OTHERS THEN
        SELECT count(*) FROM public.profiles INTO v_user_count;
    END;

    -- Aggregate counts across ALL users without exposing any personal records
    SELECT json_build_object(
        'registered_users', v_user_count,
        'total_users', v_user_count,
        'documents', (SELECT count(*) FROM public.documents),
        'total_documents', (SELECT count(*) FROM public.documents),
        'tasks', (SELECT count(*) FROM public.tasks),
        'total_tasks', (SELECT count(*) FROM public.tasks),
        'video_notes', (SELECT count(*) FROM public.video_timestamp_notes),
        'total_notes', (SELECT count(*) FROM public.video_timestamp_notes),
        'saved_videos', (SELECT count(*) FROM public.saved_videos),
        'total_saved_videos', (SELECT count(*) FROM public.saved_videos),
        'focus_sessions', (SELECT count(*) FROM public.pomodoro_sessions),
        'total_pomodoro_sessions', (SELECT count(*) FROM public.pomodoro_sessions),
        'saved_playlists', (SELECT count(*) FROM public.saved_playlists),
        'total_saved_playlists', (SELECT count(*) FROM public.saved_playlists),
        'resources', (SELECT count(*) FROM public.website_resources),
        'total_resources', (SELECT count(*) FROM public.website_resources),
        'total_document_bytes', (SELECT COALESCE(sum(file_size_bytes), 0) FROM public.documents),
        'db_size_bytes', v_db_size
    ) INTO v_result;

    RETURN v_result;
END;
$$;

-- Revoke public execution and grant only to authenticated role
REVOKE EXECUTE ON FUNCTION public.get_admin_dashboard_stats() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_admin_dashboard_stats() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_stats() TO authenticated;

-- 4. Update get_admin_system_metrics to proxy to get_admin_dashboard_stats
CREATE OR REPLACE FUNCTION public.get_admin_system_metrics()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_catalog
AS $$
BEGIN
    RETURN public.get_admin_dashboard_stats();
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_admin_system_metrics() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_admin_system_metrics() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_admin_system_metrics() TO authenticated;

-- 5. RPC Function: Recent Activity Feed for Admin
CREATE OR REPLACE FUNCTION public.get_admin_recent_activity(limit_count int DEFAULT 10)
RETURNS TABLE (
    activity_type text,
    item_id uuid,
    title text,
    created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_is_admin boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (select auth.uid()) AND role = 'admin'
    ) INTO v_is_admin;

    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'Unauthorized: admin privilege required';
    END IF;

    RETURN QUERY
    (
        SELECT 'document'::text as activity_type, id as item_id, title, created_at FROM public.documents
        UNION ALL
        SELECT 'task'::text as activity_type, id as item_id, title, created_at FROM public.tasks
        UNION ALL
        SELECT 'note'::text as activity_type, id as item_id, substr(content, 1, 60) as title, created_at FROM public.video_timestamp_notes
        UNION ALL
        SELECT 'pomodoro'::text as activity_type, id as item_id, ('Session (' || session_type || '): ' || (actual_seconds/60) || 'm') as title, created_at FROM public.pomodoro_sessions
    )
    ORDER BY created_at DESC
    LIMIT limit_count;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_admin_recent_activity(int) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_admin_recent_activity(int) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_admin_recent_activity(int) TO authenticated;

-- ==============================================================================
-- BOOTSTRAP INSTRUCTIONS (Run in Supabase SQL Editor for your admin account):
--
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE id IN (
--     SELECT id FROM auth.users 
--     WHERE email IN ('studyspace2u@gmail.com', 'demo505user@gmail.com')
-- );
-- ==============================================================================
