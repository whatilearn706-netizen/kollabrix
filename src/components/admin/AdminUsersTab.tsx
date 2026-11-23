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
  Mail,
  Send,
  Copy,
  Check,
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
  defaultSubTab?: 'users' | 'id_verifications';
}

export function AdminUsersTab({ currentAdminId = '', authToken, defaultSubTab = 'users' }: AdminUsersTabProps) {
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

  // User Profile Editing State (College name & student identity overrides)
  const [editCollege, setEditCollege] = useState('');
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editCourse, setEditCourse] = useState('');
  const [editYear, setEditYear] = useState('');

  useEffect(() => {
    if (selectedUser) {
      setEditCollege(selectedUser.college || '');
      setEditDisplayName(selectedUser.display_name || '');
      setEditCourse(selectedUser.course || '');
      setEditYear(selectedUser.academic_year || '');
    }
  }, [selectedUser]);

  // Action Modals State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
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

  // Email Contact & Broadcast State
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastActionText, setBroadcastActionText] = useState('Open Kollabrix');
  const [broadcastActionUrl, setBroadcastActionUrl] = useState('https://kollabrix.in');
  const [isTestOnly, setIsTestOnly] = useState(false);
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [broadcastStatus, setBroadcastStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Active Sub-tab View: 'users' (All Directory) vs 'id_verifications' (Student ID Queue)
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'id_verifications'>(defaultSubTab);

  useEffect(() => {
    if (defaultSubTab) {
      setActiveSubTab(defaultSubTab);
    }
  }, [defaultSubTab]);

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
      if (currentAdminId) {
        headers['x-admin-id'] = currentAdminId;
      }

      let fetchedRequests: StudentIdVerification[] = [];
      let fetchedStats: StudentIdVerificationStats | null = null;

      try {
        const adminUrl = currentAdminId
          ? `/api/verify/college-id?admin=true&adminId=${encodeURIComponent(currentAdminId)}`
          : '/api/verify/college-id?admin=true';
        const res = await fetch(adminUrl, { headers });
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.requests)) {
          fetchedRequests = data.requests;
          if (data.stats) fetchedStats = data.stats;
        } else if (!res.ok && data?.error) {
          console.warn('Admin ID verifications fetch error:', data.error);
        }
      } catch (apiErr) {
        console.warn('API error fetching id verifications, using db fallback:', apiErr);
      }

      // Authoritative Direct Database Fallback: if API returned empty or had network issue
      if (fetchedRequests.length === 0) {
        try {
          const { data: dbData } = await supabase
            .from('platform_settings')
            .select('value')
            .eq('key', 'student_id_verifications')
            .maybeSingle();

          if (Array.isArray(dbData?.value) && dbData.value.length > 0) {
            fetchedRequests = [...dbData.value].sort((a: any, b: any) => {
              if (a.status === 'pending' && b.status !== 'pending') return -1;
              if (a.status !== 'pending' && b.status === 'pending') return 1;
              return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
            });
            fetchedStats = {
              total: fetchedRequests.length,
              pending: fetchedRequests.filter((r) => r.status === 'pending').length,
              approved: fetchedRequests.filter((r) => r.status === 'approved').length,
              rejected: fetchedRequests.filter((r) => r.status === 'rejected').length,
            };
          }
        } catch (dbErr) {
          console.warn('Direct database fallback error:', dbErr);
        }
      }

      setIdRequests(fetchedRequests);
      if (fetchedStats) {
        setIdStats(fetchedStats);
      } else {
        setIdStats({
          total: fetchedRequests.length,
          pending: fetchedRequests.filter((r) => r.status === 'pending').length,
          approved: fetchedRequests.filter((r) => r.status === 'approved').length,
          rejected: fetchedRequests.filter((r) => r.status === 'rejected').length,
        });
      }
    } catch (err) {
      console.warn('Error fetching student ID verifications:', err);
    } finally {
      setIsIdLoading(false);
    }
  }, [authToken, currentAdminId]);

  useEffect(() => {
    fetchIdVerifications();
  }, [fetchIdVerifications]);

  useEffect(() => {
    if (activeSubTab === 'id_verifications') {
      fetchIdVerifications();
      // Auto-poll every 30s to keep DB load light while maintaining fresh queue
      const timer = setInterval(() => {
        fetchIdVerifications();
      }, 30000);
      return () => clearInterval(timer);
    }
  }, [activeSubTab, fetchIdVerifications]);

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
      if (currentAdminId) {
        headers['x-admin-id'] = currentAdminId;
      }

      let successMessage = '';
      let updatedTarget: any = null;

      try {
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
        if (res.ok && data.success) {
          successMessage = data.message || `Verification ${action}d successfully.`;
          updatedTarget = data.request;
        } else {
          throw new Error(data?.error || 'Failed via API');
        }
      } catch (apiErr) {
        // Direct Database Moderation Fallback
        const now = new Date().toISOString();
        const { data: dbData } = await supabase
          .from('platform_settings')
          .select('value')
          .eq('key', 'student_id_verifications')
          .maybeSingle();

        const curList: StudentIdVerification[] = Array.isArray(dbData?.value) ? dbData.value : [];
        const tIndex = curList.findIndex((r) => r.id === requestId);
        if (tIndex >= 0) {
          const t = { ...curList[tIndex] };
          const isFacultyTarget = t.verificationType === 'faculty_id';

          if (action === 'approve') {
            t.status = 'approved';
            t.reviewedAt = now;
            t.reviewedBy = 'admin';
            t.rejectionReason = undefined;

            // Update profiles table
            try {
              if (isFacultyTarget) {
                await supabase
                  .from('profiles')
                  .update({
                    role: 'teacher',
                    faculty_verified: true,
                    faculty_designation: t.designation || 'Faculty Mentor',
                    faculty_department: t.department || 'Academic Department',
                    college: t.collegeName,
                    updated_at: now,
                  })
                  .eq('user_id', t.userId);
              } else {
                await supabase
                  .from('profiles')
                  .update({
                    college: t.collegeName,
                    college_verified: true,
                    college_verified_at: now,
                    updated_at: now,
                  })
                  .eq('user_id', t.userId);
              }
            } catch (e) {}

            // Add to universal registry
            try {
              const { data: pData } = await supabase.from('platform_settings').select('value').eq('key', 'linkedin_college_verifications').maybeSingle();
              const curReg: any[] = Array.isArray(pData?.value) ? pData.value : [];
              const cleanReg = curReg.filter((i: any) => i.userId !== t.userId && i.username !== t.username);
              const newEntry = isFacultyTarget
                ? {
                    userId: t.userId,
                    username: t.username,
                    college: t.collegeName,
                    verifiedAt: now,
                    method: 'faculty_id_card',
                    role: 'teacher',
                    isFaculty: true,
                    facultyVerified: true,
                  }
                : {
                    userId: t.userId,
                    username: t.username,
                    college: t.collegeName,
                    verifiedAt: now,
                    method: 'student_id_card',
                    collegeVerified: true,
                  };

              await supabase.from('platform_settings').upsert({
                key: 'linkedin_college_verifications',
                value: [newEntry, ...cleanReg],
                description: 'Universal registry of verified college credentials.',
                updated_at: now,
              });
            } catch (e) {}
          } else {
            t.status = 'rejected';
            t.reviewedAt = now;
            t.reviewedBy = 'admin';
            t.rejectionReason = reason || (isFacultyTarget ? 'Faculty documentation could not be verified.' : 'ID card photograph was unreadable or details did not match.');

            // Update profiles table on rejection
            try {
              if (isFacultyTarget) {
                await supabase
                  .from('profiles')
                  .update({
                    role: 'student',
                    faculty_verified: false,
                    updated_at: now,
                  })
                  .eq('user_id', t.userId);
              } else {
                await supabase
                  .from('profiles')
                  .update({
                    college_verified: false,
                    updated_at: now,
                  })
                  .eq('user_id', t.userId);
              }
            } catch (e) {}

            // Remove from registry
            try {
              const { data: pData } = await supabase.from('platform_settings').select('value').eq('key', 'linkedin_college_verifications').maybeSingle();
              const curReg: any[] = Array.isArray(pData?.value) ? pData.value : [];
              const cleanReg = curReg.filter((i: any) => i.userId !== t.userId && i.username !== t.username);
              await supabase.from('platform_settings').upsert({
                key: 'linkedin_college_verifications',
                value: cleanReg,
                description: 'Universal registry of verified college credentials.',
                updated_at: now,
              });
            } catch (e) {}
          }

          curList[tIndex] = t;
          await supabase.from('platform_settings').upsert({
            key: 'student_id_verifications',
            value: curList,
            description: 'Authoritative student college ID card verification submissions queue.',
            updated_at: now,
          });
          updatedTarget = t;
          successMessage = `Verification ${action}d successfully.`;
        } else {
          throw new Error('Verification request not found in queue.');
        }
      }

      setActionMessage({
        type: 'success',
        text: successMessage,
      });

      setIsRejectModalOpen(false);
      setRejectingRequestId(null);
      setCustomRejectReason('');
      if (inspectingRequest?.id === requestId) {
        setInspectingRequest(updatedTarget || null);
      }

      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('linkora_verified_registry_cache');
        } catch (e) {}
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

  const handleSendBroadcast = async () => {
    if (!broadcastSubject.trim() || !broadcastMessage.trim()) return;
    setIsSendingBroadcast(true);
    setBroadcastStatus(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/admin/broadcast-email', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          subject: broadcastSubject.trim(),
          title: broadcastTitle.trim() || broadcastSubject.trim(),
          message: broadcastMessage.trim(),
          actionText: broadcastActionText.trim() || 'Open Kollabrix',
          actionUrl: broadcastActionUrl.trim() || 'https://kollabrix.in',
          testOnly: isTestOnly,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.testOnly) {
          setBroadcastStatus({
            type: 'success',
            message: `Preview test email dispatched to ${data.recipient}! Check your inbox.`,
          });
        } else {
          setBroadcastStatus({
            type: 'success',
            message: `Broadcast delivered! Successfully sent to ${data.sentCount} out of ${data.totalRecipients} registered students.`,
          });
          setBroadcastSubject('');
          setBroadcastTitle('');
          setBroadcastMessage('');
        }
      } else {
        setBroadcastStatus({
          type: 'error',
          message: data.error || 'Failed to dispatch broadcast.',
        });
      }
    } catch (err: any) {
      setBroadcastStatus({
        type: 'error',
        message: err.message || 'Network error dispatching broadcast.',
      });
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  // Handle Moderation Action
  const executeModeration = async (
    action: 'suspend' | 'restore' | 'remove_from_project' | 'remove_from_all_teams' | 'delete_user',
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
      setIsDeleteUserModalOpen(false);
      setIsRemoveAllModalOpen(false);
      setIsRemoveProjectModalOpen({ isOpen: false });
      setIsDetailModalOpen(false);
      setSelectedUser(null);
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
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      } else {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.access_token) {
          headers['Authorization'] = `Bearer ${data.session.access_token}`;
        }
      }

      const res = await fetch('/api/admin/users/moderate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'revoke_college_verification',
          targetUserId: targetUser.user_id,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({
          type: 'success',
          text: `College verification removed for ${targetUser.display_name}.`,
        });
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('linkora_verified_registry_cache');
          } catch (e) {}
          window.dispatchEvent(new Event('linkora_college_updated'));
        }
        if (selectedUser?.user_id === targetUser.user_id) {
          setSelectedUser({ ...selectedUser, college_verified: false });
        }
        await fetchUsers();
        await fetchIdVerifications();
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
    const finalCollege = editCollege.trim() || targetUser.college;
    if (!finalCollege) {
      setActionMessage({ type: 'error', text: 'Please enter a college name to grant verification.' });
      return;
    }
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

      const res = await fetch('/api/admin/users/moderate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'grant_college_verification',
          targetUserId: targetUser.user_id,
          collegeName: finalCollege,
          displayName: editDisplayName.trim() || targetUser.display_name,
          course: editCourse.trim() || targetUser.course,
          academicYear: editYear.trim() || targetUser.academic_year,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('linkora_verified_registry_cache');
          } catch (e) {}
          window.dispatchEvent(new Event('linkora_college_updated'));
        }
        const updated = {
          ...targetUser,
          college: finalCollege,
          college_verified: true,
          display_name: editDisplayName.trim() || targetUser.display_name,
          course: editCourse.trim() || targetUser.course,
          academic_year: editYear.trim() || targetUser.academic_year,
        };
        if (selectedUser?.user_id === targetUser.user_id) {
          setSelectedUser(updated);
        }
        setActionMessage({
          type: 'success',
          text: `Verification granted under "${finalCollege}"!`,
        });
        await fetchUsers();
        await fetchIdVerifications();
      } else {
        throw new Error(data.error || 'Failed to grant verification.');
      }
    } catch (err: unknown) {
      setActionMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error granting verification.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProfileDetails = async (targetUser: AdminUserListItem) => {
    if (!targetUser) return;
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

      const res = await fetch('/api/admin/users/moderate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'update_profile_details',
          targetUserId: targetUser.user_id,
          college: editCollege.trim(),
          displayName: editDisplayName.trim() || targetUser.display_name,
          course: editCourse.trim(),
          academicYear: editYear.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const updated = {
          ...targetUser,
          college: editCollege.trim(),
          display_name: editDisplayName.trim() || targetUser.display_name,
          course: editCourse.trim(),
          academic_year: editYear.trim(),
        };
        if (selectedUser?.user_id === targetUser.user_id) {
          setSelectedUser(updated);
        }
        setActionMessage({
          type: 'success',
          text: `Profile updated for ${updated.display_name} successfully.`,
        });
        await fetchUsers();
      } else {
        throw new Error(data.error || 'Failed to update profile details.');
      }
    } catch (err: unknown) {
      setActionMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error updating profile details.',
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

                <button
                  type="button"
                  onClick={() => {
                    setIsBroadcastModalOpen(true);
                    setBroadcastStatus(null);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-charcoal-950 font-mono text-xs font-black shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition active:scale-95 shrink-0"
                  title="Broadcast email message to all registered students"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast Email</span>
                </button>
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
                <th className="py-3.5 px-4 text-center">Arena ELO</th>
                <th className="py-3.5 px-4 text-center">Projects Owned</th>
                <th className="py-3.5 px-4 text-center">Team Memberships</th>
                <th className="py-3.5 px-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
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
                            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 flex-wrap mt-0.5">
                              <span className="text-slate-500">@{u.username}</span>
                              {u.email ? (
                                <>
                                  <span className="text-slate-600">•</span>
                                  <span className="text-cyan-400 font-medium select-all">{u.email}</span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigator.clipboard.writeText(u.email || '');
                                      setCopiedEmailId(u.user_id);
                                      setTimeout(() => setCopiedEmailId(null), 2000);
                                    }}
                                    title="Copy Email Address"
                                    className="p-1 hover:text-white text-slate-400 hover:bg-charcoal-700 rounded transition inline-flex items-center"
                                  >
                                    {copiedEmailId === u.user_id ? (
                                      <Check className="w-3 h-3 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                  <a
                                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(u.email)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    title="Write personal email from your Gmail"
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition shrink-0"
                                  >
                                    <Mail className="w-2.5 h-2.5" />
                                    <span>Gmail ↗</span>
                                  </a>
                                </>
                              ) : (
                                <span className="text-slate-600 text-[10px] italic">no email linked</span>
                              )}
                            </div>
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

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center gap-0.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold border shadow-xs ${
                              (u.arena_rating || 1200) >= 1500
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                                : (u.arena_rating || 1200) >= 1300
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                : (u.arena_rating || 1200) >= 1100
                                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            ⚡ {u.arena_rating || 1200}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {u.arena_stats?.matches ? `${u.arena_stats.wins}W / ${u.arena_stats.losses}L` : 'Unranked'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono">
                        {u.owned_projects_count}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono">
                        {u.memberships_count + u.hackathon_teams_count}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
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
                          {u.user_id !== currentAdminId && u.role !== 'admin' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(u);
                                setModerationReason('');
                                setIsDeleteUserModalOpen(true);
                              }}
                              className="border-red-500/30 text-red-400 hover:bg-red-500/10 px-2 py-1.5"
                              title="Delete User Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
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

            <button
              type="button"
              onClick={() => fetchIdVerifications()}
              disabled={isIdLoading}
              title="Refresh student ID verification queue"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-charcoal-800 text-slate-300 hover:text-white hover:bg-charcoal-750 transition-colors disabled:opacity-50 shrink-0 ml-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isIdLoading ? 'animate-spin text-emerald-400' : ''}`} />
              <span>Refresh</span>
            </button>
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
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          {req.displayName}
                          <span className="text-xs font-mono font-normal text-slate-400">@{req.username}</span>
                        </h3>
                        {req.verificationType === 'faculty_id' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            👨‍🏫 Faculty Application
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                            🎓 Student ID Card
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{req.email}</p>
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
                          {req.verificationType === 'faculty_id' ? 'Verified Faculty Mentor' : 'Verified Collegiate'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  {req.verificationType === 'faculty_id' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-charcoal-850/70 border border-amber-500/20 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px] mb-0.5">University / College:</span>
                        <span className="font-semibold text-amber-300 text-xs sm:text-sm flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4 shrink-0 text-amber-400" />
                          {req.collegeName}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px] mb-0.5">Faculty Title / Designation:</span>
                        <span className="font-bold text-white text-xs sm:text-sm">{req.designation || 'Faculty Member'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px] mb-0.5">Department / School:</span>
                        <span className="font-mono text-slate-300 text-xs">{req.department || 'Academic Dept'}</span>
                      </div>
                    </div>
                  ) : (
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
                  )}

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
                      className={`text-xs font-semibold ${
                        req.verificationType === 'faculty_id'
                          ? 'bg-amber-600 hover:bg-amber-500 text-slate-950'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {req.verificationType === 'faculty_id' ? 'Approve Faculty' : 'Approve'}
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
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    ⚔️ Arena ELO: {selectedUser.arena_rating || 1200}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    Tier: {selectedUser.arena_stats?.tier || 'Silver'} ({selectedUser.arena_stats?.wins || 0}W - {selectedUser.arena_stats?.losses || 0}L)
                  </span>
                </div>
                {selectedUser.email && (
                  <div className="pt-2 flex items-center gap-2 flex-wrap">
                    <span className="text-cyan-300 font-mono text-xs select-all font-semibold flex items-center gap-1.5 bg-cyan-950/40 border border-cyan-500/30 px-2.5 py-1 rounded-lg">
                      <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{selectedUser.email}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedUser.email || '');
                        setCopiedEmailId(selectedUser.user_id);
                        setTimeout(() => setCopiedEmailId(null), 2000);
                      }}
                      className="px-2 py-1 rounded bg-charcoal-750 hover:bg-charcoal-700 text-slate-300 text-[11px] font-mono border border-charcoal-650 flex items-center gap-1"
                    >
                      {copiedEmailId === selectedUser.user_id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                    <a
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(selectedUser.email)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-gradient-to-r from-amber-500 to-orange-500 text-charcoal-950 font-mono font-bold text-[11px] flex items-center gap-1 hover:brightness-110 shadow-sm"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Personal Gmail Compose</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Suspension & Delete Action Buttons */}
              {selectedUser.user_id !== currentAdminId && selectedUser.role !== 'admin' && (
                <div className="flex items-center gap-2">
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
                      Suspend
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setModerationReason('');
                      setIsDeleteUserModalOpen(true);
                    }}
                    className="border-red-500/40 text-red-400 hover:bg-red-500/10"
                    leftIcon={<Trash2 className="w-3.5 h-3.5 text-red-400" />}
                  >
                    Delete Account
                  </Button>
                </div>
              )}
            </div>

            {/* Student Identity & College Affiliation Override Card */}
            <div className="p-5 rounded-2xl bg-charcoal-850 border border-charcoal-750 space-y-4 shadow-lg">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-charcoal-750">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-brand-500/20 text-brand-300">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                      Student Identity &amp; College Affiliation
                    </h5>
                    <p className="text-[11px] text-slate-400">
                      Override college name, course, and verification status directly.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedUser.college_verified ? (
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Verified Collegiate</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      Unverified Account
                    </span>
                  )}
                </div>
              </div>

              {/* Editable Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold text-slate-300">College / University Name</label>
                  <input
                    type="text"
                    value={editCollege}
                    onChange={(e) => setEditCollege(e.target.value)}
                    placeholder="e.g. Delhi Technological University (DTU)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-400 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold text-slate-300">Display Name</label>
                  <input
                    type="text"
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-400 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold text-slate-300">Course / Department</label>
                  <input
                    type="text"
                    value={editCourse}
                    onChange={(e) => setEditCourse(e.target.value)}
                    placeholder="e.g. B.Tech Computer Science"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-400 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold text-slate-300">Academic Year</label>
                  <input
                    type="text"
                    value={editYear}
                    onChange={(e) => setEditYear(e.target.value)}
                    placeholder="e.g. 3rd Year (Junior)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-400 transition-colors"
                  />
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-charcoal-750 flex-wrap">
                <Button
                  size="sm"
                  variant="primary"
                  disabled={isSubmitting}
                  onClick={() => handleUpdateProfileDetails(selectedUser)}
                  className="text-xs font-bold"
                >
                  Save Profile Changes
                </Button>

                <div className="flex items-center gap-2">
                  {selectedUser.college_verified ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isSubmitting}
                      onClick={() => handleRemoveCollegeVerification(selectedUser)}
                      className="border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs font-bold"
                      leftIcon={<Trash2 className="w-3.5 h-3.5 text-red-400" />}
                    >
                      Revoke Verification
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isSubmitting || !editCollege.trim()}
                      onClick={() => handleGrantCollegeVerification(selectedUser)}
                      className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 text-xs font-bold"
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    >
                      Save &amp; Grant Verification
                    </Button>
                  )}
                </div>
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

      {/* DELETE USER PERMANENT CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteUserModalOpen}
        onClose={() => setIsDeleteUserModalOpen(false)}
        title="Permanently Delete Account"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
            <div className="leading-relaxed">
              <strong className="text-white">Irreversible Action:</strong> This will permanently delete{' '}
              <strong className="text-white">@{selectedUser?.username}</strong> from both the Supabase Authentication service and PostgreSQL database.
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Deletion Reason (Optional)
            </label>
            <textarea
              className="w-full rounded-xl bg-charcoal-900 border border-charcoal-750 p-3 text-xs text-white focus:outline-none focus:border-red-500"
              rows={2}
              placeholder="Test user, spam account, duplicate registration..."
              value={moderationReason}
              onChange={(e) => setModerationReason(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsDeleteUserModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              onClick={() => executeModeration('delete_user')}
              className="bg-red-600 hover:bg-red-500 text-white font-bold"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete User Permanently
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
        title={`${inspectingRequest?.verificationType === 'faculty_id' ? '👨‍🏫 Faculty ID Application' : '🎓 Student ID Verification'}: ${inspectingRequest?.displayName || ''}`}
        maxWidth="xl"
      >
        {inspectingRequest && (
          <div className="space-y-4 text-xs">
            {/* Applicant Info Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-charcoal-850 border border-charcoal-750">
              <div>
                <span className="text-slate-400 block text-[11px]">
                  {inspectingRequest.verificationType === 'faculty_id' ? 'Faculty Name:' : 'Student Name:'}
                </span>
                <span className="font-bold text-white text-sm">{inspectingRequest.displayName}</span>
                <span className="text-slate-400 block font-mono text-[11px]">@{inspectingRequest.username}</span>
                {inspectingRequest.verificationType === 'faculty_id' && inspectingRequest.designation && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium text-[10px]">
                    {inspectingRequest.designation}
                  </span>
                )}
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Institution / Campus:</span>
                <span className="font-bold text-emerald-400 text-sm flex items-center gap-1">
                  <GraduationCap className="w-4 h-4 shrink-0" />
                  {inspectingRequest.collegeName}
                </span>
                <span className="text-slate-400 block text-[11px] mt-0.5">
                  {inspectingRequest.verificationType === 'faculty_id' ? (
                    <>Dept: <strong className="text-white">{inspectingRequest.department || 'N/A'}</strong></>
                  ) : (
                    <>Roll: <strong className="text-white font-mono">{inspectingRequest.studentRollNumber}</strong></>
                  )}
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
                  Email: {inspectingRequest.facultyEmail || inspectingRequest.email}
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
                  alt={`${inspectingRequest.displayName} Document Full View`}
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
                    Reject Application
                  </Button>
                )}

                {inspectingRequest.status !== 'approved' && (
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => handleModerateIdRequest(inspectingRequest.id, 'approve')}
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    className={`font-semibold ${
                      inspectingRequest.verificationType === 'faculty_id'
                        ? 'bg-amber-600 hover:bg-amber-500 text-slate-950'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {inspectingRequest.verificationType === 'faculty_id' ? 'Approve Faculty Mentor' : 'Approve Student ID'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Campus-Wide Email Broadcast Modal */}
      <Modal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        title="📢 Campus-Wide Email Broadcast"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-1.5 font-mono">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>Audience Target:</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold">
                {totalCount} Registered Students
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Dispatches via Brevo (9,000 free emails/month) or Resend to all registered collegiate student builders on Kollabrix.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
                Email Subject Line *
              </label>
              <Input
                placeholder="e.g. ⚡ Collegiate Hackathon Season 01 is Live!"
                value={broadcastSubject}
                onChange={(e) => setBroadcastSubject(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
                Headline / Title (Inside Email Body)
              </label>
              <Input
                placeholder="e.g. Your Campus Dream Team is Waiting"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
                Message Body *
              </label>
              <textarea
                rows={5}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-950 border border-charcoal-750 text-slate-200 text-xs font-sans placeholder-slate-500 focus:outline-none focus:border-amber-400/80 transition"
                placeholder="Write your announcement or update message here..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Call-to-Action Button Text
                </label>
                <Input
                  placeholder="Open Kollabrix"
                  value={broadcastActionText}
                  onChange={(e) => setBroadcastActionText(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Button Destination Link
                </label>
                <Input
                  placeholder="https://kollabrix.in"
                  value={broadcastActionUrl}
                  onChange={(e) => setBroadcastActionUrl(e.target.value)}
                />
              </div>
            </div>

            {/* Test Only Checkbox */}
            <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750 flex items-center gap-2.5">
              <input
                type="checkbox"
                id="testOnlyBroadcast"
                checked={isTestOnly}
                onChange={(e) => setIsTestOnly(e.target.checked)}
                className="rounded border-charcoal-600 text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="testOnlyBroadcast" className="text-slate-300 text-xs font-mono cursor-pointer select-none">
                Send test preview to my email only first (<span className="text-amber-400 font-bold">goyalmayank142@gmail.com</span>)
              </label>
            </div>

            {broadcastStatus && (
              <div
                className={`p-3 rounded-xl border text-xs font-mono flex items-start gap-2 ${
                  broadcastStatus.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {broadcastStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>{broadcastStatus.message}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-charcoal-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBroadcastModalOpen(false)}
              disabled={isSendingBroadcast}
            >
              Cancel
            </Button>

            <button
              type="button"
              onClick={handleSendBroadcast}
              disabled={isSendingBroadcast || !broadcastSubject.trim() || !broadcastMessage.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-charcoal-950 font-mono text-xs font-black shadow-md shadow-amber-500/20 flex items-center gap-2 transition disabled:opacity-50 active:scale-95"
            >
              {isSendingBroadcast ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Dispatching Emails...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{isTestOnly ? 'Send Test Preview Email' : `Dispatch to All (${totalCount} Users)`}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
