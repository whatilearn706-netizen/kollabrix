'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { BookOpen, Calendar, Search, Sparkles, Check, ChevronDown } from 'lucide-react';
import { DEGREE_CATALOG, ACADEMIC_YEARS, DegreeItem } from './degreeCatalog';

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter degrees dynamically based on input and category
  const filteredDegrees = useMemo(() => {
    const q = course.trim().toLowerCase();
    return DEGREE_CATALOG.filter((item) => {
      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      // If query is empty, show all in category
      if (!q) return true;

      // Smart match against degree name, category, or tags
      const matchDegree = item.degree.toLowerCase().includes(q);
      const matchCategory = item.category.toLowerCase().includes(q);
      const matchTags = item.tags.some((t) => t.includes(q) || q.includes(t));

      return matchDegree || matchCategory || matchTags;
    });
  }, [course, selectedCategory]);

  const categories = ['All', 'B.Tech', 'BCA/MCA', 'M.Tech', 'B.Sc/M.Sc', 'Design', 'Dual Degree'];

  return (
    <div className="space-y-6 animate-fade-in" ref={dropdownRef}>
      {/* Academic Year Selection */}
      <div>
        <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span>Academic Year <span className="text-amber-400">*</span></span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ACADEMIC_YEARS.map((yr) => {
            const isSelected = academicYear === yr;
            // Short label
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
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Degree / Course with Smart Autocomplete */}
      <div className="relative">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Degree &amp; Specialization <span className="text-amber-400">*</span></span>
          </label>
          <span className="text-[10px] text-slate-400 font-mono">
            Smart suggestions while typing
          </span>
        </div>

        <div className="relative">
          <input
            type="text"
            required
            value={course}
            onFocus={() => setIsDropdownOpen(true)}
            onChange={(e) => {
              setCourse(e.target.value);
              setIsDropdownOpen(true);
            }}
            placeholder="Type 'btech', 'cse', 'mca', 'mtech' to see suggestions..."
            className="w-full h-11 px-3.5 pl-9 pr-9 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-medium"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="absolute right-3 top-3.5 text-slate-400 hover:text-white"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Quick Degree Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
                setIsDropdownOpen(true);
              }}
              className={`text-[10px] px-2.5 py-1 rounded-lg border font-mono whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-white/[0.02] text-slate-400 border-white/5 hover:border-white/20 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dynamic Dropdown Suggestion List */}
        {isDropdownOpen && (
          <div className="absolute z-30 left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-2xl bg-[#0d121f] border border-white/15 shadow-2xl p-1.5 space-y-1 backdrop-blur-xl">
            <div className="px-3 py-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-white/5 flex items-center justify-between">
              <span>Suggested Degrees &amp; Branches ({filteredDegrees.length})</span>
              <span className="text-amber-400/80">Click to select</span>
            </div>

            {filteredDegrees.length > 0 ? (
              filteredDegrees.map((item) => {
                const isSelected = course.toLowerCase() === item.degree.toLowerCase();
                return (
                  <button
                    key={item.degree}
                    type="button"
                    onClick={() => {
                      setCourse(item.degree);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
                        : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
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
                No matching degrees in catalogue. You can write your custom degree in the input above.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
