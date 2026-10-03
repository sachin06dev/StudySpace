# StudySpace — Local Development & Contribution Manual

This document provides a technical guide for developers setting up, developing, testing, and debugging the **StudySpace** platform (Next.js web application and Flutter Android companion).

---

## 1. Prerequisites & Toolchain

| Tool | Minimum Version | Recommended | Notes |
| :--- | :--- | :--- | :--- |
| **Node.js** | `v20.x` | `v20.18+` or `v22.x` | JavaScript / TypeScript runtime |
| **npm** | `v10.x` | `v10.8+` | Default package manager |
| **Git** | `v2.40+` | Latest | Version control |
| **Flutter SDK** | `v3.19.0+` | `v3.24+` | Optional: only required for `/mobile` |
| **Android SDK** | API Level 21 | API 34 | Optional: for compiling Android APKs |

---

## 2. Web Application Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/sachin06dev/StudySpace.git
cd StudySpace
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to create your local `.env.local`:
```bash
cp .env.example .env.local
```

Fill in the required credentials:
```ini
# Supabase Backend (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-publishable-anon-key

# YouTube Data API v3 (Required for Lecture Hub)
YOUTUBE_API_KEY=your-google-cloud-youtube-key

# Local Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Step 4: Run Database Migrations
1. Open your [Supabase Dashboard](https://supabase.com/dashboard) and go to the **SQL Editor**.
2. Run the base schema from [`supabase/schema.sql`](../supabase/schema.sql).
3. Apply incremental migrations in sequence from [`supabase/migrations/`](../supabase/migrations/):
   - `20260824000000_r2_storage_migration.sql`
   - `20260913072331_create_attendance_system.sql`
   - `20260913190000_add_subject_archive.sql`
   - `20261001000000_user_devices.sql`
   - `20261001010000_enable_realtime_sync.sql`
   - `20261001020000_enable_full_realtime_ecosystem.sql`
   - `20261001030000_device_revocation.sql`
   - `20261002183000_delete_user_account.sql`

### Step 5: Start the Development Server
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000).

---

## 3. Development Commands

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts Next.js development server with Turbopack on port 3000 |
| `npm run build` | Compiles optimized Next.js production build |
| `npm run start` | Runs the compiled production server |
| `npm run lint` | Runs ESLint checks across all TypeScript and React files |
| `npx tsx scripts/verify-security.ts` | Runs the automated security invariant test suite |
| `npx tsx scripts/test-attendance.ts` | Runs attendance calculation unit tests |
| `npx tsx scripts/test-edge-cases.ts` | Runs boundary condition tests for attendance math |

---

## 4. Mobile Companion Development (`/mobile`)

The Android application is located in the [`mobile/`](../mobile) folder.

### Setup & Run
```bash
cd mobile

# Fetch Flutter dependencies
flutter pub get

# Run static analysis
flutter analyze

# Execute test suite
flutter test

# Run on connected physical device or emulator
flutter run
```

### Building Release Artifacts
```bash
# Build split-per-abi release APKs
flutter build apk --split-per-abi

# Build Android App Bundle (for Google Play Console)
flutter build appbundle
```
For signing and Cloudflare R2 automated upload, refer to [`docs/android-release.md`](android-release.md).

---

## 5. Architectural Conventions

1. **Server vs. Client Components**:
   - Keep components as React Server Components (RSC) by default.
   - Use `'use client'` only for interactive state, audio, timers, or DOM events.
2. **Data Access Layer**:
   - All Supabase queries live in `lib/data/*.ts`.
   - Never call `supabase.from(...)` directly inside UI components.
3. **Mutations via Server Actions**:
   - Web mutations must be Server Actions (`'use server'` in `lib/actions/*.ts`) returning `{ success: boolean, error?: string, data?: T }`.
4. **Security & Secrets**:
   - Never prefix server-only keys (`YOUTUBE_API_KEY`, `GEMINI_API_KEY`, `R2_SECRET_ACCESS_KEY`) with `NEXT_PUBLIC_`.
   - Never use the `service_role` key in client code.
