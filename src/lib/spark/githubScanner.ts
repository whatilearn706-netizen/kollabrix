export interface GitHubRepoSnapshot {
  found: boolean;
  repoName: string;
  language: string;
  stars: number;
  lastCommitMessage: string;
  lastCommitSha: string;
  topFiles: string[];
  scripts: Record<string, string>;
  dependencies: string[];
  readmeExcerpt: string;
  summaryText: string;
}

/**
 * Inspects a public GitHub repository's metadata, latest commit, top-level files,
 * package.json / requirements.txt, and README.md so KΛ-Pro tools ground every
 * answer in the team's actual codebase.
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
    scripts: {},
    dependencies: [],
    readmeExcerpt: '',
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
      fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=3`, { headers }),
    ]);

    if (!metaRes.ok) return empty;

    const meta = await metaRes.json();
    let readmeExcerpt = '';
    if (readmeRes.ok) {
      const rj = await readmeRes.json();
      if (rj?.content) {
        readmeExcerpt = Buffer.from(rj.content, 'base64').toString('utf-8').slice(0, 3200);
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
            const deps = [
              ...Object.keys(parsed.dependencies || {}),
              ...Object.keys(parsed.devDependencies || {}),
            ];
            dependencies = deps.slice(0, 30);
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
              .slice(0, 25);
          }
        }
      } catch {}
    }

    let lastCommitMessage = '';
    let lastCommitSha = '';
    if (commitsRes.ok) {
      const commits = await commitsRes.json();
      if (Array.isArray(commits) && commits[0]) {
        lastCommitSha = String(commits[0].sha || '').slice(0, 7);
        lastCommitMessage = String(commits[0].commit?.message || '').split('\n')[0];
      }
    }

    const summaryLines = [
      `GitHub Repository: ${meta.full_name} (Language: ${meta.language || 'Unknown'}, Stars: ${meta.stargazers_count || 0})`,
      meta.description ? `Description: ${meta.description}` : '',
      lastCommitSha ? `Latest Commit (${lastCommitSha}): ${lastCommitMessage}` : '',
      topFiles.length ? `Root Files & Folders: ${topFiles.join(', ')}` : '',
      Object.keys(scripts).length ? `package.json Scripts: ${JSON.stringify(scripts)}` : '',
      dependencies.length ? `Detected Dependencies: ${dependencies.join(', ')}` : '',
      readmeExcerpt ? `\nREADME.md Excerpt:\n${readmeExcerpt}` : '\n(No README.md found yet)',
    ].filter(Boolean);

    return {
      found: true,
      repoName: meta.full_name || `${owner}/${repo}`,
      language: meta.language || 'Unknown',
      stars: meta.stargazers_count || 0,
      lastCommitMessage,
      lastCommitSha,
      topFiles,
      scripts,
      dependencies,
      readmeExcerpt,
      summaryText: summaryLines.join('\n'),
    };
  } catch {
    return empty;
  }
}
