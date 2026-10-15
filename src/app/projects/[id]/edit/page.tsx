'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { Project } from '@/types/database';
import { ProtectedPageGuard } from '@/components/auth/ProtectedPageGuard';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { Button } from '@/components/ui/Button';
import { Edit3, ArrowLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = params?.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProject() {
      setIsLoading(true);
      setError(null);

      if (!isSupabaseConfigured()) {
        setError('Database connection required to edit live projects.');
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: dbError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (dbError || !data) {
          setError('Project could not be found.');
        } else {
          setProject(data as Project);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error loading project.');
      } finally {
        setIsLoading(false);
      }
    }

    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  return (
    <ProtectedPageGuard
      actionTitle="Sign In to Edit Project"
      actionDescription="You must be signed in as the project owner to modify project details."
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {isLoading ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-mono">Loading project data...</p>
          </div>
        ) : error || !project ? (
          <div className="rounded-2xl bg-charcoal-900 border border-charcoal-800 p-8 text-center space-y-4">
            <h2 className="text-lg font-bold text-white">Cannot Edit Project</h2>
            <p className="text-xs text-slate-400">{error || 'Project not found.'}</p>
            <Link href="/explore">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Return to Directory
              </Button>
            </Link>
          </div>
        ) : user?.id !== project.owner_id ? (
          /* Authorization guard: Not the owner! */
          <div className="rounded-2xl bg-charcoal-900 border border-red-500/30 p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Unauthorized Action</h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
              Only the student who published this project idea has permission to edit its specifications.
            </p>
            <Link href={`/projects/${project.id}`}>
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                View Project Details
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b border-charcoal-800 pb-6">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-brand-400 uppercase tracking-wider mb-2">
                <Edit3 className="w-4 h-4" />
                <span>Project Management</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Edit &ldquo;{project.title}&rdquo;
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Update your problem statement, adjust open roles, or revise team size.
              </p>
            </div>

            <ProjectForm initialData={project} isEditing={true} />
          </>
        )}
      </div>
    </ProtectedPageGuard>
  );
}
