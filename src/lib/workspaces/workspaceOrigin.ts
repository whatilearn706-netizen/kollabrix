import { Hackathon, Project } from '@/types/database';
import {
  isHackathonClosed,
  isHackathonResultsAnnounced,
  formatTimeRemaining,
} from '@/lib/hackathons/hackathonStatus';

export type WorkspaceOriginType = 'hackathon' | 'faculty_problem' | 'permanent';

export interface HackathonTeamMetadata {
  hackathon_id?: string;
  hackathon_title?: string;
  organizer?: string;
  results_published?: boolean;
  results_date?: string | null;
}

export interface WorkspaceOriginInfo {
  originType: WorkspaceOriginType;
  originTitle: string;
  originId?: string | null;
  originOrganizer?: string | null;
  originLink: string;
  originWorkspaceLink: string;
  isResultsAnnounced: boolean;
  isClosed: boolean;
  timeRemaining?: string | null;
  badgeLabel: string;
  subLabel?: string | null;
}

/**
 * Extracts embedded hackathon metadata from a project description comment.
 */
export function extractHackathonMeta(description?: string | null): HackathonTeamMetadata | null {
  if (!description) return null;
  try {
    const match = description.match(/<!--\s*HACKATHON_TEAM_META:(\{.*?\})\s*-->/);
    if (match && match[1]) {
      return JSON.parse(match[1]) as HackathonTeamMetadata;
    }
  } catch (e) {
    // Malformed JSON fallback
  }
  return null;
}

/**
 * Strips internal embedded comments (e.g. <!-- HACKATHON_TEAM_META:... -->)
 * so descriptions render cleanly in workspace, project pages, and modals without leaking raw HTML comments.
 */
export function stripHackathonMeta(description?: string | null): string {
  if (!description) return '';
  return description
    .replace(/<!--\s*HACKATHON_TEAM_META:[\s\S]*?-->/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();
}

/**
 * Extracts faculty problem statement title from formatted project descriptions.
 */
export function extractFacultyProblemTitle(description?: string | null): string | null {
  if (!description) return null;
  const match = description.match(/This team is directly tackling:\s*\*\*(.*?)\*\*/);
  if (match && match[1]) {
    return match[1].trim();
  }
  return null;
}

/**
 * Resolves the true provenance of any workspace or team project:
 * - Hackathon Sprint (e.g. November 26 Sprint)
 * - Faculty Problem Challenge (e.g. Autonomous Campus Lab Asset Tracking...)
 * - Permanent Portfolio Project
 */
export function resolveWorkspaceOrigin(
  item: any,
  context?: {
    hackathons?: Partial<Hackathon>[];
    problemStatements?: Array<{ id: string; title: string; status?: string; deadline?: string; author?: { display_name?: string } }>;
    hackathonTeams?: any[];
  }
): WorkspaceOriginInfo {
  const hackathons = context?.hackathons || [];
  const problemStatements = context?.problemStatements || [];

  const desc = item.description || '';
  const summary = item.summary || '';
  const hackMeta = extractHackathonMeta(desc);
  const facultyTitleInDesc = extractFacultyProblemTitle(desc);

  // 1. Check for Hackathon Origin
  const isHackathonTagged =
    Boolean(hackMeta) ||
    item.category === 'Hackathon Sprint' ||
    summary.startsWith('Hackathon Team Sprint') ||
    Boolean(item.hackathon_id);

  if (isHackathonTagged) {
    // Attempt to locate matched hackathon record
    const targetHackId = hackMeta?.hackathon_id || item.hackathon_id;
    const targetHackTitle = hackMeta?.hackathon_title || (summary.includes('—') ? summary.split('Hackathon Team Sprint:')[1]?.split('—')[0]?.trim() : null);

    const matchedHack = hackathons.find((h) => {
      if (targetHackId && h.id === targetHackId) return true;
      if (targetHackTitle && h.title && h.title.trim().toLowerCase() === targetHackTitle.trim().toLowerCase()) return true;
      return false;
    });

    const canonicalHackId = matchedHack?.id || targetHackId || item.id;
    const hackTitle = matchedHack?.title || targetHackTitle || hackMeta?.hackathon_title || 'Campus Hackathon Sprint';
    const hackOrganizer = matchedHack?.organizer || hackMeta?.organizer || 'Faculty Organizers';
    const resultsAnnounced = matchedHack
      ? isHackathonResultsAnnounced(matchedHack)
      : Boolean(
          hackMeta?.results_published ||
          (hackMeta as any)?.results_announced ||
          (hackMeta?.results_date && new Date(hackMeta.results_date).getTime() <= Date.now())
        );

    // Compute remaining time or jury review status
    let timeRemainingStr: string | null = null;
    if (matchedHack) {
      const subDead = matchedHack.submission_deadline || matchedHack.end_date;
      const subPassed = subDead ? new Date(subDead).getTime() <= Date.now() : false;
      const resDate = matchedHack.results_date || (matchedHack as any).resultsDate;

      if (!resultsAnnounced && subPassed) {
        if (resDate && new Date(resDate).getTime() > Date.now()) {
          timeRemainingStr = `Results in ${formatTimeRemaining(resDate)}`;
        } else {
          timeRemainingStr = 'Jury Review Underway';
        }
      } else {
        timeRemainingStr = formatTimeRemaining(subDead);
      }
    }

    return {
      originType: 'hackathon',
      originTitle: hackTitle,
      originId: canonicalHackId,
      originOrganizer: hackOrganizer,
      originLink: `/hackathons/${canonicalHackId}`,
      originWorkspaceLink: `/projects/${item.id}/workspace`,
      isResultsAnnounced: resultsAnnounced,
      isClosed: resultsAnnounced,
      timeRemaining: timeRemainingStr,
      badgeLabel: `🏆 Hackathon Sprint: ${hackTitle}`,
      subLabel: `Organized by ${hackOrganizer}`,
    };
  }

  // 2. Check for Faculty Problem Challenge Origin
  const problemId = item.problem_statement_id || (item.problem_statement && item.problem_statement.id);
  const hasFacultyOrigin = Boolean(problemId) || Boolean(facultyTitleInDesc);

  if (hasFacultyOrigin) {
    const matchedProblem = problemStatements.find((p) => {
      if (problemId && p.id === problemId) return true;
      if (facultyTitleInDesc && p.title && p.title.trim().toLowerCase() === facultyTitleInDesc.trim().toLowerCase()) return true;
      return false;
    });

    const canonicalProbId = matchedProblem?.id || problemId || 'challenge';
    const probTitle = matchedProblem?.title || facultyTitleInDesc || 'Faculty Research Challenge';
    const probOrganizer = matchedProblem?.author?.display_name || 'Faculty Research Dept';
    const probStatus = (matchedProblem?.status || '').toLowerCase();
    const rawDeadline =
      matchedProblem?.deadline ||
      (item as any)?.problem?.deadline ||
      (item as any)?.deadline ||
      null;

    let probDeadlineDate: Date | null = null;
    if (rawDeadline && typeof rawDeadline === 'string' && rawDeadline.trim()) {
      const trimmed = rawDeadline.trim();
      const d = new Date(trimmed);
      if (!isNaN(d.getTime())) {
        // If date only (no time or timezone specified), treat as inclusive end of day
        if (!trimmed.includes('T') && !trimmed.includes(':')) {
          d.setHours(23, 59, 59, 999);
        }
        probDeadlineDate = d;
      }
    }

    const hasValidDeadline = Boolean(probDeadlineDate);
    const isDeadlineOver = hasValidDeadline ? probDeadlineDate!.getTime() <= Date.now() : false;

    // Faculty problem workspaces must NOT go to "Done" until the deadline is over!
    let isEvaluated = false;
    if (hasValidDeadline) {
      // If a deadline is configured, the challenge workspace remains active until the deadline has concluded,
      // or if the faculty explicitly closed / evaluated the challenge.
      isEvaluated = isDeadlineOver || probStatus === 'closed' || probStatus === 'evaluated';
    } else {
      // If no deadline is specified, it concludes only when explicitly closed or evaluated
      isEvaluated = probStatus === 'completed' || probStatus === 'closed' || probStatus === 'evaluated';
    }

    let timeRemainingStr: string | null = null;
    if (hasValidDeadline && !isDeadlineOver && probDeadlineDate) {
      timeRemainingStr = formatTimeRemaining(probDeadlineDate.toISOString());
    }

    return {
      originType: 'faculty_problem',
      originTitle: probTitle,
      originId: canonicalProbId,
      originOrganizer: probOrganizer,
      originLink: `/problems/${canonicalProbId}`,
      originWorkspaceLink: `/projects/${item.id}/workspace`,
      isResultsAnnounced: Boolean(isEvaluated),
      isClosed: Boolean(isEvaluated),
      timeRemaining: timeRemainingStr,
      badgeLabel: `🎓 Faculty Challenge: ${probTitle}`,
      subLabel: `Mentored by ${probOrganizer}`,
    };
  }

  // 3. Fallback: Permanent Independent Portfolio Project
  const isDone = item.status === 'Completed' || item.status === 'Archived';
  return {
    originType: 'permanent',
    originTitle: item.title || 'Independent Project',
    originId: item.id,
    originOrganizer: 'Self-Directed Team',
    originLink: `/projects/${item.id}`,
    originWorkspaceLink: `/projects/${item.id}/workspace`,
    isResultsAnnounced: isDone,
    isClosed: isDone,
    badgeLabel: '🚀 Permanent Project',
    subLabel: 'Independent Collegiate Portfolio',
  };
}
