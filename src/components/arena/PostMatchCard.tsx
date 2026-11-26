'use client';

import React, { useState } from 'react';
import { ArrowRight, Download, Swords, Trophy } from 'lucide-react';
import { downloadFightCardPng } from './arenaHelpers';
import { formatClock } from './arenaTypes';
import { useArenaEngine } from './useArenaEngine';

interface PostMatchCardProps {
  engine: ReturnType<typeof useArenaEngine>;
}

/**
 * Stage 4: Valorant-style Post-Match Fight Card & Replay.
 */
export function PostMatchCard({ engine }: PostMatchCardProps) {
  const [inspectTab, setInspectTab] = useState<'diff' | 'optimal' | 'telemetry'>('diff');

  const didWin = engine.winnerSide === 'you';
  const isDraw = engine.winnerSide === 'draw' || engine.winnerSide === null;
  const solveSecs = Math.max(1, engine.timeLimit - engine.timeLeft);
  const solveFormatted = formatClock(solveSecs);
  const campusPts = didWin ? 15 : isDraw ? 5 : 2;
  const eloDelta = engine.stats.elo - engine.eloBefore;
  const winningCollege = didWin ? engine.playerCollege : engine.rivalProfile.college;

  const myCode =
    engine.activeTab === 'html'
      ? engine.htmlCode
      : engine.activeTab === 'css'
        ? engine.cssCode
        : engine.activeTab === 'js'
          ? engine.jsCode
          : engine.activeTab === 'java'
            ? engine.javaCode
            : engine.activeTab === 'cpp'
              ? engine.cppCode
              : engine.pythonCode;

  const rivalCode =
    engine.rivalSolution.pythonCode ||
    engine.rivalSolution.cppCode ||
    engine.rivalSolution.javaCode ||
    engine.rivalSolution.htmlCode ||
    `# ${engine.rivalProfile.name}'s Submitted Attempt\n# ${engine.rivalTestsPassed}/${engine.totalTests} test cases verified at ${engine.rivalWpm || engine.rivalProfile.baseWpm} WPM`;

  return (
    <div className="relative z-10 min-h-screen w-full flex flex-col justify-between p-4 sm:p-6">
      <div className="font-mono text-xs font-bold text-slate-500 tracking-wider">
        KOLLΛBRIX // ARENA
      </div>

      <main className="w-full max-w-3xl mx-auto my-auto space-y-5">
        <div className="rounded-3xl bg-[#0A0E17]/95 border border-white/15 shadow-[0_28px_80px_rgba(0,0,0,0.92)] backdrop-blur-2xl p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/15 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-300">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>MATCH COMPLETE &bull; KNOCKOUT</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              {isDraw
                ? 'TIME EXPIRED — DRAW MATCH'
                : didWin
                  ? `VICTORY — ${winningCollege.toUpperCase()} TAKES THE DUEL`
                  : `DEFEAT — ${winningCollege.toUpperCase()} TAKES THE DUEL`}
            </h1>
          </div>

          {/* VS Scorecard */}
          <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#0A0E17] border border-white/25 items-center justify-center font-mono text-xs font-black text-slate-200 z-10">
              VS
            </div>

            {/* Player Card */}
            <div
              className={`p-4 rounded-2xl border space-y-3 ${
                didWin ? 'bg-[#070B13] border-white/45 shadow-[0_0_24px_rgba(255,255,255,0.08)]' : 'bg-[#060910] border-white/10'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <img src={engine.activeAvatarUrl} alt={engine.playerName} className="w-8 h-8 rounded-lg object-cover border border-white/20" />
                  <div className="text-xs font-bold text-white truncate">
                    {engine.playerName} <span className="text-slate-400 font-normal">&bull; {engine.playerCollege}</span>
                  </div>
                </div>
                {didWin && (
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 text-slate-950 font-mono text-[10px] font-black">WINNER</span>
                )}
              </div>

              <div className="flex items-baseline justify-between gap-2">
                <div className="text-2xl font-black font-mono text-white">
                  {engine.userTestsPassed} / {engine.totalTests} <span className="text-sm font-normal text-slate-400">Tests</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 text-right">
                  <div>Time: {solveFormatted}</div>
                  <div>Peak: {engine.peakWpm || engine.myWpm} WPM</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                    eloDelta >= 0
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                      : 'bg-red-950/60 border-red-500/40 text-red-300'
                  }`}
                >
                  {eloDelta >= 0 ? `+${eloDelta}` : eloDelta} ELO ({engine.eloBefore} → {engine.stats.elo})
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-950/50 border border-amber-500/35 font-mono text-[10px] font-bold text-amber-200">
                  +{campusPts} Campus War Pts
                </span>
              </div>
            </div>

            {/* Rival Card */}
            <div
              className={`p-4 rounded-2xl border space-y-3 ${
                !didWin && !isDraw ? 'bg-[#070B13] border-white/45' : 'bg-[#060910] border-white/10'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/15 flex items-center justify-center text-sm">
                    {engine.rivalProfile.avatarEmoji}
                  </div>
                  <div className="text-xs font-bold text-white truncate">
                    {engine.rivalProfile.name} <span className="text-slate-400 font-normal">&bull; {engine.rivalProfile.college}</span>
                  </div>
                </div>
                {!didWin && !isDraw && (
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 text-slate-950 font-mono text-[10px] font-black">WINNER</span>
                )}
              </div>

              <div className="flex items-baseline justify-between gap-2">
                <div className="text-2xl font-black font-mono text-white">
                  {engine.rivalTestsPassed} / {engine.totalTests} <span className="text-sm font-normal text-slate-400">Tests</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Peak: {engine.rivalWpm || engine.rivalProfile.baseWpm} WPM
                </div>
              </div>

              <div>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                    didWin
                      ? 'bg-red-950/40 border-red-500/30 text-red-300'
                      : isDraw
                        ? 'bg-white/[0.05] border-white/15 text-slate-300'
                        : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  }`}
                >
                  {didWin
                    ? `-14 ELO ▼ (${engine.rivalProfile.elo - 14})`
                    : isDraw
                      ? `0 ELO (${engine.rivalProfile.elo})`
                      : `+24 ELO ▲ (${engine.rivalProfile.elo + 24})`}
                </span>
              </div>
            </div>
          </div>

          {/* Inspection Tabs */}
          <div className="space-y-3">
            <div className="flex items-center gap-5 border-b border-white/10 text-xs font-mono">
              {([
                { id: 'diff', label: 'Side-by-Side Code Diff' },
                { id: 'optimal', label: 'Reference & Complexity' },
                { id: 'telemetry', label: 'Performance Telemetry' },
              ] as const).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setInspectTab(t.id)}
                  className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                    inspectTab === t.id ? 'border-white text-white font-bold' : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {inspectTab === 'diff' && (
              <div className="grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden border border-white/10 bg-[#05080E]">
                <div className="p-3 border-b md:border-b-0 md:border-r border-white/10">
                  <div className="text-[11px] font-mono text-slate-400 mb-2">Your Code ({engine.activeTab})</div>
                  <pre className="text-[11px] font-mono text-emerald-200/90 overflow-x-auto max-h-40 leading-relaxed">{myCode}</pre>
                </div>
                <div className="p-3">
                  <div className="text-[11px] font-mono text-slate-400 mb-2">Rival Code ({engine.rivalProfile.name})</div>
                  <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto max-h-40 leading-relaxed">{rivalCode}</pre>
                </div>
              </div>
            )}

            {inspectTab === 'optimal' && (
              <div className="p-4 rounded-2xl border border-white/10 bg-[#05080E] text-xs font-mono text-slate-300 space-y-2">
                <div className="text-white font-bold">{engine.activeQuestion.title}</div>
                <p className="text-slate-400 leading-relaxed">
                  {engine.activeQuestion.explanation || engine.activeQuestion.description}
                </p>
              </div>
            )}

            {inspectTab === 'telemetry' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Solve Time', value: solveFormatted },
                  { label: 'Peak WPM', value: `${engine.peakWpm || engine.myWpm} WPM` },
                  { label: 'Test Runs', value: `${engine.totalRuns}` },
                  { label: 'Focus Strikes', value: `${engine.myCheatStrikes}` },
                ].map((m) => (
                  <div key={m.label} className="p-3 rounded-xl bg-[#05080E] border border-white/10 text-center">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">{m.label}</div>
                    <div className="text-base font-black font-mono text-white mt-0.5">{m.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => engine.launchInstantMatch(false)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-slate-100 via-white to-slate-200 hover:brightness-105 text-slate-950 font-mono text-xs font-black flex items-center gap-2 cursor-pointer border border-white/50 shadow-[0_0_24px_rgba(255,255,255,0.2)]"
          >
            <span>⚡ Next Ranked Duel</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => engine.launchInstantMatch(engine.isGhostDuel)}
            className="px-4 py-3 rounded-xl bg-[#0A0E17] hover:bg-white/[0.08] border border-white/15 text-slate-200 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Rematch Rival</span>
          </button>

          <button
            type="button"
            onClick={() =>
              downloadFightCardPng({
                playerName: engine.playerName,
                playerCollege: engine.playerCollege,
                rivalName: engine.rivalProfile.name,
                rivalCollege: engine.rivalProfile.college,
                didWin,
                isDraw,
                userTests: engine.userTestsPassed,
                rivalTests: engine.rivalTestsPassed,
                totalTests: engine.totalTests,
                solveTimeFormatted: solveFormatted,
                peakWpm: engine.peakWpm || engine.myWpm,
                eloBefore: engine.eloBefore,
                eloAfter: engine.stats.elo,
                campusPts,
                questionTitle: engine.activeQuestion.title,
              })
            }
            className="px-4 py-3 rounded-xl bg-[#0A0E17] hover:bg-white/[0.08] border border-white/15 text-slate-200 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Share Fight Card (PNG)</span>
          </button>

          <button
            type="button"
            onClick={() => engine.setStage('lobby')}
            className="px-4 py-3 rounded-xl text-slate-400 hover:text-white font-mono text-xs cursor-pointer"
          >
            Back to Lobby
          </button>
        </div>
      </main>

      <div className="h-4" />
    </div>
  );
}
