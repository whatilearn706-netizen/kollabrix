'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  UserX,
  UserCheck,
  FolderGit2,
  Trophy,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { AdminUserListItem } from '@/types/database';
import { VerifiedCollegeBadge } from '@/components/profile/VerifiedCollegeBadge';

interface AdminUsersTabProps {
  currentAdminId?: string;
  authToken?: string;
}

export function AdminUsersTab({ currentAdminId, authToken }: AdminUsersTabProps) {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Selected User for Detail / Moderation
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(null);

  // Action Modals State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isRemoveAllModalOpen, setIsRemoveAllModalOpen] = useState(false);
  const [isRemoveProjectModalOpen, setIsRemoveProjectModalOpen] = useState<{
    isOpen: boolean;
    projectId?: string;
    projectTitle?: string;
  }>({ isOpen: false });

  const [moderationReason, setModerationReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setActionMessage(null);
    try {
      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch(
        `/api/admin/users?page=${page}&limit=10&search=${encodeURIComponent(search)}&role=${roleFilter}&status=${statusFilter}`,
        { headers }
      );
      const data = await res.json();
      if (res.ok && data.users) {
        setUsers(data.users);
        setTotalPages(data.pagination.totalPages || 1);
        setTotalCount(data.pagination.total || 0);
      }
    } catch (err) {
      console.warn('Error loading users:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, roleFilter, statusFilter, authToken]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle Moderation Action
  const executeModeration = async (
    action: 'suspend' | 'restore' | 'remove_from_project' | 'remove_from_all_teams',
    extraPayload: Record<string, any> = {}
  ) => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    setActionMessage(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/admin/users/moderate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action,
          targetUserId: selectedUser.user_id,
          reason: moderationReason,
          ...extraPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Moderation action failed');
      }

      setActionMessage({ type: 'success', text: data.message || 'Action executed successfully.' });
      setModerationReason('');
      setIsSuspendModalOpen(false);
      setIsRemoveAllModalOpen(false);
      setIsRemoveProjectModalOpen({ isOpen: false });
      setIsDetailModalOpen(false);
      await fetchUsers();
    } catch (err: unknown) {
      setActionMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error executing moderation.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900 p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search users by name, username, or college..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              leftIcon={<Search className="w-4 h-4" />}
              rightIcon={
                search ? (
                  <button onClick={() => setSearch('')} className="p-1 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                ) : undefined
              }
            />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="w-36">
              <Select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                options={[
                  { value: 'all', label: 'All Roles' },
                  { value: 'student', label: 'Students' },
                  { value: 'teacher', label: 'Faculty / Mentors' },
                  { value: 'admin', label: 'Administrators' },
                ]}
              />
            </div>

            <div className="w-36">
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active Only' },
                  { value: 'suspended', label: 'Suspended Only' },
                ]}
              />
            </div>
          </div>
        </div>

        {actionMessage && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center justify-between gap-2 border ${
              actionMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            <span>{actionMessage.text}</span>
            <button onClick={() => setActionMessage(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Users Moderation Table */}
      <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-charcoal-800/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-charcoal-750">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Campus & Course</th>
                <th className="py-3.5 px-4 text-center">Projects Owned</th>
                <th className="py-3.5 px-4 text-center">Team Memberships</th>
                <th className="py-3.5 px-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No users found matching active criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isCurrentAdmin = u.user_id === currentAdminId;
                  return (
                    <tr key={u.user_id} className="hover:bg-charcoal-850/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-charcoal-800 border border-charcoal-700 flex items-center justify-center font-bold text-brand-400 shrink-0">
                            {u.display_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              {u.display_name}
                              {isCurrentAdmin && (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-brand-500/20 text-brand-300">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">@{u.username}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                            u.role === 'admin'
                              ? 'bg-red-500/10 border-red-500/30 text-red-300'
                              : u.role === 'teacher'
                              ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                              : 'bg-charcoal-800 border-charcoal-700 text-slate-300'
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            u.is_suspended
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          }`}
                        >
                          {u.is_suspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-300 truncate max-w-[180px]">
                          {u.college || '—'}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                          {u.course || '—'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono">
                        {u.owned_projects_count}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono">
                        {u.memberships_count + u.hackathon_teams_count}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(u);
                            setIsDetailModalOpen(true);
                          }}
                        >
                          Inspect & Teams
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-charcoal-850/40 border-t border-charcoal-750 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <strong className="text-white">{users.length}</strong> of{' '}
            <strong className="text-white">{totalCount}</strong> users
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Previous
            </Button>
            <span className="font-mono text-xs text-slate-300">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* USER DETAILS & TEAM MODERATION MODAL */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`User Governance: ${selectedUser?.display_name || ''}`}
        maxWidth="lg"
      >
        {selectedUser && (
          <div className="space-y-6 text-xs">
            {/* Header info */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-charcoal-850 border border-charcoal-750">
              <div className="space-y-0.5">
                <div className="font-bold text-white text-sm">
                  {selectedUser.display_name} (@{selectedUser.username})
                </div>
                <div className="text-slate-400">
                  {selectedUser.college ? (
                    <VerifiedCollegeBadge
                      college={selectedUser.college}
                      isVerified={selectedUser.college_verified}
                      size="xs"
                    />
                  ) : (
                    'Collegiate Student'
                  )}
                </div>
                {selectedUser.suspension_reason && (
                  <div className="text-amber-400 font-mono text-[11px] pt-1">
                    Suspension Notice: {selectedUser.suspension_reason}
                  </div>
                )}
              </div>

              {/* Suspension Action Button */}
              {selectedUser.user_id !== currentAdminId && (
                <div>
                  {selectedUser.is_suspended ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => executeModeration('restore')}
                      disabled={isSubmitting}
                      leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                    >
                      Restore Account
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSuspendModalOpen(true)}
                      className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
                      leftIcon={<UserX className="w-3.5 h-3.5" />}
                    >
                      Suspend Account
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Owned Projects (Safe preservation notice) */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FolderGit2 className="w-4 h-4 text-brand-400" />
                Owned Projects ({selectedUser.owned_projects?.length || 0})
              </h4>
              {(selectedUser.owned_projects?.length || 0) === 0 ? (
                <p className="text-slate-500 italic p-3 rounded-lg bg-charcoal-850/50">
                  No projects created by this user.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {selectedUser.owned_projects?.map((proj) => (
                    <div
                      key={proj.id}
                      className="p-3 rounded-xl bg-charcoal-850/60 border border-charcoal-750 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-white">{proj.title}</span>
                        <span className="ml-2 text-[10px] font-mono text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded">
                          {proj.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 italic">
                        Owner (Preserved on member removals)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Project Team Memberships (Removal without deleting project) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Collaborative Project Memberships ({selectedUser.memberships?.length || 0})
                </h4>
                {(selectedUser.memberships?.length || 0) > 0 && selectedUser.user_id !== currentAdminId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsRemoveAllModalOpen(true)}
                    className="border-red-500/40 text-red-300 hover:bg-red-500/10 text-[11px]"
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Remove From ALL Teams
                  </Button>
                )}
              </div>

              {(selectedUser.memberships?.length || 0) === 0 ? (
                <p className="text-slate-500 italic p-3 rounded-lg bg-charcoal-850/50">
                  User is not currently an active member of external project teams.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {selectedUser.memberships?.map((mem) => (
                    <div
                      key={mem.id}
                      className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-white">{mem.project_title}</span>
                        <span className="ml-2 text-[10px] font-mono text-slate-400 bg-charcoal-800 px-1.5 py-0.5 rounded">
                          Role: {mem.role}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setIsRemoveProjectModalOpen({
                            isOpen: true,
                            projectId: mem.project_id,
                            projectTitle: mem.project_title,
                          })
                        }
                        className="text-[11px] border-charcoal-700 hover:border-red-500/50 hover:text-red-300"
                      >
                        Remove from this project
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hackathon Team Memberships */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                Hackathon Teams ({selectedUser.hackathon_teams?.length || 0})
              </h4>
              {(selectedUser.hackathon_teams?.length || 0) === 0 ? (
                <p className="text-slate-500 italic p-3 rounded-lg bg-charcoal-850/50">
                  User is not currently registered on a hackathon team.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {selectedUser.hackathon_teams?.map((ht) => (
                    <div
                      key={ht.id}
                      className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-white">{ht.team_name}</span>
                        <span className="ml-2 text-[10px] text-slate-400">
                          in {ht.hackathon_title} ({ht.role})
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          executeModeration('remove_from_project', { teamId: ht.id })
                        }
                        className="text-[11px] border-charcoal-700 hover:border-red-500/50 hover:text-red-300"
                      >
                        Remove from team
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* SUSPEND USER CONFIRMATION MODAL */}
      <Modal
        isOpen={isSuspendModalOpen}
        onClose={() => setIsSuspendModalOpen(false)}
        title="Suspend Student Account"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
            <div className="leading-relaxed">
              Suspended accounts are strictly blocked server-side from protected platform operations,
              including project creation, applications, discussions, and hackathon submissions.
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Moderation Reason (Required for Audit Log)
            </label>
            <textarea
              className="w-full rounded-xl bg-charcoal-900 border border-charcoal-750 p-3 text-xs text-white focus:outline-none focus:border-brand-500"
              rows={3}
              placeholder="Explain the guideline violation or community report..."
              value={moderationReason}
              onChange={(e) => setModerationReason(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsSuspendModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isSubmitting || !moderationReason.trim()}
              onClick={() => executeModeration('suspend')}
              className="bg-amber-600 hover:bg-amber-500"
            >
              Confirm Account Suspension
            </Button>
          </div>
        </div>
      </Modal>

      {/* REMOVE FROM SINGLE PROJECT CONFIRMATION MODAL */}
      <Modal
        isOpen={isRemoveProjectModalOpen.isOpen}
        onClose={() => setIsRemoveProjectModalOpen({ isOpen: false })}
        title="Remove Member from Project"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-300 leading-relaxed">
            Are you sure you want to remove <strong>@{selectedUser?.username}</strong> from project{' '}
            <strong>&quot;{isRemoveProjectModalOpen.projectTitle}&quot;</strong>?
          </p>
          <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750 text-slate-400">
            ✓ The project itself, milestones, tasks, and other students&apos; contributions remain intact.
            <br />✓ The project team size count will be safely updated.
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsRemoveProjectModalOpen({ isOpen: false })}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              onClick={() =>
                executeModeration('remove_from_project', {
                  projectId: isRemoveProjectModalOpen.projectId,
                })
              }
            >
              Confirm Removal
            </Button>
          </div>
        </div>
      </Modal>

      {/* REMOVE FROM ALL TEAMS CONFIRMATION MODAL (IMPACT ASSESSMENT) */}
      <Modal
        isOpen={isRemoveAllModalOpen}
        onClose={() => setIsRemoveAllModalOpen(false)}
        title="Impact Confirmation: Remove from ALL Teams"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-slate-700 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
            <div className="leading-relaxed">
              <strong className="text-slate-900">Explicit Impact Assessment:</strong> This will remove{' '}
              <strong className="text-slate-900">@{selectedUser?.username}</strong> from{' '}
              <strong className="text-slate-900">{selectedUser?.memberships?.length || 0} collaborative projects</strong> and{' '}
              <strong className="text-slate-900">{selectedUser?.hackathon_teams?.length || 0} hackathon teams</strong>.
            </div>
          </div>

          <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750 text-slate-300 space-y-1">
            <p className="font-semibold text-white">Guaranteed Safeguards:</p>
            <p>• Shared projects and teammate contributions will NOT be deleted.</p>
            <p>• Project owner items remain protected and archived safely.</p>
            <p>• An audit record will be logged with your administrator signature.</p>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Moderation Reason
            </label>
            <input
              type="text"
              className="w-full rounded-xl bg-charcoal-900 border border-charcoal-750 p-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
              placeholder="e.g. Conduct violation / Inactive student cleanup"
              value={moderationReason}
              onChange={(e) => setModerationReason(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsRemoveAllModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              onClick={() => executeModeration('remove_from_all_teams')}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              Execute Team Roster Removal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
