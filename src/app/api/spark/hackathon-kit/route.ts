import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isSupabaseConfigured, DEFAULT_SUPABASE_URL } from '@/lib/supabase/isConfigured';
import { DEFAULT_SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase/serviceKey';
import { checkIpRateLimit, getClientIp } from '@/lib/security/ipRateLimit';
import { callSparkLLM } from '@/lib/spark/aiClient';
import { consumeKaChatQuota } from '@/lib/spark/plans';
import { fetchDeepGitHubContext } from '@/lib/spark/githubScanner';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getServiceClient() {
  if (!isSupabaseConfigured()) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, { auth: { persistSession: false } });
}

function safeParseJson(text?: string) {
  if (!text) return null;
  const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rate = checkIpRateLimit(`ka-hack-kit:${ip}`, 25, 5 * 60 * 1000, 5 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json({ error: 'Rate limit reached. Please wait a moment.' }, { status: 429 });
    }

    let userId: string | null = null;
    try {
      const serverClient = createServerSupabaseClient();
      const { data: { user } } = await serverClient.auth.getUser();
      userId = user?.id || null;
    } catch {}

    // Enforces Hackathon Pass (₹49, 10/day Hackathon Studio only) OR KΛ Pro Builder (₹149/mo) AND consumes 1 KΛ-Pro call
    const quota = await consumeKaChatQuota(userId || ip, 'deep', userId, 'hackathon');
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error:
            quota.error ||
            (userId
              ? 'Hackathon Sprint Kit requires Hackathon Pass (₹49 / 7 days) or KΛ Pro Builder (₹149/mo).'
              : 'Sign in and unlock Hackathon Pass (₹49) or KΛ Pro Builder to access Hackathon Sprint Tools.'),
          requireAuth: Boolean(quota.requireAuth),
          upgradeRequired: Boolean(quota.upgradeRequired || !userId),
          entitlements: quota.entitlements,
        },
        { status: quota.requireAuth ? 401 : 402 }
      );
    }

    const body = await request.json();
    const {
      action,
      hackathonId = '',
      hackathonTitle = '',
      problemStatement = '',
      statements = '',
      repoUrl = '',
      pitchNotes = '',
      blueprint,
    } = body as {
      action: 'ppt_deck' | 'pick_ps' | 'demo_qa' | 'repo_pack';
      hackathonId?: string;
      hackathonTitle?: string;
      problemStatement?: string;
      statements?: string;
      repoUrl?: string;
      pitchNotes?: string;
      blueprint?: any;
    };

    const client = getServiceClient();
    let hackathonCtx = hackathonTitle ? `Target Hackathon: ${hackathonTitle}` : '';
    if (client && hackathonId) {
      try {
        const { data: h } = await client
          .from('hackathons')
          .select('title, organizer, themes, prize_pool, description')
          .eq('id', hackathonId)
          .maybeSingle();
        if (h) {
          hackathonCtx = `Target Hackathon: ${h.title}\nOrganizer: ${h.organizer || 'Kollabrix'}\nThemes: ${
            Array.isArray(h.themes) ? h.themes.join(', ') : 'Open Innovation'
          }\nPrize Pool: ${h.prize_pool || 'Prizes & PPIs'}\nBrief: ${String(h.description || '').slice(0, 600)}`;
        }
      } catch {}
    }

    // 1. Screening-Round PPT & Slide Generator
    if (action === 'ppt_deck') {
      const ps = (problemStatement || blueprint?.summary || '').trim();
      if (!ps) {
        return NextResponse.json({ error: 'Please paste a problem statement or project idea.' }, { status: 400 });
      }
      const systemPrompt = `You are a Smart India Hackathon (SIH) & Devfolio Grand-Jury Mentor.
Create a crisp 7-slide Screening-Round Presentation Deck that passes strict idea shortlisting.
Include a recommended visual/metric per slide and catch vague red-flag wording.
Return ONLY valid JSON:
{
  "deckTitle": "Crisp Project Title",
  "hackathonName": "Hackathon Name",
  "shortlistScoreForecast": number (72 to 96),
  "juryObjectionShield": "Top 1-line objection screening judges will raise and how this deck counters it",
  "slides": [
    {
      "slideNumber": 1,
      "type": "cover" | "problem" | "solution" | "architecture" | "stack" | "feasibility" | "impact",
      "title": "Short Slide Title",
      "headline": "1 crisp impactful takeaway sentence",
      "recommendedVisual": "What diagram/chart/screenshot to place on this slide",
      "bullets": ["Concrete point 1 with metric", "Concrete point 2", "Concrete point 3"],
      "speakerNotes": "Exact 2-sentence spoken pitch for this slide",
      "redFlagFix": { "weakClaim": "Generic claim judges reject", "improvedClaim": "Sharper shortlisted version with metrics" }
    }
  ],
  "architectureNodes": [
    { "id": "n1", "label": "Node Name", "layer": "Client" | "API" | "Engine" | "Data", "detail": "Tech used" }
  ],
  "architectureEdges": [
    { "from": "n1", "to": "n2", "label": "Action" }
  ],
  "mermaidCode": "flowchart LR\n  A[Client] --> B[API]"
}`;

      const llmRes = await callSparkLLM({
        systemPrompt,
        userPrompt: `${hackathonCtx || 'Open Collegiate Hackathon'}\nProblem / Idea:\n${ps}${
          blueprint ? `\nTech Stack: ${(blueprint.technologies || []).join(', ')}` : ''
        }`,
        jsonMode: true,
        temperature: 0.45,
        tier: 'deep',
      });

      const parsed = safeParseJson(llmRes?.text);
      if (!parsed) {
        return NextResponse.json({ error: 'Could not generate slide deck right now.', entitlements: quota.entitlements }, { status: 502 });
      }
      return NextResponse.json({ success: true, deck: parsed, entitlements: quota.entitlements, engine: llmRes?.engine || 'KΛ-Pro' });
    }

    // 2. "Pick the Winning Problem Statement" Analyzer (with 36h sprint execution roadmap)
    if (action === 'pick_ps') {
      if (!statements.trim() || statements.trim().length < 20) {
        return NextResponse.json(
          { error: 'Paste 2 or more problem statements to compare & score.' },
          { status: 400 }
        );
      }

      let liveTrendCtx = '';
      if (client) {
        try {
          const { data: projs } = await client
            .from('projects')
            .select('category, technologies')
            .neq('status', 'archived')
            .limit(20);
          if (projs?.length) {
            const cats = projs.map((p) => p.category).filter(Boolean).slice(0, 12).join(', ');
            liveTrendCtx = `Live Kollabrix campus project categories right now: ${cats}. Warn the team if an option collides with crowded generic ideas.`;
          }
        } catch {}
      }

      const systemPrompt = `You are a blunt Hackathon Strategist helping a 2-4 student squad choose ONE problem statement they can ACTUALLY win in 36 hours.
Rank every option ruthlessly, pick ONE clear winner, give exact Cut List items, plus a concrete 36-Hour Execution Schedule for the winning pick!
Return ONLY valid JSON:
{
  "winnerIndex": number (0-based index of best option),
  "winnerSummary": "2 crisp sentences explaining why this option beats the rest",
  "sprintSchedule36h": [
    { "window": "Hours 0 - 12", "focus": "Core Engine & Mock Data", "deliverable": "Exact milestone" },
    { "window": "Hours 12 - 24", "focus": "UI Flow & Real Integration", "deliverable": "Exact milestone" },
    { "window": "Hours 24 - 36", "focus": "Edge Cases, Demo & Pitch", "deliverable": "Exact milestone" }
  ],
  "options": [
    {
      "label": "Option 1",
      "title": "Short summarized PS title",
      "scores": {
        "crowdSaturation": number (1-10, 10 = least crowded / best uniqueness),
        "buildability36h": number (1-10, 10 = easiest to ship cleanly in 36h),
        "demoWowFactor": number (1-10, 10 = strongest live demo impact),
        "riskSafety": number (1-10, 10 = lowest hardware/API crash risk)
      },
      "verdict": "Blunt 1-sentence strategic verdict",
      "cutList": ["Skip X (mock it)", "Skip Y (out of scope)"],
      "unfairTechnicalEdge": "1 concrete engineering twist 95% of teams won't implement"
    }
  ]
}`;

      const llmRes = await callSparkLLM({
        systemPrompt,
        userPrompt: `${hackathonCtx}\n${liveTrendCtx}\n\nProblem Statements to Compare:\n${statements}`,
        jsonMode: true,
        temperature: 0.4,
        tier: 'deep',
      });

      const parsed = safeParseJson(llmRes?.text);
      if (!parsed) {
        return NextResponse.json({ error: 'Could not analyze problem statements right now.', entitlements: quota.entitlements }, { status: 502 });
      }
      return NextResponse.json({ success: true, analysis: parsed, entitlements: quota.entitlements, engine: llmRes?.engine || 'KΛ-Pro' });
    }

    // 3. 2-Minute Demo Script + Tough Judge Q&A Roast (scans real GitHub repo)
    if (action === 'demo_qa') {
      const repoSnap = repoUrl.trim() ? await fetchDeepGitHubContext(repoUrl.trim()) : null;
      const contextStr = [
        hackathonCtx,
        repoSnap?.found ? repoSnap.summaryText : '',
        pitchNotes ? `Pitch / Notes:\n${pitchNotes}` : '',
        blueprint ? `Blueprint: ${blueprint.title} — ${blueprint.summary}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');

      if (!contextStr.trim()) {
        return NextResponse.json(
          { error: 'Provide a public GitHub repo URL or pitch summary first.' },
          { status: 400 }
        );
      }

      const systemPrompt = `You are a Principal Engineer & Final-Round Hackathon Judge.
Using the team's actual repo files/dependencies/pitch below, craft:
1) A tight timestamped 2-minute live demo script summing to 120 seconds (exact spoken words + screen action + seconds duration).
2) A killer 2-sentence answer to "Why is this not just a ChatGPT/LLM wrapper?".
3) A 10-second Wi-Fi / API crash recovery tip.
4) 5 brutal, repo-specific judge cross-questions targeting real weaknesses, with sharp 2-sentence winning answers.
Return ONLY valid JSON:
{
  "scriptSegments": [
    { "timeRange": "0:00 - 0:25", "durationSec": 25, "section": "Hook & Problem", "spokenLine": "Exact words to say", "screenAction": "What to show on screen" }
  ],
  "chatgptWrapperRebuttal": "Sharp answer proving why custom architecture / data / UX matters",
  "crashFallbackTip": "Concrete backup strategy if demo fails live",
  "toughQuestions": [
    { "question": "Hard judge question targeting this repo", "whyJudgesAskIt": "1-line reason", "winningAnswer": "Sharp 2-sentence answer with real engineering metrics" }
  ]
}`;

      const llmRes = await callSparkLLM({
        systemPrompt,
        userPrompt: contextStr,
        jsonMode: true,
        temperature: 0.45,
        tier: 'deep',
      });

      const parsed = safeParseJson(llmRes?.text);
      if (!parsed) {
        return NextResponse.json({ error: 'Could not generate Demo & Judge Q&A right now.', entitlements: quota.entitlements }, { status: 502 });
      }
      return NextResponse.json({
        success: true,
        demoQa: parsed,
        repoScanned: repoSnap?.found ? { repoName: repoSnap.repoName, sha: repoSnap.lastCommitSha } : null,
        entitlements: quota.entitlements,
        engine: llmRes?.engine || 'KΛ-Pro',
      });
    }

    // 4. 1-Click GitHub README.md + Architecture + schema.sql + API + .env.example Pack
    if (action === 'repo_pack') {
      const repoSnap = repoUrl.trim() ? await fetchDeepGitHubContext(repoUrl.trim()) : null;
      const contextStr = [
        hackathonCtx,
        repoSnap?.found ? repoSnap.summaryText : '',
        pitchNotes ? `Project Specs:\n${pitchNotes}` : '',
        blueprint
          ? `Blueprint: ${blueprint.title} (${(blueprint.technologies || []).join(', ')})\n${blueprint.summary}`
          : '',
      ]
        .filter(Boolean)
        .join('\n\n');

      if (!contextStr.trim()) {
        return NextResponse.json(
          { error: 'Provide a GitHub repo URL or project specs to generate your Submission Pack.' },
          { status: 400 }
        );
      }

      const systemPrompt = `You generate submission-ready open-source hackathon repository artifacts grounded in the team's ACTUAL files, scripts, and dependencies.
Never leave placeholder "[insert repo]" text — use real filenames, package.json scripts, and dependencies detected below.
Return ONLY valid JSON:
{
  "architectureNodes": [
    { "id": "n1", "label": "Component Name", "layer": "Client" | "API" | "Engine" | "Data", "detail": "Concrete framework/service" }
  ],
  "architectureEdges": [
    { "from": "n1", "to": "n2", "label": "Protocol/Action" }
  ],
  "mermaidCode": "flowchart LR\n  Client --> API",
  "readmeMarkdown": "Complete submission-ready README.md with features, architecture, env vars, and exact setup commands",
  "schemaSql": "-- Clean PostgreSQL/Supabase CREATE TABLE statements tailored to this project",
  "envExample": "# Required environment variables\nNEXT_PUBLIC_APP_URL=http://localhost:3000",
  "apiEndpoints": [
    { "method": "POST", "path": "/api/...", "purpose": "What it does", "auth": "Session / Public" }
  ]
}`;

      const llmRes = await callSparkLLM({
        systemPrompt,
        userPrompt: contextStr,
        jsonMode: true,
        temperature: 0.35,
        tier: 'deep',
      });

      const parsed = safeParseJson(llmRes?.text);
      if (!parsed) {
        return NextResponse.json({ error: 'Could not generate Repo Pack right now.', entitlements: quota.entitlements }, { status: 502 });
      }
      return NextResponse.json({
        success: true,
        pack: parsed,
        repoScanned: repoSnap?.found ? { repoName: repoSnap.repoName, sha: repoSnap.lastCommitSha } : null,
        entitlements: quota.entitlements,
        engine: llmRes?.engine || 'KΛ-Pro',
      });
    }

    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Hackathon Sprint Kit failed.' }, { status: 500 });
  }
}
