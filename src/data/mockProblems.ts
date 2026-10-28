import { ProblemStatement } from '@/types/database';

export const DEMO_PROBLEMS: ProblemStatement[] = [
  {
    id: 'fac-ai-attendance-edge',
    author_id: 'prof-anirban-iitkgp',
    title: 'Edge-Optimized Real-Time Multi-Camera Student Attendance & Engagement Analyzer',
    description: `### Academic Context & Background
Traditional roll-call in 150+ student university lecture halls consumes 10 to 15 minutes of instructional time. Fingerprint scanners form slow bottleneck queues at doorway entrances, and commercial facial recognition cloud systems violate campus data sovereignty guidelines by transmitting raw biometrics to third-party servers.

For our Embedded Systems & Machine Learning Lab, student teams are challenged to design a decentralized edge appliance that processes local camera streams on campus without raw video ever leaving the classroom switch.

### Specific Engineering Objectives
1. **Low-Latency Edge Ingestion:** Ingest dual RTSP video streams (1080p @ 15fps) from standard IP classroom cameras.
2. **Face Detection & Vector Extraction:** Run a quantized YOLOv8n-face detection model coupled with an ArcFace 512-dimensional embedding pipeline optimized with TensorRT or ONNX Runtime to maintain >= 12 FPS on edge hardware (Nvidia Jetson Orin Nano or Raspberry Pi 5).
3. **Privacy-Preserving Verification:** Compute cosine similarity matching against pre-enrolled student feature vectors. Raw face crops must be discarded in RAM after vectorization; only anonymized vectors and roll numbers are matched.
4. **Offline Resilience & Audit Sync:** Cache verified attendance records locally in SQLite with cryptographic SHA-256 batch hashes, syncing with the central campus ERP once laboratory connectivity is validated.

### Expected Deliverables
- Working Python/C++ pipeline running on local or containerized hardware with live FPS and inference latency overlay.
- Web dashboard displaying real-time classroom heatmaps, attendance percentages, and CSV/JSON export for university grading portals.
- Comprehensive technical report detailing false positive rate (FPR) vs. false negative rate (FNR) trade-offs across challenging low-light lecture environments.`,
    category: 'AI/ML',
    difficulty: 'Intermediate',
    required_skills: ['Python', 'OpenCV', 'PyTorch / ONNX', 'FastAPI', 'PostgreSQL / SQLite', 'Docker'],
    deadline: '2026-11-25',
    status: 'Published',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    author: {
      user_id: 'prof-anirban-iitkgp',
      display_name: 'Prof. Anirban Mukherjee',
      username: 'anirban_cse',
      avatar_url: null,
      college: 'Indian Institute of Technology Kharagpur',
      course: 'Dept. of Computer Science & Engineering',
      role: 'teacher',
    },
    projects_count: 3,
  },
  {
    id: 'fac-raft-distributed-kv',
    author_id: 'dr-shalini-bits',
    title: 'Fault-Tolerant Distributed Key-Value Store with Raft Consensus & Write-Ahead Logging',
    description: `### Academic Context & Background
In distributed computing, managing synchronized state across untrusted network partitions without single points of failure is a foundational systems problem.

As part of the Advanced Distributed Systems semester capstone, students must build a distributed, linearizable Key-Value storage engine implementing the Raft consensus algorithm from scratch (without utilizing existing Raft libraries such as HashiCorp Raft or SOFA-JRaft).

### Specific Engineering Objectives
1. **Raft Core State Machine:** Implement complete leader election (randomized heartbeats, candidate election terms), log replication with consistency invariants, and state commitment.
2. **Durability & Crash Recovery:** Write logs to disk using append-only Write-Ahead Logging (WAL) and implement periodic log compaction via memory snapshotting. The node must seamlessly recover its committed state upon simulated reboot.
3. **Partition Resilience & Jepsen Validation:** Verify system behavior under simulated network splits (split-brain resistance, minority partition write rejection, and automatic log reconciliation when the partition heals).
4. **Client API & Benchmarking:** Expose a gRPC / HTTP client interface supporting \`GET(key)\`, \`PUT(key, val)\`, and atomic \`CAS(key, oldVal, newVal)\`. Demonstrate sustained throughput exceeding 8,000 requests/sec across a 5-node cluster.

### Evaluation Criteria
- Correctness under automated partition stress tests (zero data loss or stale reads during active leader failure).
- Memory footprint and write amplification metrics.
- Code modularity and separation of the network RPC layer from the core Raft consensus state machine.`,
    category: 'Developer Tools',
    difficulty: 'Advanced',
    required_skills: ['Go', 'Rust', 'C++', 'gRPC', 'Distributed Systems', 'Linux Concurrency'],
    deadline: '2026-12-05',
    status: 'Published',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    author: {
      user_id: 'dr-shalini-bits',
      display_name: 'Dr. Shalini Ramanathan',
      username: 'shalini_distrib',
      avatar_url: null,
      college: 'BITS Pilani (Pilani Campus)',
      course: 'Distributed Systems & Cloud Computing Lab',
      role: 'teacher',
    },
    projects_count: 5,
  },
  {
    id: 'fac-microgrid-solar-optimizer',
    author_id: 'prof-devendra-dtu',
    title: 'Campus Solar Microgrid Telemetry Ingestion & Automated Battery Dispatch Optimizer',
    description: `### Academic Context & Background
Our university operates an 800 kW rooftop photovoltaic (PV) solar installation paired with a 400 kWh lithium-ion battery energy storage system (BESS). Because grid electricity tariff charges triple during peak evening hours (5:00 PM – 9:00 PM), inefficient battery discharge during the day leads to substantial campus utility overspending.

### Specific Engineering Objectives
1. **Hardware Telemetry Connector:** Ingest real-time metrics (AC active power, DC string voltages, battery state-of-charge, ambient inverter temperature) via Modbus TCP / MQTT from campus solar inverters at 5-second sampling intervals.
2. **Irradiance & Load Forecasting:** Train a hybrid PatchTST / temporal convolutional forecasting model utilizing historical 15-minute campus consumption data and IMD meteorological solar irradiance forecasts to predict the next 24-hour generation curve.
3. **Mixed-Integer Linear Programming (MILP) Dispatch:** Formulate and solve a real-time battery scheduling optimization problem (minimizing peak grid demand charges while respecting battery C-rate cycle degradation constraints).
4. **Supervisory Control Dashboard:** Construct a responsive operations console allowing campus facility engineers to review scheduled vs. actual battery state-of-charge (SoC), carbon offsets, and estimated daily electricity cost savings.

### Expected Deliverables
- Fully runnable Dockerized pipeline containing the telemetry simulator/collector, forecasting engine, and PuLP/SciPy optimizer.
- Interactive web frontend displaying live wattage flows between Solar -> Battery -> Campus Grid.
- Mathematical formulation document specifying state variables, objective functions, and thermal safety boundaries.`,
    category: 'IoT/Hardware',
    difficulty: 'Intermediate',
    required_skills: ['Python', 'Time-Series Forecasting', 'Linear Programming', 'MQTT / Modbus', 'React', 'FastAPI'],
    deadline: '2026-11-28',
    status: 'Published',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    author: {
      user_id: 'prof-devendra-dtu',
      display_name: 'Prof. Devendra K. Joshi',
      username: 'dk_joshi_dtu',
      avatar_url: null,
      college: 'Delhi Technological University (DTU)',
      course: 'Dept. of Electrical Engineering & Smart Energy Systems',
      role: 'teacher',
    },
    projects_count: 2,
  },
  {
    id: 'fac-dicom-webgl-viewer',
    author_id: 'dr-meenakshi-anna',
    title: 'Browser-Based 3D DICOM Volumetric Medical Imaging Viewer with Real-Time Multi-Planar Reconstruction',
    description: `### Academic Context & Background
Teaching hospitals and medical colleges require student interns and radiology residents to examine cross-sectional computed tomography (CT) and magnetic resonance imaging (MRI) volumes. Desktop workstation software (such as Horos or OsiriX) requires high-end dedicated GPUs and local installations that are inaccessible during remote clinical rotations.

This project challenges computer science and biomedical engineering students to build a zero-install, browser-based volumetric medical imaging suite using modern WebGL 2.0 and Web Workers.

### Specific Engineering Objectives
1. **Streaming DICOM Parser:** Parse multipart DICOM Part 10 streams (\`.dcm\`) in background Web Workers, extracting patient metadata, photometric interpretation, slice thickness, pixel spacing, and rescale slope/intercept values.
2. **Multi-Planar Reconstruction (MPR):** Reconstruct orthogonal cross-sections (Axial, Coronal, and Sagittal planes) in real time from a stacked 3D scalar volume grid with trilinear interpolation.
3. **Dynamic Window / Level (Hounsfield Unit Mapping):** Implement fragment shader windowing enabling radiologists to fluidly adjust contrast for soft tissue, bone windowing (W: 2000, L: 500), and lung windowing (W: 1500, L: -600).
4. **Clinical Annotation & Measurement:** Provide pixel-accurate calibrated distance calipers (using pixel spacing DICOM tags), Cobb angle measurement, and region-of-interest (ROI) mean Hounsfield density calculation.

### Expected Deliverables
- Web application loading standard test datasets (e.g. TCIA Cancer Imaging Archive DICOM series) with 60 FPS viewport navigation.
- WebGL 2.0 custom GLSL shaders executing real-time thresholding and multi-planar sampling.
- Full compliance with client-side HIPAA anonymization (automatic stripping of patient PII tags before rendering).`,
    category: 'Web Development',
    difficulty: 'Advanced',
    required_skills: ['TypeScript', 'WebGL / Three.js', 'Web Workers', 'DICOM Web', 'Next.js', 'GLSL'],
    deadline: '2026-12-10',
    status: 'Published',
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    author: {
      user_id: 'dr-meenakshi-anna',
      display_name: 'Dr. Meenakshi Sundaram',
      username: 'meenakshi_bio',
      avatar_url: null,
      college: 'College of Engineering, Guindy (Anna University)',
      course: 'Center for Medical Informatics & Biomedical Engineering',
      role: 'teacher',
    },
    projects_count: 4,
  },
  {
    id: 'fac-zk-credentials-ledger',
    author_id: 'prof-rajeshwari-nitk',
    title: 'Zero-Knowledge Academic Credential Issuance & Instant Cryptographic Verification Portal',
    description: `### Academic Context & Background
With the proliferation of forged degrees and tampered mark sheets, companies and higher-education institutions face significant delay in manually verifying collegiate transcripts. Meanwhile, students are forced to surrender unredacted grade sheets containing sensitive demographic and personal information to third-party recruiters.

### Specific Engineering Objectives
1. **Verifiable Credential Issuer:** Implement the W3C Verifiable Credentials standard using Ed25519 or ECDSA cryptographic keypairs managed by the university registrar.
2. **Zero-Knowledge Range Proofs:** Employ zk-SNARK circuits (e.g. using Circom / SnarkJS) that allow a graduated student to prove assertions such as "CGPA >= 8.5" or "Completed B.Tech Computer Science in 2026" without revealing the exact individual course marks or student roll number.
3. **Instant Verification Scanner:** Build an offline-capable mobile/desktop PWA camera scanner that scans a QR code generated by the student, verifies the mathematical cryptographic proof in < 500ms, and displays a tamper-evident authentic green seal.
4. **Revocation Registry:** Design a space-efficient Merkle Tree accumulator enabling the university administration to invalidate compromised or revoked credentials in constant-size proofs.

### Expected Deliverables
- Cryptographic smart contract / microservice for registrar credential signing.
- Verified Zero-Knowledge Circom circuits with setup artifacts and proof generation tests.
- Clean Next.js student portal for credential download and employer verification kiosk.`,
    category: 'Developer Tools',
    difficulty: 'Intermediate',
    required_skills: ['TypeScript', 'Circom / zk-SNARKs', 'Cryptography', 'Next.js', 'PostgreSQL', 'Web3'],
    deadline: '2026-12-01',
    status: 'Published',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    author: {
      user_id: 'prof-rajeshwari-nitk',
      display_name: 'Prof. Rajeshwari Venkat',
      username: 'rajeshwari_crypto',
      avatar_url: null,
      college: 'National Institute of Technology Karnataka (NITK Surathkal)',
      course: 'Dept. of Information Technology & Cryptography Lab',
      role: 'teacher',
    },
    projects_count: 3,
  },
  {
    id: 'fac-lidar-slam-delivery-bot',
    author_id: 'dr-subramanian-iiith',
    title: '2D LiDAR SLAM & Dynamic Collision Avoidance for Autonomous Campus Mail Courier Bot',
    description: `### Academic Context & Background
Our robotics research group is deploying small autonomous differential-drive ground robots to deliver academic inter-departmental mail and lab consumables between academic blocks and research centers. The robots must navigate shared pedestrian walkways crowded with students, bicycles, and temporary construction detours.

### Specific Engineering Objectives
1. **LiDAR SLAM Mapping:** Implement a 2D LiDAR Simultaneous Localization and Mapping (SLAM) node utilizing Cartographer or SLAM Toolbox to generate 5cm-resolution occupancy grid maps of the campus quadrangle.
2. **Dynamic Obstacle Tracking & Costmap Layers:** Ingest point clouds from a 360-degree LiDAR and ultrasonic rangefinders. Create a dynamic costmap inflation layer in ROS2 Nav2 that accounts for approaching pedestrians and decelerates safely rather than freezing in place.
3. **Hybrid Path Planning:** Configure a global Hybrid A* / Smac planner with a local TEB (Timed Elastic Band) trajectory planner that executes smooth turning radius maneuvers without oscillating near obstacles.
4. **Fleet Tele-operation & Heartbeat:** Implement an emergency WebSocket telemetry link transmitting battery level, current waypoint goal, and remote override commands to a central campus station.

### Expected Deliverables
- ROS2 Humble packages with launch files for Gazebo simulation and physical differential drive robot hardware.
- Benchmarked map accuracy metrics (loop closure consistency and error drift over 1km path).
- Demonstration video showing autonomous recovery from dead-end corridors and dynamic avoidance of moving pedestrians.`,
    category: 'IoT/Hardware',
    difficulty: 'Advanced',
    required_skills: ['C++', 'Python', 'ROS2 (Humble)', 'Nav2', 'SLAM', 'Gazebo Simulation', 'Linux'],
    deadline: '2026-12-15',
    status: 'Published',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    author: {
      user_id: 'dr-subramanian-iiith',
      display_name: 'Dr. K. V. Subramanian',
      username: 'subramanian_robotics',
      avatar_url: null,
      college: 'IIIT Hyderabad (International Institute of Information Technology)',
      course: 'Robotics Research Center & Autonomous Systems',
      role: 'teacher',
    },
    projects_count: 4,
  },
];
