'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Avatar } from '@/components/ui/Avatar';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useSiteTheme } from '@/components/theme/SiteThemeProvider';
import {
  Compass,
  Users,
  Trophy,
  PlusCircle,
  Briefcase,
  GraduationCap,
  LogOut,
  User,
  Settings,
  Menu,
  X,
  ChevronDown,
  Inbox,
  Bot,
  Sparkles,
  BookOpen,
  LayoutDashboard,
  Shield,
  Lightbulb,
  Clock,
  MessageSquare,
  Swords,
} from 'lucide-react';
import { clsx } from 'clsx';
import {
  warmAppCache,
  prefetchExploreData,
  prefetchTeammatesData,
  prefetchHackathonsData,
} from '@/lib/cache/pageDataCache';
import {
  openProfileEditModal,
} from '@/components/profile/MandatoryOnboardingModal';
import { isFacultyUser } from '@/lib/auth/faculty';
import { LiquidChromeButton } from '@/components/ui/LiquidChromeButton';
import { KollabrixQuickDock } from '@/components/navigation/KollabrixQuickDock';

export function Navbar() {
  const rawPathname = usePathname();
  const pathname = rawPathname || '';
  const router = useRouter();
  const { user, profile, signOut, openAuthModal } = useAuth();
  const { theme, isDark, toggleTheme } = useSiteTheme();

  const [isExamMode, setIsExamMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isVoxelTransitionActive, setIsVoxelTransitionActive] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      router.prefetch('/arena');
    } catch {}
  }, [router]);

  useEffect(() => {
    const handleExam = (e: any) => {
      setIsExamMode(Boolean(e.detail?.active));
    };
    const checkExamClass = () => {
      if (typeof document !== 'undefined') {
        setIsExamMode(document.body.classList.contains('icpc-exam-mode'));
      }
    };
    checkExamClass();
    window.addEventListener('linkora_exam_mode', handleExam);
    return () => window.removeEventListener('linkora_exam_mode', handleExam);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  // Dedicated Resource Hub, Battle Arena, and Active Exam Mode run in their own focused workspace without global navbar
  if (pathname.startsWith('/resources') || pathname.startsWith('/arena') || isExamMode) {
    return null;
  }

  const isFaculty = isFacultyUser(user, profile);

  const displayName =
    profile?.display_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.display_name ||
    (user?.email ? user.email.split('@')[0] : 'Student');
  const username =
    profile?.username ||
    user?.user_metadata?.username ||
    user?.user_metadata?.preferred_username ||
    (user?.email ? user.email.split('@')[0] : 'student');


  const isNavbarDark =
    pathname === '/' ||
    theme.navbarStyle === 'dark' ||
    (theme.navbarStyle === 'auto' && isDark);

  const navLinks = [
    {
      href: '/explore',
      label: 'Explore',
      icon: Compass,
    },
    {
      href: '/teammates',
      label: 'Teammates',
      icon: Users,
    },
    {
      href: '/hackathons',
      label: 'Hackathons',
      icon: Trophy,
    },
  ];

  return (
    <>
      <header
      style={{
        backgroundColor:
          (isNavbarDark
            ? 'rgba(0, 0, 0, 0.88)'
            : theme.navbarBgColor || 'rgba(255, 255, 255, 0.85)'),
        borderColor:
          (isNavbarDark
            ? 'transparent'
            : theme.navbarBorderColor || 'rgba(226, 232, 240, 0.8)'),
      }}
      className={clsx(
        "sticky top-0 z-40 w-full backdrop-blur-2xl transition-all shadow-none",
        !isNavbarDark && "border-b shadow-sm"
      )}
    >
      <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 h-16 flex items-center justify-between gap-4 relative">
        {/* Brand Logo & Wordmark */}
        <Link
          href="/"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg shrink-0"
          aria-label={`${(!theme.siteTitle || theme.siteTitle === 'Linkora' ? 'Kollabrix' : theme.siteTitle)} Home`}
        >
          <BrandLogo
            size="md"
            wordmarkColor={isNavbarDark ? 'light' : 'dark'}
            title="Kollabrix"
          />
        </Link>

        {/* Desktop Primary Navigation: Liquid-Glass Segmented Capsule (Pin Reference) */}
        <div
          className={clsx(
            'hidden md:inline-flex p-[1px] rounded-full transition-all',
            isNavbarDark
              ? 'bg-gradient-to-b from-white/25 via-zinc-500/20 to-white/40 shadow-[0_12px_28px_-6px_rgba(0,0,0,0.85)]'
              : 'bg-gradient-to-b from-stone-300/80 to-stone-400/70 shadow-sm'
          )}
        >
          <nav
            className={clsx(
              'grid grid-cols-3 items-center p-1 rounded-full backdrop-blur-xl',
              isNavbarDark
                ? 'bg-[#090b10]/85 shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),inset_0_-1px_2px_rgba(255,255,255,0.25),inset_0_0_12px_rgba(0,0,0,0.5)]'
                : 'bg-white/80 shadow-inner'
            )}
            aria-label="Main Navigation"
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);

              const handleWarmup = () => {
                if (link.href === '/explore') prefetchExploreData();
                else if (link.href === '/teammates') prefetchTeammatesData();
                else if (link.href === '/hackathons') prefetchHackathonsData();
              };

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={false}
                  onMouseEnter={handleWarmup}
                  onTouchStart={handleWarmup}
                  className={clsx(
                    'px-4 sm:px-5 py-1.5 rounded-full text-xs font-bold tracking-[-0.01em] transition-all duration-200 inline-flex items-center justify-center gap-1.5 select-none active:scale-[0.97]',
                    isActive
                      ? isNavbarDark
                        ? 'bg-gradient-to-b from-zinc-800/90 via-zinc-900/95 to-black/95 text-white ring-1 ring-white/20 shadow-[inset_0_1px_0.5px_rgba(255,255,255,0.35),inset_0_-1px_1px_rgba(255,255,255,0.12),0_2px_8px_rgba(0,0,0,0.65)]'
                        : 'bg-white text-stone-950 ring-1 ring-stone-200 shadow-sm'
                      : isNavbarDark
                      ? 'bg-transparent text-zinc-200 hover:text-white hover:bg-white/[0.04]'
                      : 'bg-transparent text-stone-700 hover:text-stone-950 hover:bg-stone-100/60'
                  )}
                >
                  <Icon
                    className={clsx(
                      'w-3.5 h-3.5 transition-colors shrink-0',
                      isActive
                        ? isNavbarDark
                          ? 'text-white'
                          : 'text-slate-950'
                        : isNavbarDark
                        ? 'text-zinc-300'
                        : 'text-stone-600'
                    )}
                  />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Smoked-Glass Specular Pill: My Dashboard (Pin Reference Style) */}
          <Link
            href={isFaculty ? '/teacher/dashboard' : '/my-projects'}
            className={clsx(
              "hidden lg:inline-flex relative items-center justify-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide overflow-hidden transition-all duration-200 active:scale-[0.97] group",
              isNavbarDark
                ? "bg-white/[0.04] hover:bg-white/[0.09] text-slate-100 border border-white/25 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),inset_0_-6px_12px_rgba(180,220,230,0.08)]"
                : "bg-slate-900/5 hover:bg-slate-900/10 text-slate-800 border border-slate-300 backdrop-blur-md"
            )}
            title="Open My Dashboard"
          >
            {/* Top-left specular white hotspot glint */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-px left-[18%] w-10 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-90 group-hover:left-[26%] transition-all duration-300"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-2 left-[16%] w-12 h-3 rounded-full bg-white/45 blur-[5px] opacity-75 group-hover:opacity-100 transition-opacity"
            />
            {/* Bottom icy-silver subtle rim glint */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-px left-[26%] w-14 h-px bg-gradient-to-r from-transparent via-cyan-100/75 to-transparent opacity-70"
            />
            <LayoutDashboard className="w-3.5 h-3.5 relative z-10 text-slate-200 group-hover:text-white transition-colors" />
            <span className="relative z-10">My Dashboard</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-2.5">
              <NotificationBell />

              {/* Progressive Profiling: Non-intrusive finish profile pill if incomplete */}
              {user && (!profile?.college || !profile?.skills?.length) && (
                <button
                  type="button"
                  onClick={() => openProfileEditModal(1)}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-white/[0.06] text-slate-200 border border-white/10 hover:bg-white/[0.1] hover:text-white hover:border-white/20 transition-all cursor-pointer shadow-xs select-none"
                  title="Add your college & skills to unlock instant squad matching"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-300" />
                  <span>Finish Profile</span>
                </button>
              )}

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    backgroundColor: isNavbarDark ? 'rgba(255,255,255,0.06)' : undefined,
                    borderColor: theme.borderColor,
                  }}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl border transition-all text-left focus-visible:outline-none"
                  aria-expanded={userDropdownOpen}
                >
                  <Avatar name={displayName} src={profile?.avatar_url} size="sm" />
                  <span
                    style={{ color: theme.headingColor }}
                    className="text-xs font-bold max-w-[110px] truncate"
                  >
                    {displayName}
                  </span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                {userDropdownOpen && (
                  <div
                    style={{
                      backgroundColor: theme.surfaceColor,
                      borderColor: theme.borderColor,
                      borderRadius: theme.borderRadius,
                    }}
                    className="absolute right-0 mt-2 w-64 border shadow-2xl p-2.5 z-50 text-xs animate-fadeIn space-y-1"
                  >
                    {/* User Info Header */}
                    <div
                      style={{
                        backgroundColor: isNavbarDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                        borderColor: theme.borderColor,
                      }}
                      className="px-3 py-2.5 rounded-xl border mb-1.5"
                    >
                      <p style={{ color: theme.headingColor }} className="font-black truncate">
                        {displayName}
                      </p>
                      <p className="text-[11px] font-mono opacity-70 truncate">
                        @{username || 'student'}
                      </p>
                    </div>

                    <Link
                      href="/my-projects"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors font-medium"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                      <span>My Projects &amp; Workspace</span>
                    </Link>

                    <Link
                      href="/my-applications"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors font-medium"
                    >
                      <Inbox className="w-3.5 h-3.5 text-pink-500" />
                      <span>Applications &amp; Invites</span>
                    </Link>

                    {username && (
                      <Link
                        href={`/profile/${username}`}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors font-medium"
                      >
                        <User className="w-3.5 h-3.5 text-amber-600" />
                        <span>Public Portfolio</span>
                      </Link>
                    )}

                    <Link
                      href="/spark"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-500 hover:bg-amber-500/10 transition-colors font-bold"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>AI Spark Studio</span>
                    </Link>

                    <Link
                      href="/planner"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors font-medium"
                    >
                      <Bot className="w-3.5 h-3.5 text-orange-500" />
                      <span>AI Project Planner</span>
                    </Link>

                    {isFaculty && (
                      <>
                        <Link
                          href="/hackathons/new"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-cyan-400 hover:bg-cyan-500/10 transition-colors font-bold"
                        >
                          <Trophy className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Host a Hackathon</span>
                        </Link>

                        <Link
                          href="/teacher/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-600 hover:bg-amber-500/10 transition-colors font-bold"
                        >
                          <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                          <span>Faculty Portal</span>
                        </Link>
                      </>
                    )}

                    <Link
                      href="/feedback"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-500 hover:bg-amber-500/10 transition-colors font-bold text-left cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                      <span>Community Feedback</span>
                    </Link>

                    <div className="my-1 border-t opacity-20" style={{ borderColor: theme.borderColor }} />

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        openProfileEditModal(1);
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 opacity-60" />
                      <span>Settings &amp; Skills</span>
                    </button>

                    <button
                      type="button"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setUserDropdownOpen(false);
                        await signOut();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors text-left font-bold cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Navigation Dock — shown only on landing page so it never overlaps subpage CTAs */}
              {pathname === '/' && <KollabrixQuickDock />}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openAuthModal('signup')}
                className="text-xs font-black uppercase tracking-wider px-4 py-2 bg-gradient-to-r from-white via-slate-100 to-slate-200 hover:from-white hover:to-white text-slate-950 shadow-[0_0_15px_rgba(255,255,255,0.35)] border border-white/60 hover:scale-[1.02] active:scale-[0.98] rounded-full transition-all cursor-pointer"
              >
                Join Free
              </button>
              {pathname === '/' && <KollabrixQuickDock />}
            </div>
          )}
        </div>

        {/* Mobile Header Actions */}
        <div className="flex items-center gap-2 md:hidden">
          {mounted && user && <NotificationBell />}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={clsx(
              "p-2 rounded-xl transition-colors focus-visible:outline-none",
              isNavbarDark
                ? "text-slate-300 hover:text-white hover:bg-white/10"
                : "opacity-80 hover:opacity-100"
            )}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: isNavbarDark ? 'rgba(9, 11, 16, 0.96)' : theme.surfaceColor,
            borderColor: isNavbarDark ? 'rgba(255, 255, 255, 0.1)' : theme.borderColor,
          }}
          className={clsx(
            "md:hidden border-t px-5 pt-4 pb-8 space-y-4 animate-fadeIn shadow-xl",
            isNavbarDark && "text-slate-200"
          )}
        >
          <div className="space-y-1">
            <p className="text-[11px] font-mono uppercase tracking-wider opacity-60 px-3 pb-1 font-bold">
              Navigation
            </p>
            <Link
              href="/explore"
              prefetch={false}
              onTouchStart={() => prefetchExploreData()}
              onMouseEnter={() => prefetchExploreData()}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.98] transition-all"
            >
              <Compass className="w-4 h-4 text-amber-600" />
              <span>Explore Projects</span>
            </Link>

            <Link
              href="/teammates"
              prefetch={false}
              onTouchStart={() => prefetchTeammatesData()}
              onMouseEnter={() => prefetchTeammatesData()}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.98] transition-all"
            >
              <Users className="w-4 h-4 text-emerald-500" />
              <span>Find Teammates</span>
            </Link>

            <Link
              href={isFaculty ? '/teacher/dashboard' : '/my-projects'}
              onClick={() => setMobileMenuOpen(false)}
              className="relative flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/25 backdrop-blur-md overflow-hidden transition-all active:scale-[0.98]"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-0 left-[18%] w-12 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80"
              />
              <LayoutDashboard className="w-4 h-4 text-slate-200" />
              <span>My Dashboard</span>
            </Link>

            <Link
              href="/hackathons"
              prefetch={false}
              onTouchStart={() => prefetchHackathonsData()}
              onMouseEnter={() => prefetchHackathonsData()}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.98] transition-all"
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Hackathons</span>
            </Link>

            <Link
              href="/problems"
              prefetch={false}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.98] transition-all"
            >
              <Lightbulb className="w-4 h-4 text-blue-500" />
              <span>Problems</span>
            </Link>

            <Link
              href="/leaderboard"
              prefetch={false}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Campus Leaderboard</span>
            </Link>

            <Link
              href="/deadlines"
              prefetch={false}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <Clock className="w-4 h-4 text-rose-500" />
              <span>Deadlines Radar</span>
            </Link>

            <Link
              href="/spark"
              prefetch={false}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI Spark Studio</span>
            </Link>

            <Link
              href="/feedback"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-left cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-amber-500" />
              <span>Community Feedback</span>
            </Link>

            {isFaculty && (
              <Link
                href="/teacher/dashboard"
                prefetch={false}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-amber-600 hover:bg-amber-500/10 transition-colors"
              >
                <GraduationCap className="w-4 h-4 text-amber-600" />
                <span>Faculty Portal</span>
              </Link>
            )}

            {/* Authenticated-only navigation links */}
            {user && (
              <>
                <Link
                  href="/my-projects"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <Briefcase className="w-4 h-4 text-amber-600" />
                  <span>Project Workspace</span>
                </Link>

                {username && (
                  <Link
                    href={`/profile/${username}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  >
                    <User className="w-4 h-4 text-amber-600" />
                    <span>Public Portfolio</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMobileMenuOpen(false);
                    await signOut();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Sign Out</span>
                </button>
              </>
            )}
          </div>

          {!user && (
            <>
              <div className="pt-2 border-t opacity-20" style={{ borderColor: theme.borderColor }} />
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('signup');
                  }}
                  className="w-full py-3 px-3 rounded-xl text-xs font-extrabold text-slate-950 bg-gradient-to-r from-white via-slate-100 to-slate-200 shadow-[0_0_15px_rgba(255,255,255,0.35)] border border-white/60 text-center"
                >
                  Join Free
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  </>
);
}
