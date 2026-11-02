'use client';

import React, { useState, useEffect } from 'react';
import {
  Swords,
  Radio,
  Eye,
  RefreshCw,
  Users,
  Clock,
  Trash2,
  CheckCircle2,
  Sparkles,
  Layers,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { ArenaRoom } from '@/lib/arena/roomStorage';

interface AdminActiveDuelsListProps {
  onSpectateRoom: (roomCode: string) => void;
  activeSpectatingCode?: string | null;
}

export function AdminActiveDuelsList({
  onSpectateRoom,
  activeSpectatingCode,
}: AdminActiveDuelsListProps) {
  const [rooms, setRooms] = useState<ArenaRoom[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/arena/rooms?list=true&_t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.rooms && Array.isArray(data.rooms)) {
          setRooms(data.rooms);
          setLastRefreshed(new Date().toLocaleTimeString());
          setErrorMsg(null);
        }
      }
    } catch (err: any) {
      setErrorMsg('Failed to fetch active rooms');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleDeleteRoom = async (code: string) => {
    if (!confirm(`Are you sure you want to delete room ${code}?`)) return;
    try {
      await fetch(`/api/arena/rooms?code=${code}`, {
        method: 'DELETE',
      });
      setRooms((prev) => prev.filter((r) => r.code !== code));
    } catch (err) {
      alert('Failed to delete room');
    }
  };

  return (
    <div className="bg-charcoal-900/90 border border-charcoal-700/80 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-charcoal-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Active Hosted Duels</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                {rooms.length} Active
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Tap any duel to secretly spectate unblurred code & live web UI in real-time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {lastRefreshed && (
            <span className="text-[10px] font-mono text-slate-500">
              Synced: {lastRefreshed}
            </span>
          )}
          <button
            type="button"
            onClick={fetchRooms}
            disabled={isLoading}
            className="p-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-slate-300 hover:text-white transition-colors"
            title="Refresh active duels"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-mono">
          ⚠️ {errorMsg}
        </div>
      )}

      {rooms.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-charcoal-800 rounded-2xl">
          <Swords className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-300">No Active Duels Right Now</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Use the Generator above to host a tournament duel and share the link with contenders.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map((room) => {
            const isCurrentlySpectating = activeSpectatingCode === room.code;
            const alphaCount = room.alphaPlayers?.length || 0;
            const omegaCount = room.omegaPlayers?.length || 0;
            const totalPlayers = alphaCount + omegaCount;
            const maxPlayers = room.format === '2v2' ? 4 : 2;
            const alphaName = room.alphaPlayers?.[0]?.name || 'Waiting...';
            const omegaName = room.omegaPlayers?.[0]?.name || (room.isBotEnabled ? 'ByteRival (Bot)' : 'Waiting...');

            return (
              <div
                key={room.code}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrentlySpectating
                    ? 'bg-gradient-to-br from-cyan-950/40 via-charcoal-900 to-charcoal-950 border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.2)] ring-1 ring-cyan-500/40'
                    : 'bg-charcoal-950/80 border-charcoal-800 hover:border-charcoal-700'
                }`}
              >
                {/* Top: Code & Status */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-white px-2.5 py-0.5 rounded bg-charcoal-900 border border-charcoal-700 tracking-wider">
                      {room.code}
                    </span>
                    {room.isTournamentRoom && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Tournament
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                      room.status === 'in_progress'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : room.status === 'finished'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        room.status === 'in_progress'
                          ? 'bg-rose-400 animate-pulse'
                          : room.status === 'finished'
                          ? 'bg-purple-400'
                          : 'bg-amber-400'
                      }`}
                    />
                    <span>{room.status === 'in_progress' ? 'Battling Live' : room.status}</span>
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-xs font-bold text-slate-200 line-clamp-1 mb-2">
                  {room.matchTitle || `Duel ${room.code}`}
                </h4>

                {/* Match Details */}
                <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono text-slate-400 mb-3">
                  <span className="px-2 py-0.5 rounded bg-charcoal-900 border border-charcoal-800 text-slate-300 capitalize">
                    {room.arena?.replace('_', ' ')}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-charcoal-900 border border-charcoal-800 text-slate-300 uppercase">
                    {room.format}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{Math.round((room.timeLimit || 300) / 60)}m</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-500" />
                    <span className={totalPlayers >= maxPlayers ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                      {totalPlayers}/{maxPlayers} Players
                    </span>
                  </span>
                </div>

                {/* Contenders summary */}
                <div className="p-2.5 rounded-lg bg-charcoal-900/60 border border-charcoal-800/80 text-xs font-mono space-y-1 mb-3">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-rose-400 font-bold">Alpha:</span>
                    <span className="truncate max-w-[140px] text-right font-medium">{alphaName}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-cyan-400 font-bold">Omega:</span>
                    <span className="truncate max-w-[140px] text-right font-medium">{omegaName}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => onSpectateRoom(room.code)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isCurrentlySpectating
                        ? 'bg-cyan-500 text-charcoal-950 shadow-md shadow-cyan-500/20'
                        : 'bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/80 text-cyan-300 hover:scale-[1.02] active:scale-95'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isCurrentlySpectating ? 'Spectating Live' : 'Tap to Spectate (Secret)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteRoom(room.code)}
                    className="p-1.5 rounded-lg bg-charcoal-900 hover:bg-rose-950/60 border border-charcoal-800 hover:border-rose-800 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Delete Room"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
