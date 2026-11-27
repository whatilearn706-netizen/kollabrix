'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, Check, Dices, Loader2, Lock, Shield, Sparkles, Terminal, X } from 'lucide-react';
import {
  PROVING_GROUNDS_AVATARS,
  RANDOM_CALLSIGNS,
  generateGuestCallsign,
  sanitizeCallsign,
} from './arenaTypes';

export const AVATAR_CLASS_META: Record<
  string,
  {
    title: string;
    specialty: string;
    badge: string;
    armorHex: string;
    armorDarkHex: string;
    jointHex: string;
  }
> = {
  walker: {
    title: 'Cyber Architect',
    specialty: 'Graphite Armor × Ice-Cyan Visor',
    badge: 'ARCHITECT',
    armorHex: '#1E293B',
    armorDarkHex: '#0B101B',
    jointHex: '#38BDF8',
  },
  ronin: {
    title: 'Compiler Knight',
    specialty: 'Cobalt Plate × Electric Sky Visor',
    badge: 'KNIGHT',
    armorHex: '#1D3B72',
    armorDarkHex: '#091326',
    jointHex: '#60A5FA',
  },
  sentinel: {
    title: 'Kernel Phantom',
    specialty: 'Crimson Ops × Molten Ember Visor',
    badge: 'PHANTOM',
    armorHex: '#5F1322',
    armorDarkHex: '#14070B',
    jointHex: '#F43F5E',
  },
  coder: {
    title: 'Syntax Prodigy',
    specialty: 'Jade Stealth × Emerald Core',
    badge: 'PRODIGY',
    armorHex: '#114B3F',
    armorDarkHex: '#061915',
    jointHex: '#34D399',
  },
  glitch: {
    title: 'Glitch Viper',
    specialty: 'Obsidian Violet × Apex Gold Visor',
    badge: 'VIPER',
    armorHex: '#3B1E6D',
    armorDarkHex: '#120822',
    jointHex: '#FACC15',
  },
};

export function ColoredMechBadge({
  armorHex,
  armorDarkHex,
  jointHex,
  uid,
  size = 'md',
}: {
  armorHex: string;
  armorDarkHex: string;
  jointHex: string;
  uid: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClass =
    size === 'lg'
      ? 'w-28 h-28 drop-shadow-[0_12px_25px_rgba(0,0,0,0.85)]'
      : size === 'sm'
        ? 'w-8 h-8'
        : 'w-12 h-12';

  return (
    <svg viewBox="0 0 120 120" className={sizeClass} aria-hidden="true">
      <defs>
        <linearGradient id={`helmGrad-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={armorHex} />
          <stop offset="100%" stopColor={armorDarkHex} />
        </linearGradient>
      </defs>

      {/* Rear Holo Wing Silhouette */}
      <path
        d="M16 58 L36 42 L36 74 Z M104 58 L84 42 L84 74 Z"
        fill={jointHex}
        opacity="0.28"
      />

      {/* Armored Shoulder Pauldrons & Chest V-Chevron */}
      <path
        d="M22 108 L30 80 L48 76 L60 88 L72 76 L90 80 L98 108 Z"
        fill={`url(#helmGrad-${uid})`}
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="1.5"
      />
      <path
        d="M46 84 L60 98 L74 84"
        fill="none"
        stroke={jointHex}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Stealth Helmet Shell */}
      <path
        d="M36 52 C36 26, 84 26, 84 52 L80 72 L60 80 L40 72 Z"
        fill={`url(#helmGrad-${uid})`}
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="1.8"
      />

      {/* Helmet Crest & Ear Comm-Fins */}
      <rect x="57" y="19" width="6" height="16" rx="2" fill={jointHex} />
      <rect x="31" y="42" width="5" height="20" rx="2" fill={armorDarkHex} stroke={jointHex} strokeWidth="1" />
      <rect x="84" y="42" width="5" height="20" rx="2" fill={armorDarkHex} stroke={jointHex} strokeWidth="1" />

      {/* Glowing Curved Tactical Visor */}
      <path
        d="M40 48 Q60 54 80 48 L77 58 Q60 63 43 58 Z"
        fill={jointHex}
      />
      <path
        d="M45 50 Q60 54 75 50"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        opacity="0.7"
      />

      {/* Tactical Mask Respirator Lines */}
      <path
        d="M48 67 L60 72 L72 67"
        fill="none"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface ArenaIdentitySetupModalProps {
  initialCallsign: string;
  initialAvatarId: string;
  initialCustomUrl?: string;
  isFirstEntry: boolean;
  isGuest?: boolean;
  userId?: string;
  onOpenAuth?: () => void;
  onConfirm: (
    callsign: string,
    avatarId: string,
    customUrl?: string
  ) => Promise<{ ok: boolean; error?: string } | void> | void;
  onCancel?: () => void;
}

/**
 * Dark-Smoke & Brushed Silver Mech Identity Selector:
 * Enforces globally unique Arena callsigns for logged-in accounts and random alphanumeric IDs for guest previews.
 */
export function ArenaIdentitySetupModal({
  initialCallsign,
  initialAvatarId,
  isFirstEntry,
  isGuest = false,
  userId = '',
  onOpenAuth,
  onConfirm,
  onCancel,
}: ArenaIdentitySetupModalProps) {
  const [callsign, setCallsign] = useState<string>(
    isGuest ? initialCallsign || generateGuestCallsign() : initialCallsign || ''
  );
  const [avatarId, setAvatarId] = useState<string>(initialAvatarId || 'walker');
  const [checkState, setCheckState] = useState<'idle' | 'checking' | 'available' | 'taken'>(
    isGuest ? 'available' : 'idle'
  );
  const [checkMsg, setCheckMsg] = useState<string>(
    isGuest ? 'Random alphanumeric guest preview ID' : ''
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>('');

  const selectedAvatar =
    PROVING_GROUNDS_AVATARS.find((a) => a.id === avatarId) || PROVING_GROUNDS_AVATARS[0];
  const meta = AVATAR_CLASS_META[selectedAvatar.id] || AVATAR_CLASS_META.walker;

  useEffect(() => {
    if (isGuest) {
      setCheckState('available');
      setCheckMsg('Guest preview uses temporary random alphanumeric IDs');
      return;
    }
    const clean = callsign.trim();
    setSaveError('');
    if (clean.length < 3) {
      setCheckState('idle');
      setCheckMsg('Minimum 3 characters required');
      return;
    }
    setCheckState('checking');
    setCheckMsg('Checking global Arena registry...');
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/profile/check-username?username=${encodeURIComponent(clean)}&userId=${encodeURIComponent(userId)}`
        );
        const d = await res.json();
        if (d?.available === false) {
          setCheckState('taken');
          setCheckMsg(d.message || 'Already claimed by another player');
        } else {
          setCheckState('available');
          setCheckMsg(d.isOwn ? 'Your verified unique handle' : 'Available — exclusively yours');
        }
      } catch {
        setCheckState('available');
        setCheckMsg('Verified during save');
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [callsign, isGuest, userId]);

  const rollRandom = () => {
    if (isGuest) {
      setCallsign(generateGuestCallsign());
      return;
    }
    const next = RANDOM_CALLSIGNS[Math.floor(Math.random() * RANDOM_CALLSIGNS.length)];
    setCallsign(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isGuest && (checkState === 'taken' || checkState === 'checking' || callsign.trim().length < 3)) {
      return;
    }
    setIsSaving(true);
    setSaveError('');
    try {
      const result = await onConfirm(callsign, avatarId, '');
      if (result && result.ok === false) {
        setSaveError(result.error || 'Could not claim this name.');
        setCheckState('taken');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9995] bg-[#040509]/92 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-3xl rounded-3xl bg-gradient-to-b from-[#13161E] via-[#0B0D13] to-[#07080C] border border-zinc-400/25 shadow-[0_35px_120px_rgba(0,0,0,0.95),0_0_40px_rgba(226,232,240,0.08)] overflow-hidden my-auto"
      >
        {/* Brushed Metallic Silver Top Rim Highlight */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-zinc-300/75 to-transparent" />

        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-zinc-400/25 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-200">
                <Terminal className="w-3 h-3 text-zinc-300" />
                <span>{isFirstEntry ? 'INITIALIZE FIGHTER PROFILE' : 'CUSTOMIZE LOADOUT'}</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
                {isGuest
                  ? 'Guest Preview Loadout'
                  : isFirstEntry
                    ? 'Claim Your Unique Arena Name & Mech'
                    : 'Edit Coder Identity'}
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                {isGuest
                  ? 'Preview uses random alphanumeric IDs and resets ELO when switching tabs or leaving.'
                  : 'Each Arena name can only be held by one logged-in user — ELO & rank save permanently.'}
              </p>
            </div>

            {!isFirstEntry && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-9 h-9 rounded-full bg-white/[0.05] border border-zinc-400/25 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left Live Colored Mech Skin Showcase */}
            <div className="md:col-span-5 rounded-2xl bg-[#07090E] border border-zinc-400/20 p-5 flex flex-col items-center text-center space-y-3 relative overflow-hidden">
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-zinc-200/10 blur-3xl pointer-events-none" />
              <span className="px-3 py-0.5 rounded-full bg-white/[0.06] border border-zinc-400/30 text-[10px] font-mono font-bold text-zinc-200 tracking-widest">
                {meta.badge} MECH
              </span>

              <div className="w-36 h-36 rounded-2xl border border-zinc-300/35 bg-gradient-to-b from-[#171A23] to-[#080A0F] shadow-[0_0_30px_rgba(226,232,240,0.12)] flex items-center justify-center">
                <ColoredMechBadge
                  armorHex={meta.armorHex}
                  armorDarkHex={meta.armorDarkHex}
                  jointHex={meta.jointHex}
                  uid={`preview-${selectedAvatar.id}`}
                  size="lg"
                />
              </div>

              <div>
                <p className="font-mono text-sm font-black text-white truncate max-w-[200px]">
                  {sanitizeCallsign(callsign)}
                </p>
                <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                  {meta.title} &bull; {meta.specialty}
                </p>
              </div>
            </div>

            {/* Right Callsign + Colored Mech Skins Grid (No '+' button) */}
            <div className="md:col-span-7 space-y-5">
              {isGuest && onOpenAuth && (
                <div className="rounded-xl bg-amber-500/10 border border-amber-400/30 p-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-amber-200 leading-snug">
                    Sign in to claim a unique custom name &amp; keep your ELO forever.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onCancel?.();
                      onOpenAuth();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-slate-950 font-mono text-[10px] font-black uppercase tracking-wider cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                    <span>{isGuest ? 'Guest Preview ID (Random Mix)' : 'Unique Gamer Callsign'}</span>
                    {isGuest && <Lock className="w-3 h-3 text-zinc-500" />}
                  </label>
                  <button
                    type="button"
                    onClick={rollRandom}
                    className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-300 hover:text-white cursor-pointer"
                  >
                    <Dices className="w-3.5 h-3.5" />
                    <span>{isGuest ? 'New Random ID' : 'Randomize Handle'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={callsign}
                  maxLength={25}
                  readOnly={isGuest}
                  autoFocus={!isGuest}
                  onChange={(e) => !isGuest && setCallsign(e.target.value)}
                  placeholder={isGuest ? 'G-7M4X9K2P' : 'Enter your unique fighter name'}
                  className={`w-full px-4 py-3 rounded-xl bg-[#07090E] border font-mono text-sm text-white outline-none tracking-wide ${
                    isGuest
                      ? 'border-zinc-400/20 text-zinc-300 cursor-default'
                      : checkState === 'taken' || saveError
                        ? 'border-rose-500/70 focus:border-rose-400'
                        : checkState === 'available'
                          ? 'border-emerald-500/50 focus:border-emerald-400'
                          : 'border-zinc-400/25 focus:border-zinc-200'
                  }`}
                />
                {saveError ? (
                  <p className="text-[11px] font-mono text-rose-400 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{saveError}</span>
                  </p>
                ) : (
                  <p
                    className={`text-[11px] font-mono flex items-center gap-1.5 ${
                      checkState === 'taken'
                        ? 'text-rose-400'
                        : checkState === 'available' && !isGuest
                          ? 'text-emerald-400'
                          : 'text-zinc-500'
                    }`}
                  >
                    {checkState === 'checking' && <Loader2 className="w-3 h-3 animate-spin shrink-0" />}
                    <span>{checkMsg || 'Displayed on 1v1 face-off cards, match lobbies & campus leaderboards.'}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2.5">
                <span className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300">
                  Choose Colored 3D Mech Skin
                </span>
                <div className="grid grid-cols-5 gap-2.5">
                  {PROVING_GROUNDS_AVATARS.map((av) => {
                    const active = avatarId === av.id;
                    const avMeta = AVATAR_CLASS_META[av.id] || AVATAR_CLASS_META.walker;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setAvatarId(av.id)}
                        title={`${avMeta.title} (${avMeta.specialty})`}
                        className={`group relative rounded-xl p-2 border transition-all cursor-pointer bg-[#07090E] flex flex-col items-center ${
                          active
                            ? 'border-zinc-200 ring-2 ring-zinc-300/35 shadow-[0_0_20px_rgba(226,232,240,0.2)] scale-[1.04]'
                            : 'border-white/10 opacity-80 hover:opacity-100 hover:border-zinc-400/40'
                        }`}
                      >
                        <ColoredMechBadge
                          armorHex={avMeta.armorHex}
                          armorDarkHex={avMeta.armorDarkHex}
                          jointHex={avMeta.jointHex}
                          uid={`thumb-${av.id}`}
                        />
                        <p className="text-[9px] font-mono text-center text-zinc-300 truncate w-full mt-1">
                          {avMeta.badge}
                        </p>
                        {active && (
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-zinc-100 text-[#07090E] flex items-center justify-center shadow">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Anti-Cheat Telemetry Ready</span>
            </div>

            <button
              type="submit"
              disabled={isSaving || (!isGuest && (checkState === 'taken' || checkState === 'checking' || callsign.trim().length < 3))}
              className="px-7 py-3 rounded-full bg-gradient-to-b from-[#1E222B] via-[#11141B] to-[#080A0E] text-white border border-zinc-300/50 hover:border-white/80 font-mono text-xs sm:text-sm font-black uppercase tracking-wider inline-flex items-center gap-2 shadow-[0_0_24px_rgba(226,232,240,0.22),inset_0_1px_0_rgba(255,255,255,0.25)] hover:shadow-[0_0_32px_rgba(226,232,240,0.38)] cursor-pointer transition-all disabled:opacity-45 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin text-zinc-200" />
              ) : (
                <Sparkles className="w-4 h-4 text-zinc-200" />
              )}
              <span>
                {isGuest
                  ? 'Apply Preview Skin'
                  : isFirstEntry
                    ? 'Lock In & Enter Lobby'
                    : 'Save Fighter Profile'}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
