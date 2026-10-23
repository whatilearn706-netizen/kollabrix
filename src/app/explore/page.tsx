'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Project, ProjectFilterOptions, ExploreConfig } from '@/types/database';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectFilters } from '@/components/projects/ProjectFilters';
import { Skeleton, ProjectCardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { DEMO_PROJECTS } from '@/data/mockProjects';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import { useSiteTheme } from '@/components/theme/SiteThemeProvider';
import {
  Compass,
  PlusCircle,
  FolderSearch,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sparkles,
  GraduationCap,
  BookOpen,
  Trophy,
  Lock,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

import { getPageCache, setPageCache } from '@/lib/cache/pageDataCache';

const DEFAULT_PAGE_SIZE = 12;

export default function ExploreProjectsPage() {
  const { user, openAuthModal } = useAuth();
  const { theme } = useSiteTheme();

  // Instant In-Memory / Stale-While-Revalidate Cache
  const cachedProjects = getPageCache<Project[]>('linkora_explore_projects_p1');
  const cachedCount = getPageCache<number>('linkora_explore_count_p1');
  const cachedConfig = getPageCache<ExploreConfig>('linkora_explore_config');

  // Dynamic Explore configuration
  const [exploreConfig, setExploreConfig] = useState<ExploreConfig | null>(() => cachedConfig);

  const [projects, setProjects] = useState<Project[]>(() => cachedProjects || []);
  const [totalCount, setTotalCount] = useState<number>(() => cachedCount || (cachedProjects ? cachedProjects.length : 0));
  const [isLoading, setIsLoading] = useState<boolean>(() => !cachedProjects);
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

  const pageSize = exploreConfig?.default_page_size || DEFAULT_PAGE_SIZE;

  // 1. Load dynamic Explore configuration from platform settings
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/explore/config');
        const data = await res.json();
        if (data?.config) {
          setExploreConfig(data.config);
          setPageCache('linkora_explore_config', data.config);
        }
      } catch (err) {
        console.warn('Failed to load explore config:', err);
      }
    }
    loadConfig();
  }, []);

  const isDefaultView =
    (!filters.search || !filters.search.trim()) &&
    (!filters.category || filters.category === 'All') &&
    (!filters.difficulty || filters.difficulty === 'All') &&
    (!filters.status || filters.status === 'All') &&
    !filters.skill &&
    !filters.technology &&
    (!filters.page || filters.page === 1);

  // 2. Scalable database-backed pagination query
  const fetchProjects = useCallback(async () => {
    // Only flash skeleton if no cached projects or user is actively filtering
    if (projects.length === 0 || !isDefaultView) {
      setIsLoading(true);
    }
    setFetchError(null);

    const currentPage = filters.page || 1;

    if (!isSupabaseConfigured()) {
      // Offline / Demo Fallback Mode
      let list = DEMO_PROJECTS.filter(
        (p) =>
          p.category !== ('Hackathon Sprint' as any) &&
          !p.category?.toLowerCase().includes('hackathon') &&
          !p.summary?.startsWith('Hackathon Team Sprint') &&
          !p.title?.toLowerCase().includes('hackathon sprint')
      );

      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        list = list.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.summary.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.technologies?.some((t) => t.toLowerCase().includes(q)) ||
            p.required_skills?.some((s) => s.toLowerCase().includes(q))
        );
      }
      if (filters.category && filters.category !== 'All') {
        list = list.filter((p) => p.category === filters.category);
      }
      if (filters.difficulty && filters.difficulty !== 'All') {
        list = list.filter((p) => p.difficulty === filters.difficulty);
      }
      if (filters.status && filters.status !== 'All') {
        list = list.filter((p) => p.status === filters.status);
      }
      if (filters.skill) {
        const sLower = filters.skill.toLowerCase();
        list = list.filter((p) => p.required_skills?.some((s) => s.toLowerCase() === sLower));
      }
      if (filters.technology) {
        const tLower = filters.technology.toLowerCase();
        list = list.filter((p) => p.technologies?.some((t) => t.toLowerCase() === tLower));
      }

      if (filters.sort === 'alphabetical') {
        list.sort((a, b) => a.title.localeCompare(b.title));
      } else {
        list.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }

      const total = list.length;
      const start = (currentPage - 1) * pageSize;
      const paginated = list.slice(start, start + pageSize);

      setTotalCount(total);
      setProjects(paginated);
      if (isDefaultView) {
        setPageCache('linkora_explore_projects_p1', paginated);
        setPageCache('linkora_explore_count_p1', total);
      }
      setIsLoading(false);
      return;
    }

    try {
      // Build dynamic database query with exact count
      // Strictly exclude hackathon sprints so Explore ONLY displays user-created projects
      let query = supabase
        .from('projects')
        .select(
          `
          *,
          owner:profiles!projects_owner_id_fkey(
            user_id,
            display_name,
            username,
            avatar_url,
            college,
            course
          )
        `,
          { count: 'exact' }
        )
        .neq('category', 'Hackathon Sprint')
        .not('summary', 'ilike', 'Hackathon Team Sprint%');

      // Filters
      if (filters.category && filters.category !== 'All') {
        query = query.eq('category', filters.category);
      }
      if (filters.difficulty && filters.difficulty !== 'All') {
        query = query.eq('difficulty', filters.difficulty);
      }
      if (filters.status && filters.status !== 'All') {
        query = query.eq('status', filters.status);
      }
      if (filters.skill) {
        query = query.contains('required_skills', [filters.skill]);
      }
      if (filters.technology) {
        query = query.contains('technologies', [filters.technology]);
      }
      if (filters.search && filters.search.trim()) {
        const q = filters.search.trim();
        query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%,description.ilike.%${q}%`);
      }

      // Stable sorting: Featured projects prioritized, then user sort
      try {
        if (filters.sort === 'alphabetical') {
          query = query.order('is_featured', { ascending: false }).order('title', { ascending: true });
        } else {
          query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
        }
      } catch {
        query = query.order('created_at', { ascending: false });
      }

      // Range Pagination: range(from, to)
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      // Check deleted projects tombstone and verified users registry
      let deletedSet = new Set<string>();
      const verifiedUserSet = new Set<string>();
      try {
        const { data: sRows } = await supabase
          .from('platform_settings')
          .select('key, value')
          .in('key', ['deleted_projects', 'linkedin_college_verifications', 'site_master_control_config']);

        if (Array.isArray(sRows)) {
          for (const row of sRows) {
            if (row.key === 'deleted_projects' && row.value) {
              const raw = row.value;
              const ids: string[] = Array.isArray(raw.deletedIds) ? raw.deletedIds : [];
              const titles: string[] = Array.isArray(raw.deletedTitles) ? raw.deletedTitles : [];
              [...ids, ...titles].forEach((s: string) => {
                if (s) deletedSet.add(s.trim().toLowerCase());
              });
            } else if (row.key === 'site_master_control_config' && row.value?.deletedProjects) {
              const raw = row.value.deletedProjects;
              const ids: string[] = Array.isArray(raw.deletedIds) ? raw.deletedIds : [];
              const titles: string[] = Array.isArray(raw.deletedTitles) ? raw.deletedTitles : [];
              [...ids, ...titles].forEach((s: string) => {
                if (s) deletedSet.add(s.trim().toLowerCase());
              });
            } else if (row.key === 'linkedin_college_verifications' && Array.isArray(row.value)) {
              row.value.forEach((v: any) => {
                if (v.userId) verifiedUserSet.add(v.userId);
                if (v.username) verifiedUserSet.add(v.username.toLowerCase().trim());
              });
            }
          }
        }
      } catch {}

      const filterDeleted = (arr: Project[]) => {
        return arr.filter((p) => {
          if (deletedSet.size > 0) {
            if (
              deletedSet.has((p.id || '').toLowerCase()) ||
              deletedSet.has((p.title || '').trim().toLowerCase())
            ) {
              return false;
            }
          }
          // Strictly exclude any hackathon sprint items from Explore
          const cat = (p.category || '').toLowerCase();
          const sum = (p.summary || '').toLowerCase();
          const tit = (p.title || '').toLowerCase();
          if (
            cat === 'hackathon sprint' ||
            cat.includes('hackathon') ||
            sum.startsWith('hackathon team sprint') ||
            tit.includes('hackathon sprint')
          ) {
            return false;
          }
          return true;
        });
      };

      if (error) {
        console.warn('Supabase projects query issue:', error.message);
        setFetchError('Could not retrieve database projects. Showing sample projects.');
        const cleanDemo = filterDeleted(DEMO_PROJECTS);
        setProjects(cleanDemo.slice(0, pageSize));
        setTotalCount(cleanDemo.length);
      } else if (data) {
        if (data.length === 0 && (!count || count === 0) && !filters.search && filters.category === 'All') {
          // If remote DB is freshly initialized with 0 projects, fall back gracefully to curated demo projects
          const cleanDemo = filterDeleted(DEMO_PROJECTS);
          setProjects(cleanDemo.slice(0, pageSize));
          setTotalCount(cleanDemo.length);
        } else {
          const cleanData = filterDeleted(data as Project[]);
          const verifiedProjects = cleanData.map((proj) => {
            const isOwnerVerified =
              (proj.owner?.user_id && verifiedUserSet.has(proj.owner.user_id)) ||
              (proj.owner?.username && verifiedUserSet.has(proj.owner.username.toLowerCase().trim())) ||
              (proj.owner_id && verifiedUserSet.has(proj.owner_id));
            if (proj.owner) {
              return { ...proj, owner: { ...proj.owner, college_verified: Boolean(isOwnerVerified) } };
            }
            return proj;
          });
          setProjects(verifiedProjects);
          setTotalCount(cleanData.length);
          if (isDefaultView) {
            setPageCache('linkora_explore_projects_p1', verifiedProjects);
            setPageCache('linkora_explore_count_p1', cleanData.length);
          }
        }
      }
    } catch (err: unknown) {
      console.warn('Fetch error:', err);
      setFetchError('Could not load database projects.');
      const fallback = DEMO_PROJECTS.slice(0, pageSize);
      setProjects(fallback);
      setTotalCount(DEMO_PROJECTS.length);
      if (isDefaultView) {
        setPageCache('linkora_explore_projects_p1', fallback);
        setPageCache('linkora_explore_count_p1', DEMO_PROJECTS.length);
      }
    } finally {
      setIsLoading(false);
    }
  }, [filters, pageSize]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Total pages calculation
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(filters.page || 1, totalPages);

  // Auto-adjust page if current page exceeds total pages after filtering
  useEffect(() => {
    if (filters.page && filters.page > totalPages && totalPages > 0) {
      setFilters((prev) => ({ ...prev, page: 1 }));
    }
  }, [totalPages, filters.page]);

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

  // Active categories from dynamic Explore config
  const dynamicCategories = useMemo(() => {
    if (!exploreConfig?.categories) return undefined;
    return exploreConfig.categories
      .filter((c) => c.isActive)
      .map((c) => c.name);
  }, [exploreConfig]);

  const startRecord = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 py-10 space-y-8">
      {/* Page Header */}
      <div
        style={{ borderColor: theme.borderColor }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6"
      >
        <div>
          <div
            style={{ color: theme.brandColor }}
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider mb-1 font-bold"
          >
            <Compass className="w-4 h-4" />
            <span>{theme.exploreBadgeText || 'Collegiate Project Directory'}</span>
          </div>
          <h1
            style={{ color: theme.headingColor }}
            className="text-3xl sm:text-4xl font-black tracking-tight"
          >
            {theme.exploreTitle || 'Explore Active Projects'}
          </h1>
          <p
            style={{ color: theme.bodyTextColor }}
            className="mt-1 text-xs sm:text-sm opacity-80"
          >
            {theme.exploreSubtitle || 'Discover student-led initiatives seeking collaborators, filtered by skill, tech stack, and category.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchProjects()}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            disabled={isLoading}
            className="border-slate-200 text-slate-700 hover:text-slate-900 font-bold"
          >
            Refresh
          </Button>

          {user ? (
            <Link href="/projects/new">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<PlusCircle className="w-4 h-4" />}
                style={{ backgroundColor: theme.brandColor, borderRadius: theme.borderRadius }}
                className="text-white font-bold shadow-xs transition-all"
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
              style={{ backgroundColor: theme.brandColor, borderRadius: theme.borderRadius }}
              className="text-white font-bold shadow-xs transition-all"
            >
              Start a Project
            </Button>
          )}
        </div>
      </div>

      {/* Dynamic Filter Controls */}
      <ProjectFilters
        filters={filters}
        onChange={(newFilters) => setFilters(newFilters)}
        onClear={handleClearFilters}
        availableSkills={exploreConfig?.popular_skills}
        availableCategories={dynamicCategories}
        totalResults={totalCount}
      />

      {/* Error notice if fallback active */}
      {fetchError && (
        <div className="p-3.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-xs flex items-center justify-between font-medium">
          <span>{fetchError}</span>
          <Button variant="ghost" size="sm" onClick={() => fetchProjects()} className="text-amber-900 text-xs font-bold">
            Retry
          </Button>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
        <div>
          Showing <strong className="text-slate-900 dark:text-white">{startRecord}</strong> - <strong className="text-slate-900 dark:text-white">{endRecord}</strong> of{' '}
          <strong className="text-violet-600 dark:text-violet-400 font-bold">{totalCount}</strong> projects
        </div>
        <div className="font-mono text-[11px] text-slate-500">
          Page {currentPage} of {totalPages}
        </div>
      </div>

      {/* Scrollable Container with Blur-to-Focus Stack */}
      <div className="relative rounded-3xl border border-slate-200/90 dark:border-charcoal-800 bg-slate-50/50 dark:bg-charcoal-900/40 p-2 sm:p-4 shadow-xs overflow-hidden">
        {/* Blur Curtains for Upper & Lower Margins */}
        <div className="scroll-blur-curtain-top" />
        <div className="scroll-blur-curtain-bottom" />

        {/* Projects Viewport with Blur-to-Focus Mask */}
        <div className="tech-scroll-viewport blur-focus-scroll px-1 py-3">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </div>
          ) : projects.length === 0 ? (
            /* Empty State */
            <div className="rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm my-6">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto">
                <FolderSearch className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">No matching projects found</h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  We couldn&apos;t find any projects matching your current combination of keywords and filters. Try adjusting your search or clearing active filters.
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <Button variant="outline" size="sm" onClick={handleClearFilters} className="font-bold border-slate-200 dark:border-charcoal-700">
                  Clear All Filters
                </Button>
                {user ? (
                  <Link href="/projects/new">
                    <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-3.5 h-3.5" />} className="bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold">
                      Publish this Idea
                    </Button>
                  </Link>
                ) : null}
              </div>
            </div>
          ) : (
            /* Project Cards Grid with Blur-to-Focus Card Stacking */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, idx) => (
                <div
                  key={project.id}
                  className="blur-to-focus-card"
                  style={{ animationDelay: `${Math.min(idx * 35, 350)}ms` }}
                >
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Database-Backed Pagination Controls */}
      {totalPages > 1 && (
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600">
            Showing <strong className="text-slate-900">{startRecord}</strong> to <strong className="text-slate-900">{endRecord}</strong> of{' '}
            <strong className="text-slate-900">{totalCount}</strong> total projects
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ ...filters, page: 1 })}
              disabled={currentPage <= 1}
              className="px-2"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ ...filters, page: Math.max(currentPage - 1, 1) })}
              disabled={currentPage <= 1}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Prev
            </Button>

            {/* Page Buttons */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
              let pageNum = idx + 1;
              if (totalPages > 5) {
                if (currentPage > 3) {
                  pageNum = Math.min(currentPage - 2 + idx, totalPages - (4 - idx));
                }
              }
              const isCurrent = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => setFilters({ ...filters, page: pageNum })}
                  className={`w-8 h-8 rounded-lg font-mono text-xs transition-colors ${
                    isCurrent
                      ? 'bg-brand-600 text-white font-bold'
                      : 'bg-midnight-850 hover:bg-midnight-800 text-slate-300 border border-midnight-750'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ ...filters, page: Math.min(currentPage + 1, totalPages) })}
              disabled={currentPage >= totalPages}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ ...filters, page: totalPages })}
              disabled={currentPage >= totalPages}
              className="px-2"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
