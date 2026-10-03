-- ==============================================================================
-- Migration: Safely Remove Admin Feature & Admin RPC Functions
-- ==============================================================================
-- Cleanly rolls back all Admin-specific database objects, RPC functions,
-- triggers, constraints, and columns while preserving all user-facing data.
-- ==============================================================================

-- 1. Drop Admin RPC functions
DROP FUNCTION IF EXISTS public.get_admin_dashboard_stats();
DROP FUNCTION IF EXISTS public.get_admin_system_metrics();
DROP FUNCTION IF EXISTS public.get_admin_recent_activity(int);
DROP FUNCTION IF EXISTS public.is_admin();

-- 2. Drop Admin trigger and function on profiles
DROP TRIGGER IF EXISTS trg_prevent_self_role_escalation ON public.profiles;
DROP FUNCTION IF EXISTS public.prevent_self_role_escalation();

-- 3. Drop Admin role index and constraint from profiles table
DROP INDEX IF EXISTS public.idx_profiles_role;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.constraint_column_usage 
        WHERE table_name = 'profiles' AND constraint_name = 'profiles_role_check'
    ) THEN
        ALTER TABLE public.profiles DROP CONSTRAINT profiles_role_check;
    END IF;
END $$;

-- 4. Safely drop Admin-only role column from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;
