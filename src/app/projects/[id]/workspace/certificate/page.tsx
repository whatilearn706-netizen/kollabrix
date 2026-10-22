'use client';

import React from 'react';
import { useWorkspace } from '../layout';
import { useAuth } from '@/components/auth/AuthProvider';
import { WorkspaceProofOfWork } from '@/components/workspace/WorkspaceProofOfWork';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function WorkspaceProofOfWorkPage() {
  const { user, profile } = useAuth();
  const { project, members, workspaceFeatures } = useWorkspace();

  if (workspaceFeatures && !workspaceFeatures.proofOfWork) {
    return (
      <div className="p-8 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">Module Paused</h3>
        <p className="text-xs text-slate-400">
          The Proof-of-Work Finish Line has been temporarily paused.
        </p>
        <Link href={`/projects/${project.id}/workspace`}>
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Workspace Overview
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <WorkspaceProofOfWork
      project={project}
      members={members}
      currentUserId={user?.id}
      currentUserProfile={profile}
    />
  );
}
