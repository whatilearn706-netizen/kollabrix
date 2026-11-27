'use client';

import React, { useState } from 'react';
import { Loader2, ShieldAlert, Users, X } from 'lucide-react';
import { DuelQuestion } from '@/types/arenaDuel';
import { ArenaBackgroundMatrix, RadarMode } from './ArenaBackgroundMatrix';
import { COLLEGIATE_BOT_PROFILES } from './arenaTypes';
import { useArenaEngine } from './useArenaEngine';
import { ArenaLobby } from './ArenaLobby';
import { MatchmakingFaceOff } from './MatchmakingFaceOff';
import { BattleWorkspace } from './BattleWorkspace';
import { PostMatchCard } from './PostMatchCard';

export { COLLEGIATE_BOT_PROFILES };

export interface FullArenaExperienceProps {
  onClose: () => void;
  initialRoomCode?: string;
  initialQuestion?: DuelQuestion;
  currentUser?: {
    displayName?: string;
    username?: string;
    avatarUrl?: string;
  };
}

/**
 * Orchestrates the 4-stage Kollabrix Battle Arena:
 * Combat Command Deck Lobby -> Face-Off & Countdown -> 3-Pane IDE -> Post-Match Fight Card.
 */
export function FullArenaExperience({
  onClose,
  initialRoomCode,
  initialQuestion,
  currentUser,
}: FullArenaExperienceProps) {
  const engine = useArenaEngine({ onClose, initialRoomCode, initialQuestion, currentUser });
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await engine.joinRoomByCode(joinCodeInput);
    if (ok) {
      setShowJoinModal(false);
      setJoinCodeInput('');
    }
  };

  const radarMode: RadarMode =
    engine.stage === 'faceoff'
      ? engine.faceOffStatus === 'scanning'
        ? 'scanning'
        : 'countdown'
      : engine.stage === 'battle'
        ? 'battle'
        : 'idle';

  return (
    <div className="fixed inset-0 z-[9990] bg-[#030509] text-slate-100 overflow-y-auto overflow-x-hidden select-none">
      {engine.stage !== 'lobby' && <ArenaBackgroundMatrix radarMode={radarMode} />}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.03),transparent_60%)] pointer-events-none" />

      {engine.stage === 'lobby' && (
        <ArenaLobby engine={engine} onOpenJoinModal={() => setShowJoinModal(true)} />
      )}

      {(engine.stage === 'room' || engine.stage === 'faceoff') && (
        <MatchmakingFaceOff engine={engine} />
      )}

      {engine.stage === 'battle' && <BattleWorkspace engine={engine} />}

      {engine.stage === 'results' && <PostMatchCard engine={engine} />}

      {/* Join Room Code Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-[9995] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleJoinSubmit}
            className="w-full max-w-md rounded-3xl bg-[#0A0E17] border border-white/15 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-white">
                <Users className="w-4 h-4 text-slate-300" />
                <span>Join Battle Room</span>
              </div>
              <button
                type="button"
                onClick={() => setShowJoinModal(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              autoFocus
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
              placeholder="Enter Room Code (e.g. KBX-4821)"
              className="w-full px-4 py-3 rounded-xl bg-[#05080F] border border-white/15 focus:border-white/40 font-mono text-sm text-white outline-none uppercase tracking-wider"
            />

            {engine.joinError && (
              <p className="text-xs font-mono text-red-400">{engine.joinError}</p>
            )}

            <button
              type="submit"
              disabled={engine.isJoiningRoom}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-slate-100 via-white to-slate-200 text-slate-950 font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {engine.isJoiningRoom && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Enter Room</span>
            </button>
          </form>
        </div>
      )}

      {/* Anti-Cheat Focus Warning Modal */}
      {engine.showCheatModal && (
        <div className="fixed inset-0 z-[9996] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#0A0E17] border border-red-500/45 p-6 text-center space-y-4 shadow-[0_0_40px_rgba(239,68,68,0.25)]">
            <div className="w-12 h-12 rounded-2xl bg-red-950/70 border border-red-500/40 flex items-center justify-center mx-auto text-red-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-mono text-base font-black text-white uppercase">Focus Sentinel Warning</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Leaving the active Battle Arena tab triggers a fair-play strike (Strike {engine.myCheatStrikes}/3). Keep focus inside the IDE.
            </p>
            <button
              type="button"
              onClick={() => engine.setShowCheatModal(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-slate-100 via-white to-slate-200 text-slate-950 font-mono text-xs font-black uppercase cursor-pointer"
            >
              Return to Duel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
