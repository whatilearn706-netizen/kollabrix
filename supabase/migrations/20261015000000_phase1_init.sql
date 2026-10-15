-- ==============================================================================
-- TeamForge Phase 1 Supabase Database Migration (Safe & Idempotent)
-- ==============================================================================

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    college TEXT,
    course TEXT,
    academic_year TEXT,
    skills TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    interests TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    preferred_roles TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    github_url TEXT,
    portfolio_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
    CONSTRAINT username_format CHECK (username ~* '^[a-zA-Z0-9_-]+$')
);

-- 2. Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
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
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    technologies TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    required_skills TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    desired_roles TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    current_team_size INTEGER NOT NULL DEFAULT 1 CHECK (current_team_size >= 1),
    desired_team_size INTEGER NOT NULL DEFAULT 4 CHECK (desired_team_size >= current_team_size),
    status TEXT NOT NULL DEFAULT 'Recruiting' CHECK (status IN ('Recruiting', 'In Progress', 'Completed')),
    repository_url TEXT,
    demo_url TEXT,
    application_deadline DATE,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT title_length CHECK (char_length(title) >= 3 AND char_length(title) <= 120),
    CONSTRAINT summary_length CHECK (char_length(summary) >= 10 AND char_length(summary) <= 280)
);

-- 3. Helpful Indexes for Search and Filter Performance
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_difficulty ON public.projects(difficulty);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_technologies ON public.projects USING GIN(technologies);
CREATE INDEX IF NOT EXISTS idx_projects_required_skills ON public.projects USING GIN(required_skills);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_skills ON public.profiles USING GIN(skills);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 5. Profiles RLS Policies (Safely drop if exists, then recreate)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.profiles FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
CREATE POLICY "Users can create their own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
CREATE POLICY "Users can delete their own profile" 
    ON public.profiles FOR DELETE 
    USING (auth.uid() = user_id);

-- 6. Projects RLS Policies (Safely drop if exists, then recreate)
DROP POLICY IF EXISTS "Projects are viewable by everyone" ON public.projects;
CREATE POLICY "Projects are viewable by everyone" 
    ON public.projects FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can create projects" ON public.projects;
CREATE POLICY "Authenticated users can create projects" 
    ON public.projects FOR INSERT 
    WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update their projects" ON public.projects;
CREATE POLICY "Owners can update their projects" 
    ON public.projects FOR UPDATE 
    USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can delete their projects" ON public.projects;
CREATE POLICY "Owners can delete their projects" 
    ON public.projects FOR DELETE 
    USING (auth.uid() = owner_id);

-- 7. Trigger to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_projects_updated_at ON public.projects;
CREATE TRIGGER set_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 8. Trigger to create a starter profile when a user registers via auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    initial_username TEXT;
    initial_display_name TEXT;
    counter INT := 0;
BEGIN
    initial_display_name := COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1), 'Student');
    initial_username := LOWER(REGEXP_REPLACE(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9_]', '', 'g'));
    
    IF initial_username IS NULL OR char_length(initial_username) < 3 THEN
        initial_username := 'student_' || substr(md5(random()::text), 1, 6);
    END IF;

    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = initial_username) LOOP
        counter := counter + 1;
        initial_username := LOWER(REGEXP_REPLACE(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9_]', '', 'g')) || counter::text;
    END LOOP;

    INSERT INTO public.profiles (
        user_id,
        username,
        display_name,
        avatar_url,
        bio,
        skills,
        interests,
        preferred_roles
    ) VALUES (
        NEW.id,
        initial_username,
        initial_display_name,
        NEW.raw_user_meta_data->>'avatar_url',
        'College student excited to collaborate on innovative projects.',
        ARRAY[]::TEXT[],
        ARRAY[]::TEXT[],
        ARRAY[]::TEXT[]
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
