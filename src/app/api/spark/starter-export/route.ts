import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { callSparkLLM } from '@/lib/spark/aiClient';
import { checkIpRateLimit, getClientIp } from '@/lib/security/ipRateLimit';
import { consumeKaChatQuota } from '@/lib/spark/plans';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkIpRateLimit(`spark-export:${ip}`, 15, 5 * 60 * 1000, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Rate limit reached. Please wait a moment.' }, { status: 429 });
    }

    let userId: string | null = null;
    try {
      const serverClient = createServerSupabaseClient();
      const { data: { user } } = await serverClient.auth.getUser();
      userId = user?.id || null;
    } catch {}

    const quota = await consumeKaChatQuota(userId || ip, 'fast', userId, 'hackathon');
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

    const body = await request.json();
    const { blueprint } = body;

    if (!blueprint?.title) {
      return NextResponse.json({ error: 'Blueprint is required to generate starter files.' }, { status: 400 });
    }

    const systemPrompt = `You are a Principal Full-Stack Architect. Generate a clean, ready-to-run starter repository structure for this hackathon project.
Return ONLY valid JSON matching:
{
  "summary": "1-sentence overview of the generated starter architecture",
  "files": [
    { "path": "README.md", "content": "Complete markdown README with setup & architecture" },
    { "path": "package.json", "content": "Valid package.json with relevant dependencies & scripts" },
    { "path": "db/schema.sql", "content": "Clean PostgreSQL schema tailored to this project" },
    { "path": "src/index.ts", "content": "Starter entry file or core API handler for this project" }
  ]
}`;

    const userPrompt = `Project: ${blueprint.title}
Tagline: ${blueprint.tagline}
Summary: ${blueprint.summary}
Tech Stack: ${(blueprint.technologies || []).join(', ')}
Winning Twist: ${blueprint.winningTwist}
Milestones: ${(blueprint.milestones || []).map((m: any) => m.title).join(', ')}`;

    const llmRes = await callSparkLLM({
      systemPrompt,
      userPrompt,
      jsonMode: true,
      temperature: 0.4,
    });

    if (llmRes?.text) {
      try {
        const parsed = JSON.parse(llmRes.text);
        if (Array.isArray(parsed.files) && parsed.files.length > 0) {
          return NextResponse.json({ success: true, ...parsed, engine: llmRes.engine });
        }
      } catch {}
    }

    // Deterministic starter repo fallback
    const slug = String(blueprint.title || 'kollabrix-app')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return NextResponse.json({
      success: true,
      engine: 'Kollabrix Starter Generator',
      summary: `Generated 4 starter files for ${blueprint.title}`,
      files: [
        {
          path: 'README.md',
          content: `# ${blueprint.title}\n\n> ${blueprint.tagline || ''}\n\n## Overview\n${blueprint.summary || ''}\n\n## Winning Angle\n${blueprint.winningTwist || ''}\n\n## Tech Stack\n${(blueprint.technologies || []).map((t: string) => `- ${t}`).join('\n')}\n\n## Quick Start\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n`,
        },
        {
          path: 'package.json',
          content: JSON.stringify(
            {
              name: slug || 'kollabrix-starter',
              version: '0.1.0',
              private: true,
              scripts: { dev: 'next dev', build: 'next build', start: 'next start' },
              dependencies: { next: '^14.2.0', react: '^18.3.0', 'react-dom': '^18.3.0' },
            },
            null,
            2
          ),
        },
        {
          path: 'db/schema.sql',
          content: `-- Starter PostgreSQL Schema for ${blueprint.title}\nCREATE TABLE IF NOT EXISTS users (\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\n  name text NOT NULL,\n  email text UNIQUE NOT NULL,\n  created_at timestamptz DEFAULT now()\n);\n\nCREATE TABLE IF NOT EXISTS project_records (\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\n  owner_id uuid REFERENCES users(id) ON DELETE CASCADE,\n  title text NOT NULL,\n  payload jsonb DEFAULT '{}'::jsonb,\n  created_at timestamptz DEFAULT now()\n);\n`,
        },
        {
          path: 'src/app/api/health/route.ts',
          content: `import { NextResponse } from 'next/server';\n\nexport async function GET() {\n  return NextResponse.json({ ok: true, service: '${slug || 'kollabrix-app'}' });\n}\n`,
        },
      ],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Starter export failed.' }, { status: 500 });
  }
}
