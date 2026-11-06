'use client';

import React, { useState } from 'react';
import { Crown, Trophy, Swords, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { CollegiateDerby, DEFAULT_DERBY, DerbySeatPlayer } from '@/types/derbyWar';
import { useAuth } from '@/components/auth/AuthProvider';
import { DerbyLeftInfoPanel } from './DerbyLeftInfoPanel';
import { DerbyTeamRow } from './DerbyTeamRow';
import { DerbyAdminVault } from './DerbyAdminVault';
import { DerbyEntryQuestionModal } from './DerbyEntryQuestionModal';

interface DerbyRosterBoardProps {
  initialDerby?: CollegiateDerby;
  isAdmin?: boolean;
}

export function DerbyRosterBoard({ initialDerby = DEFAULT_DERBY, isAdmin }: DerbyRosterBoardProps) {
  const { user, profile } = useAuth();
  const [derby, setDerby] = useState<CollegiateDerby>(initialDerby);
  const [notice, setNotice] = useState<{ msg: string; type: 'success' | 'warn' } | null>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);

  // User college credentials
  const userCollege =
    (profile as any)?.college ||
    (user as any)?.user_metadata?.college ||
    'Thapar Institute of Engineering & Technology';

  const isRegOpen = derby.status === 'registration';

  // Determine which side the user belongs to
  const userSide: 'A' | 'B' =
    userCollege.toLowerCase().includes(derby.collegeB.id) ||
    userCollege.toLowerCase().includes(derby.collegeB.name.toLowerCase().split(' ')[0])
      ? 'B'
      : 'A';

  // Find user's currently occupied seat
  const userCurrentSeat = derby.matchups.find(
    (m) => m.collegeAPlayer?.userId === user?.id || m.collegeBPlayer?.userId === user?.id
  );

  const targetCollegeObj = userSide === 'A' ? derby.collegeA : derby.collegeB;

  // Auto-place student into lowest available team (Team 1 first)
  const autoEnterLowestSeat = () => {
    const playerObj: DerbySeatPlayer = {
      userId: user?.id || `user-${Date.now()}`,
      name: user?.user_metadata?.full_name || profile?.display_name || 'Mayank Goyal',
      username: user?.user_metadata?.username || profile?.username || 'student',
      collegeName: targetCollegeObj.name,
      isVerified: true,
      joinedAt: new Date().toISOString(),
    };

    setDerby((prev) => {
      // Find lowest vacant board on user's side
      let assignedBoard = 1;
      for (const m of prev.matchups) {
        const seat = userSide === 'A' ? m.collegeAPlayer : m.collegeBPlayer;
        if (!seat) {
          assignedBoard = m.boardNumber;
          break;
        }
      }

      const newMatchups = prev.matchups.map((m) => {
        let collegeA = m.collegeAPlayer;
        let collegeB = m.collegeBPlayer;

        // Clear existing seat if shifting
        if (collegeA?.userId === playerObj.userId) collegeA = undefined;
        if (collegeB?.userId === playerObj.userId) collegeB = undefined;

        if (m.boardNumber === assignedBoard) {
          if (userSide === 'A') collegeA = playerObj;
          if (userSide === 'B') collegeB = playerObj;
        }

        return { ...m, collegeAPlayer: collegeA, collegeBPlayer: collegeB };
      });

      return { ...prev, matchups: newMatchups };
    });

    setNotice({
      msg: `Auto-enrolled into Team #1 for ${targetCollegeObj.shortName}! You can shift to any other empty seat.`,
      type: 'success',
    });
  };

  // Called when user clicks "Apply" on the match or board
  const handleApplyClick = () => {
    if (userCurrentSeat) {
      setNotice({
        msg: `You are already enrolled in Team #${userCurrentSeat.boardNumber}. Click any empty seat to shift!`,
        type: 'success',
      });
      return;
    }

    if (derby.entryQuestion?.enabled) {
      setIsQuestionModalOpen(true);
    } else {
      autoEnterLowestSeat();
    }
  };

  // Shift seat logic
  const handleShiftSeat = (targetBoardNumber: number, collegeSide: 'A' | 'B') => {
    if (!isRegOpen) {
      setNotice({ msg: 'Registration is closed! Rosters are locked.', type: 'warn' });
      return;
    }

    const playerObj: DerbySeatPlayer = {
      userId: user?.id || `user-${Date.now()}`,
      name: user?.user_metadata?.full_name || profile?.display_name || 'Mayank Goyal',
      username: user?.user_metadata?.username || profile?.username || 'student',
      collegeName: targetCollegeObj.name,
      isVerified: true,
      joinedAt: new Date().toISOString(),
    };

    setDerby((prev) => {
      const newMatchups = prev.matchups.map((m) => {
        let collegeA = m.collegeAPlayer;
        let collegeB = m.collegeBPlayer;

        if (collegeA?.userId === playerObj.userId) collegeA = undefined;
        if (collegeB?.userId === playerObj.userId) collegeB = undefined;

        if (m.boardNumber === targetBoardNumber) {
          if (collegeSide === 'A') collegeA = playerObj;
          if (collegeSide === 'B') collegeB = playerObj;
        }

        return { ...m, collegeAPlayer: collegeA, collegeBPlayer: collegeB };
      });

      return { ...prev, matchups: newMatchups };
    });

    setNotice({
      msg: `Seat shifted to Team #${targetBoardNumber} on ${targetCollegeObj.shortName}!`,
      type: 'success',
    });
  };

  return (
    <div className="w-full space-y-6">
      
      {/* 1. College Win Banner (Live or Not Live from Admin) */}
      {derby.resultsPublished && (
        <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-amber-500/25 via-orange-500/20 to-amber-500/25 border-2 border-amber-400 text-center space-y-2.5 shadow-[0_0_40px_rgba(245,158,11,0.3)] animate-pulse">
          <Crown className="w-9 h-9 text-amber-400 mx-auto" />
          <span className="text-[11px] font-mono uppercase tracking-widest text-amber-300 font-black">
            OFFICIAL COLLEGIATE DERBY RESULT ANNOUNCEMENT
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            🏆 {derby.winnerCollege} Wins the Collegiate Arena!
          </h2>
          <div className="flex items-center justify-center gap-3 text-xs sm:text-sm font-mono text-amber-100 font-bold">
            <span>{derby.collegeA.name}: {derby.collegeAWins} Teams Won</span>
            <span className="text-amber-400 font-black">VS</span>
            <span>{derby.collegeB.name}: {derby.collegeBWins} Teams Won</span>
          </div>
        </div>
      )}

      {/* Notice Banner */}
      {notice && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all ${
            notice.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
          }`}
        >
          <span>{notice.msg}</span>
          <button
            onClick={() => setNotice(null)}
            className="font-mono text-slate-400 hover:text-white ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main 2-Panel Layout Matching the Hand-Drawn Sketch (third_image.png) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: College Name vs College Name & 3 Dates */}
        <div className="lg:col-span-5 xl:col-span-4">
          <DerbyLeftInfoPanel
            derby={derby}
            userSeatNumber={userCurrentSeat?.boardNumber}
            userCollegeSide={userSide}
          />
        </div>

        {/* RIGHT BOX: All Teams Roster & Duels Box */}
        <div className="lg:col-span-7 xl:col-span-8 rounded-3xl bg-[#090D14] border border-amber-500/30 p-5 sm:p-6 shadow-xl flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-white/5 text-xs font-mono">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-300 font-bold uppercase tracking-wider">
                {derby.collegeA.shortName} Stack
              </span>
            </div>

            <div className="text-center">
              <span className="text-[11px] uppercase font-black tracking-widest text-white px-3 py-1 rounded-full bg-white/5 border border-white/10">
                Team by Team Lineup (1 to {derby.totalBoards})
              </span>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <span className="text-cyan-300 font-bold uppercase tracking-wider">
                {derby.collegeB.shortName} Stack
              </span>
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            </div>
          </div>

          <div className="space-y-3 max-h-[660px] overflow-y-auto pr-1.5">
            {derby.matchups.map((board) => (
              <DerbyTeamRow
                key={board.boardNumber}
                board={board}
                derby={derby}
                currentUserId={user?.id}
                userCollegeSide={userSide}
                isRegOpen={isRegOpen}
                onShiftSeat={handleShiftSeat}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Admin Secret Vault */}
      {(isAdmin || user?.email?.toLowerCase() === 'goyalmayank142@gmail.com') && (
        <DerbyAdminVault derby={derby} onUpdateDerby={setDerby} />
      )}

      {/* Entry Qualifying Question Modal */}
      <DerbyEntryQuestionModal
        derby={derby}
        userCollegeName={targetCollegeObj.name}
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        onSuccess={() => {
          setIsQuestionModalOpen(false);
          autoEnterLowestSeat();
        }}
      />
    </div>
  );
}
