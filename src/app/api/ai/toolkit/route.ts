import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export interface SynopsisResponse {
  title: string;
  domain: string;
  abstract: string;
  problemStatement: string;
  objectives: string[];
  existingSystemLimitations: string[];
  proposedSystemAdvantages: string[];
  requirements: {
    functional: string[];
    nonFunctional: string[];
    hardware: string[];
    software: string[];
  };
  systemArchitecture: string[];
  modules: {
    name: string;
    description: string;
  }[];
}

export interface VivaQuestion {
  id: number;
  question: string;
  category: string;
  difficulty: 'Core Fundamentals' | 'Technical Architecture' | 'Critical Edge-Cases';
  examinerIntent: string;
  keyTerminology: string[];
  modelAnswer: string;
}

export interface VivaResponse {
  projectTitle: string;
  techStack: string;
  examinerPersona: string;
  questions: VivaQuestion[];
}

function cleanInput(str: string): string {
  return str.replace(/[^\w\s-]/gi, '').trim();
}

/**
 * Domain-specific contextual synthesis for University Project Synopsis & SRS
 */
function synthesizeSynopsis(topic: string, stack?: string): SynopsisResponse {
  const p = topic.toLowerCase();
  const rawClean = cleanInput(topic) || 'Next-Gen Automated System';
  const cleanTitle = rawClean.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const isAgri = /farm|crop|plant|soil|pest|agri|field/i.test(p);
  const isHealth = /health|medic|doctor|patient|hospital|clinic|disease/i.test(p);
  const isFinance = /pay|money|bank|bill|fintech|invest|loan|budget/i.test(p);
  const isWeb3 = /blockchain|crypto|solidity|nft|dao|web3|contract/i.test(p);
  const isIoT = /iot|sensor|arduino|raspberry|robot|hardware|esp32/i.test(p);
  const isCyber = /security|cyber|hack|threat|vulnerab|phish|encrypt/i.test(p);

  let domain = 'Applied AI & Web Systems';
  let problem = `Traditional legacy approaches in ${cleanTitle.toLowerCase()} rely on manual record keeping, fragmented communication channels, and high latency in decision making, leading to operational inefficiencies and lack of auditable metrics.`;
  let proposed = `An automated, real-time distributed platform utilizing modern web engineering, role-based access, and predictive analytics to streamline workflows, eliminate human errors, and provide actionable analytics for stakeholders.`;
  let techSoftware = ['TypeScript & Next.js 14', 'PostgreSQL with Row Level Security', 'Tailwind CSS for responsive UI', 'RESTful API & Server Actions', 'Vercel Edge Network Deployment'];

  if (isAgri) {
    domain = 'Smart Agriculture & IoT Automation';
    problem = 'Smallholder farmers face critical crop losses due to undetected early-stage leaf diseases, irregular irrigation patterns, and delayed access to real-time market prices.';
    proposed = 'An integrated smart agriculture advisory platform providing computer-vision crop pathology diagnosis, weather-adjusted irrigation scheduling, and direct farm-to-buyer telemetry.';
    techSoftware = ['Python FastAPI & PyTorch/OpenCV', 'Next.js & Tailwind CSS', 'PostgreSQL / TimescaleDB', 'TensorFlow Lite for Edge inference'];
  } else if (isHealth) {
    domain = 'Digital Healthcare & Telemedicine';
    problem = 'Patients and clinicians struggle with fragmented medical records, long outpatient queue times, and inadequate triage alerting for critical vital deviations.';
    proposed = 'A HIPAA-aligned digital healthcare portal facilitating end-to-end encrypted electronic health records (EHR), automated appointment triage, and vitals trend anomaly alerts.';
    techSoftware = ['Next.js React Framework', 'Node.js & Express / Supabase', 'PostgreSQL with PII encryption', 'WebRTC for secure tele-consultation'];
  } else if (isFinance) {
    domain = 'FinTech & Smart Ledger Systems';
    problem = 'Collegiate students and shared households lack a transparent, dispute-free mechanism to split multi-currency bills, track recurring debts, and enforce timely settlements.';
    proposed = 'A real-time ledger platform supporting group expense splitting, UPI deep-linking, automated reminders, and cryptographic audit logs of debt clearances.';
    techSoftware = ['Next.js & React 18', 'PostgreSQL with ACID transaction guarantees', 'UPI Deep-Link SDK integration', 'Redis caching for concurrent ledgers'];
  } else if (isWeb3) {
    domain = 'Decentralized Applications & Smart Contracts';
    problem = 'Centralized credential verification suffers from credential forgery, slow inter-university verification pipelines, and administrative single-points-of-failure.';
    proposed = 'A tamper-proof decentralized credential issuance and verification portal with soulbound cryptographic tokens verifiable within seconds by third-party recruiters.';
    techSoftware = ['Solidity Smart Contracts (ERC-721 / Soulbound)', 'Ethers.js / Wagmi', 'Next.js Frontend', 'IPFS / Arweave for metadata storage'];
  } else if (isIoT) {
    domain = 'Internet of Things (IoT) & Embedded Telemetry';
    problem = 'Remote industrial and campus facilities lack low-power sensor telemetry to detect anomalous environmental conditions before equipment failure occurs.';
    proposed = 'An end-to-end telemetry system pairing ESP32 sensor pods with a cloud-streamed telemetry dashboard displaying real-time sensor streams and automated SMS/Email failover alerts.';
    techSoftware = ['C++ / Arduino Core for ESP32', 'MQTT Broker (HiveMQ / Mosquitto)', 'Next.js & Chart.js Dashboard', 'PostgreSQL for time-series logs'];
  } else if (isCyber) {
    domain = 'Cybersecurity & Threat Detection';
    problem = 'Organizations face continuous exposure from spear-phishing campaigns and unmonitored credential stuffing attempts against internal portal logins.';
    proposed = 'An automated security audit and phishing analysis platform featuring heuristic email header analysis, domain squatting detection, and simulated threat training.';
    techSoftware = ['Python Flask & Scikit-Learn', 'Next.js 14 Dashboard', 'Suricata / Zeek log parser', 'Tailwind CSS & Lucide Icons'];
  }

  if (stack && stack.trim().length > 3) {
    techSoftware = [stack, ...techSoftware.slice(1)];
  }

  return {
    title: `${cleanTitle}: Design, Implementation, and Evaluation`,
    domain,
    abstract: `This project proposes the design and implementation of ${cleanTitle}, an intelligent web-based platform tailored to solve systemic inefficiencies in ${domain.toLowerCase()}. By combining a modular micro-component architecture, responsive client state management, and robust database constraints, the system ensures seamless user interaction, verified data integrity, and high-throughput transaction processing. Comprehensive testing validates that the proposed system reduces processing latency by over 60% compared to traditional legacy pipelines, presenting a viable and scalable blueprint for practical college and enterprise deployment.`,
    problemStatement: problem,
    objectives: [
      `To analyze and document the limitations of current legacy workflows in ${domain}.`,
      `To architect a scalable, responsive full-stack platform supporting authenticated multi-role stakeholders.`,
      `To integrate intelligent algorithmic logic for automated processing, filtering, and real-time validation.`,
      `To evaluate the system under peak simulated concurrent workloads and measure latency, security, and usability benchmarks.`,
    ],
    existingSystemLimitations: [
      'Manual, error-prone data entry and lack of automated validation constraints.',
      'Fragmented data silos with no centralized audit logging or historical tracking.',
      'High turn-around time for end-users seeking approvals or status updates.',
      'Vulnerability to data loss and unauthenticated data manipulation.',
    ],
    proposedSystemAdvantages: [
      'Automated role-based access control (RBAC) ensuring strict data confidentiality.',
      'Sub-second query response times with indexed database normalization.',
      'Cross-device responsive UI accessible across desktops, tablets, and smartphones.',
      'Automated error handling, notification dispatch, and real-time dashboard telemetry.',
    ],
    requirements: {
      functional: [
        'User Authentication: Secure sign-up, login, password hashing, and session management.',
        'Core Module Engine: Create, Read, Update, and Delete (CRUD) operations on central domain entities.',
        'Search & Filter Subsystem: Multi-parameter query matching with debounced input.',
        'Export & Reporting: 1-click generation of summaries, invoices, or audit reports in PDF/CSV format.',
        'Notification Center: Contextual in-app and email event dispatching.',
      ],
      nonFunctional: [
        'Performance: Page load times under 1.2s and API response latency under 200ms.',
        'Security: Protection against SQL Injection, XSS, CSRF, and sensitive data masking.',
        'Reliability: 99.9% uptime architecture with graceful offline failover mechanisms.',
        'Usability: Compliant with WCAG 2.1 accessibility guidelines and responsive design.',
      ],
      hardware: [
        'Developer Workstation: Dual-Core 2.0GHz CPU or higher, 8GB RAM minimum, 20GB free SSD.',
        'Host Server: Cloud Virtual Private Server (VPS) or Serverless Edge runtime with 1GB+ RAM.',
        'Client Devices: Any modern web-browser capable device (Smartphone, Tablet, PC).',
      ],
      software: techSoftware,
    },
    systemArchitecture: [
      'Layer 1 - Presentation: Next.js Client Components with Tailwind CSS for dynamic UI states.',
      'Layer 2 - Gateway & Auth: Secure Server Actions and API endpoints with JWT / Session cookie validation.',
      'Layer 3 - Business Logic: Domain-driven service controllers enforcing validation rules.',
      'Layer 4 - Persistence: Relational PostgreSQL database with foreign-key constraints and ACID transactions.',
    ],
    modules: [
      {
        name: 'Authentication & Profile Management',
        description: 'Handles identity verification, secure password hashing, and role permissions (Student, Lead, Evaluator).',
      },
      {
        name: 'Primary Domain Controller',
        description: 'Implements the primary workflows, state transitions, and business computations of the application.',
      },
      {
        name: 'Analytics & Reporting Hub',
        description: 'Aggregates system metrics, produces visual data graphs, and generates exportable documentation.',
      },
      {
        name: 'Communication & Audit Subsystem',
        description: 'Maintains immutable event logs and routes notifications across active team members.',
      },
    ],
  };
}

/**
 * Contextual synthesis for Project Viva / Defense Examination Questions
 */
function synthesizeViva(topic: string, stack?: string): VivaResponse {
  const p = topic.toLowerCase();
  const rawClean = cleanInput(topic) || 'Full-Stack Software Architecture';
  const cleanTitle = rawClean.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const questions: VivaQuestion[] = [
    {
      id: 1,
      category: 'System Scalability & Architecture',
      difficulty: 'Technical Architecture',
      question: `In your ${cleanTitle} project, what happens when 10,000 users access the database simultaneously? Where is your primary bottleneck, and how does your architecture prevent system downtime?`,
      examinerIntent: 'The examiner wants to verify whether you understand database connection pooling, query indexing, serverless cold starts, and caching strategies beyond simple localhost demos.',
      keyTerminology: [
        'Database Connection Pooling (PgBouncer)',
        'Redis / Memory Caching',
        'B-Tree Indexing on Foreign Keys',
        'Horizontal vs Vertical Scaling',
        'Rate Limiting & Queueing',
      ],
      modelAnswer: `In our architecture, the primary bottleneck during sudden traffic spikes would occur at the database connection limit. To resolve this, we decouple direct database queries using a connection pooler (like PgBouncer) and apply Redis caching for high-read, low-write queries such as public dashboards. Furthermore, all critical query columns are indexed with B-Tree indices to ensure search queries remain O(log n) rather than full table scans, while our serverless runtime scales horizontally to absorb incoming traffic.`,
    },
    {
      id: 2,
      category: 'Technology Selection Justification',
      difficulty: 'Core Fundamentals',
      question: `Why did you select your specific database and framework for ${cleanTitle} instead of alternative solutions like a NoSQL database or traditional monolith?`,
      examinerIntent: 'The examiner is probing whether you copy-pasted your tech stack from a tutorial or if you can technically defend your architectural tradeoffs.',
      keyTerminology: [
        'ACID Properties (Atomicity, Consistency, Isolation, Durability)',
        'Relational Integrity & Foreign Keys',
        'Server-Side Rendering (SSR) vs CSR',
        'Type Safety & Developer Ergonomics',
      ],
      modelAnswer: `We chose a relational database (PostgreSQL) because our application relies on strict relational integrity between users, projects, and timestamps. Unlike NoSQL document stores where orphaned records can easily occur, a relational schema enforces strict foreign key constraints and ACID compliance during state updates. On the frontend, Next.js was selected because Server Components eliminate client-side bundle bloat, drastically improving First Contentful Paint (FCP) and SEO discoverability compared to standard Single Page Applications (SPAs).`,
    },
    {
      id: 3,
      category: 'Security & Vulnerability Mitigation',
      difficulty: 'Critical Edge-Cases',
      question: `How does ${cleanTitle} prevent unauthorized data access, SQL injection, and token forgery if a malicious student attempts to tamper with request headers?`,
      examinerIntent: 'Examiners frequently grill candidates on security vulnerabilities (OWASP Top 10) to see if you built authentication securely or just relied on insecure client-side flags.',
      keyTerminology: [
        'Parameterized Queries / Prepared Statements',
        'HttpOnly & SameSite Cookie Flags',
        'Row Level Security (RLS)',
        'Input Sanitization & Zod Validation',
        'CSRF Protection',
      ],
      modelAnswer: `Security is implemented across multiple layers. First, SQL injection is completely prevented through parameterized queries and ORM prepared statements that treat inputs strictly as values rather than executable code. Second, authentication tokens are stored in HttpOnly, Secure, SameSite=Lax cookies that cannot be accessed by client-side JavaScript, neutralizing Cross-Site Scripting (XSS) token theft. Finally, at the database layer, Row Level Security (RLS) policies cryptographically verify the user's JWT identity on every row-level query before returning data.`,
    },
    {
      id: 4,
      category: 'Data Normalization & Modeling',
      difficulty: 'Core Fundamentals',
      question: `To what normal form (NF) is your database normalized? Did you intentionally introduce any denormalization, and why?`,
      examinerIntent: 'A classic computer science viva question testing relational database theory (1NF, 2NF, 3NF, BCNF).',
      keyTerminology: [
        'Third Normal Form (3NF)',
        'Transitive Dependency Elimination',
        'Primary Key & Foreign Key Relationships',
        'Read Optimization vs Update Anomalies',
      ],
      modelAnswer: `Our core transactional schema is designed in Third Normal Form (3NF). Every non-key attribute is non-transitively dependent on the primary key, preventing update and deletion anomalies. However, for real-time aggregation counters (such as project view counts and team member tallies), we intentionally maintain selective denormalized counter fields to avoid expensive O(N) JOIN operations during high-frequency homepage renders.`,
    },
    {
      id: 5,
      category: 'Testing & Real-World Failure Scenarios',
      difficulty: 'Critical Edge-Cases',
      question: `Walk me through a scenario where an external network failure occurs while a student is submitting project milestones. How does your system guarantee data does not get corrupted or duplicated?`,
      examinerIntent: 'Examiners want to see how gracefully your code fails and whether you understand idempotency and atomic database transactions.',
      keyTerminology: [
        'Database Transactions (BEGIN / COMMIT / ROLLBACK)',
        'Idempotency Keys',
        'Optimistic UI Updates with Rollback',
        'Graceful Degradation & User Toast Feedback',
      ],
      modelAnswer: `All multi-step submissions execute inside an atomic database transaction. If the network drops or the server encounters a mid-flight error, the database issues an automatic ROLLBACK command, leaving the schema in its previous pristine state without orphaned records. On the client side, we send an idempotency key with the request so that even if the student clicks the submit button multiple times during a network lag, the server executes the action exactly once.`,
    },
  ];

  return {
    projectTitle: cleanTitle,
    techStack: stack || 'Full-Stack Modern Web Engineering',
    examinerPersona: 'Senior University External Examiner (Rigorous, Systems & Architecture Focused)',
    questions,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, topic, techStack } = body;

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please provide a project topic or title.' },
        { status: 400 }
      );
    }

    if (mode === 'viva') {
      const data = synthesizeViva(topic, techStack);
      return NextResponse.json({ success: true, data });
    }

    // Default: 'synopsis'
    const data = synthesizeSynopsis(topic, techStack);
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to generate toolkit intelligence.' },
      { status: 500 }
    );
  }
}
