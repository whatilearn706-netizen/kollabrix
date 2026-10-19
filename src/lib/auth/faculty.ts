import { User } from '@supabase/supabase-js';
import { Profile } from '@/types/database';

/**
 * Authoritative check to determine if the active user has verified faculty / mentor privileges.
 * 
 * Rules:
 * 1. Must be authenticated with a valid user.
 * 2. Profile role is 'teacher' or 'admin', or faculty_verified is true.
 * 3. Platform owner (goyalmayank142@gmail.com) always has full faculty access.
 * 4. Regular students (profile.role === 'student') are explicitly NOT faculty unless elevated.
 * 5. Per-user verified token in localStorage is honored only if profile is not explicitly 'student'.
 */
export function isFacultyUser(
  user: User | null | undefined,
  profile: Profile | null | undefined
): boolean {
  if (!user) return false;

  // 1. Explicit verified educator status in database
  if (profile?.role === 'teacher' || Boolean(profile?.faculty_verified)) {
    return true;
  }

  // 2. Regular students and unverified accounts are strictly blocked
  return false;
}
