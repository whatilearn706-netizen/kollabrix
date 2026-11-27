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
    specialty: 'Slate Tee × Caramel Bag',
    badge: 'ARCHITECT',
    armorHex: '#697C82',
    armorDarkHex: '#663F24',
    jointHex: '#C46B2B',
  },
  ronin: {
    title: 'Compiler Knight',
    specialty: 'Cobalt Tee × Cyan Bag',
    badge: 'KNIGHT',
    armorHex: '#355787',
    armorDarkHex: '#27272A',
    jointHex: '#38BDF8',
  },
  sentinel: {
    title: 'Kernel Phantom',
    specialty: 'Crimson Tee × Amber Bag',
    badge: 'PHANTOM',
    armorHex: '#7C2D3E',
    armorDarkHex: '#3F2316',
    jointHex: '#D97706',
  },
  coder: {
    title: 'Syntax Prodigy',
    specialty: 'Jade Tee × Tan Bag',
    badge: 'PRODIGY',
    armorHex: '#2E5E50',
    armorDarkHex: '#4B2E1B',
    jointHex: '#C97B36',
  },
  glitch: {
    title: 'Glitch Viper',
    specialty: 'Violet Tee × Gold Bag',
    badge: 'VIPER',
    armorHex: '#4B3869',
    armorDarkHex: '#1E1B24',
    jointHex: '#EAB308',
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
      viewBox="-4 4 128 112"
      className={sizeClass}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`skinGrad-${uid}`} cx="45%" cy="38%" r="60%">
          <stop offset="0%" stopColor="#FCE0CC" />
          <stop offset="65%" stopColor="#F2BE9E" />
          <stop offset="100%" stopColor="#DCA080" />
        </radialGradient>
      </defs>

      {/* Soft ground shadow */}
      <ellipse cx="60" cy="108" rx="30" ry="5" fill="rgba(0,0,0,0.65)" />

      {/* Crewneck T-Shirt Bust + Crossbody Bag Strap */}
      <path
        d="M28 104 C28 84, 40 76, 60 76 C80 76, 92 84, 92 104 Z"
        fill={armorHex}
      />
      <path d="M40 78 L80 104" stroke={jointHex} strokeWidth="6" strokeLinecap="round" />

      {/* Ears */}
      <circle cx="30" cy="52" r="7.5" fill="#EAC1A5" />
      <circle cx="90" cy="52" r="7.5" fill="#EAC1A5" />

      {/* Plump Chibi Head */}
      <ellipse cx="60" cy="50" rx="29" ry="27" fill={`url(#skinGrad-${uid})`} />

      {/* Sculpted Hair Cap & Side-Swept Bangs */}
      <path
        d="M31 44 C31 20, 89 20, 89 44 C84 34, 72 31, 60 32 C48 31, 36 34, 31 44 Z"
        fill={armorDarkHex}
      />
      <path d="M36 37 Q54 25 74 34" stroke={armorDarkHex} strokeWidth="6" strokeLinecap="round" fill="none" />

      {/* Soft Cheek Blush */}
      <ellipse cx="42" cy="59" rx="5.5" ry="3.2" fill="#E5947A" opacity="0.65" />
      <ellipse cx="78" cy="59" rx="5.5" ry="3.2" fill="#E5947A" opacity="0.65" />

      {/* Eyebrows */}
      <rect x="40" y="39" width="11" height="3" rx="1.5" fill={armorDarkHex} />
      <rect x="69" y="39" width="11" height="3" rx="1.5" fill={armorDarkHex} />

      {/* Round Glasses Frames + Bead Eyes + Nose */}
      <circle cx="46" cy="51" r="9.5" fill="rgba(255,255,255,0.06)" stroke="#18191C" strokeWidth="2.4" />
      <circle cx="74" cy="51" r="9.5" fill="rgba(255,255,255,0.06)" stroke="#18191C" strokeWidth="2.4" />
      <line x1="55.5" y1="51" x2="64.5" y2="51" stroke="#18191C" strokeWidth="2.4" />

      <circle cx="46" cy="51" r="3" fill="#111012" />
      <circle cx="45" cy="49.7" r="1" fill="#FFFFFF" />
      <circle cx="74" cy="51" r="3" fill="#111012" />
      <circle cx="73" cy="49.7" r="1" fill="#FFFFFF" />

      <circle cx="60" cy="57" r="3.2" fill="#E3977C" />
      <rect x="56" y="64" width="8" height="1.8" rx="0.9" fill={armorDarkHex} opacity="0.65" />
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
