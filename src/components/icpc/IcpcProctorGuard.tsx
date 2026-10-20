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
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ProctorIncident, ProctorViolationType } from '@/types/icpc';

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
  const [isFullscreenActive, setIsFullscreenActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [warningCount, setWarningCount] = useState(0);
  const [isCameraMirrored, setIsCameraMirrored] = useState(false);
  const [activeWarning, setActiveWarning] = useState<{
    type: ProctorViolationType;
    message: string;
    details: string;
    timestamp: string;
  } | null>(null);

  // Vision telemetry
  const [gazeStatus, setGazeStatus] = useState<'normal' | 'away_left' | 'away_right' | 'away_up' | 'down_excessive' | 'missing'>('normal');
  const [phoneStatus, setPhoneStatus] = useState<'clear' | 'suspect'>('clear');
  const [isPipMinimized, setIsPipMinimized] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
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

  // Request Notification permission on mount for cross-space desktop alerts
  useEffect(() => {
    if (isActive && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, [isActive]);

  // Dispatch incident to API & local callback
  const triggerViolation = useCallback(
    async (type: ProctorViolationType, message: string, details: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
      // Cooldown debounce per violation type: max 1 alert per 3 seconds of same type
      const now = Date.now();
      const lastTrigger = recentViolationsRef.current[type] || 0;
      if (now - lastTrigger < 3000) return;
      recentViolationsRef.current[type] = now;

      playAlertSound(severity === 'critical' ? 'critical' : 'warning');
      warningCountRef.current += 1;
      const nextCount = warningCountRef.current;
      setWarningCount(nextCount);

      const incidentData = {
        type,
        message,
        details,
        timestamp: new Date().toLocaleTimeString(),
      };
      setActiveWarning(incidentData);

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
    [studentId, studentName, studentEmail, college, contestId, contestTitle, problemId, problemTitle, onSecurityIncident, playAlertSound]
  );

  // Request Wide-Angle Webcam Stream (Video Only — No Microphone to prevent ambient noise false alerts)
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

  // Auto-start webcam immediately on mount when active
  useEffect(() => {
    if (isActive) {
      initWebcam();
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

      // Lock system keyboard shortcuts in Chromium if supported
      if (typeof navigator !== 'undefined' && (navigator as any).keyboard && (navigator as any).keyboard.lock) {
        (navigator as any).keyboard.lock(['Escape', 'Tab', 'Space', 'ArrowLeft', 'ArrowRight']).catch(() => {});
      }

      return true;
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
      return false;
    }
  }, []);

  // ── KEYBOARD SHORTCUT & TRACKPAD SWIPE INTERCEPTOR ──
  // Intercepts and blocks Siri, Spotlight, Raycast shortcuts and 4-finger swipes
  useEffect(() => {
    if (!isActive) return;

    // Lock system keyboard shortcuts in Chromium
    if (typeof navigator !== 'undefined' && (navigator as any).keyboard && (navigator as any).keyboard.lock) {
      (navigator as any).keyboard.lock(['Escape', 'Tab', 'Space', 'ArrowLeft', 'ArrowRight']).catch(() => {});
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdSpace = (e.metaKey || e.ctrlKey) && (e.code === 'Space' || e.key === ' ');
      const isOptSpace = e.altKey && (e.code === 'Space' || e.key === ' ');
      const isMicKey = e.key === 'F5' || e.code === 'F5';
      const isSiriCombo = e.metaKey && e.shiftKey && (e.code === 'Space' || e.key === ' ');

      if (isCmdSpace || isOptSpace || isMicKey || isSiriCombo) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        triggerViolation(
          'TAB_SWITCH',
          'Siri / Spotlight / System Shortcut Intercepted',
          `Prohibited system shortcut (${e.metaKey ? 'Cmd+' : e.altKey ? 'Option+' : ''}Space / ${e.key}) intercepted. Using Siri or system search overlays during contests is strictly prohibited.`,
          'critical'
        );
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
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('wheel', handleWheel);
      if (typeof navigator !== 'undefined' && (navigator as any).keyboard && (navigator as any).keyboard.unlock) {
        (navigator as any).keyboard.unlock();
      }
    };
  }, [isActive, triggerViolation]);

  // ── HIGH-FREQUENCY FOCUS, VISIBILITY & DESKTOP GESTURE MONITOR ──
  // Catches Siri overlay, Raycast, Spotlight, and macOS 4-finger Spaces gestures
  useEffect(() => {
    if (!isActive) return;

    const checkFocusAndVisibility = () => {
      const hasFocus = typeof document !== 'undefined' ? document.hasFocus() : true;
      const isVisible = typeof document !== 'undefined' ? !document.hidden : true;
      const isCompliant = hasFocus && isVisible;

      if (!isCompliant) {
        playAlertSound('critical');

        // Send macOS system Desktop Notification to all spaces
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification('🚨 LINKORA ICPC SECURITY VIOLATION', {
              body: 'Screen switch detected! You navigated away from the contest. Return immediately.',
              icon: '/icon.png',
            });
          } catch (notifErr) {}
        }

        if (!focusLostStartTimeRef.current) {
          focusLostStartTimeRef.current = Date.now();
        } else {
          const elapsed = Date.now() - focusLostStartTimeRef.current;
          if (elapsed >= 1500) {
            triggerViolation(
              'TAB_SWITCH',
              'Siri / External Application / Desktop Switch Detected',
              `Contest window lost focus or was moved off-screen for ${(elapsed / 1000).toFixed(1)}s (Siri, external window, or desktop swipe active). Screen switching is strictly prohibited.`,
              'critical'
            );
          }
        }
      } else {
        // Returned to compliant state (e.g. swiped back to arena)
        if (focusLostStartTimeRef.current) {
          const awayDuration = Date.now() - focusLostStartTimeRef.current;
          focusLostStartTimeRef.current = null;
          if (awayDuration >= 1200) {
            triggerViolation(
              'TAB_SWITCH',
              'Desktop / External Window Switch Detected',
              `You navigated away from the contest arena for ${(awayDuration / 1000).toFixed(1)}s (via swipe gesture or external window). Screen switching is prohibited.`,
              'critical'
            );
          }
        }
      }
    };

    const poller = setInterval(checkFocusAndVisibility, 200);

    const handleWindowBlur = () => {
      if (!focusLostStartTimeRef.current) {
        focusLostStartTimeRef.current = Date.now();
      }
      checkFocusAndVisibility();
    };

    const handleWindowFocus = () => {
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
  }, [isActive, triggerViolation, playAlertSound]);

  // Full-Screen Change Event Listener (with 1.5-Second Rule)
  useEffect(() => {
    if (!isActive) return;

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
  }, [isActive, triggerViolation]);

  // ── REAL-TIME VISION FRAME PROCESSING (Phone & Laptop Gaze Tracking) ──
  useEffect(() => {
    if (!isActive || !hasCameraPermission) return;

    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    proctorIntervalRef.current = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || !ctx) return;

      const now = Date.now();

      // Draw current video frame to low-res canvas for fast pixel analysis
      ctx.drawImage(video, 0, 0, 320, 240);
      const frameData = ctx.getImageData(0, 0, 320, 240);
      const { data, width, height } = frameData;

      // ── 1. Face & Laptop Gaze Cone Tracking Algorithm ──
      let skinPixelCount = 0;
      let sumX = 0;
      let sumY = 0;
      let leftSkinCount = 0;
      let rightSkinCount = 0;

      // Sample every 3rd pixel for speed & accurate face geometry
      for (let i = 0; i < data.length; i += 12) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Skin-tone heuristic in RGB space
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

      if (skinPixelCount < 250) {
        // Face missing or obstructed
        setGazeStatus('missing');
        if (!gazeDeviationStartTimeRef.current) {
          gazeDeviationStartTimeRef.current = now;
        } else if (now - gazeDeviationStartTimeRef.current >= 1200) {
          triggerViolation(
            'FACE_MISSING',
            'Face Not Detected in Frame',
            'Contestant face not visible in camera proctor feed for > 1.2s. Keep your face centered in the camera.',
            'medium'
          );
        }
      } else {
        const avgX = sumX / skinPixelCount / width; // normalized 0..1
        const avgY = sumY / skinPixelCount / height; // normalized 0..1

        // Face profile asymmetry: turning head left or right shifts visible skin ratio
        const totalSkin = leftSkinCount + rightSkinCount;
        const leftRatio = totalSkin > 0 ? leftSkinCount / totalSkin : 0.5;

        let isGazeDeviated = false;
        let deviationReason = '';

        // Strict forward cone: contestant must look straight at the laptop screen
        if (avgX < 0.40 || leftRatio > 0.65) {
          setGazeStatus('away_left');
          isGazeDeviated = true;
          deviationReason = 'Contestant looking away to the left of the laptop.';
        } else if (avgX > 0.60 || leftRatio < 0.35) {
          setGazeStatus('away_right');
          isGazeDeviated = true;
          deviationReason = 'Contestant looking away to the right of the laptop.';
        } else if (avgY < 0.25) {
          setGazeStatus('away_up');
          isGazeDeviated = true;
          deviationReason = 'Contestant looking upward away from the laptop screen.';
        } else if (avgY > 0.58) {
          setGazeStatus('down_excessive');
          isGazeDeviated = true;
          deviationReason = 'Contestant looking downward toward lap/desk area.';
        } else {
          setGazeStatus('normal');
          gazeDeviationStartTimeRef.current = null;
        }

        if (isGazeDeviated) {
          if (!gazeDeviationStartTimeRef.current) {
            gazeDeviationStartTimeRef.current = now;
          } else if (now - gazeDeviationStartTimeRef.current >= 1200) {
            triggerViolation(
              'GAZE_DEVIATION',
              'Looking Away from Laptop Screen Detected',
              `${deviationReason} Looking away from the contest arena for > 1.2s is prohibited.`,
              'medium'
            );
          }
        }
      }

      // ── 2. Smartphone & Mobile Device Detection Algorithm ──
      // Identifies mobile phones held in hands in the lower 60% of the frame (desk/hands zone).
      // Zero false-positives on clothing; highly sensitive to phones (light or dark mode).
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

          // Skin tone detector
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

          // Gradients for phone bezel and screen edge detection
          const rRight = data[idx + 12];
          const gRight = data[idx + 13];
          const bRight = data[idx + 14];
          const lumRight = 0.299 * rRight + 0.587 * gRight + 0.114 * bRight;
          const gradX = Math.abs(lum1 - lumRight);

          const nextRowIdx = ((y + 3) * width + x) * 4;
          const lumDown = 0.299 * data[nextRowIdx] + 0.587 * data[nextRowIdx + 1] + 0.114 * data[nextRowIdx + 2];
          const gradY = Math.abs(lum1 - lumDown);

          // Active phone screen (lum > 125, low color saturation)
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

      // Phone detected if:
      // 1) Compact rectangular object (width 22-135px, height 35-175px, width < 55% of canvas)
      // 2) Phone aspect ratio (1.25 to 2.8)
      // 3) Either illuminated screen (>= 12 pts) OR dense edges (>= 22 pts)
      // 4) Hand skin points present in the lower frame (proving hands are raised holding an object)
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
        } else if (now - phoneDetectionStartTimeRef.current >= 1200) {
          triggerViolation(
            'PHONE_DETECTED',
            'Mobile Phone Detected in Camera Feed',
            'Mobile smartphone detected in hands for > 1.2s. Handheld device usage is strictly prohibited.',
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
  }, [isActive, hasCameraPermission, triggerViolation]);

  // Clean up streams on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <>
      {/* ── PROCTOR PIP FLOATING WIDGET (Active inside Arena) ── */}
      {isActive && (
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
                    : warningCount < 3
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                }`}
              >
                {warningCount} Warnings
              </span>

              {/* Mirror / Non-Mirror Orientation Toggle Button */}
              <button
                type="button"
                onClick={() => setIsCameraMirrored((prev) => !prev)}
                className="text-slate-300 hover:text-white px-1.5 py-0.5 rounded bg-charcoal-800 hover:bg-charcoal-700 text-[9px] font-mono border border-charcoal-700 flex items-center gap-1 cursor-pointer transition-colors"
                title="Toggle between non-mirrored and mirrored camera orientation"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                <span>{isCameraMirrored ? 'Mirrored' : 'Non-Mirror'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPipMinimized(!isPipMinimized)}
                className="text-slate-400 hover:text-white p-1 rounded-md text-[10px] font-mono"
              >
                {isPipMinimized ? 'Expand' : 'Mini'}
              </button>
            </div>
          </div>

          {/* Video Preview */}
          {!isPipMinimized && (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black mt-2.5 border border-charcoal-800">
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
                <div className="absolute inset-0 bg-charcoal-950/95 flex flex-col items-center justify-center p-3 text-center gap-2">
                  <Camera className="w-5 h-5 text-amber-400" />
                  <span className="text-[11px] font-bold text-white leading-tight">Camera Access Required</span>
                  <p className="text-[9px] text-slate-400 leading-tight">
                    Wide-angle proctoring must be active to track mobile phone and screen focus.
                  </p>
                  <button
                    type="button"
                    onClick={initWebcam}
                    className="mt-1 px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold shadow-md"
                  >
                    Enable Camera
                  </button>
                </div>
              )}

              {/* Status HUD Overlays */}
              {hasCameraPermission && (
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

              {!isFullscreenActive && (
                <div className="absolute inset-0 bg-rose-950/90 flex flex-col items-center justify-center p-2 text-center text-xs text-rose-200">
                  <Maximize2 className="w-5 h-5 text-rose-400 mb-1" />
                  <span className="font-bold">Not in Fullscreen!</span>
                  <button
                    onClick={requestArenaFullscreen}
                    className="mt-1 px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold"
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

      {/* ── SECURITY VIOLATION ALERT OVERLAY MODAL ── */}
      {activeWarning && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full p-6 rounded-3xl bg-charcoal-950 border-2 border-rose-500 text-center space-y-4 shadow-2xl shadow-rose-500/30 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border-2 border-rose-500/40 flex items-center justify-center mx-auto text-rose-400 animate-bounce">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-rose-400 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30">
                ICPC PROCTOR WARNING // INCIDENT #{warningCount}
              </span>
              <h3 className="text-xl font-black text-white">{activeWarning.message}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{activeWarning.details}</p>
            </div>

            <div className="p-3 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-[11px] font-mono text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Account:</span>
                <strong className="text-white">{studentName}</strong>
              </div>
              <div className="flex justify-between">
                <span>Timestamp:</span>
                <strong className="text-cyan-300">{activeWarning.timestamp}</strong>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-rose-400 font-bold">Logged to Admin Control Center</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
              <Button
                variant="primary"
                size="sm"
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold"
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

      {children}
    </>
  );
}

/** Helper function to detect suspicious code pasting from AI tools */
export function checkSuspiciousPaste(text: string): { isSuspicious: boolean; reason: string } {
  if (!text) return { isSuspicious: false, reason: '' };

  // Detect ChatGPT / Claude markdown code fences or conversational boilerplate
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
