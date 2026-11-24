'use client';

import React, { useState } from 'react';
import {
  Code2,
  Compass,
  Briefcase,
  CheckCircle2,
  Plus,
  X,
} from 'lucide-react';
import {
  SUGGESTED_SKILLS,
  SUGGESTED_INTERESTS,
  PREFERRED_ROLES,
} from './degreeCatalog';

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

  // 1. Skills Logic (supports comma-separated skills like "Python, C++, Java")
  const toggleSkill = (s: string) => {
    setSkills((prev) =>
      prev.some((item) => item.toLowerCase() === s.toLowerCase())
        ? prev.filter((item) => item.toLowerCase() !== s.toLowerCase())
        : [...prev, s]
    );
  };

  const removeSkill = (s: string) => {
    setSkills((prev) => prev.filter((item) => item.toLowerCase() !== s.toLowerCase()));
  };

  const submitCustomSkill = () => {
    const raw = customSkill.trim();
    if (!raw) return;
    const tokens = raw.split(/[,;\n]+/).map((t) => t.trim()).filter(Boolean);
    setSkills((prev) => {
      const next = [...prev];
      for (const t of tokens) {
        if (!next.some((item) => item.toLowerCase() === t.toLowerCase())) {
          next.push(t);
        }
      }
      return next;
    });
    setCustomSkill('');
  };

  // 2. Interests Logic
  const toggleInterest = (item: string) => {
    setInterests((prev) =>
      prev.some((i) => i.toLowerCase() === item.toLowerCase())
        ? prev.filter((i) => i.toLowerCase() !== item.toLowerCase())
        : [...prev, item]
    );
  };

  const removeInterest = (item: string) => {
    setInterests((prev) => prev.filter((i) => i.toLowerCase() !== item.toLowerCase()));
  };

  const submitCustomInterest = () => {
    const raw = customInterest.trim();
    if (!raw) return;
    const tokens = raw.split(/[,;\n]+/).map((t) => t.trim()).filter(Boolean);
    setInterests((prev) => {
      const next = [...prev];
      for (const t of tokens) {
        if (!next.some((item) => item.toLowerCase() === t.toLowerCase())) {
          next.push(t);
        }
      }
      return next;
    });
    setCustomInterest('');
  };

  // 3. Roles Logic
  const toggleRole = (role: string) => {
    setPreferredRoles((prev) =>
      prev.some((r) => r.toLowerCase() === role.toLowerCase())
        ? prev.filter((r) => r.toLowerCase() !== role.toLowerCase())
        : [...prev, role]
    );
  };

  const removeRole = (role: string) => {
    setPreferredRoles((prev) => prev.filter((r) => r.toLowerCase() !== role.toLowerCase()));
  };

  const submitCustomRole = () => {
    const raw = customRole.trim();
    if (!raw) return;
    const tokens = raw.split(/[,;\n]+/).map((t) => t.trim()).filter(Boolean);
    setPreferredRoles((prev) => {
      const next = [...prev];
      for (const t of tokens) {
        if (!next.some((item) => item.toLowerCase() === t.toLowerCase())) {
          next.push(t);
        }
      }
      return next;
    });
    setCustomRole('');
  };

  return (
    <div className="space-y-6 animate-fade-in max-h-[58vh] overflow-y-auto pr-1">
      {/* 1. Technical Skills */}
      <div className="space-y-2.5">
        <div>
          <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-slate-300" />
            <span>Technical Skills (Select or write at least 2) <span className="text-slate-400">*</span></span>
          </label>
        </div>

        {/* Custom Skill Input (Prominent at top) */}
        <div className="flex gap-2">
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
            placeholder="Type any skill you know (e.g. Python, C++, Java, Figma, ML) & press Enter..."
            className="flex-1 h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-white/30 font-mono transition-all"
          />
          <button
            type="button"
            onClick={submitCustomSkill}
            disabled={!customSkill.trim()}
            className="px-3.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 text-xs text-white flex items-center gap-1 font-semibold transition-colors cursor-pointer disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Add</span>
          </button>
        </div>

        {/* Active Selected Skills Tray */}
        {skills.length > 0 ? (
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center justify-between">
              <span>Your Selected Skills ({skills.length})</span>
              <span className="text-[9px] text-slate-400 font-sans font-normal">Click (✕) to remove</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
              {skills.map((s) => (
                <span
                  key={s}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.12] border border-white/30 text-white font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-3 h-3 text-slate-200" />
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(s)}
                    className="ml-0.5 p-0.5 rounded-full hover:bg-white/20 text-slate-400 hover:text-white transition-colors"
                    title={`Remove ${s}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl border border-dashed border-white/10 text-center text-xs text-slate-400 bg-white/[0.01]">
            👈 Type your skills in the box above, or click from popular options below
          </div>
        )}

        {/* Popular Suggestions */}
        <div>
          <div className="text-[11px] text-slate-400 mb-1.5 flex items-center justify-between">
            <span>Popular collegiate skills (click to toggle):</span>
          </div>
          <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-white/[0.02] border border-white/5 max-h-36 overflow-y-auto">
            {SUGGESTED_SKILLS.map((s) => {
              const isSelected = skills.some((item) => item.toLowerCase() === s.toLowerCase());
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSkill(s)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-white/[0.14] border-white/40 text-white font-semibold shadow-xs'
                      : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {isSelected ? (
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  ) : (
                    <span className="text-slate-500">+</span>
                  )}
                  <span>{s}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Interests & Focus Areas */}
      <div className="space-y-2.5 pt-2 border-t border-white/5">
        <div>
          <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-slate-300" />
            <span>Interests &amp; Passion Areas (Select at least 1) <span className="text-slate-400">*</span></span>
          </label>
        </div>

        {/* Custom Interest Input */}
        <div className="flex gap-2">
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
            placeholder="Write custom interest (e.g. Web3, Game Dev, Robotics) & press Enter..."
            className="flex-1 h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 font-mono transition-all"
          />
          <button
            type="button"
            onClick={submitCustomInterest}
            disabled={!customInterest.trim()}
            className="px-3.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-xs text-white flex items-center gap-1 font-semibold transition-colors cursor-pointer disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* Active Selected Interests Tray */}
        {interests.length > 0 && (
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center justify-between">
              <span>Your Selected Interests ({interests.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {interests.map((item) => (
                <span
                  key={item}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.12] border border-white/30 text-white font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-3 h-3 text-slate-300" />
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => removeInterest(item)}
                    className="ml-0.5 p-0.5 rounded-full hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                    title={`Remove ${item}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Popular Interests Tags */}
        <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-white/[0.02] border border-white/5 max-h-28 overflow-y-auto">
          {SUGGESTED_INTERESTS.map((item) => {
            const isSelected = interests.some((i) => i.toLowerCase() === item.toLowerCase());
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleInterest(item)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                  isSelected
                    ? 'bg-white/[0.12] border-white/30 text-white font-semibold shadow-xs'
                    : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {isSelected ? (
                  <CheckCircle2 className="w-3 h-3 text-slate-200" />
                ) : (
                  <span className="text-slate-500">+</span>
                )}
                <span>{item}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Preferred Project Roles */}
      <div className="space-y-2.5 pt-2 border-t border-white/5">
        <div>
          <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-slate-300" />
            <span>Preferred Project Roles (Select at least 1) <span className="text-slate-400">*</span></span>
          </label>
        </div>

        {/* Custom Role Input */}
        <div className="flex gap-2">
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
            placeholder="Write custom role (e.g. AI Researcher, Quantum Engineer) & press Enter..."
            className="flex-1 h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 font-mono transition-all"
          />
          <button
            type="button"
            onClick={submitCustomRole}
            disabled={!customRole.trim()}
            className="px-3.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-xs text-white flex items-center gap-1 font-semibold transition-colors cursor-pointer disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* Active Selected Roles Tray */}
        {preferredRoles.length > 0 && (
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center justify-between">
              <span>Your Selected Roles ({preferredRoles.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {preferredRoles.map((role) => (
                <span
                  key={role}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.12] border border-white/30 text-white font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-3 h-3 text-slate-300" />
                  <span>{role}</span>
                  <button
                    type="button"
                    onClick={() => removeRole(role)}
                    className="ml-0.5 p-0.5 rounded-full hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                    title={`Remove ${role}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Popular Roles Tags */}
        <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-white/[0.02] border border-white/5 max-h-28 overflow-y-auto">
          {PREFERRED_ROLES.map((role) => {
            const isSelected = preferredRoles.some((r) => r.toLowerCase() === role.toLowerCase());
            return (
              <button
                key={role}
                type="button"
                onClick={() => toggleRole(role)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border text-left transition-all flex items-center gap-1 cursor-pointer ${
                  isSelected
                    ? 'bg-white/[0.12] border-white/30 text-white font-semibold shadow-xs'
                    : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {isSelected ? (
                  <CheckCircle2 className="w-3 h-3 text-slate-200" />
                ) : (
                  <span className="text-slate-500">+</span>
                )}
                <span>{role}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
