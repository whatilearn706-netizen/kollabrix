'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ArenaStage, CheatAlertInfo, OpponentSolutionBuffer } from './arenaTypes';
import { playArcadeCoinSound, playOpponentCheatRadarBeep } from '@/lib/arena/soundEffects';

interface UseArenaSocketArgs {
  active: boolean;
  roomCode: string;
  myPlayerId: string;
  playerName: string;
  isHost: boolean;
  stage: ArenaStage;
  onRoomSync: (room: any) => void;
  onMatchWon: (payload: { winnerId?: string; winnerTeam?: string; winnerName?: string }) => void;
  onProgress: (testsPassed?: number, wpm?: number, cursorLine?: number) => void;
  onCheatAlert: (alert: CheatAlertInfo) => void;
  onRivalSolution: (sol: OpponentSolutionBuffer) => void;
  onRoomClosed: (msg: string) => void;
  onNotice: (msg: string) => void;
}

/**
 * Manages the Supabase Realtime broadcast channel and fast failover room polling
 * for active duel rooms across lobby, face-off, and live combat stages.
 */
export function useArenaSocket({
  active,
  roomCode,
  myPlayerId,
  playerName,
  isHost,
  stage,
  onRoomSync,
  onMatchWon,
  onProgress,
  onCheatAlert,
  onRivalSolution,
  onRoomClosed,
  onNotice,
}: UseArenaSocketArgs) {
  const channelRef = useRef<any>(null);
  const callbacksRef = useRef({
    onRoomSync,
    onMatchWon,
    onProgress,
    onCheatAlert,
    onRivalSolution,
    onRoomClosed,
    onNotice,
  });
  callbacksRef.current = {
    onRoomSync,
    onMatchWon,
    onProgress,
    onCheatAlert,
    onRivalSolution,
    onRoomClosed,
    onNotice,
  };

  useEffect(() => {
    if (!active || !roomCode) return;
    let mounted = true;

    try {
      const channel = supabase.channel(`arena_duel_${roomCode}`, {
        config: { broadcast: { self: false } },
      });

      channel
        .on('broadcast', { event: 'match_starting' }, ({ payload }) => {
          if (mounted && payload?.room) callbacksRef.current.onRoomSync(payload.room);
        })
        .on('broadcast', { event: 'room_sync' }, ({ payload }) => {
          if (mounted && payload?.room) callbacksRef.current.onRoomSync(payload.room);
        })
        .on('broadcast', { event: 'match_won' }, ({ payload }) => {
          if (mounted && payload) callbacksRef.current.onMatchWon(payload);
        })
        .on('broadcast', { event: 'player_joined' }, ({ payload }) => {
          if (mounted && payload?.name && payload.name !== playerName) {
            playArcadeCoinSound();
            callbacksRef.current.onNotice(`${payload.name} entered the arena.`);
          }
        })
        .on('broadcast', { event: 'arena_exit' }, ({ payload }) => {
          if (mounted) {
            callbacksRef.current.onRoomClosed(payload?.message || 'Opponent left the arena.');
          }
        })
        .on('broadcast', { event: 'progress_sync' }, ({ payload }) => {
          if (mounted && payload?.playerId !== myPlayerId) {
            callbacksRef.current.onProgress(payload?.testsPassed, payload?.wpm, payload?.cursorLine);
          }
        })
        .on('broadcast', { event: 'cheat_alert' }, ({ payload }) => {
          if (mounted && payload && payload.playerId !== myPlayerId) {
            playOpponentCheatRadarBeep();
            callbacksRef.current.onCheatAlert({
              cheaterName: payload.name || 'Opponent',
              strikes: payload.strikes || 1,
              reason: payload.reason || 'Switched window during match',
              timestamp: Date.now(),
            });
          }
        })
        .on('broadcast', { event: 'match_solution_reveal' }, ({ payload }) => {
          if (mounted && payload && payload.playerId !== myPlayerId) {
            callbacksRef.current.onRivalSolution({
              htmlCode: payload.htmlCode,
              cssCode: payload.cssCode,
              jsCode: payload.jsCode,
              pythonCode: payload.pythonCode,
              javaCode: payload.javaCode,
              cppCode: payload.cppCode,
            });
          }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED' && !isHost) {
            try {
              channel.send({
                type: 'broadcast',
                event: 'player_joined',
                payload: { name: playerName, team: 'omega', playerId: myPlayerId },
              });
            } catch {}
          }
        });

      channelRef.current = channel;
    } catch {}

    const pollMs = stage === 'room' ? 1200 : stage === 'battle' ? 3000 : 10000;
    const interval = setInterval(async () => {
      if (!mounted || (typeof document !== 'undefined' && document.hidden)) return;
      try {
        const res = await fetch(`/api/arena/rooms?code=${roomCode}&_t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (mounted && data?.room) callbacksRef.current.onRoomSync(data.room);
      } catch {}
    }, pollMs);

    return () => {
      mounted = false;
      clearInterval(interval);
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch {}
        channelRef.current = null;
      }
    };
  }, [active, roomCode, myPlayerId, playerName, isHost, stage]);

  const sendEvent = (event: string, payload: Record<string, any>) => {
    try {
      channelRef.current?.send({ type: 'broadcast', event, payload });
    } catch {}
  };

  return { sendEvent };
}
