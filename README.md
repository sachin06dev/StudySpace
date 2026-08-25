# StudySpace

Productivity workspace for learners.

[![Next.js](https://img.shields.io/badge/Next.js-16.3.1-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%7C%20DB%20%7C%20Storage-3ecf8e?logo=supabase)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Overview

Students often deal with fragmented study workflows: YouTube lecture tabs, scattered notes, separate task managers, external Pomodoro timers, study resources, and documents stored across different places.

**StudySpace** brings lecture viewing, interactive timestamped note-taking, task management, Pomodoro focus tracking, resource management, private document storage, and study analytics into a single, cohesive learning and productivity workspace.

---

## Features

- **Dashboard**: Unified overview with personalized greeting, today's study progress, active task summary, recent Pomodoro sessions, continue-learning shortcuts, quick actions, and a 365-day study consistency heatmap.
- **Tasks**: Full-featured task manager supporting priorities (Low, Medium, High), categories, due dates, completion toggles, status filters, and real-time task counts.
- **Pomodoro**: Customizable focus and break timer with audio chimes (Web Audio API), auto-start breaks, persistent state across in-app navigation, and automatic study time logging.
- **Videos**: YouTube video hub with automatic server-side metadata retrieval (title, channel, duration, thumbnail), playback progress tracking, last-watched timestamps, and keyboard shortcuts.
- **Playlists**: Import entire YouTube playlists with batched server-side video fetching, overall progress calculation, and playlist item tracking.
- **Resources**: Organize, categorize, and search web articles, documentation, tutorials, and external study links with automatic favicon fetching.
- **Notes**: Capture timestamped study notes during video playback; clicking a timestamp jumps the video to the corresponding second. Access and search notes across videos from a central library.
- **Documents**: Securely upload, categorize, and view private study PDFs and documents (up to 50MB) through Supabase Storage with short-lived signed URLs and user isolation. Document uploads use standard file pickers without camera or microphone permissions.
- **Analytics**: Visualize daily and weekly study hours, Pomodoro completion counts, task velocity, weekly focus trends, milestone achievements, and a 365-day study activity heatmap.

---

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Components & Server Actions)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI & Styling**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [next-themes](https://github.com/pacocoursey/next-themes) (Dark/Light mode)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security & Supabase Auth)
- **File Storage**: [Supabase Storage](https://supabase.com/storage) (private `study-documents` bucket with signed URLs)
- **External APIs**: [YouTube Data API v3](https://developers.google.com/youtube/v3/) (server-only metadata fetching)
- **Deployment**: [Vercel](https://vercel.com/) (Analytics & Speed Insights integrated)

---

## Live Demo

Experience StudySpace live:

🔗 **[https://studyspace4u.vercel.app](https://studyspace4u.vercel.app)**

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20.x or later recommended)
- [npm](https://www.npmjs.com/) (or yarn / pnpm)
- A [Supabase](https://supabase.com/) project
- A [Google Cloud](https://console.cloud.google.com/) project with YouTube Data API v3 enabled

### 1. Clone the Repository

```bash
git clone https://github.com/sachin06dev/StudySpace.git
cd StudySpace
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your configuration:

```ini
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
YOUTUBE_API_KEY=your-youtube-data-api-v3-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Setup Database & Storage

1. Navigate to your Supabase project's **SQL Editor**.
2. Run the SQL script located at [`supabase/schema.sql`](supabase/schema.sql).
3. This creates the application's database tables, enables Row Level Security (RLS) policies, provisions the private `study-documents` bucket, and configures user profile triggers.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable | Description | Exposure |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project API URL | Public (Client & Server) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous public API key | Public (Client & Server) |
| `YOUTUBE_API_KEY` | Google Cloud API key with YouTube Data API v3 enabled | **Server-Only Secret** |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL | Public (Optional) |

See [`.env.example`](.env.example) for the required variable names.

---

## Project Structure

```text
studyspace/
├── app/                        # Next.js App Router
│   ├── (app)/                  # Authenticated workspace routes
│   │   ├── analytics/          # Study analytics & heatmap
│   │   ├── dashboard/          # Central dashboard view
│   │   ├── documents/          # Private document storage
│   │   ├── notes/              # Notes hub & video notes
│   │   ├── playlists/          # YouTube playlists & details
│   │   ├── pomodoro/           # Pomodoro timer & settings
│   │   ├── resources/          # Web resource manager
│   │   ├── settings/           # Profile & preference settings
│   │   ├── tasks/              # Task management
│   │   └── videos/             # YouTube video study player
│   ├── (auth)/                 # Authentication pages
│   ├── api/                    # Server-side API endpoints
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
├── components/                 # Reusable UI & feature components
│   ├── analytics/              # Analytics charts, metrics, heatmap
│   ├── dashboard/              # Dashboard widgets & cards
│   ├── documents/              # Document upload & view cards
│   ├── landing/                # Landing page sections & preview
│   ├── layout/                 # App shell, sidebar, mobile navigation
│   ├── pomodoro/               # Pomodoro timer & widgets
│   ├── shared/                 # Theme toggle, logos, modals
│   ├── tasks/                  # Task forms, items, filters
│   └── videos/                 # Video player, shortcuts, notes
├── config/                     # Application configuration
├── lib/                        # Core application logic
│   ├── actions/                # Next.js Server Actions
│   ├── analytics/              # Analytics calculation utilities
│   ├── data/                   # Server-side data fetching
│   ├── documents/              # File validation & helpers
│   ├── pomodoro/               # Audio and persistent state utilities
│   ├── supabase/               # Supabase client, server, middleware
│   └── youtube/                # YouTube API client & URL parser
├── public/                     # Static branding, icons, images
├── scripts/                    # Security verification scripts
├── supabase/                   # Database schemas & security SQL
└── package.json
```

---

## Security

StudySpace is designed with security and data privacy as important architectural considerations.

- **Row Level Security (RLS)**: Database access is protected through Supabase RLS policies designed to keep user-specific study data isolated.
- **Private Storage**: Study documents are stored in a private Supabase Storage bucket and served using short-lived signed URLs.
- **File Validation**: Document uploads enforce file-type validation and a 50MB maximum size limit.
- **No Camera/Microphone Access for Documents**: Document uploads use standard file pickers and do not request camera or microphone access.
- **Secret Isolation**: Privileged values such as `YOUTUBE_API_KEY` are intended to remain server-side and are not exposed to client-side JavaScript.
- **OAuth Redirect Protection**: Authentication callback redirects are validated to reduce open-redirect risk.

Security configuration should be reviewed alongside the project's Supabase policies and deployment environment before production use.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
