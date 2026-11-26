'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { EditorTab, formatClock, getVisibleWebTabs, isWebArenaQuestion } from './arenaTypes';
import { buildWebPreviewDoc, FOG_SYNTAX_LINES } from './arenaHelpers';
import { EditorHintItem, getEditorHints } from './editorSnippets';
import { useArenaEngine } from './useArenaEngine';
import { useResizableSplit } from './useResizableSplit';
import { SparkExplainErrorButton } from '@/components/spark/SparkExplainErrorButton';

interface BattleWorkspaceProps {
  engine: ReturnType<typeof useArenaEngine>;
}

const AUTO_CLOSE_PAIRS: Record<string, string> = {
  '(': ')',
  '[': ']',
  '{': '}',
  '"': '"',
  "'": "'",
};

/**
 * Stage 3: Resizable 3-Pane Live Combat HUD.
 * Features stacked Web previews, VS Code / IntelliJ Emmet autocomplete hints,
 * and an Anti-Copy-Paste fair-play shield inside the compiler editor.
 */
export function BattleWorkspace({ engine }: BattleWorkspaceProps) {
  const q = engine.activeQuestion;
  const isWeb = isWebArenaQuestion(q, engine.combatMode);
  const visibleWebTabs = useMemo(() => (isWeb ? getVisibleWebTabs(q) : []), [q, isWeb]);
  const hasCssTab = visibleWebTabs.includes('css');
  const hasJsTab = visibleWebTabs.includes('js');
  const [specCollapsed, setSpecCollapsed] = useState(false);
  const [selectedCaseIdx, setSelectedCaseIdx] = useState<number | null>(null);
  const [pasteNotice, setPasteNotice] = useState<string>('');
  const [cursorPos, setCursorPos] = useState<number>(0);
  const [selectedHintIdx, setSelectedHintIdx] = useState<number>(0);
  const [hintsDismissed, setHintsDismissed] = useState<boolean>(false);
  const [editorFontSize, setEditorFontSize] = useState<13 | 14 | 16>(14);

  const fontSizeClass =
    editorFontSize === 13 ? 'text-[13px]' : editorFontSize === 16 ? 'text-[16px]' : 'text-[14px]';

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const gutterRef = useRef<HTMLDivElement | null>(null);
  const split = useResizableSplit(isWeb ? 33 : 27, isWeb ? 21 : 25);

  useEffect(() => {
    if (!pasteNotice) return;
    const t = setTimeout(() => setPasteNotice(''), 3800);
    return () => clearTimeout(t);
  }, [pasteNotice]);

  // Auto-expand first failing/errored test case so diagnostics show immediately
  useEffect(() => {
    if (engine.totalRuns === 0) {
      setSelectedCaseIdx(null);
      return;
    }
    const entries = Object.entries(engine.testVerdicts) as Array<[string, any]>;
    const firstFail = entries.find(([, v]) => v && v.status !== 'Accepted');
    if (firstFail) {
      setSelectedCaseIdx(Number(firstFail[0]));
    }
  }, [engine.totalRuns, engine.testVerdicts]);

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

  // VS Code / IntelliJ style Emmet & snippet suggestions at current cursor
  const hintState = useMemo(() => {
    if (hintsDismissed) return { replaceStart: cursorPos, items: [] as EditorHintItem[] };
    return getEditorHints(engine.activeTab, activeBuffer.slice(0, cursorPos));
  }, [engine.activeTab, activeBuffer, cursorPos, hintsDismissed]);

  useEffect(() => {
    setSelectedHintIdx(0);
  }, [hintState.items.length, hintState.replaceStart]);

  const acceptHint = (item: EditorHintItem) => {
    const before = activeBuffer.slice(0, hintState.replaceStart);
    const after = activeBuffer.slice(cursorPos);
    const nextCode = `${before}${item.insertText}${after}`;
    const nextCaret = before.length + item.insertText.length + item.cursorOffset;
    setActiveBuffer(nextCode);
    setCursorPos(nextCaret);
    setHintsDismissed(true);
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(nextCaret, nextCaret);
      }
    });
  };

  const blockPasteAction = () => {
    setPasteNotice('🛡️ Fair-Play Shield: Copy-paste is disabled in Battle Arena. Type your fix manually.');
  };

  const linesCount = Math.max(14, activeBuffer.split('\n').length);
  const yourPct = Math.min(100, Math.round((engine.userTestsPassed / Math.max(1, engine.totalTests)) * 100));
  const rivalPct = Math.min(100, Math.round((engine.rivalTestsPassed / Math.max(1, engine.totalTests)) * 100));

  const targetDoc = useMemo(
    () =>
      buildWebPreviewDoc(
        q.targetComponentHtml || '',
        hasCssTab ? q.targetComponentCss || '' : '',
        hasJsTab ? q.targetComponentJs || '' : ''
      ),
    [q.targetComponentHtml, q.targetComponentCss, q.targetComponentJs, hasCssTab, hasJsTab]
  );
  const userDoc = useMemo(
    () =>
      buildWebPreviewDoc(
        engine.htmlCode,
        hasCssTab ? engine.cssCode : '',
        hasJsTab ? engine.jsCode : ''
      ),
    [engine.htmlCode, engine.cssCode, engine.jsCode, hasCssTab, hasJsTab]
  );

  const visibleCases = isWeb
    ? engine.webEvaluation?.results ||
      Array.from({ length: engine.totalTests }, (_, i) => ({
        testName: q.testCases?.[i]?.description || `Check #${i + 1}`,
        passed: false,
        message: 'Pending run',
      }))
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
            <span className="text-slate-300 uppercase">{q.title}</span>
          </div>
          <span className="hidden md:inline-block px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 font-mono text-[10px] capitalize text-slate-300">
            {q.difficulty}
          </span>
        </div>

        <div
          className={`px-4 py-1 rounded-xl bg-red-950/75 border border-red-500/45 shadow-[0_0_20px_rgba(239,68,68,0.28)] flex items-center gap-2 font-mono text-sm font-black text-red-400 ${
            engine.timeLeft <= 20 ? 'animate-pulse border-red-400' : ''
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-red-400" />
          <span>{formatClock(engine.timeLeft)}</span>
        </div>

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
              {(!isWeb || !specCollapsed) && (
                <div className={`space-y-2.5 overflow-y-auto shrink-0 ${isWeb ? 'max-h-28 pr-1' : 'flex-1'}`}>
                  <h2 className="text-base sm:text-[17px] font-black text-white tracking-tight">{q.title}</h2>
                  <p className="text-[13.5px] leading-relaxed font-medium text-slate-100 whitespace-pre-line">{q.description}</p>
                  {!isWeb && (q.sampleInput || q.testCases?.[0]) && (
                    <div className="p-3.5 rounded-xl bg-[#05080F] border border-white/15 font-mono text-[12.5px] leading-relaxed space-y-1.5">
                      <div className="text-slate-200">
                        <strong className="text-white font-bold">Input:</strong> {q.sampleInput || q.testCases[0]?.input}
                      </div>
                      <div className="text-slate-200">
                        <strong className="text-white font-bold">Output:</strong> {q.sampleOutput || q.testCases[0]?.expectedOutput}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isWeb && (
                <div
                  ref={split.webStackRef}
                  onPointerDownCapture={() => engine.markPreviewInteraction()}
                  onMouseEnter={() => engine.markPreviewInteraction()}
                  onFocusCapture={() => engine.markPreviewInteraction()}
                  className="flex-1 min-h-[260px] flex flex-col"
                >
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
                      data-arena-preview="true"
                      srcDoc={targetDoc}
                      className={`w-full flex-1 border-0 ${isDragging ? 'pointer-events-none' : ''}`}
                      sandbox="allow-scripts"
                    />
                  </div>

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

                  <div
                    style={{ height: `${split.widths.yoursRatio}%` }}
                    className="min-h-[90px] rounded-xl overflow-hidden border border-emerald-500/30 bg-[#05080F] flex flex-col"
                  >
                    <div className="px-2.5 py-1 bg-[#080C14] border-b border-white/10 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider shrink-0">
                      <span className="text-emerald-300 font-bold inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Yours (Live)
                      </span>
                      <span className="text-slate-500">Interactive Sandbox</span>
                    </div>
                    <iframe
                      title="Your Live Preview"
                      data-arena-preview="true"
                      srcDoc={userDoc}
                      className={`w-full flex-1 border-0 ${isDragging ? 'pointer-events-none' : ''}`}
                      sandbox="allow-scripts"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Clickable Test Runner Box with auto-expanded stderr & expected vs actual diffs */}
          <div className="rounded-2xl bg-[#0A0E17] border border-white/10 p-3 space-y-2 max-h-56 overflow-y-auto shrink-0">
            <div className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">Test Runner</div>
            <div className="space-y-1.5">
              {visibleCases.map((tc: any, idx: number) => {
                const verdict = engine.testVerdicts[idx];
                const isHidden = Boolean(tc?.isHidden);
                const passed = verdict ? verdict.status === 'Accepted' : Boolean(tc?.passed);
                const failed = verdict && verdict.status !== 'Accepted';
                const expanded = selectedCaseIdx === idx;
                return (
                  <div key={idx} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setSelectedCaseIdx(expanded ? null : idx)}
                      className={`w-full text-left px-3 py-1.5 rounded-xl border font-mono text-[11px] flex items-center justify-between gap-2 cursor-pointer ${
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
                      <span className="flex items-center gap-1 shrink-0">
                        {passed && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        {verdict && (expanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />)}
                      </span>
                    </button>
                    {expanded && verdict && (
                      <div className="px-3 py-2 rounded-lg bg-[#05080F] border border-white/10 font-mono text-[10px] text-slate-300 space-y-1.5">
                        {!isHidden && !isWeb && tc?.input && (
                          <div className="break-all"><span className="text-slate-500">Input:</span> {tc.input}</div>
                        )}
                        {!isHidden && !isWeb && tc?.expectedOutput !== undefined && (
                          <div className="break-all"><span className="text-slate-500">Expected:</span> {tc.expectedOutput}</div>
                        )}
                        {verdict.stdout && (
                          <div className="break-words"><span className="text-slate-500">Output:</span> {verdict.stdout}</div>
                        )}
                        {verdict.stderr && (
                          <pre className="whitespace-pre-wrap break-words text-red-300 bg-red-950/30 border border-red-500/20 rounded p-2 text-[10px] leading-relaxed">
                            {verdict.stderr}
                          </pre>
                        )}
                        {failed && (
                          <SparkExplainErrorButton
                            code={
                              isWeb
                                ? `<!-- HTML -->\n${engine.htmlCode}\n/* CSS */\n${engine.cssCode}\n// JS\n${engine.jsCode}`
                                : engine.algoLanguage === 'java'
                                  ? engine.javaCode
                                  : engine.algoLanguage === 'cpp'
                                    ? engine.cppCode
                                    : engine.pythonCode
                            }
                            language={isWeb ? 'html/css/js' : engine.algoLanguage}
                            problemTitle={q.title}
                            problemDescription={q.description}
                            verdict={verdict.status}
                            errorOutput={verdict.stderr || verdict.stdout || verdict.status}
                            stdin={!isHidden && !isWeb ? tc?.input : undefined}
                            expectedOutput={!isHidden && !isWeb ? tc?.expectedOutput : undefined}
                            yourOutput={verdict.stdout}
                          />
                        )}
                      </div>
                    )}
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

        {/* CENTER PANE: Your Code Editor with VS Code Emmet Hints & Anti-Paste Shield */}
        <section
          style={{ '--pane-w': `${split.centerPct}%` } as React.CSSProperties}
          className="w-full lg:w-[var(--pane-w)] shrink-0 min-h-[360px] lg:min-h-0 rounded-2xl bg-[#0A0E17] border border-white/10 flex flex-col overflow-hidden"
        >
          <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between gap-2 bg-[#070A11]">
            <div className="flex items-center gap-1.5">
              {isWeb ? (
                visibleWebTabs.map((tab) => (
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
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <div className="inline-flex items-center gap-0.5 p-0.5 rounded-md bg-white/[0.04] border border-white/10">
                {([13, 14, 16] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setEditorFontSize(sz)}
                    title={`Set editor font size to ${sz}px`}
                    className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold cursor-pointer transition-colors ${
                      editorFontSize === sz ? 'bg-white text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {sz}px
                  </button>
                ))}
              </div>
              <span className="hidden 2xl:inline-flex items-center gap-1 text-slate-400 whitespace-nowrap shrink-0">
                <Sparkles className="w-3 h-3 text-slate-300" />
                Emmet / Hints Active
              </span>
              <span className="hidden 2xl:inline text-slate-600">&bull;</span>
              <span className="text-slate-500 uppercase whitespace-nowrap shrink-0">No-Paste</span>
            </div>
          </div>

          <div className="relative flex-1 min-h-0 flex bg-[#060A12] overflow-hidden">
            <div
              ref={gutterRef}
              className={`w-11 py-3.5 pr-2.5 text-right font-mono ${fontSizeClass} leading-[1.75] text-slate-500 select-none border-r border-white/[0.07] bg-[#04060B] overflow-hidden`}
            >
              {Array.from({ length: linesCount }, (_, i) => (
                <div key={i + 1}>{i + 1}</div>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              value={activeBuffer}
              onScroll={(e) => {
                if (gutterRef.current) gutterRef.current.scrollTop = e.currentTarget.scrollTop;
              }}
              onPaste={(e) => {
                e.preventDefault();
                blockPasteAction();
              }}
              onDrop={(e) => {
                e.preventDefault();
                blockPasteAction();
              }}
              onClick={(e) => {
                setCursorPos(e.currentTarget.selectionStart);
              }}
              onChange={(e) => {
                setHintsDismissed(false);
                setCursorPos(e.target.selectionStart);
                setActiveBuffer(e.target.value);
              }}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'v') {
                  e.preventDefault();
                  blockPasteAction();
                  return;
                }
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault();
                  engine.runOrSubmit(false);
                  return;
                }

                // IntelliSense keyboard navigation & acceptance
                if (hintState.items.length > 0) {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelectedHintIdx((i) => (i + 1) % hintState.items.length);
                    return;
                  }
                  if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelectedHintIdx((i) => (i - 1 + hintState.items.length) % hintState.items.length);
                    return;
                  }
                  if (e.key === 'Tab' || e.key === 'Enter') {
                    e.preventDefault();
                    acceptHint(hintState.items[selectedHintIdx] || hintState.items[0]);
                    return;
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    setHintsDismissed(true);
                    return;
                  }
                }

                if (e.key === 'Tab') {
                  e.preventDefault();
                  const target = e.currentTarget;
                  const s = target.selectionStart;
                  const end = target.selectionEnd;
                  const step = engine.activeTab === 'python' ? '    ' : '  ';
                  const next = `${activeBuffer.slice(0, s)}${step}${activeBuffer.slice(end)}`;
                  setActiveBuffer(next);
                  setCursorPos(s + step.length);
                  requestAnimationFrame(() => target.setSelectionRange(s + step.length, s + step.length));
                  return;
                }

                // Smart Enter auto-indentation (preserves leading indent & indents after ':' or '{')
                if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
                  const target = e.currentTarget;
                  const s = target.selectionStart;
                  const end = target.selectionEnd;
                  if (s === end) {
                    const lineStart = activeBuffer.lastIndexOf('\n', s - 1) + 1;
                    const lineBefore = activeBuffer.slice(lineStart, s);
                    const baseIndent = (lineBefore.match(/^[ \t]*/) || [''])[0];
                    const trimmed = lineBefore.trimEnd();
                    const step = engine.activeTab === 'python' ? '    ' : '  ';
                    const shouldIndent = trimmed.endsWith('{') || (engine.activeTab === 'python' && trimmed.endsWith(':'));
                    const nextChar = activeBuffer[s];

                    if (trimmed.endsWith('{') && nextChar === '}') {
                      e.preventDefault();
                      const insert = `\n${baseIndent}${step}\n${baseIndent}`;
                      const next = `${activeBuffer.slice(0, s)}${insert}${activeBuffer.slice(end)}`;
                      const caret = s + 1 + baseIndent.length + step.length;
                      setActiveBuffer(next);
                      setCursorPos(caret);
                      requestAnimationFrame(() => target.setSelectionRange(caret, caret));
                      return;
                    }

                    if (baseIndent.length > 0 || shouldIndent) {
                      e.preventDefault();
                      const extra = shouldIndent ? step : '';
                      const insert = `\n${baseIndent}${extra}`;
                      const next = `${activeBuffer.slice(0, s)}${insert}${activeBuffer.slice(end)}`;
                      const caret = s + insert.length;
                      setActiveBuffer(next);
                      setCursorPos(caret);
                      requestAnimationFrame(() => target.setSelectionRange(caret, caret));
                      return;
                    }
                  }
                }

                // Overtype duplicate closing bracket / quote cleanly
                if (
                  (e.key === ')' || e.key === ']' || e.key === '}' || e.key === '"' || e.key === "'") &&
                  !e.metaKey &&
                  !e.ctrlKey &&
                  !e.altKey
                ) {
                  const target = e.currentTarget;
                  const s = target.selectionStart;
                  const end = target.selectionEnd;
                  if (s === end && activeBuffer[s] === e.key) {
                    e.preventDefault();
                    setCursorPos(s + 1);
                    requestAnimationFrame(() => target.setSelectionRange(s + 1, s + 1));
                    return;
                  }
                }

                // Auto-closing brackets and quotes
                const closing = AUTO_CLOSE_PAIRS[e.key];
                if (closing && !e.metaKey && !e.ctrlKey && !e.altKey) {
                  const target = e.currentTarget;
                  const s = target.selectionStart;
                  const end = target.selectionEnd;
                  if (s === end) {
                    e.preventDefault();
                    const next = `${activeBuffer.slice(0, s)}${e.key}${closing}${activeBuffer.slice(end)}`;
                    setActiveBuffer(next);
                    setCursorPos(s + 1);
                    requestAnimationFrame(() => target.setSelectionRange(s + 1, s + 1));
                  }
                }
              }}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              autoComplete="off"
              wrap="off"
              data-gramm="false"
              className={`flex-1 p-3.5 bg-transparent text-white/95 antialiased font-mono font-medium ${fontSizeClass} leading-[1.75] resize-none outline-none overflow-auto whitespace-pre select-text`}
            />

            {/* Floating VS Code / IntelliJ Abbreviation Hints Bar */}
            {hintState.items.length > 0 && (
              <div
                role="listbox"
                aria-label="Code autocomplete suggestions"
                className="absolute left-12 bottom-3 z-20 w-80 max-w-[calc(100%-3.5rem)] rounded-xl bg-[#0A0F1A]/95 border border-white/20 shadow-[0_14px_36px_rgba(0,0,0,0.85)] backdrop-blur-xl overflow-hidden"
              >
                <div className="px-3 py-1 bg-white/[0.04] border-b border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>IntelliSense Hints</span>
                  <span>Tab / Enter to expand</span>
                </div>
                <div className="divide-y divide-white/[0.05]">
                  {hintState.items.map((item, idx) => (
                    <button
                      key={`${item.badge}-${item.label}`}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        acceptHint(item);
                      }}
                      className={`w-full px-3 py-1.5 text-left font-mono text-[11px] flex items-center justify-between gap-2 cursor-pointer ${
                        idx === selectedHintIdx ? 'bg-white/[0.12] text-white' : 'text-slate-300 hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="px-1.5 py-0.5 rounded bg-white/[0.08] text-[9px] font-bold text-slate-200 shrink-0">
                          {item.badge}
                        </span>
                        <span className="font-bold text-white shrink-0">{item.label}</span>
                        <span className="text-slate-400 truncate">{item.preview}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {pasteNotice && (
            <div className="px-3.5 py-2 border-t bg-red-950/60 border-red-500/40 text-xs font-mono text-red-200 flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>{pasteNotice}</span>
            </div>
          )}

          {engine.statusNotice && !pasteNotice && (
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
            <div className="flex items-center gap-3 font-mono text-xs text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>{engine.myWpm} WPM</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-400">
                <ShieldCheck className="w-3 h-3" />
                Anti-Paste Shield
              </span>
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
