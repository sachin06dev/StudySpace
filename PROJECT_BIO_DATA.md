# StudySpace — Master Project Bio-Data & Architectural Context Report

> **Target Audience**: AI Language Models, Autonomous Agents, Software Architects, and Lead Engineers.  
> **Purpose**: This document serves as the single source of truth (SSOT), complete memory base, and architectural bio-data for the **StudySpace** codebase. Any LLM or engineer can ingest this document to gain complete context of the application's history, design decisions, database schemas, API interfaces, business logic, client-side state, and operational rules before planning or executing future changes.

---

## 1. Executive Bio-Data & System Metadata

| Attribute | Specification |
| :--- | :--- |
| **Project Name** | **StudySpace** |
| **Repository Root** | `d:\studyspace_nextjs` |
| **Package Name** | `studyspace` (`v0.1.0`) |
| **Project Type** | Full-Stack Productivity & Academic SaaS Ecosystem (Web & Mobile) |
| **Primary Web Framework** | **Next.js 16.3.1 (App Router)** |
| **Web Runtime & Language** | React 19.2.8, TypeScript 5.x, Node.js (v20+) |
| **Web Styling Engine** | **Tailwind CSS v4** (`@tailwindcss/postcss`) with CSS Variable Theming |
| **Mobile Application** | **Flutter 3.19+ (Dart 3.3+)** targeting Android (API 21–34) located in `/mobile` |
| **Database & Identity** | **Supabase (PostgreSQL 15+)** with strict Row Level Security (RLS) & Supabase Auth |
| **Object Storage** | **Dual Storage Architecture**: Supabase Storage (`study-documents` private bucket) + Cloudflare R2 (S3 API) |
| **External Integrations** | Google YouTube Data API v3 (Server-Only), Google Gemini Vision / OpenAI API (AI OCR) |
| **Hosting & Deployment** | Vercel (Edge / Serverless Functions for Web), Google Play Store / APK (Mobile) |
| **Source Control** | Git (`main` branch for production, feature branches for mobile/experimental) |

### 1.1 Core Mission & Problem Statement
University students and self-directed learners manage fragmented workflows across multiple platforms: lecture watching on YouTube, ad-hoc note-taking in loose files, task management in generic to-do apps, Pomodoro focus tracking on mobile timers, attendance spreadsheets, and scattered PDFs.

**StudySpace unifies this entire academic lifecycle into a cohesive, high-performance workspace**:
1. **Attendance & Timetable Engine**: Visual weekly scheduling, subject target tracking, smart bunk/recovery algorithms, timetable exception management, and AI-powered timetable image scanning.
2. **Video & Lecture Hub**: YouTube lecture hub with video-anchored, timestamped notes that seek the player on click.
3. **Pomodoro Focus Suite**: Persistent focus timer surviving client navigation, customizable intervals, audio chimes, and automatic session logging.
4. **Academic Productivity**: Priority tasks, categorized web resources, private document vault (PDFs up to 50MB with short-lived presigned URLs).
5. **Analytics & Consistency Engine**: 365-day activity heatmap, consistency scoring (0–100), weekly focus charts, diurnal rhythm analysis, and achievement milestones.
6. **First-Class Mobile Companion**: Offline-first Flutter Android client with SQLite persistence, idempotent sync queue, local notifications, and tactile haptic feedback.

---

## 2. Locked Architectural Tenets & Rules of Engagement

These decisions are **non-negotiable** across the codebase. Any AI model or engineer working on this repository must strictly adhere to these rules:

1. **Framework Strictness**: Next.js App Router only (`app/`). Do **not** create or reintroduce Astro, Vite, or the legacy Next.js Pages Router (`pages/`).
2. **Server-First Boundary**:
   - Default all components to **React Server Components (RSC)**.
   - Use `"use client"` **only** when DOM event handlers, browser-specific APIs (`setInterval`, `Audio`, `localStorage`), or interactive state hooks (`useState`, `useReducer`, `useEffect`) are genuinely required.
3. **Data Access Layer Contract**:
   - All Supabase database queries **must** live in `lib/data/*.ts` (e.g., `tasks.ts`, `attendance.ts`, `analytics.ts`).
   - **Never** call `supabase.from(...)` directly inside UI components or page files.
4. **Mutation Architecture**:
   - All data mutations on the web must be executed via Next.js **Server Actions** (`"use server"` in `lib/actions/*.ts`), returning structured `{ success: boolean, error?: string, data?: T }` responses and invoking `revalidatePath()`.
   - REST API endpoints (`app/api/*`) are strictly reserved for:
     - Third-party webhook integrations or external client consumption (e.g., `/api/timetable/scan` supporting Bearer token authentication for the Flutter mobile client).
     - Private server-side proxies shielding sensitive API keys (e.g., `/api/youtube/*`).
5. **Zero Row-Level Security Bypass**:
   - Every user-owned table enforces `user_id = auth.uid()` at the PostgreSQL engine level.
   - The Supabase `service_role` key must **never** be imported or used in client or regular server action code.
6. **Secret Hygiene**:
   - `YOUTUBE_API_KEY`, `GEMINI_API_KEY`, `OPENAI_API_KEY`, `R2_ACCESS_KEY_ID`, and `R2_SECRET_ACCESS_KEY` must **never** carry the `NEXT_PUBLIC_` prefix. They must remain strictly server-side.
7. **Cross-Platform Compatibility**:
   - Database schemas, calculations (bunk allowance, recovery requirements, risk states, consistency scores), and ISO weekday indexing (0 = Monday ... 6 = Sunday) must remain **100% mathematically identical** across the Next.js web application and the Flutter mobile client.

---

## 3. Database Schema, Data Models & Security Topology

StudySpace operates on a Postgres relational database hosted on Supabase, featuring 15 dedicated tables, foreign key constraints with cascade rules, custom enumeration checks, performance indexes, and comprehensive Row Level Security (RLS) policies.

```
                    ┌─────────────────────────┐
                    │       auth.users        │
                    └────────────┬────────────┘
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
   ┌───────────┐           ┌───────────┐           ┌───────────┐
   │ profiles  │           │user_sett- │           │ semesters │
   │           │           │   ings    │           └─────┬─────┘
   └───────────┘           └───────────┘                 │
                                                         ▼
                                                   ┌───────────┐
                                                   │ subjects  │
                                                   └─────┬─────┘
                                    ┌────────────────────┼────────────────────┐
                                    ▼                    ▼                    ▼
                             ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
                             │ timetable_  │      │ timetable_  │      │ attendance_ │
                             │    slots    │      │ exceptions  │      │   records   │
                             └─────────────┘      └─────────────┘      └─────────────┘

   ┌─────────────────────────────────────────────────────────────────────────────────┐
   │ PRODUCTIVITY & LEARNING TABLES (All foreign-keyed to auth.users)                │
   │ • tasks                • pomodoro_sessions     • documents (PDFs & R2 files)    │
   │ • website_resources    • user_categories       • video_timestamp_notes          │
   │ • saved_videos         • saved_playlists                                        │
   └─────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ (References Global Catalog)
   ┌─────────────────────────────────────────────────────────────────────────────────┐
   │ GLOBAL CATALOG TABLES (Public / Shared - Deduplicated across users)             │
   │ • youtube_videos       • youtube_playlists     • playlist_items                 │
   └─────────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Authentication & Profiles
* **`public.profiles`**: Stores user identity metadata.
  * `id` (`UUID`, PK, `REFERENCES auth.users(id) ON DELETE CASCADE`)
  * `display_name` (`TEXT`), `email` (`TEXT`), `avatar_url` (`TEXT`), `timezone` (`TEXT` default `'UTC'`)
  * `created_at`, `updated_at` (`TIMESTAMPTZ`)
  * *Trigger*: `handle_new_user()` auto-inserts a profile upon `auth.users` insertion.
* **`public.user_settings`**: Global study and timer preferences.
  * `user_id` (`UUID`, PK, `REFERENCES auth.users(id) ON DELETE CASCADE`)
  * `pomodoro_duration` (`INT` default 25), `short_break_duration` (`INT` default 5), `long_break_duration` (`INT` default 15), `long_break_interval` (`INT` default 4)
  * `weekly_goal_minutes` (`INT` default 600)
  * `default_attendance_target` (`NUMERIC(5,2)` default 75.00, check `BETWEEN 0 AND 100`)

### 3.2 Academic, Attendance & Timetable System
* **`public.semesters`**: Academic terms.
  * `id` (`UUID`, PK, default `gen_random_uuid()`)
  * `user_id` (`UUID`, FK `auth.users(id) ON DELETE CASCADE`)
  * `name` (`TEXT`), `start_date` (`DATE`), `end_date` (`DATE`, check `end_date >= start_date`)
  * `is_active` (`BOOLEAN` default `false`)
  * *Constraint*: Partial unique index `uq_semesters_one_active_per_user` enforces **at most one active semester per user** (`ON public.semesters (user_id) WHERE is_active = true`).
* **`public.subjects`**: Courses enrolled within a semester.
  * `id` (`UUID`, PK), `user_id` (`UUID`, FK), `semester_id` (`UUID`, FK `semesters(id) ON DELETE CASCADE`)
  * `name` (`TEXT`), `code` (`TEXT`), `faculty` (`TEXT`), `default_room` (`TEXT`)
  * `class_type` (`TEXT` check `IN ('theory', 'lab', 'tutorial', 'other')`)
  * `credits` (`NUMERIC(4,2)`), `target_percentage` (`NUMERIC(5,2)` NULL = inherit default)
  * `baseline_attended` (`INT` default 0), `baseline_total` (`INT` default 0, check `baseline_attended <= baseline_total`)
  * `is_archived` (`BOOLEAN` default `false` - added via migration to preserve historical records)
* **`public.timetable_slots`**: Weekly recurring template.
  * `id` (`UUID`, PK), `user_id` (`UUID`, FK), `semester_id` (`UUID`, FK), `subject_id` (`UUID`, FK)
  * `day_of_week` (`SMALLINT` check `BETWEEN 0 AND 6`, where 0 = Monday ... 6 = Sunday)
  * `start_time` (`TIME`), `end_time` (`TIME`, check `end_time > start_time`)
  * `room_override` (`TEXT`), `faculty_override` (`TEXT`), `class_type_override` (`TEXT`)
* **`public.timetable_exceptions`**: Ad-hoc deviations from recurring slots.
  * `id` (`UUID`, PK), `user_id` (`UUID`, FK), `semester_id` (`UUID`, FK)
  * `timetable_slot_id` (`UUID`, FK `timetable_slots(id) ON DELETE SET NULL`)
  * `exception_date` (`DATE`), `exception_type` (`TEXT` check `IN ('cancelled', 'extra', 'rescheduled')`)
  * `start_time`, `end_time` (used for `extra`)
  * `replacement_date`, `replacement_start_time`, `replacement_end_time` (used for `rescheduled`)
  * `subject_id` (`UUID`, FK), `room` (`TEXT`), `faculty` (`TEXT`), `notes` (`TEXT`)
* **`public.attendance_records`**: Materialized log of actual class attendance.
  * `id` (`UUID`, PK), `user_id` (`UUID`, FK), `semester_id` (`UUID`, FK), `subject_id` (`UUID`, FK)
  * `timetable_slot_id` (`UUID`, FK `timetable_slots(id) ON DELETE SET NULL`)
  * `class_date` (`DATE`), `start_time` (`TIME`), `end_time` (`TIME`)
  * `status` (`TEXT` check `IN ('present', 'absent', 'cancelled')`)
  * `notes` (`TEXT`)

### 3.3 Study, Video & Productivity Tables
* **`public.tasks`**: To-do items.
  * `id` (`UUID`, PK), `user_id` (`UUID`, FK), `title` (`TEXT`), `description` (`TEXT`)
  * `priority` (`TEXT` check `IN ('low', 'medium', 'high')` default `'medium'`)
  * `status` (`TEXT` check `IN ('pending', 'completed')` default `'pending'`)
  * `due_date` (`TIMESTAMPTZ`), `completed_at` (`TIMESTAMPTZ`)
* **`public.pomodoro_sessions`**: Focus log.
  * `id` (`UUID`, PK), `user_id` (`UUID`, FK)
  * `session_type` (`TEXT` check `IN ('focus', 'short_break', 'long_break')`)
  * `planned_seconds` (`INT`), `actual_seconds` (`INT`), `started_at` (`TIMESTAMPTZ`), `completed_at` (`TIMESTAMPTZ`)
  * `status` (`TEXT` check `IN ('completed', 'cancelled', 'interrupted')`)
* **`public.youtube_videos`** *(Global Catalog - Shared across users)*:
  * `id` (`UUID`, PK), `youtube_video_id` (`TEXT` UNIQUE), `title` (`TEXT`), `channel_name` (`TEXT`), `thumbnail_url` (`TEXT`), `duration_seconds` (`INT`)
* **`public.saved_videos`**: User bookmarks & playback progress.
  * `id` (`UUID`, PK), `user_id` (`UUID`, FK), `video_id` (`UUID`, FK `youtube_videos(id) ON DELETE CASCADE`)
  * `watch_progress_seconds` (`INT`), `status` (`TEXT` check `IN ('saved', 'in_progress', 'completed', 'not_started')`)
  * `UNIQUE (user_id, video_id)`
* **`public.youtube_playlists`** & **`public.playlist_items`** *(Global Catalog)*:
  * Shared playlist metadata and video sequence positions (`position INT`).
* **`public.saved_playlists`**: User bookmarks referencing `youtube_playlists(id)`.
* **`public.video_timestamp_notes`**: Contextual notes attached to video timestamps.
  * `id` (`UUID`, PK), `user_id` (`UUID`, FK), `video_id` (`UUID`, FK `youtube_videos(id)`), `timestamp_seconds` (`INT`), `content` (`TEXT`)
* **`public.website_resources`**: Bookmarked learning links.
  * `id` (`UUID`, PK), `user_id` (`UUID`, FK), `title` (`TEXT`), `url` (`TEXT`), `description` (`TEXT`), `category` (`TEXT`), `favicon_url` (`TEXT`)
* **`public.user_categories`**: Custom categorization tags.
  * `id` (`UUID`, PK), `user_id` (`UUID`, FK), `name` (`TEXT`), `icon` (`TEXT`), `description` (`TEXT`)
* **`public.documents`**: Uploaded PDF and study document metadata.
  * `id` (`UUID`, PK), `user_id` (`UUID`, FK), `title` (`TEXT`), `file_name` (`TEXT`), `file_path` (`TEXT`), `mime_type` (`TEXT`), `file_size_bytes` (`BIGINT`), `category` (`TEXT`)
  * `storage_provider` (`TEXT` default `'supabase'`, supports `'r2'`)
  * `storage_key` (`TEXT`)

### 3.4 Storage Subsystems & Object Storage
1. **Supabase Storage**:
   - Bucket: `study-documents` (strictly **Private**).
   - RLS: Only authenticated users can access `study-documents` objects where folder path matches `(storage.foldername(name))[1] = auth.uid()::text`.
   - File naming convention: `<user_id>/<document_uuid>/<original_filename>`.
2. **Cloudflare R2 Object Storage (Integrated via S3 SDK)**:
   - Client: `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` configured in `lib/storage/r2.ts`.
   - Dual-storage bridge: Supports generating presigned PUT URLs for client-side direct upload and presigned GET URLs (10-minute validity) for secure document reading.

---

## 4. End-to-End Application Architecture & Control Flow

### 4.1 Request & Authentication Lifecycle
1. **HTTP Ingestion**: Client requests hit Next.js via Vercel Edge.
2. **Middleware (`middleware.ts` & `lib/supabase/middleware.ts`)**:
   - Extracts session cookies via `@supabase/ssr`.
   - Invokes `supabase.auth.getUser()` to refresh expired JWTs and update session cookies on both request and response objects.
3. **Route Protection (`app/(app)/layout.tsx`)**:
   - Server Component checks `user = (await supabase.auth.getUser()).data.user`.
   - If unauthenticated, triggers immediate redirect: `redirect('/login')`.
   - If authenticated, fetches user preferences (`user_settings`) and profile timezone, wrapping the UI in:
     - `TimerProvider`: React Context maintaining background Pomodoro state across client-side page transitions.
     - `TimezoneSync`: Client component verifying and synchronizing the browser's IANA timezone with `profiles.timezone`.
     - `AppShell`: Responsive navigation (collapsible sidebar on desktop, bottom sheet / drawer on mobile).

### 4.2 Data Fetching & Mutation Pipeline

```
┌────────────────────────────────────────────────────────────────────────┐
│                          READ WORKFLOW                                 │
└────────────────────────────────────────────────────────────────────────┘
Browser Request ──► Server Component Page (e.g. app/(app)/tasks/page.tsx)
                          │
                          ▼ calls
                    lib/data/*.ts (e.g. getTasks(userId))
                          │
                          ▼ invokes
                    Supabase Server Client (lib/supabase/server.ts)
                          │
                          ▼ queries with cookies
                    PostgreSQL with Row Level Security (RLS)
                          │
                          ▼ renders HTML
                    React Server Component ──► Client Browser

┌────────────────────────────────────────────────────────────────────────┐
│                        MUTATION WORKFLOW                               │
└────────────────────────────────────────────────────────────────────────┘
User Interaction (Form / Button in Client Component)
       │
       ▼ triggers
Server Action ("use server" in lib/actions/*.ts)
       │
       ├── 1. Validates input schema & asserts session user ID
       ├── 2. Calls lib/data/*.ts mutation function
       ├── 3. Executes Supabase SQL with RLS verification
       └── 4. Calls revalidatePath() to invalidate Next.js server cache
       │
       ▼ returns { success: true }
Client Component updates UI optimistically or consumes refreshed server props
```

---

## 5. Deep Feature Module Breakdown

### 5.1 Attendance & Timetable Intelligence
The Attendance module is an enterprise-grade academic tracking system with mathematical models ensuring students never drop below institutional attendance thresholds.

```
                   ┌─────────────────────────────────────────┐
                   │           CLASS SCHEDULE                │
                   └────────────────────┬────────────────────┘
                                        │
                         ┌──────────────┴──────────────┐
                         ▼                             ▼
                  RECURRING SLOTS             EXCEPTIONS TABLE
                  (Monday - Sunday)           (Cancelled, Extra, Rescheduled)
                         │                             │
                         └──────────────┬──────────────┘
                                        │
                                        ▼
                            RESOLVED TODAY'S CLASSES
                                        │
                         ┌──────────────┴──────────────┐
                         ▼                             ▼
                    PRESENT [✓]                   ABSENT [✕]
                         │                             │
                         └──────────────┬──────────────┘
                                        │
                                        ▼
                           ATTENDANCE RECORDS LOGGED
                                        │
                                        ▼
                       MATHEMATICAL CALCULATION ENGINE
                         • Target Percentage (e.g. 75%)
                         • Safe Bunk Allowance
                         • Consecutive Recovery Needed
                         • Risk State: SAFE | WARNING | CRITICAL
```

#### Mathematical Formulas (`lib/attendance/calculations.ts`)
1. **Attendance Percentage**:
   $$\text{Percentage} = \frac{\text{Effective Attended}}{\text{Effective Total}} \times 100$$
   $$\text{Effective Attended} = \text{Baseline Attended} + \text{Live Present Records}$$
   $$\text{Effective Total} = \text{Baseline Total} + \text{Live Present Records} + \text{Live Absent Records}$$
   *(Cancelled classes are completely excluded from both numerator and denominator).*
2. **Bunk Allowance ($M$)** — Maximum classes a student can miss while remaining $\ge \text{Target}$:
   $$M = \max\left(0, \; \left\lfloor \frac{\text{Attended} \times 100}{\text{Target}} - \text{Total} \right\rfloor\right)$$
3. **Recovery Requirement ($R$)** — Minimum consecutive classes a student must attend to reach $\ge \text{Target}$:
   $$R = \max\left(0, \; \left\lceil \frac{\text{Target} \times \text{Total} - 100 \times \text{Attended}}{100 - \text{Target}} \right\rceil\right)$$
   *Edge Case Handling*: If $\text{Target} = 100\%$ and any absence exists, $R = \infty$ (*"Cannot reach target mathematically"*).
4. **Risk State Machine**:
   - `SAFE`: $\text{Percentage} \ge \text{Target}$ and $\text{Bunk Allowance} \ge 2$.
   - `WARNING`: $\text{Percentage} \ge \text{Target}$ but $\text{Bunk Allowance} \le 1$ (danger zone).
   - `CRITICAL`: $\text{Percentage} < \text{Target}$ (attendance deficit requiring mandatory recovery).

#### Daily Class Resolution (`lib/attendance/resolution.ts`)
`resolveClassesForDate(dateStr, slots, exceptions, subjects)` dynamically reconstructs the day's timeline:
1. Filters weekly slots by ISO day of week ($0 = \text{Monday} \dots 6 = \text{Sunday}$).
2. Removes any slot marked `cancelled` in `timetable_exceptions` for that specific date.
3. Shifts any slot marked `rescheduled` to its new date and time window.
4. Injects any ad-hoc `extra` class scheduled for that date.
5. Links historical or existing `attendance_records` for that date, displaying current status (`present`, `absent`, `unmarked`).

### 5.2 Multimodal AI Timetable Scanner (`lib/ai/timetableScanner.ts`)
Students can photograph or screenshot their university timetable and upload it to auto-populate their entire schedule.
1. **Endpoint**: `POST /api/timetable/scan` accepts `multipart/form-data`.
2. **Dual-Auth**: Authenticates via Supabase cookie session or HTTP `Authorization: Bearer <token>` (enabling seamless mobile invocation).
3. **AI Vision Pipeline**:
   - Dispatches image bytes in-memory to Google Gemini 2.0 / 1.5 Flash (or OpenAI GPT-4o fallback).
   - Structured JSON schema enforces: `dayOfWeek` (0–6), 24-hour `startTime`/`endTime` (`HH:mm`), normalized `classType` (`theory`, `lab`, `tutorial`, `other`), `subjectName`, `faculty`, `room`.
   - Privacy Rule: Image buffers are processed strictly in-memory and discarded immediately; no user images are stored on disk or in the cloud.
4. **Review & Batch Ingestion**:
   - Web modal (`ScannedTimetableReview.tsx`) or Flutter screen (`ScannedTimetableReviewScreen`) allows editing before confirmation.
   - Batch persists: creates semester (if needed), upserts unique `subjects`, and generates `timetable_slots`.

### 5.3 YouTube Lecture Hub & Contextual Timestamp Notes
Designed specifically for video-based learning:
1. **Server-Side Metadata Retrieval (`lib/youtube/client.ts`)**:
   - Takes any YouTube URL or ID, queries YouTube Data API v3 strictly from the server, parses ISO 8601 durations (`PT1H23M45S` $\to$ seconds), and returns title, channel, and high-res thumbnails.
2. **Global Deduplication**:
   - Videos and Playlists are stored in global catalog tables (`youtube_videos`, `youtube_playlists`). Multiple users bookmarking the same lecture share the underlying metadata row, saving database storage.
3. **Video Player & Seeking (`components/videos/VideoPlayer.tsx`)**:
   - Uses the YouTube IFrame API.
   - Saves playback progress periodically to `saved_videos.watch_progress_seconds`.
4. **Timestamped Notes (`components/videos/TimestampNotesList.tsx`)**:
   - Users take markdown notes while the lecture plays.
   - Each note captures the video's active second (`timestamp_seconds`).
   - Clicking any note invokes `player.seekTo(note.timestamp_seconds, true)` to jump the video directly to that exact moment.
   - Fullscreen overlay (`FullscreenNotesOverlay.tsx`) enables distraction-free split-screen note-taking.

### 5.4 Pomodoro Focus Suite
- **Engine**: Client-side state machine managed by `TimerProvider` in `lib/pomodoro/timerStore.tsx`.
- **Navigation Persistence**: Because `TimerProvider` lives at `app/(app)/layout.tsx`, students can navigate between Dashboard, Attendance, Tasks, and Videos without resetting or interrupting the ticking timer.
- **Audio Feedback**: Custom Web Audio API synthesizers and synthesized audio chimes play notifications upon session completion.
- **Cycle Automations**: Configurable work/break cycles (default: 25m focus $\to$ 5m short break $\times 4 \to$ 15m long break). Automatically logs completed, cancelled, or interrupted sessions into `pomodoro_sessions`.

### 5.5 Comprehensive Analytics Engine (`lib/data/analytics.ts`)
- **365-Day Activity Heatmap**: Daily study minutes mapped across 5 activity levels:
  - Level 0: 0 min
  - Level 1: 1–20 min
  - Level 2: 21–45 min
  - Level 3: 46–90 min
  - Level 4: >90 min
  - *Study Day Qualifying Threshold*: Minimum 20 minutes (`STUDY_DAY_THRESHOLD_MINUTES = 20`) required to qualify as an active streak day.
- **Consistency Score Algorithm (100 Points Total)**:
  $$\text{Score} = \min\left(40, \frac{\min(30, D_{30})}{30} \times 40\right) + \min\left(35, \frac{\min(14, S)}{14} \times 35\right) + \min\left(25, \frac{M_{\text{week}}}{M_{\text{goal}}} \times 25\right)$$
  - $D_{30}$: Active study days in the last 30 days (max 40 pts).
  - $S$: Current qualifying day streak (max 35 pts).
  - $M_{\text{week}} / M_{\text{goal}}$: Current week study minutes vs user's weekly goal (max 25 pts).
  - Categorical Ratings: $\ge 85$ *Excellent*, $\ge 70$ *Strong Habit*, $\ge 50$ *Staying Consistent*, $\ge 25$ *Building Momentum*, $< 25$ *Getting Started*.
- **Weekly Trend & Diurnal Rhythm**:
  - Compares current week study minutes against prior week with percentage delta.
  - Groups focus sessions into Diurnal Time-of-Day bins: Morning (05:00–12:00), Afternoon (12:00–17:00), Evening (17:00–21:00), Night (21:00–05:00).
- **Milestones**: Gamified badges unlocked based on total active study days and streak targets.

---

## 6. Mobile Companion Application (`/mobile`)

The `/mobile` directory contains a native **Flutter Android application** built as an offline-first companion client with complete feature parity.

```
┌────────────────────────────────────────────────────────────────────────┐
│                     STUDYSPACE FLUTTER ARCHITECTURE                    │
└────────────────────────────────────────────────────────────────────────┘
                           UI / Screens
                (Home, Attendance, Timetable, Tasks)
                                │
                                ▼
                         Provider State
              (AttendanceProvider, TimetableProvider)
                                │
                 ┌──────────────┴──────────────┐
                 ▼                             ▼
       Local SQLite Cache              SyncEngine Queue
    (studyspace_offline.db)          (Deterministic Keys)
                 │                             │
                 │ (Offline Read <16ms)        ▼ (When Online)
                 └──────────────────────► Supabase PostgreSQL
```

### 6.1 Offline-First SQLite Architecture
- **Database**: SQLite database `studyspace_offline.db` managed by `DatabaseHelper`.
- **Tables**: Local mirrors of `semesters`, `subjects`, `timetable_slots`, `timetable_exceptions`, `attendance_records`, `tasks`, and `sync_queue`.
- **Optimistic State Machine**:
  - Tapping `[ ✓ Present ]` or `[ ✕ Absent ]` updates local SQLite in $<16\text{ms}$.
  - Haptic feedback is triggered instantly via `FeedbackService.instance.attendanceSuccess()`.
  - Mutation is enqueued into `sync_queue` with deterministic idempotency keys:
    `att_${userId}_${subjectId}_${date}_${time}`.

### 6.2 Synchronization Engine (`SyncEngine`)
- Listens to network connectivity state changes via `ConnectivityService`.
- When connectivity is restored, processes `sync_queue` sequentially:
  - Executes upserts and deletes against remote Supabase PostgREST endpoints.
  - Implements exponential backoff and dead-letter failure handling.
  - Guarantees zero lost marks or conflicting duplicate records.

### 6.3 Local Push Notifications
- Built using `flutter_local_notifications` and `timezone`.
- Operates entirely on-device without requiring external servers:
  1. **Morning Digest**: 07:30 daily summary of the day's class lineup.
  2. **Pre-Class Reminders**: Dispatched 10 minutes before class start time.
  3. **Post-Class Attendance Prompts**: Dispatched immediately upon class completion asking if the student was present.
- Uses `AndroidScheduleMode.inexactAllowWhileIdle` to strictly respect Android battery and Google Play alarm permission policies.

---

## 7. Security, Networking & Secrets Configuration

### 7.1 Content Security Policy & HTTP Headers (`next.config.ts`)
The web application enforces strict production headers:
* `Strict-Transport-Security`: `max-age=63072000; includeSubDomains; preload`
* `X-Content-Type-Options`: `nosniff`
* `X-Frame-Options`: `DENY`
* `Referrer-Policy`: `strict-origin-when-cross-origin`
* `Permissions-Policy`: `camera=(), microphone=(), geolocation=(), browsing-topics=()`
* `Content-Security-Policy`:
  - `script-src`: `'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://s.ytimg.com https://va.vercel-scripts.com`
  - `frame-src`: `'self' https://www.youtube-nocookie.com https://www.youtube.com`
  - `connect-src`: `'self' https://*.supabase.co wss://*.supabase.co https://www.googleapis.com https://vitals.vercel-insights.com https://*.r2.cloudflarestorage.com`

### 7.2 Environment Variables Reference

| Variable Name | Exposure | Required By | Description |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public / Client | Web & Mobile | Supabase project URL (`https://<ref>.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public / Client | Web & Mobile | Supabase publishable anonymous key |
| `YOUTUBE_API_KEY` | **Server-Only** | Web Backend | Google Cloud YouTube Data API v3 secret key |
| `GEMINI_API_KEY` | **Server-Only** | Web Backend | Google Gemini multimodal vision key for AI timetable scanner |
| `OPENAI_API_KEY` | **Server-Only** | Web Backend | Optional fallback for AI timetable OCR scanner |
| `R2_ACCOUNT_ID` | **Server-Only** | Web Backend | Cloudflare account identifier for R2 storage |
| `R2_ACCESS_KEY_ID` | **Server-Only** | Web Backend | Cloudflare R2 S3 API access key |
| `R2_SECRET_ACCESS_KEY` | **Server-Only** | Web Backend | Cloudflare R2 S3 API secret access key |
| `R2_BUCKET_NAME` | **Server-Only** | Web Backend | Cloudflare R2 bucket name (`studyspace-documents`) |

---

## 8. Complete Codebase Directory & File Blueprint

```
studyspace_nextjs/
├── app/                                 # Next.js 16 App Router root
│   ├── (auth)/                          # Unauthenticated route group
│   │   ├── login/page.tsx               # Email/Password + OAuth sign-in
│   │   ├── signup/page.tsx              # Account registration
│   │   └── layout.tsx                   # Auth layout wrapper
│   ├── (app)/                           # Protected application route group (Session Required)
│   │   ├── layout.tsx                   # Auth check, TimezoneSync, TimerProvider, AppShell
│   │   ├── loading.tsx                  # Global route transition skeleton
│   │   ├── dashboard/page.tsx           # Aggregated overview & quick actions
│   │   ├── attendance/                  # Attendance tracking module
│   │   │   ├── page.tsx                 # Subject attendance cards & today's class resolution
│   │   │   └── [subjectId]/page.tsx     # Single subject deep-dive, history, baseline config
│   │   ├── timetable/page.tsx           # Weekly timetable grid, semester manager, AI scan
│   │   ├── tasks/page.tsx               # Task management (pending/completed, priority)
│   │   ├── pomodoro/page.tsx            # Fullscreen focus timer & session history
│   │   ├── videos/                      # YouTube lecture hub
│   │   │   ├── page.tsx                 # Video library & progress tracking
│   │   │   └── [videoId]/page.tsx       # Embedded video player + timestamped notes
│   │   ├── playlists/                   # YouTube course playlist manager
│   │   │   ├── page.tsx                 # Playlist library
│   │   │   └── [playlistId]/page.tsx    # Playlist video browser & watch tracking
│   │   ├── notes/page.tsx               # Centralized timestamp notes search & review
│   │   ├── resources/page.tsx           # Categorized web bookmarks & learning links
│   │   ├── documents/page.tsx           # Private PDF & study documents vault
│   │   ├── analytics/page.tsx           # 365-day heatmap, consistency score, study trends
│   │   └── settings/page.tsx            # User preferences, timer defaults, account actions
│   ├── api/                             # Server API routes
│   │   ├── timetable/scan/route.ts      # AI timetable OCR endpoint (Bearer token / cookie)
│   │   └── youtube/                     # Server-side YouTube Data API proxies
│   │       ├── video/route.ts           # Fetch video metadata
│   │       └── playlist/route.ts        # Fetch playlist metadata
│   ├── auth/callback/route.ts           # Supabase OAuth PKCE exchange handler
│   ├── globals.css                      # Tailwind CSS v4 entry, custom dark theme glow, tokens
│   ├── layout.tsx                       # Root HTML/Body layout with theme provider
│   └── page.tsx                         # Landing / marketing page
│
├── components/                          # React Component Library
│   ├── analytics/                       # HeatmapGrid, ConsistencyScoreCard, WeeklyStudyChart...
│   ├── attendance/                      # TodayClassesCard, SubjectAttendanceCard, History...
│   ├── dashboard/                       # ContinueLearning, TaskList, MetricCard, LiveClock...
│   ├── documents/                       # UploadDocumentForm, DocumentCard, DocumentLibrary...
│   ├── layout/                          # AppShell, AppSidebar, MobileHeader, MobileNavDrawer
│   ├── notes/                           # NotesLibrary, TimestampNoteItem
│   ├── playlists/                       # AddPlaylistModal, PlaylistCard, PlaylistView...
│   ├── pomodoro/                        # PomodoroTimer, PomodoroSettings, CompletionModal...
│   ├── resources/                       # ResourceCard, ResourceForm, ResourceLibrary...
│   ├── shared/                          # EmptyState, PageHeader, ThemeToggle, TimezoneSync...
│   ├── tasks/                           # TaskForm, TaskItem, TaskList
│   ├── timetable/                       # TimetableGrid, SlotModal, ExceptionModal, AI Review...
│   └── videos/                          # VideoPlayer, VideoCard, TimestampNotesList...
│
├── lib/                                 # Core Business Logic & Infrastructure
│   ├── actions/                         # Server Actions ("use server" mutations)
│   │   ├── attendance.ts, tasks.ts, pomodoro.ts, documents.ts, timetable.ts, videos.ts...
│   ├── ai/                              # Multimodal AI services
│   │   └── timetableScanner.ts          # Gemini/OpenAI vision prompt & JSON parser
│   ├── analytics/                       # Date math, streak calculations, heatmap utilities
│   │   ├── dateUtils.ts, utils.ts
│   ├── attendance/                      # Attendance domain logic
│   │   ├── calculations.ts              # Bunk allowance, recovery requirements, risk states
│   │   ├── resolution.ts                # Date-specific class timeline resolution
│   │   └── notifications.ts             # Notification trigger generators
│   ├── data/                            # Supabase PostgREST Data Access Layer
│   │   ├── analytics.ts, attendance.ts, dashboard.ts, documents.ts, playlists.ts...
│   │   ├── pomodoro.ts, resources.ts, semesters.ts, subjects.ts, tasks.ts, videos.ts...
│   ├── pomodoro/                        # Timer store context & Web Audio sound synthesizer
│   ├── storage/                         # Object storage abstraction
│   │   └── r2.ts                        # Cloudflare R2 S3 client & presigned URL generators
│   ├── supabase/                        # Supabase client instantiation
│   │   ├── client.ts                    # Browser client (createBrowserClient)
│   │   ├── server.ts                    # Server client with next/headers cookies
│   │   └── middleware.ts                # Session refresher for Next.js middleware
│   └── youtube/                         # Server-only YouTube API v3 client
│
├── mobile/                              # Flutter Android Application
│   ├── lib/
│   │   ├── attendance/                  # Attendance providers, calculations, class resolution
│   │   ├── timetable/                   # Schedule screen, slot dialogs, exception sheets
│   │   ├── scanner/                     # Camera/Gallery image picker & OCR review
│   │   ├── tasks/                       # Task provider & UI
│   │   ├── pomodoro/                    # Mobile focus timer & background chronometer
│   │   ├── core/                        # DatabaseHelper (SQLite), SyncEngine, FeedbackService
│   │   ├── notifications/               # Local notification schedulers
│   │   └── main.dart                    # Flutter entry point
│   ├── pubspec.yaml                     # Flutter dependencies (supabase_flutter, sqflite...)
│   └── FINAL_MOBILE_IMPLEMENTATION_REPORT.md # Comprehensive mobile pass verification
│
├── supabase/                            # Database Migrations & Schemas
│   ├── schema.sql                       # Complete initial DDL (13 base tables + RLS + storage)
│   └── migrations/                      # Incremental migrations
│       ├── 20260824000000_r2_storage_migration.sql
│       ├── 20260913072331_create_attendance_system.sql
│       └── 20260913190000_add_subject_archive.sql
│
├── next.config.ts                       # Next.js security headers, remote image patterns, CSP
├── package.json                         # Web dependencies & scripts
├── tsconfig.json                        # TypeScript path aliases (`@/*`)
└── README.md                            # High-level repo summary
```

---

## 9. Developer Playbook & Operational Commands

### 9.1 Local Development Commands
```bash
# Install dependencies
npm install

# Start Next.js development server on http://localhost:3000
npm run dev

# Execute ESLint code quality checks
npm run lint

# Compile optimized production build
npm run build

# Start production server
npm run start
```

### 9.2 Mobile (Flutter) Development Commands
```bash
cd mobile

# Fetch Flutter packages
flutter pub get

# Run on connected Android device or emulator
flutter run

# Build split production APKs
flutter build apk --split-per-abi

# Build production Android App Bundle (for Google Play)
flutter build appbundle
```

### 9.3 Definition of Done for Any Feature
A feature is considered **Done** only when:
1. **Full-Stack Persistence**: Data persists in Supabase and reflects immediately upon browser refresh.
2. **Row Level Security Enforced**: A user cannot read, mutate, or delete another user's records.
3. **Optimistic Error Resilience**: All client actions provide visual loading/error states without crashing or silently swallowing errors.
4. **Data Access Layer Boundary**: Zero inline `supabase.from()` calls in UI components; all queries route through `lib/data/*.ts` and mutations through Server Actions in `lib/actions/*.ts`.
5. **Clean Compilation**: Passes `npm run lint` and `npm run build` with zero errors.

---

## 10. AI Model Prompting & Context Injection Template

When feeding this project into another LLM or autonomous coding agent for future work, prepend the following prompt snippet:

```markdown
You are working on the "StudySpace" codebase (Next.js 16 App Router + Supabase + Tailwind CSS v4 + Flutter Android).
Refer to PROJECT_BIO_DATA.md for full architectural memory.

RULES OF ENGAGEMENT:
1. Framework: Next.js App Router only. Do not suggest Astro, legacy Pages Router, or alternative frameworks.
2. Data Access: All database queries must be in lib/data/*.ts. Components must never call supabase.from() directly.
3. Mutations: All web mutations must be Server Actions in lib/actions/*.ts calling revalidatePath().
4. Security: Strict RLS on all tables (user_id = auth.uid()). Never use or recommend service_role keys.
5. Secrets: Never expose YOUTUBE_API_KEY, GEMINI_API_KEY, or R2 credentials to the browser or with NEXT_PUBLIC_.
6. Mathematics: Maintain exact parity with lib/attendance/calculations.ts for bunk allowance, recovery, and risk states.
```
