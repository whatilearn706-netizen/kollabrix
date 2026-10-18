'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Project, ProjectMember } from '@/types/database';
import { Button } from '@/components/ui/Button';
import {
  Headphones,
  Mic,
  MicOff,
  Radio,
  FileEdit,
  Send,
  Flame,
  Rocket,
  Lightbulb,
  Heart,
  Volume2,
  VolumeX,
  Monitor,
  Users,
  Copy,
  Check,
  Download,
  Trash2,
  Sparkles,
  Clock,
  CheckCircle2,
  RefreshCw,
  Activity,
  Wifi,
  PhoneCall,
  Volume1,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { recordDailyStreakActivity } from '@/components/gamification/DailyStreakHub';

interface WorkspaceTeamHuddleProps {
  project: Project;
  members: ProjectMember[];
  currentUserId?: string;
  currentUserProfile?: any;
}

interface StandupPost {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  shipped: string;
  nextUp: string;
  blockers?: string;
  timestamp: string;
  reactions: {
    fire: number;
    rocket: number;
    bulb: number;
    heart: number;
  };
}

interface PeerSpeakingState {
  isSpeaking: boolean;
  volume: number;
  isMuted?: boolean;
  lastUpdated: number;
}

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
    { urls: 'stun:global.stun.twilio.com:3478' },
  ],
  iceCandidatePoolSize: 10,
};

export function WorkspaceTeamHuddle({
  project,
  members,
  currentUserId = 'current-user',
  currentUserProfile,
}: WorkspaceTeamHuddleProps) {
  const [activeTab, setActiveTab] = useState<'scratchpad' | 'standup' | 'audio'>('scratchpad');

  // Scratchpad State
  const [scratchpadText, setScratchpadText] = useState('');
  const [lastSavedTime, setLastSavedTime] = useState<string>('Syncing with team...');
  const [copiedNotes, setCopiedNotes] = useState(false);
  const [isRemoteTyping, setIsRemoteTyping] = useState<string | null>(null);
  const debounceSaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Standup State
  const [standups, setStandups] = useState<StandupPost[]>([]);
  const [newShipped, setNewShipped] = useState('');
  const [newNextUp, setNewNextUp] = useState('');
  const [newBlockers, setNewBlockers] = useState('');
  const [isSubmittingStandup, setIsSubmittingStandup] = useState(false);

  // Audio Huddle State
  const [isInHuddle, setIsInHuddle] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [realAudioVolume, setRealAudioVolume] = useState<number>(0);
  const [isEchoLoopback, setIsEchoLoopback] = useState(false);
  const [isLofiPlaying, setIsLofiPlaying] = useState(false);
  const [huddlePresenceUsers, setHuddlePresenceUsers] = useState<any[]>([]);
  const [remoteSpeakingMap, setRemoteSpeakingMap] = useState<Record<string, PeerSpeakingState>>({});

  // Audio Context & WebRTC Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const loopbackGainRef = useRef<GainNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // WebRTC Peer Connections & ICE Candidates Queue
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const pendingIceCandidatesRef = useRef<Map<string, any[]>>(new Map());
  const lastSpeakingBroadcastRef = useRef<number>(0);
  const isSpeakingRef = useRef<boolean>(false);
  const isMutedRef = useRef<boolean>(false);
  isMutedRef.current = isMuted;
  const isInHuddleRef = useRef<boolean>(false);
  isInHuddleRef.current = isInHuddle;
  const channelRef = useRef<any>(null);

  const activeUserName =
    currentUserProfile?.display_name ||
    currentUserProfile?.username ||
    'You (Lead)';

  // Helper to attach incoming remote WebRTC audio stream to DOM & Web Audio Destination
  const attachRemoteAudio = (peerId: string, stream: MediaStream) => {
    // 1. Direct Web Audio Destination: bypasses DOM autoplay policies completely
    try {
      if (audioContextRef.current && audioContextRef.current.state === 'running') {
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(audioContextRef.current.destination);
      }
    } catch (e) {
      console.warn('Web Audio direct stream error:', e);
    }

    // 2. Fallback DOM Audio Element with autoplay failure recovery
    let audioEl = document.getElementById(`remote-audio-${peerId}`) as HTMLAudioElement;
    if (!audioEl) {
      audioEl = document.createElement('audio');
      audioEl.id = `remote-audio-${peerId}`;
      audioEl.autoplay = true;
      audioEl.setAttribute('playsinline', 'true');
      audioEl.muted = false;
      audioEl.volume = 1.0;
      document.body.appendChild(audioEl);
    }
    audioEl.srcObject = stream;
    const playPromise = audioEl.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Remote audio autoplay waiting for user interaction:', err);
        const unlock = () => {
          audioEl.play().catch(() => {});
          if (audioContextRef.current?.state === 'suspended') {
            audioContextRef.current.resume().catch(() => {});
          }
          window.removeEventListener('click', unlock);
          window.removeEventListener('keydown', unlock);
        };
        window.addEventListener('click', unlock, { once: true });
        window.addEventListener('keydown', unlock, { once: true });
      });
    }
  };

  // Helper to cleanup all peer connections when leaving
  const cleanupAllPeerConnections = () => {
    peerConnectionsRef.current.forEach((pc) => {
      try {
        pc.close();
      } catch {}
    });
    peerConnectionsRef.current.clear();

    // Remove remote audio elements
    document.querySelectorAll('[id^="remote-audio-"]').forEach((el) => el.remove());
  };

  // Create an RTCPeerConnection for a remote peer
  const createPeerConnection = (peerId: string, channel: any): RTCPeerConnection => {
    // If existing connection exists, close it first
    const existing = peerConnectionsRef.current.get(peerId);
    if (existing) {
      try { existing.close(); } catch {}
    }

    const pc = new RTCPeerConnection(RTC_CONFIG);
    peerConnectionsRef.current.set(peerId, pc);

    // Add local mic audio tracks
    if (micStreamRef.current) {
      micStreamRef.current.getAudioTracks().forEach((track) => {
        pc.addTrack(track, micStreamRef.current!);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        channel.send({
          type: 'broadcast',
          event: 'webrtc-signal-ice',
          payload: { candidate: event.candidate, to: peerId, from: currentUserId },
        });
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        attachRemoteAudio(peerId, event.streams[0]);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        peerConnectionsRef.current.delete(peerId);
        const el = document.getElementById(`remote-audio-${peerId}`);
        if (el) el.remove();
      }
    };

    return pc;
  };

  // Initial load from Supabase DB & setup Realtime channel
  useEffect(() => {
    let isMounted = true;

    async function loadRemoteHuddleData() {
      try {
        const res = await fetch(`/api/workspace/data?projectId=${project.id}`);
        const result = await res.json();

        if (isMounted && result?.data) {
          if (result.data.scratchpadText) {
            setScratchpadText(result.data.scratchpadText);
            setLastSavedTime(
              result.updatedAt
                ? new Date(result.updatedAt).toLocaleTimeString()
                : 'Synced from cloud'
            );
          }
          if (Array.isArray(result.data.standups) && result.data.standups.length > 0) {
            setStandups(result.data.standups);
            return;
          }
        }
      } catch (err) {}

      // Fallback initial starter data if nothing in DB yet
      if (isMounted) {
        setScratchpadText((prev) => {
          if (prev) return prev;
          return `# ${project.title} — Real-Time Team Scratchpad\n\n## 🎯 Sprint Focus (Today)\n- Finalize database schema & verify Next.js edge routes.\n- Polish landing page demo viewport for hackathon submission.\n\n## 🔑 Shared Environment Variables\nNEXT_PUBLIC_APP_ENV=development\nNEXT_PUBLIC_ENABLE_HUDDLE=true\n\n## 📝 Questions & Brainstorming\n- Need to verify if we want 2-min or 3-min pitch slides.\n`;
        });

        setStandups((prev) => {
          if (prev.length > 0) return prev;
          return [
            {
              id: 'st-1',
              userId: project.owner_id,
              userName: project.owner?.display_name || project.owner?.username || 'Project Lead',
              userRole: 'Project Lead',
              shipped: 'Set up Supabase tables, RLS policies, and GitHub repository.',
              nextUp: 'Coordinate pitch deck generator and audio sync test with the team.',
              blockers: 'None so far, team velocity is high!',
              timestamp: 'Today at 02:30 AM',
              reactions: { fire: 6, rocket: 5, bulb: 3, heart: 4 },
            },
            ...(members.length > 1
              ? [
                  {
                    id: 'st-2',
                    userId: members[1]?.user_id || 'mem-2',
                    userName: members[1]?.profile?.display_name || 'Frontend Engineer',
                    userRole: members[1]?.role || 'Frontend Developer',
                    shipped: 'Built responsive mobile viewports and connected Figma prototype bridge.',
                    nextUp: 'Testing proof-of-work certificate printable view.',
                    blockers: 'Waiting on final brand typography.',
                    timestamp: 'Today at 03:15 AM',
                    reactions: { fire: 4, rocket: 3, bulb: 2, heart: 5 },
                  },
                ]
              : []),
          ];
        });
      }
    }

    loadRemoteHuddleData();

    // Setup Supabase Realtime channel for live collaborative sync & presence
    const channel = supabase.channel(`workspace-huddle-${project.id}`, {
      config: { broadcast: { self: false }, presence: { key: currentUserId } },
    });
    channelRef.current = channel;

    // Listen for peer scratchpad edits
    channel.on('broadcast', { event: 'scratchpad-sync' }, (payload: any) => {
      if (typeof payload?.payload?.text === 'string' && isMounted) {
        setScratchpadText(payload.payload.text);
        setIsRemoteTyping(payload.payload.author || 'Teammate');
        setTimeout(() => setIsRemoteTyping(null), 1800);
        setLastSavedTime('Live update received');
      }
    });

    // Listen for new standup posts
    channel.on('broadcast', { event: 'standup-sync' }, (payload: any) => {
      if (Array.isArray(payload?.payload?.standups) && isMounted) {
        setStandups(payload.payload.standups);
      }
    });

    // Listen for peer speaking volume updates (SOLVES: "not showing to friend that I am talking")
    channel.on('broadcast', { event: 'huddle-peer-speaking' }, (payload: any) => {
      if (payload?.payload?.userId && isMounted) {
        setRemoteSpeakingMap((prev) => ({
          ...prev,
          [payload.payload.userId]: {
            isSpeaking: Boolean(payload.payload.isSpeaking),
            volume: payload.payload.volume || 0,
            isMuted: Boolean(payload.payload.isMuted),
            lastUpdated: Date.now(),
          },
        }));
      }
    });

    // Listen for peer mute updates
    channel.on('broadcast', { event: 'huddle-peer-mute' }, (payload: any) => {
      if (payload?.payload?.userId && isMounted) {
        setRemoteSpeakingMap((prev) => ({
          ...prev,
          [payload.payload.userId]: {
            ...(prev[payload.payload.userId] || { volume: 0, lastUpdated: Date.now() }),
            isSpeaking: false,
            isMuted: Boolean(payload.payload.isMuted),
          },
        }));
      }
    });

    // =========================================================================
    // WEBRTC SIGNALING HANDLERS (SOLVES: "audio is not working like I talk to my friend")
    // =========================================================================
    // 1. Peer joined audio room -> existing peers in huddle initiate WebRTC Offer
    channel.on('broadcast', { event: 'webrtc-peer-joined' }, async (payload: any) => {
      const remotePeerId = payload?.payload?.peerId;
      if (!remotePeerId || remotePeerId === currentUserId) return;

      // Only peers actively inside the voice call initiate WebRTC Offer
      if (isMounted && isInHuddleRef.current && micStreamRef.current) {
        try {
          const pc = createPeerConnection(remotePeerId, channel);
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
          });
          await pc.setLocalDescription(offer);

          channel.send({
            type: 'broadcast',
            event: 'webrtc-signal-offer',
            payload: { sdp: offer, to: remotePeerId, from: currentUserId, fromName: activeUserName },
          });
        } catch (err) {
          console.warn('WebRTC offer error:', err);
        }
      }
    });

    // Helper to flush queued ICE candidates once remote description is set
    const flushQueuedIceCandidates = async (peerId: string, pc: RTCPeerConnection) => {
      const queued = pendingIceCandidatesRef.current.get(peerId);
      if (queued && queued.length > 0) {
        for (const candidate of queued) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {}
        }
        pendingIceCandidatesRef.current.delete(peerId);
      }
    };

    // 2. Incoming Offer -> create Answer and reply
    channel.on('broadcast', { event: 'webrtc-signal-offer' }, async (payload: any) => {
      const { sdp, to, from } = payload?.payload || {};
      if (to !== currentUserId || !from || !sdp) return;

      try {
        const pc = createPeerConnection(from, channel);
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        await flushQueuedIceCandidates(from, pc);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        channel.send({
          type: 'broadcast',
          event: 'webrtc-signal-answer',
          payload: { sdp: answer, to: from, from: currentUserId },
        });
      } catch (err) {
        console.warn('WebRTC answer error:', err);
      }
    });

    // 3. Incoming Answer -> finalize connection
    channel.on('broadcast', { event: 'webrtc-signal-answer' }, async (payload: any) => {
      const { sdp, to, from } = payload?.payload || {};
      if (to !== currentUserId || !from || !sdp) return;

      try {
        const pc = peerConnectionsRef.current.get(from);
        if (pc && pc.signalingState !== 'stable') {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          await flushQueuedIceCandidates(from, pc);
        }
      } catch (err) {
        console.warn('WebRTC setRemoteDescription answer error:', err);
      }
    });

    // 4. Incoming ICE Candidate (with buffer queue)
    channel.on('broadcast', { event: 'webrtc-signal-ice' }, async (payload: any) => {
      const { candidate, to, from } = payload?.payload || {};
      if (to !== currentUserId || !from || !candidate) return;

      const pc = peerConnectionsRef.current.get(from);
      if (pc && pc.remoteDescription && pc.remoteDescription.type) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {}
      } else {
        if (!pendingIceCandidatesRef.current.has(from)) {
          pendingIceCandidatesRef.current.set(from, []);
        }
        pendingIceCandidatesRef.current.get(from)!.push(candidate);
      }
    });

    // 5. Presence sync for active speakers in huddle
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const activeUsers: any[] = [];
        Object.values(state).forEach((pres: any) => {
          if (Array.isArray(pres)) {
            pres.forEach((p) => {
              if (p?.inHuddle) activeUsers.push(p);
            });
          }
        });
        if (isMounted) setHuddlePresenceUsers(activeUsers);
      })
      .subscribe();

    return () => {
      isMounted = false;
      if (debounceSaveTimer.current) clearTimeout(debounceSaveTimer.current);
      cleanupAllPeerConnections();
      supabase.removeChannel(channel);
    };
  }, [project.id, currentUserId, members, project.owner_id, project.owner, project.title, activeUserName]);

  // Collaborative Scratchpad Change with Realtime Broadcast & DB Persistence
  const handleScratchpadChange = (newText: string) => {
    setScratchpadText(newText);
    setLastSavedTime('Saving to cloud...');

    // 1. Broadcast immediately to peers over WebSocket
    const channel = channelRef.current || supabase.channel(`workspace-huddle-${project.id}`);
    channel.send({
      type: 'broadcast',
      event: 'scratchpad-sync',
      payload: { text: newText, author: activeUserName },
    });

    // 2. Debounce database upsert (every 1s)
    if (debounceSaveTimer.current) clearTimeout(debounceSaveTimer.current);
    debounceSaveTimer.current = setTimeout(async () => {
      try {
        await fetch('/api/workspace/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: project.id,
            data: {
              scratchpadText: newText,
              standups,
            },
          }),
        });
        setLastSavedTime(new Date().toLocaleTimeString());
      } catch (err) {
        setLastSavedTime('Saved locally');
      }
    }, 1000);
  };

  const insertTemplate = (template: string) => {
    const updated = scratchpadText + '\n\n' + template;
    handleScratchpadChange(updated);
  };

  const handleCopyNotes = () => {
    navigator.clipboard.writeText(scratchpadText);
    setCopiedNotes(true);
    setTimeout(() => setCopiedNotes(false), 2000);
  };

  const handleDownloadNotes = () => {
    const element = document.createElement('a');
    const file = new Blob([scratchpadText], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-notes.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Submit Standup & Sync
  const handlePostStandup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShipped.trim() || !newNextUp.trim()) return;

    setIsSubmittingStandup(true);

    const newPost: StandupPost = {
      id: `st-${Date.now()}`,
      userId: currentUserId,
      userName: activeUserName,
      userRole: currentUserProfile?.role === 'admin' ? 'Project Lead' : 'Builder',
      shipped: newShipped.trim(),
      nextUp: newNextUp.trim(),
      blockers: newBlockers.trim() || undefined,
      timestamp: 'Just now',
      reactions: { fire: 1, rocket: 1, bulb: 0, heart: 1 },
    };

    const updated = [newPost, ...standups];
    setStandups(updated);

    // Save to DB
    try {
      await fetch('/api/workspace/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          data: {
            scratchpadText,
            standups: updated,
          },
        }),
      });

      // Broadcast to teammates
      const channel = channelRef.current || supabase.channel(`workspace-huddle-${project.id}`);
      channel.send({
        type: 'broadcast',
        event: 'standup-sync',
        payload: { standups: updated },
      });
    } catch {}

    try {
      recordDailyStreakActivity({
        type: 'WORKSPACE_ACTIVITY',
        note: `Shared daily standup sync for ${project.title}`,
        title: project.title,
        userId: currentUserId,
      });
    } catch {}

    setNewShipped('');
    setNewNextUp('');
    setNewBlockers('');
    setIsSubmittingStandup(false);
  };

  const handleReaction = async (postIndex: number, type: 'fire' | 'rocket' | 'bulb' | 'heart') => {
    const updated = [...standups];
    updated[postIndex].reactions[type] += 1;
    setStandups(updated);

    try {
      await fetch('/api/workspace/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          data: {
            scratchpadText,
            standups: updated,
          },
        }),
      });

      const channel = channelRef.current || supabase.channel(`workspace-huddle-${project.id}`);
      channel.send({
        type: 'broadcast',
        event: 'standup-sync',
        payload: { standups: updated },
      });
    } catch {}
  };

  // =========================================================================
  // AUDIO HUDDLE: JOIN / LEAVE / WEBRTC / MICROPHONE LEVEL SENSING
  // =========================================================================
  const handleToggleHuddle = async () => {
    const nextState = !isInHuddle;
    setIsInHuddle(nextState);
    isInHuddleRef.current = nextState;

    const channel = channelRef.current || supabase.channel(`workspace-huddle-${project.id}`);

    if (nextState) {
      // 1. Announce presence to Supabase
      channel.track({
        userId: currentUserId,
        userName: activeUserName,
        role: 'Teammate',
        inHuddle: true,
        isMuted: false,
      });

      // 2. Request microphone stream
      try {
        if (navigator?.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
          micStreamRef.current = stream;

          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioCtx();
          if (ctx.state === 'suspended') {
            await ctx.resume().catch(() => {});
          }
          audioContextRef.current = ctx;

          const source = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          micAnalyserRef.current = analyser;

          // Mic Loopback gain (initially muted to prevent feedback loop)
          const loopbackGain = ctx.createGain();
          loopbackGain.gain.setValueAtTime(0, ctx.currentTime);
          source.connect(loopbackGain);
          loopbackGain.connect(ctx.destination);
          loopbackGainRef.current = loopbackGain;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);

          const updateVolume = () => {
            if (!analyser || isMutedRef.current) {
              setRealAudioVolume(0);
              if (isSpeakingRef.current) {
                isSpeakingRef.current = false;
                setIsSpeaking(false);
                channel.send({
                  type: 'broadcast',
                  event: 'huddle-peer-speaking',
                  payload: { userId: currentUserId, isSpeaking: false, volume: 0 },
                });
              }
            } else {
              analyser.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const avg = sum / dataArray.length;
              const vol = Math.min(100, Math.round(avg * 1.5));
              setRealAudioVolume(vol);

              // Speaking threshold: avg > 12 (sensitive enough for whisper & quiet mics)
              const speaking = vol > 12;
              const now = Date.now();

              if (speaking !== isSpeakingRef.current || (speaking && now - lastSpeakingBroadcastRef.current > 150)) {
                isSpeakingRef.current = speaking;
                setIsSpeaking(speaking);
                lastSpeakingBroadcastRef.current = now;

                // Broadcast live speaking status to teammates
                channel.send({
                  type: 'broadcast',
                  event: 'huddle-peer-speaking',
                  payload: {
                    userId: currentUserId,
                    userName: activeUserName,
                    isSpeaking: speaking,
                    volume: vol,
                    isMuted: false,
                  },
                });
              }
            }
            animationFrameRef.current = requestAnimationFrame(updateVolume);
          };
          updateVolume();

          // 3. Broadcast WebRTC peer join to all active listeners in the workspace
          channel.send({
            type: 'broadcast',
            event: 'webrtc-peer-joined',
            payload: { peerId: currentUserId, userName: activeUserName },
          });

          // 4. Fallback connection check: initiate offer to any existing peers already in presence
          huddlePresenceUsers.forEach((peer) => {
            if (peer.userId && peer.userId !== currentUserId) {
              setTimeout(async () => {
                if (isInHuddleRef.current && micStreamRef.current && !peerConnectionsRef.current.has(peer.userId)) {
                  try {
                    const pc = createPeerConnection(peer.userId, channel);
                    const offer = await pc.createOffer({ offerToReceiveAudio: true });
                    await pc.setLocalDescription(offer);
                    channel.send({
                      type: 'broadcast',
                      event: 'webrtc-signal-offer',
                      payload: { sdp: offer, to: peer.userId, from: currentUserId, fromName: activeUserName },
                    });
                  } catch (e) {}
                }
              }, 1200);
            }
          });
        }
      } catch (micErr) {
        console.warn('Microphone permission denied or unavailable:', micErr);
        // Fallback simulated presence
        setRealAudioVolume(35);
      }
    } else {
      // LEAVE HUDDLE
      channel.track({
        userId: currentUserId,
        userName: activeUserName,
        inHuddle: false,
      });

      // Broadcast mute/speaking off
      channel.send({
        type: 'broadcast',
        event: 'huddle-peer-speaking',
        payload: { userId: currentUserId, isSpeaking: false, volume: 0, isMuted: true },
      });

      cleanupAllPeerConnections();

      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
        micStreamRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      setRealAudioVolume(0);
      setIsSpeaking(false);
      setIsEchoLoopback(false);
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    isMutedRef.current = nextMuted;

    if (micStreamRef.current) {
      micStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !nextMuted;
      });
    }

    const channel = channelRef.current || supabase.channel(`workspace-huddle-${project.id}`);
    channel.track({
      userId: currentUserId,
      userName: activeUserName,
      role: 'Teammate',
      inHuddle: true,
      isMuted: nextMuted,
    });

    channel.send({
      type: 'broadcast',
      event: 'huddle-peer-mute',
      payload: { userId: currentUserId, isMuted: nextMuted },
    });
  };

  // Toggle local mic test loopback so student can verify their own audio
  const handleToggleEchoLoopback = () => {
    const next = !isEchoLoopback;
    setIsEchoLoopback(next);
    if (loopbackGainRef.current && audioContextRef.current) {
      loopbackGainRef.current.gain.setValueAtTime(
        next ? 0.35 : 0,
        audioContextRef.current.currentTime
      );
    }
  };

  // Ambient Lofi Focus Tone
  const toggleLofiAudio = () => {
    if (isLofiPlaying) {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
        } catch {}
        oscillatorRef.current = null;
      }
      setIsLofiPlaying(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(130.81, ctx.currentTime);
        gain.gain.setValueAtTime(0.035, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        oscillatorRef.current = osc;

        setIsLofiPlaying(true);
      } catch {
        setIsLofiPlaying(true);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
        } catch {}
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      cleanupAllPeerConnections();
    };
  }, []);

  // Combine official workspace members + any live presence peers currently in the huddle
  const combinedPeers = React.useMemo(() => {
    const list = [...members.filter((m) => m.user_id !== currentUserId)];
    huddlePresenceUsers.forEach((u) => {
      if (u.userId && u.userId !== currentUserId && !list.some((m) => m.user_id === u.userId)) {
        list.push({
          id: u.userId,
          project_id: project.id,
          user_id: u.userId,
          role: u.role || 'Teammate',
          joined_at: new Date().toISOString(),
          profile: {
            display_name: u.userName || 'Teammate',
            username: (u.userName || 'teammate').toLowerCase().replace(/\s+/g, ''),
            avatar_url: null,
          },
        } as ProjectMember);
      }
    });
    return list;
  }, [members, currentUserId, huddlePresenceUsers, project.id]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 shadow-elevated flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Headphones className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">The Late-Night Team Huddle</h2>
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time Voice & WebSocket Sync</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Real WebRTC peer-to-peer voice channel (talk and hear your teammates directly), live speaking indicators, daily sprint velocity stream, and collaborative architecture notes.
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-charcoal-950 border border-charcoal-800">
          <button
            onClick={() => setActiveTab('scratchpad')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'scratchpad'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-charcoal-850'
            }`}
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Live Scratchpad</span>
          </button>
          <button
            onClick={() => setActiveTab('standup')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'standup'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-charcoal-850'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Daily Standup Stream</span>
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'audio'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-charcoal-850'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Voice Huddle ({huddlePresenceUsers.length + (isInHuddle ? 1 : 0)})</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: LIVE COLLABORATIVE SCRATCHPAD
         ========================================================================= */}
      {activeTab === 'scratchpad' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-400 font-mono text-[11px]">Insert Template:</span>
              <button
                onClick={() =>
                  insertTemplate(
                    `### 🔌 API Contract Specification\n- \`POST /api/v1/auth/verify\`\n- Payload: \`{ "token": string, "credentialId": string }\`\n- Returns: \`{ "valid": boolean, "issuedAt": ISOString }\``
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 font-mono text-[11px]"
              >
                + API Contract
              </button>
              <button
                onClick={() =>
                  insertTemplate(
                    `### 🏁 Hackathon Submission Checklist\n- [ ] Clean production README with badges\n- [ ] 2-Minute pitch video or slide deck recorded\n- [ ] Universal tool prototype tested\n- [ ] GitHub repository public with LICENSE`
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 font-mono text-[11px]"
              >
                + Submission Checklist
              </button>
              <button
                onClick={() =>
                  insertTemplate(
                    `### 🔐 Required .env.local Secrets\nNEXT_PUBLIC_SUPABASE_URL=\nNEXT_PUBLIC_SUPABASE_ANON_KEY=\nSUPABASE_SERVICE_ROLE_KEY=`
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 font-mono text-[11px]"
              >
                + Env Secrets
              </button>
            </div>

            <div className="flex items-center gap-3">
              {isRemoteTyping && (
                <span className="text-xs font-mono text-amber-400 flex items-center gap-1.5 animate-pulse">
                  <Activity className="w-3.5 h-3.5" />
                  <span>{isRemoteTyping} is typing...</span>
                </span>
              )}

              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5" />
                <span>Cloud: {lastSavedTime}</span>
              </span>

              <button
                onClick={handleCopyNotes}
                className="p-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 hover:text-white transition-colors"
                title="Copy all notes"
              >
                {copiedNotes ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={handleDownloadNotes}
                className="p-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 hover:text-white transition-colors"
                title="Download notes file"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 shadow-inner">
            <textarea
              rows={18}
              value={scratchpadText}
              onChange={(e) => handleScratchpadChange(e.target.value)}
              className="w-full bg-transparent font-mono text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none leading-relaxed resize-y"
              placeholder="Write shared architecture notes, sprint tasks, or team brainstorming..."
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: DAILY STANDUP STREAM
         ========================================================================= */}
      {activeTab === 'standup' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Post Standup Form (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <form
              onSubmit={handlePostStandup}
              className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Log Daily Standup</span>
                </h3>
                <span className="text-[11px] font-mono text-emerald-400">
                  🟢 Real-Time Sync
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Keep the team synchronized on daily velocity. Posting advances your personal Daily Streak!
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    1. What did you build / ship today?
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={newShipped}
                    onChange={(e) => setNewShipped(e.target.value)}
                    placeholder="e.g. Connected Figma embed, resolved edge route latency..."
                    className="w-full p-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    2. What are you building next?
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={newNextUp}
                    onChange={(e) => setNewNextUp(e.target.value)}
                    placeholder="e.g. Rehearsing 2-min pitch deck and writing API unit tests..."
                    className="w-full p-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    3. Any blockers? (Optional)
                  </label>
                  <input
                    type="text"
                    value={newBlockers}
                    onChange={(e) => setNewBlockers(e.target.value)}
                    placeholder="e.g. None / Waiting for teammate API review..."
                    className="w-full p-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    size="sm"
                    variant="primary"
                    disabled={isSubmittingStandup}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    leftIcon={<Send className="w-4 h-4" />}
                  >
                    Publish Check-In
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* Standup Posts List (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Sprint Velocity Stream</span>
              <span className="text-xs font-mono text-slate-400 font-normal">
                {standups.length} check-ins logged
              </span>
            </h3>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {standups.map((post, idx) => (
                <div
                  key={post.id}
                  className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-3 shadow-sm hover:border-charcoal-750 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
                        {post.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">{post.userName}</span>
                        <span className="text-[10px] font-mono text-slate-400">{post.userRole}</span>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono text-slate-500">{post.timestamp}</span>
                  </div>

                  <div className="space-y-2 text-xs leading-relaxed">
                    <div className="p-2.5 rounded-xl bg-charcoal-850 border border-charcoal-800">
                      <span className="text-emerald-400 font-bold block text-[10px] uppercase font-mono">
                        ✓ Shipped:
                      </span>
                      <p className="text-slate-200 mt-0.5">{post.shipped}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-charcoal-850 border border-charcoal-800">
                      <span className="text-blue-400 font-bold block text-[10px] uppercase font-mono">
                        → Next Up:
                      </span>
                      <p className="text-slate-200 mt-0.5">{post.nextUp}</p>
                    </div>

                    {post.blockers && (
                      <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-800/30">
                        <span className="text-rose-400 font-bold block text-[10px] uppercase font-mono">
                          ⚠️ Blockers:
                        </span>
                        <p className="text-rose-200 mt-0.5">{post.blockers}</p>
                      </div>
                    )}
                  </div>

                  {/* Reaction Emojis */}
                  <div className="flex items-center gap-2 pt-1 border-t border-charcoal-800/80">
                    <button
                      onClick={() => handleReaction(idx, 'fire')}
                      className="px-2 py-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-xs flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
                    >
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      <span>{post.reactions.fire}</span>
                    </button>
                    <button
                      onClick={() => handleReaction(idx, 'rocket')}
                      className="px-2 py-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-xs flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
                    >
                      <Rocket className="w-3.5 h-3.5 text-violet-400" />
                      <span>{post.reactions.rocket}</span>
                    </button>
                    <button
                      onClick={() => handleReaction(idx, 'bulb')}
                      className="px-2 py-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-xs flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
                      <span>{post.reactions.bulb}</span>
                    </button>
                    <button
                      onClick={() => handleReaction(idx, 'heart')}
                      className="px-2 py-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-xs flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
                    >
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                      <span>{post.reactions.heart}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: WEBRTC REAL VOICE AUDIO HUDDLE (REAL MIC + P2P AUDIO STREAMING)
         ========================================================================= */}
      {activeTab === 'audio' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-6 shadow-sm">
            {/* Top Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-charcoal-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      isInHuddle ? 'bg-emerald-500 animate-ping' : 'bg-slate-600'
                    }`}
                  />
                  <h3 className="text-base font-bold text-white">
                    {isInHuddle ? 'Live Voice Huddle Room (Connected)' : 'Audio Huddle Room (Standby)'}
                  </h3>
                  {isInHuddle && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      WebRTC P2P Audio Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {isInHuddle
                    ? 'Speak directly to your team. Audio streams in real-time and active speakers are highlighted live.'
                    : 'Jump into the voice room with 1-click. No external links or Discord accounts needed.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isInHuddle && (
                  <button
                    onClick={handleToggleEchoLoopback}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                      isEchoLoopback
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                        : 'bg-charcoal-800 text-slate-300 hover:text-white border-charcoal-700'
                    }`}
                    title="Hear your own microphone loopback to test your mic"
                  >
                    <Volume1 className="w-3.5 h-3.5" />
                    <span>{isEchoLoopback ? 'Stop Mic Loopback' : 'Test Mic Loopback'}</span>
                  </button>
                )}

                <Button
                  onClick={toggleLofiAudio}
                  size="sm"
                  variant="outline"
                  leftIcon={
                    isLofiPlaying ? (
                      <VolumeX className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )
                  }
                >
                  {isLofiPlaying ? 'Stop Drone' : 'Focus Drone'}
                </Button>

                <Button
                  onClick={handleToggleHuddle}
                  size="sm"
                  variant="primary"
                  className={
                    isInHuddle
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }
                  leftIcon={isInHuddle ? <PhoneCall className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                >
                  {isInHuddle ? 'Leave Voice Huddle' : 'Join Audio Huddle'}
                </Button>
              </div>
            </div>

            {/* Participants Grid with Real-Time Presence & Real Speaking Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* CURRENT USER CARD */}
              <div
                className={`p-5 rounded-2xl border text-center space-y-3 transition-all relative overflow-hidden ${
                  isInHuddle
                    ? isSpeaking
                      ? 'bg-charcoal-850 border-emerald-400 ring-4 ring-emerald-500/30 shadow-[0_0_25px_rgba(52,211,153,0.35)]'
                      : 'bg-charcoal-850 border-emerald-500/50 ring-2 ring-emerald-500/20'
                    : 'bg-charcoal-950 border-charcoal-800 opacity-60'
                }`}
              >
                <div className="relative w-16 h-16 mx-auto">
                  <div
                    className={`w-16 h-16 rounded-full bg-emerald-500/20 border-2 flex items-center justify-center font-bold text-xl text-emerald-400 transition-all ${
                      isSpeaking
                        ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.8)] scale-110'
                        : 'border-emerald-500'
                    }`}
                  >
                    {activeUserName.charAt(0).toUpperCase()}
                  </div>
                  {isInHuddle && !isMuted && (
                    <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-charcoal-950 shadow-sm">
                      <Mic className="w-3.5 h-3.5" />
                    </span>
                  )}
                  {isInHuddle && isMuted && (
                    <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-rose-500 text-white shadow-sm">
                      <MicOff className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white">{activeUserName} (You)</h4>
                  <span className={`text-[11px] font-mono font-bold block mt-0.5 ${
                    isInHuddle
                      ? isMuted
                        ? 'text-rose-400'
                        : isSpeaking
                        ? 'text-emerald-300 animate-pulse'
                        : 'text-emerald-400'
                      : 'text-slate-500'
                  }`}>
                    {isInHuddle
                      ? isMuted
                        ? '🔇 Microphone Muted'
                        : isSpeaking
                        ? `🎙️ Speaking (${realAudioVolume}%)`
                        : '🎧 Listening (Online)'
                      : 'Standby (Offline)'}
                  </span>
                </div>

                {isInHuddle && (
                  <div className="flex justify-center gap-2 pt-1">
                    <button
                      onClick={handleToggleMute}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        isMuted
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-charcoal-800 text-slate-200 hover:text-white border border-charcoal-700'
                      }`}
                      title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                    >
                      {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                      <span>{isMuted ? 'Unmute' : 'Mute'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* TEAMMATES IN HUDDLE / WORKSPACE */}
              {combinedPeers.map((m) => {
                const peerSpeaking = remoteSpeakingMap[m.user_id];
                const isPeerInHuddle =
                  huddlePresenceUsers.some((u) => u.userId === m.user_id) ||
                  Boolean(peerSpeaking?.lastUpdated && Date.now() - peerSpeaking.lastUpdated < 15000);
                const isPeerSpeaking = isPeerInHuddle && Boolean(peerSpeaking?.isSpeaking);
                const isPeerMuted = Boolean(peerSpeaking?.isMuted);

                return (
                  <div
                    key={m.id}
                    className={`p-5 rounded-2xl border text-center space-y-3 transition-all relative overflow-hidden ${
                      isPeerInHuddle
                        ? isPeerSpeaking
                          ? 'bg-charcoal-850 border-emerald-400 ring-4 ring-emerald-500/30 shadow-[0_0_25px_rgba(52,211,153,0.35)]'
                          : 'bg-charcoal-850 border-emerald-500/50 ring-2 ring-emerald-500/20'
                        : 'bg-charcoal-950 border-charcoal-800 opacity-60'
                    }`}
                  >
                    <div className="relative w-16 h-16 mx-auto">
                      <div
                        className={`w-16 h-16 rounded-full border-2 flex items-center justify-center font-bold text-xl transition-all ${
                          isPeerSpeaking
                            ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.8)] scale-110'
                            : isPeerInHuddle
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                        }`}
                      >
                        {(m.profile?.display_name || m.profile?.username || 'T').charAt(0).toUpperCase()}
                      </div>

                      {isPeerInHuddle && !isPeerMuted && (
                        <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-charcoal-950 shadow-sm">
                          <Mic className="w-3.5 h-3.5" />
                        </span>
                      )}
                      {isPeerInHuddle && isPeerMuted && (
                        <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-rose-500 text-white shadow-sm">
                          <MicOff className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white truncate">
                        {m.profile?.display_name || m.profile?.username || 'Teammate'}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400 block">{m.role}</span>
                    </div>

                    <div className="pt-0.5">
                      {isPeerInHuddle ? (
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full inline-block font-bold ${
                            isPeerSpeaking
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                              : isPeerMuted
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {isPeerSpeaking
                            ? `🎙️ Speaking (${peerSpeaking?.volume || 0}%)`
                            : isPeerMuted
                            ? '🔇 Muted'
                            : '🎧 In Voice Call'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-charcoal-850 text-slate-400 border border-charcoal-800 inline-block">
                          ⚪ In Workspace
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Audio Sensitivity & Speaking Waveform */}
            {isInHuddle && (
              <div className="p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* Soundwave bars */}
                  <div className="flex items-end gap-1 h-6">
                    <span
                      className={`w-1 rounded-full transition-all duration-75 ${
                        isSpeaking ? 'bg-emerald-400' : 'bg-slate-700'
                      }`}
                      style={{ height: `${Math.max(4, (realAudioVolume / 100) * 24)}px` }}
                    />
                    <span
                      className={`w-1 rounded-full transition-all duration-75 ${
                        isSpeaking ? 'bg-emerald-400' : 'bg-slate-700'
                      }`}
                      style={{ height: `${Math.max(6, ((realAudioVolume * 1.2) / 100) * 24)}px` }}
                    />
                    <span
                      className={`w-1 rounded-full transition-all duration-75 ${
                        isSpeaking ? 'bg-emerald-400' : 'bg-slate-700'
                      }`}
                      style={{ height: `${Math.max(3, ((realAudioVolume * 0.8) / 100) * 24)}px` }}
                    />
                    <span
                      className={`w-1 rounded-full transition-all duration-75 ${
                        isSpeaking ? 'bg-emerald-400' : 'bg-slate-700'
                      }`}
                      style={{ height: `${Math.max(5, ((realAudioVolume * 1.1) / 100) * 24)}px` }}
                    />
                  </div>

                  <div>
                    <span className="text-xs text-slate-200 font-mono font-bold block">
                      {isMuted
                        ? '🔇 Microphone is Muted'
                        : isSpeaking
                        ? '🎙️ Active Voice Detected — Broadcasting to Teammates'
                        : '🎙️ Live Voice Channel Connected (Stereo HD WebRTC)'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Mic Volume: {realAudioVolume}% {isEchoLoopback ? '• Loopback ON' : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live WebRTC Mesh</span>
                  </span>
                  <span>{huddlePresenceUsers.length + 1} participant{huddlePresenceUsers.length === 0 ? '' : 's'} in room</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
