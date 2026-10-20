import { Hackathon } from '@/types/database';

export function isHackathonClosed(hackathon?: Partial<Hackathon> | null): boolean {
  if (!hackathon) return false;
  const status = (hackathon.status || '').toLowerCase();
  if (status === 'closed' || status === 'ended' || status === 'completed' || status === 'archived') {
    return true;
  }
  const deadline = hackathon.submission_deadline || hackathon.end_date;
  if (deadline) {
    const deadlineTime = new Date(deadline).getTime();
    if (!isNaN(deadlineTime) && deadlineTime < Date.now()) {
      return true;
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
