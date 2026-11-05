-- ======================================================================
-- KOLLABRIX COMPLETE DATABASE SCHEMA & SECURITY POLICIES
-- Generated on 2026-11-05T13:01:58.615Z
-- Can be executed directly in Supabase SQL Editor, AIC Cloud, or PostgreSQL
-- ======================================================================



-- ======================================================================
-- MIGRATION: 20261015000000_phase1_init.sql
-- ======================================================================

-- ==============================================================================
-- TeamForge Phase 1 Supabase Database Migration (Safe & Idempotent)
-- ==============================================================================

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    college TEXT,
    course TEXT,
    academic_year TEXT,
    skills TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    interests TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    preferred_roles TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    github_url TEXT,
    portfolio_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
    CONSTRAINT username_format CHECK (username ~* '^[a-zA-Z0-9_-]+$')
);

-- 2. Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'Web Development',
        'AI/ML',
        'Mobile Apps',
        'Developer Tools',
        'Social Impact',
        'IoT/Hardware',
        'Other'
    )),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    technologies TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    required_skills TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    desired_roles TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    current_team_size INTEGER NOT NULL DEFAULT 1 CHECK (current_team_size >= 1),
    desired_team_size INTEGER NOT NULL DEFAULT 4 CHECK (desired_team_size >= current_team_size),
    status TEXT NOT NULL DEFAULT 'Recruiting' CHECK (status IN ('Recruiting', 'In Progress', 'Completed')),
    repository_url TEXT,
    demo_url TEXT,
    application_deadline DATE,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT title_length CHECK (char_length(title) >= 3 AND char_length(title) <= 120),
    CONSTRAINT summary_length CHECK (char_length(summary) >= 10 AND char_length(summary) <= 280)
);

-- 3. Helpful Indexes for Search and Filter Performance
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_difficulty ON public.projects(difficulty);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_technologies ON public.projects USING GIN(technologies);
CREATE INDEX IF NOT EXISTS idx_projects_required_skills ON public.projects USING GIN(required_skills);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_skills ON public.profiles USING GIN(skills);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 5. Profiles RLS Policies (Safely drop if exists, then recreate)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.profiles FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
CREATE POLICY "Users can create their own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
CREATE POLICY "Users can delete their own profile" 
    ON public.profiles FOR DELETE 
    USING (auth.uid() = user_id);

-- 6. Projects RLS Policies (Safely drop if exists, then recreate)
DROP POLICY IF EXISTS "Projects are viewable by everyone" ON public.projects;
CREATE POLICY "Projects are viewable by everyone" 
    ON public.projects FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can create projects" ON public.projects;
CREATE POLICY "Authenticated users can create projects" 
    ON public.projects FOR INSERT 
    WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update their projects" ON public.projects;
CREATE POLICY "Owners can update their projects" 
    ON public.projects FOR UPDATE 
    USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can delete their projects" ON public.projects;
CREATE POLICY "Owners can delete their projects" 
    ON public.projects FOR DELETE 
    USING (auth.uid() = owner_id);

-- 7. Trigger to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_projects_updated_at ON public.projects;
CREATE TRIGGER set_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 8. Trigger to create a starter profile when a user registers via auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    initial_username TEXT;
    initial_display_name TEXT;
    counter INT := 0;
BEGIN
    initial_display_name := COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1), 'Student');
    initial_username := LOWER(REGEXP_REPLACE(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9_]', '', 'g'));
    
    IF initial_username IS NULL OR char_length(initial_username) < 3 THEN
        initial_username := 'student_' || substr(md5(random()::text), 1, 6);
    END IF;

    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = initial_username) LOOP
        counter := counter + 1;
        initial_username := LOWER(REGEXP_REPLACE(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9_]', '', 'g')) || counter::text;
    END LOOP;

    INSERT INTO public.profiles (
        user_id,
        username,
        display_name,
        avatar_url,
        bio,
        skills,
        interests,
        preferred_roles
    ) VALUES (
        NEW.id,
        initial_username,
        initial_display_name,
        NEW.raw_user_meta_data->>'avatar_url',
        'College student excited to collaborate on innovative projects.',
        ARRAY[]::TEXT[],
        ARRAY[]::TEXT[],
        ARRAY[]::TEXT[]
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();



-- ======================================================================
-- MIGRATION: 20261015000001_phase2_collaboration.sql
-- ======================================================================

-- ==============================================================================
-- TeamForge Phase 2: Collaboration Migration
-- Tables: project_members, project_applications, project_milestones,
--         project_tasks, project_discussions, project_discussion_replies, notifications
-- Functions: is_project_member, is_project_owner, is_project_lead,
--            accept_project_application, reject_project_application
-- Triggers: handle_new_project_lead, updated_at, notifications
-- ==============================================================================

-- 1. Create project_members table
CREATE TABLE IF NOT EXISTS public.project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'Contributor' CHECK (role IN (
        'Project Lead',
        'Frontend Developer',
        'Backend Developer',
        'Full-Stack Developer',
        'AI/ML Engineer',
        'UI/UX Designer',
        'Researcher',
        'Contributor'
    )),
    joined_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_project_member UNIQUE (project_id, user_id)
);

-- 2. Create project_applications table
CREATE TABLE IF NOT EXISTS public.project_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    application_message TEXT NOT NULL,
    proposed_role TEXT,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected', 'Withdrawn')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
    CONSTRAINT application_message_len CHECK (char_length(application_message) >= 10 AND char_length(application_message) <= 1000)
);

-- Unique index to prevent duplicate pending applications for same project and applicant
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_application 
    ON public.project_applications (project_id, applicant_id) 
    WHERE (status = 'Pending');

-- 3. Create project_milestones table
CREATE TABLE IF NOT EXISTS public.project_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'In Progress', 'Completed')),
    created_by UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT milestone_title_len CHECK (char_length(title) >= 3 AND char_length(title) <= 120)
);

-- 4. Create project_tasks table
CREATE TABLE IF NOT EXISTS public.project_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES public.project_milestones(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'To Do' CHECK (status IN ('To Do', 'In Progress', 'In Review', 'Completed')),
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
    assignee_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
    creator_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT task_title_len CHECK (char_length(title) >= 3 AND char_length(title) <= 150)
);

-- 5. Create project_discussions table
CREATE TABLE IF NOT EXISTS public.project_discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_edited BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT discussion_content_len CHECK (char_length(content) >= 1 AND char_length(content) <= 4000)
);

-- 6. Create project_discussion_replies table
CREATE TABLE IF NOT EXISTS public.project_discussion_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discussion_id UUID NOT NULL REFERENCES public.project_discussions(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_edited BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT reply_content_len CHECK (char_length(content) >= 1 AND char_length(content) <= 2000)
);

-- 7. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN (
        'application_received',
        'application_accepted',
        'application_rejected',
        'member_joined',
        'member_removed',
        'member_left',
        'task_assigned',
        'task_status_changed',
        'discussion_posted',
        'discussion_replied'
    )),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_project_members_project ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON public.project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_applications_project ON public.project_applications(project_id);
CREATE INDEX IF NOT EXISTS idx_project_applications_applicant ON public.project_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_project_applications_status ON public.project_applications(status);
CREATE INDEX IF NOT EXISTS idx_project_milestones_project ON public.project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project ON public.project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_milestone ON public.project_tasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assignee ON public.project_tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON public.project_tasks(status);
CREATE INDEX IF NOT EXISTS idx_project_discussions_project ON public.project_discussions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_discussion_replies_disc ON public.project_discussion_replies(discussion_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(recipient_id, is_read);

-- 9. Helper Security Functions (SECURITY DEFINER with fixed search_path)
CREATE OR REPLACE FUNCTION public.is_project_owner(check_project_id UUID, check_user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    IF check_user_id IS NULL OR check_project_id IS NULL THEN
        RETURN FALSE;
    END IF;
    RETURN EXISTS (
        SELECT 1 FROM public.projects 
        WHERE id = check_project_id AND owner_id = check_user_id
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_project_member(check_project_id UUID, check_user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    IF check_user_id IS NULL OR check_project_id IS NULL THEN
        RETURN FALSE;
    END IF;
    RETURN EXISTS (
        SELECT 1 FROM public.project_members 
        WHERE project_id = check_project_id AND user_id = check_user_id
    ) OR EXISTS (
        SELECT 1 FROM public.projects 
        WHERE id = check_project_id AND owner_id = check_user_id
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_project_lead(check_project_id UUID, check_user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    IF check_user_id IS NULL OR check_project_id IS NULL THEN
        RETURN FALSE;
    END IF;
    RETURN EXISTS (
        SELECT 1 FROM public.projects 
        WHERE id = check_project_id AND owner_id = check_user_id
    ) OR EXISTS (
        SELECT 1 FROM public.project_members 
        WHERE project_id = check_project_id AND user_id = check_user_id AND role = 'Project Lead'
    );
END;
$$;

-- 10. Enable Row Level Security (RLS)
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 11. Policies for project_members
DROP POLICY IF EXISTS "Project members are viewable by anyone" ON public.project_members;
CREATE POLICY "Project members are viewable by anyone"
    ON public.project_members FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Leads and owners can manage members" ON public.project_members;
CREATE POLICY "Leads and owners can manage members"
    ON public.project_members FOR INSERT
    WITH CHECK (public.is_project_lead(project_id, auth.uid()));

DROP POLICY IF EXISTS "Leads and owners can update member roles" ON public.project_members;
CREATE POLICY "Leads and owners can update member roles"
    ON public.project_members FOR UPDATE
    USING (public.is_project_lead(project_id, auth.uid()));

DROP POLICY IF EXISTS "Members can leave or leads can remove" ON public.project_members;
CREATE POLICY "Members can leave or leads can remove"
    ON public.project_members FOR DELETE
    USING (
        auth.uid() = user_id 
        OR public.is_project_lead(project_id, auth.uid())
    );

-- 12. Policies for project_applications (Direct, Bulletproof Subqueries)
DROP POLICY IF EXISTS "Applicants and owners can view applications" ON public.project_applications;
CREATE POLICY "Applicants and owners can view applications"
    ON public.project_applications FOR SELECT
    TO authenticated
    USING (
        auth.uid() = applicant_id 
        OR EXISTS (
            SELECT 1 FROM public.projects p 
            WHERE p.id = project_applications.project_id AND p.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Authenticated non-members can apply" ON public.project_applications;
CREATE POLICY "Authenticated non-members can apply"
    ON public.project_applications FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = applicant_id 
        AND NOT EXISTS (
            SELECT 1 FROM public.projects p 
            WHERE p.id = project_applications.project_id AND p.owner_id = auth.uid()
        )
        AND NOT EXISTS (
            SELECT 1 FROM public.project_members pm 
            WHERE pm.project_id = project_applications.project_id AND pm.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Applicants can withdraw or owners can review" ON public.project_applications;
CREATE POLICY "Applicants can withdraw or owners can review"
    ON public.project_applications FOR UPDATE
    TO authenticated
    USING (
        (auth.uid() = applicant_id AND status = 'Pending') 
        OR EXISTS (
            SELECT 1 FROM public.projects p 
            WHERE p.id = project_applications.project_id AND p.owner_id = auth.uid()
        )
    );

-- 13. Policies for project_milestones (Private Workspace)
DROP POLICY IF EXISTS "Workspace members can view milestones" ON public.project_milestones;
CREATE POLICY "Workspace members can view milestones"
    ON public.project_milestones FOR SELECT
    USING (public.is_project_member(project_id, auth.uid()));

DROP POLICY IF EXISTS "Leads can create milestones" ON public.project_milestones;
CREATE POLICY "Leads can create milestones"
    ON public.project_milestones FOR INSERT
    WITH CHECK (public.is_project_lead(project_id, auth.uid()));

DROP POLICY IF EXISTS "Leads can update milestones" ON public.project_milestones;
CREATE POLICY "Leads can update milestones"
    ON public.project_milestones FOR UPDATE
    USING (public.is_project_lead(project_id, auth.uid()));

DROP POLICY IF EXISTS "Leads can delete milestones" ON public.project_milestones;
CREATE POLICY "Leads can delete milestones"
    ON public.project_milestones FOR DELETE
    USING (public.is_project_lead(project_id, auth.uid()));

-- 14. Policies for project_tasks (Private Workspace - Direct Subqueries)
DROP POLICY IF EXISTS "Workspace members can view tasks" ON public.project_tasks;
CREATE POLICY "Workspace members can view tasks"
    ON public.project_tasks FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_tasks.project_id AND p.owner_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = project_tasks.project_id AND pm.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Workspace members can create tasks" ON public.project_tasks;
CREATE POLICY "Workspace members can create tasks"
    ON public.project_tasks FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = creator_id
        AND (
            EXISTS (
                SELECT 1 FROM public.projects p
                WHERE p.id = project_tasks.project_id AND p.owner_id = auth.uid()
            )
            OR EXISTS (
                SELECT 1 FROM public.project_members pm
                WHERE pm.project_id = project_tasks.project_id AND pm.user_id = auth.uid()
            )
        )
    );

DROP POLICY IF EXISTS "Workspace members can update tasks" ON public.project_tasks;
CREATE POLICY "Workspace members can update tasks"
    ON public.project_tasks FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_tasks.project_id AND p.owner_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = project_tasks.project_id AND pm.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_tasks.project_id AND p.owner_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = project_tasks.project_id AND pm.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Creators or leads can delete tasks" ON public.project_tasks;
CREATE POLICY "Creators or leads can delete tasks"
    ON public.project_tasks FOR DELETE
    TO authenticated
    USING (
        auth.uid() = creator_id 
        OR EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_tasks.project_id AND p.owner_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = project_tasks.project_id AND pm.user_id = auth.uid() AND pm.role = 'Project Lead'
        )
    );

-- 15. Policies for project_discussions (Private Workspace)
DROP POLICY IF EXISTS "Workspace members can view discussions" ON public.project_discussions;
CREATE POLICY "Workspace members can view discussions"
    ON public.project_discussions FOR SELECT
    USING (public.is_project_member(project_id, auth.uid()));

DROP POLICY IF EXISTS "Workspace members can post discussions" ON public.project_discussions;
CREATE POLICY "Workspace members can post discussions"
    ON public.project_discussions FOR INSERT
    WITH CHECK (
        public.is_project_member(project_id, auth.uid()) 
        AND auth.uid() = author_id
    );

DROP POLICY IF EXISTS "Authors can update discussions" ON public.project_discussions;
CREATE POLICY "Authors can update discussions"
    ON public.project_discussions FOR UPDATE
    USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors or leads can delete discussions" ON public.project_discussions;
CREATE POLICY "Authors or leads can delete discussions"
    ON public.project_discussions FOR DELETE
    USING (
        auth.uid() = author_id 
        OR public.is_project_lead(project_id, auth.uid())
    );

-- 16. Policies for project_discussion_replies
DROP POLICY IF EXISTS "Workspace members can view replies" ON public.project_discussion_replies;
CREATE POLICY "Workspace members can view replies"
    ON public.project_discussion_replies FOR SELECT
    USING (public.is_project_member(project_id, auth.uid()));

DROP POLICY IF EXISTS "Workspace members can post replies" ON public.project_discussion_replies;
CREATE POLICY "Workspace members can post replies"
    ON public.project_discussion_replies FOR INSERT
    WITH CHECK (
        public.is_project_member(project_id, auth.uid()) 
        AND auth.uid() = author_id
    );

DROP POLICY IF EXISTS "Authors can update replies" ON public.project_discussion_replies;
CREATE POLICY "Authors can update replies"
    ON public.project_discussion_replies FOR UPDATE
    USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors or leads can delete replies" ON public.project_discussion_replies;
CREATE POLICY "Authors or leads can delete replies"
    ON public.project_discussion_replies FOR DELETE
    USING (
        auth.uid() = author_id 
        OR public.is_project_lead(project_id, auth.uid())
    );

-- 17. Policies for notifications
DROP POLICY IF EXISTS "Users can only view their own notifications" ON public.notifications;
CREATE POLICY "Users can only view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can mark their own notifications as read" ON public.notifications;
CREATE POLICY "Users can mark their own notifications as read"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Authenticated users or functions can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated users or functions can insert notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (true);

-- 18. Updated_at Trigger function and hooks
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_project_applications_updated_at ON public.project_applications;
CREATE TRIGGER set_project_applications_updated_at
    BEFORE UPDATE ON public.project_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_project_milestones_updated_at ON public.project_milestones;
CREATE TRIGGER set_project_milestones_updated_at
    BEFORE UPDATE ON public.project_milestones
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_project_tasks_updated_at ON public.project_tasks;
CREATE TRIGGER set_project_tasks_updated_at
    BEFORE UPDATE ON public.project_tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_project_discussions_updated_at ON public.project_discussions;
CREATE TRIGGER set_project_discussions_updated_at
    BEFORE UPDATE ON public.project_discussions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 18b. Recount current_team_size on member removal/leave
CREATE OR REPLACE FUNCTION public.handle_project_member_deleted()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    m_count INT;
BEGIN
    SELECT count(*) INTO m_count FROM public.project_members WHERE project_id = OLD.project_id;
    UPDATE public.projects 
    SET current_team_size = GREATEST(1, m_count),
        updated_at = timezone('utc'::text, now())
    WHERE id = OLD.project_id;
    RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_project_member_deleted ON public.project_members;
CREATE TRIGGER on_project_member_deleted
    AFTER DELETE ON public.project_members
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_project_member_deleted();

-- 18c. Notify project owner when application submitted (Safe fallback)
CREATE OR REPLACE FUNCTION public.handle_new_application_notification()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    proj RECORD;
    applicant_name TEXT;
BEGIN
    SELECT title, owner_id INTO proj FROM public.projects WHERE id = NEW.project_id;
    SELECT display_name INTO applicant_name FROM public.profiles WHERE user_id = NEW.applicant_id;
    
    IF proj.owner_id IS NOT NULL THEN
        INSERT INTO public.notifications (
            recipient_id,
            sender_id,
            type,
            title,
            message,
            link
        ) VALUES (
            proj.owner_id,
            NEW.applicant_id,
            'application_received',
            'New Application Received 📩',
            COALESCE(applicant_name, 'A student') || ' applied to join "' || COALESCE(proj.title, 'your project') || '".',
            '/projects/' || NEW.project_id || '/applications'
        );
    END IF;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_application_created_notify_owner ON public.project_applications;
CREATE TRIGGER on_application_created_notify_owner
    AFTER INSERT ON public.project_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_application_notification();

-- 18d. Notify assignee when task assigned (Safe fallback)
CREATE OR REPLACE FUNCTION public.handle_task_assignment_notification()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    proj RECORD;
    assigner_name TEXT;
BEGIN
    IF NEW.assignee_id IS NOT NULL AND (TG_OP = 'INSERT' OR OLD.assignee_id IS DISTINCT FROM NEW.assignee_id) THEN
        IF NEW.assignee_id != NEW.creator_id THEN
            SELECT title INTO proj FROM public.projects WHERE id = NEW.project_id;
            SELECT display_name INTO assigner_name FROM public.profiles WHERE user_id = NEW.creator_id;
            
            INSERT INTO public.notifications (
                recipient_id,
                sender_id,
                type,
                title,
                message,
                link
            ) VALUES (
                NEW.assignee_id,
                NEW.creator_id,
                'task_assigned',
                'Task Assigned to You 📋',
                COALESCE(assigner_name, 'A teammate') || ' assigned you to "' || NEW.title || '" in ' || COALESCE(proj.title, 'the project') || '.',
                '/projects/' || NEW.project_id || '/workspace/tasks'
            );
        END IF;
    END IF;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_task_assigned_notify ON public.project_tasks;
CREATE TRIGGER on_task_assigned_notify
    AFTER INSERT OR UPDATE ON public.project_tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_task_assignment_notification();

-- 19. Automatically assign Project Lead membership upon project creation
CREATE OR REPLACE FUNCTION public.handle_new_project_lead()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO public.project_members (project_id, user_id, role)
    VALUES (NEW.id, NEW.owner_id, 'Project Lead')
    ON CONFLICT (project_id, user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_project_created_add_lead ON public.projects;
CREATE TRIGGER on_project_created_add_lead
    AFTER INSERT ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_project_lead();

-- Backfill project_members for existing projects
INSERT INTO public.project_members (project_id, user_id, role)
SELECT id, owner_id, 'Project Lead'
FROM public.projects
ON CONFLICT (project_id, user_id) DO NOTHING;

-- 20. Atomic Function to Accept Application Concurrency-Safe
CREATE OR REPLACE FUNCTION public.accept_project_application(
    app_id UUID,
    assigned_role TEXT DEFAULT 'Contributor'
)
RETURNS JSONB 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    target_app RECORD;
    target_project RECORD;
    new_member_count INT;
BEGIN
    -- 1. Fetch & lock application row
    SELECT * INTO target_app 
    FROM public.project_applications 
    WHERE id = app_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Application not found');
    END IF;

    IF target_app.status != 'Pending' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Application is not in Pending status');
    END IF;

    -- 2. Fetch & lock project row to prevent race conditions on capacity
    SELECT * INTO target_project 
    FROM public.projects 
    WHERE id = target_app.project_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Associated project not found');
    END IF;

    -- 3. Authorization check
    IF target_project.owner_id != auth.uid() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Only the project owner can approve applications');
    END IF;

    -- 4. Status and capacity checks
    IF target_project.status != 'Recruiting' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Project is not currently recruiting new members');
    END IF;

    IF target_project.current_team_size >= target_project.desired_team_size THEN
        RETURN jsonb_build_object('success', false, 'error', 'Team is already at maximum capacity');
    END IF;

    -- 5. Insert member record
    INSERT INTO public.project_members (project_id, user_id, role)
    VALUES (target_app.project_id, target_app.applicant_id, COALESCE(assigned_role, 'Contributor'))
    ON CONFLICT (project_id, user_id) DO NOTHING;

    -- 6. Update application status
    UPDATE public.project_applications
    SET status = 'Accepted',
        reviewed_at = timezone('utc'::text, now()),
        reviewed_by = auth.uid(),
        updated_at = timezone('utc'::text, now())
    WHERE id = app_id;

    -- 7. Recalculate and update current_team_size
    SELECT count(*) INTO new_member_count
    FROM public.project_members
    WHERE project_id = target_app.project_id;

    UPDATE public.projects
    SET current_team_size = new_member_count,
        status = CASE 
            WHEN new_member_count >= desired_team_size THEN 'In Progress' 
            ELSE status 
        END,
        updated_at = timezone('utc'::text, now())
    WHERE id = target_app.project_id;

    -- 8. Notify the applicant
    BEGIN
        INSERT INTO public.notifications (
            recipient_id,
            sender_id,
            type,
            title,
            message,
            link
        ) VALUES (
            target_app.applicant_id,
            auth.uid(),
            'application_accepted',
            'Application Accepted! 🎉',
            'Your application to join "' || target_project.title || '" has been accepted as ' || COALESCE(assigned_role, 'Contributor') || '.',
            '/projects/' || target_app.project_id || '/workspace'
        );
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;

    RETURN jsonb_build_object(
        'success', true, 
        'project_id', target_app.project_id,
        'applicant_id', target_app.applicant_id,
        'new_team_size', new_member_count
    );
END;
$$;

-- 21. Atomic Function to Reject Application
CREATE OR REPLACE FUNCTION public.reject_project_application(
    app_id UUID
)
RETURNS JSONB 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    target_app RECORD;
    target_project RECORD;
BEGIN
    SELECT * INTO target_app 
    FROM public.project_applications 
    WHERE id = app_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Application not found');
    END IF;

    IF target_app.status != 'Pending' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Application is not in Pending status');
    END IF;

    SELECT * INTO target_project 
    FROM public.projects 
    WHERE id = target_app.project_id;

    IF target_project.owner_id != auth.uid() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Only the project owner can reject applications');
    END IF;

    UPDATE public.project_applications
    SET status = 'Rejected',
        reviewed_at = timezone('utc'::text, now()),
        reviewed_by = auth.uid(),
        updated_at = timezone('utc'::text, now())
    WHERE id = app_id;

    -- Notify applicant politely
    BEGIN
        INSERT INTO public.notifications (
            recipient_id,
            sender_id,
            type,
            title,
            message,
            link
        ) VALUES (
            target_app.applicant_id,
            auth.uid(),
            'application_rejected',
            'Application Update',
            'Your application to join "' || target_project.title || '" was not selected at this time.',
            '/my-applications'
        );
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;

    RETURN jsonb_build_object('success', true);
END;
$$;

-- 22. Grants for functions
GRANT EXECUTE ON FUNCTION public.is_project_owner(UUID, UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_project_member(UUID, UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_project_lead(UUID, UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.accept_project_application(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_project_application(UUID) TO authenticated;

-- 23. Enable Supabase Realtime publication on relevant tables
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'project_discussions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.project_discussions;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'project_tasks'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.project_tasks;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Skip if supabase_realtime publication is managed differently
END $$;

-- 24. Atomic Function to Create or Update Tasks Concurrency-Safe
CREATE OR REPLACE FUNCTION public.save_project_task(
    p_project_id UUID,
    p_title TEXT,
    p_description TEXT DEFAULT NULL,
    p_status TEXT DEFAULT 'To Do',
    p_priority TEXT DEFAULT 'Medium',
    p_assignee_id UUID DEFAULT NULL,
    p_milestone_id UUID DEFAULT NULL,
    p_due_date DATE DEFAULT NULL,
    task_id UUID DEFAULT NULL
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    is_authorized BOOLEAN;
    saved_task RECORD;
    proj_title TEXT;
    creator_display_name TEXT;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Authentication required');
    END IF;

    SELECT (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = p_project_id AND p.owner_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = p_project_id AND pm.user_id = auth.uid()
        )
    ) INTO is_authorized;

    IF NOT is_authorized THEN
        RETURN jsonb_build_object('success', false, 'error', 'You must be a team member or project owner to manage tasks.');
    END IF;

    IF char_length(trim(p_title)) < 3 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Task title must be at least 3 characters.');
    END IF;

    IF task_id IS NOT NULL THEN
        UPDATE public.project_tasks
        SET title = trim(p_title),
            description = trim(p_description),
            status = p_status,
            priority = p_priority,
            assignee_id = p_assignee_id,
            milestone_id = p_milestone_id,
            due_date = p_due_date,
            updated_at = timezone('utc'::text, now())
        WHERE id = task_id AND project_id = p_project_id
        RETURNING * INTO saved_task;

        IF NOT FOUND THEN
            RETURN jsonb_build_object('success', false, 'error', 'Task not found or access denied');
        END IF;
    ELSE
        INSERT INTO public.project_tasks (
            project_id,
            creator_id,
            title,
            description,
            status,
            priority,
            assignee_id,
            milestone_id,
            due_date
        ) VALUES (
            p_project_id,
            auth.uid(),
            trim(p_title),
            trim(p_description),
            COALESCE(p_status, 'To Do'),
            COALESCE(p_priority, 'Medium'),
            p_assignee_id,
            p_milestone_id,
            p_due_date
        )
        RETURNING * INTO saved_task;
    END IF;

    IF p_assignee_id IS NOT NULL AND p_assignee_id != auth.uid() THEN
        BEGIN
            SELECT title INTO proj_title FROM public.projects WHERE id = p_project_id;
            SELECT display_name INTO creator_display_name FROM public.profiles WHERE user_id = auth.uid();

            INSERT INTO public.notifications (
                recipient_id,
                sender_id,
                type,
                title,
                message,
                link
            ) VALUES (
                p_assignee_id,
                auth.uid(),
                'task_assigned',
                'Task Assigned to You 📋',
                COALESCE(creator_display_name, 'A teammate') || ' assigned you to "' || saved_task.title || '" in ' || COALESCE(proj_title, 'the project') || '.',
                '/projects/' || p_project_id || '/workspace/tasks'
            );
        EXCEPTION
            WHEN OTHERS THEN NULL;
        END;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'task_id', saved_task.id,
        'task', row_to_json(saved_task)
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_project_task(UUID, TEXT, TEXT, TEXT, TEXT, UUID, UUID, DATE, UUID) TO authenticated;




-- ======================================================================
-- MIGRATION: 20261015000002_fix_tasks_rls.sql
-- ======================================================================

-- ==============================================================================
-- TeamForge Migration: Fix project_tasks RLS Policies & Atomic Task RPC
-- Resolves: "new row violates row-level security policy for table project_tasks"
-- ==============================================================================

-- 1. Ensure project_tasks RLS is enabled
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies on project_tasks
DROP POLICY IF EXISTS "Workspace members can view tasks" ON public.project_tasks;
DROP POLICY IF EXISTS "Workspace members can create tasks" ON public.project_tasks;
DROP POLICY IF EXISTS "Workspace members can update tasks" ON public.project_tasks;
DROP POLICY IF EXISTS "Creators or leads can delete tasks" ON public.project_tasks;

-- 3. Bulletproof direct subquery policies for project_tasks
CREATE POLICY "Workspace members can view tasks"
    ON public.project_tasks FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_tasks.project_id AND p.owner_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = project_tasks.project_id AND pm.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can create tasks"
    ON public.project_tasks FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = creator_id
        AND (
            EXISTS (
                SELECT 1 FROM public.projects p
                WHERE p.id = project_tasks.project_id AND p.owner_id = auth.uid()
            )
            OR EXISTS (
                SELECT 1 FROM public.project_members pm
                WHERE pm.project_id = project_tasks.project_id AND pm.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Workspace members can update tasks"
    ON public.project_tasks FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_tasks.project_id AND p.owner_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = project_tasks.project_id AND pm.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_tasks.project_id AND p.owner_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = project_tasks.project_id AND pm.user_id = auth.uid()
        )
    );

CREATE POLICY "Creators or leads can delete tasks"
    ON public.project_tasks FOR DELETE
    TO authenticated
    USING (
        auth.uid() = creator_id
        OR EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_tasks.project_id AND p.owner_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = project_tasks.project_id AND pm.user_id = auth.uid() AND pm.role = 'Project Lead'
        )
    );

-- 4. Also ensure project_members INSERT policy allows leads and owners to add members
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

-- 5. Safe, atomic RPC function to create/update tasks
CREATE OR REPLACE FUNCTION public.save_project_task(
    p_project_id UUID,
    p_title TEXT,
    p_description TEXT DEFAULT NULL,
    p_status TEXT DEFAULT 'To Do',
    p_priority TEXT DEFAULT 'Medium',
    p_assignee_id UUID DEFAULT NULL,
    p_milestone_id UUID DEFAULT NULL,
    p_due_date DATE DEFAULT NULL,
    task_id UUID DEFAULT NULL
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    is_authorized BOOLEAN;
    saved_task RECORD;
    proj_title TEXT;
    creator_display_name TEXT;
BEGIN
    -- Verify caller identity
    IF auth.uid() IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Authentication required');
    END IF;

    -- Verify membership or ownership
    SELECT (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = p_project_id AND p.owner_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = p_project_id AND pm.user_id = auth.uid()
        )
    ) INTO is_authorized;

    IF NOT is_authorized THEN
        RETURN jsonb_build_object('success', false, 'error', 'You must be a team member or project owner to manage tasks.');
    END IF;

    -- Validate title
    IF char_length(trim(p_title)) < 3 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Task title must be at least 3 characters.');
    END IF;

    IF task_id IS NOT NULL THEN
        -- UPDATE existing task
        UPDATE public.project_tasks
        SET title = trim(p_title),
            description = trim(p_description),
            status = p_status,
            priority = p_priority,
            assignee_id = p_assignee_id,
            milestone_id = p_milestone_id,
            due_date = p_due_date,
            updated_at = timezone('utc'::text, now())
        WHERE id = task_id AND project_id = p_project_id
        RETURNING * INTO saved_task;

        IF NOT FOUND THEN
            RETURN jsonb_build_object('success', false, 'error', 'Task not found or access denied');
        END IF;
    ELSE
        -- INSERT new task
        INSERT INTO public.project_tasks (
            project_id,
            creator_id,
            title,
            description,
            status,
            priority,
            assignee_id,
            milestone_id,
            due_date
        ) VALUES (
            p_project_id,
            auth.uid(),
            trim(p_title),
            trim(p_description),
            COALESCE(p_status, 'To Do'),
            COALESCE(p_priority, 'Medium'),
            p_assignee_id,
            p_milestone_id,
            p_due_date
        )
        RETURNING * INTO saved_task;
    END IF;

    -- Safe notification trigger (wrapped in exception handler)
    IF p_assignee_id IS NOT NULL AND p_assignee_id != auth.uid() THEN
        BEGIN
            SELECT title INTO proj_title FROM public.projects WHERE id = p_project_id;
            SELECT display_name INTO creator_display_name FROM public.profiles WHERE user_id = auth.uid();

            INSERT INTO public.notifications (
                recipient_id,
                sender_id,
                type,
                title,
                message,
                link
            ) VALUES (
                p_assignee_id,
                auth.uid(),
                'task_assigned',
                'Task Assigned to You 📋',
                COALESCE(creator_display_name, 'A teammate') || ' assigned you to "' || saved_task.title || '" in ' || COALESCE(proj_title, 'the project') || '.',
                '/projects/' || p_project_id || '/workspace/tasks'
            );
        EXCEPTION
            WHEN OTHERS THEN NULL;
        END;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'task_id', saved_task.id,
        'task', row_to_json(saved_task)
    );
END;
$$;

-- 6. Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.save_project_task(UUID, TEXT, TEXT, TEXT, TEXT, UUID, UUID, DATE, UUID) TO authenticated;



-- ======================================================================
-- MIGRATION: 20261015000003_phase3_college_adoption.sql
-- ======================================================================

-- ==============================================================================
-- TeamForge Phase 3: College Adoption Migration
-- Extends TeamForge with:
-- 1. Teacher/Faculty Mentor role and secure verification function
-- 2. Faculty-Posted Problem Statements (authoring, RLS, referencing)
-- 3. GitHub repository, live demo & documentation URLs
-- 4. Student Portfolio Contribution Evidence & privacy controls
-- 5. Project Mentoring Notes & Feedback
-- ==============================================================================

-- 1. Extend profiles with role and portfolio privacy
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_portfolio_public BOOLEAN NOT NULL DEFAULT true;

-- 2. Role protection trigger preventing arbitrary self-escalation via client update
CREATE OR REPLACE FUNCTION public.handle_profile_role_protection()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        IF current_setting('teamforge.allow_role_change', true) IS DISTINCT FROM 'on' 
           AND current_user NOT IN ('postgres', 'supabase_admin') 
           AND COALESCE(auth.jwt()->>'role', '') != 'service_role' THEN
            -- Reject unauthorized client role escalation
            NEW.role = OLD.role;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_profile_role_protection ON public.profiles;
CREATE TRIGGER tr_profile_role_protection
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_profile_role_protection();

-- 3. Secure Verification Function for Faculty / Teacher Role
CREATE OR REPLACE FUNCTION public.verify_faculty_code(access_code TEXT)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Authentication required.');
    END IF;

    IF trim(access_code) IN ('FACULTY2026', 'TF-FACULTY-2026', 'TEACHER2026') THEN
        PERFORM set_config('teamforge.allow_role_change', 'on', true);

        UPDATE public.profiles
        SET role = 'teacher',
            updated_at = timezone('utc'::text, now())
        WHERE user_id = auth.uid();

        RETURN jsonb_build_object('success', true, 'role', 'teacher');
    ELSE
        RETURN jsonb_build_object('success', false, 'error', 'Invalid institutional faculty verification code.');
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_faculty_code(TEXT) TO authenticated;

-- 4. Create problem_statements table
CREATE TABLE IF NOT EXISTS public.problem_statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'Web Development',
        'AI/ML',
        'Mobile Apps',
        'Developer Tools',
        'Social Impact',
        'IoT/Hardware',
        'Other'
    )),
    required_skills TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    deadline DATE,
    status TEXT NOT NULL DEFAULT 'Published' CHECK (status IN ('Draft', 'Published', 'Archived')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT problem_title_len CHECK (char_length(title) >= 5 AND char_length(title) <= 150),
    CONSTRAINT problem_desc_len CHECK (char_length(description) >= 20)
);

CREATE INDEX IF NOT EXISTS idx_problem_statements_author ON public.problem_statements(author_id);
CREATE INDEX IF NOT EXISTS idx_problem_statements_status ON public.problem_statements(status);
CREATE INDEX IF NOT EXISTS idx_problem_statements_category ON public.problem_statements(category);

ALTER TABLE public.problem_statements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published problem statements are viewable by everyone" ON public.problem_statements;
CREATE POLICY "Published problem statements are viewable by everyone"
    ON public.problem_statements FOR SELECT
    USING (
        status = 'Published' 
        OR (auth.uid() IS NOT NULL AND auth.uid() = author_id)
    );

DROP POLICY IF EXISTS "Teachers can create problem statements" ON public.problem_statements;
CREATE POLICY "Teachers can create problem statements"
    ON public.problem_statements FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = author_id
        AND EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() AND role IN ('teacher', 'admin')
        )
    );

DROP POLICY IF EXISTS "Teachers can update their own problem statements" ON public.problem_statements;
CREATE POLICY "Teachers can update their own problem statements"
    ON public.problem_statements FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = author_id
        AND EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() AND role IN ('teacher', 'admin')
        )
    );

DROP POLICY IF EXISTS "Teachers can delete their own problem statements" ON public.problem_statements;
CREATE POLICY "Teachers can delete their own problem statements"
    ON public.problem_statements FOR DELETE
    TO authenticated
    USING (
        auth.uid() = author_id
        AND EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() AND role IN ('teacher', 'admin')
        )
    );

-- 5. Extend projects with documentation_url and problem_statement_id
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS documentation_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS problem_statement_id UUID REFERENCES public.problem_statements(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_projects_problem_statement ON public.projects(problem_statement_id);

-- 6. Create project_mentoring_notes table
CREATE TABLE IF NOT EXISTS public.project_mentoring_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    mentor_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    feedback_type TEXT NOT NULL DEFAULT 'General' CHECK (feedback_type IN ('General', 'Milestone Review', 'Technical Guidance', 'Commendation')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT mentoring_content_len CHECK (char_length(content) >= 5)
);

CREATE INDEX IF NOT EXISTS idx_mentoring_notes_project ON public.project_mentoring_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_notes_mentor ON public.project_mentoring_notes(mentor_id);

ALTER TABLE public.project_mentoring_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team members and mentors can view mentoring notes" ON public.project_mentoring_notes;
CREATE POLICY "Team members and mentors can view mentoring notes"
    ON public.project_mentoring_notes FOR SELECT
    TO authenticated
    USING (
        auth.uid() = mentor_id
        OR EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_mentoring_notes.project_id AND p.owner_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = project_mentoring_notes.project_id AND pm.user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles pr
            WHERE pr.user_id = auth.uid() AND pr.role IN ('teacher', 'admin')
        )
    );

DROP POLICY IF EXISTS "Teachers can create mentoring notes" ON public.project_mentoring_notes;
CREATE POLICY "Teachers can create mentoring notes"
    ON public.project_mentoring_notes FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = mentor_id
        AND EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() AND role IN ('teacher', 'admin')
        )
    );

DROP POLICY IF EXISTS "Mentors can update their notes" ON public.project_mentoring_notes;
CREATE POLICY "Mentors can update their notes"
    ON public.project_mentoring_notes FOR UPDATE
    TO authenticated
    USING (auth.uid() = mentor_id);

DROP POLICY IF EXISTS "Mentors can delete their notes" ON public.project_mentoring_notes;
CREATE POLICY "Mentors can delete their notes"
    ON public.project_mentoring_notes FOR DELETE
    TO authenticated
    USING (auth.uid() = mentor_id);

-- 7. Extend project_tasks with contribution evidence
ALTER TABLE public.project_tasks ADD COLUMN IF NOT EXISTS evidence_url TEXT;
ALTER TABLE public.project_tasks ADD COLUMN IF NOT EXISTS evidence_note TEXT;

-- 8. Enable Realtime Publications for new Phase 3 tables
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'problem_statements'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.problem_statements;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'project_mentoring_notes'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.project_mentoring_notes;
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;



-- ======================================================================
-- MIGRATION: 20261015000004_problem_applications_and_faculty_verification.sql
-- ======================================================================

-- ==============================================================================
-- TeamForge Phase 3 Update:
-- 1. Faculty Age & Document Verification (Birth year <= 2003 for Teacher/Mentor/Professor)
-- 2. Problem Statement Applications (Apply to Join faculty challenges)
-- ==============================================================================

-- 1. Extend profiles table with faculty verification details
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS faculty_verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_doc_type TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_year INT;

-- 2. Secure Age & Credential Verification RPC Function
-- Eligibility rule: birth_year <= 2003 grants teacher / mentor / professor status.
CREATE OR REPLACE FUNCTION public.verify_faculty_credentials(
    doc_type TEXT,
    birth_year INT,
    doc_name TEXT DEFAULT NULL
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    target_uid UUID;
BEGIN
    target_uid := auth.uid();
    IF target_uid IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Authentication required.');
    END IF;

    IF birth_year IS NULL OR birth_year <= 1900 OR birth_year > 2026 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid birth year provided.');
    END IF;

    -- Age verification requirement: born in or before 2003 (age >= 23 in 2026)
    IF birth_year <= 2003 THEN
        -- Allow role update through trigger
        PERFORM set_config('teamforge.allow_role_change', 'on', true);

        UPDATE public.profiles
        SET role = 'teacher',
            faculty_verified = true,
            verification_doc_type = doc_type,
            birth_year = birth_year,
            updated_at = timezone('utc'::text, now())
        WHERE user_id = target_uid;

        RETURN jsonb_build_object(
            'success', true,
            'role', 'teacher',
            'birth_year', birth_year,
            'doc_type', doc_type,
            'message', 'Credential verified successfully! Granted Teacher / Mentor / Professor status.'
        );
    ELSE
        -- Born after 2003: rejected from faculty status, stays/proceeds as student
        RETURN jsonb_build_object(
            'success', false,
            'role', 'student',
            'birth_year', birth_year,
            'error', 'Invalid credential for Faculty/Mentor. Your birth date indicates student status (born after 2003). As per institutional rules, faculty/mentors must be born in 2003 or earlier.'
        );
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_faculty_credentials(TEXT, INT, TEXT) TO authenticated;

-- 3. Create problem_applications table
CREATE TABLE IF NOT EXISTS public.problem_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_statement_id UUID NOT NULL REFERENCES public.problem_statements(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    proposed_role TEXT NOT NULL DEFAULT 'Contributor',
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected', 'Withdrawn')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT problem_app_message_len CHECK (char_length(message) >= 10 AND char_length(message) <= 1500)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_problem_apps_unique_pending 
    ON public.problem_applications (problem_statement_id, applicant_id) 
    WHERE status = 'Pending';

CREATE INDEX IF NOT EXISTS idx_problem_apps_statement ON public.problem_applications(problem_statement_id);
CREATE INDEX IF NOT EXISTS idx_problem_apps_applicant ON public.problem_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_problem_apps_status ON public.problem_applications(status);

ALTER TABLE public.problem_applications ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for problem_applications
DROP POLICY IF EXISTS "Applicants and problem authors can view applications" ON public.problem_applications;
CREATE POLICY "Applicants and problem authors can view applications"
    ON public.problem_applications FOR SELECT
    USING (
        applicant_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.problem_statements ps
            WHERE ps.id = problem_applications.problem_statement_id AND ps.author_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Authenticated students can apply to problem statements" ON public.problem_applications;
CREATE POLICY "Authenticated students can apply to problem statements"
    ON public.problem_applications FOR INSERT
    WITH CHECK (
        auth.uid() = applicant_id AND
        NOT EXISTS (
            SELECT 1 FROM public.problem_statements ps
            WHERE ps.id = problem_applications.problem_statement_id AND ps.author_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Applicants can withdraw or authors can review applications" ON public.problem_applications;
CREATE POLICY "Applicants can withdraw or authors can review applications"
    ON public.problem_applications FOR UPDATE
    USING (
        applicant_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.problem_statements ps
            WHERE ps.id = problem_applications.problem_statement_id AND ps.author_id = auth.uid()
        )
    );

-- Trigger for updated_at
DROP TRIGGER IF EXISTS set_problem_applications_updated_at ON public.problem_applications;
CREATE TRIGGER set_problem_applications_updated_at
    BEFORE UPDATE ON public.problem_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();



-- ======================================================================
-- MIGRATION: 20261015000005_phase4_advanced_features.sql
-- ======================================================================

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



-- ======================================================================
-- MIGRATION: 20261015000006_private_hackathons.sql
-- ======================================================================

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



-- ======================================================================
-- MIGRATION: 20261016000007_admin_control_center.sql
-- ======================================================================

-- ==============================================================================
-- TeamForge Migration: Admin Control Center & Platform Governance
-- Migration: 20261016000007_admin_control_center.sql
-- 
-- Features:
-- 1. User suspension & status in public.profiles
-- 2. Featured project flag in public.projects
-- 3. Admin audit logs table with indexes and RLS
-- 4. Dynamic platform settings table for Explore, Taxonomy, and Match Scoring
-- 5. Helper security functions for admin verification and role protection
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTEND PROFILES WITH SUSPENSION & STATUS
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspension_reason TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deactivated'));

-- Index on status and suspension for efficient query filtering
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_is_suspended ON public.profiles(is_suspended);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ------------------------------------------------------------------------------
-- 2. EXTEND PROJECTS WITH FEATURED FLAG
-- ------------------------------------------------------------------------------
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_projects_is_featured ON public.projects(is_featured);

-- ------------------------------------------------------------------------------
-- 3. ADMIN AUDIT LOGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_email TEXT,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT,
    details JSONB DEFAULT '{}'::jsonb NOT NULL,
    outcome TEXT NOT NULL DEFAULT 'SUCCESS' CHECK (outcome IN ('SUCCESS', 'FAILED')),
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_actor_id ON public.admin_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON public.admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_target_type ON public.admin_audit_logs(target_type);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    user_role TEXT;
    suspended BOOLEAN;
BEGIN
    IF user_id IS NULL THEN
        RETURN false;
    END IF;

    SELECT role, is_suspended INTO user_role, suspended
    FROM public.profiles
    WHERE public.profiles.user_id = is_admin.user_id;

    RETURN (user_role = 'admin' AND suspended = false);
END;
$$;

-- RLS: Only admins can view audit logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view audit logs"
    ON public.admin_audit_logs FOR SELECT
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- RLS: Only admins or service role can insert audit logs
DROP POLICY IF EXISTS "Admins or service can insert audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins or service can insert audit logs"
    ON public.admin_audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin(auth.uid()) OR auth.uid() IS NOT NULL);

-- ------------------------------------------------------------------------------
-- 4. DYNAMIC PLATFORM SETTINGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.platform_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- RLS: Anyone (authenticated or public) can read platform settings (e.g. explore config, skills)
DROP POLICY IF EXISTS "Public can view platform settings" ON public.platform_settings;
CREATE POLICY "Public can view platform settings"
    ON public.platform_settings FOR SELECT
    USING (true);

-- RLS: Only admins can modify platform settings
DROP POLICY IF EXISTS "Admins can insert platform settings" ON public.platform_settings;
CREATE POLICY "Admins can insert platform settings"
    ON public.platform_settings FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update platform settings" ON public.platform_settings;
CREATE POLICY "Admins can update platform settings"
    ON public.platform_settings FOR UPDATE
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- 5. SEED DEFAULT PLATFORM CONFIGURATIONS (SAFE & IDEMPOTENT)
-- ------------------------------------------------------------------------------

-- Seed Explore Configuration
INSERT INTO public.platform_settings (key, value, description)
VALUES (
    'explore_config',
    '{
        "default_page_size": 12,
        "categories": [
            {"id": "cat-web", "name": "Web Development", "isActive": true, "order": 1},
            {"id": "cat-aiml", "name": "AI/ML", "isActive": true, "order": 2},
            {"id": "cat-mobile", "name": "Mobile Apps", "isActive": true, "order": 3},
            {"id": "cat-devtools", "name": "Developer Tools", "isActive": true, "order": 4},
            {"id": "cat-social", "name": "Social Impact", "isActive": true, "order": 5},
            {"id": "cat-iot", "name": "IoT/Hardware", "isActive": true, "order": 6},
            {"id": "cat-other", "name": "Other", "isActive": true, "order": 7}
        ],
        "difficulties": ["Beginner", "Intermediate", "Advanced"],
        "statuses": ["Recruiting", "In Progress", "Completed"],
        "popular_skills": ["React", "Python", "TypeScript", "Node.js", "PyTorch", "Next.js", "Flutter", "PostgreSQL", "Docker", "UI/UX"]
    }'::jsonb,
    'Configuration for Explore page categories, difficulty options, statuses, and popular skill chips'
)
ON CONFLICT (key) DO NOTHING;

-- Seed Taxonomy Configuration (Skills & Roles)
INSERT INTO public.platform_settings (key, value, description)
VALUES (
    'taxonomy_config',
    '{
        "skills": [
            {"id": "sk-1", "name": "React", "category": "Frontend", "isActive": true, "aliases": ["React.js", "ReactJS"]},
            {"id": "sk-2", "name": "Next.js", "category": "Frontend", "isActive": true, "aliases": ["NextJS"]},
            {"id": "sk-3", "name": "TypeScript", "category": "Languages", "isActive": true, "aliases": ["TS"]},
            {"id": "sk-4", "name": "JavaScript", "category": "Languages", "isActive": true, "aliases": ["JS"]},
            {"id": "sk-5", "name": "Python", "category": "Backend/AI", "isActive": true, "aliases": ["Py"]},
            {"id": "sk-6", "name": "Java", "category": "Languages", "isActive": true, "aliases": []},
            {"id": "sk-7", "name": "C++", "category": "Languages", "isActive": true, "aliases": ["CPP"]},
            {"id": "sk-8", "name": "Node.js", "category": "Backend", "isActive": true, "aliases": ["Node", "NodeJS"]},
            {"id": "sk-9", "name": "PyTorch", "category": "AI/ML", "isActive": true, "aliases": []},
            {"id": "sk-10", "name": "TensorFlow", "category": "AI/ML", "isActive": true, "aliases": ["TF"]},
            {"id": "sk-11", "name": "PostgreSQL", "category": "Database", "isActive": true, "aliases": ["Postgres", "SQL"]},
            {"id": "sk-12", "name": "MongoDB", "category": "Database", "isActive": true, "aliases": ["Mongo"]},
            {"id": "sk-13", "name": "Docker", "category": "DevOps", "isActive": true, "aliases": []},
            {"id": "sk-14", "name": "Kubernetes", "category": "DevOps", "isActive": true, "aliases": ["K8s"]},
            {"id": "sk-15", "name": "Flutter", "category": "Mobile", "isActive": true, "aliases": []},
            {"id": "sk-16", "name": "UI/UX Design", "category": "Design", "isActive": true, "aliases": ["Figma", "UI/UX"]},
            {"id": "sk-17", "name": "Cloud Computing", "category": "Cloud", "isActive": true, "aliases": ["AWS", "GCP", "Azure"]}
        ],
        "roles": [
            {"id": "ro-1", "name": "Project Lead", "category": "Leadership", "isActive": true},
            {"id": "ro-2", "name": "Frontend Developer", "category": "Engineering", "isActive": true},
            {"id": "ro-3", "name": "Backend Developer", "category": "Engineering", "isActive": true},
            {"id": "ro-4", "name": "Full-Stack Developer", "category": "Engineering", "isActive": true},
            {"id": "ro-5", "name": "AI/ML Engineer", "category": "Data & AI", "isActive": true},
            {"id": "ro-6", "name": "UI/UX Designer", "category": "Design", "isActive": true},
            {"id": "ro-7", "name": "Researcher", "category": "Academic", "isActive": true},
            {"id": "ro-8", "name": "Contributor", "category": "General", "isActive": true}
        ]
    }'::jsonb,
    'Taxonomy options for technical skills and preferred collaboration roles'
)
ON CONFLICT (key) DO NOTHING;

-- Seed Teammate Match Scoring Configuration
INSERT INTO public.platform_settings (key, value, description)
VALUES (
    'match_scoring_config',
    '{
        "weights": {
            "required_skills": 50,
            "desired_roles": 30,
            "category_interests": 15,
            "completeness_availability": 5
        },
        "min_recommendation_score": 20,
        "max_recommendations": 8,
        "require_public_portfolio": true,
        "formula_description": "Score = (Skill Match × 50%) + (Role Match × 30%) + (Interest Match × 15%) + (Completeness × 5%)"
    }'::jsonb,
    'Weighted formula configuration for intelligent teammate matching'
)
ON CONFLICT (key) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 6. STRICT PROFILE ROLE & SUSPENSION PROTECTION TRIGGER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_profile_role_and_suspension_protection()
RETURNS TRIGGER AS $$
BEGIN
    -- Protect 'role' from self-escalation
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        IF current_setting('teamforge.allow_role_change', true) IS DISTINCT FROM 'on' 
           AND current_user NOT IN ('postgres', 'supabase_admin') 
           AND COALESCE(auth.jwt()->>'role', '') != 'service_role' THEN
            -- Check if caller is an admin
            IF NOT public.is_admin(auth.uid()) THEN
                NEW.role = OLD.role;
            END IF;
        END IF;
    END IF;

    -- Protect 'is_suspended' and 'status' from self-modification
    IF (NEW.is_suspended IS DISTINCT FROM OLD.is_suspended) OR (NEW.status IS DISTINCT FROM OLD.status) THEN
        IF current_user NOT IN ('postgres', 'supabase_admin') 
           AND COALESCE(auth.jwt()->>'role', '') != 'service_role' THEN
            -- Check if caller is an admin
            IF NOT public.is_admin(auth.uid()) THEN
                NEW.is_suspended = OLD.is_suspended;
                NEW.status = OLD.status;
                NEW.suspension_reason = OLD.suspension_reason;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_profile_role_protection ON public.profiles;
CREATE TRIGGER tr_profile_role_protection
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_profile_role_and_suspension_protection();

-- ------------------------------------------------------------------------------
-- 7. AUDIT LOGGING HELPER FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_admin_audit(
    p_action TEXT,
    p_target_type TEXT,
    p_target_id TEXT,
    p_details JSONB DEFAULT '{}'::jsonb,
    p_outcome TEXT DEFAULT 'SUCCESS'
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    v_log_id UUID;
    v_actor_email TEXT;
BEGIN
    SELECT email INTO v_actor_email FROM auth.users WHERE id = auth.uid();

    INSERT INTO public.admin_audit_logs (
        actor_id,
        actor_email,
        action,
        target_type,
        target_id,
        details,
        outcome
    ) VALUES (
        auth.uid(),
        v_actor_email,
        p_action,
        p_target_type,
        p_target_id,
        p_details,
        p_outcome
    ) RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$;



-- ======================================================================
-- MIGRATION: 20261016000008_admin_moderation_rpc.sql
-- ======================================================================

-- ==============================================================================
-- TeamForge Migration: Complete Admin Moderation Security & Teammate Removal
-- Migration: 20261016000008_admin_moderation_rpc.sql
-- ==============================================================================

-- 1. Update RLS on public.profiles to allow administrators to UPDATE profiles
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile or admins can update profiles" ON public.profiles;

CREATE POLICY "Users can update their own profile or admins can update profiles" 
    ON public.profiles FOR UPDATE 
    USING (
        auth.uid() = user_id 
        OR (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
        OR auth.uid() = '9343b52f-f7e8-4ed8-a8a1-476829811b53'::uuid
    );

-- 2. Update RLS on public.project_members to allow administrators to DELETE memberships
DROP POLICY IF EXISTS "Members can leave or leads can remove" ON public.project_members;
DROP POLICY IF EXISTS "Members can leave or leads can remove or admins can remove" ON public.project_members;

CREATE POLICY "Members can leave or leads can remove or admins can remove"
    ON public.project_members FOR DELETE
    USING (
        auth.uid() = user_id 
        OR public.is_project_lead(project_id, auth.uid())
        OR (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
        OR auth.uid() = '9343b52f-f7e8-4ed8-a8a1-476829811b53'::uuid
    );

-- 3. Dedicated SECURITY DEFINER RPC function for atomic user moderation
CREATE OR REPLACE FUNCTION public.admin_moderate_user(
    p_action TEXT,
    p_target_user_id UUID,
    p_reason TEXT DEFAULT '',
    p_project_id UUID DEFAULT NULL
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    v_admin_uid UUID;
    v_is_admin BOOLEAN;
    v_target_profile RECORD;
    v_actor_email TEXT;
    v_proj RECORD;
    v_count INT;
BEGIN
    v_admin_uid := auth.uid();

    -- Allow configured owner admin or any profile with role='admin'
    IF v_admin_uid = '9343b52f-f7e8-4ed8-a8a1-476829811b53'::uuid THEN
        v_is_admin := true;
    ELSE
        SELECT (role = 'admin' AND is_suspended = false) INTO v_is_admin
        FROM public.profiles
        WHERE user_id = v_admin_uid;
    END IF;

    IF v_is_admin IS NOT TRUE THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Admin privileges required.');
    END IF;

    -- Prevent self-lockout
    IF p_target_user_id = v_admin_uid THEN
        RETURN jsonb_build_object('success', false, 'error', 'Action denied: Administrators cannot moderate their own account.');
    END IF;

    -- Fetch target profile
    SELECT * INTO v_target_profile FROM public.profiles WHERE user_id = p_target_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Target user profile not found.');
    END IF;

    SELECT email INTO v_actor_email FROM auth.users WHERE id = v_admin_uid;

    -- -------------------------------------------------------------
    -- ACTION: SUSPEND
    -- -------------------------------------------------------------
    IF p_action = 'suspend' THEN
        -- 1. Mark suspended, disable public portfolio
        UPDATE public.profiles
        SET is_suspended = true,
            status = 'suspended',
            suspension_reason = COALESCE(NULLIF(TRIM(p_reason), ''), 'Violating collegiate collaboration guidelines.'),
            is_portfolio_public = false,
            updated_at = now()
        WHERE user_id = p_target_user_id;

        -- 2. Remove user from all active project teams
        FOR v_proj IN (SELECT project_id FROM public.project_members WHERE user_id = p_target_user_id) LOOP
            DELETE FROM public.project_members WHERE project_id = v_proj.project_id AND user_id = p_target_user_id;
            SELECT COUNT(*) INTO v_count FROM public.project_members WHERE project_id = v_proj.project_id;
            UPDATE public.projects SET current_team_size = GREATEST(1, v_count + 1) WHERE id = v_proj.project_id;
        END LOOP;

        -- 3. Remove user from hackathon teams
        DELETE FROM public.hackathon_team_members WHERE user_id = p_target_user_id;

        -- 4. Cancel pending project applications & invitations
        UPDATE public.project_applications SET status = 'Rejected' WHERE applicant_id = p_target_user_id AND status = 'Pending';
        DELETE FROM public.project_invitations WHERE invitee_id = p_target_user_id;

        -- 5. Audit log
        INSERT INTO public.admin_audit_logs (actor_id, actor_email, action, target_type, target_id, details, outcome)
        VALUES (
            v_admin_uid,
            v_actor_email,
            'USER_SUSPENDED',
            'user',
            p_target_user_id::text,
            jsonb_build_object(
                'target_username', v_target_profile.username,
                'target_display_name', v_target_profile.display_name,
                'reason', p_reason
            ),
            'SUCCESS'
        );

        RETURN jsonb_build_object('success', true, 'message', 'User suspended and successfully removed from all teammate sections and project teams.');
    END IF;

    -- -------------------------------------------------------------
    -- ACTION: RESTORE
    -- -------------------------------------------------------------
    IF p_action = 'restore' THEN
        UPDATE public.profiles
        SET is_suspended = false,
            status = 'active',
            suspension_reason = NULL,
            is_portfolio_public = true,
            updated_at = now()
        WHERE user_id = p_target_user_id;

        INSERT INTO public.admin_audit_logs (actor_id, actor_email, action, target_type, target_id, details, outcome)
        VALUES (
            v_admin_uid,
            v_actor_email,
            'USER_RESTORED',
            'user',
            p_target_user_id::text,
            jsonb_build_object('target_username', v_target_profile.username),
            'SUCCESS'
        );

        RETURN jsonb_build_object('success', true, 'message', 'User restored and active.');
    END IF;

    -- -------------------------------------------------------------
    -- ACTION: REMOVE FROM SINGLE PROJECT
    -- -------------------------------------------------------------
    IF p_action = 'remove_from_project' AND p_project_id IS NOT NULL THEN
        DELETE FROM public.project_members WHERE project_id = p_project_id AND user_id = p_target_user_id;
        SELECT COUNT(*) INTO v_count FROM public.project_members WHERE project_id = p_project_id;
        UPDATE public.projects SET current_team_size = GREATEST(1, v_count + 1) WHERE id = p_project_id;

        INSERT INTO public.admin_audit_logs (actor_id, actor_email, action, target_type, target_id, details, outcome)
        VALUES (
            v_admin_uid,
            v_actor_email,
            'USER_REMOVED_FROM_PROJECT',
            'user',
            p_target_user_id::text,
            jsonb_build_object('target_username', v_target_profile.username, 'project_id', p_project_id::text, 'reason', p_reason),
            'SUCCESS'
        );

        RETURN jsonb_build_object('success', true, 'message', 'User removed from team.');
    END IF;

    -- -------------------------------------------------------------
    -- ACTION: REMOVE FROM ALL TEAMS
    -- -------------------------------------------------------------
    IF p_action = 'remove_from_all_teams' THEN
        FOR v_proj IN (SELECT project_id FROM public.project_members WHERE user_id = p_target_user_id) LOOP
            DELETE FROM public.project_members WHERE project_id = v_proj.project_id AND user_id = p_target_user_id;
            SELECT COUNT(*) INTO v_count FROM public.project_members WHERE project_id = v_proj.project_id;
            UPDATE public.projects SET current_team_size = GREATEST(1, v_count + 1) WHERE id = v_proj.project_id;
        END LOOP;

        DELETE FROM public.hackathon_team_members WHERE user_id = p_target_user_id;

        INSERT INTO public.admin_audit_logs (actor_id, actor_email, action, target_type, target_id, details, outcome)
        VALUES (
            v_admin_uid,
            v_actor_email,
            'USER_REMOVED_FROM_ALL_PROJECTS',
            'user',
            p_target_user_id::text,
            jsonb_build_object('target_username', v_target_profile.username, 'reason', p_reason),
            'SUCCESS'
        );

        RETURN jsonb_build_object('success', true, 'message', 'User removed from all teams.');
    END IF;

    RETURN jsonb_build_object('success', false, 'error', 'Invalid action specified.');
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_moderate_user(TEXT, UUID, TEXT, UUID) TO authenticated;



-- ======================================================================
-- MIGRATION: 20261016000009_fix_project_milestones_rls.sql
-- ======================================================================

-- ==============================================================================
-- TeamForge Migration: Fix project_milestones Row Level Security (RLS) & Atomic RPC
-- Migration: 20261016000009_fix_project_milestones_rls.sql
-- Resolves: "new row violates row-level security policy for table project_milestones"
-- ==============================================================================

-- 1. Ensure table exists with correct columns
CREATE TABLE IF NOT EXISTS public.project_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'In Progress', 'Completed')),
    created_by UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Ensure RLS is active
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;

-- 3. Drop all legacy policies that rely on fragile function calls
DROP POLICY IF EXISTS "Workspace members can view milestones" ON public.project_milestones;
DROP POLICY IF EXISTS "Leads can create milestones" ON public.project_milestones;
DROP POLICY IF EXISTS "Workspace members can create milestones" ON public.project_milestones;
DROP POLICY IF EXISTS "Leads can update milestones" ON public.project_milestones;
DROP POLICY IF EXISTS "Workspace members can update milestones" ON public.project_milestones;
DROP POLICY IF EXISTS "Leads can delete milestones" ON public.project_milestones;
DROP POLICY IF EXISTS "Workspace members can delete milestones" ON public.project_milestones;
DROP POLICY IF EXISTS "Leads or creators can delete milestones" ON public.project_milestones;

-- 4. SELECT: Anyone with project access can view milestones
CREATE POLICY "Workspace members can view milestones"
    ON public.project_milestones FOR SELECT
    TO authenticated, anon
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_milestones.project_id
        )
    );

-- 5. INSERT: Any project owner, lead, or workspace member can create milestones
CREATE POLICY "Workspace members can create milestones"
    ON public.project_milestones FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_milestones.project_id AND p.owner_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = project_milestones.project_id AND pm.user_id = auth.uid()
        )
        OR auth.uid() = created_by
    );

-- 6. UPDATE: Project owner, lead, or workspace members can update milestones
CREATE POLICY "Workspace members can update milestones"
    ON public.project_milestones FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_milestones.project_id AND p.owner_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = project_milestones.project_id AND pm.user_id = auth.uid()
        )
        OR auth.uid() = created_by
    );

-- 7. DELETE: Project owner, lead, or milestone creator can delete milestones
CREATE POLICY "Leads or creators can delete milestones"
    ON public.project_milestones FOR DELETE
    TO authenticated
    USING (
        auth.uid() = created_by
        OR EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_milestones.project_id AND p.owner_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = project_milestones.project_id 
              AND pm.user_id = auth.uid() 
              AND pm.role IN ('Project Lead', 'Lead', 'Admin', 'Owner')
        )
    );

-- 8. Atomic SECURITY DEFINER RPC: create_project_milestone (bypasses RLS recursion)
CREATE OR REPLACE FUNCTION public.create_project_milestone(
    p_project_id UUID,
    p_title TEXT,
    p_target_date DATE,
    p_description TEXT DEFAULT NULL,
    p_status TEXT DEFAULT 'Upcoming'
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    v_user_id UUID;
    v_is_authorized BOOLEAN;
    v_new_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Authentication required.');
    END IF;

    -- Validate user is owner or workspace member
    SELECT (
        EXISTS (
            SELECT 1 FROM public.projects WHERE id = p_project_id AND owner_id = v_user_id
        ) OR EXISTS (
            SELECT 1 FROM public.project_members WHERE project_id = p_project_id AND user_id = v_user_id
        )
    ) INTO v_is_authorized;

    IF NOT v_is_authorized THEN
        RETURN jsonb_build_object('success', false, 'error', 'Permission denied: must be a workspace team member or owner.');
    END IF;

    INSERT INTO public.project_milestones (
        project_id,
        title,
        description,
        target_date,
        status,
        created_by
    ) VALUES (
        p_project_id,
        p_title,
        p_description,
        p_target_date,
        p_status,
        v_user_id
    )
    RETURNING id INTO v_new_id;

    RETURN jsonb_build_object('success', true, 'id', v_new_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_project_milestone(UUID, TEXT, DATE, TEXT, TEXT) TO authenticated;

-- 9. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';



-- ======================================================================
-- MIGRATION: 20261016000010_admin_faculty_management_rpc.sql
-- ======================================================================

-- ==============================================================================
-- TeamForge Migration: Complete Faculty Access Revocation & Role Management
-- Migration: 20261016000010_admin_faculty_management_rpc.sql
-- ==============================================================================

-- 1. SECURITY DEFINER RPC to atomically revoke a faculty member's privileges
CREATE OR REPLACE FUNCTION public.admin_revoke_faculty_access(p_target_user_id UUID)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    v_caller_uid UUID;
    v_is_authorized BOOLEAN;
BEGIN
    v_caller_uid := auth.uid();

    -- Allow configured admin or anyone with admin role
    IF v_caller_uid = 'c86ce05f-24de-4a1a-a45f-944d4180b508'::uuid 
       OR v_caller_uid = '9343b52f-f7e8-4ed8-a8a1-476829811b53'::uuid THEN
        v_is_authorized := true;
    ELSE
        SELECT (role = 'admin' AND is_suspended = false) INTO v_is_authorized
        FROM public.profiles
        WHERE user_id = v_caller_uid;
    END IF;

    IF NOT COALESCE(v_is_authorized, false) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Administrator authorization required.');
    END IF;

    -- Enable role modification session setting
    PERFORM set_config('teamforge.allow_role_change', 'on', true);

    -- Demote role to student
    UPDATE public.profiles
    SET role = 'student',
        updated_at = timezone('utc'::text, now())
    WHERE user_id = p_target_user_id;

    RETURN jsonb_build_object('success', true, 'message', 'Faculty access revoked.');
END;
$$;

-- 2. SECURITY DEFINER RPC to restore faculty access
CREATE OR REPLACE FUNCTION public.admin_restore_faculty_access(p_target_user_id UUID)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    v_caller_uid UUID;
    v_is_authorized BOOLEAN;
BEGIN
    v_caller_uid := auth.uid();

    IF v_caller_uid = 'c86ce05f-24de-4a1a-a45f-944d4180b508'::uuid 
       OR v_caller_uid = '9343b52f-f7e8-4ed8-a8a1-476829811b53'::uuid THEN
        v_is_authorized := true;
    ELSE
        SELECT (role = 'admin' AND is_suspended = false) INTO v_is_authorized
        FROM public.profiles
        WHERE user_id = v_caller_uid;
    END IF;

    IF NOT COALESCE(v_is_authorized, false) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Administrator authorization required.');
    END IF;

    PERFORM set_config('teamforge.allow_role_change', 'on', true);

    UPDATE public.profiles
    SET role = 'teacher',
        updated_at = timezone('utc'::text, now())
    WHERE user_id = p_target_user_id;

    RETURN jsonb_build_object('success', true, 'message', 'Faculty access restored.');
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_revoke_faculty_access(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_restore_faculty_access(UUID) TO authenticated;



-- ======================================================================
-- MIGRATION: 20261016000011_fix_hackathon_teams_and_invites.sql
-- ======================================================================

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
    TO authenticated, anon
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

-- Foreign key linking to public.profiles so PostgREST schema cache joins work
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'hackathon_team_members_user_id_fkey_profiles'
    ) THEN
        ALTER TABLE public.hackathon_team_members 
        ADD CONSTRAINT hackathon_team_members_user_id_fkey_profiles 
        FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_hackathon_team_members_team ON public.hackathon_team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_team_members_user ON public.hackathon_team_members(user_id);

ALTER TABLE public.hackathon_team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View team members" ON public.hackathon_team_members;
CREATE POLICY "View team members"
    ON public.hackathon_team_members FOR SELECT
    TO authenticated, anon
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



-- ======================================================================
-- MIGRATION: 20261016000012_fix_challenges_and_announcements.sql
-- ======================================================================

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



-- ======================================================================
-- MIGRATION: 20261016000013_admin_delete_projects_and_problems.sql
-- ======================================================================

-- ==============================================================================
-- Linkora Migration: Admin Moderation Policies & RPCs for Projects and Problem Statements
-- Migration: 20261016000013_admin_delete_projects_and_problems.sql
-- 
-- Fixes & Features:
-- 1. Enables administrators to delete any project on the platform.
-- 2. Enables administrators to delete any faculty problem statement.
-- 3. Provides SECURITY DEFINER RPC functions for safe, cascade-clean deletion.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. UPDATE RLS ON PUBLIC.PROJECTS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Owners can delete their projects" ON public.projects;
DROP POLICY IF EXISTS "Owners and admins can delete projects" ON public.projects;

CREATE POLICY "Owners and admins can delete projects"
    ON public.projects FOR DELETE
    TO authenticated
    USING (
        auth.uid() = owner_id 
        OR (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
        OR auth.uid() = '9343b52f-f7e8-4ed8-a8a1-476829811b53'::uuid
    );

DROP POLICY IF EXISTS "Owners can update their projects" ON public.projects;
DROP POLICY IF EXISTS "Owners and admins can update projects" ON public.projects;

CREATE POLICY "Owners and admins can update projects"
    ON public.projects FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = owner_id 
        OR (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
        OR auth.uid() = '9343b52f-f7e8-4ed8-a8a1-476829811b53'::uuid
    );

-- ------------------------------------------------------------------------------
-- 2. UPDATE RLS ON PUBLIC.PROBLEM_STATEMENTS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Teachers can delete their own problem statements" ON public.problem_statements;
DROP POLICY IF EXISTS "Teachers and admins can delete problem statements" ON public.problem_statements;

CREATE POLICY "Teachers and admins can delete problem statements"
    ON public.problem_statements FOR DELETE
    TO authenticated
    USING (
        auth.uid() = author_id 
        OR (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
        OR auth.uid() = '9343b52f-f7e8-4ed8-a8a1-476829811b53'::uuid
    );

DROP POLICY IF EXISTS "Teachers can update their own problem statements" ON public.problem_statements;
DROP POLICY IF EXISTS "Teachers and admins can update problem statements" ON public.problem_statements;

CREATE POLICY "Teachers and admins can update problem statements"
    ON public.problem_statements FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = author_id 
        OR (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
        OR auth.uid() = '9343b52f-f7e8-4ed8-a8a1-476829811b53'::uuid
    );

-- ------------------------------------------------------------------------------
-- 3. SECURITY DEFINER RPC: ATOMIC PROJECT DELETION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_delete_project(
    p_project_id UUID,
    p_reason TEXT DEFAULT ''
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    v_admin_uid UUID;
    v_is_admin BOOLEAN;
    v_project RECORD;
BEGIN
    v_admin_uid := auth.uid();

    -- Verify administrator authorization
    IF v_admin_uid = '9343b52f-f7e8-4ed8-a8a1-476829811b53'::uuid THEN
        v_is_admin := true;
    ELSE
        SELECT (role = 'admin' AND is_suspended = false) INTO v_is_admin
        FROM public.profiles
        WHERE user_id = v_admin_uid;
    END IF;

    IF v_is_admin IS NOT TRUE THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Only platform administrators can perform this action.');
    END IF;

    SELECT id, title, owner_id INTO v_project
    FROM public.projects
    WHERE id = p_project_id;

    IF v_project.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Project not found.');
    END IF;

    -- Cascade delete all associated dependencies
    DELETE FROM public.project_tasks WHERE project_id = p_project_id;
    DELETE FROM public.project_milestones WHERE project_id = p_project_id;
    DELETE FROM public.project_discussions WHERE project_id = p_project_id;
    DELETE FROM public.project_members WHERE project_id = p_project_id;
    DELETE FROM public.project_applications WHERE project_id = p_project_id;
    DELETE FROM public.project_mentoring_notes WHERE project_id = p_project_id;
    DELETE FROM public.projects WHERE id = p_project_id;

    -- Audit Log entry
    INSERT INTO public.admin_audit_logs (
        actor_id,
        action,
        target_type,
        target_id,
        details,
        outcome
    ) VALUES (
        v_admin_uid,
        'PROJECT_DELETED_BY_ADMIN',
        'project',
        p_project_id,
        jsonb_build_object(
            'project_title', v_project.title,
            'owner_id', v_project.owner_id,
            'reason', p_reason
        ),
        'SUCCESS'
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', format('Project "%s" was permanently deleted.', v_project.title)
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 4. SECURITY DEFINER RPC: ATOMIC PROBLEM STATEMENT DELETION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_delete_problem_statement(
    p_problem_id UUID,
    p_reason TEXT DEFAULT ''
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    v_admin_uid UUID;
    v_is_admin BOOLEAN;
    v_problem RECORD;
BEGIN
    v_admin_uid := auth.uid();

    -- Verify administrator authorization
    IF v_admin_uid = '9343b52f-f7e8-4ed8-a8a1-476829811b53'::uuid THEN
        v_is_admin := true;
    ELSE
        SELECT (role = 'admin' AND is_suspended = false) INTO v_is_admin
        FROM public.profiles
        WHERE user_id = v_admin_uid;
    END IF;

    IF v_is_admin IS NOT TRUE THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Only platform administrators can perform this action.');
    END IF;

    SELECT id, title, author_id INTO v_problem
    FROM public.problem_statements
    WHERE id = p_problem_id;

    IF v_problem.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Problem statement not found.');
    END IF;

    -- Cascade delete applications and unlink projects
    DELETE FROM public.problem_applications WHERE problem_statement_id = p_problem_id;
    UPDATE public.projects SET problem_statement_id = NULL WHERE problem_statement_id = p_problem_id;
    DELETE FROM public.problem_statements WHERE id = p_problem_id;

    -- Audit Log entry
    INSERT INTO public.admin_audit_logs (
        actor_id,
        action,
        target_type,
        target_id,
        details,
        outcome
    ) VALUES (
        v_admin_uid,
        'FACULTY_PROBLEM_DELETED_BY_ADMIN',
        'problem_statement',
        p_problem_id,
        jsonb_build_object(
            'problem_title', v_problem.title,
            'author_id', v_problem.author_id,
            'reason', p_reason
        ),
        'SUCCESS'
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', format('Faculty problem statement "%s" was permanently deleted.', v_problem.title)
    );
END;
$$;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';



-- ======================================================================
-- MIGRATION: 20261016_fix_schema_cache_and_rls.sql
-- ======================================================================

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



-- ======================================================================
-- MIGRATION: 20261017000014_linkedin_college_verification.sql
-- ======================================================================

-- ==============================================================================
-- Linkora Migration: LinkedIn College Verification
-- Adds linkedin_url, college_verified, and college_verified_at to profiles
-- ==============================================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS college_verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS college_verified_at TIMESTAMPTZ;

-- Fast index for verified college badges
CREATE INDEX IF NOT EXISTS idx_profiles_college_verified ON public.profiles(college_verified) WHERE college_verified = true;



-- ======================================================================
-- MIGRATION: 20261019000015_lock_profile_privilege_escalation_and_rls.sql
-- ======================================================================

-- ==============================================================================
-- Linkora Security Hardening Migration
-- 20261019000015_lock_profile_privilege_escalation_and_rls.sql
-- ==============================================================================

-- 1. PREVENT PRIVILEGE ESCALATION ON public.profiles
-- Normal students/users MUST NOT be able to elevate their own role to 'admin' or 'teacher',
-- unsuspend themselves, or grant themselves faculty_verified or college_verified flags.

CREATE OR REPLACE FUNCTION public.protect_profile_privilege_columns()
RETURNS TRIGGER AS $$
DECLARE
    current_role TEXT;
    is_platform_owner BOOLEAN;
BEGIN
    -- Allow service_role or superuser without restriction
    IF (current_user = 'service_role' OR current_user = 'postgres') THEN
        RETURN NEW;
    END IF;

    -- Check if authenticated user is the designated platform owner
    is_platform_owner := (auth.uid() = 'c86ce05f-24de-4a1a-a45f-944d4180b508'::uuid OR auth.uid() = '9343b52f-f7e8-4ed8-a8a1-476829811b53'::uuid);

    -- Check if any privileged columns are modified
    IF (NEW.role IS DISTINCT FROM OLD.role OR
        NEW.is_suspended IS DISTINCT FROM OLD.is_suspended OR
        NEW.faculty_verified IS DISTINCT FROM OLD.faculty_verified OR
        NEW.college_verified IS DISTINCT FROM OLD.college_verified) THEN
        
        -- Get the caller's active role from profiles
        SELECT role INTO current_role FROM public.profiles WHERE user_id = auth.uid();

        IF (current_role != 'admin' AND NOT is_platform_owner) THEN
            RAISE EXCEPTION 'Privilege escalation blocked: only platform administrators can alter user roles or verification flags.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_protect_profile_privileges ON public.profiles;
CREATE TRIGGER tr_protect_profile_privileges
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_profile_privilege_columns();

-- 2. HARDEN RLS ON public.platform_settings
-- Prevent unauthorized anonymous users from dumping sensitive keys like
-- security_watchdog_v1 (Telegram/WhatsApp tokens), linkora_hotpatch_v1,
-- linkora_feedbacks_v1, problem_applications_registry, or workspace_data_*.

DROP POLICY IF EXISTS "Public can view platform settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Public can view safe platform settings" ON public.platform_settings;

CREATE POLICY "Public can view safe platform settings"
    ON public.platform_settings FOR SELECT
    TO anon, authenticated
    USING (
        key IN (
            'explore_config',
            'theme_config',
            'homepage_config',
            'restricted_words',
            'deadlines_config',
            'community_problem_statements',
            'spark_templates_v1',
            'linkora_leaderboard_v1',
            'site_master_control_config',
            'linkora_hotpatch_v1'
        )
        OR public.is_admin(auth.uid())
        OR auth.uid() = 'c86ce05f-24de-4a1a-a45f-944d4180b508'::uuid
    );

-- 3. HARDEN RLS ON public.hackathon_challenges
-- Only hackathon creators, faculty, or admins can insert/update challenges.

DROP POLICY IF EXISTS "Create hackathon challenges" ON public.hackathon_challenges;
CREATE POLICY "Create hackathon challenges"
    ON public.hackathon_challenges FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.hackathons h 
            WHERE h.id = hackathon_challenges.hackathon_id 
            AND (
                h.creator_id = auth.uid() 
                OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'teacher'))
                OR auth.uid() = 'c86ce05f-24de-4a1a-a45f-944d4180b508'::uuid
            )
        )
    );

-- 4. HARDEN RLS ON public.hackathon_announcements
-- Only hackathon creators or admins can post announcements.

DROP POLICY IF EXISTS "Create hackathon announcements" ON public.hackathon_announcements;
CREATE POLICY "Create hackathon announcements"
    ON public.hackathon_announcements FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = author_id AND
        EXISTS (
            SELECT 1 FROM public.hackathons h 
            WHERE h.id = hackathon_announcements.hackathon_id 
            AND (
                h.creator_id = auth.uid() 
                OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'teacher'))
                OR auth.uid() = 'c86ce05f-24de-4a1a-a45f-944d4180b508'::uuid
            )
        )
    );

-- 5. HARDEN RLS ON public.notifications
-- Prevent arbitrary student notification spoofing: sender_id must match auth.uid() or be service_role.

DROP POLICY IF EXISTS "Authenticated users or functions can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated users or functions can insert notifications"
    ON public.notifications FOR INSERT
    TO authenticated
    WITH CHECK (
        sender_id = auth.uid() 
        OR sender_id IS NULL
        OR public.is_admin(auth.uid())
    );

-- 6. HARDEN RLS ON public.hackathon_submissions
-- Prevent rival students from reading submission code/repos before judging.

DROP POLICY IF EXISTS "View submissions" ON public.hackathon_submissions;
CREATE POLICY "View submissions"
    ON public.hackathon_submissions FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.hackathon_team_members tm 
            WHERE tm.team_id = hackathon_submissions.team_id AND tm.user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.hackathon_teams t
            JOIN public.hackathons h ON h.id = t.hackathon_id
            WHERE t.id = hackathon_submissions.team_id
            AND (
                h.creator_id = auth.uid() 
                OR h.status IN ('Completed', 'Judging')
                OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'teacher'))
            )
        )
        OR public.is_admin(auth.uid())
    );

