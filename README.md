# 🕊️ Linkora — College-Wide Student Project Collaboration & Hackathon Platform

[![Live Production](https://img.shields.io/badge/Live%20Demo-linkora--edu.vercel.app-10b981?style=for-the-badge&logo=vercel)](https://linkora-edu.vercel.app)
[![Next.js 14](https://img.shields.io/badge/Next.js%2014-App%20Router-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%205.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-Modern%20Design-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-3D%20Origami-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

> **Linkora** is a full-stack, enterprise-grade collaboration ecosystem built for universities and engineering colleges. It connects ambitious student developers, designers, and researchers to assemble hackathon dream teams, tackle real-world faculty problem statements, and build standout software portfolios together.

---

## 🌐 Live Production Deployment

Experience the live platform:
* **Primary Live Application**: [https://linkora-edu.vercel.app](https://linkora-edu.vercel.app)
* **Mirror Domain**: [https://linkora-college.vercel.app](https://linkora-college.vercel.app)

---

## ✨ Key Features & Architectural Highlights

### 1. 🎨 Interactive 3D Origami Sculpture (Three.js WebGL)
* Custom-crafted 3D geometric origami bird emblem rendered in real-time WebGL.
* Features tactile mouse-tracking parallax, smooth yaw-roll banking kinematics, and dynamic shadow crease lighting.
* Responsive multi-touch orbit navigation on desktop and mobile.

### 2. 🔍 Project & Teammate Discovery
* **Full-Text Exploration**: Filter by category (AI/ML, Web3, Mobile, Systems, IoT), difficulty level, and required tech stacks.
* **Teammate Matchmaker**: Browse verified student profiles with skill tags (React, PyTorch, Rust, Solidity), academic year, and preferred team roles.
* **Instant Application Flow**: One-click project applications with custom cover notes and applicant review workspaces.

### 3. 🏆 Private Hackathon Arena & Team Assembling
* Host private, password-protected collegiate hackathons.
* Real-time countdown clock, prize tracks, participant leaderboards, and direct team registration.
* Automatic room-code authentication protecting internal university hackathons.

### 4. 🎓 Faculty Portal & Industry Problem Bank
* Dedicated dashboard for professors and departmental heads to post industry-grade problem statements.
* Students can claim verified faculty problems as their capstone or final-year engineering projects.

### 5. 🤖 AI Project Planner
* Built-in intelligent system architecture assistant.
* Automatically analyzes high-level project ideas and generates complete technical roadmaps, milestone deadlines, and task breakdowns.

### 6. 🛠️ Complete Project Workspaces
* **Kanban Task Board**: Drag-and-drop task workflow (Backlog, In Progress, In Review, Done).
* **Milestone Progress Tracker**: Visual progress bars and release goals.
* **Team Discussions**: In-app team forum with pinned announcements and threaded replies.
* **GitHub Integration**: Direct repository sync and commit tracking.

### 7. ⚡ Instant 1-Click OAuth & Modern Security
* Fast, 1-click Google and GitHub authentication with zero email verification delays.
* Secure cookie sessions managed by Next.js middleware and `@supabase/ssr`.
* PostgreSQL Row-Level Security (RLS) policies ensuring strict privacy across student records and applications.

### 8. 🎛️ Real-Time Admin Control Center (`/control-center-7x9`)
* Live platform-wide design system customizer (Canvas background, brand accents, typography, border radius).
* Content moderation tools for projects, hackathons, and user accounts.
* Role-based access control (Student, Faculty, Platform Administrator).

---

## 🏗️ Tech Stack & Dependencies

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | **Next.js 14** (App Router, Server & Client Components) |
| **Language** | **TypeScript** (Strict Type Checking) |
| **3D Rendering** | **Three.js** (Custom WebGL Geometries, Flat-Shaded Origami Shaders) |
| **Styling & UI** | **Tailwind CSS**, CSS Variables Theme Engine, Lucide Icons, Canvas Confetti |
| **Database & Auth** | **Supabase PostgreSQL**, Supabase Auth (OAuth Providers), Row-Level Security (RLS) |
| **Hosting & CI/CD** | **Vercel Edge Network**, Automated production build pipeline |

---

## 📁 Repository Directory Structure

```text
TEAMFORGE/
├── src/
│   ├── app/                      # Next.js 14 App Router (49 routes)
│   │   ├── (auth)/               # Login & Signup flows
│   │   ├── control-center-7x9/   # Private Admin Control Center
│   │   ├── explore/              # Project search & discovery
│   │   ├── hackathons/           # Private hackathon arena & workspaces
│   │   ├── problems/             # Faculty Problem Bank
│   │   ├── projects/             # Workspace, Kanban, Milestones, Discussions
│   │   ├── teacher/              # Faculty & Professor Portal
│   │   ├── teammates/            # Student matchmaker & talent directory
│   │   ├── robots.ts             # Dynamic SEO robots.txt generator
│   │   └── sitemap.ts            # Dynamic XML sitemap generator
│   ├── components/
│   │   ├── admin/                # Theme & platform moderation controls
│   │   ├── auth/                 # Fast 1-click OAuth forms & modal guards
│   │   ├── canvas/               # Three.js 3D Origami sculpture
│   │   ├── layout/               # Dynamic Navbar, Footer, Drawers
│   │   ├── notifications/        # Real-time bell & alert center
│   │   └── ui/                   # Reusable accessible component library
│   ├── lib/
│   │   └── supabase/             # Client, server, and middleware auth clients
│   └── types/                    # Shared TypeScript interfaces & models
├── supabase/
│   └── migrations/               # Production PostgreSQL database schema
└── public/                       # Static brand logos, bird avatars, and badges
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js** 18.17+ or higher
* **npm** or **pnpm** / **yarn**
* A free [Supabase](https://supabase.com) account

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/linkora.git
cd linkora
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup
1. In your Supabase dashboard, open the **SQL Editor**.
2. Run the SQL schema found in `supabase/migrations/20261015000000_phase1_init.sql`.
3. In Supabase Console &rarr; **Authentication** &rarr; **Providers**, enable **Google** (and optionally **GitHub**).

### 5. Launch local development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for production
```bash
npm run build
npm run start
```

---

## 🛡️ Security & Privacy
* **Zero Plaintext Credentials**: All authentication handled via cryptographic tokens and OAuth PKCE flows.
* **Row-Level Security (RLS)**: Enforced at the database engine level so users can only modify their own projects, workspace tasks, and personal data.
* **Sanitized Inputs**: XSS and injection prevention on all rich markdown fields.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License
This project is licensed under the **MIT License** — feel free to customize and deploy it for your university or hackathon!

---

<p align="center">
  Built with ❤️ for collegiate builders, engineers, and creators.
</p>
