'use client';

import React, { useState } from 'react';
import { BookOpen, Check, Plus, Sparkles, X, Target } from 'lucide-react';

interface FacultyStep3ExpertiseProps {
  facultySubjects: string[];
  setFacultySubjects: (val: string[]) => void;
  researchFocus: string;
  setResearchFocus: (val: string) => void;
}

const COMMON_DOMAINS = [
  'Data Structures & Algorithms',
  'Machine Learning & AI',
  'Full Stack Web Development',
  'Cloud Architecture & DevOps',
  'Cybersecurity & Cryptography',
  'Database Management Systems',
  'Mobile Application Development',
  'Operating Systems & Networks',
  'Computer Vision & NLP',
  'Competitive Programming',
  'Internet of Things (IoT)',
  'Distributed Systems',
  'Blockchain Technologies',
  'Software Architecture & Design',
];

export function FacultyStep3Expertise({
  facultySubjects,
  setFacultySubjects,
  researchFocus,
  setResearchFocus,
}: FacultyStep3ExpertiseProps) {
  const [customSubjectInput, setCustomSubjectInput] = useState('');

  const toggleSubject = (subject: string) => {
    if (facultySubjects.includes(subject)) {
      setFacultySubjects(facultySubjects.filter((s) => s !== subject));
    } else {
      setFacultySubjects([...facultySubjects, subject]);
    }
  };

  const handleAddCustomSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customSubjectInput.trim();
    if (clean && !facultySubjects.includes(clean)) {
      setFacultySubjects([...facultySubjects, clean]);
      setCustomSubjectInput('');
    }
  };

  const removeSubject = (subject: string) => {
    setFacultySubjects(facultySubjects.filter((s) => s !== subject));
  };

  return (
    <div className="space-y-6 animate-fade-in max-h-[55vh] overflow-y-auto pr-1 select-none">
      {/* 1. Subject Domains & Mentorship Specializations */}
      <div className="space-y-3">
        <label className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-purple-400" />
          <span>Teaching &amp; Mentorship Domains <span className="text-purple-400">*</span></span>
        </label>
        <p className="text-[11px] text-slate-400">
          Select areas where you guide student research, evaluate project deliverables, or mentor collegiate hackathon teams.
        </p>

        {/* Selected Subjects Tag Bar */}
        {facultySubjects.length > 0 && (
          <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
            {facultySubjects.map((s) => (
              <span
                key={s}
                className="px-2.5 py-1 rounded-lg bg-purple-600 text-white text-[11px] font-semibold flex items-center gap-1 shadow-sm"
              >
                <span>{s}</span>
                <button
                  type="button"
                  onClick={() => removeSubject(s)}
                  className="hover:text-purple-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Pre-defined Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          {COMMON_DOMAINS.map((domain) => {
            const isSelected = facultySubjects.includes(domain);
            return (
              <button
                key={domain}
                type="button"
                onClick={() => toggleSubject(domain)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border cursor-pointer ${
                  isSelected
                    ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30 font-bold'
                    : 'bg-white/[0.04] text-slate-300 border-white/10 hover:border-purple-500/40 hover:bg-white/[0.08]'
                }`}
              >
                {isSelected ? <Check className="w-3 h-3 text-white" /> : <Plus className="w-3 h-3 text-slate-400" />}
                <span>{domain}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Subject Adder */}
        <div className="flex gap-2 pt-1">
          <input
            type="text"
            value={customSubjectInput}
            onChange={(e) => setCustomSubjectInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustomSubject(e);
              }
            }}
            placeholder="Add custom domain or subject..."
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
          />
          <button
            type="button"
            onClick={handleAddCustomSubject}
            disabled={!customSubjectInput.trim()}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition-all"
          >
            Add
          </button>
        </div>
      </div>

      {/* 2. Research Focus & Mentorship Overview */}
      <div className="space-y-2 pt-2 border-t border-white/5">
        <label className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-purple-400" />
          <span>Research Focus &amp; Mentorship Scope <span className="text-slate-500 text-[10px] normal-case">(Optional)</span></span>
        </label>
        <p className="text-[11px] text-slate-400">
          Highlight research publications, collegiate labs, or institutional challenges you supervise.
        </p>
        <textarea
          value={researchFocus}
          onChange={(e) => setResearchFocus(e.target.value)}
          rows={3}
          placeholder="e.g. Supervising student research in deep learning optimization and high-performance cloud architectures. Open to mentoring collegiate hackathon squads."
          className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono resize-none leading-relaxed"
        />
      </div>
    </div>
  );
}
