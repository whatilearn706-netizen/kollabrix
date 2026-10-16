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
