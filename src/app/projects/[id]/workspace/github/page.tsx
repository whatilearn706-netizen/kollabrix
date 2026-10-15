'use client';

import React from 'react';
import { useWorkspace } from '../layout';
import { GithubActivitySection } from '@/components/github/GithubActivitySection';

export default function WorkspaceGithubPage() {
  const { project, isOwner, isLead } = useWorkspace();

  return (
    <div className="space-y-6">
      <GithubActivitySection
        repositoryUrl={project.repository_url}
        projectId={project.id}
        isOwnerOrLead={isOwner || isLead}
      />
    </div>
  );
}
