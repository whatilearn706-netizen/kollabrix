import { Project } from '@/types/database';

export const DEMO_PROJECTS: Project[] = [
  {
    id: 'proj_devsync_ide',
    owner_id: '29359508-c755-424b-81a2-89e714577437',
    title: 'DevSync — Real-Time Collaborative Web IDE & AI Pair Programmer',
    summary:
      'Browser-based multiplayer code sandbox with shared cursors, live terminal execution, and context-aware AI code suggestions for college hackathons.',
    description: `### Problem Statement
During 24-48 hour hackathons, student teams struggle with environment setup mismatches, git merge conflicts, and delayed debugging across laptops with different OS versions.

### Proposed Solution
DevSync provides an instant zero-config cloud development environment. Teams can open a shared workspace URL, see each other's live cursors in real time, run code in isolated Linux containers, and debug together with an integrated AI copilot.

### Tech Stack & Architecture
- Frontend: Next.js 14, Monaco Editor, Tailwind CSS, WebSockets
- Backend: Go microservices, Docker container daemon, Supabase PostgreSQL
- Telemetry & Sync: Yjs CRDTs for sub-10ms conflict-free code syncing

### Open Roles (Recruiting Now)
We have the core CRDT sync engine and terminal runner working. We are actively looking for 2 collegiate teammates:
1. Frontend / UI Designer to polish the Monaco IDE theme & status bar
2. DevOps / Container Engineer to optimize sandbox spin-up times`,
    category: 'Developer Tools',
    difficulty: 'Advanced',
    technologies: ['Next.js', 'TypeScript', 'Go', 'Docker', 'WebSockets', 'Monaco Editor', 'Tailwind CSS'],
    required_skills: ['React', 'TypeScript', 'Go', 'Docker', 'UI/UX'],
    desired_roles: ['Frontend Developer', 'DevOps Engineer', 'UI / UX Designer'],
    current_team_size: 2,
    desired_team_size: 4,
    status: 'Recruiting',
    repository_url: 'https://github.com/whatlearn70/devsync-collaborative-ide',
    demo_url: 'https://kollabrix.in/workspace',
    documentation_url: 'https://docs.kollabrix.in',
    application_deadline: '2026-12-20',
    is_demo: false,
    is_featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner: {
      user_id: '29359508-c755-424b-81a2-89e714577437',
      display_name: 'Mayank Goyal',
      username: 'goyalmayank142',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      college: 'Bosscoder School of Technology',
      course: 'B.Tech Computer Science & AI',
      college_verified: true,
    },
  },
  {
    id: 'proj_aerovision_uav_04',
    owner_id: 'usr_seed_arjun_08',
    title: 'AeroVision — Autonomous Campus UAV Vision & Emergency Response Hub',
    summary:
      'Real-time aerial drone tracking and perimeter safety using edge-quantized YOLOv8 on Jetson Orin Nano, streaming telemetry to a high-speed Go backend.',
    description: `### Problem Statement
Sprawling university campuses face frequent delays in incident response, perimeter patrol bottlenecks, and nighttime medical delivery logistics across distant sports grounds and residential blocks.

### Proposed Solution
AeroVision orchestrates autonomous quadcopters equipped with NVIDIA Jetson Orin Nano running edge-quantized YOLOv8-nano models. The drones stream live telemetry and thermal bounding boxes over WebSockets to a ground station dashboard for instant security and first-aid dispatch.

### Architecture & Implementation
- Edge Vision: Jetson Orin Nano, TensorRT, PyTorch, ROS2
- Ground Station Backend: High-throughput Go server, WebSockets telemetry, PostgreSQL
- Client Dashboard: Next.js 14, Tailwind CSS, Leaflet live flight path rendering

### Open Roles & Collaboration
We have built the drone communication bridge and telemetry pipeline. We are actively recruiting a Frontend / UI/UX Designer and an Embedded C++ Developer to prepare for national collegiate hackathons.`,
    category: 'AI/ML',
    difficulty: 'Advanced',
    technologies: ['Python', 'PyTorch', 'Go', 'Docker', 'TensorRT', 'WebSockets', 'Next.js'],
    required_skills: ['React', 'Figma', 'C++', 'Python', 'Computer Vision'],
    desired_roles: ['UI / UX Designer', 'Embedded C++ Developer', 'Frontend Developer'],
    current_team_size: 2,
    desired_team_size: 4,
    status: 'Recruiting',
    repository_url: 'https://github.com/aerovision-collegiate/aerovision-hub',
    demo_url: 'https://aerovision.kollabrix.in',
    documentation_url: 'https://docs.aerovision.kollabrix.in',
    application_deadline: '2026-12-15',
    is_demo: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    owner: {
      user_id: 'usr_seed_arjun_08',
      display_name: 'Arjun Malhotra',
      username: 'arjun_ml_ai',
      avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
      college: 'Delhi Technological University (DTU)',
      course: 'B.Tech Computer Engineering',
    },
  },
  {
    id: 'demo-1',
    owner_id: 'demo-user-1',
    title: 'EcoRoute: Smart Campus Micro-Mobility & Transit Optimizer',
    summary:
      'A real-time transit routing app optimizing electric shuttles, bike-share stations, and pedestrian paths across collegiate campuses.',
    description: `### Problem Statement
Collegiate campuses cover extensive terrain with thousands of students moving between lectures within tight 10-15 minute windows. Existing maps lack real-time bus telemetry, elevation profiles for wheelchair access, and micro-mobility battery station availability.

### Proposed Solution
EcoRoute unifies campus shuttle GPS feeds with live IoT bike racks and crowd-sourced crowd density data. The platform calculates optimal multimodal paths, predicts bus arrival bottlenecks, and calculates carbon savings per student commute.

### Technology Stack & Architecture
- Frontend: Next.js, Tailwind CSS, Leaflet/Mapbox GL
- Backend: Supabase PostgreSQL, PostGIS for geospatial queries, Edge Functions
- Telemetry: MQTT broker ingesting university shuttle GPS feeds
- Microservices: Route calculation using contraction hierarchies

### What We Are Building Next
We are completing the mobile-first Progressive Web App (PWA) client and need collaborators to implement Bluetooth beacon check-ins and clean map overlays.`,
    category: 'Web Development',
    difficulty: 'Intermediate',
    technologies: ['Next.js', 'PostgreSQL', 'PostGIS', 'Leaflet', 'Tailwind CSS', 'TypeScript'],
    required_skills: ['React', 'GIS / Maps', 'TypeScript', 'Tailwind CSS'],
    desired_roles: ['Frontend Developer', 'UI/UX Designer', 'Mobile Engineer'],
    current_team_size: 2,
    desired_team_size: 4,
    status: 'Recruiting',
    repository_url: 'https://github.com/example/ecoroute-campus',
    demo_url: 'https://ecoroute-preview.example.com',
    documentation_url: 'https://docs.ecoroute.teamforge.edu',
    problem_statement_id: 'ps-1',
    problem_statement: {
      id: 'ps-1',
      title: 'AI-Powered Campus Transit & Micro-Mobility Optimization Engine',
      category: 'AI/ML',
      difficulty: 'Intermediate',
      author: {
        display_name: 'Dr. Radhika Sen',
        role: 'teacher',
      },
    },
    application_deadline: '2026-11-15',
    is_demo: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    owner: {
      user_id: 'demo-user-1',
      display_name: 'Aarav Sharma',
      username: 'aarav_dev',
      avatar_url: null,
      college: 'Institute of Engineering & Tech',
      course: 'Computer Science & Engineering',
    },
  },
  {
    id: 'demo-2',
    owner_id: 'demo-user-2',
    title: 'NeuroScan: Explainable MRI Brain Lesion Classification',
    summary:
      'Computer vision pipeline utilizing deep convolutional neural networks with Grad-CAM visual heatmaps to assist student radiologist research.',
    description: `### Problem Statement
Medical imaging research in academic settings frequently struggles with model interpretability. Black-box deep learning models predict classifications without exposing visual justification, limiting their utility in educational and clinical research settings.

### Proposed Solution
NeuroScan provides an interactive web interface where researchers can upload DICOM/NIfTI brain scan slices, run inference across fine-tuned ResNet and EfficientNet backbones, and immediately observe pixel-level attention heatmaps through Grad-CAM.

### Technology Stack & Architecture
- ML Core: PyTorch, TorchVision, MONAI (Medical Open Network for AI)
- Backend: FastAPI, Celery with Redis for asynchronous inference queues
- Client: React, Three.js slice renderer, Tailwind CSS
- Data Handling: Anonymized BraTS benchmark dataset

### Team Needs
Looking for an ML engineer interested in model quantizing (ONNX) and a frontend engineer experienced with Canvas/WebGL renderers.`,
    category: 'AI/ML',
    difficulty: 'Advanced',
    technologies: ['PyTorch', 'FastAPI', 'Python', 'React', 'Three.js', 'Docker'],
    required_skills: ['PyTorch', 'Computer Vision', 'FastAPI', 'WebGL'],
    desired_roles: ['ML Engineer', 'Full-stack Developer', 'Research Lead'],
    current_team_size: 2,
    desired_team_size: 3,
    status: 'Recruiting',
    repository_url: 'https://github.com/example/neuroscan-core',
    demo_url: null,
    documentation_url: 'https://neuroscan.docs.example.org',
    problem_statement_id: 'ps-2',
    problem_statement: {
      id: 'ps-2',
      title: 'Explainable Deep Learning Pipeline for Medical Imaging Diagnosis',
      category: 'AI/ML',
      difficulty: 'Advanced',
      author: {
        display_name: 'Prof. Marcus Vance',
        role: 'teacher',
      },
    },
    application_deadline: '2026-12-01',
    is_demo: true,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    owner: {
      user_id: 'demo-user-2',
      display_name: 'Priya Narang',
      username: 'priyan_ai',
      avatar_url: null,
      college: 'National University of Tech',
      course: 'AI & Data Science',
    },
  },
  {
    id: 'demo-3',
    owner_id: 'demo-user-3',
    title: 'CodePulse: Interactive Multiplayer Algorithm Sandbox',
    summary:
      'Real-time collaborative developer playground with step-by-step state visualization for complex graph and tree algorithms.',
    description: `### Problem Statement
Understanding intricate algorithms (Dijkstra, Tarjan SCC, Red-Black Trees, A*) from static textbook diagrams is notoriously difficult for computer science undergrads.

### Proposed Solution
CodePulse allows 2-5 students to enter a shared sandbox room, write code in Python or TypeScript, and view the underlying memory pointers, call stacks, and graph nodes visually render and step forward/backward in synchronization.

### Technical Stack
- Real-time Sync: WebSockets, Yjs CRDT for multiplayer document state
- Visuals: D3.js and SVG animation engine
- Execution: WebAssembly sandboxed runner for client-side safe execution
- Architecture: Next.js 14 App Router, Tailwind CSS, Lucide icons`,
    category: 'Developer Tools',
    difficulty: 'Intermediate',
    technologies: ['TypeScript', 'Next.js', 'WebSockets', 'WebAssembly', 'D3.js'],
    required_skills: ['TypeScript', 'D3.js', 'Algorithms', 'React'],
    desired_roles: ['Frontend Developer', 'Core Algorithm Specialist'],
    current_team_size: 1,
    desired_team_size: 3,
    status: 'Recruiting',
    repository_url: 'https://github.com/example/codepulse-sandbox',
    demo_url: 'https://codepulse.example.com',
    application_deadline: null,
    is_demo: true,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    owner: {
      user_id: 'demo-user-3',
      display_name: 'Devon Vance',
      username: 'devon_v',
      avatar_url: null,
      college: 'Metropolitan Polytechnic',
      course: 'Software Engineering',
    },
  },
  {
    id: 'demo-4',
    owner_id: 'demo-user-4',
    title: 'AgriSense: Autonomous Crop Disease Detection on Edge Microcontrollers',
    summary:
      'Low-cost ESP32-CAM and Raspberry Pi vision nodes deployed across campus experimental gardens to detect foliar blight and pest infestations.',
    description: `### Problem Statement
Small-scale university botanical greenhouses and urban research plots rely on manual inspection by student caretakers, leading to delayed disease detection and crop loss.

### Proposed Solution
Battery-efficient IoT nodes equipped with solar harvesters capture periodic high-resolution leaf imagery, run a quantized MobileNet edge classification model, and transmit telemetry alerts over LoRaWAN to a campus dashboard.

### Roadmap
1. Prototype PCB design and solar power regulation circuit.
2. Lightweight edge inference pipeline with TensorFlow Lite for Microcontrollers.
3. Central monitoring dashboard for agricultural students.`,
    category: 'IoT/Hardware',
    difficulty: 'Advanced',
    technologies: ['C++', 'Python', 'TensorFlow Lite', 'ESP32', 'LoRaWAN', 'FastAPI'],
    required_skills: ['Embedded C++', 'Hardware / PCB', 'Edge ML'],
    desired_roles: ['Hardware Engineer', 'Firmware Developer', 'Dashboard Designer'],
    current_team_size: 2,
    desired_team_size: 4,
    status: 'In Progress',
    repository_url: 'https://github.com/example/agrisense-iot',
    demo_url: null,
    application_deadline: '2026-11-20',
    is_demo: true,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    owner: {
      user_id: 'demo-user-4',
      display_name: 'Kavita Patel',
      username: 'kavita_iot',
      avatar_url: null,
      college: 'Agricultural & Technological Institute',
      course: 'Electrical & Electronics Engineering',
    },
  },
  {
    id: 'demo-5',
    owner_id: 'demo-user-5',
    title: 'FoodRescue: Campus Dining Surplus Redistribution Network',
    summary:
      'Connecting campus cafeterias, student clubs with leftover catered food, and local community shelters to eliminate food waste.',
    description: `### Problem Statement
College campus events and dining halls dispose of hundreds of kilograms of high-quality unconsumed food daily due to absence of rapid logistics coordination.

### Proposed Solution
A rapid dispatch alert app where catering teams post edible surplus with allergy tags and pickup windows. Verified student volunteers receive notifications, reserve batches, and coordinate direct transit to campus pantry hubs.`,
    category: 'Social Impact',
    difficulty: 'Beginner',
    technologies: ['React Native', 'Node.js', 'Supabase', 'Tailwind CSS'],
    required_skills: ['Mobile Development', 'React / React Native', 'UI/UX'],
    desired_roles: ['Mobile Developer', 'Community Coordinator', 'Product Designer'],
    current_team_size: 3,
    desired_team_size: 4,
    status: 'Recruiting',
    repository_url: 'https://github.com/example/foodrescue-campus',
    demo_url: null,
    application_deadline: '2026-11-30',
    is_demo: true,
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    owner: {
      user_id: 'demo-user-5',
      display_name: 'Marcus Chen',
      username: 'marcus_c',
      avatar_url: null,
      college: 'Pacific State University',
      course: 'Information Systems',
    },
  },
  {
    id: 'demo-6',
    owner_id: 'demo-user-6',
    title: 'StudyForge: Offline-First Peer Collaborative Note Graph',
    summary:
      'Cross-platform markdown note-taking app with bidirectional Wikilinks and local CRDT peer-to-peer sync over college Wi-Fi.',
    description: `### Problem Statement
Students attending lectures in auditoriums with spotty cellular reception need reliable notes that can sync seamlessly with study group partners without mandatory cloud lock-in.

### Proposed Solution
StudyForge uses SQLite + CRDTs in the browser/client to provide instant note capture, knowledge graph linking, and zero-configuration local subnet sync.`,
    category: 'Mobile Apps',
    difficulty: 'Intermediate',
    technologies: ['Flutter', 'Dart', 'SQLite', 'WebRTC', 'Markdown'],
    required_skills: ['Flutter', 'Mobile Architecture', 'Peer-to-Peer'],
    desired_roles: ['Flutter Developer', 'UI/UX Designer'],
    current_team_size: 2,
    desired_team_size: 3,
    status: 'In Progress',
    repository_url: 'https://github.com/example/studyforge-mobile',
    demo_url: null,
    application_deadline: null,
    is_demo: true,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    owner: {
      user_id: 'demo-user-6',
      display_name: 'Sophia Lindqvist',
      username: 'sophia_l',
      avatar_url: null,
      college: 'City Institute of Technology',
      course: 'Computer Science',
    },
  },
];
