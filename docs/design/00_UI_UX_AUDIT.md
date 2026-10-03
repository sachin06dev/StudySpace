# StudySpace — Phase 0: Master UI/UX, Information Hierarchy & Anti-AI-Slop Audit

> **Document Status**: Complete & Authoritative Source of Truth  
> **Audience**: Design Engineering, Frontend Architects, Mobile Engineers, AI Coding Agents  
> **Repository**: `d:\studyspace_nextjs` (Target Branch: `main`)  
> **Scope**: Exhaustive read-only audit of Next.js 16 Web App, Flutter 3.19 Mobile App, and Visual Reference Set.

---

## 1. Executive Summary & Audit Baseline

This document establishes the authoritative audit of **StudySpace** across its Web (Next.js 16 App Router) and Mobile (Flutter 3.19) implementations.

### 1.1 Architectural Baseline & Reference Priority
Our audit evaluates the current implementation against four benchmark inputs:
1. **Existing Implementation**: Next.js 16.3.1 (App Router), Tailwind CSS v4, Supabase (PostgreSQL 15 + RLS), and Flutter 3.19+ (Dart 3.3+) with SQLite offline cache.
2. **Database & Migrations**: 15 relational tables in Supabase with cascade rules and partial unique indexes.
3. **PROJECT_BIO_DATA.md**: Architectural memory and system invariants.
4. **Visual References (Images 1–5)**:
   - *Image 1*: Dark Mode Redesign (Web + Mobile: "Focused. Organized. In Control." / "Simple. Fast. On the Go.").
   - *Image 2*: Light Mode Redesign (Web + Mobile: "Same Vision. A More Focused Experience.").
   - *Image 3*: Dark Mode Variant with timeline connectors, action pills, and status tags.
   - *Image 4*: Dark Mode Variant with Tasks filter tabs and Subject Details tabs.
   - *Image 5*: Architectural Blueprint with explicit component and UX annotations.
5. **SilverBook Inspiration**: Date-strip navigation, class timeline rows, one-tap attendance states, subject details, and native mobile ergonomics.

```
┌────────────────────────────────────────────────────────────────────────┐
│                     EVIDENCE & PRIORITY HIERARCHY                      │
└────────────────────────────────────────────────────────────────────────┘
  Architecture & Logic: Existing Code > DB Migrations > PROJECT_BIO_DATA.md
  Visual Target:        Generated StudySpace Redesign (Images 1–5)
  Current Comparison:   Existing StudySpace screens
  Interaction Model:    SilverBook patterns + native mobile ergonomics
  Brand Identity:       StudySpace Purple Monogram, Wordmark, and Identity
```

---

## 2. Anti-AI-Slop Audit: Concrete Findings & Remediation

A primary goal is stripping the generic "AI template dashboard" aesthetic from StudySpace and replacing it with a disciplined, editorial academic experience.

### 2.1 Concrete AI-Slop Symptoms & Solutions

| AI-Slop Symptom | Current Manifestation in StudySpace | Root Cause in Code | Why It Feels Generic | Target Replacement & Remediation |
| :--- | :--- | :--- | :--- | :--- |
| **Excessive Cards** | Web Dashboard renders 12 separate rounded bordered boxes; Analytics renders 18 individual cards. | `<div className="bg-white dark:bg-card rounded-2xl border p-5">` wrapped around every metric and widget. | Fragmented "bento-box overdose"; forces the eye to parse dozens of competing rectangular borders instead of content. | **Surface-Driven Layout**: Replace arbitrary cards with 3 clear surfaces (Canvas, Surface, Raised). Unify metrics into clean inline strips and timeline lists without outer card wrappers. |
| **Card-Inside-Card** | `DashboardAttendanceCard` embeds separate nested sub-cards for next class, at-risk subject, and class rows; Flutter `HomeScreen` nests `TodayClassCard` inside list containers. | Ad-hoc component nesting without surface elevation rules. | Visual clutter, claustrophobic inner margins, awkward nested border radiuses. | **Flat Section Grammar**: Single container with subtle hairline dividers (`border-b border-border`) or whitespace grouping; child elements are rows, not nested boxes. |
| **Equal Visual Hierarchy** | Metric cards for Study Time, Pomodoros, and Tasks on Dashboard all share identical 1/3-column widths, fonts, and box weights. | Grid `grid-cols-1 sm:grid-cols-3 gap-4` with uniform `DashboardMetricCard` components. | No visual anchor; user cannot tell what matters most (e.g., upcoming class vs historical study seconds). | **One Hero Element Per Screen**: Hero card for **Next Class** with clear countdown ("In 25 min") and dominant action button ("Mark Present"), supported by compact secondary stat pills. |
| **Excessive Pills & Badges** | Multiple redundant status tags (`SAFE`, `75% target`, `theory`, `room`, `active`) scattered across every class item. | Overuse of rounded-full badges with contrasting pastel backgrounds. | Looks like a bootstrap admin template or tag cloud rather than an academic tool. | **Disciplined Metadata Hierarchy**: One status indicator per item (e.g., `Present`, `Upcoming`, `Cancelled`). Secondary metadata formatted as quiet text: `08:30 - 09:30 · CT-09 · Ms. Khushi Parmar`. |
| **Emoji UI** | Emojis used as icons in notification insights, task priority badges, and card headers. | Hardcoded Unicode emojis (e.g., `🔥`, `📚`, `⏰`, `🎯`) in string templates. | Inconsistent rendering across Android/iOS/Windows/macOS; gives a childish, unprofessional appearance. | **Unified Lucide Iconography**: Strict cross-platform Lucide icons with locked 16px/20px sizes and semantic tinting. Emojis prohibited in UI chrome. |
| **Unbudgeted Gradients** | Gradient hero headers + gradient buttons + gradient metric borders + ambient radial background glow all active simultaneously. | Mixed gradient utility classes: `bg-gradient-to-r from-indigo-50/70 via-purple-50/50...` + radial background in `globals.css`. | "Candy shop glow" typical of AI mockups; destroys contrast and tires the student's eyes. | **Gradient Budget: Max 1 Per Viewport**: Reserved exclusively for a primary hero CTA, streak milestone, or active progress ring. Canvas remains dark obsidian (`#090D16`) or crisp light (`#F8FAFC`). |
| **Generic Marketing Copy** | "Take your study to the next level", "Smart AI-powered insights", "Unlock your potential". | Placeholder copy in headers and empty states. | Hollow SaaS marketing jargon that provides zero actionable academic value to a university student. | **Quiet Technical & Student Voice**: Direct, factual status copy: *"You're on track. Two classes left today."*, *"Attendance is 3 classes below target. Attend next 2 classes to recover."* |
| **Fragmented Navigation** | Web sidebar renders 12 flat, ungrouped navigation items without categorization; Flutter mobile renders 5 disparate tabs. | `NAV_ITEMS` array in `AppSidebar.tsx` with 12 equal items: Dashboard, Tasks, Pomodoro, Timetable, Attendance, Videos, Playlists, Resources, Notes, Documents, Analytics, Settings. | Cluttered cognitive load; forces user to scan 12 items to find core study tools. | **Intentional 6-Item Academic Shell**: Dashboard, Timetable, Attendance, Study (grouping focus, materials, notes), Analytics, Subjects, Settings. |

---

## 3. Web Application Audit (Next.js 16 App Router)

We map every meaningful page and route across 17 required criteria.

### 3.1 Dashboard (`/dashboard`)
1. **Route**: `app/(app)/dashboard/page.tsx`
2. **Purpose**: Daily situational command center.
3. **Primary User Goal**: Check upcoming classes, log attendance in one tap, review daily focus, and resume study tasks.
4. **Current Layout**: Vertical stack of 7 distinct blocks: 3 metric cards -> attendance overview card -> consistency heatmap card -> 2-column tasks/pomodoro grid -> continue learning -> quick actions -> library summary.
5. **Current Hierarchy**: Fragmented; equal visual weight given to past study time, future classes, task checkboxes, and library book counts.
6. **Current Reusable Components**: `DashboardHeader`, `DashboardMetricCard`, `DashboardAttendanceCard`, `DashboardConsistencyCard`, `DashboardTaskList`, `DashboardPomodoroCard`, `ContinueLearning`, `QuickActions`, `StudyLibrarySummary`, `DashboardCardsSkeleton`.
7. **Current Data Sources**: `getDashboardData()` (`lib/data/dashboard.ts`), `getDashboardAttendanceData()` (`lib/data/dashboardAttendance.ts`).
8. **Current Actions/Mutations**: `markAttendanceAction()` for quick class status logging.
9. **Current Responsive Behavior**: Collapses to single column on mobile (`grid-cols-1 sm:grid-cols-3` and `lg:grid-cols-3`); vertical scroll length exceeds 2400px on mobile.
10. **Current Loading State**: `DashboardCardsSkeleton` with pulsing grey cards.
11. **Current Empty State**: Zero-counters ("0h 0m", "0 tasks"); no prompt to set up semester if missing.
12. **Current Error State**: Unhandled promise rejections bubble to `app/error.tsx`.
13. **Major Design Problems**: 12+ bordered boxes; Next Class is buried inside `DashboardAttendanceCard`; Quick Actions placed too low.
14. **Major Usability Problems**: Double-counting study time (MetricCard 1 vs PomodoroCard); difficult to reach quick actions on phone.
15. **Recommended Future Composition**:
    - **Hero Split**: Left (60%): Next Class Card with "In 25 min" countdown and prominent [Mark Present] button. Right (40%): Atmospheric mountain banner.
    - **Metric Strip**: 4 inline tiles: Today's Study (`2h 14m`), Attendance (`84.7%` ring), Streak (`7 days`), Tasks (`3 / 5`).
    - **Operational Grid**: Left (65%): Today's Schedule timeline with line connectors and status tags. Right (35%): Study Activity weekly chart + compact 4-item Quick Actions list.
16. **Components Worth Preserving**: `DashboardHeader` greeting logic, `TimezoneSync`.
17. **Components to Refactor / Create**: Refactor `DashboardAttendanceCard` into `NextClassCard` + `TodayScheduleTimeline`; create `MetricTile`, `StudyActivityChart`, `QuickActionsList`.

### 3.2 Attendance Overview (`/attendance`)
1. **Route**: `app/(app)/attendance/page.tsx`
2. **Purpose**: Semester attendance health and bunk allowance tracking.
3. **Primary User Goal**: Verify overall attendance against target (e.g. 75%), check bunk allowances, log class attendance.
4. **Current Layout**: `AttendanceClientView.tsx` with header semester badge -> overall summary card -> today's class card -> subject card grid -> history table.
5. **Current Hierarchy**: Top-heavy; massive alert banners push individual course standing below the fold.
6. **Current Reusable Components**: `OverallAttendanceCard`, `TodayClassesCard`, `SubjectAttendanceCard`, `AttendanceHistoryList`, `SemesterSelectorModal`.
7. **Current Data Sources**: `getSemesters`, `getActiveSemester`, `getSubjectsBySemester`, `getTimetableSlots`, `getTimetableExceptions`, `getAttendanceRecordsWithSubject`, `getDefaultAttendanceTarget`.
8. **Current Actions/Mutations**: `markAttendanceAction`, `deleteAttendanceRecordAction`.
9. **Current Responsive Behavior**: Subject cards wrap from 1 to 3 columns; today's class cards squish on 768px tablet viewports.
10. **Current Loading State**: Full-page spinner/skeleton transition.
11. **Current Empty State**: "No active semester" alert with button to timetable.
12. **Current Error State**: Toast notification on mutation error.
13. **Major Design Problems**: Overall summary card looks like a clinical dashboard; duplicate attendance formulas.
14. **Major Usability Problems**: No week-date strip; students cannot quickly preview tomorrow's attendance impact.
15. **Recommended Future Composition**:
    - Top: Semester selector pill + overall attendance ring.
    - Week date strip (`Mon 14`, `Tue 15` active, `Wed 16`...) with scheduled class indicators.
    - Today's Classes timeline with one-tap status toggles (`Present`, `Absent`, `Cancelled`).
    - Course cards with clean circular progress rings and explicit mathematical bunk allowance tags (`3 safe bunks`).
16. **Components Worth Preserving**: `SemesterSelectorModal` logic.
17. **Components to Refactor / Create**: Refactor `SubjectAttendanceCard`; create `WeekDateStrip`, `DonutGauge`, `AttendanceHistoryTable`.

### 3.3 Subject Details (`/attendance/[subjectId]`)
1. **Route**: `app/(app)/attendance/[subjectId]/page.tsx`
2. **Purpose**: Single subject deep dive, baseline configuration, and attendance history.
3. **Primary User Goal**: View detailed class attendance logs, edit baseline counts, calculate recovery needs.
4. **Current Layout**: Header with course name -> stats row (attended/total/percentage) -> baseline editor -> history table.
5. **Current Hierarchy**: Linear form-based hierarchy; lacks integration with study notes or syllabus files.
6. **Current Reusable Components**: `AttendanceHistoryList`, baseline modal.
7. **Current Data Sources**: `getSubjectById()`, `getAttendanceRecordsWithSubject()`.
8. **Current Actions/Mutations**: `updateSubjectBaselineAction()`.
9. **Current Responsive Behavior**: Table wraps with horizontal scroll on mobile.
10. **Current Loading State**: Page skeleton.
11. **Current Empty State**: "No classes logged yet for this subject."
12. **Current Error State**: 404 redirect if subject ID invalid.
13. **Major Design Problems**: Visual disconnection from main attendance page; sterile tabular layout.
14. **Major Usability Problems**: Baseline adjustment input lacks real-time calculation preview.
15. **Recommended Future Composition**: Unified course mastery hub with 4 tabs (`Overview`, `Materials`, `Tasks`, `History`), large attendance donut gauge, interactive recovery slider, and course PDF vault.
16. **Components Worth Preserving**: Baseline mathematical validation logic.
17. **Components to Refactor / Create**: Create `SubjectHeader`, `DonutGauge`, `RecoverySimulator`, `DocumentCard`.

### 3.4 Timetable (`/timetable`)
1. **Route**: `app/(app)/timetable/page.tsx`
2. **Purpose**: Weekly recurring schedule builder, slot editor, exception manager, and AI timetable scanner.
3. **Primary User Goal**: View weekly class layout, add/edit slots, manage class cancellations/rescheduling, scan paper schedule photo.
4. **Current Layout**: Semester selector header -> AI Scan button -> 7-column desktop grid (`TimetableGrid.tsx`).
5. **Current Hierarchy**: Grid-first desktop layout; collapses awkwardly on mobile.
6. **Current Reusable Components**: `TimetableGrid`, `TimetableSlotModal`, `TimetableExceptionModal`, `ScanTimetableModal`, `ScannedTimetableReview`.
7. **Current Data Sources**: `getTimetableSlots()`, `getTimetableExceptions()`, `getSubjectsBySemester()`.
8. **Current Actions/Mutations**: `createTimetableSlotAction()`, `createTimetableExceptionAction()`, `/api/timetable/scan`.
9. **Current Responsive Behavior**: Breaks below 1024px; columns squish to $<100\text{px}$, causing severe text wrapping.
10. **Current Loading State**: Empty grid wireframe.
11. **Current Empty State**: "No timetable slots found. Add a slot or scan your timetable."
12. **Current Error State**: Modal alert on validation error.
13. **Major Design Problems**: Sticky time column misaligns during horizontal scrolling; slot forms are lengthy.
14. **Major Usability Problems**: Mobile users forced to scroll a 7-column grid horizontally; modal lacks keyboard shortcuts.
15. **Recommended Future Composition**:
    - Desktop ($\ge 1024\text{px}$): 5/7-column clean grid with sticky time markers and class-type color tags.
    - Mobile ($<1024\text{px}$): Day-selector pill strip + single-column vertical timeline.
    - AI Scanner: Sleek slide-over drawer with side-by-side image and detected slot table.
16. **Components Worth Preserving**: Slot conflict detection logic, AI OCR parsing endpoint.
17. **Components to Refactor / Create**: Refactor `TimetableGrid`; create `TimetableDayTimeline`, `SlotEditorModal`, `AiScannerDrawer`.

### 3.5 Analytics (`/analytics`)
1. **Route**: `app/(app)/analytics/page.tsx`
2. **Purpose**: Longitudinal habit analysis, study streaks, and academic milestones.
3. **Primary User Goal**: Track consistency score (0–100), inspect 365-day study heatmap, evaluate focus rhythm.
4. **Current Layout**: 18 separate cards stacked vertically in a massive 1-column / 2-column scroll.
5. **Current Hierarchy**: Maximum card clutter; 365-day heatmap is squeezed into a narrow box.
6. **Current Reusable Components**: 18 files in `components/analytics/` (`HeatmapGrid`, `ConsistencyScoreCard`, `WeeklyStudyChart`, etc.).
7. **Current Data Sources**: `getAnalyticsData()` (`lib/data/analytics.ts`).
8. **Current Actions/Mutations**: Read-only dashboard; no direct mutations.
9. **Current Responsive Behavior**: Cards stack into a single column on mobile; heatmap requires clumsy horizontal scroll.
10. **Current Loading State**: `AnalyticsSkeleton` with 18 pulsing grey boxes.
11. **Current Empty State**: 0% consistency score, zeroed charts.
12. **Current Error State**: Fallback error boundary.
13. **Major Design Problems**: Card fatigue; AI sparkles in milestone badges; neon color confusion.
14. **Major Usability Problems**: User cannot visually prioritize streaks vs weekly hours vs milestones.
15. **Recommended Future Composition**:
    - Hero Canvas: Full-width **Study Consistency Heatmap** in StudySpace purple tokens with streak badge (`14 active days, 3-day streak 🔥`).
    - Mid Grid (2 cols): Left: Weekly hours bar chart comparing current vs prior week. Right: Diurnal focus rhythm chart.
    - Bottom: Quiet shelf of earned milestone badges with progress meters.
16. **Components Worth Preserving**: Mathematical scoring algorithms (`calculateConsistencyScore()`).
17. **Components to Refactor / Create**: Refactor `HeatmapGrid` into `HeatmapCanvas`; create `WeeklyTrendChart`, `DiurnalRhythmChart`, `MilestoneShelf`.

### 3.6 Tasks (`/tasks`)
1. **Route**: `app/(app)/tasks/page.tsx`
2. **Purpose**: Assignment and study task tracking.
3. **Primary User Goal**: Add tasks with priority and due date; check off completed coursework.
4. **Current Layout**: Filter pills -> task creation form -> task item list.
5. **Current Hierarchy**: Flat to-do list.
6. **Current Reusable Components**: `TaskForm`, `TaskItem`, `TaskList`.
7. **Current Data Sources**: `getTasks()` (`lib/data/tasks.ts`).
8. **Current Actions/Mutations**: `createTaskAction()`, `toggleTaskAction()`, `deleteTaskAction()`.
9. **Current Responsive Behavior**: Stacks cleanly on mobile.
10. **Current Loading State**: Skeleton list.
11. **Current Empty State**: "No tasks yet. Enjoy your free time or add a study task!"
12. **Current Error State**: Toast error on failed toggle.
13. **Major Design Problems**: Bulky card borders on each task item; form takes excessive vertical space.
14. **Major Usability Problems**: No keyboard shortcuts for fast creation; lacks inline date picker.
15. **Recommended Future Composition**: Clean keyboard-navigable list with strike-through animations, priority dots (Red, Amber, Slate), subject tags, and inline date chips (`@daypicker/react`).
16. **Components Worth Preserving**: Server action optimistic toggle pipeline.
17. **Components to Refactor / Create**: Refactor `TaskItem`; create `TaskFormDialog`, `Checkbox`.

### 3.7 Pomodoro Focus Timer (`/pomodoro`)
1. **Route**: `app/(app)/pomodoro/page.tsx`
2. **Purpose**: Distraction-free focus timer with audio chimes and cycle tracking.
3. **Primary User Goal**: Conduct 25-minute study intervals without client navigation interrupting the clock.
4. **Current Layout**: Centered circular timer -> interval presets -> session logs.
5. **Current Hierarchy**: Centered hero timer.
6. **Current Reusable Components**: `PomodoroTimer`, `PomodoroSettings`, `CompletionModal`.
7. **Current Data Sources**: `TimerProvider` React Context + `getPomodoroSessions()`.
8. **Current Actions/Mutations**: `logPomodoroSessionAction()`.
9. **Current Responsive Behavior**: Centered layout adapts well; controls wrap on narrow screens.
10. **Current Loading State**: Instant render via client context.
11. **Current Empty State**: "No focus sessions completed today."
12. **Current Error State**: Web Audio fallback if browser blocks autoplay.
13. **Major Design Problems**: Bulky settings box below timer; jarring audio chimes.
14. **Major Usability Problems**: Timer lacks quick association with a specific course/subject.
15. **Recommended Future Composition**: Minimalist circular ring with smooth stroke animation, `JetBrains Mono` tabular readout, subject selector dropdown, and ambient chime audio.
16. **Components Worth Preserving**: Root `TimerProvider` persistence architecture.
17. **Components to Refactor / Create**: Refactor `PomodoroTimer` into `PomodoroRing`; create `TimerControls`.

### 3.8 Videos (`/videos` & `/videos/[videoId]`)
1. **Route**: `app/(app)/videos/page.tsx`, `app/(app)/videos/[videoId]/page.tsx`
2. **Purpose**: Lecture viewing with video-anchored, timestamped notes.
3. **Primary User Goal**: Watch course lectures, record markdown notes at active video timestamps, click notes to seek video.
4. **Current Layout**: Video grid -> single video player with split-pane timestamp list.
5. **Current Hierarchy**: Video player dominates; notes placed in adjacent card.
6. **Current Reusable Components**: `VideoPlayer`, `VideoCard`, `TimestampNotesList`, `FullscreenNotesOverlay`.
7. **Current Data Sources**: `getSavedVideos()`, `getVideoNotes()`, `/api/youtube/video`.
8. **Current Actions/Mutations**: `saveVideoAction()`, `createTimestampNoteAction()`, `updateWatchProgressAction()`.
9. **Current Responsive Behavior**: Stacks player above notes on mobile.
10. **Current Loading State**: Video thumbnail skeletons.
11. **Current Empty State**: "No saved videos. Add a YouTube lecture URL to get started."
12. **Current Error State**: Fallback message if YouTube video is unavailable or restricted.
13. **Major Design Problems**: Timestamp note cards have heavy borders; player controls sometimes collide with notes drawer.
14. **Major Usability Problems**: Adding a note while video is playing causes awkward layout shift.
15. **Recommended Future Composition**: 65%/35% theater split layout; clicking any note immediately seeks the video via `player.seekTo(timestamp)`; distraction-free fullscreen overlay.
16. **Components Worth Preserving**: YouTube IFrame seeking integration.
17. **Components to Refactor / Create**: Refactor `TimestampNotesList`; create `VideoCard`, `PlaylistDrawer`.

### 3.9 Playlists (`/playlists` & `/playlists/[playlistId]`)
1. **Route**: `app/(app)/playlists/page.tsx`, `app/(app)/playlists/[playlistId]/page.tsx`
2. **Purpose**: Full YouTube course playlist tracking and sequential video watching.
3. **Primary User Goal**: Track course video sequence, watch progress, and total syllabus completion.
4. **Current Layout**: Grid of playlist cards -> detail view with video playlist sidebar.
5. **Current Hierarchy**: Playlist header -> video sequence list.
6. **Current Reusable Components**: `PlaylistCard`, `AddPlaylistModal`, `PlaylistView`.
7. **Current Data Sources**: `getSavedPlaylists()`, `getPlaylistItems()`.
8. **Current Actions/Mutations**: `savePlaylistAction()`.
9. **Current Responsive Behavior**: Stacks list on mobile.
10. **Current Loading State**: Playlist card skeletons.
11. **Current Empty State**: "No saved playlists."
12. **Current Error State**: Toast error if YouTube playlist is private.
13. **Major Design Problems**: Clunky progress bars; repetitive card frames.
14. **Major Usability Problems**: Difficulty seeing which video is currently playing.
15. **Recommended Future Composition**: Clean course curriculum tree with checkmarks for watched lectures and progress percentage.
16. **Components Worth Preserving**: Global playlist deduplication database models.
17. **Components to Refactor / Create**: Refactor `PlaylistCard`; create `CurriculumList`.

### 3.10 Notes Central (`/notes`)
1. **Route**: `app/(app)/notes/page.tsx`
2. **Purpose**: Centralized searchable index of all lecture notes across all courses.
3. **Primary User Goal**: Find specific concepts or formulas across historical video notes.
4. **Current Layout**: Search input -> list of note cards grouped by video.
5. **Current Hierarchy**: Search-first list.
6. **Current Reusable Components**: `NotesLibrary`, `TimestampNoteItem`.
7. **Current Data Sources**: `getAllUserNotes()`.
8. **Current Actions/Mutations**: `deleteTimestampNoteAction()`.
9. **Current Responsive Behavior**: Stacks on mobile.
10. **Current Loading State**: Note card skeletons.
11. **Current Empty State**: "No notes recorded yet. Take notes while watching lectures."
12. **Current Error State**: Toast on delete failure.
13. **Major Design Problems**: Excessive card padding; missing code syntax highlighting.
14. **Major Usability Problems**: Cannot filter notes by subject/course.
15. **Recommended Future Composition**: High-density searchable table with course tags, video links, timestamp badges, and copy-to-clipboard actions.
16. **Components Worth Preserving**: Note content formatting.
17. **Components to Refactor / Create**: Refactor `NotesLibrary`; create `NoteSearchTable`.

### 3.11 Resources (`/resources`)
1. **Route**: `app/(app)/resources/page.tsx`
2. **Purpose**: Bookmark vault for external academic links and developer docs.
3. **Primary User Goal**: Organize links by course, category, and subject.
4. **Current Layout**: Category filter pills -> 3-column bookmark card grid.
5. **Current Hierarchy**: Grid of web link cards with favicons.
6. **Current Reusable Components**: `ResourceCard`, `ResourceForm`, `ResourceLibrary`.
7. **Current Data Sources**: `getWebsiteResources()`.
8. **Current Actions/Mutations**: `createWebsiteResourceAction()`, `deleteWebsiteResourceAction()`.
9. **Current Responsive Behavior**: Grid collapses from 3 to 1 column.
10. **Current Loading State**: Card skeletons.
11. **Current Empty State**: "No bookmarks added yet."
12. **Current Error State**: Favicon fallback on broken image URLs.
13. **Major Design Problems**: Favicons misalign with titles; cards have heavy borders.
14. **Major Usability Problems**: No quick "Open in New Tab" one-click action.
15. **Recommended Future Composition**: Clean resource library with category sidebar, domain chips, and external link arrows.
16. **Components Worth Preserving**: Category management schema.
17. **Components to Refactor / Create**: Refactor `ResourceCard`; create `ResourceTable`.

### 3.12 Documents Vault (`/documents`)
1. **Route**: `app/(app)/documents/page.tsx`
2. **Purpose**: Private PDF document vault for lecture slides, syllabus, and lab manuals.
3. **Primary User Goal**: Upload course PDFs, view in-browser, and share/download securely.
4. **Current Layout**: Upload dropzone card -> document card grid.
5. **Current Hierarchy**: Upload form on top, document grid below.
6. **Current Reusable Components**: `UploadDocumentForm`, `DocumentCard`, `DocumentLibrary`.
7. **Current Data Sources**: `getDocuments()` (`lib/data/documents.ts`).
8. **Current Actions/Mutations**: `uploadDocumentAction()`, `deleteDocumentAction()`, R2 presigned URL generator.
9. **Current Responsive Behavior**: Grid wraps on mobile; upload dropzone compresses.
10. **Current Loading State**: Document card skeletons.
11. **Current Empty State**: "Your document vault is empty. Upload PDFs up to 50MB."
12. **Current Error State**: Upload error banner for unsupported MIME types.
13. **Major Design Problems**: Oversized file dropzone card; raw bytes displayed instead of formatted MB.
14. **Major Usability Problems**: PDF preview requires full download rather than quick modal preview.
15. **Recommended Future Composition**: Split view with compact drag-and-drop zone, sortable file table, file size badges, and in-app PDF preview modal.
16. **Components Worth Preserving**: Dual-storage architecture (Supabase + Cloudflare R2).
17. **Components to Refactor / Create**: Refactor `DocumentCard`; create `DocumentTable`, `PdfViewerModal`.

### 3.13 Settings (`/settings`)
1. **Route**: `app/(app)/settings/page.tsx`
2. **Purpose**: Account management, timer intervals, attendance defaults, and storage settings.
3. **Primary User Goal**: Adjust default attendance target (e.g., 75% to 80%), change Pomodoro times, export data.
4. **Current Layout**: Multiple separate card sections stacked vertically.
5. **Current Hierarchy**: Card-based form settings.
6. **Current Reusable Components**: `SettingsForm`, `AccountCard`, `TimerDefaultsCard`.
7. **Current Data Sources**: `getUserSettings()`, `getUserProfile()`.
8. **Current Actions/Mutations**: `updateUserSettingsAction()`, `updateProfileTimezoneAction()`.
9. **Current Responsive Behavior**: Forms collapse to single column.
10. **Current Loading State**: Form skeleton.
11. **Current Empty State**: N/A.
12. **Current Error State**: Inline form validation errors.
13. **Major Design Problems**: Disconnected sections; multiple separate Save buttons.
14. **Major Usability Problems**: Modifying attendance target does not show immediate feedback on how bunk allowances change.
15. **Recommended Future Composition**: Grouped settings navigation (Account, Study Defaults, Attendance & Timetable, Storage & Sync, Appearance) with single unified save state.
16. **Components Worth Preserving**: Timezone synchronization.
17. **Components to Refactor / Create**: Refactor `SettingsForm`; create `SettingsGroupList`.

### 3.14 Login & Signup (`/login`, `/signup`)
1. **Route**: `app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx`
2. **Purpose**: User authentication and account creation.
3. **Primary User Goal**: Sign in via email/password or Google OAuth.
4. **Current Layout**: Centered card on canvas with StudySpace logo.
5. **Current Hierarchy**: Minimalist auth box.
6. **Current Reusable Components**: `LoginForm`, `SignupForm`, `StudySpaceLogo`.
7. **Current Data Sources**: Supabase Auth client.
8. **Current Actions/Mutations**: `login()`, `signup()`, `signInWithOAuth()`.
9. **Current Responsive Behavior**: Centered container with fixed padding.
10. **Current Loading State**: Button spinner on submit.
11. **Current Empty State**: N/A.
12. **Current Error State**: Alert box with authentication error text.
13. **Major Design Problems**: Form borders and inputs look standard Tailwind defaults.
14. **Major Usability Problems**: No instant email validation.
15. **Recommended Future Composition**: Sleek obsidian card with subtle purple hairline border, brand monogram, high-contrast input fields, and smooth tab switch between Login and Signup.
16. **Components Worth Preserving**: Supabase PKCE OAuth callback flow.
17. **Components to Refactor / Create**: Restyle `LoginForm` and `SignupForm` using design system primitives.

### 3.15 Landing Page (`/`)
1. **Route**: `app/page.tsx`
2. **Purpose**: Public product showcase and value proposition.
3. **Primary User Goal**: Understand StudySpace capabilities and create an account.
4. **Current Layout**: Hero section -> feature grid -> attendance calculation showcase -> call to action.
5. **Current Hierarchy**: Standard SaaS landing page layout.
6. **Current Reusable Components**: `LandingHero`, `FeatureGrid`, `InteractiveDemo`.
7. **Current Data Sources**: Static metadata.
8. **Current Actions/Mutations**: Link to `/signup` and `/login`.
9. **Current Responsive Behavior**: Stacks on mobile viewports.
10. **Current Loading State**: Instant static paint.
11. **Current Empty State**: N/A.
12. **Current Error State**: N/A.
13. **Major Design Problems**: Generic marketing copy ("Supercharge your studies"); lacks real interactive product previews.
14. **Major Usability Problems**: Does not immediately demonstrate the bunk allowance calculation or lecture seeking.
15. **Recommended Future Composition**: High-impact editorial showcase with interactive Next Class demo, live bunk calculator, and zero marketing hype copy. FCP $<0.8\text{s}$.
16. **Components Worth Preserving**: SEO metadata and OpenGraph tags in `app/layout.tsx`.
17. **Components to Refactor / Create**: Rebuild with real product screenshots and StudySpace design tokens.

---

## 4. Flutter Mobile Application Audit (`/mobile`)

We audit all 10 major mobile screens and flows across the 10 required criteria.

### 4.1 Home Screen (`HomeScreen.dart`)
1. **Current Purpose**: Mobile daily overview.
2. **Current UI Composition**: 660-line monolithic widget: AppBar -> Greeting -> Date -> Critical subject alert -> Next class banner -> Quick stats row -> Today classes -> Tasks preview -> Pomodoro card -> Consistency card -> Continue learning -> Quick actions -> Library summary.
3. **Current Widgets**: `NextClassBanner`, `AttendanceQuickStats`, `DashboardMetricsRow`, `TodayClassCard`, `DashboardTasksCard`, `DashboardPomodoroCard`.
4. **State/Data Dependencies**: `AttendanceProvider`, `TasksProvider`, `PomodoroProvider`, `AnalyticsProvider`, `SyncEngine`.
5. **Current Interaction Model**: Vertical scroll through 9 nested cards; tap class to view details.
6. **Design Problems**: Severe card bloat (>2000px height); Next Class lacks prominent action button.
7. **Usability Problems**: Hard to mark attendance quickly on the go; stats row text clips on narrow 360dp screens.
8. **Responsive Risks**: Horizontal row of 3 stat cards overflows on small Android devices.
9. **Overflow Risks**: High risk of `RenderFlex overflowed` when Android text scaling is $\ge 1.3\times$.
10. **Recommended Future Composition**: Slivers-based screen: Greeting header -> Dominant **Next Class Banner** with "In 25 min" countdown and prominent one-tap **[ Mark Present ]** button -> 3-stat tile row -> Today's Classes timeline list.

### 4.2 Attendance Screen (`AttendanceOverviewScreen.dart`)
1. **Current Purpose**: Mobile attendance tracking, history, and subject status.
2. **Current UI Composition**: Top `TabBar` (3 tabs: Timetable/Today, My Subjects, Attendance History) with calendar header and class list.
3. **Current Widgets**: `AttendanceCalendarHeader`, `AttendanceTimeline`, `AttendanceRing`.
4. **State/Data Dependencies**: `AttendanceProvider`, `TimetableProvider`, `SyncEngine`.
5. **Current Interaction Model**: Tab-based navigation; tap class row to log status.
6. **Design Problems**: Tabs create navigation friction; calendar header has overlapping date numbers.
7. **Usability Problems**: Switching tabs resets date context; student must navigate into sub-screens to view bunk counts.
8. **Responsive Risks**: Calendar header day numbers clip on 320dp/360dp viewports.
9. **Overflow Risks**: `TabBarView` height calculation conflicts with nested vertical scrolling.
10. **Recommended Future Composition**: SilverBook-inspired horizontal week date strip (`Mon 14`, `Tue 15` [active], `Wed 16`...) -> Vertical class timeline with one-tap status toggles -> Swipe actions (`flutter_slidable`) for quick logging -> Bottom sheet class inspector.

### 4.3 Timetable Screen (`WeeklyTimetableScreen.dart`)
1. **Current Purpose**: Weekly recurring schedule browser and slot manager.
2. **Current UI Composition**: Day-of-week tab bar with vertical class list; floating action button for adding slots.
3. **Current Widgets**: `TabController`, `ListView.builder`, `FloatingActionButton`.
4. **State/Data Dependencies**: `TimetableProvider`.
5. **Current Interaction Model**: Tab between days; tap FAB to navigate to `AddClassScreen`.
6. **Design Problems**: Day tabs lack indicator dots showing which days have scheduled classes.
7. **Usability Problems**: Full-page navigation for adding a single slot breaks user context.
8. **Responsive Risks**: Slot times clip faculty names on narrow screens.
9. **Overflow Risks**: Unconstrained text in slot titles.
10. **Recommended Future Composition**: List vs Calendar segmented toggle, day selector with class count dots, clean class cards with faculty and room tags, purple floating action button opening a bottom sheet.

### 4.4 Subject Details (`SubjectDetailScreen.dart`)
1. **Current Purpose**: Single course attendance statistics and history.
2. **Current UI Composition**: Statistics card with circular ring, action buttons, and history list.
3. **Current Widgets**: `AttendanceRing`, `ListView`.
4. **State/Data Dependencies**: `AttendanceProvider`.
5. **Current Interaction Model**: Tap subject from list -> view details.
6. **Design Problems**: Text-heavy layout with generic card borders.
7. **Usability Problems**: Cannot access course materials, tasks, or syllabus notes from this screen.
8. **Responsive Risks**: Stat ring scales awkwardly on small screens.
9. **Overflow Risks**: Long subject names overflow app bar title.
10. **Recommended Future Composition**: Sliver app bar with course title -> 3 segmented tabs (`Overview`, `Materials`, `Tasks`) -> Large attendance donut ring (`86.7%`, 26/30 classes) -> Quick action tiles (`Notes`, `Add Material`, `Add Task`) -> Recent course PDFs list.

### 4.5 Study & Focus Screen (`StudyScreen.dart`)
1. **Current Purpose**: Pomodoro timer and study resources.
2. **Current UI Composition**: Embedded circular timer with play/pause controls, YouTube bookmarks, and notes link.
3. **Current Widgets**: `PomodoroProvider` consumer, `CircularProgressIndicator`.
4. **State/Data Dependencies**: `PomodoroProvider`, `StudyProvider`.
5. **Current Interaction Model**: Tap play to start focus timer; tap mode chips to switch intervals.
6. **Design Problems**: Crowded screen mixing YouTube video links and timer controls.
7. **Usability Problems**: No clear way to associate a focus session with a specific subject.
8. **Responsive Risks**: Timer controls overflow on short screens in landscape.
9. **Overflow Risks**: Landscape orientation causes vertical overflow.
10. **Recommended Future Composition**: Segmented mode selector (`Focus`, `Materials`, `Tasks`) -> Clean 25:00 focus ring with centered play/pause FAB -> Today's focus duration metric -> Quiet academic quote card.

### 4.6 Analytics Screen (`AnalyticsScreen.dart`)
1. **Current Purpose**: Longitudinal study habits, active streaks, and duration charts.
2. **Current UI Composition**: Vertical stack of cards with text counts and simple bar indicators.
3. **Current Widgets**: Custom painters, `Card`.
4. **State/Data Dependencies**: `AnalyticsProvider`.
5. **Current Interaction Model**: Read-only scroll.
6. **Design Problems**: Lacks visual hierarchy; no cohesive contribution heatmap.
7. **Usability Problems**: Text statistics fail to communicate habit consistency at a glance.
8. **Responsive Risks**: Text cards wrap unevenly.
9. **Overflow Risks**: Chart components with fixed widths cause horizontal overflow.
10. **Recommended Future Composition**: Segmented tabs (`Study`, `Attendance`, `Subjects`) -> Dominant purple contribution activity matrix (30/60-day heatmap) -> Weekly study bar chart (`fl_chart`) -> Diurnal focus rhythm breakdown.

### 4.7 Tasks Screen (`TasksScreen.dart`)
1. **Current Purpose**: Coursework to-do list.
2. **Current UI Composition**: Basic `ListView` of checkboxes with priority badges.
3. **Current Widgets**: `CheckboxListTile`, `FloatingActionButton`.
4. **State/Data Dependencies**: `TasksProvider`.
5. **Current Interaction Model**: Tap checkbox to complete; tap FAB to add task.
6. **Design Problems**: Standard Material 3 styling without StudySpace branding.
7. **Usability Problems**: No filter tabs for Today vs Upcoming tasks; no swipe-to-delete.
8. **Responsive Risks**: Long task titles wrap into 4+ lines.
9. **Overflow Risks**: Low.
10. **Recommended Future Composition**: Filter pills (`All`, `Today`, `Upcoming`) -> Custom animated checkboxes -> Priority dots -> Swipe actions (`flutter_slidable`) for quick completion and deletion.

### 4.8 Profile & Settings Screen (`ProfileScreen.dart`)
1. **Current Purpose**: Account details, theme settings, and sync status.
2. **Current UI Composition**: Raw list of buttons and text values.
3. **Current Widgets**: `ListTile`, `SwitchListTile`.
4. **State/Data Dependencies**: `AuthProvider`, `ThemeProvider`, `SyncEngine`.
5. **Current Interaction Model**: Tap tile to toggle setting or sign out.
6. **Design Problems**: Lacks grouping and visual refinement.
7. **Usability Problems**: Sync queue status is hidden at the bottom; widget setup instructions missing.
8. **Responsive Risks**: None.
9. **Overflow Risks**: Low.
10. **Recommended Future Composition**: Grouped settings tiles with chevrons: Account, Appearance (Dark/Light/System), Notifications, Data & Sync (SQLite cache and pending queue), App Widget setup, Help & Feedback, About StudySpace.

### 4.9 Timetable AI Scanner Flow (`ScanTimetableScreen.dart` & `ScannedTimetableReviewScreen.dart`)
1. **Current Purpose**: Photograph university schedule and import slots via AI OCR.
2. **Current UI Composition**: Image picker screen -> OCR progress indicator -> Table review screen.
3. **Current Widgets**: `ImagePicker`, `ScannedTimetableReviewScreen`.
4. **State/Data Dependencies**: `TimetableProvider`, Supabase HTTP client.
5. **Current Interaction Model**: Take photo -> wait for AI response -> edit detected rows -> save.
6. **Design Problems**: Detected slot table is crowded on mobile screens.
7. **Usability Problems**: Hard to edit start/end times in narrow text fields on small screens.
8. **Responsive Risks**: Detected slot table overflows horizontally.
9. **Overflow Risks**: Table columns with fixed widths.
10. **Recommended Future Composition**: Card-based review list with time pickers, subject dropdowns, and batch confirmation button.

### 4.10 Android Home Screen Widget Flow (`home_widget`)
1. **Current Purpose**: Direct home-screen glanceability without launching app.
2. **Current UI Composition**: Proposed high-value roadmap feature.
3. **Current Widgets**: `home_widget` plugin bridge to Android `AppWidgetProvider`.
4. **State/Data Dependencies**: Local SQLite `attendance_records` and `timetable_slots`.
5. **Current Interaction Model**: Glance at next class; tap [Mark Present] button on widget to log attendance directly into SQLite and trigger background sync.
6. **Design Problems**: N/A (new feature).
7. **Usability Problems**: Eliminates the need to unlock phone and open app between classes.
8. **Responsive Risks**: Must adapt to standard 4x2 and 2x2 Android widget cell sizes.
9. **Overflow Risks**: Text truncation required on course titles.
10. **Recommended Future Composition**: Clean widget layout displaying next class, room, countdown, attendance donut gauge, and one-tap [Mark Present] action.

---

## 5. Attendance & Timetable Business Logic Safety Audit

Attendance tracking and timetable resolution represent the mission-critical core of StudySpace.

### 5.1 End-to-End Data Pipeline Trace
```
Database (Supabase PostgreSQL / SQLite)
  │  • public.semesters, public.subjects, public.timetable_slots
  │  • public.timetable_exceptions, public.attendance_records
  ▼
Data Access Layer (lib/data/attendance.ts, dashboardAttendance.ts)
  │  • Fetches raw slots, exceptions, subjects, and records
  ▼
Class Resolution Engine (lib/attendance/resolution.ts)
  │  • resolveClassesForDate(dateStr, slots, exceptions, subjects, records)
  │  • Injects 'extra' classes, shifts 'rescheduled', strips 'cancelled'
  ▼
Mathematical Domain Engine (lib/attendance/calculations.ts)
  │  • calculateSubjectAttendance(), calculateOverallAttendance()
  │  • calculateBunkAllowance(), calculateRecoveryRequirement()
  │  • determineRiskState() -> SAFE | WARNING | CRITICAL
  ▼
State & Provider Layer (AttendanceClientView / AttendanceProvider)
  │  • Exposes resolved todayClasses and SubjectAttendanceSummary[]
  ▼
UI Presentation Layer
  • Next Class Hero Card, Today Timeline, Subject Attendance Cards
```

### 5.2 Mathematical Invariants (Strict Preservation)
The redesign must **consume existing calculation functions without alteration**:
1. **Attendance Percentage**:
   $$\text{Percentage} = \frac{\text{Baseline Attended} + \text{Live Present}}{\text{Baseline Total} + \text{Live Present} + \text{Live Absent}} \times 100$$
   *(Cancelled classes strictly excluded from numerator and denominator).*
2. **Safe Bunk Allowance ($M$)**:
   $$M = \max\left(0, \; \left\lfloor \frac{\text{Attended} \times 100}{\text{Target}} - \text{Total} \right\rfloor\right)$$
3. **Recovery Requirement ($R$)**:
   $$R = \max\left(0, \; \left\lceil \frac{\text{Target} \times \text{Total} - 100 \times \text{Attended}}{100 - \text{Target}} \right\rceil\right)$$
   *(If Target = 100% and any absence exists, $R = \infty$).*
4. **Risk State Machine**:
   - `SAFE`: $\text{Percentage} \ge \text{Target}$ and $\text{Bunk Allowance} \ge 2$.
   - `WARNING`: $\text{Percentage} \ge \text{Target}$ but $\text{Bunk Allowance} \le 1$.
   - `CRITICAL`: $\text{Percentage} < \text{Target}$.

> [!IMPORTANT]
> **Zero Calculation Duplication Rule**: Presentation components must never compute bunk allowance, recovery requirements, or percentages inline. All UI elements must directly read pre-calculated fields from `SubjectAttendanceSummary` and `OverallAttendanceSummary`.

---

## 6. Design System Audit: Existing Tokens & Inconsistencies

We catalog all design properties currently in the codebase to identify duplication, hardcoded values, and candidates for shared design tokens.

### 6.1 Colors & Status Tokens
- **Current Consistent Patterns**: Obsidian dark canvas (`#090D16`), card dark (`#111726`), border dark (`#1E293B`), white light canvas (`#F8FAFC`).
- **Inconsistencies & Duplications**:
  - Web uses Indigo (`#4F46E5` / `#6366F1`) in `globals.css`, but logo uses Purple (`#6B46C1` / `#7C3AED` / `#8B5CF6`).
  - Dark mode surfaces alternate between `#090D16`, `#0C111E`, `#111726`, and `#1A2234` without a clear surface elevation hierarchy.
  - Emerald status text uses `#047857` in some files and `#10B981` in others.
- **Candidates for Design Tokens**: Establish 11-step Study purple scale (`--color-study-50` to `--color-study-950`) + 3 semantic surfaces (`--canvas`, `--surface`, `--surface-raised`).

### 6.2 Typography & Fonts
- **Web**: `Geist` and `Geist Mono` in `app/layout.tsx`; inline styles use system sans-serif.
- **Flutter**: `Plus Jakarta Sans` in `app_typography.dart`.
- **Target Resolution**: Standardize on `Plus Jakarta Sans` across both Web and Mobile for primary UI, and `JetBrains Mono` with tabular numbers for all numerical/clock data.

### 6.3 Radii & Borders
- **Current Hardcoded Values**: Random mix of `rounded-lg` (8px), `rounded-xl` (12px), `rounded-2xl` (16px), `rounded-3xl` (24px), `rounded-full` (9999px).
- **Target Resolution**: Restrict strictly to 4 tokens: `sm` (6px), `md` (10px), `lg` (16px), `full` (9999px).

---

## 7. Information Hierarchy & Screen Focus Audit

For each major screen, we enforce **ONE PRIMARY FOCUS PER SCREEN** and evaluate whether sections belong as cards, lists, timelines, tables, charts, or sheets.

| Screen | Primary Focus | Secondary Information | Tertiary Information | Dominant Layout Element | Action Model |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Dashboard** | **Next Class & Immediate Status** | Today's full schedule, daily focus duration | Current streak, pending tasks | **Hero Next Class Card + Vertical Timeline** | Primary: [Mark Present]; Secondary: Quick Actions |
| **Attendance** | **Today's Class Actions & Standing** | Course bunk allowances, target status | Historical attendance logs | **Horizontal Week Strip + Class Timeline** | Primary: One-tap status buttons / Slidable swipe |
| **Timetable** | **Weekly Schedule Overview** | Room overrides, faculty names, class types | Semester dates | **5/7-Col Grid (Web) / Day Timeline (Mobile)** | Primary: [Scan Timetable] / [+ Add Slot] |
| **Subject Details**| **Course Health & Mastery** | Syllabus PDFs, lab manuals, assignments | Baseline counts | **Segmented Tabs (Overview / Materials / Tasks)** | Primary: [Take Notes] / [Add Material] |
| **Analytics** | **Longitudinal Study Consistency** | Weekly study hours comparison | Diurnal rhythm, earned milestones | **Expansive 365-Day Heatmap Canvas** | Primary: Hover/Tap for session inspection |
| **Tasks** | **Immediate Academic To-Dos** | Due dates, subject tags | Completed history | **Keyboard-First Filterable List** | Primary: Checkbox toggle / Add task |
| **Pomodoro** | **Distraction-Free Focus Time** | Daily focus minutes, cycle count | Ambient quotes, audio toggles | **Minimalist Circular Ring Gauge** | Primary: [Play / Pause] |
| **Videos** | **Lecture Video Seeking & Notes** | Video playlist sequence | Video duration | **65%/35% Theater Split View** | Primary: Click note to seek video |
| **Documents** | **Course PDF Vault** | File sizes, upload timestamps | Storage provider | **Sortable Data Table with PDF Preview** | Primary: View / Download PDF |

---

## 8. Web & Flutter Cross-Platform Consistency

### 8.1 What Must Match Conceptually
1. **Design Tokens**: Identical 11-step Study purple, semantic status colors (Emerald, Amber, Red), and surface grammar (Canvas, Surface, Raised).
2. **Typography Hierarchy**: Display, H1, H2, H3, Body, Label, Caption, Mono Data.
3. **Iconography**: Exclusively **Lucide** icons across both Web and Mobile.
4. **Attendance Mathematics**: Identical percentages, bunk allowances, recovery counts, and risk states.
5. **Brand Personality**: Academic, quiet, technical, focused, student-first.

### 8.2 What Must Differ Ergonomically
1. **Web**:
   - Keyboard-first interaction (`Cmd+K` command palette, arrow navigation, shortcut triggers).
   - Multi-column desktop grids (Hero split, 3-column operational layouts).
   - High information density with rich hover tooltips and side-by-side theater layouts.
2. **Mobile (Flutter)**:
   - Touch-first, one-handed ergonomics (thumb-zone action buttons, bottom navigation).
   - Bottom sheets and slide-over drawers instead of centered dialog modals.
   - Tactile haptic feedback (`FeedbackService.instance`) on attendance toggles.
   - Swipe gestures (`flutter_slidable`) for quick attendance and task actions.
   - Native Android Home Screen Widget (`home_widget`) for glanceable next class awareness.
