import { StudentPerk } from '@/types/perks';

export const STUDENT_PERKS: StudentPerk[] = [
  {
    id: 'github-student-pack',
    title: 'GitHub Student Developer Pack',
    provider: 'GitHub & Partners',
    category: 'devtools',
    value: '$2,500+ Value',
    valueNumeric: 2500,
    badgeText: '🔥 Most Popular',
    badgeColor: 'emerald',
    shortDescription:
      'The crown jewel of student perks: Free GitHub Pro, free GitHub Copilot AI, JetBrains IDEs, Canva Pro, and $100+ cloud credits.',
    highlights: [
      'Free GitHub Pro & GitHub Copilot access while studying',
      'Free Canva Pro design subscription for student squads',
      'Free 1-year Namecheap .me domain registration with SSL',
      'JetBrains All-Products Pack (IntelliJ, PyCharm, WebStorm)',
      '100+ developer tool credits across partner ecosystems',
    ],
    requirements: 'College ID card photo OR .edu / .ac.in / university email',
    difficulty: 'easy',
    stepByStepGuide: [
      {
        step: 1,
        title: 'Sign In to GitHub',
        description: 'Ensure your GitHub profile email is set to or includes your college student email address.',
      },
      {
        step: 2,
        title: 'Visit GitHub Education',
        description: 'Navigate to education.github.com/pack and click "Get your Student Developer Pack".',
      },
      {
        step: 3,
        title: 'Upload Student Proof',
        description: 'Take a clear photograph of your current physical college ID card showing the current academic year.',
      },
      {
        step: 4,
        title: 'Instant / Rapid Activation',
        description: 'Once verified (typically 5 minutes to 48 hours), all partner benefits unlock in your dashboard.',
      },
    ],
    proTips: [
      'Disable VPNs before taking the ID picture so your device IP matches your college location.',
      'Make sure your full legal name on GitHub matches the printed name on your student ID.',
    ],
    claimUrl: 'https://education.github.com/pack',
    isPopular: true,
  },
  {
    id: 'aws-educate',
    title: 'AWS Educate & Cloud Career Grant',
    provider: 'Amazon Web Services',
    category: 'cloud',
    value: '$100 Free Credits',
    valueNumeric: 100,
    badgeText: 'No Credit Card Required',
    badgeColor: 'amber',
    shortDescription:
      'Spin up EC2 instances, S3 storage, and serverless Lambda functions for your hackathon without entering a credit card.',
    highlights: [
      '$100 in direct AWS promotional cloud credits',
      'Free hands-on lab sandbox environments (no accidental billing)',
      'Official AWS Educate digital badges for LinkedIn',
      'Direct pipeline to AWS hiring partners and internship job boards',
    ],
    requirements: 'College email or valid enrollment verification',
    difficulty: 'instant',
    stepByStepGuide: [
      {
        step: 1,
        title: 'Navigate to AWS Educate',
        description: 'Go to aws.amazon.com/education/awseducate and select "Register as Student".',
      },
      {
        step: 2,
        title: 'Enter College Credentials',
        description: 'Provide your institution name, graduation year, and college email address.',
      },
      {
        step: 3,
        title: 'Verify via Confirmation Email',
        description: 'Click the verification link sent to your collegiate inbox.',
      },
      {
        step: 4,
        title: 'Claim Console Sandbox Credits',
        description: 'Log in to the AWS Educate portal and click "Access AWS Builder Sandbox".',
      },
    ],
    proTips: [
      'You do NOT need a credit card. Never enter personal debit/credit cards on this track.',
      'Always shut down EC2 GPU instances after training hackathon models to conserve credits.',
    ],
    claimUrl: 'https://aws.amazon.com/education/awseducate/',
    isPopular: true,
  },
  {
    id: 'azure-students',
    title: 'Microsoft Azure for Students',
    provider: 'Microsoft Azure',
    category: 'cloud',
    value: '$100 Annual Credits',
    valueNumeric: 100,
    badgeText: 'Free OpenAI & Cognitive AI',
    badgeColor: 'blue',
    shortDescription:
      '$100 in Azure credits annually plus 55+ always-free services including Azure OpenAI Service, App Services, and SQL databases.',
    highlights: [
      '$100 credit renewed each year of university enrollment',
      'Zero credit card requirement at signup',
      'Access to Azure OpenAI models (GPT-4o, embeddings) for collegiate apps',
      'Free Linux and Windows virtual machines & container apps',
    ],
    requirements: 'College/university email address (.edu / .ac.in / collegiate domain)',
    difficulty: 'instant',
    stepByStepGuide: [
      {
        step: 1,
        title: 'Visit Azure Education',
        description: 'Go to azure.microsoft.com/free/students and click "Start free".',
      },
      {
        step: 2,
        title: 'Authenticate with Student Email',
        description: 'Log in with or link your university email account for instant domain validation.',
      },
      {
        step: 3,
        title: 'Complete SMS Verification',
        description: 'Enter your phone number for 2FA security validation.',
      },
      {
        step: 4,
        title: 'Launch Azure Portal',
        description: 'Your $100 balance is immediately applied and available for deployment.',
      },
    ],
    proTips: [
      'Combine Azure App Service free tier with your credits to host unlimited student portfolios.',
      'Renewable every 12 months as long as you maintain student status.',
    ],
    claimUrl: 'https://azure.microsoft.com/free/students/',
    isPopular: true,
  },
  {
    id: 'jetbrains-pack',
    title: 'JetBrains All Products Pack',
    provider: 'JetBrains',
    category: 'devtools',
    value: '$650/yr Free License',
    valueNumeric: 650,
    badgeText: 'Full Pro IDEs',
    badgeColor: 'violet',
    shortDescription:
      'Complimentary individual licenses for the entire JetBrains desktop IDE suite including IntelliJ IDEA Ultimate, PyCharm Pro, and WebStorm.',
    highlights: [
      'IntelliJ IDEA Ultimate, WebStorm, PyCharm Pro, CLion, Rider, GoLand, DataGrip',
      'Renewable every year throughout your academic degree',
      'Advanced profiling, database tools, and framework support included',
    ],
    requirements: 'College ID card, ISIC card, or university email',
    difficulty: 'instant',
    stepByStepGuide: [
      {
        step: 1,
        title: 'Visit JetBrains Student Offer',
        description: 'Go to jetbrains.com/community/education/#students and click "Apply now".',
      },
      {
        step: 2,
        title: 'Choose Verification Method',
        description: 'Select University email address (fastest) or Official Document / College ID.',
      },
      {
        step: 3,
        title: 'Activate JetBrains Account',
        description: 'Follow the link sent to your email to bind the license to your JetBrains account.',
      },
      {
        step: 4,
        title: 'Log in to IDE',
        description: 'Launch your preferred IDE (e.g. PyCharm or IntelliJ) and sign in to activate Ultimate features.',
      },
    ],
    proTips: [
      'Set an annual calendar reminder to click the 1-click renewal button before expiration.',
    ],
    claimUrl: 'https://www.jetbrains.com/community/education/#students',
  },
  {
    id: 'free-student-domains',
    title: 'Free .tech & .me Custom Portfolio Domains',
    provider: 'Namecheap & .TECH Domains',
    category: 'domains',
    value: '$50 Free Domains',
    valueNumeric: 50,
    badgeText: 'Free Custom Domain',
    badgeColor: 'emerald',
    shortDescription:
      'Claim a free custom domain (e.g. yourname.tech or yourname.me) with free WHOIS privacy and SSL certificates to host your projects.',
    highlights: [
      '1 year free registration for .me or .tech domains',
      'Free SSL certificates & DNS management included',
      'Connects in 60 seconds to Vercel, GitHub Pages, or Netlify',
    ],
    requirements: 'GitHub Student Developer Pack authentication or student email',
    difficulty: 'easy',
    stepByStepGuide: [
      {
        step: 1,
        title: 'Access Namecheap for Education',
        description: 'Visit nc.me or get.tech/students.',
      },
      {
        step: 2,
        title: 'Search Your Desired Handle',
        description: 'Enter your preferred personal handle (e.g., yourname.me or linkora-squad.tech).',
      },
      {
        step: 3,
        title: 'Authorize with GitHub Student Pack',
        description: 'Click "Authenticate with GitHub" to apply the 100% discount waiver.',
      },
      {
        step: 4,
        title: 'Configure DNS Records',
        description: 'Add your CNAME record pointing to cname.vercel-dns.com to link your app live.',
      },
    ],
    proTips: [
      'Choose a clean, memorable domain for your resume (e.g., firstname-lastname.me).',
    ],
    claimUrl: 'https://nc.me/',
  },
  {
    id: 'figma-education',
    title: 'Figma Education Plan',
    provider: 'Figma',
    category: 'design',
    value: '$180/yr Free License',
    valueNumeric: 180,
    badgeText: 'Professional Tier',
    badgeColor: 'violet',
    shortDescription:
      'Free Figma Professional team access with unlimited design files, shared component libraries, dev mode inspection, and FigJam boards.',
    highlights: [
      'Full Figma Professional tier with unlimited project team members',
      'Unlimited shared design system component libraries',
      'Dev Mode with CSS code inspection for engineering squads',
      'FigJam whiteboard for hackathon brainstorming & sprint roadmaps',
    ],
    requirements: 'Proof of student status (College syllabus, ID card, or student portal screenshot)',
    difficulty: 'instant',
    stepByStepGuide: [
      {
        step: 1,
        title: 'Visit Figma Education',
        description: 'Go to figma.com/education and click "Get verified".',
      },
      {
        step: 2,
        title: 'Fill Academic Profile',
        description: 'Select "Student", specify your institution and expected graduation date.',
      },
      {
        step: 3,
        title: 'Upload Proof or Verify Email',
        description: 'Provide your college verification document if prompted.',
      },
      {
        step: 4,
        title: 'Upgrade Team Workspace',
        description: 'Create an Education Team in Figma and invite your Linkora teammates for free collaboration.',
      },
    ],
    proTips: [
      'You can invite your non-verified teammates into your Education Team so the entire squad designs together.',
    ],
    claimUrl: 'https://www.figma.com/education/',
  },
  {
    id: 'notion-plus-student',
    title: 'Notion Plus for Students & AI',
    provider: 'Notion',
    category: 'design',
    value: '$120/yr Free Plan',
    valueNumeric: 120,
    badgeText: 'Unlimited Workspace',
    badgeColor: 'amber',
    shortDescription:
      'Free Notion Plus plan with unlimited file uploads, unlimited page blocks, 30-day page version history, and team sync for coursework.',
    highlights: [
      'Upgrade from Personal Free to Plus Plan ($10/mo value) at $0',
      'Unlimited file uploads (perfect for large hackathon datasets)',
      'Invite up to 100 guest collaborators on project wikis',
    ],
    requirements: 'Sign up with your university email address (.edu / .ac.in / college domain)',
    difficulty: 'instant',
    stepByStepGuide: [
      {
        step: 1,
        title: 'Sign Up with College Email',
        description: 'Create or switch your Notion account primary email to your student address.',
      },
      {
        step: 2,
        title: 'Open Settings & Members',
        description: 'Go to Settings > Upgrade in your Notion desktop or web client.',
      },
      {
        step: 3,
        title: 'Click "Get Free Education Plan"',
        description: 'Notion will detect your collegiate domain and activate the Plus plan immediately.',
      },
    ],
    proTips: [
      'Use Notion database views (Kanban, Calendar) to coordinate your collegiate hackathon deliverables.',
    ],
    claimUrl: 'https://www.notion.so/product/notion-for-education',
  },
  {
    id: 'mongodb-atlas-student',
    title: 'MongoDB Atlas & University Pack',
    provider: 'MongoDB',
    category: 'cloud',
    value: '$200 Free Credits',
    valueNumeric: 200,
    badgeText: 'No Expiration DB',
    badgeColor: 'emerald',
    shortDescription:
      '$200 in MongoDB Atlas cloud database credits, free access to MongoDB Compass, and free certification practice exams.',
    highlights: [
      '$200 in Atlas credits for production clusters & vector search',
      'Free MongoDB University certifications and courses',
      'Native integration with Node.js, Next.js, and Python backends',
    ],
    requirements: 'GitHub Student Developer Pack or student verification',
    difficulty: 'easy',
    stepByStepGuide: [
      {
        step: 1,
        title: 'Visit MongoDB Students',
        description: 'Go to mongodb.com/students.',
      },
      {
        step: 2,
        title: 'Link GitHub Account',
        description: 'Click "Get your student benefits" and authorize via GitHub Student Developer Pack.',
      },
      {
        step: 3,
        title: 'Redeem Credit Voucher',
        description: 'Paste your unique student voucher code in the Atlas billing panel.',
      },
    ],
    proTips: [
      'Use MongoDB Atlas Vector Search for building RAG and AI chatbot projects for hackathons.',
    ],
    claimUrl: 'https://www.mongodb.com/students',
  },
];
