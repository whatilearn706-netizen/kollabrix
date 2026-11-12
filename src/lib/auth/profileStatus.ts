import { Profile } from '@/types/database';
import { User } from '@supabase/supabase-js';

/**
 * Authoritative check to determine if a user has genuinely completed their
 * collegiate profile setup (college and skills must be specified).
 */
export function isProfileComplete(
  profile?: Partial<Profile> | null,
  user?: User | null
): boolean {
  if (!profile && !user) return false;

  // 1. Explicit metadata marker saved when student completes the onboarding modal
  if (
    user?.user_metadata?.profile_completed === true ||
    user?.user_metadata?.onboarding_completed === true
  ) {
    return true;
  }

  // 2. Profile record check: must have real college affiliation and technical skills
  if (profile) {
    const hasCollege = Boolean(
      profile.college &&
      profile.college.trim().length > 0 &&
      profile.college !== 'Collegiate Institution'
    );
    const hasSkills = Boolean(
      Array.isArray(profile.skills) &&
      profile.skills.length > 0
    );
    if (hasCollege && hasSkills) {
      return true;
    }
  }

  return false;
}
