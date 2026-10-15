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
