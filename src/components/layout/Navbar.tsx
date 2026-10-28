'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  Shield,
  Sun,
  Moon,
  Lightbulb,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { clsx } from 'clsx';
import {
  warmAppCache,
  prefetchExploreData,
  prefetchTeammatesData,
  prefetchHackathonsData,
} from '@/lib/cache/pageDataCache';
import {
  StreakNavbarButton,
  DailyStreakModal,
  StreakCelebrationToast,
  DailyStreakAutoPrompt,
} from '@/components/gamification/DailyStreakHub';
import { isFacultyUser } from '@/lib/auth/faculty';
import { LiquidChromeButton } from '@/components/ui/LiquidChromeButton';

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
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    warmAppCache();
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

  // Dedicated Resource Hub and Active Exam Mode run in their own focused workspace without global navbar
  if (pathname.startsWith('/resources') || isExamMode) {
    return null;
  }

  const handleStartProjectClick = () => {
    if (!user) {
      openAuthModal('signup');
    } else {
      router.push('/projects/new');
    }
  };

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
      href: '/my-projects',
      label: 'Workspace',
      icon: Briefcase,
    },
  ];

  return (
    <>
      <header
      style={{
        backgroundColor:
          (isNavbarDark
            ? 'rgba(9, 11, 16, 0.85)'
            : theme.navbarBgColor || 'rgba(255, 255, 255, 0.85)'),
        borderColor:
          (isNavbarDark
            ? 'rgba(255, 255, 255, 0.08)'
            : theme.navbarBorderColor || 'rgba(226, 232, 240, 0.8)'),
      }}
      className="sticky top-0 z-40 w-full border-b backdrop-blur-2xl transition-all shadow-sm"
    >
      {/* Subtle bottom accent ray */}
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent pointer-events-none" />

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
            title={!theme.siteTitle || theme.siteTitle === 'Linkora' ? 'Kollabrix' : theme.siteTitle}
          />
        </Link>

        {/* Desktop Primary Navigation */}
        <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);

            const handleWarmup = () => {
              if (link.href === '/explore') prefetchExploreData();
              else if (link.href === '/teammates') prefetchTeammatesData();
            };

            const handleClick = (e: React.MouseEvent) => {
              if (link.href === '/my-projects' && !user) {
                e.preventDefault();
                openAuthModal('login');
              }
            };

            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                onClick={handleClick}
                onMouseEnter={handleWarmup}
                onTouchStart={handleWarmup}
                className={clsx(
                  'px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-150 inline-flex items-center gap-2 border select-none active:scale-[0.96]',
                  isActive
                    ? isNavbarDark
                      ? 'bg-white/12 text-white border-white/25 shadow-xs shadow-amber-500/10'
                      : 'bg-stone-200/70 text-stone-900 border-stone-300/90 shadow-xs'
                    : isNavbarDark
                    ? 'text-stone-300 border-transparent hover:text-white hover:bg-white/8 hover:border-white/10'
                    : 'text-stone-600 border-transparent hover:text-stone-900 hover:bg-stone-100 hover:border-stone-200/60'
                )}
              >
                <Icon
                  className={clsx(
                    'w-3.5 h-3.5 transition-colors',
                    isActive
                      ? isNavbarDark
                        ? 'text-amber-400'
                        : 'text-amber-600'
                      : isNavbarDark
                      ? 'text-stone-400'
                      : 'text-stone-500'
                  )}
                />
                <span>{link.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Clean Resources Link (Opens in new tab) */}
          <Link
            href="/resources"
            target="_blank"
            rel="noopener noreferrer"
            className={clsx(
              "hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
              isNavbarDark
                ? "text-slate-300 hover:text-amber-400 hover:bg-white/5"
                : "text-stone-600 dark:text-stone-300 hover:text-amber-500 dark:hover:text-amber-400"
            )}
            title="Collegiate Learning Resources & Compilers"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Resources</span>
          </Link>

          {/* Quick Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              borderRadius: theme.borderRadius,
            }}
            className={clsx(
              'p-2 text-xs font-bold transition-all border flex items-center justify-center shrink-0 shadow-2xs',
              isNavbarDark
                ? 'border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20'
                : 'border-slate-200 bg-slate-100/90 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
            )}
            title={mounted && isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
            aria-label="Toggle Site Theme"
          >
            {mounted && isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Daily Streak Flame Button */}
          <StreakNavbarButton onClick={() => setIsStreakModalOpen(true)} />

          {/* Configurable Brand CTA Button */}
          <button
            type="button"
            onClick={handleStartProjectClick}
            style={{
              borderRadius: theme.borderRadius,
              backgroundColor: isNavbarDark ? undefined : theme.brandColor,
            }}
            className={clsx(
              "inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 text-white shadow-xs transition-all active:scale-[0.98] hover:opacity-95",
              isNavbarDark
                ? "bg-gradient-to-r from-orange-600 to-amber-500 shadow-orange-950/30"
                : "shadow-xs"
            )}
          >
            <PlusCircle className="w-3.5 h-3.5 text-white" />
            <span>{theme.navbarCtaText || 'Start Project'}</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <NotificationBell />

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

                    <Link
                      href="/teacher/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-600 hover:bg-amber-500/10 transition-colors font-bold"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                      <span>Faculty Portal</span>
                    </Link>

                    <a
                      href="mailto:whatilearn706@gmail.com?subject=Kollabrix%20Community%20Feedback"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-500 hover:bg-amber-500/10 transition-colors font-bold text-left cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                      <span>Community Feedback</span>
                    </a>

                    <div className="my-1 border-t opacity-20" style={{ borderColor: theme.borderColor }} />

                    <Link
                      href="/settings/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 opacity-60" />
                      <span>Settings &amp; Skills</span>
                    </Link>

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
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openAuthModal('signup')}
                style={{
                  borderRadius: theme.borderRadius,
                  backgroundColor: isNavbarDark ? undefined : theme.brandColor,
                }}
                className={clsx(
                  "text-xs font-bold px-4 py-2 text-white shadow-xs transition-all active:scale-[0.98] hover:opacity-95",
                  isNavbarDark
                    ? "bg-gradient-to-r from-orange-600 to-amber-500 shadow-orange-950/30"
                    : "shadow-xs"
                )}
              >
                Join Free
              </button>
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
              prefetch={true}
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
              prefetch={true}
              onTouchStart={() => prefetchTeammatesData()}
              onMouseEnter={() => prefetchTeammatesData()}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.98] transition-all"
            >
              <Users className="w-4 h-4 text-emerald-500" />
              <span>Find Teammates</span>
            </Link>

            <a
              href="/resources"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25 transition-colors shadow-2xs active:scale-[0.98]"
            >
              <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Learning Resources Hub ↗</span>
            </a>

            <Link
              href="/hackathons"
              prefetch={true}
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
              prefetch={true}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.98] transition-all"
            >
              <Lightbulb className="w-4 h-4 text-blue-500" />
              <span>Problems</span>
            </Link>

            <Link
              href="/leaderboard"
              prefetch={true}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Campus Leaderboard</span>
            </Link>

            <Link
              href="/deadlines"
              prefetch={true}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <Clock className="w-4 h-4 text-rose-500" />
              <span>Deadlines Radar</span>
            </Link>

            <Link
              href="/spark"
              prefetch={true}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI Spark Studio</span>
            </Link>

            <a
              href="mailto:whatilearn706@gmail.com?subject=Kollabrix%20Community%20Feedback"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-left cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-amber-500" />
              <span>Community Feedback</span>
            </a>

            <Link
              href="/teacher/dashboard"
              prefetch={true}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-amber-600 hover:bg-amber-500/10 transition-colors"
            >
              <GraduationCap className="w-4 h-4 text-amber-600" />
              <span>Faculty Portal</span>
            </Link>

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

          <div className="pt-2 border-t opacity-20" style={{ borderColor: theme.borderColor }} />

          {/* Mobile Daily Streak Indicator */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-orange-500/10 border border-orange-500/30">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <span className="text-sm">🔥</span>
              <span>Daily Build Streak</span>
            </span>
            <StreakNavbarButton
              onClick={() => {
                setMobileMenuOpen(false);
                setIsStreakModalOpen(true);
              }}
            />
          </div>

          {/* Mobile Theme Toggle Button */}
          <button
            type="button"
            onClick={() => {
              toggleTheme();
            }}
            style={{
              borderColor: theme.borderColor,
            }}
            className={clsx(
              'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold border transition-colors',
              isDark
                ? 'bg-white/5 text-amber-300 border-white/10'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            )}
          >
            <span className="flex items-center gap-2.5">
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              <span>{isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}</span>
            </span>
            <span className="text-[10px] font-mono opacity-60 uppercase">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              handleStartProjectClick();
            }}
            style={{
              backgroundColor: theme.brandColor,
              borderRadius: theme.borderRadius,
            }}
            className="w-full flex items-center justify-center gap-2 py-3 text-white font-bold text-sm shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{theme.navbarCtaText || 'Start a Project'}</span>
          </button>
        </div>
      )}
    </header>

    {/* Daily Streak Interactive Check-in Modal */}
    <DailyStreakModal
      isOpen={isStreakModalOpen}
      onClose={() => setIsStreakModalOpen(false)}
    />

    {/* Auto-Prompt for Day 0 First-Time Login */}
    <DailyStreakAutoPrompt />

    {/* Floating Streak Celebration Toast */}
    <StreakCelebrationToast />
  </>
);
}
