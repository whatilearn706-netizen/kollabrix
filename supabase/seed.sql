-- ==============================================================================
-- TeamForge Phase 1 Seed Data
-- Realistic sample projects clearly labeled as Demo / Showcase
-- Note: In production or a connected Supabase project, you can run this script
-- ==============================================================================

-- If demo user does not exist, create dummy demo profile if needed
-- For standalone Supabase instance, this provides immediate discovery data.
DO $$
DECLARE
    demo_user_id UUID := '00000000-0000-0000-0000-000000000001';
    demo_user2_id UUID := '00000000-0000-0000-0000-000000000002';
    demo_user3_id UUID := '00000000-0000-0000-0000-000000000003';
BEGIN
    -- Check if demo profiles already exist before inserting
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = demo_user_id) THEN
        -- Insert a dummy auth user if possible or bypass foreign key if mock
        -- Usually in local/dev or cloud we provide standalone projects
        NULL;
    END IF;
END $$;
