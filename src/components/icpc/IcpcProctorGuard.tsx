'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
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
        } as any,
        audio: false,
      });

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          setHasScreenPermission(false);
          triggerViolation(
            'SCREEN_SHARE_STOPPED',
            'Screen Sharing Was Terminated',
            'Mandatory screen sharing was stopped during the active contest. The contest arena has been disqualified and session terminated.',
            'critical'
          );
          setIsTerminated(true);
        };
      }

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

  // ── WEBRTC 60FPS FLUID LIVE SCREEN BROADCASTER TO ADMIN ──
  useEffect(() => {
    if (!isActive || showEntranceModal || isTerminated || !hasScreenPermission) return;
    const stream = screenStreamRef.current;
    if (!stream) return;

    let pc: RTCPeerConnection | null = null;
    let pollInterval: NodeJS.Timeout | null = null;
    let isCreatingOffer = false;
    const seenCandidates = new Set<string>();

    const setupPeerConnection = async () => {
      try {
        if (pc) {
          pc.close();
        }
        seenCandidates.clear();

        pc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        });

        // Add display video tracks to connection
        stream.getTracks().forEach((track) => {
          pc?.addTrack(track, stream);
        });

        // Send local candidates
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            fetch('/api/icpc/proctor/webrtc', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'candidate',
                studentId,
                role: 'student',
                candidate: event.candidate,
              }),
            }).catch(() => {});
          }
        };

        // Create and publish SDP offer
        isCreatingOffer = true;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        await fetch('/api/icpc/proctor/webrtc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'offer',
            studentId,
            sdp: offer,
          }),
        });
        isCreatingOffer = false;
      } catch (err) {
        console.warn('WebRTC broadcaster setup error:', err);
        isCreatingOffer = false;
      }
    };

    setupPeerConnection();

    // Signaling poller for Admin SDP Answer & ICE candidates
    pollInterval = setInterval(async () => {
      if (!pc || isCreatingOffer) return;

      try {
        // Check for Admin SDP Answer or Admin re-offer request
        const res = await fetch('/api/icpc/proctor/webrtc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'get_answer',
            studentId,
          }),
        });
        const data = await res.json();

        if (data.needsOffer) {
          await setupPeerConnection();
          return;
        }

        if (data.answer && pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        }

        // Fetch ICE candidates from admin
        if (pc.remoteDescription) {
          const candRes = await fetch('/api/icpc/proctor/webrtc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'get_candidates',
              studentId,
              role: 'student',
            }),
          });
          const candData = await candRes.json();
          if (Array.isArray(candData.candidates)) {
            for (const cand of candData.candidates) {
              const key = cand.candidate || JSON.stringify(cand);
              if (!seenCandidates.has(key)) {
                seenCandidates.add(key);
                pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
              }
            }
          }
        }
      } catch (e) {
        // Silently tolerate temporary network glitch
      }
    }, 1500);

    return () => {
      if (pollInterval) clearInterval(pollInterval);
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

    // Block horizontal trackpad gestures (swiping spaces or navigation)
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > 25 && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        triggerViolation(
          'TAB_SWITCH',
          '4-Finger Trackpad Desktop Swipe Gesture Detected',
          'Horizontal trackpad swiping (switching desktops or spaces) is strictly prohibited during ICPC contests.',
          'critical'
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('wheel', handleWheel);
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
          if (elapsed >= 300) {
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
          if (awayDuration >= 500) {
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

      ctx.drawImage(video, 0, 0, 320, 240);
      const frameData = ctx.getImageData(0, 0, 320, 240);
      const { data, width, height } = frameData;

      // ── 1. Face & Laptop Gaze Cone Tracking Algorithm ──
      let skinPixelCount = 0;
      let sumX = 0;
      let sumY = 0;
      let leftSkinCount = 0;
      let rightSkinCount = 0;

      for (let i = 0; i < data.length; i += 12) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const isSkin =
          r > 60 &&
          g > 35 &&
          b > 20 &&
          r > g &&
          r > b &&
          r - g > 12 &&
          Math.abs(r - g) > 12;

        if (isSkin) {
          const pixelIdx = i / 4;
          const px = pixelIdx % width;
          const py = Math.floor(pixelIdx / width);
          sumX += px;
          sumY += py;
          skinPixelCount++;

          if (px < width / 2) {
            leftSkinCount++;
          } else {
            rightSkinCount++;
          }
        }
      }

      if (skinPixelCount < 180) {
        setGazeStatus('missing');
        if (!gazeDeviationStartTimeRef.current) {
          gazeDeviationStartTimeRef.current = now;
        } else if (now - gazeDeviationStartTimeRef.current >= 3500) {
          triggerViolation(
            'FACE_MISSING',
            'Face Not Detected in Frame',
            'Contestant face not visible in camera proctor feed for > 3.5s. Keep your face centered in the camera.',
            'medium'
          );
        }
      } else {
        const avgX = sumX / skinPixelCount / width;
        const avgY = sumY / skinPixelCount / height;

        const totalSkin = leftSkinCount + rightSkinCount;
        const leftRatio = totalSkin > 0 ? leftSkinCount / totalSkin : 0.5;

        let isGazeDeviated = false;
        let deviationReason = '';

        // Calibrated cone: wide natural tolerance so looking straight or at problem text never glitches
        if (avgX < 0.18 || leftRatio > 0.88) {
          setGazeStatus('away_left');
          isGazeDeviated = true;
          deviationReason = 'Contestant turned head far left away from the laptop.';
        } else if (avgX > 0.82 || leftRatio < 0.12) {
          setGazeStatus('away_right');
          isGazeDeviated = true;
          deviationReason = 'Contestant turned head far right away from the laptop.';
        } else if (avgY < 0.15) {
          setGazeStatus('away_up');
          isGazeDeviated = true;
          deviationReason = 'Contestant looking upward away from the laptop screen.';
        } else if (avgY > 0.72) {
          setGazeStatus('down_excessive');
          isGazeDeviated = true;
          deviationReason = 'Contestant looking excessively downward toward lap area.';
        } else {
          setGazeStatus('normal');
          gazeDeviationStartTimeRef.current = null;
        }

        if (isGazeDeviated) {
          if (!gazeDeviationStartTimeRef.current) {
            gazeDeviationStartTimeRef.current = now;
          } else if (now - gazeDeviationStartTimeRef.current >= 3500) {
            triggerViolation(
              'GAZE_DEVIATION',
              'Looking Away from Laptop Screen Detected',
              `${deviationReason} Looking away from the contest arena for > 3.5s is prohibited.`,
              'medium'
            );
          }
        }
      }

      // ── 2. Smartphone & Mobile Device Detection Algorithm ──
      let phoneCandidateFound = false;
      const lowerYStart = Math.floor(height * 0.35);
      let phoneEdgePoints = 0;
      let phoneScreenPoints = 0;
      let handSkinPoints = 0;
      let minPhoneX = width;
      let maxPhoneX = 0;
      let minPhoneY = height;
      let maxPhoneY = 0;

      for (let y = lowerYStart; y < height - 2; y += 3) {
        for (let x = 8; x < width - 8; x += 3) {
          const idx = (y * width + x) * 4;
          const r1 = data[idx];
          const g1 = data[idx + 1];
          const b1 = data[idx + 2];
          const lum1 = 0.299 * r1 + 0.587 * g1 + 0.114 * b1;

          const isSkin =
            r1 > 60 &&
            g1 > 35 &&
            b1 > 20 &&
            r1 > g1 &&
            r1 > b1 &&
            r1 - g1 > 12;

          if (isSkin) {
            handSkinPoints++;
            continue;
          }

          const rRight = data[idx + 12];
          const gRight = data[idx + 13];
          const bRight = data[idx + 14];
          const lumRight = 0.299 * rRight + 0.587 * gRight + 0.114 * bRight;
          const gradX = Math.abs(lum1 - lumRight);

          const nextRowIdx = ((y + 3) * width + x) * 4;
          const lumDown = 0.299 * data[nextRowIdx] + 0.587 * data[nextRowIdx + 1] + 0.114 * data[nextRowIdx + 2];
          const gradY = Math.abs(lum1 - lumDown);

          const isIlluminatedScreen = lum1 > 125 && Math.abs(r1 - g1) < 32 && Math.abs(r1 - b1) < 36;
          const isSharpPhoneEdge = gradX > 25 || gradY > 25;

          if (isIlluminatedScreen || isSharpPhoneEdge) {
            if (isIlluminatedScreen) phoneScreenPoints++;
            if (isSharpPhoneEdge) phoneEdgePoints++;
            if (x < minPhoneX) minPhoneX = x;
            if (x > maxPhoneX) maxPhoneX = x;
            if (y < minPhoneY) minPhoneY = y;
            if (y > maxPhoneY) maxPhoneY = y;
          }
        }
      }

      const phoneW = Math.max(0, maxPhoneX - minPhoneX);
      const phoneH = Math.max(0, maxPhoneY - minPhoneY);
      const phoneAspect = phoneH > 0 && phoneW > 0 
        ? Math.max(phoneH / phoneW, phoneW / phoneH) 
        : 1;

      if (
        phoneW >= 22 && phoneW <= 135 &&
        phoneH >= 35 && phoneH <= 175 &&
        phoneW < width * 0.55 &&
        phoneAspect >= 1.25 && phoneAspect <= 2.8 &&
        handSkinPoints >= 15 &&
        (phoneScreenPoints >= 12 || phoneEdgePoints >= 22)
      ) {
        phoneCandidateFound = true;
      }

      if (phoneCandidateFound) {
        setPhoneStatus('suspect');
        if (!phoneDetectionStartTimeRef.current) {
          phoneDetectionStartTimeRef.current = now;
        } else if (now - phoneDetectionStartTimeRef.current >= 1500) {
          triggerViolation(
            'PHONE_DETECTED',
            'Mobile Phone Detected in Camera Feed',
            'Mobile smartphone detected in hands for > 1.5s. Handheld device usage is strictly prohibited.',
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

      {/* ── PROCTOR PIP FLOATING WIDGET (Active inside Arena) ── */}
      {isActive && !showEntranceModal && !isTerminated && (
        <div
          className={`fixed z-50 transition-all duration-300 shadow-2xl rounded-2xl border ${
            activeWarning
              ? 'border-rose-500 bg-rose-950/90 shadow-rose-500/20'
              : phoneStatus === 'suspect' || gazeStatus !== 'normal'
              ? 'border-amber-500 bg-charcoal-900/95 shadow-amber-500/10'
              : 'border-cyan-500/40 bg-charcoal-900/95'
          } ${
            isPipMinimized
              ? 'bottom-4 right-4 w-60 p-2.5'
              : 'top-4 right-4 w-72 p-3'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-charcoal-800 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono font-bold text-white text-[11px]">AI Proctor Guard</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  warningCount === 0
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : warningCount < 6
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                }`}
              >
                {warningCount} / {MAX_WARNINGS} Warnings
              </span>

              {/* Feed Switcher: Camera vs Screen Share */}
              <button
                type="button"
                onClick={() => setPipFeedMode((prev) => (prev === 'camera' ? 'screen' : 'camera'))}
                className="text-cyan-300 hover:text-white px-1.5 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-[9px] font-mono border border-cyan-500/40 flex items-center gap-1 cursor-pointer transition-colors"
                title="Switch PiP preview between camera and screen share"
              >
                {pipFeedMode === 'camera' ? (
                  <>
                    <Monitor className="w-2.5 h-2.5 text-cyan-400" />
                    <span>Screen</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-2.5 h-2.5 text-cyan-400" />
                    <span>Camera</span>
                  </>
                )}
              </button>

              {/* Mirror / Non-Mirror Orientation Toggle Button (Camera only) */}
              {pipFeedMode === 'camera' && (
                <button
                  type="button"
                  onClick={() => setIsCameraMirrored((prev) => !prev)}
                  className="text-slate-300 hover:text-white px-1.5 py-0.5 rounded bg-charcoal-800 hover:bg-charcoal-700 text-[9px] font-mono border border-charcoal-700 flex items-center gap-1 cursor-pointer transition-colors"
                  title="Toggle between non-mirrored and mirrored camera orientation"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>{isCameraMirrored ? 'Mirrored' : 'Non-Mirror'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsPipMinimized(!isPipMinimized)}
                className="text-slate-400 hover:text-white p-1 rounded-md text-[10px] font-mono cursor-pointer"
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
        <div className="fixed inset-0 z-[120] bg-charcoal-950/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
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
                    <span>2. Entire Screen Share:</span>
                  </span>
                  <span className={hasScreenPermission ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {hasScreenPermission ? '✓ Screen Sharing Active' : '⚠ Action Required'}
                  </span>
                </div>

                {!hasScreenPermission ? (
                  <div className="p-3.5 rounded-xl bg-charcoal-900/80 border border-charcoal-750 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="space-y-0.5 text-left">
                      <p className="text-xs font-bold text-white">Share Entire Screen</p>
                      <p className="text-[11px] text-slate-400">
                        Choose <strong className="text-cyan-300">&quot;Entire Screen&quot;</strong> when prompted so your full monitor is monitored.
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
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Entire monitor sharing verified and connected</span>
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
                  <p className="text-[11px] font-mono text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                    ⚠ {screenError}
                  </p>
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
                {isDemolishedByAdmin ? 'Contest Demolished by Admin Proctor' : 'Academic Integrity Policy Enforced'}
              </h2>
              <p className="text-xs text-rose-200 leading-relaxed font-mono">
                {isDemolishedByAdmin
                  ? 'The contest faculty administrator has reviewed your session and forcefully demolished your contest attempt.'
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
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
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
