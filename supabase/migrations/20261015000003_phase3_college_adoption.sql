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
