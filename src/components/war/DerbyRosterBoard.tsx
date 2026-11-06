'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Swords,
  Trophy,
  ShieldCheck,
  Lock,
  Clock,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Crown,
  UserCheck,
} from 'lucide-react';
import { CollegiateDerby, DEFAULT_DERBY, DerbySeatPlayer } from '@/types/derbyWar';
import { useAuth } from '@/components/auth/AuthProvider';

interface DerbyRosterBoardProps {
  initialDerby?: CollegiateDerby;
  isAdmin?: boolean;
}

export function DerbyRosterBoard({ initialDerby = DEFAULT_DERBY, isAdmin }: DerbyRosterBoardProps) {
  const { user, profile } = useAuth();
  const [derby, setDerby] = useState<CollegiateDerby>(initialDerby);
  const [notice, setNotice] = useState<{ msg: string; type: 'success' | 'warn' } | null>(null);

  // User college credentials
  const userCollege = (profile as any)?.college || (user as any)?.user_metadata?.college || 'Thapar Institute of Engineering & Technology';
  const isVerified = Boolean((profile as any)?.college_verified ?? true); // fallback true for testing

  const isRegOpen = derby.status === 'registration';

  // Find user's currently occupied seat
  const userCurrentSeat = derby.matchups.find(
    (m) => m.collegeAPlayer?.userId === user?.id || m.collegeBPlayer?.userId === user?.id
  );

  // Claim or Shift seat
  const handleSeatAction = (boardNumber: number, collegeSide: 'A' | 'B') => {
    if (!isRegOpen) {
      setNotice({ msg: 'Registration is closed! Rosters are locked for battle.', type: 'warn' });
      return;
    }

    const targetCollege = collegeSide === 'A' ? derby.collegeA : derby.collegeB;
    
    // College Verification Check
    const isCollegeMatch = userCollege.toLowerCase().includes(targetCollege.id) || 
      userCollege.toLowerCase().includes(targetCollege.name.toLowerCase().split(' ')[0]) ||
      isAdmin;

    if (!isCollegeMatch) {
      setNotice({
        msg: `Verification Gate: You can only join on the ${targetCollege.name} side if your profile is verified with this campus.`,
        type: 'warn',
      });
      return;
    }

    const playerObj: DerbySeatPlayer = {
      userId: user?.id || `user-anon-${Date.now()}`,
      name: user?.user_metadata?.full_name || profile?.display_name || 'Mayank Goyal',
      username: user?.user_metadata?.username || profile?.username || 'student',
      collegeName: targetCollege.name,
      isVerified: true,
      joinedAt: new Date().toISOString(),
    };

    setDerby((prev) => {
      const newMatchups = prev.matchups.map((m) => {
        let collegeA = m.collegeAPlayer;
        let collegeB = m.collegeBPlayer;

        // Vacate existing seat if shifting
        if (collegeA?.userId === playerObj.userId) collegeA = undefined;
        if (collegeB?.userId === playerObj.userId) collegeB = undefined;

        // Assign to target board
        if (m.boardNumber === boardNumber) {
          if (collegeSide === 'A') collegeA = playerObj;
          if (collegeSide === 'B') collegeB = playerObj;
        }

        return { ...m, collegeAPlayer: collegeA, collegeBPlayer: collegeB };
      });

      return { ...prev, matchups: newMatchups };
    });

    setNotice({
      msg: `Seat #${boardNumber} locked for ${targetCollege.shortName}! You can shift seats until registration ends.`,
      type: 'success',
    });
  };

  // Admin reveal toggle
  const handlePublishResults = () => {
    setDerby((prev) => ({
      ...prev,
      resultsPublished: !prev.resultsPublished,
      status: 'completed',
      winnerCollege: prev.collegeAWins >= prev.collegeBWins ? prev.collegeA.name : prev.collegeB.name,
    }));
  };

  return (
    <div className="w-full space-y-6">
      {/* Notice Banner */}
      {notice && (
        <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
          notice.type === 'success' ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' : 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
        }`}>
          <span>{notice.msg}</span>
          <button onClick={() => setNotice(null)} className="font-mono text-slate-400 hover:text-white ml-2">✕</button>
        </div>
      )}

      {/* Official Result Banner (If Published) */}
      {derby.resultsPublished && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 border-2 border-amber-400 text-center space-y-2 shadow-[0_0_35px_rgba(245,158,11,0.25)] animate-pulse">
          <Crown className="w-8 h-8 text-amber-400 mx-auto" />
          <span className="text-[11px] font-mono uppercase tracking-widest text-amber-300 font-black">OFFICIAL DERBY RESULT DECLARED</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">🏆 {derby.winnerCollege} Wins the Collegiate Derby!</h2>
          <p className="text-xs text-amber-100 font-mono">Final Board Tally: {derby.collegeA.shortName} ({derby.collegeAWins}) — {derby.collegeB.shortName} ({derby.collegeBWins})</p>
        </div>
      )}

      {/* Header Matchup Card */}
      <div className="p-5 sm:p-7 rounded-3xl bg-[#090C12] border border-amber-500/30 space-y-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* College A */}
          <div className="flex items-center gap-3.5 text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-black text-amber-300 text-lg">
              TIET
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">LEFT STACK</span>
              <h3 className="text-lg font-black text-white">{derby.collegeA.name}</h3>
            </div>
          </div>

          {/* VS Centerpiece */}
          <div className="flex flex-col items-center">
            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-mono font-black text-xs tracking-widest animate-pulse">
              ⚔️ 1v1 DUAL-STACK ARENA
            </span>
            <span className="text-xs text-slate-400 font-mono mt-1">Best of {derby.totalBoards} Boards</span>
          </div>

          {/* College B */}
          <div className="flex items-center gap-3.5 text-center md:text-right flex-row-reverse md:flex-row">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">RIGHT STACK</span>
              <h3 className="text-lg font-black text-white">{derby.collegeB.name}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center font-black text-cyan-300 text-lg">
              IITD
            </div>
          </div>
        </div>

        {/* 3-Date Lifecycle Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/5 font-mono text-xs">
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">1. Registration Closes</span>
              <span className="text-slate-200 font-bold">{new Date(derby.registrationClosesAt).toLocaleDateString()} • 11:59 PM</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2">
            <Swords className="w-4 h-4 text-orange-400" />
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">2. Simultaneous Start</span>
              <span className="text-orange-300 font-bold">{new Date(derby.battleStartsAt).toLocaleDateString()} • 02:00 PM</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">3. Result Announcement</span>
              <span className="text-emerald-300 font-bold">{new Date(derby.resultAnnouncesAt).toLocaleDateString()} • 06:00 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Roster Boards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
          <span>{derby.collegeA.shortName} Stack</span>
          <span className="uppercase text-[11px] font-bold text-amber-400">Board by Board Lineup</span>
          <span>{derby.collegeB.shortName} Stack</span>
        </div>

        {derby.matchups.map((board) => {
          const playerA = board.collegeAPlayer;
          const playerB = board.collegeBPlayer;

          return (
            <div key={board.boardNumber} className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="text-[11px] font-mono text-slate-400 text-center mb-3 font-bold">
                {board.title}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-center">
                {/* College A Seat (Left 3 Cols) */}
                <div className="md:col-span-3 p-3.5 rounded-xl bg-black/40 border border-amber-500/20 flex items-center justify-between gap-3">
                  {playerA ? (
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-xs">
                        {playerA.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-xs truncate">{playerA.name}</span>
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block">@{playerA.username}</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 italic font-mono">Vacant Seat #{board.boardNumber}</span>
                  )}

                  {isRegOpen && (
                    <button
                      onClick={() => handleSeatAction(board.boardNumber, 'A')}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold font-mono shrink-0 cursor-pointer transition-all"
                    >
                      {playerA?.userId === user?.id ? 'Your Seat ✓' : 'Claim Seat →'}
                    </button>
                  )}
                </div>

                {/* Center Clash Action (1 Col) */}
                <div className="text-center font-mono py-1">
                  <span className="text-xs font-black text-slate-500 block">VS</span>
                  <Link
                    href={board.actionUrl}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 hover:underline mt-0.5"
                  >
                    <span>Room #{board.boardNumber}</span>
                  </Link>
                </div>

                {/* College B Seat (Right 3 Cols) */}
                <div className="md:col-span-3 p-3.5 rounded-xl bg-black/40 border border-cyan-500/20 flex items-center justify-between gap-3">
                  {isRegOpen && (
                    <button
                      onClick={() => handleSeatAction(board.boardNumber, 'B')}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold font-mono shrink-0 cursor-pointer transition-all"
                    >
                      {playerB?.userId === user?.id ? 'Your Seat ✓' : 'Claim Seat →'}
                    </button>
                  )}

                  {playerB ? (
                    <div className="flex items-center gap-2.5 min-w-0 text-right justify-end ml-auto">
                      <div className="min-w-0">
                        <div className="flex items-center justify-end gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="font-bold text-white text-xs truncate">{playerB.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block">@{playerB.username}</span>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center shrink-0 text-xs">
                        {playerB.name.slice(0, 2).toUpperCase()}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 italic font-mono ml-auto">Vacant Seat #{board.boardNumber}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin Secret Vault Control */}
      {(isAdmin || user?.email?.toLowerCase() === 'goyalmayank142@gmail.com') && (
        <div className="p-4 rounded-2xl bg-black/70 border border-purple-500/30 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-purple-300 font-bold flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-purple-400" /> Secret Arena Control Vault (Admin Only)
            </span>
            <span className="text-[10px] text-slate-400">Classified to Public</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-300">Live Calculated Score: <strong className="text-amber-400">{derby.collegeA.shortName} ({derby.collegeAWins})</strong> — <strong className="text-cyan-400">{derby.collegeB.shortName} ({derby.collegeBWins})</strong></span>
            <button
              onClick={handlePublishResults}
              className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer transition-colors"
            >
              {derby.resultsPublished ? 'Hide Result Announcement' : 'Publish Official Result Announcement 🏆'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
