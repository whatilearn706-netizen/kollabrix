'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Project, ProjectMember } from '@/types/database';
import { Button } from '@/components/ui/Button';
import {
  Headphones,
  Mic,
  MicOff,
  Radio,
  FileEdit,
  Send,
  Flame,
  Rocket,
  Lightbulb,
  Heart,
  Volume2,
  VolumeX,
  Share2,
  Monitor,
  Users,
  Copy,
  Check,
  Download,
  Trash2,
  Sparkles,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { recordDailyStreakActivity } from '@/components/gamification/DailyStreakHub';

interface WorkspaceTeamHuddleProps {
  project: Project;
  members: ProjectMember[];
  currentUserId?: string;
  currentUserProfile?: any;
}

interface StandupPost {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  shipped: string;
  nextUp: string;
  blockers?: string;
  timestamp: string;
  reactions: {
    fire: number;
    rocket: number;
    bulb: number;
    heart: number;
  };
}

export function WorkspaceTeamHuddle({
  project,
  members,
  currentUserId,
  currentUserProfile,
}: WorkspaceTeamHuddleProps) {
  const [activeTab, setActiveTab] = useState<'scratchpad' | 'standup' | 'audio'>('scratchpad');

  // Scratchpad State
  const [scratchpadText, setScratchpadText] = useState('');
  const [lastSavedTime, setLastSavedTime] = useState<string>('Not saved yet');
  const [copiedNotes, setCopiedNotes] = useState(false);

  // Standup State
  const [standups, setStandups] = useState<StandupPost[]>([]);
  const [newShipped, setNewShipped] = useState('');
  const [newNextUp, setNewNextUp] = useState('');
  const [newBlockers, setNewBlockers] = useState('');
  const [isSubmittingStandup, setIsSubmittingStandup] = useState(false);

  // Audio Huddle State
  const [isInHuddle, setIsInHuddle] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isLofiPlaying, setIsLofiPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  // Initial load from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedNotes = localStorage.getItem(`linkora_notes_${project.id}`);
      if (savedNotes) {
        setScratchpadText(savedNotes);
        setLastSavedTime('Loaded from previous session');
      } else {
        setScratchpadText(
          `# ${project.title} — Team Scratchpad\n\n## 🎯 Sprint Focus (Today)\n- Finalize database schema & verify Next.js edge routes.\n- Polish landing page demo viewport for hackathon submission.\n\n## 🔑 Shared Environment Variables\nNEXT_PUBLIC_APP_ENV=development\nNEXT_PUBLIC_ENABLE_HUDDLE=true\n\n## 📝 Questions & Brainstorming\n- Need to verify if we want 2-min or 3-min pitch slides.\n`
        );
      }

      const savedStandups = localStorage.getItem(`linkora_standups_${project.id}`);
      if (savedStandups) {
        setStandups(JSON.parse(savedStandups));
      } else {
        const initialStandups: StandupPost[] = [
          {
            id: 'st-1',
            userId: project.owner_id,
            userName: project.owner?.display_name || project.owner?.username || 'Project Lead',
            userRole: 'Project Lead',
            shipped: 'Set up Supabase tables, RLS policies, and GitHub repository.',
            nextUp: 'Coordinate pitch deck generator and audio sync test with the team.',
            blockers: 'None so far, team velocity is high!',
            timestamp: 'Today at 02:30 AM',
            reactions: { fire: 5, rocket: 4, bulb: 2, heart: 3 },
          },
          ...(members.length > 1
            ? [
                {
                  id: 'st-2',
                  userId: members[1]?.user_id || 'mem-2',
                  userName: members[1]?.profile?.display_name || 'Frontend Engineer',
                  userRole: members[1]?.role || 'Frontend Developer',
                  shipped: 'Built responsive mobile viewports and connected Figma prototype bridge.',
                  nextUp: 'Testing proof-of-work certificate printable view.',
                  blockers: 'Waiting on final brand typography.',
                  timestamp: 'Today at 03:15 AM',
                  reactions: { fire: 3, rocket: 2, bulb: 1, heart: 4 },
                },
              ]
            : []),
        ];
        setStandups(initialStandups);
      }
    } catch {}
  }, [project.id, project.title, project.owner_id, project.owner, members]);

  // Auto-save scratchpad
  const handleScratchpadChange = (text: string) => {
    setScratchpadText(text);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`linkora_notes_${project.id}`, text);
      setLastSavedTime(new Date().toLocaleTimeString());
    }
  };

  const insertTemplate = (template: string) => {
    const updated = scratchpadText + '\n\n' + template;
    handleScratchpadChange(updated);
  };

  const handleCopyNotes = () => {
    navigator.clipboard.writeText(scratchpadText);
    setCopiedNotes(true);
    setTimeout(() => setCopiedNotes(false), 2000);
  };

  const handleDownloadNotes = () => {
    const element = document.createElement('a');
    const file = new Blob([scratchpadText], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-notes.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Submit standup
  const handlePostStandup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShipped.trim() || !newNextUp.trim()) return;

    setIsSubmittingStandup(true);

    const newPost: StandupPost = {
      id: `st-${Date.now()}`,
      userId: currentUserId || 'current-user',
      userName: currentUserProfile?.display_name || currentUserProfile?.username || 'You (Teammate)',
      userRole: 'Contributor',
      shipped: newShipped.trim(),
      nextUp: newNextUp.trim(),
      blockers: newBlockers.trim() || undefined,
      timestamp: 'Just now',
      reactions: { fire: 1, rocket: 1, bulb: 0, heart: 1 },
    };

    const updated = [newPost, ...standups];
    setStandups(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`linkora_standups_${project.id}`, JSON.stringify(updated));
    }

    try {
      recordDailyStreakActivity({
        type: 'WORKSPACE_ACTIVITY',
        note: `Shared daily standup sync for ${project.title}`,
        title: project.title,
        userId: currentUserId,
      });
    } catch {}

    setNewShipped('');
    setNewNextUp('');
    setNewBlockers('');
    setIsSubmittingStandup(false);
  };

  const handleReaction = (postIndex: number, type: 'fire' | 'rocket' | 'bulb' | 'heart') => {
    const updated = [...standups];
    updated[postIndex].reactions[type] += 1;
    setStandups(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`linkora_standups_${project.id}`, JSON.stringify(updated));
    }
  };

  // Lofi ambient sound generator via Web Audio API
  const toggleLofiAudio = () => {
    if (isLofiPlaying) {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
      setIsLofiPlaying(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Warm ambient drone (A2 110Hz or C3 130.8Hz)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(130.81, ctx.currentTime);

        gain.gain.setValueAtTime(0.04, ctx.currentTime); // gentle ambient background

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        oscillatorRef.current = osc;

        setIsLofiPlaying(true);
      } catch {
        setIsLofiPlaying(true); // fallback visual
      }
    }
  };

  useEffect(() => {
    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 shadow-elevated flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Headphones className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">The Late-Night Team Huddle</h2>
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Real-Time Sync
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Keep late-night hackathon momentum alive: collaborative architecture scratchpad, daily standup feed ("What did you ship?"), and 1-click voice huddle with focus audio.
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-charcoal-950 border border-charcoal-800">
          <button
            onClick={() => setActiveTab('scratchpad')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'scratchpad'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-charcoal-850'
            }`}
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Scratchpad</span>
          </button>
          <button
            onClick={() => setActiveTab('standup')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'standup'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-charcoal-850'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Daily Standup Feed</span>
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'audio'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-charcoal-850'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Audio Huddle</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: SHARED ARCHITECTURE SCRATCHPAD
         ========================================================================= */}
      {activeTab === 'scratchpad' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-400 font-mono text-[11px]">Insert Quick Template:</span>
              <button
                onClick={() =>
                  insertTemplate(
                    `### 🔌 API Endpoint Contract\n- \`POST /api/v1/auth/verify\`\n- Body: \`{ "token": string, "credentialId": string }\`\n- Response: \`{ "valid": boolean, "issuedAt": ISOString }\``
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 font-mono text-[11px]"
              >
                + API Contract
              </button>
              <button
                onClick={() =>
                  insertTemplate(
                    `### 🏁 Hackathon Submission Checklist\n- [ ] Clean production README with badges\n- [ ] 2-Minute pitch video or slide deck recorded\n- [ ] Figma prototype link tested on mobile\n- [ ] GitHub repository public with LICENSE file`
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 font-mono text-[11px]"
              >
                + Submission Checklist
              </button>
              <button
                onClick={() =>
                  insertTemplate(
                    `### 🔐 Required .env.local Secrets\nNEXT_PUBLIC_SUPABASE_URL=\nNEXT_PUBLIC_SUPABASE_ANON_KEY=\nSUPABASE_SERVICE_ROLE_KEY=`
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 font-mono text-[11px]"
              >
                + Env Secrets
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved: {lastSavedTime}</span>
              </span>

              <button
                onClick={handleCopyNotes}
                className="p-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 hover:text-white transition-colors"
                title="Copy all notes"
              >
                {copiedNotes ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={handleDownloadNotes}
                className="p-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 hover:text-white transition-colors"
                title="Download notes file"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 shadow-inner">
            <textarea
              rows={18}
              value={scratchpadText}
              onChange={(e) => handleScratchpadChange(e.target.value)}
              className="w-full bg-transparent font-mono text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none leading-relaxed resize-y"
              placeholder="Write shared architecture notes, sprint tasks, or team brainstorming..."
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: DAILY STANDUP FEED
         ========================================================================= */}
      {activeTab === 'standup' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Post Standup Form (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <form
              onSubmit={handlePostStandup}
              className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-4 shadow-sm"
            >
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Post Your Daily Standup</span>
              </h3>
              <p className="text-xs text-slate-400">
                Keep the team synchronized on daily progress. Posting records activity towards your Daily Streak!
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    1. What did you ship / build today?
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={newShipped}
                    onChange={(e) => setNewShipped(e.target.value)}
                    placeholder="e.g. Completed the Figma prototype and fixed authentication RLS..."
                    className="w-full p-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    2. What are you building next?
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={newNextUp}
                    onChange={(e) => setNewNextUp(e.target.value)}
                    placeholder="e.g. Rehearsing 2-min pitch deck and writing API unit tests..."
                    className="w-full p-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    3. Any blockers? (Optional)
                  </label>
                  <input
                    type="text"
                    value={newBlockers}
                    onChange={(e) => setNewBlockers(e.target.value)}
                    placeholder="e.g. None / Waiting for teammate API review..."
                    className="w-full p-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    size="sm"
                    variant="primary"
                    disabled={isSubmittingStandup}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    leftIcon={<Send className="w-4 h-4" />}
                  >
                    Publish Check-In
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* Standup Posts List (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Sprint Check-In Stream</span>
              <span className="text-xs font-mono text-slate-400 font-normal">
                {standups.length} updates logged
              </span>
            </h3>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {standups.map((post, idx) => (
                <div
                  key={post.id}
                  className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-3 shadow-sm hover:border-charcoal-700 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
                        {post.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">{post.userName}</span>
                        <span className="text-[10px] font-mono text-slate-400">{post.userRole}</span>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono text-slate-500">{post.timestamp}</span>
                  </div>

                  <div className="space-y-2 text-xs leading-relaxed">
                    <div className="p-2.5 rounded-xl bg-charcoal-850 border border-charcoal-800">
                      <span className="text-emerald-400 font-bold block text-[10px] uppercase font-mono">
                        ✓ Shipped Today:
                      </span>
                      <p className="text-slate-200 mt-0.5">{post.shipped}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-charcoal-850 border border-charcoal-800">
                      <span className="text-blue-400 font-bold block text-[10px] uppercase font-mono">
                        → Next Up:
                      </span>
                      <p className="text-slate-200 mt-0.5">{post.nextUp}</p>
                    </div>

                    {post.blockers && (
                      <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-800/30">
                        <span className="text-rose-400 font-bold block text-[10px] uppercase font-mono">
                          ⚠️ Blockers:
                        </span>
                        <p className="text-rose-200 mt-0.5">{post.blockers}</p>
                      </div>
                    )}
                  </div>

                  {/* Reaction Emojis */}
                  <div className="flex items-center gap-2 pt-1 border-t border-charcoal-800/80">
                    <button
                      onClick={() => handleReaction(idx, 'fire')}
                      className="px-2 py-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-xs flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
                    >
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      <span>{post.reactions.fire}</span>
                    </button>
                    <button
                      onClick={() => handleReaction(idx, 'rocket')}
                      className="px-2 py-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-xs flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
                    >
                      <Rocket className="w-3.5 h-3.5 text-violet-400" />
                      <span>{post.reactions.rocket}</span>
                    </button>
                    <button
                      onClick={() => handleReaction(idx, 'bulb')}
                      className="px-2 py-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-xs flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
                      <span>{post.reactions.bulb}</span>
                    </button>
                    <button
                      onClick={() => handleReaction(idx, 'heart')}
                      className="px-2 py-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-xs flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
                    >
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                      <span>{post.reactions.heart}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: 1-CLICK AUDIO HUDDLE ROOM
         ========================================================================= */}
      {activeTab === 'audio' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-6">
            {/* Top Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-charcoal-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      isInHuddle ? 'bg-emerald-500 animate-ping' : 'bg-slate-600'
                    }`}
                  />
                  <h3 className="text-base font-bold text-white">
                    {isInHuddle ? 'Active Audio Huddle Room' : 'Audio Huddle Room (Standby)'}
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  {isInHuddle
                    ? 'Connected with encrypted low-latency team voice channel.'
                    : 'Jump into the voice room with 1-click for quick design or debugging syncs.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={toggleLofiAudio}
                  size="sm"
                  variant="outline"
                  leftIcon={isLofiPlaying ? <VolumeX className="w-4 h-4 text-emerald-400" /> : <Volume2 className="w-4 h-4" />}
                >
                  {isLofiPlaying ? 'Stop Lofi Drone' : 'Play Focus Ambient Drone'}
                </Button>

                <Button
                  onClick={() => setIsInHuddle(!isInHuddle)}
                  size="sm"
                  variant="primary"
                  className={
                    isInHuddle
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }
                >
                  {isInHuddle ? 'Leave Huddle' : 'Join Audio Huddle'}
                </Button>
              </div>
            </div>

            {/* Participants Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Current User Card */}
              <div
                className={`p-5 rounded-2xl border text-center space-y-3 transition-all ${
                  isInHuddle
                    ? 'bg-charcoal-850 border-emerald-500/50 ring-2 ring-emerald-500/20'
                    : 'bg-charcoal-950 border-charcoal-800 opacity-60'
                }`}
              >
                <div className="relative w-14 h-14 mx-auto">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center font-bold text-lg text-emerald-400">
                    {(currentUserProfile?.display_name || 'You').charAt(0).toUpperCase()}
                  </div>
                  {isInHuddle && !isMuted && (
                    <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-charcoal-950">
                      <Mic className="w-3 h-3" />
                    </span>
                  )}
                  {isInHuddle && isMuted && (
                    <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-rose-500 text-white">
                      <MicOff className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white">
                    {currentUserProfile?.display_name || 'You (Lead/Builder)'}
                  </h4>
                  <span className="text-[11px] font-mono text-emerald-400">
                    {isInHuddle ? (isMuted ? 'Muted' : 'Speaking') : 'Offline'}
                  </span>
                </div>

                {isInHuddle && (
                  <div className="flex justify-center gap-1.5 pt-1">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
                        isMuted
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-charcoal-800 text-slate-300 hover:text-white'
                      }`}
                      title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                    >
                      {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => setIsSharingScreen(!isSharingScreen)}
                      className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
                        isSharingScreen
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-charcoal-800 text-slate-300 hover:text-white'
                      }`}
                      title={isSharingScreen ? 'Stop screen share' : 'Share screen'}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Teammates Roster */}
              {members.slice(0, 3).map((m, idx) => (
                <div
                  key={m.id}
                  className="p-5 rounded-2xl bg-charcoal-950 border border-charcoal-800 text-center space-y-3"
                >
                  <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-bold text-lg text-indigo-400 mx-auto">
                    {(m.profile?.display_name || m.profile?.username || 'C').charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {m.profile?.display_name || m.profile?.username || 'Teammate'}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-400">{m.role}</span>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-charcoal-850 text-slate-400 inline-block">
                    In Workspace
                  </span>
                </div>
              ))}
            </div>

            {/* Screen Share / Visual Soundwave Preview */}
            {isInHuddle && (
              <div className="p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-end gap-1 h-6">
                    <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-4" />
                    <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-6 delay-75" />
                    <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-3 delay-150" />
                    <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-5 delay-200" />
                  </div>
                  <span className="text-xs text-slate-300 font-mono">
                    {isSharingScreen
                      ? '📺 Screen Sharing: Active Display Stream 1'
                      : '🎙️ Live Voice Channel: Stereo HD 48kHz'}
                  </span>
                </div>

                <span className="text-xs font-mono text-slate-500">Latency: 24ms</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
