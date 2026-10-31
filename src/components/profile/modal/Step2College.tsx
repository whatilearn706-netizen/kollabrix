'use client';

import React, { useRef, useState } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  UploadCloud,
  Clock,
  AlertCircle,
  Loader2,
  X,
  IdCard,
  FileText,
  Search,
} from 'lucide-react';
import { SUGGESTED_COLLEGES } from './degreeCatalog';
import { uploadFileToStorage } from '@/lib/supabase/storage';
import { useAuth } from '@/components/auth/AuthProvider';

interface Step2CollegeProps {
  college: string;
  setCollege: (val: string) => void;
  studentIdUrl: string | null;
  setStudentIdUrl: (val: string | null) => void;
  studentRollNo: string;
  setStudentRollNo: (val: string) => void;
  displayName?: string;
  username?: string;
}

export function Step2College({
  college,
  setCollege,
  studentIdUrl,
  setStudentIdUrl,
  studentRollNo,
  setStudentRollNo,
  displayName,
  username,
}: Step2CollegeProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);
    try {
      const res = await uploadFileToStorage(file, {
        bucket: 'platform-assets',
        folder: 'student-ids',
        maxSizeMB: 8,
      });

      if (res.success && res.url) {
        setStudentIdUrl(res.url);

        // Immediately notify admin verification queue
        try {
          await fetch('/api/verify/college-id', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              collegeName: college.trim() || 'Collegiate Institution',
              studentRollNumber: studentRollNo.trim() || 'ROLL-PENDING',
              idCardImage: res.url,
              userId: user?.id,
              username: username || user?.email?.split('@')[0] || 'student',
              studentName: displayName || username || 'Student',
              email: user?.email,
            }),
          });
        } catch (postErr) {
          console.warn('Queue notification note:', postErr);
        }
      } else {
        setUploadError(res.error || 'Failed to upload student ID card.');
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Could not process document.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* College / University Name */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span>College / University Name</span>
            <span className="text-amber-400">*</span>
          </label>
          <span className="text-[10px] text-slate-400 font-mono">
            Type any college or pick below
          </span>
        </div>

        <div className="relative mb-2.5">
          <input
            type="text"
            required
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            placeholder="e.g. Delhi Technological University (DTU) or IIT Bombay"
            className="w-full h-11 px-3.5 pl-9 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-medium"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
        </div>

        {/* Popular Quick Select Chips */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
            Popular Campuses:
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 rounded-xl bg-white/[0.01] border border-white/5">
            {SUGGESTED_COLLEGES.map((col) => {
              const isSelected = college.toLowerCase() === col.toLowerCase();
              return (
                <button
                  key={col}
                  type="button"
                  onClick={() => setCollege(col)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-amber-500/25 border-amber-500 text-amber-200 font-semibold shadow-xs'
                      : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {col}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Student ID Card Verification Card */}
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Student ID Card Verification
            </h4>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono">
              Admin Verified
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Upload your valid student ID card or campus admission slip. It is securely routed to the Admin Control Center for official collegiate verification.
          </p>
        </div>

        {/* Optional Student Roll / ID number */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
            Student Roll Number / Enrollment Code
          </label>
          <div className="relative">
            <input
              type="text"
              value={studentRollNo}
              onChange={(e) => setStudentRollNo(e.target.value)}
              placeholder="e.g. 2K23/CO/245 or DTU/2024/091"
              className="w-full h-9 px-3 pl-8 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-mono"
            />
            <IdCard className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* ID Card Uploader / Preview */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          className="hidden"
          onChange={handleIdUpload}
        />

        {studentIdUrl ? (
          /* PENDING VERIFICATION STATE (Amber) */
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-300">
                      Student ID Card Uploaded
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase font-black">
                      Verification Pending
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Routed to Admin Control Center. An admin will review and verify your collegiate badge.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors font-medium"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => setStudentIdUrl(null)}
                  className="p-1 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                  title="Remove ID Card"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Thumbnail preview if image */}
            {studentIdUrl.startsWith('http') && !studentIdUrl.endsWith('.pdf') && (
              <div className="mt-1 pt-2 border-t border-amber-500/20 flex items-center gap-2">
                <div className="w-12 h-8 rounded border border-white/10 overflow-hidden bg-black/40 shrink-0">
                  <img src={studentIdUrl} alt="Student ID" className="w-full h-full object-cover" />
                </div>
                <span className="text-[10px] text-slate-400 font-mono truncate">
                  ID card attached &amp; ready for administrative audit
                </span>
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer border-2 border-dashed border-white/10 hover:border-amber-500/40 rounded-xl p-4 text-center transition-all bg-white/[0.01] hover:bg-white/[0.03]"
          >
            {isUploading ? (
              <div className="py-2 flex flex-col items-center justify-center gap-1.5">
                <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                <span className="text-xs text-slate-300">Uploading and queuing ID card in admin center...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1">
                <UploadCloud className="w-6 h-6 text-amber-400" />
                <span className="text-xs font-bold text-white">
                  Click to upload Student ID card (Photo or PDF)
                </span>
                <span className="text-[10px] text-slate-400">
                  PNG, JPG, WebP, or PDF up to 8MB
                </span>
              </div>
            )}
          </div>
        )}

        {uploadError && (
          <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>
    </div>
  );
}
