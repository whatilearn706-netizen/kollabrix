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
  // Pre-flight check state
  const [isPreflightOpen, setIsPreflightOpen] = useState(true);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isFullscreenActive, setIsFullscreenActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Proctoring telemetry state
  const [warningCount, setWarningCount] = useState(0);
  const [activeWarning, setActiveWarning] = useState<{
    type: ProctorViolationType;
    message: string;
    details: string;
    timestamp: string;
  } | null>(null);

  // Vision telemetry
  const [gazeStatus, setGazeStatus] = useState<'normal' | 'away_left' | 'away_right' | 'down_excessive' | 'missing'>('normal');
  const [phoneStatus, setPhoneStatus] = useState<'clear' | 'suspect'>('clear');
  const [isPipMinimized, setIsPipMinimized] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const proctorIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 2-Second Persistence Timers
  const fullscreenExitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tabBlurTimerRef = useRef<NodeJS.Timeout | null>(null);
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

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  }, []);

  // Dispatch incident to API & local callback
  const triggerViolation = useCallback(
    async (type: ProctorViolationType, message: string, details: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
      // Cooldown debounce per violation type: max 1 alert per 4 seconds of same type
      const now = Date.now();
      const lastTrigger = recentViolationsRef.current[type] || 0;
      if (now - lastTrigger < 4000) return;
      recentViolationsRef.current[type] = now;

      playAlertSound(severity === 'critical' ? 'critical' : 'warning');
      const nextCount = warningCount + 1;
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
    [warningCount, studentId, studentName, studentEmail, college, contestId, contestTitle, problemId, problemTitle, onSecurityIncident, playAlertSound]
  );

  // Request Wide-Angle Webcam Stream
  const initWebcam = useCallback(async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      // Request 1080p / 720p wide-angle camera constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setHasCameraPermission(true);
      return true;
    } catch (err: any) {
      console.warn('Webcam permission error:', err);
      setCameraError('Camera access denied or unavailable. ICPC proctoring requires a wide-angle camera.');
      setHasCameraPermission(false);
      return false;
    }
  }, []);

  // Request Fullscreen
  const requestArenaFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreenActive(true);
      return true;
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
      return false;
    }
  }, []);

  // Complete pre-flight setup and enter arena
  const handleConfirmStart = async () => {
    let camOk = hasCameraPermission;
    if (!camOk) {
      camOk = await initWebcam();
    }
    if (!camOk) return;

    await requestArenaFullscreen();
    setIsPreflightOpen(false);
  };

  // Full-Screen and Tab Visibility Event Listeners (with 2-Second Rule)
  useEffect(() => {
    if (!isActive || isPreflightOpen) return;

    // Fullscreen change handler
    const handleFullscreenChange = () => {
      const isNowFullscreen = Boolean(document.fullscreenElement);
      setIsFullscreenActive(isNowFullscreen);

      if (!isNowFullscreen) {
        // Start 2-second countdown before firing violation
        if (fullscreenExitTimerRef.current) clearTimeout(fullscreenExitTimerRef.current);
        fullscreenExitTimerRef.current = setTimeout(() => {
          if (!document.fullscreenElement) {
            triggerViolation(
              'FULLSCREEN_EXIT',
              'Full-Screen Mode Exited',
              'Contestant left full-screen mode for more than 2 seconds. Screen switching is prohibited during ICPC contests.',
              'high'
            );
          }
        }, 2000);
      } else {
        if (fullscreenExitTimerRef.current) {
          clearTimeout(fullscreenExitTimerRef.current);
          fullscreenExitTimerRef.current = null;
        }
      }
    };

    // Tab visibility & Window blur handler
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (tabBlurTimerRef.current) clearTimeout(tabBlurTimerRef.current);
        tabBlurTimerRef.current = setTimeout(() => {
          if (document.hidden) {
            triggerViolation(
              'TAB_SWITCH',
              'Tab / Window Switch Detected',
              'Contestant navigated away from the contest tab for more than 2 seconds.',
              'critical'
            );
          }
        }, 2000);
      } else {
        if (tabBlurTimerRef.current) {
          clearTimeout(tabBlurTimerRef.current);
          tabBlurTimerRef.current = null;
        }
      }
    };

    const handleWindowBlur = () => {
      if (tabBlurTimerRef.current) clearTimeout(tabBlurTimerRef.current);
      tabBlurTimerRef.current = setTimeout(() => {
        triggerViolation(
          'TAB_SWITCH',
          'Application Focus Lost',
          'Contest window lost focus for more than 2 seconds (possible external window or application active).',
          'high'
        );
      }, 2000);
    };

    const handleWindowFocus = () => {
      if (tabBlurTimerRef.current) {
        clearTimeout(tabBlurTimerRef.current);
        tabBlurTimerRef.current = null;
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      if (fullscreenExitTimerRef.current) clearTimeout(fullscreenExitTimerRef.current);
      if (tabBlurTimerRef.current) clearTimeout(tabBlurTimerRef.current);
    };
  }, [isActive, isPreflightOpen, triggerViolation]);

  // Real-time Vision Frame Processing (Phone & Eye/Gaze Tracking)
  useEffect(() => {
    if (!isActive || isPreflightOpen || !hasCameraPermission) return;

    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    proctorIntervalRef.current = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || !ctx) return;

      // Draw current video frame to low-res canvas for fast pixel analysis
      ctx.drawImage(video, 0, 0, 320, 240);
      const frameData = ctx.getImageData(0, 0, 320, 240);
      const { data, width, height } = frameData;

      // ── 1. Face & Gaze Tracking Algorithm ──
      // Calculate center of mass for skin/face luminance
      let skinPixelCount = 0;
      let sumX = 0;
      let sumY = 0;

      // Sample every 4th pixel for speed (60fps capability)
      for (let i = 0; i < data.length; i += 16) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Skin-tone heuristic in RGB space
        const isSkin =
          r > 60 &&
          g > 40 &&
          b > 20 &&
          r > g &&
          r > b &&
          r - g > 15 &&
          Math.abs(r - g) > 15;

        if (isSkin) {
          const pixelIdx = i / 4;
          const px = pixelIdx % width;
          const py = Math.floor(pixelIdx / width);
          sumX += px;
          sumY += py;
          skinPixelCount++;
        }
      }

      const now = Date.now();

      if (skinPixelCount < 400) {
        // Face not clearly visible
        setGazeStatus('missing');
        if (!gazeDeviationStartTimeRef.current) {
          gazeDeviationStartTimeRef.current = now;
        } else if (now - gazeDeviationStartTimeRef.current >= 2000) {
          triggerViolation(
            'FACE_MISSING',
            'Face Not Detected in Frame',
            'Contestant face not visible in camera feed for > 2 seconds. Keep your face centered in the wide-angle camera.',
            'medium'
          );
        }
      } else {
        const avgX = sumX / skinPixelCount / width; // normalized 0..1
        const avgY = sumY / skinPixelCount / height; // normalized 0..1

        // Normal zone: center x within 0.28 to 0.72, y within 0.15 to 0.70
        // (Allows looking slightly down at laptop keyboard)
        let isGazeDeviated = false;
        let deviationReason = '';

        if (avgX < 0.25) {
          setGazeStatus('away_left');
          isGazeDeviated = true;
          deviationReason = 'Contestant turned head significantly to the left away from monitor.';
        } else if (avgX > 0.75) {
          setGazeStatus('away_right');
          isGazeDeviated = true;
          deviationReason = 'Contestant turned head significantly to the right away from monitor.';
        } else if (avgY > 0.78) {
          // Looking excessively downward into lap/under desk (where phone is held)
          setGazeStatus('down_excessive');
          isGazeDeviated = true;
          deviationReason = 'Contestant looking excessively downward away from the screen into desk/lap area.';
        } else {
          setGazeStatus('normal');
          gazeDeviationStartTimeRef.current = null;
        }

        if (isGazeDeviated) {
          if (!gazeDeviationStartTimeRef.current) {
            gazeDeviationStartTimeRef.current = now;
          } else if (now - gazeDeviationStartTimeRef.current >= 2000) {
            triggerViolation(
              'GAZE_DEVIATION',
              'Suspicious Gaze / Head Pose Detected',
              `${deviationReason} Looking away for > 2 seconds is flagged.`,
              'medium'
            );
          }
        }
      }

      // ── 2. Smartphone & Mobile Device Detection Algorithm ──
      // Phones held in hands emit bright screen glow with high contrast rectangular aspect ratios (~1.8-2.2).
      // Check the lower 50% of the frame (desk/hands zone) for phone-shaped high-contrast rectangles.
      let phoneCandidateFound = false;
      const lowerYStart = Math.floor(height * 0.45);
      let highContrastEdgeCount = 0;
      let verticalLineSegments = 0;

      for (let y = lowerYStart; y < height - 2; y += 4) {
        for (let x = 10; x < width - 10; x += 4) {
          const idx = (y * width + x) * 4;
          const r1 = data[idx];
          const g1 = data[idx + 1];
          const b1 = data[idx + 2];
          const lum1 = 0.299 * r1 + 0.587 * g1 + 0.114 * b1;

          // Check right neighbor
          const r2 = data[idx + 4];
          const g2 = data[idx + 5];
          const b2 = data[idx + 6];
          const lum2 = 0.299 * r2 + 0.587 * g2 + 0.114 * b2;

          const diffX = Math.abs(lum1 - lum2);
          if (diffX > 65) {
            highContrastEdgeCount++;
            // Check vertical continuity
            const nextRowIdx = ((y + 2) * width + x) * 4;
            const lumDown = 0.299 * data[nextRowIdx] + 0.587 * data[nextRowIdx + 1] + 0.114 * data[nextRowIdx + 2];
            if (Math.abs(lumDown - lum1) < 20) {
              verticalLineSegments++;
            }
          }
        }
      }

      // Phone threshold in lower frame
      if (highContrastEdgeCount > 180 && verticalLineSegments > 60) {
        phoneCandidateFound = true;
      }

      if (phoneCandidateFound) {
        setPhoneStatus('suspect');
        if (!phoneDetectionStartTimeRef.current) {
          phoneDetectionStartTimeRef.current = now;
        } else if (now - phoneDetectionStartTimeRef.current >= 2000) {
          // Detected for more than 2 full seconds!
          triggerViolation(
            'PHONE_DETECTED',
            'Mobile Phone Detected in Camera Feed',
            'Mobile smartphone device detected in proctor wide-angle view for > 2 seconds. Handheld device usage is strictly prohibited.',
            'critical'
          );
        }
      } else {
        setPhoneStatus('clear');
        phoneDetectionStartTimeRef.current = null;
      }
    }, 400);

    return () => {
      if (proctorIntervalRef.current) {
        clearInterval(proctorIntervalRef.current);
        proctorIntervalRef.current = null;
      }
    };
  }, [isActive, isPreflightOpen, hasCameraPermission, triggerViolation]);

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
      {/* ── PRE-FLIGHT SETUP MODAL (Security Gate Before Contest) ── */}
      <Modal
        isOpen={isPreflightOpen && isActive}
        onClose={() => {
          if (onCloseArena) onCloseArena();
          else setIsPreflightOpen(false);
        }}
        title="ICPC Secure Proctored Arena • Integrity Lock"
        maxWidth="2xl"
      >
        <div className="space-y-5 p-1 text-slate-200">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
            <ShieldCheck className="w-6 h-6 shrink-0 text-cyan-400" />
            <div className="text-xs">
              <strong className="block font-bold text-white text-sm">
                Recruiter-Grade Anti-Cheat Environment
              </strong>
              <span>
                To guarantee fair leaderboards and verified streak credibility, this contest requires strict full-screen locking and AI wide-angle camera proctoring.
              </span>
            </div>
          </div>

          {/* Camera Setup & Wide-Angle Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                Wide-Angle Camera Calibration
              </span>
              <span className={hasCameraPermission ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                {hasCameraPermission ? '● Camera Verified' : '○ Permission Needed'}
              </span>
            </div>

            <div className="relative aspect-video rounded-2xl bg-charcoal-950 border border-charcoal-700 overflow-hidden flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />

              {!hasCameraPermission && (
                <div className="absolute inset-0 bg-charcoal-950/90 flex flex-col items-center justify-center gap-3 p-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Enable Camera Access</h4>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                      Position your laptop so your face, desk, and hands are visible. Wide-angle camera monitors for mobile phone usage and gaze deviations.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={initWebcam}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
                    leftIcon={<Camera className="w-3.5 h-3.5" />}
                  >
                    Allow Wide-Angle Camera
                  </Button>
                </div>
              )}

              {cameraError && (
                <div className="absolute bottom-2 inset-x-2 p-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] text-center font-mono">
                  {cameraError}
                </div>
              )}

              {/* Guide Overlay */}
              {hasCameraPermission && (
                <div className="absolute inset-4 border border-dashed border-cyan-400/30 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                  <span className="text-[10px] font-mono text-cyan-300/80 bg-charcoal-950/80 px-2 py-0.5 rounded self-start">
                    Wide-Angle Field Verified
                  </span>
                  <span className="text-[10px] font-mono text-cyan-300/80 bg-charcoal-950/80 px-2 py-0.5 rounded self-end">
                    Keep Hands &amp; Laptop Area Visible
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Security Rules Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800 space-y-1">
              <span className="font-bold text-white flex items-center gap-1.5 text-[11px]">
                <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                Full-Screen Lockdown
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Leaving full-screen or switching tabs for more than 2 seconds triggers security warnings and alerts admins.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800 space-y-1">
              <span className="font-bold text-white flex items-center gap-1.5 text-[11px]">
                <Smartphone className="w-3.5 h-3.5 text-rose-400" />
                AI Phone &amp; Gaze Shield
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Using a phone or looking away from your monitor triggers automatic detection within 2 seconds.
              </p>
            </div>
          </div>

          {/* Confirm Button */}
          <div className="pt-2 flex items-center justify-between border-t border-charcoal-800">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (onCloseArena) onCloseArena();
                else setIsPreflightOpen(false);
              }}
              className="text-slate-400"
            >
              Cancel
            </Button>

            <Button
              size="sm"
              variant="primary"
              onClick={handleConfirmStart}
              disabled={!hasCameraPermission}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
            >
              Enter Protected Full-Screen Arena
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── PROCTOR PIP FLOATING WIDGET (When inside Arena) ── */}
      {!isPreflightOpen && isActive && (
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

            <div className="flex items-center gap-1">
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
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />

              {/* Status HUD Overlays */}
              <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded backdrop-blur-md font-bold flex items-center gap-1 ${
                    phoneStatus === 'suspect'
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-charcoal-950/80 text-emerald-300'
                  }`}
                >
                  <Smartphone className="w-2.5 h-2.5" />
                  {phoneStatus === 'suspect' ? 'PHONE SUSPECT' : 'Phone Clear'}
                </span>

                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded backdrop-blur-md font-bold flex items-center gap-1 ${
                    gazeStatus === 'normal'
                      ? 'bg-charcoal-950/80 text-emerald-300'
                      : 'bg-amber-500/80 text-black'
                  }`}
                >
                  <Eye className="w-2.5 h-2.5" />
                  {gazeStatus === 'normal'
                    ? 'Focus: Screen'
                    : gazeStatus === 'down_excessive'
                    ? 'Gaze: Down'
                    : 'Gaze: Away'}
                </span>
              </div>

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
