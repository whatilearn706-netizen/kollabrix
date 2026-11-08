-- Migration: 20261108000001_add_challenge_id_to_teams.sql
-- Add challenge_id column to hackathon_teams if it does not already exist

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'hackathon_teams'
          AND column_name = 'challenge_id'
    ) THEN
        ALTER TABLE public.hackathon_teams 
        ADD COLUMN challenge_id UUID REFERENCES public.hackathon_challenges(id) ON DELETE SET NULL;
    END IF;
END $$;
