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
} from 'lucide-react';
import { clsx } from 'clsx';

export function Navbar() {
  const rawPathname = usePathname();
  const pathname = rawPathname || '';
  const router = useRouter();
  const { user, profile, signOut, openAuthModal } = useAuth();
  const { theme, isDark } = useSiteTheme();

  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleStartProjectClick = () => {
    if (!user) {
      openAuthModal('signup');
    } else {
      router.push('/projects/new');
    }
  };

  const isOwner =
    user?.email?.toLowerCase() === 'goyalmayank142@gmail.com' ||
    user?.id === '9343b52f-f7e8-4ed8-a8a1-476829811b53' ||
    user?.id === 'c86ce05f-24de-4a1a-a45f-944d4180b508';
  const isLocalAdmin = typeof window !== 'undefined' && localStorage.getItem('linkora_admin_session') === 'true';
  const isAdminUser = profile?.role === 'admin' || isOwner || isLocalAdmin;

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
    theme.navbarStyle === 'dark' || (theme.navbarStyle === 'auto' && isDark);

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
    <header
      style={{
        backgroundColor:
          theme.navbarBgColor ||
          (isNavbarDark
            ? theme.surfaceColor || '#11141E'
            : 'rgba(255, 255, 255, 0.95)'),
        borderColor: theme.navbarBorderColor || theme.borderColor,
      }}
      className="sticky top-0 z-40 w-full border-b backdrop-blur-xl transition-all shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Wordmark */}
        <Link
          href="/"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-lg shrink-0"
          aria-label={`${theme.siteTitle || 'Linkora'} Home`}
        >
          <BrandLogo
            size="md"
            wordmarkColor={isNavbarDark ? 'light' : 'dark'}
            title={theme.siteTitle || 'Linkora'}
          />
        </Link>

        {/* Desktop Primary Navigation */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === '/hackathons'
                ? pathname.startsWith('/hackathons') || pathname.startsWith('/h/')
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all inline-flex items-center gap-2 border',
                  isActive
                    ? isNavbarDark
                      ? 'bg-white/10 text-white border-white/20 shadow-sm'
                      : 'bg-slate-100 text-slate-900 border-slate-200 shadow-sm'
                    : isNavbarDark
                    ? 'text-slate-300 border-transparent hover:text-white hover:bg-white/10'
                    : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100'
                )}
              >
                <Icon
                  className={clsx(
                    'w-3.5 h-3.5 transition-colors',
                    isActive
                      ? isNavbarDark
                        ? 'text-white'
                        : 'text-slate-900'
                      : isNavbarDark
                      ? 'text-slate-400'
                      : 'text-slate-500'
                  )}
                />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {/* Workspace */}
          {user ? (
            <Link
              href="/my-projects"
              className={clsx(
                'px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all inline-flex items-center gap-2 border',
                pathname.startsWith('/my-projects')
                  ? isNavbarDark
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 shadow-sm'
                    : 'bg-indigo-100 text-indigo-800 border-indigo-200 shadow-sm'
                  : isNavbarDark
                  ? 'text-slate-300 border-transparent hover:text-indigo-400 hover:bg-white/5'
                  : 'text-slate-600 border-transparent hover:text-indigo-700 hover:bg-indigo-50'
              )}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className={clsx(
                'px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all inline-flex items-center gap-2 border',
                isNavbarDark
                  ? 'text-slate-300 border-transparent hover:text-indigo-400 hover:bg-white/5'
                  : 'text-slate-600 border-transparent hover:text-indigo-700 hover:bg-indigo-50'
              )}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </button>
          )}

          {/* Universal link: Faculty Portal (Always visible across all accounts and browsers) */}
          <Link
            href="/teacher/dashboard"
            className={clsx(
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ml-1 border',
              pathname.startsWith('/teacher')
                ? isNavbarDark
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30 shadow-sm'
                  : 'bg-purple-100 text-purple-900 border-purple-300 shadow-sm'
                : isNavbarDark
                ? 'text-purple-400 hover:bg-purple-900/30 border-purple-800/40'
                : 'text-purple-700 hover:bg-purple-50 border-purple-200'
            )}
          >
            <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
            <span>Faculty Portal</span>
          </Link>

          {/* Universal link: Faculty Problems (Always visible across all accounts and browsers) */}
          <Link
            href="/problems"
            className={clsx(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all inline-flex items-center gap-2 border',
              pathname.startsWith('/problems')
                ? isNavbarDark
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 shadow-sm'
                  : 'bg-amber-100 text-amber-800 border-amber-200 shadow-sm'
                : isNavbarDark
                ? 'text-slate-300 border-transparent hover:text-amber-400 hover:bg-white/5'
                : 'text-slate-600 border-transparent hover:text-amber-700 hover:bg-amber-50'
            )}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            <span>Faculty Problems</span>
          </Link>
        </nav>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Configurable Brand CTA Button */}
          <button
            type="button"
            onClick={handleStartProjectClick}
            style={{
              backgroundColor: theme.brandColor,
              borderRadius: theme.borderRadius,
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 text-white shadow-xs transition-all active:scale-[0.98] hover:opacity-90"
          >
            <PlusCircle className="w-3.5 h-3.5 text-white" />
            <span>{theme.navbarCtaText || 'Start Project'}</span>
          </button>

          {!mounted ? (
            <div className="w-20 h-8 rounded-xl bg-slate-100/40 dark:bg-white/5 animate-pulse" />
          ) : user ? (
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
                      <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
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
                        <User className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Public Portfolio</span>
                      </Link>
                    )}

                    <Link
                      href="/planner"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors font-medium"
                    >
                      <Bot className="w-3.5 h-3.5 text-amber-500" />
                      <span>AI Project Planner</span>
                    </Link>

                    <Link
                      href="/teacher/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-purple-400 hover:bg-purple-500/10 transition-colors font-bold"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
                      <span>Faculty Portal</span>
                    </Link>

                    {/* Private Admin Control Center - ONLY visible to verified platform administrators */}
                    {isAdminUser && (
                      <Link
                        href="/control-center-7x9"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-500 hover:bg-amber-500/10 transition-colors font-bold"
                      >
                        <Shield className="w-3.5 h-3.5 text-amber-500" />
                        <span>Admin Control Center</span>
                      </Link>
                    )}

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
                      onClick={() => {
                        setUserDropdownOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors text-left font-bold"
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
                  backgroundColor: theme.brandColor,
                  borderRadius: theme.borderRadius,
                }}
                className="text-xs font-bold px-4 py-2 text-white shadow-xs transition-all active:scale-[0.98] hover:opacity-90"
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
            className="p-2 rounded-xl opacity-80 hover:opacity-100 transition-colors focus-visible:outline-none"
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
            backgroundColor: theme.surfaceColor,
            borderColor: theme.borderColor,
          }}
          className="md:hidden border-t px-5 pt-4 pb-8 space-y-4 animate-fadeIn shadow-xl"
        >
          <div className="space-y-1">
            <p className="text-[11px] font-mono uppercase tracking-wider opacity-60 px-3 pb-1 font-bold">
              Navigation
            </p>
            <Link
              href="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <Compass className="w-4 h-4 text-violet-500" />
              <span>Explore Projects</span>
            </Link>

            <Link
              href="/teammates"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <Users className="w-4 h-4 text-pink-500" />
              <span>Find Teammates</span>
            </Link>

            <Link
              href="/hackathons"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Hackathons</span>
            </Link>

            <Link
              href="/teacher/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-purple-400 hover:bg-purple-500/10 transition-colors"
            >
              <GraduationCap className="w-4 h-4 text-purple-500" />
              <span>Faculty Portal</span>
            </Link>

            <Link
              href="/problems"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-amber-400 hover:bg-amber-500/10 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>Faculty Problems</span>
            </Link>

            {user ? (
              <Link
                href="/my-projects"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <Briefcase className="w-4 h-4 text-indigo-500" />
                <span>Project Workspace</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('login');
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-left"
              >
                <Briefcase className="w-4 h-4 text-indigo-500" />
                <span>Project Workspace</span>
              </button>
            )}

            {mounted && isAdminUser && (
              <Link
                href="/control-center-7x9"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-amber-500 hover:bg-amber-500/10 transition-colors"
              >
                <Shield className="w-4 h-4 text-amber-500" />
                <span>Admin Control Center</span>
              </Link>
            )}
          </div>

          <div className="pt-2 border-t opacity-20" style={{ borderColor: theme.borderColor }} />

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
  );
}
