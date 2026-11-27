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
import type { PptxLayoutStyle, PptxThemePalette } from '@/lib/spark/pptxExport';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ALL_PALETTES: PptxThemePalette[] = [
  'obsidian_amber',
  'medical_teal',
  'emerald_civic',
  'violet_agentic',
  'royal_indigo',
  'cyber_crimson',
  'arctic_obsidian',
  'aurora_graphite',
];

const ALL_LAYOUT_STYLES: PptxLayoutStyle[] = [
  'bento_dark',
  'editorial_split',
  'cyber_grid',
  'orbital_flow',
  'minimal_swiss',
];

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
      const {
        data: { user },
      } = await serverClient.auth.getUser();
      userId = user?.id || null;
    } catch {}

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
      stackPreference = '',
      blueprint,
      regenerate = false,
      previousPalette = '',
      previousLayoutStyle = '',
      preferredTheme = '',
      judgeQuestion = '',
      judgeRole = '',
      userAnswer = '',
    } = body as {
      action:
        | 'ppt_deck'
        | 'pick_ps'
        | 'demo_qa'
        | 'repo_pack'
        | 'jury_roast'
        | 'grade_jury_answer'
        | 'starter_repo';
      hackathonId?: string;
      hackathonTitle?: string;
      hackathonUrl?: string;
      problemStatement?: string;
      statements?: string;
      repoUrl?: string;
      liveDemoUrl?: string;
      pitchNotes?: string;
      stackPreference?: string;
      blueprint?: any;
      regenerate?: boolean;
      previousPalette?: string;
      previousLayoutStyle?: string;
      preferredTheme?: string;
      judgeQuestion?: string;
      judgeRole?: string;
      userAnswer?: string;
    };

    // Determine dynamic KΛ-Pro token cost (2 tokens for heavy deep multi-link scan / full starter repo; 1 token for smaller tasks)
    const externalLinkCount = [repoUrl.trim(), hackathonUrl.trim(), liveDemoUrl.trim()].filter(Boolean).length;
    const isHeavyDeepAction =
      (action === 'starter_repo' && (externalLinkCount >= 1 || problemStatement.trim().length > 180)) ||
      (externalLinkCount >= 2 && (action === 'ppt_deck' || action === 'jury_roast' || action === 'demo_qa' || action === 'repo_pack'));
    const tokenCost: 1 | 2 = isHeavyDeepAction ? 2 : 1;

    // Enforces Hackathon Pass (₹49) OR KΛ Pro Builder (₹149/mo) with dynamic 1 or 2 token deduction
    const quota = await consumeKaChatQuota(userId || ip, 'deep', userId, 'hackathon', tokenCost);
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
      hackathonUrl.trim() && action !== 'grade_jury_answer'
        ? fetchExternalHackathonContext(hackathonUrl.trim())
        : Promise.resolve(null),
      action !== 'pick_ps' && action !== 'grade_jury_answer' && repoUrl.trim()
        ? fetchDeepGitHubContext(repoUrl.trim())
        : Promise.resolve(null),
      (action === 'demo_qa' || action === 'repo_pack' || action === 'jury_roast') && liveDemoUrl.trim()
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

    // 1. Creative Non-Repeating 7-Slide PPTX Generator (with Repeat / Theme Diversity)
    if (action === 'ppt_deck') {
      const ps = (problemStatement || blueprint?.summary || '').trim();
      if (!ps && !repoSnap?.found && !extHackathon?.found) {
        return NextResponse.json(
          { error: 'Please paste a problem statement / project idea or provide a GitHub/Hackathon URL.' },
          { status: 400 }
        );
      }

      const candidatePalettes = ALL_PALETTES.filter((p) => p !== previousPalette);
      const chosenFallbackPalette =
        preferredTheme && ALL_PALETTES.includes(preferredTheme as PptxThemePalette)
          ? (preferredTheme as PptxThemePalette)
          : candidatePalettes[Math.floor(Math.random() * candidatePalettes.length)];

      const candidateLayouts = ALL_LAYOUT_STYLES.filter((l) => l !== previousLayoutStyle);
      const chosenLayoutStyle = candidateLayouts[Math.floor(Math.random() * candidateLayouts.length)];

      const systemPrompt = `You are an elite Venture & Hackathon Deck Architect powered by Gemini 4 Hydrogen.
Carefully examine ALL provided inputs: the exact Target Hackathon themes/rules, the team's scanned GitHub repository files & stack, Live Demo status (if any), and their exact Question / Problem Statement.
Design a **BESPOKE, HIGH-CONTRAST 7-slide Screening-Round Deck** — NEVER generic bullet slop!

${
  regenerate
    ? `REGENERATE VARIATION MODE ACTIVE: The user wants a FRESH creative angle, DIFFERENT structure, DIFFERENT slide titles, DIFFERENT layout geometry ("${chosenLayoutStyle}"), and a DIFFERENT visual theme ("${chosenFallbackPalette}"). Do NOT repeat phrasing from a previous run!`
    : `Choose the sharpest matching visual themePalette (or use "${chosenFallbackPalette}") and layoutStyle ("${chosenLayoutStyle}").`
}

Available themePalettes: "obsidian_amber", "medical_teal", "emerald_civic", "violet_agentic", "royal_indigo", "cyber_crimson", "arctic_obsidian", "aurora_graphite".
Available layoutStyles: "bento_dark", "editorial_split", "cyber_grid", "orbital_flow", "minimal_swiss".

Per-slide contract:
- Slide 1 ("cover" / "cover_hero"): Bold title, sharp 1-line hook, 3 crisp value pills in bullets.
- Slide 2 ("problem" / "split_problem_stats"): 3 concrete numeric KPI objects in "kpis" + 3 sharp pain bullets.
- Slide 3 ("solution" / "solution_workflow"): 3 or 4 concrete workflow steps showing mechanism + novelty.
- Slide 4 ("architecture" / "architecture_diagram"): Real files/services/protocols from scanned repo (or concrete design); populate "architectureNodes" & "architectureEdges" + "mermaidCode".
- Slide 5 ("stack" / "bento_stack"): 2x2 matrix in "stackGrid" (Frontend, Backend & APIs, Data & Storage, AI / Infra) matching actual stack.
- Slide 6 ("feasibility" / "risk_matrix"): 3 real risks & engineering mitigations in "riskPairs".
- Slide 7 ("impact" / "impact_roadmap"): Include BOTH 3 quantified impact KPIs in "kpis" AND a numeric "chartData" object (4-5 short labels + positive numeric values for native bar chart rendering!) + 3 rollout bullets.

Return ONLY valid JSON:
{
  "deckTitle": "Crisp Project Title",
  "hackathonName": "Exact Hackathon Name",
  "themePalette": "${chosenFallbackPalette}",
  "layoutStyle": "${chosenLayoutStyle}",
  "deckStyleNote": "Short 1-line design rationale for this deck variation",
  "shortlistScoreForecast": number (76 to 97),
  "juryObjectionShield": "Top objection screening judges will raise for THIS hackathon and how this deck defeats it",
  "slides": [
    {
      "slideNumber": 1,
      "type": "cover" | "problem" | "solution" | "architecture" | "stack" | "feasibility" | "impact",
      "layoutVariant": "cover_hero" | "split_problem_stats" | "solution_workflow" | "architecture_diagram" | "bento_stack" | "risk_matrix" | "impact_roadmap",
      "title": "Short Bespoke Slide Title",
      "headline": "1 crisp impactful takeaway sentence",
      "recommendedVisual": "Specific chart/diagram/visual concept",
      "bullets": ["Point 1", "Point 2", "Point 3"],
      "kpis": [{ "value": "Metric", "label": "Short Label" }],
      "chartData": { "title": "Impact Metric Title", "labels": ["M1", "M2", "M3", "M4"], "values": [25, 48, 76, 94] },
      "stackGrid": [{ "category": "Frontend", "items": ["Next.js 14", "Tailwind"] }],
      "riskPairs": [{ "risk": "Concrete risk", "mitigation": "Concrete safeguard" }],
      "speakerNotes": "Exact 2-sentence spoken pitch for this slide",
      "redFlagFix": { "weakClaim": "Generic claim judges reject", "improvedClaim": "Sharper shortlisted version with metrics" }
    }
  ],
  "architectureNodes": [
    { "id": "n1", "label": "Node Name", "layer": "Client" | "API" | "Engine" | "Data", "detail": "Real tech" }
  ],
  "architectureEdges": [
    { "from": "n1", "to": "n2", "label": "Protocol" }
  ],
  "mermaidCode": "flowchart LR\n  A[Client] --> B[API]"
}`;

      const userPromptParts = [
        hackathonCtx || 'Target Hackathon: Open Collegiate Hackathon',
        repoSnap?.found ? `\nGITHUB REPOSITORY / PROFILE SCAN:\n${repoSnap.summaryText}` : '',
        liveDemoSnap?.checked ? `\nLIVE DEMO URL SCAN:\n${liveDemoSnap.summaryText}` : '',
        ps ? `\nPROBLEM STATEMENT / QUESTION / PROJECT IDEA:\n${ps}` : '',
        blueprint ? `\nBlueprint Tech Stack: ${(blueprint.technologies || []).join(', ')}` : '',
        regenerate ? `\nVariation Request Seed: ${Date.now()} (Create a noticeably fresh design, structure & content variation)` : '',
      ].filter(Boolean);

      const llmRes = await callSparkLLM({
        systemPrompt,
        userPrompt: userPromptParts.join('\n'),
        jsonMode: true,
        temperature: regenerate ? 0.8 : 0.5,
        tier: 'deep',
      });

      const parsed = safeParseJson(llmRes?.text);
      if (!parsed) {
        return NextResponse.json(
          { error: 'Could not generate slide deck right now. Please try again.', entitlements: quota.entitlements },
          { status: 502 }
        );
      }

      if (!parsed.themePalette || (regenerate && parsed.themePalette === previousPalette)) {
        parsed.themePalette = chosenFallbackPalette;
      }
      if (!parsed.layoutStyle || (regenerate && parsed.layoutStyle === previousLayoutStyle)) {
        parsed.layoutStyle = chosenLayoutStyle;
      }
      if (repoUrl.trim()) parsed.repoUrl = repoUrl.trim();
      if (liveDemoUrl.trim()) parsed.liveDemoUrl = liveDemoUrl.trim();

      return NextResponse.json({
        success: true,
        deck: parsed,
        repoScanned,
        liveDemoStatus,
        tokensUsed: quota.tokensUsed || tokenCost,
        entitlements: quota.entitlements,
        engine: llmRes?.engine || 'KΛ-Pro',
      });
    }

    // 2. "Pick the Winning Problem Statement" Analyzer
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
  "winnerIndex": number,
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
        "crowdSaturation": number,
        "buildability36h": number,
        "demoWowFactor": number,
        "riskSafety": number
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
        tokensUsed: quota.tokensUsed || tokenCost,
        entitlements: quota.entitlements,
        engine: llmRes?.engine || 'KΛ-Pro',
      });
    }

    // 3. 2-Minute Demo Script + Tough Judge Q&A
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
Inspect the FULL GitHub codebase AND Live Demo deployment URL AND Hackathon details.
Craft:
1) A tight timestamped 2-minute live demo script summing to 120 seconds citing real routes/features observed.
2) A killer 2-sentence answer to "Why is this not just a ChatGPT wrapper?" citing their real architecture.
3) A 10-second crash recovery tip.
4) 5 brutal code-and-demo-specific judge cross-questions paired with sharp winning answers.

Return ONLY valid JSON:
{
  "scriptSegments": [
    { "timeRange": "0:00 - 0:25", "durationSec": 25, "section": "Hook & Live Entry", "spokenLine": "Exact words to say", "screenAction": "Exact route/component/URL action" }
  ],
  "chatgptWrapperRebuttal": "Sharp technical answer",
  "crashFallbackTip": "Concrete backup strategy",
  "toughQuestions": [
    { "question": "Hard judge question", "whyJudgesAskIt": "1-line reason", "winningAnswer": "Sharp 2-sentence answer" }
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
        tokensUsed: quota.tokensUsed || tokenCost,
        entitlements: quota.entitlements,
        engine: llmRes?.engine || 'KΛ-Pro',
      });
    }

    // 4. 1-Click GitHub README.md + Architecture + schema.sql + API + .env.example Pack
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

      const systemPrompt = `Generate submission-ready open-source hackathon repository artifacts grounded in the team's ACTUAL codebase files, routes, scripts, env vars, and Live Demo URL.
Return ONLY valid JSON:
{
  "architectureNodes": [
    { "id": "n1", "label": "Component Name", "layer": "Client" | "API" | "Engine" | "Data", "detail": "Real framework/file" }
  ],
  "architectureEdges": [
    { "from": "n1", "to": "n2", "label": "Protocol/Action" }
  ],
  "mermaidCode": "flowchart LR\n  Client --> API",
  "readmeMarkdown": "Complete submission-ready README.md",
  "schemaSql": "-- Clean PostgreSQL/Supabase CREATE TABLE statements",
  "envExample": "# Exact environment variables detected",
  "apiEndpoints": [
    { "method": "POST", "path": "/api/...", "purpose": "What it does", "auth": "Session / Public" }
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
        tokensUsed: quota.tokensUsed || tokenCost,
        entitlements: quota.entitlements,
        engine: llmRes?.engine || 'KΛ-Pro',
      });
    }

    // 5. NEW: AI Jury Roast & Live Interactive Q&A Simulator (3 Strict Hackathon Judges)
    if (action === 'jury_roast') {
      const contextStr = [
        hackathonCtx,
        repoSnap?.found ? `FULL GITHUB CODEBASE SCAN:\n${repoSnap.summaryText}` : '',
        liveDemoSnap?.checked ? `\n${liveDemoSnap.summaryText}` : '',
        pitchNotes || problemStatement ? `Project Pitch / Problem Statement:\n${pitchNotes || problemStatement}` : '',
        blueprint ? `Blueprint: ${blueprint.title} (${(blueprint.technologies || []).join(', ')})\n${blueprint.summary}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');

      if (!contextStr.trim()) {
        return NextResponse.json(
          { error: 'Provide your project pitch, GitHub repo URL, or Hackathon URL so the 3 Judges can grill you!' },
          { status: 400 }
        );
      }

      const systemPrompt = `You are a panel of 3 strict Hackathon Finals Judges powered by Gemini 4 Hydrogen:
1. "Principal Technical Architect" — audits scalability, race conditions, DB schema, latency, real vs mock code.
2. "Product & UX Lead" — audits user onboarding friction, problem-solution fit, edge cases, demo clarity.
3. "Business & Scale Judge" — audits "Why isn't this just a ChatGPT wrapper?", unit economics, campus/market adoption.

Examine their REAL GitHub repo files, Live Demo check, Hackathon requirements, and Pitch Notes! Expose real weaknesses in their architecture or pitch!
Return ONLY valid JSON:
{
  "panelSummary": "Sharp 2-sentence verdict on the team's readiness for the live Q&A round",
  "questions": [
    {
      "id": "q1",
      "judgeRole": "Principal Technical Architect" | "Product & UX Lead" | "Business & Scale Judge",
      "judgePersona": "Blunt / Analytical / Skeptical",
      "question": "Specific tough cross-question citing real stack/files/gaps observed",
      "targetWeakness": "What flaw/risk this probes",
      "idealHint": "Key technical concept the student must cover in their reply"
    }
  ]
}
Include 6 questions total (2 per judge role).`;

      const llmRes = await callSparkLLM({
        systemPrompt,
        userPrompt: contextStr,
        jsonMode: true,
        temperature: 0.45,
        tier: 'deep',
      });

      const parsed = safeParseJson(llmRes?.text);
      if (!parsed || !Array.isArray(parsed.questions)) {
        return NextResponse.json(
          { error: 'Could not launch AI Jury Roast right now.', entitlements: quota.entitlements },
          { status: 502 }
        );
      }

      return NextResponse.json({
        success: true,
        roast: parsed,
        repoScanned,
        liveDemoStatus,
        tokensUsed: quota.tokensUsed || tokenCost,
        entitlements: quota.entitlements,
        engine: llmRes?.engine || 'KΛ-Pro',
      });
    }

    // 6. NEW: Grade User's Live Jury Response
    if (action === 'grade_jury_answer') {
      if (!judgeQuestion.trim() || !userAnswer.trim()) {
        return NextResponse.json(
          { error: 'Select a judge question and enter your spoken/written response to get graded.' },
          { status: 400 }
        );
      }

      const systemPrompt = `You are "${judgeRole || 'Hackathon Grand Judge'}" grading a team's live Q&A response.
Be brutally honest, constructive, and practical.
Return ONLY valid JSON:
{
  "score": number (1 to 10),
  "verdict": "Short badge verdict e.g. 'Convincing Architecture' or 'Too Vague — Exposed Mock'",
  "whatWorked": "1 crisp sentence on what landed well",
  "exposedGap": "1 crisp sentence on what still sounded weak or incomplete",
  "upgradedScript": "Exact 2-sentence golden script the student should say aloud in front of the real jury"
}`;

      const llmRes = await callSparkLLM({
        systemPrompt,
        userPrompt: `Judge Question (${judgeRole}): ${judgeQuestion}\n\nProject Context:\n${pitchNotes || problemStatement || 'Hackathon project'}\n\nStudent's Answer:\n${userAnswer}`,
        jsonMode: true,
        temperature: 0.3,
        tier: 'deep',
      });

      const parsed = safeParseJson(llmRes?.text);
      if (!parsed) {
        return NextResponse.json(
          { error: 'Could not grade response right now.', entitlements: quota.entitlements },
          { status: 502 }
        );
      }

      return NextResponse.json({
        success: true,
        grade: parsed,
        tokensUsed: quota.tokensUsed || tokenCost,
        entitlements: quota.entitlements,
      });
    }

    // 7. NEW: 1-Click "Working Starter Repo" Blueprint (Skip first 4 hours of hackathon setup)
    if (action === 'starter_repo') {
      const ps = (problemStatement || pitchNotes || blueprint?.summary || '').trim();
      if (!ps && !repoSnap?.found && !extHackathon?.found) {
        return NextResponse.json(
          { error: 'Describe your hackathon problem statement or paste a Hackathon/Repo link to generate a Working Starter Repo.' },
          { status: 400 }
        );
      }

      const systemPrompt = `You are a Principal Full-Stack Hackathon Architect powered by Gemini 4 Hydrogen.
Generate a **1-Click Working Starter Repo Blueprint** tailored specifically to the team's hackathon problem statement, target hackathon requirements, and stack preference so they skip the first 4 hours of boilerplate setup!

Return ONLY valid JSON:
{
  "projectName": "kebab-case-project-name",
  "stackSummary": "e.g. Next.js 14 App Router + Supabase Postgres + Tailwind + Gemini API",
  "setupMinutesSaved": "~4.5 hours saved",
  "folderTree": "src/\n  app/\n    page.tsx\n    api/core/route.ts\n  lib/db.ts\nschema.sql\n.env.example\npackage.json",
  "quickStartCmd": "npm install && npm run dev",
  "envExample": "# Required environment variables\nNEXT_PUBLIC_APP_URL=http://localhost:3000\nDATABASE_URL=...",
  "schemaSql": "-- Working PostgreSQL CREATE TABLE statements ready to run",
  "files": [
    {
      "path": "package.json",
      "language": "json",
      "purpose": "Dependencies & scripts",
      "code": "{ ... }"
    },
    {
      "path": "src/lib/db.ts",
      "language": "typescript",
      "purpose": "Database / service client helper",
      "code": "// complete runnable code"
    },
    {
      "path": "src/app/api/core/route.ts",
      "language": "typescript",
      "purpose": "Primary backend API endpoint for this exact problem statement",
      "code": "// complete Next.js route handler"
    },
    {
      "path": "src/app/page.tsx",
      "language": "tsx",
      "purpose": "Interactive starter UI wired to /api/core",
      "code": "// complete React client component"
    }
  ]
}
Write REAL, clean, syntax-valid code in every file inside "files" tailored to their exact problem statement (never "TODO" stubs).`;

      const userPromptParts = [
        hackathonCtx || 'Target Hackathon: Collegiate Hackathon',
        repoSnap?.found ? `\nREFERENCE GITHUB SCAN:\n${repoSnap.summaryText}` : '',
        ps ? `\nPROBLEM STATEMENT / IDEA:\n${ps}` : '',
        stackPreference ? `\nPREFERRED TEAM STACK:\n${stackPreference}` : '',
        blueprint ? `\nBlueprint Tech Stack: ${(blueprint.technologies || []).join(', ')}` : '',
      ].filter(Boolean);

      const llmRes = await callSparkLLM({
        systemPrompt,
        userPrompt: userPromptParts.join('\n'),
        jsonMode: true,
        temperature: 0.35,
        tier: 'deep',
      });

      const parsed = safeParseJson(llmRes?.text);
      if (!parsed || !Array.isArray(parsed.files)) {
        return NextResponse.json(
          { error: 'Could not generate Working Starter Repo right now.', entitlements: quota.entitlements },
          { status: 502 }
        );
      }

      return NextResponse.json({
        success: true,
        starterRepo: parsed,
        repoScanned,
        tokensUsed: quota.tokensUsed || tokenCost,
        entitlements: quota.entitlements,
        engine: llmRes?.engine || 'KΛ-Pro',
      });
    }

    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Hackathon Sprint Kit failed.' }, { status: 500 });
  }
}
