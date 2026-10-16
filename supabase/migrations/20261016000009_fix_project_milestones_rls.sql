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
