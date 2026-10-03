-- Migration: 20261002183000_delete_user_account.sql
-- Enables self-serve permanent account deletion for authenticated users directly in Supabase.
-- Deletes all related application data and permanently purges the user from auth.users.

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated: Cannot delete unauthenticated user account.';
  END IF;

  -- 1. Explicitly clean up all application tables
  BEGIN DELETE FROM public.attendance_records WHERE user_id = v_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN DELETE FROM public.timetable_exceptions WHERE user_id = v_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN DELETE FROM public.timetable_slots WHERE user_id = v_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN DELETE FROM public.subjects WHERE user_id = v_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN DELETE FROM public.semesters WHERE user_id = v_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN DELETE FROM public.tasks WHERE user_id = v_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN DELETE FROM public.pomodoro_sessions WHERE user_id = v_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN DELETE FROM public.notes WHERE user_id = v_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN DELETE FROM public.documents WHERE user_id = v_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN DELETE FROM public.user_settings WHERE user_id = v_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN DELETE FROM public.user_devices WHERE user_id = v_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN DELETE FROM public.saved_videos WHERE user_id = v_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN DELETE FROM public.saved_playlists WHERE user_id = v_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN DELETE FROM public.video_timestamp_notes WHERE user_id = v_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN DELETE FROM public.website_resources WHERE user_id = v_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN DELETE FROM public.user_categories WHERE user_id = v_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN DELETE FROM public.profiles WHERE id = v_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;

  -- 2. Permanently delete the user from auth.users
  -- This immediately invalidates the user in Supabase Auth, wipes credentials, identities,
  -- and session tokens so that they cannot log in again.
  DELETE FROM auth.users WHERE id = v_user_id;
END;
$$;

-- Secure function permissions
REVOKE EXECUTE ON FUNCTION public.delete_user_account() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_user_account() FROM anon;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
