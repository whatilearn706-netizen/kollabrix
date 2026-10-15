'use client';

import React, { useState, useEffect } from 'react';
import { GithubRepoActivity } from '@/types/database';
import {
  GitBranch,
  Star,
  GitFork,
  GitCommit,
  ExternalLink,
  AlertCircle,
  Clock,
  Code2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface GithubActivitySectionProps {
  repositoryUrl?: string | null;
  projectId?: string;
  isOwnerOrLead?: boolean;
}

export function GithubActivitySection({
  repositoryUrl,
  projectId,
  isOwnerOrLead = false,
}: GithubActivitySectionProps) {
  const [activity, setActivity] = useState<GithubRepoActivity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRepoActivity() {
      if (!repositoryUrl) {
        setActivity(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/github/repo?url=${encodeURIComponent(repositoryUrl)}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Unable to load GitHub activity');
          setActivity(null);
        } else {
          setActivity(data as GithubRepoActivity);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to connect to GitHub');
      } finally {
        setIsLoading(false);
      }
    }

    fetchRepoActivity();
  }, [repositoryUrl]);

  if (!repositoryUrl) {
    return (
      <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750/80 p-6 text-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-charcoal-800 border border-charcoal-700 flex items-center justify-center mx-auto text-slate-400">
          <GitBranch className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-white">No GitHub Repository Connected</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Link your GitHub repository to display live repository commits, languages, and technical milestones for team members and faculty.
        </p>
        {isOwnerOrLead && projectId && (
          <div className="pt-2">
            <a
              href={`/projects/${projectId}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/15 hover:bg-brand-500/25 border border-brand-500/30 text-xs font-semibold text-brand-300 transition-colors"
            >
              <span>Add Repository URL in Settings</span>
              <span>&rarr;</span>
            </a>
          </div>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750/80 p-6 space-y-4 animate-pulse">
        <div className="h-6 w-48 bg-charcoal-800 rounded-lg" />
        <div className="h-4 w-72 bg-charcoal-800 rounded-lg" />
        <div className="space-y-2 pt-2">
          <div className="h-10 bg-charcoal-800 rounded-xl" />
          <div className="h-10 bg-charcoal-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750/80 p-5 space-y-3">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>GitHub Activity Unavailable</span>
        </div>
        <p className="text-xs text-slate-400">{error}</p>
        <a
          href={repositoryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-brand-400 hover:text-brand-300 inline-flex items-center gap-1 font-medium"
        >
          <span>Open Repository on GitHub</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  if (!activity) return null;

  // Calculate languages percentage
  const totalLangBytes = Object.values(activity.languages || {}).reduce((a, b) => a + b, 0);
  const languageList = Object.entries(activity.languages || {}).map(([lang, bytes]) => ({
    name: lang,
    percent: totalLangBytes > 0 ? Math.round((bytes / totalLangBytes) * 100) : 0,
  }));

  const langColors = [
    'bg-brand-500',
    'bg-indigo-500',
    'bg-emerald-500',
    'bg-violet-500',
    'bg-amber-500',
    'bg-rose-500',
  ];

  return (
    <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750/80 p-6 space-y-5 shadow-subtle">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-charcoal-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-brand-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              GitHub Repository Activity
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time public commit log & repository statistics from GitHub.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-xs text-slate-300 bg-charcoal-850 px-3 py-1.5 rounded-xl border border-charcoal-750">
            <span className="flex items-center gap-1" title="Stars">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>{activity.stars}</span>
            </span>
            <span className="flex items-center gap-1" title="Forks">
              <GitFork className="w-3.5 h-3.5 text-slate-400" />
              <span>{activity.forks}</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {activity.default_branch}
            </span>
          </div>

          <a
            href={activity.repo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-xs font-semibold text-white border border-charcoal-700 transition-colors"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Language Breakdown Bar */}
      {languageList.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5 text-slate-400" />
              Repository Languages:
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-charcoal-800 overflow-hidden flex">
            {languageList.map((lang, idx) => (
              <div
                key={lang.name}
                style={{ width: `${Math.max(4, lang.percent)}%` }}
                className={`${langColors[idx % langColors.length]} h-full transition-all`}
                title={`${lang.name}: ${lang.percent}%`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-300">
            {languageList.slice(0, 5).map((lang, idx) => (
              <span key={lang.name} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${langColors[idx % langColors.length]}`} />
                <span>{lang.name}</span>
                <span className="text-slate-400">{lang.percent}%</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Commits List */}
      <div className="space-y-2.5 pt-2">
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
          <GitCommit className="w-3.5 h-3.5 text-brand-400" />
          <span>Latest Public Commits ({activity.recent_commits.length}):</span>
        </h4>

        {activity.recent_commits.length > 0 ? (
          <div className="divide-y divide-charcoal-800 rounded-xl bg-charcoal-850/70 border border-charcoal-750/70 overflow-hidden">
            {activity.recent_commits.map((commit) => (
              <div
                key={commit.sha}
                className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-charcoal-800/50 transition-colors"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <a
                    href={commit.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20 hover:bg-brand-500/20 shrink-0 font-medium"
                  >
                    {commit.sha}
                  </a>
                  <span className="text-xs text-slate-200 truncate font-medium">
                    {commit.message}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 shrink-0 self-start sm:self-auto pl-8 sm:pl-0">
                  <span>{commit.author_name}</span>
                  {commit.author_date && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(commit.author_date).toLocaleDateString()}</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No recent commits found in default branch.</p>
        )}

        <p className="text-[10px] text-slate-400 pt-1 leading-relaxed">
          Activity is fetched live via GitHub&apos;s official REST API. Individual commit author attribution is preserved as recorded in the Git history.
        </p>
      </div>
    </div>
  );
}
