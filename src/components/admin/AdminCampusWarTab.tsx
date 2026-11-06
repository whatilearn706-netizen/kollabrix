'use client';

import React, { useState, useEffect } from 'react';
import {
  Swords,
  Trophy,
  Sparkles,
  Power,
  Plus,
  Trash2,
  Save,
  RotateCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  Check,
  Flame,
  Crown,
  Layers,
  Link as LinkIcon,
} from 'lucide-react';
import {
  CampusWarConfig,
  DEFAULT_CAMPUS_WAR_CONFIG,
  WarMatch,
  WarPillar,
  WarSponsor,
  CampusStanding,
} from '@/types/campusWar';
import {
  DEFAULT_DERBY_QUESTIONS,
  ARENA_1V1_DERBY_QUESTIONS,
  getRandomArenaQuestions,
  DerbyTeamQuestion,
  CollegiateDerby,
} from '@/types/derbyWar';

interface AdminCampusWarTabProps {
  authToken?: string;
}

export function AdminCampusWarTab({ authToken }: AdminCampusWarTabProps) {
  const [config, setConfig] = useState<CampusWarConfig>(DEFAULT_CAMPUS_WAR_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form states for adding a new match
  const [isAddMatchOpen, setIsAddMatchOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPillar, setNewPillar] = useState<WarPillar>('arena');
  const [newChallengerCollege, setNewChallengerCollege] = useState('Thapar University');
  const [newChallengerName, setNewChallengerName] = useState('Mayank Goyal');
  const [newTargetCollege, setNewTargetCollege] = useState('Delhi Technological University (DTU)');
  const [newBountyPoints, setNewBountyPoints] = useState(50);
  const [newStakes, setNewStakes] = useState('+50 War Pts • Best of 3 Speedrun');
  const [newActionUrl, setNewActionUrl] = useState('/arena?room=KBX-WAR-101');
  const [newActionLabel, setNewActionLabel] = useState('Apply');
  const [newIsShiny, setNewIsShiny] = useState(true);

  // Collegiate Arena Derby specific Admin fields
  const [newChallengerLogo, setNewChallengerLogo] = useState('/brand/kollabrix-logo.png?v=20261031_v3squircle');
  const [newTargetLogo, setNewTargetLogo] = useState('/brand/kollabrix-logo.png?v=20261031_v3squircle');
  const [newTotalTeams, setNewTotalTeams] = useState(10);
  const [newTeamQuestions, setNewTeamQuestions] = useState<DerbyTeamQuestion[]>(() =>
    getRandomArenaQuestions(10)
  );
  const [newHasEntryQuestion, setNewHasEntryQuestion] = useState(false);
  const [newEntryQuestionText, setNewEntryQuestionText] = useState('In Big-O notation, what is the average time complexity of searching a balanced BST?');
  const [newEntryQuestionAnswer, setNewEntryQuestionAnswer] = useState('O(log n)');

  const handleTotalTeamsChange = (count: number) => {
    setNewTotalTeams(count);
    setNewTeamQuestions(getRandomArenaQuestions(count));
  };

  const handleRandomizeQuestions = () => {
    setNewTeamQuestions(getRandomArenaQuestions(newTotalTeams));
  };

  const handleQuestionChange = (teamIdx: number, questionId: string) => {
    const found = ARENA_1V1_DERBY_QUESTIONS.find((q) => q.id === questionId);
    if (!found) return;
    setNewTeamQuestions((prev) => {
      const next = [...prev];
      next[teamIdx] = found;
      return next;
    });
  };

  // Load config on mount
  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/campus-war?_t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data?.config) {
        setConfig(data.config);
      }
    } catch (err: any) {
      console.error('Failed to load campus war config:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const sendAdminAction = async (action: string, payload: any) => {
    setIsSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/campus-war', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          action,
          payload,
          secretToken: 'kollabrix-master-7x9',
        }),
      });
      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
        setStatusMsg({ text: 'Changes saved successfully!', type: 'success' });
      } else {
        setStatusMsg({ text: data.error || 'Failed to save changes.', type: 'error' });
      }
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Server connection error.', type: 'error' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  // Toggle Live / Not Live
  const handleToggleLive = async () => {
    const nextLive = !config.isLive;
    await sendAdminAction('toggle_live', {
      isLive: nextLive,
      maintenanceMessage: config.maintenanceMessage,
    });
  };

  // Save Sponsor
  const handleSaveSponsor = async () => {
    await sendAdminAction('update_sponsor', {
      sponsor: config.sponsor,
    });
  };

  // Add Match
  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let derbyPayload: CollegiateDerby | undefined = undefined;

    if (newPillar === 'arena') {
      const shortA = newChallengerCollege.includes('Thapar')
        ? 'TIET'
        : newChallengerCollege.includes('BITS')
        ? 'BITS'
        : newChallengerCollege.split(' ')[0] || 'CAMPUS-A';

      const shortB = newTargetCollege.includes('Delhi Tech') || newTargetCollege.includes('DTU')
        ? 'DTU'
        : newTargetCollege.includes('IIT')
        ? 'IITD'
        : newTargetCollege.split(' ')[0] || 'CAMPUS-B';

      derbyPayload = {
        id: `derby-${Date.now()}`,
        title: newTitle.trim(),
        description: `${newTotalTeams}v${newTotalTeams} Simultaneous 1v1 Team Duel. Each team receives a unique technical question.`,
        bountyPoints: Number(newBountyPoints) || 50,
        entryQuestion: {
          enabled: newHasEntryQuestion,
          question: newEntryQuestionText,
          hint: 'Enter your answer to qualify',
          expectedAnswer: newEntryQuestionAnswer,
        },
        collegeA: {
          id: shortA.toLowerCase(),
          name: newChallengerCollege.trim(),
          shortName: shortA,
          logoUrl: newChallengerLogo,
          color: '#F59E0B',
        },
        collegeB: {
          id: shortB.toLowerCase(),
          name: newTargetCollege.trim(),
          shortName: shortB,
          logoUrl: newTargetLogo,
          color: '#06B6D4',
        },
        totalBoards: newTotalTeams,
        status: 'registration',
        registrationClosesAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
        battleStartsAt: new Date(Date.now() + 1000 * 60 * 60 * 50).toISOString(),
        resultAnnouncesAt: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
        resultsPublished: false,
        winnerCollege: newChallengerCollege.trim(),
        collegeAWins: Math.ceil(newTotalTeams / 2),
        collegeBWins: Math.floor(newTotalTeams / 2),
        matchups: Array.from({ length: newTotalTeams }, (_, idx) => {
          const q = newTeamQuestions[idx] || ARENA_1V1_DERBY_QUESTIONS[idx % ARENA_1V1_DERBY_QUESTIONS.length];
          return {
            boardNumber: idx + 1,
            title: `Team ${idx + 1} • ${q.title}`,
            teamQuestion: q,
            actionUrl: `/arena?question=${q.id}&room=DERBY-TEAM-${idx + 1}`,
            winnerCollegeId: 'pending',
          };
        }),
      };
    }

    await sendAdminAction('add_match', {
      title: newTitle.trim(),
      pillar: newPillar,
      challengerCollege: newChallengerCollege.trim(),
      challengerLogo: newChallengerLogo,
      challengerName: newChallengerName.trim(),
      targetCollege: newTargetCollege.trim(),
      targetLogo: newTargetLogo,
      bountyPoints: Number(newBountyPoints) || 50,
      stakes: newStakes.trim(),
      actionUrl: newActionUrl.trim(),
      actionLabel: newPillar === 'arena' ? 'Apply' : newActionLabel.trim(),
      isPriorityShiny: newIsShiny,
      derby: derbyPayload,
      status: 'open',
    });

    setIsAddMatchOpen(false);
    setNewTitle('');
  };

  // Delete Match
  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm('Are you sure you want to permanently delete this war match?')) return;
    await sendAdminAction('delete_match', { matchId });
  };

  // Toggle College Shiny Priority
  const handleToggleCollegeShiny = async (collegeId: string) => {
    const nextStandings = config.standings.map((c) =>
      c.id === collegeId ? { ...c, isPriorityShiny: !c.isPriorityShiny } : c
    );
    await sendAdminAction('update_standings', { standings: nextStandings });
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
        <RotateCw className="w-4 h-4 animate-spin text-amber-400" />
        <span>Loading Campus War Master Controls...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Status notification toast */}
      {statusMsg && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${
            statusMsg.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{statusMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMsg(null)}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. MASTER TOGGLE: LIVE / NOT LIVE */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                WAR ROOM ORCHESTRATION
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                  config.isLive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}
              >
                {config.isLive ? '● SYSTEM LIVE' : '○ OFFLINE / DRAFT'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Swords className="w-5 h-5 text-amber-400" />
              <span>Campus War Master Switch</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-xl">
              Turn Campus War public visibility ON or OFF. When offline, only platform admins can view the `/war` hub, while visitors see your custom intermission notice.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleToggleLive}
              className={`h-11 px-6 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                config.isLive
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/25'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{config.isLive ? 'Take Campus War OFFLINE' : 'Set Campus War LIVE 🚀'}</span>
            </button>
            <a
              href="/war"
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>Preview `/war`</span>
            </a>
          </div>
        </div>

        {/* Maintenance message editor */}
        {!config.isLive && (
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <label className="block text-xs font-bold text-slate-300">
              Intermission / Offline Notice Shown to Public Visitors:
            </label>
            <textarea
              rows={2}
              value={config.maintenanceMessage}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, maintenanceMessage: e.target.value }))
              }
              className="w-full p-3 rounded-xl bg-black/40 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-400 resize-none font-sans"
            />
          </div>
        )}
      </div>

      {/* 2. BRAND / PRIORITY COLLEGE SPONSOR BANNER & SHINY CONTROLS */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Brand Sponsor &amp; Host College Priority Spotlight</span>
            </h3>
            <p className="text-xs text-slate-400">
              Showcase a paying title brand sponsor (AWS, Red Bull) or highlight a priority college (e.g. Thapar University) with a radiant shiny golden metallic border.
            </p>
          </div>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveSponsor}
            className="h-9 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/25 shrink-0"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Sponsor Settings'}</span>
          </button>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              Brand / Featured College Name
            </label>
            <input
              type="text"
              value={config.sponsor.name}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  sponsor: { ...prev.sponsor, name: e.target.value },
                }))
              }
              placeholder="e.g. Thapar University or AWS Cloud"
              className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              Badge Label Text
            </label>
            <input
              type="text"
              value={config.sponsor.badgeText}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  sponsor: { ...prev.sponsor, badgeText: e.target.value },
                }))
              }
              placeholder="e.g. FEATURED HOST CAMPUS or OFFICIAL TITLE PARTNER"
              className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              Logo URL
            </label>
            <input
              type="text"
              value={config.sponsor.logoUrl}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  sponsor: { ...prev.sponsor, logoUrl: e.target.value },
                }))
              }
              placeholder="e.g. /brand/kollabrix-logo.png or https://..."
              className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              Target Link URL
            </label>
            <input
              type="text"
              value={config.sponsor.targetUrl}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  sponsor: { ...prev.sponsor, targetUrl: e.target.value },
                }))
              }
              placeholder="e.g. https://www.kollabrix.in"
              className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              Tagline / Subtitle
            </label>
            <input
              type="text"
              value={config.sponsor.tagline}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  sponsor: { ...prev.sponsor, tagline: e.target.value },
                }))
              }
              placeholder="e.g. Official Season 1 Title Partner • ₹1,00,000 Prize Pool"
              className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Toggles: Show Banner & Shiny Mode */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-200">
              <input
                type="checkbox"
                checked={config.sponsor.enabled}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    sponsor: { ...prev.sponsor, enabled: e.target.checked },
                  }))
                }
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700 cursor-pointer"
              />
              <span>Display Sponsor Banner in `/war`</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-amber-300">
              <input
                type="checkbox"
                checked={config.sponsor.isPriorityShiny}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    sponsor: { ...prev.sponsor, isPriorityShiny: e.target.checked },
                  }))
                }
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700 cursor-pointer"
              />
              <span className="flex items-center gap-1 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Enable Holographic Shiny Glow &amp; VIP Priority Border</span>
              </span>
            </label>
          </div>
        </div>

        {/* LIVE PREVIEW OF SPONSOR CARD */}
        <div className="space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Live Banner Preview (What users see):
          </div>
          <div
            className={`rounded-2xl p-4 transition-all relative overflow-hidden ${
              config.sponsor.isPriorityShiny
                ? 'bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-2 border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.25)] ring-1 ring-amber-300/40'
                : 'bg-slate-900/60 border border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {config.sponsor.logoUrl ? (
                  <div className="w-10 h-10 rounded-xl bg-black/60 border border-amber-500/30 flex items-center justify-center p-1.5 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={config.sponsor.logoUrl}
                      alt={config.sponsor.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-200 border border-amber-400/50 uppercase">
                    {config.sponsor.badgeText}
                  </span>
                  <div className="text-sm font-bold text-white mt-0.5">{config.sponsor.name}</div>
                  <div className="text-[11px] text-slate-300">{config.sponsor.tagline}</div>
                </div>
              </div>
              <span className="text-xs text-amber-400 font-bold underline font-mono">
                Visit Partner →
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. WAR MATCHES MANAGEMENT (ADD & DELETE) */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <span>Active War Matches &amp; Bounties ({config.matches?.length || 0})</span>
            </h3>
            <p className="text-xs text-slate-400">
              Create open matches or remove obsolete clashes. Matches appear directly on the Campus War live board.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddMatchOpen((prev) => !prev)}
            className="h-9 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/25 shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddMatchOpen ? 'Close Add Form' : '+ Add New War Match'}</span>
          </button>
        </div>

        {/* ADD MATCH FORM (EXPANDABLE) */}
        {isAddMatchOpen && (
          <form
            onSubmit={handleAddMatch}
            className="p-5 rounded-2xl bg-black/60 border border-amber-500/30 space-y-4 animate-fadeIn"
          >
            <div className="text-xs font-bold font-mono uppercase text-amber-400 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Create New Campus War Match</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-[11px] font-bold text-slate-300">Match Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Thapar vs DTU: Speed React & CSS Duel"
                  className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-300">Pillar Category</label>
                <select
                  value={newPillar}
                  onChange={(e) => setNewPillar(e.target.value as WarPillar)}
                  className="w-full h-9 px-2 rounded-lg bg-[#090C12] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="arena">⚔️ Battle Arena 1v1</option>
                  <option value="hackathon">🏆 Hackathon Derby</option>
                  <option value="problem">💡 Faculty Bounty</option>
                  <option value="icpc">⚡ ICPC Gauntlet</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-300">Challenger College</label>
                <input
                  type="text"
                  required
                  value={newChallengerCollege}
                  onChange={(e) => setNewChallengerCollege(e.target.value)}
                  placeholder="e.g. Thapar University"
                  className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-300">Target College</label>
                <input
                  type="text"
                  required
                  value={newTargetCollege}
                  onChange={(e) => setNewTargetCollege(e.target.value)}
                  placeholder="e.g. DTU or Open to All Campuses"
                  className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-300">Bounty Points</label>
                <input
                  type="number"
                  min={10}
                  max={500}
                  value={newBountyPoints}
                  onChange={(e) => setNewBountyPoints(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="block text-[11px] font-bold text-slate-300">Stakes Details</label>
                <input
                  type="text"
                  value={newStakes}
                  onChange={(e) => setNewStakes(e.target.value)}
                  placeholder="e.g. +50 War Pts • Best of 3 Speedrun"
                  className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-300">Action URL</label>
                <input
                  type="text"
                  value={newActionUrl}
                  onChange={(e) => setNewActionUrl(e.target.value)}
                  placeholder="e.g. /arena?room=KBX-WAR-101"
                  className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Arena-specific fields (when newPillar === 'arena') */}
            {newPillar === 'arena' && (
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/25 space-y-3 font-mono text-xs">
                <div className="text-[11px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Swords className="w-3.5 h-3.5 text-purple-400" />
                  <span>Collegiate Battle Arena Settings</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-300 font-bold mb-1">Challenger Logo URL</label>
                    <input
                      type="text"
                      value={newChallengerLogo}
                      onChange={(e) => setNewChallengerLogo(e.target.value)}
                      placeholder="/brand/kollabrix-logo.png"
                      className="w-full h-8 px-2.5 rounded-lg bg-black/50 border border-white/10 text-white text-[11px] font-mono focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-300 font-bold mb-1">Target College Logo URL</label>
                    <input
                      type="text"
                      value={newTargetLogo}
                      onChange={(e) => setNewTargetLogo(e.target.value)}
                      placeholder="/brand/kollabrix-logo.png"
                      className="w-full h-8 px-2.5 rounded-lg bg-black/50 border border-white/10 text-white text-[11px] font-mono focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-300 font-bold mb-1">Teams Count</label>
                    <select
                      value={newTotalTeams}
                      onChange={(e) => handleTotalTeamsChange(Number(e.target.value))}
                      className="w-full h-8 px-2 rounded-lg bg-[#090C12] border border-white/10 text-white text-[11px] font-mono focus:border-amber-400"
                    >
                      <option value={3}>3 Teams</option>
                      <option value={5}>5 Teams</option>
                      <option value={8}>8 Teams</option>
                      <option value={10}>10 Teams (Standard)</option>
                      <option value={12}>12 Teams</option>
                    </select>
                  </div>
                </div>

                {/* Battle Arena 1v1 Question Allocation (Randomized & Synchronized) */}
                <div className="pt-3 border-t border-purple-500/20 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                        Battle Arena 1v1 Questions ({newTotalTeams} Teams • 1 Unique Question Per Team)
                      </span>
                      <span className="text-[10px] text-slate-400 font-sans">
                        Sourced directly from official 1v1 Battle Arena engine. Each team gets a distinct challenge (no duplicates).
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleRandomizeQuestions}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all self-start sm:self-center"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>🎲 Randomize 1v1 Questions</span>
                    </button>
                  </div>

                  {/* Team Questions Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-1">
                    {Array.from({ length: newTotalTeams }, (_, idx) => {
                      const currentQ =
                        newTeamQuestions[idx] ||
                        ARENA_1V1_DERBY_QUESTIONS[idx % ARENA_1V1_DERBY_QUESTIONS.length];
                      return (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-black/60 border border-white/10 flex flex-col gap-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-amber-400">
                              Team #{idx + 1} Question
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                currentQ?.difficulty === 'Hard'
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : currentQ?.difficulty === 'Medium'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-emerald-500/20 text-emerald-300'
                              }`}
                            >
                              {currentQ?.difficulty || 'Medium'}
                            </span>
                          </div>

                          <select
                            value={currentQ?.id}
                            onChange={(e) => handleQuestionChange(idx, e.target.value)}
                            className="w-full h-7 px-2 rounded bg-slate-900 border border-white/10 text-white text-[10px] font-sans truncate focus:border-amber-400"
                          >
                            {ARENA_1V1_DERBY_QUESTIONS.map((q) => (
                              <option key={q.id} value={q.id}>
                                {q.title} ({q.difficulty} • {q.topic})
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Application Qualifying Question Gate */}
                <div className="pt-2 border-t border-white/5 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                    <input
                      type="checkbox"
                      checked={newHasEntryQuestion}
                      onChange={(e) => setNewHasEntryQuestion(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-500 focus:ring-purple-400 bg-slate-900 border-slate-700 cursor-pointer"
                    />
                    <span>Require Qualifying Question to Apply / Enter</span>
                  </label>

                  {newHasEntryQuestion && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6 pt-1">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold mb-1">Qualifying Question</label>
                        <input
                          type="text"
                          value={newEntryQuestionText}
                          onChange={(e) => setNewEntryQuestionText(e.target.value)}
                          className="w-full h-8 px-2.5 rounded-lg bg-black/60 border border-white/10 text-white text-[11px] focus:border-purple-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold mb-1">Expected Answer</label>
                        <input
                          type="text"
                          value={newEntryQuestionAnswer}
                          onChange={(e) => setNewEntryQuestionAnswer(e.target.value)}
                          className="w-full h-8 px-2.5 rounded-lg bg-black/60 border border-white/10 text-white text-[11px] focus:border-purple-400"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-amber-300">
                <input
                  type="checkbox"
                  checked={newIsShiny}
                  onChange={(e) => setNewIsShiny(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700 cursor-pointer"
                />
                <span>Highlight with Golden Shiny VIP Border</span>
              </label>

              <button
                type="submit"
                disabled={isSaving}
                className="h-9 px-5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-sm"
              >
                {isSaving ? 'Adding...' : 'Confirm & Add Match ⚔️'}
              </button>
            </div>
          </form>
        )}

        {/* LIST OF MATCHES WITH 1-CLICK DELETE */}
        <div className="space-y-3">
          {(config.matches || []).map((match) => (
            <div
              key={match.id}
              className={`p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                match.isPriorityShiny
                  ? 'bg-amber-500/10 border-2 border-amber-400/60 shadow-md'
                  : 'bg-black/40 border border-white/5'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                    {match.pillar}
                  </span>
                  <span className="text-xs font-bold text-white">{match.title}</span>
                  {match.isPriorityShiny && (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold uppercase">
                      ⭐ SHINY VIP
                    </span>
                  )}
                </div>
                <div className="text-xs font-mono text-slate-400">
                  <span className="text-amber-300 font-semibold">{match.challengerCollege}</span>
                  <span className="mx-1 text-slate-600">vs</span>
                  <span className="text-slate-300">{match.targetCollege}</span>
                  <span className="mx-2 text-slate-600">•</span>
                  <span className="text-amber-400 font-bold">+{match.bountyPoints} Pts</span>
                  <span className="mx-2 text-slate-600">•</span>
                  <span className="text-slate-400">{match.actionUrl}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={match.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Test Link</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleDeleteMatch(match.id)}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Delete match"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. CAMPUS STANDINGS & SHINY COLLEGE SELECTOR */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <span>Collegiate Standings &amp; Priority Campus Highlights</span>
          </h3>
          <p className="text-xs text-slate-400">
            Click &ldquo;Toggle Shiny Priority&rdquo; on any college to highlight it with the golden host shield on the live leaderboard.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-white/5">
              <tr>
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">University</th>
                <th className="py-2.5 px-3 text-right">War Points</th>
                <th className="py-2.5 px-3 text-center">Win Rate</th>
                <th className="py-2.5 px-3">Priority Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(config.standings || []).map((campus, idx) => (
                <tr key={campus.id} className="hover:bg-white/[0.01]">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-400">#{idx + 1}</td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-white">{campus.collegeName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{campus.championName}</div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-400">
                    {campus.warPoints} PTS
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-emerald-400 font-bold">
                    {campus.winRate}%
                  </td>
                  <td className="py-2.5 px-3">
                    {campus.isPriorityShiny ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-200 border border-amber-400/50 font-bold uppercase">
                        ⭐ SHINY HOST
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500">Standard</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleToggleCollegeShiny(campus.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        campus.isPriorityShiny
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                          : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {campus.isPriorityShiny ? '★ Remove Shiny' : '☆ Set Shiny'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
