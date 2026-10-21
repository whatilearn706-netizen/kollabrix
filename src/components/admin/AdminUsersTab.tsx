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
  GraduationCap,
  Clock,
  ShieldCheck,
  XCircle,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { AdminUserListItem } from '@/types/database';
import { StudentIdVerification, StudentIdVerificationStats } from '@/types/verification';
import { VerifiedCollegeBadge } from '@/components/profile/VerifiedCollegeBadge';
import { supabase } from '@/lib/supabase/client';

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

  // Active Sub-tab View: 'users' (All Directory) vs 'id_verifications' (Student ID Queue)
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'id_verifications'>('users');

  // Student ID Verification Queue State
  const [idRequests, setIdRequests] = useState<StudentIdVerification[]>([]);
  const [idStats, setIdStats] = useState<StudentIdVerificationStats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [isIdLoading, setIsIdLoading] = useState(false);
  const [idSearch, setIdSearch] = useState('');
  const [idStatusFilter, setIdStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // ID Inspection Lightbox & Rejection Modals
  const [inspectingRequest, setInspectingRequest] = useState<StudentIdVerification | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [customRejectReason, setCustomRejectReason] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);

  const fetchIdVerifications = useCallback(async () => {
    setIsIdLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      } else {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.access_token) {
          headers['Authorization'] = `Bearer ${data.session.access_token}`;
        }
      }

      const res = await fetch('/api/verify/college-id?admin=true', { headers });
      const data = await res.json();
      if (res.ok && data.success) {
        setIdRequests(data.requests || []);
        if (data.stats) setIdStats(data.stats);
      }
    } catch (err) {
      console.warn('Error fetching student ID verifications:', err);
    } finally {
      setIsIdLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    fetchIdVerifications();
  }, [fetchIdVerifications]);

  const handleModerateIdRequest = async (requestId: string, action: 'approve' | 'reject', reason?: string) => {
    setIsSubmitting(true);
    setActionMessage(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      } else {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.access_token) {
          headers['Authorization'] = `Bearer ${data.session.access_token}`;
        }
      }

      const res = await fetch('/api/verify/college-id', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          requestId,
          action,
          rejectionReason: reason,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update verification status.');
      }

      setActionMessage({
        type: 'success',
        text: data.message || `Verification ${action}d successfully.`,
      });

      setIsRejectModalOpen(false);
      setRejectingRequestId(null);
      setCustomRejectReason('');
      if (inspectingRequest?.id === requestId) {
        setInspectingRequest(data.request || null);
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('linkora_college_updated'));
      }

      await fetchIdVerifications();
      await fetchUsers();
    } catch (err: unknown) {
      setActionMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error processing verification.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const handleRemoveCollegeVerification = async (targetUser: AdminUserListItem) => {
    setIsSubmitting(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/verify/linkedin-college', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: targetUser.user_id,
          targetUsername: targetUser.username,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({
          type: 'success',
          text: `College verification removed for ${targetUser.display_name}.`,
        });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('linkora_college_updated'));
        }
        if (selectedUser?.user_id === targetUser.user_id) {
          setSelectedUser({ ...selectedUser, college_verified: false });
        }
        await fetchUsers();
      } else {
        throw new Error(data.error || 'Failed to remove verification.');
      }
    } catch (err: unknown) {
      setActionMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error removing verification.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGrantCollegeVerification = async (targetUser: AdminUserListItem) => {
    if (!targetUser.college) {
      setActionMessage({ type: 'error', text: 'User does not have a college name set on profile.' });
      return;
    }
    setIsSubmitting(true);
    setActionMessage(null);
    try {
      const { data: pData } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'linkedin_college_verifications')
        .maybeSingle();

      const existingList = Array.isArray(pData?.value) ? pData.value : [];
      const record = {
        userId: targetUser.user_id,
        username: targetUser.username,
        displayName: targetUser.display_name,
        college: targetUser.college,
        verifiedAt: new Date().toISOString(),
      };
      const updatedList = [
        record,
        ...existingList.filter((item: any) => item.userId !== targetUser.user_id),
      ].slice(0, 500);

      await supabase.from('platform_settings').upsert({
        key: 'linkedin_college_verifications',
        value: updatedList,
        description: 'Registry of LinkedIn verified college affiliations and credentials.',
        updated_at: new Date().toISOString(),
      });

      try {
        await supabase
          .from('profiles')
          .update({
            college_verified: true,
            college_verified_at: new Date().toISOString(),
          })
          .eq('user_id', targetUser.user_id);
      } catch (e) {}

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('linkora_college_updated'));
      }
      if (selectedUser?.user_id === targetUser.user_id) {
        setSelectedUser({ ...selectedUser, college_verified: true });
      }
      setActionMessage({
        type: 'success',
        text: `College verification granted for ${targetUser.display_name}.`,
      });
      await fetchUsers();
    } catch (err: unknown) {
      setActionMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error granting verification.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredIdRequests = idRequests.filter((req) => {
    if (idStatusFilter !== 'all' && req.status !== idStatusFilter) return false;
    if (idSearch.trim()) {
      const q = idSearch.toLowerCase().trim();
      const matchName = req.displayName?.toLowerCase().includes(q);
      const matchUsername = req.username?.toLowerCase().includes(q);
      const matchRoll = req.studentRollNumber?.toLowerCase().includes(q);
      const matchCollege = req.collegeName?.toLowerCase().includes(q);
      const matchEmail = req.email?.toLowerCase().includes(q);
      return Boolean(matchName || matchUsername || matchRoll || matchCollege || matchEmail);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Sub-tab View Switcher: Users vs Student ID Verification Queue */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-charcoal-750">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeSubTab === 'users'
                ? 'bg-charcoal-750 text-white shadow-xs border border-charcoal-600'
                : 'text-slate-400 hover:text-white hover:bg-charcoal-800'
            }`}
          >
            <Users className="w-4 h-4 text-brand-400" />
            <span>All Users Directory</span>
            <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full bg-charcoal-800 text-slate-300 font-normal">
              {totalCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('id_verifications')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all relative ${
              activeSubTab === 'id_verifications'
                ? 'bg-emerald-950/60 text-emerald-300 shadow-xs border border-emerald-500/40'
                : 'text-slate-400 hover:text-emerald-300 hover:bg-charcoal-800'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <span>Student ID Verification Queue</span>
            {idStats.pending > 0 ? (
              <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 animate-pulse">
                {idStats.pending} Pending
              </span>
            ) : (
              <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full bg-charcoal-800 text-slate-400 font-normal">
                {idStats.total}
              </span>
            )}
          </button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (activeSubTab === 'users') fetchUsers();
            else fetchIdVerifications();
          }}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading || isIdLoading ? 'animate-spin' : ''}`} />}
          className="text-xs text-slate-300 border-charcoal-700"
        >
          Refresh
        </Button>
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

      {activeSubTab === 'users' && (
        <>
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
                        <div className="text-slate-300 truncate max-w-[200px]">
                          {u.college ? (
                            <VerifiedCollegeBadge
                              college={u.college}
                              isVerified={u.college_verified}
                              userId={u.user_id}
                              username={u.username}
                              showUnverified={true}
                              size="xs"
                            />
                          ) : (
                            '—'
                          )}
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
    </>
  )}

  {activeSubTab === 'id_verifications' && (
    <div className="space-y-5">
      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-750 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Total Submissions</span>
            <span className="text-2xl font-bold text-white mt-0.5 block">{idStats.total}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-charcoal-800 flex items-center justify-center text-slate-300">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-300 block font-medium">Pending Review</span>
            <span className="text-2xl font-bold text-amber-200 mt-0.5 block">{idStats.pending}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-300 block font-medium">Approved & Locked</span>
            <span className="text-2xl font-bold text-emerald-200 mt-0.5 block">{idStats.approved}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-rose-300 block font-medium">Rejected</span>
            <span className="text-2xl font-bold text-rose-200 mt-0.5 block">{idStats.rejected}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-300">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900 p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by student name, roll number, college name, or email..."
              value={idSearch}
              onChange={(e) => setIdSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              rightIcon={
                idSearch ? (
                  <button onClick={() => setIdSearch('')} className="p-1 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                ) : undefined
              }
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {(
              [
                { id: 'all', label: `All (${idStats.total})` },
                { id: 'pending', label: `Pending (${idStats.pending})` },
                { id: 'approved', label: `Approved (${idStats.approved})` },
                { id: 'rejected', label: `Rejected (${idStats.rejected})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setIdStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  idStatusFilter === tab.id
                    ? tab.id === 'pending'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : tab.id === 'approved'
                      ? 'bg-emerald-500 text-slate-950 shadow-xs'
                      : tab.id === 'rejected'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-white text-slate-950 shadow-xs'
                    : 'bg-charcoal-800 text-slate-300 hover:text-white hover:bg-charcoal-750'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests Queue */}
      {isIdLoading ? (
        <div className="p-12 text-center rounded-2xl bg-charcoal-900 border border-charcoal-750 text-slate-400 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400" />
          <p className="text-sm">Loading Student ID verification requests...</p>
        </div>
      ) : filteredIdRequests.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-charcoal-900 border border-charcoal-750 text-slate-400 space-y-3">
          <GraduationCap className="w-10 h-10 mx-auto text-slate-500" />
          <p className="text-sm font-medium text-white">No verification requests found</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {idStatusFilter !== 'all'
              ? `There are no requests matching the filter "${idStatusFilter}".`
              : 'When students upload their college ID cards for verification, their submissions will appear here for review.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIdRequests.map((req) => (
            <div
              key={req.id}
              className="p-4 sm:p-5 rounded-2xl border border-charcoal-750 bg-charcoal-900 hover:border-charcoal-700 transition-all shadow-sm"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                {/* Left: ID Card Image Thumbnail */}
                <div
                  onClick={() => {
                    setInspectingRequest(req);
                    setIsZoomed(false);
                  }}
                  className="w-full sm:w-56 h-36 rounded-xl overflow-hidden border border-charcoal-700 bg-charcoal-950 flex items-center justify-center cursor-pointer relative group shrink-0 shadow-inner"
                >
                  <img
                    src={req.idCardImage}
                    alt={`${req.displayName} Student ID`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-white text-xs font-semibold transition-opacity backdrop-blur-[1px]">
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <span>Inspect Full Size</span>
                  </div>
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-charcoal-950/85 text-slate-300 border border-charcoal-700/80 backdrop-blur-xs">
                    ID Photo
                  </div>
                </div>

                {/* Middle: Details */}
                <div className="flex-1 min-w-0 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        {req.displayName}
                        <span className="text-xs font-mono font-normal text-slate-400">@{req.username}</span>
                      </h3>
                      <p className="text-xs text-slate-400">{req.email}</p>
                    </div>

                    <div>
                      {req.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <Clock className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                          Pending Review
                        </span>
                      ) : req.status === 'approved' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Verified Collegiate
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-xl bg-charcoal-850/70 border border-charcoal-750 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px] mb-0.5">Claimed College / University:</span>
                      <span className="font-semibold text-emerald-300 text-xs sm:text-sm flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 shrink-0 text-emerald-400" />
                        {req.collegeName}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px] mb-0.5">Student Roll Number / ID:</span>
                      <span className="font-mono font-bold text-white text-xs sm:text-sm">{req.studentRollNumber}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                    <span>Submitted: {new Date(req.submittedAt).toLocaleString()}</span>
                    {req.reviewedBy && (
                      <span>
                        Reviewed by: <strong className="text-slate-300">{req.reviewedBy}</strong>
                      </span>
                    )}
                  </div>

                  {req.status === 'rejected' && req.rejectionReason && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300">
                      <strong className="text-rose-200">Rejection Note:</strong> {req.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex sm:flex-col gap-2 shrink-0 justify-end sm:justify-start pt-2 lg:pt-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setInspectingRequest(req);
                      setIsZoomed(false);
                    }}
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                    className="text-xs text-slate-300 border-charcoal-700 hover:text-white"
                  >
                    Inspect
                  </Button>

                  {req.status !== 'approved' && (
                    <Button
                      size="sm"
                      disabled={isSubmitting}
                      onClick={() => handleModerateIdRequest(req.id, 'approve')}
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                    >
                      Approve
                    </Button>
                  )}

                  {req.status !== 'rejected' && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isSubmitting}
                      onClick={() => {
                        setRejectingRequestId(req.id);
                        setCustomRejectReason('');
                        setIsRejectModalOpen(true);
                      }}
                      leftIcon={<XCircle className="w-3.5 h-3.5" />}
                      className="text-xs border-rose-500/40 text-rose-400 hover:bg-rose-500/10"
                    >
                      Reject
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )}

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
                      userId={selectedUser.user_id}
                      username={selectedUser.username}
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

            {/* College Verification Control Card */}
            <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-brand-400" />
                  <span>College Affiliation & Verification</span>
                </div>
                <div className="text-slate-400 flex items-center gap-2 flex-wrap">
                  <span>{selectedUser.college || 'No college specified'}</span>
                  {selectedUser.college && (
                    <VerifiedCollegeBadge
                      college={selectedUser.college}
                      isVerified={selectedUser.college_verified}
                      userId={selectedUser.user_id}
                      username={selectedUser.username}
                      showUnverified={true}
                      size="xs"
                    />
                  )}
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {selectedUser.college_verified ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => handleRemoveCollegeVerification(selectedUser)}
                    className="border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs"
                    leftIcon={<Trash2 className="w-3.5 h-3.5 text-red-400" />}
                  >
                    Remove Verification
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting || !selectedUser.college}
                    onClick={() => handleGrantCollegeVerification(selectedUser)}
                    className="border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10 text-xs"
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                  >
                    Grant Verification
                  </Button>
                )}
              </div>
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

      {/* REJECT ID CARD MODAL */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setRejectingRequestId(null);
        }}
        title="Reject Student College ID Verification"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-300">
            Please choose or describe why this student ID card cannot be verified. This reason will be shown to the student so they can correct and re-upload.
          </p>

          <div className="space-y-2">
            {[
              'ID card photograph is blurry, dark, or unreadable',
              'Student name does not match the registered profile name',
              'College / University name differs from the claimed institution',
              'ID card has expired or lacks active academic session validity',
              'Digital edit or counterfeit ID detected',
            ].map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => setCustomRejectReason(reason)}
                className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors ${
                  customRejectReason === reason
                    ? 'bg-rose-500/20 border-rose-500/50 text-white font-medium'
                    : 'bg-charcoal-850 border-charcoal-750 text-slate-300 hover:border-charcoal-600'
                }`}
              >
                {reason}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Custom Reviewer Feedback:
            </label>
            <textarea
              className="w-full rounded-xl bg-charcoal-900 border border-charcoal-750 p-2.5 text-xs text-white focus:outline-none focus:border-brand-500 min-h-[70px]"
              placeholder="e.g. Please re-upload a clear photo showing your Roll Number and College seal clearly..."
              value={customRejectReason}
              onChange={(e) => setCustomRejectReason(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsRejectModalOpen(false);
                setRejectingRequestId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isSubmitting || !customRejectReason.trim()}
              onClick={() => {
                if (rejectingRequestId) {
                  handleModerateIdRequest(rejectingRequestId, 'reject', customRejectReason);
                }
              }}
              className="bg-rose-600 hover:bg-rose-500 text-white"
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>

      {/* HIGH RESOLUTION LIGHTBOX MODAL */}
      <Modal
        isOpen={Boolean(inspectingRequest)}
        onClose={() => {
          setInspectingRequest(null);
          setIsZoomed(false);
        }}
        title={`Student ID Verification: ${inspectingRequest?.displayName || ''}`}
        maxWidth="xl"
      >
        {inspectingRequest && (
          <div className="space-y-4 text-xs">
            {/* Student Info Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-charcoal-850 border border-charcoal-750">
              <div>
                <span className="text-slate-400 block text-[11px]">Student Name:</span>
                <span className="font-bold text-white text-sm">{inspectingRequest.displayName}</span>
                <span className="text-slate-400 block font-mono text-[11px]">@{inspectingRequest.username}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">College / University:</span>
                <span className="font-bold text-emerald-400 text-sm flex items-center gap-1">
                  <GraduationCap className="w-4 h-4 shrink-0" />
                  {inspectingRequest.collegeName}
                </span>
                <span className="text-slate-400 block text-[11px]">
                  Roll: <strong className="text-white font-mono">{inspectingRequest.studentRollNumber}</strong>
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Verification Status:</span>
                <div className="mt-1">
                  {inspectingRequest.status === 'pending' ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Pending Review
                    </span>
                  ) : inspectingRequest.status === 'approved' ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ✓ Approved
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      ✕ Rejected
                    </span>
                  )}
                </div>
                <span className="text-slate-500 block text-[10px] mt-1">
                  Email: {inspectingRequest.email}
                </span>
              </div>
            </div>

            {/* High-Res Image Viewport with zoom */}
            <div className="relative rounded-xl border border-charcoal-700 bg-charcoal-950 p-2 flex flex-col items-center">
              <div className="w-full flex items-center justify-between pb-2 px-1 text-[11px] text-slate-400 border-b border-charcoal-800">
                <span>Click image to toggle zoom</span>
                <button
                  type="button"
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-charcoal-800 hover:bg-charcoal-700 text-slate-200 transition-colors"
                >
                  {isZoomed ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
                  <span>{isZoomed ? 'Fit to Screen' : '100% Zoom'}</span>
                </button>
              </div>

              <div className="w-full max-h-[60vh] overflow-auto flex items-center justify-center p-2">
                <img
                  src={inspectingRequest.idCardImage}
                  alt="Student ID Card Full View"
                  onClick={() => setIsZoomed(!isZoomed)}
                  className={`rounded-lg transition-all duration-200 ${
                    isZoomed
                      ? 'max-w-none w-auto cursor-zoom-out shadow-2xl'
                      : 'max-h-[50vh] w-auto object-contain cursor-zoom-in shadow-md'
                  }`}
                />
              </div>
            </div>

            {inspectingRequest.status === 'rejected' && inspectingRequest.rejectionReason && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
                <strong>Rejection Note:</strong> {inspectingRequest.rejectionReason}
              </div>
            )}

            {/* Lightbox Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-charcoal-800">
              <span className="text-slate-500 text-[11px]">
                Submitted: {new Date(inspectingRequest.submittedAt).toLocaleString()}
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setInspectingRequest(null);
                    setIsZoomed(false);
                  }}
                >
                  Close
                </Button>

                {inspectingRequest.status !== 'rejected' && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => {
                      setRejectingRequestId(inspectingRequest.id);
                      setCustomRejectReason('');
                      setIsRejectModalOpen(true);
                    }}
                    leftIcon={<XCircle className="w-3.5 h-3.5" />}
                    className="border-rose-500/40 text-rose-400 hover:bg-rose-500/10"
                  >
                    Reject ID
                  </Button>
                )}

                {inspectingRequest.status !== 'approved' && (
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => handleModerateIdRequest(inspectingRequest.id, 'approve')}
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                  >
                    Approve Student ID
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
