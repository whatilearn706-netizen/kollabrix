import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 300; // Cache for 5 minutes to respect GitHub rate limits

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username')?.trim();

  if (!username) {
    return NextResponse.json({ error: 'GitHub username is required' }, { status: 400 });
  }

  // Sanitize username (alphanumeric and single hyphens)
  const sanitizedUsername = username.replace(/[^a-zA-Z0-9-]/g, '');
  if (!sanitizedUsername) {
    return NextResponse.json({ error: 'Invalid GitHub username' }, { status: 400 });
  }

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'Linkora-College-Collaboration-App',
  };

  // Optional: If server has a GITHUB_TOKEN configured, use it to increase rate limit from 60 to 5000 req/hr
  const serverGithubToken = process.env.GITHUB_TOKEN || process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
  if (serverGithubToken) {
    headers.Authorization = `Bearer ${serverGithubToken}`;
  }

  try {
    // 1. Fetch user profile
    const userRes = await fetch(`https://api.github.com/users/${sanitizedUsername}`, {
      headers,
      next: { revalidate: 300 },
    });

    if (userRes.status === 404) {
      return NextResponse.json(
        { error: `GitHub user "${sanitizedUsername}" was not found.` },
        { status: 404 }
      );
    }

    if (userRes.status === 403) {
      return NextResponse.json(
        {
          error: 'GitHub API rate limit exceeded. Please try again in a few minutes.',
          is_rate_limited: true,
        },
        { status: 429 }
      );
    }

    if (!userRes.ok) {
      return NextResponse.json(
        { error: `GitHub API error (${userRes.status}): ${userRes.statusText}` },
        { status: userRes.status }
      );
    }

    const userData = await userRes.json();

    // 2. Fetch public repositories
    const reposRes = await fetch(
      `https://api.github.com/users/${sanitizedUsername}/repos?sort=updated&per_page=6`,
      { headers, next: { revalidate: 300 } }
    );
    const reposData = reposRes.ok ? await reposRes.json() : [];

    // 3. Fetch public events (recent public commits & activity)
    const eventsRes = await fetch(
      `https://api.github.com/users/${sanitizedUsername}/events/public?per_page=10`,
      { headers, next: { revalidate: 300 } }
    );
    const eventsData = eventsRes.ok ? await eventsRes.json() : [];

    // Format top repos
    const repositories = Array.isArray(reposData)
      ? reposData.map((repo: any) => ({
          name: repo.name,
          full_name: repo.full_name,
          html_url: repo.html_url,
          description: repo.description,
          language: repo.language,
          stargazers_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          updated_at: repo.updated_at,
          default_branch: repo.default_branch,
        }))
      : [];

    // Format public commits & pull request activity from events
    const recentActivity: Array<{
      type: string;
      repo_name: string;
      created_at: string;
      message?: string;
      html_url?: string;
    }> = [];

    if (Array.isArray(eventsData)) {
      for (const ev of eventsData) {
        if (ev.type === 'PushEvent' && ev.payload?.commits) {
          for (const c of ev.payload.commits.slice(0, 2)) {
            recentActivity.push({
              type: 'commit',
              repo_name: ev.repo?.name || 'repository',
              message: c.message,
              created_at: ev.created_at,
              html_url: `https://github.com/${ev.repo?.name}/commit/${c.sha}`,
            });
          }
        } else if (ev.type === 'PullRequestEvent') {
          recentActivity.push({
            type: 'pull_request',
            repo_name: ev.repo?.name || 'repository',
            message: `${ev.payload?.action}: ${ev.payload?.pull_request?.title || 'PR'}`,
            created_at: ev.created_at,
            html_url: ev.payload?.pull_request?.html_url,
          });
        }
      }
    }

    return NextResponse.json({
      connected: true,
      profile: {
        login: userData.login,
        name: userData.name || userData.login,
        avatar_url: userData.avatar_url,
        html_url: userData.html_url,
        bio: userData.bio,
        public_repos: userData.public_repos,
        followers: userData.followers,
        following: userData.following,
      },
      repositories,
      recent_activity: recentActivity.slice(0, 6),
      is_rate_limited: false,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch GitHub profile activity' },
      { status: 500 }
    );
  }
}
