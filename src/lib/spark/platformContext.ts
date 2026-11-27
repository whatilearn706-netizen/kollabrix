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
import { KA_CODEX_BOOKS } from '@/data/kaCodexBooks';
import { getBuilderMemoryWithArena, formatBuilderMemoryPrompt } from '@/lib/spark/builderMemory';

function getServiceClient() {
  if (!isSupabaseConfigured()) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, { auth: { persistSession: false } });
}

const KOLLABRIX_PLATFORM_MAP = `KOLLABRIX FULL WEBSITE & FEATURE MAP (Real Live Features Users Can Open & Use):
- **Explore Projects** ([Explore](/explore)) & **Create Project** ([Create Project](/projects/new)): Discover open student engineering projects by stack/category/role, view open team slots, apply to squads, or publish your own project.
- **My Projects & Squad Workspaces** ([My Projects](/my-projects)) & **Applications** ([My Applications](/my-applications)): Manage active projects, track join applications (Pending/Accepted/Rejected), sync GitHub commits, coordinate tasks/milestones, receive mentoring notes, and claim verified project certificates.
- **Hackathons** ([Hackathons](/hackathons)) & **Host Hackathon** ([Host Hackathon](/hackathons/new)): Browse live/upcoming collegiate & sponsored hackathons with prize pools, themes, and registration deadlines, register a team, or host a campus hackathon.
- **Find Teammates** ([Teammates](/teammates)): Filter verified college developers, AI/ML engineers, backend builders, and UI/UX designers by skills, roles, and campus; view builder profiles at \`/profile/[username]\` or \`/p/[username]\`.
- **1v1 Battle Arena** ([1v1 Battle Arena](/arena)): Real-time 1v1 & 2v2 coding duels (Quick Blitz 3m/5m/10m, 60s Bug Hunt, Web Pixel Clash, Custom Private Rooms) across Python, C++, Java, HTML/CSS/JS with ELO ratings, 1,020 verified challenges, and live rival Fog-of-War.
- **Practice IDE** ([Practice IDE](/icpc)): LeetCode/ICPC-style DSA & Placement OA problem sets (Amazon, TCS, ICPC) running on Kollabrix's private multi-core compiler with sample & hidden testcases, streaks, and cross-device progress sync.
- **Campus War** ([Campus War](/war)) & **College Leaderboard** ([Leaderboard](/leaderboard)): Inter-college team matches, war bounties across Arena/Hackathons/Problems/ICPC, and live national collegiate rankings.
- **Faculty Problem Bank** ([Problem Bank](/problems)), **Post Problem** ([Post Problem](/problems/new)) & **Faculty Portal** ([Faculty Dashboard](/teacher/dashboard)): Real-world engineering challenges posted by professors & mentors where squads submit solutions and receive faculty feedback.
- **Deadlines Countdown** ([Deadlines](/deadlines)): Live countdown calendar aggregating hackathons, ICPC contests, and campus submission deadlines.
- **Builder Passport** ([Passport](/passport)): Holographic Verified Developer Passport & Flight Recorder skill proofs verifiable at \`/verify/[id]\`.
- **KΛ FOLIO — Coding Library & Guided Tracks** ([KΛ FOLIO](/ka-codex) & [Resources Studio](/resources)): Video language tracks (Java Mastery, C++ & STL Speedrun, Python Engineering, TypeScript & Next.js, DSA & System Design), 12 curated engineering books (DDIA, Clean Code, Pragmatic Programmer, SICP, Java Field Manual, C++ Handbook, System Design Vol. 1, etc.), and interactive step-by-step pattern tracks.
- **Starter Kits** ([Starter Kits](/starter-kits)), **Student Perks** ([Perks](/perks)) & **Resources** ([KΛ FOLIO Resources](/resources)): 1-click full-stack/AI hackathon templates, free student developer credits (GitHub Student Pack, cloud/dev tools), and structured coding curriculum tracks.
- **AI Project Planner** ([Planner](/planner)) & **College Analytics** ([Analytics](/analytics)): Break projects into AI sprints/milestones and inspect institutional campus metrics.
- **KΛ ΛI & Studios** ([KΛ ΛI](/spark)): **KΛ-1** (fast answers & live site intelligence), **KΛ-Pro** (deep reasoning & architecture), plus sidebar modes for **Code Sandbox**, **DSA & Placements**, and **Hackathon Studio**.`;

const RESPONSE_BEHAVIOR_RULES = `BEHAVIOR FOR WEBSITE QUESTIONS, KΛ FOLIO, ARENA & OTHER QUESTIONS:
1. **Interconnected Ecosystem (Kollabrix + KΛ AI + KΛ FOLIO + Battle Arena)**:
   - When the user asks about Kollabrix features, projects, hackathons, teammates, duels, contests, leaderboard, deadlines, perks, starter kits, OR learning resources/books/tracks on KΛ FOLIO: answer directly using **real features and LIVE DATA below** with clickable Markdown links like [Title](/route) or [Open in KΛ FOLIO](/resources).
   - Never suggest third-party competitors (Devpost, Unstop, LeetCode, Discord, external Udemy/Coursera) when Kollabrix or KΛ FOLIO already provides that exact resource or workflow.
   - Never invent fake projects, fake deadlines, fake usernames, or non-existent routes.
2. **Coding, DSA, Architecture & General Questions**:
   - Always give a **complete, accurate, direct answer** to the user's actual question FIRST.
   - Whenever the topic involves a programming language, DSA pattern (e.g., Sliding Window, DP, Graphs, Binary Search), or System Design, attach a crisp **"Connected Ecosystem Next Steps"** section pointing to the exact matching KΛ FOLIO track/book/pattern ([Watch / Read in KΛ FOLIO](/resources)), [Practice IDE](/icpc), or [1v1 Battle Arena](/arena).
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
    /\b(kollabrix|website|site|platform|feature|features|how do i|how to use|where can i|what can you do|what all|everything|walkthrough|guide|help me navigate|what is live|available here)\b/.test(
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
    /\b(teammate|teammates|squad|partner|member|members|developer|designer|coder|student|campus|profile|passport|verify|react|python|ml|ai|backend|frontend|figma|java|node|next\.?js|typescript)\b/.test(
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
    /\b(perk|perks|credit|credits|swag|free|github student|starter|template|templates|boilerplate|kit|kits|resource|resources|learn|curriculum|course|tutorial|book|books|folio|codex|java|c\+\+|cpp|python|typescript|next\.?js|system design|sliding window|dynamic programming|dp|bfs|graph|trees|handbook|manual|notes|video)\b/.test(
      lower
    );

  // Load Personal Builder Memory + Arena Telemetry even on general/technical prompts
  const builderMemPromise = userId ? getBuilderMemoryWithArena(userId) : Promise.resolve(null);

  // Pure unrelated non-platform prompt still gets Platform Map + Builder Memory + behavior rules
  if (
    !wantsProjects &&
    !wantsHackathons &&
    !wantsTeammates &&
    !wantsProblems &&
    !wantsArenaOrPractice &&
    !wantsLeaderboardOrWar &&
    !wantsPerksOrKits
  ) {
    const memData = await builderMemPromise;
    const memBlock = memData ? formatBuilderMemoryPrompt(memData.memory, memData.arenaStats) : '';
    return [KOLLABRIX_PLATFORM_MAP, memBlock, RESPONSE_BEHAVIOR_RULES].filter(Boolean).join('\n\n');
  }

  const client = getServiceClient();
  const sections: string[] = [KOLLABRIX_PLATFORM_MAP];
  const tasks: Promise<void>[] = [];

  tasks.push(
    builderMemPromise.then((memData) => {
      if (memData) {
        const block = formatBuilderMemoryPrompt(memData.memory, memData.arenaStats);
        if (block) sections.push(block);
      }
    })
  );

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

  // 7. Live Starter Kits, Student Perks & KΛ FOLIO Library (Tracks, Books, Patterns)
  if (wantsPerksOrKits || wantsArenaOrPractice) {
    const kitLines = STARTER_KITS.slice(0, 4).map(
      (k) => `- ${k.title} (${k.difficulty} · ${k.techStack.slice(0, 3).join(', ')})`
    );
    const perkLines = STUDENT_PERKS.slice(0, 4).map((p) => `- ${p.title} (${p.value}) — ${p.provider}`);
    const trackLines = CODEX_LANGUAGE_TRACKS.map(
      (t) => `- [${t.title}](/resources) (${t.subtitle})`
    );
    const allBookLines = [
      ...CODEX_BOOKS.map((b) => `- [${b.title}](/resources) — ${b.subtitle}`),
      ...KA_CODEX_BOOKS.slice(0, 7).map((b) => `- [${b.title}](/resources) (${b.category})`),
    ];
    const patternLines = CODEX_PATTERNS.map(
      (p) => `- [${p.title}](/resources) — ${p.subtitle}`
    );

    sections.push(
      `KΛ FOLIO CODING LIBRARY ([Open KΛ FOLIO](/ka-codex) · [Interactive Resources Studio](/resources)):\nGuided Tracks:\n${trackLines.join(
        '\n'
      )}\nTechnical Booksheet:\n${allBookLines.slice(0, 12).join('\n')}\nProblem-Solving Patterns:\n${patternLines.join(
        '\n'
      )}\n\nAVAILABLE STARTER KITS ([Starter Kits](/starter-kits)):\n${kitLines.join(
        '\n'
      )}\nSTUDENT PERKS VAULT ([Perks](/perks)):\n${perkLines.join('\n')}`
    );
  }

  await Promise.all(tasks);

  sections.push(RESPONSE_BEHAVIOR_RULES);
  return sections.join('\n\n');
}
