'use client';

import React, { useState } from 'react';
import {
  Trophy,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Clock,
  Swords,
  Layers,
  Radio,
  Eye,
} from 'lucide-react';
import { DuelQuestion, ArenaCategory } from '@/types/arenaDuel';
import { ArenaRoom } from '@/lib/arena/roomStorage';

interface AdminTournamentGeneratorProps {
  questions: DuelQuestion[];
  onRoomCreated?: (room: ArenaRoom) => void;
  onSpectateRoom?: (roomCode: string) => void;
}

export function AdminTournamentGenerator({
  questions,
  onRoomCreated,
  onSpectateRoom,
}: AdminTournamentGeneratorProps) {
  const [matchTitle, setMatchTitle] = useState('Discord 1v1 Showdown');
  const [arena, setArena] = useState<ArenaCategory>('web_dev');
  const [format, setFormat] = useState<'1v1' | '2v2'>('1v1');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [timeLimit, setTimeLimit] = useState<number>(300);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('random');
  const [isGenerating, setIsGenerating] = useState(false);
  const [createdRoom, setCreatedRoom] = useState<ArenaRoom | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedDiscordMsg, setCopiedDiscordMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filter available questions matching selected arena
  const relevantQuestions = questions.filter(
    (q) => q.arena === arena && (selectedQuestionId === 'random' || q.difficulty === difficulty)
  );

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'KBX-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateTournamentRoom = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const code = generateRandomCode();
      const specificQ =
        selectedQuestionId !== 'random'
          ? questions.find((q) => q.id === selectedQuestionId)
          : undefined;

      const res = await fetch('/api/arena/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          isTournamentRoom: true,
          matchTitle: matchTitle.trim() || `Tournament Duel ${code}`,
          format,
          arena,
          difficulty,
          timeLimit,
          selectedTags:
            arena === 'web_dev'
              ? ['html', 'css']
              : arena === 'algorithms'
              ? ['java', 'python']
              : ['web', 'css'],
          question: specificQ,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create tournament room');
      }

      setCreatedRoom(data.room);
      if (onRoomCreated) onRoomCreated(data.room);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating tournament match');
    } finally {
      setIsGenerating(false);
    }
  };

  const getInviteUrl = (code: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.kollabrix.in';
    return `${origin}/arena?room=${code}`;
  };

  const handleCopyLink = () => {
    if (!createdRoom) return;
    const url = getInviteUrl(createdRoom.code);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyDiscordMessage = () => {
    if (!createdRoom) return;
    const url = getInviteUrl(createdRoom.code);
    const domainLabel =
      createdRoom.arena === 'web_dev'
        ? 'Web Dev Sprint'
        : createdRoom.arena === 'algorithms'
        ? 'Data Structures & Algorithms'
        : 'Bug Hunt Defense';

    const msg = `⚔️ **KOLLABRIX ${createdRoom.format.toUpperCase()} BATTLE ARENA DUEL**\n` +
      `Match: **${createdRoom.matchTitle || 'Community Duel'}**\n` +
      `Category: **${domainLabel}** (${Math.round(createdRoom.timeLimit / 60)} min • ${createdRoom.difficulty.toUpperCase()})\n` +
      `Room Code: \`${createdRoom.code}\`\n\n` +
      `👉 **Click to enter and duel:**\n${url}\n\n` +
      `*(Anti-cheat Fog of War will activate upon match start!)*`;

    navigator.clipboard.writeText(msg);
    setCopiedDiscordMsg(true);
    setTimeout(() => setCopiedDiscordMsg(false), 2000);
  };

  return (
    <div className="bg-charcoal-900/90 border border-charcoal-700/80 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-charcoal-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 border border-rose-500/30 text-rose-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Tournament Duel Host Generator</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold uppercase">
                Admin Host
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Generate 1v1 or 2v2 duel rooms with custom rules. Send the invite link to players on Discord.
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-mono">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Generator Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Match Title */}
        <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
          <label className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
            <Swords className="w-3.5 h-3.5 text-rose-400" />
            <span>Match Title / Identifier</span>
          </label>
          <input
            type="text"
            value={matchTitle}
            onChange={(e) => setMatchTitle(e.target.value)}
            placeholder="e.g. Discord 1v1: Web Dev Sprint"
            className="w-full px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-700 text-sm text-white focus:outline-none focus:border-rose-500 font-mono"
          />
        </div>

        {/* Arena Category */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Arena Domain</span>
          </label>
          <select
            value={arena}
            onChange={(e) => {
              setArena(e.target.value as ArenaCategory);
              setSelectedQuestionId('random');
            }}
            className="w-full px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-700 text-sm text-white focus:outline-none focus:border-rose-500 font-mono"
          >
            <option value="web_dev">Web Development (HTML/CSS)</option>
            <option value="algorithms">Algorithms (DSA & Logic)</option>
            <option value="bug_hunt">Bug Hunt (Debugging)</option>
          </select>
        </div>

        {/* Format */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span>Format</span>
          </label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as '1v1' | '2v2')}
            className="w-full px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-700 text-sm text-white focus:outline-none focus:border-rose-500 font-mono"
          >
            <option value="1v1">1v1 Head-to-Head Duel</option>
            <option value="2v2">2v2 Tag-Team Battle</option>
          </select>
        </div>

        {/* Difficulty */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Difficulty</span>
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-700 text-sm text-white focus:outline-none focus:border-rose-500 font-mono"
          >
            <option value="easy">Easy (Beginner Friendly)</option>
            <option value="medium">Medium (Standard Competitive)</option>
            <option value="hard">Hard (Expert Speedrun)</option>
          </select>
        </div>

        {/* Time Limit */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Match Duration</span>
          </label>
          <select
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-700 text-sm text-white focus:outline-none focus:border-rose-500 font-mono"
          >
            <option value={180}>3 Minutes (Sprint)</option>
            <option value={300}>5 Minutes (Standard)</option>
            <option value={600}>10 Minutes (Deep Logic)</option>
            <option value={900}>15 Minutes (Marathon)</option>
          </select>
        </div>

        {/* Question Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Question Preset</span>
          </label>
          <select
            value={selectedQuestionId}
            onChange={(e) => setSelectedQuestionId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-700 text-sm text-white focus:outline-none focus:border-rose-500 font-mono truncate"
          >
            <option value="random">🎲 Auto-Pick Question (Random)</option>
            {relevantQuestions.map((q) => (
              <option key={q.id} value={q.id}>
                {q.title} ({q.difficulty})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleCreateTournamentRoom}
          disabled={isGenerating}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 hover:brightness-110 active:scale-95 text-white font-mono text-sm font-bold shadow-lg shadow-rose-900/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          <Swords className="w-4 h-4" />
          <span>{isGenerating ? 'Generating Room...' : '⚡ Generate Tournament Match'}</span>
        </button>
      </div>

      {/* Generated Match Card */}
      {createdRoom && (
        <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-rose-950/40 via-charcoal-950 to-charcoal-900 border border-rose-500/40 shadow-xl space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-500/20 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold">
                ✓ Tournament Match Created & Ready
              </span>
              <h4 className="text-base font-bold text-white mt-0.5">
                {createdRoom.matchTitle || 'Tournament Duel'}
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Room Code:</span>
              <span className="px-3 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-base font-black tracking-widest shadow-inner">
                {createdRoom.code}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            {/* Copy Direct Link */}
            <div className="p-3 rounded-xl bg-charcoal-900/80 border border-charcoal-800 space-y-1.5">
              <span className="text-slate-400">Direct Player URL:</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getInviteUrl(createdRoom.code)}
                  className="flex-1 bg-charcoal-950 border border-charcoal-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Copy Discord Announcement */}
            <div className="p-3 rounded-xl bg-charcoal-900/80 border border-charcoal-800 space-y-1.5">
              <span className="text-slate-400">Discord / WhatsApp Message:</span>
              <button
                type="button"
                onClick={handleCopyDiscordMessage}
                className="w-full py-1.5 px-3 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 border border-indigo-500/50 text-white font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedDiscordMsg ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Copied Discord Template!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Formatted Discord Invite</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400 font-mono">
              Waiting for Contender 1 & Contender 2 to enter room...
            </span>

            {onSpectateRoom && (
              <button
                type="button"
                onClick={() => onSpectateRoom(createdRoom.code)}
                className="px-4 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Open Secret Spectator Desk</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
