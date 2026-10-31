'use client';

import React, { useState } from 'react';
import { Code2, Compass, Briefcase, CheckCircle2, Plus, X } from 'lucide-react';
import { SUGGESTED_SKILLS, SUGGESTED_INTERESTS, PREFERRED_ROLES } from './degreeCatalog';

interface Step4SkillsProps {
  skills: string[];
  setSkills: React.Dispatch<React.SetStateAction<string[]>>;
  interests: string[];
  setInterests: React.Dispatch<React.SetStateAction<string[]>>;
  preferredRoles: string[];
  setPreferredRoles: React.Dispatch<React.SetStateAction<string[]>>;
}

export function Step4Skills({
  skills,
  setSkills,
  interests,
  setInterests,
  preferredRoles,
  setPreferredRoles,
}: Step4SkillsProps) {
  const [customSkill, setCustomSkill] = useState('');
  const [customInterest, setCustomInterest] = useState('');

  const toggleSkill = (s: string) => {
    setSkills((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );
  };

  const handleAddCustomSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = customSkill.trim();
      if (val && !skills.includes(val)) {
        setSkills((prev) => [...prev, val]);
        setCustomSkill('');
      }
    }
  };

  const toggleInterest = (item: string) => {
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleAddCustomInterest = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = customInterest.trim();
      if (val && !interests.includes(val)) {
        setInterests((prev) => [...prev, val]);
        setCustomInterest('');
      }
    }
  };

  const toggleRole = (role: string) => {
    setPreferredRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  return (
    <div className="space-y-6 animate-fade-in max-h-[55vh] overflow-y-auto pr-1">
      {/* 1. Technical Skills */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Technical Skills (Select at least 2) <span className="text-amber-400">*</span></span>
          </label>
          <span className="text-[10px] font-mono text-amber-400">
            {skills.length} selected
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-white/[0.02] border border-white/5 max-h-32 overflow-y-auto">
          {SUGGESTED_SKILLS.map((s) => {
            const isSelected = skills.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleSkill(s)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-amber-500/25 border-amber-500 text-amber-200 font-semibold shadow-xs'
                    : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {isSelected && <CheckCircle2 className="w-3 h-3 text-amber-400" />}
                <span>{s}</span>
              </button>
            );
          })}
        </div>

        {/* Custom skill adder */}
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyDown={handleAddCustomSkill}
            placeholder="Type custom skill and press Enter..."
            className="flex-1 h-9 px-3 rounded-lg bg-white/[0.03] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-mono"
          />
          <button
            type="button"
            onClick={() => {
              const val = customSkill.trim();
              if (val && !skills.includes(val)) {
                setSkills((prev) => [...prev, val]);
                setCustomSkill('');
              }
            }}
            className="px-3 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white flex items-center gap-1 font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* 2. Interests & Focus Areas */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-orange-400" />
            <span>Interests &amp; Passion Areas</span>
          </label>
          <span className="text-[10px] font-mono text-slate-400">
            {interests.length} selected
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-white/[0.02] border border-white/5 max-h-28 overflow-y-auto">
          {SUGGESTED_INTERESTS.map((item) => {
            const isSelected = interests.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleInterest(item)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-orange-500/25 border-orange-500 text-orange-200 font-semibold'
                    : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {isSelected && <CheckCircle2 className="w-3 h-3 text-orange-400" />}
                <span>{item}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={customInterest}
            onChange={(e) => setCustomInterest(e.target.value)}
            onKeyDown={handleAddCustomInterest}
            placeholder="Type custom interest and press Enter..."
            className="flex-1 h-9 px-3 rounded-lg bg-white/[0.03] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-mono"
          />
          <button
            type="button"
            onClick={() => {
              const val = customInterest.trim();
              if (val && !interests.includes(val)) {
                setInterests((prev) => [...prev, val]);
                setCustomInterest('');
              }
            }}
            className="px-3 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white flex items-center gap-1 font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* 3. Preferred Project Roles */}
      <div>
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
          <Briefcase className="w-3.5 h-3.5 text-amber-400" />
          <span>Preferred Project Roles</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {PREFERRED_ROLES.map((role) => {
            const isSelected = preferredRoles.includes(role);
            return (
              <button
                key={role}
                type="button"
                onClick={() => toggleRole(role)}
                className={`text-xs p-2 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-medium'
                    : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                <div className="truncate">{role}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
