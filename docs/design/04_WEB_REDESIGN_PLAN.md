# StudySpace — Web Redesign Blueprint (Next.js 16 App Router)

> **Document Status**: Complete Implementation Blueprint  
> **Audience**: Frontend Engineers, Design Engineers, AI Coding Agents  
> **Target Aesthetic**: Quiet Academic / Technical Productivity (Dark Obsidian & Crisp Light)  
> **Core Architectural Rule**: Server Components by default; client components strictly where interactive state is required; zero inline `supabase.from()` calls; mutations via Server Actions.

---

## 1. Global Web Application Shell (`AppShell.tsx`)

- **Current**: 12-item flat navigation sidebar (`AppSidebar.tsx`), inline SVGs, generic header, mobile drawer menu.
- **Problem**: Cluttered cognitive load; short laptop screens clip bottom profile links; inconsistent dark mode background tinting.
- **Target**: Sleek 6-item desktop sidebar + compact top search/action bar + accessible slide-over mobile drawer.
  - **Sidebar Destinations**: Dashboard, Timetable, Attendance, Study (unifying focus, materials, notes), Analytics, Subjects, Settings.
  - **Top Bar**: Search input (`Cmd+K` shortcut), Notification bell with unread dot, User avatar pill (`S`).
  - **Bottom Profile Anchor**: User avatar, full name ("Sachin"), role subtitle ("Student"), theme toggle shortcut.
- **Reusable Components**: `AppSidebar`, `AppHeader`, `CommandPalette`, `ThemeToggle`, `StudySpaceLogo`.

---

## 2. Screen-by-Screen Redesign Specifications

### 2.1 Dashboard (`/dashboard`)
- **Current**: 7 stacked sections: 3 metric cards -> attendance overview card -> consistency heatmap card -> 2-column tasks/pomodoro grid -> continue learning -> quick actions -> library summary.
- **Problem**: Severe card fatigue (12+ boxes); equal visual weight across all elements; Next Class is buried inside another card; duplicate study time counters.
- **Target (Images 1, 2, 5)**:
  - **Primary Focus**: Today's operational state — knowing the next immediate class and having a one-tap action to mark attendance.
  - **Layout**:
    - **Header Row**: "Good morning, Sachin. You're on track. Two classes left today." with date picker shortcut ("Tue, 15 Jul 2025 · Today v").
    - **Hero Split (Top)**:
      - Left (60%): **Next Class Card** ("Software Engineering Lab", "08:30 - 09:30 • CT-09", "Ms. Khushi Parmar", countdown pill "In 25 min", primary purple button `[Mark Present]`, secondary button `[View Details]`).
      - Right (40%): **Atmospheric Mountain Banner** ("Small steps lead to big progress. Consistency today, a better tomorrow.").
    - **Metric Strip**: 4 inline stat tiles (`MetricTile`):
      1. Today's Study (`2h 14m`, `+18%`).
      2. Attendance (`84.7%`, `+2.3%`, mini circular ring).
      3. Current Streak (`7 days`, flame icon).
      4. Tasks (`3 / 5`, `2 remaining`, checkmark).
    - **Main Split (Bottom)**:
      - Left (65%): **Today's Schedule** timeline with time markers (`08:30`, `09:30`, `11:00`), subject titles, room codes (`CT-09`, `LT-04`), and status pills (`[Present]`, `[Upcoming]`). Header includes "View Timetable →" link.
      - Right (35%): Stack containing:
        1. **Study Activity**: Weekly hours bar chart (`2h 14m this week`, `+18%`).
        2. **Quick Actions**: 4 quiet shortcut rows with Lucide icons (Start Focus Session, Add Study Material, View Analytics, Manage Subjects).
- **Reusable Components**: `NextClassCard`, `MetricTile`, `ClassRow`, `StudyActivityChart`, `QuickActionsList`.
- **Mobile/Web Differences**: On mobile ($<768\text{px}$), the Hero split stacks vertically; metric strip converts to 2x2 grid or horizontal carousel; timeline renders with full-width tap targets.
- **Data Dependencies**: `getDashboardData()` (`lib/data/dashboard.ts`) and `getDashboardAttendanceData()` (`lib/data/dashboardAttendance.ts`).
- **Risk**: Low. All required data fields (`nextClass`, `todayClasses`, `overallSummary`, `heatmap`) are already computed by existing data access functions.

---

### 2.2 Attendance Tracker (`/attendance`)
- **Current**: Semester selector header -> overall attendance metric card -> today's class resolution card -> subject grid -> history table.
- **Problem**: Overall summary card is visually heavy; mathematical formulas take up excessive space; no week-date strip for quick schedule inspection.
- **Target (Images 1, 3, SilverBook inspiration)**:
  - **Primary Focus**: Today's class status and quick one-tap attendance marking, backed by clear course-by-course bunk allowances.
  - **Layout**:
    - **Top Bar**: "Attendance Tracker", active semester pill (`Semester 4 v`), button `[+ Add Class / Exception]`.
    - **Date Navigation Strip**: Horizontal week strip (`Mon 14`, `Tue 15` active, `Wed 16`...) showing scheduled class indicators.
    - **Today's Classes Timeline**: Vertical list of resolved classes for the selected date. Each class has: start/end time, subject code, room, faculty, and one-tap status toggles (`[Present]`, `[Absent]`, `[Cancelled]`).
    - **Subject Standing Grid**: 2 or 3-column grid of courses. Each card displays: subject name, code, circular progress ring (`86.7%`), total classes attended vs conducted (`26 / 30`), and explicit bunk badge:
      - `SAFE`: `3 safe bunks available` (Emerald pill).
      - `WARNING`: `1 bunk left — danger zone` (Amber pill).
      - `CRITICAL`: `Attend next 2 classes to recover` (Red pill).
    - **Slide-over Drawer**: Historical log of all marked classes with filter by subject and date.
- **Reusable Components**: `WeekDateStrip`, `ClassRow`, `SubjectCard`, `DonutGauge`, `AttendanceHistoryTable`.
- **Data Dependencies**: `lib/data/attendance.ts`, `lib/data/subjects.ts`, `lib/data/timetable.ts`, `lib/attendance/calculations.ts`.
- **Risk**: Low to Medium. Ensure `markAttendanceAction` Server Action retains optimistic updates during rapid clicking.

---

### 2.3 Subject Details (`/attendance/[subjectId]`)
- **Current**: Basic statistics table and baseline adjustment form.
- **Problem**: Disconnected from the rest of the study ecosystem; no access to course files, tasks, or syllabus.
- **Target (Images 1, 2, 4)**:
  - **Primary Focus**: Complete course mastery hub uniting attendance health, study materials, notes, and pending course assignments.
  - **Layout**:
    - **Course Header**: Course name ("Software Engineering"), code ("CS402"), faculty, default room, credits.
    - **Segmented Tabs**: `Overview`, `Materials`, `Tasks`, `Attendance History`.
    - **Overview Tab**:
      - Attendance Donut Gauge (`86.7%`, 26/30 classes).
      - Interactive Target Simulator: Slider allowing the student to adjust the target percentage (e.g. 75% to 80%) and see required recovery classes dynamically.
      - Quick Action Tiles: `[Take Notes]`, `[Add Material]`, `[New Assignment]`.
      - Recent Materials List: List of uploaded PDFs with file sizes and upload dates.
- **Reusable Components**: `DonutGauge`, `Tabs`, `DocumentCard`, `TaskItem`.
- **Data Dependencies**: `getSubjectById()`, `getAttendanceRecordsBySubject()`, `getDocumentsBySubject()`, `getTasksBySubject()`.

---

### 2.4 Timetable Grid & AI Scanner (`/timetable`)
- **Current**: 7-column grid with custom modal forms for slot editing and exception management.
- **Problem**: Grid breaks completely on tablet and mobile viewports; AI review modal is cluttered.
- **Target**:
  - **Primary Focus**: High-density weekly schedule visibility and frictionless slot adjustments.
  - **Layout**:
    - **Header**: Semester selector, View toggle (`Week Grid` vs `Daily Timeline`), button `[📷 Scan Timetable Photo]`, button `[+ Add Slot]`.
    - **Desktop View ($\ge 1024\text{px}$)**: 5/7-column clean grid with sticky time markers (`08:00`, `09:00`, `10:00`...); class cards color-coded by class type (Lecture = subtle purple, Lab = subtle blue, Tutorial = subtle slate). Hovering a slot reveals faculty and room overrides.
    - **Mobile/Tablet View ($<1024\text{px}$)**: Horizontal day tabs (`Mon`, `Tue`, `Wed`, `Thu`, `Fri`) with a single-column vertical timeline.
    - **AI Scanner Review Drawer**: Side-by-side verification interface: left side displays the uploaded timetable photo with zoom/pan controls; right side displays the structured table of detected slots with inline editing before final batch persistence.
- **Reusable Components**: `TimetableGrid`, `TimetableDayTimeline`, `SlotEditorModal`, `ExceptionModal`, `AiScannerReview`.
- **Data Dependencies**: `getTimetableSlots()`, `getTimetableExceptions()`, `/api/timetable/scan`.

---

### 2.5 Analytics (`/analytics`)
- **Current**: 18 separate cards stacked vertically.
- **Problem**: Maximum card fatigue; 365-day heatmap is cramped; lacks clear visual hierarchy.
- **Target (Images 1, 2, 3, 5)**:
  - **Primary Focus**: The longitudinal study consistency heatmap as the dominant, proud hero object.
  - **Layout**:
    - **Hero Section**: **Study Consistency Canvas** (GitHub-style contribution grid styled in StudySpace purple tokens). Large header: `14 active days · Current streak: 7 days 🔥`. Legend: `Less [■][■][■][■][■] More`. Tooltips show daily study duration and session counts on hover.
    - **Middle Analytical Grid (2 Columns)**:
      - Left: **Weekly Study Distribution**: Bar chart comparing daily focus minutes (Mon–Sun) against the previous week, with total weekly hours (`32h 18m`) and delta (`+18%`).
      - Right: **Diurnal Focus Rhythm**: Clean radial or stacked distribution showing when the student studies best (Morning: 05:00–12:00, Afternoon: 12:00–17:00, Evening: 17:00–21:00, Night: 21:00–05:00).
    - **Bottom Section**: **Milestone Shelf**: Quiet row of earned milestone badges (7-day streak, 50 focus hours, 100 classes attended) with progress bars for locked badges.
- **Reusable Components**: `HeatmapCanvas`, `WeeklyTrendChart`, `DiurnalRhythmChart`, `MilestoneShelf`.
- **Data Dependencies**: `getAnalyticsData()` (`lib/data/analytics.ts`).

---

### 2.6 Tasks (`/tasks`)
- **Current**: Standard to-do list with priority and status filters.
- **Target**: Keyboard-first task manager with quick filter tabs (`All`, `Today`, `Upcoming`, `Completed`), priority dot indicators (High = Red, Medium = Amber, Low = Slate), subject tag chips, and inline date pickers (`@daypicker/react`).
- **Reusable Components**: `Tabs`, `TaskItem`, `TaskFormDialog`, `Checkbox`.

---

### 2.7 Pomodoro Focus Suite (`/pomodoro`)
- **Current**: Full-screen focus timer with interval presets and session logs.
- **Target**: Distraction-free focus sanctuary:
  - Minimalist circular progress ring with smooth SVG stroke animation.
  - Digital readout (`25:00`) in `JetBrains Mono` tabular font.
  - Subject tag selector linking the focus session directly to a course.
  - Ambient Web Audio synthesizers with quiet completion chimes.
  - Background persistence guaranteed by root `TimerProvider`.
- **Reusable Components**: `PomodoroRing`, `TimerControls`, `SessionHistoryList`.

---

### 2.8 Videos, Playlists & Notes (`/videos`, `/playlists`, `/notes`)
- **Current**: YouTube IFrame player with side-by-side timestamp notes list.
- **Target**: High-performance academic video viewer:
  - 65% / 35% theater split layout: YouTube video player on left, timestamp notes panel on right.
  - Clicking any note jumps the video directly via `player.seekTo(timestamp)`.
  - Fullscreen distraction-free overlay for split-screen note-taking during lectures.
  - Global notes search across all videos and courses.
- **Reusable Components**: `VideoPlayer`, `TimestampNotesList`, `VideoCard`, `PlaylistDrawer`.

---

### 2.9 Documents & Resources (`/documents`, `/resources`)
- **Current**: Document grid and bookmark link cards.
- **Target**: Private academic vault for syllabus PDFs, past exam papers, and learning resources:
  - Table and grid views with search, subject filter, and file size indicators.
  - Secure PDF viewer modal leveraging short-lived presigned URLs (Supabase Storage / Cloudflare R2).
- **Reusable Components**: `DocumentTable`, `PdfViewerModal`, `ResourceCard`.

---

### 2.10 Settings (`/settings`)
- **Current**: Form cards for timer durations, attendance defaults, and account details.
- **Target**: Grouped academic settings page:
  1. **Profile**: Name, avatar, university, semester.
  2. **Study Preferences**: Default Pomodoro durations, weekly study goal minutes.
  3. **Attendance & Timetable Defaults**: Default institutional attendance target (e.g. 75.00%), morning notification time.
  4. **Data, Sync & Storage**: Active storage provider status (Supabase / Cloudflare R2), export all data to JSON.
  5. **Appearance**: Light, Dark, System theme selector.
- **Reusable Components**: `SettingsSection`, `Input`, `Switch`, `ThemeToggle`.

---

### 2.11 Authentication & Landing Page (`/login`, `/signup`, `/`)
- **Current**: Standard Supabase Auth form and feature showcase.
- **Target**:
  - **Auth**: Elegant card-on-canvas with brand purple monogram, email/password fields, OAuth buttons, and zero extraneous marketing copy.
  - **Landing Page**: Clean editorial presentation: live interactive product previews, genuine student use cases, instant demo video seek walkthrough, zero generic "AI magic" claims. Fast First Contentful Paint ($<0.8\text{s}$).
