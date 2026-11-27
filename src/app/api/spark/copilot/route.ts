import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isSupabaseConfigured, DEFAULT_SUPABASE_URL } from '@/lib/supabase/isConfigured';
import { DEFAULT_SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase/serviceKey';
import { callSparkLLM, SparkChatMessage } from '@/lib/spark/aiClient';
import { buildKollabrixLiveContext } from '@/lib/spark/platformContext';
import { checkIpRateLimit, getClientIp } from '@/lib/security/ipRateLimit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function buildOfflineCopilotFallback(userMessage: string, blueprint: any): string {
  const lower = userMessage.toLowerCase();
  const title = blueprint?.title || 'Your Project';
  const stack = Array.isArray(blueprint?.technologies) ? blueprint.technologies.join(', ') : 'Next.js, Node.js, PostgreSQL';

  if (lower.includes('schema') || lower.includes('sql') || lower.includes('database')) {
    return `### PostgreSQL Schema for ${title}\n\n\`\`\`sql\nCREATE TABLE users (\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\n  name text NOT NULL,\n  email text UNIQUE NOT NULL,\n  created_at timestamptz DEFAULT now()\n);\n\nCREATE TABLE items (\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\n  owner_id uuid REFERENCES users(id) ON DELETE CASCADE,\n  title text NOT NULL,\n  status text DEFAULT 'active',\n  metadata jsonb DEFAULT '{}'::jsonb,\n  created_at timestamptz DEFAULT now()\n);\n\`\`\``;
  }

  if (lower.includes('slide') || lower.includes('ppt') || lower.includes('pitch')) {
    return `### 6-Slide Hackathon Pitch Deck — ${title}\n1. **Hook & Problem:** ${blueprint?.elevatorPitch?.problem || 'Clear user pain point with campus metrics.'}\n2. **Solution & Live Demo:** ${blueprint?.elevatorPitch?.solution || 'Working end-to-end prototype.'}\n3. **Winning Twist:** ${blueprint?.winningTwist || 'Unique architectural edge.'}\n4. **Architecture:** ${stack}\n5. **Impact & Scalability:** Real-world adoption roadmap.\n6. **Team & Next Steps:** Live MVP metrics & deployment link.`;
  }

  return `### ${title} — Copilot Guidance\n\n- **Stack Focus:** Stick to ${stack} so your MVP ships on time.\n- **24-Hour Cut:** Build the core user flow first (${blueprint?.milestones?.[0]?.deliverables || 'Auth + Core API + Demo UI'}), skip secondary settings, and deploy early.\n- **Winning Angle:** Highlight "${blueprint?.winningTwist || 'your core differentiator'}" in the first 30 seconds of your demo.`;
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkIpRateLimit(`spark-copilot:${ip}`, 25, 5 * 60 * 1000, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }

    const body = await request.json();
    const { sessionId, blueprint, messages = [], userMessage } = body;

    if (!userMessage || typeof userMessage !== 'string' || !userMessage.trim()) {
      return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 });
    }

    const contextSummary = blueprint
      ? `Project Title: ${blueprint.title}
Tagline: ${blueprint.tagline}
Category: ${blueprint.category} | Difficulty: ${blueprint.difficulty}
Summary: ${blueprint.summary}
Winning Twist: ${blueprint.winningTwist}
Tech Stack: ${(blueprint.technologies || []).join(', ')}
Roles: ${(blueprint.desired_roles || []).join(', ')}
Milestones: ${(blueprint.milestones || []).map((m: any) => `${m.title} (${m.duration}): ${m.deliverables}`).join(' | ')}`
      : 'General Hackathon / Engineering Project';

    let currentUserId: string | null = null;
    if (isSupabaseConfigured()) {
      try {
        const serverClient = createServerSupabaseClient();
        const { data: { user } } = await serverClient.auth.getUser();
        currentUserId = user?.id || null;
      } catch {}
    }

    const liveEcosystemCtx = await buildKollabrixLiveContext(userMessage.trim(), currentUserId);

    const systemPrompt = `You are KΛ Copilot, an elite hackathon architect and full-stack mentor connected to all 3 Kollabrix platforms (Kollabrix, KΛ AI, and KΛ FOLIO).
You are helping a student team actively build the following project:

${contextSummary}

${liveEcosystemCtx}

Guidelines:
- Give concrete, immediately usable technical answers (SQL schemas, API routes, pitch scripts, 24-hour MVP cuts, debugging steps).
- Use live data from Kollabrix, KΛ AI, and KΛ FOLIO whenever relevant with clickable Markdown links.
- Use crisp Markdown with code blocks and bullet points. Keep answers focused and practical.`;

    const llmRes = await callSparkLLM({
      systemPrompt,
      userPrompt: userMessage.trim(),
      history: Array.isArray(messages) ? (messages as SparkChatMessage[]) : [],
      jsonMode: false,
      temperature: 0.65,
    });

    const reply = llmRes?.text || buildOfflineCopilotFallback(userMessage, blueprint);
    const engine = llmRes?.engine || 'Kollabrix Blueprint Engine';

    const nextMessages: SparkChatMessage[] = [
      ...(Array.isArray(messages) ? messages : []),
      { role: 'user', content: userMessage.trim(), createdAt: new Date().toISOString() },
      { role: 'assistant', content: reply, createdAt: new Date().toISOString() },
    ];

    // Persist conversation to Supabase session if sessionId is provided
    if (sessionId && isSupabaseConfigured()) {
      try {
        const serverClient = createServerSupabaseClient();
        const { data: { user } } = await serverClient.auth.getUser();
        if (user?.id) {
          const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
          const key = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SUPABASE_SERVICE_ROLE_KEY;
          if (url && key) {
            const service = createSupabaseClient(url, key, { auth: { persistSession: false } });
            await service
              .from('spark_sessions')
              .update({ messages: nextMessages, updated_at: new Date().toISOString() })
              .eq('id', sessionId)
              .eq('user_id', user.id);
          }
        }
      } catch {}
    }

    return NextResponse.json({
      success: true,
      reply,
      engine,
      messages: nextMessages,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Copilot failed to respond.' }, { status: 500 });
  }
}
