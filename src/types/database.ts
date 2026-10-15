export type ProjectCategory =
  | 'Web Development'
  | 'AI/ML'
  | 'Mobile Apps'
  | 'Developer Tools'
  | 'Social Impact'
  | 'IoT/Hardware'
  | 'Other';

export type ProjectDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type ProjectStatus = 'Recruiting' | 'In Progress' | 'Completed';

export type TeamRole =
  | 'Project Lead'
  | 'Frontend Developer'
  | 'Backend Developer'
  | 'Full-Stack Developer'
  | 'AI/ML Engineer'
  | 'UI/UX Designer'
  | 'Researcher'
  | 'Contributor';

export type ApplicationStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Withdrawn';

export type MilestoneStatus = 'Upcoming' | 'In Progress' | 'Completed';

export type TaskStatus = 'To Do' | 'In Progress' | 'In Review' | 'Completed';

export type TaskPriority = 'Low' | 'Medium' | 'High';

export type UserRole = 'student' | 'teacher' | 'admin';

export type ProblemStatementStatus = 'Draft' | 'Published' | 'Archived';

export type MentoringFeedbackType =
  | 'General'
  | 'Milestone Review'
  | 'Technical Guidance'
  | 'Commendation';

export type NotificationType =
  | 'application_received'
  | 'application_accepted'
  | 'application_rejected'
  | 'member_joined'
  | 'member_removed'
  | 'member_left'
  | 'task_assigned'
  | 'task_status_changed'
  | 'discussion_posted'
  | 'discussion_replied'
  | 'feedback_received';

export interface Profile {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string | null;
  bio?: string | null;
  college?: string | null;
  course?: string | null;
  academic_year?: string | null;
  role?: UserRole;
  status?: 'active' | 'suspended' | 'deactivated';
  is_suspended?: boolean;
  suspension_reason?: string | null;
  is_portfolio_public?: boolean;
  faculty_verified?: boolean;
  verification_doc_type?: string | null;
  birth_year?: number | null;
  skills: string[];
  interests: string[];
  preferred_roles: string[];
  github_url?: string | null;
  portfolio_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProblemApplication {
  id: string;
  problem_statement_id: string;
  applicant_id: string;
  proposed_role: string;
  message: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  applicant?: Partial<Profile> | null;
  problem?: Partial<ProblemStatement> | null;
}

export interface ProblemStatement {
  id: string;
  author_id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  required_skills: string[];
  difficulty: ProjectDifficulty;
  deadline?: string | null;
  status: ProblemStatementStatus;
  created_at: string;
  updated_at: string;
  author?: Partial<Profile> | null;
  projects_count?: number;
  applications_count?: number;
}

export interface ProjectMentoringNote {
  id: string;
  project_id: string;
  mentor_id: string;
  content: string;
  feedback_type: MentoringFeedbackType;
  created_at: string;
  updated_at: string;
  mentor?: Partial<Profile> | null;
}

export interface Project {
  id: string;
  owner_id: string;
  title: string;
  summary: string;
  description: string;
  category: ProjectCategory;
  difficulty: ProjectDifficulty;
  technologies: string[];
  required_skills: string[];
  desired_roles: string[];
  current_team_size: number;
  desired_team_size: number;
  status: ProjectStatus;
  is_featured?: boolean;
  repository_url?: string | null;
  demo_url?: string | null;
  documentation_url?: string | null;
  problem_statement_id?: string | null;
  application_deadline?: string | null;
  is_demo?: boolean;
  created_at: string;
  updated_at: string;
  // Joined relations:
  owner?: Partial<Profile> | null;
  problem_statement?: Partial<ProblemStatement> | null;
}

export interface ProjectFilterOptions {
  search?: string;
  category?: ProjectCategory | 'All';
  difficulty?: ProjectDifficulty | 'All';
  status?: ProjectStatus | 'All';
  skill?: string;
  technology?: string;
  sort?: 'newest' | 'alphabetical';
  page?: number;
  limit?: number;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: TeamRole;
  joined_at: string;
  profile?: Partial<Profile> | null;
}

export interface ProjectApplication {
  id: string;
  project_id: string;
  applicant_id: string;
  application_message: string;
  proposed_role?: string | null;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  applicant?: Partial<Profile> | null;
  project?: Partial<Project> | null;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  title: string;
  description?: string | null;
  target_date: string;
  status: MilestoneStatus;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  tasks_count?: number;
  completed_tasks_count?: number;
}

export interface ProjectTask {
  id: string;
  project_id: string;
  milestone_id?: string | null;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id?: string | null;
  creator_id: string;
  due_date?: string | null;
  evidence_url?: string | null;
  evidence_note?: string | null;
  created_at: string;
  updated_at: string;
  assignee?: Partial<Profile> | null;
  creator?: Partial<Profile> | null;
  milestone?: Partial<ProjectMilestone> | null;
  project?: Partial<Project> | null;
}

export interface ProjectDiscussion {
  id: string;
  project_id: string;
  author_id: string;
  content: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  author?: Partial<Profile> | null;
  replies?: ProjectDiscussionReply[];
}

export interface ProjectDiscussionReply {
  id: string;
  discussion_id: string;
  project_id: string;
  author_id: string;
  content: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  author?: Partial<Profile> | null;
}

export interface Notification {
  id: string;
  recipient_id: string;
  sender_id?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
  sender?: Partial<Profile> | null;
}

// ==============================================================================
// PHASE 4: ADVANCED FEATURES TYPES
// ==============================================================================

export type HackathonMode = 'Online' | 'In-Person' | 'Hybrid';

export interface Hackathon {
  id: string;
  title: string;
  organizer: string;
  description: string;
  mode: HackathonMode;
  location?: string | null;
  start_date: string;
  end_date?: string | null;
  registration_deadline: string;
  submission_deadline?: string | null;
  eligibility: string;
  themes: string[];
  prize_pool?: string | null;
  website_url: string;
  banner_url?: string | null;
  creator_id?: string | null;
  is_verified: boolean;
  access_type?: 'public' | 'private';
  join_code?: string;
  is_join_active?: boolean;
  status?: 'Draft' | 'Published' | 'Archived';
  min_team_size?: number;
  max_team_size?: number;
  rules?: string | null;
  contact_info?: string | null;
  results_published?: boolean;
  participants_count?: number;
  teams_count?: number;
  submissions_count?: number;
  created_at: string;
  updated_at: string;
  is_saved?: boolean;
}

export interface SavedHackathon {
  id: string;
  user_id: string;
  hackathon_id: string;
  created_at: string;
  hackathon?: Hackathon | null;
}

export interface UserGithubConnection {
  id: string;
  user_id: string;
  github_user_id?: string | null;
  github_username: string;
  avatar_url?: string | null;
  profile_url?: string | null;
  public_repos_count: number;
  followers_count: number;
  connected_at: string;
  updated_at: string;
}

export interface GithubRepoSummary {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  default_branch: string;
}

export interface GithubCommitSummary {
  sha: string;
  message: string;
  author_name: string;
  author_date: string;
  html_url: string;
}

export interface GithubRepoActivity {
  repo_name: string;
  repo_url: string;
  description: string | null;
  default_branch: string;
  stars: number;
  forks: number;
  open_issues: number;
  languages: Record<string, number>;
  recent_commits: GithubCommitSummary[];
  is_rate_limited?: boolean;
  error?: string | null;
}

export interface AIPlanTask {
  title: string;
  description: string;
  priority: TaskPriority;
  suggested_role: string;
  acceptance_criteria: string[];
}

export interface AIPlanMilestone {
  title: string;
  description: string;
  weeks_from_start: number;
  tasks: AIPlanTask[];
}

export interface AIPlanDraft {
  scope: string;
  objectives: string[];
  assumptions: string[];
  mvp_features: string[];
  recommended_stack: string[];
  suggested_roles: Array<{ role: string; responsibility: string; count: number }>;
  milestones: AIPlanMilestone[];
}

export interface AIProjectPlan {
  id: string;
  project_id?: string | null;
  user_id: string;
  title: string;
  prompt_inputs: Record<string, any>;
  plan_data: AIPlanDraft;
  status: 'draft' | 'approved' | 'applied';
  created_at: string;
  updated_at: string;
}

export interface ProjectInvitation {
  id: string;
  project_id: string;
  inviter_id: string;
  invitee_id: string;
  proposed_role: string;
  message?: string | null;
  match_score?: number | null;
  status: 'Pending' | 'Accepted' | 'Declined' | 'Cancelled';
  created_at: string;
  updated_at: string;
  project?: Partial<Project> | null;
  inviter?: Partial<Profile> | null;
  invitee?: Partial<Profile> | null;
}

export interface TeammateMatch {
  profile: Profile;
  match_score: number;
  matching_skills: string[];
  matching_roles: string[];
  matching_interests: string[];
  reasons: string[];
  has_pending_invite?: boolean;
}

export interface CollegeAnalyticsData {
  total_projects: number;
  recruiting_projects: number;
  in_progress_projects: number;
  completed_projects: number;
  total_students: number;
  active_students: number;
  total_tasks: number;
  completed_tasks: number;
  task_completion_rate: number;
  total_milestones: number;
  completed_milestones: number;
  milestone_completion_rate: number;
  total_problem_statements: number;
  published_problem_statements: number;
  linked_problem_projects: number;
  category_distribution: Record<string, number>;
  difficulty_distribution: Record<string, number>;
  monthly_trends: Array<{ month: string; projects_count: number }>;
  generated_at: string;
}

// ==============================================================================
// PRIVATE HACKATHON MANAGEMENT SYSTEM TYPES
// ==============================================================================

export type HackathonParticipantRole = 'student' | 'organizer' | 'judge';

export interface HackathonParticipant {
  id: string;
  hackathon_id: string;
  user_id: string;
  role: HackathonParticipantRole;
  joined_at: string;
  profile?: Partial<Profile> | null;
}

export interface HackathonChallenge {
  id: string;
  hackathon_id: string;
  creator_id: string;
  title: string;
  problem_description: string;
  context?: string | null;
  expected_deliverables: string[];
  required_skills: string[];
  difficulty: ProjectDifficulty;
  category: ProjectCategory;
  evaluation_criteria?: string | null;
  resource_urls: string[];
  status: 'Draft' | 'Published';
  created_at: string;
  updated_at: string;
}

export interface HackathonTeam {
  id: string;
  hackathon_id: string;
  challenge_id?: string | null;
  team_name: string;
  description?: string | null;
  leader_id: string;
  invite_code?: string | null;
  created_at: string;
  updated_at: string;
  challenge?: Partial<HackathonChallenge> | null;
  leader?: Partial<Profile> | null;
  members?: HackathonTeamMember[];
  submission?: HackathonSubmission | null;
}

export interface HackathonTeamMember {
  id: string;
  team_id: string;
  hackathon_id: string;
  user_id: string;
  role: 'Leader' | 'Member';
  joined_at: string;
  profile?: Partial<Profile> | null;
}

export interface HackathonSubmission {
  id: string;
  hackathon_id: string;
  team_id: string;
  challenge_id?: string | null;
  title: string;
  pitch: string;
  problem_statement: string;
  solution_description: string;
  implementation_details?: string | null;
  tech_stack: string[];
  repository_url?: string | null;
  is_repo_private?: boolean;
  demo_url?: string | null;
  video_url?: string | null;
  documentation_url?: string | null;
  status: 'draft' | 'submitted';
  submitted_at?: string | null;
  last_edited_by?: string | null;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
  team?: Partial<HackathonTeam> | null;
  challenge?: Partial<HackathonChallenge> | null;
  evaluations?: HackathonEvaluation[];
  average_score?: number;
}

export interface HackathonJudgingCriteria {
  id: string;
  hackathon_id: string;
  name: string;
  description?: string | null;
  weight: number;
  max_score: number;
  created_at: string;
}

export interface HackathonEvaluation {
  id: string;
  hackathon_id: string;
  submission_id: string;
  judge_id: string;
  scores: Record<string, number>;
  total_weighted_score: number;
  feedback?: string | null;
  private_notes?: string | null;
  created_at: string;
  updated_at: string;
  judge?: Partial<Profile> | null;
  submission?: Partial<HackathonSubmission> | null;
}

export interface HackathonAnnouncement {
  id: string;
  hackathon_id: string;
  author_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  author?: Partial<Profile> | null;
}

// ==========================================
// ADMIN CONTROL CENTER & PLATFORM GOVERNANCE
// ==========================================

export interface AdminAuditLog {
  id: string;
  actor_id?: string | null;
  actor_email?: string | null;
  action: string;
  target_type: 'user' | 'project' | 'category' | 'skill' | 'role' | 'settings' | 'hackathon';
  target_id?: string | null;
  details: Record<string, any>;
  outcome: 'SUCCESS' | 'FAILED';
  ip_address?: string | null;
  created_at: string;
}

export interface PlatformSetting<T = any> {
  key: string;
  value: T;
  description?: string | null;
  updated_at: string;
  updated_by?: string | null;
}

export interface ExploreCategoryOption {
  id: string;
  name: string;
  isActive: boolean;
  order: number;
}

export interface ExploreConfig {
  default_page_size: number;
  categories: ExploreCategoryOption[];
  difficulties: ProjectDifficulty[];
  statuses: ProjectStatus[];
  popular_skills: string[];
}

export interface TaxonomySkill {
  id: string;
  name: string;
  category: string;
  isActive: boolean;
  aliases: string[];
}

export interface TaxonomyRole {
  id: string;
  name: string;
  category: string;
  isActive: boolean;
}

export interface TaxonomyConfig {
  skills: TaxonomySkill[];
  roles: TaxonomyRole[];
}

export interface MatchScoringWeights {
  required_skills: number; // e.g. 50
  desired_roles: number; // e.g. 30
  category_interests: number; // e.g. 15
  completeness_availability: number; // e.g. 5
}

export interface MatchScoringConfig {
  weights: MatchScoringWeights;
  min_recommendation_score: number;
  max_recommendations: number;
  require_public_portfolio: boolean;
  formula_description: string;
  suspended_user_ids?: string[];
  suspended_users?: Record<string, { suspended: boolean; reason?: string; timestamp?: string }>;
}

export interface AdminUserListItem {
  user_id: string;
  email?: string;
  username: string;
  display_name: string;
  avatar_url?: string | null;
  role: UserRole;
  status: 'active' | 'suspended' | 'deactivated';
  is_suspended: boolean;
  suspension_reason?: string | null;
  college?: string | null;
  course?: string | null;
  academic_year?: string | null;
  skills: string[];
  created_at: string;
  updated_at: string;
  owned_projects_count: number;
  memberships_count: number;
  hackathon_teams_count: number;
  owned_projects?: Array<{ id: string; title: string; status: string }>;
  memberships?: Array<{ id: string; project_id: string; project_title: string; role: string }>;
  hackathon_teams?: Array<{ id: string; team_name: string; hackathon_id: string; hackathon_title: string; role: string }>;
}

