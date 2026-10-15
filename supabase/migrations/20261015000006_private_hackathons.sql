-- ==============================================================================
-- TeamForge: Private College Hackathon Management System Migration
-- Migration 6: 20261015000006_private_hackathons.sql
-- ==============================================================================

-- 1. Extend existing hackathons table with private access, join code, limits, and status
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

-- Backfill existing hackathons with a default join code if null
UPDATE public.hackathons 
SET join_code = lower(substring(replace(id::text, '-', ''), 1, 8))
WHERE join_code IS NULL;

-- 2. HACKATHON PARTICIPANTS (Students & Mentors who have joined)
CREATE TABLE IF NOT EXISTS public.hackathon_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hackathon_id UUID NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'organizer', 'judge')),
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
            EXISTS (
                SELECT 1 FROM public.hackathons h 
                WHERE h.id = hackathon_participants.hackathon_id AND h.creator_id = auth.uid()
            ) OR
            EXISTS (
                SELECT 1 FROM public.hackathon_participants p 
                WHERE p.hackathon_id = hackathon_participants.hackathon_id AND p.user_id = auth.uid()
            )
        )
    );

DROP POLICY IF EXISTS "Users can insert their own participation upon joining" ON public.hackathon_participants;
CREATE POLICY "Users can insert their own participation upon joining"
    ON public.hackathon_participants FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 3. HACKATHON CHALLENGES (Problem statements specific to this hackathon)
CREATE TABLE IF NOT EXISTS public.hackathon_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hackathon_id UUID NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    problem_description TEXT NOT NULL,
    context TEXT,
    expected_deliverables TEXT[] DEFAULT '{}',
    required_skills TEXT[] DEFAULT '{}',
    difficulty TEXT NOT NULL DEFAULT 'Intermediate' CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    category TEXT NOT NULL DEFAULT 'Web Development',
    evaluation_criteria TEXT,
    resource_urls TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'Published' CHECK (status IN ('Draft', 'Published')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.hackathon_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view published challenges" ON public.hackathon_challenges;
CREATE POLICY "Participants can view published challenges"
    ON public.hackathon_challenges FOR SELECT
    USING (
        (status = 'Published' AND (
            EXISTS (
                SELECT 1 FROM public.hackathon_participants p 
                WHERE p.hackathon_id = hackathon_challenges.hackathon_id AND p.user_id = auth.uid()
            ) OR
            EXISTS (
                SELECT 1 FROM public.hackathons h 
                WHERE h.id = hackathon_challenges.hackathon_id AND h.creator_id = auth.uid()
            )
        ))
        OR (auth.uid() = creator_id)
    );

DROP POLICY IF EXISTS "Organizers can create challenges" ON public.hackathon_challenges;
CREATE POLICY "Organizers can create challenges"
    ON public.hackathon_challenges FOR INSERT
    WITH CHECK (
        auth.uid() = creator_id AND
        EXISTS (
            SELECT 1 FROM public.hackathons h 
            WHERE h.id = hackathon_challenges.hackathon_id AND h.creator_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Organizers can update challenges" ON public.hackathon_challenges;
CREATE POLICY "Organizers can update challenges"
    ON public.hackathon_challenges FOR UPDATE
    USING (
        auth.uid() = creator_id OR
        EXISTS (
            SELECT 1 FROM public.hackathons h 
            WHERE h.id = hackathon_challenges.hackathon_id AND h.creator_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Organizers can delete challenges" ON public.hackathon_challenges;
CREATE POLICY "Organizers can delete challenges"
    ON public.hackathon_challenges FOR DELETE
    USING (
        auth.uid() = creator_id OR
        EXISTS (
            SELECT 1 FROM public.hackathons h 
            WHERE h.id = hackathon_challenges.hackathon_id AND h.creator_id = auth.uid()
        )
    );

-- 4. HACKATHON TEAMS
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

ALTER TABLE public.hackathon_teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view teams in the hackathon" ON public.hackathon_teams;
CREATE POLICY "Participants can view teams in the hackathon"
    ON public.hackathon_teams FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.hackathon_participants p 
            WHERE p.hackathon_id = hackathon_teams.hackathon_id AND p.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.hackathons h 
            WHERE h.id = hackathon_teams.hackathon_id AND h.creator_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Verified participants can create teams" ON public.hackathon_teams;
CREATE POLICY "Verified participants can create teams"
    ON public.hackathon_teams FOR INSERT
    WITH CHECK (
        auth.uid() = leader_id AND
        EXISTS (
            SELECT 1 FROM public.hackathon_participants p 
            WHERE p.hackathon_id = hackathon_teams.hackathon_id AND p.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Leaders or organizers can update team" ON public.hackathon_teams;
CREATE POLICY "Leaders or organizers can update team"
    ON public.hackathon_teams FOR UPDATE
    USING (
        auth.uid() = leader_id OR
        EXISTS (
            SELECT 1 FROM public.hackathons h 
            WHERE h.id = hackathon_teams.hackathon_id AND h.creator_id = auth.uid()
        )
    );

-- 5. HACKATHON TEAM MEMBERS (1 student per hackathon rule)
CREATE TABLE IF NOT EXISTS public.hackathon_team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.hackathon_teams(id) ON DELETE CASCADE,
    hackathon_id UUID NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'Member' CHECK (role IN ('Leader', 'Member')),
    joined_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(hackathon_id, user_id)
);

ALTER TABLE public.hackathon_team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View team members" ON public.hackathon_team_members;
CREATE POLICY "View team members"
    ON public.hackathon_team_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.hackathon_participants p 
            WHERE p.hackathon_id = hackathon_team_members.hackathon_id AND p.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.hackathons h 
            WHERE h.id = hackathon_team_members.hackathon_id AND h.creator_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Join team" ON public.hackathon_team_members;
CREATE POLICY "Join team"
    ON public.hackathon_team_members FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.hackathon_participants p 
            WHERE p.hackathon_id = hackathon_team_members.hackathon_id AND p.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Leave team or leader remove" ON public.hackathon_team_members;
CREATE POLICY "Leave team or leader remove"
    ON public.hackathon_team_members FOR DELETE
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

-- 6. HACKATHON SUBMISSIONS
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
    USING (
        -- Team members can always view their own submission
        EXISTS (
            SELECT 1 FROM public.hackathon_team_members m 
            WHERE m.team_id = hackathon_submissions.team_id AND m.user_id = auth.uid()
        ) OR
        -- Organizers and judges can view all submissions for their hackathon
        EXISTS (
            SELECT 1 FROM public.hackathons h 
            WHERE h.id = hackathon_submissions.hackathon_id AND h.creator_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.hackathon_participants p 
            WHERE p.hackathon_id = hackathon_submissions.hackathon_id AND p.user_id = auth.uid() AND p.role IN ('organizer', 'judge')
        ) OR
        -- After results are published, participants can view submitted projects in gallery
        (
            status = 'submitted' AND
            EXISTS (
                SELECT 1 FROM public.hackathons h 
                WHERE h.id = hackathon_submissions.hackathon_id AND h.results_published = true
            ) AND
            EXISTS (
                SELECT 1 FROM public.hackathon_participants p 
                WHERE p.hackathon_id = hackathon_submissions.hackathon_id AND p.user_id = auth.uid()
            )
        )
    );

DROP POLICY IF EXISTS "Team members can create submission" ON public.hackathon_submissions;
CREATE POLICY "Team members can create submission"
    ON public.hackathon_submissions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.hackathon_team_members m 
            WHERE m.team_id = hackathon_submissions.team_id AND m.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Team members can update their submission before lock" ON public.hackathon_submissions;
CREATE POLICY "Team members can update their submission before lock"
    ON public.hackathon_submissions FOR UPDATE
    USING (
        (is_locked = false AND EXISTS (
            SELECT 1 FROM public.hackathon_team_members m 
            WHERE m.team_id = hackathon_submissions.team_id AND m.user_id = auth.uid()
        )) OR
        EXISTS (
            SELECT 1 FROM public.hackathons h 
            WHERE h.id = hackathon_submissions.hackathon_id AND h.creator_id = auth.uid()
        )
    );

-- 7. HACKATHON JUDGING CRITERIA
CREATE TABLE IF NOT EXISTS public.hackathon_judging_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hackathon_id UUID NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    weight INT NOT NULL DEFAULT 20,
    max_score INT NOT NULL DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.hackathon_judging_criteria ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View judging criteria" ON public.hackathon_judging_criteria;
CREATE POLICY "View judging criteria"
    ON public.hackathon_judging_criteria FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.hackathon_participants p 
            WHERE p.hackathon_id = hackathon_judging_criteria.hackathon_id AND p.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.hackathons h 
            WHERE h.id = hackathon_judging_criteria.hackathon_id AND h.creator_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Organizers manage criteria" ON public.hackathon_judging_criteria;
CREATE POLICY "Organizers manage criteria"
    ON public.hackathon_judging_criteria FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.hackathons h 
            WHERE h.id = hackathon_judging_criteria.hackathon_id AND h.creator_id = auth.uid()
        )
    );

-- 8. HACKATHON EVALUATIONS / JUDGING SCORES
CREATE TABLE IF NOT EXISTS public.hackathon_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hackathon_id UUID NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES public.hackathon_submissions(id) ON DELETE CASCADE,
    judge_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scores JSONB NOT NULL DEFAULT '{}'::jsonb,
    total_weighted_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    feedback TEXT,
    private_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(submission_id, judge_id)
);

ALTER TABLE public.hackathon_evaluations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View evaluations" ON public.hackathon_evaluations;
CREATE POLICY "View evaluations"
    ON public.hackathon_evaluations FOR SELECT
    USING (
        auth.uid() = judge_id OR
        EXISTS (
            SELECT 1 FROM public.hackathons h 
            WHERE h.id = hackathon_evaluations.hackathon_id AND h.creator_id = auth.uid()
        ) OR
        (
            -- Students can view their team's feedback ONLY when results are published
            EXISTS (
                SELECT 1 FROM public.hackathons h 
                WHERE h.id = hackathon_evaluations.hackathon_id AND h.results_published = true
            ) AND
            EXISTS (
                SELECT 1 FROM public.hackathon_submissions s
                JOIN public.hackathon_team_members m ON m.team_id = s.team_id
                WHERE s.id = hackathon_evaluations.submission_id AND m.user_id = auth.uid()
            )
        )
    );

DROP POLICY IF EXISTS "Judges can submit evaluations" ON public.hackathon_evaluations FOR INSERT
    WITH CHECK (
        auth.uid() = judge_id AND (
            EXISTS (
                SELECT 1 FROM public.hackathons h 
                WHERE h.id = hackathon_evaluations.hackathon_id AND h.creator_id = auth.uid()
            ) OR
            EXISTS (
                SELECT 1 FROM public.hackathon_participants p 
                WHERE p.hackathon_id = hackathon_evaluations.hackathon_id AND p.user_id = auth.uid() AND p.role IN ('organizer', 'judge')
            )
        )
    );

DROP POLICY IF EXISTS "Judges can update own evaluations" ON public.hackathon_evaluations FOR UPDATE
    USING (
        auth.uid() = judge_id OR
        EXISTS (
            SELECT 1 FROM public.hackathons h 
            WHERE h.id = hackathon_evaluations.hackathon_id AND h.creator_id = auth.uid()
        )
    );

-- 9. HACKATHON ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS public.hackathon_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hackathon_id UUID NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.hackathon_announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view announcements" ON public.hackathon_announcements;
CREATE POLICY "Participants can view announcements"
    ON public.hackathon_announcements FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.hackathon_participants p 
            WHERE p.hackathon_id = hackathon_announcements.hackathon_id AND p.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.hackathons h 
            WHERE h.id = hackathon_announcements.hackathon_id AND h.creator_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Organizers can create announcements" ON public.hackathon_announcements;
CREATE POLICY "Organizers can create announcements"
    ON public.hackathon_announcements FOR INSERT
    WITH CHECK (
        auth.uid() = author_id AND
        EXISTS (
            SELECT 1 FROM public.hackathons h 
            WHERE h.id = hackathon_announcements.hackathon_id AND h.creator_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Organizers can delete announcements" ON public.hackathon_announcements;
CREATE POLICY "Organizers can delete announcements"
    ON public.hackathon_announcements FOR DELETE
    USING (
        auth.uid() = author_id OR
        EXISTS (
            SELECT 1 FROM public.hackathons h 
            WHERE h.id = hackathon_announcements.hackathon_id AND h.creator_id = auth.uid()
        )
    );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_hackathons_join_code ON public.hackathons(join_code);
CREATE INDEX IF NOT EXISTS idx_hackathon_participants_lookup ON public.hackathon_participants(hackathon_id, user_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_teams_hackathon ON public.hackathon_teams(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_team_members_user ON public.hackathon_team_members(hackathon_id, user_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_submissions_team ON public.hackathon_submissions(team_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_evaluations_sub ON public.hackathon_evaluations(submission_id);
