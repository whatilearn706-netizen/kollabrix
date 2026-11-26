'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  Code2,
  Play,
  Power,
  Radio,
  RotateCw,
  ShieldCheck,
  Trophy,
  Zap,
} from 'lucide-react';
import { DuelQuestion } from '@/types/arenaDuel';
import { supabase } from '@/lib/supabase/client';
import { FullArenaExperience } from '@/components/arena/FullArenaExperience';
import { AdminTournamentGenerator } from './arena/AdminTournamentGenerator';
import { AdminActiveDuelsList } from './arena/AdminActiveDuelsList';
import { AdminSecretSpectatorView } from './arena/AdminSecretSpectatorView';
import { AdminQuestionStudio } from './arena/AdminQuestionStudio';

interface AdminArenaTabProps {
  authToken?: string;
}

/**
 * Redesigned Obsidian Titanium Battle Arena controller for Admin Control Center.
 * Syncs live challenges directly with the 4-stage /arena experience.
 */
export function AdminArenaTab({ authToken }: AdminArenaTabProps) {
  const [subTab, setSubTab] = useState<'questions' | 'tournament' | 'maintenance'>('questions');
  const [questions, setQuestions] = useState<DuelQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [spectatingRoomCode, setSpectatingRoomCode] = useState<string | null>(null);

  const [isTestLobbyOpen, setIsTestLobbyOpen] = useState(false);
  const [selectedTestQuestion, setSelectedTestQuestion] = useState<DuelQuestion | null>(null);

  const [isArenaLive, setIsArenaLive] = useState(true);
  const [maintenanceMsg, setMaintenanceMsg] = useState(
    'Battle Arena is temporarily offline for challenge updates. Please check back shortly!'
  );
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    let token = authToken;
    if (!token) {
      try {
        const { data } = await supabase.auth.getSession();
        token = data.session?.access_token;
      } catch {}
    }
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/arena/questions?all=true&_t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setQuestions(Array.isArray(data?.questions) ? data.questions : []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchArenaStatus = async () => {
    try {
      const res = await fetch('/api/arena/status', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setIsArenaLive(data.isLive !== false);
        if (data.maintenanceMessage) setMaintenanceMsg(data.maintenanceMessage);
      }
    } catch {}
  };

  useEffect(() => {
    fetchQuestions();
    fetchArenaStatus();
  }, []);

  const updateArenaStatus = async (nextLive: boolean, msg: string) => {
    setIsUpdatingStatus(true);
    setStatusMsg(null);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/arena/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ isLive: nextLive, maintenanceMessage: msg }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsArenaLive(data.isLive);
        setStatusMsg({
          text: data.message || `Arena set to ${data.isLive ? 'LIVE' : 'MAINTENANCE'}`,
          type: 'success',
        });
      } else {
        setStatusMsg({ text: data?.error || 'Failed to update Arena status', type: 'error' });
      }
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Network error updating status', type: 'error' });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0A0E17] border border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-white/[0.06] border border-white/15 text-white">
              <Zap className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">
                Battle Arena Studio &amp; Challenge Engine
              </h2>
              <p className="text-xs text-slate-400">
                Manage 1v1 Quick Blitz, 60s Bug Hunt, Web Pixel Clash &amp; Custom arena questions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedTestQuestion(null);
              setIsTestLobbyOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-slate-100 via-white to-slate-200 text-slate-950 font-mono text-xs font-black flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Preview Live Arena</span>
          </button>
          <button
            type="button"
            onClick={() => {
              fetchQuestions();
              fetchArenaStatus();
            }}
            className="p-2 rounded-xl bg-[#05080F] border border-white/15 text-slate-300 hover:text-white cursor-pointer"
            title="Refresh"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        {([
          { id: 'questions', label: 'Question Studio', icon: Code2 },
          { id: 'tournament', label: 'Live Rooms & Spectator', icon: Trophy },
          { id: 'maintenance', label: 'Arena Status', icon: ShieldCheck },
        ] as const).map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id)}
              className={`px-4 py-2 rounded-xl font-mono text-xs font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                subTab === t.id
                  ? 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-950'
                  : 'bg-[#0A0E17] text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {statusMsg && (
        <div
          className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/50 border-red-500/40 text-red-300'
          }`}
        >
          {statusMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {subTab === 'questions' && (
        <AdminQuestionStudio
          questions={questions}
          isLoading={isLoading}
          authHeaders={getAuthHeaders}
          onRefresh={fetchQuestions}
          onStatus={setStatusMsg}
          onTestQuestion={(q) => {
            setSelectedTestQuestion(q);
            setIsTestLobbyOpen(true);
          }}
        />
      )}

      {subTab === 'tournament' && (
        <div className="space-y-6">
          {spectatingRoomCode && (
            <AdminSecretSpectatorView roomCode={spectatingRoomCode} onClose={() => setSpectatingRoomCode(null)} />
          )}
          <AdminTournamentGenerator questions={questions} onSpectateRoom={(c) => setSpectatingRoomCode(c)} />
          <AdminActiveDuelsList activeSpectatingCode={spectatingRoomCode} onSpectateRoom={(c) => setSpectatingRoomCode(c)} />
        </div>
      )}

      {subTab === 'maintenance' && (
        <div className="p-6 rounded-2xl bg-[#0A0E17] border border-white/15 flex flex-col lg:flex-row justify-between gap-6">
          <div className="space-y-3">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-mono text-xs font-bold border ${
                isArenaLive
                  ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                  : 'bg-red-950/50 border-red-500/40 text-red-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isArenaLive ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
              {isArenaLive ? 'BATTLE ARENA: LIVE' : 'BATTLE ARENA: MAINTENANCE'}
            </span>
            <p className="text-xs text-slate-400 max-w-md">
              Toggle public visibility for /arena. Admins can still preview questions directly from Admin Control Center.
            </p>
            <button
              type="button"
              disabled={isUpdatingStatus}
              onClick={() => updateArenaStatus(!isArenaLive, maintenanceMsg)}
              className={`px-4 py-2 rounded-xl font-mono text-xs font-black flex items-center gap-2 cursor-pointer ${
                isArenaLive
                  ? 'bg-red-950/70 border border-red-500/40 text-red-200'
                  : 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-950'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isArenaLive ? 'Take Offline (Maintenance)' : 'Bring Arena Live'}</span>
            </button>
          </div>

          <div className="lg:w-96 space-y-2">
            <label className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" />
              <span>Maintenance Notice</span>
            </label>
            <textarea
              rows={2}
              value={maintenanceMsg}
              onChange={(e) => setMaintenanceMsg(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#05080F] border border-white/15 font-mono text-xs text-white outline-none"
            />
            <button
              type="button"
              disabled={isUpdatingStatus}
              onClick={() => updateArenaStatus(isArenaLive, maintenanceMsg)}
              className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/15 font-mono text-xs font-bold text-white cursor-pointer"
            >
              Save Notice
            </button>
          </div>
        </div>
      )}

      {isTestLobbyOpen && (
        <FullArenaExperience
          onClose={() => {
            setIsTestLobbyOpen(false);
            setSelectedTestQuestion(null);
          }}
          initialQuestion={selectedTestQuestion || undefined}
          currentUser={{ displayName: 'Admin_Tester', username: 'admin' }}
        />
      )}
    </div>
  );
}
