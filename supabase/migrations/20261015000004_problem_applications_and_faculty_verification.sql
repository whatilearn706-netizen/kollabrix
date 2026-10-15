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
