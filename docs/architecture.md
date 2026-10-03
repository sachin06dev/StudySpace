# StudySpace — System Architecture & Technical Specification

> **Single Source of Truth**: This document details the end-to-end architecture, data flow, engineering decisions, and security model of the **StudySpace** platform across both the Next.js web application and the Flutter Android companion.

---

## 1. High-Level Architecture Overview

StudySpace is designed as an integrated academic workspace combining server-rendered web performance with offline-first mobile reliability.

```mermaid
graph TD
    subgraph Clients["Client Layer"]
        WebClient["Desktop / Mobile Browser<br/>(React 19 Server & Client Components)"]
        MobileClient["Android Companion<br/>(Flutter 3.19+ / Dart 3.3+)"]
    end

    subgraph Edge["Routing & Edge Layer"]
        VercelEdge["Vercel Edge / CDN<br/>(Session Middleware & Security Headers)"]
    end

    subgraph AppServer["Next.js 16 Application Server (Node.js runtime)"]
        RSC["React Server Components<br/>(Data Fetching & HTML Streaming)"]
        ServerActions["Server Actions<br/>('use server' Mutations)"]
        ApiLayer["REST Endpoints<br/>(/api/timetable/scan, /api/release/*)"]
        DAL["Data Access Layer<br/>(lib/data/*.ts)"]
    end

    subgraph Database["PostgreSQL 15+ (Supabase)"]
        Postgres["PostgreSQL Engine"]
        RLS["Row Level Security (RLS)<br/>(Strict user_id = auth.uid())"]
        Realtime["Realtime Engine<br/>(Postgres CDC Replication)"]
        SupabaseAuth["Supabase Auth / GoTrue<br/>(JWT + PKCE Cookie Sessions)"]
    end

    subgraph External["External Services & Storage"]
        SupabaseStorage["Supabase Storage<br/>(Private bucket: study-documents)"]
        CloudflareR2["Cloudflare R2 (S3 API)<br/>(Zero-Egress Vault & APK Hosting)"]
        YouTubeApi["Google YouTube Data API v3<br/>(Server-Side Metadata Retrieval)"]
        GeminiAi["Google Gemini 2.0 / 1.5 Flash<br/>(Multimodal Vision OCR Scanner)"]
    end

    %% Connections
    WebClient -->|HTTP / HTTPS| VercelEdge
    VercelEdge --> RSC
    VercelEdge --> ServerActions
    VercelEdge --> ApiLayer

    MobileClient -->|Bearer Auth / REST| ApiLayer
    MobileClient -->|PostgREST + Realtime| Postgres

    RSC --> DAL
    ServerActions --> DAL
    ApiLayer --> DAL

    DAL -->|PostgREST with JWT| Postgres
    Postgres --- RLS
    Postgres --- Realtime

    RSC -->|Server-to-Server| YouTubeApi
    ApiLayer -->|Ephemeral In-Memory| GeminiAi
    DAL -->|Presigned URLs| SupabaseStorage
    DAL -->|S3 Presigned URLs| CloudflareR2
```

---

## 2. Request & Authentication Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student (Browser / App)
    participant Edge as Next.js Middleware
    participant Auth as Supabase Auth (GoTrue)
    participant Page as RSC / Server Action
    participant DAL as lib/data/*.ts
    participant DB as PostgreSQL (RLS)

    Student->>Edge: HTTP Request (with Auth Cookies)
    Edge->>Auth: supabase.auth.getUser()
    alt Session Valid / Refreshed
        Auth-->>Edge: User Context & Refreshed Tokens
        Edge->>Page: Forward Request with Secure Session
        Page->>DAL: Call data query (e.g. getTodayClasses(userId))
        DAL->>DB: PostgREST Query with User Claims
        DB->>DB: Enforce RLS (WHERE user_id = auth.uid())
        DB-->>DAL: Authorized Result Set
        DAL-->>Page: Strongly Typed Entities
        Page-->>Student: Streamed HTML / Action JSON Result
    else Session Expired or Unauthenticated
        Auth-->>Edge: Unauthenticated
        Edge-->>Student: 307 Redirect to /login
    end
```

### Authentication Architecture
1. **Next.js Middleware (`middleware.ts` & `lib/supabase/middleware.ts`)**:
   - Intercepts all incoming requests.
   - Refreshes expired JSON Web Tokens (JWT) transparently using `@supabase/ssr`.
   - Propagates session cookies back to both the request headers (for downstream Server Components) and the response headers (for the browser).
2. **Protected App Shell (`app/(app)/layout.tsx`)**:
   - Performs a server-side assertion: `const { data: { user } } = await supabase.auth.getUser()`.
   - If null, triggers immediate server-side redirection to `/login`.
   - Wraps authenticated children in `TimerProvider` (persisting focus timer across client-side route transitions) and `TimezoneSync` (aligning PostgreSQL timestamps with the student's local IANA timezone).

---

## 3. Data Access Layer & Mutation Boundary

To prevent code duplication, SQL injection, and architectural drift, StudySpace strictly isolates database access from the UI.

```mermaid
graph LR
    subgraph UI["Presentation Layer (app/ & components/)"]
        ClientComp["Client Component<br/>(Button, Form, Modal)"]
        ServerComp["Server Component<br/>(Page, Static List)"]
    end

    subgraph Actions["Mutation Layer (lib/actions/*.ts)"]
        ServerAction["'use server' Action<br/>(Validate, Assert Auth)"]
    end

    subgraph DAL["Data Access Layer (lib/data/*.ts)"]
        DataFn["Data Access Function<br/>(tasks.ts, attendance.ts)"]
    end

    subgraph Engine["Database Engine"]
        Postgres["PostgreSQL + RLS"]
    end

    ServerComp -->|1. Direct Fetch| DataFn
    ClientComp -->|1. Form Action| ServerAction
    ServerAction -->|2. Invoke| DataFn
    DataFn -->|3. Query / Mutate| Postgres
    ServerAction -->|4. revalidatePath| ServerComp
```

### Architectural Contract
- **Zero Inline Database Calls**: UI components never call `supabase.from(...)` directly.
- **Server Actions for Mutations**: All client mutations call Server Actions in `lib/actions/*.ts`, which return standardized response envelopes:
  ```typescript
  type ActionResponse<T> = {
    success: boolean
    data?: T
    error?: string
  }
  ```
- **Cache Invalidation**: Server Actions invoke `revalidatePath()` upon successful database write, triggering Next.js incremental cache purging and instant UI updates.

---

## 4. Key Subsystems & Engineering Highlights

### 4.1 Academic Attendance & Timetable Intelligence

University students face strict attendance minimums (e.g., 75% or 85%). StudySpace implements a deterministic mathematical model in `lib/attendance/calculations.ts` guaranteeing precision.

```mermaid
flowchart TD
    Slots["Recurring Weekly Slots<br/>(Mon - Sun)"] --> Merge
    Exceptions["Ad-Hoc Exceptions<br/>(Cancelled, Extra, Rescheduled)"] --> Merge
    Merge["Class Resolver<br/>(lib/attendance/resolution.ts)"] --> TodaySchedule["Today's Resolved Classes"]

    TodaySchedule --> LogRecord["Mark Status<br/>(Present / Absent)"]
    LogRecord --> Records["attendance_records Table"]

    Records --> Calc["Calculation Engine<br/>(lib/attendance/calculations.ts)"]
    Subjects["Baseline Attended / Total"] --> Calc

    Calc --> Pct["Attendance %"]
    Calc --> Bunk["Safe Bunk Allowance (M)"]
    Calc --> Rec["Consecutive Recovery (R)"]

    Pct & Bunk & Rec --> StateMachine{"Risk State Machine"}
    StateMachine -->|% >= Target & Bunk >= 2| Safe["SAFE (Green)"]
    StateMachine -->|% >= Target & Bunk <= 1| Warning["WARNING (Amber)"]
    StateMachine -->|% < Target| Critical["CRITICAL (Red)"]
```

#### Mathematical Formulas
1. **Attendance Percentage**:
   $$\text{Percentage} = \frac{\text{Baseline Attended} + \text{Live Present}}{\text{Baseline Total} + \text{Live Present} + \text{Live Absent}} \times 100$$
   *(Cancelled classes are excluded entirely from both numerator and denominator).*
2. **Safe Bunk Allowance ($M$)**:
   $$M = \max\left(0, \; \left\lfloor \frac{\text{Attended} \times 100}{\text{Target}} - \text{Total} \right\rfloor\right)$$
3. **Recovery Requirement ($R$)**:
   $$R = \max\left(0, \; \left\lceil \frac{\text{Target} \times \text{Total} - 100 \times \text{Attended}}{100 - \text{Target}} \right\rceil\right)$$
   *(If $\text{Target} = 100\%$ and any absence exists, $R = \infty$).*

---

### 4.2 Multimodal AI Timetable OCR Scanner

```mermaid
sequenceDiagram
    autonumber
    actor User as Student / Mobile Client
    participant API as /api/timetable/scan
    participant Vision as Gemini 2.0 / 1.5 Flash Vision
    participant Modal as ScannedTimetableReview UI
    participant Action as saveScannedTimetable Action
    participant DB as PostgreSQL

    User->>API: POST multipart/form-data (image bytes + semesterId)
    Note over API: Authenticates via Cookie or Bearer Token
    API->>Vision: Dispatch image buffer with structured JSON schema
    Vision-->>API: Structured slots array (dayOfWeek, time, subject, room, faculty)
    API-->>User: Structured Parsed Result (HTTP 200)
    Note over API: Image buffer discarded immediately from memory
    User->>Modal: Student edits / verifies extracted slots
    User->>Action: Confirm batch ingestion
    Action->>DB: Upsert subjects & insert timetable_slots
    DB-->>Action: Success
    Action-->>User: Schedule live in timetable grid
```

- **Zero-Storage Privacy**: Timetable image buffers are kept strictly in ephemeral server memory during the inference call and discarded immediately. No user images are written to disk or uploaded to S3.
- **Dual Authentication**: Accepts browser cookie sessions or HTTP `Authorization: Bearer <access_token>` headers, enabling both web modals and native Android camera invocations.

---

### 4.3 YouTube Lecture Hub & Timestamped Notes

```mermaid
graph TD
    User["Student"] -->|Enters YouTube URL| NextServer["Next.js Server API<br/>(/api/youtube/video)"]
    NextServer -->|Server-to-Server with YOUTUBE_API_KEY| YouTubeAPI["Google YouTube Data API v3"]
    YouTubeAPI -->|Title, Channel, Thumbnail, ISO Duration| NextServer
    NextServer -->|Upsert Metadata| GlobalCatalog["youtube_videos (Global Shared Catalog)"]
    NextServer -->|Associate User Record| SavedVideos["saved_videos (User-Specific Progress)"]

    User -->|Plays Lecture| IFramePlayer["YouTube IFrame Player"]
    IFramePlayer -->|Periodic Progress Sync| ProgressSave["Save watch_progress_seconds"]

    User -->|Adds Timestamped Note| NoteEditor["Timestamp Note Editor"]
    NoteEditor -->|Captures player.getCurrentTime()| TimestampNote["video_timestamp_notes Row"]

    User -->|Clicks Existing Note [04:15]| PlayerSeek["player.seekTo(255, true)"]
```

- **Global Catalog Deduplication**: Lectures and playlists saved by multiple users reference shared rows in `youtube_videos` and `youtube_playlists`, eliminating redundant metadata queries and database bloat.
- **Bidirectional Seeking**: Every note records `timestamp_seconds`. Clicking any note immediately jumps the embedded player to that exact moment.

---

### 4.4 Pomodoro Focus Engine & Persistence

- **State Machine**: Managed via React Context (`TimerProvider` in `lib/pomodoro/timerStore.tsx`).
- **Persistence Across Navigation**: Because `TimerProvider` is mounted at `app/(app)/layout.tsx`, navigation between Dashboard, Attendance, Tasks, and Videos does not disrupt active countdown intervals.
- **Audio Synthesis**: Complete audio notifications synthesized locally via the **Web Audio API** (`OscillatorNode` + `GainNode`), guaranteeing zero external audio asset loading failures or latency.
- **Automatic Lifecycle Logging**: Focus sessions, short breaks, and long breaks automatically persist to `pomodoro_sessions` upon completion, cancellation, or interruption.

---

### 4.5 Dual Object Storage Architecture

```mermaid
graph TD
    Client["Browser / Mobile Client"]

    subgraph SupabaseStorageGroup["Supabase Storage Engine"]
        SupaBucket["study-documents (Private Bucket)"]
        SupaRLS["Folder RLS: (foldername(name))[1] = auth.uid()"]
    end

    subgraph CloudflareR2Group["Cloudflare R2 (S3 API Client)"]
        R2Bucket["studyspace-documents Bucket"]
        R2Token["Presigned PUT / GET URLs (AWS SDK v3)"]
    end

    Client -->|Upload / View PDF| Route["/api/documents/*"]
    Route -->|Small/Standard Assets| SupaBucket
    Route -->|Zero-Egress Vault / APKs| R2Token
    R2Token --> R2Bucket
    SupaBucket --- SupaRLS
```

- **Supabase Storage**: Private `study-documents` bucket isolated by student UUID path prefix: `<user_id>/<document_uuid>/<filename>`.
- **Cloudflare R2**: Integrated using `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`. Generates 10-minute temporary presigned upload/download URLs with **zero egress bandwidth costs**.

---

### 4.6 Mobile Ecosystem & Offline-First Sync (`/mobile`)

The Android mobile client is built with Flutter and mirrors 100% of the web platform's data models and calculation logic.

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student (Android App)
    participant UI as Flutter Screen
    participant DB as SQLite (studyspace_offline.db)
    participant Queue as sync_queue
    participant Sync as SyncEngine
    participant Remote as Supabase PostgreSQL

    Student->>UI: Tap [ ✓ Mark Present ]
    UI->>DB: Write attendance_record (<16ms)
    UI->>UI: Trigger Haptic Feedback (FeedbackService)
    UI->>Queue: Enqueue mutation with deterministic idempotency key
    UI-->>Student: Instant Visual State Update

    alt Device is Online
        Sync->>Queue: Drain pending items
        Sync->>Remote: Execute PostgREST upsert
        Remote-->>Sync: 200 OK
        Sync->>Queue: Delete enqueued item
    else Device is Offline
        Note over Sync: Queue preserved across app restarts
        Note over Sync: Automatically drained upon ConnectivityService reconnect
    end
```

- **Idempotency Keys**: Mutation items in `sync_queue` use deterministic keys (e.g. `att_${userId}_${subjectId}_${date}_${time}`) ensuring safe network retries without duplicate record creation.
- **Local Push Notifications**: Scheduled on-device using `flutter_local_notifications` (`AndroidScheduleMode.inexactAllowWhileIdle`) requiring zero external background server daemons.

---

## 5. Directory Blueprint & Architectural Responsibilities

| Directory | Layer | Architectural Responsibility |
| :--- | :--- | :--- |
| `app/` | Routing & Pages | Next.js App Router root: layouts, route groups `(app)` and `(auth)`, public marketing landing page, and legal pages. |
| `app/api/` | API Gateways | Server API endpoints: `/api/timetable/scan`, `/api/documents/*`, `/api/download/*`, `/api/release/*`, and `/api/user/*`. |
| `components/` | Presentation | Modular React components organized by feature (`attendance`, `timetable`, `dashboard`, `pomodoro`, `videos`, `landing`, `layout`). |
| `lib/actions/` | Mutations | Next.js Server Actions (`"use server"`). Enforce auth validation, execute mutations, and revalidate cache. |
| `lib/data/` | Data Access | PostgREST DAL. Encapsulates all Supabase queries, enforcing clean separation from UI components. |
| `lib/attendance/` | Domain Logic | Core attendance mathematics (bunk allowances, recovery thresholds, risk state machines, daily class resolution). |
| `lib/ai/` | Intelligence | Multimodal Gemini / OpenAI OCR integration for university timetable parsing. |
| `lib/storage/` | Storage Bridge | Cloudflare R2 S3 SDK client and presigned URL generators. |
| `lib/supabase/` | Database Clients | Supabase client factories for browser (`client.ts`), Server Components (`server.ts`), and middleware. |
| `mobile/` | Android App | Flutter client with offline SQLite cache, sync engine, local notifications, and Android build scripts. |
| `supabase/` | Database Schema | SQL migrations, initial DDL schemas (`schema.sql`), performance indexes, and RLS policies. |
| `public/` | Static Assets | Brand identity marks, dark/light production screenshots, optimized WebP app previews, and icons. |
| `docs/` | Documentation | Architecture specifications, Android release operations (`android-release.md`), and design blueprints (`docs/design/`). |

---

## 6. Security & Defense-in-Depth Model

1. **Row Level Security (RLS)**:
   - Configured on 100% of user-owned tables.
   - Policies verify `auth.uid() = user_id` at the database kernel level.
   - The Supabase `service_role` key is **never** bundled or referenced in client-side code.
2. **Server-Side Secret Encapsulation**:
   - `YOUTUBE_API_KEY`, `GEMINI_API_KEY`, `OPENAI_API_KEY`, `R2_ACCESS_KEY_ID`, and `R2_SECRET_ACCESS_KEY` are strictly server-side variables without `NEXT_PUBLIC_` prefixes.
3. **HTTP Hardening (`next.config.ts`)**:
   - `Content-Security-Policy`: Restricts scripts, frames, and connections to verified endpoints.
   - `Strict-Transport-Security`: Enforces 2-year HSTS with preloading.
   - `X-Frame-Options: DENY`: Prevents clickjacking attacks.
   - `X-Content-Type-Options: nosniff`: Prevents MIME-sniffing exploits.
   - `Permissions-Policy`: Disables camera, microphone, and geolocation by default.
