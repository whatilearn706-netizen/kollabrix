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
  // Navigation Tabs: Home, Friends, Rooms
  const [activeTab, setActiveTab] = useState<'home' | 'friends' | 'rooms'>('home');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);

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
    onStartMatch('ranked', 'web_dev');
  };

  const handleJoinWithCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!joinRoomInput.trim()) return;
    arenaAudio.playClick();
    onJoinRoom(joinRoomInput.trim().toUpperCase());
  };

  if (!profile) return null;

  const currentAvatar = AVATAR_OPTIONS[profile.avatarIdx] || AVATAR_OPTIONS[0];

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-[#020409] text-slate-100 overflow-hidden select-none font-sans flex flex-col justify-between">
      {/* Background Cyber Game Backdrop with Ambient Space Nebula */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/20 via-[#030611] to-[#010206] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00d4ff05_1px,transparent_1px),linear-gradient(to_bottom,#00d4ff05_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      {/* Ambient Cyber Highlights */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* =========================================================================
          FULL-SCREEN 3D STAGE: FLOATING BATTLE LAPTOP OVER GLOWING DISC (IMAGE 2)
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
          TOP BAR (FREE FIRE / BGMI HUD ANCHORS)
          - Top-Left: Player Profile Badge (Avatar, Gamer Tag, 7-digit UID, Level)
          - Top-Center: 3 Big Game Tabs [ 🏠 HOME | 👥 FRIENDS | ⚔️ ROOMS ]
          - Top-Right: Sound Toggle (🔊/🔇) & Exit Arena Button
         ========================================================================= */}
      <header className="relative z-30 w-full flex items-center justify-between px-6 pt-5 pb-2 pointer-events-none">
        {/* TOP LEFT: GAMER PROFILE BADGE */}
        <div className="flex items-center gap-3.5 p-2 pr-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl pointer-events-auto">
          <div
            onClick={() => {
              setTempGamerTag(profile.gamerTag);
              setTempAvatarIdx(profile.avatarIdx);
              setIsSetupModalOpen(true);
            }}
            className="relative cursor-pointer group"
            title="Edit Battle Identity"
          >
            <div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${currentAvatar.bg} p-0.5 shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-transform duration-200 group-hover:scale-105`}
            >
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-2xl">
                {currentAvatar.emoji}
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-900 border border-cyan-400/80 flex items-center justify-center text-[9px] text-cyan-300 group-hover:text-white">
              <Edit3 className="w-2.5 h-2.5" />
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black text-base text-white tracking-wide font-mono uppercase">
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
                title="Click to copy your unique Gamer UID"
              >
                <span>UID: {profile.uid}</span>
                {copiedUid ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 opacity-70" />
                )}
              </button>
              <span className="text-xs text-slate-400 font-mono hidden md:inline">
                • {profile.college}
              </span>
            </div>
          </div>
        </div>

        {/* TOP CENTER: 3 GAME TABS [ HOME | FRIENDS | ROOMS ] */}
        <nav className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950/85 border border-slate-800/90 shadow-[0_8px_30px_rgba(0,0,0,0.7)] backdrop-blur-xl pointer-events-auto">
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
            <span>Home</span>
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
            <span>Friends</span>
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
            <span>Rooms</span>
          </button>
        </nav>

        {/* TOP RIGHT: SOUND SFX & EXIT ARENA */}
        <div className="flex items-center gap-2.5 pointer-events-auto">
          <button
            type="button"
            onClick={handleToggleAudio}
            title={isAudioMuted ? 'Unmute Audio SFX' : 'Mute Audio SFX'}
            className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-colors backdrop-blur-md cursor-pointer shadow-sm"
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

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
          CENTER SUB-VIEW: FRIENDS MODAL OVERLAY (WHEN FRIENDS TAB IS ACTIVE)
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
                  !friendSearchQuery ||
                  f.uid.includes(friendSearchQuery) ||
                  f.name.toLowerCase().includes(friendSearchQuery.toLowerCase())
              )
              .map((friend) => (
                <div
                  key={friend.uid}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl shadow-inner">
                        {friend.avatarEmoji}
                      </div>
                      <span
                        className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
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
                        <span className="font-bold text-sm text-white font-mono">
                          {friend.name}
                        </span>
                        <span className="text-[11px] font-mono text-amber-400/90">
                          #{friend.uid}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                        {friend.status === 'in_match' ? friend.currentMode : friend.college}
                      </p>
                    </div>
                  </div>

                  <div>
                    {friend.status === 'online' && (
                      <button
                        type="button"
                        onClick={() => {
                          arenaAudio.playClick();
                          onCreateRoom('web_dev');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-mono text-xs font-bold hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Swords className="w-3.5 h-3.5" />
                        <span>Challenge</span>
                      </button>
                    )}
                    {friend.status === 'in_match' && (
                      <button
                        type="button"
                        onClick={() => {
                          arenaAudio.playClick();
                          setActiveTab('rooms');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-cyan-300 border border-cyan-500/30 font-mono text-xs font-bold hover:bg-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Spectate</span>
                      </button>
                    )}
                    {friend.status === 'offline' && (
                      <span className="text-xs font-mono text-slate-500">Offline</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          CENTER SUB-VIEW: CUSTOM ROOMS MODAL OVERLAY (WHEN ROOMS TAB IS ACTIVE)
         ========================================================================= */}
      {activeTab === 'rooms' && (
        <div className="relative z-20 mx-auto w-full max-w-4xl p-6 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-[0_0_80px_rgba(0,0,0,0.9)] backdrop-blur-2xl space-y-6 animate-fadeIn pointer-events-auto">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-white font-mono uppercase tracking-wide">
                Active Custom Battle Rooms
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Browse ongoing collegiate duels or create a private room with custom rules for your campus.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onCreateRoom('web_dev')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-mono text-xs font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
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
          BOTTOM BAR: CLEAN VIEWPORT WITH BIG FREE FIRE STYLE "START MATCH" BUTTON
          (As marked on Image 1: Bottom-left pills removed! Only Start Match on right!)
         ========================================================================= */}
      <footer className="relative z-30 w-full flex items-center justify-between px-8 pb-8 pt-4 pointer-events-none">
        {/* Left Bottom Status: Clean Season Rank Info */}
        <div className="hidden sm:inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-slate-800/90 text-xs font-mono text-slate-300 backdrop-blur-xl shadow-lg pointer-events-auto">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>RANK: <strong className="text-amber-300">{profile.rankTitle}</strong></span>
          <span className="text-slate-600">|</span>
          <span>CAMPUS: <strong className="text-cyan-400">{profile.college}</strong></span>
        </div>

        {/* BOTTOM RIGHT: GIANT GLOWING "START MATCH" BUTTON (FREE FIRE STYLE) */}
        <div className="ml-auto pointer-events-auto">
          <button
            type="button"
            onClick={handleStartGame}
            onMouseEnter={() => arenaAudio.playHover()}
            className="relative px-10 py-4 sm:px-12 sm:py-4.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:brightness-110 active:scale-95 text-slate-950 font-black font-mono text-base sm:text-lg uppercase tracking-widest shadow-[0_0_50px_rgba(245,158,11,0.55)] border-2 border-amber-300/60 flex items-center justify-center gap-3.5 cursor-pointer transition-all duration-200 group"
          >
            <Swords className="w-6 h-6 transition-transform group-hover:rotate-12" />
            <span>START MATCH</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1.5" />
          </button>
        </div>
      </footer>

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
