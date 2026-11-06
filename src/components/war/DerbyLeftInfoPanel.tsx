'use client';

import React from 'react';
import { Clock, Swords, Trophy, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { CollegiateDerby } from '@/types/derbyWar';

interface DerbyLeftInfoPanelProps {
  derby: CollegiateDerby;
  userSeatNumber?: number;
  userCollegeSide?: 'A' | 'B';
}

export function DerbyLeftInfoPanel({
  derby,
  userSeatNumber,
  userCollegeSide,
}: DerbyLeftInfoPanelProps) {
  return (
    <div className="w-full h-full rounded-3xl bg-[#090D14] border-2 border-amber-500/30 p-6 flex flex-col justify-between space-y-6 shadow-2xl relative overflow-hidden">
      
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="space-y-6 relative z-10">
        {/* Derby Header Badge */}
        <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
          <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
            <Swords className="w-3 h-3 text-amber-400" />
            <span>COLLEGIATE ARENA CLASH</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400 font-bold">
            Best of {derby.totalBoards} Teams
          </span>
        </div>

        {/* 1. College A vs College B (Drawn in Left Box) */}
        <div className="space-y-4">
          {/* College A */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-amber-500/30 flex items-center gap-3.5 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-black text-amber-300 text-sm shrink-0">
              {derby.collegeA.shortName.slice(0, 4)}
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
                LEFT STACK • CAMPUS A
              </span>
              <h4 className="text-sm sm:text-base font-black text-white leading-tight">
                {derby.collegeA.name}
              </h4>
            </div>
          </div>

          {/* VS Centerpiece */}
          <div className="flex items-center justify-center -my-2 relative z-10">
            <span className="px-3.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[11px] font-mono font-black tracking-widest shadow-lg animate-pulse">
              VS
            </span>
          </div>

          {/* College B */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-cyan-500/30 flex items-center gap-3.5 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center font-black text-cyan-300 text-sm shrink-0">
              {derby.collegeB.shortName.slice(0, 4)}
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
                RIGHT STACK • CAMPUS B
              </span>
              <h4 className="text-sm sm:text-base font-black text-white leading-tight">
                {derby.collegeB.name}
              </h4>
            </div>
          </div>
        </div>

        {/* 2. Three Critical Dates (Drawn directly in user sketch) */}
        <div className="space-y-2.5 pt-2 border-t border-white/5 font-mono">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
            Arena Timeline Schedule
          </span>

          {/* Registration Closes */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">
                Registration Closes
              </span>
              <span className="text-xs font-bold text-slate-200">
                {new Date(derby.registrationClosesAt).toLocaleDateString()} • 11:59 PM
              </span>
            </div>
          </div>

          {/* Simulation Start */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <Swords className="w-4 h-4 text-orange-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">
                Simulation Start
              </span>
              <span className="text-xs font-bold text-orange-300">
                {new Date(derby.battleStartsAt).toLocaleDateString()} • 02:00 PM
              </span>
            </div>
          </div>

          {/* Result Date */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <Trophy className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">
                Result Date
              </span>
              <span className="text-xs font-bold text-emerald-300">
                {new Date(derby.resultAnnouncesAt).toLocaleDateString()} • 06:00 PM
              </span>
            </div>
          </div>
        </div>

        {/* 3. Bounty Stakes */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Team Bounty Stake:</span>
            <span className="font-bold text-amber-300">+{derby.bountyPoints} War Pts / Team</span>
          </div>
          <p className="text-[10px] text-slate-400 font-sans">
            Every team point won contributes directly to your university treasury standing.
          </p>
        </div>
      </div>

      {/* User Assigned Status (If enrolled) */}
      {userSeatNumber ? (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs space-y-1 relative z-10">
          <div className="flex items-center gap-1.5 font-bold">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>You Are Enrolled in Team #{userSeatNumber}</span>
          </div>
          <p className="text-[10px] text-slate-300 font-mono">
            Representing {userCollegeSide === 'A' ? derby.collegeA.shortName : derby.collegeB.shortName}. You may shift to any empty seat until registration closes.
          </p>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs space-y-1 relative z-10">
          <span className="font-bold text-slate-300 block">Not Yet Enrolled</span>
          <p className="text-[10px] font-mono">
            Click &quot;Apply&quot; to automatically enter into Team #1 of your college roster!
          </p>
        </div>
      )}
    </div>
  );
}
