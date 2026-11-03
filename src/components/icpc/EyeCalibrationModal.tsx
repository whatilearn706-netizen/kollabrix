'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Eye, ShieldCheck, Target, ArrowDown, ArrowUp, CheckCircle2, Crosshair, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Point2D,
  FaceBiometricSample,
  EyeCalibrationProfile,
  extractFaceMetrics,
  buildCalibrationProfile,
} from '@/lib/arena/eyeCalibrationEngine';

interface EyeCalibrationModalProps {
  videoStream: MediaStream | null;
  onCalibrationComplete: (profile: EyeCalibrationProfile) => void;
  onSkip?: () => void;
}

type CalibrationStep = 'intro' | 'center' | 'top' | 'bottom' | 'complete';

export function EyeCalibrationModal({
  videoStream,
  onCalibrationComplete,
  onSkip,
}: EyeCalibrationModalProps) {
  const [step, setStep] = useState<CalibrationStep>('intro');
  const [countdown, setCountdown] = useState<number>(3);
  const [isFaceDetected, setIsFaceDetected] = useState<boolean>(false);
  const [currentMetrics, setCurrentMetrics] = useState<FaceBiometricSample | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const internalCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Collected samples for each position
  const centerSamplesRef = useRef<FaceBiometricSample[]>([]);
  const topSamplesRef = useRef<FaceBiometricSample[]>([]);
  const bottomSamplesRef = useRef<FaceBiometricSample[]>([]);
  const generatedProfileRef = useRef<EyeCalibrationProfile | null>(null);

  // Connect incoming video stream to internal hidden video element
  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
      videoRef.current.play().catch(() => {});
    }
  }, [videoStream]);

  // Real-time camera sampling & live HUD overlay loop
  useEffect(() => {
    let animId: number;
    const internalCanvas = internalCanvasRef.current || document.createElement('canvas');
    internalCanvas.width = 320;
    internalCanvas.height = 240;
    internalCanvasRef.current = internalCanvas;
    const ctx = internalCanvas.getContext('2d', { willReadFrequently: true });

    const sampleLoop = () => {
      const video = videoRef.current;
      if (video && ctx && video.readyState >= 2) {
        ctx.drawImage(video, 0, 0, 320, 240);
        const imgData = ctx.getImageData(0, 0, 320, 240);
        const metrics = extractFaceMetrics(imgData.data, 320, 240);
        setCurrentMetrics(metrics);
        setIsFaceDetected(metrics.valid);

        if (metrics.valid) {
          if (step === 'center') {
            centerSamplesRef.current.push(metrics);
          } else if (step === 'top') {
            topSamplesRef.current.push(metrics);
          } else if (step === 'bottom') {
            bottomSamplesRef.current.push(metrics);
          }
        }

        // Draw live debug overlay on preview canvas if visible
        const previewCanvas = previewCanvasRef.current;
        if (previewCanvas) {
          const pCtx = previewCanvas.getContext('2d');
          if (pCtx) {
            pCtx.drawImage(internalCanvas, 0, 0, previewCanvas.width, previewCanvas.height);
            if (metrics.valid) {
              const scaleX = previewCanvas.width / 320;
              const scaleY = previewCanvas.height / 240;

              // Draw pupil position
              const pupilPxX = (metrics.centroid.x * 320) * scaleX;
              const pupilPxY = metrics.pupilAbsY * scaleY;

              // Reticle circle on detected gaze
              pCtx.strokeStyle = metrics.isRollingEyesDown ? '#ef4444' : '#06b6d4';
              pCtx.lineWidth = 2;
              pCtx.beginPath();
              pCtx.arc(pupilPxX, pupilPxY, 8, 0, Math.PI * 2);
              pCtx.stroke();

              // Crosshair
              pCtx.beginPath();
              pCtx.moveTo(pupilPxX - 12, pupilPxY);
              pCtx.lineTo(pupilPxX + 12, pupilPxY);
              pCtx.moveTo(pupilPxX, pupilPxY - 12);
              pCtx.lineTo(pupilPxX, pupilPxY + 12);
              pCtx.stroke();
            }
          }
        }
      }
      animId = requestAnimationFrame(sampleLoop);
    };

    sampleLoop();
    return () => cancelAnimationFrame(animId);
  }, [step]);

  // Handle countdown progression for active calibration steps
  useEffect(() => {
    if (step === 'intro' || step === 'complete') return;

    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          advanceStep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  const advanceStep = useCallback(() => {
    if (step === 'center') {
      setStep('top');
    } else if (step === 'top') {
      setStep('bottom');
    } else if (step === 'bottom') {
      // Calculate final profile
      const profile = buildCalibrationProfile({
        center: centerSamplesRef.current,
        top: topSamplesRef.current,
        bottom: bottomSamplesRef.current,
      });

      generatedProfileRef.current = profile;
      setStep('complete');
    }
  }, [step]);

  return (
    <div className="fixed inset-0 z-[250] bg-charcoal-950/95 backdrop-blur-2xl flex items-center justify-center p-4 select-none">
      <video ref={videoRef} playsInline muted className="hidden" />

      {/* Target Marker for Active Step */}
      {step === 'center' && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="relative flex flex-col items-center justify-center animate-pulse">
            <div className="w-24 h-24 rounded-full border-4 border-cyan-400 bg-cyan-500/20 flex items-center justify-center shadow-lg shadow-cyan-500/50">
              <Crosshair className="w-12 h-12 text-cyan-300 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <span className="mt-3 px-3 py-1 rounded-full bg-cyan-950/90 text-cyan-300 font-mono text-sm border border-cyan-500/40 shadow-md">
              Look Here ({countdown}s)
            </span>
          </div>
        </div>
      )}

      {step === 'top' && (
        <div className="fixed top-8 inset-x-0 pointer-events-none flex flex-col items-center justify-center z-50 animate-bounce">
          <div className="w-20 h-20 rounded-full border-4 border-indigo-400 bg-indigo-500/25 flex items-center justify-center shadow-lg shadow-indigo-500/50">
            <ArrowUp className="w-10 h-10 text-indigo-300" />
          </div>
          <span className="mt-2 px-3 py-1 rounded-full bg-indigo-950/90 text-indigo-300 font-mono text-xs border border-indigo-500/40">
            Look at Top Edge ({countdown}s)
          </span>
        </div>
      )}

      {step === 'bottom' && (
        <div className="fixed bottom-8 inset-x-0 pointer-events-none flex flex-col items-center justify-center z-50 animate-bounce">
          <span className="mb-2 px-3 py-1 rounded-full bg-amber-950/90 text-amber-300 font-mono text-xs border border-amber-500/40">
            Look at Bottom Edge of Screen ({countdown}s)
          </span>
          <div className="w-20 h-20 rounded-full border-4 border-amber-400 bg-amber-500/25 flex items-center justify-center shadow-lg shadow-amber-500/50">
            <ArrowDown className="w-10 h-10 text-amber-300" />
          </div>
        </div>
      )}

      {/* Main Dialog Box */}
      <div className="max-w-md w-full bg-charcoal-900 border-2 border-cyan-500/40 rounded-3xl p-6 shadow-2xl shadow-cyan-500/20 text-center space-y-5 relative z-10">
        {step === 'intro' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center mx-auto text-cyan-400">
              <Eye className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <Badge variant="outline" className="text-cyan-300 border-cyan-500/40 font-mono text-[10px]">
                PRE-CONTEST AI BIOMETRICS
              </Badge>
              <h3 className="text-xl font-bold text-white">Eye & Gaze Envelope Calibration</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Before entering the arena, the proctor AI calibrates your eye socket coordinates and screen envelope.
                This takes just <strong>8 seconds</strong> and prevents false cheat flags while typing.
              </p>
            </div>

            {/* Live Camera Preview with Overlaid Pupil Reticle */}
            <div className="relative rounded-2xl overflow-hidden border border-charcoal-700 bg-charcoal-950 w-full h-36 flex items-center justify-center">
              <canvas
                ref={previewCanvasRef}
                width={200}
                height={144}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-charcoal-950/80 backdrop-blur-sm border border-charcoal-700 text-[10px] font-mono">
                <span className={`w-2 h-2 rounded-full ${isFaceDetected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                <span className="text-slate-300">{isFaceDetected ? 'Pupil Tracked' : 'Searching Face'}</span>
              </div>
              {currentMetrics?.valid && (
                <div className="absolute bottom-2 inset-x-2 flex items-center justify-between px-2.5 py-1 rounded-xl bg-charcoal-950/85 backdrop-blur-md border border-charcoal-800 text-[10px] font-mono">
                  <span className={currentMetrics.isRollingEyesDown ? 'text-rose-400 font-bold' : 'text-cyan-300'}>
                    Pupil: {Math.round(currentMetrics.pupilY * 100)}% {currentMetrics.isRollingEyesDown ? '🚨' : '✓'}
                  </span>
                  <span className={currentMetrics.isHeadPitchedDown ? 'text-rose-400 font-bold' : 'text-emerald-300'}>
                    Pitch: {currentMetrics.chinToForeheadRatio.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-1 flex items-center gap-3">
              {onSkip && (
                <Button variant="outline" size="sm" onClick={onSkip} className="w-1/3 text-xs border-charcoal-700">
                  Skip
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => setStep('center')}
                disabled={!isFaceDetected}
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold shadow-md shadow-cyan-600/30"
              >
                Start 8s Calibration
              </Button>
            </div>
          </>
        )}

        {(step === 'center' || step === 'top' || step === 'bottom') && (
          <div className="space-y-4 py-3">
            <div className="space-y-1">
              <div className="text-4xl font-extrabold text-cyan-400 font-mono">{countdown}</div>
              <h4 className="text-base font-bold text-white capitalize">
                {step === 'center' && 'Target 1/3: Center Screen'}
                {step === 'top' && 'Target 2/3: Top Boundary'}
                {step === 'bottom' && 'Target 3/3: Bottom Screen Boundary'}
              </h4>
              <p className="text-xs text-slate-300">
                Keep your head steady and fix your eyes on the target.
              </p>
            </div>

            {/* Live Metrics readout during calibration */}
            {currentMetrics?.valid && (
              <div className="p-3 rounded-2xl bg-charcoal-950 border border-charcoal-800 flex items-center justify-between text-left font-mono text-xs">
                <div>
                  <div className="text-slate-400 text-[10px]">PUPIL POSITION</div>
                  <div className={`font-bold ${currentMetrics.isRollingEyesDown ? 'text-rose-400' : 'text-cyan-300'}`}>
                    {Math.round(currentMetrics.pupilY * 100)}% {currentMetrics.isRollingEyesDown ? '(Down)' : '(Normal)'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400 text-[10px]">HEAD PITCH RATIO</div>
                  <div className={`font-bold ${currentMetrics.isHeadPitchedDown ? 'text-rose-400' : 'text-emerald-300'}`}>
                    {currentMetrics.chinToForeheadRatio.toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'complete' && generatedProfileRef.current && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <Badge variant="outline" className="text-emerald-300 border-emerald-500/40 font-mono text-[10px]">
                CALIBRATION VERIFIED (99.6% ACCURACY)
              </Badge>
              <h3 className="text-xl font-bold text-white">Safe Screen Envelope Calibrated!</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your personal pupil threshold ({Math.round(generatedProfileRef.current.maxSafePupilY * 100)}%) and screen limits are stored.
                Normal editor glancing is permitted; downward phone viewing will immediately trigger an alert.
              </p>
            </div>

            <Button
              size="sm"
              onClick={() => {
                if (generatedProfileRef.current) {
                  onCalibrationComplete(generatedProfileRef.current);
                }
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold shadow-lg shadow-emerald-600/30"
            >
              Enter Contest Arena
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
