'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Plus,
  ArrowUp,
  Square,
  SquarePen,
  Code2,
  Brain,
  Trophy,
  PanelLeftOpen,
  Copy,
  Check,
  Share2,
  ArrowRight,
  Loader2,
  Swords,
  Terminal,
  Users,
  Rocket,
  X,
  FileText,
  ChevronDown,
  Zap,
  Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { SparkBlueprintStudio } from '@/components/spark/SparkBlueprintStudio';
import { SparkChatMessage } from '@/components/spark/SparkSuperpowersPanel';
import { SparkMarkdown } from '@/components/spark/SparkMarkdown';
import { SparkSidebar, SparkMode, StoredSparkThread } from '@/components/spark/SparkSidebar';

type ModelTier = 'fast' | 'deep';

interface PendingAttachment {
  name: string;
  mimeType: string;
  base64: string;
}

const THREADS_STORAGE_KEY = 'kollabrix_spark_threads_v2';
const ACTIVE_THREAD_KEY = 'kollabrix_spark_active_v2';

const WELCOME_HEADINGS: Record<SparkMode, string> = {
  general: 'What can I help with?',
  code: 'What are we building or debugging?',
  dsa: "Let's crack your next coding round.",
  hackathon: 'Hackathon & Squad Studio',
};

const QUICK_SUGGESTIONS: Array<{
  label: string;
  mode: SparkMode;
  prompt?: string;
  pickFile?: boolean;
  icon: React.ComponentType<any>;
  iconColor: string;
}> = [
  {
    label: 'Run Python quick-sort in Sandbox',
    mode: 'code',
    prompt: 'Write a clean Python quick-sort script with test output so I can run it in Sandbox',
    icon: Code2,
    iconColor: 'text-cyan-400',
  },
  {
    label: 'Sliding Window vs Two Pointers (C++)',
    mode: 'dsa',
    prompt: 'Explain Sliding Window vs Two Pointers with runnable C++ template code',
    icon: Brain,
    iconColor: 'text-amber-400',
  },
  {
    label: 'Launch Hackathon MVP & Squad',
    mode: 'hackathon',
    icon: Trophy,
    iconColor: 'text-emerald-400',
  },
  {
    label: 'Analyze Screenshot or PDF',
    mode: 'general',
    pickFile: true,
    icon: ImageIcon,
    iconColor: 'text-violet-400',
  },
];

function readStoredThreads(): StoredSparkThread[] {
  try {
    const raw = localStorage.getItem(THREADS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredThreads(threads: StoredSparkThread[], activeId: string | null) {
  try {
    localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify(threads.slice(0, 30)));
    if (activeId) {
      localStorage.setItem(ACTIVE_THREAD_KEY, activeId);
    } else {
      localStorage.removeItem(ACTIVE_THREAD_KEY);
    }
  } catch {}
}

export default function SparkUniversalWorkspacePage() {
  const { user, profile } = useAuth();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const streamAbortRef = useRef<AbortController | null>(null);

  const [mode, setMode] = useState<SparkMode>('general');
  const [tier, setTier] = useState<ModelTier>('fast');
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [threads, setThreads] = useState<StoredSparkThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [remoteSessionId, setRemoteSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SparkChatMessage[]>([]);
  const [blueprint, setBlueprint] = useState<any>(null);

  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [quotaNote, setQuotaNote] = useState('');
  const [deepRemaining, setDeepRemaining] = useState<number>(6);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  // Hydrate threads from localStorage immediately on mount
  useEffect(() => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const sharedId = params?.get('session');

    if (sharedId) {
      fetch(`/api/spark/sessions?id=${encodeURIComponent(sharedId)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.success && d?.session) {
            const loaded: StoredSparkThread = {
              id: d.session.id,
              remoteId: d.session.id,
              title: d.session.title || 'Shared Chat',
              mode: d.session.blueprint?.summary ? 'hackathon' : (d.session.track as SparkMode) || 'general',
              messages: Array.isArray(d.session.messages) ? d.session.messages : [],
              blueprint: d.session.blueprint?.summary ? d.session.blueprint : null,
              updatedAt: d.session.updated_at || new Date().toISOString(),
            };
            setThreads((prev) => [loaded, ...prev.filter((t) => t.id !== loaded.id)]);
            setActiveThreadId(loaded.id);
            setRemoteSessionId(loaded.remoteId || null);
            setMessages(loaded.messages);
            setBlueprint(loaded.blueprint || null);
            setMode(loaded.mode);
          }
        })
        .catch(() => {});
      return;
    }

    const localThreads = readStoredThreads();
    if (localThreads.length > 0) {
      setThreads(localThreads);
      try {
        const lastActiveId = localStorage.getItem(ACTIVE_THREAD_KEY);
        const found = localThreads.find((t) => t.id === lastActiveId);
        if (found) {
          setActiveThreadId(found.id);
          setRemoteSessionId(found.remoteId || null);
          setMessages(found.messages || []);
          setBlueprint(found.blueprint || null);
          setMode(found.mode || 'general');
        }
      } catch {}
    }
  }, []);

  // Merge remote Supabase sessions when signed in
  useEffect(() => {
    if (!user?.id) return;
    fetch('/api/spark/sessions', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d?.success || !Array.isArray(d.sessions)) return;
        const remoteThreads: StoredSparkThread[] = d.sessions.map((s: any) => ({
          id: s.id,
          remoteId: s.id,
          title: s.title || 'Spark Chat',
          mode: s.blueprint?.summary ? 'hackathon' : (s.track as SparkMode) || 'general',
          messages: Array.isArray(s.messages) ? s.messages : [],
          blueprint: s.blueprint?.summary ? s.blueprint : null,
          updatedAt: s.updated_at || new Date().toISOString(),
        }));

        setThreads((prev) => {
          const map = new Map<string, StoredSparkThread>();
          for (const rt of remoteThreads) map.set(rt.id, rt);
          for (const lt of prev) {
            if (!lt.remoteId && !map.has(lt.id)) map.set(lt.id, lt);
          }
          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          writeStoredThreads(merged, activeThreadId);
          return merged;
        });
      })
      .catch(() => {});
  }, [user?.id]);

  // Smoothly scroll ONLY the inner message container
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length, messages[messages.length - 1]?.content]);

  const upsertLocalThread = (
    threadId: string,
    title: string,
    threadMode: SparkMode,
    nextMsgs: SparkChatMessage[],
    bp: any,
    rId?: string | null
  ) => {
    setThreads((prev) => {
      const entry: StoredSparkThread = {
        id: threadId,
        remoteId: rId || prev.find((t) => t.id === threadId)?.remoteId,
        title,
        mode: threadMode,
        messages: nextMsgs,
        blueprint: bp,
        updatedAt: new Date().toISOString(),
      };
      const updated = [entry, ...prev.filter((t) => t.id !== threadId)];
      writeStoredThreads(updated, threadId);
      return updated;
    });
  };

  const handleStopStream = () => {
    if (streamAbortRef.current) {
      streamAbortRef.current.abort();
      streamAbortRef.current = null;
    }
    setStreaming(false);
  };

  const handleNewChat = () => {
    handleStopStream();
    setActiveThreadId(null);
    setRemoteSessionId(null);
    setMessages([]);
    setBlueprint(null);
    setInput('');
    setAttachments([]);
    setErrorMsg('');
    setQuotaNote('');
    setModelMenuOpen(false);
    setMode('general');
    try {
      localStorage.removeItem(ACTIVE_THREAD_KEY);
    } catch {}
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  };

  const handleSelectMode = (nextMode: SparkMode) => {
    handleStopStream();
    setMode(nextMode);
    if (nextMode !== 'hackathon') {
      // Starting/switching chat modes keeps composer crisp
      setErrorMsg('');
    }
  };

  const handleSelectThread = (t: StoredSparkThread) => {
    handleStopStream();
    setActiveThreadId(t.id);
    setRemoteSessionId(t.remoteId || null);
    setMessages(t.messages || []);
    setBlueprint(t.blueprint || null);
    setMode(t.mode || 'general');
    setErrorMsg('');
    try {
      localStorage.setItem(ACTIVE_THREAD_KEY, t.id);
    } catch {}
  };

  const handleDeleteThread = (id: string, rId?: string) => {
    if (rId) {
      fetch(`/api/spark/sessions?id=${rId}`, { method: 'DELETE' }).catch(() => {});
    }
    setThreads((prev) => {
      const next = prev.filter((item) => item.id !== id);
      writeStoredThreads(next, activeThreadId === id ? null : activeThreadId);
      return next;
    });
    if (activeThreadId === id) handleNewChat();
  };

  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const next: PendingAttachment[] = [];
    for (const f of files.slice(0, 3)) {
      if (f.size > 4 * 1024 * 1024) {
        setErrorMsg(`"${f.name}" is larger than 4MB.`);
        continue;
      }
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = String(reader.result || '');
          const commaIdx = result.indexOf(',');
          resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result);
        };
        reader.readAsDataURL(f);
      });
      next.push({ name: f.name, mimeType: f.type || 'application/octet-stream', base64 });
    }
    setAttachments((prev) => [...prev, ...next].slice(0, 3));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = async (customText?: string, overrideMode?: SparkMode) => {
    const effectiveMode = overrideMode || mode;
    if (overrideMode && overrideMode !== mode) setMode(overrideMode);

    const text = (customText ?? input).trim();
    if ((!text && attachments.length === 0) || streaming) return;

    const currentAttachments = customText ? [] : attachments;
    if (!customText) {
      setInput('');
      setAttachments([]);
    }

    setErrorMsg('');
    setQuotaNote('');
    const promptDisplay = text || `Analyze attached: ${currentAttachments.map((a) => a.name).join(', ')}`;
    const prevMessages = messages;
    const threadId = activeThreadId || `local-${Date.now()}`;
    if (!activeThreadId) setActiveThreadId(threadId);

    const threadTitle =
      threads.find((t) => t.id === threadId)?.title ||
      promptDisplay.replace(/\s+/g, ' ').slice(0, 44) + (promptDisplay.length > 44 ? '...' : '');

    const optimisticUser: SparkChatMessage = {
      role: 'user',
      content: promptDisplay,
      ...(currentAttachments.length > 0 ? { attachmentNames: currentAttachments.map((a) => a.name) } : {}),
    };
    const optimisticAssistant: SparkChatMessage = {
      role: 'assistant',
      content: '',
      engine: tier === 'deep' ? 'KΛ-Pro' : 'KΛ-1',
    };

    const initialMsgs = [...prevMessages, optimisticUser, optimisticAssistant];
    setMessages(initialMsgs);
    setStreaming(true);

    const abortCtrl = new AbortController();
    streamAbortRef.current = abortCtrl;

    try {
      const res = await fetch('/api/spark/chat', {
        method: 'POST',
        signal: abortCtrl.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: remoteSessionId,
          mode: effectiveMode,
          tier,
          userMessage: promptDisplay,
          messages: prevMessages,
          attachments: currentAttachments,
          blueprint,
          stream: true,
        }),
      });

      if (!res.ok || !res.body) {
        const errJson = await res.json().catch(() => null);
        setErrorMsg(errJson?.error || 'AI Spark could not respond right now.');
        setMessages(prevMessages);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let streamedText = '';
      let streamEngine = optimisticAssistant.engine;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const blocks = buffer.split('\n\n');
        buffer = blocks.pop() || '';

        for (const block of blocks) {
          const lines = block.split('\n');
          let evt = 'message';
          let dataLine = '';
          for (const ln of lines) {
            if (ln.startsWith('event:')) evt = ln.slice(6).trim();
            if (ln.startsWith('data:')) dataLine += ln.slice(5).trim();
          }
          if (!dataLine) continue;

          try {
            const payload = JSON.parse(dataLine);
            if (evt === 'meta') {
              if (payload.engine) streamEngine = payload.engine;
              if (typeof payload.deepRemaining === 'number') setDeepRemaining(payload.deepRemaining);
              if (payload.quotaNote) setQuotaNote(payload.quotaNote);
            } else if (evt === 'delta' && payload.text) {
              streamedText += payload.text;
              setMessages([
                ...prevMessages,
                optimisticUser,
                { role: 'assistant', content: streamedText, engine: streamEngine },
              ]);
            } else if (evt === 'done') {
              const finalMsgs = Array.isArray(payload.messages)
                ? payload.messages
                : [
                    ...prevMessages,
                    optimisticUser,
                    { role: 'assistant', content: streamedText, engine: streamEngine, actions: payload.actions },
                  ];
              setMessages(finalMsgs);
              const nextRemoteId = payload.sessionId || remoteSessionId;
              if (nextRemoteId) setRemoteSessionId(nextRemoteId);
              upsertLocalThread(threadId, threadTitle, effectiveMode, finalMsgs, blueprint, nextRemoteId);
            }
          } catch {}
        }
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        setErrorMsg('Network error. Please try again.');
        setMessages(prevMessages);
      }
    } finally {
      streamAbortRef.current = null;
      setStreaming(false);
    }
  };

  // Sleek Rounded Pill Composer
  const renderComposer = () => (
    <div className="w-full max-w-[760px] mx-auto space-y-2">
      {quotaNote && <p className="text-[11px] text-amber-300 font-mono text-center">{quotaNote}</p>}
      {errorMsg && <p className="text-xs text-rose-400 font-semibold text-center">{errorMsg}</p>}

      <div className="rounded-[26px] bg-[#141720] border border-white/[0.12] hover:border-white/[0.18] focus-within:border-white/30 px-3.5 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.65)] transition-all">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pb-2">
            {attachments.map((att, i) => (
              <div
                key={`${att.name}-${i}`}
                className="px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-cyan-200 flex items-center gap-1.5"
              >
                <FileText className="w-3 h-3" />
                <span className="max-w-[160px] truncate">{att.name}</span>
                <button
                  type="button"
                  onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            multiple
            className="hidden"
            onChange={handleFilePick}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach screenshot or PDF"
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0 mb-0.5"
          >
            <Plus className="w-5 h-5" />
          </button>

          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              mode === 'code'
                ? 'Paste code or ask KΛ to build & run...'
                : mode === 'dsa'
                ? 'Ask a DSA question or start a mock OA...'
                : 'Ask KΛ anything'
            }
            className="flex-1 bg-transparent py-2 text-[14.5px] text-white placeholder:text-zinc-500 focus:outline-none resize-none max-h-40 leading-relaxed"
          />

          <button
            type="button"
            onClick={() => setTier(tier === 'deep' ? 'fast' : 'deep')}
            title="Toggle KΛ-Pro Deep Think"
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shrink-0 mb-0.5 border ${
              tier === 'deep'
                ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                : 'bg-white/[0.04] border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>KΛ-Pro</span>
          </button>

          {streaming ? (
            <button
              type="button"
              onClick={handleStopStream}
              title="Stop generating"
              className="w-9 h-9 rounded-full bg-white text-zinc-950 flex items-center justify-center transition-all cursor-pointer shrink-0 mb-0.5"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!input.trim() && attachments.length === 0}
              className="w-9 h-9 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 flex items-center justify-center transition-all cursor-pointer disabled:opacity-25 shrink-0 mb-0.5"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const isNewChatState = !activeThreadId && messages.length === 0 && mode === 'general';

  return (
    <div className="h-screen w-full overflow-hidden bg-[#050609] text-zinc-100 flex">
      {sidebarOpen && (
        <SparkSidebar
          threads={threads}
          activeThreadId={activeThreadId}
          activeMode={mode}
          isNewChatState={isNewChatState}
          user={user}
          profile={profile}
          deepRemaining={deepRemaining}
          onNewChat={handleNewChat}
          onSelectMode={handleSelectMode}
          onSelectThread={handleSelectThread}
          onDeleteThread={handleDeleteThread}
          onCloseSidebar={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Chat Viewport with subtle Obsidian ambient sheen */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.03),transparent_55%)]">
        {/* Minimal ChatGPT-style Top Header */}
        <header className="h-14 px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 relative z-20">
          <div className="flex items-center gap-1.5">
            {!sidebarOpen && (
              <>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
                  title="Open sidebar"
                >
                  <PanelLeftOpen className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNewChat}
                  className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
                  title="New chat"
                >
                  <SquarePen className="w-4 h-4" />
                </button>
              </>
            )}

            <div className="relative">
              <button
                type="button"
                onClick={() => setModelMenuOpen(!modelMenuOpen)}
                className="px-3 py-1.5 rounded-xl hover:bg-white/[0.06] text-[15px] font-semibold text-zinc-100 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>{tier === 'deep' ? 'KΛ-Pro' : 'KΛ-1'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {modelMenuOpen && (
                <div className="absolute left-0 mt-1.5 w-64 rounded-2xl bg-[#0E1119] border border-white/15 shadow-2xl p-1.5 space-y-1 z-50">
                  <button
                    type="button"
                    onClick={() => {
                      setTier('fast');
                      setModelMenuOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl flex items-start gap-2.5 cursor-pointer ${
                      tier === 'fast' ? 'bg-white/10' : 'hover:bg-white/5'
                    }`}
                  >
                    <Zap className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">KΛ-1</div>
                      <div className="text-[11px] text-zinc-400">Fast daily answers, code &amp; notes</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTier('deep');
                      setModelMenuOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl flex items-start gap-2.5 cursor-pointer ${
                      tier === 'deep' ? 'bg-white/10' : 'hover:bg-white/5'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">KΛ-Pro ({deepRemaining} left)</div>
                      <div className="text-[11px] text-zinc-400">Deep reasoning for tough bugs &amp; architecture</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {mode !== 'general' && (
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-zinc-300 capitalize">
                {mode}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {mode === 'hackathon' && (
              <button
                type="button"
                onClick={handleNewChat}
                className="px-3 py-1.5 rounded-full bg-white/[0.07] hover:bg-white/12 text-xs font-medium text-white cursor-pointer transition-colors"
              >
                New Chat
              </button>
            )}
            {remoteSessionId && (
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/spark?session=${remoteSessionId}`);
                  setShareCopied(true);
                  setTimeout(() => setShareCopied(false), 2000);
                }}
                className="px-3 py-1.5 rounded-full bg-white/[0.07] hover:bg-white/12 text-xs font-medium text-zinc-200 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {shareCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{shareCopied ? 'Copied' : 'Share'}</span>
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Content Region */}
        {mode === 'hackathon' ? (
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
            <SparkBlueprintStudio
              user={user}
              profile={profile}
              blueprint={blueprint}
              setBlueprint={setBlueprint}
              sessionId={remoteSessionId}
              setSessionId={setRemoteSessionId}
              copilotMessages={messages}
              setCopilotMessages={setMessages}
              onSessionCreated={(sess) => {
                const entry: StoredSparkThread = {
                  id: sess.id,
                  remoteId: sess.id,
                  title: sess.title,
                  mode: 'hackathon',
                  messages: [],
                  blueprint: sess.blueprint,
                  updatedAt: sess.updated_at || new Date().toISOString(),
                };
                setThreads((prev) => {
                  const next = [entry, ...prev];
                  writeStoredThreads(next, entry.id);
                  return next;
                });
                setActiveThreadId(entry.id);
              }}
            />
          </div>
        ) : messages.length === 0 ? (
          /* Centered ChatGPT-Style Welcome Screen */
          <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pb-10">
            <div className="w-full max-w-[760px] space-y-6">
              <h1 className="text-2xl sm:text-[30px] font-semibold tracking-tight text-white text-center">
                {WELCOME_HEADINGS[mode]}
              </h1>

              {renderComposer()}

              {/* Clean Horizontal Pill Suggestions */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                {QUICK_SUGGESTIONS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        if (item.pickFile) {
                          fileInputRef.current?.click();
                        } else if (item.mode === 'hackathon') {
                          setMode('hackathon');
                        } else if (item.prompt) {
                          handleSendMessage(item.prompt, item.mode);
                        }
                      }}
                      className="px-3.5 py-2 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 text-xs text-zinc-300 hover:text-white flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Icon className={`w-3.5 h-3.5 ${item.iconColor} shrink-0`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Clean Active Chat Stream + Docked Bottom Pill */
          <>
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
              <div className="max-w-[760px] mx-auto space-y-7 pb-6">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    {msg.role === 'user' ? (
                      <div className="max-w-[78%] rounded-[20px] px-4 py-2.5 bg-[#1B1F2A] border border-white/[0.08] text-[14.5px] text-zinc-100 leading-relaxed space-y-2">
                        {Array.isArray(msg.attachmentNames) && msg.attachmentNames.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {msg.attachmentNames.map((name) => (
                              <span
                                key={name}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/40 border border-white/15 text-[11px] font-mono text-cyan-200"
                              >
                                <FileText className="w-3 h-3" />
                                <span>{name}</span>
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      </div>
                    ) : (
                      <div className="group w-full flex items-start gap-3.5">
                        <div className="w-7 h-7 rounded-full bg-[#131722] border border-white/15 flex items-center justify-center shrink-0 mt-0.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        </div>

                        <div className="flex-1 min-w-0 space-y-2">
                          {msg.content ? (
                            <SparkMarkdown content={msg.content} />
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-zinc-400 py-1.5">
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                              <span>Thinking...</span>
                            </div>
                          )}

                          {/* Bottom Clean Action Row */}
                          {msg.content && (
                            <div className="flex items-center gap-3 pt-1 text-[11px] text-zinc-500">
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(msg.content);
                                  setCopiedIdx(idx);
                                  setTimeout(() => setCopiedIdx(null), 1800);
                                }}
                                className="hover:text-zinc-200 flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                {copiedIdx === idx ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                                <span>{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                              </button>
                              {msg.engine && <span className="font-mono text-zinc-600">{msg.engine}</span>}
                            </div>
                          )}

                          {Array.isArray(msg.actions) && msg.actions.length > 0 && (
                            <div className="pt-1.5 flex flex-wrap gap-2">
                              {msg.actions.map((act) => {
                                const ActIcon =
                                  act.kind === 'arena'
                                    ? Swords
                                    : act.kind === 'icpc'
                                    ? Terminal
                                    : act.kind === 'teammates'
                                    ? Users
                                    : Rocket;
                                return (
                                  <Link
                                    key={act.href}
                                    href={act.href}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.09] border border-white/12 text-xs font-medium text-zinc-200 transition-all"
                                  >
                                    <ActIcon className="w-3.5 h-3.5 text-amber-400" />
                                    <span>{act.label}</span>
                                    <ArrowRight className="w-3 h-3 text-zinc-500" />
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="px-4 sm:px-6 pb-4 pt-2 bg-[#050609] shrink-0">
              {renderComposer()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
