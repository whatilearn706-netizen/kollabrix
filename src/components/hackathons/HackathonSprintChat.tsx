'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import {
  MessageSquare,
  Send,
  Sparkles,
  Clock,
  Lock,
  Smile,
  Zap,
  CheckCircle2,
  Users,
} from 'lucide-react';

export interface SprintMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string | null;
  content: string;
  created_at: string;
}

interface HackathonSprintChatProps {
  projectId: string;
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string | null;
  isClosed?: boolean;
}

const QUICK_RESPONSES = [
  '🚀 MVP Feature shipped!',
  '⚡ Pushed latest commit to GitHub',
  '🔥 Bug resolved and verified',
  '🎥 Recording 2-min pitch demo video',
  '🎯 Checking problem statement criteria',
  '☕ Late night sprint break!',
];

export function HackathonSprintChat({
  projectId,
  currentUserId = 'current-user',
  currentUserName = 'Teammate',
  currentUserAvatar,
  isClosed = false,
}: HackathonSprintChatProps) {
  const [messages, setMessages] = useState<SprintMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const storageKey = `teamforge_hackathon_chat_${projectId}`;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load chat history
  useEffect(() => {
    let isMounted = true;

    async function loadChat() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/workspace/data?projectId=${projectId}`);
        const json = await res.json();
        if (isMounted && json?.data?.sprint_messages && Array.isArray(json.data.sprint_messages)) {
          setMessages(json.data.sprint_messages);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Could not load sprint chat from api:', err);
      }

      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem(storageKey);
          if (cached && isMounted) {
            setMessages(JSON.parse(cached));
          } else if (isMounted) {
            const seedMessages: SprintMessage[] = [
              {
                id: 'msg-seed-1',
                sender_id: 'system',
                sender_name: 'Hackathon Bot',
                content: 'Welcome to your squad live sprint chat! Use this thread to coordinate commits, share demo links, and solve blockers.',
                created_at: new Date(Date.now() - 3600000).toISOString(),
              },
            ];
            setMessages(seedMessages);
          }
        } catch {}
      }
      if (isMounted) setIsLoading(false);
    }

    loadChat();

    // Supabase Realtime Channel
    try {
      const channel = supabase.channel(`hackathon-chat-${projectId}`);
      channel
        .on('broadcast', { event: 'new_message' }, (payload) => {
          if (payload?.message) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === payload.message.id)) return prev;
              const next = [...prev, payload.message];
              try {
                localStorage.setItem(storageKey, JSON.stringify(next));
              } catch {}
              return next;
            });
          }
        })
        .subscribe();
      channelRef.current = channel;
    } catch (e) {}

    return () => {
      isMounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [projectId, storageKey]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isClosed) return;

    setIsSending(true);

    const newMsg: SprintMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sender_id: currentUserId,
      sender_name: currentUserName,
      sender_avatar: currentUserAvatar,
      content: text,
      created_at: new Date().toISOString(),
    };

    const nextList = [...messages, newMsg];
    setMessages(nextList);
    setInputMessage('');

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(nextList));
      } catch {}
    }

    // Broadcast
    if (channelRef.current) {
      try {
        channelRef.current.send({
          type: 'broadcast',
          event: 'new_message',
          message: newMsg,
        });
      } catch {}
    }

    // Persist
    try {
      await fetch('/api/workspace/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          data: { sprint_messages: nextList },
        }),
      });
    } catch {}

    setIsSending(false);
  };

  return (
    <div className="rounded-2xl bg-charcoal-900 border border-charcoal-800 flex flex-col h-[600px] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-charcoal-800 bg-charcoal-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-500/10 border border-brand-500/25 flex items-center justify-center text-brand-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Squad Sprint Live Chat</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[11px] text-slate-400">
              Real-time huddle messaging for your hackathon squad
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-slate-400 bg-charcoal-900 px-2.5 py-1 rounded-lg border border-charcoal-800">
          {messages.length} messages
        </span>
      </div>

      {/* Quick Status Chips */}
      {!isClosed && (
        <div className="px-4 py-2 border-b border-charcoal-800/60 bg-charcoal-950/30 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] uppercase font-mono text-slate-500 shrink-0 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            Quick Sprint Updates:
          </span>
          {QUICK_RESPONSES.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              className="text-[11px] text-slate-300 hover:text-amber-300 hover:border-amber-500/40 bg-charcoal-900 border border-charcoal-750 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-mono">
            Loading sprint messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 font-mono">
            No messages yet. Send a message to start coordinating!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            const isBot = msg.sender_id === 'system';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 items-start ${isMe ? 'flex-row-reverse' : ''}`}
              >
                {!isBot && (
                  <Avatar
                    src={msg.sender_avatar}
                    name={msg.sender_name}
                    size="sm"
                    className="shrink-0 mt-0.5"
                  />
                )}
                {isBot && (
                  <div className="w-7 h-7 rounded-lg bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-300 shrink-0 text-xs font-bold">
                    🤖
                  </div>
                )}

                <div
                  className={`max-w-[75%] rounded-2xl p-3.5 space-y-1 text-xs shadow-xs ${
                    isBot
                      ? 'bg-brand-500/10 border border-brand-500/20 text-brand-200'
                      : isMe
                      ? 'bg-amber-600 text-white rounded-tr-xs'
                      : 'bg-charcoal-800 text-slate-200 border border-charcoal-750 rounded-tl-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 text-[10px] opacity-75">
                    <span className="font-bold">{msg.sender_name}</span>
                    <span>
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer */}
      {isClosed ? (
        <div className="p-3 bg-charcoal-950 border-t border-charcoal-800 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5" />
          <span>Sprint is concluded. Chat is preserved in read-only mode.</span>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 border-t border-charcoal-800 bg-charcoal-950 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Type a sprint message, PR link, or question for your team..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!inputMessage.trim() || isSending}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold"
            rightIcon={<Send className="w-3.5 h-3.5" />}
          >
            Send
          </Button>
        </form>
      )}
    </div>
  );
}
