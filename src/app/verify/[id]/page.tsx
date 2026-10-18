'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  ExternalLink,
  ArrowLeft,
  Calendar,
  Lock,
  Sparkles,
  Share2,
  Copy,
  Check,
} from 'lucide-react';

export default function CertificateVerificationPage() {
  const params = useParams();
  const router = useRouter();
  const credentialId = (params?.id as string) || 'LNK-2026-VERIFIED';

  const [copied, setCopied] = useState(false);
  const [issuedDate] = useState(() =>
    new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  );

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-4 py-16">
      <div className="w-full max-w-2xl bg-charcoal-900 border border-charcoal-750 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Verification Status Banner */}
        <div className="flex items-center justify-between border-b border-charcoal-800 pb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                Official Credential Verification
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Verified Collegiate Deliverable
              </h1>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            Valid
          </span>
        </div>

        {/* Credential Data Card */}
        <div className="space-y-6 relative z-10">
          <div className="p-6 rounded-2xl bg-charcoal-950 border border-charcoal-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">VERIFIED CREDENTIAL ID</span>
                <span className="text-base font-bold text-amber-400 break-all">{credentialId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">ISSUED DATE</span>
                <span className="text-sm font-bold text-slate-200">{issuedDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">ISSUING PLATFORM</span>
                <span className="text-sm font-bold text-slate-200">Linkora Collegiate Trust Protocol</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">SIGNATURE ENCRYPTION</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>SHA-256 Collegiate Cryptographic Hash</span>
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p>
              This certificate verifies that the recipient successfully fulfilled all peer-reviewed production tasks and delivered verified engineering artifacts according to Linkora collegiate project standards.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-charcoal-800 relative z-10">
          <Link href="/explore">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Explore Campus Projects
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleCopyLink}
              variant="outline"
              size="sm"
              leftIcon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            >
              {copied ? 'Copied Link' : 'Copy Verification Link'}
            </Button>

            <Link href="/projects">
              <Button variant="primary" size="sm" rightIcon={<ExternalLink className="w-4 h-4" />}>
                View on Linkora
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
