'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { ProtectedPageGuard } from '@/components/auth/ProtectedPageGuard';
import { Notification } from '@/types/database';
import { Button } from '@/components/ui/Button';
import {
  Bell,
  CheckCheck,
  Check,
  Clock,
  Inbox,
  CheckCircle2,
  XCircle,
  FileCheck,
  Users,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';

function NotificationsContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Unread'>('All');
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          sender:profiles!notifications_sender_id_fkey(
            user_id,
            display_name,
            username,
            avatar_url
          )
        `)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setNotifications(data as Notification[]);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();

    const channel = supabase
      .channel(`full-notifications-${user?.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user?.id}`,
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadNotifications]);

  const handleMarkOneRead = async (id: string, link: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('recipient_id', user?.id || '');

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      router.push(link);
    } catch {
      router.push(link);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    setIsMarkingAll(true);
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // ignore
    } finally {
      setIsMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'Unread') return !n.is_read;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-brand-400" />
            <span>Notification Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time collaboration alerts, task assignments, and application updates.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            isLoading={isMarkingAll}
            leftIcon={<CheckCheck className="w-4 h-4 text-brand-400" />}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-charcoal-800 pb-3 text-xs">
        <button
          onClick={() => setFilter('All')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
            filter === 'All'
              ? 'bg-charcoal-800 text-white border border-charcoal-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-charcoal-850'
          }`}
        >
          <span>All</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-charcoal-750 text-slate-400">
            {notifications.length}
          </span>
        </button>

        <button
          onClick={() => setFilter('Unread')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
            filter === 'Unread'
              ? 'bg-charcoal-800 text-white border border-charcoal-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-charcoal-850'
          }`}
        >
          <span>Unread</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              unreadCount > 0 ? 'bg-brand-500 text-white font-bold' : 'bg-charcoal-750 text-slate-400'
            }`}
          >
            {unreadCount}
          </span>
        </button>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="max-w-md mx-auto py-16 text-center space-y-4">
          <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Loading notifications...</p>
        </div>
      ) : filteredNotifs.length === 0 ? (
        <div className="p-12 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center space-y-3">
          <Bell className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">No notifications</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {filter === 'Unread'
              ? 'You have read all your notifications! Check back later for new alerts.'
              : 'You have no notifications yet. When team members apply or assign you tasks, updates will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => handleMarkOneRead(n.id, n.link)}
              className={`rounded-2xl border p-4 sm:p-5 flex items-start gap-4 cursor-pointer transition-all hover:border-charcoal-700 ${
                !n.is_read
                  ? 'bg-charcoal-900 border-brand-500/30 ring-1 ring-brand-500/20'
                  : 'bg-charcoal-900/60 border-charcoal-800 text-slate-400'
              }`}
            >
              <div className="mt-1 shrink-0">
                {n.type === 'application_received' ? (
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                    <Inbox className="w-5 h-5" />
                  </div>
                ) : n.type === 'application_accepted' ? (
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : n.type === 'application_rejected' ? (
                  <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center border border-red-500/30">
                    <XCircle className="w-5 h-5" />
                  </div>
                ) : n.type === 'task_assigned' ? (
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <FileCheck className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center border border-slate-700">
                    <Bell className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-sm font-bold ${!n.is_read ? 'text-white' : 'text-slate-300'}`}>
                    {n.title}
                  </h4>
                  <span className="text-[11px] text-slate-500 shrink-0">
                    {new Date(n.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {n.message}
                </p>

                <div className="pt-2 flex items-center gap-1.5 text-xs text-brand-400 font-semibold group">
                  <span>Open destination</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <ProtectedPageGuard>
      <NotificationsContent />
    </ProtectedPageGuard>
  );
}
