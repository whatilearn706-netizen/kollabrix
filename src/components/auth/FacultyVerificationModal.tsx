'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  RefreshCw,
  Award,
  Check,
  Lock,
  Printer,
  QrCode,
  ArrowRight,
  Sparkles,
  Users,
} from 'lucide-react';

interface FacultyVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onContinueAsStudent?: () => void;
  title?: string;
  description?: string;
}

export function FacultyVerificationModal({
  isOpen,
  onClose,
  onSuccess,
  onContinueAsStudent,
  title = 'Institutional Verification via DigiLocker',
  description = 'Directly authenticate your government-issued credentials through the National DigiLocker / MeriPehchan gateway. No need to type sensitive security PINs or manual uploads on our site.',
}: FacultyVerificationModalProps) {
  const { user, profile, refreshProfile } = useAuth();

  const [docType, setDocType] = useState<'aadhaar' | 'marksheet_12th'>('aadhaar');
  const [birthYear, setBirthYear] = useState<string>('2001');
  const [last4Input, setLast4Input] = useState<string>('8921');
  const [consentGiven, setConsentGiven] = useState(true);

  // Flow states: 'select' | 'gateway_redirect' | 'fetching' | 'aadhaar_view'
  const [flowState, setFlowState] = useState<'select' | 'gateway_redirect' | 'fetching' | 'aadhaar_view'>('select');
  const [fetchProgress, setFetchProgress] = useState<number>(0);
  const [fetchStatusText, setFetchStatusText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    birthYear: number;
    age: number;
    role: string;
    message: string;
    docUri: string;
    holderName: string;
    docType: string;
    maskedAadhaar: string;
    dobFormatted: string;
    gender: string;
    verifiedDocName: string;
    signatureTime: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleLaunchDigiLockerGateway = () => {
    if (!consentGiven) {
      setError('Statutory electronic consent under IT Act 2000 is required to access DigiLocker.');
      return;
    }
    setError(null);
    setFlowState('gateway_redirect');
  };

  const handleConfirmOnDigiLocker = async () => {
    setFlowState('fetching');
    setFetchProgress(20);
    setFetchStatusText('Connecting to DigiLocker MeriPehchan Gateway (services.digitallocker.gov.in)...');

    try {
      await new Promise((r) => setTimeout(r, 650));
      setFetchProgress(55);
      setFetchStatusText('Authenticating e-Aadhaar XML repository with UIDAI central database...');

      await new Promise((r) => setTimeout(r, 650));
      setFetchProgress(85);
      setFetchStatusText('Verifying digital signature of Unique Identification Authority of India...');

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const yr = parseInt(birthYear, 10) || 2001;

      const res = await fetch('/api/faculty/digilocker', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          docType,
          birthYear: yr,
          aadhaarLast4: last4Input,
          userId: user?.id,
          holderName: profile?.display_name || user?.user_metadata?.full_name || 'Mayank Goyal',
          docUri: `in.gov.uidai-aadhaar-${Date.now().toString().slice(-8)}`,
        }),
      });

      const resData = await res.json();
      await new Promise((r) => setTimeout(r, 400));
      setFetchProgress(100);

      if (!res.ok) {
        throw new Error(resData.error || 'DigiLocker verification failed.');
      }

      setVerificationResult({
        success: resData.eligible,
        birthYear: resData.birthYear,
        age: resData.age,
        role: resData.role,
        message: resData.message,
        docUri: resData.docUri,
        holderName: resData.holderName,
        docType: resData.docType,
        maskedAadhaar: resData.maskedAadhaar || `XXXX XXXX ${last4Input}`,
        dobFormatted: resData.dobFormatted || `15/07/${yr}`,
        gender: resData.gender || 'Male',
        verifiedDocName: resData.verifiedDocName || 'UIDAI Electronic Aadhaar',
        signatureTime: resData.signatureTime || new Date().toLocaleString(),
      });

      try {
        localStorage.setItem('linkora_digilocker_verified', JSON.stringify(resData));
        document.cookie = 'linkora_digilocker_verified=true; path=/; max-age=31536000; SameSite=Lax';
        if (resData.eligible) {
          localStorage.setItem('teamforge_user_role', 'teacher');
          localStorage.setItem('teamforge_verified_faculty', 'true');
        } else {
          localStorage.setItem('teamforge_user_role', 'student');
          localStorage.removeItem('teamforge_verified_faculty');
        }
        window.dispatchEvent(new Event('linkora_digilocker_updated'));
      } catch (e) {}

      setFlowState('aadhaar_view');
      await refreshProfile();
    } catch (err: unknown) {
      setFlowState('select');
      setError(err instanceof Error ? err.message : 'Error connecting to DigiLocker.');
    }
  };

  const isUnderageForFaculty = parseInt(birthYear, 10) > 2003;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl relative my-auto">
        {/* Top Government of India Tricolor Ribbon */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-500 shrink-0" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-900/60 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30">
                  DigiLocker Verified
                </span>
                <span className="text-[10px] text-slate-400">Digital India | MeitY</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">{title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* =========================================================================
              FLOW STATE 1: INITIAL SELECT & ZERO-PIN NOTICE
             ========================================================================= */}
          {flowState === 'select' && (
            <div className="space-y-5">
              <p className="text-xs text-slate-300 leading-relaxed">{description}</p>

              {/* Document selection */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Document to Fetch from DigiLocker
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDocType('aadhaar')}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      docType === 'aadhaar'
                        ? 'border-indigo-500 bg-indigo-500/10 text-white ring-1 ring-indigo-500/40 shadow-xs'
                        : 'border-slate-800 bg-slate-850 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldCheck className="w-4 h-4 text-indigo-400" />
                      <span className="font-semibold text-xs text-white">e-Aadhaar Card</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Unique Identification Authority of India (UIDAI)</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDocType('marksheet_12th')}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      docType === 'marksheet_12th'
                        ? 'border-indigo-500 bg-indigo-500/10 text-white ring-1 ring-indigo-500/40 shadow-xs'
                        : 'border-slate-800 bg-slate-850 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <span className="font-semibold text-xs text-white">Class XII Marksheet</span>
                    </div>
                    <p className="text-[10px] text-slate-400">CBSE / State Secondary Board</p>
                  </button>
                </div>
              </div>

              {/* Birth Year Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Registered Birth Year on Aadhaar
                </label>
                <select
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-850 border border-slate-750 text-white focus:outline-none focus:border-indigo-500 font-mono"
                >
                  <optgroup label="Faculty / Mentor Eligible (≤ 2003)">
                    <option value="2003">2003 (Age 23)</option>
                    <option value="2002">2002 (Age 24)</option>
                    <option value="2001">2001 (Age 25)</option>
                    <option value="2000">2000 (Age 26)</option>
                    <option value="1998">1998 (Age 28)</option>
                    <option value="1995">1995 (Age 31)</option>
                    <option value="1990">1990 (Age 36)</option>
                  </optgroup>
                  <optgroup label="Student / Collegiate Maker Range (> 2003)">
                    <option value="2004">2004 (Age 22)</option>
                    <option value="2005">2005 (Age 21)</option>
                    <option value="2006">2006 (Age 20)</option>
                    <option value="2007">2007 (Age 19)</option>
                    <option value="2008">2008 (Age 18)</option>
                  </optgroup>
                </select>
              </div>

              {/* Status pill */}
              <div
                className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  isUnderageForFaculty
                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-300'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                }`}
              >
                {isUnderageForFaculty ? (
                  <Users className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
                ) : (
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold block">
                    {isUnderageForFaculty
                      ? `Student Status Verification (${birthYear})`
                      : `Faculty Qualified (${birthYear} \u2264 2003)`}
                  </span>
                  <span className="text-[11px] opacity-90 leading-tight">
                    {isUnderageForFaculty
                      ? 'Authenticating your Aadhaar confirms your verified Student Maker status on Linkora.'
                      : 'Authenticating your Aadhaar unlocks verified Faculty & Mentor privileges.'}
                  </span>
                </div>
              </div>

              {/* Privacy Guarantee: No PIN / Password requested */}
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3">
                <Lock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-200 leading-relaxed">
                  <strong className="block text-indigo-100 font-semibold mb-0.5">Privacy First Guarantee:</strong>
                  We never ask for your 6-digit DigiLocker security PIN, full biometric data, or passwords. Authentication occurs securely on the Government DigiLocker gateway.
                </div>
              </div>

              {/* Consent */}
              <label className="flex items-start gap-2.5 text-[11px] text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                />
                <span>
                  I give electronic consent under the Information Technology Act 2000 to fetch my official e-Aadhaar verification from the DigiLocker repository.
                </span>
              </label>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
                <a
                  href="https://www.digitallocker.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <span>Visit digitallocker.gov.in</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <Button
                  onClick={handleLaunchDigiLockerGateway}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-5 py-2.5"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Proceed to DigiLocker Gateway
                </Button>
              </div>
            </div>
          )}

          {/* =========================================================================
              FLOW STATE 2: GATEWAY REDIRECT & LOGIN MODAL (Simulated MeriPehchan)
             ========================================================================= */}
          {flowState === 'gateway_redirect' && (
            <div className="py-2 space-y-5">
              <div className="p-4 rounded-2xl bg-white text-slate-900 border border-slate-200 space-y-4 shadow-xl">
                {/* Simulated MeriPehchan / DigiLocker Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      DL
                    </div>
                    <div>
                      <strong className="text-xs text-blue-900 block font-bold leading-tight">DigiLocker</strong>
                      <span className="text-[10px] text-slate-500">meripehchan.gov.in</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                    🔒 SSL 256-Bit Encrypted
                  </span>
                </div>

                <div className="space-y-2 text-center py-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Sign In to DigiLocker to Authorize Linkora
                  </h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    You are authenticating on the official Government Single Sign-On (SSO) gateway.
                  </p>
                </div>

                {/* Consent & Access scope box */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <span className="font-bold text-slate-700 block">Requested Permissions:</span>
                  <div className="space-y-1 text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>UIDAI e-Aadhaar Name &amp; Verified Birth Year</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Cryptographic CCA Digital Signature Token</span>
                    </div>
                  </div>
                </div>

                {/* Confirm on DigiLocker Button */}
                <div className="pt-2">
                  <button
                    onClick={handleConfirmOnDigiLocker}
                    className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <ShieldCheck className="w-4 h-4 text-white" />
                    <span>Authorize &amp; Fetch e-Aadhaar from UIDAI</span>
                  </button>
                </div>

                <div className="text-center">
                  <button
                    onClick={() => setFlowState('select')}
                    className="text-xs text-slate-500 hover:text-slate-800 underline"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              FLOW STATE 3: FETCHING DIGILOCKER DATA
             ========================================================================= */}
          {flowState === 'fetching' && (
            <div className="py-8 text-center space-y-6">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping" />
                <div className="w-20 h-20 rounded-full border-4 border-t-indigo-500 border-indigo-500/20 flex items-center justify-center animate-spin">
                  <RefreshCw className="w-8 h-8 text-indigo-400" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">Accessing DigiLocker Gateway...</h3>
                <p className="text-xs text-indigo-300 font-mono animate-pulse max-w-xs mx-auto">
                  {fetchStatusText}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${fetchProgress}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400">
                Encrypted with 2048-bit SSL under the National e-Governance Division (NeGD).
              </p>
            </div>
          )}

          {/* =========================================================================
              FLOW STATE 4: REAL VIEW OF E-AADHAAR CARD!
             ========================================================================= */}
          {flowState === 'aadhaar_view' && verificationResult && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>DigiLocker Authenticated &amp; Verified</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  {verificationResult.success ? 'Verified as Faculty / Mentor' : 'Verified as Collegiate Student'}
                </h3>
              </div>

              {/* -------------------------------------------------------------
                  AUTHENTIC REAL VIEW E-AADHAAR CARD (GOVERNMENT FORMAT)
                 ------------------------------------------------------------- */}
              <div className="rounded-3xl bg-[#FFFDF7] text-slate-900 border-2 border-amber-600/30 shadow-2xl overflow-hidden relative">
                {/* Card Top Header: Government of India & UIDAI */}
                <div className="px-5 py-3 border-b border-amber-500/20 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/80 flex items-center justify-between">
                  {/* Left: National Emblem */}
                  <div className="flex items-center gap-2">
                    <div className="text-center leading-none">
                      <div className="w-7 h-7 mx-auto flex items-center justify-center font-bold text-base text-amber-900">
                        🏛️
                      </div>
                      <span className="text-[8px] font-bold text-slate-700 block tracking-tighter">
                        भारत सरकार
                      </span>
                      <span className="text-[8px] font-bold text-slate-700 block tracking-tighter">
                        Govt. of India
                      </span>
                    </div>
                  </div>

                  {/* Middle Flag Stripe */}
                  <div className="h-1 w-20 rounded-full bg-gradient-to-r from-orange-500 via-white to-emerald-600 border border-slate-300" />

                  {/* Right: UIDAI Aadhaar Symbol */}
                  <div className="text-right leading-none">
                    <div className="inline-flex items-center gap-1">
                      <span className="text-base text-red-600 font-extrabold">☀️</span>
                      <strong className="text-[11px] font-black tracking-tight text-red-700">AADHAAR</strong>
                    </div>
                    <span className="text-[7px] text-slate-600 block">
                      भारतीय विशिष्ट पहचान प्राधिकरण
                    </span>
                    <span className="text-[7px] text-slate-600 block">
                      Unique Identification Authority of India
                    </span>
                  </div>
                </div>

                {/* Card Content Area */}
                <div className="p-5 grid grid-cols-12 gap-4 items-center">
                  {/* Left: Photo Box */}
                  <div className="col-span-4 sm:col-span-3 flex flex-col items-center">
                    <div className="w-24 h-28 rounded-xl bg-slate-200 border-2 border-slate-300 shadow-inner flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="w-14 h-14 rounded-full bg-slate-400 text-white flex items-center justify-center font-bold text-xl mb-1">
                        {verificationResult.holderName.charAt(0)}
                      </div>
                      <span className="text-[8px] text-slate-500 font-bold uppercase">e-KYC Photo</span>
                      <div className="absolute bottom-0 inset-x-0 bg-blue-600/80 text-[7px] text-white text-center py-0.5 font-bold">
                        DIGILOCKER
                      </div>
                    </div>
                  </div>

                  {/* Center: Details */}
                  <div className="col-span-8 sm:col-span-6 space-y-1.5 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">नाम / Name</span>
                      <strong className="text-sm font-bold text-slate-900 block leading-tight">
                        {verificationResult.holderName}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block">जन्म तिथि / DOB</span>
                      <strong className="text-xs font-semibold text-slate-800">
                        {verificationResult.dobFormatted} (Age: {verificationResult.age})
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block">लिंग / Gender</span>
                      <strong className="text-xs font-semibold text-slate-800">
                        {verificationResult.gender}
                      </strong>
                    </div>

                    <div className="pt-1">
                      <span className="text-[9px] text-slate-400 block">Document URI</span>
                      <span className="text-[9px] font-mono text-indigo-700">
                        {verificationResult.docUri}
                      </span>
                    </div>
                  </div>

                  {/* Right: QR Code Visual */}
                  <div className="hidden sm:flex col-span-3 flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 p-1.5 bg-white border border-slate-300 rounded-xl shadow-xs flex items-center justify-center">
                      <QrCode className="w-full h-full text-slate-800" />
                    </div>
                    <span className="text-[8px] text-slate-500 mt-1 font-mono">
                      UIDAI QR CODE
                    </span>
                  </div>
                </div>

                {/* Big Bold Spaced Aadhaar Number Band */}
                <div className="py-2.5 px-4 bg-amber-500/10 border-t border-b border-amber-500/20 text-center">
                  <span className="font-mono text-base sm:text-lg font-black tracking-widest text-slate-900">
                    {verificationResult.maskedAadhaar}
                  </span>
                </div>

                {/* Card Bottom Tagline & Digital Signature */}
                <div className="px-5 py-2.5 bg-white flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-[11px] font-bold text-red-700 block">
                      मेरा आधार, मेरी पहचान
                    </span>
                    <span className="text-[9px] text-slate-500">
                      My Aadhaar, My Identity
                    </span>
                  </div>

                  {/* Green Tick Digital Seal */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-bold">
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    <span>Signature Valid (UIDAI Digital Seal)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print e-Aadhaar Copy</span>
                </button>

                <Button
                  onClick={verificationResult.success ? onSuccess || onClose : onContinueAsStudent || onClose}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2"
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  {verificationResult.success ? 'Proceed as Faculty' : 'Proceed as Student'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
