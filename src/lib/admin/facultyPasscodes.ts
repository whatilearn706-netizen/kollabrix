export interface FacultyPasscode {
  id: string;
  code: string;
  department: string;
  notes?: string;
  created_at: string;
  created_by: string;
  is_active: boolean;
  max_uses: number | null;
  used_count: number;
}

export interface FacultySettingsData {
  passcodes: FacultyPasscode[];
  revokedUserIds: string[];
  verifiedUserIds?: string[];
}

export const DEFAULT_FACULTY_CODES: string[] = [];

export function parseFacultySettings(raw: any): FacultySettingsData {
  if (!raw) {
    return { passcodes: [], revokedUserIds: [], verifiedUserIds: [] };
  }
  if (Array.isArray(raw)) {
    return {
      passcodes: raw,
      revokedUserIds: [],
      verifiedUserIds: [],
    };
  }
  return {
    passcodes: Array.isArray(raw.passcodes) ? raw.passcodes : [],
    revokedUserIds: Array.isArray(raw.revokedUserIds) ? raw.revokedUserIds : [],
    verifiedUserIds: Array.isArray(raw.verifiedUserIds) ? raw.verifiedUserIds : [],
  };
}

export function generateFacultyCode(prefix: string = 'FAC'): string {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `${prefix.toUpperCase().trim()}-${randomDigits}`;
}
