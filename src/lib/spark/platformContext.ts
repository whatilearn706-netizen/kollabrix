import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured, DEFAULT_SUPABASE_URL } from '@/lib/supabase/isConfigured';
import { DEFAULT_SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase/serviceKey';
import { getMasterControlSubkey } from '@/lib/admin/masterConfigStorage';
import { CURATED_ICPC_CONTESTS } from '@/data/mockIcpcContests';
import { DEFAULT_LEADERBOARD_COLLEGES, CollegeLeaderboardItem, CampusDeadlineItem } from '@/types/communityFeatures';
import { DEFAULT_CAMPUS_WAR_CONFIG, CampusWarConfig } from '@/types/campusWar';
import { STARTER_KITS } from '@/data/starterKits';
import { STUDENT_PERKS } from '@/data/studentPerks';
import { IcpcContest } from '@/types/icpc';
import { CODEX_LANGUAGE_TRACKS, CODEX_BOOKS, CODEX_PATTERNS } from '@/data/codexCatalog';
import { ALL_FOLIO_BOOK_VOLUMES } from '@/data/kaAllBooks';
import { DEFAULT_CURRICULA } from '@/data/defaultCurriculum';
import { getBuilderMemoryWithArena, formatBuilderMemoryPrompt } from '@/lib/spark/builderMemory';

function getServiceClient() {
  if (!isSupabaseConfigured()) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, { auth: { persistSession: false } });
}

const KOLLABRIX_PLATFORM_MAP = `UNIFIED 3-WEBSITE ECOSYSTEM MAP (Kollabrix + KΛ AI + KΛ FOLIO — All 3 Sites Share One Live Database):
1. **KOLLABRIX (Main Collegiate Network — \`https://www.kollabrix.in\`)**:
   - **Explore Projects** ([Explore](/explore)) & **Create Project** ([Create Project](/projects/new)): Discover open student engineering projects by stack/category/role, view open team slots, apply to squads, or publish your own project.
   - **My Projects & Squad Workspaces** ([My Projects](/my-projects)) & **Applications** ([My Applications](/my-applications)): Manage active projects, track join applications (Pending/Accepted/Rejected), sync GitHub commits, coordinate tasks/milestones, receive mentoring notes, and claim verified project certificates.
   - **Hackathons** ([Hackathons](/hackathons)) & **Host Hackathon** ([Host Hackathon](/hackathons/new)): Browse live/upcoming collegiate & sponsored hackathons with prize pools, themes, and registration deadlines, register a team, or host a campus hackathon.
   - **Find Teammates** ([Teammates](/teammates)): Filter verified college developers, AI/ML engineers, backend builders, and UI/UX designers by skills, roles, and campus; view builder profiles at \`/profile/[username]\` or \`/p/[username]\`.
   - **KΛ ARENA** ([KΛ ARENA](/arena)): Real-time 1v1 & 2v2 coding duels (Quick Blitz 3m/5m/10m, 60s Bug Hunt, Web Pixel Clash, Custom Private Rooms) across Python, C++, Java, HTML/CSS/JS with ELO ratings, 1,020 verified challenges, and live rival Fog-of-War.
   - **Practice IDE** ([Practice IDE](/icpc)): LeetCode/ICPC-style DSA & Placement OA problem sets (Amazon, TCS, ICPC) running on Kollabrix's private multi-core compiler with sample & hidden testcases, streaks, and cross-device progress sync.
   - **Campus War** ([Campus War](/war)) & **College Leaderboard** ([Leaderboard](/leaderboard)): Inter-college team matches, war bounties across Arena/Hackathons/Problems/ICPC, and live national collegiate rankings.
   - **Faculty Problem Bank** ([Problem Bank](/problems)), **Post Problem** ([Post Problem](/problems/new)) & **Faculty Portal** ([Faculty Dashboard](/teacher/dashboard)): Real-world engineering challenges posted by professors & mentors where squads submit solutions and receive faculty feedback.
   - **Deadlines Countdown** ([Deadlines](/deadlines)), **Builder Passport** ([Passport](/passport)), **AI Project Planner** ([Planner](/planner)), **College Analytics** ([Analytics](/analytics)), **Starter Kits** ([Starter Kits](/starter-kits)), & **Student Perks** ([Perks](/perks)).

2. **KΛ ΛI (Autonomous Engineering AI — \`https://ai.kollabrix.in\` / [KΛ ΛI](/ka-ai))**:
   - **KΛ-1 & KΛ-Pro Chat**: Live ecosystem-aware AI copilot with **Personal Builder Memory** (remembers user's stack, weak DSA patterns, Arena ELO) and **Sketch/Screenshot-to-Working-App** (Architecture Diagram + SQL + React/API code).
   - **Code Sandbox**: Write, run, and auto-verify/auto-heal code against Judge0 testcases.
   - **DSA & Placements Coach**: Pattern-based OA & interview prep linked directly to Practice IDE & KΛ ARENA.
   - **Hackathon Studio (Hackathon Pass)**: Bespoke 7-Slide \`.pptx\` Deck Generator (with Repeat / New Design), **AI Jury Roast & Live Q&A Simulator**, **1-Click Working Starter Repo Blueprint**, Cut-List, 2-Min Demo Timer, and Squad Match.

3. **KΛ FOLIO (Dark-Luxury Coding Library & Goal-Based Book Decision Engine — \`https://folio.kollabrix.in\` / [KΛ FOLIO](/ka-codex) & [Resources Studio](/resources))**:
   - **33 Curated Coding Books & 4th-Year Core CS Volumes (Beginner → Core → Pro)**:
     - **Java**: *Head First Java* (Beginner), *Core Java Vol. I* (Core), *Effective Java* (Pro), *Java Concurrency in Practice* (Pro).
     - **CSS & Frontend**: *HTML & CSS (Jon Duckett)* (Beginner), *CSS: The Definitive Guide* (Core), *CSS Secrets* (Pro).
     - **JavaScript & TypeScript**: *Eloquent JavaScript* (Beginner), *You Don't Know JS Yet* (Core), *Effective TypeScript* (Pro).
     - **Python & 4th-Year AI/ML**: *Python Crash Course* (Beginner), *Fluent Python* (Core), *Hands-On Machine Learning* (Pro/4th Year), *Designing Machine Learning Systems* (Pro/4th Year).
     - **C & C++**: *The C Programming Language (K&R)* (Beginner), *Programming: Principles & Practice Using C++* (Beginner), *Effective Modern C++* (Core), *Competitive Programmer's Handbook* (Pro).
     - **4th-Year Core CS (OS, DBMS, CN, System Design)**: *Operating Systems: Three Easy Pieces (OSTEP)*, *Database Internals*, *Computer Networking: A Top-Down Approach (Kurose & Ross)*, *System Design Interview (Alex Xu)*, *Designing Data-Intensive Applications (DDIA)*.
     - **Algorithms, Craft & Interviews**: *Grokking Algorithms*, *CLRS*, *Cracking the Coding Interview (CTCI)*, *Clean Code*, *The Pragmatic Programmer*, *Refactoring*, *Design Patterns (GoF)*, *Clean Architecture*, *Code Complete*, *SICP*.
     - Every single book comes with a **KΛ Mentor Prescription** ("Use This Book If...", "Skip It For Now If...", "The Only Chapters You Actually Need (80/20 Rule)"), Hackathon Weapons, FAANG Interview Flashcards, and runnable Judge0 code sandboxes!
   - **Full Language Video & Practice Tracks**: Java, C++, Python, TypeScript/Next.js, Web Dev, DSA & System Design — beginner to pro topics, curated YouTube masterclasses, 10 practice questions per topic with toggleable hints, and live sandbox verification.
   - **Problem-Solving & OA Playbooks**: Sliding Window, Two Pointers, Dynamic Programming, Graphs, Binary Search, etc.`;

const RESPONSE_BEHAVIOR_RULES = `UNIFIED 3-WEBSITE INTELLIGENCE & LIVE SYNC RULES:
1. **Always-Current Shared Brain (Kollabrix + KΛ AI + KΛ FOLIO)**:
   - Every section of LIVE DATA below was queried **fresh from the shared production database right now** for this exact message.
   - Any new user who signs up, any new project/hackathon/problem posted, or any new curriculum/topic/video added to KΛ FOLIO is automatically reflected in the live data below.
   - When the user asks about ANY of the 3 websites (e.g., asking about KΛ FOLIO books/tracks while on KΛ AI, or asking about Kollabrix teammates/hackathons while on KΛ FOLIO, or asking "who joined recently?" / "what's live?"), answer accurately using the live data for that website and include clickable Markdown links (e.g. [Open DDIA in KΛ FOLIO](/resources?section=books&book=ddia), [Browse Hackathons](/hackathons), [Open KΛ ΛI](/ka-ai)).
   - Never suggest third-party competitors (Devpost, Unstop, LeetCode, Discord, Udemy/Coursera) when Kollabrix, KΛ AI, or KΛ FOLIO already provides that exact resource or workflow.
   - Never invent fake projects, fake deadlines, fake usernames, or non-existent routes.
2. **Coding, DSA, Architecture & General Questions**:
   - Always give a **complete, accurate, direct answer** to the user's actual question FIRST.
   - Whenever the topic involves a programming language, DSA pattern (e.g., Sliding Window, DP, Graphs, Binary Search), or System Design, attach a crisp **"Connected Ecosystem Next Steps"** section pointing to the exact matching KΛ FOLIO track/book/pattern ([Watch / Read in KΛ FOLIO](/resources)), [Practice IDE](/icpc), or [KΛ ARENA](/arena).
   - If the user attaches a sketch, whiteboard photo, Figma UI screenshot, or assignment PDF, output a complete structured build response: 1) Architecture Diagram (\`\`\`mermaid\`), 2) Database SQL Schema (\`\`\`sql\`), and 3) Production-ready React/API code (\`\`\`tsx / \`\`\`ts).`;

/**
 * Fetches fresh, real-time data from Supabase & Master Control based on prompt intent
 * so KΛ-1 / KΛ-Pro reflects live website state AND handles any general or platform question cleanly.
 */
export async function buildKollabrixLiveContext(
  userMessage: string,
  userId?: string | null
): Promise<string> {
  const lower = userMessage.toLowerCase();

  const isAboutWebsite =
    /\b(kollabrix|website|websites|site|sites|platform|platforms|feature|features|how do i|how to use|where can i|what can you do|what all|everything|walkthrough|guide|help me navigate|what is live|available here|what's new|whats new|latest|recent|update|updates|changed|changes|joined|who all|how many|stats|ka ai|ka folio|folio|codex)\b/.test(
      lower
    );

  const wantsProjects =
    isAboutWebsite ||
    /\b(explore|project|projects|idea|ideas|startup|build|app|team slot|open role|collaborat|workspace|workspaces|kanban|application|apply|certificate|planner)\b/.test(
      lower
    );

  const wantsHackathons =
    isAboutWebsite ||
    /\b(hackathon|hackathons|competition|contest|prize|sih|deadline|deadlines|countdown|register|host|event|events|calendar)\b/.test(
      lower
    );

  const wantsTeammates =
    isAboutWebsite ||
    /\b(user|users|people|teammate|teammates|squad|partner|member|members|developer|designer|coder|student|campus|profile|passport|verify|react|python|ml|ai|backend|frontend|figma|java|node|next\.?js|typescript)\b/.test(
      lower
    );

  const wantsProblems =
    isAboutWebsite ||
    /\b(problem|problems|faculty|teacher|professor|mentor|challenge|challenges|assignment|statement|bounty)\b/.test(
      lower
    );

  const wantsArenaOrPractice =
    isAboutWebsite ||
    /\b(arena|battle|duel|1v1|2v2|icpc|practice|ide|dsa|oa|placement|amazon|tcs|blitz|bug hunt|pixel clash|elo|coding test|leetcode)\b/.test(
      lower
    );

  const wantsLeaderboardOrWar =
    isAboutWebsite ||
    /\b(war|campus war|leaderboard|rank|ranking|rankings|college|colleges|top campus|points|standing|standings)\b/.test(
      lower
    );

  const wantsPerksOrKits =
    isAboutWebsite ||
    /\b(perk|perks|credit|credits|swag|free|github student|starter|template|templates|boilerplate|kit|kits|resource|resources|learn|curriculum|curricula|course|tutorial|book|books|read|chapter|chapters|80\/20|4th year|fourth year|os|operating system|ostep|dbms|database|networks|networking|kurose|ml|machine learning|css|html|duckett|verou|javascript|eloquent|ydkjs|folio|codex|ddia|clrs|sicp|ctci|clean code|refactoring|java|core java|head first|concurrency|c\+\+|cpp|python|fluent|typescript|next\.?js|system design|alex xu|sliding window|dynamic programming|dp|bfs|graph|trees|handbook|manual|notes|video|videos|topic|topics|beginner|pro)\b/.test(
      lower
    );

  const wantsAiOrGemini =
    isAboutWebsite ||
    /\b(ka ai|ka-1|ka-pro|gemini|hydrogen|llm|model|models|ai|spark|pptx|ppt|deck|jury|roast|starter repo|sandbox|auto-heal|memory|pass|hackathon pass|pro builder|subscription|price|pricing|token|tokens|quota)\b/.test(
      lower
    );

  // Load Personal Builder Memory + Arena Telemetry on every prompt
  const builderMemPromise = userId ? getBuilderMemoryWithArena(userId) : Promise.resolve(null);

  const client = getServiceClient();
  const sections: string[] = [
    KOLLABRIX_PLATFORM_MAP,
    `LIVE SYNC TIMESTAMP: ${new Date().toISOString()}`,
  ];
  if (wantsAiOrGemini) {
    sections.push(`KΛ ΛI & GEMINI ARCHITECTURE KNOWLEDGE BASE ([Open KΛ ΛI](/ka-ai) · \`https://ai.kollabrix.in\`):
- **Dual Model Architecture (Powered by Google Gemini)**:
  - **KΛ-1 (Fast Tier)**: Ultra-low-latency Gemini Flash model optimized for instant coding help, DSA explanations, KΛ FOLIO lookups, and live Kollabrix telemetry.
  - **KΛ-Pro (Deep Reasoning Tier)**: High-capacity Gemini Pro / Hydrogen model used for complex system architecture, deep multi-file code debugging, Sketch-to-Working-App vision parsing, Jury Roast simulations, and bespoke 7-slide \`.pptx\` pitch deck generation.
- **KΛ AI Exclusive Ecosystem Weapons (What ChatGPT/Claude Cannot Do)**:
  1. **Judge0 Auto-Verify & Auto-Heal Loop**: Silently compiles and tests code in Kollabrix's Judge0 sandbox; if tests fail or TLE, KΛ AI reads the real stderr/compile error and patches the code automatically.
  2. **Personal Builder Memory**: Persists user's preferred stack (e.g., Next.js + Java + Postgres), weak DSA patterns, and real KΛ ARENA ELO/loss history so every response adapts automatically.
  3. **Sketch / Screenshot-to-Working-App**: Upload a whiteboard photo, Figma mockup, or assignment PDF → outputs Mermaid architecture diagram + PostgreSQL SQL schema + React/API code.
  4. **Hackathon Studio & Hackathon Pass (₹49 / 7 days)**:
     - **Bespoke 7-Slide \`.pptx\` Generator**: Reads hackathon link, GitHub repo, and problem statement to generate custom themed decks with a **Repeat / New Design** button for fresh layouts & backgrounds.
     - **AI Jury Roast & Live Q&A Simulator**: Acts as 3 strict judges (Technical Architect, Product Lead, Business Judge), firing cross-questions and grading answers.
     - **1-Click Working Starter Repo Blueprint**: Generates folder structure, \`.env.example\`, database SQL, and boilerplate API/UI.
     - **Cut-List, 2-Min Demo Timer, & Squad Match**: Live teammate matching on Kollabrix.
  5. **Unified 3-Website Live Sync**: Shares one live Supabase database across Kollabrix (\`kollabrix.in\`), KΛ AI (\`ai.kollabrix.in\`), and KΛ FOLIO (\`folio.kollabrix.in\`).`);
  }
  const tasks: Promise<void>[] = [];

  tasks.push(
    builderMemPromise.then((memData) => {
      if (memData) {
        const block = formatBuilderMemoryPrompt(memData.memory, memData.arenaStats);
        if (block) sections.push(block);
      }
    })
  );

  // Always-On Live User & Builder Pulse across all 3 platforms (total count + newest signups)
  if (client) {
    tasks.push(
      (async () => {
        try {
          const [{ count: totalUsers }, { data: newestUsers }] = await Promise.all([
            client.from('profiles').select('user_id', { count: 'exact', head: true }),
            client
              .from('profiles')
              .select('user_id, username, display_name, college, course, skills, created_at')
              .order('created_at', { ascending: false })
              .limit(5),
          ]);
          const userLines = (newestUsers || [])
            .filter((u) => u.display_name || u.username)
            .map((u) => {
              const slug = u.username || u.user_id;
              const skills = Array.isArray(u.skills) && u.skills.length ? u.skills.slice(0, 4).join(', ') : 'Builder';
              return `- [${u.display_name || u.username}](/profile/${slug}) | ${u.college || 'Collegiate Network'} | Skills: ${skills}`;
            });
          sections.push(
            `LIVE ECOSYSTEM USER PULSE (Total Registered Builders: ${totalUsers ?? 'Live'}):\nNewest Builders Joined:\n${
              userLines.join('\n') || '- Active builders online'
            }`
          );
        } catch {}
      })()
    );
  }

  // 0. Logged-in user's personal profile
  if (client && userId) {
    tasks.push(
      (async () => {
        try {
          const { data: me } = await client
            .from('profiles')
            .select('display_name, college, course, academic_year, skills, preferred_roles')
            .eq('user_id', userId)
            .maybeSingle();
          if (me) {
            sections.push(
              `CURRENT SIGNED-IN USER PROFILE:\n- Name: ${me.display_name || 'Student'} | College: ${
                me.college || 'Unspecified'
              } | Course: ${me.course || ''} ${me.academic_year || ''}\n- Skills: ${
                Array.isArray(me.skills) && me.skills.length ? me.skills.join(', ') : 'None listed'
              }\n- Preferred Roles: ${
                Array.isArray(me.preferred_roles) && me.preferred_roles.length
                  ? me.preferred_roles.join(', ')
                  : 'None listed'
              }`
            );
          }
        } catch {}
      })()
    );
  }

  // 1. Live Explore Projects
  if (client && wantsProjects) {
    tasks.push(
      (async () => {
        try {
          const { data: projects } = await client
            .from('projects')
            .select(
              'id, title, summary, category, difficulty, technologies, required_skills, desired_roles, current_team_size, desired_team_size, status, created_at'
            )
            .neq('status', 'archived')
            .order('created_at', { ascending: false })
            .limit(8);

          if (projects && projects.length > 0) {
            const lines = projects.map((p) => {
              const tech = Array.isArray(p.technologies)
                ? p.technologies.slice(0, 4).join(', ')
                : Array.isArray(p.required_skills)
                ? p.required_skills.slice(0, 4).join(', ')
                : 'General';
              const roles =
                Array.isArray(p.desired_roles) && p.desired_roles.length
                  ? p.desired_roles.slice(0, 3).join(', ')
                  : 'Collaborators';
              const slots = `${p.current_team_size || 1}/${p.desired_team_size || 4} members`;
              return `- [${p.title}](/projects/${p.id}) | Status: ${p.status || 'open'} | Category: ${
                p.category || 'Tech'
              } | Stack: ${tech} | Seeking: ${roles} (${slots})${
                p.summary ? ` — ${p.summary.slice(0, 100)}` : ''
              }`;
            });
            sections.push(`LIVE PROJECTS ON EXPLORE RIGHT NOW (${projects.length} latest):\n${lines.join('\n')}`);
          } else {
            sections.push('LIVE PROJECTS ON EXPLORE RIGHT NOW: No open projects currently listed.');
          }
        } catch {}
      })()
    );
  }

  // 2. Live Hackathons & Deadlines
  if (client && wantsHackathons) {
    tasks.push(
      (async () => {
        try {
          const { data: hackathons } = await client
            .from('hackathons')
            .select(
              'id, title, organizer, mode, location, start_date, end_date, registration_deadline, prize_pool, themes, status'
            )
            .order('created_at', { ascending: false })
            .limit(8);

          if (hackathons && hackathons.length > 0) {
            const lines = hackathons.map((h) => {
              const themes =
                Array.isArray(h.themes) && h.themes.length ? h.themes.slice(0, 3).join(', ') : 'Open Innovation';
              return `- [${h.title}](/hackathons/${h.id}) | Status: ${h.status || 'live'} | Organizer: ${
                h.organizer || 'Kollabrix'
              } (${h.mode || 'Online'}${h.location ? ` · ${h.location}` : ''}) | Prize Pool: ${
                h.prize_pool || 'TBD'
              } | Deadline: ${h.registration_deadline || h.end_date || 'Open'} | Themes: ${themes}`;
            });
            sections.push(`LIVE HACKATHONS ON KOLLABRIX RIGHT NOW (${hackathons.length}):\n${lines.join('\n')}`);
          }

          const customDeadlines = await getMasterControlSubkey<CampusDeadlineItem[] | null>('deadlines', null);
          if (Array.isArray(customDeadlines) && customDeadlines.length > 0) {
            const dlLines = customDeadlines.slice(0, 5).map(
              (d) => `- [${d.title}](/deadlines) | Type: ${d.type} | Organizer: ${d.organizer} | Due: ${d.deadlineDate}`
            );
            sections.push(`UPCOMING TRACKED DEADLINES (/deadlines):\n${dlLines.join('\n')}`);
          }
        } catch {}
      })()
    );
  }

  // 3. Live Teammates / Profiles
  if (client && wantsTeammates) {
    tasks.push(
      (async () => {
        try {
          const { data: profiles } = await client
            .from('profiles')
            .select('user_id, username, display_name, college, course, skills, preferred_roles')
            .eq('status', 'active')
            .limit(40);

          if (profiles && profiles.length > 0) {
            const queryTokens = lower.split(/[\s,?.!]+/).filter((w) => w.length >= 2);
            const ranked = profiles
              .filter((p) => p.user_id !== userId && (p.display_name || p.username))
              .map((p) => {
                const pSkills: string[] = Array.isArray(p.skills) ? p.skills : [];
                const pRoles: string[] = Array.isArray(p.preferred_roles) ? p.preferred_roles : [];
                const haystack = `${pSkills.join(' ')} ${pRoles.join(' ')} ${p.college || ''} ${p.course || ''}`.toLowerCase();
                let score = pSkills.length > 0 ? 1 : 0;
                for (const tok of queryTokens) {
                  if (haystack.includes(tok)) score += 5;
                }
                return { p, score, pSkills, pRoles };
              })
              .sort((a, b) => b.score - a.score)
              .slice(0, 6);

            if (ranked.length > 0) {
              const lines = ranked.map(({ p, pSkills, pRoles }) => {
                const slug = p.username || p.user_id;
                return `- [${p.display_name || p.username}](/profile/${slug}) | College: ${
                  p.college || 'Collegiate Network'
                } | Skills: ${pSkills.slice(0, 5).join(', ') || 'General'} | Roles: ${
                  pRoles.slice(0, 3).join(', ') || 'Builder'
                }`;
              });
              sections.push(`ACTIVE TEAMMATES ON KOLLABRIX RIGHT NOW:\n${lines.join('\n')}`);
            }
          }
        } catch {}
      })()
    );
  }

  // 4. Live Faculty Problem Statements
  if (client && wantsProblems) {
    tasks.push(
      (async () => {
        try {
          const { data: problems } = await client
            .from('problem_statements')
            .select('id, title, category, difficulty, required_skills, status, deadline')
            .neq('status', 'Archived')
            .order('created_at', { ascending: false })
            .limit(6);

          if (problems && problems.length > 0) {
            const lines = problems.map((pr) => {
              const sk = Array.isArray(pr.required_skills) ? pr.required_skills.slice(0, 4).join(', ') : '';
              return `- [${pr.title}](/problems/${pr.id}) | ${pr.category || 'Engineering'} · ${
                pr.difficulty || 'Medium'
              } | Status: ${pr.status || 'Open'}${sk ? ` | Skills: ${sk}` : ''}`;
            });
            sections.push(`LIVE FACULTY PROBLEM STATEMENTS ON KOLLABRIX:\n${lines.join('\n')}`);
          }
        } catch {}
      })()
    );
  }

  // 5. Live Practice IDE (ICPC) & 1v1 Arena
  if (wantsArenaOrPractice) {
    tasks.push(
      (async () => {
        try {
          const icpcData = await getMasterControlSubkey<any>('icpc', { contests: [] });
          const masterContests: IcpcContest[] = Array.isArray(icpcData?.contests) ? icpcData.contests : [];
          const combined = masterContests.length > 0 ? masterContests : CURATED_ICPC_CONTESTS;
          const contestLines = combined.slice(0, 5).map((c) => {
            const probTitles = (c.problems || []).map((p) => p.title).slice(0, 3).join('; ');
            return `- [${c.title}](/icpc) (${c.status} · ${c.durationMinutes}m · ${
              (c.problems || []).length
            } problems: ${probTitles})`;
          });
          sections.push(
            `LIVE PRACTICE IDE CONTESTS (/icpc):\n${contestLines.join('\n')}\n1V1 BATTLE ARENA (/arena): 1,020 verified challenges live across Quick Blitz (3m/5m/10m), 60s Bug Hunt, Web Pixel Clash & Custom Private Rooms (Python, C++, Java, HTML/CSS/JS).`
          );
        } catch {}
      })()
    );
  }

  // 6. Live Collegiate Leaderboard & Campus War
  if (wantsLeaderboardOrWar) {
    tasks.push(
      (async () => {
        try {
          let colleges: CollegeLeaderboardItem[] = [...DEFAULT_LEADERBOARD_COLLEGES];
          if (client) {
            const { data: row } = await client
              .from('platform_settings')
              .select('value')
              .eq('key', 'linkora_leaderboard_v1')
              .maybeSingle();
            if (row && Array.isArray(row.value) && row.value.length > 0) {
              colleges = row.value;
            }
          }
          const topColleges = [...colleges]
            .sort((a, b) => (b.points || 0) - (a.points || 0))
            .slice(0, 5)
            .map(
              (c, i) =>
                `- #${i + 1} ${c.name} (${c.shortCode}) — ${c.points} pts · ${c.activeBuilders || 0} builders · ${
                  c.hackathonWins || 0
                } hackathon wins`
            );

          const warCfg =
            (await getMasterControlSubkey<CampusWarConfig | null>('campus_war_hub_config', null)) ||
            DEFAULT_CAMPUS_WAR_CONFIG;
          const warMatches = (Array.isArray(warCfg.matches) ? warCfg.matches : DEFAULT_CAMPUS_WAR_CONFIG.matches)
            .slice(0, 4)
            .map(
              (m) =>
                `- [${m.title}](${m.actionUrl || '/war'}) | ${m.challengerCollege} vs ${m.targetCollege} | ${m.stakes} (${m.status})`
            );

          sections.push(
            `TOP COLLEGES ON LEADERBOARD ([Leaderboard](/leaderboard)):\n${topColleges.join(
              '\n'
            )}\nACTIVE CAMPUS WAR CHALLENGES ([Campus War](/war)):\n${warMatches.join('\n')}`
          );
        } catch {}
      })()
    );
  }

  // 7. Live Starter Kits, Student Perks & Dynamic KΛ FOLIO Library (Tracks, Curricula, 12 Books, Patterns)
  if (wantsPerksOrKits || wantsArenaOrPractice) {
    tasks.push(
      (async () => {
        try {
          let activeCurricula: Record<string, any> = { ...DEFAULT_CURRICULA };
          if (client) {
            const { data: settingsRows } = await client
              .from('platform_settings')
              .select('key, value')
              .in('key', ['campus_curricula_registry', 'deleted_curricula_ids']);
            let deletedIds = new Set<string>();
            for (const row of settingsRows || []) {
              if (row.key === 'deleted_curricula_ids' && Array.isArray(row.value)) {
                deletedIds = new Set(row.value);
              } else if (row.key === 'campus_curricula_registry' && row.value && typeof row.value === 'object') {
                activeCurricula = { ...activeCurricula, ...row.value };
              }
            }
            deletedIds.forEach((delId) => {
              delete activeCurricula[delId];
            });
          }

          const dynamicCurriculaLines = Object.entries(activeCurricula)
            .slice(0, 12)
            .map(([id, c]: [string, any]) => {
              const stepsCount = Array.isArray(c?.steps) ? c.steps.length : 0;
              const videoCount = Array.isArray(c?.steps)
                ? c.steps.reduce((acc: number, s: any) => acc + (Array.isArray(s?.videos) ? s.videos.length : 0), 0)
                : 0;
              const qCount = Array.isArray(c?.steps)
                ? c.steps.reduce(
                    (acc: number, s: any) => acc + (Array.isArray(s?.practiceQuestions) ? s.practiceQuestions.length : 0),
                    0
                  )
                : 0;
              return `- [${c?.title || id}](/resources) (${c?.level || 'All Levels'}) — ${stepsCount} topics, ${videoCount} videos, ${qCount} practice Qs`;
            });

          const kitLines = STARTER_KITS.slice(0, 4).map(
            (k) => `- ${k.title} (${k.difficulty} · ${k.techStack.slice(0, 3).join(', ')})`
          );
          const perkLines = STUDENT_PERKS.slice(0, 4).map((p) => `- ${p.title} (${p.value}) — ${p.provider}`);
          const trackLines = CODEX_LANGUAGE_TRACKS.map(
            (t) => `- [${t.title}](/resources) (${t.subtitle})`
          );
          const allBookLines = [
            ...ALL_FOLIO_BOOK_VOLUMES.map(
              (b) =>
                `- [${b.title}](/resources?section=books&book=${encodeURIComponent(b.id)}) [${b.level || 'Core'} · ${b.languageGroup || b.languageTag}] — ${b.spotlightAuthor} | 80/20 Rule: ${b.mentorGuide?.onlyChaptersYouNeed || b.subtitle}`
            ),
            ...CODEX_BOOKS.slice(0, 4).map((b) => `- [${b.title}](/resources) — ${b.subtitle}`),
          ];

          // Deep context for any specific books matching user's prompt
          const promptTokens = lower.split(/[\s,?.!:/-]+/).filter((w) => w.length >= 2);
          const matchedBooks = ALL_FOLIO_BOOK_VOLUMES.filter((b) => {
            const hay = `${b.id} ${b.title} ${b.spotlightAuthor} ${b.languageGroup || ''} ${b.level || ''} ${b.mentorGuide?.goalTags?.join(' ') || ''}`.toLowerCase();
            return promptTokens.some((tok) => hay.includes(tok));
          }).slice(0, 5);

          const matchedBookDetails =
            matchedBooks.length > 0
              ? `\n\nDETAILED 80/20 BOOK MENTOR GUIDES FOR USER'S QUERY:\n${matchedBooks
                  .map(
                    (b) =>
                      `### ${b.title} ([Open in KΛ FOLIO](/resources?section=books&book=${encodeURIComponent(b.id)}))\n- Level: ${b.level} | Track: ${b.languageGroup}\n- Use When: ${b.mentorGuide?.useWhen}\n- Skip When: ${b.mentorGuide?.skipWhen}\n- Only Chapters You Need (80/20): ${b.mentorGuide?.onlyChaptersYouNeed}\n- Key Modules: ${b.chapters.map((c) => `${c.realChapterLabel || ''} ${c.title}: ${c.overview}`).join(' | ')}`
                  )
                  .join('\n\n')}`
              : '';

          const patternLines = CODEX_PATTERNS.map(
            (p) => `- [${p.title}](/resources) — ${p.subtitle}`
          );

          sections.push(
            `KΛ FOLIO LIVE CODING LIBRARY ([Open KΛ FOLIO](/ka-codex) · [Interactive Resources Studio](/resources)):\nDynamic Language Curricula (Live from DB):\n${dynamicCurriculaLines.join(
              '\n'
            )}\n\nGuided Tracks:\n${trackLines.join(
              '\n'
            )}\n\nComplete 33-Book Library & 80/20 Guides (Java, CSS, JS/TS, Python/AI-ML, C/C++, 4th-Year OS/DBMS/CN/System Design):\n${allBookLines.join(
              '\n'
            )}${matchedBookDetails}\n\nProblem-Solving Patterns:\n${patternLines.join(
              '\n'
            )}\n\nAVAILABLE STARTER KITS ([Starter Kits](/starter-kits)):\n${kitLines.join(
              '\n'
            )}\nSTUDENT PERKS VAULT ([Perks](/perks)):\n${perkLines.join('\n')}`
          );
        } catch {}
      })()
    );
  }

  await Promise.all(tasks);

  sections.push(RESPONSE_BEHAVIOR_RULES);
  return sections.join('\n\n');
}
