import { ProblemStatement } from '@/types/database';

export const DEMO_PROBLEMS: ProblemStatement[] = [
  {
    id: 'ps-1',
    author_id: 'faculty-1',
    title: 'AI-Powered Campus Transit & Micro-Mobility Optimization Engine',
    description: `### Academic Context & Background
Collegiate campuses cover extensive terrain where thousands of students, faculty, and campus staff commute between lectures and research buildings within tight 10-15 minute windows. Current campus bus transit systems lack dynamic telemetry, elevation-aware routing for students with disabilities, and battery station balancing for electric micro-mobility.

### Challenge Requirements
Student engineering teams are tasked with designing and deploying a multi-modal route optimization system that:
1. Ingests live telemetry (GPS coordinates, transit bus delays) and campus walking paths.
2. Formulates an algorithm balancing pedestrian comfort, transit arrival times, and carbon offset tracking.
3. Implements an accessible web interface for both desktop and mobile devices.

### Suggested Architecture
- Web Frontend: Next.js or React with interactive Leaflet/Mapbox maps
- Backend & Database: Supabase PostgreSQL with PostGIS extension for geo-spatial querying
- Streaming: WebSockets or MQTT for live bus beacon signals

### Evaluation Criteria
- Route optimality and response latency (< 300ms for path calculations)
- Accessibility compliance (WCAG 2.1 AA)
- Live prototype deployment and documentation quality`,
    category: 'AI/ML',
    difficulty: 'Intermediate',
    required_skills: ['TypeScript', 'React', 'PostgreSQL', 'GIS / Maps', 'Python'],
    deadline: '2026-11-30',
    status: 'Published',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    author: {
      user_id: 'faculty-1',
      display_name: 'Dr. Radhika Sen',
      username: 'dr_radhika',
      avatar_url: null,
      college: 'Institute of Engineering & Tech',
      course: 'Dept. of Computer Science & AI',
      role: 'teacher',
    },
    projects_count: 1,
  },
  {
    id: 'ps-2',
    author_id: 'faculty-2',
    title: 'Explainable Deep Learning Pipeline for Medical Imaging Diagnosis',
    description: `### Academic Context & Background
Deep learning architectures routinely achieve high classification accuracy in medical image screening. However, clinical and academic adoption requires transparent decision reasoning. Black-box classifications cannot be audited by radiologists or student clinicians without visual attribution.

### Challenge Requirements
Student teams must build a deep learning diagnostic assistant that:
1. Analyzes anonymized MRI/CT benchmark slices for lesion localization.
2. Extracts pixel-level visual justification using Grad-CAM, Integrated Gradients, or Attention Rollout.
3. Renders high-fidelity 2D/3D slice visualizations with interactive transparency and threshold controls in the browser.

### Suggested Architecture
- Neural Network: PyTorch, TorchVision, MONAI or torchvision ResNet/DenseNet
- Inference Service: FastAPI with asynchronous queueing (Redis/Celery)
- Frontend: WebGL / Three.js slice canvas viewer with Next.js

### Evaluation Criteria
- Model convergence and localization IoU on validation splits
- Latency and interactivity of Grad-CAM overlay generation
- Clear technical documentation and ethical data handling protocols`,
    category: 'AI/ML',
    difficulty: 'Advanced',
    required_skills: ['PyTorch', 'Computer Vision', 'FastAPI', 'Three.js', 'Docker'],
    deadline: '2026-12-15',
    status: 'Published',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    author: {
      user_id: 'faculty-2',
      display_name: 'Prof. Marcus Vance',
      username: 'prof_vance',
      avatar_url: null,
      college: 'National University of Tech',
      course: 'Biomedical Engineering & Imaging Lab',
      role: 'teacher',
    },
    projects_count: 1,
  },
  {
    id: 'ps-3',
    author_id: 'faculty-3',
    title: 'Decentralized Academic Credential & Verified Student Portfolio Ledger',
    description: `### Academic Context & Background
Resume fraud and unverifiable skill endorsements remain pervasive in graduate hiring. University career centers lack a lightweight, tamper-resistant system where student project deliverables (code commits, pull requests, capstone reviews) can be cryptographically verified by faculty mentors and shared securely with employers.

### Challenge Requirements
Teams will develop a cryptographic proof and portfolio verification system that:
1. Issues tamper-evident digital attestations upon milestone completion in project workspaces.
2. Allows students to assemble shareable portfolios with public and private visibility toggles.
3. Generates QR and cryptographic checksum verification links for employer scrutiny without revealing student private discussion logs.

### Suggested Architecture
- Cryptography: Ed25519 digital signatures or verifiable credentials schema
- Storage: Supabase PostgreSQL with Row Level Security (RLS) enforcement
- UI: Next.js, Tailwind CSS, SVG certificate export

### Evaluation Criteria
- Security of attestation issuance (unforgeable by client scripts)
- User experience for student portfolio configuration and privacy management
- API documentation and automated test coverage`,
    category: 'Developer Tools',
    difficulty: 'Intermediate',
    required_skills: ['Cryptography', 'TypeScript', 'PostgreSQL', 'Next.js', 'Security'],
    deadline: '2026-12-05',
    status: 'Published',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    author: {
      user_id: 'faculty-3',
      display_name: 'Dr. Elena Rostova',
      username: 'dr_elena',
      avatar_url: null,
      college: 'Metropolitan Tech University',
      course: 'Cybersecurity & Distributed Systems',
      role: 'teacher',
    },
    projects_count: 0,
  },
  {
    id: 'ps-4',
    author_id: 'faculty-4',
    title: 'IoT Smart Campus Microgrid & Solar Energy Balancer',
    description: `### Academic Context & Background
Universities consume massive megawatts of power during peak daytime hours while producing solar energy across campus rooftops. Without real-time load balancing and IoT sensor telemetry, power surges occur and battery storage systems degrade prematurely.

### Challenge Requirements
1. Design an IoT telemetry ingestion pipeline simulating campus solar inverters and battery levels.
2. Build an intelligent dispatch algorithm that routes power to high-priority laboratory chillers and computing clusters during peak solar generation.
3. Deliver a real-time web dashboard for campus facility engineers displaying kilowatt-hour savings and anomaly alerts.

### Suggested Architecture
- Sensors: MicroPython / ESP32 or simulated MQTT telemetry streams
- Data Store: Time-series database or PostgreSQL with partitioned tables
- Dashboard: Next.js with Recharts, interactive power flow diagrams

### Evaluation Criteria
- Simulation realism and fault tolerance under sensor dropout
- Visual clarity of the microgrid status UI
- Code structure and reproducibility of the deployment instructions`,
    category: 'IoT/Hardware',
    difficulty: 'Advanced',
    required_skills: ['IoT / Embedded', 'MQTT', 'React', 'Data Visualization', 'Python'],
    deadline: '2027-01-15',
    status: 'Published',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    author: {
      user_id: 'faculty-4',
      display_name: 'Dr. Arvind Swaminathan',
      username: 'dr_arvind',
      avatar_url: null,
      college: 'Institute of Engineering & Tech',
      course: 'Electrical & Sustainable Energy',
      role: 'teacher',
    },
    projects_count: 0,
  },
];
