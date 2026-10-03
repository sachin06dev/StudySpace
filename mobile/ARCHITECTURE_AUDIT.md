# StudySpace Mobile Architecture Audit (Phase 0)

> Generated as part of the Master Product Transformation: Transforming the StudySpace Flutter Android application into a first-class, offline-first mobile client with full feature parity with the web platform.

---

## 1. Existing Web Features

The StudySpace web platform is built on Next.js 16 (App Router), Tailwind CSS, TypeScript, and Supabase (PostgreSQL, Auth, Storage). Its current feature footprint includes:

### Authentication & Profiles
- **Email/Password**: Standard sign-up with password confirmation, login, and password reset.
- **Google OAuth**: One-click Google sign-in using `supabase.auth.signInWithOAuth()` via `/auth/callback`.
- **Session Persistence**: Server-side cookie sessions handled via `@supabase/ssr` and Next.js middleware.
- **User Settings**: Stored in `user_settings` table (default attendance target, Pomodoro focus/break durations, long break interval).

### Dashboard
- Comprehensive overview containing:
  - Personalized greeting and productivity status.
  - Today's Classes widget with one-tap attendance marking.
  - Quick Attendance Summary card (overall percentage, status badge).
  - Recent Tasks list with completion toggles.
  - Pomodoro quick launcher and study stats.

### Attendance System
- **Overall Attendance**: Calculated percentage across all active subjects with target threshold comparison (Safe $\ge 75\%$, Warning $65\%-74\%$, Critical $<65\%$).
- **Subject-Level Attendance**: Individual cards showing attended classes, total classes, percentage, custom target percentage override, and baseline attended/total classes.
- **Bunk & Recovery Calculator**:
  - Deterministic formula:
    - If current $\% \ge \text{target}$: $\text{Can bunk } \lfloor \frac{\text{attended} - \text{target} \times \text{total}}{\text{target}} \rfloor \text{ classes}$.
    - If current $\% < \text{target}$: $\text{Need } \lceil \frac{\text{target} \times \text{total} - \text{attended}}{1 - \text{target}} \rceil \text{ consecutive classes}$.
  - Graceful boundary handling for targets 0% and 100%, 0 total classes, and already-safe thresholds.
- **Today's Classes Resolution**: Combines recurring weekly timetable slots with date-specific timetable exceptions (Cancelled, Rescheduled, Extra).
- **Attendance History**: Chronological log of recorded classes with status chips (`present`, `absent`, `cancelled`), notes, and support for editing or deleting historical entries.
- **Subject Details (`/attendance/[subjectId]`)**: Detailed subject dashboard with history, edit subject metadata, and baseline attendance modification (locked if live attendance records exist).

### Timetable System
- **Semester Management**: Multi-semester support (start date, end date, active flag; enforced single active semester per user via partial unique index).
- **Subject Management**: Name, code, faculty, default room, class type (`theory`, `lab`, `tutorial`, `other`), credits, target percentage.
- **Weekly Schedule Grid**: 7-day visual timetable (Mon–Sun) with time slots and room/faculty overrides.
- **Timetable Exceptions**: Mark recurring classes as Cancelled, add Extra ad-hoc classes, or Reschedule classes to new dates/times.
- **AI Timetable Scanner**: Upload timetable image (PNG, JPG, WebP), AI vision model extracts structured classes, review/edit dialog, batch persists semester, subjects, and slots.

### Tasks Management
- CRUD operations for tasks with title, description, priority (`low`, `medium`, `high`), status (`pending`, `completed`), due dates, and completion timestamps.

### Pomodoro Focus Engine
- Configurable focus timer (25 min work, 5 min short break, 15 min long break, 4-session cycle).
- Automatic persistence in `pomodoro_sessions` table (`focus`, `short_break`, `long_break`, status `completed` / `cancelled` / `interrupted`).

### Study & Learning Hub
- **YouTube Video Library**: Save YouTube videos, server-side metadata fetching via YouTube Data API v3.
- **Video Player**: Embedded YouTube playback.
- **Timestamped Contextual Notes**: Rich notes attached to specific video timestamps (`video_timestamp_notes`). Clicking a note seeks the player directly to that second.
- **Course Playlists**: Save and organize YouTube playlists, track video completion.
- **Documents & Vault**: Cloudflare R2 / Supabase Storage private document upload and storage.

### Analytics
- Visual attendance distributions, subject risk alerts, study time trends, and productivity charts.

---

## 2. Existing Flutter Features

The Flutter application (`mobile/`) currently contains:
- **Attendance Engine**:
  - `AttendanceProvider`, calculation engine, and class resolution service.
  - Overall attendance card, subject list, today's classes card with present/absent quick actions.
  - Basic bunk/recovery calculation.
- **Timetable**:
  - Weekly schedule view (tabs Mon–Sun).
  - Semester management screen.
  - Subject management screen (add/edit, broken delete).
  - Slot addition and exception dialogs.
- **Scanner**:
  - `ScanTimetableScreen` (camera/gallery pickers).
  - `ScannedTimetableReviewScreen` (slot review and save).
- **Tasks**:
  - Basic `TasksScreen` and `TasksProvider` (create, list, toggle completion, delete).
- **Study Screen**:
  - Placeholder cards that show `SnackBar` messages when clicked.
- **Profile Screen**:
  - Set default attendance target dialog, mock notification switches, sign out button.
- **Local Notifications**:
  - `NotificationService` and `TimetableNotificationScheduler` using `flutter_local_notifications` and `timezone`.
- **Offline Cache**:
  - `DatabaseHelper` with SQLite tables for semesters, subjects, slots, exceptions, attendance, and `sync_queue`.
  - `SyncEngine` listening to network connectivity.

---

## 3. Existing Backend APIs

1. **`POST /api/timetable/scan`**:
   - Accepts `multipart/form-data` with `file`.
   - Authenticates user via Bearer token (`Authorization: Bearer <token>`) or cookie session.
   - Calls server-side `scanTimetableImage(buffer, mimeType)` with multimodal Gemini vision.
   - Returns structured JSON containing detected classes and suggested semester name.
2. **`GET /api/youtube/video`**:
   - Query params: `id` or `url`.
   - Authenticates user via cookie session.
   - Returns YouTube video metadata (title, description, thumbnail, channel, duration in seconds).
3. **Mutations on Web**:
   - Primarily handled via Next.js Server Actions (`use server`), which are tied to React server-client RPC protocols and are not standard REST endpoints for external mobile clients.

---

## 4. Existing Direct Supabase Calls

Both the Web data access layer (`lib/data/*.ts`) and Flutter providers communicate directly with Supabase Postgres tables over PostgreSQL / PostgREST with Row Level Security (RLS):
- `semesters`
- `subjects`
- `timetable_slots`
- `timetable_exceptions`
- `attendance_records`
- `tasks`
- `pomodoro_sessions`
- `user_settings`
- `profiles`
- `saved_videos`, `youtube_videos`
- `saved_playlists`, `youtube_playlists`, `playlist_items`
- `video_timestamp_notes`

RLS policies on all tables enforce `((select auth.uid()) = user_id)` (or global read for shared YouTube catalogs).

---

## 5. Existing Offline Functionality

- **Attendance & Timetable**: When offline, `AttendanceProvider` loads cached records, slots, and exceptions from SQLite `studyspace_offline.db`. Attendance marks are stored locally and queued.
- **Notifications**: Scheduled locally via `flutter_local_notifications` based on the active semester's timetable; continues firing offline.
- **Major Gaps**:
  - Tasks are not cached in SQLite (reading tasks offline fails or shows empty).
  - Pomodoro sessions are not tracked or saved locally.
  - Video notes and playlists are not cached.
  - Subject and slot modifications are not queued offline.

---

## 6. Existing Synchronization Behavior

- `DatabaseHelper` maintains a `sync_queue` table:
  - Columns: `id`, `action_type`, `idempotency_key`, `payload`, `created_at`, `retry_count`, `status`.
- `SyncEngine` listens to `ConnectivityService.onlineStream` and executes `processQueue()` when internet returns.
- **Critical Flaws**:
  1. Only `UPSERT_ATTENDANCE` and `DELETE_ATTENDANCE` actions are implemented in `SyncEngine`.
  2. Cache upserting (`cacheData`) only executes `INSERT OR REPLACE` and never removes deleted items from SQLite. If a subject or slot is deleted on remote, it remains in local SQLite forever as a "ghost" entity.
  3. No conflict resolution or last-write-wins timestamp comparison.
  4. App killing or crashes mid-sync can leave queue entries in indeterminate states without dead-letter logging.

---

## 7. Existing Authentication Flow

- **Web**:
  - Supports Email/Password and Google OAuth.
  - Session stored in secure HTTP-only cookies managed by `@supabase/ssr`.
- **Flutter**:
  - Supports Email/Password sign-in and sign-up using `supabase_flutter`.
  - Session tokens persisted in `flutter_secure_storage`.
  - **Missing**: Google Sign-In is completely absent in Flutter. Android `AndroidManifest.xml` lacks the deep-link OAuth callback intent filter.

---

## 8. Existing AI Scanner Architecture

- **Flow**:
  1. User takes photo / selects image in Flutter `ScanTimetableScreen`.
  2. `TimetableScannerService.scanImage(file)` creates a multipart HTTP request to `${EnvConfig.webApiBaseUrl}/api/timetable/scan` with `Bearer <token>`.
  3. Next.js API route authenticates the Supabase token and forwards image bytes to `scanTimetableImage` in `lib/ai/timetableScanner.ts`.
  4. Server calls Gemini vision model with structured system prompt and JSON schema.
  5. Server validates detected classes (days 0–6, 24-hr times, class types).
  6. Returns JSON to Flutter.
  7. Flutter displays `ScannedTimetableReviewScreen` for user edits.
  8. Confirmed classes are saved to Supabase.
- **Root Failure in Flutter**:
  1. `EnvConfig.webApiBaseUrl` is defaulted to `http://10.0.2.2:3000` (only valid in Android emulator; fails on physical devices and in production).
  2. Cleartext HTTP (`http://`) is blocked by Android OS network security policy.
  3. `saveScannedTimetable` unconditionally creates a new semester, deactivates the existing one, and fails to update `TimetableProvider` or local SQLite.

---

## 9. Existing Notification Architecture

- Built using `flutter_local_notifications` and `timezone`.
- Local schedule:
  - **Morning Digest** at 07:30 daily.
  - **Pre-Class Reminders** 10 minutes prior to class start.
  - **Post-Class Attendance Prompts** immediately after class end.
- Schedules use `AndroidScheduleMode.inexactAllowWhileIdle`.
- Adheres strictly to Google Play policies without requiring `SCHEDULE_EXACT_ALARM` or `USE_EXACT_ALARM`.

---

## 10. Known Broken Functionality

1. **Timetable AI Scanner on Mobile**:
   - Connection refused or blocked on real devices due to `10.0.2.2:3000` default and lack of cleartext/production URL configuration.
   - Failure to refresh `TimetableProvider` state after saving.
2. **Subject Delete**:
   - Web has no UI action or modal to delete a subject.
   - Flutter calls direct Supabase DELETE which violates historical data integrity (cascades and purges all historical attendance records), and does not clean local SQLite, leaving phantom subjects.
3. **Study, YouTube, Pomodoro, and Notes Screens**:
   - Merely placeholder cards with mock `SnackBar` triggers.
4. **Google Authentication in Mobile**:
   - Missing implementation and intent filter.
5. **Offline Support for Tasks & Focus**:
   - Completely broken offline; no local tables or queue handlers.

---

## 11. Code Duplication Between Web and Flutter

| Logic Area | Web Implementation | Flutter Implementation | Inconsistency Risk |
|---|---|---|---|
| Attendance & Bunk Math | `lib/attendance/calculations.ts` | `attendance_calculation_engine.dart` | Edge case math drift (target 0/100, 0 classes, NaN) |
| Class Resolution | Server/Client components | `class_resolution_service.dart` | Day-of-week indexing (ISO 0=Mon vs Dart 1=Mon) |
| Timetable Exceptions | `lib/data/timetable.ts` | `TimetableException` model | Differing date formats or missing reschedule bounds |

---

## 12. Performance Risks

- **Unnecessary Rebuilds**: Multiple providers call `notifyListeners()` on the same tick without granular selectors, causing whole-screen re-renders.
- **Unbounded Queries**: Supabase calls fetch full table snapshots without limits or cursor pagination.
- **Redundant State Loading**: Navigating between bottom tabs re-triggers full cache and remote loads simultaneously.

---

## 13. App-Size Risks

- Debug APK is ~166 MB because it contains 4 unstripped architectures (`arm64-v8a`, `armeabi-v7a`, `x86_64`, `x86`), JIT compiler runtime, and debug symbols.
- Production AAB / split-per-ABI release builds will bring single-device download sizes down to ~15–25 MB.
- Unused dependencies and redundant bundled assets must be pruned.
