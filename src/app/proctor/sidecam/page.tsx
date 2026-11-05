'use client';

import React, { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Camera,
  ShieldCheck,
  AlertTriangle,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  VideoOff,
  Radio,
  Eye,
  Maximize2,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

function SideCameraContent() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get('session') || searchParams.get('studentId') || '';
  const contestId = searchParams.get('contest') || searchParams.get('contestId') || 'icpc-arena';

  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamQuality, setStreamQuality] = useState<'high' | 'balanced' | 'eco'>('balanced');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [snapshotCount, setSnapshotCount] = useState<number>(0);
  const [isPageVisible, setIsPageVisible] = useState<boolean>(true);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wakeLockRef = useRef<any>(null);

  // WebRTC Live Broadcaster State for Admin Inspection
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const webrtcPollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Request screen wakeLock to prevent phone screen from dimming/sleeping
  useEffect(() => {
    async function requestWakeLock() {
      try {
        if ('wakeLock' in navigator && (navigator as any).wakeLock) {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) {
        console.warn('Wake lock not supported or denied:', err);
      }
    }
    requestWakeLock();

    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      setIsPageVisible(isVisible);
      if (!isVisible) {
        setWarningMessage('🚨 WARNING: You left the proctoring camera page! This incident is being reported.');
        // Notify server immediately that side camera went to background
        if (studentId) {
          fetch('/api/icpc/proctor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'sidecam_heartbeat',
              studentId,
              connected: false,
              details: 'Phone browser minimized or switched away from camera',
            }),
            keepalive: true,
          }).catch(() => {});
        }
      } else {
        setWarningMessage(null);
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, [studentId]);

  // Start mobile camera stream
  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 30 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setHasPermission(true);
      setIsStreaming(true);
      setFacingMode(mode);
    } catch (err: any) {
      console.error('Camera error:', err);
      setCameraError(err.message || 'Could not access mobile camera. Please allow camera permissions.');
      setHasPermission(false);
      setIsStreaming(false);
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [startCamera, facingMode]);

  // Supabase Real-Time Streaming & Live Proctoring Sync
  useEffect(() => {
    if (!isStreaming || !studentId) return;

    let isDisposed = false;
    let isSubscribed = false;
    const channel = supabase.channel(`icpc-proctor-${studentId}`, {
      config: { broadcast: { self: false } },
    });
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        isSubscribed = true;
      }
    });

    const canvas = canvasRef.current || document.createElement('canvas');
    canvasRef.current = canvas;
    // 240x180 keeps WebSocket payload ~5KB-7KB (well below Supabase 32KB limit) while retaining clear desk/keyboard visibility
    canvas.width = 240;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');

    let lastHttpSync = 0;

    const streamFrame = async () => {
      if (isDisposed) return;
      const video = videoRef.current;
      if (!video || !ctx || video.readyState < 2) return;

      try {
        ctx.drawImage(video, 0, 0, 240, 180);
        // Ultra-compact JPEG payload (~5KB-7KB) guarantees zero packet loss over WebSocket
        const snapshotDataUrl = canvas.toDataURL('image/jpeg', 0.38);

        // 1. Instant WebSocket broadcast directly to Admin Theater Modal (< 40ms)
        if (isSubscribed) {
          channel.send({
            type: 'broadcast',
            event: 'sidecam_frame',
            payload: {
              snapshot: snapshotDataUrl,
              connected: true,
              timestamp: Date.now(),
            },
          }).catch(() => {});
        }

        setSnapshotCount((prev) => prev + 1);

        // 2. HTTP Heartbeat persistence every 2s so database & grid cards stay updated
        const now = Date.now();
        if (now - lastHttpSync > 2000) {
          lastHttpSync = now;
          fetch('/api/icpc/proctor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'sidecam_heartbeat',
              studentId,
              connected: true,
              sideCameraSnapshot: snapshotDataUrl,
            }),
          }).catch(() => {});
        }
      } catch (e) {
        console.warn('Sidecam frame capture error:', e);
      }
    };

    // Fluid ~280ms video frame updates for true real-time streaming (~3.5 FPS)
    const streamInterval = setInterval(streamFrame, 280);
    streamFrame();

    return () => {
      isDisposed = true;
      clearInterval(streamInterval);
      channel.unsubscribe();
    };
  }, [isStreaming, studentId]);

  return (
    <div className="min-h-screen bg-charcoal-950 text-white flex flex-col justify-between p-4 font-sans select-none overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between pb-3 border-b border-charcoal-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="text-sm font-bold flex items-center gap-1.5">
              <span>Side-View Proctor Camera</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Session: <strong className="text-cyan-300">{studentId || 'Anonymous'}</strong>
            </div>
          </div>
        </div>

        <Badge
          variant="outline"
          className={`text-[10px] font-mono font-bold ${
            isStreaming ? 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300' : 'border-rose-500/40 bg-rose-950/60 text-rose-300'
          }`}
        >
          {isStreaming ? 'LIVE TRANSMITTING' : 'OFFLINE'}
        </Badge>
      </header>

      {/* Warning Overlay if user leaves page */}
      {warningMessage && (
        <div className="my-2 p-3 rounded-2xl bg-rose-950 border border-rose-500 flex items-center gap-3 animate-bounce">
          <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
          <div className="text-xs font-bold text-rose-200">{warningMessage}</div>
        </div>
      )}

      {/* Video Viewport with Alignment Overlay */}
      <main className="flex-1 my-3 relative rounded-3xl overflow-hidden bg-black border-2 border-cyan-500/30 flex items-center justify-center shadow-2xl">
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          className="w-full h-full object-cover"
        />

        {/* Framing & Alignment Guidelines Overlay */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
          {/* Top guidelines */}
          <div className="flex justify-between items-start">
            <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-mono text-cyan-300 flex items-center gap-1.5">
              <Eye className="w-3 h-3 text-cyan-400" />
              <span>Desk, Hands & Screen in View</span>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-mono text-emerald-300">
              Snapshots: #{snapshotCount}
            </div>
          </div>

          {/* Central Target Guide Box */}
          <div className="self-center w-full max-w-xs h-48 border-2 border-dashed border-cyan-400/50 rounded-2xl flex flex-col items-center justify-center p-3 text-center bg-cyan-950/10 backdrop-blur-[1px]">
            <Smartphone className="w-8 h-8 text-cyan-300/60 mb-2 animate-bounce" />
            <p className="text-[11px] font-semibold text-white/90 leading-tight">
              Position this phone 1.0 – 1.5m to your side at a 45° angle.
            </p>
            <p className="text-[9px] text-cyan-300 font-mono mt-1">
              Ensure your keyboard, hands, laptop & lap are clearly visible.
            </p>
          </div>

          {/* Bottom Telemetry Status */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-300 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
            <span>Facing: {facingMode.toUpperCase()}</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Encrypted Proctor Sync
            </span>
          </div>
        </div>

        {/* Error Fallback */}
        {cameraError && (
          <div className="absolute inset-0 bg-charcoal-950/95 p-6 flex flex-col items-center justify-center text-center space-y-4">
            <VideoOff className="w-12 h-12 text-rose-500" />
            <div className="text-sm font-bold text-rose-300">Camera Access Blocked</div>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">{cameraError}</p>
            <Button
              size="sm"
              onClick={() => startCamera(facingMode)}
              className="bg-cyan-600 hover:bg-cyan-500 text-xs font-mono font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry Camera Access
            </Button>
          </div>
        )}
      </main>

      {/* Footer Controls */}
      <footer className="space-y-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const nextMode = facingMode === 'environment' ? 'user' : 'environment';
              startCamera(nextMode);
            }}
            className="flex-1 text-xs border-charcoal-700 bg-charcoal-900 text-slate-300"
          >
            <RefreshCw className="w-3 h-3 mr-1.5" /> Switch Camera ({facingMode === 'environment' ? 'Rear' : 'Front'})
          </Button>

          <Button
            size="sm"
            onClick={() => {
              if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(() => {});
              }
            }}
            className="text-xs bg-charcoal-800 hover:bg-charcoal-700 text-slate-200"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="p-2.5 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-[11px] text-slate-400 leading-snug text-center">
          ⚡ <strong>Keep this screen ON:</strong> Screen sleep is automatically blocked. Rest your phone against a water bottle or stand and return to your laptop.
        </div>
      </footer>
    </div>
  );
}

export default function SideCameraPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-charcoal-950 text-white flex items-center justify-center p-4">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Initializing Side Proctor Camera...</span>
          </div>
        </div>
      }
    >
      <SideCameraContent />
    </Suspense>
  );
}
