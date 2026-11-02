'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Eye,
  EyeOff,
  Radio,
  Clock,
  Zap,
  CheckCircle2,
  AlertCircle,
  X,
  Code2,
  FileCode,
  Layers,
  Activity,
  Terminal,
  Trophy,
  Sparkles,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { ArenaRoom } from '@/lib/arena/roomStorage';

interface ContenderCodeState {
  playerId: string;
  playerName: string;
  squad: 'alpha' | 'omega';
  htmlCode?: string;
  cssCode?: string;
  jsCode?: string;
  pythonCode?: string;
  javaCode?: string;
  cppCode?: string;
  wpm: number;
  testsPassed: number;
  lastUpdate: number;
}

interface AdminSecretSpectatorViewProps {
  roomCode: string;
  onClose: () => void;
}

export function AdminSecretSpectatorView({
  roomCode,
  onClose,
}: AdminSecretSpectatorViewProps) {
  const [room, setRoom] = useState<ArenaRoom | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [alphaData, setAlphaData] = useState<ContenderCodeState | null>(null);
  const [omegaData, setOmegaData] = useState<ContenderCodeState | null>(null);

  // Active tab per contender
  const [tabAlpha, setTabAlpha] = useState<'preview' | 'html' | 'css' | 'js' | 'code'>('preview');
  const [tabOmega, setTabOmega] = useState<'preview' | 'html' | 'css' | 'js' | 'code'>('preview');

  const channelRef = useRef<any>(null);

  // Fetch initial room metadata
  useEffect(() => {
    let isMounted = true;
    const loadRoom = async () => {
      try {
        const res = await fetch(`/api/arena/rooms?code=${roomCode}&_t=${Date.now()}`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.room) {
            setRoom(data.room);
            // Default tabs
            if (data.room.arena !== 'web_dev') {
              setTabAlpha('code');
              setTabOmega('code');
            }
          }
        }
      } catch (err) {
        console.error('Error fetching room for spectator:', err);
      }
    };
    loadRoom();
    return () => {
      isMounted = false;
    };
  }, [roomCode]);

  // Connect on-demand to Supabase Realtime channel
  useEffect(() => {
    if (!roomCode) return;

    setConnectionStatus('connecting');
    const channelName = `arena_duel_${roomCode}`;
    const channel = supabase.channel(channelName);

    channel
      .on('broadcast', { event: 'spectator_code_sync' }, ({ payload }) => {
        if (!payload) return;
        const contender: ContenderCodeState = {
          playerId: payload.playerId,
          playerName: payload.playerName,
          squad: payload.squad,
          htmlCode: payload.htmlCode,
          cssCode: payload.cssCode,
          jsCode: payload.jsCode,
          pythonCode: payload.pythonCode,
          javaCode: payload.javaCode,
          cppCode: payload.cppCode,
          wpm: payload.wpm ?? 0,
          testsPassed: payload.testsPassed ?? 0,
          lastUpdate: Date.now(),
        };

        if (payload.squad === 'alpha') {
          setAlphaData(contender);
        } else if (payload.squad === 'omega') {
          setOmegaData(contender);
        }
      })
      .on('broadcast', { event: 'progress_sync' }, ({ payload }) => {
        if (!payload) return;
        if (payload.playerId) {
          setAlphaData((prev) => {
            if (prev && prev.playerId === payload.playerId) {
              return {
                ...prev,
                testsPassed: payload.testsPassed ?? prev.testsPassed,
                wpm: payload.wpm ?? prev.wpm,
                lastUpdate: Date.now(),
              };
            }
            return prev;
          });
          setOmegaData((prev) => {
            if (prev && prev.playerId === payload.playerId) {
              return {
                ...prev,
                testsPassed: payload.testsPassed ?? prev.testsPassed,
                wpm: payload.wpm ?? prev.wpm,
                lastUpdate: Date.now(),
              };
            }
            return prev;
          });
        }
      })
      .on('broadcast', { event: 'room_sync' }, ({ payload }) => {
        if (payload?.room) {
          setRoom(payload.room);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setConnectionStatus('disconnected');
        }
      });

    channelRef.current = channel;

    // Background HTTP poll (every 4s) to keep room metadata in sync
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/arena/rooms?code=${roomCode}&_t=${Date.now()}`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          if (data.room) setRoom(data.room);
        }
      } catch {}
    }, 4000);

    return () => {
      clearInterval(pollInterval);
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch {}
        channelRef.current = null;
      }
    };
  }, [roomCode]);

  // Construct safe HTML/CSS preview iframe content
  const renderWebPreview = (html = '', css = '', js = '') => {
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { margin: 0; padding: 12px; font-family: system-ui, sans-serif; background: #0b0f19; color: #fff; }
      ${css}
    </style>
  </head>
  <body>
    ${html}
    <script>
      try {
        ${js}
      } catch (e) {
        console.error(e);
      }
    </script>
  </body>
</html>`;
  };

  const getCodeSnippet = (data: ContenderCodeState | null, tab: string) => {
    if (!data) return '// Waiting for contender to begin typing...';
    if (tab === 'html') return data.htmlCode || '<!-- No HTML written yet -->';
    if (tab === 'css') return data.cssCode || '/* No CSS written yet */';
    if (tab === 'js') return data.jsCode || '// No JS written yet';
    return data.pythonCode || data.javaCode || data.cppCode || '// No code written yet';
  };

  const alphaPlayer = room?.alphaPlayers?.[0];
  const omegaPlayer = room?.omegaPlayers?.[0];
  const isWebMatch = (room?.arena || 'web_dev') === 'web_dev';

  return (
    <div className="bg-charcoal-950 border-2 border-cyan-500/40 rounded-2xl p-5 shadow-[0_0_50px_rgba(6,182,212,0.15)] space-y-5 animate-fadeIn">
      {/* Top God View Status Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-cyan-950/60 via-charcoal-900 to-rose-950/40 border border-cyan-500/30">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
            <Eye className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                SECRET SPECTATOR GOD VIEW
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-charcoal-900 border border-charcoal-700 text-slate-300">
                Invisible to Players • Zero Fog of War
              </span>
            </div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
              <span>{room?.matchTitle || `Tournament Duel ${roomCode}`}</span>
              <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded">
                [{roomCode}]
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end lg:self-auto">
          {/* Connection badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase flex items-center gap-1.5 ${
              connectionStatus === 'connected'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>{connectionStatus === 'connected' ? 'Live Stream Active' : 'Connecting...'}</span>
          </span>

          {/* Disconnect button */}
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-charcoal-800 hover:bg-rose-950/80 border border-charcoal-700 hover:border-rose-800 text-slate-300 hover:text-rose-300 font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Disconnect spectator channel to save backend resources"
          >
            <X className="w-4 h-4" />
            <span>Close Spectator</span>
          </button>
        </div>
      </div>

      {/* Duel Contenders Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ================= CONTENDER ALPHA (HOST / PLAYER 1) ================= */}
        <div className="bg-charcoal-900/90 border border-rose-500/30 rounded-xl p-4 space-y-3 shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono font-black text-xs flex items-center justify-center">
                α
              </span>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">
                  {alphaData?.playerName || alphaPlayer?.name || 'Contender Alpha'}
                </h4>
                <span className="text-[10px] font-mono text-rose-400 font-semibold uppercase">
                  Team Alpha
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-2 py-0.5 rounded bg-charcoal-950 border border-charcoal-800 text-amber-300 font-bold">
                ⚡ {alphaData?.wpm || alphaPlayer?.wpm || 0} WPM
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-bold">
                ✓ {alphaData?.testsPassed ?? alphaPlayer?.testsPassed ?? 0} Passed
              </span>
            </div>
          </div>

          {/* Subtabs */}
          <div className="flex items-center gap-1.5 border-b border-charcoal-800/80 pb-2">
            {isWebMatch ? (
              <>
                <button
                  type="button"
                  onClick={() => setTabAlpha('preview')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    tabAlpha === 'preview'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Live Render
                </button>
                <button
                  type="button"
                  onClick={() => setTabAlpha('html')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    tabAlpha === 'html'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  HTML
                </button>
                <button
                  type="button"
                  onClick={() => setTabAlpha('css')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    tabAlpha === 'css'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  CSS
                </button>
                <button
                  type="button"
                  onClick={() => setTabAlpha('js')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    tabAlpha === 'js'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  JS
                </button>
              </>
            ) : (
              <span className="text-xs font-mono text-slate-400 font-semibold">
                Live Source Code Stream
              </span>
            )}
          </div>

          {/* Content Pane */}
          {isWebMatch && tabAlpha === 'preview' ? (
            <div className="h-64 rounded-xl bg-charcoal-950 border border-charcoal-800 overflow-hidden relative">
              <iframe
                title="Alpha Preview"
                srcDoc={renderWebPreview(
                  alphaData?.htmlCode || '',
                  alphaData?.cssCode || '',
                  alphaData?.jsCode || ''
                )}
                sandbox="allow-scripts"
                className="w-full h-full border-none"
              />
            </div>
          ) : (
            <div className="h-64 rounded-xl bg-charcoal-950 border border-charcoal-800 p-3 overflow-auto font-mono text-xs text-slate-200">
              <pre className="whitespace-pre-wrap leading-relaxed">
                {getCodeSnippet(alphaData, tabAlpha)}
              </pre>
            </div>
          )}
        </div>

        {/* ================= CONTENDER OMEGA (RIVAL / PLAYER 2) ================= */}
        <div className="bg-charcoal-900/90 border border-cyan-500/30 rounded-xl p-4 space-y-3 shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono font-black text-xs flex items-center justify-center">
                Ω
              </span>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">
                  {omegaData?.playerName || omegaPlayer?.name || (room?.isBotEnabled ? 'ByteRival Bot' : 'Contender Omega')}
                </h4>
                <span className="text-[10px] font-mono text-cyan-400 font-semibold uppercase">
                  Team Omega
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-2 py-0.5 rounded bg-charcoal-950 border border-charcoal-800 text-amber-300 font-bold">
                ⚡ {omegaData?.wpm || omegaPlayer?.wpm || 0} WPM
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-bold">
                ✓ {omegaData?.testsPassed ?? omegaPlayer?.testsPassed ?? 0} Passed
              </span>
            </div>
          </div>

          {/* Subtabs */}
          <div className="flex items-center gap-1.5 border-b border-charcoal-800/80 pb-2">
            {isWebMatch ? (
              <>
                <button
                  type="button"
                  onClick={() => setTabOmega('preview')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    tabOmega === 'preview'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Live Render
                </button>
                <button
                  type="button"
                  onClick={() => setTabOmega('html')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    tabOmega === 'html'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  HTML
                </button>
                <button
                  type="button"
                  onClick={() => setTabOmega('css')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    tabOmega === 'css'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  CSS
                </button>
                <button
                  type="button"
                  onClick={() => setTabOmega('js')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    tabOmega === 'js'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  JS
                </button>
              </>
            ) : (
              <span className="text-xs font-mono text-slate-400 font-semibold">
                Live Source Code Stream
              </span>
            )}
          </div>

          {/* Content Pane */}
          {isWebMatch && tabOmega === 'preview' ? (
            <div className="h-64 rounded-xl bg-charcoal-950 border border-charcoal-800 overflow-hidden relative">
              <iframe
                title="Omega Preview"
                srcDoc={renderWebPreview(
                  omegaData?.htmlCode || '',
                  omegaData?.cssCode || '',
                  omegaData?.jsCode || ''
                )}
                sandbox="allow-scripts"
                className="w-full h-full border-none"
              />
            </div>
          ) : (
            <div className="h-64 rounded-xl bg-charcoal-950 border border-charcoal-800 p-3 overflow-auto font-mono text-xs text-slate-200">
              <pre className="whitespace-pre-wrap leading-relaxed">
                {getCodeSnippet(omegaData, tabOmega)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
