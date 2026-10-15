'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { NotificationBell } from '@/components/notifications/NotificationBell';
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
  BarChart3,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { clsx } from 'clsx';

export function Navbar() {
  const rawPathname = usePathname();
  const pathname = rawPathname || '';
  const router = useRouter();
  const { user, profile, signOut, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const displayName = profile?.display_name || user?.user_metadata?.display_name || 'Student';
  const username = profile?.username || user?.user_metadata?.username;
  const isTeacher =
    (profile?.role === 'teacher' || profile?.role === 'admin') &&
    (!profile?.birth_year || profile?.birth_year <= 2003);

  // Core public links: Focused and high-signal
  const navLinks = [
    { href: '/explore', label: 'Explore', icon: Compass },
    { href: '/teammates', label: 'Teammates', icon: Users },
    { href: '/hackathons', label: 'Hackathons', icon: Trophy },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-charcoal-800/80 bg-midnight-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Precision Insignia */}
        <Link
          href="/"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg shrink-0"
          aria-label="TeamForge Home"
        >
          <BrandLogo size="md" />
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
                  'px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all inline-flex items-center gap-2',
                  isActive
                    ? 'text-white bg-charcoal-800/90 shadow-sm border border-charcoal-700/60'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-charcoal-850/60'
                )}
              >
                <Icon
                  className={clsx(
                    'w-3.5 h-3.5 transition-colors',
                    isActive ? 'text-indigo-400' : 'text-slate-400'
                  )}
                />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {/* Contextual link: Workspace (for authenticated students) */}
          {user && (
            <Link
              href="/my-projects"
              className={clsx(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all inline-flex items-center gap-2',
                pathname.startsWith('/my-projects')
                  ? 'text-white bg-charcoal-800/90 shadow-sm border border-charcoal-700/60'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-charcoal-850/60'
              )}
            >
              <Briefcase
                className={clsx(
                  'w-3.5 h-3.5',
                  pathname.startsWith('/my-projects') ? 'text-indigo-400' : 'text-slate-400'
                )}
              />
              <span>Workspace</span>
            </Link>
          )}

          {/* Contextual link: Mentor Portal (strictly for verified faculty/admins) */}
          {isTeacher && (
            <Link
              href="/teacher/dashboard"
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 ml-1',
                pathname.startsWith('/teacher')
                  ? 'text-indigo-200 bg-indigo-950/70 border border-indigo-500/50 shadow-sm'
                  : 'text-indigo-300/80 hover:text-indigo-200 hover:bg-indigo-950/40 border border-indigo-500/20'
              )}
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Faculty Portal</span>
            </Link>
          )}
        </nav>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Primary CTA */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartProjectClick}
            leftIcon={<PlusCircle className="w-3.5 h-3.5 text-indigo-400" />}
            className="text-xs font-medium border-charcoal-700 hover:border-indigo-500/40"
          >
            Start Project
          </Button>

          {user ? (
            <div className="flex items-center gap-2">
              <NotificationBell />

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl bg-charcoal-900 hover:bg-charcoal-850 border border-charcoal-750/90 hover:border-charcoal-700 transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  aria-expanded={userDropdownOpen}
                >
                  <Avatar name={displayName} src={profile?.avatar_url} size="sm" />
                  <span className="text-xs font-medium text-slate-200 max-w-[110px] truncate">
                    {displayName}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-midnight-900 border border-charcoal-750 shadow-elevated p-2 z-50 text-xs animate-fadeIn space-y-1">
                    {/* User Info Header */}
                    <div className="px-3 py-2.5 rounded-xl bg-charcoal-950/60 border border-charcoal-800/80 mb-1.5">
                      <p className="font-semibold text-slate-100 truncate">{displayName}</p>
                      <p className="text-[11px] text-slate-400 truncate">@{username || 'student'}</p>
                    </div>

                    <Link
                      href="/my-projects"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-charcoal-800 transition-colors"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                      <span>My Projects & Workspace</span>
                    </Link>

                    <Link
                      href="/my-applications"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-charcoal-800 transition-colors"
                    >
                      <Inbox className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Applications & Invites</span>
                    </Link>

                    {username && (
                      <Link
                        href={`/profile/${username}`}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-charcoal-800 transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Public Portfolio</span>
                      </Link>
                    )}

                    <Link
                      href="/planner"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-charcoal-800 transition-colors"
                    >
                      <Bot className="w-3.5 h-3.5 text-indigo-400" />
                      <span>AI Project Planner</span>
                    </Link>

                    {isTeacher && (
                      <Link
                        href="/teacher/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-indigo-300 hover:text-white hover:bg-indigo-950/40 transition-colors font-medium"
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Faculty Mentor Dashboard</span>
                      </Link>
                    )}

                    <div className="my-1 border-t border-charcoal-800" />

                    <Link
                      href="/settings/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-charcoal-800 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Settings & Skills</span>
                    </Link>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left font-medium"
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openAuthModal('login')}
                className="text-xs text-slate-300 hover:text-white"
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => openAuthModal('signup')}
                className="text-xs"
              >
                Join Free
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Header Actions */}
        <div className="flex items-center gap-2 md:hidden">
          {user && <NotificationBell />}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-charcoal-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-charcoal-800/80 bg-midnight-950/95 backdrop-blur-2xl px-5 pt-4 pb-8 space-y-4 animate-fadeIn">
          {/* Student Pathways */}
          <div className="space-y-1">
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 px-3 pb-1">
              Collegiate Hub
            </p>
            <Link
              href="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-charcoal-850 transition-colors"
            >
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>Explore Projects</span>
            </Link>

            <Link
              href="/teammates"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-charcoal-850 transition-colors"
            >
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Find Teammates</span>
            </Link>

            <Link
              href="/hackathons"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-charcoal-850 transition-colors"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>College Hackathons</span>
            </Link>
          </div>

          {/* Contextual Authenticated Workspace Links */}
          {user && (
            <div className="space-y-1 pt-2 border-t border-charcoal-800/60">
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 px-3 pb-1">
                My Workspace
              </p>
              <Link
                href="/my-projects"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-charcoal-850 transition-colors"
              >
                <Briefcase className="w-4 h-4 text-indigo-400" />
                <span>My Projects & Teams</span>
              </Link>

              <Link
                href="/my-applications"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-charcoal-850 transition-colors"
              >
                <Inbox className="w-4 h-4 text-indigo-400" />
                <span>My Applications</span>
              </Link>

              <Link
                href="/planner"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-charcoal-850 transition-colors"
              >
                <Bot className="w-4 h-4 text-indigo-400" />
                <span>AI Project Planner</span>
              </Link>
            </div>
          )}

          {/* Faculty Portal Link (if teacher/admin) */}
          {isTeacher && (
            <div className="pt-2 border-t border-charcoal-800/60">
              <Link
                href="/teacher/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-indigo-300 bg-indigo-950/40 border border-indigo-500/30 hover:bg-indigo-900/50 transition-colors"
              >
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                <span>Faculty Mentor Portal</span>
              </Link>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="pt-3 border-t border-charcoal-800/80 space-y-2.5">
            <Button
              variant="outline"
              size="md"
              className="w-full justify-center"
              onClick={handleStartProjectClick}
              leftIcon={<PlusCircle className="w-4 h-4 text-indigo-400" />}
            >
              Start a Project
            </Button>

            {user ? (
              <div className="space-y-2 pt-1">
                <div className="px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar name={displayName} src={profile?.avatar_url} size="sm" />
                    <div className="truncate">
                      <p className="text-xs font-semibold text-white truncate">{displayName}</p>
                      <p className="text-[11px] text-slate-400 truncate">@{username || 'student'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full justify-center"
                  onClick={() => openAuthModal('login')}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  className="w-full justify-center"
                  onClick={() => openAuthModal('signup')}
                >
                  Join Free
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
