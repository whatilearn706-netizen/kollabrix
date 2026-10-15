'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Project, ProjectFilterOptions } from '@/types/database';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectFilters } from '@/components/projects/ProjectFilters';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { DEMO_PROJECTS } from '@/data/mockProjects';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  Compass,
  PlusCircle,
  FolderSearch,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

const ITEMS_PER_PAGE = 6;

export default function ExploreProjectsPage() {
  const { user, openAuthModal } = useAuth();

  const [dbProjects, setDbProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [filters, setFilters] = useState<ProjectFilterOptions>({
    search: '',
    category: 'All',
    difficulty: 'All',
    status: 'All',
    skill: undefined,
    technology: undefined,
    sort: 'newest',
    page: 1,
  });

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);

    if (!isSupabaseConfigured()) {
      // Supabase is not configured yet; use curated demo projects
      setDbProjects([]);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch projects joined with owner profiles
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          owner:profiles!projects_owner_id_fkey(
            user_id,
            display_name,
            username,
            avatar_url,
            college,
            course
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase projects query issue:', error.message);
        setFetchError('Could not retrieve database projects. Showing sample projects.');
        setDbProjects([]);
      } else if (data) {
        setDbProjects(data as Project[]);
      }
    } catch (err: unknown) {
      console.warn('Fetch error:', err);
      setFetchError('Could not load database projects.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Combined pool: DB projects + Curated Demo projects (avoid duplicate IDs)
  const combinedProjects = useMemo(() => {
    const list = [...dbProjects];
    const existingIds = new Set(list.map((p) => p.id));
    for (const demo of DEMO_PROJECTS) {
      if (!existingIds.has(demo.id)) {
        list.push(demo);
      }
    }
    return list;
  }, [dbProjects]);

  // Filter & Search
  const filteredProjects = useMemo(() => {
    let result = [...combinedProjects];

    // Search query: title, summary, description, technologies, skills
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.technologies?.some((t) => t.toLowerCase().includes(q)) ||
          p.required_skills?.some((s) => s.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (filters.category && filters.category !== 'All') {
      result = result.filter((p) => p.category === filters.category);
    }

    // Difficulty filter
    if (filters.difficulty && filters.difficulty !== 'All') {
      result = result.filter((p) => p.difficulty === filters.difficulty);
    }

    // Status filter
    if (filters.status && filters.status !== 'All') {
      result = result.filter((p) => p.status === filters.status);
    }

    // Skill filter
    if (filters.skill) {
      const sLower = filters.skill.toLowerCase();
      result = result.filter((p) =>
        p.required_skills?.some((s) => s.toLowerCase() === sLower)
      );
    }

    // Technology filter
    if (filters.technology) {
      const tLower = filters.technology.toLowerCase();
      result = result.filter((p) =>
        p.technologies?.some((t) => t.toLowerCase() === tLower)
      );
    }

    // Sorting
    if (filters.sort === 'alphabetical') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // Newest
      result.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    return result;
  }, [combinedProjects, filters]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE) || 1;
  const currentPage = Math.min(filters.page || 1, totalPages);
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: 'All',
      difficulty: 'All',
      status: 'All',
      skill: undefined,
      technology: undefined,
      sort: 'newest',
      page: 1,
    });
  };

  const handleCreateProjectClick = () => {
    if (!user) {
      openAuthModal('login');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-brand-400 uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>Collegiate Project Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Explore Active Projects
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Discover student-led initiatives seeking collaborators, filtered by skill, tech stack, and category.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchProjects()}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            disabled={isLoading}
          >
            Refresh
          </Button>

          {user ? (
            <Link href="/projects/new">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                Start a Project
              </Button>
            </Link>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateProjectClick}
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Start a Project
            </Button>
          )}
        </div>
      </div>

      {/* Filter Component */}
      <ProjectFilters
        filters={filters}
        onChange={setFilters}
        onClear={handleClearFilters}
        totalResults={filteredProjects.length}
      />

      {/* Results Stats & Active Count */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          Showing{' '}
          <strong className="text-slate-200">
            {filteredProjects.length === 0
              ? 0
              : `${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(
                  currentPage * ITEMS_PER_PAGE,
                  filteredProjects.length
                )}`}
          </strong>{' '}
          of <strong className="text-slate-200">{filteredProjects.length}</strong> projects
        </span>

        {dbProjects.length > 0 && (
          <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
            <Sparkles className="w-3.5 h-3.5" />
            Live Supabase database connected
          </span>
        )}
      </div>

      {/* Loading Skeleton State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-charcoal-900 border border-charcoal-800 p-5 space-y-4"
            >
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-14 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="pt-3 border-t border-charcoal-800 flex justify-between items-center">
                <Skeleton className="h-7 w-28 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl bg-charcoal-900 border border-charcoal-800 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-xl bg-charcoal-800 text-slate-400 flex items-center justify-center mx-auto">
            <FolderSearch className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">No matching projects found</h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              We couldn&apos;t find any projects matching your current combination of keywords and filters. Try adjusting your search or clearing active filters.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Clear All Filters
            </Button>
            {user ? (
              <Link href="/projects/new">
                <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
                  Publish this Idea
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
      ) : (
        /* Project Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pt-6 border-t border-charcoal-800 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters({ ...filters, page: Math.max(currentPage - 1, 1) })}
            disabled={currentPage <= 1}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Previous
          </Button>

          <span className="text-xs text-slate-400 font-mono">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters({ ...filters, page: Math.min(currentPage + 1, totalPages) })}
            disabled={currentPage >= totalPages}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
