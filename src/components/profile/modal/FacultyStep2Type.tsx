'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  Building,
  GraduationCap,
  Search,
  Check,
  IdCard,
  Layers,
} from 'lucide-react';
import { SUGGESTED_COLLEGES } from './degreeCatalog';

interface FacultyStep2TypeProps {
  college: string;
  setCollege: (val: string) => void;
  facultyDesignation: string;
  setFacultyDesignation: (val: string) => void;
  facultyDepartment: string;
  setFacultyDepartment: (val: string) => void;
  employeeId: string;
  setEmployeeId: (val: string) => void;
}

const COMMON_DESIGNATIONS = [
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Head of Department (HOD)',
  'Dean of Engineering / Academics',
  'Research Mentor / Scientist',
  'Lab Director / Instructor',
  'Lecturer / Academic Coordinator',
];

const COMMON_DEPARTMENTS = [
  'Computer Science & Engineering (CSE)',
  'Information Technology (IT)',
  'Artificial Intelligence & Data Science (AI/DS)',
  'Electronics & Communication (ECE)',
  'Electrical & Electronics (EEE)',
  'Mechanical Engineering',
  'Applied Sciences & Mathematics',
  'School of Computing & Technology',
  'Management & Business Studies',
];

export function FacultyStep2Type({
  college,
  setCollege,
  facultyDesignation,
  setFacultyDesignation,
  facultyDepartment,
  setFacultyDepartment,
  employeeId,
  setEmployeeId,
}: FacultyStep2TypeProps) {
  const [collegeSearch, setCollegeSearch] = useState('');
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [isCustomDesignation, setIsCustomDesignation] = useState(false);

  const filteredColleges = SUGGESTED_COLLEGES.filter((c) =>
    c.toLowerCase().includes(collegeSearch.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in max-h-[55vh] overflow-y-auto pr-1 select-none">
      {/* 1. Faculty Designation / Academic Title */}
      <div className="space-y-3">
        <label className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-purple-400" />
          <span>Faculty Type / Designation <span className="text-purple-400">*</span></span>
        </label>
        <p className="text-[11px] text-slate-400">
          Select your official collegiate designation or academic position.
        </p>

        <div className="flex flex-wrap gap-2">
          {COMMON_DESIGNATIONS.map((title) => {
            const isSelected = facultyDesignation === title;
            return (
              <button
                key={title}
                type="button"
                onClick={() => {
                  setFacultyDesignation(title);
                  setIsCustomDesignation(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border cursor-pointer ${
                  isSelected
                    ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30 font-bold'
                    : 'bg-white/[0.04] text-slate-300 border-white/10 hover:border-purple-500/40 hover:bg-white/[0.08]'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
                <span>{title}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Designation option */}
        <div className="pt-1">
          <input
            type="text"
            value={facultyDesignation}
            onChange={(e) => {
              setFacultyDesignation(e.target.value);
              setIsCustomDesignation(true);
            }}
            placeholder="Or write custom designation (e.g. Adjunct Professor, Guest Faculty)"
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
          />
        </div>
      </div>

      {/* 2. Academic Department */}
      <div className="space-y-3 pt-2 border-t border-white/5">
        <label className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          <span>Department / School <span className="text-purple-400">*</span></span>
        </label>

        <div className="flex flex-wrap gap-2">
          {COMMON_DEPARTMENTS.slice(0, 6).map((dept) => {
            const isSelected = facultyDepartment === dept;
            return (
              <button
                key={dept}
                type="button"
                onClick={() => setFacultyDepartment(dept)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-purple-600/30 text-purple-200 border-purple-500 font-bold'
                    : 'bg-white/[0.03] text-slate-400 border-white/10 hover:border-white/20'
                }`}
              >
                {dept}
              </button>
            );
          })}
        </div>

        <input
          type="text"
          value={facultyDepartment}
          onChange={(e) => setFacultyDepartment(e.target.value)}
          placeholder="e.g. Computer Science & Engineering (CSE)"
          className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
        />
      </div>

      {/* 3. Institution / College Name */}
      <div className="space-y-2 pt-2 border-t border-white/5 relative">
        <label className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 text-purple-400" />
          <span>Collegiate Institution / University <span className="text-purple-400">*</span></span>
        </label>

        <div className="relative">
          <input
            type="text"
            value={college}
            onChange={(e) => {
              setCollege(e.target.value);
              setCollegeSearch(e.target.value);
              setShowCollegeDropdown(true);
            }}
            onFocus={() => setShowCollegeDropdown(true)}
            placeholder="Type or select your University / College..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
          />
        </div>

        {/* Suggested Colleges Dropdown */}
        {showCollegeDropdown && collegeSearch.trim().length > 1 && filteredColleges.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-charcoal-900 border border-purple-500/40 rounded-xl overflow-hidden shadow-xl max-h-40 overflow-y-auto">
            {filteredColleges.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setCollege(c);
                  setShowCollegeDropdown(false);
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-200 hover:bg-purple-600/20 hover:text-white flex items-center justify-between border-b border-white/5 last:border-none"
              >
                <span>{c}</span>
                <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. Employee / Faculty Roll ID (Optional) */}
      <div className="space-y-2 pt-2 border-t border-white/5">
        <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <IdCard className="w-3.5 h-3.5 text-slate-400" />
          <span>Faculty / Employee ID <span className="text-slate-500 text-[10px] normal-case">(Optional)</span></span>
        </label>
        <input
          type="text"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          placeholder="e.g. FAC-2024-042 or EMP-1092"
          className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
        />
      </div>
    </div>
  );
}
