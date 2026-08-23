-- ==============================================================================
-- StudySpace — Supabase Performance Advisor Fixes (auth_rls_initplan)
-- ==============================================================================
-- Run this script in the Supabase SQL Editor to resolve all auth_rls_initplan
-- warnings across all StudySpace tables.
--
-- Optimization: Wraps auth.<function>() calls in subqueries e.g. (select auth.uid())
-- so PostgreSQL evaluates auth once per query (InitPlan) instead of per row.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Profiles Table
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "select own profile" ON public.profiles;
DROP POLICY IF EXISTS "insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "update own profile" ON public.profiles;
DROP POLICY IF EXISTS "delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can CRUD their own profile" ON public.profiles;

CREATE POLICY "select own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = id);

CREATE POLICY "insert own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = id)
    WITH CHECK ((select auth.uid()) = id);


-- ------------------------------------------------------------------------------
-- 2. User Settings Table
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "select own settings" ON public.user_settings;
DROP POLICY IF EXISTS "insert own settings" ON public.user_settings;
DROP POLICY IF EXISTS "update own settings" ON public.user_settings;
DROP POLICY IF EXISTS "delete own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can CRUD their own settings" ON public.user_settings;

CREATE POLICY "select own settings"
    ON public.user_settings FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "insert own settings"
    ON public.user_settings FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "update own settings"
    ON public.user_settings FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);


-- ------------------------------------------------------------------------------
-- 3. Tasks Table
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "select own tasks" ON public.tasks;
DROP POLICY IF EXISTS "insert own tasks" ON public.tasks;
DROP POLICY IF EXISTS "update own tasks" ON public.tasks;
DROP POLICY IF EXISTS "delete own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can CRUD their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;

CREATE POLICY "select own tasks"
    ON public.tasks FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "insert own tasks"
    ON public.tasks FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "update own tasks"
    ON public.tasks FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "delete own tasks"
    ON public.tasks FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);


-- ------------------------------------------------------------------------------
-- 4. Pomodoro Sessions Table
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "select own pomodoro_sessions" ON public.pomodoro_sessions;
DROP POLICY IF EXISTS "insert own pomodoro_sessions" ON public.pomodoro_sessions;
DROP POLICY IF EXISTS "update own pomodoro_sessions" ON public.pomodoro_sessions;
DROP POLICY IF EXISTS "delete own pomodoro_sessions" ON public.pomodoro_sessions;
DROP POLICY IF EXISTS "Users can CRUD their own pomodoro sessions" ON public.pomodoro_sessions;
DROP POLICY IF EXISTS "Users can view their own pomodoro sessions" ON public.pomodoro_sessions;
DROP POLICY IF EXISTS "Users can insert their own pomodoro sessions" ON public.pomodoro_sessions;
DROP POLICY IF EXISTS "Users can update their own pomodoro sessions" ON public.pomodoro_sessions;
DROP POLICY IF EXISTS "Users can delete their own pomodoro sessions" ON public.pomodoro_sessions;

CREATE POLICY "select own pomodoro_sessions"
    ON public.pomodoro_sessions FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "insert own pomodoro_sessions"
    ON public.pomodoro_sessions FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "update own pomodoro_sessions"
    ON public.pomodoro_sessions FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "delete own pomodoro_sessions"
    ON public.pomodoro_sessions FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);


-- ------------------------------------------------------------------------------
-- 5. YouTube Videos Catalog (Global)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "read youtube_videos" ON public.youtube_videos;
DROP POLICY IF EXISTS "insert youtube_videos" ON public.youtube_videos;
DROP POLICY IF EXISTS "update youtube_videos" ON public.youtube_videos;
DROP POLICY IF EXISTS "delete youtube_videos" ON public.youtube_videos;
DROP POLICY IF EXISTS "Anyone authenticated can view youtube videos" ON public.youtube_videos;
DROP POLICY IF EXISTS "Anyone authenticated can insert youtube videos" ON public.youtube_videos;
DROP POLICY IF EXISTS "Anyone authenticated can update youtube videos" ON public.youtube_videos;

CREATE POLICY "read youtube_videos"
    ON public.youtube_videos FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "insert youtube_videos"
    ON public.youtube_videos FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "update youtube_videos"
    ON public.youtube_videos FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);


-- ------------------------------------------------------------------------------
-- 6. Saved Videos Table
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "select own saved_videos" ON public.saved_videos;
DROP POLICY IF EXISTS "insert own saved_videos" ON public.saved_videos;
DROP POLICY IF EXISTS "update own saved_videos" ON public.saved_videos;
DROP POLICY IF EXISTS "delete own saved_videos" ON public.saved_videos;
DROP POLICY IF EXISTS "Users can CRUD their own saved videos" ON public.saved_videos;
DROP POLICY IF EXISTS "Users can view their own saved videos" ON public.saved_videos;
DROP POLICY IF EXISTS "Users can insert their own saved videos" ON public.saved_videos;
DROP POLICY IF EXISTS "Users can update their own saved videos" ON public.saved_videos;
DROP POLICY IF EXISTS "Users can delete their own saved videos" ON public.saved_videos;

CREATE POLICY "select own saved_videos"
    ON public.saved_videos FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "insert own saved_videos"
    ON public.saved_videos FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "update own saved_videos"
    ON public.saved_videos FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "delete own saved_videos"
    ON public.saved_videos FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);


-- ------------------------------------------------------------------------------
-- 7. YouTube Playlists Catalog (Global)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "read youtube_playlists" ON public.youtube_playlists;
DROP POLICY IF EXISTS "insert youtube_playlists" ON public.youtube_playlists;
DROP POLICY IF EXISTS "update youtube_playlists" ON public.youtube_playlists;
DROP POLICY IF EXISTS "delete youtube_playlists" ON public.youtube_playlists;
DROP POLICY IF EXISTS "Anyone authenticated can view youtube playlists" ON public.youtube_playlists;
DROP POLICY IF EXISTS "Anyone authenticated can insert youtube playlists" ON public.youtube_playlists;
DROP POLICY IF EXISTS "Anyone authenticated can update youtube playlists" ON public.youtube_playlists;

CREATE POLICY "read youtube_playlists"
    ON public.youtube_playlists FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "insert youtube_playlists"
    ON public.youtube_playlists FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "update youtube_playlists"
    ON public.youtube_playlists FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);


-- ------------------------------------------------------------------------------
-- 8. Saved Playlists Table
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "select own saved_playlists" ON public.saved_playlists;
DROP POLICY IF EXISTS "insert own saved_playlists" ON public.saved_playlists;
DROP POLICY IF EXISTS "update own saved_playlists" ON public.saved_playlists;
DROP POLICY IF EXISTS "delete own saved_playlists" ON public.saved_playlists;
DROP POLICY IF EXISTS "Users can CRUD their own saved playlists" ON public.saved_playlists;
DROP POLICY IF EXISTS "Users can view their own saved playlists" ON public.saved_playlists;
DROP POLICY IF EXISTS "Users can insert their own saved playlists" ON public.saved_playlists;
DROP POLICY IF EXISTS "Users can update their own saved playlists" ON public.saved_playlists;
DROP POLICY IF EXISTS "Users can delete their own saved playlists" ON public.saved_playlists;

CREATE POLICY "select own saved_playlists"
    ON public.saved_playlists FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "insert own saved_playlists"
    ON public.saved_playlists FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "update own saved_playlists"
    ON public.saved_playlists FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "delete own saved_playlists"
    ON public.saved_playlists FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);


-- ------------------------------------------------------------------------------
-- 9. Playlist Items Table (Global Association)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "read playlist_items" ON public.playlist_items;
DROP POLICY IF EXISTS "insert playlist_items" ON public.playlist_items;
DROP POLICY IF EXISTS "update playlist_items" ON public.playlist_items;
DROP POLICY IF EXISTS "delete playlist_items" ON public.playlist_items;
DROP POLICY IF EXISTS "Anyone authenticated can view playlist items" ON public.playlist_items;
DROP POLICY IF EXISTS "Anyone authenticated can insert playlist items" ON public.playlist_items;
DROP POLICY IF EXISTS "Anyone authenticated can update playlist items" ON public.playlist_items;
DROP POLICY IF EXISTS "Anyone authenticated can delete playlist items" ON public.playlist_items;

CREATE POLICY "read playlist_items"
    ON public.playlist_items FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "insert playlist_items"
    ON public.playlist_items FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "update playlist_items"
    ON public.playlist_items FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Note: delete playlist_items policy is dropped to prevent users from wiping out the shared playlist items catalog.


-- ------------------------------------------------------------------------------
-- 10. Video Timestamp Notes Table
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "select own video_timestamp_notes" ON public.video_timestamp_notes;
DROP POLICY IF EXISTS "insert own video_timestamp_notes" ON public.video_timestamp_notes;
DROP POLICY IF EXISTS "update own video_timestamp_notes" ON public.video_timestamp_notes;
DROP POLICY IF EXISTS "delete own video_timestamp_notes" ON public.video_timestamp_notes;
DROP POLICY IF EXISTS "Users can CRUD their own timestamp notes" ON public.video_timestamp_notes;
DROP POLICY IF EXISTS "Users can view their own timestamp notes" ON public.video_timestamp_notes;
DROP POLICY IF EXISTS "Users can insert their own timestamp notes" ON public.video_timestamp_notes;
DROP POLICY IF EXISTS "Users can update their own timestamp notes" ON public.video_timestamp_notes;
DROP POLICY IF EXISTS "Users can delete their own timestamp notes" ON public.video_timestamp_notes;

CREATE POLICY "select own video_timestamp_notes"
    ON public.video_timestamp_notes FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "insert own video_timestamp_notes"
    ON public.video_timestamp_notes FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "update own video_timestamp_notes"
    ON public.video_timestamp_notes FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "delete own video_timestamp_notes"
    ON public.video_timestamp_notes FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);


-- ------------------------------------------------------------------------------
-- 11. Website Resources Table
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "select own website_resources" ON public.website_resources;
DROP POLICY IF EXISTS "insert own website_resources" ON public.website_resources;
DROP POLICY IF EXISTS "update own website_resources" ON public.website_resources;
DROP POLICY IF EXISTS "delete own website_resources" ON public.website_resources;
DROP POLICY IF EXISTS "Users can CRUD their own website resources" ON public.website_resources;
DROP POLICY IF EXISTS "Users can view their own website resources" ON public.website_resources;
DROP POLICY IF EXISTS "Users can insert their own website resources" ON public.website_resources;
DROP POLICY IF EXISTS "Users can update their own website resources" ON public.website_resources;
DROP POLICY IF EXISTS "Users can delete their own website resources" ON public.website_resources;

CREATE POLICY "select own website_resources"
    ON public.website_resources FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "insert own website_resources"
    ON public.website_resources FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "update own website_resources"
    ON public.website_resources FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "delete own website_resources"
    ON public.website_resources FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);


-- ------------------------------------------------------------------------------
-- 12. Documents Table (PDF & File Metadata)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "select own documents" ON public.documents;
DROP POLICY IF EXISTS "insert own documents" ON public.documents;
DROP POLICY IF EXISTS "update own documents" ON public.documents;
DROP POLICY IF EXISTS "delete own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can CRUD their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;

CREATE POLICY "select own documents"
    ON public.documents FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "insert own documents"
    ON public.documents FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "update own documents"
    ON public.documents FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "delete own documents"
    ON public.documents FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);


-- ------------------------------------------------------------------------------
-- 13. User Custom Categories Table
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "select own user_categories" ON public.user_categories;
DROP POLICY IF EXISTS "insert own user_categories" ON public.user_categories;
DROP POLICY IF EXISTS "update own user_categories" ON public.user_categories;
DROP POLICY IF EXISTS "delete own user_categories" ON public.user_categories;
DROP POLICY IF EXISTS "Users can CRUD their own categories" ON public.user_categories;
DROP POLICY IF EXISTS "Users can view their own categories" ON public.user_categories;
DROP POLICY IF EXISTS "Users can insert their own categories" ON public.user_categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON public.user_categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON public.user_categories;

CREATE POLICY "select own user_categories"
    ON public.user_categories FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "insert own user_categories"
    ON public.user_categories FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "update own user_categories"
    ON public.user_categories FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "delete own user_categories"
    ON public.user_categories FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);


-- ------------------------------------------------------------------------------
-- 14. Optional: Notes Table (if present in database)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notes') THEN
        EXECUTE 'ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "select own notes" ON public.notes';
        EXECUTE 'DROP POLICY IF EXISTS "insert own notes" ON public.notes';
        EXECUTE 'DROP POLICY IF EXISTS "update own notes" ON public.notes';
        EXECUTE 'DROP POLICY IF EXISTS "delete own notes" ON public.notes';
        EXECUTE 'DROP POLICY IF EXISTS "Users can CRUD their own notes" ON public.notes';
        EXECUTE 'DROP POLICY IF EXISTS "Users can view their own notes" ON public.notes';
        EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own notes" ON public.notes';
        EXECUTE 'DROP POLICY IF EXISTS "Users can update their own notes" ON public.notes';
        EXECUTE 'DROP POLICY IF EXISTS "Users can delete their own notes" ON public.notes';

        EXECUTE 'CREATE POLICY "select own notes" ON public.notes FOR SELECT TO authenticated USING ((select auth.uid()) = user_id)';
        EXECUTE 'CREATE POLICY "insert own notes" ON public.notes FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id)';
        EXECUTE 'CREATE POLICY "update own notes" ON public.notes FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id)';
        EXECUTE 'CREATE POLICY "delete own notes" ON public.notes FOR DELETE TO authenticated USING ((select auth.uid()) = user_id)';
    END IF;
END $$;


-- ------------------------------------------------------------------------------
-- 15. Supabase Storage Objects (study-documents bucket)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view/download their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

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
    );

CREATE POLICY "Users can delete their own documents"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'study-documents' AND
        (storage.foldername(name))[1] = (select auth.uid())::text
    );
