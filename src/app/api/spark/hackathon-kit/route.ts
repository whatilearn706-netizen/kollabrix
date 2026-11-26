import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isSupabaseConfigured, DEFAULT_SUPABASE_URL } from '@/lib/supabase/isConfigured';
import { DEFAULT_SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase/serviceKey';
import { checkIpRateLimit, getClientIp } from '@/lib/security/ipRateLimit';
import { callSparkLLM } from '@/lib/spark/aiClient';
import { consumeKaChatQuota } from '@/lib/spark/plans';
import { fetchDeepGitHubContext } from '@/lib/spark/githubScanner';
import { fetchExternalHackathonContext, fetchLiveDemoContext } from '@/lib/spark/liveDemoScanner';

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
      hackathonUrl = '',
      problemStatement = '',
      statements = '',
      repoUrl = '',
      liveDemoUrl = '',
      pitchNotes = '',
      blueprint,
    } = body as {
      action: 'ppt_deck' | 'pick_ps' | 'demo_qa' | 'repo_pack';
      hackathonId?: string;
      hackathonTitle?: string;
      hackathonUrl?: string;
      problemStatement?: string;
      statements?: string;
      repoUrl?: string;
      liveDemoUrl?: string;
      pitchNotes?: string;
      blueprint?: any;
    };

    const client = getServiceClient();

    // Fetch hackathon DB record, external hackathon URL, GitHub repo/profile, and live demo in parallel
    const [dbHackathon, extHackathon, repoSnap, liveDemoSnap] = await Promise.all([
      (async () => {
        if (!client || !hackathonId) return null;
        try {
          const { data } = await client
            .from('hackathons')
            .select('title, organizer, themes, prize_pool, description')
            .eq('id', hackathonId)
            .maybeSingle();
          return data;
        } catch {
          return null;
        }
      })(),
      hackathonUrl.trim() ? fetchExternalHackathonContext(hackathonUrl.trim()) : Promise.resolve(null),
      action !== 'pick_ps' && repoUrl.trim() ? fetchDeepGitHubContext(repoUrl.trim()) : Promise.resolve(null),
      (action === 'demo_qa' || action === 'repo_pack') && liveDemoUrl.trim()
        ? fetchLiveDemoContext(liveDemoUrl.trim())
        : Promise.resolve(null),
    ]);

    const hackathonParts: string[] = [];
    if (dbHackathon) {
      hackathonParts.push(
        `Target Hackathon: ${dbHackathon.title}\nOrganizer: ${dbHackathon.organizer || 'Kollabrix'}\nThemes: ${
          Array.isArray(dbHackathon.themes) ? dbHackathon.themes.join(', ') : 'Open Innovation'
        }\nPrize Pool: ${dbHackathon.prize_pool || 'Prizes & PPIs'}\nBrief: ${String(dbHackathon.description || '').slice(0, 700)}`
      );
    } else if (hackathonTitle) {
      hackathonParts.push(`Target Hackathon: ${hackathonTitle}`);
    }
    if (extHackathon?.found) {
      hackathonParts.push(extHackathon.summaryText);
    } else if (hackathonUrl.trim()) {
      hackathonParts.push(`External Hackathon Theme / Reference: ${hackathonUrl.trim()}`);
    }
    const hackathonCtx = hackathonParts.join('\n\n');

    const repoScanned = repoSnap?.found
      ? {
          repoName: repoSnap.repoName,
          sha: repoSnap.lastCommitSha,
          isProfileScan: Boolean(repoSnap.isProfileScan),
          signals: repoSnap.signals,
        }
      : null;

    const liveDemoStatus = liveDemoSnap?.checked
      ? {
          url: liveDemoSnap.url,
          reachable: liveDemoSnap.reachable,
          statusCode: liveDemoSnap.statusCode,
          latencyMs: liveDemoSnap.latencyMs,
          title: liveDemoSnap.title,
          detectedFramework: liveDemoSnap.detectedFramework,
          isBoilerplateOrError: liveDemoSnap.isBoilerplateOrError,
        }
      : null;

    // 1. Screening-Round PPT & Slide Generator (Reads Hackathon + GitHub Repo/Profile + Problem Statement)
    if (action === 'ppt_deck') {
      const ps = (problemStatement || blueprint?.summary || '').trim();
      if (!ps && !repoSnap?.found) {
        return NextResponse.json(
          { error: 'Please paste a problem statement / project idea or provide a GitHub repo URL.' },
          { status: 400 }
        );
      }

      const systemPrompt = `You are a Smart India Hackathon (SIH) & Devfolio Grand-Jury Mentor powered by Gemini 4 Hydrogen.
Read ALL provided context: the Target Hackathon details/themes, the team's actual GitHub Repository/Profile files & stack (if given), and the Problem Statement.
Design a BESPOKE 7-slide Screening-Round Deck uniquely structured for THIS exact domain and tech stack — NEVER output generic cookie-cutter bullet templates!

Choose the single best visual themePalette for this domain:
- "medical_teal" (Healthcare / Biotech)
- "emerald_civic" (SIH Civic / GovTech / Sustainability / AgriTech)
- "violet_agentic" (AI / Agents / DeepTech)
- "royal_indigo" (FinTech / EdTech / Enterprise)
- "obsidian_amber" (Developer Tools / Hardware / General)

Assign distinct structured slide data per slide:
- Slide 1 (type "cover", layoutVariant "cover_hero"): Bold title, sharp 1-line pitch, 3 crisp value pills in bullets.
- Slide 2 (type "problem", layoutVariant "split_problem_stats"): Include 3 concrete numeric KPI objects in "kpis" (e.g. [{"value":"68%","label":"Screening Drop-off"}]) + 3 pain bullets.
- Slide 3 (type "solution", layoutVariant "solution_workflow"): 3 concrete step-by-step workflow bullets explaining your exact core mechanism + novelty.
- Slide 4 (type "architecture", layoutVariant "architecture_diagram"): Grounded in real repo components/files if scanned; populate "architectureNodes" & "architectureEdges" + "mermaidCode".
- Slide 5 (type "stack", layoutVariant "bento_stack"): Populate "stackGrid" as a 2x2 matrix (Frontend, Backend & APIs, Database & Storage, AI / Cloud) matching real dependencies!
- Slide 6 (type "feasibility", layoutVariant "risk_matrix"): Populate "riskPairs" with 3 real risks and concrete engineering mitigations.
- Slide 7 (type "impact", layoutVariant "impact_roadmap"): Include 3 quantified impact KPIs in "kpis" + 3 phased rollout milestones in bullets.

Return ONLY valid JSON:
{
  "deckTitle": "Crisp Project Title",
  "hackathonName": "Exact Hackathon Name",
  "themePalette": "obsidian_amber" | "medical_teal" | "emerald_civic" | "violet_agentic" | "royal_indigo",
  "shortlistScoreForecast": number (74 to 96),
  "juryObjectionShield": "Top 1-line objection screening judges will raise for THIS hackathon and how this deck defeats it",
  "slides": [
    {
      "slideNumber": 1,
      "type": "cover" | "problem" | "solution" | "architecture" | "stack" | "feasibility" | "impact",
      "layoutVariant": "cover_hero" | "split_problem_stats" | "solution_workflow" | "architecture_diagram" | "bento_stack" | "risk_matrix" | "impact_roadmap",
      "title": "Short Bespoke Slide Title",
      "headline": "1 crisp impactful takeaway sentence",
      "recommendedVisual": "Specific diagram/chart/screenshot to place on this slide",
      "bullets": ["Concrete point 1", "Concrete point 2", "Concrete point 3"],
      "kpis": [{ "value": "Metric", "label": "Short Label" }],
      "stackGrid": [{ "category": "Frontend", "items": ["Next.js 14", "Tailwind"] }],
      "riskPairs": [{ "risk": "Concrete technical/scale risk", "mitigation": "Concrete engineering safeguard" }],
      "speakerNotes": "Exact 2-sentence spoken pitch for this slide",
      "redFlagFix": { "weakClaim": "Generic claim judges reject", "improvedClaim": "Sharper shortlisted version with metrics" }
    }
  ],
  "architectureNodes": [
    { "id": "n1", "label": "Node Name", "layer": "Client" | "API" | "Engine" | "Data", "detail": "Real tech from repo/stack" }
  ],
  "architectureEdges": [
    { "from": "n1", "to": "n2", "label": "Protocol/Action" }
  ],
  "mermaidCode": "flowchart LR\n  A[Client] --> B[API]"
}`;

      const userPromptParts = [
        hackathonCtx || 'Target Hackathon: Open Collegiate Hackathon',
        repoSnap?.found ? `\nGITHUB REPOSITORY / PROFILE SCAN:\n${repoSnap.summaryText}` : '',
        ps ? `\nPROBLEM STATEMENT / PROJECT IDEA:\n${ps}` : '',
        blueprint ? `\nBlueprint Tech Stack: ${(blueprint.technologies || []).join(', ')}` : '',
      ].filter(Boolean);

      const llmRes = await callSparkLLM({
        systemPrompt,
        userPrompt: userPromptParts.join('\n'),
        jsonMode: true,
        temperature: 0.45,
        tier: 'deep',
      });

      const parsed = safeParseJson(llmRes?.text);
      if (!parsed) {
        return NextResponse.json(
          { error: 'Could not generate slide deck right now. Please try again.', entitlements: quota.entitlements },
          { status: 502 }
        );
      }

      if (repoUrl.trim()) parsed.repoUrl = repoUrl.trim();

      return NextResponse.json({
        success: true,
        deck: parsed,
        repoScanned,
        entitlements: quota.entitlements,
        engine: llmRes?.engine || 'KΛ-Pro',
      });
    }

    // 2. "Pick the Winning Problem Statement" Analyzer (Clean comparison — no repo clutter)
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

      const systemPrompt = `You are a blunt Hackathon Strategist powered by Gemini 4 Hydrogen helping a 2-4 student squad choose ONE problem statement they can ACTUALLY win in 36 hours.
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
        temperature: 0.35,
        tier: 'deep',
      });

      const parsed = safeParseJson(llmRes?.text);
      if (!parsed) {
        return NextResponse.json(
          { error: 'Could not analyze problem statements right now.', entitlements: quota.entitlements },
          { status: 502 }
        );
      }
      return NextResponse.json({
        success: true,
        analysis: parsed,
        entitlements: quota.entitlements,
        engine: llmRes?.engine || 'KΛ-Pro',
      });
    }

    // 3. 2-Minute Demo Script + Tough Judge Q&A (Reads ALL repo features + Live Demo URL + Hackathon)
    if (action === 'demo_qa') {
      const contextStr = [
        hackathonCtx,
        repoSnap?.found ? `FULL GITHUB CODEBASE SCAN:\n${repoSnap.summaryText}` : '',
        liveDemoSnap?.checked ? `\n${liveDemoSnap.summaryText}` : '',
        pitchNotes ? `Pitch Highlights / Track Notes:\n${pitchNotes}` : '',
        blueprint ? `Blueprint: ${blueprint.title} — ${blueprint.summary}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');

      if (!contextStr.trim()) {
        return NextResponse.json(
          { error: 'Provide a GitHub repo URL, Live Demo URL, or pitch notes first.' },
          { status: 400 }
        );
      }

      const systemPrompt = `You are a Principal Engineer & Final-Round Hackathon Judge powered by Gemini 4 Hydrogen.
You have inspected the team's FULL GitHub codebase (routes, UI screens, APIs, dependencies, signals) AND their Live Demo deployment URL (HTTP status, latency, framework, rendered headings).
Do NOT give vague generic pitch scripts — ground EVERY segment and question in their REAL files, routes, and live deployment status!

Craft:
1) A tight timestamped 2-minute live demo script summing to 120 seconds citing exact pages/routes/features observed in their code & live demo.
2) A killer 2-sentence answer to "Why is this not just a ChatGPT/LLM wrapper?" (or generic CRUD app) referencing their actual architecture.
3) A 10-second Wi-Fi / API crash recovery tip tailored to their stack/deployment.
4) 5 brutal, code-and-demo-specific judge cross-questions targeting REAL gaps observed (e.g., if Live Demo returned 404/error or is missing, or if Backend API=false, or client-side mocks exist — roast THAT exact gap!), paired with sharp 2-sentence winning answers.

Return ONLY valid JSON:
{
  "scriptSegments": [
    { "timeRange": "0:00 - 0:25", "durationSec": 25, "section": "Hook & Live Entry", "spokenLine": "Exact words to say", "screenAction": "Exact route/component/URL action to click" }
  ],
  "chatgptWrapperRebuttal": "Sharp technical answer citing their real repo architecture",
  "crashFallbackTip": "Concrete backup strategy if live demo/API fails",
  "toughQuestions": [
    { "question": "Hard judge question citing real file/gap/live demo observation", "whyJudgesAskIt": "1-line reason", "winningAnswer": "Sharp 2-sentence answer with concrete engineering reasoning" }
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
        return NextResponse.json(
          { error: 'Could not generate Demo & Judge Q&A right now.', entitlements: quota.entitlements },
          { status: 502 }
        );
      }
      return NextResponse.json({
        success: true,
        demoQa: parsed,
        repoScanned,
        liveDemoStatus,
        entitlements: quota.entitlements,
        engine: llmRes?.engine || 'KΛ-Pro',
      });
    }

    // 4. 1-Click GitHub README.md + Architecture + schema.sql + API + .env.example Pack (Reads Repo + Live Demo)
    if (action === 'repo_pack') {
      const contextStr = [
        hackathonCtx,
        repoSnap?.found ? `FULL GITHUB CODEBASE SCAN:\n${repoSnap.summaryText}` : '',
        liveDemoSnap?.checked ? `\n${liveDemoSnap.summaryText}` : '',
        pitchNotes ? `Project Specs:\n${pitchNotes}` : '',
        blueprint
          ? `Blueprint: ${blueprint.title} (${(blueprint.technologies || []).join(', ')})\n${blueprint.summary}`
          : '',
      ]
        .filter(Boolean)
        .join('\n\n');

      if (!contextStr.trim()) {
        return NextResponse.json(
          { error: 'Provide a GitHub repo URL, Live Demo URL, or project specs to generate your Submission Pack.' },
          { status: 400 }
        );
      }

      const systemPrompt = `You generate submission-ready open-source hackathon repository artifacts grounded in the team's ACTUAL codebase files, UI routes, package.json scripts, referenced env vars, and Live Demo URL.
NEVER leave placeholder "[insert repo]" text — use their exact repo name, exact Live Demo URL (if provided), exact npm/python scripts, exact env variable names detected in source files, and exact API routes/pages!

Return ONLY valid JSON:
{
  "architectureNodes": [
    { "id": "n1", "label": "Component Name", "layer": "Client" | "API" | "Engine" | "Data", "detail": "Real framework/file from repo" }
  ],
  "architectureEdges": [
    { "from": "n1", "to": "n2", "label": "Protocol/Action" }
  ],
  "mermaidCode": "flowchart LR\n  Client --> API",
  "readmeMarkdown": "Complete submission-ready README.md with Live Demo badge/URL, verified features, directory structure, env vars, and exact setup commands",
  "schemaSql": "-- Clean PostgreSQL/Supabase CREATE TABLE statements tailored to this project's real entities",
  "envExample": "# Exact environment variables detected in codebase\nNEXT_PUBLIC_APP_URL=http://localhost:3000",
  "apiEndpoints": [
    { "method": "POST", "path": "/api/...", "purpose": "What it does in this codebase", "auth": "Session / Public" }
  ]
}`;

      const llmRes = await callSparkLLM({
        systemPrompt,
        userPrompt: contextStr,
        jsonMode: true,
        temperature: 0.3,
        tier: 'deep',
      });

      const parsed = safeParseJson(llmRes?.text);
      if (!parsed) {
        return NextResponse.json(
          { error: 'Could not generate Repo Pack right now.', entitlements: quota.entitlements },
          { status: 502 }
        );
      }
      return NextResponse.json({
        success: true,
        pack: parsed,
        repoScanned,
        liveDemoStatus,
        entitlements: quota.entitlements,
        engine: llmRes?.engine || 'KΛ-Pro',
      });
    }

    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Hackathon Sprint Kit failed.' }, { status: 500 });
  }
}
