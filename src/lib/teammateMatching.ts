import { Profile, Project, TeammateMatch, MatchScoringWeights } from '@/types/database';

export const DEFAULT_MATCH_WEIGHTS: MatchScoringWeights = {
  required_skills: 50,
  desired_roles: 30,
  category_interests: 15,
  completeness_availability: 5,
};

/**
 * Authoritative check to identify faculty/educator/admin accounts
 * and prevent them from appearing in peer student teammate discovery.
 */
export function isFacultyProfile(p: Partial<Profile> | null | undefined): boolean {
  if (!p) return false;

  const role = (p.role || '').toLowerCase().trim();

  // If role is explicitly student, they are ALWAYS allowed as a student
  if (role === 'student') {
    return false;
  }

  // Explicit educator / faculty roles
  if (
    role === 'teacher' ||
    role === 'faculty' ||
    role === 'professor'
  ) {
    return true;
  }

  // Explicit verified educator badge
  if (Boolean((p as any).faculty_verified)) {
    return true;
  }

  // Explicit faculty designation / department
  if (Boolean((p as any).faculty_designation) || Boolean((p as any).faculty_department)) {
    return true;
  }

  // Academic year stating faculty
  const academicYear = (p.academic_year || '').toLowerCase().trim();
  if (
    academicYear.includes('faculty') ||
    academicYear.includes('academic mentor')
  ) {
    return true;
  }

  // Preferred roles indicating faculty titles
  const roles = (p.preferred_roles || []).map((r) => r.toLowerCase().trim());
  const facultyKeywords = [
    'professor',
    'assistant professor',
    'associate professor',
    'hod',
    'dean',
  ];
  if (roles.some((r) => facultyKeywords.some((k) => r.includes(k)))) {
    return true;
  }

  return false;
}

const PLACEHOLDER_BIO_SNIPPETS = [
  'college builder excited to collaborate on kollabrix projects',
  'active campus builder open to innovative projects and hackathons',
  'exploring new technologies',
];

export function isPlaceholderBio(bio?: string | null): boolean {
  if (!bio) return true;
  const normalized = bio.trim().toLowerCase().replace(/[.!]+$/, '');
  if (normalized.length < 25) return true;
  return PLACEHOLDER_BIO_SNIPPETS.some((snippet) => normalized === snippet);
}

export interface ProfileQualityAssessment {
  isVerified: boolean;
  hasCustomBio: boolean;
  skillsCount: number;
  rolesCount: number;
  hasCollege: boolean;
  hasCourse: boolean;
  hasLinks: boolean;
  hasCustomAvatar: boolean;
  completenessScore: number;
  /**
   * 3 = Verified & Complete profile (best, always top)
   * 2 = Verified partial OR Unverified complete builder (middle)
   * 1 = Unverified partial profile (lower)
   * 0 = Unverified & Incomplete stub (bottom when scrolling)
   */
  tier: 0 | 1 | 2 | 3;
}

/**
 * Evaluates verification and genuine completeness of a student profile so
 * verified, richly filled builders always rank above unverified/empty stubs.
 */
export function evaluateProfileQuality(
  p: Partial<Profile> | null | undefined
): ProfileQualityAssessment {
  if (!p) {
    return {
      isVerified: false,
      hasCustomBio: false,
      skillsCount: 0,
      rolesCount: 0,
      hasCollege: false,
      hasCourse: false,
      hasLinks: false,
      hasCustomAvatar: false,
      completenessScore: 10,
      tier: 0,
    };
  }

  const isVerified = Boolean(p.college_verified || (p as any).student_verified);
  const skillsCount = (p.skills || []).filter((s) => s && s.trim().length > 0).length;
  const rolesCount = (p.preferred_roles || []).filter((r) => r && r.trim().length > 0).length;
  const interestsCount = (p.interests || []).filter((i) => i && i.trim().length > 0).length;
  const hasCustomBio = !isPlaceholderBio(p.bio);
  const hasCollege = Boolean(
    p.college &&
      p.college.trim().length > 1 &&
      p.college.trim().toLowerCase() !== 'campus builder'
  );
  const hasCourse = Boolean(p.course && p.course.trim().length > 1);
  const hasLinks = Boolean(
    (p.github_url && p.github_url.trim()) ||
      (p.linkedin_url && p.linkedin_url.trim()) ||
      (p.portfolio_url && p.portfolio_url.trim())
  );
  const hasCustomAvatar = Boolean(p.avatar_url && p.avatar_url.trim().length > 5);

  let score = 10;
  if (isVerified) score += 34;
  score += Math.min(20, skillsCount * 4);
  score += rolesCount >= 2 ? 12 : rolesCount === 1 ? 8 : 0;
  if (hasCustomBio) score += 10;
  if (hasCollege) score += 5;
  if (hasCourse) score += 3;
  if (hasLinks) score += 4;
  if (hasCustomAvatar) score += 2;
  if (interestsCount > 0) score += 2;

  const completenessScore = Math.min(97, Math.max(10, score));

  let tier: 0 | 1 | 2 | 3 = 0;
  if (isVerified && skillsCount > 0 && (rolesCount > 0 || hasCustomBio)) {
    tier = 3;
  } else if (isVerified || (skillsCount >= 2 && rolesCount >= 1 && hasCustomBio)) {
    tier = 2;
  } else if (skillsCount > 0 || rolesCount > 0 || hasCustomBio || (hasCollege && hasCourse)) {
    tier = 1;
  }

  return {
    isVerified,
    hasCustomBio,
    skillsCount,
    rolesCount,
    hasCollege,
    hasCourse,
    hasLinks,
    hasCustomAvatar,
    completenessScore,
    tier,
  };
}

/**
 * Generates authentic quality-driven ranking for unauthenticated / general
 * teammate directory views (no hardcoded 75% or fake verified badges).
 */
export function calculatePublicTeammateMatch(cand: Profile): TeammateMatch {
  const q = evaluateProfileQuality(cand);
  const reasons: string[] = [];

  if (q.tier === 3) {
    const topSkills = (cand.skills || []).slice(0, 3).join(', ');
    reasons.push(`Verified student builder${topSkills ? ` • ${topSkills}` : ''}`);
  } else if (q.isVerified) {
    reasons.push('Verified collegiate student • Profile details in progress');
  } else if (q.tier === 2) {
    const topSkills = (cand.skills || []).slice(0, 3).join(', ');
    reasons.push(`Complete builder profile${topSkills ? ` (${topSkills})` : ''} • ID verification pending`);
  } else if (q.tier === 1) {
    reasons.push('Partial profile • College verification pending');
  } else {
    reasons.push('Incomplete profile • Skills & verification pending');
  }

  return {
    profile: cand,
    match_score: q.completenessScore,
    matching_skills: (cand.skills || []).slice(0, 3),
    matching_roles: (cand.preferred_roles || []).slice(0, 1),
    matching_interests: (cand.interests || []).slice(0, 2),
    reasons,
  };
}

/**
 * Tiered sort comparator ensuring verified complete builders stay at the top,
 * less complete builders below them, and unfilled/unverified stubs at the bottom.
 */
export function compareTeammateMatches(
  a: TeammateMatch,
  b: TeammateMatch,
  options?: { prioritizeQualityTier?: boolean; currentUserId?: string }
): number {
  const uid = options?.currentUserId;
  if (uid) {
    const aIsSelf = a.profile.user_id === uid;
    const bIsSelf = b.profile.user_id === uid;
    if (aIsSelf !== bIsSelf) return aIsSelf ? -1 : 1;
  }

  const qa = evaluateProfileQuality(a.profile);
  const qb = evaluateProfileQuality(b.profile);

  if (options?.prioritizeQualityTier) {
    if (qb.tier !== qa.tier) return qb.tier - qa.tier;
    if (b.match_score !== a.match_score) return b.match_score - a.match_score;
    return qb.completenessScore - qa.completenessScore;
  }

  // Even when sorting primarily by project relevance, sink incomplete unverified stubs strictly below filled profiles
  const aIsStub = qa.tier === 0;
  const bIsStub = qb.tier === 0;
  if (aIsStub !== bIsStub) return aIsStub ? 1 : -1;

  if (b.match_score !== a.match_score) return b.match_score - a.match_score;
  if (qb.tier !== qa.tier) return qb.tier - qa.tier;
  return qb.completenessScore - qa.completenessScore;
}

/**
 * Transparent Teammate Matching Algorithm
 * Calculates an explainable matching score between a student profile and a project
 * Weights can be dynamically configured via the Admin Control Center:
 * - Required Skills Overlap (default: 50%)
 * - Desired Role Alignment (default: 30%)
 * - Category / Domain Interest (default: 15%)
 * - Profile Completeness / Activity (default: 5%)
 */
export function calculateProjectTeammateMatch(
  candidate: Profile,
  project: Partial<Project>,
  currentUserId?: string,
  existingMemberUserIds: string[] = [],
  customWeights?: MatchScoringWeights
): TeammateMatch | null {
  // 1. Exclude self and existing project members
  if (currentUserId && candidate.user_id === currentUserId) return null;
  if (existingMemberUserIds.includes(candidate.user_id)) return null;

  // 2. Strictly exclude faculty members from student teammate matching
  if (isFacultyProfile(candidate)) return null;

  // 3. Exclude suspended users
  if (candidate.is_suspended || candidate.status === 'suspended') return null;

  // 4. Respect privacy: skip non-public profiles
  if (candidate.is_portfolio_public === false) return null;

  const weights = customWeights || DEFAULT_MATCH_WEIGHTS;

  const candidateSkills = (candidate.skills || []).map((s) => s.trim().toLowerCase());
  const projectSkills = (project.required_skills || project.technologies || []).map((s) =>
    s.trim().toLowerCase()
  );

  const candidateRoles = (candidate.preferred_roles || []).map((r) => r.trim().toLowerCase());
  const projectRoles = (project.desired_roles || []).map((r) => r.trim().toLowerCase());

  const candidateInterests = (candidate.interests || []).map((i) => i.trim().toLowerCase());
  const projectCategory = project.category ? project.category.trim().toLowerCase() : '';

  // Calculate matching items (preserving original casing from candidate or project)
  const matchingSkills = (project.required_skills || project.technologies || []).filter((ps) =>
    candidateSkills.includes(ps.trim().toLowerCase())
  );

  const matchingRoles = (project.desired_roles || []).filter((pr) =>
    candidateRoles.includes(pr.trim().toLowerCase())
  );

  const matchingInterests = (candidate.interests || []).filter(
    (ci) =>
      ci.toLowerCase() === projectCategory ||
      (project.technologies || []).some((t) => t.toLowerCase() === ci.toLowerCase())
  );

  // Compute Weights dynamically
  let skillScore = 0;
  if (projectSkills.length > 0) {
    const ratio = Math.min(1, matchingSkills.length / Math.min(projectSkills.length, 4));
    skillScore = Math.round(ratio * weights.required_skills);
  } else if (candidateSkills.length > 0) {
    skillScore = Math.round(weights.required_skills * 0.5); // baseline for general skills
  }

  let roleScore = 0;
  if (projectRoles.length > 0) {
    if (matchingRoles.length > 0) {
      roleScore = weights.desired_roles;
    }
  } else if (candidateRoles.length > 0) {
    roleScore = Math.round(weights.desired_roles * 0.5);
  }

  let interestScore = 0;
  if (
    matchingInterests.length > 0 ||
    candidateInterests.includes(projectCategory) ||
    candidateInterests.some((ci) => projectSkills.includes(ci))
  ) {
    interestScore = weights.category_interests;
  }

  const quality = evaluateProfileQuality(candidate);
  let completenessScore = 0;
  if (quality.hasCustomBio) completenessScore += Math.round(weights.completeness_availability * 0.4);
  if (quality.hasCollege || quality.hasCourse) completenessScore += Math.round(weights.completeness_availability * 0.2);
  if (quality.hasLinks) completenessScore += Math.round(weights.completeness_availability * 0.4);

  const verifiedMerit = quality.isVerified ? 8 : quality.tier === 0 ? -8 : 0;
  const rawScore = skillScore + roleScore + interestScore + completenessScore + verifiedMerit;
  const maxAllowed = quality.tier === 0 ? 24 : 98;
  const matchScore = Math.min(maxAllowed, Math.max(12, rawScore));

  // Build human-readable explainable reasons
  const reasons: string[] = [];
  if (matchingSkills.length > 0) {
    reasons.push(
      `Matches ${matchingSkills.length} required skill${matchingSkills.length > 1 ? 's' : ''}: ${matchingSkills.slice(0, 3).join(', ')}`
    );
  } else if (candidateSkills.length > 0) {
    reasons.push(`Brings technical skills: ${candidate.skills.slice(0, 3).join(', ')}`);
  }

  if (matchingRoles.length > 0) {
    reasons.push(`Prefers open team role: ${matchingRoles[0]}`);
  }

  if (matchingInterests.length > 0 || candidateInterests.includes(projectCategory)) {
    reasons.push(`Interested in ${project.category || 'this domain'}`);
  }

  if (candidate.college && quality.isVerified) {
    reasons.push(`Verified collegiate peer from ${candidate.college}`);
  } else if (candidate.college && quality.tier > 0) {
    reasons.push(`Collegiate peer from ${candidate.college}`);
  }

  return {
    profile: candidate,
    match_score: matchScore,
    matching_skills: matchingSkills,
    matching_roles: matchingRoles,
    matching_interests: matchingInterests,
    reasons:
      reasons.length > 0
        ? reasons
        : [
            quality.tier === 0
              ? 'Incomplete profile • Skills & verification pending'
              : 'Collegiate collaborator profile',
          ],
  };
}

/**
 * Peer-to-Peer Teammate Match (when browsing without a specific project selected)
 */
export function calculatePeerTeammateMatch(
  peer: Profile,
  currentUser: Profile,
  customWeights?: MatchScoringWeights
): TeammateMatch | null {
  if (peer.user_id === currentUser.user_id) return null;
  if (isFacultyProfile(peer)) return null;
  if (peer.is_suspended || peer.status === 'suspended') return null;
  if (peer.is_portfolio_public === false) return null;

  const weights = customWeights || DEFAULT_MATCH_WEIGHTS;
  const quality = evaluateProfileQuality(peer);

  const userSkills = (currentUser.skills || []).map((s) => s.trim().toLowerCase());
  const userRoles = (currentUser.preferred_roles || []).map((r) => r.trim().toLowerCase());
  const userInterests = (currentUser.interests || []).map((i) => i.trim().toLowerCase());

  // Shared skills & complementary skills
  const sharedSkills = (peer.skills || []).filter((s) => userSkills.includes(s.toLowerCase()));
  const complementaryRoles = (peer.preferred_roles || []).filter(
    (r) => !userRoles.includes(r.toLowerCase())
  );
  const sharedInterests = (peer.interests || []).filter((i) =>
    userInterests.includes(i.toLowerCase())
  );

  // Combine peer compatibility overlap with verified profile completeness
  let score = Math.round(quality.completenessScore * 0.55);
  if (sharedSkills.length > 0) {
    score += Math.min(Math.round(weights.required_skills * 0.65), sharedSkills.length * 10);
  }
  if (complementaryRoles.length > 0) {
    score += Math.round(weights.desired_roles * 0.5);
  }
  if (sharedInterests.length > 0) {
    score += Math.min(weights.category_interests, sharedInterests.length * 6);
  }
  if (peer.college && peer.college === currentUser.college && quality.hasCollege) score += 5;

  const maxAllowed = quality.tier === 0 ? 22 : quality.isVerified ? 98 : 79;
  const matchScore = Math.min(maxAllowed, Math.max(12, score));

  const reasons: string[] = [];
  if (sharedSkills.length > 0) {
    reasons.push(`Shared technical background in ${sharedSkills.slice(0, 2).join(', ')}`);
  }
  if (complementaryRoles.length > 0) {
    reasons.push(`Complementary team role: ${complementaryRoles[0]}`);
  }
  if (sharedInterests.length > 0) {
    reasons.push(`Shared interests: ${sharedInterests.slice(0, 3).join(', ')}`);
  }
  if (quality.isVerified && peer.college) {
    reasons.push(`Verified student at ${peer.college}`);
  } else if (peer.college && peer.college === currentUser.college) {
    reasons.push(`Fellow student at ${peer.college}`);
  }

  const fallbackReason =
    quality.tier === 0
      ? 'Incomplete profile • Skills & verification pending'
      : quality.isVerified
      ? 'Verified collegiate builder'
      : 'Builder profile • College verification pending';

  return {
    profile: peer,
    match_score: matchScore,
    matching_skills: sharedSkills,
    matching_roles: complementaryRoles,
    matching_interests: sharedInterests,
    reasons: reasons.length > 0 ? reasons : [fallbackReason],
  };
}
