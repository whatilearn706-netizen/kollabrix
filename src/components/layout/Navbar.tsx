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
  Sparkles,
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

  // Core public links: Focused and high-signal with dedicated vibrant accents
  const navLinks = [
    {
      href: '/explore',
      label: 'Explore',
      icon: Compass,
      activeColor: 'bg-violet-100 text-violet-800 border-violet-200',
      hoverColor: 'hover:text-violet-700 hover:bg-violet-50',
      iconColor: 'text-violet-600',
    },
    {
      href: '/teammates',
      label: 'Teammates',
      icon: Users,
      activeColor: 'bg-pink-100 text-pink-800 border-pink-200',
      hoverColor: 'hover:text-pink-700 hover:bg-pink-50',
      iconColor: 'text-pink-600',
    },
    {
      href: '/hackathons',
      label: 'Hackathons',
      icon: Trophy,
      activeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      hoverColor: 'hover:text-amber-800 hover:bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-xl transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Precision Insignia */}
        <Link
          href="/"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-lg shrink-0"
          aria-label="TeamForge Home"
        >
          <BrandLogo size="md" wordmarkColor="dark" />
        </Link>

        {/* Desktop Primary Navigation with Colorful Hover & Active States */}
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
                    ? `${link.activeColor} shadow-sm`
                    : `text-slate-600 border-transparent ${link.hoverColor}`
                )}
              >
                <Icon
                  className={clsx(
                    'w-3.5 h-3.5 transition-colors',
                    isActive ? link.iconColor : 'text-slate-500'
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
                'px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all inline-flex items-center gap-2 border',
                pathname.startsWith('/my-projects')
                  ? 'bg-indigo-100 text-indigo-800 border-indigo-200 shadow-sm'
                  : 'text-slate-600 border-transparent hover:text-indigo-700 hover:bg-indigo-50'
              )}
            >
              <Briefcase
                className={clsx(
                  'w-3.5 h-3.5',
                  pathname.startsWith('/my-projects') ? 'text-indigo-600' : 'text-slate-500'
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
                'px-3 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ml-1 border',
                pathname.startsWith('/teacher')
                  ? 'bg-purple-100 text-purple-900 border-purple-300 shadow-sm'
                  : 'text-purple-700 hover:bg-purple-50 border-purple-200'
              )}
            >
              <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
              <span>Faculty Portal</span>
            </Link>
          )}
        </nav>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Primary Colorful CTA */}
          <button
            type="button"
            onClick={handleStartProjectClick}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white shadow-md shadow-violet-500/20 transition-all hover:shadow-violet-500/35"
          >
            <PlusCircle className="w-3.5 h-3.5 text-white" />
            <span>Start Project</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <NotificationBell />

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                  aria-expanded={userDropdownOpen}
                >
                  <Avatar name={displayName} src={profile?.avatar_url} size="sm" />
                  <span className="text-xs font-bold text-slate-800 max-w-[110px] truncate">
                    {displayName}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border-2 border-slate-200 shadow-2xl p-2.5 z-50 text-xs animate-fadeIn space-y-1">
                    {/* User Info Header */}
                    <div className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 mb-1.5">
                      <p className="font-black text-slate-900 truncate">{displayName}</p>
                      <p className="text-[11px] font-mono text-slate-500 truncate">@{username || 'student'}</p>
                    </div>

                    <Link
                      href="/my-projects"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-violet-700 hover:bg-violet-50 transition-colors font-medium"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-violet-600" />
                      <span>My Projects &amp; Workspace</span>
                    </Link>

                    <Link
                      href="/my-applications"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-pink-700 hover:bg-pink-50 transition-colors font-medium"
                    >
                      <Inbox className="w-3.5 h-3.5 text-pink-600" />
                      <span>Applications &amp; Invites</span>
                    </Link>

                    {username && (
                      <Link
                        href={`/profile/${username}`}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-indigo-700 hover:bg-indigo-50 transition-colors font-medium"
                      >
                        <User className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Public Portfolio</span>
                      </Link>
                    )}

                    <Link
                      href="/planner"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-amber-700 hover:bg-amber-50 transition-colors font-medium"
                    >
                      <Bot className="w-3.5 h-3.5 text-amber-600" />
                      <span>AI Project Planner</span>
                    </Link>

                    {isTeacher && (
                      <Link
                        href="/teacher/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-purple-800 hover:bg-purple-50 transition-colors font-bold"
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                        <span>Faculty Mentor Dashboard</span>
                      </Link>
                    )}

                    <div className="my-1 border-t border-slate-100" />

                    <Link
                      href="/settings/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-500" />
                      <span>Settings &amp; Skills</span>
                    </Link>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors text-left font-bold"
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
                className="text-xs font-bold text-slate-700 hover:text-violet-700 hover:bg-violet-50"
              >
                Sign In
              </Button>
              <button
                type="button"
                onClick={() => openAuthModal('signup')}
                className="text-xs font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-sm"
              >
                Join Free
              </button>
            </div>
          )}
        </div>

        {/* Mobile Header Actions */}
        <div className="flex items-center gap-2 md:hidden">
          {user && <NotificationBell />}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/98 backdrop-blur-2xl px-5 pt-4 pb-8 space-y-4 animate-fadeIn shadow-xl">
          {/* Student Pathways */}
          <div className="space-y-1">
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 px-3 pb-1 font-bold">
              Collegiate Hub
            </p>
            <Link
              href="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-violet-50 hover:text-violet-700 transition-colors"
            >
              <Compass className="w-4 h-4 text-violet-600" />
              <span>Explore Projects</span>
            </Link>

            <Link
              href="/teammates"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-pink-50 hover:text-pink-700 transition-colors"
            >
              <Users className="w-4 h-4 text-pink-600" />
              <span>Find Teammates</span>
            </Link>

            <Link
              href="/hackathons"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-amber-50 hover:text-amber-800 transition-colors"
            >
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>College Hackathons</span>
            </Link>
          </div>

          {/* Contextual Authenticated Workspace Links */}
          {user && (
            <div className="space-y-1 pt-2 border-t border-slate-200">
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 px-3 pb-1 font-bold">
                My Workspace
              </p>
              <Link
                href="/my-projects"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
              >
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span>My Projects &amp; Workboards</span>
              </Link>

              <Link
                href="/my-applications"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-pink-50 hover:text-pink-700 transition-colors"
              >
                <Inbox className="w-4 h-4 text-pink-600" />
                <span>Applications &amp; Invites</span>
              </Link>
            </div>
          )}

          {/* Mobile CTA */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleStartProjectClick}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white font-bold shadow-md shadow-violet-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Start a Project</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
