'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  Check,
  Sparkles,
  Trophy,
  Zap,
  ShieldCheck,
  Loader2,
  Crown,
  CreditCard,
} from 'lucide-react';
import type { KaEntitlementSummary, KaPlanId } from '@/lib/spark/plans';

interface KaPricingModalProps {
  open: boolean;
  onClose: () => void;
  entitlements: KaEntitlementSummary | null;
  reason?: string;
  onPlanActivated: (entitlements: KaEntitlementSummary) => void;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function KaPricingModal({
  open,
  onClose,
  entitlements,
  reason,
  onPlanActivated,
}: KaPricingModalProps) {
  const [proBilling, setProBilling] = useState<'pro_monthly' | 'pro_semester'>('pro_monthly');
  const [loadingPlan, setLoadingPlan] = useState<KaPlanId | null>(null);
  const [utrInput, setUtrInput] = useState('');
  const [showUpiFor, setShowUpiFor] = useState<KaPlanId | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [razorpayConfig, setRazorpayConfig] = useState<{ enabled: boolean; keyId: string | null } | null>(null);

  useEffect(() => {
    if (open) {
      fetch('/api/spark/checkout/razorpay/config')
        .then((r) => r.json())
        .then((d) => setRazorpayConfig(d))
        .catch(() => setRazorpayConfig({ enabled: false, keyId: null }));
    }
  }, [open]);

  if (!open) return null;

  const isAuth = Boolean(entitlements?.isAuthenticated);
  const currentPlan = entitlements?.planId || 'free';

  const handleRazorpayPayment = async (planId: KaPlanId) => {
    setFeedback(null);
    setLoadingPlan(planId);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setFeedback({ type: 'err', text: 'Could not load Razorpay payment gateway SDK. Please check your internet connection.' });
        setLoadingPlan(null);
        return;
      }

      const res = await fetch('/api/spark/checkout/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.orderId) {
        setFeedback({ type: 'err', text: orderData.error || 'Could not initiate payment order.' });
        setLoadingPlan(null);
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Kollabrix Technologies',
        description: `${orderData.planName} Subscription`,
        order_id: orderData.orderId,
        prefill: {
          name: orderData.userName || '',
          email: orderData.userEmail || '',
        },
        theme: {
          color: '#f59e0b',
        },
        handler: async function (response: any) {
          try {
            setFeedback({ type: 'ok', text: 'Payment received! Verifying cryptographic signature...' });
            const verifyRes = await fetch('/api/spark/checkout/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.entitlements) {
              onPlanActivated(verifyData.entitlements);
              setFeedback({ type: 'ok', text: verifyData.message || 'Payment Successful! Welcome to KΛ Pro.' });
              setTimeout(() => onClose(), 1200);
            } else {
              setFeedback({ type: 'err', text: verifyData.error || 'Payment signature verification failed.' });
            }
          } catch {
            setFeedback({ type: 'err', text: 'Error finalizing payment verification with server.' });
          } finally {
            setLoadingPlan(null);
          }
        },
        modal: {
          ondismiss: function () {
            setLoadingPlan(null);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setFeedback({ type: 'err', text: response.error?.description || 'Payment was declined or cancelled.' });
        setLoadingPlan(null);
      });
      rzp.open();
    } catch {
      setFeedback({ type: 'err', text: 'Network error launching Razorpay.' });
      setLoadingPlan(null);
    }
  };

  const handleActivate = async (planId: KaPlanId, mode: 'activate_demo' | 'submit_upi') => {
    // If Razorpay is enabled and user clicked normal payment button, launch Razorpay!
    if (razorpayConfig?.enabled && mode === 'activate_demo') {
      return handleRazorpayPayment(planId);
    }

    setFeedback(null);
    setLoadingPlan(planId);
    try {
      const res = await fetch('/api/spark/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: mode,
          planId,
          utrNumber: mode === 'submit_upi' ? utrInput : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'err', text: data?.error || 'Could not activate plan.' });
        return;
      }
      if (data?.entitlements) {
        onPlanActivated(data.entitlements);
      }
      setFeedback({ type: 'ok', text: data?.message || 'Plan activated!' });
      setShowUpiFor(null);
      setUtrInput('');
      setTimeout(() => onClose(), 800);
    } catch {
      setFeedback({ type: 'err', text: 'Network error activating plan.' });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-[#0b0d13] border border-white/15 shadow-[0_24px_80px_rgba(0,0,0,0.85)] p-6 sm:p-8 text-white">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close pricing modal"
          className="absolute right-5 top-5 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[11px] font-bold tracking-wider uppercase">
            <Crown className="w-3.5 h-3.5" />
            <span>KΛ ΛI Builder Plans</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Win Hackathons &amp; Crack Placements Faster
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Low-friction student UPI pricing. Unlock Judge Audits, AI Squad Matching, Unlimited Bug Coach &amp; Verified Passport.
          </p>
          {reason && (
            <div className="mt-3 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-400/30 text-xs text-amber-200 font-medium">
              {reason}
            </div>
          )}
          {feedback && (
            <div
              className={`mt-3 px-3.5 py-2 rounded-xl text-xs font-semibold ${
                feedback.type === 'ok'
                  ? 'bg-emerald-500/15 border border-emerald-400/30 text-emerald-300'
                  : 'bg-rose-500/15 border border-rose-400/30 text-rose-300'
              }`}
            >
              {feedback.text}
            </div>
          )}
        </div>

        {/* 3 Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Free Tier */}
          <div className="rounded-2xl bg-[#12151f] border border-white/10 p-5 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Free Tier</span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-semibold text-zinc-300">
                  Current
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black">₹0</span>
                <span className="text-xs text-zinc-400">/ forever</span>
              </div>
              <p className="text-xs text-zinc-400">
                Try KΛ-1 with live site intelligence (1 guest teaser, 4/day signed in).
              </p>
              <ul className="space-y-2 pt-2 text-xs text-zinc-300">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>4 KΛ-1 messages/day (1 guest teaser)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>2 Practice IDE Bug Coach hints/day</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Live Projects, Hackathons &amp; Teammates</span>
                </li>
              </ul>
            </div>

            {isAuth ? (
              <button
                type="button"
                disabled
                className="w-full py-2.5 rounded-xl bg-white/10 text-zinc-400 font-semibold text-xs cursor-default"
              >
                Included
              </button>
            ) : (
              <Link
                href="/login"
                className="w-full py-2.5 rounded-xl bg-white/15 hover:bg-white/20 text-white font-bold text-xs text-center transition-colors"
              >
                Sign In Free (4 msgs/day)
              </Link>
            )}
          </div>

          {/* 2. Hackathon Sprint Pass ₹49 */}
          <div className="relative rounded-2xl bg-[#0f1824] border border-cyan-400/40 p-5 flex flex-col justify-between space-y-5 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  Hackathon Pass
                </span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-[10px] font-bold text-cyan-300">
                  7-DAY SPRINT
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-cyan-300">₹49</span>
                <span className="text-xs text-zinc-400">/ 7 days</span>
              </div>
              <p className="text-xs text-zinc-400">
                Built for hackathon weekend — split ₹12/person across your 4-member squad.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-zinc-200">
                <li className="flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="font-semibold text-cyan-200">10 KΛ-Pro + 10 KΛ-1 msgs/day (Hackathon Studio only)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>AI Screening PPT Deck (.pptx) &amp; Cut-List</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>2-Min Demo Timer, Repo README/SQL &amp; Judge Re-Audit</span>
                </li>
              </ul>
            </div>

            {!isAuth ? (
              <Link
                href="/login"
                className="w-full py-2.5 rounded-xl bg-cyan-400 text-zinc-950 font-bold text-xs text-center hover:bg-cyan-300 transition-colors"
              >
                Sign in to Unlock ₹49 Pass
              </Link>
            ) : currentPlan === 'hackathon_pass' ? (
              <button
                type="button"
                disabled
                className="w-full py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 font-bold text-xs"
              >
                Active Sprint Pass
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={loadingPlan === 'hackathon_pass'}
                  onClick={() => handleActivate('hackathon_pass', 'activate_demo')}
                  className="w-full py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60 shadow-glow"
                >
                  {loadingPlan === 'hackathon_pass' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : razorpayConfig?.enabled ? (
                    <CreditCard className="w-3.5 h-3.5" />
                  ) : null}
                  <span>
                    {razorpayConfig?.enabled
                      ? 'Pay ₹49 via Razorpay / UPI'
                      : 'Unlock ₹49 Pass (Instant Access)'}
                  </span>
                </button>
                {showUpiFor === 'hackathon_pass' ? (
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={utrInput}
                      onChange={(e) => setUtrInput(e.target.value)}
                      placeholder="12-digit UPI UTR"
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/15 text-[11px] text-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleActivate('hackathon_pass', 'submit_upi')}
                      className="px-2.5 py-1.5 rounded-lg bg-white text-black text-[11px] font-bold cursor-pointer"
                    >
                      Verify
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowUpiFor('hackathon_pass')}
                    className="w-full text-[11px] text-zinc-400 hover:text-white underline cursor-pointer"
                  >
                    Enter UPI UTR Reference instead
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 3. KΛ Pro Builder ₹149/mo or ₹399/semester */}
          <div className="rounded-2xl bg-gradient-to-b from-[#1a1625] to-[#12131c] border border-amber-400/45 p-5 flex flex-col justify-between space-y-5 shadow-[0_0_40px_rgba(245,158,11,0.12)]">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  KΛ Pro Builder
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-[10px] font-bold text-amber-300">
                  POPULAR
                </span>
              </div>

              {/* Monthly vs Semester Toggle */}
              <div className="inline-flex p-0.5 rounded-lg bg-black/40 border border-white/10 text-[11px]">
                <button
                  type="button"
                  onClick={() => setProBilling('pro_monthly')}
                  className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                    proBilling === 'pro_monthly' ? 'bg-amber-400 text-zinc-950' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  ₹149 / mo
                </button>
                <button
                  type="button"
                  onClick={() => setProBilling('pro_semester')}
                  className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                    proBilling === 'pro_semester' ? 'bg-amber-400 text-zinc-950' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  ₹399 / sem
                </button>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black">
                  {proBilling === 'pro_monthly' ? '₹149' : '₹399'}
                </span>
                <span className="text-xs text-zinc-400">
                  {proBilling === 'pro_monthly' ? '/ month' : '/ 6 months (Save 55%)'}
                </span>
              </div>

              <ul className="space-y-2 pt-1 text-xs text-zinc-200">
                <li className="flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>30 KΛ-1 + 10 KΛ-Pro/day across Code, DSA, General &amp; Hackathons</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>Unlimited Practice IDE &amp; Arena Bug Coach</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>Priority Teammate Boost + Builder Passport Export</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>Includes Judge Audit &amp; Squad Match</span>
                </li>
              </ul>
            </div>

            {!isAuth ? (
              <Link
                href="/login"
                className="w-full py-2.5 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs text-center hover:bg-amber-300 transition-colors"
              >
                Sign in to Go Pro
              </Link>
            ) : currentPlan === 'pro_monthly' || currentPlan === 'pro_semester' ? (
              <button
                type="button"
                disabled
                className="w-full py-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 font-bold text-xs"
              >
                Active KΛ Pro Builder
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={loadingPlan === proBilling}
                  onClick={() => handleActivate(proBilling, 'activate_demo')}
                  className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60 shadow-glow"
                >
                  {loadingPlan === proBilling ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : razorpayConfig?.enabled ? (
                    <CreditCard className="w-3.5 h-3.5" />
                  ) : null}
                  <span>
                    {razorpayConfig?.enabled
                      ? `Pay ${proBilling === 'pro_monthly' ? '₹149' : '₹399'} via Razorpay / UPI`
                      : `Unlock ${proBilling === 'pro_monthly' ? '₹149/mo' : '₹399/sem'} (Instant Access)`}
                  </span>
                </button>
                {showUpiFor === proBilling ? (
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={utrInput}
                      onChange={(e) => setUtrInput(e.target.value)}
                      placeholder="12-digit UPI UTR"
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/15 text-[11px] text-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleActivate(proBilling, 'submit_upi')}
                      className="px-2.5 py-1.5 rounded-lg bg-white text-black text-[11px] font-bold cursor-pointer"
                    >
                      Verify
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowUpiFor(proBilling)}
                    className="w-full text-[11px] text-zinc-400 hover:text-white underline cursor-pointer"
                  >
                    Enter UPI UTR Reference instead
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
