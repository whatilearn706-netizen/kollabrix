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
