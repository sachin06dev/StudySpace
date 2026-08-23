-- ==============================================================================
-- StudySpace — Comprehensive Database Schema & Row Level Security (RLS)
-- ==============================================================================
-- Run this script in the Supabase SQL Editor to set up all tables, triggers,
-- RLS policies, and storage configurations for StudySpace.
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. Profiles Table & Trigger
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    email TEXT,
    avatar_url TEXT,
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = id)
    WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = id);

-- ==============================================================================
-- 2. User Settings Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    pomodoro_duration INTEGER NOT NULL DEFAULT 25,
    short_break_duration INTEGER NOT NULL DEFAULT 5,
    long_break_duration INTEGER NOT NULL DEFAULT 15,
    long_break_interval INTEGER NOT NULL DEFAULT 4,
    weekly_goal_minutes INTEGER NOT NULL DEFAULT 600,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings"
    ON public.user_settings FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own settings"
    ON public.user_settings FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own settings"
    ON public.user_settings FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

-- ==============================================================================
-- 3. Automatic Profile & Settings Initialization on User Signup
-- ==============================================================================
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

-- Revoke execute permissions from public, anon, and authenticated
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 4. Tasks Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(user_id, status);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks"
    ON public.tasks FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own tasks"
    ON public.tasks FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own tasks"
    ON public.tasks FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own tasks"
    ON public.tasks FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);

-- ==============================================================================
-- 5. Pomodoro Sessions Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.pomodoro_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_type TEXT NOT NULL DEFAULT 'focus' CHECK (session_type IN ('focus', 'short_break', 'long_break')),
    planned_seconds INTEGER NOT NULL,
    actual_seconds INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled', 'interrupted')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pomodoro_user_started ON public.pomodoro_sessions(user_id, started_at);

ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pomodoro sessions"
    ON public.pomodoro_sessions FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own pomodoro sessions"
    ON public.pomodoro_sessions FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own pomodoro sessions"
    ON public.pomodoro_sessions FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own pomodoro sessions"
    ON public.pomodoro_sessions FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);

-- ==============================================================================
-- 6. YouTube Videos Catalog (Global)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.youtube_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    youtube_video_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    channel_name TEXT,
    channel_id TEXT,
    thumbnail_url TEXT,
    duration_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_youtube_videos_vid ON public.youtube_videos(youtube_video_id);

ALTER TABLE public.youtube_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view youtube videos"
    ON public.youtube_videos FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Anyone authenticated can insert youtube videos"
    ON public.youtube_videos FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Anyone authenticated can update youtube videos"
    ON public.youtube_videos FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ==============================================================================
-- 7. Saved Videos Table (User Bookmark & Progress)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.saved_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES public.youtube_videos(id) ON DELETE CASCADE,
    watch_progress_seconds INTEGER NOT NULL DEFAULT 0,
    last_watched_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'saved' CHECK (status IN ('saved', 'in_progress', 'completed', 'not_started')),
    completed_at TIMESTAMPTZ,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, video_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_videos_user_video ON public.saved_videos(user_id, video_id);
CREATE INDEX IF NOT EXISTS idx_saved_videos_status ON public.saved_videos(user_id, status);

ALTER TABLE public.saved_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved videos"
    ON public.saved_videos FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own saved videos"
    ON public.saved_videos FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own saved videos"
    ON public.saved_videos FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own saved videos"
    ON public.saved_videos FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);

-- ==============================================================================
-- 8. YouTube Playlists Catalog (Global)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.youtube_playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    youtube_playlist_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    channel_name TEXT,
    channel_id TEXT,
    thumbnail_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_youtube_playlists_pid ON public.youtube_playlists(youtube_playlist_id);

ALTER TABLE public.youtube_playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view youtube playlists"
    ON public.youtube_playlists FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Anyone authenticated can insert youtube playlists"
    ON public.youtube_playlists FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Anyone authenticated can update youtube playlists"
    ON public.youtube_playlists FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ==============================================================================
-- 9. Saved Playlists Table (User Bookmark)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.saved_playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    playlist_id UUID NOT NULL REFERENCES public.youtube_playlists(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, playlist_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_playlists_user ON public.saved_playlists(user_id);

ALTER TABLE public.saved_playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved playlists"
    ON public.saved_playlists FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own saved playlists"
    ON public.saved_playlists FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own saved playlists"
    ON public.saved_playlists FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own saved playlists"
    ON public.saved_playlists FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);

-- ==============================================================================
-- 10. Playlist Items Table (Global Association)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.playlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    playlist_id UUID NOT NULL REFERENCES public.youtube_playlists(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES public.youtube_videos(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (playlist_id, video_id)
);

CREATE INDEX IF NOT EXISTS idx_playlist_items_playlist ON public.playlist_items(playlist_id, position);

ALTER TABLE public.playlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view playlist items"
    ON public.playlist_items FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Anyone authenticated can insert playlist items"
    ON public.playlist_items FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Anyone authenticated can update playlist items"
    ON public.playlist_items FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Note: No client DELETE policy on playlist_items (global catalog items are not deleted by users).

-- ==============================================================================
-- 11. Video Timestamp Notes Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.video_timestamp_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES public.youtube_videos(id) ON DELETE CASCADE,
    timestamp_seconds INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_video_notes_user_vid ON public.video_timestamp_notes(user_id, video_id);

ALTER TABLE public.video_timestamp_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own timestamp notes"
    ON public.video_timestamp_notes FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own timestamp notes"
    ON public.video_timestamp_notes FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own timestamp notes"
    ON public.video_timestamp_notes FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own timestamp notes"
    ON public.video_timestamp_notes FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);

-- ==============================================================================
-- 12. Website Resources Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.website_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    category TEXT,
    favicon_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_user_id ON public.website_resources(user_id);

ALTER TABLE public.website_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own website resources"
    ON public.website_resources FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own website resources"
    ON public.website_resources FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own website resources"
    ON public.website_resources FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own website resources"
    ON public.website_resources FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);

-- ==============================================================================
-- 13. Documents Table (PDF & File Metadata)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    category TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own documents"
    ON public.documents FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own documents"
    ON public.documents FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own documents"
    ON public.documents FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own documents"
    ON public.documents FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);

-- ==============================================================================
-- 14. Supabase Storage Setup (study-documents bucket)
-- ==============================================================================
-- Insert the bucket if it does not exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('study-documents', 'study-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage objects in 'study-documents'
CREATE POLICY "Users can upload their own documents"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'study-documents' AND
        (storage.foldername(name))[1] = (select auth.uid())::text
    );

CREATE POLICY "Users can view/download their own documents"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'study-documents' AND
        (storage.foldername(name))[1] = (select auth.uid())::text
    );

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

CREATE POLICY "Users can delete their own documents"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'study-documents' AND
        (storage.foldername(name))[1] = (select auth.uid())::text
    );

-- ==============================================================================
-- 15. User Custom Categories Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_user_categories_user_id ON public.user_categories(user_id);

ALTER TABLE public.user_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own categories"
    ON public.user_categories FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own categories"
    ON public.user_categories FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own categories"
    ON public.user_categories FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own categories"
    ON public.user_categories FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);

