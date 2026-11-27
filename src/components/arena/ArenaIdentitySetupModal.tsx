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
    specialty: 'Satin Gunmetal × Brass',
    badge: 'ARCHITECT',
    armorHex: '#4B525E',
    armorDarkHex: '#181B22',
    jointHex: '#D4A84F',
  },
  ronin: {
    title: 'Compiler Knight',
    specialty: 'Cobalt Chrome × Cyan',
    badge: 'KNIGHT',
    armorHex: '#2E4A73',
    armorDarkHex: '#0E1726',
    jointHex: '#38BDF8',
  },
  sentinel: {
    title: 'Kernel Phantom',
    specialty: 'Crimson Alloy × Amber',
    badge: 'PHANTOM',
    armorHex: '#5E2735',
    armorDarkHex: '#190C11',
    jointHex: '#F59E0B',
  },
  coder: {
    title: 'Syntax Prodigy',
    specialty: 'Jade Titanium × Emerald',
    badge: 'PRODIGY',
    armorHex: '#2A4E44',
    armorDarkHex: '#0D1916',
    jointHex: '#34D399',
  },
  glitch: {
    title: 'Glitch Viper',
    specialty: 'Obsidian Violet × Gold',
    badge: 'VIPER',
    armorHex: '#453363',
    armorDarkHex: '#130D1F',
    jointHex: '#FBBF24',
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
      ? 'w-28 h-28 drop-shadow-[0_12px_25px_rgba(0,0,0,0.8)]'
      : size === 'sm'
        ? 'w-8 h-8'
        : 'w-12 h-12';

  return (
    <svg
      viewBox="-6 6 132 110"
      className={sizeClass}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`mechShell-${uid}`} cx="42%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.55" />
          <stop offset="35%" stopColor={armorHex} />
          <stop offset="100%" stopColor={armorDarkHex} />
        </radialGradient>
        <linearGradient id={`mechGold-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="50%" stopColor={jointHex} />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
      </defs>

      {/* Floor Shadow */}
      <ellipse cx="60" cy="105" rx="34" ry="6" fill="rgba(0,0,0,0.65)" />

      {/* Stubby Armored Legs + Toe Caps */}
      <rect x="37" y="75" width="16" height="22" rx="6" fill={`url(#mechShell-${uid})`} />
      <rect x="67" y="75" width="16" height="22" rx="6" fill={`url(#mechShell-${uid})`} />
      <ellipse cx="45" cy="98" rx="9" ry="5" fill={armorDarkHex} />
      <ellipse cx="75" cy="98" rx="9" ry="5" fill={armorDarkHex} />

      {/* Narrow Segmented Waist */}
      <rect x="44" y="68" width="32" height="10" rx="4" fill={armorDarkHex} />

      {/* Bulky Curved Mech Arms + 3-Claw Hands */}
      <rect x="16" y="49" width="15" height="33" rx="7" fill={`url(#mechShell-${uid})`} />
      <rect x="89" y="49" width="15" height="33" rx="7" fill={`url(#mechShell-${uid})`} />
      <circle cx="23.5" cy="84" r="6" fill={armorDarkHex} />
      <circle cx="96.5" cy="84" r="6" fill={armorDarkHex} />

      {/* Colored Shoulder Joint Rings (brass / cyan / crimson / emerald / violet) */}
      <circle cx="25" cy="51" r="8.5" fill={`url(#mechGold-${uid})`} />
      <circle cx="25" cy="51" r="3.8" fill={armorDarkHex} />
      <circle cx="95" cy="51" r="8.5" fill={`url(#mechGold-${uid})`} />
      <circle cx="95" cy="51" r="3.8" fill={armorDarkHex} />

      {/* Oversized Domed Ganker Head-Torso Shell */}
      <path
        d="M27 47 C27 20, 93 20, 93 47 C93 64, 80 71, 60 71 C40 71, 27 64, 27 47 Z"
        fill={`url(#mechShell-${uid})`}
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1.2"
      />

      {/* Glossy Black Recessed Oval Eyes & Chin Seam */}
      <ellipse cx="44" cy="52" rx="5.8" ry="8.5" fill="#050608" />
      <ellipse cx="42.5" cy="49" rx="1.6" ry="2.4" fill="rgba(255,255,255,0.35)" />
      <ellipse cx="76" cy="52" rx="5.8" ry="8.5" fill="#050608" />
      <ellipse cx="74.5" cy="49" rx="1.6" ry="2.4" fill="rgba(255,255,255,0.35)" />
      <rect x="51" y="61" width="18" height="2" rx="1" fill={armorDarkHex} />
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
