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

-- 14. Policies for project_tasks (Private Workspace)
DROP POLICY IF EXISTS "Workspace members can view tasks" ON public.project_tasks;
CREATE POLICY "Workspace members can view tasks"
    ON public.project_tasks FOR SELECT
    USING (public.is_project_member(project_id, auth.uid()));

DROP POLICY IF EXISTS "Workspace members can create tasks" ON public.project_tasks;
CREATE POLICY "Workspace members can create tasks"
    ON public.project_tasks FOR INSERT
    WITH CHECK (
        public.is_project_member(project_id, auth.uid()) 
        AND auth.uid() = creator_id
    );

DROP POLICY IF EXISTS "Workspace members can update tasks" ON public.project_tasks;
CREATE POLICY "Workspace members can update tasks"
    ON public.project_tasks FOR UPDATE
    USING (public.is_project_member(project_id, auth.uid()));

DROP POLICY IF EXISTS "Creators or leads can delete tasks" ON public.project_tasks;
CREATE POLICY "Creators or leads can delete tasks"
    ON public.project_tasks FOR DELETE
    USING (
        auth.uid() = creator_id 
        OR public.is_project_lead(project_id, auth.uid())
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
