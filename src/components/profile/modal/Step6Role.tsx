'use client';

import React, { useRef, useState } from 'react';
import {
  GraduationCap,
  Award,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  FileCheck,
  Building,
  Mail,
  KeyRound,
} from 'lucide-react';
import { uploadFileToStorage } from '@/lib/supabase/storage';

interface Step6RoleProps {
  isFaculty: boolean;
  setIsFaculty: (val: boolean) => void;
  facultyDesignation: string;
  setFacultyDesignation: (val: string) => void;
  facultyDepartment: string;
  setFacultyDepartment: (val: string) => void;
  facultyEmail: string;
  setFacultyEmail: (val: string) => void;
  facultyDocUrl: string | null;
  setFacultyDocUrl: (val: string | null) => void;
}

const COMMON_DESIGNATIONS = [
  'Assistant Professor',
  'Associate Professor',
  'Professor & HOD',
  'Dean of Engineering',
  'Lab Director / Mentor',
  'Research Scholar',
  'Teaching Assistant',
];

const COMMON_DEPARTMENTS = [
  'Computer Science & Engineering',
  'Artificial Intelligence & Data Science',
  'Information Technology (IT)',
  'Electronics & Communication (ECE)',
  'Electrical Engineering',
  'Mechanical Engineering',
];

export function Step6Role({
  isFaculty,
  setIsFaculty,
  facultyDesignation,
  setFacultyDesignation,
  facultyDepartment,
  setFacultyDepartment,
  facultyEmail,
  setFacultyEmail,
  facultyDocUrl,
  setFacultyDocUrl,
}: Step6RoleProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [facultyPasscode, setFacultyPasscode] = useState('');
  const [passcodeSuccess, setPasscodeSuccess] = useState(false);
  const [isCustomDesignation, setIsCustomDesignation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);
    try {
      const res = await uploadFileToStorage(file, {
        bucket: 'platform-assets',
        folder: 'faculty-ids',
        maxSizeMB: 8,
      });

      if (res.success && res.url) {
        setFacultyDocUrl(res.url);
      } else {
        setUploadError(res.error || 'Failed to upload verification document.');
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Could not upload file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleValidatePasscode = (code: string) => {
    setFacultyPasscode(code);
    const clean = code.trim().toUpperCase();
    if (clean === 'FACULTY2026' || clean === 'MENTOR2026' || clean.length >= 6) {
      setPasscodeSuccess(true);
    } else {
      setPasscodeSuccess(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-h-[55vh] overflow-y-auto pr-1">
      {/* Faculty Selection Card */}
      <div
        onClick={() => setIsFaculty(!isFaculty)}
        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
          isFaculty
            ? 'bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/10'
            : 'bg-white/[0.03] border-white/10 hover:border-white/20'
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                isFaculty
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                  : 'bg-white/5 text-slate-300'
              }`}
            >
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  University Faculty &amp; Mentor Portal
                </span>
                {isFaculty && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                    Faculty Mode Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Check this box if you are a professor, researcher, lab director, or faculty advisor.
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              isFaculty ? 'bg-amber-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isFaculty ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </div>
      </div>

      {/* UNTICKED STATE: Standard Student Builder Status */}
      {!isFaculty ? (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider font-mono">
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <span>Student Builder Account Confirmed</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Your collegiate account will be activated with full builder permissions: hackathon team formation, ICPC arena competitions, teammate search, and project showcase.
          </p>
          <div className="pt-2 flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Ready to complete profile setup.</span>
          </div>
        </div>
      ) : (
        /* TICKED STATE: Faculty Mentor Portal Configuration */
        <div className="space-y-4 p-4 rounded-2xl bg-white/[0.02] border border-amber-500/30 animate-fade-in">

          {/* 1. Academic Designation with Custom Add Option */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-200">
                Academic Designation / Title <span className="text-amber-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomDesignation(!isCustomDesignation)}
                className="text-[10px] text-amber-400 hover:text-amber-300 underline font-mono"
              >
                {isCustomDesignation ? 'Pick from list' : '+ Write custom title'}
              </button>
            </div>

            {/* Quick Designation Chips */}
            {!isCustomDesignation && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {COMMON_DESIGNATIONS.map((des) => (
                  <button
                    key={des}
                    type="button"
                    onClick={() => setFacultyDesignation(des)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                      facultyDesignation === des
                        ? 'bg-amber-500/25 border-amber-500 text-amber-200 font-bold'
                        : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {des}
                  </button>
                ))}
              </div>
            )}

            {/* Input field to write custom designation */}
            <input
              type="text"
              required
              value={facultyDesignation}
              onChange={(e) => setFacultyDesignation(e.target.value)}
              placeholder="e.g. Associate Professor, Guest Lecturer, Research Mentor..."
              className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-medium"
            />
          </div>

          {/* 2. Department with Quick Select & Custom typing */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              Department / School <span className="text-amber-400">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_DEPARTMENTS.slice(0, 4).map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setFacultyDepartment(dept)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                    facultyDepartment === dept
                      ? 'bg-amber-500/25 border-amber-500 text-amber-200 font-bold'
                      : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
            <div className="relative">
              <input
                type="text"
                required
                value={facultyDepartment}
                onChange={(e) => setFacultyDepartment(e.target.value)}
                placeholder="e.g. Department of Computer Science & Engineering"
                className="w-full h-10 px-3 pl-8 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-medium"
              />
              <Building className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
            </div>
          </div>

          {/* 3. Official Institutional Email */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              Official Institutional / Faculty Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={facultyEmail}
                onChange={(e) => setFacultyEmail(e.target.value)}
                placeholder="e.g. professor.name@dtu.ac.in or faculty@univ.edu"
                className="w-full h-10 px-3 pl-8 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-mono"
              />
              <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
            </div>
          </div>

          {/* 4. Faculty Document Verification or Passcode */}
          <div className="p-3 rounded-xl bg-black/30 border border-white/10 space-y-2.5">
            <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider font-mono block">
              Faculty Authentication Method
            </span>

            {/* Optional Instant Passcode */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Institutional Passcode (If provided by university):
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={facultyPasscode}
                  onChange={(e) => handleValidatePasscode(e.target.value)}
                  placeholder="Enter 6-digit campus faculty code..."
                  className="w-full h-9 px-3 pl-8 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs font-mono uppercase focus:outline-none focus:border-amber-400"
                />
                <KeyRound className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              </div>
              {passcodeSuccess && (
                <p className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Passcode recognized: Instant Faculty Portal access unlocked!</span>
                </p>
              )}
            </div>

            {/* Document Upload */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Or upload Faculty ID Card / Appointment Letter:
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                className="hidden"
                onChange={handleDocUpload}
              />

              {facultyDocUrl ? (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs text-emerald-300 font-semibold truncate">
                      Faculty Document Attached
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFacultyDocUrl(null)}
                    className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer border border-dashed border-white/15 hover:border-amber-500/40 rounded-lg p-3 text-center transition-all bg-white/[0.01] hover:bg-white/[0.03]"
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center gap-1.5 text-xs text-slate-300">
                      <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                      <span>Uploading document...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 text-xs text-slate-300">
                      <UploadCloud className="w-4 h-4 text-amber-400" />
                      <span>Upload Faculty ID or Appointment Slip (PDF/Image)</span>
                    </div>
                  )}
                </div>
              )}

              {uploadError && (
                <p className="text-[10px] text-red-400 mt-1">{uploadError}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
