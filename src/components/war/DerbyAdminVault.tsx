'use client';

import React from 'react';
import { Lock, Trophy, Power, CheckCircle2, AlertTriangle, Eye, ShieldAlert } from 'lucide-react';
import { CollegiateDerby } from '@/types/derbyWar';

interface DerbyAdminVaultProps {
  derby: CollegiateDerby;
  onUpdateDerby: (updater: (prev: CollegiateDerby) => CollegiateDerby) => void;
}

export function DerbyAdminVault({ derby, onUpdateDerby }: DerbyAdminVaultProps) {
  // Toggle winner for a specific team
  const setTeamWinner = (boardNumber: number, winner: 'A' | 'B' | 'draw' | 'pending') => {
    onUpdateDerby((prev) => {
      let aWins = 0;
      let bWins = 0;

      const newMatchups = prev.matchups.map((m) => {
        const currentWinner = m.boardNumber === boardNumber ? winner : m.winnerCollegeId;
        if (currentWinner === 'A') aWins++;
        if (currentWinner === 'B') bWins++;
        return m.boardNumber === boardNumber ? { ...m, winnerCollegeId: winner } : m;
      });

      const leadingCollege = aWins >= bWins ? prev.collegeA.name : prev.collegeB.name;

      return {
        ...prev,
        matchups: newMatchups,
        collegeAWins: aWins,
        collegeBWins: bWins,
        winnerCollege: leadingCollege,
      };
    });
  };

  // Toggle Live / Not Live for Winner Announcement
  const toggleLiveStatus = () => {
    onUpdateDerby((prev) => ({
      ...prev,
      resultsPublished: !prev.resultsPublished,
      status: !prev.resultsPublished ? 'completed' : 'live',
    }));
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-[#07090F] border-2 border-purple-500/40 space-y-5 shadow-2xl relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-500/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold block">
              CLASSIFIED ADMIN VAULT
            </span>
            <h3 className="text-sm sm:text-base font-black text-white">
              Collegiate Arena Match Control
            </h3>
          </div>
        </div>

        {/* Live / Not Live Winner Announcement Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLiveStatus}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
              derby.resultsPublished
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                : 'bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>
              Winner Announcement: {derby.resultsPublished ? 'LIVE & PUBLIC 🏆' : 'NOT LIVE (HIDDEN)'}
            </span>
          </button>
        </div>
      </div>

      {/* Calculated Score Tally */}
      <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold">
            Live Calculated Score Tally
          </span>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-amber-400 font-bold text-sm">
              {derby.collegeA.shortName}: {derby.collegeAWins} Teams Won
            </span>
            <span className="text-slate-500 font-black">—</span>
            <span className="text-cyan-400 font-bold text-sm">
              {derby.collegeB.shortName}: {derby.collegeBWins} Teams Won
            </span>
          </div>
        </div>

        <div className="text-slate-400 text-[11px] sm:text-right">
          <span>Projected Champion: </span>
          <strong className="text-white font-bold">{derby.winnerCollege}</strong>
        </div>
      </div>

      {/* Team-by-Team Winner Selection List */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
          Finalize Each Team Winner (1 to {derby.totalBoards})
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
          {derby.matchups.map((m) => (
            <div
              key={m.boardNumber}
              className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-2 text-xs font-mono"
            >
              <span className="font-bold text-slate-300 shrink-0">
                Team #{m.boardNumber}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setTeamWinner(m.boardNumber, 'A')}
                  className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                    m.winnerCollegeId === 'A'
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-white/5 text-slate-400 hover:text-amber-300'
                  }`}
                >
                  {derby.collegeA.shortName}
                </button>

                <button
                  type="button"
                  onClick={() => setTeamWinner(m.boardNumber, 'B')}
                  className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                    m.winnerCollegeId === 'B'
                      ? 'bg-cyan-500 text-slate-950 font-black'
                      : 'bg-white/5 text-slate-400 hover:text-cyan-300'
                  }`}
                >
                  {derby.collegeB.shortName}
                </button>

                <button
                  type="button"
                  onClick={() => setTeamWinner(m.boardNumber, 'draw')}
                  className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                    m.winnerCollegeId === 'draw'
                      ? 'bg-slate-300 text-slate-950 font-black'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  Draw
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
