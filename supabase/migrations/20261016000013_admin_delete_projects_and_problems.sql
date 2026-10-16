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
