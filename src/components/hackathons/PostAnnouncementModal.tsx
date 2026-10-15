'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import { HackathonAnnouncement } from '@/types/database';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { AlertCircle, Megaphone, Pin } from 'lucide-react';

interface PostAnnouncementModalProps {
  hackathonId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (announcement: HackathonAnnouncement) => void;
}

export function PostAnnouncementModal({
  hackathonId,
  isOpen,
  onClose,
  onSuccess,
}: PostAnnouncementModalProps) {
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('You must be signed in to post an announcement.');
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError('Please provide both a title and announcement content.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        hackathon_id: hackathonId,
        author_id: user.id,
        title: title.trim(),
        content: content.trim(),
        is_pinned: isPinned,
      };

      if (isSupabaseConfigured()) {
        const { data, error: insertError } = await supabase
          .from('hackathon_announcements')
          .insert(payload)
          .select('*')
          .single();

        if (insertError) {
          throw new Error(insertError.message);
        }

        onSuccess(data as HackathonAnnouncement);
      } else {
        const mock: HackathonAnnouncement = {
          id: `ann-${Date.now()}`,
          hackathon_id: hackathonId,
          author_id: user.id,
          title: title.trim(),
          content: content.trim(),
          is_pinned: isPinned,
          created_at: new Date().toISOString(),
        };
        onSuccess(mock);
      }

      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error broadcasting announcement.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Broadcast Hackathon Announcement"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Announcement Headline *
          </label>
          <Input
            placeholder="e.g. Midpoint Check-in & Mentor Q&A Starting in 15 mins"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Message Body *
          </label>
          <Textarea
            rows={4}
            placeholder="Share instructions, link to Google Meet / Discord, or deadline alerts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
            className="rounded bg-charcoal-800 border-charcoal-700 text-brand-500 focus:ring-0"
          />
          <span className="flex items-center gap-1 font-medium">
            <Pin className="w-3.5 h-3.5 text-amber-400" />
            Pin announcement to the top of the workspace
          </span>
        </label>

        <div className="flex justify-end gap-3 pt-3 border-t border-charcoal-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            leftIcon={<Megaphone className="w-4 h-4" />}
          >
            Send Announcement
          </Button>
        </div>
      </form>
    </Modal>
  );
}
