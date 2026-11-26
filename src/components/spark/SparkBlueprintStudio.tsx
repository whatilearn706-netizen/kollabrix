'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Copy,
  Check,
  Users,
  Calendar,
  CheckCircle2,
  RefreshCw,
  Trophy,
  Target,
  FileText,
  Briefcase,
  Lightbulb,
  Layers,
  Code2,
} from 'lucide-react';
import { SparkSuperpowersPanel, SparkChatMessage } from './SparkSuperpowersPanel';
import { KaHackathonWarRoom } from './KaHackathonWarRoom';

const HACKATHON_TRACKS = [
  { id: 'open', label: '⚡ Open Brainstorm' },
  { id: 'sih', label: '🏆 Smart India Hackathon (SIH 2026)' },
  { id: 'google', label: '🌐 Google Solution Challenge (SDGs)' },
  { id: 'web3', label: '🔗 Web3 & Decentralized (ETHIndia)' },
  { id: 'campus', label: '🏫 Campus Life & Student Utilities' },
  { id: 'ai', label: '🤖 Agentic AI & Autonomous Copilots' },
];

const INSPIRATIONS = [
  'Hostel Midnight Food Delivery & Peer Cart Pool',
  'Autonomous Drone Delivery for Campuses',
  'AI Attendance with Anti-Spoof Face Liveness',
  'Smart AgriTech Pest Diagnosis via Edge WASM',
  'Real-Time College Carpool & Ride Share Radar',
  'ProctorGuard: Browser Sandbox with Eye-Gaze Tracking',
];

interface Props {
  user: any;
  profile: any;
  blueprint: any;
  setBlueprint: (bp: any) => void;
  sessionId: string | null;
  setSessionId: (id: string | null) => void;
  copilotMessages: SparkChatMessage[];
  setCopilotMessages: (msgs: SparkChatMessage[]) => void;
  onRequireUpgrade?: (reason: string) => void;
  onEntitlementsUpdate?: (entitlements: any) => void;
  onSessionCreated: (session: any) => void;
}

/**
 * Structured Hackathon Blueprint Studio (Track selector, Judge Rubric Scoring,
 * Tech Stack, Roles, ATS Bullets, Milestones + SparkSuperpowersPanel).
 */
export function SparkBlueprintStudio({
  user,
  profile,
  blueprint,
  setBlueprint,
  sessionId,
  setSessionId,
  copilotMessages,
  setCopilotMessages,
  onRequireUpgrade,
  onEntitlementsUpdate,
  onSessionCreated,
}: Props) {
  const [prompt, setPrompt] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('open');
  const [userSkills, setUserSkills] = useState('');
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const handleGenerate = async (customPrompt?: string) => {
    const textToRun = (customPrompt || prompt).trim();
    if (!textToRun || textToRun.length < 5) {
      setErrorMsg('Please describe what you want to build (at least 5 characters).');
      return;
    }

    setErrorMsg('');
    setIsGenerating(true);
    setBlueprint(null);

    const trackObj = HACKATHON_TRACKS.find((t) => t.id === selectedTrack);

    try {
      const res = await fetch('/api/ai/spark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToRun,
          track: trackObj && trackObj.id !== 'open' ? trackObj.label : undefined,
          userSkills: userSkills.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data?.entitlements) onEntitlementsUpdate?.(data.entitlements);
      if (!res.ok) {
        if (res.status === 401 || res.status === 402 || data?.upgradeRequired) {
          onRequireUpgrade?.(data.error || 'Upgrade required to continue generating.');
        }
        throw new Error(data.error || 'Failed to synthesize blueprint');
      }

      setBlueprint(data.blueprint);
      setCopilotMessages([]);
      setSessionId(null);

      if (user?.id && data.blueprint) {
        fetch('/api/spark/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: data.blueprint.title,
            prompt: textToRun,
            track: selectedTrack,
            blueprint: data.blueprint,
            messages: [],
          }),
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((saved) => {
            if (saved?.success && saved?.session) {
              setSessionId(saved.session.id);
              onSessionCreated(saved.session);
            }
          })
          .catch(() => {});
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not generate blueprint.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6 pb-12">
      {/* Blueprint Generator Form */}
      <div className="rounded-3xl bg-[#090C12] border border-white/12 p-6 space-y-4 shadow-xl">
        <div className="flex flex-wrap gap-2">
          {HACKATHON_TRACKS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTrack(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                selectedTrack === t.id
                  ? 'bg-white text-zinc-950 border-white font-bold'
                  : 'bg-black/50 text-zinc-300 border-white/12 hover:border-white/30'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Hackathon / Project Idea
          </span>
          <button
            type="button"
            onClick={() => setShowSkillInput(!showSkillInput)}
            className="text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>{showSkillInput ? 'Hide Skills' : '+ Audit My Squad Gap'}</span>
          </button>
        </div>

        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Build an autonomous drone dispatch system for large campuses that delivers lab equipment..."
          className="w-full px-4 py-3 rounded-2xl border border-white/12 bg-black/60 text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-white/35 resize-y"
        />

        {showSkillInput && (
          <input
            type="text"
            value={userSkills}
            onChange={(e) => setUserSkills(e.target.value)}
            placeholder="Your current skills (e.g. React, Python, Figma)..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-white/12 bg-black/60 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-white/35"
          />
        )}

        <div className="flex flex-wrap gap-1.5">
          {INSPIRATIONS.map((insp) => (
            <button
              key={insp}
              type="button"
              onClick={() => {
                setPrompt(insp);
                handleGenerate(insp);
              }}
              className="px-2.5 py-1 rounded-lg text-[11px] bg-black/50 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-all cursor-pointer inline-flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{insp}</span>
            </button>
          ))}
        </div>

        {errorMsg && <p className="text-xs text-rose-400 font-semibold">{errorMsg}</p>}

        <button
          type="button"
          onClick={() => handleGenerate()}
          disabled={isGenerating || !prompt.trim()}
          className="w-full py-3 px-5 rounded-2xl bg-gradient-to-b from-white to-zinc-200 text-zinc-950 font-black text-sm flex items-center justify-center gap-2 disabled:opacity-45 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Synthesizing Blueprint with KΛ-Pro...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Generate Engineering Blueprint &amp; Squad Spec</span>
            </>
          )}
        </button>
      </div>

      {/* 5-Tool Hackathon Sprint Pass War-Room */}
      <KaHackathonWarRoom
        user={user}
        blueprint={blueprint}
        sessionId={sessionId}
        onSessionId={(id) => setSessionId(id)}
        onRequireUpgrade={(reason) => onRequireUpgrade?.(reason)}
        onEntitlementsUpdate={onEntitlementsUpdate}
      />

      {/* Rendered Blueprint */}
      {blueprint && (
        <div className="rounded-3xl bg-[#090C12] border border-white/15 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/10 pb-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/10 border border-white/20 text-zinc-100">
                  {blueprint.category}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                  {blueprint.difficulty}
                </span>
                {blueprint.engine && (
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-amber-500/15 border border-amber-500/30 text-amber-300">
                    {blueprint.engine}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black text-white">{blueprint.title}</h2>
              <p className="text-sm text-zinc-400">{blueprint.tagline}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(`# ${blueprint.title}\n${blueprint.tagline}\n\n${blueprint.summary}`);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold text-zinc-200 flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Spec'}</span>
            </button>
          </div>

          <p className="text-sm text-zinc-200 leading-relaxed">{blueprint.summary}</p>

          {blueprint.scores && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { label: 'Overall', val: blueprint.scores.overall, accent: 'text-amber-300' },
                { label: 'Tech Depth', val: blueprint.scores.technicalComplexity, accent: 'text-cyan-300' },
                { label: 'Novelty', val: blueprint.scores.novelty, accent: 'text-violet-300' },
                { label: 'Feasibility', val: blueprint.scores.feasibility, accent: 'text-emerald-300' },
                { label: 'Impact', val: blueprint.scores.impact, accent: 'text-rose-300' },
              ].map((s) => (
                <div key={s.label} className="p-3 rounded-xl bg-black/50 border border-white/10 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-400">{s.label}</div>
                  <div className={`text-lg font-black ${s.accent}`}>{s.val}/100</div>
                </div>
              ))}
            </div>
          )}

          {blueprint.winningTwist && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <Trophy className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-zinc-200 leading-relaxed">
                <strong className="text-amber-300 block mb-0.5">Winning Hackathon Angle:</strong>
                {blueprint.winningTwist}
              </div>
            </div>
          )}

          {blueprint.elevatorPitch && (
            <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Elevator Pitch</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Problem: ${blueprint.elevatorPitch.problem}\nSolution: ${blueprint.elevatorPitch.solution}\nUnfair Advantage: ${blueprint.elevatorPitch.unfairAdvantage}`
                    );
                    setCopiedPitch(true);
                    setTimeout(() => setCopiedPitch(false), 2000);
                  }}
                  className="text-[11px] text-zinc-300 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {copiedPitch ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPitch ? 'Copied' : 'Copy Pitch'}</span>
                </button>
              </div>
              <div className="text-xs text-zinc-300 space-y-1">
                <p><strong className="text-white">Problem:</strong> {blueprint.elevatorPitch.problem}</p>
                <p><strong className="text-white">Solution:</strong> {blueprint.elevatorPitch.solution}</p>
                <p><strong className="text-white">Unfair Advantage:</strong> {blueprint.elevatorPitch.unfairAdvantage}</p>
              </div>
            </div>
          )}

          {Array.isArray(blueprint.technologies) && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Recommended Tech Stack</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {blueprint.technologies.map((tech: string) => (
                  <span key={tech} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/12 text-xs text-zinc-200 font-mono">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(blueprint.milestones) && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-pink-400" />
                <span>Sprint Roadmap</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {blueprint.milestones.map((m: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span>{m.title}</span>
                      <span className="text-[10px] text-pink-300 font-mono">{m.duration}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">{m.deliverables}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <SparkSuperpowersPanel
            blueprint={blueprint}
            track={selectedTrack}
            sessionId={sessionId}
            messages={copilotMessages}
            onMessagesChange={setCopilotMessages}
            userCollege={(profile as any)?.college || ''}
            onRequireUpgrade={onRequireUpgrade}
            shareCopied={shareCopied}
            onShareSession={() => {
              if (!sessionId || typeof window === 'undefined') return;
              navigator.clipboard.writeText(`${window.location.origin}/spark?session=${sessionId}`);
              setShareCopied(true);
              setTimeout(() => setShareCopied(false), 2500);
            }}
          />
        </div>
      )}
    </div>
  );
}
