-- ==============================================================================
-- Migration: Secure Role-Based Admin System & System Metrics Functions
-- ==============================================================================

-- 1. Ensure role column exists on public.profiles with default 'user'
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

-- 2. Add check constraint for valid roles ('user', 'admin')
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.constraint_column_usage 
        WHERE table_name = 'profiles' AND constraint_name = 'profiles_role_check'
    ) THEN
        ALTER TABLE public.profiles
        ADD CONSTRAINT profiles_role_check
        CHECK (role IN ('user', 'admin'));
    END IF;
END $$;

-- 3. Create index for fast role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role 
ON public.profiles(role);

-- 4. Database Trigger: Prevent regular users from self-promoting or updating role
CREATE OR REPLACE FUNCTION public.prevent_self_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
    -- If role is modified
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        -- If update is initiated by a client authenticated session (auth.uid() IS NOT NULL)
        -- check if that user is already a verified admin
        IF auth.uid() IS NOT NULL THEN
            IF NOT EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND role = 'admin'
            ) THEN
                RAISE EXCEPTION 'Unauthorized: Users cannot modify user roles.';
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_self_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_self_role_escalation
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_self_role_escalation();

-- 5. Helper Function: Check if current caller is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_catalog
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (select auth.uid()) AND role = 'admin'
    );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 6. RPC Function: Aggregated Admin System Metrics
-- Returns counts and live DB size without exposing user records or service role keys
CREATE OR REPLACE FUNCTION public.get_admin_system_metrics()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_is_admin boolean;
    v_result json;
    v_db_size bigint;
BEGIN
    -- Security guard: caller must be authenticated and have role = 'admin'
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

    SELECT json_build_object(
        'total_users', (SELECT count(*) FROM public.profiles),
        'total_documents', (SELECT count(*) FROM public.documents),
        'total_tasks', (SELECT count(*) FROM public.tasks),
        'total_notes', (SELECT count(*) FROM public.video_timestamp_notes),
        'total_resources', (SELECT count(*) FROM public.website_resources),
        'total_saved_videos', (SELECT count(*) FROM public.saved_videos),
        'total_saved_playlists', (SELECT count(*) FROM public.saved_playlists),
        'total_pomodoro_sessions', (SELECT count(*) FROM public.pomodoro_sessions),
        'total_document_bytes', (SELECT COALESCE(sum(file_size_bytes), 0) FROM public.documents),
        'db_size_bytes', v_db_size
    ) INTO v_result;

    RETURN v_result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_admin_system_metrics() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_system_metrics() TO authenticated;

-- 7. RPC Function: Recent Activity Feed for Admin
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
GRANT EXECUTE ON FUNCTION public.get_admin_recent_activity(int) TO authenticated;

-- ==============================================================================
-- BOOTSTRAP INSTRUCTIONS (Run in Supabase SQL Editor for the owner account):
--
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'owner@example.com';
-- ==============================================================================
