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
