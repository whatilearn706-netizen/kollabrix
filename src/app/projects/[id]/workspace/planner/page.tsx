'use client';

import React from 'react';
import { useWorkspace } from '../layout';
import { AIProjectPlanner } from '@/components/planner/AIProjectPlanner';

export default function WorkspacePlannerPage() {
  const { project, refreshWorkspace } = useWorkspace();

  return (
    <div className="space-y-6">
      <AIProjectPlanner project={project} onPlanApplied={refreshWorkspace} />
    </div>
  );
}
