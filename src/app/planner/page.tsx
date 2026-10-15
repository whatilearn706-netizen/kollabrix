'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import { ProtectedPageGuard } from '@/components/auth/ProtectedPageGuard';
import { Project } from '@/types/database';
import { AIProjectPlanner } from '@/components/planner/AIProjectPlanner';
import { Bot, Briefcase, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function StandalonePlannerPage() {
  const { user } = useAuth();
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('scratch');

  useEffect(() => {
    async function loadProjects() {
      if (!user || !isSupabaseConfigured()) return;
      try {
        const { data } = await supabase
          .from('projects')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });

        if (data) {
          setUserProjects(data as Project[]);
        }
      } catch (e) {
        console.warn('Error loading user projects:', e);
      }
    }
    loadProjects();
  }, [user]);

  const activeProject = userProjects.find((p) => p.id === selectedProjectId);

  return (
    <ProtectedPageGuard
      actionTitle="Sign In to Use AI Project Planner"
      actionDescription="You need an active student or educator account to plan projects and generate engineering roadmaps."
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-indigo-400 uppercase tracking-wider mb-2">
              <Bot className="w-4 h-4" />
              <span>Intelligent Roadmap Generator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AI Project Planner
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
              Turn any project idea into an actionable development plan. Generate scoped milestones, prioritized task lists, and suggested team roles.
            </p>
          </div>

          <Link href="/projects/new">
            <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-xs font-semibold text-white border border-charcoal-700 transition-colors">
              <PlusCircle className="w-4 h-4 text-brand-400" />
              <span>Start New Project</span>
            </button>
          </Link>
        </div>

        {/* Project Selector if user has existing projects */}
        {userProjects.length > 0 && (
          <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-750 flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-brand-400" />
              Plan for Project:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedProjectId('scratch')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  selectedProjectId === 'scratch'
                    ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                    : 'bg-charcoal-850 text-slate-400 border-charcoal-750 hover:text-white'
                }`}
              >
                + Plan From Scratch
              </button>
              {userProjects.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedProjectId(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    selectedProjectId === p.id
                      ? 'bg-brand-500/20 text-brand-300 border-brand-500/50'
                      : 'bg-charcoal-850 text-slate-400 border-charcoal-750 hover:text-white'
                  }`}
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>
        )}

        <AIProjectPlanner key={activeProject?.id || 'scratch'} project={activeProject} />
      </div>
    </ProtectedPageGuard>
  );
}
