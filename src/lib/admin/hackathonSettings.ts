export interface DeletedHackathonsData {
  deletedIds: string[];
  deletedTitles?: string[];
  deletedAt?: Record<string, string>;
}

export function parseDeletedHackathons(raw: any): DeletedHackathonsData {
  if (!raw) {
    return { deletedIds: [], deletedTitles: [], deletedAt: {} };
  }
  if (Array.isArray(raw)) {
    return {
      deletedIds: raw.filter((id) => typeof id === 'string'),
      deletedTitles: [],
      deletedAt: {},
    };
  }
  const deletedIds = Array.isArray(raw.deletedIds)
    ? raw.deletedIds.filter((id: any) => typeof id === 'string')
    : [];
  const deletedTitles = Array.isArray(raw.deletedTitles)
    ? raw.deletedTitles.filter((t: any) => typeof t === 'string')
    : [];
  return {
    deletedIds,
    deletedTitles,
    deletedAt: raw.deletedAt && typeof raw.deletedAt === 'object' ? raw.deletedAt : {},
  };
}
