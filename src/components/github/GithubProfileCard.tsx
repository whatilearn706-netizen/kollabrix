'use client';

import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  Star,
  GitFork,
  ExternalLink,
  Code2,
  Users,
  GitCommit,
  AlertCircle,
  FolderGit2,
} from 'lucide-react';

interface GithubProfileCardProps {
  githubUrl?: string | null;
  username?: string;
  isOwner?: boolean;
}

export function GithubProfileCard({
  githubUrl,
  username,
  isOwner = false,
}: GithubProfileCardProps) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract username from githubUrl or prop
  const parsedUsername = React.useMemo(() => {
    if (!githubUrl) return null;
    const clean = githubUrl.replace(/^https?:\/\/github\.com\//i, '').replace(/\/.*$/, '').trim();
    return clean || null;
  }, [githubUrl]);

  useEffect(() => {
    async function loadGithubData() {
      if (!parsedUsername) {
        setData(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/github/profile?username=${encodeURIComponent(parsedUsername)}`);
        const json = await res.json();

        if (!res.ok) {
          setError(json.error || 'Failed to load GitHub activity');
          setData(null);
        } else {
          setData(json);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error contacting GitHub');
      } finally {
        setIsLoading(false);
      }
    }

    loadGithubData();
  }, [parsedUsername]);

  if (!githubUrl || !parsedUsername) {
    if (!isOwner) return null;
    return (
      <div className="rounded-2xl bg-charcoal-900 border border-charcoal-800 p-6 text-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-charcoal-800 border border-charcoal-700 flex items-center justify-center mx-auto text-slate-400">
          <FolderGit2 className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-bold text-white">Showcase Your GitHub Activity</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Add your GitHub profile URL in Settings to show your public repositories, languages, and technical contributions on your portfolio.
        </p>
        <a
          href="/settings/profile"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/15 hover:bg-brand-500/25 border border-brand-500/30 text-xs font-semibold text-brand-300 transition-colors"
        >
          <span>Link GitHub Profile</span>
          <span>&rarr;</span>
        </a>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-charcoal-900 border border-charcoal-800 p-6 space-y-4 animate-pulse">
        <div className="h-6 w-40 bg-charcoal-800 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="h-20 bg-charcoal-800 rounded-xl" />
          <div className="h-20 bg-charcoal-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl bg-charcoal-900 border border-charcoal-800 p-5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <FolderGit2 className="w-4 h-4 text-brand-400" />
            <span>GitHub Profile</span>
          </span>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-brand-400 hover:text-brand-300 inline-flex items-center gap-1 font-medium"
          >
            <span>@{parsedUsername}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
        <p className="text-xs text-slate-400">{error || 'GitHub activity unavailable.'}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750/80 p-6 space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-charcoal-800 pb-4">
        <div className="flex items-center gap-3">
          {data.profile?.avatar_url && (
            <img
              src={data.profile.avatar_url}
              alt={data.profile.login}
              className="w-10 h-10 rounded-xl border border-charcoal-700 object-cover"
            />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                {data.profile?.name || data.profile?.login}
              </h3>
              <span className="text-xs text-brand-400 font-mono">@{data.profile?.login}</span>
            </div>
            <p className="text-xs text-slate-400 line-clamp-1">{data.profile?.bio || 'GitHub Contributor'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-3 text-xs text-slate-300 bg-charcoal-850 px-3 py-1.5 rounded-xl border border-charcoal-750">
            <span>
              <strong>{data.profile?.public_repos || 0}</strong> repos
            </span>
            <span>
              <strong>{data.profile?.followers || 0}</strong> followers
            </span>
          </div>

          <a
            href={data.profile?.html_url || githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-xs font-semibold text-white border border-charcoal-700 transition-colors"
          >
            <span>View GitHub</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Top Repositories Grid */}
      <div className="space-y-3">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
          Featured Public Repositories:
        </span>

        {data.repositories && data.repositories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.repositories.slice(0, 4).map((repo: any) => (
              <a
                key={repo.name}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-xl bg-charcoal-850/80 hover:bg-charcoal-800 border border-charcoal-750 hover:border-charcoal-700 transition-all group flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-white group-hover:text-brand-300 transition-colors truncate">
                      {repo.name}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] text-amber-400 shrink-0">
                      <Star className="w-3 h-3" />
                      <span>{repo.stargazers_count}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {repo.description || 'No description provided.'}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  {repo.language && (
                    <span className="flex items-center gap-1 text-slate-300 font-medium">
                      <span className="w-2 h-2 rounded-full bg-brand-400" />
                      <span>{repo.language}</span>
                    </span>
                  )}
                  <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No public repositories listed.</p>
        )}
      </div>

      {/* Recent Public Commits / Activity */}
      {data.recent_activity && data.recent_activity.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-charcoal-800/80">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
            Recent Public Commit Activity:
          </span>
          <div className="space-y-1.5">
            {data.recent_activity.slice(0, 3).map((act: any, idx: number) => (
              <a
                key={idx}
                href={act.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-charcoal-850/50 hover:bg-charcoal-800 text-xs text-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <GitCommit className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span className="font-medium text-white truncate">{act.repo_name}:</span>
                  <span className="text-slate-400 truncate">{act.message}</span>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                  {new Date(act.created_at).toLocaleDateString()}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
