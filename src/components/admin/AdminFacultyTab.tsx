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
  FileText,
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

  // Revoke Modal State
  const [revokeUser, setRevokeUser] = useState<any | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

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
            department: newDepartment.trim() || 'General Academic Department',
            notes: newNotes.trim(),
            max_uses: newMaxUses ? parseInt(newMaxUses, 10) : null,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error || 'Failed to create faculty passcode.');
        return;
      }

      setFormSuccess(`Passcode "${newCode.toUpperCase()}" generated successfully! Share this code with faculty.`);
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
      console.warn('Error toggling passcode:', err);
    }
  };

  // Delete Passcode
  const handleDeletePasscode = async (passcodeId: string, code: string) => {
    const confirm = window.confirm(`Permanently delete faculty passcode "${code}"? Anyone using it will no longer be able to join.`);
    if (!confirm) return;

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
      if (res.ok) {
        setRevokeUser(null);
        await loadData();
      }
    } catch (err) {
      console.warn('Error revoking faculty role:', err);
    } finally {
      setIsRevoking(false);
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
            Generate authoritative access passcodes for college professors, department heads, and mentors. Only faculty who possess an active passcode generated here can join and access the Faculty Portal.
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

          <form onSubmit={handleCreatePasscode} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">Access Passcode</label>
                <button
                  type="button"
                  onClick={handleGenerateCodeClick}
                  className="text-[11px] text-brand-400 hover:text-brand-300 underline font-mono"
                >
                  Generate Random
                </button>
              </div>
              <div className="relative">
                <Input
                  type="text"
                  required
                  placeholder="e.g. FAC-829104"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  className="font-mono text-base font-bold tracking-wider text-purple-300 bg-charcoal-850"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                You can generate a random code or type a custom institutional key (e.g. PROF-CS-2026).
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Academic Department</label>
              <Input
                type="text"
                placeholder="e.g. Department of Computer Science"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                className="bg-charcoal-850"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Faculty Member / Notes (Optional)</label>
              <Input
                type="text"
                placeholder="e.g. For Dr. Sarah Jenkins (Head of AI)"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="bg-charcoal-850"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Max Allowed Usages (Optional)</label>
              <Input
                type="number"
                min="1"
                placeholder="Leave blank for unlimited faculty joins"
                value={newMaxUses}
                onChange={(e) => setNewMaxUses(e.target.value)}
                className="bg-charcoal-850"
              />
              <p className="text-[11px] text-slate-500">Set to 1 for a single-use passcode.</p>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isGenerating}
              leftIcon={<KeyRound className="w-4 h-4" />}
            >
              Generate &amp; Activate Passcode
            </Button>
          </form>
        </div>

        {/* Active Passcodes Table (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-charcoal-900 border border-charcoal-750 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-purple-400" />
              <span>Active Faculty Passcodes ({passcodes.length})</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {passcodes.filter((p) => p.is_active).length} Active
            </span>
          </div>

          {passcodes.length === 0 ? (
            <div className="py-12 text-center space-y-3 border border-dashed border-charcoal-750 rounded-xl">
              <KeyRound className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No custom faculty passcodes generated yet.</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Use the generator to create an access passcode so teachers can verify and join the Faculty Portal.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-charcoal-750 text-slate-400 font-mono text-[11px] uppercase">
                    <th className="py-2.5 px-3">Passcode</th>
                    <th className="py-2.5 px-3">Department &amp; Notes</th>
                    <th className="py-2.5 px-3">Uses</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-800">
                  {passcodes.map((item) => (
                    <tr key={item.id} className="hover:bg-charcoal-850/60 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-purple-300">
                        <div className="flex items-center gap-2">
                          <span>{item.code}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.code, item.id)}
                            className="p-1 rounded hover:bg-charcoal-750 text-slate-400 hover:text-white transition-colors"
                            title="Copy Passcode"
                          >
                            {copiedId === item.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-slate-200">{item.department}</p>
                        {item.notes && <p className="text-[11px] text-slate-400">{item.notes}</p>}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-400">
                        {item.used_count || 0}
                        {item.max_uses ? ` / ${item.max_uses}` : ' (unlimited)'}
                      </td>
                      <td className="py-3 px-3">
                        {item.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/15 text-slate-400 border border-slate-500/30">
                            Deactivated
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleTogglePasscode(item.id)}
                          className={`p-1.5 rounded-lg border text-xs transition-colors ${
                            item.is_active
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                          }`}
                          title={item.is_active ? 'Deactivate Passcode' : 'Activate Passcode'}
                        >
                          {item.is_active ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePasscode(item.id, item.code)}
                          className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 transition-colors"
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

      {/* Verified Faculty Registry */}
      <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750 p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-brand-400" />
              <span>Verified Faculty Members ({facultyUsers.length})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Professors and instructors who currently have active teacher privileges on Linkora.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search faculty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
            />
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-charcoal-750 rounded-xl">
            No verified faculty members matching &quot;{searchTerm}&quot; found.
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

      {/* Revoke Faculty Role Confirmation Modal */}
      {revokeUser && (
        <Modal
          isOpen={Boolean(revokeUser)}
          onClose={() => setRevokeUser(null)}
          title="Revoke Faculty Access"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                You are about to revoke faculty privileges from <strong>{revokeUser.display_name}</strong>. Their account will be returned to regular student status.
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
