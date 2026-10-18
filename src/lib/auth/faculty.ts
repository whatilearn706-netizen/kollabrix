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

  // 1. Explicit faculty or administrator roles in database
  if (profile?.role === 'teacher' || profile?.role === 'admin') {
    return true;
  }

  // 2. Profile has verified faculty flag
  if (Boolean(profile?.faculty_verified)) {
    return true;
  }

  // 3. Platform founder / owner
  if (
    user.email?.toLowerCase() === 'goyalmayank142@gmail.com' ||
    user.id === 'c86ce05f-24de-4a1a-a45f-944d4180b508'
  ) {
    return true;
  }

  // 4. If the user's role in the database is explicitly 'student' and not verified, reject immediately.
  // This prevents stray localStorage flags from elevating random student accounts on shared devices.
  if (profile?.role === 'student') {
    if (typeof window !== 'undefined') {
      // Clean up any stale generic faculty flag if active user is a student
      try {
        localStorage.removeItem('teamforge_verified_faculty');
      } catch (e) {}
    }
    return false;
  }

  // 5. Per-user verified token tied strictly to this user's unique ID
  if (typeof window !== 'undefined') {
    try {
      if (localStorage.getItem(`linkora_faculty_verified_${user.id}`) === 'true') {
        return true;
      }
    } catch (e) {}
  }

  return false;
}
