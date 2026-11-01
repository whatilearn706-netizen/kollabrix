'use client';

import React from 'react';
import { Calendar, GraduationCap } from 'lucide-react';
import { ACADEMIC_YEARS } from './degreeCatalog';

interface Step3AcademicsProps {
  academicYear: string;
  setAcademicYear: (val: string) => void;
  course: string;
  setCourse: (val: string) => void;
}

export function Step3Academics({
  academicYear,
  setAcademicYear,
  course,
  setCourse,
}: Step3AcademicsProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Academic Year Cards */}
      <div>
        <label className="block text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span>Academic Year <span className="text-amber-400">*</span></span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ACADEMIC_YEARS.map((yr) => {
            const isSelected = academicYear === yr;
            const shortLabel = yr.split('(')[0].trim();
            const subtitle = yr.includes('(') ? yr.split('(')[1].replace(')', '') : '';
            return (
              <button
                key={yr}
                type="button"
                onClick={() => setAcademicYear(yr)}
                className={`p-2.5 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-white shadow-xs'
                    : 'bg-white/[0.02] border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold truncate">{shortLabel}</div>
                {subtitle && (
                  <div className="text-[10px] text-amber-400/80 font-mono truncate">{subtitle}</div>
                )}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 shadow-sm" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Direct Degree & Specialization Input */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
          <span>Degree &amp; Specialization <span className="text-amber-400">*</span></span>
        </label>

        <div className="relative">
          <input
            type="text"
            required
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            placeholder="e.g. B.Tech Computer Science & Engineering, BCA, MBA, M.Tech, etc."
            className="w-full h-11 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all font-medium"
          />
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          Type your exact degree, branch, or field of study. This will appear on your public profile, teammate cards, and hackathon applications.
        </p>
      </div>
    </div>
  );
}
