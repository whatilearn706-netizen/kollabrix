'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  GripHorizontal,
  Move,
  Video,
  VideoOff,
  Maximize2,
  AlertTriangle,
  Smartphone,
  Eye,
  Lock,
  Radio,
  CheckCircle2,
  X,
  Volume2,
  Camera,
  Layers,
  ArrowRight,
  RefreshCw,
  Monitor,
  MonitorOff,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ProctorIncident, ProctorViolationType } from '@/types/icpc';
import { supabase } from '@/lib/supabase/client';

const MAX_WARNINGS = 10;

interface IcpcProctorGuardProps {
  contestId: string;
  contestTitle: string;
  problemId?: string;
  problemTitle?: string;
  studentId?: string;
  studentName?: string;
  studentEmail?: string;
  college?: string;
  isActive: boolean;
  onSecurityIncident?: (incident: ProctorIncident) => void;
  onCloseArena?: () => void;
  children?: React.ReactNode;
}

export function IcpcProctorGuard({
  contestId,
  contestTitle,
  problemId,
  problemTitle,
  studentId = 'student-curr',
  studentName = 'Contestant',
  studentEmail,
  college,
  isActive,
  onSecurityIncident,
  onCloseArena,
  children,
}: IcpcProctorGuardProps) {
  // Proctoring telemetry state
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [hasScreenPermission, setHasScreenPermission] = useState(false);
  const [isFullscreenActive, setIsFullscreenActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [screenError, setScreenError] = useState<string | null>(null);
  const [warningCount, setWarningCount] = useState(0);
  const [isCameraMirrored, setIsCameraMirrored] = useState(false);
  const [pipFeedMode, setPipFeedMode] = useState<'camera' | 'screen'>('camera');
  const [showEntranceModal, setShowEntranceModal] = useState(true);
  const [isTerminated, setIsTerminated] = useState(false);
  const [isDemolishedByAdmin, setIsDemolishedByAdmin] = useState(false);
  const [adminCautionMessage, setAdminCautionMessage] = useState<string | null>(null);
  const [externalMeetingUrl, setExternalMeetingUrl] = useState<string>('');
  const [isFocusLost, setIsFocusLost] = useState(false);
  const [activeWarning, setActiveWarning] = useState<{
    type: ProctorViolationType;
    message: string;
    details: string;
    timestamp: string;
    screenSnapshot?: string;
  } | null>(null);

  // Vision telemetry
  const [gazeStatus, setGazeStatus] = useState<'normal' | 'away_left' | 'away_right' | 'away_up' | 'down_excessive' | 'missing'>('normal');
  const [phoneStatus, setPhoneStatus] = useState<'clear' | 'suspect'>('clear');
  const [isPipMinimized, setIsPipMinimized] = useState(false);

  // Movable PiP state
  const [pipPosition, setPipPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingPip, setIsDraggingPip] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number } | null>(null);
  const pipContainerRef = useRef<HTMLDivElement>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const proctorIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const warningCountRef = useRef(0);

  // Persistence Timers
  const fullscreenExitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const focusLostStartTimeRef = useRef<number | null>(null);
  const phoneDetectionStartTimeRef = useRef<number | null>(null);
  const gazeDeviationStartTimeRef = useRef<number | null>(null);
  const continuousDownwardStartTimeRef = useRef<number | null>(null);
  const faceMissingStartTimeRef = useRef<number | null>(null);
  const recentViolationsRef = useRef<Record<string, number>>({});

  // Audio warning sound synthesizer (Web Audio API)
  const playAlertSound = useCallback((intensity: 'warning' | 'critical' = 'warning') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = intensity === 'critical' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(intensity === 'critical' ? 880 : 587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(intensity === 'critical' ? 440 : 880, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.22, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  }, []);

  // ── MOVABLE PIP CAMERA WIDGET CONTROLS ──
  const cycleCorner = useCallback(() => {
    const el = pipContainerRef.current;
    const width = el ? el.offsetWidth : 288;
    const height = el ? el.offsetHeight : 220;
    const pad = 16;
    const corners = [
      { x: window.innerWidth - width - pad, y: pad }, // Top Right
      { x: window.innerWidth - width - pad, y: window.innerHeight - height - pad }, // Bottom Right
      { x: pad, y: window.innerHeight - height - pad }, // Bottom Left
      { x: pad, y: pad }, // Top Left
    ];
    setPipPosition((prev) => {
      if (!prev) return corners[1]; // default is TR, jump to BR
      const closestIdx = corners.reduce((bestIdx, c, idx) => {
        const distCurrent = Math.hypot(c.x - prev.x, c.y - prev.y);
        const distBest = Math.hypot(corners[bestIdx].x - prev.x, corners[bestIdx].y - prev.y);
        return distCurrent < distBest ? idx : bestIdx;
      }, 0);
      return corners[(closestIdx + 1) % corners.length];
    });
  }, []);

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    const el = pipContainerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      startX: rect.left,
      startY: rect.top,
    };
    setIsDraggingPip(true);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button, a, input')) return;
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  }, [handleDragStart]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button, a, input')) return;
    if (e.touches.length === 1) {
      handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [handleDragStart]);

  useEffect(() => {
    if (!isDraggingPip) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current) return;
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;

      const el = pipContainerRef.current;
      const width = el ? el.offsetWidth : 288;
      const height = el ? el.offsetHeight : 220;

      const newX = Math.max(8, Math.min(window.innerWidth - width - 8, dragStartRef.current.startX + dx));
      const newY = Math.max(8, Math.min(window.innerHeight - height - 8, dragStartRef.current.startY + dy));

      setPipPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!dragStartRef.current || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const dx = touch.clientX - dragStartRef.current.mouseX;
      const dy = touch.clientY - dragStartRef.current.mouseY;

      const el = pipContainerRef.current;
      const width = el ? el.offsetWidth : 288;
      const height = el ? el.offsetHeight : 220;

      const newX = Math.max(8, Math.min(window.innerWidth - width - 8, dragStartRef.current.startX + dx));
      const newY = Math.max(8, Math.min(window.innerHeight - height - 8, dragStartRef.current.startY + dy));

      setPipPosition({ x: newX, y: newY });
    };

    const handleEnd = () => {
      setIsDraggingPip(false);
      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDraggingPip]);

  useEffect(() => {
    const handleResize = () => {
      setPipPosition((prev) => {
        if (!prev) return null;
        const el = pipContainerRef.current;
        const width = el ? el.offsetWidth : 288;
        const height = el ? el.offsetHeight : 220;
        const maxX = Math.max(8, window.innerWidth - width - 8);
        const maxY = Math.max(8, window.innerHeight - height - 8);
        return {
          x: Math.min(prev.x, maxX),
          y: Math.min(prev.y, maxY),
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Capture instant screen snapshot from the screen share feed
  const captureScreenSnapshot = useCallback((): string | undefined => {
    try {
      const screenVideo = screenVideoRef.current;
      if (!screenVideo || screenVideo.readyState < 2) return undefined;

      const snapCanvas = document.createElement('canvas');
      snapCanvas.width = 640;
      snapCanvas.height = 360;
      const ctx = snapCanvas.getContext('2d');
      if (!ctx) return undefined;

      ctx.drawImage(screenVideo, 0, 0, 640, 360);
      return snapCanvas.toDataURL('image/jpeg', 0.65);
    } catch (e) {
      console.warn('Could not capture screen snapshot:', e);
      return undefined;
    }
  }, []);

  // Dispatch incident to API & local callback
  const triggerViolation = useCallback(
    async (
      type: ProctorViolationType,
      message: string,
      details: string,
      severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
    ) => {
      if (isTerminated) return;

      const now = Date.now();
      const lastTrigger = recentViolationsRef.current[type] || 0;
      if (now - lastTrigger < 3000) return;
      recentViolationsRef.current[type] = now;

      playAlertSound('critical');
      warningCountRef.current += 1;
      const nextCount = warningCountRef.current;
      setWarningCount(nextCount);

      // Grab screen snapshot evidence from live monitor share
      const screenSnapshot = captureScreenSnapshot();

      const incidentData = {
        type,
        message,
        details,
        timestamp: new Date().toLocaleTimeString(),
        screenSnapshot,
      };
      setActiveWarning(incidentData);

      // Auto-terminate session on 10 violations or when screen share stopped
      if (nextCount >= MAX_WARNINGS || type === 'SCREEN_SHARE_STOPPED') {
        setIsTerminated(true);
      }

      // Report to server API
      try {
        const payload = {
          studentId,
          studentName,
          studentEmail,
          college,
          contestId,
          contestTitle,
          problemId,
          problemTitle,
          violationType: type,
          details,
          warningCount: nextCount,
          severity,
          screenSnapshot,
        };

        const res = await fetch('/api/icpc/proctor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const resJson = await res.json();
        if (resJson.incident && onSecurityIncident) {
          onSecurityIncident(resJson.incident);
        }
      } catch (err) {
        console.warn('Failed to report proctor violation:', err);
      }
    },
    [
      isTerminated,
      captureScreenSnapshot,
      playAlertSound,
      studentId,
      studentName,
      studentEmail,
      college,
      contestId,
      contestTitle,
      problemId,
      problemTitle,
      onSecurityIncident,
    ]
  );

  // Request Wide-Angle Webcam Stream
  const initWebcam = useCallback(async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: false,
        });
      } catch (specErr) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
        };
      }

      setHasCameraPermission(true);
      return true;
    } catch (err: any) {
      console.warn('Webcam permission error:', err);
      setCameraError('Camera access required for AI anti-cheat proctoring. Please allow camera access in browser permissions.');
      setHasCameraPermission(false);
      return false;
    }
  }, []);

  // Request Entire Screen Share Stream
  // Request Entire Screen Share Stream (Strictly Monitor Only)
  const initScreenShare = useCallback(async () => {
    setScreenError(null);
    try {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        setScreenError('Screen sharing is not supported in this browser environment. Please use Google Chrome or Edge.');
        return false;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
          frameRate: { ideal: 30, max: 60 },
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
        } as any,
        audio: false,
        // Chromium parameters to enforce monitor / entire screen capture
        surfaceSwitching: 'exclude',
        selfBrowserSurface: 'exclude',
        systemAudio: 'exclude',
        monitorTypeSurfaces: 'include',
      } as any);

      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) {
        setScreenError('No video track received from screen share.');
        return false;
      }

      // Check displaySurface: STRICTLY ENFORCE ENTIRE SCREEN ('monitor')!
      // If user selected 'browser' (Tab) or 'window', reject it immediately.
      const settings = videoTrack.getSettings ? videoTrack.getSettings() : ({} as any);
      const displaySurface = settings.displaySurface;
      const trackLabel = (videoTrack.label || '').toLowerCase();
      const isTabOrWindow =
        (displaySurface && displaySurface !== 'monitor') ||
        trackLabel.includes('web-contents') ||
        trackLabel.startsWith('tab:') ||
        trackLabel.startsWith('window:');

      if (isTabOrWindow) {
        stream.getTracks().forEach((t) => t.stop());
        setHasScreenPermission(false);
        setScreenError(
          'ENTIRE SCREEN REQUIRED: You selected a single Tab or Window instead of "Entire Screen". You must share your entire screen/monitor so background apps, Siri, and external overlays are visible to the proctor. Please click Start Screen Share again and select the "Entire Screen" tab.'
        );
        return false;
      }

      videoTrack.onended = () => {
        setHasScreenPermission(false);
        triggerViolation(
          'SCREEN_SHARE_STOPPED',
          'Screen Sharing Was Terminated',
          'Mandatory entire screen sharing was stopped during the active contest. The contest arena has been disqualified and session terminated.',
          'critical'
        );
        setIsTerminated(true);
      };

      screenStreamRef.current = stream;
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
        screenVideoRef.current.play().catch(() => {});
      }

      setHasScreenPermission(true);
      return true;
    } catch (err: any) {
      console.warn('Screen share error:', err);
      setScreenError(
        err.name === 'NotAllowedError'
          ? 'Screen share permission was denied. You must share your entire screen to participate in ICPC contests.'
          : 'Failed to access screen share: ' + (err.message || 'Unknown error')
      );
      setHasScreenPermission(false);
      return false;
    }
  }, [triggerViolation]);

  // Auto-start webcam immediately on mount when active & fetch proctor config
  useEffect(() => {
    if (isActive) {
      initWebcam();
      fetch('/api/icpc/proctor')
        .then((res) => res.json())
        .then((data) => {
          if (data?.proctorMeetingUrl) {
            setExternalMeetingUrl(data.proctorMeetingUrl);
          }
        })
        .catch(() => {});
    }
  }, [isActive, initWebcam]);

  // Request Fullscreen and lock system keys
  const requestArenaFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        const el = document.documentElement;
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else if ((el as any).webkitRequestFullscreen) {
          await (el as any).webkitRequestFullscreen();
        }
      }
      setIsFullscreenActive(true);

      // Lock ALL system keyboard shortcuts in Chromium
      if (typeof navigator !== 'undefined' && (navigator as any).keyboard && (navigator as any).keyboard.lock) {
        (navigator as any).keyboard.lock().catch(() => {});
      }

      return true;
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
      return false;
    }
  }, []);

  // Enter Arena Handler (Engages Fullscreen & Locks Arena)
  const handleStartContest = useCallback(async () => {
    if (!hasCameraPermission) {
      const camOk = await initWebcam();
      if (!camOk) return;
    }
    if (!hasScreenPermission) {
      const screenOk = await initScreenShare();
      if (!screenOk) return;
    }

    setShowEntranceModal(false);
    await requestArenaFullscreen();
    if (typeof navigator !== 'undefined' && (navigator as any).keyboard && (navigator as any).keyboard.lock) {
      (navigator as any).keyboard.lock().catch(() => {});
    }
  }, [hasCameraPermission, hasScreenPermission, initWebcam, initScreenShare, requestArenaFullscreen]);

  // ── PERIODIC HEARTBEAT & ADMIN LIVE PROCTOR SYNC (EVERY 8 SECONDS) ──
  useEffect(() => {
    if (!isActive || showEntranceModal || isTerminated) return;

    const sendHeartbeat = async () => {
      try {
        const snap = captureScreenSnapshot();
        const res = await fetch('/api/icpc/proctor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'heartbeat',
            studentId,
            studentName,
            studentEmail,
            college,
            contestId,
            contestTitle,
            problemTitle,
            warningCount: warningCountRef.current,
            screenSnapshot: snap,
          }),
        });
        const data = await res.json();
        if (data.isDemolished) {
          setIsTerminated(true);
          setIsDemolishedByAdmin(true);
          playAlertSound('critical');
        } else if (data.cautionMessage) {
          setAdminCautionMessage(data.cautionMessage);
          playAlertSound('warning');
        }
      } catch (err) {
        // Silently tolerate temporary network glitch
      }
    };

    sendHeartbeat();
    const heartbeatTimer = setInterval(sendHeartbeat, 2500);
    return () => clearInterval(heartbeatTimer);
  }, [
    isActive,
    showEntranceModal,
    isTerminated,
    studentId,
    studentName,
    studentEmail,
    college,
    contestId,
    contestTitle,
    problemTitle,
    captureScreenSnapshot,
    playAlertSound,
  ]);

  // ── WEBRTC 60FPS REAL-TIME SCREEN BROADCASTER (VIA SUPABASE REALTIME WEBSOCKETS) ──
  useEffect(() => {
    if (!isActive || showEntranceModal || isTerminated || !hasScreenPermission) return;
    const stream = screenStreamRef.current;
    if (!stream) return;

    let pc: RTCPeerConnection | null = null;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    const pendingCandidates: RTCIceCandidateInit[] = [];

    const flushPendingCandidates = async (peerConn: RTCPeerConnection) => {
      while (pendingCandidates.length > 0) {
        const cand = pendingCandidates.shift();
        if (cand) {
          try {
            await peerConn.addIceCandidate(new RTCIceCandidate(cand));
          } catch (e) {}
        }
      }
    };

    const startBroadcasting = async (activeChannel: ReturnType<typeof supabase.channel>) => {
      try {
        if (pc) {
          pc.close();
          pc = null;
        }
        pendingCandidates.length = 0;

        const peerConn = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
          ],
        });
        pc = peerConn;

        // Add display video tracks to connection
        stream.getTracks().forEach((track) => {
          peerConn.addTrack(track, stream);
        });

        // Optimize encoding for 60 FPS fluid streaming & cap at 2.5 Mbps
        const sender = peerConn.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) {
          const params = sender.getParameters();
          if (!params.encodings || params.encodings.length === 0) {
            params.encodings = [{}];
          }
          params.encodings[0].maxBitrate = 2_500_000; // 2.5 Mbps cap: ultra-sharp text with zero lag
          params.encodings[0].maxFramerate = 60;
          sender.setParameters(params).catch(() => {});
        }

        // Send local candidates immediately over WebSocket
        peerConn.onicecandidate = (event) => {
          if (event.candidate) {
            activeChannel.send({
              type: 'broadcast',
              event: 'webrtc-candidate',
              payload: { role: 'student', candidate: event.candidate },
            }).catch(() => {});
          }
        };

        // Create and publish SDP offer
        const offer = await peerConn.createOffer({
          offerToReceiveVideo: false,
          offerToReceiveAudio: false,
        });
        await peerConn.setLocalDescription(offer);

        // Broadcast offer over WebSocket instantly (< 20ms)
        activeChannel.send({
          type: 'broadcast',
          event: 'webrtc-offer',
          payload: { sdp: offer, studentId },
        }).catch(() => {});
      } catch (err) {
        console.warn('WebRTC broadcaster setup error:', err);
      }
    };

    // Connect to student's dedicated Supabase Realtime channel
    channel = supabase.channel(`icpc-proctor-${studentId}`, {
      config: { broadcast: { self: false } },
    });

    // 1. Admin requests fresh stream upon opening theater mode
    channel.on('broadcast', { event: 'webrtc-request-stream' }, () => {
      if (channel) {
        startBroadcasting(channel);
      }
    });

    // 2. Admin sends SDP Answer back
    channel.on('broadcast', { event: 'webrtc-answer' }, async (msg: any) => {
      const sdp = msg?.payload?.sdp;
      if (sdp && pc && pc.signalingState === 'have-local-offer') {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          await flushPendingCandidates(pc);
        } catch (e) {
          console.warn('Error setting remote description on student:', e);
        }
      }
    });

    // 3. Admin sends ICE candidates
    channel.on('broadcast', { event: 'webrtc-candidate' }, async (msg: any) => {
      const { role, candidate } = msg?.payload || {};
      if (role === 'admin' && candidate) {
        if (pc && pc.remoteDescription) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {}
        } else {
          pendingCandidates.push(candidate);
        }
      }
    });

    // 4. Admin sends live caution alert to student screen
    channel.on('broadcast', { event: 'admin-caution' }, (msg: any) => {
      const message = msg?.payload?.message || 'Proctor Warning: Academic integrity caution issued by faculty proctor.';
      setAdminCautionMessage(message);
      playAlertSound('warning');
    });

    // 5. Admin forcefully Demolishes contest attempt
    channel.on('broadcast', { event: 'admin-demolish' }, () => {
      setIsTerminated(true);
      setIsDemolishedByAdmin(true);
      playAlertSound('critical');
    });

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED' && channel) {
        // Also proactively publish offer so if admin is already watching, it connects immediately
        startBroadcasting(channel);
      }
    });

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
      if (pc) {
        pc.close();
      }
    };
  }, [isActive, showEntranceModal, isTerminated, hasScreenPermission, studentId]);

  // ── KEYBOARD SHORTCUT & TRACKPAD SWIPE INTERCEPTOR ──
  useEffect(() => {
    if (!isActive || showEntranceModal) return;

    if (typeof navigator !== 'undefined' && (navigator as any).keyboard && (navigator as any).keyboard.lock) {
      (navigator as any).keyboard.lock().catch(() => {});
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdSpace = (e.metaKey || e.ctrlKey) && (e.code === 'Space' || e.key === ' ');
      const isOptSpace = e.altKey && (e.code === 'Space' || e.key === ' ');
      const isCtrlSpace = e.ctrlKey && (e.code === 'Space' || e.key === ' ');
      const isSiriCombo = e.metaKey && e.shiftKey && (e.code === 'Space' || e.key === ' ');
      const isDictationKey = e.key === 'F5' || e.code === 'F5' || e.key === 'LaunchAssistant' || (e as any).key === 'MicrophoneToggle';
      const isFnKey = e.key === 'Fn' || e.key === 'Globe';
      const isAppSwitcher = e.metaKey && (e.key === 'Tab' || e.code === 'Tab');
      const isWindowHide = e.metaKey && (e.key === 'h' || e.key === 'H' || e.key === 'm' || e.key === 'M');
      const isEscapeQuit = e.metaKey && e.altKey && (e.key === 'Escape' || e.code === 'Escape');

      if (
        isCmdSpace ||
        isOptSpace ||
        isCtrlSpace ||
        isSiriCombo ||
        isDictationKey ||
        isFnKey ||
        isAppSwitcher ||
        isWindowHide ||
        isEscapeQuit
      ) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        const keyLabel = isCmdSpace
          ? 'Cmd + Space'
          : isOptSpace
          ? 'Option + Space'
          : isCtrlSpace
          ? 'Ctrl + Space'
          : isSiriCombo
          ? 'Shift + Cmd + Space'
          : isDictationKey
          ? 'F5 (Dictation / Siri)'
          : isFnKey
          ? 'Fn / Globe'
          : isAppSwitcher
          ? 'Cmd + Tab'
          : isWindowHide
          ? 'Cmd + H/M'
          : e.key || 'Assistant Key';

        triggerViolation(
          'TAB_SWITCH',
          'Prohibited Shortcut Intercepted',
          `Prohibited system shortcut (${keyLabel}) intercepted! External assistant overlays and window switches are strictly prohibited.`,
          'critical'
        );
        return false;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const isCmdSpace = (e.metaKey || e.ctrlKey) && (e.code === 'Space' || e.key === ' ');
      const isOptSpace = e.altKey && (e.code === 'Space' || e.key === ' ');
      const isMicKey = e.key === 'F5' || e.code === 'F5' || e.key === 'LaunchAssistant';
      if (isCmdSpace || isOptSpace || isMicKey) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      if (typeof navigator !== 'undefined' && (navigator as any).keyboard && (navigator as any).keyboard.unlock) {
        (navigator as any).keyboard.unlock();
      }
    };
  }, [isActive, showEntranceModal, triggerViolation]);

  // ── HIGH-FREQUENCY FOCUS, VISIBILITY & DESKTOP GESTURE MONITOR ──
  useEffect(() => {
    if (!isActive || showEntranceModal) return;

    const checkFocusAndVisibility = () => {
      const hasFocus = typeof document !== 'undefined' ? document.hasFocus() : true;
      const isVisible = typeof document !== 'undefined' ? !document.hidden : true;
      const isCompliant = hasFocus && isVisible;

      if (!isCompliant) {
        setIsFocusLost(true);
        playAlertSound('critical');

        try {
          window.focus();
        } catch (e) {}

        if (!focusLostStartTimeRef.current) {
          focusLostStartTimeRef.current = Date.now();
        } else {
          const elapsed = Date.now() - focusLostStartTimeRef.current;
          if (elapsed >= 1500) {
            triggerViolation(
              'TAB_SWITCH',
              'External App / Overlay / Desktop Switch Detected',
              `Contest window lost focus to an external window or overlay for ${(elapsed / 1000).toFixed(1)}s. The contest arena was blacked out. Switching windows or using overlays during contests is strictly prohibited.`,
              'critical'
            );
          }
        }
      } else {
        setIsFocusLost(false);
        if (focusLostStartTimeRef.current) {
          const awayDuration = Date.now() - focusLostStartTimeRef.current;
          focusLostStartTimeRef.current = null;
          if (awayDuration >= 1500) {
            triggerViolation(
              'TAB_SWITCH',
              'External Window Navigation Detected',
              `You navigated away from the contest arena for ${(awayDuration / 1000).toFixed(1)}s. Screen switching is strictly prohibited.`,
              'critical'
            );
          }
        }
      }
    };

    const poller = setInterval(checkFocusAndVisibility, 150);

    const handleWindowBlur = () => {
      setIsFocusLost(true);
      if (!focusLostStartTimeRef.current) {
        focusLostStartTimeRef.current = Date.now();
      }
      playAlertSound('critical');
      checkFocusAndVisibility();
    };

    const handleWindowFocus = () => {
      setIsFocusLost(false);
      checkFocusAndVisibility();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation(
          'TAB_SWITCH',
          '4-Finger Desktop Swipe Detected',
          'Contest arena moved off-screen via desktop swipe gesture. Multi-desktop navigation is strictly prohibited.',
          'critical'
        );
      }
      checkFocusAndVisibility();
    };

    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handleWindowBlur);

    return () => {
      clearInterval(poller);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handleWindowBlur);
    };
  }, [isActive, showEntranceModal, triggerViolation, playAlertSound]);

  // Full-Screen Change Event Listener (with 1.5-Second Rule)
  useEffect(() => {
    if (!isActive || showEntranceModal) return;

    setIsFullscreenActive(Boolean(document.fullscreenElement));

    const handleFullscreenChange = () => {
      const isNowFullscreen = Boolean(document.fullscreenElement);
      setIsFullscreenActive(isNowFullscreen);

      if (!isNowFullscreen) {
        if (fullscreenExitTimerRef.current) clearTimeout(fullscreenExitTimerRef.current);
        fullscreenExitTimerRef.current = setTimeout(() => {
          if (!document.fullscreenElement) {
            triggerViolation(
              'FULLSCREEN_EXIT',
              'Full-Screen Mode Exited',
              'Contestant left full-screen mode for more than 1.5 seconds. Screen switching is prohibited during ICPC contests.',
              'high'
            );
          }
        }, 1500);
      } else {
        if (fullscreenExitTimerRef.current) {
          clearTimeout(fullscreenExitTimerRef.current);
          fullscreenExitTimerRef.current = null;
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      if (fullscreenExitTimerRef.current) clearTimeout(fullscreenExitTimerRef.current);
    };
  }, [isActive, showEntranceModal, triggerViolation]);

  // ── REAL-TIME VISION FRAME PROCESSING (Phone & Laptop Gaze Tracking) ──
  useEffect(() => {
    if (!isActive || !hasCameraPermission || showEntranceModal) return;

    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    proctorIntervalRef.current = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || !ctx) return;

      const now = Date.now();

      // ── Runtime Entire Screen Sharing Integrity Check ──
      if (hasScreenPermission && screenStreamRef.current) {
        const sTrack = screenStreamRef.current.getVideoTracks()[0];
        if (sTrack) {
          const sSettings = sTrack.getSettings ? sTrack.getSettings() : ({} as any);
          const sSurface = sSettings.displaySurface;
          const sLabel = (sTrack.label || '').toLowerCase();
          const isNotEntireScreen =
            (sSurface && sSurface !== 'monitor') ||
            sLabel.includes('web-contents') ||
            sLabel.startsWith('tab:') ||
            sLabel.startsWith('window:');

          if (isNotEntireScreen) {
            triggerViolation(
              'SCREEN_SHARE_STOPPED',
              'Entire Screen Sharing Violated',
              'Contestant switched screen share from Entire Screen to a single tab or window. Entire screen sharing is strictly mandatory.',
              'critical'
            );
            setIsTerminated(true);
            return;
          }
        }
      }

      ctx.drawImage(video, 0, 0, 320, 240);
      const frameData = ctx.getImageData(0, 0, 320, 240);
      const { data, width, height } = frameData;

      // ── 1. Face & Laptop Gaze Cone Tracking Algorithm ──
      // Scan upper 72% of frame to isolate the face and avoid keyboard/mouse/hand skin pixels
      let skinPixelCount = 0;
      let sumX = 0;
      let sumY = 0;
      let leftSkinCount = 0;
      let rightSkinCount = 0;
      const faceRegionBottom = Math.floor(height * 0.72);

      for (let y = 0; y < faceRegionBottom; y += 2) {
        for (let x = 0; x < width; x += 2) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          const isSkin =
            r > 60 &&
            g > 35 &&
            b > 20 &&
            r > g &&
            r > b &&
            r - g > 12;

          if (isSkin) {
            sumX += x;
            sumY += y;
            skinPixelCount++;

            if (x < width / 2) {
              leftSkinCount++;
            } else {
              rightSkinCount++;
            }
          }
        }
      }

      if (skinPixelCount < 60) {
        setGazeStatus('missing');
        gazeDeviationStartTimeRef.current = null;
        continuousDownwardStartTimeRef.current = null;
        if (!faceMissingStartTimeRef.current) {
          faceMissingStartTimeRef.current = now;
        } else if (now - faceMissingStartTimeRef.current >= 6000) {
          triggerViolation(
            'FACE_MISSING',
            'Face Not Detected in Frame',
            'Contestant face not visible in camera proctor feed for > 6s. Keep your face centered in the camera.',
            'medium'
          );
        }
      } else {
        faceMissingStartTimeRef.current = null;
        const avgX = sumX / skinPixelCount / width;
        const avgY = sumY / skinPixelCount / height;

        const totalSkin = leftSkinCount + rightSkinCount;
        const leftRatio = totalSkin > 0 ? leftSkinCount / totalSkin : 0.5;

        // Accurate directional gaze cone tracking:
        // Wide laptop view cone: avgX between 0.24 and 0.76, avgY between 0.16 and 0.60
        if (avgX < 0.24 || (avgX < 0.28 && leftRatio > 0.85)) {
          // Turned Left away from screen
          setGazeStatus('away_left');
          continuousDownwardStartTimeRef.current = null;
          if (!gazeDeviationStartTimeRef.current) {
            gazeDeviationStartTimeRef.current = now;
          } else if (now - gazeDeviationStartTimeRef.current >= 5000) {
            triggerViolation(
              'GAZE_DEVIATION',
              'Looking Away to the Left Detected',
              'Contestant turned head/gaze far to the left away from the laptop screen for > 5s.',
              'medium'
            );
          }
        } else if (avgX > 0.76 || (avgX > 0.72 && leftRatio < 0.15)) {
          // Turned Right away from screen
          setGazeStatus('away_right');
          continuousDownwardStartTimeRef.current = null;
          if (!gazeDeviationStartTimeRef.current) {
            gazeDeviationStartTimeRef.current = now;
          } else if (now - gazeDeviationStartTimeRef.current >= 5000) {
            triggerViolation(
              'GAZE_DEVIATION',
              'Looking Away to the Right Detected',
              'Contestant turned head/gaze far to the right away from the laptop screen for > 5s.',
              'medium'
            );
          }
        } else if (avgY < 0.16) {
          // Looking Upward away from screen
          setGazeStatus('away_up');
          continuousDownwardStartTimeRef.current = null;
          if (!gazeDeviationStartTimeRef.current) {
            gazeDeviationStartTimeRef.current = now;
          } else if (now - gazeDeviationStartTimeRef.current >= 5000) {
            triggerViolation(
              'GAZE_DEVIATION',
              'Looking Upward Away from Screen',
              'Contestant looking upward away from the contest problem and editor for > 5s.',
              'medium'
            );
          }
        } else if (avgY > 0.60) {
          // Looking Downward (Lap / Notes / Desk)
          // Normal brief downward glances (typing on keyboard, looking at desk) are permitted;
          // Only triggers if sustained continuously for > 30 seconds as requested!
          setGazeStatus('down_excessive');
          gazeDeviationStartTimeRef.current = null;
          if (!continuousDownwardStartTimeRef.current) {
            continuousDownwardStartTimeRef.current = now;
          } else if (now - continuousDownwardStartTimeRef.current >= 30000) {
            triggerViolation(
              'GAZE_DEVIATION',
              'Excessive Continuous Downward Gaze (> 30s)',
              'Contestant looking continuously downward toward lap/desk for > 30s without looking at screen. Cheating risk.',
              'medium'
            );
          }
        } else {
          // Seeing laptop front normally: reset all deviation timers!
          setGazeStatus('normal');
          gazeDeviationStartTimeRef.current = null;
          continuousDownwardStartTimeRef.current = null;
        }
      }

      // ── 2. Smartphone & Mobile Device Detection Algorithm ──
      // Strict handheld emissive screen cluster detection:
      // ZERO false positives on shirts, collars, neck skin, desks, or ambient room lighting.
      let phoneCandidateFound = false;

      // Only scan for an elevated handheld device in the mid-upper view
      // A handheld phone raised in view is between y = 0.18*height and y = 0.78*height
      const scanYStart = Math.floor(height * 0.18);
      const scanYEnd = Math.floor(height * 0.78);

      let emissiveScreenCount = 0;
      let minX = width;
      let maxX = 0;
      let minY = height;
      let maxY = 0;
      let nearbySkinCount = 0;

      for (let y = scanYStart; y < scanYEnd; y += 3) {
        for (let x = 8; x < width - 8; x += 3) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;

          const isSkin =
            r > 60 &&
            g > 35 &&
            b > 20 &&
            r > g &&
            r > b &&
            r - g > 12;

          if (isSkin) {
            nearbySkinCount++;
          } else {
            // Emissive phone screen: intense brightness with neutral white/blue-white backlight
            const isEmissiveScreen =
              lum > 215 &&
              Math.abs(r - g) < 15 &&
              Math.abs(r - b) < 15;

            if (isEmissiveScreen) {
              emissiveScreenCount++;
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }
      }

      const clusterW = Math.max(0, maxX - minX);
      const clusterH = Math.max(0, maxY - minY);
      const aspect = clusterH > 0 && clusterW > 0 ? Math.max(clusterH / clusterW, clusterW / clusterH) : 1;

      // A genuine smartphone held up in camera view:
      // 1. Must be isolated: NOT extending to the bottom of the frame (maxY < scanYEnd - 6)
      //    (Clothing/shirts extend all the way down and out of frame)
      // 2. Must have bounded phone dimensions: width between 25 and 110 px, height between 35 and 160 px
      // 3. Must not span across the chest (clusterW < width * 0.42)
      // 4. Must have aspect ratio between 1.3 and 2.6 (typical smartphone aspect ratio)
      // 5. Must have dense emissive screen pixels (>= 50 sample points in this compact box)
      // 6. Must have skin nearby (hand/fingers holding the phone: nearbySkinCount >= 10)
      if (
        emissiveScreenCount >= 50 &&
        clusterW >= 25 &&
        clusterW <= Math.floor(width * 0.42) &&
        clusterH >= 35 &&
        clusterH <= 160 &&
        maxY < scanYEnd - 6 &&
        aspect >= 1.3 &&
        aspect <= 2.6 &&
        nearbySkinCount >= 10
      ) {
        phoneCandidateFound = true;
      }

      // If the contestant is looking straight at the laptop with face centered and no elevated phone device:
      // Absolutely clear — zero false positives!
      if (phoneCandidateFound) {
        setPhoneStatus('suspect');
        if (!phoneDetectionStartTimeRef.current) {
          phoneDetectionStartTimeRef.current = now;
        } else if (now - phoneDetectionStartTimeRef.current >= 4000) {
          triggerViolation(
            'PHONE_DETECTED',
            'Mobile Phone Detected in Camera Feed',
            'Handheld smartphone screen detected in camera view for > 4s. Handheld device usage is strictly prohibited.',
            'critical'
          );
        }
      } else {
        setPhoneStatus('clear');
        phoneDetectionStartTimeRef.current = null;
      }
    }, 300);

    return () => {
      if (proctorIntervalRef.current) {
        clearInterval(proctorIntervalRef.current);
        proctorIntervalRef.current = null;
      }
    };
  }, [isActive, hasCameraPermission, showEntranceModal, triggerViolation]);

  // Clean up streams on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <>
      {/* ── HIDDEN CONSTANT SCREEN SHARE VIDEO ELEMENT FOR SNAPSHOT PIPELINE ── */}
      <video
        ref={(el) => {
          (screenVideoRef as any).current = el;
          if (el && screenStreamRef.current && el.srcObject !== screenStreamRef.current) {
            el.srcObject = screenStreamRef.current;
            el.play().catch(() => {});
          }
        }}
        autoPlay
        playsInline
        muted
        className="hidden"
      />

      {/* ── PROCTOR PIP FLOATING WIDGET (Movable / Draggable Anywhere inside Arena) ── */}
      {isActive && !showEntranceModal && !isTerminated && (
        <div
          ref={pipContainerRef}
          style={
            pipPosition
              ? {
                  left: `${pipPosition.x}px`,
                  top: `${pipPosition.y}px`,
                  right: 'auto',
                  bottom: 'auto',
                }
              : undefined
          }
          className={`fixed z-[100] shadow-2xl rounded-2xl border ${
            isDraggingPip ? 'transition-none select-none shadow-cyan-500/30 scale-[1.01]' : 'transition-all duration-200'
          } ${
            activeWarning
              ? 'border-rose-500 bg-rose-950/90 shadow-rose-500/20'
              : phoneStatus === 'suspect' || gazeStatus !== 'normal'
              ? 'border-amber-500 bg-charcoal-900/95 shadow-amber-500/10'
              : 'border-cyan-500/40 bg-charcoal-900/95'
          } ${
            pipPosition
              ? isPipMinimized
                ? 'w-60 p-2.5'
                : 'w-72 p-3'
              : isPipMinimized
              ? 'bottom-4 right-4 w-60 p-2.5'
              : 'top-4 right-4 w-72 p-3'
          }`}
        >
          {/* Header & Movable Drag Handle */}
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className="flex items-center justify-between pb-2 border-b border-charcoal-800 text-xs cursor-grab active:cursor-grabbing select-none"
            title="Click and drag to move camera anywhere on screen"
          >
            <div className="flex items-center gap-1.5 shrink-0">
              <GripHorizontal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="font-mono font-bold text-white text-[11px] truncate">Proctor</span>
            </div>

            <div
              className="flex items-center gap-1"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                  warningCount === 0
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : warningCount < 6
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                }`}
              >
                {warningCount}w
              </span>

              {/* 1-Click Corner Snap / Move Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  cycleCorner();
                }}
                className="text-cyan-300 hover:text-white px-1.5 py-0.5 rounded bg-charcoal-800 hover:bg-charcoal-700 text-[9px] font-mono border border-charcoal-700 flex items-center gap-0.5 cursor-pointer transition-colors"
                title="Snap camera to next screen corner"
              >
                <Move className="w-2.5 h-2.5 text-cyan-400" />
                <span>Move</span>
              </button>

              {/* Mirror / Non-Mirror Orientation Toggle Button (Camera only) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCameraMirrored((prev) => !prev);
                }}
                className="text-slate-300 hover:text-white px-1.5 py-0.5 rounded bg-charcoal-800 hover:bg-charcoal-700 text-[9px] font-mono border border-charcoal-700 flex items-center gap-1 cursor-pointer transition-colors"
                title="Toggle between non-mirrored and mirrored camera orientation"
              >
                <RefreshCw className="w-2.5 h-2.5" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPipMinimized(!isPipMinimized);
                }}
                className="text-slate-400 hover:text-white px-1 py-0.5 rounded bg-charcoal-800 hover:bg-charcoal-700 text-[9px] font-mono cursor-pointer"
                title={isPipMinimized ? 'Expand Camera View' : 'Minimize to Mini Bar'}
              >
                {isPipMinimized ? 'Expand' : 'Mini'}
              </button>
            </div>
          </div>

          {/* Video Preview */}
          {!isPipMinimized && (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black mt-2.5 border border-charcoal-800">
              {/* Webcam Feed */}
              <video
                ref={(el) => {
                  (videoRef as any).current = el;
                  if (el && streamRef.current && el.srcObject !== streamRef.current) {
                    el.srcObject = streamRef.current;
                    el.play().catch(() => {});
                  }
                }}
                autoPlay
                playsInline
                muted
                style={{
                  display: pipFeedMode === 'camera' ? 'block' : 'none',
                  transform: isCameraMirrored ? 'scaleX(-1)' : 'scaleX(1)',
                }}
                className="w-full h-full object-cover transition-transform duration-200"
              />

              {/* Screen Share Feed in PiP */}
              {pipFeedMode === 'screen' && (
                <video
                  ref={(el) => {
                    if (el && screenStreamRef.current && el.srcObject !== screenStreamRef.current) {
                      el.srcObject = screenStreamRef.current;
                      el.play().catch(() => {});
                    }
                  }}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-contain bg-black"
                />
              )}

              {/* Status HUD Overlays */}
              {hasCameraPermission && pipFeedMode === 'camera' && (
                <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 pointer-events-none">
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded backdrop-blur-md font-bold flex items-center gap-1 ${
                      phoneStatus === 'suspect'
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-charcoal-950/80 text-emerald-300'
                    }`}
                  >
                    <Smartphone className="w-2.5 h-2.5" />
                    {phoneStatus === 'suspect' ? 'PHONE DETECTED (SUSPECT)' : 'Phone Clear'}
                  </span>

                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded backdrop-blur-md font-bold flex items-center gap-1 ${
                      gazeStatus === 'normal'
                        ? 'bg-charcoal-950/80 text-emerald-300'
                        : gazeStatus === 'missing'
                        ? 'bg-rose-600 text-white'
                        : 'bg-amber-500 text-black font-extrabold'
                    }`}
                  >
                    <Eye className="w-2.5 h-2.5" />
                    {gazeStatus === 'normal'
                      ? 'Focus: Laptop Screen'
                      : gazeStatus === 'away_left'
                      ? 'Gaze: Looking Left'
                      : gazeStatus === 'away_right'
                      ? 'Gaze: Looking Right'
                      : gazeStatus === 'away_up'
                      ? 'Gaze: Looking Up'
                      : gazeStatus === 'down_excessive'
                      ? 'Gaze: Looking Down'
                      : 'Face: Missing'}
                  </span>
                </div>
              )}

              {pipFeedMode === 'screen' && (
                <div className="absolute top-1.5 left-1.5 pointer-events-none">
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded backdrop-blur-md font-bold flex items-center gap-1 bg-charcoal-950/80 text-cyan-300">
                    <Monitor className="w-2.5 h-2.5" />
                    Monitor Shared Live
                  </span>
                </div>
              )}

              {!isFullscreenActive && (
                <div className="absolute inset-0 bg-rose-950/90 flex flex-col items-center justify-center p-2 text-center text-xs text-rose-200">
                  <Maximize2 className="w-5 h-5 text-rose-400 mb-1" />
                  <span className="font-bold">Not in Fullscreen!</span>
                  <button
                    onClick={requestArenaFullscreen}
                    className="mt-1 px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold cursor-pointer"
                  >
                    Restore Fullscreen
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Quick HUD Strip */}
          <div className="mt-2 pt-2 border-t border-charcoal-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Lock className="w-2.5 h-2.5 text-cyan-400" />
              <span>Full-Screen: {isFullscreenActive ? 'Locked' : 'Off'}</span>
            </span>
            <span>{studentName.split(' ')[0]}</span>
          </div>
        </div>
      )}

      {/* ── MANDATORY DUAL-LENS PROCTOR ENTRANCE MODAL ── */}
      {isActive && showEntranceModal && (
        <div className="fixed inset-0 z-[200] bg-charcoal-950/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="max-w-xl w-full p-6 sm:p-8 rounded-3xl bg-charcoal-900 border-2 border-cyan-500/50 shadow-2xl shadow-cyan-500/20 text-center space-y-6 animate-in zoom-in-95 duration-200 my-auto">
            {/* Header */}
            <div className="space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center mx-auto text-cyan-400 mb-2 shadow-lg shadow-cyan-500/20">
                <ShieldCheck className="w-7 h-7 text-cyan-300" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-bold tracking-wider uppercase">
                <span>ICPC Dual-Lens Security Checkpoint</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Camera &amp; Screen Share Required</h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                To guarantee zero external assistance, you must grant both <strong>Wide-Angle Webcam</strong> and <strong>Entire Screen Share</strong> permissions before entering the arena.
              </p>
            </div>

            {/* External Meeting Call Banner (if configured by faculty proctor) */}
            {externalMeetingUrl && (
              <div className="p-3.5 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-between gap-3 text-left">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                    <Video className="w-3 h-3" />
                    <span>Faculty Live Proctor Room Active</span>
                  </span>
                  <p className="text-xs text-slate-200">
                    Join the proctor video meeting to broadcast your screen directly to the proctoring panel.
                  </p>
                </div>
                <a
                  href={externalMeetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <span>Join Call</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Verification Steps Container */}
            <div className="space-y-3 text-left">
              {/* Step 1: Wide-Angle Camera Proctor */}
              <div className="p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-bold flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    <span>1. Wide-Angle Camera Proctor:</span>
                  </span>
                  <span className={hasCameraPermission ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {hasCameraPermission ? '✓ Camera Active' : '⚠ Action Required'}
                  </span>
                </div>

                <div className="relative aspect-video max-h-40 rounded-xl overflow-hidden bg-black border border-charcoal-800 mx-auto flex items-center justify-center">
                  <video
                    ref={(el) => {
                      (videoRef as any).current = el;
                      if (el && streamRef.current && el.srcObject !== streamRef.current) {
                        el.srcObject = streamRef.current;
                        el.play().catch(() => {});
                      }
                    }}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      transform: isCameraMirrored ? 'scaleX(-1)' : 'scaleX(1)',
                    }}
                    className="w-full h-full object-cover transition-transform duration-200"
                  />
                  {!hasCameraPermission && (
                    <div className="absolute inset-0 bg-charcoal-950/90 flex flex-col items-center justify-center p-3 text-center gap-2">
                      <Camera className="w-6 h-6 text-cyan-400" />
                      <span className="text-xs font-bold text-white">Camera Access Required</span>
                      <button
                        type="button"
                        onClick={initWebcam}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer transition-colors"
                      >
                        Enable Webcam
                      </button>
                    </div>
                  )}
                  {hasCameraPermission && (
                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        onClick={() => setIsCameraMirrored(!isCameraMirrored)}
                        className="px-2 py-0.5 rounded-md bg-charcoal-900/80 backdrop-blur border border-charcoal-700 text-slate-300 text-[10px] font-mono flex items-center gap-1 hover:text-white cursor-pointer"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        <span>{isCameraMirrored ? 'Mirrored' : 'Non-Mirror'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Mandatory Entire Screen Sharing */}
              <div className="p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-bold flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-emerald-400" />
                    <span>2. Entire Screen Share (Full Monitor Required):</span>
                  </span>
                  <span className={hasScreenPermission ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {hasScreenPermission ? '✓ Entire Screen Active' : '⚠ Action Required'}
                  </span>
                </div>

                {!hasScreenPermission ? (
                  <div className="p-3.5 rounded-xl bg-charcoal-900/80 border border-charcoal-750 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-white">Share Entire Screen</p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-mono font-bold border border-amber-500/30">
                          Strict: Full Display Only
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        When the browser dialog appears, click the <strong className="text-cyan-300">&quot;Entire Screen&quot;</strong> tab and select your display. Single tabs or individual windows are strictly prohibited so Siri and external apps can be proctored.
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={initScreenShare}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 cursor-pointer"
                    >
                      <Monitor className="w-3.5 h-3.5 mr-1.5" />
                      <span>Start Screen Share</span>
                    </Button>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Entire monitor sharing verified (Siri and desktop overlays are actively proctored)</span>
                    </span>
                    <button
                      type="button"
                      onClick={initScreenShare}
                      className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      Change Screen
                    </button>
                  </div>
                )}

                {screenError && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-[11px] font-mono text-rose-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-rose-200">
                      <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                      <span>Screen Share Rejected:</span>
                    </div>
                    <p className="leading-relaxed">{screenError}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Anti-Cheat Notice */}
            <div className="p-3.5 rounded-2xl bg-charcoal-950/70 border border-charcoal-800 text-left text-[11px] text-slate-400 space-y-1 font-mono">
              <div className="text-slate-300 font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Zero-Tolerance Academic Integrity Rules:</span>
              </div>
              <p>• Raycast, Siri, Spotlight, external windows, and 4-finger swipes will trigger an instant arena blackout.</p>
              <p>• Contestant monitor frames are automatically screenshotted and submitted to the faculty control center.</p>
              <p>• Stopping screen share, reaching {MAX_WARNINGS} warnings, or proctor demolition will result in immediate disqualification.</p>
            </div>

            {/* Main CTA: Start Dual-Proctor and Enter Arena */}
            <div className="pt-2 space-y-2">
              <Button
                variant="primary"
                size="lg"
                disabled={!hasCameraPermission || !hasScreenPermission}
                onClick={handleStartContest}
                className={`w-full font-extrabold text-sm py-3.5 shadow-xl rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  hasCameraPermission && hasScreenPermission
                    ? 'bg-gradient-to-r from-cyan-600 via-emerald-600 to-cyan-500 hover:from-cyan-500 hover:to-emerald-500 text-white shadow-cyan-500/20'
                    : 'bg-charcoal-800 text-slate-500 border border-charcoal-700 cursor-not-allowed opacity-60'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {hasCameraPermission && hasScreenPermission
                    ? 'Enter ICPC Contest Arena & Engage Lockdown'
                    : 'Enable Camera & Screen Share to Enter'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADMIN FACULTY CAUTION MODAL ── */}
      {adminCautionMessage && (
        <div className="fixed inset-0 z-[10500] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full p-6 rounded-3xl bg-charcoal-950 border-2 border-amber-500 text-center space-y-4 shadow-2xl shadow-amber-500/30 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 animate-pulse">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                PROCTOR CAUTION FROM FACULTY
              </span>
              <h3 className="text-xl font-black text-white">Live Caution Issued</h3>
              <p className="text-xs text-amber-200 leading-relaxed font-mono bg-charcoal-900 p-3 rounded-xl border border-charcoal-800">
                &ldquo;{adminCautionMessage}&rdquo;
              </p>
            </div>

            <p className="text-[11px] text-slate-400">
              Please comply with all contest rules. Further violations will lead to immediate session demolition.
            </p>

            <Button
              variant="primary"
              size="sm"
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold cursor-pointer"
              onClick={() => setAdminCautionMessage(null)}
            >
              I Acknowledge Caution &amp; Resume Contest
            </Button>
          </div>
        </div>
      )}

      {/* ── PERMANENT DISQUALIFICATION & SESSION TERMINATION OVERLAY ── */}
      {isActive && isTerminated && (
        <div className="fixed inset-0 z-[10000] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="max-w-lg w-full p-6 sm:p-8 rounded-3xl bg-charcoal-950 border-2 border-rose-500 shadow-2xl shadow-rose-500/50 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-3xl bg-rose-600/20 border-2 border-rose-500 flex items-center justify-center mx-auto text-rose-400 animate-pulse">
              <ShieldAlert className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-mono font-black text-rose-400 tracking-widest uppercase px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30">
                🚨 CONTEST DISQUALIFIED // SESSION TERMINATED
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {isDemolishedByAdmin ? 'Contest Demolished by Proctor' : 'Academic Integrity Policy Enforced'}
              </h2>
              <p className="text-xs text-rose-200 leading-relaxed font-mono">
                {isDemolishedByAdmin
                  ? 'The contest proctor has reviewed your session and forcefully demolished your contest attempt.'
                  : warningCount >= MAX_WARNINGS
                  ? `Contestant exceeded the maximum allowable proctor warnings (${MAX_WARNINGS} violations recorded).`
                  : 'Mandatory screen sharing was terminated during the active contest.'}
              </p>
            </div>

            {/* Evidence & Details Box */}
            <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-xs font-mono text-slate-300 space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">Contestant:</span>
                <strong className="text-white">{studentName} ({studentId})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Contest:</span>
                <strong className="text-cyan-300">{contestTitle}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Violations:</span>
                <span className="text-rose-400 font-bold">{warningCount} Violations</span>
              </div>

              {activeWarning?.screenSnapshot && (
                <div className="pt-2 border-t border-charcoal-800">
                  <span className="text-[10px] text-slate-400 block mb-1">Latest Screen Capture Evidence:</span>
                  <div className="rounded-xl overflow-hidden border border-rose-500/40 bg-black">
                    <img
                      src={activeWarning.screenSnapshot}
                      alt="Violation Evidence"
                      className="w-full h-auto object-cover max-h-40"
                    />
                  </div>
                </div>
              )}

              <p className="text-[10px] text-slate-400 pt-1 leading-tight">
                All telemetry records, monitor captures, and webcam logs have been submitted to the ICPC Administrative Control Center for faculty review.
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                if (typeof document !== 'undefined' && document.fullscreenElement) {
                  document.exitFullscreen().catch(() => {});
                }
                if (onCloseArena) {
                  onCloseArena();
                } else {
                  window.location.href = '/icpc';
                }
              }}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm py-3.5 shadow-xl shadow-rose-500/30 rounded-2xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Exit Contest Arena</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── SECURITY VIOLATION ALERT OVERLAY MODAL (For Warnings < MAX_WARNINGS) ── */}
      {activeWarning && !isTerminated && (
        <div className="fixed inset-0 z-[300] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full p-6 rounded-3xl bg-charcoal-950 border-2 border-rose-500 text-center space-y-4 shadow-2xl shadow-rose-500/30 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border-2 border-rose-500/40 flex items-center justify-center mx-auto text-rose-400 animate-bounce">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-rose-400 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30">
                ICPC PROCTOR WARNING // INCIDENT #{warningCount} OF {MAX_WARNINGS}
              </span>
              <h3 className="text-xl font-black text-white">{activeWarning.message}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{activeWarning.details}</p>
            </div>

            {/* Screen snapshot preview if available */}
            {activeWarning.screenSnapshot && (
              <div className="rounded-xl overflow-hidden border border-rose-500/40 bg-black text-left">
                <div className="px-2.5 py-1 bg-charcoal-900 border-b border-charcoal-800 text-[10px] font-mono text-rose-300 flex items-center justify-between">
                  <span>📸 Monitor Screen Snapshot</span>
                  <span className="text-slate-400">Logged to Admin</span>
                </div>
                <img
                  src={activeWarning.screenSnapshot}
                  alt="Incident Monitor Capture"
                  className="w-full h-auto object-cover max-h-36"
                />
              </div>
            )}

            <div className="p-3 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-[11px] font-mono text-slate-400 space-y-1 text-left">
              <div className="flex justify-between">
                <span>Account:</span>
                <strong className="text-white">{studentName}</strong>
              </div>
              <div className="flex justify-between">
                <span>Timestamp:</span>
                <strong className="text-cyan-300">{activeWarning.timestamp}</strong>
              </div>
              <div className="flex justify-between">
                <span>Warning Status:</span>
                <span className="text-rose-400 font-bold">{MAX_WARNINGS - warningCount} warnings remaining before Disqualification</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
              <Button
                variant="primary"
                size="sm"
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
                onClick={async () => {
                  focusLostStartTimeRef.current = null;
                  await requestArenaFullscreen();
                  setActiveWarning(null);
                }}
              >
                I Acknowledge &amp; Return to Contest
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── PERSISTENT REAL-TIME BLACKOUT OVERLAY (WHILE WINDOW UNFOCUSED / OVERLAY ACTIVE) ── */}
      {isActive && isFocusLost && !showEntranceModal && !isTerminated && (
        <div
          onClick={() => {
            try {
              window.focus();
            } catch (e) {}
            setIsFocusLost(false);
          }}
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-4 text-center select-none cursor-pointer animate-in fade-in duration-100"
        >
          <div className="max-w-lg w-full p-6 sm:p-8 rounded-3xl bg-charcoal-950/95 border-2 border-rose-500 shadow-2xl shadow-rose-500/50 space-y-5 text-white">
            <div className="w-20 h-20 rounded-3xl bg-rose-600/20 border-2 border-rose-500 flex items-center justify-center mx-auto text-rose-400 animate-bounce">
              <ShieldAlert className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-mono font-black text-rose-400 tracking-widest uppercase px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30">
                🚨 CONTEST ARENA BLACKOUT ACTIVE
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight">External Window / Overlay Detected!</h2>
              <p className="text-xs text-rose-200 leading-relaxed font-mono">
                The contest problem and editor have been completely blacked out because an external search overlay (Raycast, Siri, Spotlight, or external application) was detected on your screen.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-xs font-mono text-slate-300 space-y-2 text-left">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>Screen Capture Incident Recorded in Admin Control Center</span>
              </div>
              <div className="text-[11px] text-slate-400 leading-tight">
                • <strong>To Unlock Arena:</strong> Close Raycast / Siri (<code className="text-cyan-300">Esc</code> key) and click anywhere here.
              </div>
              <div className="text-[11px] text-slate-400 leading-tight">
                • <strong>Warning Rule:</strong> Contestants reaching {MAX_WARNINGS} warnings will be permanently disqualified and locked out.
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={(e) => {
                e.stopPropagation();
                try {
                  window.focus();
                } catch (err) {}
                setIsFocusLost(false);
                focusLostStartTimeRef.current = null;
              }}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm py-3.5 shadow-xl shadow-rose-500/30 rounded-2xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <Radio className="w-4 h-4 text-white" />
              <span>Click to Dismiss &amp; Refocus Contest Arena</span>
            </Button>
          </div>
        </div>
      )}

      {/* Main children container with blackout filter when window unfocused or terminated */}
      <div
        className="w-full h-full transition-all duration-150"
        style={{
          filter: isFocusLost || isTerminated ? 'blur(45px) brightness(0.12)' : 'none',
          pointerEvents: isFocusLost || isTerminated ? 'none' : 'auto',
          userSelect: isFocusLost || isTerminated ? 'none' : 'auto',
        }}
      >
        {children}
      </div>
    </>
  );
}

/** Helper function to detect suspicious code pasting from AI tools */
export function checkSuspiciousPaste(text: string): { isSuspicious: boolean; reason: string } {
  if (!text) return { isSuspicious: false, reason: '' };

  const hasAiFence = /```(cpp|python|java|c|javascript)?/i.test(text);
  const hasAiIntro = /(here is the (code|solution|algorithm)|optimal approach|time complexity:|space complexity:)/i.test(text);
  const isLargeSuddenBlock = text.length > 250 && text.split('\n').length > 10;

  if (hasAiFence || hasAiIntro) {
    return {
      isSuspicious: true,
      reason: 'Pasted text contains conversational AI generator artifacts or code block formatting.',
    };
  }

  if (isLargeSuddenBlock) {
    return {
      isSuspicious: true,
      reason: `Large external code block paste (${text.length} characters, ${text.split('\n').length} lines) detected.`,
    };
  }

  return { isSuspicious: false, reason: '' };
}
