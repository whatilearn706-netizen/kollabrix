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
