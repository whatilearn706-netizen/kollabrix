'use client';

import React, { useState } from 'react';
import { Code2, Compass, Briefcase, CheckCircle2, Plus, X, Sparkles } from 'lucide-react';
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
  const [customRole, setCustomRole] = useState('');

  // 1. Skills Logic
  const toggleSkill = (s: string) => {
    setSkills((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );
  };

  const removeCustomSkill = (s: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSkills((prev) => prev.filter((item) => item !== s));
  };

  const submitCustomSkill = () => {
    const val = customSkill.trim();
    if (!val) return;
    if (!skills.includes(val)) {
      setSkills((prev) => [...prev, val]);
    }
    setCustomSkill('');
  };

  // 2. Interests Logic
  const toggleInterest = (item: string) => {
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const removeCustomInterest = (item: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setInterests((prev) => prev.filter((i) => i !== item));
  };

  const submitCustomInterest = () => {
    const val = customInterest.trim();
    if (!val) return;
    if (!interests.includes(val)) {
      setInterests((prev) => [...prev, val]);
    }
    setCustomInterest('');
  };

  // 3. Roles Logic
  const toggleRole = (role: string) => {
    setPreferredRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const removeCustomRole = (role: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPreferredRoles((prev) => prev.filter((r) => r !== role));
  };

  const submitCustomRole = () => {
    const val = customRole.trim();
    if (!val) return;
    if (!preferredRoles.includes(val)) {
      setPreferredRoles((prev) => [...prev, val]);
    }
    setCustomRole('');
  };

  // Distinct list showing custom user-added items at top followed by standard suggestions
  const customSkills = skills.filter((s) => !SUGGESTED_SKILLS.includes(s));
  const displaySkills = [...customSkills, ...SUGGESTED_SKILLS];

  const customInterests = interests.filter((i) => !SUGGESTED_INTERESTS.includes(i));
  const displayInterests = [...customInterests, ...SUGGESTED_INTERESTS];

  const customRoles = preferredRoles.filter((r) => !PREFERRED_ROLES.includes(r));
  const displayRoles = [...customRoles, ...PREFERRED_ROLES];

  return (
    <div className="space-y-6 animate-fade-in max-h-[55vh] overflow-y-auto pr-1">
      {/* 1. Technical Skills */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Technical Skills (Select at least 2) <span className="text-amber-400">*</span></span>
          </label>
          <span className="text-[10px] font-mono text-amber-400">
            {skills.length} selected
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-white/[0.02] border border-white/5 max-h-36 overflow-y-auto">
          {displaySkills.map((s) => {
            const isSelected = skills.includes(s);
            const isCustom = customSkills.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleSkill(s)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? isCustom
                      ? 'bg-amber-500/30 border-amber-400 text-amber-100 font-bold shadow-xs'
                      : 'bg-amber-500/25 border-amber-500 text-amber-200 font-semibold shadow-xs'
                    : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {isSelected ? (
                  isCustom ? (
                    <Sparkles className="w-3 h-3 text-amber-300" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3 text-amber-400" />
                  )
                ) : null}
                <span>{s}</span>
                {isCustom && (
                  <span
                    onClick={(e) => removeCustomSkill(s, e)}
                    className="ml-0.5 p-0.5 rounded-full hover:bg-amber-400/20 text-amber-300 hover:text-white"
                    title="Remove custom skill"
                  >
                    <X className="w-3 h-3" />
                  </span>
                )}
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
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submitCustomSkill();
              }
            }}
            placeholder="Write custom skill (e.g. PyTorch, Rust, Solidity) and press Enter..."
            className="flex-1 h-9 px-3 rounded-lg bg-white/[0.03] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-mono"
          />
          <button
            type="button"
            onClick={submitCustomSkill}
            className="px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs text-amber-300 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* 2. Interests & Focus Areas */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-orange-400" />
            <span>Interests &amp; Passion Areas</span>
          </label>
          <span className="text-[10px] font-mono text-slate-400">
            {interests.length} selected
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-white/[0.02] border border-white/5 max-h-32 overflow-y-auto">
          {displayInterests.map((item) => {
            const isSelected = interests.includes(item);
            const isCustom = customInterests.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleInterest(item)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? isCustom
                      ? 'bg-orange-500/30 border-orange-400 text-orange-100 font-bold'
                      : 'bg-orange-500/25 border-orange-500 text-orange-200 font-semibold'
                    : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {isSelected ? (
                  isCustom ? (
                    <Sparkles className="w-3 h-3 text-orange-300" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3 text-orange-400" />
                  )
                ) : null}
                <span>{item}</span>
                {isCustom && (
                  <span
                    onClick={(e) => removeCustomInterest(item, e)}
                    className="ml-0.5 p-0.5 rounded-full hover:bg-orange-400/20 text-orange-300 hover:text-white"
                    title="Remove custom interest"
                  >
                    <X className="w-3 h-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={customInterest}
            onChange={(e) => setCustomInterest(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submitCustomInterest();
              }
            }}
            placeholder="Write custom interest and press Enter..."
            className="flex-1 h-9 px-3 rounded-lg bg-white/[0.03] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-mono"
          />
          <button
            type="button"
            onClick={submitCustomInterest}
            className="px-3 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-xs text-orange-300 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* 3. Preferred Project Roles with Custom Add Option */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-amber-400" />
            <span>Preferred Project Roles</span>
          </label>
          <span className="text-[10px] font-mono text-slate-400">
            {preferredRoles.length} selected
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-white/[0.02] border border-white/5 max-h-32 overflow-y-auto">
          {displayRoles.map((role) => {
            const isSelected = preferredRoles.includes(role);
            const isCustom = customRoles.includes(role);
            return (
              <button
                key={role}
                type="button"
                onClick={() => toggleRole(role)}
                className={`text-xs px-3 py-1.5 rounded-xl border text-left transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? isCustom
                      ? 'bg-amber-500/30 border-amber-400 text-amber-100 font-bold'
                      : 'bg-amber-500/25 border-amber-500 text-amber-200 font-semibold'
                    : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {isSelected ? (
                  isCustom ? (
                    <Sparkles className="w-3 h-3 text-amber-300" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3 text-amber-400" />
                  )
                ) : null}
                <span>{role}</span>
                {isCustom && (
                  <span
                    onClick={(e) => removeCustomRole(role, e)}
                    className="ml-0.5 p-0.5 rounded-full hover:bg-amber-400/20 text-amber-300 hover:text-white"
                    title="Remove custom role"
                  >
                    <X className="w-3 h-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Custom Role Input */}
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={customRole}
            onChange={(e) => setCustomRole(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submitCustomRole();
              }
            }}
            placeholder="Write custom role (e.g. AI Researcher, Quantum Engineer) and press Enter..."
            className="flex-1 h-9 px-3 rounded-lg bg-white/[0.03] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-mono"
          />
          <button
            type="button"
            onClick={submitCustomRole}
            className="px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs text-amber-300 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
