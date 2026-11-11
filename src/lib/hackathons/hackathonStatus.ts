import { Hackathon } from '@/types/database';

/**
 * Returns the true concluding date of the hackathon timeline.
 * If results_date is set, the timeline concludes at results_date (when winners are announced).
 * Otherwise, it concludes at submission_deadline (when deliverables close), falling back to end_date.
 */
export function getHackathonTimelineEndDate(hackathon: Partial<Hackathon> | null | undefined): string | null {
  if (!hackathon) return null;
  return (
    hackathon.results_date ||
    (hackathon as any).resultsDate ||
    hackathon.submission_deadline ||
    (hackathon as any).submissionDeadline ||
    hackathon.end_date ||
    (hackathon as any).endDate ||
    null
  );
}

/**
 * Normalizes hackathon deadlines if dates were entered with an off-by-one month
 * or inverted sequence (e.g. submission deadline placed in October when hackathon is in November).
 * Also synchronizes the timeline conclusion with results_date and submission_deadline.
 */
export function normalizeHackathonDeadlines<T extends Partial<Hackathon> | null | undefined>(hackathon: T): T {
  if (!hackathon) return hackathon;
  const copy = { ...hackathon } as any;

  // Extract embedded metadata dates if available
  if (copy.description && typeof copy.description === 'string' && copy.description.includes('<!-- HACKATHON_META:')) {
    try {
      const metaMatch = copy.description.match(/<!-- HACKATHON_META:([\s\S]*?)-->/);
      if (metaMatch && metaMatch[1]) {
        const meta = JSON.parse(metaMatch[1]);
        if (!copy.results_date && (meta.results_date || meta.resultsDate)) {
          copy.results_date = meta.results_date || meta.resultsDate;
        }
        if (!copy.submission_deadline && (meta.submission_deadline || meta.submissionDeadline)) {
          copy.submission_deadline = meta.submission_deadline || meta.submissionDeadline;
        }
      }
    } catch {}
  }

  // Ensure end_date reflects the official timeline conclusion
  const timelineConclusion = copy.results_date || copy.resultsDate || copy.submission_deadline || copy.submissionDeadline;
  if (timelineConclusion) {
    copy.end_date = timelineConclusion;
    copy.endDate = timelineConclusion;
  }

  const rawSub = copy.submission_deadline || copy.submissionDeadline;
  const rawStart = copy.start_date || copy.startDate;
  const rawReg = copy.registration_deadline || copy.registrationDeadline;
  const rawEnd = copy.end_date || copy.endDate;

  if (rawSub && (rawStart || rawReg)) {
    const subTime = new Date(rawSub).getTime();
    const startTime = rawStart ? new Date(rawStart).getTime() : 0;
    const regTime = rawReg ? new Date(rawReg).getTime() : 0;
    const anchorTime = startTime || regTime;

    if (!isNaN(subTime) && !isNaN(anchorTime) && subTime < anchorTime) {
      const subDate = new Date(rawSub);
      const anchorDate = new Date(anchorTime);

      let healedIso: string;
      // Month error detection (e.g. 2026-10-09 when anchor is in month 11/November)
      if (subDate.getFullYear() === anchorDate.getFullYear() && subDate.getMonth() < anchorDate.getMonth()) {
        const healed = new Date(subDate);
        healed.setMonth(anchorDate.getMonth());
        // If the healed day is still prior to start date, advance to next month or add 5 days to start
        if (healed.getTime() < startTime) {
          healed.setMonth(anchorDate.getMonth() + 1);
        }
        healedIso = healed.toISOString();
      } else if (rawEnd && new Date(rawEnd).getTime() > anchorTime) {
        healedIso = new Date(rawEnd).toISOString();
      } else {
        const fallback = new Date(anchorTime + 48 * 3600 * 1000);
        healedIso = fallback.toISOString();
      }

      copy.submission_deadline = healedIso;
      if (copy.submissionDeadline) {
        copy.submissionDeadline = healedIso;
      }
    }
  }

  return copy;
}

export function isHackathonClosed(hackathon?: Partial<Hackathon> | null): boolean {
  if (!hackathon) return false;
  const status = (hackathon.status || '').toLowerCase();
  if (status === 'closed' || status === 'ended' || status === 'completed' || status === 'archived') {
    return true;
  }
  
  // 1. If results are published, the competition cycle has concluded
  if (hackathon.results_published) {
    return true;
  }

  // 2. Extract results_date from direct property or embedded HACKATHON_META
  let resDate = (hackathon as any).results_date || (hackathon as any).resultsDate || (hackathon as any).result_date;
  if (!resDate && hackathon.description && hackathon.description.includes('HACKATHON_META:')) {
    try {
      const match = hackathon.description.match(/<!-- HACKATHON_META:(.*?) -->/);
      if (match && match[1]) {
        const parsed = JSON.parse(match[1]);
        if (parsed.results_date) resDate = parsed.results_date;
        if (parsed.results_published) return true;
      }
    } catch {}
  }

  const now = Date.now();
  if (resDate) {
    const resTime = new Date(resDate).getTime();
    if (!isNaN(resTime) && now >= resTime) {
      return true;
    }
  }

  // 3. If registration deadline is still in the future, the hackathon is definitely OPEN
  const regDeadline = hackathon.registration_deadline || (hackathon as any).registrationDeadline;
  if (regDeadline) {
    const regTime = new Date(regDeadline).getTime();
    if (!isNaN(regTime) && regTime > now) {
      return false;
    }
  }

  // 2. If hackathon start date is still in the future, the hackathon has not even started yet!
  const startDate = hackathon.start_date || (hackathon as any).startDate;
  if (startDate) {
    const startTime = new Date(startDate).getTime();
    if (!isNaN(startTime) && startTime > now) {
      return false;
    }
  }

  // 3. Normalized deadline evaluation
  const normHack = normalizeHackathonDeadlines(hackathon) as any;
  const deadlines: number[] = [];

  const normEnd = normHack.end_date || normHack.endDate;
  if (normEnd) {
    const t = new Date(normEnd).getTime();
    if (!isNaN(t)) deadlines.push(t);
  }

  const normSub = normHack.submission_deadline || normHack.submissionDeadline;
  if (normSub) {
    const t = new Date(normSub).getTime();
    const startTime = (normHack.start_date || normHack.startDate) ? new Date(normHack.start_date || normHack.startDate).getTime() : 0;
    const regTime = (normHack.registration_deadline || normHack.registrationDeadline) ? new Date(normHack.registration_deadline || normHack.registrationDeadline).getTime() : 0;
    const minValidTime = Math.max(startTime, regTime);

    if (!isNaN(t) && (!minValidTime || t >= minValidTime)) {
      deadlines.push(t);
    }
  }

  if (deadlines.length > 0) {
    const finalDeadline = Math.max(...deadlines);
    return finalDeadline < now;
  }

  return false;
}

/**
 * Checks if a hackathon has completed its cycle and should be removed from the active college feed.
 * A hackathon remains visible while open, while in evaluation, and until the day after results are announced.
 * The day after results are announced (results_date + 24 hours), it automatically disappears from the active directory.
 */
export function isHackathonArchivedFromFeed(hackathon?: Partial<Hackathon> | null): boolean {
  if (!hackathon) return false;
  const status = (hackathon.status || '').toLowerCase();
  if (status === 'archived') return true;

  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  // 1. Check explicit results_date or extracted meta
  let resDateStr = (hackathon as any).results_date || (hackathon as any).resultsDate;
  if (!resDateStr && hackathon.description && hackathon.description.includes('HACKATHON_META:')) {
    try {
      const match = hackathon.description.match(/<!-- HACKATHON_META:(.*?) -->/);
      if (match && match[1]) {
        const parsed = JSON.parse(match[1]);
        if (parsed.results_date) resDateStr = parsed.results_date;
      }
    } catch {}
  }

  if (resDateStr) {
    const resTime = new Date(resDateStr).getTime();
    if (!isNaN(resTime)) {
      // Disappears the day after results are announced (24h grace window)
      return now > resTime + ONE_DAY_MS;
    }
  }

  // 2. If no results date, archive 48 hours after end_date / submission_deadline
  const normHack = normalizeHackathonDeadlines(hackathon) as any;
  const end = normHack.end_date || normHack.endDate || normHack.submission_deadline;
  if (end) {
    const endTime = new Date(end).getTime();
    if (!isNaN(endTime)) {
      return now > endTime + 2 * ONE_DAY_MS;
    }
  }

  return false;
}

export function formatTimeRemaining(deadlineStr?: string | null): string {
  if (!deadlineStr) return 'Active Sprint';
  const diff = new Date(deadlineStr).getTime() - Date.now();
  if (diff <= 0) return 'Ended';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h left`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }
  return `${minutes}m left`;
}
