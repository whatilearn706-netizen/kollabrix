'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import {
  Sparkles,
  Compass,
  PlusCircle,
  LogOut,
  User,
  Settings,
  Menu,
  X,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { clsx } from 'clsx';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut, openAuthModal, isConfigured } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-charcoal-800 bg-charcoal-950/85 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus:outline-none"
          aria-label="TeamForge Home"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-subtle group-hover:shadow-glow-sm transition-all duration-200">
            <Layers className="w-5 h-5 text-white transform group-hover:scale-105 transition-transform" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
              TeamForge
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-500/15 text-brand-300 border border-brand-500/30">
                Phase 1
              </span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/explore"
            className={clsx(
              'px-3.5 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2',
              pathname.startsWith('/explore')
                ? 'text-white bg-charcoal-800/90 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-charcoal-800/50'
            )}
          >
            <Compass className="w-4 h-4 text-brand-400" />
            <span>Explore Projects</span>
          </Link>

          <Link
            href="/#how-it-works"
            className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-charcoal-800/50 transition-colors"
          >
            How It Works
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartProjectClick}
            leftIcon={<PlusCircle className="w-4 h-4 text-brand-400" />}
          >
            Start a Project
          </Button>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-2 rounded-xl bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-700/80 hover:border-charcoal-600 transition-all text-left"
                aria-expanded={userDropdownOpen}
              >
                <Avatar name={displayName} src={profile?.avatar_url} size="sm" />
                <span className="text-xs font-medium text-slate-200 max-w-[120px] truncate">
                  {displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-charcoal-900 border border-charcoal-700 shadow-elevated p-1.5 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-charcoal-800 mb-1">
                    <p className="font-medium text-slate-200 truncate">{displayName}</p>
                    <p className="text-slate-500 truncate">@{username || 'student'}</p>
                  </div>

                  {username && (
                    <Link
                      href={`/profile/${username}`}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-charcoal-800 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-brand-400" />
                      <span>View Public Profile</span>
                    </Link>
                  )}

                  <Link
                    href="/settings/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-charcoal-800 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-brand-400" />
                    <span>Edit Profile & Skills</span>
                  </Link>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openAuthModal('login')}
              >
                Log In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => openAuthModal('signup')}
              >
                Get Started
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-charcoal-800 transition-colors"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-charcoal-800 bg-charcoal-900/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/explore"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-charcoal-800 transition-colors"
          >
            <Compass className="w-4 h-4 text-brand-400" />
            <span>Explore Projects</span>
          </Link>

          <Link
            href="/#how-it-works"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-charcoal-800 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>How It Works</span>
          </Link>

          <div className="pt-2 border-t border-charcoal-800 space-y-2">
            <Button
              variant="outline"
              size="md"
              className="w-full justify-center"
              onClick={handleStartProjectClick}
              leftIcon={<PlusCircle className="w-4 h-4 text-brand-400" />}
            >
              Start a Project
            </Button>

            {user ? (
              <div className="space-y-1.5 pt-2">
                <div className="px-3 py-2 rounded-lg bg-charcoal-850 flex items-center gap-2.5">
                  <Avatar name={displayName} src={profile?.avatar_url} size="sm" />
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-white truncate">{displayName}</p>
                    <p className="text-[11px] text-slate-400 truncate">@{username || 'student'}</p>
                  </div>
                </div>

                {username && (
                  <Link
                    href={`/profile/${username}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-charcoal-800"
                  >
                    <User className="w-4 h-4 text-brand-400" />
                    <span>View Public Profile</span>
                  </Link>
                )}

                <Link
                  href="/settings/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-charcoal-800"
                >
                  <Settings className="w-4 h-4 text-brand-400" />
                  <span>Edit Profile & Skills</span>
                </Link>

                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full justify-center"
                  onClick={() => openAuthModal('login')}
                >
                  Log In
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  className="w-full justify-center"
                  onClick={() => openAuthModal('signup')}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
