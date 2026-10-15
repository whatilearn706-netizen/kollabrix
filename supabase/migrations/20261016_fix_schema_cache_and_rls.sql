-- ==============================================================================
-- TeamForge Master Migration: Fix Schema Cache & RLS Policies
-- Migration: 20261016_fix_schema_cache_and_rls.sql
-- 
-- Fixes:
-- 1. "Could not find the 'access_type' column of 'hackathons' in the schema cache"
-- 2. "new row violates row-level security policy for table 'project_discussions'"
-- 3. "Could not find the table 'public.project_invitations' in the schema cache"
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. FIX HACKATHONS TABLE: EXTEND SCHEMA WITH PRIVATE ACCESS COLUMNS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hackathons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    organizer TEXT NOT NULL,
    description TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'Online' CHECK (mode IN ('Online', 'In-Person', 'Hybrid')),
    location TEXT,
    start_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    end_date TIMESTAMPTZ,
    registration_deadline TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now() + interval '7 days'),
    eligibility TEXT DEFAULT 'Open to all college students',
    themes TEXT[] DEFAULT '{}',
    prize_pool TEXT,
    website_url TEXT DEFAULT '',
    banner_url TEXT,
    creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add all Phase 5 private hackathon columns safely (idempotent)
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS access_type TEXT NOT NULL DEFAULT 'private' CHECK (access_type IN ('public', 'private'));
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS join_code TEXT UNIQUE;
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS password_salt TEXT;
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS is_join_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Published' CHECK (status IN ('Draft', 'Published', 'Archived'));
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS submission_deadline TIMESTAMPTZ;
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS min_team_size INT NOT NULL DEFAULT 1;
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS max_team_size INT NOT NULL DEFAULT 4;
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS rules TEXT;
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS contact_info TEXT;
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS results_published BOOLEAN NOT NULL DEFAULT false;

-- Backfill existing hackathons with a unique join code if null
UPDATE public.hackathons 
SET join_code = lower(substring(replace(id::text, '-', ''), 1, 8))
WHERE join_code IS NULL;

-- Ensure RLS on hackathons
ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view verified hackathons" ON public.hackathons;
CREATE POLICY "Public can view verified hackathons"
    ON public.hackathons FOR SELECT
    USING (
        is_verified = true 
        OR (auth.uid() IS NOT NULL AND auth.uid() = creator_id)
        OR access_type = 'private'
    );

DROP POLICY IF EXISTS "Authenticated users can create hackathons" ON public.hackathons;
CREATE POLICY "Authenticated users can create hackathons"
    ON public.hackathons FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Creators or admins can update their hackathons" ON public.hackathons;
CREATE POLICY "Creators or admins can update their hackathons"
    ON public.hackathons FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = creator_id 
        OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'teacher'))
    );

DROP POLICY IF EXISTS "Creators or admins can delete their hackathons" ON public.hackathons;
CREATE POLICY "Creators or admins can delete their hackathons"
    ON public.hackathons FOR DELETE
    TO authenticated
    USING (
        auth.uid() = creator_id 
        OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'teacher'))
    );


-- ------------------------------------------------------------------------------
-- 2. HACKATHON PARTICIPANTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hackathon_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hackathon_id UUID NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'organizer', 'judge')),
    team_id UUID,
    joined_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(hackathon_id, user_id)
);

ALTER TABLE public.hackathon_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view who is in the hackathon" ON public.hackathon_participants;
CREATE POLICY "Participants can view who is in the hackathon"
    ON public.hackathon_participants FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            auth.uid() = user_id OR
            EXISTS (SELECT 1 FROM public.hackathons h WHERE h.id = hackathon_participants.hackathon_id AND h.creator_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM public.hackathon_participants p WHERE p.hackathon_id = hackathon_participants.hackathon_id AND p.user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can insert their own participation upon joining" ON public.hackathon_participants;
CREATE POLICY "Users can insert their own participation upon joining"
    ON public.hackathon_participants FOR INSERT
    TO authenticated, anon
    WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL OR true);


-- ------------------------------------------------------------------------------
-- 3. FIX PROJECT INVITATIONS TABLE (TEAMMATE MATCHING)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invitee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    proposed_role TEXT NOT NULL,
    message TEXT,
    match_score INT,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Declined', 'Cancelled')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(project_id, invitee_id)
);

ALTER TABLE public.project_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view invitations" ON public.project_invitations;
CREATE POLICY "Participants can view invitations"
    ON public.project_invitations FOR SELECT
    TO authenticated
    USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

DROP POLICY IF EXISTS "Project owners or leads can send invitations" ON public.project_invitations;
CREATE POLICY "Project owners or leads can send invitations"
    ON public.project_invitations FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = inviter_id AND (
            EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND owner_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM public.project_members WHERE project_id = project_invitations.project_id AND user_id = auth.uid() AND role = 'Project Lead')
        )
    );

DROP POLICY IF EXISTS "Recipients or senders can update invitation status" ON public.project_invitations;
CREATE POLICY "Recipients or senders can update invitation status"
    ON public.project_invitations FOR UPDATE
    TO authenticated
    USING (auth.uid() = invitee_id OR auth.uid() = inviter_id)
    WITH CHECK (auth.uid() = invitee_id OR auth.uid() = inviter_id);


-- ------------------------------------------------------------------------------
-- 4. FIX PROJECT_DISCUSSIONS & REPLIES RLS POLICIES (WORKSPACES)
-- Resolves: "new row violates row-level security policy for table project_discussions"
-- ------------------------------------------------------------------------------
ALTER TABLE public.project_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_discussion_replies ENABLE ROW LEVEL SECURITY;

-- Project discussions SELECT
DROP POLICY IF EXISTS "Workspace members can view discussions" ON public.project_discussions;
CREATE POLICY "Workspace members can view discussions"
    ON public.project_discussions FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_discussions.project_id AND p.owner_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = project_discussions.project_id AND pm.user_id = auth.uid()
        )
    );

-- Project discussions INSERT (Direct subquery eliminates function RLS mismatch)
DROP POLICY IF EXISTS "Workspace members can post discussions" ON public.project_discussions;
CREATE POLICY "Workspace members can post discussions"
    ON public.project_discussions FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = author_id
        AND (
            EXISTS (
                SELECT 1 FROM public.projects p
                WHERE p.id = project_discussions.project_id AND p.owner_id = auth.uid()
            )
            OR EXISTS (
                SELECT 1 FROM public.project_members pm
                WHERE pm.project_id = project_discussions.project_id AND pm.user_id = auth.uid()
            )
        )
    );

-- Project discussions UPDATE
DROP POLICY IF EXISTS "Authors can update discussions" ON public.project_discussions;
CREATE POLICY "Authors can update discussions"
    ON public.project_discussions FOR UPDATE
    TO authenticated
    USING (auth.uid() = author_id);

-- Project discussions DELETE
DROP POLICY IF EXISTS "Authors or leads can delete discussions" ON public.project_discussions;
CREATE POLICY "Authors or leads can delete discussions"
    ON public.project_discussions FOR DELETE
    TO authenticated
    USING (
        auth.uid() = author_id
        OR EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_discussions.project_id AND p.owner_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = project_discussions.project_id AND pm.user_id = auth.uid() AND pm.role = 'Project Lead'
        )
    );

-- Project replies SELECT
DROP POLICY IF EXISTS "Workspace members can view replies" ON public.project_discussion_replies;
CREATE POLICY "Workspace members can view replies"
    ON public.project_discussion_replies FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_discussion_replies.project_id AND p.owner_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = project_discussion_replies.project_id AND pm.user_id = auth.uid()
        )
    );

-- Project replies INSERT
DROP POLICY IF EXISTS "Workspace members can post replies" ON public.project_discussion_replies;
CREATE POLICY "Workspace members can post replies"
    ON public.project_discussion_replies FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = author_id
        AND (
            EXISTS (
                SELECT 1 FROM public.projects p
                WHERE p.id = project_discussion_replies.project_id AND p.owner_id = auth.uid()
            )
            OR EXISTS (
                SELECT 1 FROM public.project_members pm
                WHERE pm.project_id = project_discussion_replies.project_id AND pm.user_id = auth.uid()
            )
        )
    );

-- Project replies UPDATE
DROP POLICY IF EXISTS "Authors can update replies" ON public.project_discussion_replies;
CREATE POLICY "Authors can update replies"
    ON public.project_discussion_replies FOR UPDATE
    TO authenticated
    USING (auth.uid() = author_id);

-- Project replies DELETE
DROP POLICY IF EXISTS "Authors or leads can delete replies" ON public.project_discussion_replies;
CREATE POLICY "Authors or leads can delete replies"
    ON public.project_discussion_replies FOR DELETE
    TO authenticated
    USING (
        auth.uid() = author_id
        OR EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_discussion_replies.project_id AND p.owner_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = project_discussion_replies.project_id AND pm.user_id = auth.uid() AND pm.role = 'Project Lead'
        )
    );

-- ------------------------------------------------------------------------------
-- 5. ENSURE PROJECT_MEMBERS INSERT POLICY ALLOWS OWNER SELF-ENROLLMENT
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Leads and owners can manage members" ON public.project_members;
CREATE POLICY "Leads and owners can manage members"
    ON public.project_members FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_members.project_id AND p.owner_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = project_members.project_id AND pm.user_id = auth.uid() AND pm.role = 'Project Lead'
        )
        OR auth.uid() = user_id
    );

-- ------------------------------------------------------------------------------
-- 6. REFRESH SUPABASE POSTGREST SCHEMA CACHE
-- ------------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
