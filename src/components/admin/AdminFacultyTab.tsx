'use client';

import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  GraduationCap,
  PlusCircle,
  Copy,
  Check,
  Trash2,
  Power,
  PowerOff,
  RefreshCw,
  Search,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Building,
  UserX,
  UserCheck,
  FileText,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { FacultyPasscode, generateFacultyCode } from '@/lib/admin/facultyPasscodes';

interface AdminFacultyTabProps {
  authToken?: string;
  adminEmail?: string;
}

export function AdminFacultyTab({ authToken, adminEmail }: AdminFacultyTabProps) {
  const [passcodes, setPasscodes] = useState<FacultyPasscode[]>([]);
  const [facultyUsers, setFacultyUsers] = useState<any[]>([]);
  const [revokedUsers, setRevokedUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Passcode Form State
  const [newCode, setNewCode] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newMaxUses, setNewMaxUses] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Action feedback toast
  const [actionToast, setActionToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Revoke Modal State
  const [revokeUser, setRevokeUser] = useState<any | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [isRestoringId, setIsRestoringId] = useState<string | null>(null);

  // Load Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/admin/faculty', { headers });
      const data = await res.json();
      if (res.ok && data.success) {
        setPasscodes(data.passcodes || []);
        setFacultyUsers(data.facultyUsers || []);
        setRevokedUsers(data.revokedUsers || []);
      }
    } catch (err) {
      console.warn('Error loading faculty administration data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Pre-populate with a dynamic generated code
    setNewCode(generateFacultyCode('FAC'));
  }, []);

  const handleGenerateCodeClick = () => {
    setNewCode(generateFacultyCode('FAC'));
  };

  // Create Passcode
  const handleCreatePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!newCode.trim()) {
      setFormError('Please enter or generate a passcode.');
      return;
    }

    try {
      setIsGenerating(true);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/admin/faculty', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'create',
          passcodeData: {
            code: newCode.trim(),
            department: newDepartment.trim(),
            notes: newNotes.trim(),
            max_uses: newMaxUses ? parseInt(newMaxUses, 10) : null,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error || 'Failed to generate faculty passcode.');
        return;
      }

      setFormSuccess(`Passcode ${data.passcode.code} generated successfully!`);
      setNewCode(generateFacultyCode('FAC'));
      setNewDepartment('');
      setNewNotes('');
      setNewMaxUses('');
      await loadData();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error generating passcode.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle Passcode
  const handleTogglePasscode = async (passcodeId: string) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/admin/faculty', {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'toggle', passcodeId }),
      });
      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.warn('Error toggling passcode status:', err);
    }
  };

  // Delete Passcode
  const handleDeletePasscode = async (passcodeId: string) => {
    if (!confirm('Are you sure you want to permanently delete this faculty passcode?')) return;

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/admin/faculty', {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'delete', passcodeId }),
      });
      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.warn('Error deleting passcode:', err);
    }
  };

  // Revoke Faculty Role
  const handleRevokeFacultyRole = async () => {
    if (!revokeUser) return;
    try {
      setIsRevoking(true);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/admin/faculty', {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'revoke', targetUserId: revokeUser.user_id }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionToast({
          type: 'success',
          text: `Faculty privileges for ${revokeUser.display_name} (@${revokeUser.username || 'user'}) have been revoked. They are now locked out of the Faculty Portal.`,
        });
        setRevokeUser(null);
        await loadData();
      } else {
        setActionToast({
          type: 'error',
          text: data.error || 'Failed to revoke faculty role.',
        });
      }
    } catch (err: unknown) {
      setActionToast({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error revoking faculty role.',
      });
    } finally {
      setIsRevoking(false);
    }
  };

  // Restore Faculty Role
  const handleRestoreFaculty = async (user: any) => {
    try {
      setIsRestoringId(user.user_id);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/admin/faculty', {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'restore', targetUserId: user.user_id }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionToast({
          type: 'success',
          text: `Faculty access restored for ${user.display_name} (@${user.username || 'user'}).`,
        });
        await loadData();
      } else {
        setActionToast({
          type: 'error',
          text: data.error || 'Failed to restore faculty access.',
        });
      }
    } catch (err: unknown) {
      setActionToast({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error restoring faculty access.',
      });
    } finally {
      setIsRestoringId(null);
    }
  };

  // Copy to clipboard
  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredUsers = facultyUsers.filter(
    (u) =>
      u.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.college?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Description Card */}
      <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-purple-400" />
            <span>Faculty Access Passcodes &amp; Credentials</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Generate authoritative access passcodes for professors and mentors. Only faculty who possess an active passcode generated here can join and access the Faculty Portal. If access is revoked, they are immediately locked out.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
        >
          Refresh Registry
        </Button>
      </div>

      {/* Action Notification Toast */}
      {actionToast && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 ${
            actionToast.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionToast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{actionToast.text}</span>
          </div>
          <button
            onClick={() => setActionToast(null)}
            className="text-[11px] underline hover:no-underline opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Grid: 1. Passcode Generator & 2. Active Passcodes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Passcode Generator Form (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-charcoal-900 border border-charcoal-750 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-brand-400" />
              <span>Generate Faculty Passcode</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold">
              Admin Exclusive
            </span>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{formSuccess}</span>
            </div>
          )}

          <form onSubmit={handleCreatePasscode} className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">Access Passcode</label>
                <button
                  type="button"
                  onClick={handleGenerateCodeClick}
                  className="text-[11px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Regenerate Random
                </button>
              </div>
              <Input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                placeholder="e.g. FAC-782910"
                className="font-mono uppercase bg-charcoal-800 border-charcoal-700 font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Department / School
              </label>
              <Input
                type="text"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                placeholder="e.g. Dept of Computer Science & Engineering"
                className="bg-charcoal-800 border-charcoal-700 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Max Uses</label>
                <Input
                  type="number"
                  min="1"
                  max="500"
                  value={newMaxUses}
                  onChange={(e) => setNewMaxUses(e.target.value)}
                  placeholder="Unlimited"
                  className="bg-charcoal-800 border-charcoal-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Notes</label>
                <Input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. For Dr. Sharma"
                  className="bg-charcoal-800 border-charcoal-700 text-xs"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isGenerating}
              leftIcon={<KeyRound className="w-4 h-4" />}
            >
              Issue Faculty Passcode
            </Button>
          </form>
        </div>

        {/* Active Passcodes Table (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-charcoal-900 border border-charcoal-750 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-purple-400" />
                <span>Active Faculty Passcodes</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {passcodes.length} active or configured passcode{passcodes.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          {passcodes.length === 0 ? (
            <div className="py-12 text-center space-y-2 border border-dashed border-charcoal-750 rounded-xl">
              <KeyRound className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">No active passcodes found.</p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Use the generator to create an access passcode so teachers can verify and join the Faculty Portal.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-charcoal-750 text-slate-400 font-mono text-[11px] uppercase">
                    <th className="py-2.5 px-3">Passcode</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3 text-center">Uses</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-800">
                  {passcodes.map((p) => (
                    <tr key={p.id} className="hover:bg-charcoal-850/60 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-bold text-white bg-charcoal-800 px-2 py-0.5 rounded border border-charcoal-700">
                            {p.code}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopy(p.code, p.id)}
                            className="p-1 rounded hover:bg-charcoal-750 text-slate-400 hover:text-white transition-colors"
                            title="Copy Passcode"
                          >
                            {copiedId === p.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {p.notes && <p className="text-[10px] text-slate-500 mt-0.5">{p.notes}</p>}
                      </td>
                      <td className="py-3 px-3 text-slate-300">{p.department}</td>
                      <td className="py-3 px-3 text-center font-mono text-[11px]">
                        <span className="text-white font-bold">{p.used_count || 0}</span>
                        <span className="text-slate-500">/{p.max_uses ?? '∞'}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.is_active
                              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                              : 'bg-red-500/15 border border-red-500/30 text-red-400'
                          }`}
                        >
                          {p.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => handleTogglePasscode(p.id)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            p.is_active
                              ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                              : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                          }`}
                          title={p.is_active ? 'Deactivate Passcode' : 'Activate Passcode'}
                        >
                          {p.is_active ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePasscode(p.id)}
                          className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete Passcode"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 2. Verified Faculty Registry Table */}
      <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750 p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-purple-400" />
              <span>Verified Faculty Registry</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/15 text-purple-300 font-mono font-bold">
                {facultyUsers.length}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Professors and instructors who currently have active teacher privileges on Linkora.
            </p>
          </div>

          <div className="w-full sm:w-64">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search faculty..."
              className="bg-charcoal-800 border-charcoal-700 text-xs"
              leftIcon={<Search className="w-3.5 h-3.5 text-slate-400" />}
            />
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-charcoal-750 rounded-xl">
            No active verified faculty members matching &quot;{searchTerm}&quot; found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-charcoal-750 text-slate-400 font-mono text-[11px] uppercase">
                  <th className="py-2.5 px-3">Faculty Member</th>
                  <th className="py-2.5 px-3">Username</th>
                  <th className="py-2.5 px-3">Institution / College</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-800">
                {filteredUsers.map((user) => (
                  <tr key={user.user_id} className="hover:bg-charcoal-850/60 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-xs font-bold text-purple-300">
                          {user.display_name?.charAt(0) || 'F'}
                        </div>
                        <div>
                          <p className="font-bold text-white">{user.display_name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">UID: {user.user_id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">@{user.username || 'faculty'}</td>
                    <td className="py-3 px-3 text-slate-300">{user.college || 'Verified College Faculty'}</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 border border-purple-500/30 text-purple-300">
                        <GraduationCap className="w-3 h-3 text-purple-400" />
                        Teacher
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setRevokeUser(user)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 text-xs font-bold transition-colors"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Revoke Access</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Revoked Faculty Accounts Registry Table */}
      {revokedUsers.length > 0 && (
        <div className="rounded-2xl bg-charcoal-900 border border-red-500/30 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserX className="w-4 h-4 text-red-400" />
                <span>Revoked Faculty Accounts</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-500/15 text-red-300 font-mono font-bold">
                  {revokedUsers.length}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                These users have had their faculty access revoked by an administrator and are barred from accessing the Faculty Portal.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-charcoal-750 text-slate-400 font-mono text-[11px] uppercase">
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Username</th>
                  <th className="py-2.5 px-3">Access Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-800">
                {revokedUsers.map((user) => (
                  <tr key={user.user_id} className="hover:bg-charcoal-850/60 transition-colors">
                    <td className="py-3 px-3">
                      <div>
                        <p className="font-bold text-white">{user.display_name || 'Revoked User'}</p>
                        <p className="text-[10px] text-slate-500 font-mono">UID: {user.user_id}</p>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">@{user.username || 'user'}</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 border border-red-500/30 text-red-400">
                        <UserX className="w-3 h-3" />
                        Access Revoked
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs text-emerald-400 hover:text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/10"
                        onClick={() => handleRestoreFaculty(user)}
                        isLoading={isRestoringId === user.user_id}
                        leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                      >
                        Restore Access
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Revoke Faculty Role Confirmation Modal */}
      {revokeUser && (
        <Modal
          isOpen={Boolean(revokeUser)}
          onClose={() => setRevokeUser(null)}
          title="Revoke Faculty Access"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-slate-700 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                You are about to revoke faculty privileges from <strong className="text-slate-900">{revokeUser.display_name}</strong> (@{revokeUser.username || 'user'}). They will be immediately locked out of the Faculty Portal and returned to regular student status.
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setRevokeUser(null)} disabled={isRevoking}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleRevokeFacultyRole}
                isLoading={isRevoking}
                leftIcon={<UserX className="w-4 h-4" />}
              >
                Confirm Revocation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
