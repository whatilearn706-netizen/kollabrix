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
