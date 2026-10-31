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
  UserCheck,
} from 'lucide-react';
import { FACULTY_DESIGNATIONS } from './degreeCatalog';
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

  return (
    <div className="space-y-6 animate-fade-in">
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
                  University Faculty / Academic Mentor
                </span>
                {isFaculty && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Faculty Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Check this box if you are a college professor, researcher, or faculty advisor.
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
            Your profile will be verified as an active student creator. You are ready to explore hackathons, form dream teams, enter ICPC contest arenas, and publish project workboards!
          </p>
          <div className="pt-2 flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>All verification criteria met. Ready to complete!</span>
          </div>
        </div>
      ) : (
        /* TICKED STATE: Faculty Verification Fields */
        <div className="space-y-4 p-4 rounded-2xl bg-white/[0.02] border border-amber-500/30 animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider font-mono border-b border-white/5 pb-2">
            <FileCheck className="w-4 h-4 text-amber-400" />
            <span>Faculty Verification Credentials</span>
          </div>

          {/* Row 1: Designation & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Academic Designation <span className="text-amber-400">*</span>
              </label>
              <select
                value={facultyDesignation}
                onChange={(e) => setFacultyDesignation(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#0c1220] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 transition-all"
              >
                {FACULTY_DESIGNATIONS.map((des) => (
                  <option key={des} value={des} className="bg-[#0c1220] text-white">
                    {des}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Department / School <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={facultyDepartment}
                  onChange={(e) => setFacultyDepartment(e.target.value)}
                  placeholder="e.g. Dept of Computer Science"
                  className="w-full h-10 px-3 pl-8 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-medium"
                />
                <Building className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
              </div>
            </div>
          </div>

          {/* Row 2: Institutional Email */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Official Institutional / Faculty Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={facultyEmail}
                onChange={(e) => setFacultyEmail(e.target.value)}
                placeholder="e.g. faculty.name@dtu.ac.in"
                className="w-full h-10 px-3 pl-8 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-mono"
              />
              <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
            </div>
          </div>

          {/* Row 3: Faculty ID / Appointment Letter Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Faculty ID Card or Appointment Letter (PDF/Photo)
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              className="hidden"
              onChange={handleDocUpload}
            />

            {facultyDocUrl ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-emerald-300 truncate">
                      Faculty Credential Document Attached
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Ready for administrative verification
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 transition-colors"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => setFacultyDocUrl(null)}
                    className="p-1 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-white/10 hover:border-amber-500/40 rounded-xl p-3.5 text-center transition-all bg-white/[0.01] hover:bg-white/[0.03]"
              >
                {isUploading ? (
                  <div className="py-1 flex flex-col items-center justify-center gap-1">
                    <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                    <span className="text-xs text-slate-300">Uploading document...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1">
                    <UploadCloud className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-bold text-white">
                      Upload Faculty ID Card or Appointment Slip
                    </span>
                    <span className="text-[10px] text-slate-400">
                      PNG, JPG, WebP, or PDF up to 8MB
                    </span>
                  </div>
                )}
              </div>
            )}

            {uploadError && (
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 mt-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
