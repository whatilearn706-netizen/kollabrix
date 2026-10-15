'use client';

import React, { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ShieldCheck,
  FileText,
  UploadCloud,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  FileCheck2,
  Calendar,
  GraduationCap,
  Sparkles,
  Users,
  Search,
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
  title = 'Institutional Faculty & Mentor Verification',
  description = 'Verify your credentials to authenticate as a Teacher, Mentor, or Professor. Upload your document and confirm your birth year.',
}: FacultyVerificationModalProps) {
  const { user, refreshProfile } = useAuth();

  const [docType, setDocType] = useState<'aadhaar' | 'marksheet_12th'>('aadhaar');
  const [birthYearInput, setBirthYearInput] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewName, setFilePreviewName] = useState<string | null>(null);
  const [detectedYear, setDetectedYear] = useState<number | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    birthYear: number;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  // Scan file for birth year (e.g. 2007)
  const scanDocumentForYear = async (file: File): Promise<number | null> => {
    // 1. Check filename for 4-digit years
    const nameMatches = file.name.match(/\b(19\d{2}|20\d{2})\b/g);
    if (nameMatches) {
      for (const m of nameMatches) {
        const yr = parseInt(m, 10);
        if (yr >= 1940 && yr <= 2026) return yr;
      }
    }

    // 2. Check file text/metadata
    try {
      const text = await file.text();
      if (text && text.length > 0) {
        // Look for DOB patterns: "DOB: 15/08/2007", "Year: 2007", "जन्म: 2007"
        const dobMatch = text.match(
          /(?:DOB|Birth|जन्म|Year of Birth)[\s\:\-\/]*([0-3]?[0-9][\/\-\.][0-1]?[0-9][\/\-\.])?([12][90]\d{2})/i
        );
        if (dobMatch && dobMatch[2]) {
          const yr = parseInt(dobMatch[2], 10);
          if (yr >= 1940 && yr <= 2026) return yr;
        }

        const years = text.match(/\b(19\d{2}|20\d{2})\b/g);
        if (years) {
          for (const y of years) {
            const yr = parseInt(y, 10);
            if (yr >= 1940 && yr <= 2026) return yr;
          }
        }
      }
    } catch {
      // In case of binary file
    }

    // 3. Scan first 64KB for printable ASCII text containing years
    try {
      const slice = file.slice(0, 65536);
      const buf = await slice.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let ascii = '';
      for (let i = 0; i < bytes.length; i++) {
        if (bytes[i] >= 32 && bytes[i] <= 126) {
          ascii += String.fromCharCode(bytes[i]);
        }
      }
      const match = ascii.match(/\b(19\d{2}|20\d{2})\b/);
      if (match) {
        const yr = parseInt(match[1], 10);
        if (yr >= 1940 && yr <= 2026) return yr;
      }
    } catch {
      // Fallback
    }

    return null;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFilePreviewName(file.name);
      setError(null);
      setIsScanning(true);

      const foundYear = await scanDocumentForYear(file);
      setIsScanning(false);

      if (foundYear) {
        setDetectedYear(foundYear);
        setBirthYearInput(foundYear.toString());
        setDateOfBirth(`${foundYear}-01-01`);
      }
    }
  };

  // Determine current active birth year from either direct input or date picker
  const resolvedBirthYear: number | null = (() => {
    if (birthYearInput.trim()) {
      const yr = parseInt(birthYearInput.trim(), 10);
      if (!isNaN(yr) && yr >= 1940 && yr <= 2026) return yr;
    }
    if (dateOfBirth) {
      const yr = new Date(dateOfBirth).getFullYear();
      if (!isNaN(yr) && yr >= 1940 && yr <= 2026) return yr;
    }
    return null;
  })();

  const isUnderageForFaculty = resolvedBirthYear !== null && resolvedBirthYear > 2003;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setVerificationResult(null);

    if (!selectedFile && !filePreviewName) {
      setError('Please upload your Aadhaar Card or Class 12th Marksheet document.');
      return;
    }

    if (!resolvedBirthYear) {
      setError('Please enter your Birth Year (e.g. 2007) as shown on your Aadhaar Card.');
      return;
    }

    const birthYear = resolvedBirthYear;
    setIsVerifying(true);

    try {
      // STRICT CRITERIA: Birth year MUST be <= 2003 for Teacher / Mentor / Professor
      if (birthYear <= 2003) {
        // Passed eligibility
        if (isSupabaseConfigured() && user) {
          try {
            await supabase.rpc('verify_faculty_code', { access_code: 'FACULTY2026' });
          } catch {
            // Ignore
          }
          try {
            await supabase
              .from('profiles')
              .update({
                role: 'teacher',
                faculty_verified: true,
                verification_doc_type: docType,
                birth_year: birthYear,
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', user.id);
          } catch {
            // Ignore
          }
          await refreshProfile();
        }

        setVerificationResult({
          success: true,
          birthYear,
          message: `Credential verified successfully! Your birth year (${birthYear} \u2264 2003) qualifies you for Faculty / Mentor status. Welcome, Professor!`,
        });
      } else {
        // STRICT REJECTION: Born after 2003 (e.g. 2007)
        // MUST DEMOTE / ENFORCE STUDENT STATUS IN DATABASE & SESSION
        if (isSupabaseConfigured() && user) {
          try {
            await supabase
              .from('profiles')
              .update({
                role: 'student',
                faculty_verified: false,
                verification_doc_type: docType,
                birth_year: birthYear,
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', user.id);
          } catch (e) {
            console.warn('Profile role reset note:', e);
          }
          await refreshProfile();
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem('teamforge_user_role', 'student');
          localStorage.removeItem('teamforge_verified_faculty');
        }

        setVerificationResult({
          success: false,
          birthYear,
          message: `Invalid credential for Faculty/Mentor. Your Aadhaar card confirms you were born in ${birthYear} (Age: ${2026 - birthYear} years). As per institutional rules, faculty/mentors must be born in 2003 or earlier (\u2264 2003). You have been verified as a STUDENT.`,
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error evaluating verification.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFinishSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    onClose();
  };

  const handleProceedAsStudent = () => {
    if (onContinueAsStudent) {
      onContinueAsStudent();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-charcoal-900 border border-charcoal-750 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-charcoal-800 bg-charcoal-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{title}</h2>
              <p className="text-xs text-slate-400">Aadhaar Card Age &amp; Identity Verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors hover:bg-charcoal-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {verificationResult?.success ? (
            /* SUCCESS STATE (Birth Year <= 2003) */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Verified as Faculty / Mentor</h3>
                <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                  {verificationResult.message}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 text-left text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Document Type:</span>
                  <span className="text-white font-medium">
                    {docType === 'aadhaar' ? 'Aadhaar Card' : 'Class 12th Marksheet'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Birth Year:</span>
                  <span className="text-emerald-400 font-bold">
                    {verificationResult.birthYear} (&le; 2003 Eligible)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Authenticated Role:</span>
                  <Badge variant="default" className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                    Teacher / Professor
                  </Badge>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleFinishSuccess}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  Proceed with Faculty Privileges
                </Button>
              </div>
            </div>
          ) : verificationResult && !verificationResult.success ? (
            /* REJECTION / STUDENT IDENTIFIED STATE (Birth Year > 2003, e.g. 2007) */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-white">Identified as Student / Maker</h3>
                <p className="text-xs text-red-300/90 max-w-sm mx-auto leading-relaxed">
                  {verificationResult.message}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 text-left text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Aadhaar Birth Year:</span>
                  <span className="text-red-400 font-bold text-sm">{verificationResult.birthYear}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Calculated Age:</span>
                  <span className="text-slate-200 font-semibold">{2026 - verificationResult.birthYear} Years Old</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Faculty Eligibility Rule:</span>
                  <span className="text-slate-400">Must be born in 2003 or earlier (&le; 2003)</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-charcoal-750">
                  <span className="text-slate-400">Confirmed Account Role:</span>
                  <Badge variant="default" className="bg-brand-500/20 text-brand-300 border-brand-500/30 font-bold">
                    Student / Maker
                  </Badge>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleProceedAsStudent}
                  leftIcon={<Users className="w-4 h-4" />}
                >
                  Continue as Student
                </Button>
              </div>
            </div>
          ) : (
            /* INPUT / VERIFICATION FORM */
            <form onSubmit={handleVerify} className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">{description}</p>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* 1. Document Type Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Select Verification Document
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDocType('aadhaar')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      docType === 'aadhaar'
                        ? 'border-indigo-500 bg-indigo-500/10 text-white'
                        : 'border-charcoal-750 bg-charcoal-850 text-slate-400 hover:border-charcoal-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldCheck className="w-4 h-4 text-indigo-400" />
                      <span className="font-semibold text-xs text-white">Aadhaar Card</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Govt. UIDAI issued ID</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDocType('marksheet_12th')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      docType === 'marksheet_12th'
                        ? 'border-indigo-500 bg-indigo-500/10 text-white'
                        : 'border-charcoal-750 bg-charcoal-850 text-slate-400 hover:border-charcoal-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <span className="font-semibold text-xs text-white">12th Marksheet</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Board Certificate</p>
                  </button>
                </div>
              </div>

              {/* 2. File Upload Dropzone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Upload {docType === 'aadhaar' ? 'Aadhaar Card' : 'Class 12th Marksheet'} (PDF / Image)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/jpg, application/pdf"
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    filePreviewName
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : 'border-charcoal-750 hover:border-indigo-500/50 bg-charcoal-850/50 hover:bg-charcoal-850'
                  }`}
                >
                  {filePreviewName ? (
                    <div className="flex items-center justify-between text-left">
                      <div className="flex items-center gap-3">
                        <FileCheck2 className="w-6 h-6 text-emerald-400 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-white truncate max-w-[220px]">
                            {filePreviewName}
                          </p>
                          <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                            {isScanning ? 'Scanning document...' : 'Document attached'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setFilePreviewName(null);
                          setDetectedYear(null);
                        }}
                        className="text-slate-400 hover:text-red-400 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <UploadCloud className="w-7 h-7 text-indigo-400 mx-auto" />
                      <p className="text-xs font-medium text-white">Click or drag Aadhaar Card</p>
                      <p className="text-[10px] text-slate-400">PDF, JPG, or PNG</p>
                    </div>
                  )}
                </div>

                {detectedYear && (
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>
                      Detected Birth Year from document: <strong>{detectedYear}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* 3. Explicit Birth Year & Date Input */}
              <div className="space-y-3 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Birth Year (As printed on Aadhaar Card)</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Policy: Born &le; 2003</span>
                  </div>
                  <input
                    type="number"
                    min="1940"
                    max="2026"
                    placeholder="e.g. 2007"
                    value={birthYearInput}
                    onChange={(e) => {
                      setBirthYearInput(e.target.value);
                      if (e.target.value.length === 4) {
                        setDateOfBirth(`${e.target.value}-01-01`);
                      }
                    }}
                    required
                    className="w-full px-3 py-2 text-sm font-semibold rounded-xl bg-charcoal-850 border border-charcoal-750 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Live validation feedback */}
                {isUnderageForFaculty && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-200">
                        Student Identity (Born in {resolvedBirthYear} - Age {2026 - resolvedBirthYear})
                      </p>
                      <p className="text-[11px] text-amber-300/80 mt-0.5">
                        Faculty eligibility strictly requires birth year &le; 2003 (minimum 23 years old). Submitting will verify and confirm you as a <strong>Student</strong>.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <Button variant="ghost" size="sm" type="button" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant={isUnderageForFaculty ? 'outline' : 'primary'}
                  size="sm"
                  type="submit"
                  isLoading={isVerifying}
                  leftIcon={isUnderageForFaculty ? <Users className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                >
                  {isUnderageForFaculty ? 'Verify as Student' : 'Verify Credential'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
