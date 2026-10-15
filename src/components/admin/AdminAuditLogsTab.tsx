'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  ShieldAlert,
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { AdminAuditLog } from '@/types/database';

interface AdminAuditLogsTabProps {
  authToken?: string;
}

export function AdminAuditLogsTab({ authToken }: AdminAuditLogsTabProps) {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Selected Log for JSON detail view
  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch(
        `/api/admin/audit-logs?page=${page}&limit=15&search=${encodeURIComponent(search)}&action=${actionFilter}&targetType=${typeFilter}`,
        { headers }
      );
      const data = await res.json();
      if (res.ok && data.logs) {
        setLogs(data.logs);
        setTotalPages(data.pagination.totalPages || 1);
        setTotalCount(data.pagination.total || 0);
      }
    } catch (err) {
      console.warn('Error loading audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, actionFilter, typeFilter, authToken]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900 p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search audit events by action, target type, or administrator email..."
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
            <div className="w-44">
              <Select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                options={[
                  { value: 'all', label: 'All Target Types' },
                  { value: 'user', label: 'Users' },
                  { value: 'project', label: 'Projects' },
                  { value: 'settings', label: 'Settings' },
                  { value: 'skill', label: 'Skills' },
                  { value: 'hackathon', label: 'Hackathons' },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-charcoal-800/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-charcoal-750">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Administrator</th>
                <th className="py-3.5 px-4">Target Type & ID</th>
                <th className="py-3.5 px-4 text-center">Outcome</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800 font-mono text-[11px]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-sans">
                    Loading audit events...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-sans">
                    No audit records match the current filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-charcoal-850/50 transition-colors">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-charcoal-800 border border-charcoal-700 text-brand-300 font-semibold">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-300 font-sans">
                      {log.actor_email || 'Administrator'}
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-slate-400 font-sans">{log.target_type}: </span>
                      <span className="text-white truncate max-w-[140px] inline-block align-middle">
                        {log.target_id || 'System'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${
                          log.outcome === 'SUCCESS'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-red-500/10 border-red-500/30 text-red-300'
                        }`}
                      >
                        {log.outcome === 'SUCCESS' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <XCircle className="w-3 h-3 text-red-400" />
                        )}
                        {log.outcome}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-sans">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                        className="h-7 text-xs text-brand-400 hover:text-white"
                        leftIcon={<Eye className="w-3 h-3" />}
                      >
                        Payload
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-charcoal-850/40 border-t border-charcoal-750 flex items-center justify-between text-xs text-slate-400 font-sans">
          <div>
            Showing <strong className="text-white">{logs.length}</strong> of{' '}
            <strong className="text-white">{totalCount}</strong> audit events
          </div>
          <div className="flex items-center gap-2 font-mono">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Previous
            </Button>
            <span className="text-xs text-slate-300">
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

      {/* Audit Payload JSON Modal */}
      <Modal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title={`Audit Event: ${selectedLog?.action || ''}`}
        maxWidth="md"
      >
        {selectedLog && (
          <div className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-charcoal-850 border border-charcoal-750 font-mono text-[11px]">
              <div>
                <span className="text-slate-500">Timestamp:</span>
                <p className="text-slate-300">{new Date(selectedLog.created_at).toISOString()}</p>
              </div>
              <div>
                <span className="text-slate-500">Actor:</span>
                <p className="text-slate-300">{selectedLog.actor_email || 'Administrator'}</p>
              </div>
              <div>
                <span className="text-slate-500">Target Type:</span>
                <p className="text-slate-300">{selectedLog.target_type}</p>
              </div>
              <div>
                <span className="text-slate-500">Target ID:</span>
                <p className="text-slate-300">{selectedLog.target_id || 'N/A'}</p>
              </div>
            </div>

            <div>
              <span className="font-semibold text-slate-300 block mb-1">
                Sanitized Event Payload:
              </span>
              <pre className="p-3.5 rounded-xl bg-charcoal-950 border border-charcoal-800 font-mono text-[11px] text-brand-300 overflow-x-auto max-h-64">
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
