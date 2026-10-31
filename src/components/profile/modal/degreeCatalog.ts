export interface DegreeItem {
  degree: string;
  category: 'B.Tech' | 'BCA/MCA' | 'M.Tech' | 'B.Sc/M.Sc' | 'Dual Degree' | 'Design' | 'Research' | 'Other';
  tags: string[];
}

export const DEGREE_CATALOG: DegreeItem[] = [
  // B.Tech / B.E. Specializations
  { degree: 'B.Tech Computer Science & Engineering (CSE)', category: 'B.Tech', tags: ['btech', 'b.tech', 'be', 'b.e', 'cse', 'computer science', 'engineering'] },
  { degree: 'B.Tech Artificial Intelligence & Machine Learning (AI/ML)', category: 'B.Tech', tags: ['btech', 'b.tech', 'ai', 'ml', 'machine learning', 'artificial intelligence'] },
  { degree: 'B.Tech Data Science & Analytics', category: 'B.Tech', tags: ['btech', 'b.tech', 'data science', 'analytics', 'big data'] },
  { degree: 'B.Tech Information Technology (IT)', category: 'B.Tech', tags: ['btech', 'b.tech', 'it', 'information technology'] },
  { degree: 'B.Tech Electronics & Communication (ECE)', category: 'B.Tech', tags: ['btech', 'b.tech', 'ece', 'electronics', 'communication'] },
  { degree: 'B.Tech Electrical & Electronics (EEE)', category: 'B.Tech', tags: ['btech', 'b.tech', 'eee', 'electrical'] },
  { degree: 'B.Tech Mechanical Engineering', category: 'B.Tech', tags: ['btech', 'b.tech', 'mechanical', 'mech'] },
  { degree: 'B.Tech Civil Engineering', category: 'B.Tech', tags: ['btech', 'b.tech', 'civil'] },
  { degree: 'B.Tech Mathematics and Computing (MnC)', category: 'B.Tech', tags: ['btech', 'b.tech', 'mnc', 'mathematics', 'computing'] },
  { degree: 'B.Tech Chemical Engineering', category: 'B.Tech', tags: ['btech', 'b.tech', 'chemical'] },
  { degree: 'B.Tech Biotechnology', category: 'B.Tech', tags: ['btech', 'b.tech', 'biotech', 'biotechnology'] },
  { degree: 'B.Tech Aerospace Engineering', category: 'B.Tech', tags: ['btech', 'b.tech', 'aerospace'] },
  { degree: 'B.Tech Cyber Security', category: 'B.Tech', tags: ['btech', 'b.tech', 'cyber', 'security', 'infosec'] },
  { degree: 'B.Tech Cloud Computing & DevOps', category: 'B.Tech', tags: ['btech', 'b.tech', 'cloud', 'devops'] },

  // BCA / MCA
  { degree: 'BCA (Bachelor of Computer Applications)', category: 'BCA/MCA', tags: ['bca', 'computer applications'] },
  { degree: 'BCA with Cloud & DevOps', category: 'BCA/MCA', tags: ['bca', 'cloud', 'devops'] },
  { degree: 'BCA with Data Analytics', category: 'BCA/MCA', tags: ['bca', 'data', 'analytics'] },
  { degree: 'BCA with Cyber Security', category: 'BCA/MCA', tags: ['bca', 'cyber', 'security'] },
  { degree: 'MCA (Master of Computer Applications)', category: 'BCA/MCA', tags: ['mca', 'master of computer applications'] },
  { degree: 'MCA in Software Engineering', category: 'BCA/MCA', tags: ['mca', 'software'] },
  { degree: 'MCA in Artificial Intelligence', category: 'BCA/MCA', tags: ['mca', 'ai', 'machine learning'] },

  // M.Tech / M.E.
  { degree: 'M.Tech Computer Science & Engineering', category: 'M.Tech', tags: ['mtech', 'm.tech', 'cse', 'computer science'] },
  { degree: 'M.Tech Artificial Intelligence & Robotics', category: 'M.Tech', tags: ['mtech', 'm.tech', 'ai', 'robotics'] },
  { degree: 'M.Tech VLSI & Embedded Systems', category: 'M.Tech', tags: ['mtech', 'm.tech', 'vlsi', 'embedded'] },
  { degree: 'M.Tech Software Engineering', category: 'M.Tech', tags: ['mtech', 'm.tech', 'software engineering'] },
  { degree: 'M.Tech Cyber Security & Digital Forensics', category: 'M.Tech', tags: ['mtech', 'm.tech', 'cyber security'] },

  // B.Sc / M.Sc
  { degree: 'B.Sc Computer Science', category: 'B.Sc/M.Sc', tags: ['bsc', 'b.sc', 'computer science'] },
  { degree: 'B.Sc Information Technology', category: 'B.Sc/M.Sc', tags: ['bsc', 'b.sc', 'it', 'information technology'] },
  { degree: 'B.Sc Data Science & AI', category: 'B.Sc/M.Sc', tags: ['bsc', 'b.sc', 'data science', 'ai'] },
  { degree: 'M.Sc Computer Science', category: 'B.Sc/M.Sc', tags: ['msc', 'm.sc', 'computer science'] },
  { degree: 'M.Sc Data Science & Machine Learning', category: 'B.Sc/M.Sc', tags: ['msc', 'm.sc', 'data science', 'ml'] },

  // Design & Architecture
  { degree: 'B.Des (Bachelor of Design in UI/UX)', category: 'Design', tags: ['bdes', 'b.des', 'design', 'ui', 'ux', 'product design'] },
  { degree: 'B.Des Interaction & Product Design', category: 'Design', tags: ['bdes', 'b.des', 'interaction', 'design'] },
  { degree: 'M.Des (Master of Design in UI/UX)', category: 'Design', tags: ['mdes', 'm.des', 'ui', 'ux', 'design'] },

  // Dual Degree / Others
  { degree: 'Dual Degree B.Tech + M.Tech in CSE', category: 'Dual Degree', tags: ['dual degree', 'btech mtech', 'integrated'] },
  { degree: 'Integrated B.Tech + MBA', category: 'Dual Degree', tags: ['integrated', 'btech mba', 'dual degree'] },
  { degree: 'MBA (Technology Management & Product)', category: 'Other', tags: ['mba', 'management', 'product'] },
  { degree: 'PhD in Computer Science & Engineering', category: 'Research', tags: ['phd', 'doctorate', 'research', 'cse'] },
  { degree: 'PhD in Artificial Intelligence & Robotics', category: 'Research', tags: ['phd', 'doctorate', 'ai'] },
];

export const SUGGESTED_COLLEGES = [
  'DTU Delhi',
  'IIT Bombay',
  'BITS Pilani',
  'IIT Delhi',
  'VIT Vellore',
  'IIIT Hyderabad',
  'NSUT Delhi',
  'IIT Kharagpur',
  'NIT Trichy',
  'Manipal (MIT)',
  'IIT Madras',
  'IIT Roorkee',
  'IIIT Delhi',
  'SRM University',
  'Thapar University',
  'PES University',
  'RV College of Engineering',
];

export const ACADEMIC_YEARS = [
  '1st Year (Freshman)',
  '2nd Year (Sophomore)',
  '3rd Year (Junior)',
  '4th Year (Senior)',
  '5th Year / Dual Degree',
  'Graduate / Masters',
  'PhD Researcher',
];

export const SUGGESTED_SKILLS = [
  'React',
  'Next.js',
  'TypeScript',
  'Python',
  'AI / ML',
  'Node.js',
  'TailwindCSS',
  'PostgreSQL',
  'C++',
  'Java',
  'Rust',
  'Go',
  'Docker',
  'Solidity',
  'Flutter',
  'UI / UX',
  'AWS / Cloud',
  'GraphQL',
  'PyTorch',
  'Cybersecurity',
  'Kubernetes',
  'FastAPI',
];

export const SUGGESTED_INTERESTS = [
  'Hackathons',
  'Open Source',
  'Generative AI',
  'Competitive Programming',
  'System Design',
  'Web3 & Crypto',
  'Robotics & IoT',
  'Mobile Apps',
  'Cybersecurity',
  'Game Development',
  'Cloud Architecture',
  'FinTech',
];

export const PREFERRED_ROLES = [
  'Full-Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'AI / ML Engineer',
  'UI / UX Designer',
  'Mobile App Developer',
  'Project Lead',
  'DevOps / Cloud Engineer',
  'Competitive Programmer',
];

export const FACULTY_DESIGNATIONS = [
  'Assistant Professor',
  'Associate Professor',
  'Professor & HOD',
  'Dean of Engineering / Academics',
  'Lab Director / Research Mentor',
  'Adjunct Faculty / Industry Mentor',
  'Visiting Lecturer',
];
