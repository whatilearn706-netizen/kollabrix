import { User } from '@supabase/supabase-js';
import { Profile } from '@/types/database';

/**
 * Authoritative check to determine if the active user has verified faculty / mentor privileges.
 * 
 * Rules:
 * 1. Must be authenticated with a valid user.
 * 2. Profile role is 'teacher', 'faculty', 'admin', or faculty_verified is true.
 * 3. Platform owner (goyalmayank142@gmail.com) is always elevated.
 * 4. Regular students (profile.role === 'student' and not faculty_verified) are strictly blocked.
 */
export function isFacultyUser(
  user: User | null | undefined,
  profile: Profile | null | undefined
): boolean {
  if (!user) return false;

  const email = user.email?.toLowerCase();
  if (email === 'goyalmayank142@gmail.com') return true;

  // Explicit verified educator / admin status in database
  if (
    profile?.role === 'teacher' ||
    (profile as any)?.role === 'faculty' ||
    profile?.role === 'admin' ||
    Boolean(profile?.faculty_verified)
  ) {
    return true;
  }

  // Regular students and unverified accounts are strictly not faculty
  return false;
}
