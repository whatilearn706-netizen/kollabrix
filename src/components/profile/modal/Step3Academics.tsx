'use client';

import React, { useState, useMemo } from 'react';
import { BookOpen, Calendar, Search, Sparkles, Check, Plus, Edit2 } from 'lucide-react';
import { DEGREE_CATALOG, ACADEMIC_YEARS } from './degreeCatalog';

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
  const [degreeSearch, setDegreeSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('B.Tech');
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Filter degrees dynamically based on search and selected category
  const filteredDegrees = useMemo(() => {
    const q = degreeSearch.trim().toLowerCase();
    return DEGREE_CATALOG.filter((item) => {
      if (q) {
        // If searching, search everywhere (degree, tags, category)
        const matchDegree = item.degree.toLowerCase().includes(q);
        const matchCategory = item.category.toLowerCase().includes(q);
        const matchTags = item.tags.some((t) => t.includes(q) || q.includes(t));
        return matchDegree || matchCategory || matchTags;
      }
      // If not typing in search, filter by active category
      if (activeCategory === 'All') return true;
      return item.category === activeCategory;
    });
  }, [degreeSearch, activeCategory]);

  const categories = ['All', 'B.Tech', 'BCA/MCA', 'M.Tech', 'B.Sc/M.Sc', 'Design', 'Dual Degree'];

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

      {/* 2. Degree & Branch Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Degree &amp; Specialization <span className="text-amber-400">*</span></span>
          </label>
          <button
            type="button"
            onClick={() => setIsCustomMode(!isCustomMode)}
            className="text-[11px] text-amber-400 hover:text-amber-300 font-mono flex items-center gap-1 transition-colors"
          >
            <Edit2 className="w-3 h-3" />
            <span>{isCustomMode ? 'Pick from catalog' : 'Write custom degree'}</span>
          </button>
        </div>

        {/* Selected Degree Preview Card */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] text-amber-400 uppercase tracking-wider font-mono block">
              Currently Selected Degree:
            </span>
            <div className="text-xs font-black text-white truncate mt-0.5">
              {course || 'None selected'}
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
            Active
          </span>
        </div>

        {isCustomMode ? (
          /* Custom Degree Freeform Input */
          <div className="space-y-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/10 animate-fade-in">
            <label className="block text-[11px] font-semibold text-slate-300">
              Type Your Exact Degree &amp; Branch:
            </label>
            <input
              type="text"
              required
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="e.g. B.Tech Computer Science (Cybersecurity) or B.Sc Physics"
              className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-medium"
            />
          </div>
        ) : (
          /* Autocomplete & Category Browser */
          <div className="space-y-2 p-3 rounded-2xl bg-white/[0.02] border border-white/10">
            {/* Live Search Input */}
            <div className="relative">
              <input
                type="text"
                value={degreeSearch}
                onChange={(e) => setDegreeSearch(e.target.value)}
                placeholder="Search degrees (e.g. 'btech', 'cse', 'mca', 'aiml', 'data')..."
                className="w-full h-10 px-3 pl-9 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-medium"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              {degreeSearch && (
                <button
                  type="button"
                  onClick={() => setDegreeSearch('')}
                  className="absolute right-3 top-3 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat);
                    setDegreeSearch('');
                  }}
                  className={`text-[10px] px-2.5 py-1 rounded-lg border font-mono whitespace-nowrap transition-all ${
                    activeCategory === cat && !degreeSearch
                      ? 'bg-amber-500/25 text-amber-200 border-amber-500/50 font-bold'
                      : 'bg-white/[0.02] text-slate-400 border-white/5 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* List of Matching Degrees */}
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
              {filteredDegrees.length > 0 ? (
                filteredDegrees.map((item) => {
                  const isSelected = course.toLowerCase() === item.degree.toLowerCase();
                  return (
                    <button
                      key={item.degree}
                      type="button"
                      onClick={() => setCourse(item.degree)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 font-bold shadow-xs'
                          : 'text-slate-300 hover:bg-white/[0.06] hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        )}
                        <span className="truncate">{item.degree}</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-400 shrink-0 ml-2">
                        {item.category}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="p-3 text-center text-xs text-slate-400">
                  <p>No matching degrees found for &quot;{degreeSearch}&quot;.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setCourse(degreeSearch);
                      setIsCustomMode(true);
                    }}
                    className="mt-1 text-xs text-amber-400 underline"
                  >
                    Use &quot;{degreeSearch}&quot; as custom degree
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
