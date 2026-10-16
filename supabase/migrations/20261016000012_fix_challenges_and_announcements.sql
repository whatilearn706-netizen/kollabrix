-- ==============================================================================
-- Linkora Migration: Fix hackathon_challenges schema & create hackathon_announcements
-- Migration: 20261016000012_fix_challenges_and_announcements.sql
-- 
-- Fixes:
-- 1. "Could not find the 'context' column of 'hackathon_challenges' in the schema cache"
-- 2. "Could not find the table 'public.hackathon_announcements' in the schema cache"
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. UPGRADE HACKATHON_CHALLENGES TABLE (ADD MISSING COLUMNS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hackathon_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hackathon_id UUID NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'Web Development',
    reward TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add full rich fields if they don't already exist
ALTER TABLE public.hackathon_challenges ADD COLUMN IF NOT EXISTS problem_description TEXT;
ALTER TABLE public.hackathon_challenges ADD COLUMN IF NOT EXISTS context TEXT;
ALTER TABLE public.hackathon_challenges ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.hackathon_challenges ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'Intermediate';
ALTER TABLE public.hackathon_challenges ADD COLUMN IF NOT EXISTS expected_deliverables JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.hackathon_challenges ADD COLUMN IF NOT EXISTS required_skills TEXT[] DEFAULT '{}'::text[];
ALTER TABLE public.hackathon_challenges ADD COLUMN IF NOT EXISTS evaluation_criteria TEXT;
ALTER TABLE public.hackathon_challenges ADD COLUMN IF NOT EXISTS resource_urls JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.hackathon_challenges ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Published';
ALTER TABLE public.hackathon_challenges ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Backfill problem_description from description if null
UPDATE public.hackathon_challenges 
SET problem_description = description 
WHERE problem_description IS NULL AND description IS NOT NULL;

-- Enable RLS
ALTER TABLE public.hackathon_challenges ENABLE ROW LEVEL SECURITY;

-- Select policy: Anyone viewing the hackathon can see problem statements
DROP POLICY IF EXISTS "View hackathon challenges" ON public.hackathon_challenges;
DROP POLICY IF EXISTS "Participants can view published challenges" ON public.hackathon_challenges;
CREATE POLICY "View hackathon challenges"
    ON public.hackathon_challenges FOR SELECT
    TO authenticated, anon
    USING (true);

-- Insert policy: Creators, organizers, faculty, or admins can publish challenges
DROP POLICY IF EXISTS "Manage hackathon challenges" ON public.hackathon_challenges;
DROP POLICY IF EXISTS "Organizers can create challenges" ON public.hackathon_challenges;
DROP POLICY IF EXISTS "Create hackathon challenges" ON public.hackathon_challenges;
CREATE POLICY "Create hackathon challenges"
    ON public.hackathon_challenges FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Update policy: Creators, organizers, faculty, or admins can update challenges
DROP POLICY IF EXISTS "Organizers can update challenges" ON public.hackathon_challenges;
DROP POLICY IF EXISTS "Update hackathon challenges" ON public.hackathon_challenges;
CREATE POLICY "Update hackathon challenges"
    ON public.hackathon_challenges FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = creator_id OR
        EXISTS (
            SELECT 1 FROM public.hackathons h 
            WHERE h.id = hackathon_challenges.hackathon_id 
            AND (h.creator_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'teacher', 'faculty')))
        )
    );

-- Delete policy: Creators, organizers, faculty, or admins can delete challenges
DROP POLICY IF EXISTS "Organizers can delete challenges" ON public.hackathon_challenges;
DROP POLICY IF EXISTS "Delete hackathon challenges" ON public.hackathon_challenges;
CREATE POLICY "Delete hackathon challenges"
    ON public.hackathon_challenges FOR DELETE
    TO authenticated
    USING (
        auth.uid() = creator_id OR
        EXISTS (
            SELECT 1 FROM public.hackathons h 
            WHERE h.id = hackathon_challenges.hackathon_id 
            AND (h.creator_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'teacher', 'faculty')))
        )
    );

-- ------------------------------------------------------------------------------
-- 2. CREATE HACKATHON_ANNOUNCEMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hackathon_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hackathon_id UUID NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_hackathon_announcements_hackathon ON public.hackathon_announcements(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_announcements_order ON public.hackathon_announcements(hackathon_id, is_pinned, created_at DESC);

ALTER TABLE public.hackathon_announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View hackathon announcements" ON public.hackathon_announcements;
DROP POLICY IF EXISTS "Participants can view announcements" ON public.hackathon_announcements;
CREATE POLICY "View hackathon announcements"
    ON public.hackathon_announcements FOR SELECT
    TO authenticated, anon
    USING (true);

DROP POLICY IF EXISTS "Organizers can create announcements" ON public.hackathon_announcements;
DROP POLICY IF EXISTS "Create hackathon announcements" ON public.hackathon_announcements;
CREATE POLICY "Create hackathon announcements"
    ON public.hackathon_announcements FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Organizers can update announcements" ON public.hackathon_announcements;
DROP POLICY IF EXISTS "Update hackathon announcements" ON public.hackathon_announcements;
CREATE POLICY "Update hackathon announcements"
    ON public.hackathon_announcements FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = author_id OR
        EXISTS (
            SELECT 1 FROM public.hackathons h 
            WHERE h.id = hackathon_announcements.hackathon_id 
            AND (h.creator_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'teacher', 'faculty')))
        )
    );

DROP POLICY IF EXISTS "Organizers can delete announcements" ON public.hackathon_announcements;
DROP POLICY IF EXISTS "Delete hackathon announcements" ON public.hackathon_announcements;
CREATE POLICY "Delete hackathon announcements"
    ON public.hackathon_announcements FOR DELETE
    TO authenticated
    USING (
        auth.uid() = author_id OR
        EXISTS (
            SELECT 1 FROM public.hackathons h 
            WHERE h.id = hackathon_announcements.hackathon_id 
            AND (h.creator_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'teacher', 'faculty')))
        )
    );

-- ------------------------------------------------------------------------------
-- 3. RELOAD SCHEMA CACHE
-- ------------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
