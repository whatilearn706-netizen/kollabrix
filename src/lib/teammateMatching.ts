import { Profile, Project, TeammateMatch, MatchScoringWeights } from '@/types/database';

export const DEFAULT_MATCH_WEIGHTS: MatchScoringWeights = {
  required_skills: 50,
  desired_roles: 30,
  category_interests: 15,
  completeness_availability: 5,
};

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

  // 2. Exclude suspended users
  if (candidate.is_suspended || candidate.status === 'suspended') return null;

  // 3. Respect privacy: skip non-public profiles
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

  let completenessScore = 0;
  if (candidate.bio && candidate.bio.trim().length > 20) completenessScore += Math.round(weights.completeness_availability * 0.4);
  if (candidate.college || candidate.course) completenessScore += Math.round(weights.completeness_availability * 0.2);
  if (candidate.github_url) completenessScore += Math.round(weights.completeness_availability * 0.4);

  const rawScore = skillScore + roleScore + interestScore + completenessScore;
  const matchScore = Math.min(99, Math.max(15, rawScore));

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

  if (candidate.college) {
    reasons.push(`Collegiate peer from ${candidate.college}`);
  }

  return {
    profile: candidate,
    match_score: matchScore,
    matching_skills: matchingSkills,
    matching_roles: matchingRoles,
    matching_interests: matchingInterests,
    reasons,
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
  if (peer.is_suspended || peer.status === 'suspended') return null;
  if (peer.is_portfolio_public === false) return null;

  const weights = customWeights || DEFAULT_MATCH_WEIGHTS;

  const userSkills = (currentUser.skills || []).map((s) => s.trim().toLowerCase());
  const peerSkills = (peer.skills || []).map((s) => s.trim().toLowerCase());

  const userRoles = (currentUser.preferred_roles || []).map((r) => r.trim().toLowerCase());
  const peerRoles = (peer.preferred_roles || []).map((r) => r.trim().toLowerCase());

  const userInterests = (currentUser.interests || []).map((i) => i.trim().toLowerCase());
  const peerInterests = (peer.interests || []).map((i) => i.trim().toLowerCase());

  // Shared skills & complementary skills
  const sharedSkills = (peer.skills || []).filter((s) => userSkills.includes(s.toLowerCase()));
  const complementaryRoles = (peer.preferred_roles || []).filter(
    (r) => !userRoles.includes(r.toLowerCase())
  );
  const sharedInterests = (peer.interests || []).filter((i) =>
    userInterests.includes(i.toLowerCase())
  );

  let score = Math.round(weights.completeness_availability * 2); // baseline
  if (sharedSkills.length > 0) score += Math.min(weights.required_skills, Math.round(sharedSkills.length * (weights.required_skills / 3)));
  if (complementaryRoles.length > 0) score += weights.desired_roles; // complementary roles form a balanced team
  if (sharedInterests.length > 0) score += Math.min(weights.category_interests, Math.round(sharedInterests.length * (weights.category_interests / 2)));
  if (peer.college && peer.college === currentUser.college) score += 5; // same campus

  const matchScore = Math.min(99, Math.max(15, score));

  const reasons: string[] = [];
  if (sharedInterests.length > 0) {
    reasons.push(`Shared interests: ${sharedInterests.slice(0, 3).join(', ')}`);
  }
  if (complementaryRoles.length > 0) {
    reasons.push(`Complementary team role: ${complementaryRoles[0]}`);
  }
  if (sharedSkills.length > 0) {
    reasons.push(`Shared technical background in ${sharedSkills.slice(0, 2).join(', ')}`);
  }
  if (peer.college && peer.college === currentUser.college) {
    reasons.push(`Fellow student at ${peer.college}`);
  }

  return {
    profile: peer,
    match_score: matchScore,
    matching_skills: sharedSkills,
    matching_roles: complementaryRoles,
    matching_interests: sharedInterests,
    reasons: reasons.length > 0 ? reasons : ['General collegiate collaborator with active profile'],
  };
}
