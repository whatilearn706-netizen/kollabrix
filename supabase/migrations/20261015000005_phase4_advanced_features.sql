-- ==============================================================================
-- TeamForge Phase 4: Advanced Features Migration
-- 1. Hackathon Discovery & Bookmarks (hackathons, saved_hackathons)
-- 2. GitHub Connection & Activity Cache (user_github_connections)
-- 3. AI Project Planning Drafts (ai_project_plans)
-- 4. Teammate Matching & Invitations (project_invitations)
-- 5. Secure College Analytics RPC (get_college_analytics)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. HACKATHONS TABLE & POLICIES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hackathons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    organizer TEXT NOT NULL,
    description TEXT NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('Online', 'In-Person', 'Hybrid')),
    location TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    registration_deadline TIMESTAMPTZ NOT NULL,
    eligibility TEXT DEFAULT 'Open to all college students',
    themes TEXT[] DEFAULT '{}',
    prize_pool TEXT,
    website_url TEXT NOT NULL,
    banner_url TEXT,
    creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view verified hackathons" ON public.hackathons;
CREATE POLICY "Public can view verified hackathons"
    ON public.hackathons FOR SELECT
    USING (is_verified = true OR (auth.uid() IS NOT NULL AND auth.uid() = creator_id));

DROP POLICY IF EXISTS "Authenticated users can create hackathons" ON public.hackathons;
CREATE POLICY "Authenticated users can create hackathons"
    ON public.hackathons FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Creators or admins can update their hackathons" ON public.hackathons;
CREATE POLICY "Creators or admins can update their hackathons"
    ON public.hackathons FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND (
            auth.uid() = creator_id OR 
            EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'teacher'))
        )
    );

DROP POLICY IF EXISTS "Creators or admins can delete their hackathons" ON public.hackathons;
CREATE POLICY "Creators or admins can delete their hackathons"
    ON public.hackathons FOR DELETE
    USING (
        auth.uid() IS NOT NULL AND (
            auth.uid() = creator_id OR 
            EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'teacher'))
        )
    );

CREATE INDEX IF NOT EXISTS idx_hackathons_dates ON public.hackathons(registration_deadline, start_date);
CREATE INDEX IF NOT EXISTS idx_hackathons_mode ON public.hackathons(mode);

-- ------------------------------------------------------------------------------
-- 2. SAVED HACKATHONS (BOOKMARKS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_hackathons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hackathon_id UUID NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, hackathon_id)
);

ALTER TABLE public.saved_hackathons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own saved hackathons" ON public.saved_hackathons;
CREATE POLICY "Users can view their own saved hackathons"
    ON public.saved_hackathons FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can bookmark hackathons" ON public.saved_hackathons;
CREATE POLICY "Users can bookmark hackathons"
    ON public.saved_hackathons FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove their saved hackathons" ON public.saved_hackathons;
CREATE POLICY "Users can remove their saved hackathons"
    ON public.saved_hackathons FOR DELETE
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_saved_hackathons_user ON public.saved_hackathons(user_id);

-- ------------------------------------------------------------------------------
-- 3. GITHUB USER CONNECTIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_github_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    github_user_id TEXT,
    github_username TEXT NOT NULL,
    avatar_url TEXT,
    profile_url TEXT,
    public_repos_count INT DEFAULT 0,
    followers_count INT DEFAULT 0,
    connected_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_github_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view linked github info" ON public.user_github_connections;
CREATE POLICY "Public can view linked github info"
    ON public.user_github_connections FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users manage their own github connection" ON public.user_github_connections;
CREATE POLICY "Users manage their own github connection"
    ON public.user_github_connections FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_github_connections_user ON public.user_github_connections(user_id);

-- ------------------------------------------------------------------------------
-- 4. AI PROJECT PLANNING DRAFTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_project_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    prompt_inputs JSONB NOT NULL DEFAULT '{}'::jsonb,
    plan_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'applied')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.ai_project_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Plan owner or project members can view plan" ON public.ai_project_plans;
CREATE POLICY "Plan owner or project members can view plan"
    ON public.ai_project_plans FOR SELECT
    USING (
        auth.uid() = user_id OR
        (project_id IS NOT NULL AND (
            EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND owner_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM public.project_members WHERE project_id = ai_project_plans.project_id AND user_id = auth.uid())
        ))
    );

DROP POLICY IF EXISTS "Users can insert and update their plans" ON public.ai_project_plans;
CREATE POLICY "Users can insert and update their plans"
    ON public.ai_project_plans FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 5. PROJECT INVITATIONS (SMART TEAMMATE MATCHING WORKFLOW)
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
    USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

DROP POLICY IF EXISTS "Project owners or leads can send invitations" ON public.project_invitations;
CREATE POLICY "Project owners or leads can send invitations"
    ON public.project_invitations FOR INSERT
    WITH CHECK (
        auth.uid() = inviter_id AND (
            EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND owner_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM public.project_members WHERE project_id = project_invitations.project_id AND user_id = auth.uid() AND role = 'Project Lead')
        )
    );

DROP POLICY IF EXISTS "Recipients or senders can update invitation status" ON public.project_invitations;
CREATE POLICY "Recipients or senders can update invitation status"
    ON public.project_invitations FOR UPDATE
    USING (auth.uid() = invitee_id OR auth.uid() = inviter_id)
    WITH CHECK (auth.uid() = invitee_id OR auth.uid() = inviter_id);

CREATE INDEX IF NOT EXISTS idx_project_invitations_invitee ON public.project_invitations(invitee_id, status);

-- ------------------------------------------------------------------------------
-- 6. SECURE COLLEGE ANALYTICS RPC
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_college_analytics()
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    caller_role TEXT;
    caller_birth_year INT;
    result JSONB;
    v_total_projects INT;
    v_recruiting_projects INT;
    v_in_progress_projects INT;
    v_completed_projects INT;
    v_total_students INT;
    v_active_students INT;
    v_total_tasks INT;
    v_completed_tasks INT;
    v_total_milestones INT;
    v_completed_milestones INT;
    v_total_problem_statements INT;
    v_published_problem_statements INT;
    v_linked_problem_projects INT;
    v_category_distribution JSONB;
    v_difficulty_distribution JSONB;
    v_monthly_trends JSONB;
BEGIN
    -- Security guard: Only authorized faculty/admin can view college analytics
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    SELECT role, birth_year INTO caller_role, caller_birth_year
    FROM public.profiles
    WHERE user_id = auth.uid();

    IF caller_role NOT IN ('teacher', 'admin') OR (caller_birth_year IS NOT NULL AND caller_birth_year > 2003) THEN
        RAISE EXCEPTION 'Unauthorized: College analytics is strictly restricted to verified faculty and administrators.';
    END IF;

    -- Aggregate project metrics
    SELECT COUNT(*) INTO v_total_projects FROM public.projects;
    SELECT COUNT(*) INTO v_recruiting_projects FROM public.projects WHERE status = 'Recruiting';
    SELECT COUNT(*) INTO v_in_progress_projects FROM public.projects WHERE status = 'In Progress';
    SELECT COUNT(*) INTO v_completed_projects FROM public.projects WHERE status = 'Completed';

    -- Aggregate students (registered profiles vs students actively in at least 1 project)
    SELECT COUNT(*) INTO v_total_students FROM public.profiles WHERE role = 'student' OR role IS NULL;
    
    SELECT COUNT(DISTINCT user_id) INTO v_active_students
    FROM (
        SELECT owner_id AS user_id FROM public.projects
        UNION
        SELECT user_id FROM public.project_members
    ) active_users;

    -- Tasks & Milestones
    SELECT COUNT(*) INTO v_total_tasks FROM public.project_tasks;
    SELECT COUNT(*) INTO v_completed_tasks FROM public.project_tasks WHERE status = 'Completed';
    SELECT COUNT(*) INTO v_total_milestones FROM public.project_milestones;
    SELECT COUNT(*) INTO v_completed_milestones FROM public.project_milestones WHERE status = 'Completed';

    -- Problem Statements
    SELECT COUNT(*) INTO v_total_problem_statements FROM public.problem_statements;
    SELECT COUNT(*) INTO v_published_problem_statements FROM public.problem_statements WHERE status = 'Published';
    SELECT COUNT(*) INTO v_linked_problem_projects FROM public.projects WHERE problem_statement_id IS NOT NULL;

    -- Category distribution
    SELECT jsonb_object_agg(COALESCE(category, 'Other'), cnt)
    INTO v_category_distribution
    FROM (
        SELECT category, COUNT(*) as cnt
        FROM public.projects
        GROUP BY category
    ) s;

    -- Difficulty distribution
    SELECT jsonb_object_agg(COALESCE(difficulty, 'Intermediate'), cnt)
    INTO v_difficulty_distribution
    FROM (
        SELECT difficulty, COUNT(*) as cnt
        FROM public.projects
        GROUP BY difficulty
    ) s;

    -- Recent Monthly project trends (last 6 months)
    SELECT jsonb_agg(
        jsonb_build_object(
            'month', to_char(d, 'Mon YYYY'),
            'projects_count', COALESCE(p.cnt, 0)
        ) ORDER BY d
    )
    INTO v_monthly_trends
    FROM generate_series(
        date_trunc('month', now() - interval '5 months'),
        date_trunc('month', now()),
        interval '1 month'
    ) d
    LEFT JOIN (
        SELECT date_trunc('month', created_at) as m, COUNT(*) as cnt
        FROM public.projects
        GROUP BY 1
    ) p ON p.m = d;

    -- Build final json
    result := jsonb_build_object(
        'total_projects', v_total_projects,
        'recruiting_projects', v_recruiting_projects,
        'in_progress_projects', v_in_progress_projects,
        'completed_projects', v_completed_projects,
        'total_students', v_total_students,
        'active_students', v_active_students,
        'total_tasks', v_total_tasks,
        'completed_tasks', v_completed_tasks,
        'task_completion_rate', CASE WHEN v_total_tasks > 0 THEN round((v_completed_tasks::numeric / v_total_tasks::numeric) * 100, 1) ELSE 0 END,
        'total_milestones', v_total_milestones,
        'completed_milestones', v_completed_milestones,
        'milestone_completion_rate', CASE WHEN v_total_milestones > 0 THEN round((v_completed_milestones::numeric / v_total_milestones::numeric) * 100, 1) ELSE 0 END,
        'total_problem_statements', v_total_problem_statements,
        'published_problem_statements', v_published_problem_statements,
        'linked_problem_projects', v_linked_problem_projects,
        'category_distribution', COALESCE(v_category_distribution, '{}'::jsonb),
        'difficulty_distribution', COALESCE(v_difficulty_distribution, '{}'::jsonb),
        'monthly_trends', COALESCE(v_monthly_trends, '[]'::jsonb),
        'generated_at', timezone('utc'::text, now())
    );

    RETURN result;
END;
$$;
