-- ==============================================================================
-- Linkora Migration: Fix hackathon_teams, hackathon_team_members, & Invite Codes
-- Migration: 20261016000011_fix_hackathon_teams_and_invites.sql
-- 
-- Fixes:
-- 1. "Could not find the table 'public.hackathon_teams' in the schema cache"
-- 2. "infinite recursion detected in policy for relation 'hackathon_participants'"
-- 3. Enables Team Creation, 6-character Invite Codes, and Teammate Join via Code
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. FIX HACKATHON_PARTICIPANTS (ELIMINATE INFINITE RECURSION)
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
DROP POLICY IF EXISTS "View hackathon participants" ON public.hackathon_participants;
CREATE POLICY "View hackathon participants"
    ON public.hackathon_participants FOR SELECT
    TO authenticated, anon
    USING (true);

DROP POLICY IF EXISTS "Users can insert their own participation upon joining" ON public.hackathon_participants;
CREATE POLICY "Users can insert their own participation upon joining"
    ON public.hackathon_participants FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 2. HACKATHON CHALLENGES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hackathon_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hackathon_id UUID NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    reward TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.hackathon_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View hackathon challenges" ON public.hackathon_challenges;
CREATE POLICY "View hackathon challenges"
    ON public.hackathon_challenges FOR SELECT
    TO authenticated, anon
    USING (true);

DROP POLICY IF EXISTS "Manage hackathon challenges" ON public.hackathon_challenges;
CREATE POLICY "Manage hackathon challenges"
    ON public.hackathon_challenges FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.hackathons h 
            WHERE h.id = hackathon_challenges.hackathon_id 
            AND (h.creator_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'teacher')))
        )
    );

-- ------------------------------------------------------------------------------
-- 3. HACKATHON TEAMS TABLE (WITH INVITE CODE SUPPORT)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hackathon_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hackathon_id UUID NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES public.hackathon_challenges(id) ON DELETE SET NULL,
    team_name TEXT NOT NULL,
    description TEXT,
    leader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invite_code TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(hackathon_id, team_name)
);

-- Helpful index for fast invite code lookups
CREATE INDEX IF NOT EXISTS idx_hackathon_teams_invite_code ON public.hackathon_teams(invite_code);
CREATE INDEX IF NOT EXISTS idx_hackathon_teams_hackathon ON public.hackathon_teams(hackathon_id);

ALTER TABLE public.hackathon_teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view teams in the hackathon" ON public.hackathon_teams;
DROP POLICY IF EXISTS "View hackathon teams" ON public.hackathon_teams;
CREATE POLICY "View hackathon teams"
    ON public.hackathon_teams FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Verified participants can create teams" ON public.hackathon_teams;
DROP POLICY IF EXISTS "Create hackathon teams" ON public.hackathon_teams;
CREATE POLICY "Create hackathon teams"
    ON public.hackathon_teams FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = leader_id);

DROP POLICY IF EXISTS "Leaders or organizers can update team" ON public.hackathon_teams;
DROP POLICY IF EXISTS "Update hackathon teams" ON public.hackathon_teams;
CREATE POLICY "Update hackathon teams"
    ON public.hackathon_teams FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = leader_id OR
        EXISTS (
            SELECT 1 FROM public.hackathons h 
            WHERE h.id = hackathon_teams.hackathon_id AND h.creator_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Delete hackathon teams" ON public.hackathon_teams;
CREATE POLICY "Delete hackathon teams"
    ON public.hackathon_teams FOR DELETE
    TO authenticated
    USING (
        auth.uid() = leader_id OR
        EXISTS (
            SELECT 1 FROM public.hackathons h 
            WHERE h.id = hackathon_teams.hackathon_id AND h.creator_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- 4. HACKATHON TEAM MEMBERS TABLE (1 STUDENT PER HACKATHON ENFORCED)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hackathon_team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.hackathon_teams(id) ON DELETE CASCADE,
    hackathon_id UUID NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'Member' CHECK (role IN ('Leader', 'Member')),
    joined_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(hackathon_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_hackathon_team_members_team ON public.hackathon_team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_team_members_user ON public.hackathon_team_members(user_id);

ALTER TABLE public.hackathon_team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View team members" ON public.hackathon_team_members;
CREATE POLICY "View team members"
    ON public.hackathon_team_members FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Join team" ON public.hackathon_team_members;
CREATE POLICY "Join team"
    ON public.hackathon_team_members FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Leave team or leader remove" ON public.hackathon_team_members;
CREATE POLICY "Leave team or leader remove"
    ON public.hackathon_team_members FOR DELETE
    TO authenticated
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.hackathon_teams t 
            WHERE t.id = hackathon_team_members.team_id AND t.leader_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.hackathons h 
            WHERE h.id = hackathon_team_members.hackathon_id AND h.creator_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- 5. HACKATHON SUBMISSIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hackathon_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hackathon_id UUID NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES public.hackathon_teams(id) ON DELETE CASCADE UNIQUE,
    challenge_id UUID REFERENCES public.hackathon_challenges(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    pitch TEXT NOT NULL,
    problem_statement TEXT NOT NULL,
    solution_description TEXT NOT NULL,
    implementation_details TEXT,
    tech_stack TEXT[] DEFAULT '{}',
    repository_url TEXT,
    is_repo_private BOOLEAN DEFAULT false,
    demo_url TEXT,
    video_url TEXT,
    documentation_url TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
    submitted_at TIMESTAMPTZ,
    last_edited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.hackathon_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View submissions" ON public.hackathon_submissions;
CREATE POLICY "View submissions"
    ON public.hackathon_submissions FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Manage team submissions" ON public.hackathon_submissions;
CREATE POLICY "Manage team submissions"
    ON public.hackathon_submissions FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.hackathon_team_members tm 
            WHERE tm.team_id = hackathon_submissions.team_id AND tm.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.hackathons h 
            WHERE h.id = hackathon_submissions.hackathon_id AND h.creator_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- 6. REFRESH SCHEMA CACHE
-- ------------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
