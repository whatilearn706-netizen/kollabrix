export interface GitHubRepoSnapshot {
  found: boolean;
  repoName: string;
  language: string;
  stars: number;
  lastCommitMessage: string;
  lastCommitSha: string;
  topFiles: string[];
  allSourcePaths: string[];
  scripts: Record<string, string>;
  dependencies: string[];
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

const SOURCE_FILE_RE = /\.(ts|tsx|js|jsx|py|go|rs|java|sol|sql)$/i;
const IGNORE_PATH_RE = /(node_modules|\.next|dist|build|coverage|\.git|lock\.json|\.min\.)/i;

/**
 * Inspects a public GitHub repository's metadata, recent commits, recursive file tree,
 * dependencies, engineering signals (backend/DB/AI/tests), README, and key source files
 * so KΛ-Pro judges and submission packs ground every critique in real code.
 */
export async function fetchDeepGitHubContext(repoUrl: string): Promise<GitHubRepoSnapshot> {
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

  const match = repoUrl.match(/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)/i);
  if (!match) return empty;

  const owner = match[1];
  const repo = match[2].replace(/\.git$/i, '').split(/[?#]/)[0];
  const headers = { Accept: 'application/vnd.github+json' };

  try {
    const [metaRes, readmeRes, contentsRes, commitsRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/contents`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=5`, { headers }),
    ]);

    if (!metaRes.ok) return empty;

    const meta = await metaRes.json();
    const defaultBranch = String(meta.default_branch || 'main');

    let readmeExcerpt = '';
    if (readmeRes.ok) {
      const rj = await readmeRes.json();
      if (rj?.content) {
        readmeExcerpt = Buffer.from(rj.content, 'base64').toString('utf-8').slice(0, 2400);
      }
    }

    const topFiles: string[] = [];
    let hasPkgJson = false;
    let hasReqTxt = false;
    if (contentsRes.ok) {
      const items = await contentsRes.json();
      if (Array.isArray(items)) {
        for (const it of items.slice(0, 35)) {
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
        const pkgRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/package.json`, { headers });
        if (pkgRes.ok) {
          const pj = await pkgRes.json();
          if (pj?.content) {
            const parsed = JSON.parse(Buffer.from(pj.content, 'base64').toString('utf-8'));
            if (parsed.scripts && typeof parsed.scripts === 'object') scripts = parsed.scripts;
            dependencies = [
              ...Object.keys(parsed.dependencies || {}),
              ...Object.keys(parsed.devDependencies || {}),
            ].slice(0, 35);
          }
        }
      } catch {}
    } else if (hasReqTxt) {
      try {
        const reqRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/requirements.txt`, { headers });
        if (reqRes.ok) {
          const rqj = await reqRes.json();
          if (rqj?.content) {
            dependencies = Buffer.from(rqj.content, 'base64')
              .toString('utf-8')
              .split('\n')
              .map((l) => l.trim().split(/[=<>!]/)[0])
              .filter(Boolean)
              .slice(0, 30);
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

    // Fetch recursive git tree to inspect actual source code architecture
    let allSourcePaths: string[] = [];
    try {
      const treeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(defaultBranch)}?recursive=1`,
        { headers }
      );
      if (treeRes.ok) {
        const tj = await treeRes.json();
        if (Array.isArray(tj?.tree)) {
          allSourcePaths = tj.tree
            .filter((n: any) => n?.type === 'blob' && n?.path && !IGNORE_PATH_RE.test(n.path))
            .map((n: any) => String(n.path))
            .slice(0, 120);
        }
      }
    } catch {}

    // Prioritize high-signal source files (backend routes, main entrypoints, services, state, core UI)
    const prioritized = allSourcePaths
      .filter((p) => SOURCE_FILE_RE.test(p) && !/config\.(js|ts|mjs)$/i.test(p) && !/\.d\.ts$/i.test(p))
      .sort((a, b) => {
        const rank = (p: string) => {
          const low = p.toLowerCase();
          if (low.includes('/api/') || low.includes('server') || low.includes('route') || low.includes('main.py') || low.includes('app.py')) return 0;
          if (low.includes('data') || low.includes('service') || low.includes('engine') || low.includes('ai') || low.includes('schema')) return 1;
          if (low.includes('app.') || low.includes('page.') || low.includes('index.')) return 2;
          return 3;
        };
        return rank(a) - rank(b);
      })
      .slice(0, 5);

    const codeSnippets: Array<{ path: string; snippet: string }> = [];
    await Promise.all(
      prioritized.map(async (filePath) => {
        try {
          const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(defaultBranch)}/${filePath}`;
          const r = await fetch(rawUrl);
          if (r.ok) {
            const text = await r.text();
            codeSnippets.push({ path: filePath, snippet: text.slice(0, 1500) });
          }
        } catch {}
      })
    );

    const depLower = dependencies.join(' ').toLowerCase();
    const pathLower = allSourcePaths.join(' ').toLowerCase();
    const codeLower = codeSnippets.map((s) => s.snippet.toLowerCase()).join('\n');

    const signals = {
      hasBackendApi:
        /express|fastify|fastapi|flask|django|nestjs|hono|trpc/.test(depLower) ||
        /(\/api\/|server\.|app\.py|main\.py|routes\/)/.test(pathLower),
      hasDatabase:
        /supabase|prisma|mongoose|mongodb|pg|postgres|mysql|sqlite|firebase|drizzle/.test(depLower) ||
        /create table|supabase|prisma|mongoose|localstorage/.test(codeLower),
      hasAiIntegration:
        /openai|anthropic|@google\/generative-ai|langchain|llamaindex|groq|transformers|torch/.test(depLower) ||
        /generativelanguage|openai|anthropic|agent/.test(codeLower),
      hasTests:
        /vitest|jest|playwright|cypress|pytest|mocha/.test(depLower) ||
        /\.(test|spec)\.(ts|tsx|js|jsx|py)/.test(pathLower),
    };

    const summaryLines = [
      `GitHub Repository: ${meta.full_name} (Primary Language: ${meta.language || 'Unknown'}, Stars: ${meta.stargazers_count || 0})`,
      meta.description ? `Description: ${meta.description}` : '',
      recentCommits.length ? `Recent Commits:\n- ${recentCommits.join('\n- ')}` : '',
      `Detected Engineering Signals: Backend API=${signals.hasBackendApi}, Database=${signals.hasDatabase}, Real AI/Agent SDK=${signals.hasAiIntegration}, Automated Tests=${signals.hasTests}`,
      allSourcePaths.length
        ? `File Tree (${allSourcePaths.length} files): ${allSourcePaths.slice(0, 60).join(', ')}`
        : topFiles.length
        ? `Root Files: ${topFiles.join(', ')}`
        : '',
      Object.keys(scripts).length ? `package.json Scripts: ${JSON.stringify(scripts)}` : '',
      dependencies.length ? `Dependencies: ${dependencies.join(', ')}` : '',
      readmeExcerpt ? `\nREADME.md Excerpt:\n${readmeExcerpt}` : '\n(No README.md found)',
      codeSnippets.length
        ? `\nACTUAL SOURCE FILE EXCERPTS:\n${codeSnippets
            .map((c) => `--- ${c.path} ---\n${c.snippet}`)
            .join('\n\n')}`
        : '',
    ].filter(Boolean);

    return {
      found: true,
      repoName: meta.full_name || `${owner}/${repo}`,
      language: meta.language || 'Unknown',
      stars: meta.stargazers_count || 0,
      lastCommitMessage,
      lastCommitSha,
      topFiles,
      allSourcePaths,
      scripts,
      dependencies,
      signals,
      readmeExcerpt,
      codeSnippets,
      summaryText: summaryLines.join('\n'),
    };
  } catch {
    return empty;
  }
}
