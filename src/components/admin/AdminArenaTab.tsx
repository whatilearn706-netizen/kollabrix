'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  Sparkles,
  Plus,
  Save,
  RotateCw,
  Code2,
  Layers,
  Terminal,
  Check,
  Flame,
  Clock,
  Play,
  FileCode,
  Tag,
  AlertCircle,
  HelpCircle,
  Trash2,
  Eye,
  Power,
  Radio,
  CheckCircle2,
  XCircle,
  ShieldCheck,
} from 'lucide-react';
import { DEFAULT_ARENA_QUESTIONS, DuelQuestion, ArenaCategory } from '@/types/arenaDuel';
import { supabase } from '@/lib/supabase/client';
import { CinematicArenaTransition } from '@/components/arena/CinematicArenaTransition';
import { FullArenaExperience } from '@/components/arena/FullArenaExperience';

interface AdminArenaTabProps {
  authToken?: string;
}

export function AdminArenaTab({ authToken }: AdminArenaTabProps) {
  const [questions, setQuestions] = useState<DuelQuestion[]>(DEFAULT_ARENA_QUESTIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArena, setSelectedArena] = useState<ArenaCategory | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Live test transition states
  const [isTestTransitionActive, setIsTestTransitionActive] = useState(false);
  const [isTestLobbyOpen, setIsTestLobbyOpen] = useState(false);
  const [selectedTestQuestion, setSelectedTestQuestion] = useState<DuelQuestion | null>(null);

  // Arena Live / Maintenance Status
  const [isArenaLive, setIsArenaLive] = useState(true);
  const [maintenanceMsg, setMaintenanceMsg] = useState(
    'Battle Arena is temporarily offline for scheduled system tuning, anti-cheat calibration, and challenge additions. Please check back shortly!'
  );
  const [statusUpdatedAt, setStatusUpdatedAt] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // New question form state
  const [newTitle, setNewTitle] = useState('');
  const [newArena, setNewArena] = useState<ArenaCategory>('web_dev');
  const [newTags, setNewTags] = useState<string>('html,css');
  const [newDifficulty, setNewDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [newTimeLimit, setNewTimeLimit] = useState(300);
  const [newDesc, setNewDesc] = useState('');
  const [newBugDomain, setNewBugDomain] = useState<'web' | 'logic'>('web');
  const [newStarterHtml, setNewStarterHtml] = useState('<div class="hero-banner">\n  <!-- Build your component here -->\n</div>');
  const [newStarterCss, setNewStarterCss] = useState('.hero-banner {\n  /* Add styling here */\n}');
  const [newStarterJs, setNewStarterJs] = useState('// Event listener code\n');
  const [newStarterPython, setNewStarterPython] = useState('# Python starter code\n');
  const [newStarterJava, setNewStarterJava] = useState('// Java starter code\n');
  const [newStarterCpp, setNewStarterCpp] = useState('// C++ starter code\n');
  const [newSampleInput, setNewSampleInput] = useState('');
  const [newSampleOutput, setNewSampleOutput] = useState('');
  const [newCodeWithBug, setNewCodeWithBug] = useState('// Enter code with bug here\n');
  const [newTargetHtml, setNewTargetHtml] = useState('<div class="target-card">\n  <h3>Target Card</h3>\n  <p>Design blueprint</p>\n</div>');
  const [newTargetCss, setNewTargetCss] = useState('.target-card {\n  background: #0f172a;\n  padding: 16px;\n  border-radius: 10px;\n  color: #fff;\n}');
  const [newTargetJs, setNewTargetJs] = useState('// Target interaction or event handler\n');

  // Dynamic interactive test cases list
  const [testCasesList, setTestCasesList] = useState<Array<{ input: string; expectedOutput: string; description: string }>>([
    { input: 'nums = [3, 1, 2, 4]', expectedOutput: '[2, 4, 3, 1]', description: 'Even and odd parity separation' },
    { input: 'nums = [0, 1, 2]', expectedOutput: '[0, 2, 1]', description: 'Boundary and single digit check' },
  ]);

  const handleAddTestCase = () => {
    setTestCasesList((prev) => [
      ...prev,
      { input: '', expectedOutput: '', description: `Test Case ${prev.length + 1}` },
    ]);
  };

  const handleRemoveTestCase = (index: number) => {
    setTestCasesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateTestCase = (index: number, field: 'input' | 'expectedOutput' | 'description', val: string) => {
    setTestCasesList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/arena/questions?_t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.questions && Array.isArray(data.questions)) {
          let qList = data.questions;
          try {
            const localDel = JSON.parse(localStorage.getItem('tf_deleted_arena_q_ids') || '[]');
            if (Array.isArray(localDel) && localDel.length > 0) {
              const delSet = new Set(localDel.map((x: string) => String(x).toLowerCase()));
              qList = qList.filter((q: any) => !delSet.has((q.id || '').toLowerCase()));
            }
          } catch {}
          setQuestions(qList);
        }
      }
    } catch (err) {
      console.error('Failed to load arena questions:', err);
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
        if (data.updatedAt) setStatusUpdatedAt(data.updatedAt);
      }
    } catch (err) {
      console.error('Failed to load arena status:', err);
    }
  };

  const toggleArenaLiveStatus = async (targetLive: boolean) => {
    setIsUpdatingStatus(true);
    setStatusMsg(null);
    try {
      let token = authToken;
      if (!token) {
        try {
          const { supabase } = await import('@/lib/supabase/client');
          const { data } = await supabase.auth.getSession();
          token = data.session?.access_token;
        } catch {}
      }

      const res = await fetch('/api/arena/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          isLive: targetLive,
          maintenanceMessage: maintenanceMsg,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsArenaLive(data.isLive);
        setStatusUpdatedAt(data.updatedAt);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('kollabrix:arena_status_changed', { detail: { isLive: data.isLive } }));
          try {
            localStorage.setItem('kollabrix_arena_is_live', String(data.isLive));
          } catch {}
        }
        setStatusMsg({
          text: data.message || `Arena status updated to ${data.isLive ? 'LIVE' : 'MAINTENANCE'}`,
          type: 'success',
        });
      } else {
        setStatusMsg({ text: data.error || 'Failed to update arena status', type: 'error' });
      }
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Network error updating arena status', type: 'error' });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const saveMaintenanceNotice = async () => {
    setIsUpdatingStatus(true);
    setStatusMsg(null);
    try {
      let token = authToken;
      if (!token) {
        try {
          const { supabase } = await import('@/lib/supabase/client');
          const { data } = await supabase.auth.getSession();
          token = data.session?.access_token;
        } catch {}
      }

      const res = await fetch('/api/arena/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          isLive: isArenaLive,
          maintenanceMessage: maintenanceMsg,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg({ text: 'Maintenance message saved successfully!', type: 'success' });
      } else {
        setStatusMsg({ text: data.error || 'Failed to save maintenance message', type: 'error' });
      }
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Network error saving notice', type: 'error' });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchArenaStatus();
  }, []);

  const handleSaveNewQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setStatusMsg({ text: 'Please provide a title for the duel question.', type: 'error' });
      return;
    }

    setIsSaving(true);
    setStatusMsg(null);

    const isWeb = newArena === 'web_dev' || (newArena === 'bug_hunt' && newBugDomain === 'web');
    const parsedTags = newTags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
    const hasAnyWebTag = parsedTags.some((t) => ['html', 'css', 'javascript', 'js'].includes(t));
    const showHtml = hasAnyWebTag ? parsedTags.includes('html') : true;
    const showCss = hasAnyWebTag ? parsedTags.includes('css') : true;
    const showJs = hasAnyWebTag ? (parsedTags.includes('javascript') || parsedTags.includes('js')) : false;

    const hasAnyAlgoTag = parsedTags.some((t) => ['python', 'java', 'cpp', 'c++'].includes(t));
    const showPython = hasAnyAlgoTag ? parsedTags.includes('python') : true;
    const showJava = hasAnyAlgoTag ? parsedTags.includes('java') : true;
    const showCpp = hasAnyAlgoTag ? (parsedTags.includes('cpp') || parsedTags.includes('c++')) : true;

    // For Web Dev, automated test cases are derived strictly from active tags
    let finalTestCases = testCasesList.filter((tc) => tc.input.trim() || tc.expectedOutput.trim());
    if (isWeb) {
      finalTestCases = [];
      if (showHtml) {
        finalTestCases.push({
          input: 'htmlWordsAndStructure',
          expectedOutput: 'true',
          description: 'Semantic HTML Structure & Content / Word Spelling Alignment',
        });
      }
      if (showCss) {
        finalTestCases.push({
          input: 'cssCoordinatesAndLayout',
          expectedOutput: 'true',
          description: 'CSS Spatial Coordinates & Layout Graph (±30% Tolerance)',
        });
      }
      if (showJs) {
        finalTestCases.push({
          input: 'jsInteractiveBehavior',
          expectedOutput: 'true',
          description: 'JavaScript DOM Interactivity & Event Handlers',
        });
      }
      if (finalTestCases.length === 0) {
        finalTestCases.push({
          input: 'htmlWordsAndStructure',
          expectedOutput: 'true',
          description: 'Semantic HTML Structure & Content / Word Spelling Alignment',
        });
      }
    } else if (finalTestCases.length === 0) {
      finalTestCases = [
        {
          input: newSampleInput || 'sampleInput',
          expectedOutput: newSampleOutput || 'sampleOutput',
          description: 'Automated evaluation check',
        },
      ];
    }

    const questionPayload: DuelQuestion = {
      id: `q-${Date.now()}`,
      arena: newArena,
      title: newTitle.trim(),
      description: newDesc.trim(),
      tags: parsedTags,
      difficulty: newDifficulty,
      timeLimitSeconds: Number(newTimeLimit) || 300,
      bugDomain: newArena === 'bug_hunt' ? newBugDomain : undefined,
      codeWithBug: newArena === 'bug_hunt' ? newCodeWithBug : undefined,
      targetPreviewTitle: newTitle.trim(),
      targetComponentHtml: showHtml ? newTargetHtml : '',
      targetComponentCss: showCss ? newTargetCss : '',
      targetComponentJs: showJs ? newTargetJs : '',
      starterHtml: showHtml ? newStarterHtml : '',
      starterCss: showCss ? newStarterCss : '',
      starterJs: showJs ? newStarterJs : '',
      starterPython: showPython ? newStarterPython : '',
      starterJava: showJava ? newStarterJava : '',
      starterCpp: showCpp ? newStarterCpp : '',
      sampleInput: newSampleInput,
      sampleOutput: newSampleOutput,
      testCases: finalTestCases,
      validationCriteria: isWeb
        ? [
            showHtml && 'Word & spelling fidelity',
            showCss && 'Bounding box coordinate match (±30%)',
            showJs && 'Interactive DOM event execution',
            'Zero console syntax crash',
          ].filter(Boolean) as string[]
        : ['Clean code structure', 'Zero runtime crash', 'Test cases passed'],
    };

    try {
      let activeToken = authToken;
      if (!activeToken) {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          activeToken = sessionData?.session?.access_token;
        } catch {}
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

      const res = await fetch('/api/arena/questions', {
        method: 'POST',
        headers,
        body: JSON.stringify(questionPayload),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMsg({ text: 'Question published to server live question bank!', type: 'success' });
        setQuestions((prev) => [questionPayload, ...prev]);
        setIsAddingNew(false);
        setNewTitle('');
        setNewDesc('');
      } else {
        setStatusMsg({ text: data.error || 'Failed to save question', type: 'error' });
      }
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Network error saving question', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to permanently delete this duel question from the server?')) return;
    try {
      let activeToken = authToken;
      if (!activeToken) {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          activeToken = sessionData?.session?.access_token;
        } catch {}
      }

      const headers: Record<string, string> = {};
      if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

      const res = await fetch(`/api/arena/questions?id=${questionId}`, {
        method: 'DELETE',
        headers,
      });

      const data = await res.json();
      if (data.success) {
        try {
          const localDel = JSON.parse(localStorage.getItem('tf_deleted_arena_q_ids') || '[]');
          localDel.push(questionId);
          localStorage.setItem('tf_deleted_arena_q_ids', JSON.stringify(localDel));
        } catch {}

        setQuestions((prev) => prev.filter((q) => q.id !== questionId));
        setStatusMsg({ text: 'Question removed from live arena question bank!', type: 'success' });
        setTimeout(() => {
          fetchQuestions();
        }, 100);
      } else {
        setStatusMsg({ text: data.error || 'Failed to delete question', type: 'error' });
      }
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Error deleting question', type: 'error' });
    }
  };

  const filteredQuestions = questions.filter((q) => {
    if (selectedArena !== 'all' && q.arena !== selectedArena) return false;
    if (selectedTag !== 'all' && !q.tags.includes(selectedTag)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-charcoal-900 border border-rose-500/20 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Zap className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              2v2 Multiplayer Battleground & Question Engine
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-300">
            Real-time code duels ("Chess.com for Developers") with live fighting laptop in navbar, voxel shatter transition, and anti-cheat Fog of War.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Test Trigger */}
          <button
            type="button"
            onClick={() => setIsTestLobbyOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-mono text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Test Live Battle Arena</span>
          </button>

          <button
            type="button"
            onClick={() => {
              fetchQuestions();
              fetchArenaStatus();
            }}
            disabled={isLoading}
            className="p-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-slate-300 hover:text-white transition-colors"
            title="Refresh questions & arena status"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ================= ARENA LIVE / MAINTENANCE MASTER CONTROLLER ================= */}
      <div
        className={`p-6 rounded-2xl border backdrop-blur-md transition-all shadow-xl ${
          isArenaLive
            ? 'bg-gradient-to-br from-emerald-950/30 via-slate-900/90 to-charcoal-900 border-emerald-500/40 shadow-emerald-950/30'
            : 'bg-gradient-to-br from-rose-950/40 via-slate-900/90 to-charcoal-900 border-rose-500/50 shadow-rose-950/40'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Master Status Indicator & Action */}
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 ${
                  isArenaLive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isArenaLive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500 animate-ping'
                  }`}
                />
                {isArenaLive ? 'BATTLE ARENA: LIVE (PUBLIC)' : 'BATTLE ARENA: OFFLINE (MAINTENANCE)'}
              </span>
              {statusUpdatedAt && (
                <span className="text-[11px] font-mono text-slate-400">
                  Updated: {new Date(statusUpdatedAt).toLocaleTimeString()}
                </span>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {isArenaLive
                  ? 'Battle Arena is Live for All Students'
                  : 'Battle Arena is Suspended in Maintenance Mode'}
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {isArenaLive
                  ? 'Students can launch 1v1 and 2v2 duels from the navbar arcade laptop and direct /arena link. Matchmaking and compiler clusters are publicly active.'
                  : 'Public access is restricted. Visitors to /arena see the high-tech maintenance screen with your custom announcement message.'}
              </p>
            </div>

            {/* Master Action Button */}
            <div className="pt-1 flex items-center gap-3">
              {isArenaLive ? (
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => toggleArenaLiveStatus(false)}
                  className="px-4 py-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-mono text-xs font-bold transition-all flex items-center gap-2 shadow-lg hover:shadow-rose-500/20 active:scale-95 disabled:opacity-50"
                >
                  <Power className="w-4 h-4" />
                  <span>{isUpdatingStatus ? 'Updating...' : 'Set Arena to Maintenance Mode (Take Offline)'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => toggleArenaLiveStatus(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 font-mono text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-95 disabled:opacity-50"
                >
                  <Power className="w-4 h-4 fill-current" />
                  <span>{isUpdatingStatus ? 'Updating...' : '⚡ Bring Battle Arena Live to Public Now'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Right: Maintenance Notice Configuration */}
          <div className="lg:w-96 p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                <span>Maintenance Notice</span>
              </label>
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={saveMaintenanceNotice}
                className="px-2.5 py-1 rounded-lg bg-cyan-600/80 hover:bg-cyan-600 text-white font-mono text-[11px] font-bold transition-all disabled:opacity-50"
              >
                {isUpdatingStatus ? 'Saving...' : 'Save Notice'}
              </button>
            </div>
            <textarea
              rows={2}
              value={maintenanceMsg}
              onChange={(e) => setMaintenanceMsg(e.target.value)}
              placeholder="Enter message shown to visitors when offline..."
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono focus:border-cyan-400 focus:outline-none resize-none"
            />
            <p className="text-[10px] text-slate-400 font-mono">
              This message appears in the terminal modal when students attempt to access Battle Arena while offline.
            </p>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
          }`}
        >
          {statusMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Filter and Add Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-charcoal-900 border border-charcoal-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-400 font-semibold mr-1">Arena:</span>
          {(['all', 'web_dev', 'algorithms', 'bug_hunt'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedArena(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedArena === cat
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-charcoal-800 text-slate-300 hover:bg-charcoal-750'
              }`}
            >
              {cat === 'all' ? 'All Arenas' : cat === 'web_dev' ? 'Web Dev' : cat === 'algorithms' ? 'DSA' : 'Bug Hunt'}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsAddingNew(!isAddingNew)}
          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isAddingNew ? 'Close Form' : 'Add New Duel Question'}</span>
        </button>
      </div>

      {/* New Question Form */}
      {isAddingNew && (() => {
        const isWebAdminMode = newArena === 'web_dev' || (newArena === 'bug_hunt' && newBugDomain === 'web');
        const isAlgoAdminMode = newArena === 'algorithms' || (newArena === 'bug_hunt' && newBugDomain === 'logic');

        const parsedCurrentTags = newTags
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean);

        const hasAnyWebTag = parsedCurrentTags.some((t) => ['html', 'css', 'javascript', 'js'].includes(t));
        const showWebHtml = hasAnyWebTag ? parsedCurrentTags.includes('html') : true;
        const showWebCss = hasAnyWebTag ? parsedCurrentTags.includes('css') : true;
        const showWebJs = hasAnyWebTag ? (parsedCurrentTags.includes('javascript') || parsedCurrentTags.includes('js')) : false;

        const hasAnyAlgoTag = parsedCurrentTags.some((t) => ['python', 'java', 'cpp', 'c++'].includes(t));
        const showAlgoPython = hasAnyAlgoTag ? parsedCurrentTags.includes('python') : true;
        const showAlgoJava = hasAnyAlgoTag ? parsedCurrentTags.includes('java') : true;
        const showAlgoCpp = hasAnyAlgoTag ? (parsedCurrentTags.includes('cpp') || parsedCurrentTags.includes('c++')) : true;

        const visibleWebFieldsCount = (showWebHtml ? 1 : 0) + (showWebCss ? 1 : 0) + (showWebJs ? 1 : 0);
        const webFieldsGridClass =
          visibleWebFieldsCount === 1
            ? 'grid-cols-1'
            : visibleWebFieldsCount === 2
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-1 md:grid-cols-3';

        const visibleAlgoFieldsCount = (showAlgoPython ? 1 : 0) + (showAlgoJava ? 1 : 0) + (showAlgoCpp ? 1 : 0);
        const algoFieldsGridClass =
          visibleAlgoFieldsCount === 1
            ? 'grid-cols-1'
            : visibleAlgoFieldsCount === 2
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-1 md:grid-cols-3';

        const handleToggleTag = (tag: string) => {
          const list = newTags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
          let nextList: string[];
          if (list.includes(tag.toLowerCase())) {
            nextList = list.filter((t) => t !== tag.toLowerCase());
            if (nextList.length === 0) {
              nextList = [tag.toLowerCase()];
            }
          } else {
            nextList = [...list, tag.toLowerCase()];
          }
          setNewTags(nextList.join(', '));
        };

        return (
        <form onSubmit={handleSaveNewQuestion} className="p-5 rounded-2xl bg-charcoal-900 border border-rose-500/30 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-rose-400" />
              <span>Create New Arena Duel Question</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Published directly to server</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Question Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Modern Glassmorphism Pricing Card"
                className="w-full px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-750 text-white text-xs focus:border-rose-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Arena Category</label>
              <select
                value={newArena}
                onChange={(e) => setNewArena(e.target.value as ArenaCategory)}
                className="w-full px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-750 text-white text-xs focus:border-rose-500 focus:outline-none"
              >
                <option value="web_dev">Web Development (HTML / CSS / JS)</option>
                <option value="algorithms">Algorithms & DSA (Java / Python / C++)</option>
                <option value="bug_hunt">Bug Hunt (Web UI / Logic & Code)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-300">Tags (comma-separated)</label>
                <span className="text-[10px] font-mono text-cyan-400">Controls visible fields</span>
              </div>
              <input
                type="text"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="html,css,javascript"
                className="w-full px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-750 text-white text-xs font-mono focus:border-rose-500 focus:outline-none"
              />
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] font-mono text-slate-400">Quick Tags:</span>
                {isWebAdminMode && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleToggleTag('html')}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all border ${
                        showWebHtml
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-charcoal-950 text-slate-500 border-charcoal-800 hover:text-slate-300'
                      }`}
                    >
                      {showWebHtml ? '✓' : '+'} html
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleTag('css')}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all border ${
                        showWebCss
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                          : 'bg-charcoal-950 text-slate-500 border-charcoal-800 hover:text-slate-300'
                      }`}
                    >
                      {showWebCss ? '✓' : '+'} css
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleTag('javascript')}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all border ${
                        showWebJs
                          ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
                          : 'bg-charcoal-950 text-slate-500 border-charcoal-800 hover:text-slate-300'
                      }`}
                    >
                      {showWebJs ? '✓' : '+'} javascript
                    </button>
                  </>
                )}
                {isAlgoAdminMode && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleToggleTag('python')}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all border ${
                        showAlgoPython
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                          : 'bg-charcoal-950 text-slate-500 border-charcoal-800 hover:text-slate-300'
                      }`}
                    >
                      {showAlgoPython ? '✓' : '+'} python
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleTag('java')}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all border ${
                        showAlgoJava
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-charcoal-950 text-slate-500 border-charcoal-800 hover:text-slate-300'
                      }`}
                    >
                      {showAlgoJava ? '✓' : '+'} java
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleTag('cpp')}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all border ${
                        showAlgoCpp
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                          : 'bg-charcoal-950 text-slate-500 border-charcoal-800 hover:text-slate-300'
                      }`}
                    >
                      {showAlgoCpp ? '✓' : '+'} c++
                    </button>
                  </>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Difficulty</label>
              <select
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-750 text-white text-xs focus:border-rose-500 focus:outline-none"
              >
                <option value="easy">Easy (100 PTS)</option>
                <option value="medium">Medium (250 PTS)</option>
                <option value="hard">Hard (500 PTS)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Time Limit (Seconds)</label>
              <input
                type="number"
                value={newTimeLimit}
                onChange={(e) => setNewTimeLimit(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-750 text-white text-xs font-mono focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Challenge Description & Objective</label>
            <textarea
              rows={2}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Describe the target UI component or logic players must build..."
              className="w-full px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-750 text-white text-xs focus:border-rose-500 focus:outline-none"
            />
          </div>

          {/* Bug Hunt Domain & Language Selector for Admin */}
          {newArena === 'bug_hunt' && (
            <div className="p-3.5 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-3">
              <div>
                <label className="block text-xs font-medium text-rose-400 font-mono mb-1">
                  Bug Hunt Domain & Mode:
                </label>
                <div className="flex flex-wrap gap-4 text-xs font-mono">
                  <label className="flex items-center gap-2 cursor-pointer text-white">
                    <input
                      type="radio"
                      name="bugDomain"
                      value="web"
                      checked={newBugDomain === 'web'}
                      onChange={() => {
                        setNewBugDomain('web');
                        setNewTags('html,css');
                      }}
                      className="text-rose-500 focus:ring-rose-500"
                    />
                    <span>Web UI Bug (Visual layout with Target Preview & Output)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-white">
                    <input
                      type="radio"
                      name="bugDomain"
                      value="logic"
                      checked={newBugDomain === 'logic'}
                      onChange={() => {
                        setNewBugDomain('logic');
                        setNewTags('java');
                      }}
                      className="text-rose-500 focus:ring-rose-500"
                    />
                    <span>Logic & Code Bug (Python / Java / C++ with Real Compiler)</span>
                  </label>
                </div>
              </div>

              {/* Specific Bug Language Selection */}
              <div className="pt-2 border-t border-charcoal-800">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider">
                    Target Language Bug to Fix ({newBugDomain === 'web' ? 'Web UI' : 'Logic Code'}):
                  </label>
                  {newBugDomain === 'web' && (
                    <span className="text-[10px] font-mono text-cyan-400">
                      Multi-select: Tick 1, 2, or all 3
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  {(newBugDomain === 'web'
                    ? [
                        { id: 'html', label: 'HTML' },
                        { id: 'css', label: 'CSS' },
                        { id: 'javascript', label: 'JavaScript' },
                      ]
                    : [
                        { id: 'java', label: 'Java' },
                        { id: 'python', label: 'Python' },
                        { id: 'cpp', label: 'C++' },
                      ]
                  ).map((lang) => {
                    const currentTagsList = newTags
                      .split(',')
                      .map((t) => t.trim().toLowerCase())
                      .filter(Boolean);
                    const isSelected = currentTagsList.includes(lang.id);
                    return (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => {
                          if (newBugDomain === 'web') {
                            // Multi-select for Web UI Bug Hunt (can tick 1, 2, or 3)
                            let updated: string[];
                            if (isSelected) {
                              if (currentTagsList.length > 1) {
                                updated = currentTagsList.filter((t) => t !== lang.id);
                              } else {
                                updated = currentTagsList; // keep at least 1
                              }
                            } else {
                              updated = [...currentTagsList, lang.id];
                            }
                            setNewTags(updated.join(', '));
                          } else {
                            // Single-select for Logic Bug Hunt (only 1 tick)
                            setNewTags(lang.id);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg border font-mono text-xs uppercase font-bold transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? newBugDomain === 'web'
                              ? 'bg-cyan-600 text-white border-cyan-400 shadow-sm'
                              : 'bg-rose-500 text-white border-rose-400 shadow-sm'
                            : 'bg-charcoal-900 text-slate-400 border-charcoal-750 hover:text-white'
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 ${
                            newBugDomain === 'web' ? 'rounded-xs' : 'rounded-full'
                          } border flex items-center justify-center text-[9px] ${
                            isSelected
                              ? 'border-white bg-white/20 text-white font-bold'
                              : 'border-slate-600'
                          }`}
                        >
                          {isSelected ? '✓' : ''}
                        </span>
                        <span>{lang.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Starter Codes for Web or Web Bug Hunt (Dynamically filtered by tags) */}
          {isWebAdminMode && (
            <>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">
                    Starter Code Fields (Active Tags: {newTags || 'none'})
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">
                    Showing {visibleWebFieldsCount} field{visibleWebFieldsCount > 1 ? 's' : ''} based on tags
                  </span>
                </div>
                <div className={`grid ${webFieldsGridClass} gap-3`}>
                  {showWebHtml && (
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1 font-mono">
                        Starter HTML {newArena === 'bug_hunt' && '(Include Buggy HTML)'}
                      </label>
                      <textarea
                        rows={4}
                        value={newStarterHtml}
                        onChange={(e) => setNewStarterHtml(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-750 text-amber-200 text-xs font-mono focus:border-rose-500 focus:outline-none"
                      />
                    </div>
                  )}
                  {showWebCss && (
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1 font-mono">
                        Starter CSS {newArena === 'bug_hunt' && '(Include Buggy CSS)'}
                      </label>
                      <textarea
                        rows={4}
                        value={newStarterCss}
                        onChange={(e) => setNewStarterCss(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-750 text-cyan-200 text-xs font-mono focus:border-rose-500 focus:outline-none"
                      />
                    </div>
                  )}
                  {showWebJs && (
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1 font-mono">
                        Starter JavaScript {newArena === 'bug_hunt' && '(Include Buggy JS)'}
                      </label>
                      <textarea
                        rows={4}
                        value={newStarterJs}
                        onChange={(e) => setNewStarterJs(e.target.value)}
                        placeholder="// Optional starter JS..."
                        className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-750 text-yellow-200 text-xs font-mono focus:border-rose-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Target Component HTML, CSS & JavaScript (Visual Blueprint preview for Students) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">
                    Target Blueprint Fields (Active Tags: {newTags || 'none'})
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">
                    Showing {visibleWebFieldsCount} blueprint{visibleWebFieldsCount > 1 ? 's' : ''} based on tags
                  </span>
                </div>
                <div className={`grid ${webFieldsGridClass} gap-3`}>
                  {showWebHtml && (
                    <div>
                      <label className="block text-xs font-medium text-emerald-400 mb-1 font-mono">
                        Target HTML (Blueprint Structure):
                      </label>
                      <textarea
                        rows={5}
                        value={newTargetHtml}
                        onChange={(e) => setNewTargetHtml(e.target.value)}
                        placeholder="<div class='dashboard'>\n  <aside class='sidebar'>...</aside>\n</div>"
                        className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-750 text-emerald-200 text-xs font-mono focus:border-rose-500 focus:outline-none"
                      />
                    </div>
                  )}
                  {showWebCss && (
                    <div>
                      <label className="block text-xs font-medium text-cyan-400 mb-1 font-mono">
                        Target CSS (Blueprint Styling):
                      </label>
                      <textarea
                        rows={5}
                        value={newTargetCss}
                        onChange={(e) => setNewTargetCss(e.target.value)}
                        placeholder=".dashboard { display: flex; }\n.sidebar { width: 220px; background: #0f172a; }"
                        className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-750 text-cyan-200 text-xs font-mono focus:border-rose-500 focus:outline-none"
                      />
                    </div>
                  )}
                  {showWebJs && (
                    <div>
                      <label className="block text-xs font-medium text-amber-400 mb-1 font-mono">
                        Target JavaScript (Interactive Logic):
                      </label>
                      <textarea
                        rows={5}
                        value={newTargetJs}
                        onChange={(e) => setNewTargetJs(e.target.value)}
                        placeholder="// Target DOM interaction or click logic (optional)"
                        className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-750 text-amber-200 text-xs font-mono focus:border-rose-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1 font-mono">
                    Live Blueprint Preview (Sandboxed Isolated Iframe - No CSS Leak):
                  </label>
                  <div className="rounded-xl border border-charcoal-750 bg-white overflow-hidden min-h-[140px] max-h-56">
                    <iframe
                      title="Admin Blueprint Preview"
                      srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0;padding:16px;font-family:sans-serif;background:#ffffff;color:#000000;box-sizing:border-box;}*,*:before,*:after{box-sizing:inherit;}${showWebCss ? newTargetCss : ''}</style></head><body>${showWebHtml ? newTargetHtml : '<p>Blueprint Preview</p>'}<script>${showWebJs ? newTargetJs : ''}</script></body></html>`}
                      className="w-full h-full min-h-[140px] border-0 block"
                      sandbox="allow-scripts"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Starter Codes for Algorithms & Logic Bug Hunt (Dynamically filtered by tags) */}
          {isAlgoAdminMode && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">
                  Starter Code Fields (Active Tags: {newTags || 'none'})
                </span>
                <span className="text-[10px] font-mono text-cyan-400">
                  Showing {visibleAlgoFieldsCount} field{visibleAlgoFieldsCount > 1 ? 's' : ''} based on tags
                </span>
              </div>
              <div className={`grid ${algoFieldsGridClass} gap-3`}>
                {showAlgoPython && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1 font-mono">
                      Starter Python {newArena === 'bug_hunt' && '(With Bug)'}
                    </label>
                    <textarea
                      rows={5}
                      value={newStarterPython}
                      onChange={(e) => setNewStarterPython(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-750 text-cyan-200 text-xs font-mono focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                )}
                {showAlgoJava && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1 font-mono">
                      Starter Java {newArena === 'bug_hunt' && '(With Bug)'}
                    </label>
                    <textarea
                      rows={5}
                      value={newStarterJava}
                      onChange={(e) => setNewStarterJava(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-750 text-amber-200 text-xs font-mono focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                )}
                {showAlgoCpp && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1 font-mono">
                      Starter C++ {newArena === 'bug_hunt' && '(With Bug)'}
                    </label>
                    <textarea
                      rows={5}
                      value={newStarterCpp}
                      onChange={(e) => setNewStarterCpp(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-750 text-rose-200 text-xs font-mono focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FOR WEB DEV: Automated Spatial Coordinate Graph & Content Grading Specification */}
          {isWebAdminMode && (
            <div className="p-4 rounded-xl bg-charcoal-950 border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-charcoal-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    Automated Spatial Coordinate Graph & Content Grading Contract
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                  {visibleWebFieldsCount} Dynamic Auto Test{visibleWebFieldsCount > 1 ? 's' : ''} Active
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono leading-relaxed">
                Test cases strictly match tags ({newTags}). Students must pass all {visibleWebFieldsCount} test{visibleWebFieldsCount > 1 ? 's' : ''} to submit and claim victory:
              </p>
              <div className={`grid ${webFieldsGridClass} gap-2 text-xs font-mono`}>
                {showWebHtml && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/30 space-y-1">
                    <div className="flex items-center justify-between text-amber-400 font-bold">
                      <span>Test Case #1</span>
                      <span className="text-[10px] uppercase bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">HTML Words & Tags</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Validates semantic HTML tags, DOM hierarchy, and exact word spelling alignment against the blueprint.
                    </p>
                  </div>
                )}

                {showWebCss && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/30 space-y-1">
                    <div className="flex items-center justify-between text-cyan-400 font-bold">
                      <span>Test Case #{showWebHtml ? 2 : 1}</span>
                      <span className="text-[10px] uppercase bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">CSS Coordinates</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Calculates spatial bounding box coordinates (width, height, flex/grid positions) with lenient ±30% tolerance.
                    </p>
                  </div>
                )}

                {showWebJs && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-1">
                    <div className="flex items-center justify-between text-emerald-400 font-bold">
                      <span>Test Case #{(showWebHtml ? 1 : 0) + (showWebCss ? 1 : 0) + 1}</span>
                      <span className="text-[10px] uppercase bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">JS DOM Logic</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Runs DOM interaction and event handlers to verify dynamic behavior matches the target script.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FOR ALGORITHMS & LOGIC BUG HUNT: Manual Compiler Test Cases Builder */}
          {(newArena === 'algorithms' || (newArena === 'bug_hunt' && newBugDomain === 'logic')) && (
            <div className="p-4 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-charcoal-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    Automated Verification Test Cases ({testCasesList.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddTestCase}
                  className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Test Case</span>
                </button>
              </div>

              <div className="space-y-3">
                {testCasesList.map((tc, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-750 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-slate-300">
                        Test Case #{idx + 1}
                      </span>
                      {testCasesList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTestCase(idx)}
                          className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Remove test case"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 mb-1">
                          Input (Arguments / Stdin Data):
                        </label>
                        <input
                          type="text"
                          value={tc.input}
                          onChange={(e) => handleUpdateTestCase(idx, 'input', e.target.value)}
                          placeholder="e.g. nums = [3, 1, 2, 4]"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-charcoal-950 border border-charcoal-700 text-cyan-300 text-xs font-mono focus:border-rose-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 mb-1">
                          Expected Output / Assertion:
                        </label>
                        <input
                          type="text"
                          value={tc.expectedOutput}
                          onChange={(e) => handleUpdateTestCase(idx, 'expectedOutput', e.target.value)}
                          placeholder="e.g. [2, 4, 3, 1]"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-charcoal-950 border border-charcoal-700 text-emerald-400 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 mb-1">
                        Objective / Description:
                      </label>
                      <input
                        type="text"
                        value={tc.description}
                        onChange={(e) => handleUpdateTestCase(idx, 'description', e.target.value)}
                        placeholder="e.g. Even and odd parity separation"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-charcoal-950 border border-charcoal-700 text-slate-300 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-4 py-2 rounded-xl bg-charcoal-800 text-slate-300 text-xs font-semibold hover:bg-charcoal-750 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Publishing...' : 'Save & Publish Question'}</span>
            </button>
          </div>
        </form>
        );
      })()}

      {/* Questions List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
          <span>Active Questions ({filteredQuestions.length})</span>
          <span>Automatic random matchmaking based on tags</span>
        </div>

        {filteredQuestions.map((q) => (
          <div
            key={q.id}
            className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 hover:border-charcoal-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-white text-sm">{q.title}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-charcoal-800 border border-charcoal-700 text-slate-300">
                  {q.arena}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    q.difficulty === 'easy'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : q.difficulty === 'medium'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}
                >
                  {q.difficulty}
                </span>
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {Math.round(q.timeLimitSeconds / 60)}m
                </span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-1">{q.description}</p>
              <div className="flex items-center gap-1.5 pt-1">
                {q.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-charcoal-950 border border-charcoal-750 text-slate-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900 px-2 py-1 rounded-md">
                {q.testCases?.length || 3} Test Cases
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedTestQuestion(q);
                  setIsTestLobbyOpen(true);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs hover:scale-105 active:scale-95"
                title="Play & Test this specific question in Battle Arena"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Play</span>
              </button>
              <button
                type="button"
                onClick={() => handleDeleteQuestion(q.id)}
                className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 transition-colors flex items-center justify-center cursor-pointer"
                title="Delete Question"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isTestLobbyOpen && (
        <FullArenaExperience
          onClose={() => {
            setIsTestLobbyOpen(false);
            setSelectedTestQuestion(null);
          }}
          initialQuestion={selectedTestQuestion || undefined}
          currentUser={{
            displayName: 'Admin Tester',
            username: 'admin',
          }}
        />
      )}
    </div>
  );
}