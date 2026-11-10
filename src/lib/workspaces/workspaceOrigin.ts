import { Hackathon, Project } from '@/types/database';
import { isHackathonClosed, formatTimeRemaining } from '@/lib/hackathons/hackathonStatus';

export type WorkspaceOriginType = 'hackathon' | 'faculty_problem' | 'permanent';

export interface HackathonTeamMetadata {
  hackathon_id?: string;
  hackathon_title?: string;
  organizer?: string;
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
    const resultsPublished = Boolean(matchedHack?.results_published);
    const closed = matchedHack ? isHackathonClosed(matchedHack) : false;
    const isDone = resultsPublished || closed || item.status === 'Completed';

    return {
      originType: 'hackathon',
      originTitle: hackTitle,
      originId: canonicalHackId,
      originOrganizer: hackOrganizer,
      originLink: `/hackathons/${canonicalHackId}`,
      originWorkspaceLink: `/projects/${item.id}/workspace`,
      isResultsAnnounced: resultsPublished || isDone,
      isClosed: closed || isDone,
      timeRemaining: matchedHack ? formatTimeRemaining(matchedHack.submission_deadline || matchedHack.end_date) : null,
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
    const isEvaluated =
      probStatus === 'completed' ||
      probStatus === 'closed' ||
      probStatus === 'evaluated' ||
      item.status === 'Completed' ||
      (matchedProblem?.deadline && new Date(matchedProblem.deadline).getTime() < Date.now());

    return {
      originType: 'faculty_problem',
      originTitle: probTitle,
      originId: canonicalProbId,
      originOrganizer: probOrganizer,
      originLink: `/problems/${canonicalProbId}`,
      originWorkspaceLink: `/projects/${item.id}/workspace`,
      isResultsAnnounced: Boolean(isEvaluated),
      isClosed: Boolean(isEvaluated),
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
