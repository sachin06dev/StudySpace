-- Migration: 20261001030000_device_revocation.sql
-- Add is_revoked column to user_devices for individual device revocation & real-time sign-out

ALTER TABLE public.user_devices
ADD COLUMN IF NOT EXISTS is_revoked BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_user_devices_revoked
ON public.user_devices(user_id, is_revoked);
