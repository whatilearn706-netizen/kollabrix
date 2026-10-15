# TeamForge — College-Wide Student Project Collaboration Platform

TeamForge helps college students discover project ideas, find collaborators with complementary skills, and build meaningful software projects together.

---

## 🚀 Phase 1 Features Implemented

1. **Responsive Dark Developer Interface & Landing Page**
   - Premium dark charcoal aesthetic (`#090B10` background with restrained indigo/violet accents).
   - Composed live UI component preview in the hero section.
   - Core value sections: Problem breakdown, 3-step workflow, and role-based benefits for Idea Creators, Developers, Designers, and AI/ML Engineers.
   - Clean navigation with mobile drawer menu and accessible focus states.

2. **Authentication & Session Handling**
   - Student registration with display name, email, password, and confirmation.
   - Secure login, logout, password visibility toggle, and forgot-password reset flow.
   - Automatic session refresh via Next.js middleware and cookie synchronization.
   - Friendly modal and page guards for unauthenticated access attempts.
   - **Zero security compromises**: Passwords never stored in plaintext, client tokens strictly limited to Supabase anon keys, and service-role keys are never exposed.

3. **Student Profiles with Skills & Interests**
   - Display name, unique username validation, college, branch/course, and academic year.
   - Interactive tag inputs for Technical Skills, Project Interests, and Preferred Team Roles.
   - Profile completeness calculation indicator with an actionable checklist.
   - Public student profile page (`/profile/[username]`) displaying student skills and project portfolio **without exposing private email addresses**.

4. **Project Creation & Discovery**
   - Publish project proposals with title, summary, markdown problem/solution, category, difficulty, tech stack tags, teammate skill requirements, team size targets, and external links.
   - Full explore page (`/explore`) with full-text search, category filters, difficulty filters, status filters, skill tag filters, and sorting (Newest / Alphabetical).
   - Owner-restricted editing and deletion with safety confirmation dialogs.
   - Seamless coexistence of realistic curated demo projects with live user-submitted projects.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom charcoal & indigo design system
- **Icons**: Lucide React
- **Backend & Auth**: Supabase PostgreSQL, Supabase Auth (`@supabase/ssr`)
- **Security**: PostgreSQL Row Level Security (RLS) on all tables

---

## ⚡ Quick Start & Beginner-Friendly Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase (3 Simple Steps)

1. Create a free Supabase project at [https://supabase.com](https://supabase.com).
2. Go to **Project Settings &rarr; API** in your Supabase dashboard and copy your **Project URL** and **anon/public key**.
3. Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
   ```
4. In Supabase, open the **SQL Editor**, paste the SQL from `supabase/migrations/20261015000000_phase1_init.sql`, and click **Run**.

*(Note: Even before setting up Supabase, the app will run with all demo projects and interactive discovery filters enabled!)*

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```
