'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  QrCode,
  Radio,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface SideCameraConnectModalProps {
  studentId: string;
  contestId: string;
  onConnected: () => void;
  onSkip?: () => void;
}

export function SideCameraConnectModal({
  studentId,
  contestId,
  onConnected,
  onSkip,
}: SideCameraConnectModalProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [pollCount, setPollCount] = useState<number>(0);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Compute full side camera target URL
  const [targetUrl, setTargetUrl] = useState<string>('');

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.kollabrix.in';
    const url = `${origin}/proctor/sidecam?session=${encodeURIComponent(studentId)}&contest=${encodeURIComponent(contestId)}`;
    setTargetUrl(url);

    // Generate crisp QR Code
    QRCode.toDataURL(url, {
      width: 256,
      margin: 2,
      color: {
        dark: '#0e7490',
        light: '#ffffff',
      },
    })
      .then((dataUrl) => setQrCodeDataUrl(dataUrl))
      .catch((err) => console.error('QR generation error:', err));
  }, [studentId, contestId]);

  // Poll heartbeat to check when side camera connects
  useEffect(() => {
    let isDisposed = false;

    const checkConnection = async () => {
      if (isDisposed) return;
      try {
        const res = await fetch('/api/icpc/proctor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'heartbeat',
            studentId,
            contestId,
          }),
        });
        const data = await res.json();
        if (data.sideCameraConnected) {
          setIsConnected(true);
          setIsVerifying(true);
          setTimeout(() => {
            if (!isDisposed) {
              onConnected();
            }
          }, 1500);
        }
        setPollCount((prev) => prev + 1);
      } catch (err) {
        console.warn('Poll sidecam check error:', err);
      }
    };

    pollTimerRef.current = setInterval(checkConnection, 1800);
    checkConnection();

    return () => {
      isDisposed = true;
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [studentId, contestId, onConnected]);

  const copyToClipboard = () => {
    if (navigator.clipboard && targetUrl) {
      navigator.clipboard.writeText(targetUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] bg-charcoal-950/95 backdrop-blur-2xl flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="max-w-lg w-full bg-charcoal-900 border-2 border-cyan-500/40 rounded-3xl p-6 shadow-2xl shadow-cyan-500/20 text-center space-y-6 relative z-10">
        {/* Header */}
        <div className="space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center mx-auto text-cyan-400">
            <Smartphone className="w-8 h-8 animate-pulse" />
          </div>
          <Badge variant="outline" className="text-cyan-300 border-cyan-500/40 font-mono text-[10px]">
            DUAL-LENS ANTI-CHEAT PROTOCOL
          </Badge>
          <h3 className="text-2xl font-bold text-white">Connect Secondary Side Camera</h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
            Scan the QR code with your mobile phone to connect your side-angle proctor feed.
            Position your phone to show your <strong>desk, keyboard, screen, and hands</strong>.
          </p>
        </div>

        {/* QR Code Container */}
        <div className="relative p-4 rounded-2xl bg-white/95 max-w-[240px] mx-auto shadow-xl shadow-cyan-500/10 flex flex-col items-center justify-center">
          {qrCodeDataUrl ? (
            <img
              src={qrCodeDataUrl}
              alt="Scan QR code with phone"
              className="w-48 h-48 object-contain rounded-xl"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-cyan-600" />
            </div>
          )}

          {isConnected && (
            <div className="absolute inset-0 bg-charcoal-950/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center space-y-2 text-emerald-400 animate-in zoom-in-95 duration-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
              <div className="text-sm font-bold text-white font-mono">Side Camera Locked!</div>
              <div className="text-[11px] text-emerald-300">Desk & Lap in Full View</div>
            </div>
          )}
        </div>

        {/* Live Status Indicator */}
        <div className="p-3.5 rounded-2xl bg-charcoal-950 border border-charcoal-800 flex items-center justify-between text-left">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className={`w-3.5 h-3.5 rounded-full flex ${isConnected ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'}`} />
              <span className={`absolute inset-0 w-3.5 h-3.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                {isConnected ? 'Side Camera Synchronized' : 'Waiting for phone scan...'}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {isConnected ? 'Continuous wide-angle proctor stream active' : 'Point your phone camera at the QR code above'}
              </div>
            </div>
          </div>

          <ShieldCheck className={`w-5 h-5 ${isConnected ? 'text-emerald-400' : 'text-slate-600'}`} />
        </div>

        {/* Direct Link Copy Fallback */}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-charcoal-950 border border-charcoal-800 rounded-xl px-3 py-2 text-left truncate text-[11px] font-mono text-slate-400 select-all">
            {targetUrl || 'Generating secure session link...'}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={copyToClipboard}
            className="border-charcoal-700 bg-charcoal-800 text-xs font-mono text-cyan-300 hover:text-white shrink-0"
          >
            {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="ml-1.5">{copiedLink ? 'Copied' : 'Copy'}</span>
          </Button>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center gap-3">
          {onSkip && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSkip}
              className="w-1/3 text-xs border-charcoal-700 text-slate-400 hover:text-white"
            >
              Skip (Practice)
            </Button>
          )}

          <Button
            size="sm"
            onClick={onConnected}
            disabled={!isConnected}
            className={`flex-1 font-mono text-xs font-bold shadow-lg ${
              isConnected
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                : 'bg-charcoal-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isConnected ? (
              <span className="flex items-center justify-center gap-1.5">
                <span>Enter Arena</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            ) : (
              'Scan QR to Proceed'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
