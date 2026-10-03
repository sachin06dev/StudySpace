-- ==============================================================================
-- Migration: Cloudflare R2 Document Storage & Admin Authorization
-- ==============================================================================

-- 1. Add storage_provider and storage_key columns to public.documents
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS storage_provider TEXT NOT NULL DEFAULT 'supabase';

ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS storage_key TEXT;

-- 2. Backfill existing records: set storage_key to existing file_path
UPDATE public.documents 
SET storage_key = file_path 
WHERE storage_key IS NULL;

-- 3. Create index for fast query performance by user and storage provider
CREATE INDEX IF NOT EXISTS idx_documents_user_storage_provider 
ON public.documents(user_id, storage_provider);

-- 4. Add role column to profiles for administrative access (default: 'user')
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

-- 5. Index for profiles role lookup
CREATE INDEX IF NOT EXISTS idx_profiles_role 
ON public.profiles(role);
