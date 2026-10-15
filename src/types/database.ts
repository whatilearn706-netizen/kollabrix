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
  | 'discussion_replied';

export interface Profile {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string | null;
  bio?: string | null;
  college?: string | null;
  course?: string | null;
  academic_year?: string | null;
  skills: string[];
  interests: string[];
  preferred_roles: string[];
  github_url?: string | null;
  portfolio_url?: string | null;
  created_at: string;
  updated_at: string;
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
  repository_url?: string | null;
  demo_url?: string | null;
  application_deadline?: string | null;
  is_demo?: boolean;
  created_at: string;
  updated_at: string;
  // Joined relation:
  owner?: Partial<Profile> | null;
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
  created_at: string;
  updated_at: string;
  assignee?: Partial<Profile> | null;
  creator?: Partial<Profile> | null;
  milestone?: Partial<ProjectMilestone> | null;
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
