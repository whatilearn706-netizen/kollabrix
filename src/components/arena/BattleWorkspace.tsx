'use client';

import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Flag,
  GripHorizontal,
  GripVertical,
  Loader2,
  Maximize2,
  Minimize2,
  RotateCcw,
  ShieldCheck,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { EditorTab, formatClock, isWebArenaQuestion } from './arenaTypes';
import { buildWebPreviewDoc, FOG_SYNTAX_LINES } from './arenaHelpers';
import { useArenaEngine } from './useArenaEngine';
import { useResizableSplit } from './useResizableSplit';

interface BattleWorkspaceProps {
  engine: ReturnType<typeof useArenaEngine>;
}

/**
 * Stage 3: Resizable 3-Pane Live Combat HUD.
 * Left: Spec + Stacked Blueprint (top) & Yours Live Preview (below) + Test Runner
 * Center: Code Editor | Right: Fog-of-War Rival Monitor
 */
export function BattleWorkspace({ engine }: BattleWorkspaceProps) {
  const q = engine.activeQuestion;
  const isWeb = isWebArenaQuestion(q, engine.combatMode);
  const [specCollapsed, setSpecCollapsed] = useState(false);

  const split = useResizableSplit(isWeb ? 33 : 27, isWeb ? 21 : 25);

  const currentFileLabel = useMemo(() => {
    const slug = q.title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'solution';
    if (engine.activeTab === 'python') return `${slug}.py`;
    if (engine.activeTab === 'java') return 'Solution.java';
    if (engine.activeTab === 'cpp') return `${slug}.cpp`;
    if (engine.activeTab === 'html') return 'index.html';
    if (engine.activeTab === 'css') return 'style.css';
    return 'script.js';
  }, [q.title, engine.activeTab]);

  const activeBuffer =
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

  const setActiveBuffer = (val: string) => {
    const setter =
      engine.activeTab === 'html'
        ? engine.setHtmlCode
        : engine.activeTab === 'css'
          ? engine.setCssCode
          : engine.activeTab === 'js'
            ? engine.setJsCode
            : engine.activeTab === 'java'
              ? engine.setJavaCode
              : engine.activeTab === 'cpp'
                ? engine.setCppCode
                : engine.setPythonCode;
    engine.handleCodeChange(val, setter);
  };

  const linesCount = Math.max(14, activeBuffer.split('\n').length);
  const yourPct = Math.min(100, Math.round((engine.userTestsPassed / Math.max(1, engine.totalTests)) * 100));
  const rivalPct = Math.min(100, Math.round((engine.rivalTestsPassed / Math.max(1, engine.totalTests)) * 100));
  const targetDoc = useMemo(
    () => buildWebPreviewDoc(q.targetComponentHtml || '', q.targetComponentCss || '', q.targetComponentJs || ''),
    [q.targetComponentHtml, q.targetComponentCss, q.targetComponentJs]
  );
  const userDoc = useMemo(
    () => buildWebPreviewDoc(engine.htmlCode, engine.cssCode, engine.jsCode),
    [engine.htmlCode, engine.cssCode, engine.jsCode]
  );

  const visibleCases = isWeb
    ? engine.webEvaluation?.results ||
      Array.from({ length: engine.totalTests }, (_, i) => ({ testName: `Check #${i + 1}`, passed: false, message: 'Pending run' }))
    : q.testCases || [];

  const isDragging = split.draggingAxis !== null;

  return (
    <div className="relative z-10 h-screen w-full flex flex-col bg-[#04060A] text-slate-100 overflow-hidden">
      {/* Minimal 48px Top Combat HUD */}
      <header className="h-12 shrink-0 px-3 sm:px-4 border-b border-white/10 bg-[#080B12]/95 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/15 font-mono text-[11px] font-bold tracking-wider truncate">
            <span className="text-white">KOLLΛBRIX</span>
            <span className="text-slate-500 mx-1.5">/</span>
            <span className="text-slate-300 uppercase">ROUND {engine.roundNumber} &bull; {q.title}</span>
          </div>
          <span className="hidden md:inline-block px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 font-mono text-[10px] capitalize text-slate-300">
            {q.difficulty}
          </span>
        </div>

        {/* Surgical Red Clock */}
        <div
          className={`px-4 py-1 rounded-xl bg-red-950/75 border border-red-500/45 shadow-[0_0_20px_rgba(239,68,68,0.28)] flex items-center gap-2 font-mono text-sm font-black text-red-400 ${
            engine.timeLeft <= 30 ? 'animate-pulse border-red-400' : ''
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-red-400" />
          <span>{formatClock(engine.timeLeft)}</span>
        </div>

        {/* Tug-of-War Progress + Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="hidden xl:flex items-center gap-2.5 text-[11px] font-mono">
            <span className="text-slate-200 font-bold">YOU: {engine.userTestsPassed}/{engine.totalTests}</span>
            <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden flex">
              <div className="h-full bg-emerald-400 transition-all" style={{ width: `${yourPct / 2}%` }} />
              <div className="flex-1" />
              <div className="h-full bg-red-400 transition-all" style={{ width: `${rivalPct / 2}%` }} />
            </div>
            <span className="text-slate-400 font-bold">RIVAL: {engine.rivalTestsPassed}/{engine.totalTests}</span>
          </div>

          <button
            type="button"
            onClick={split.resetLayout}
            title="Reset Pane Sizes"
            className="hidden lg:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[10px] font-mono text-slate-300 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Size</span>
          </button>

          <button
            type="button"
            onClick={() => engine.setAudioEnabled(!engine.audioEnabled)}
            title="Toggle Audio"
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 cursor-pointer"
          >
            {engine.audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          </button>
          <button
            type="button"
            onClick={engine.toggleFullscreen}
            title="Fullscreen"
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 cursor-pointer"
          >
            {engine.isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={engine.handleForfeit}
            title="Forfeit Duel"
            className="p-1.5 px-2.5 rounded-lg bg-white/[0.04] hover:bg-red-950/60 border border-white/10 hover:border-red-500/40 text-slate-300 hover:text-red-300 text-[11px] font-mono flex items-center gap-1 cursor-pointer"
          >
            <Flag className="w-3 h-3" />
            <span className="hidden sm:inline">Forfeit</span>
          </button>
        </div>
      </header>

      {engine.rivalCheatAlert && (
        <div className="px-4 py-1.5 bg-red-950/80 border-b border-red-500/40 text-xs font-mono text-red-200 flex items-center justify-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          <span>Anti-Cheat Alert: {engine.rivalCheatAlert.cheaterName} lost focus (Strike {engine.rivalCheatAlert.strikes})</span>
        </div>
      )}

      {/* Resizable 3-Pane Workspace */}
      <div
        ref={split.containerRef}
        className={`flex-1 min-h-0 flex flex-col lg:flex-row p-2.5 gap-2 lg:gap-0 overflow-y-auto lg:overflow-hidden ${
          isDragging ? 'select-none' : ''
        }`}
      >
        {/* LEFT PANE: Spec + Stacked Blueprint & Yours + Test Runner */}
        <section
          style={{ '--pane-w': `${split.widths.leftPct}%` } as React.CSSProperties}
          className="w-full lg:w-[var(--pane-w)] shrink-0 min-h-0 flex flex-col gap-2"
        >
          <div className="flex-1 min-h-0 rounded-2xl bg-[#0A0E17] border border-white/10 flex flex-col overflow-hidden">
            <div className="px-3.5 py-2 border-b border-white/10 text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between shrink-0">
              <span>{isWeb ? 'Spec & Live Previews' : 'Problem & Test Cases'}</span>
              {isWeb && (
                <button
                  type="button"
                  onClick={() => setSpecCollapsed((v) => !v)}
                  className="text-[10px] font-mono text-slate-300 hover:text-white inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{specCollapsed ? 'Show Spec' : 'Hide Spec'}</span>
                  {specCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                </button>
              )}
            </div>

            <div className="flex-1 min-h-0 flex flex-col p-3 gap-2.5 overflow-hidden">
              {/* Objective Brief */}
              {(!isWeb || !specCollapsed) && (
                <div className={`space-y-2 text-xs overflow-y-auto shrink-0 ${isWeb ? 'max-h-36 pr-1' : 'flex-1'}`}>
                  <h2 className="text-base font-black text-white tracking-tight">{q.title}</h2>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line">{q.description}</p>
                  {!isWeb && (q.sampleInput || q.testCases?.[0]) && (
                    <div className="p-3 rounded-xl bg-[#05080F] border border-white/10 font-mono text-[11px] space-y-1">
                      <div className="text-slate-400">
                        <strong className="text-slate-200">Input:</strong> {q.sampleInput || q.testCases[0]?.input}
                      </div>
                      <div className="text-slate-400">
                        <strong className="text-slate-200">Output:</strong> {q.sampleOutput || q.testCases[0]?.expectedOutput}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Web Dev Mode: Blueprint on TOP + Yours directly BELOW */}
              {isWeb && (
                <div ref={split.webStackRef} className="flex-1 min-h-[260px] flex flex-col">
                  {/* Blueprint (Top) */}
                  <div
                    style={{ height: `${100 - split.widths.yoursRatio}%` }}
                    className="min-h-[90px] rounded-xl overflow-hidden border border-white/15 bg-[#05080F] flex flex-col"
                  >
                    <div className="px-2.5 py-1 bg-[#080C14] border-b border-white/10 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider shrink-0">
                      <span className="text-slate-200 font-bold">Blueprint (Target)</span>
                      <span className="text-slate-500">Match this UI</span>
                    </div>
                    <iframe
                      title="Target Blueprint"
                      srcDoc={targetDoc}
                      className={`w-full flex-1 border-0 ${isDragging ? 'pointer-events-none' : ''}`}
                      sandbox="allow-scripts"
                    />
                  </div>

                  {/* Vertical Resize Handle between Blueprint and Yours */}
                  <div
                    role="separator"
                    aria-orientation="horizontal"
                    aria-label="Resize Blueprint and Yours previews"
                    onPointerDown={() => split.startDrag('webY')}
                    onDoubleClick={split.resetLayout}
                    title="Drag to resize Blueprint vs Yours"
                    className="h-3 shrink-0 flex items-center justify-center cursor-row-resize group"
                  >
                    <div className="w-12 h-1 rounded-full bg-white/15 group-hover:bg-white/60 transition-colors flex items-center justify-center">
                      <GripHorizontal className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />
                    </div>
                  </div>

                  {/* Yours (Below Blueprint) */}
                  <div
                    style={{ height: `${split.widths.yoursRatio}%` }}
                    className="min-h-[90px] rounded-xl overflow-hidden border border-emerald-500/30 bg-[#05080F] flex flex-col"
                  >
                    <div className="px-2.5 py-1 bg-[#080C14] border-b border-white/10 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider shrink-0">
                      <span className="text-emerald-300 font-bold inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Yours (Live)
                      </span>
                      <span className="text-slate-500">Updates as you type</span>
                    </div>
                    <iframe
                      title="Your Live Preview"
                      srcDoc={userDoc}
                      className={`w-full flex-1 border-0 ${isDragging ? 'pointer-events-none' : ''}`}
                      sandbox="allow-scripts"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Test Runner Box */}
          <div className="rounded-2xl bg-[#0A0E17] border border-white/10 p-3 space-y-2 max-h-40 overflow-y-auto shrink-0">
            <div className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">Test Runner</div>
            <div className="space-y-1.5">
              {visibleCases.map((tc: any, idx: number) => {
                const verdict = engine.testVerdicts[idx];
                const isHidden = Boolean(tc?.isHidden);
                const passed = verdict ? verdict.status === 'Accepted' : Boolean(tc?.passed);
                const failed = verdict && verdict.status !== 'Accepted';
                return (
                  <div
                    key={idx}
                    className={`px-3 py-1.5 rounded-xl border font-mono text-[11px] flex items-center justify-between gap-2 ${
                      passed
                        ? 'bg-emerald-950/35 border-emerald-500/40 text-emerald-300'
                        : failed
                          ? 'bg-red-950/35 border-red-500/40 text-red-300'
                          : 'bg-[#05080F] border-white/10 text-slate-400'
                    }`}
                  >
                    <span className="truncate">
                      {isHidden ? `Hidden Case ${idx + 1}` : tc?.testName || `Case ${idx + 1}`}:{' '}
                      <strong className="text-white">{verdict ? verdict.status : 'Pending'}</strong>
                    </span>
                    {passed && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Left <-> Center Resize Handle */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize Left Spec and Center Editor"
          onPointerDown={() => split.startDrag('left')}
          onDoubleClick={split.resetLayout}
          title="Drag to resize Spec / Editor width"
          className="hidden lg:flex w-2.5 shrink-0 items-center justify-center cursor-col-resize group"
        >
          <div className="w-1 h-14 rounded-full bg-white/10 group-hover:bg-white/60 transition-colors flex items-center justify-center">
            <GripVertical className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100" />
          </div>
        </div>

        {/* CENTER PANE: Your Code Editor */}
        <section
          style={{ '--pane-w': `${split.centerPct}%` } as React.CSSProperties}
          className="w-full lg:w-[var(--pane-w)] shrink-0 min-h-[360px] lg:min-h-0 rounded-2xl bg-[#0A0E17] border border-white/10 flex flex-col overflow-hidden"
        >
          <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between gap-2 bg-[#070A11]">
            <div className="flex items-center gap-1.5">
              {isWeb ? (
                (['html', 'css', 'js'] as EditorTab[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => engine.setActiveTab(tab)}
                    className={`px-3 py-1 rounded-lg font-mono text-[11px] font-bold cursor-pointer ${
                      engine.activeTab === tab
                        ? 'bg-white/[0.1] text-white border border-white/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab === 'html' ? 'index.html' : tab === 'css' ? 'style.css' : 'script.js'}
                  </button>
                ))
              ) : (
                <div className="px-3 py-1 rounded-lg bg-white/[0.08] border border-white/15 font-mono text-[11px] font-bold text-white">
                  {currentFileLabel}
                </div>
              )}
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase">Your Code Editor</span>
          </div>

          <div className="flex-1 min-h-0 flex bg-[#05080E] overflow-hidden">
            <div className="w-10 py-3 pr-2 text-right font-mono text-xs leading-6 text-slate-600 select-none border-r border-white/[0.06] bg-[#04060B]">
              {Array.from({ length: linesCount }, (_, i) => (
                <div key={i + 1}>{i + 1}</div>
              ))}
            </div>
            <textarea
              value={activeBuffer}
              onChange={(e) => setActiveBuffer(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault();
                  engine.runOrSubmit(false);
                } else if (e.key === 'Tab') {
                  e.preventDefault();
                  const target = e.currentTarget;
                  const s = target.selectionStart;
                  const end = target.selectionEnd;
                  setActiveBuffer(`${activeBuffer.slice(0, s)}  ${activeBuffer.slice(end)}`);
                  requestAnimationFrame(() => target.setSelectionRange(s + 2, s + 2));
                }
              }}
              spellCheck={false}
              className="flex-1 p-3 bg-transparent text-slate-100 font-mono text-xs leading-6 resize-none outline-none overflow-y-auto"
            />
          </div>

          {engine.statusNotice && (
            <div
              className={`px-3.5 py-2 border-t text-xs font-mono ${
                engine.statusNotice.type === 'ok'
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  : engine.statusNotice.type === 'err'
                    ? 'bg-red-950/40 border-red-500/30 text-red-300'
                    : 'bg-white/[0.04] border-white/10 text-slate-300'
              }`}
            >
              {engine.statusNotice.text}
            </div>
          )}

          <div className="px-3.5 py-2.5 border-t border-white/10 bg-[#070A11] flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-mono text-xs text-slate-300">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{engine.myWpm} WPM</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={engine.isCompiling || engine.isSubmitting}
                onClick={() => engine.runOrSubmit(false)}
                className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-xs font-mono font-bold text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {engine.isCompiling && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Run Tests ⌘↵</span>
              </button>
              <button
                type="button"
                disabled={engine.isCompiling || engine.isSubmitting}
                onClick={() => engine.runOrSubmit(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-slate-100 via-white to-slate-200 hover:brightness-105 text-slate-950 text-xs font-mono font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {engine.isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Submit Solution</span>
              </button>
            </div>
          </div>
        </section>

        {/* Center <-> Right Resize Handle */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize Center Editor and Right Rival Monitor"
          onPointerDown={() => split.startDrag('right')}
          onDoubleClick={split.resetLayout}
          title="Drag to resize Editor / Rival Monitor width"
          className="hidden lg:flex w-2.5 shrink-0 items-center justify-center cursor-col-resize group"
        >
          <div className="w-1 h-14 rounded-full bg-white/10 group-hover:bg-white/60 transition-colors flex items-center justify-center">
            <GripVertical className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100" />
          </div>
        </div>

        {/* RIGHT PANE: Live Rival Monitor (Fog of War) */}
        <section
          style={{ '--pane-w': `${split.widths.rightPct}%` } as React.CSSProperties}
          className="w-full lg:w-[var(--pane-w)] shrink-0 min-h-[240px] lg:min-h-0 rounded-2xl bg-[#0A0E17] border border-white/10 flex flex-col overflow-hidden"
        >
          <div className="px-3.5 py-2 border-b border-white/10 text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider truncate">
            Live Rival Monitor (Fog of War)
          </div>

          <div className="px-3.5 py-2.5 border-b border-white/10 bg-[#060910] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-white/15 flex items-center justify-center text-sm shrink-0">
                {engine.rivalProfile.avatarEmoji}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{engine.rivalProfile.name}</div>
                <div className="text-[10px] font-mono text-slate-400 truncate">
                  {engine.rivalProfile.college} &bull; {engine.rivalProfile.elo} ELO
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-400 shrink-0">
              ● {engine.rivalActivityText}
            </span>
          </div>

          <div className="relative flex-1 min-h-0 p-3.5 bg-[#05080E] overflow-hidden select-none">
            <div className="space-y-2.5">
              {FOG_SYNTAX_LINES.map((tokens, rowIdx) => {
                const isActiveLine = rowIdx + 1 <= engine.rivalLine;
                return (
                  <div
                    key={rowIdx}
                    className={`flex items-center gap-2 transition-opacity duration-500 ${
                      isActiveLine ? 'opacity-100' : 'opacity-20'
                    }`}
                  >
                    <span className="w-5 text-right font-mono text-[10px] text-slate-600">{rowIdx + 1}</span>
                    <div className="flex items-center gap-1.5 flex-1">
                      {tokens.map((tok, tIdx) => (
                        <span key={tIdx} className={`h-2.5 rounded-full ${tok.w} ${tok.tone} blur-[1px]`} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {engine.rivalToast && (
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 px-3.5 py-2.5 rounded-xl bg-[#0A0E17]/95 border border-white/25 shadow-[0_12px_32px_rgba(0,0,0,0.85)] text-center font-mono text-xs font-bold text-white">
                {engine.rivalToast}
              </div>
            )}
          </div>

          <div className="px-3.5 py-2.5 border-t border-white/10 bg-[#070A11] flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="truncate">⚡ {engine.rivalWpm} WPM &bull; Line {engine.rivalLine}</span>
            <span className="text-emerald-400 inline-flex items-center gap-1 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Focus Verified</span>
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
