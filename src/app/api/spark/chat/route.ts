import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isSupabaseConfigured, DEFAULT_SUPABASE_URL } from '@/lib/supabase/isConfigured';
import { DEFAULT_SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase/serviceKey';
import {
  callSparkLLM,
  streamSparkLLM,
  SparkAttachment,
  SparkChatMessage,
  SparkModelTier,
} from '@/lib/spark/aiClient';
import { consumeKaChatQuota } from '@/lib/spark/plans';
import { buildKollabrixLiveContext } from '@/lib/spark/platformContext';
import { checkIpRateLimit, getClientIp } from '@/lib/security/ipRateLimit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export type SparkChatMode = 'general' | 'code' | 'dsa' | 'hackathon';

function inferKollabrixActions(
  mode: SparkChatMode,
  userMessage: string,
): Array<{ label: string; href: string; kind: 'arena' | 'icpc' | 'teammates' | 'workspace' | 'folio' | 'hackathon' }> {
  const promptLower = userMessage.toLowerCase().trim();
  if (promptLower.length < 8) return [];

  const actions: Array<{ label: string; href: string; kind: 'arena' | 'icpc' | 'teammates' | 'workspace' | 'folio' | 'hackathon' }> = [];

  const isLearningOrResource =
    /\b(folio|codex|resource|resources|book|books|track|tracks|learn|java|c\+\+|cpp|python|typescript|next\.?js|spring boot|system design|sliding window|two pointers|dynamic programming|dp|bfs|graph|tree|binary search|oop|hashmap|stl)\b/.test(
      promptLower
    );

  const isDsaOrCoding =
    mode === 'dsa' ||
    mode === 'code' ||
    /\b(two sum|binary search|dynamic programming|leetcode|algorithm|time complexity|tle|sliding window|linked list|interview prep|online assessment|arena|duel|bug)\b/.test(
      promptLower
    );

  const isHackathonOrProject =
    mode === 'hackathon' ||
    /\b(hackathon|sih|mvp|teammate|find squad|build an app|build a platform|project idea|startup idea|create a project|architecture|schema|sketch|wireframe)\b/.test(
      promptLower
    );

  if (isLearningOrResource) {
    actions.push({ label: 'Watch / Read in KΛ FOLIO', href: '/resources', kind: 'folio' });
  }

  if (isDsaOrCoding) {
    actions.push({ label: 'Test Yourself in 1v1 Arena', href: '/arena', kind: 'arena' });
    actions.push({ label: 'Practice in IDE', href: '/icpc', kind: 'icpc' });
  }

  if (isHackathonOrProject) {
    actions.push({ label: 'Browse Hackathons', href: '/hackathons', kind: 'hackathon' });
    actions.push({ label: 'Find Campus Teammates', href: '/teammates', kind: 'teammates' });
    actions.push({ label: 'Launch Project Workspace', href: '/projects/new', kind: 'workspace' });
  }

  // Deduplicate by href and limit to 3 crisp ecosystem chips
  const seen = new Set<string>();
  return actions.filter((a) => {
    if (seen.has(a.href)) return false;
    seen.add(a.href);
    return true;
  }).slice(0, 3);
}

async function persistSparkSession(
  userId: string | null,
  sessionId: string | null | undefined,
  mode: SparkChatMode,
  userMessage: string,
  blueprint: any,
  nextMessages: SparkChatMessage[]
): Promise<{ sessionId: string | null; session: any }> {
  if (!userId || !isSupabaseConfigured()) return { sessionId: sessionId || null, session: null };

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return { sessionId: sessionId || null, session: null };

    const service = createSupabaseClient(url, key, { auth: { persistSession: false } });
    const derivedTitle =
      blueprint?.title ||
      userMessage.trim().replace(/\s+/g, ' ').slice(0, 52) +
        (userMessage.trim().length > 52 ? '...' : '');

    if (sessionId) {
      const { data } = await service
        .from('spark_sessions')
        .update({
          messages: nextMessages,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .eq('user_id', userId)
        .select('id, title, prompt, track, blueprint, messages, updated_at')
        .maybeSingle();
      return { sessionId: data?.id || sessionId, session: data };
    }

    const { data } = await service
      .from('spark_sessions')
      .insert({
        user_id: userId,
        title: derivedTitle,
        prompt: userMessage.trim(),
        track: mode,
        blueprint: blueprint || { mode, title: derivedTitle },
        messages: nextMessages,
      })
      .select('id, title, prompt, track, blueprint, messages, updated_at')
      .single();

    return { sessionId: data?.id || null, session: data || null };
  } catch {
    return { sessionId: sessionId || null, session: null };
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkIpRateLimit(`spark-chat:${ip}`, 30, 5 * 60 * 1000, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Rate limit reached. Please wait a moment.' }, { status: 429 });
    }

    const body = await request.json();
    const {
      sessionId,
      mode = 'general',
      tier = 'fast',
      userMessage,
      messages = [],
      attachments = [],
      blueprint = null,
      stream = false,
    }: {
      sessionId?: string | null;
      mode?: SparkChatMode;
      tier?: SparkModelTier;
      userMessage: string;
      messages?: SparkChatMessage[];
      attachments?: SparkAttachment[];
      blueprint?: any;
      stream?: boolean;
    } = body;

    if ((!userMessage || !userMessage.trim()) && (!Array.isArray(attachments) || attachments.length === 0)) {
      return NextResponse.json({ error: 'Message or attachment cannot be empty.' }, { status: 400 });
    }

    const promptText = (userMessage || 'Please analyze the attached file/screenshot and help me.').trim();

    let userId: string | null = null;
    try {
      const serverClient = createServerSupabaseClient();
      const { data: { user } } = await serverClient.auth.getUser();
      userId = user?.id || null;
    } catch {}

    const quota = await consumeKaChatQuota(userId || ip, tier, userId, mode);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: quota.error || 'Daily KΛ ΛI quota reached.',
          requireAuth: Boolean(quota.requireAuth),
          upgradeRequired: Boolean(quota.upgradeRequired),
          entitlements: quota.entitlements,
        },
        { status: quota.requireAuth ? 401 : quota.upgradeRequired ? 402 : 429 }
      );
    }

    const activeModelName = quota.effectiveTier === 'deep' ? 'KΛ-Pro' : 'KΛ-1';
    const sharedIdentity = `You are KΛ ΛI (${activeModelName}), Kollabrix's native engineering AI assistant (powered by Google Gemini under the hood for KΛ-1 fast reasoning and KΛ-Pro deep architecture/vision) connected live across Kollabrix, KΛ AI, and KΛ FOLIO. If users ask about KΛ AI or how Gemini powers your features, explain KΛ AI's full architecture, plans, Hackathon Studio, Judge0 Auto-Heal, Sketch-to-App, and Personal Builder Memory transparently and thoroughly. Format answers cleanly using Markdown headings, bullet lists, clickable [Title](/route) links when referencing Kollabrix/KΛ FOLIO, and fenced code blocks.`;
    const modeInstructions: Record<SparkChatMode, string> = {
      general: `${sharedIdentity} For questions about Kollabrix or its features, explain exact Kollabrix workflows and live data with clickable links. For other general, study, or technical questions, answer the question thoroughly and directly first, then add a brief "On Kollabrix" next step only when relevant.`,
      code: `${sharedIdentity} In Code Sandbox mode: give production-quality code in fenced Markdown blocks with language tags (e.g. \`\`\`python, \`\`\`cpp, \`\`\`tsx), pinpoint bugs, provide runnable examples, and suggest [Practice IDE](/icpc) or [KΛ ARENA](/arena) when helpful.`,
      dsa: `${sharedIdentity} In DSA & Placement Coach mode: explain algorithms clearly with intuition, dry-run examples, runnable C++/Python/Java code in fenced blocks, exact Time & Space complexity, and link relevant sets in [Practice IDE](/icpc) or [KΛ ARENA](/arena).`,
      hackathon: `${sharedIdentity} In Hackathon & Squad Architect mode: help teams scope 24–48h MVPs, design schemas, craft winning judge pitches, and route builders straight to live [Hackathons](/hackathons), [Teammates](/teammates), [Starter Kits](/starter-kits), and [Create Project](/projects/new).`,
    };

    const blueprintCtx = blueprint
      ? `\n\nActive Project Blueprint Context:\nTitle: ${blueprint.title}\nTagline: ${blueprint.tagline}\nSummary: ${blueprint.summary}\nTech: ${(blueprint.technologies || []).join(', ')}`
      : '';

    const hasAttachments = Array.isArray(attachments) && attachments.length > 0;
    const sketchDirective = hasAttachments
      ? `\n\nATTACHMENT / SKETCH-TO-WORKING-APP DIRECTIVE:\nThe user attached image(s)/PDF(s). Inspect every visual element carefully. If it looks like a wireframe, whiteboard diagram, architecture sketch, Figma UI, or project assignment PDF, deliver a complete Sketch-to-App output containing:\n1. \`\`\`mermaid architecture diagram\n2. \`\`\`sql database schema (CREATE TABLE statements)\n3. \`\`\`tsx or \`\`\`ts working frontend + API route code ready to drop into Next.js/React.`
      : '';

    const livePlatformContext = await buildKollabrixLiveContext(promptText, userId);

    const systemPrompt = `${modeInstructions[mode] || modeInstructions.general}${blueprintCtx}${sketchDirective}\n\n${livePlatformContext}`;
    const attachmentNames = Array.isArray(attachments) ? attachments.map((a) => a.name).filter(Boolean) : [];
    const isTinyCasualPrompt = !hasAttachments && promptText.trim().length <= 28;
    const effectiveLlmTier = isTinyCasualPrompt ? 'fast' : quota.effectiveTier;

    // Real-time SSE Streaming path
    if (stream) {
      const streamed = await streamSparkLLM({
        systemPrompt,
        userPrompt: promptText,
        history: Array.isArray(messages) ? messages : [],
        attachments: Array.isArray(attachments) ? attachments : [],
        temperature: mode === 'code' || mode === 'dsa' ? 0.35 : 0.65,
        tier: effectiveLlmTier,
      });

      const encoder = new TextEncoder();
      const sendSse = (ctrl: ReadableStreamDefaultController, event: string, data: any) => {
        ctrl.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      const sseStream = new ReadableStream({
        async start(ctrl) {
          let fullReply = '';
          const engine = streamed?.engine || activeModelName;

          sendSse(ctrl, 'meta', {
            engine,
            effectiveTier: quota.effectiveTier,
            deepRemaining: quota.entitlements.deepRemaining,
            fastRemaining: quota.entitlements.fastRemaining,
            entitlements: quota.entitlements,
            quotaNote: quota.note || null,
          });

          if (streamed?.stream) {
            const reader = streamed.stream.getReader();
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                if (value) {
                  fullReply += value;
                  sendSse(ctrl, 'delta', { text: value });
                }
              }
            } catch {}
          }

          if (!fullReply.trim()) {
            fullReply = `${activeModelName} could not reach the model right now. Please try again in a moment.`;
            sendSse(ctrl, 'delta', { text: fullReply });
          }

          const actions = inferKollabrixActions(mode, promptText);
          const nextMessages: SparkChatMessage[] = [
            ...(Array.isArray(messages) ? messages : []),
            {
              role: 'user',
              content: promptText,
              ...(attachmentNames.length > 0 ? { attachmentNames } : {}),
              createdAt: new Date().toISOString(),
            },
            {
              role: 'assistant',
              content: fullReply,
              engine,
              actions,
              createdAt: new Date().toISOString(),
            },
          ];

          const saved = await persistSparkSession(userId, sessionId, mode, promptText, blueprint, nextMessages);
          sendSse(ctrl, 'done', {
            actions,
            sessionId: saved.sessionId,
            session: saved.session,
            messages: nextMessages,
          });
          ctrl.close();
        },
      });

      return new Response(sseStream, {
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        },
      });
    }

    // Standard JSON path
    const llmRes = await callSparkLLM({
      systemPrompt,
      userPrompt: promptText,
      history: Array.isArray(messages) ? messages : [],
      attachments: Array.isArray(attachments) ? attachments : [],
      jsonMode: false,
      temperature: mode === 'code' || mode === 'dsa' ? 0.35 : 0.65,
      tier: effectiveLlmTier,
    });

    const reply = llmRes?.text || `${activeModelName} could not reach the model right now. Please try again in a moment.`;
    const engine = llmRes?.engine || activeModelName;
    const actions = inferKollabrixActions(mode, promptText);

    const nextMessages: SparkChatMessage[] = [
      ...(Array.isArray(messages) ? messages : []),
      {
        role: 'user',
        content: promptText,
        ...(attachmentNames.length > 0 ? { attachmentNames } : {}),
        createdAt: new Date().toISOString(),
      },
      {
        role: 'assistant',
        content: reply,
        engine,
        actions,
        createdAt: new Date().toISOString(),
      },
    ];

    const saved = await persistSparkSession(userId, sessionId, mode, promptText, blueprint, nextMessages);

    return NextResponse.json({
      success: true,
      reply,
      engine,
      effectiveTier: quota.effectiveTier,
      deepRemaining: quota.entitlements.deepRemaining,
      fastRemaining: quota.entitlements.fastRemaining,
      entitlements: quota.entitlements,
      quotaNote: quota.note || null,
      actions,
      sessionId: saved.sessionId,
      session: saved.session,
      messages: nextMessages,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Spark Chat failed.' }, { status: 500 });
  }
}
