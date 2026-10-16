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

export const DEFAULT_FACULTY_CODES = ['FACULTY2026', 'TF-FACULTY-2026', 'TEACHER2026'];

export function generateFacultyCode(prefix: string = 'FAC'): string {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `${prefix.toUpperCase().trim()}-${randomDigits}`;
}
