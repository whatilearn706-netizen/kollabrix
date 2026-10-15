'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useWorkspace } from '../layout';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { ProjectDiscussion, ProjectDiscussionReply } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Avatar } from '@/components/ui/Avatar';
import {
  MessageSquare,
  Send,
  Trash2,
  Edit2,
  CornerDownRight,
  Clock,
  Sparkles,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';

export default function WorkspaceDiscussionsPage() {
  const { user } = useAuth();
  const { project, isLead } = useWorkspace();

  const [discussions, setDiscussions] = useState<ProjectDiscussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  // Replying state
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Editing state
  const [editingDiscussionId, setEditingDiscussionId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const loadDiscussions = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch parent discussions
      const { data: discData, error: discError } = await supabase
        .from('project_discussions')
        .select(`
          *,
          author:profiles!project_discussions_author_id_fkey(
            user_id,
            display_name,
            username,
            avatar_url
          )
        `)
        .eq('project_id', project.id)
        .order('created_at', { ascending: false });

      if (discError || !discData) {
        setIsLoading(false);
        return;
      }

      // 2. Fetch replies
      const { data: repliesData } = await supabase
        .from('project_discussion_replies')
        .select(`
          *,
          author:profiles!project_discussion_replies_author_id_fkey(
            user_id,
            display_name,
            username,
            avatar_url
          )
        `)
        .eq('project_id', project.id)
        .order('created_at', { ascending: true });

      const allReplies = (repliesData as unknown as ProjectDiscussionReply[]) || [];

      // Group replies by discussion_id
      const enriched = (discData as unknown as ProjectDiscussion[]).map((d) => ({
        ...d,
        replies: allReplies.filter((r) => r.discussion_id === d.id),
      }));

      setDiscussions(enriched);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [project.id]);

  useEffect(() => {
    loadDiscussions();

    // Realtime channel for discussions
    const channel = supabase
      .channel(`project-discussions-${project.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_discussions',
          filter: `project_id=eq.${project.id}`,
        },
        () => {
          loadDiscussions();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_discussion_replies',
          filter: `project_id=eq.${project.id}`,
        },
        () => {
          loadDiscussions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [project.id, loadDiscussions]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (newPostContent.trim().length === 0) return;
    if (newPostContent.trim().length > 4000) {
      setPostError('Post cannot exceed 4000 characters.');
      return;
    }

    setIsPosting(true);
    setPostError(null);

    try {
      const { error } = await supabase.from('project_discussions').insert({
        project_id: project.id,
        author_id: user.id,
        content: newPostContent.trim(),
      });

      if (error) {
        setPostError(error.message || 'Could not post message.');
      } else {
        setNewPostContent('');
        await loadDiscussions();
      }
    } catch (err: unknown) {
      setPostError(err instanceof Error ? err.message : 'Error sending post.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleSendReply = async (discussionId: string) => {
    if (!user || replyContent.trim().length === 0) return;

    setIsSendingReply(true);
    try {
      const { error } = await supabase.from('project_discussion_replies').insert({
        discussion_id: discussionId,
        project_id: project.id,
        author_id: user.id,
        content: replyContent.trim(),
      });

      if (error) {
        alert(error.message || 'Could not post reply.');
      } else {
        setReplyContent('');
        setActiveReplyId(null);
        await loadDiscussions();
      }
    } catch {
      alert('Error sending reply.');
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleSaveEdit = async (discussionId: string) => {
    if (editContent.trim().length === 0) return;

    setIsSavingEdit(true);
    try {
      const { error } = await supabase
        .from('project_discussions')
        .update({
          content: editContent.trim(),
          is_edited: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', discussionId);

      if (error) {
        alert(error.message || 'Could not update post.');
      } else {
        setEditingDiscussionId(null);
        await loadDiscussions();
      }
    } catch {
      alert('Error updating post.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteDiscussion = async (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this post?');
    if (!confirm) return;

    try {
      const { error } = await supabase.from('project_discussions').delete().eq('id', id);
      if (error) {
        alert(error.message || 'Failed to delete post.');
      } else {
        await loadDiscussions();
      }
    } catch {
      alert('Error deleting post.');
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    const confirm = window.confirm('Delete this reply?');
    if (!confirm) return;

    try {
      const { error } = await supabase
        .from('project_discussion_replies')
        .delete()
        .eq('id', replyId);

      if (error) {
        alert(error.message || 'Failed to delete reply.');
      } else {
        await loadDiscussions();
      }
    } catch {
      alert('Error deleting reply.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750/80 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-400" />
            <span>Team Discussion Feed</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Private thread for workspace ideas, technical architecture, and team syncs.
          </p>
        </div>
      </div>

      {/* New Post Box */}
      <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750/80 p-5 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Start a Discussion
        </h3>

        {postError && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{postError}</span>
          </div>
        )}

        <form onSubmit={handleCreatePost} className="space-y-3">
          <Textarea
            placeholder="Share an update, design suggestion, or question for the team..."
            rows={3}
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            maxLength={4000}
            required
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500">
              {newPostContent.length} / 4000 characters
            </span>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isPosting}
              disabled={newPostContent.trim().length === 0}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Post Message
            </Button>
          </div>
        </form>
      </div>

      {/* Discussions Feed */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Loading discussions...</p>
        </div>
      ) : discussions.length === 0 ? (
        <div className="p-12 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center space-y-3">
          <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">No Discussions Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Kick off the first discussion with your team! Post an architecture idea or milestone plan above.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {discussions.map((d) => {
            const author = d.author;
            const authorName = author?.display_name || 'Team Member';
            const isMyPost = d.author_id === user?.id;
            const canDelete = isMyPost || isLead;
            const isEditing = editingDiscussionId === d.id;

            return (
              <div
                key={d.id}
                className="rounded-2xl bg-charcoal-900 border border-charcoal-750/80 p-5 space-y-4 hover:border-charcoal-700 transition-all"
              >
                {/* Post Author Bar */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={authorName} src={author?.avatar_url} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{authorName}</span>
                        {author?.username && (
                          <span className="text-xs text-slate-400 font-mono">
                            @{author.username}
                          </span>
                        )}
                        {d.is_edited && (
                          <span className="text-[10px] text-slate-500 italic">
                            (edited)
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {d.created_at
                          ? new Date(d.created_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })
                          : 'Recently'}
                      </span>
                    </div>
                  </div>

                  {/* Post Controls */}
                  <div className="flex items-center gap-1">
                    {isMyPost && !isEditing && (
                      <button
                        onClick={() => {
                          setEditingDiscussionId(d.id);
                          setEditContent(d.content);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-charcoal-800"
                        title="Edit Message"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {canDelete && (
                      <button
                        onClick={() => handleDeleteDiscussion(d.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                        title="Delete Message"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Post Body */}
                {isEditing ? (
                  <div className="space-y-2 pt-1">
                    <Textarea
                      rows={3}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingDiscussionId(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSaveEdit(d.id)}
                        isLoading={isSavingEdit}
                        leftIcon={<Check className="w-3.5 h-3.5" />}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                    {d.content}
                  </p>
                )}

                {/* Reply Toggle */}
                <div className="pt-2 border-t border-charcoal-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      if (activeReplyId === d.id) {
                        setActiveReplyId(null);
                      } else {
                        setActiveReplyId(d.id);
                        setReplyContent('');
                      }
                    }}
                    className="inline-flex items-center gap-1.5 text-slate-400 hover:text-brand-300 font-medium transition-colors"
                  >
                    <CornerDownRight className="w-3.5 h-3.5" />
                    <span>
                      {activeReplyId === d.id
                        ? 'Cancel Reply'
                        : `Reply (${d.replies?.length || 0})`}
                    </span>
                  </button>
                </div>

                {/* Replies Thread */}
                {d.replies && d.replies.length > 0 && (
                  <div className="space-y-3 pl-4 sm:pl-6 border-l-2 border-charcoal-750 mt-3">
                    {d.replies.map((reply) => {
                      const repAuthor = reply.author;
                      const repAuthorName = repAuthor?.display_name || 'Member';
                      const canDeleteReply = reply.author_id === user?.id || isLead;

                      return (
                        <div
                          key={reply.id}
                          className="rounded-xl bg-charcoal-850 border border-charcoal-750/80 p-3.5 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Avatar name={repAuthorName} src={repAuthor?.avatar_url} size="sm" />
                              <span className="text-xs font-semibold text-white">
                                {repAuthorName}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {reply.created_at
                                  ? new Date(reply.created_at).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : ''}
                              </span>
                            </div>

                            {canDeleteReply && (
                              <button
                                onClick={() => handleDeleteReply(reply.id)}
                                className="p-1 rounded text-slate-500 hover:text-red-400"
                                title="Delete Reply"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                            {reply.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Inline Reply Form */}
                {activeReplyId === d.id && (
                  <div className="pl-4 sm:pl-6 border-l-2 border-brand-500/50 space-y-2 pt-2">
                    <Textarea
                      placeholder="Write a constructive reply..."
                      rows={2}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      maxLength={2000}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveReplyId(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSendReply(d.id)}
                        isLoading={isSendingReply}
                        disabled={replyContent.trim().length === 0}
                      >
                        Reply
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
