'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWorkspace } from './layout';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { TeamRole, ProjectMember } from '@/types/database';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import {
  Users,
  ShieldCheck,
  Calendar,
  LogOut,
  UserX,
  Edit2,
  Check,
  AlertTriangle,
  Sparkles,
  Inbox,
  Clock,
  ArrowRight,
} from 'lucide-react';

const TEAM_ROLES: TeamRole[] = [
  'Project Lead',
  'Frontend Developer',
  'Backend Developer',
  'Full-Stack Developer',
  'AI/ML Engineer',
  'UI/UX Designer',
  'Researcher',
  'Contributor',
];

export default function WorkspaceOverviewPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { project, members, isOwner, isLead, currentUserMember, refreshWorkspace } = useWorkspace();

  // Role editing state
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<TeamRole>('Contributor');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // Leave / Remove modals
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [removingMember, setRemovingMember] = useState<ProjectMember | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleStartEditRole = (member: ProjectMember) => {
    setEditingMemberId(member.id);
    setSelectedRole(member.role);
    setActionError(null);
  };

  const handleSaveRole = async (memberId: string) => {
    setIsUpdatingRole(true);
    setActionError(null);

    try {
      const { error } = await supabase
        .from('project_members')
        .update({ role: selectedRole })
        .eq('id', memberId)
        .eq('project_id', project.id);

      if (error) {
        setActionError(error.message || 'Could not update role.');
      } else {
        setEditingMemberId(null);
        await refreshWorkspace();
      }
    } catch {
      setActionError('Failed to update member role.');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (isOwner) {
      alert('As the project owner, you cannot leave the project without transferring ownership or deleting the project.');
      return;
    }

    if (!user) return;

    setIsLeaving(true);
    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', project.id)
        .eq('user_id', user.id);

      if (error) {
        alert(error.message || 'Failed to leave team.');
        setIsLeaving(false);
      } else {
        router.push('/my-projects');
      }
    } catch {
      alert('Error leaving team.');
      setIsLeaving(false);
    }
  };

  const handleConfirmRemoveMember = async () => {
    if (!removingMember) return;
    setIsRemoving(true);
    setActionError(null);

    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('id', removingMember.id)
        .eq('project_id', project.id);

      if (error) {
        setActionError(error.message || 'Failed to remove member.');
      } else {
        setRemovingMember(null);
        await refreshWorkspace();
      }
    } catch {
      setActionError('Error removing member.');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Project Overview Card */}
        <div className="md:col-span-2 rounded-2xl bg-charcoal-900 border border-charcoal-750/80 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>Project Mission & Scope</span>
            </h2>
            <Badge variant="status" status={project.status} />
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {project.description}
          </p>

          <div className="pt-3 border-t border-charcoal-800 flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-brand-400" />
              <span>
                Team: <strong>{members.length} active</strong> (Target: {project.desired_team_size})
              </span>
            </div>
            {project.application_deadline && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>
                  Deadline: <strong className="text-amber-300">{project.application_deadline}</strong>
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>
                Created:{' '}
                {project.created_at
                  ? new Date(project.created_at).toLocaleDateString()
                  : 'Recently'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions & Workspace Status */}
        <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750/80 p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              <span>Your Membership</span>
            </h2>

            <div className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Assigned Role:</span>
                <span className="font-semibold text-emerald-300">
                  {currentUserMember?.role || (isOwner ? 'Project Lead' : 'Contributor')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Access Level:</span>
                <span className="font-semibold text-slate-200">
                  {isOwner ? 'Project Owner' : isLead ? 'Workspace Lead' : 'Team Member'}
                </span>
              </div>
            </div>

            {isOwner && (
              <Link href={`/projects/${project.id}/applications`} className="block">
                <Button variant="outline" size="sm" className="w-full justify-center" leftIcon={<Inbox className="w-4 h-4 text-brand-400" />}>
                  Manage Candidate Applications
                </Button>
              </Link>
            )}
          </div>

          <div className="pt-4 border-t border-charcoal-800">
            {!isOwner && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLeaveModalOpen(true)}
                className="w-full justify-center text-red-400 border-red-500/30 hover:bg-red-500/10"
                leftIcon={<LogOut className="w-4 h-4" />}
              >
                Leave Team
              </Button>
            )}

            {isOwner && (
              <p className="text-[11px] text-slate-500 text-center italic">
                Project owner cannot leave without deleting or transferring ownership.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Team Roster Section */}
      <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750/80 p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-400" />
              <span>Team Roster ({members.length})</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Active collaborators with secure workspace permissions.
            </p>
          </div>

          {isLead && (
            <span className="text-[11px] px-2.5 py-1 rounded-lg bg-charcoal-800 text-slate-300 border border-charcoal-700">
              💡 As Lead/Owner, you can assign roles & manage members
            </span>
          )}
        </div>

        {actionError && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
            {actionError}
          </div>
        )}

        {members.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-white">No Team Members Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Review applicant submissions to accept new students into your workspace.
            </p>
            {isOwner && (
              <Link href={`/projects/${project.id}/applications`}>
                <Button variant="primary" size="sm">
                  View Applications
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member) => {
              const profile = member.profile;
              const name = profile?.display_name || 'Student Member';
              const username = profile?.username;
              const isMemberOwner = member.user_id === project.owner_id;
              const isMe = member.user_id === user?.id;
              const isEditing = editingMemberId === member.id;

              return (
                <div
                  key={member.id}
                  className="rounded-xl bg-charcoal-850 border border-charcoal-750 p-4 space-y-3 flex flex-col justify-between hover:border-charcoal-700 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={name} src={profile?.avatar_url} size="md" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-sm font-bold text-white truncate">{name}</h3>
                          {isMe && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-charcoal-750 text-slate-300 font-mono">
                              You
                            </span>
                          )}
                          {isMemberOwner && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-500/20 text-brand-300 font-semibold border border-brand-500/30">
                              Owner
                            </span>
                          )}
                        </div>
                        {username && (
                          <Link
                            href={`/profile/${username}`}
                            target="_blank"
                            className="text-xs text-slate-400 hover:text-brand-400 font-mono transition-colors block truncate"
                          >
                            @{username}
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Role Display or Editing */}
                    {!isEditing && (
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-950/40 text-indigo-300 border border-indigo-800/40 font-medium shrink-0">
                        {member.role}
                      </span>
                    )}
                  </div>

                  {/* Skills preview */}
                  {profile?.skills && profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {profile.skills.slice(0, 4).map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded bg-charcoal-800 text-slate-300 border border-charcoal-700"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Role Editor Controls */}
                  {isEditing ? (
                    <div className="pt-2 border-t border-charcoal-750 space-y-2">
                      <Select
                        label="Assign Role"
                        options={TEAM_ROLES.map((r) => ({ value: r, label: r }))}
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as TeamRole)}
                      />
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingMemberId(null)}
                          disabled={isUpdatingRole}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSaveRole(member.id)}
                          isLoading={isUpdatingRole}
                          leftIcon={<Check className="w-3.5 h-3.5" />}
                        >
                          Save Role
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Lead Actions (Edit Role / Remove Member) */
                    isLead && !isMemberOwner && (
                      <div className="pt-2 border-t border-charcoal-750/80 flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartEditRole(member)}
                          leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                        >
                          Change Role
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRemovingMember(member)}
                          className="text-red-400 border-red-500/25 hover:bg-red-500/10"
                          leftIcon={<UserX className="w-3.5 h-3.5" />}
                        >
                          Remove
                        </Button>
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Leave Team Confirmation Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-charcoal-900 border border-charcoal-750 p-6 shadow-elevated space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <LogOut className="w-5 h-5 text-red-400" />
              <span>Leave Team Workspace?</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to leave <strong>{project.title}</strong>? You will lose access to the private workspace, tasks, and discussion channels immediately.
            </p>
            <div className="pt-2 flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLeaveModalOpen(false)}
                disabled={isLeaving}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleLeaveTeam}
                isLoading={isLeaving}
              >
                Confirm & Leave
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation Modal */}
      {removingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-charcoal-900 border border-charcoal-750 p-6 shadow-elevated space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <UserX className="w-5 h-5 text-red-400" />
              <span>Remove Team Member?</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to remove{' '}
              <strong>{removingMember.profile?.display_name || 'this member'}</strong> from the team?
              Their workspace access will be revoked immediately, but their past tasks and contributions will be preserved.
            </p>
            <div className="pt-2 flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRemovingMember(null)}
                disabled={isRemoving}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmRemoveMember}
                isLoading={isRemoving}
              >
                Remove from Team
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
