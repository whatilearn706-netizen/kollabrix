'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import { Notification } from '@/types/database';
import {
  Bell,
  CheckCheck,
  Inbox,
  CheckCircle2,
  XCircle,
  FileCheck,
} from 'lucide-react';

export function NotificationBell() {
  const router = useRouter();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<string>(
    'notif-' + Math.random().toString(36).substring(2, 9)
  );

  const fetchUnreadCount = useCallback(async () => {
    if (!user || !isSupabaseConfigured()) return;
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      if (!error && typeof count === 'number') {
        setUnreadCount(count);
      }
    } catch {
      // Fallback silently
    }
  }, [user]);

  const fetchRecentNotifications = useCallback(async () => {
    if (!user || !isSupabaseConfigured()) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(6);

      if (!error && Array.isArray(data)) {
        setRecentNotifications(data as Notification[]);
      }
    } catch {
      // Fallback silently
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user || !isSupabaseConfigured()) return;

    fetchUnreadCount();

    let channelInstance: ReturnType<typeof supabase.channel> | null = null;
    try {
      channelInstance = supabase
        .channel(channelRef.current)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${user.id}`,
          },
          () => {
            fetchUnreadCount();
            fetchRecentNotifications();
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Realtime notifications channel unavailable:', err);
    }

    return () => {
      if (channelInstance) {
        try {
          supabase.removeChannel(channelInstance);
        } catch {
          // ignore
        }
      }
    };
  }, [user, fetchUnreadCount, fetchRecentNotifications]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      fetchRecentNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (notifId: string, link: string) => {
    try {
      if (isSupabaseConfigured() && user) {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notifId)
          .eq('recipient_id', user.id);
      }

      setRecentNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setIsOpen(false);
      if (link) router.push(link);
    } catch {
      if (link) router.push(link);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user || !isSupabaseConfigured()) return;
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      setRecentNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime())
        ? ''
        : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-xl bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-700/80 text-slate-300 hover:text-white transition-all focus:outline-none"
        aria-label="View notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-charcoal-900 border border-charcoal-750 shadow-elevated z-50 overflow-hidden text-xs animate-fadeIn">
          {/* Header */}
          <div className="p-3.5 border-b border-charcoal-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-[10px] font-semibold border border-brand-500/30">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-charcoal-800">
            {isLoading ? (
              <div className="py-8 text-center text-slate-500">Loading...</div>
            ) : recentNotifications.length === 0 ? (
              <div className="py-10 text-center space-y-1 text-slate-400">
                <Bell className="w-6 h-6 text-slate-600 mx-auto" />
                <p className="font-medium text-slate-300">All caught up!</p>
                <p className="text-[11px] text-slate-500">No recent notifications.</p>
              </div>
            ) : (
              recentNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkAsRead(n.id, n.link)}
                  className={`p-3.5 cursor-pointer hover:bg-charcoal-850/80 transition-colors flex items-start gap-3 ${
                    !n.is_read ? 'bg-brand-500/5' : ''
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {n.type === 'application_received' ? (
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                        <Inbox className="w-3.5 h-3.5" />
                      </div>
                    ) : n.type === 'application_accepted' ? (
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    ) : n.type === 'application_rejected' ? (
                      <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                        <XCircle className="w-3.5 h-3.5" />
                      </div>
                    ) : n.type === 'task_assigned' ? (
                      <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <FileCheck className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-slate-700 text-slate-300 flex items-center justify-center">
                        <Bell className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`font-semibold truncate ${!n.is_read ? 'text-white' : 'text-slate-300'}`}>
                        {n.title}
                      </p>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-slate-500 block pt-0.5">
                      {formatTimestamp(n.created_at)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-charcoal-800 bg-charcoal-950/50 text-center">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
            >
              View All Notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
