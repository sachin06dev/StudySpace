<div align="center">

  <img src="docs/assets/studyspace-logo-readme.png" alt="StudySpace Logo" width="360" />

  <h1>StudySpace</h1>
  <p><strong>Your semester, finally in one place.</strong></p>

  <p>
    An academic workspace for students that brings together timetable scheduling, attendance intelligence, lecture tracking with timestamped notes, focus timers, and course documents into a single synchronized operating system.
  </p>

  <p>
    <a href="https://studyspace4u.vercel.app"><strong>🌐 Live Demo</strong></a> &nbsp;&nbsp;•&nbsp;&nbsp;
    <a href="https://studyspace4u.vercel.app/api/download/android"><strong>📱 Download Android</strong></a>
  </p>

</div>

---

<div align="center">
  <img src="docs/screenshots/dashboard-dark.png" alt="StudySpace Dashboard" width="100%" />
</div>

---

## Why StudySpace?

University students routinely juggle fragmented workflows across disconnected tools:

- **Lectures are disconnected from notes**: Video study sessions on YouTube lack structured, timestamped note-taking tied directly to playback.
- **Academic planning is disconnected from tasks**: Daily schedules, assignments, and exam deadlines live across disparate apps and portal PDFs.
- **Attendance is tracked manually**: Students resort to guesswork before semester exams to calculate whether they can safely miss a lecture.

**StudySpace connects the entire academic lifecycle into one cohesive, distraction-free workspace across Web and Android.**

---

## Core Workflow

### 1. PLAN — Timetable & Attendance Intelligence
- **Weekly Schedule Engine**: Configure recurring weekly class slots with subject codes, timings, faculty, and room numbers.
- **Ad-Hoc Schedule Exceptions**: Log cancelled lectures, room shifts, or makeup classes without breaking the baseline schedule.
- **Mathematical Bunk Allowance**: Automatically calculate how many classes you can safely miss while staying above your target percentage (e.g. 75%), or the recovery classes needed to restore good standing.

### 2. LEARN — Lecture Hub & Timestamped Notes
- **Distraction-Free Video Player**: Watch academic lectures without algorithmic recommendation rabbit holes.
- **Bidirectional Seeking Notes**: Take notes while lectures play; clicking any timestamp jump-links the player directly to that moment.
- **Course Playlist Organization**: Import YouTube playlists with batch metadata resolution and unified watch progress.

### 3. FOCUS — Study Chronometer
- **Persistent Pomodoro Timer**: The focus timer persists seamlessly across workspace navigation without interruptions.
- **Synthesized Audio Alerts**: Zero-latency chime synthesis built directly on the Web Audio API without network audio dependencies.
- **Automatic History Logging**: Completed focus intervals log directly to your analytics history.

### 4. TRACK — Study Analytics & Activity
- **Activity Heatmap**: Visual contribution grid tracking daily study sessions and qualified study days.
- **Consistency Scoring**: Algorithmic scoring that rewards streak longevity, 30-day activity, and weekly target adherence.
- **Diurnal Rhythm Analysis**: Visual breakdowns showing your peak focus hours across morning, afternoon, evening, and night.

### 5. ORGANIZE — Tasks & Private Documents
- **Subject-Aware Task Planner**: Track assignments, lab submissions, and exams by course with priority tagging and status filters.
- **Private Document Vault**: Store lecture slides, syllabus sheets, and PDFs with short-lived presigned download URLs.
- **Resource Bookmark Library**: Organize reference documentation and syllabus links with automatic favicon extraction.

### 6. CONNECT — Mobile Companion
- **Offline-First SQLite Cache**: Full read/write access to schedules, tasks, and attendance when campus Wi-Fi drops.
- **Instant Haptic Attendance**: Mark classes present or absent in one tap with immediate tactile vibration feedback.
- **Background Synchronization**: Offline changes queue locally and automatically reconcile upon network reconnect.

---

## Product Tour

<div align="center">
  <table>
    <tr>
      <td width="50%">
        <img src="docs/screenshots/attendance-master.png" alt="Attendance Intelligence" />
        <p align="center"><strong>Attendance Intelligence</strong><br /><sub>Track percentages, thresholds, and safe bunk margins.</sub></p>
      </td>
      <td width="50%">
        <img src="docs/screenshots/timetable.png" alt="Weekly Timetable" />
        <p align="center"><strong>Weekly Timetable</strong><br /><sub>Manage recurring class slots and exception cancellations.</sub></p>
      </td>
    </tr>
    <tr>
      <td width="50%">
        <img src="docs/screenshots/videos-player.png" alt="Lecture Hub & Notes" />
        <p align="center"><strong>Lecture Hub & Seeking Notes</strong><br /><sub>Take timestamped notes that jump directly to video timestamps.</sub></p>
      </td>
      <td width="50%">
        <img src="docs/screenshots/pomodoro.png" alt="Focus Chronometer" />
        <p align="center"><strong>Focus Chronometer</strong><br /><sub>Configurable work/break intervals with audio chimes.</sub></p>
      </td>
    </tr>
    <tr>
      <td width="50%">
        <img src="docs/screenshots/analytics-full.png" alt="Study Analytics" />
        <p align="center"><strong>Study Analytics & Heatmap</strong><br /><sub>Visualize consistency scores and diurnal study patterns.</sub></p>
      </td>
      <td width="50%">
        <img src="docs/screenshots/documents.png" alt="Private Document Vault" />
        <p align="center"><strong>Document Vault</strong><br /><sub>Upload and organize course PDFs with short-lived access links.</sub></p>
      </td>
    </tr>
  </table>
</div>

---

## 📱 Android App

StudySpace is also available as a native Android application for studying on the go. Built as an offline-first companion, it features on-device SQLite caching, instant haptic attendance marking, background synchronization, and local timetable notifications.

<div align="center">
  <table>
    <tr>
      <td align="center"><img src="docs/screenshots/mobile-home.webp" width="180" alt="Android Home" /><br /><sub>Today's Schedule</sub></td>
      <td align="center"><img src="docs/screenshots/mobile-attendance.webp" width="180" alt="Android Attendance" /><br /><sub>Instant Attendance</sub></td>
      <td align="center"><img src="docs/screenshots/mobile-timetable.webp" width="180" alt="Android Timetable" /><br /><sub>Weekly Grid</sub></td>
      <td align="center"><img src="docs/screenshots/mobile-analytics.webp" width="180" alt="Android Analytics" /><br /><sub>Mobile Analytics</sub></td>
    </tr>
  </table>
</div>

👉 **[Download StudySpace for Android](https://studyspace4u.vercel.app/api/download/android)**

---

## Engineering & Technology Stack

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-16.3-black?logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19.2-blue?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL_%7C_Auth_%7C_Realtime-3ecf8e?logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Cloudflare-R2_Storage-f38020?logo=cloudflare" alt="Cloudflare R2" />
  <img src="https://img.shields.io/badge/Flutter-Android_API_21--34-02569B?logo=flutter" alt="Flutter Android" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" />
</div>

- **Frontend**: Next.js 16 (App Router, Turbopack, Server Actions), React 19, Tailwind CSS v4, Lucide Icons.
- **Backend & Database**: Supabase PostgreSQL with strict Row Level Security (RLS) on all user data, Supabase Auth (OAuth & Email), and Realtime CDC replication.
- **Object Storage**: Cloudflare R2 S3-compatible storage with short-lived presigned upload and view URLs.
- **Mobile Client**: Flutter Android application with on-device SQLite cache (`sqflite`), Provider state management, and local notifications.

For comprehensive architectural design and data flow diagrams, see [`docs/architecture.md`](docs/architecture.md).

---

## Project Structure

| Directory | Role |
| :--- | :--- |
| `app/` | Next.js App Router pages, Server Components, and API endpoints |
| `components/` | Modular React UI components (Dashboard, Attendance, Timetable, Notes, Pomodoro) |
| `lib/` | Core business logic, attendance calculation algorithms, and service clients |
| `mobile/` | Flutter Android companion application with offline SQLite sync engine |
| `supabase/` | PostgreSQL DDL schemas, security fixes, and migration scripts |
| `public/` | Static branding assets, icons, and web preview images |
| `docs/` | Architecture specifications, Android release operations, and developer guides |
| `scripts/` | Automated security invariant test suite and release tooling |

---

## Getting Started

### Web Application

```bash
# 1. Clone repository
git clone https://github.com/sachin06dev/StudySpace.git
cd StudySpace

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local

# 4. Start local development server
npm run dev
```

### Mobile Application

```bash
cd mobile
flutter pub get
flutter run
```

Configure required environment variables from `.env.example`. Server-only credentials must never be exposed to client bundles. For complete onboarding instructions, refer to [`docs/development.md`](docs/development.md).

---

## Project Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Next.js development server with hot reloading on port 3000 |
| `npm run build` | Compiles optimized Next.js production build |
| `npm run lint` | Runs ESLint across all TypeScript and React files |
| `npm run security` | Runs automated defense-in-depth security invariants and secret scanning |
| `npx tsx scripts/test-attendance.ts` | Runs attendance calculation unit tests |
| `npx tsx scripts/test-edge-cases.ts` | Runs boundary condition tests for attendance math |

---

## Security

StudySpace enforces strict Row Level Security (RLS) across all user tables, server-only secret encapsulation, short-lived presigned storage URLs, and ephemeral in-memory processing for timetable scans.

For vulnerability reporting and detailed security guidelines, refer to [`SECURITY.md`](SECURITY.md).

---

## Contributing

Contributions, bug reports, and feature proposals are welcome! Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) for code conventions, branching strategy, and pull requests.

---

## Try StudySpace

Access the live ecosystem across web and Android:

- **🌐 Web**: [https://studyspace4u.vercel.app](https://studyspace4u.vercel.app)
- **📱 Android**: [https://studyspace4u.vercel.app/api/download/android](https://studyspace4u.vercel.app/api/download/android)

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## Author & Acknowledgments

Crafted by **[Sachin](https://github.com/sachin06dev)** ([@sachin06dev](https://github.com/sachin06dev)).

Special thanks to the open-source communities powering [Next.js](https://nextjs.org/), [Supabase](https://supabase.com/), [Tailwind CSS](https://tailwindcss.com/), [Flutter](https://flutter.dev/), and [Lucide Icons](https://lucide.dev/).
