'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Profile, Project } from '@/types/database';
import { DEMO_PROJECTS } from '@/data/mockProjects';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Edit3, FolderKanban, PlusCircle } from 'lucide-react';

export default function PublicProfilePage() {
  const params = useParams();
  const { user } = useAuth();
  const username = (params?.username as string)?.toLowerCase();

  const matchingDemo = DEMO_PROJECTS.find(
    (p) => p.owner?.username?.toLowerCase() === username
  );

  const initialDemoProfile: Profile | null =
    matchingDemo && matchingDemo.owner
      ? {
          user_id: matchingDemo.owner.user_id || 'demo-user',
          username: matchingDemo.owner.username || username,
          display_name: matchingDemo.owner.display_name || 'Student Creator',
          avatar_url: matchingDemo.owner.avatar_url,
          college: matchingDemo.owner.college,
          course: matchingDemo.owner.course,
          academic_year: '3rd Year',
          bio: 'Collegiate innovator and open source contributor passionate about building full-stack products.',
          skills: matchingDemo.required_skills || ['React', 'TypeScript', 'Node.js'],
          interests: ['Web Development', 'AI/ML', 'Hackathons'],
          preferred_roles: matchingDemo.desired_roles || ['Full-Stack Developer'],
          github_url: 'https://github.com',
          portfolio_url: null,
          created_at: matchingDemo.created_at,
          updated_at: matchingDemo.updated_at,
        }
      : null;

  const [profile, setProfile] = useState<Profile | null>(() => initialDemoProfile);
  const [userProjects, setUserProjects] = useState<Project[]>(() =>
    matchingDemo
      ? DEMO_PROJECTS.filter((p) => p.owner?.username?.toLowerCase() === username)
      : []
  );
  const [isLoading, setIsLoading] = useState(() => !Boolean(initialDemoProfile));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfileAndProjects() {
      if (initialDemoProfile) return;
      setIsLoading(true);
      setError(null);

      // Check database
      if (isSupabaseConfigured()) {
        try {
          const { data: profileData, error: profileErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('username', username)
            .single();

          if (profileErr || !profileData) {
            setError('Student profile not found.');
          } else {
            setProfile(profileData as Profile);

            // Fetch projects owned by this student
            const { data: projectsData } = await supabase
              .from('projects')
              .select('*')
              .eq('owner_id', profileData.user_id)
              .order('created_at', { ascending: false });

            if (projectsData) {
              const enriched = projectsData.map((p) => ({
                ...p,
                owner: profileData,
              }));
              setUserProjects(enriched as Project[]);
            }
          }
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : 'Error fetching profile.');
        }
      } else {
        setError('Student profile not found.');
      }
      setIsLoading(false);
    }

    if (username) {
      loadProfileAndProjects();
    }
  }, [username]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-mono">Loading student profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center space-y-4">
        <h2 className="text-lg font-bold text-white">Profile Not Found</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          We couldn&apos;t find a student profile with the username <strong>@{username}</strong>.
        </p>
        <Link href="/explore">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Directory
          </Button>
        </Link>
      </div>
    );
  }

  const isOwner = Boolean(user && user.id === profile.user_id);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore Projects</span>
        </Link>

        {isOwner && (
          <Link href="/settings/profile">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Edit3 className="w-3.5 h-3.5 text-brand-400" />}
            >
              Edit Your Profile
            </Button>
          </Link>
        )}
      </div>

      {/* Main Profile Card */}
      <ProfileCard profile={profile} isOwner={isOwner} />

      {/* Student's Projects Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-charcoal-800 pb-4">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-brand-400" />
            <h2 className="text-lg font-bold text-white">
              Projects by {profile.display_name} ({userProjects.length})
            </h2>
          </div>

          {isOwner && (
            <Link href="/projects/new">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<PlusCircle className="w-3.5 h-3.5 text-brand-400" />}
              >
                Publish New Project
              </Button>
            </Link>
          )}
        </div>

        {userProjects.length === 0 ? (
          <div className="rounded-xl bg-charcoal-900 border border-charcoal-800 p-8 text-center text-xs text-slate-400">
            <p>This student has not published any projects yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userProjects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
