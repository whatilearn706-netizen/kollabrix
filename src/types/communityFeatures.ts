export interface UserFeedbackItem {
  id: string;
  name: string;
  email: string;
  campus?: string;
  role: 'student' | 'faculty' | 'organizer' | 'visitor' | 'other';
  category: 'bug' | 'feature' | 'ui_ux' | 'faculty' | 'icpc' | 'general';
  rating: number; // 1 to 5
  message: string;
  createdAt: string;
  status: 'new' | 'reviewed' | 'resolved';
  adminNote?: string;
}

export interface CollegeLeaderboardItem {
  id: string;
  rank: number;
  name: string;
  shortCode: string;
  city: string;
  category: 'iit_nit' | 'bits_iiit' | 'state_pvt';
  projectsCount: number;
  hackathonWins: number;
  activeBuilders: number;
  points: number;
  growth: string;
  badge: string;
  color: string;
  verified?: boolean;
}

export interface CampusDeadlineItem {
  id: string;
  title: string;
  organizer: string;
  type: 'hackathon' | 'problem' | 'icpc' | 'grant' | 'sprint' | 'event';
  deadlineDate: string; // ISO format e.g. "2026-11-05T23:59:59Z"
  category: string;
  description: string;
  link: string;
  prize?: string;
  urgency?: 'urgent' | 'upcoming' | 'ongoing';
  tags?: string[];
}

export interface SparkTemplateItem {
  id: string;
  title: string;
  tagline: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  prompt: string;
  technologies: string[];
  roles: string[];
  featured?: boolean;
}

export const DEFAULT_LEADERBOARD_COLLEGES: CollegeLeaderboardItem[] = [
  {
    id: 'col-1',
    rank: 1,
    name: 'Indian Institute of Technology Delhi',
    shortCode: 'IIT Delhi',
    city: 'New Delhi',
    category: 'iit_nit',
    projectsCount: 46,
    hackathonWins: 9,
    activeBuilders: 198,
    points: 4850,
    growth: '+24% this week',
    badge: '🥇 #1 National Rank',
    color: 'from-amber-500 to-yellow-600',
    verified: true,
  },
  {
    id: 'col-2',
    rank: 2,
    name: 'BITS Pilani (Pilani & Goa Campuses)',
    shortCode: 'BITS Pilani',
    city: 'Pilani / Goa',
    category: 'bits_iiit',
    projectsCount: 41,
    hackathonWins: 8,
    activeBuilders: 172,
    points: 4420,
    growth: '+18% this week',
    badge: '🥈 Top Private Innovator',
    color: 'from-slate-300 to-slate-400',
    verified: true,
  },
  {
    id: 'col-3',
    rank: 3,
    name: 'IIT Bombay',
    shortCode: 'IIT Bombay',
    city: 'Mumbai',
    category: 'iit_nit',
    projectsCount: 38,
    hackathonWins: 7,
    activeBuilders: 164,
    points: 4180,
    growth: '+15% this week',
    badge: '🥉 Elite Tech Hub',
    color: 'from-amber-700 to-yellow-800',
    verified: true,
  },
  {
    id: 'col-4',
    rank: 4,
    name: 'International Institute of Information Technology',
    shortCode: 'IIIT Hyderabad',
    city: 'Hyderabad',
    category: 'bits_iiit',
    projectsCount: 34,
    hackathonWins: 8,
    activeBuilders: 145,
    points: 3890,
    growth: '+28% this week',
    badge: '⚡ Fastest Growing AI Squad',
    color: 'from-emerald-500 to-teal-600',
    verified: true,
  },
  {
    id: 'col-5',
    rank: 5,
    name: 'Vellore Institute of Technology',
    shortCode: 'VIT Vellore',
    city: 'Vellore',
    category: 'state_pvt',
    projectsCount: 29,
    hackathonWins: 5,
    activeBuilders: 132,
    points: 3450,
    growth: '+11% this week',
    badge: '🔥 130+ Active Builders',
    color: 'from-blue-500 to-indigo-600',
    verified: true,
  },
  {
    id: 'col-6',
    rank: 6,
    name: 'Delhi Technological University',
    shortCode: 'DTU Delhi',
    city: 'New Delhi',
    category: 'state_pvt',
    projectsCount: 26,
    hackathonWins: 4,
    activeBuilders: 110,
    points: 3120,
    growth: '+14% this week',
    badge: '🚀 High Sprint Velocity',
    color: 'from-purple-500 to-violet-600',
    verified: true,
  },
  {
    id: 'col-7',
    rank: 7,
    name: 'National Institute of Technology Tiruchirappalli',
    shortCode: 'NIT Trichy',
    city: 'Tiruchirappalli',
    category: 'iit_nit',
    projectsCount: 22,
    hackathonWins: 4,
    activeBuilders: 98,
    points: 2890,
    growth: '+9% this week',
    badge: '🎯 Top NIT Innovator',
    color: 'from-cyan-500 to-blue-600',
    verified: true,
  },
  {
    id: 'col-8',
    rank: 8,
    name: 'Manipal Institute of Technology',
    shortCode: 'MIT Manipal',
    city: 'Manipal',
    category: 'state_pvt',
    projectsCount: 19,
    hackathonWins: 3,
    activeBuilders: 86,
    points: 2540,
    growth: '+12% this week',
    badge: '🌟 Emerging Tech Hub',
    color: 'from-rose-500 to-pink-600',
    verified: true,
  },
];

export const DEFAULT_CAMPUS_DEADLINES: CampusDeadlineItem[] = [
  {
    id: 'dl-1',
    title: 'Grand Collegiate Winter Hackathon 2026',
    organizer: 'Kollabrix Innovation Council & IIT Delhi',
    type: 'hackathon',
    deadlineDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Web3 & AI Hackathon',
    description: '48-hour rapid sprint building generative AI tools and open-source collegiate utilities.',
    link: '/hackathons',
    prize: '₹5,00,000 Pool',
    urgency: 'urgent',
    tags: ['48h Sprint', 'Teams of 2-4', 'Cash Prize'],
  },
  {
    id: 'dl-2',
    title: 'FinTech Algorithmic Routing Challenge',
    organizer: 'Faculty Mentor Dr. R. Sharma (IIT Bombay)',
    type: 'problem',
    deadlineDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Faculty Industry Problem',
    description: 'Design a low-latency, deterministic multi-hop transaction router with real-time test cases.',
    link: '/problems',
    prize: '₹40,000 Stipend + Letter of Rec',
    urgency: 'urgent',
    tags: ['Algorithms', 'Python / Go', 'Faculty Review'],
  },
  {
    id: 'dl-3',
    title: 'ICPC Regional Collegiate Preliminary Sprint',
    organizer: 'ICPC Collegiate Arena',
    type: 'icpc',
    deadlineDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Competitive Programming',
    description: '3-hour official qualifier contest. Test case evaluation with automated streak multiplier.',
    link: '/icpc',
    prize: 'National Citation + Gold Badge',
    urgency: 'upcoming',
    tags: ['Timed Contest', 'C++ / Java / Python', 'National Rank'],
  },
  {
    id: 'dl-4',
    title: 'Campus Green Energy AI Grant',
    organizer: 'National Clean Energy Foundation',
    type: 'grant',
    deadlineDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Student Research Grant',
    description: 'Funding student squads deploying solar monitoring, EV microgrid telemetry, or campus recycling.',
    link: '/explore',
    prize: '₹1,50,000 Direct Grant',
    urgency: 'upcoming',
    tags: ['Grant Funding', 'IoT / AI', 'Campus Deployment'],
  },
  {
    id: 'dl-5',
    title: 'Autonomous Campus Delivery Rover Protocol',
    organizer: 'Robotics Lab & Mechanical Dept',
    type: 'problem',
    deadlineDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Faculty Research Challenge',
    description: 'Computer vision obstacle avoidance and path planning algorithms for autonomous campus rovers.',
    link: '/problems',
    prize: 'Lab Equipment Access + Internship',
    urgency: 'ongoing',
    tags: ['ROS 2', 'YOLOv8', 'Embedded Systems'],
  },
];

export const DEFAULT_SPARK_TEMPLATES: SparkTemplateItem[] = [
  {
    id: 'spark-1',
    title: 'Autonomous Drone Delivery for Large Campuses',
    tagline: 'Last-mile automated intra-campus delivery for lab equipment, books, and essential meds.',
    category: 'IoT / Robotics',
    difficulty: 'Advanced',
    prompt: 'Autonomous drone delivery system for university campuses with GPS geofencing, QR pickup validation, and battery telemetry dashboard.',
    technologies: ['ROS 2', 'PX4 Autopilot', 'FastAPI', 'Next.js', 'PostgreSQL', 'WebRTC'],
    roles: ['Robotics & Firmware Lead', 'Computer Vision Specialist', 'Fullstack Dashboard Dev'],
    featured: true,
  },
  {
    id: 'spark-2',
    title: 'Hostel Peer Cart Sharing & Midnight Canteen Pool',
    tagline: 'Hyper-local micro-ordering app grouping delivery orders to save high delivery fees for hostelites.',
    category: 'Web & Mobile',
    difficulty: 'Beginner',
    prompt: 'Peer cart-pooling app for college hostels to aggregate food orders, split delivery charges dynamically via UPI, and notify roommates.',
    technologies: ['React Native / Next.js', 'TailwindCSS', 'Supabase', 'Node.js', 'Razorpay UPI'],
    roles: ['Mobile / Frontend Lead', 'Backend & Realtime Engineer', 'UI/UX Designer'],
    featured: true,
  },
  {
    id: 'spark-3',
    title: 'AI Smart Attendance with Dynamic Facial Verification',
    tagline: 'Anti-proxy collegiate attendance system running edge face verification on classroom cameras.',
    category: 'AI / Machine Learning',
    difficulty: 'Intermediate',
    prompt: 'Campus smart attendance system that detects student faces from lecture hall cameras using anti-spoofing liveness check and logs records to faculty portal.',
    technologies: ['Python', 'OpenCV', 'InsightFace', 'FastAPI', 'Next.js 14', 'PostgreSQL'],
    roles: ['Computer Vision / ML Lead', 'Backend & Security Dev', 'Frontend Developer'],
    featured: true,
  },
  {
    id: 'spark-4',
    title: 'Decentralized Micro-Grant Fund for Student Open Source',
    tagline: 'Quadratic funding protocol allowing alumni and professors to match student open source bounties.',
    category: 'Web3 / FinTech',
    difficulty: 'Advanced',
    prompt: 'Decentralized quadratic funding platform where college alumni contribute to a treasury pool that automatically matches student project pull requests on GitHub.',
    technologies: ['Solidity', 'Foundry', 'Ethers.js', 'Next.js', 'The Graph', 'TailwindCSS'],
    roles: ['Smart Contract / Web3 Lead', 'Frontend Engineer', 'GitHub API Integrator'],
    featured: true,
  },
  {
    id: 'spark-5',
    title: 'Collegiate Mental Health & Anonymous Peer Sanctuary',
    tagline: 'Zero-knowledge peer support rooms and counselor scheduling for university students.',
    category: 'Social Impact',
    difficulty: 'Intermediate',
    prompt: 'Encrypted anonymous peer sanctuary for university students with AI-moderated chat sentiment analysis, crisis hotline dispatch, and faculty counselor bookings.',
    technologies: ['Next.js 14', 'WebSockets', 'End-to-End Encryption', 'TailwindCSS', 'PostgreSQL'],
    roles: ['Fullstack Lead', 'Security & Cryptography Dev', 'UI/UX Product Designer'],
    featured: false,
  },
];
