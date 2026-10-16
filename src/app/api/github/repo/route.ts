import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 300; // Cache 5 minutes

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get('url')?.trim();

  if (!rawUrl) {
    return NextResponse.json({ error: 'Repository URL is required' }, { status: 400 });
  }

  // Parse GitHub owner & repo name from URL or slug
  let owner = '';
  let repo = '';

  try {
    const clean = rawUrl.replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '');
    const parts = clean.split('/').filter(Boolean);
    if (parts.length >= 2) {
      owner = parts[0];
      repo = parts[1];
    }
  } catch {
    return NextResponse.json({ error: 'Invalid GitHub repository format' }, { status: 400 });
  }

  if (!owner || !repo) {
    return NextResponse.json(
      { error: 'Please provide a valid GitHub repository URL (e.g. https://github.com/owner/repo)' },
      { status: 400 }
    );
  }

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'Linkora-College-Collaboration-App',
  };

  const serverGithubToken = process.env.GITHUB_TOKEN || process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
  if (serverGithubToken) {
    headers.Authorization = `Bearer ${serverGithubToken}`;
  }

  try {
    // 1. Fetch Repo info
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
      next: { revalidate: 300 },
    });

    if (repoRes.status === 404) {
      return NextResponse.json(
        { error: `Repository "${owner}/${repo}" was not found or is private.` },
        { status: 404 }
      );
    }

    if (repoRes.status === 403) {
      return NextResponse.json(
        {
          error: 'GitHub API rate limit exceeded. Please try again shortly.',
          is_rate_limited: true,
        },
        { status: 429 }
      );
    }

    if (!repoRes.ok) {
      return NextResponse.json(
        { error: `GitHub API error (${repoRes.status}): ${repoRes.statusText}` },
        { status: repoRes.status }
      );
    }

    const repoData = await repoRes.json();

    // 2. Fetch Latest Commits
    const commitsRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=8`,
      { headers, next: { revalidate: 300 } }
    );
    const commitsData = commitsRes.ok ? await commitsRes.json() : [];

    // 3. Fetch Languages
    const langRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, {
      headers,
      next: { revalidate: 300 },
    });
    const langData = langRes.ok ? await langRes.json() : {};

    const recentCommits = Array.isArray(commitsData)
      ? commitsData.map((c: any) => ({
          sha: c.sha ? c.sha.substring(0, 7) : 'commit',
          message: c.commit?.message?.split('\n')[0] || 'Update',
          author_name: c.commit?.author?.name || c.author?.login || 'Contributor',
          author_date: c.commit?.author?.date || '',
          html_url: c.html_url || `https://github.com/${owner}/${repo}/commit/${c.sha}`,
        }))
      : [];

    return NextResponse.json({
      repo_name: repoData.full_name,
      repo_url: repoData.html_url,
      description: repoData.description,
      default_branch: repoData.default_branch || 'main',
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      open_issues: repoData.open_issues_count,
      languages: langData,
      recent_commits: recentCommits,
      is_rate_limited: false,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch GitHub repository data' },
      { status: 500 }
    );
  }
}
