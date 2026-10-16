export interface DeletedHackathonsData {
  deletedIds: string[];
  deletedAt?: Record<string, string>;
}

export function parseDeletedHackathons(raw: any): DeletedHackathonsData {
  if (!raw) {
    return { deletedIds: [], deletedAt: {} };
  }
  if (Array.isArray(raw)) {
    return {
      deletedIds: raw.filter((id) => typeof id === 'string'),
      deletedAt: {},
    };
  }
  return {
    deletedIds: Array.isArray(raw.deletedIds)
      ? raw.deletedIds.filter((id: any) => typeof id === 'string')
      : [],
    deletedAt: raw.deletedAt && typeof raw.deletedAt === 'object' ? raw.deletedAt : {},
  };
}
