# Changelog

All notable changes to the StudySpace ecosystem (Web & Mobile) are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-10-03

### Added
- **Academic Attendance & Timetable Intelligence Engine**:
  - Semester management with unique active semester constraints.
  - Course enrollment tracking with class types (theory, lab, tutorial) and baseline attendance figures.
  - Dynamic weekly timetable template (Monday to Sunday) with time-slot validations.
  - Ad-hoc timetable exceptions engine (cancelled, extra, rescheduled classes) dynamically merged with recurring slots.
  - Mathematical calculation engine (`lib/attendance/calculations.ts`):
    - Real-time attendance percentage factoring in baseline and live logs.
    - Safe bunk allowance formula: classes a student can safely skip while staying above target.
    - Consecutive recovery requirement formula: consecutive classes needed to return to good standing.
    - Tri-state risk machine (`SAFE`, `WARNING`, `CRITICAL`).
- **Multimodal AI Timetable OCR Scanner**:
  - `POST /api/timetable/scan` server endpoint supporting direct photo/screenshot uploads.
  - Dual authentication via Supabase cookie session or HTTP Bearer token (enabling mobile invocation).
  - Google Gemini 2.0 / 1.5 Flash vision pipeline (with OpenAI GPT-4o fallback) to extract days, times, subjects, faculty, and room numbers.
  - Interactive web review modal (`ScannedTimetableReview.tsx`) for user verification before batch ingestion.
  - Ephemeral memory processing: image bytes are discarded immediately after transcription; no user photos are stored.
- **Dual Object Storage Architecture**:
  - Private Supabase Storage bucket (`study-documents`) for personal study PDFs (up to 50MB) with short-lived presigned URLs.
  - Cloudflare R2 integration (`lib/storage/r2.ts`) via AWS S3 SDK for zero-egress document vault storage and Android APK delivery.
- **Cross-Platform Realtime Sync & Ecosystem**:
  - PostgreSQL Realtime publication for multi-device sync across Web and Android.
  - Device session registration (`/api/devices/register`) and device revocation.
  - Account and data privacy lifecycle endpoints (`/api/user/delete-account`, `/api/user/delete-data`, `/api/user/export`).
- **Interactive Web Showcase & Landing Experience**:
  - Line-by-line masked hero reveal with dark/light workspace previews.
  - Interactive Bunk Calculator simulator and interactive video timestamped timeline.
  - Living workspace simulator demonstrating real component interactions.
  - Light/Dark theme comparison slider and interactive Android companion showcase.
- **Flutter Android Companion (`/mobile`)**:
  - Offline-first SQLite persistence (`studyspace_offline.db`) with $<16\text{ms}$ optimistic UI response.
  - Idempotent sync queue (`SyncEngine`) handling network reconnects with exponential backoff.
  - Local push notifications (07:30 Morning Digest, 10m Pre-Class Reminders, Post-Class Attendance Prompts).
  - Released Android APK build `1.1.6+14` with public release manifest and in-app update checking (`/api/release/latest`).

---

## [Initial Release] - 2026-08-24

### Added
- **Core SaaS Architecture**: Next.js App Router, TypeScript, React 19, Tailwind CSS v4.
- **Identity & Profiles**: Supabase Auth with PostgreSQL triggers auto-provisioning `profiles` and `user_settings`.
- **YouTube Lecture Hub**: Server-side metadata fetching (YouTube Data API v3), video player embedding, and watch progress tracking.
- **Timestamped Video Notes**: Contextual note-taking synchronized with video timestamps, with one-click seeking.
- **Pomodoro Focus Suite**: Audio chimes (Web Audio API synthesizers), session cycle automations, and navigation-persistent client timer state.
- **Task Management**: Priorities (Low, Medium, High), status toggles, categories, and due dates.
- **Study Analytics**: 365-day activity heatmap, 100-point consistency score algorithm, weekly focus trend graphs, and achievement milestones.
- **Private Document Vault**: PDF upload and viewer with Supabase Storage.
- **Website Resource Manager**: Categorized web bookmarks with automatic favicon resolution.
