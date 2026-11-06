'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Swords, ArrowRight } from 'lucide-react';
import { DerbyBoardMatchup, CollegiateDerby } from '@/types/derbyWar';

interface DerbyTeamRowProps {
  board: DerbyBoardMatchup;
  derby: CollegiateDerby;
  currentUserId?: string;
  userCollegeSide?: 'A' | 'B';
  isRegOpen: boolean;
  onShiftSeat: (boardNumber: number, collegeSide: 'A' | 'B') => void;
}

export function DerbyTeamRow({
  board,
  derby,
  currentUserId,
  userCollegeSide,
  isRegOpen,
  onShiftSeat,
}: DerbyTeamRowProps) {
  const playerA = board.collegeAPlayer;
  const playerB = board.collegeBPlayer;

  const isUserInSeatA = Boolean(currentUserId && playerA?.userId === currentUserId);
  const isUserInSeatB = Boolean(currentUserId && playerB?.userId === currentUserId);

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 hover:border-slate-700/80 transition-all space-y-3.5">
      {/* Team Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-black text-xs flex items-center justify-center border border-amber-500/30">
            {board.boardNumber}
          </span>
          <h4 className="text-xs sm:text-sm font-bold text-white">
            Team {board.boardNumber} Clash
          </h4>
        </div>
      </div>

      {/* Duel Clash: College A Student vs College B Student */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-center">
        
        {/* Left Seat (College A) */}
        <div className="md:col-span-3 p-3 rounded-xl bg-black/50 border border-amber-500/20 flex items-center justify-between gap-3 min-h-[58px]">
          {playerA ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-xs">
                {playerA.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-xs truncate">
                    {playerA.name}
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                </div>
                <span className="text-[10px] text-slate-400 font-mono block">
                  @{playerA.username}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-xs text-slate-500 italic font-mono">
              Empty Seat (Team {board.boardNumber})
            </span>
          )}

          {/* Seat Status / Shift Button */}
          {isUserInSeatA ? (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold shrink-0">
              Your Seat ✓
            </span>
          ) : !playerA && isRegOpen && userCollegeSide === 'A' ? (
            <button
              type="button"
              onClick={() => onShiftSeat(board.boardNumber, 'A')}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold shrink-0 cursor-pointer transition-all"
            >
              Shift Seat →
            </button>
          ) : playerA && !isUserInSeatA ? (
            <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 shrink-0">
              <Lock className="w-3 h-3 text-slate-600" />
              <span>Locked</span>
            </span>
          ) : null}
        </div>

        {/* Center Clash Action */}
        <div className="text-center font-mono py-1">
          <span className="text-[11px] font-black text-slate-500 block">VS</span>
          <Link
            href={board.actionUrl}
            className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 hover:text-amber-300 hover:underline mt-0.5"
          >
            <span>Duel #{board.boardNumber}</span>
          </Link>
        </div>

        {/* Right Seat (College B) */}
        <div className="md:col-span-3 p-3 rounded-xl bg-black/50 border border-cyan-500/20 flex items-center justify-between gap-3 min-h-[58px]">
          {/* Shift Button or Status for Seat B */}
          {isUserInSeatB ? (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold shrink-0">
              Your Seat ✓
            </span>
          ) : !playerB && isRegOpen && userCollegeSide === 'B' ? (
            <button
              type="button"
              onClick={() => onShiftSeat(board.boardNumber, 'B')}
              className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold shrink-0 cursor-pointer transition-all"
            >
              Shift Seat →
            </button>
          ) : playerB && !isUserInSeatB ? (
            <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 shrink-0">
              <Lock className="w-3 h-3 text-slate-600" />
              <span>Locked</span>
            </span>
          ) : (
            <span />
          )}

          {playerB ? (
            <div className="flex items-center gap-2.5 min-w-0 text-right justify-end ml-auto">
              <div className="min-w-0">
                <div className="flex items-center justify-end gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="font-bold text-white text-xs truncate">
                    {playerB.name}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono block">
                  @{playerB.username}
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center shrink-0 text-xs">
                {playerB.name.slice(0, 2).toUpperCase()}
              </div>
            </div>
          ) : (
            <span className="text-xs text-slate-500 italic font-mono ml-auto">
              Empty Seat (Team {board.boardNumber})
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
