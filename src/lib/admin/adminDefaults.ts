import { ExploreConfig, TaxonomyConfig, MatchScoringConfig } from '@/types/database';

export const DEFAULT_EXPLORE_CONFIG: ExploreConfig = {
  default_page_size: 12,
  categories: [
    { id: 'cat-web', name: 'Web Development', isActive: true, order: 1 },
    { id: 'cat-aiml', name: 'AI/ML', isActive: true, order: 2 },
    { id: 'cat-mobile', name: 'Mobile Apps', isActive: true, order: 3 },
    { id: 'cat-devtools', name: 'Developer Tools', isActive: true, order: 4 },
    { id: 'cat-social', name: 'Social Impact', isActive: true, order: 5 },
    { id: 'cat-iot', name: 'IoT/Hardware', isActive: true, order: 6 },
    { id: 'cat-other', name: 'Other', isActive: true, order: 7 },
  ],
  difficulties: ['Beginner', 'Intermediate', 'Advanced'],
  statuses: ['Recruiting', 'In Progress', 'Completed'],
  popular_skills: [
    'React',
    'Python',
    'TypeScript',
    'Node.js',
    'PyTorch',
    'Next.js',
    'Flutter',
    'PostgreSQL',
    'Docker',
    'UI/UX',
  ],
};

export const DEFAULT_TAXONOMY_CONFIG: TaxonomyConfig = {
  skills: [
    { id: 'sk-1', name: 'React', category: 'Frontend', isActive: true, aliases: ['React.js', 'ReactJS'] },
    { id: 'sk-2', name: 'Next.js', category: 'Frontend', isActive: true, aliases: ['NextJS'] },
    { id: 'sk-3', name: 'TypeScript', category: 'Languages', isActive: true, aliases: ['TS'] },
    { id: 'sk-4', name: 'JavaScript', category: 'Languages', isActive: true, aliases: ['JS'] },
    { id: 'sk-5', name: 'Python', category: 'Backend/AI', isActive: true, aliases: ['Py'] },
    { id: 'sk-6', name: 'Java', category: 'Languages', isActive: true, aliases: [] },
    { id: 'sk-7', name: 'C++', category: 'Languages', isActive: true, aliases: ['CPP'] },
    { id: 'sk-8', name: 'Node.js', category: 'Backend', isActive: true, aliases: ['Node', 'NodeJS'] },
    { id: 'sk-9', name: 'PyTorch', category: 'AI/ML', isActive: true, aliases: [] },
    { id: 'sk-10', name: 'TensorFlow', category: 'AI/ML', isActive: true, aliases: ['TF'] },
    { id: 'sk-11', name: 'PostgreSQL', category: 'Database', isActive: true, aliases: ['Postgres', 'SQL'] },
    { id: 'sk-12', name: 'MongoDB', category: 'Database', isActive: true, aliases: ['Mongo'] },
    { id: 'sk-13', name: 'Docker', category: 'DevOps', isActive: true, aliases: [] },
    { id: 'sk-14', name: 'Kubernetes', category: 'DevOps', isActive: true, aliases: ['K8s'] },
    { id: 'sk-15', name: 'Flutter', category: 'Mobile', isActive: true, aliases: [] },
    { id: 'sk-16', name: 'UI/UX Design', category: 'Design', isActive: true, aliases: ['Figma', 'UI/UX'] },
    { id: 'sk-17', name: 'Cloud Computing', category: 'Cloud', isActive: true, aliases: ['AWS', 'GCP', 'Azure'] },
  ],
  roles: [
    { id: 'ro-1', name: 'Project Lead', category: 'Leadership', isActive: true },
    { id: 'ro-2', name: 'Frontend Developer', category: 'Engineering', isActive: true },
    { id: 'ro-3', name: 'Backend Developer', category: 'Engineering', isActive: true },
    { id: 'ro-4', name: 'Full-Stack Developer', category: 'Engineering', isActive: true },
    { id: 'ro-5', name: 'AI/ML Engineer', category: 'Data & AI', isActive: true },
    { id: 'ro-6', name: 'UI/UX Designer', category: 'Design', isActive: true },
    { id: 'ro-7', name: 'Researcher', category: 'Academic', isActive: true },
    { id: 'ro-8', name: 'Contributor', category: 'General', isActive: true },
  ],
};

export const DEFAULT_MATCH_SCORING_CONFIG: MatchScoringConfig = {
  weights: {
    required_skills: 50,
    desired_roles: 30,
    category_interests: 15,
    completeness_availability: 5,
  },
  min_recommendation_score: 20,
  max_recommendations: 8,
  require_public_portfolio: true,
  formula_description:
    'Match Score = (Skill Match × 50%) + (Role Match × 30%) + (Category Match × 15%) + (Completeness × 5%)',
};
