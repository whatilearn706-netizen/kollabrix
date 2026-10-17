-- ==============================================================================
-- Linkora Migration: LinkedIn College Verification
-- Adds linkedin_url, college_verified, and college_verified_at to profiles
-- ==============================================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS college_verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS college_verified_at TIMESTAMPTZ;

-- Fast index for verified college badges
CREATE INDEX IF NOT EXISTS idx_profiles_college_verified ON public.profiles(college_verified) WHERE college_verified = true;
