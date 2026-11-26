export interface GitHubRepoSnapshot {
  found: boolean;
  isProfileScan?: boolean;
  profileHandle?: string;
  profileRepos?: string[];
  repoName: string;
  language: string;
  stars: number;
  lastCommitMessage: string;
  lastCommitSha: string;
  topFiles: string[];
  allSourcePaths: string[];
  scripts: Record<string, string>;
  dependencies: string[];
  detectedEnvVars: string[];
  detectedUiRoutes: string[];
  signals: {
    hasBackendApi: boolean;
    hasDatabase: boolean;
    hasAiIntegration: boolean;
    hasTests: boolean;
  };
  readmeExcerpt: string;
  codeSnippets: Array<{ path: string; snippet: string }>;
  summaryText: string;
}

const SOURCE_FILE_RE = /\.(ts|tsx|js|jsx|py|go|rs|java|sol|sql|prisma)$/i;
const IGNORE_PATH_RE = /(node_modules|\.next|dist|build|coverage|\.git|lock\.json|\.min\.)/i;

function fetchWithTimeout(url: string, headers: Record<string, string>, ms = 5500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { headers, signal: controller.signal }).finally(() => clearTimeout(timer));
}

/**
 * Inspects a public GitHub repository OR GitHub profile URL (automatically resolving their
 * latest active project repo + profile skills), reading up to 10 key source files, dependencies,
 * UI routes, env variables, and engineering signals so KΛ-Pro / Gemini 4 Hydrogen sees ALL features.
 */
export async function fetchDeepGitHubContext(inputUrl: string): Promise<GitHubRepoSnapshot> {
  const empty: GitHubRepoSnapshot = {
    found: false,
    repoName: '',
    language: '',
    stars: 0,
    lastCommitMessage: '',
    lastCommitSha: '',
    topFiles: [],
    allSourcePaths: [],
    scripts: {},
    dependencies: [],
    detectedEnvVars: [],
    detectedUiRoutes: [],
    signals: {
      hasBackendApi: false,
      hasDatabase: false,
      hasAiIntegration: false,
      hasTests: false,
    },
    readmeExcerpt: '',
    codeSnippets: [],
    summaryText: '',
  };

  const trimmed = (inputUrl || '').trim();
  if (!trimmed) return empty;

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'Kollabrix-KA-Scanner/2.0',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  let owner = '';
  let repo = '';
  let isProfileScan = false;
  let profileSummary = '';
  let profileRepos: string[] = [];

  const repoMatch = trimmed.match(/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)/i);
  if (repoMatch) {
    owner = repoMatch[1];
    repo = repoMatch[2].replace(/\.git$/i, '').split(/[?#]/)[0];
  } else {
    const profileMatch = trimmed.match(/github\.com\/([A-Za-z0-9_.-]+)\/?$/i);
    if (!profileMatch) return empty;
    owner = profileMatch[1];
    isProfileScan = true;

    try {
      const [userRes, reposRes] = await Promise.all([
        fetchWithTimeout(`https://api.github.com/users/${owner}`, headers),
        fetchWithTimeout(`https://api.github.com/users/${owner}/repos?sort=pushed&per_page=6`, headers),
      ]);
      const userObj = userRes.ok ? await userRes.json() : null;
      const reposArr = reposRes.ok ? await reposRes.json() : [];
      if (Array.isArray(reposArr) && reposArr.length > 0) {
        const nonFork = reposArr.filter((r: any) => !r.fork);
        const primary = nonFork[0] || reposArr[0];
        repo = primary.name;
        profileRepos = reposArr.map((r: any) => `${r.name} (${r.language || 'Code'})`);
        profileSummary = `GitHub Profile: @${owner}${userObj?.name ? ` (${userObj.name})` : ''}${
          userObj?.bio ? ` — Bio: ${userObj.bio}` : ''
        }\nRecent Public Repos: ${profileRepos.join(', ')}\nAuto-selected latest repository for deep scan: ${owner}/${repo}`;
      } else {
        return {
          ...empty,
          isProfileScan: true,
          profileHandle: owner,
          summaryText: `GitHub Profile @${owner} found, but no public repositories were detected.`,
        };
      }
    } catch {
      return empty;
    }
  }

  if (!owner || !repo) return empty;

  try {
    const [metaRes, readmeRes, contentsRes, commitsRes] = await Promise.all([
      fetchWithTimeout(`https://api.github.com/repos/${owner}/${repo}`, headers),
      fetchWithTimeout(`https://api.github.com/repos/${owner}/${repo}/readme`, headers),
      fetchWithTimeout(`https://api.github.com/repos/${owner}/${repo}/contents`, headers),
      fetchWithTimeout(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=5`, headers),
    ]);

    if (!metaRes.ok) return empty;

    const meta = await metaRes.json();
    const defaultBranch = String(meta.default_branch || 'main');

    let readmeExcerpt = '';
    if (readmeRes.ok) {
      const rj = await readmeRes.json();
      if (rj?.content) {
        readmeExcerpt = Buffer.from(rj.content, 'base64').toString('utf-8').slice(0, 2600);
      }
    }

    const topFiles: string[] = [];
    let hasPkgJson = false;
    let hasReqTxt = false;
    if (contentsRes.ok) {
      const items = await contentsRes.json();
      if (Array.isArray(items)) {
        for (const it of items.slice(0, 40)) {
          if (it?.name) {
            topFiles.push(it.type === 'dir' ? `${it.name}/` : it.name);
            if (it.name === 'package.json') hasPkgJson = true;
            if (it.name === 'requirements.txt') hasReqTxt = true;
          }
        }
      }
    }

    let scripts: Record<string, string> = {};
    let dependencies: string[] = [];

    if (hasPkgJson) {
      try {
        const pkgRes = await fetchWithTimeout(`https://api.github.com/repos/${owner}/${repo}/contents/package.json`, headers);
        if (pkgRes.ok) {
          const pj = await pkgRes.json();
          if (pj?.content) {
            const parsed = JSON.parse(Buffer.from(pj.content, 'base64').toString('utf-8'));
            if (parsed.scripts && typeof parsed.scripts === 'object') scripts = parsed.scripts;
            dependencies = [
              ...Object.keys(parsed.dependencies || {}),
              ...Object.keys(parsed.devDependencies || {}),
            ].slice(0, 40);
          }
        }
      } catch {}
    } else if (hasReqTxt) {
      try {
        const reqRes = await fetchWithTimeout(`https://api.github.com/repos/${owner}/${repo}/contents/requirements.txt`, headers);
        if (reqRes.ok) {
          const rqj = await reqRes.json();
          if (rqj?.content) {
            dependencies = Buffer.from(rqj.content, 'base64')
              .toString('utf-8')
              .split('\n')
              .map((l) => l.trim().split(/[=<>!]/)[0])
              .filter(Boolean)
              .slice(0, 35);
          }
        }
      } catch {}
    }

    let lastCommitMessage = '';
    let lastCommitSha = '';
    const recentCommits: string[] = [];
    if (commitsRes.ok) {
      const commits = await commitsRes.json();
      if (Array.isArray(commits)) {
        commits.slice(0, 5).forEach((c: any, idx: number) => {
          const sha = String(c.sha || '').slice(0, 7);
          const msg = String(c.commit?.message || '').split('\n')[0];
          if (idx === 0) {
            lastCommitSha = sha;
            lastCommitMessage = msg;
          }
          if (sha && msg) recentCommits.push(`${sha}: ${msg}`);
        });
      }
    }

    let allSourcePaths: string[] = [];
    try {
      const treeRes = await fetchWithTimeout(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(defaultBranch)}?recursive=1`,
        headers
      );
      if (treeRes.ok) {
        const tj = await treeRes.json();
        if (Array.isArray(tj?.tree)) {
          allSourcePaths = tj.tree
            .filter((n: any) => n?.type === 'blob' && n?.path && !IGNORE_PATH_RE.test(n.path))
            .map((n: any) => String(n.path))
            .slice(0, 150);
        }
      }
    } catch {}

    // Prioritize up to 10 high-signal files across API routes, DB schemas, UI pages, services, and components
    const prioritized = allSourcePaths
      .filter((p) => SOURCE_FILE_RE.test(p) && !/config\.(js|ts|mjs)$/i.test(p) && !/\.d\.ts$/i.test(p))
      .sort((a, b) => {
        const rank = (p: string) => {
          const low = p.toLowerCase();
          if (low.includes('/api/') || low.includes('server') || low.includes('route.') || low.includes('main.py') || low.includes('app.py')) return 0;
          if (low.includes('schema') || low.includes('prisma') || low.includes('.sql') || low.includes('models')) return 1;
          if (low.includes('service') || low.includes('engine') || low.includes('ai') || low.includes('data')) return 2;
          if (low.includes('page.') || low.includes('app.') || low.includes('components/')) return 3;
          return 4;
        };
        return rank(a) - rank(b);
      })
      .slice(0, 10);

    const codeSnippets: Array<{ path: string; snippet: string }> = [];
    await Promise.all(
      prioritized.map(async (filePath) => {
        try {
          const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(defaultBranch)}/${filePath}`;
          const r = await fetchWithTimeout(rawUrl, headers, 4000);
          if (r.ok) {
            const text = await r.text();
            codeSnippets.push({ path: filePath, snippet: text.slice(0, 1600) });
          }
        } catch {}
      })
    );

    const depLower = dependencies.join(' ').toLowerCase();
    const pathLower = allSourcePaths.join(' ').toLowerCase();
    const codeCombined = codeSnippets.map((s) => s.snippet).join('\n');
    const codeLower = codeCombined.toLowerCase();

    // Extract referenced env vars & UI routes
    const envMatches = new Set<string>();
    const envRe = /(?:process\.env\.|import\.meta\.env\.|os\.environ\.get\(["']|os\.getenv\(["'])([A-Z0-9_]{3,40})/g;
    let em: RegExpExecArray | null;
    while ((em = envRe.exec(codeCombined)) !== null) {
      envMatches.add(em[1]);
    }

    const detectedUiRoutes = allSourcePaths
      .filter((p) => /page\.(tsx|jsx|ts|js)$|pages\/.*\.(tsx|jsx|ts|js)$/i.test(p))
      .map((p) => p.replace(/^src\/app|^app|^src\/pages|^pages/, '').replace(/\/page\.(tsx|jsx|ts|js)$/, '') || '/')
      .slice(0, 15);

    const signals = {
      hasBackendApi:
        /express|fastify|fastapi|flask|django|nestjs|hono|trpc/.test(depLower) ||
        /(\/api\/|server\.|app\.py|main\.py|routes\/)/.test(pathLower),
      hasDatabase:
        /supabase|prisma|mongoose|mongodb|pg|postgres|mysql|sqlite|firebase|drizzle/.test(depLower) ||
        /create table|supabase|prisma|mongoose/.test(codeLower),
      hasAiIntegration:
        /openai|anthropic|@google\/generative-ai|langchain|llamaindex|groq|transformers|torch/.test(depLower) ||
        /generativelanguage|openai|anthropic|agent/.test(codeLower),
      hasTests:
        /vitest|jest|playwright|cypress|pytest|mocha/.test(depLower) ||
        /\.(test|spec)\.(ts|tsx|js|jsx|py)/.test(pathLower),
    };

    const summaryLines = [
      profileSummary,
      `GitHub Repository: ${meta.full_name} (Primary Language: ${meta.language || 'Unknown'}, Stars: ${meta.stargazers_count || 0})`,
      meta.description ? `Repo Description: ${meta.description}` : '',
      recentCommits.length ? `Recent Commits:\n- ${recentCommits.join('\n- ')}` : '',
      `Detected Engineering Signals: Backend API=${signals.hasBackendApi}, Real Database=${signals.hasDatabase}, Real AI/Agent SDK=${signals.hasAiIntegration}, Automated Tests=${signals.hasTests}`,
      detectedUiRoutes.length ? `Detected UI Routes / Screens: ${detectedUiRoutes.join(', ')}` : '',
      envMatches.size ? `Referenced Env Vars: ${Array.from(envMatches).join(', ')}` : '',
      allSourcePaths.length
        ? `Complete Repository File Tree (${allSourcePaths.length} files): ${allSourcePaths.slice(0, 80).join(', ')}`
        : topFiles.length
        ? `Root Files: ${topFiles.join(', ')}`
        : '',
      Object.keys(scripts).length ? `package.json Scripts: ${JSON.stringify(scripts)}` : '',
      dependencies.length ? `Dependencies: ${dependencies.join(', ')}` : '',
      readmeExcerpt ? `\nREADME.md Excerpt:\n${readmeExcerpt}` : '\n(No README.md found)',
      codeSnippets.length
        ? `\nACTUAL SOURCE FILES INSPECTED (${codeSnippets.length} files):\n${codeSnippets
            .map((c) => `--- ${c.path} ---\n${c.snippet}`)
            .join('\n\n')}`
        : '',
    ].filter(Boolean);

    return {
      found: true,
      isProfileScan,
      profileHandle: owner,
      profileRepos,
      repoName: meta.full_name || `${owner}/${repo}`,
      language: meta.language || 'Unknown',
      stars: meta.stargazers_count || 0,
      lastCommitMessage,
      lastCommitSha,
      topFiles,
      allSourcePaths,
      scripts,
      dependencies,
      detectedEnvVars: Array.from(envMatches),
      detectedUiRoutes,
      signals,
      readmeExcerpt,
      codeSnippets,
      summaryText: summaryLines.join('\n'),
    };
  } catch {
    return empty;
  }
}
