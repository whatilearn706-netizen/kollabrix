'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
  Image as ImageIcon,
  GraduationCap,
  FileCheck2,
  Clock,
  AlertOctagon,
  Lock,
  RotateCw,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { StudentIdVerification } from '@/types/verification';

interface CollegeIdVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  collegeName: string;
  onCollegeNameChange?: (name: string) => void;
  onSubmitted?: (request: StudentIdVerification) => void;
  onVerified?: (verifiedCollege: string) => void;
  userId?: string;
  username?: string;
  email?: string;
  existingVerification?: StudentIdVerification | null;
  initialVerificationStatus?: 'none' | 'pending' | 'approved' | 'rejected';
}

export function CollegeIdVerificationModal({
  isOpen,
  onClose,
  collegeName,
  onCollegeNameChange,
  onSubmitted,
  onVerified,
  userId,
  username,
  email,
  existingVerification,
  initialVerificationStatus,
}: CollegeIdVerificationModalProps) {
  const [enteredCollege, setEnteredCollege] = useState(collegeName || '');
  const [rollNumber, setRollNumber] = useState('');
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(() => !existingVerification);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Remote verification status - seed immediately from props or localStorage
  const [existingRequest, setExistingRequest] = useState<StudentIdVerification | null>(() => {
    if (existingVerification) return existingVerification;
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('linkora_student_id_status');
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return null;
  });
  const [isVerified, setIsVerified] = useState(false);
  const [isReuploading, setIsReuploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const userHasTypedCollegeRef = useRef(false);

  // Sync existingVerification prop immediately
  useEffect(() => {
    if (existingVerification) {
      setExistingRequest(existingVerification);
      if (!userHasTypedCollegeRef.current && existingVerification.collegeName) {
        setEnteredCollege(existingVerification.collegeName);
      }
      if (existingVerification.studentRollNumber && !rollNumber) {
        setRollNumber(existingVerification.studentRollNumber);
      }
      if (existingVerification.idCardImage) {
        setIdCardPreview(existingVerification.idCardImage);
      }
      setIsLoadingStatus(false);
    }
  }, [existingVerification]);

  // Initialize enteredCollege once on modal open, and NEVER overwrite while the user types/backspaces
  useEffect(() => {
    if (isOpen) {
      userHasTypedCollegeRef.current = false;
      if (collegeName && !enteredCollege) {
        setEnteredCollege(collegeName);
      }
    } else {
      userHasTypedCollegeRef.current = false;
    }
  }, [isOpen]);

  // Load existing verification status
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoadingStatus(true);
    setErrorMsg(null);

    const loadStatus = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        const currentUid = userId || sessionData?.session?.user?.id;
        const currentEmail = email || sessionData?.session?.user?.email || '';
        const currentUname = username || sessionData?.session?.user?.user_metadata?.username || currentEmail?.split('@')[0] || '';
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const params = new URLSearchParams();
        if (currentUid) params.set('userId', currentUid);
        if (currentUname) params.set('username', currentUname);
        const url = params.toString() ? `/api/verify/college-id?${params.toString()}` : '/api/verify/college-id';
        const res = await fetch(url, { headers });
        const data = await res.json();

        if (isMounted && data.success) {
          if (data.myRequest) {
            setExistingRequest(data.myRequest);
            if (!userHasTypedCollegeRef.current && !enteredCollege) {
              setEnteredCollege(data.myRequest.collegeName || '');
            }
            if (!rollNumber) {
              setRollNumber(data.myRequest.studentRollNumber || '');
            }
            setIdCardPreview(data.myRequest.idCardImage || null);
            try {
              localStorage.setItem('linkora_student_id_status', JSON.stringify(data.myRequest));
            } catch (e) {}
          }
          if (data.isVerified) {
            setIsVerified(true);
          }
        }
      } catch (err) {
        console.warn('Failed to load ID verification status:', err);
        // Fallback to local storage if available
        try {
          const cached = localStorage.getItem('linkora_student_id_status');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (isMounted && parsed) {
              setExistingRequest(parsed);
              if (!userHasTypedCollegeRef.current && parsed.collegeName && !enteredCollege) {
                setEnteredCollege(parsed.collegeName);
              }
            }
          }
        } catch (e) {}
      } finally {
        if (isMounted) setIsLoadingStatus(false);
      }
    };

    loadStatus();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Client-side image compression: max 1280px dimension & 0.78 JPEG quality (~200KB - 350KB)
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }

    setIsCompressing(true);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 1024;
        let w = img.width;
        let h = img.height;

        if (w > h && w > MAX_DIM) {
          h = Math.round((h * MAX_DIM) / w);
          w = MAX_DIM;
        } else if (h > MAX_DIM) {
          w = Math.round((w * MAX_DIM) / h);
          h = MAX_DIM;
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/jpeg', 0.75);
          setIdCardPreview(compressed);
          setIsCompressing(false);
        } else {
          setIdCardPreview(readerEvent.target?.result as string);
          setIsCompressing(false);
        }
      };
      img.onerror = () => {
        setErrorMsg('Failed to process image file. Please try another photo.');
        setIsCompressing(false);
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read image file.');
      setIsCompressing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanCollege = enteredCollege.trim();
    const cleanRoll = rollNumber.trim();

    if (!cleanCollege) {
      setErrorMsg('Please enter your official College / University name.');
      return;
    }

    if (!cleanRoll) {
      setErrorMsg('Please provide your Student ID / Roll Number as printed on your ID card.');
      return;
    }

    if (!idCardPreview) {
      setErrorMsg('Please upload a photograph of your College ID Card.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const currentUid = userId || sessionData?.session?.user?.id || 'd09e3949-1de5-4cce-a9b5-6201e2c21ba9';
      const currentEmail = email || sessionData?.session?.user?.email || '';
      const currentUname = username || sessionData?.session?.user?.user_metadata?.username || currentEmail?.split('@')[0] || 'student';

      const directNow = new Date().toISOString();
      const submissionRecord: StudentIdVerification = {
        id: existingRequest?.id || `sid-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        userId: currentUid,
        username: currentUname,
        displayName: currentUname,
        email: currentEmail,
        collegeName: cleanCollege,
        studentRollNumber: cleanRoll,
        idCardImage: idCardPreview,
        status: 'pending',
        submittedAt: directNow,
      };

      // Authoritative write through secure server API route
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        await fetch('/api/verify/college-id', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            collegeName: cleanCollege,
            studentRollNumber: cleanRoll,
            idCardImage: idCardPreview,
            userId: currentUid,
            username: currentUname,
          }),
        });
      } catch (apiErr) {
        console.warn('API route call warning:', apiErr);
      }

      // 3. Update modal UI state to State 2 (Wait for Verified)
      setExistingRequest(submissionRecord);
      setIsReuploading(false);
      setSuccessMsg('Your Student ID card has been submitted! It will be verified within 24 hours.');

      try {
        localStorage.setItem('linkora_student_id_status', JSON.stringify(submissionRecord));
      } catch (e) {}

      if (onCollegeNameChange) {
        onCollegeNameChange(cleanCollege);
      }

      if (onSubmitted) {
        onSubmitted(submissionRecord);
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('linkora_college_updated'));
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error submitting ID verification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const status = isVerified || existingRequest?.status === 'approved' ? 'approved' : existingRequest?.status || 'none';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="max-w-lg w-full rounded-3xl bg-charcoal-950 border border-charcoal-800 shadow-2xl p-6 sm:p-7 space-y-5 text-left relative my-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl bg-charcoal-900 border border-charcoal-800 text-slate-400 hover:text-white hover:bg-charcoal-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5 pr-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Collegiate Identity Verification</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            Verify College with Student ID Card
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Upload your physical or digital university ID card to earn a verified collegiate badge. Once approved by faculty, your college affiliation is verified across ICPC leaderboards, squads, and hackathons.
          </p>
        </div>

        {/* Loading Spinner */}
        {isLoadingStatus && (
          <div className="p-8 text-center text-slate-400 text-xs font-mono flex flex-col items-center gap-2">
            <RotateCw className="w-5 h-5 animate-spin text-emerald-400" />
            <span>Checking verification records...</span>
          </div>
        )}

        {!isLoadingStatus && (
          <>
            {/* ── STATE 1: ALREADY APPROVED ── */}
            {status === 'approved' && !isReuploading && (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                    Officially Verified
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    {existingRequest?.collegeName || enteredCollege}
                  </h3>
                  {existingRequest?.studentRollNumber && (
                    <p className="text-xs text-slate-300 font-mono">
                      Roll Number: <strong className="text-white">{existingRequest.studentRollNumber}</strong>
                    </p>
                  )}
                  <p className="text-xs text-emerald-300/80 pt-1">
                    Your collegiate identity is certified with a verified checkmark badge. Your college name is permanently locked to protect academic integrity.
                  </p>
                </div>

                {existingRequest?.idCardImage && (
                  <div className="p-2 bg-charcoal-900 rounded-xl border border-charcoal-800">
                    <span className="text-[10px] text-slate-400 block mb-1.5 font-mono">Verified ID Card Document:</span>
                    <img
                      src={existingRequest.idCardImage}
                      alt="Verified Student ID"
                      className="w-full h-auto max-h-44 object-contain rounded-lg border border-emerald-500/20 bg-black/50"
                    />
                  </div>
                )}

                <Button
                  variant="primary"
                  size="sm"
                  onClick={onClose}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs cursor-pointer"
                >
                  Close &amp; View Profile
                </Button>
              </div>
            )}

            {/* ── STATE 2: PENDING REVIEW (WAIT FOR VERIFIED - RE-UPLOAD LOCKED) ── */}
            {status === 'pending' && (
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto animate-pulse">
                  <Clock className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30">
                    Wait for Verified
                  </span>
                  <h3 className="text-base font-bold text-white">
                    {existingRequest?.collegeName || enteredCollege}
                  </h3>
                  {existingRequest?.studentRollNumber && (
                    <p className="text-xs text-slate-300 font-mono">
                      Roll Number: <strong className="text-white">{existingRequest.studentRollNumber}</strong>
                    </p>
                  )}
                  <p className="text-xs text-amber-200/90 leading-relaxed pt-1">
                    Your Student ID card has been securely submitted. Please <strong className="text-amber-300 font-semibold">Wait for Verified</strong> status. Re-uploading is locked to protect university verification integrity.
                  </p>
                </div>

                {existingRequest?.idCardImage && (
                  <div className="p-2 bg-charcoal-900 rounded-xl border border-charcoal-800">
                    <span className="text-[10px] text-slate-400 block mb-1.5 font-mono">Submitted Document:</span>
                    <img
                      src={existingRequest.idCardImage}
                      alt="Submitted Student ID"
                      className="w-full h-auto max-h-44 object-contain rounded-lg border border-amber-500/20 bg-black/50"
                    />
                  </div>
                )}

                <div className="pt-1">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={onClose}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs cursor-pointer"
                  >
                    Close (Wait for Verified)
                  </Button>
                </div>
              </div>
            )}

            {/* ── STATE 3: REJECTED (SHOW REASON & RE-UPLOAD OPTION) ── */}
            {status === 'rejected' && !isReuploading && (
              <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
                  <AlertOctagon className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30">
                    Verification Not Approved
                  </span>
                  <h3 className="text-base font-bold text-white">ID Card Could Not Be Verified</h3>
                  <div className="p-3 bg-charcoal-900 rounded-xl border border-rose-500/30 text-xs text-rose-200 font-mono text-left">
                    <span className="text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wide">Reviewer Note:</span>
                    &ldquo;{existingRequest?.rejectionReason || 'The uploaded card was blurry or details did not match.'}&rdquo;
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1">
                    Please upload a clearer, well-lit photo of your physical or digital college ID card with student name and roll number clearly visible.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setIsReuploading(true)}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs cursor-pointer"
                  leftIcon={<Upload className="w-3.5 h-3.5" />}
                >
                  Upload Fresh ID Card Photo
                </Button>
              </div>
            )}

            {/* ── STATE 4: SUBMISSION FORM (NEW OR RE-UPLOAD) ── */}
            {(status === 'none' || isReuploading) && (
              <div className="space-y-4">
                {/* College Name Input */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-200">
                    College / University Official Name <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={enteredCollege}
                    onChange={(e) => {
                      userHasTypedCollegeRef.current = true;
                      setEnteredCollege(e.target.value);
                    }}
                    placeholder="e.g. Indian Institute of Technology Bombay"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                {/* Roll Number / Student ID Input */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-200">
                    Student ID / Roll Number <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="e.g. 21BCS0492"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono uppercase"
                  />
                </div>

                {/* ID Card Upload Dropzone */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-200">
                    College ID Card Photograph <span className="text-emerald-400">*</span>
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {idCardPreview ? (
                    <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 bg-charcoal-900 p-2.5 space-y-2 group">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center">
                        <img
                          src={idCardPreview}
                          alt="ID Card Preview"
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setIdCardPreview(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/80 text-rose-400 hover:text-white hover:bg-rose-600 transition-colors cursor-pointer"
                          title="Remove photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Photo Ready</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-cyan-400 hover:underline cursor-pointer"
                        >
                          Change Photo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-charcoal-700 hover:border-emerald-500/60 rounded-2xl p-6 text-center space-y-2 cursor-pointer transition-colors bg-charcoal-900/50 hover:bg-charcoal-900"
                    >
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                        {isCompressing ? (
                          <RotateCw className="w-6 h-6 animate-spin text-emerald-400" />
                        ) : (
                          <Upload className="w-6 h-6" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-white">
                          {isCompressing ? 'Optimizing image...' : 'Click to upload or drag & drop'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Physical College ID or Digital ERP Student Card (PNG, JPG, WEBP)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Guidelines Box */}
                <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800 text-[11px] text-slate-400 space-y-1 font-mono">
                  <span className="text-slate-300 font-bold block mb-1">Requirements for 100% Approval:</span>
                  <p>• Your Student Name &amp; College Name must be clearly readable.</p>
                  <p>• ID card must display a valid batch, academic year, or expiry date.</p>
                  <p>• Fake, edited, or unreadable cards will be rejected immediately.</p>
                </div>

                {/* Error & Success Feedback */}
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}
                {successMsg && (
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  {isReuploading && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsReuploading(false)}
                      disabled={isSubmitting}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    variant="primary"
                    size="sm"
                    isLoading={isSubmitting || isCompressing}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs cursor-pointer"
                    leftIcon={<FileCheck2 className="w-4 h-4" />}
                  >
                    Submit for Official Verification
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
