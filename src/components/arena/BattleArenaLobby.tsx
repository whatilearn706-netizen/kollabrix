'use client';

import React, { useState, useEffect } from 'react';
import {
  Home,
  Users,
  Swords,
  Copy,
  Check,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Search,
  Plus,
  ArrowRight,
  Shield,
  KeyRound,
  Eye,
  Trophy,
  Edit3,
  Share2,
  ShoppingBag,
  Cpu,
  Flame,
  Award,
  Radio,
  Zap,
  Bot,
  SlidersHorizontal,
  ChevronRight,
  Clock,
  Layers,
  Terminal,
  Activity,
} from 'lucide-react';
import { BattleLaptop3D } from './BattleLaptop3D';
import { arenaAudio } from '@/lib/arena/arenaAudio';

export interface BattleProfile {
  gamerTag: string;
  uid: string; // 7-digit numeric UID (e.g. "7492014")
  avatarIdx: number;
  level: number;
  elo: number;
  rankTitle: string;
  college: string;
  wins: number;
  matchesPlayed: number;
}

const AVATAR_OPTIONS = [
  { id: 0, label: 'Cyber Blade', emoji: '🦾', bg: 'from-amber-500 to-orange-600' },
  { id: 1, label: 'Neon Pulse', emoji: '⚡', bg: 'from-cyan-500 to-blue-600' },
  { id: 2, label: 'Neural Ghost', emoji: '🧠', bg: 'from-purple-500 to-indigo-600' },
  { id: 3, label: 'Terminal Aegis', emoji: '🛡️', bg: 'from-emerald-500 to-teal-600' },
  { id: 4, label: 'Shadow Dragon', emoji: '🐉', bg: 'from-rose-500 to-red-600' },
  { id: 5, label: 'Quantum Fox', emoji: '🦊', bg: 'from-orange-500 to-amber-600' },
  { id: 6, label: 'Code Monarch', emoji: '👑', bg: 'from-yellow-400 to-amber-500' },
  { id: 7, label: 'Cosmic Void', emoji: '🚀', bg: 'from-violet-600 to-pink-600' },
];

const GAME_MODES = [
  {
    id: 'ranked',
    topic: 'web_dev',
    title: '1v1 Speed Duel',
    subtitle: 'Ranked Competitive',
    desc: 'Face off against collegiate rivals in a live real-time code sprint.',
    badge: 'ELO RATED',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    icon: Swords,
  },
  {
    id: 'ranked',
    topic: 'algorithms',
    title: 'DSA Algo Wars',
    subtitle: 'Competitive LeetCode Style',
    desc: 'Battle on graphs, dynamic programming, and binary search trees.',
    badge: 'HARDCORE',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    icon: Cpu,
  },
  {
    id: 'casual',
    topic: 'bug_hunt',
    title: 'Bug Hunter Relay',
    subtitle: 'Casual Blitz',
    desc: 'Spot and fix critical production bugs under high-pressure timer.',
    badge: 'UNRANKED',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    icon: Activity,
  },
  {
    id: 'bot',
    topic: 'web_dev',
    title: 'Bot Sparring Lab',
    subtitle: 'AI Warmup Range',
    desc: 'Practice zero-latency drills against our Collegiate Bot AI.',
    badge: 'TRAINING',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    icon: Bot,
  },
];

export interface BattleArenaLobbyProps {
  currentUser?: {
    displayName?: string;
    username?: string;
    avatarUrl?: string;
  };
  onStartMatch: (
    mode: 'ranked' | 'casual' | 'bot',
    arenaTopic: 'web_dev' | 'algorithms' | 'bug_hunt'
  ) => void;
  onCreateRoom: (arenaTopic: 'web_dev' | 'algorithms' | 'bug_hunt') => void;
  onJoinRoom: (code: string) => void;
  onClose: () => void;
  initialRoomCode?: string;
}

export function BattleArenaLobby({
  currentUser,
  onStartMatch,
  onCreateRoom,
  onJoinRoom,
  onClose,
  initialRoomCode,
}: BattleArenaLobbyProps) {
  // Navigation Tabs: Home (Lobby), Friends, Rooms
  const [activeTab, setActiveTab] = useState<'home' | 'friends' | 'rooms'>('home');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);

  // Selected Game Mode State
  const [selectedModeIdx, setSelectedModeIdx] = useState(0);
  const [isModeModalOpen, setIsModeModalOpen] = useState(false);

  // Active Left Rail Modal State
  const [activeLeftModal, setActiveLeftModal] = useState<
    'store' | 'arsenal' | 'leaderboard' | 'vault' | null
  >(null);

  // Identity / Profile Setup
  const [profile, setProfile] = useState<BattleProfile | null>(null);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [tempGamerTag, setTempGamerTag] = useState('');
  const [tempAvatarIdx, setTempAvatarIdx] = useState(0);

  // Friends State
  const [friendSearchQuery, setFriendSearchQuery] = useState('');
  const [friendsList, setFriendsList] = useState<
    Array<{
      uid: string;
      name: string;
      avatarEmoji: string;
      college: string;
      status: 'online' | 'in_match' | 'offline';
      currentMode?: string;
    }>
  >([]);

  // Rooms State
  const [activeRooms, setActiveRooms] = useState<any[]>([]);
  const [joinRoomInput, setJoinRoomInput] = useState(initialRoomCode || '');
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);

  // Matchmaking Queue simulation state
  const [isSearchingMatch, setIsSearchingMatch] = useState(false);
  const [queueTimer, setQueueTimer] = useState(0);

  // Initialize or Load Battle Profile
  useEffect(() => {
    setIsAudioMuted(arenaAudio.getIsMuted());

    let savedProfile: BattleProfile | null = null;
    try {
      const raw = localStorage.getItem('kollabrix_battle_profile');
      if (raw) savedProfile = JSON.parse(raw);
    } catch {}

    if (savedProfile && savedProfile.uid && savedProfile.gamerTag) {
      setProfile(savedProfile);
    } else {
      const random7Digit = String(
        Math.floor(1000000 + Math.random() * 8999999)
      );
      const defaultTag =
        currentUser?.username ||
        currentUser?.displayName?.split(' ')[0] ||
        `Warrior_${random7Digit.slice(-4)}`;

      const newProfile: BattleProfile = {
        gamerTag: defaultTag,
        uid: random7Digit,
        avatarIdx: 0,
        level: 14,
        elo: 1840,
        rankTitle: 'Gold II 🏆',
        college: 'S-VYASA University',
        wins: 42,
        matchesPlayed: 56,
      };

      setProfile(newProfile);
      setTempGamerTag(newProfile.gamerTag);
      setTempAvatarIdx(newProfile.avatarIdx);
      localStorage.setItem('kollabrix_battle_profile', JSON.stringify(newProfile));

      const hasCustomized = localStorage.getItem('kollabrix_battle_customized');
      if (!hasCustomized) {
        setIsSetupModalOpen(true);
      }
    }
  }, [currentUser]);

  // Matchmaking timer ticker
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSearchingMatch) {
      interval = setInterval(() => {
        setQueueTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setQueueTimer(0);
    }
    return () => clearInterval(interval);
  }, [isSearchingMatch]);

  // Load active rooms for the Rooms Tab
  useEffect(() => {
    if (activeTab === 'rooms') {
      setIsLoadingRooms(true);
      fetch('/api/arena/rooms?list=true', { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
          if (data.rooms && Array.isArray(data.rooms)) {
            setActiveRooms(data.rooms);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingRooms(false));
    }
  }, [activeTab]);

  // Mock Friends List based on Collegiate peers
  useEffect(() => {
    setFriendsList([
      {
        uid: '8192034',
        name: 'Arjun_V',
        avatarEmoji: '⚡',
        college: 'RV College of Engineering',
        status: 'online',
      },
      {
        uid: '4928104',
        name: 'Dev_Sharma',
        avatarEmoji: '🦾',
        college: 'IIT Delhi',
        status: 'in_match',
        currentMode: '1v1 Algorithms • Round 2',
      },
      {
        uid: '9120485',
        name: 'Ananya_K',
        avatarEmoji: '👑',
        college: 'S-VYASA University',
        status: 'online',
      },
      {
        uid: '3829102',
        name: 'CyberRonin',
        avatarEmoji: '🐉',
        college: 'BITS Pilani',
        status: 'offline',
      },
    ]);
  }, []);

  const handleCopyUid = () => {
    if (!profile) return;
    navigator.clipboard.writeText(profile.uid);
    setCopiedUid(true);
    arenaAudio.playClick();
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleToggleAudio = () => {
    const muted = arenaAudio.toggleMute();
    setIsAudioMuted(muted);
  };

  const handleSaveProfile = () => {
    if (!profile) return;
    const updatedTag = tempGamerTag.trim().slice(0, 16) || profile.gamerTag;
    const updated: BattleProfile = {
      ...profile,
      gamerTag: updatedTag,
      avatarIdx: tempAvatarIdx,
    };
    setProfile(updated);
    localStorage.setItem('kollabrix_battle_profile', JSON.stringify(updated));
    localStorage.setItem('kollabrix_battle_customized', 'true');
    setIsSetupModalOpen(false);
    arenaAudio.playReadyUp();
  };

  const handleStartGame = () => {
    arenaAudio.playMatchFound();
    setIsSearchingMatch(true);

    const activeConfig = GAME_MODES[selectedModeIdx] || GAME_MODES[0];

    // Quick countdown simulation for that authentic Free Fire matchmaking rush
    setTimeout(() => {
      setIsSearchingMatch(false);
      onStartMatch(
        activeConfig.id as 'ranked' | 'casual' | 'bot',
        activeConfig.topic as 'web_dev' | 'algorithms' | 'bug_hunt'
      );
    }, 1800);
  };

  const handleJoinWithCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!joinRoomInput.trim()) return;
    arenaAudio.playClick();
    onJoinRoom(joinRoomInput.trim().toUpperCase());
  };

  if (!profile) return null;

  const currentAvatar = AVATAR_OPTIONS[profile.avatarIdx] || AVATAR_OPTIONS[0];
  const activeMode = GAME_MODES[selectedModeIdx] || GAME_MODES[0];
  const ActiveModeIcon = activeMode.icon;

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-[#030611] text-slate-100 overflow-hidden select-none font-sans flex flex-col justify-between">
      {/* Background Ambience Overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/20 via-[#040816] to-[#020308] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00d4ff05_1px,transparent_1px),linear-gradient(to_bottom,#00d4ff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* =========================================================================
          FULL-SCREEN 3D STAGE: SCI-FI CYBER HANGAR & BATTLE LAPTOP CENTERPIECE
         ========================================================================= */}
      <div className="absolute inset-0 z-0">
        <BattleLaptop3D
          gamerTag={profile.gamerTag}
          uid={profile.uid}
          college={profile.college}
          rankTitle={profile.rankTitle}
          className="w-full h-full"
        />
      </div>

      {/* =========================================================================
          TOP BAR (AUTHENTIC FREE FIRE / BGMI GAMING TOP HUD)
          - Top-Left: Player Profile Badge (Avatar, Gamer Tag, Level, XP bar, 7-digit UID)
          - Top-Center: Game Economy & Stats Ticker (ELO, Tokens, Win-Streak)
          - Top-Right: Ping (📶 18ms), Sound Toggle, Exit Button
         ========================================================================= */}
      <header className="relative z-30 w-full flex items-center justify-between px-6 pt-5 pb-2 pointer-events-none">
        {/* TOP LEFT: GAMER IDENTITY BANNER */}
        <div className="flex items-center gap-3.5 p-2 pr-4 rounded-2xl bg-slate-950/85 border border-slate-800/90 shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl pointer-events-auto">
          <div
            onClick={() => {
              setTempGamerTag(profile.gamerTag);
              setTempAvatarIdx(profile.avatarIdx);
              setIsSetupModalOpen(true);
            }}
            className="relative cursor-pointer group"
            title="Customize Battle Profile"
          >
            <div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${currentAvatar.bg} p-0.5 shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-transform duration-200 group-hover:scale-105`}
            >
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-2xl">
                {currentAvatar.emoji}
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-900 border border-cyan-400 flex items-center justify-center text-[9px] text-cyan-300">
              <Edit3 className="w-2.5 h-2.5" />
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm sm:text-base text-white tracking-wide font-mono uppercase">
                {profile.gamerTag}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                LVL {profile.level}
              </span>
            </div>

            {/* 7-Digit Numeric UID + 1-Tap Copy */}
            <div className="flex items-center gap-2 mt-0.5">
              <button
                type="button"
                onClick={handleCopyUid}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-mono font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                title="Copy Gamer UID"
              >
                <span>UID: {profile.uid}</span>
                {copiedUid ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 opacity-70" />
                )}
              </button>
              <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
                • {profile.college}
              </span>
            </div>
          </div>
        </div>

        {/* TOP CENTER: GAME CURRENCIES & TOURNAMENT STATUS TICKER */}
        <div className="hidden lg:flex items-center gap-3 p-1.5 px-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.7)] backdrop-blur-xl pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/80 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{profile.elo} ELO</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
            <Trophy className="w-3.5 h-3.5 text-cyan-400" />
            <span>{profile.rankTitle.split('•')[0]}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/80 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>{profile.wins} WINS</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/80 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold">
            <Award className="w-3.5 h-3.5 text-purple-400" />
            <span>1,450 B-TOKENS</span>
          </div>
        </div>

        {/* TOP RIGHT: PING, SOUND FX & EXIT */}
        <div className="flex items-center gap-2.5 pointer-events-auto">
          {/* Server Ping */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-emerald-400 text-[11px] font-mono font-bold shadow-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>18ms ASIA</span>
          </div>

          {/* Audio Mute/Unmute */}
          <button
            type="button"
            onClick={handleToggleAudio}
            title={isAudioMuted ? 'Unmute Audio SFX' : 'Mute Audio SFX'}
            className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-colors backdrop-blur-md cursor-pointer shadow-sm"
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Exit Arena Button */}
          <button
            type="button"
            onClick={onClose}
            title="Exit Battle Arena"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono font-bold text-slate-300 hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10 transition-all backdrop-blur-md cursor-pointer shadow-sm"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          TOP CENTER NAVIGATION TABS: [ 🏠 LOBBY | 👥 FRIENDS | ⚔️ ROOMS ]
         ========================================================================= */}
      <div className="relative z-30 w-full flex justify-center pointer-events-none mt-1">
        <nav className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950/85 border border-slate-800/90 shadow-[0_8px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl pointer-events-auto">
          <button
            type="button"
            onClick={() => {
              arenaAudio.playClick();
              setActiveTab('home');
            }}
            onMouseEnter={() => arenaAudio.playHover()}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/30 scale-[1.03]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Lobby</span>
          </button>

          <button
            type="button"
            onClick={() => {
              arenaAudio.playClick();
              setActiveTab('friends');
            }}
            onMouseEnter={() => arenaAudio.playHover()}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'friends'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/30 scale-[1.03]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Squad</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          <button
            type="button"
            onClick={() => {
              arenaAudio.playClick();
              setActiveTab('rooms');
            }}
            onMouseEnter={() => arenaAudio.playHover()}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'rooms'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/30 scale-[1.03]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>Custom Rooms</span>
          </button>
        </nav>
      </div>

      {/* =========================================================================
          LEFT VERTICAL ACTION STACK (AUTHENTIC FREE FIRE STYLE MENU)
          [ 🛒 STORE | ⚔️ ARSENAL | 🏆 RANKINGS | 📦 VAULT | 🤖 BOT LAB ]
         ========================================================================= */}
      {activeTab === 'home' && (
        <aside className="absolute left-6 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2.5 pointer-events-auto">
          {[
            {
              id: 'store',
              label: 'STORE',
              sub: 'Themes & Skins',
              icon: ShoppingBag,
              color: 'hover:border-amber-400 hover:text-amber-300',
            },
            {
              id: 'arsenal',
              label: 'ARSENAL',
              sub: 'Tech Stack',
              icon: Cpu,
              color: 'hover:border-cyan-400 hover:text-cyan-300',
            },
            {
              id: 'leaderboard',
              label: 'RANKINGS',
              sub: 'National ELO',
              icon: Trophy,
              color: 'hover:border-yellow-400 hover:text-yellow-300',
            },
            {
              id: 'vault',
              label: 'VAULT',
              sub: 'Badges & Trophies',
              icon: Award,
              color: 'hover:border-purple-400 hover:text-purple-300',
            },
            {
              id: 'bot_lab',
              label: 'BOT LAB',
              sub: 'AI Warmup',
              icon: Bot,
              color: 'hover:border-emerald-400 hover:text-emerald-300',
            },
          ].map((item) => {
            const ItemIcon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  arenaAudio.playClick();
                  if (item.id === 'bot_lab') {
                    onStartMatch('bot', activeMode.topic as any);
                  } else {
                    setActiveLeftModal(item.id as any);
                  }
                }}
                onMouseEnter={() => arenaAudio.playHover()}
                className={`group flex items-center gap-3 p-2.5 pr-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 text-slate-300 backdrop-blur-xl shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer ${item.color}`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 group-hover:border-cyan-400/50 flex items-center justify-center transition-colors">
                  <ItemIcon className="w-5 h-5 text-slate-300 group-hover:text-amber-400 transition-colors" />
                </div>
                <div className="text-left font-mono">
                  <p className="text-xs font-black text-white group-hover:text-amber-300 tracking-wider">
                    {item.label}
                  </p>
                  <p className="text-[10px] text-slate-400">{item.sub}</p>
                </div>
              </button>
            );
          })}
        </aside>
      )}

      {/* =========================================================================
          RIGHT TOP: SEASON 01 PASS / LEAGUE EVENT CARD
         ========================================================================= */}
      {activeTab === 'home' && (
        <aside className="absolute right-6 top-24 z-30 hidden md:flex flex-col gap-3 pointer-events-auto">
          <div className="p-3.5 pr-6 rounded-2xl bg-gradient-to-r from-slate-950/90 via-slate-900/90 to-amber-950/40 border border-amber-500/30 backdrop-blur-xl shadow-[0_0_30px_rgba(245,158,11,0.15)] flex items-center gap-3.5 animate-fadeIn">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
              <Trophy className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black uppercase text-amber-300 tracking-wider">
                  COLLEGIATE SEASON 01
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  18D LEFT
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                Current Tier: <strong className="text-cyan-300">{profile.rankTitle.split('•')[0]}</strong> • Next: Platinum
              </p>
            </div>
          </div>
        </aside>
      )}

      {/* =========================================================================
          FRIENDS / SQUAD TAB OVERLAY
         ========================================================================= */}
      {activeTab === 'friends' && (
        <div className="relative z-20 mx-auto w-full max-w-4xl p-6 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-[0_0_80px_rgba(0,0,0,0.9)] backdrop-blur-2xl space-y-6 animate-fadeIn pointer-events-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-white font-mono uppercase tracking-wide">
                Squad &amp; Friends Roster
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Find collegiate peers by their 7-digit UID or Gamer Tag and challenge them to a 1v1 duel.
              </p>
            </div>

            <div className="w-full sm:w-auto flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={friendSearchQuery}
                  onChange={(e) => setFriendSearchQuery(e.target.value)}
                  placeholder="Enter 7-digit UID..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  arenaAudio.playClick();
                  handleCopyUid();
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-slate-950 font-mono text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
                title="Copy your UID to share with friends"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share My UID</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[380px] overflow-y-auto pr-1">
            {friendsList
              .filter(
                (f) =>
                  f.name.toLowerCase().includes(friendSearchQuery.toLowerCase()) ||
                  f.uid.includes(friendSearchQuery)
              )
              .map((friend) => (
                <div
                  key={friend.uid}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-cyan-500/40 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl relative">
                      {friend.avatarEmoji}
                      <span
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${
                          friend.status === 'online'
                            ? 'bg-emerald-400'
                            : friend.status === 'in_match'
                            ? 'bg-amber-400'
                            : 'bg-slate-600'
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm">
                          {friend.name}
                        </span>
                        <span className="text-[10px] font-mono text-amber-400 px-1.5 py-0.2 rounded bg-amber-500/10">
                          UID: {friend.uid}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate max-w-[180px]">
                        {friend.college}
                      </p>
                      {friend.currentMode && (
                        <p className="text-[11px] font-mono text-cyan-400 mt-0.5">
                          {friend.currentMode}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      arenaAudio.playClick();
                      onStartMatch('ranked', 'web_dev');
                    }}
                    disabled={friend.status === 'offline'}
                    className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                      friend.status === 'online'
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                        : friend.status === 'in_match'
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    {friend.status === 'online'
                      ? 'Duel ⚔️'
                      : friend.status === 'in_match'
                      ? 'Spectate 👁️'
                      : 'Offline'}
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          CUSTOM ROOMS TAB OVERLAY
         ========================================================================= */}
      {activeTab === 'rooms' && (
        <div className="relative z-20 mx-auto w-full max-w-4xl p-6 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-[0_0_80px_rgba(0,0,0,0.9)] backdrop-blur-2xl space-y-6 animate-fadeIn pointer-events-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-white font-mono uppercase tracking-wide">
                Collegiate Battle Rooms
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Join a live room code or host a private 1v1 battle for your campus peers.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                arenaAudio.playClick();
                onCreateRoom('web_dev');
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 font-mono text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Custom Room</span>
            </button>
          </div>

          {isLoadingRooms ? (
            <div className="py-14 flex flex-col items-center justify-center font-mono text-xs text-amber-400 gap-2">
              <span className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span>SCANNING INTER-COLLEGE ROOMS...</span>
            </div>
          ) : activeRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
              {activeRooms.map((room) => (
                <div
                  key={room.code}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-400 text-sm">
                        {room.code}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 uppercase">
                        {room.arena || 'Web Dev'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">Host: {room.hostName}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onJoinRoom(room.code)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white font-mono text-xs font-bold transition-all cursor-pointer"
                  >
                    Join Room
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
                <Swords className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white font-mono">
                No Active Public Rooms Open Right Now
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Be the first to create a custom room, or enter a private room code below.
              </p>
            </div>
          )}

          {/* Join Code Input Form */}
          <form
            onSubmit={handleJoinWithCode}
            className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Join via Match Code
                </p>
                <p className="text-[11px] text-slate-400">
                  Enter 4-digit code (e.g. KBX-4634)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={joinRoomInput}
                onChange={(e) => setJoinRoomInput(e.target.value.toUpperCase())}
                placeholder="KBX-4634"
                maxLength={16}
                className="w-full sm:w-40 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-amber-400 placeholder-slate-600 uppercase tracking-widest focus:outline-none focus:border-amber-500/60"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0"
              >
                Join
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          BOTTOM BAR: FREE FIRE / BGMI TACTICAL LAUNCH BAR
          - Left: Collegiate Rank & Peak Info Pill
          - Right: Mode Selector Card + [ 👥 INVITE ] + Giant Glowing [ 🚀 START MATCH ]
         ========================================================================= */}
      <footer className="relative z-30 w-full flex items-end justify-between px-8 pb-7 pt-4 pointer-events-none">
        {/* Left Bottom Status: Clean Season Rank Info */}
        <div className="hidden sm:inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-950/85 border border-slate-800/90 text-xs font-mono text-slate-300 backdrop-blur-xl shadow-lg pointer-events-auto">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>RANK: <strong className="text-amber-300">{profile.rankTitle}</strong></span>
          <span className="text-slate-600">|</span>
          <span>CAMPUS: <strong className="text-cyan-400">{profile.college}</strong></span>
        </div>

        {/* BOTTOM RIGHT: FREE FIRE MATCH SELECTOR & START MATCH LAUNCHER */}
        <div className="ml-auto flex items-center gap-3 pointer-events-auto">
          {/* Mode Selector Card */}
          <div
            onClick={() => {
              arenaAudio.playClick();
              setIsModeModalOpen(true);
            }}
            onMouseEnter={() => arenaAudio.playHover()}
            className="hidden sm:flex items-center gap-3.5 p-3 pr-5 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-amber-500/50 shadow-[0_8px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl cursor-pointer transition-all group"
            title="Click to Switch Game Mode"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <ActiveModeIcon className="w-6 h-6" />
            </div>
            <div className="text-left font-mono">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white uppercase tracking-wider group-hover:text-amber-300">
                  {activeMode.title}
                </span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${activeMode.badgeColor}`}>
                  {activeMode.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {activeMode.subtitle} • Change Mode ▾
              </p>
            </div>
          </div>

          {/* Quick Squad Invite Button */}
          <button
            type="button"
            onClick={() => {
              arenaAudio.playClick();
              setActiveTab('friends');
            }}
            onMouseEnter={() => arenaAudio.playHover()}
            title="Invite Squad Teammate"
            className="hidden md:flex items-center gap-2 px-4 py-4 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 font-mono text-xs font-bold backdrop-blur-xl transition-all cursor-pointer shadow-lg"
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>INVITE</span>
          </button>

          {/* GIANT GLOWING "START MATCH" BUTTON (FREE FIRE STYLE) */}
          <button
            type="button"
            onClick={handleStartGame}
            disabled={isSearchingMatch}
            onMouseEnter={() => arenaAudio.playHover()}
            className="relative px-10 py-4 sm:px-14 sm:py-5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:brightness-110 active:scale-95 text-slate-950 font-black font-mono text-base sm:text-xl uppercase tracking-widest shadow-[0_0_60px_rgba(245,158,11,0.6)] border-2 border-amber-300/70 flex items-center justify-center gap-3.5 cursor-pointer transition-all duration-200 group overflow-hidden"
          >
            {/* Background Radar Scanner Pulse */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:animate-shimmer" />

            {isSearchingMatch ? (
              <>
                <span className="w-5 h-5 border-3 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>MATCHING ({queueTimer}s)...</span>
              </>
            ) : (
              <>
                <Swords className="w-6 h-6 transition-transform group-hover:rotate-12" />
                <span>START MATCH</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1.5" />
              </>
            )}
          </button>
        </div>
      </footer>

      {/* =========================================================================
          GAME MODE SELECTOR MODAL
         ========================================================================= */}
      {isModeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fadeIn">
          <div className="w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-slate-900 border border-amber-500/40 shadow-[0_0_80px_rgba(245,158,11,0.2)] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
                  BATTLE ARENA // PROTOCOL SELECTOR
                </span>
                <h3 className="text-2xl font-black text-white font-mono uppercase">
                  Select Game Mode
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModeModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {GAME_MODES.map((mode, idx) => {
                const ModeIcon = mode.icon;
                const isSelected = selectedModeIdx === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      arenaAudio.playClick();
                      setSelectedModeIdx(idx);
                      setIsModeModalOpen(false);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.3)]'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400">
                          <ModeIcon className="w-5 h-5" />
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${mode.badgeColor}`}>
                          {mode.badge}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-white font-mono uppercase">
                        {mode.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {mode.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">{mode.subtitle}</span>
                      {isSelected ? (
                        <span className="text-amber-400 font-bold">EQUIPPED ✓</span>
                      ) : (
                        <span className="text-slate-500 hover:text-white">SELECT ➔</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          LEFT RAIL MODALS (STORE, ARSENAL, RANKINGS, VAULT)
         ========================================================================= */}
      {activeLeftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fadeIn">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-[0_0_80px_rgba(0,212,255,0.25)] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                  COLLEGIATE COMBAT RIG
                </span>
                <h3 className="text-2xl font-black text-white font-mono uppercase">
                  {activeLeftModal === 'store' && '🛒 Tactical Store'}
                  {activeLeftModal === 'arsenal' && '⚔️ Tech Arsenal'}
                  {activeLeftModal === 'leaderboard' && '🏆 National Rankings'}
                  {activeLeftModal === 'vault' && '📦 Trophies & Vault'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveLeftModal(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Store Content */}
            {activeLeftModal === 'store' && (
              <div className="space-y-3 font-mono text-xs">
                <p className="text-slate-300">
                  Unlock customized Battle Laptop chassis finishes, CRT phosphor themes, and mechanical soundpacks with your collegiate battle tokens.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                    <p className="font-bold text-amber-400">Cyber Gold Chassis</p>
                    <p className="text-[11px] text-slate-400 mt-1">2,500 Tokens</p>
                    <span className="mt-2 inline-block px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                      LOCKED
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                    <p className="font-bold text-cyan-400">Neon Matrix CRT</p>
                    <p className="text-[11px] text-slate-400 mt-1">1,800 Tokens</p>
                    <span className="mt-2 inline-block px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px]">
                      LOCKED
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Arsenal Content */}
            {activeLeftModal === 'arsenal' && (
              <div className="space-y-3 font-mono text-xs">
                <p className="text-slate-300">
                  Select your primary programming language and compiler runtime for 1v1 battle duels.
                </p>
                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  {['TypeScript', 'Python 3', 'C++ 20', 'Java 21', 'Rust', 'Go'].map((lang, idx) => (
                    <div
                      key={lang}
                      className={`p-3 rounded-xl border text-center font-bold cursor-pointer ${
                        idx === 0
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {lang}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rankings Content */}
            {activeLeftModal === 'leaderboard' && (
              <div className="space-y-2.5 font-mono text-xs">
                <p className="text-slate-300">
                  National Collegiate Leaderboard — Season 01
                </p>
                {[
                  { rank: 1, name: 'Kavya_R', college: 'IIT Bombay', elo: 2450 },
                  { rank: 2, name: 'Siddharth_N', college: 'BITS Pilani', elo: 2380 },
                  { rank: 3, name: 'GoyalMayank142', college: 'S-VYASA University', elo: 1840 },
                ].map((item) => (
                  <div
                    key={item.rank}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-amber-400 font-bold">#{item.rank}</span>
                      <div>
                        <p className="font-bold text-white">{item.name}</p>
                        <p className="text-[10px] text-slate-500">{item.college}</p>
                      </div>
                    </div>
                    <span className="text-cyan-400 font-bold">{item.elo} ELO</span>
                  </div>
                ))}
              </div>
            )}

            {/* Vault Content */}
            {activeLeftModal === 'vault' && (
              <div className="space-y-3 font-mono text-xs">
                <p className="text-slate-300">
                  Your collegiate battle trophies and hackathon verification stamps.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <p className="font-bold text-white">Gold Division I</p>
                      <p className="text-[10px] text-slate-500">Season 01 Stamp</p>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <p className="font-bold text-white">5-Win Streak</p>
                      <p className="text-[10px] text-slate-500">Collegiate Duel</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          FIRST-TIME BATTLE IDENTITY SETUP MODAL
         ========================================================================= */}
      {isSetupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fadeIn">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-[0_0_80px_rgba(0,212,255,0.25)] space-y-6">
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-bold uppercase tracking-widest">
                <Sparkles className="w-3 h-3" />
                <span>FORGE BATTLE IDENTITY</span>
              </div>
              <h3 className="text-2xl font-black text-white font-mono uppercase tracking-tight">
                Customize Your Battle Profile
              </h3>
              <p className="text-xs text-slate-400">
                Your Gamer Tag and UID will appear on the 3D Battle Laptop and on the national leaderboard.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                Gamer Tag (Battle Name)
              </label>
              <input
                type="text"
                value={tempGamerTag}
                onChange={(e) => setTempGamerTag(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                maxLength={16}
                placeholder="e.g. ShadowCoder"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/70"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-mono text-slate-400 uppercase">Your Permanent Gamer UID</p>
                <p className="text-base font-black font-mono text-amber-400 mt-0.5">
                  UID: {profile.uid}
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase">
                MINTED
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                Select Battle Avatar
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      arenaAudio.playClick();
                      setTempAvatarIdx(av.id);
                    }}
                    className={`p-3 rounded-2xl bg-slate-950 border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      tempAvatarIdx === av.id
                        ? 'border-cyan-400 shadow-[0_0_15px_rgba(0,212,255,0.4)] scale-105'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-2xl">{av.emoji}</span>
                    <span className="text-[10px] font-mono text-slate-400 truncate w-full text-center">
                      {av.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsSetupModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 font-mono text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                Save &amp; Enter Lobby
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}