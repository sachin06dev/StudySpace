# StudySpace — Component Architecture & Cross-Platform Primitives

> **Document Status**: Complete Specification  
> **Scope**: Component taxonomy, directory architecture, refactoring roadmap, and Storybook / Widgetbook catalog plan for Web (Next.js 16) and Mobile (Flutter 3.19).

---

## 1. Directory Structure Blueprint

To eliminate ad-hoc CSS classes, duplicated SVG icons, and fragmented UI elements, StudySpace establishes a dedicated `design-system/` layer on both Web and Mobile.

### 1.1 Web Component Architecture (`/components` & `/design-system`)
```
studyspace_nextjs/
├── design-system/                  # Single source of truth for Web design tokens
│   ├── tokens.css                  # CSS Variables & Tailwind @theme definitions
│   ├── colors.ts                   # Hex and semantic color mappings
│   ├── typography.ts               # Font scales, weights, and letter-spacing
│   ├── spacing.ts                  # 4px/8px baseline grid constants
│   ├── radii.ts                    # sm, md, lg, full tokens
│   ├── motion.ts                   # Transition durations and easing cubic-beziers
│   └── README.md                   # Usage guide and agent rules
│
├── components/
│   ├── ui/                         # Restyled accessible primitives (Radix UI / Tailwind v4)
│   │   ├── button.tsx              # Primary, secondary, ghost, danger, icon variants
│   │   ├── input.tsx               # High-contrast inputs with focus ring
│   │   ├── dialog.tsx              # Centered accessible modal dialogs
│   │   ├── sheet.tsx               # Slide-over drawer (Vaul / Radix)
│   │   ├── tabs.tsx                # Clean underline / pill tab switchers
│   │   ├── dropdown-menu.tsx       # Popover menus
│   │   ├── tooltip.tsx             # Accessible hover tooltips
│   │   ├── badge.tsx               # Status badges with WCAG AA semantic tokens
│   │   ├── checkbox.tsx            # Crisp check indicator
│   │   ├── skeleton.tsx            # Structural skeleton loader primitives
│   │   └── command.tsx             # Quick search & shortcut palette (cmdk)
│   │
│   ├── shared/                     # Cross-feature domain widgets
│   │   ├── StudySpaceLogo.tsx      # Official symbol mark & wordmark
│   │   ├── ThemeToggle.tsx         # Dark / Light / System switcher
│   │   ├── TimezoneSync.tsx        # Automatic IANA timezone synchronizer
│   │   ├── MetricTile.tsx          # Compact stat tile (value, label, delta, icon)
│   │   ├── StatusPill.tsx          # Present / Upcoming / Absent status badge
│   │   ├── DonutGauge.tsx          # Circular percentage indicator (attendance, goals)
│   │   ├── ClassRow.tsx            # Universal schedule row with time, room, status
│   │   └── EmptyState.tsx          # S-mark geometry empty state
│   │
│   ├── layout/                     # Application shell & navigation
│   │   ├── AppShell.tsx            # Responsive grid container
│   │   ├── AppSidebar.tsx          # Clean 6-item desktop navigation
│   │   ├── MobileHeader.tsx        # Sleek mobile navigation bar
│   │   └── MobileNavDrawer.tsx     # Mobile drawer navigation
│   │
│   ├── dashboard/                  # Dashboard domain components
│   │   ├── NextClassCard.tsx       # Dominant hero card with countdown & quick mark
│   │   ├── TodayScheduleTimeline.tsx # Vertical day schedule with connectors
│   │   ├── StudyActivityChart.tsx  # Weekly hours bar chart
│   │   └── QuickActionsList.tsx    # Compact 4-action shortcut stack
│   │
│   ├── attendance/                 # Attendance domain components
│   │   ├── AttendanceHeader.tsx    # Semester badge & overall percentage
│   │   ├── SubjectCard.tsx         # Course attendance card with bunk tags
│   │   ├── AttendanceHistoryTable.tsx # Historical class log with date filters
│   │   └── RecoveryPlannerSheet.tsx # Target adjustment & recovery simulator
│   │
│   ├── timetable/                  # Timetable domain components
│   │   ├── TimetableGrid.tsx       # 5/7-column desktop grid with sticky headers
│   │   ├── TimetableDayTimeline.tsx # Mobile / tablet day schedule view
│   │   ├── SlotEditorModal.tsx     # Add/edit recurring class slot
│   │   ├── ExceptionModal.tsx      # Cancelled / extra / rescheduled class modal
│   │   └── AiScannerReview.tsx     # Image OCR timetable verification
│   │
│   └── analytics/                  # Analytics domain components
│       ├── HeatmapCanvas.tsx       # Expansive 365-day study consistency grid
│       ├── WeeklyTrendChart.tsx    # Current vs prior week study comparison
│       ├── DiurnalRhythmChart.tsx  # Morning/Afternoon/Evening/Night focus chart
│       └── MilestoneShelf.tsx      # Gamified milestone showcase
```

### 1.2 Flutter Mobile Component Architecture (`/mobile/lib`)
```
mobile/lib/
├── design_system/                  # Dedicated Flutter design system module
│   ├── theme/
│   │   ├── app_theme.dart          # Light and dark ThemeData specifications
│   │   └── app_color_scheme.dart   # Semantic ColorScheme extensions
│   ├── tokens/
│   │   ├── app_colors.dart         # 11-step Study purple + semantic status tokens
│   │   ├── app_spacing.dart        # 4px/8px grid constants
│   │   ├── app_radii.dart          # sm, md, lg, full borderRadius
│   │   └── app_shadows.dart        # none, soft, elevated BoxShadows
│   ├── typography/
│   │   └── app_typography.dart     # Plus Jakarta Sans text styles & mono digits
│   ├── motion/
│   │   └── app_motion.dart         # Durations (quick, standard) and Curves
│   └── widgets/                    # Shared reusable Flutter primitives
│       ├── study_button.dart       # Primary, secondary, outlined, ghost buttons
│       ├── study_card.dart         # Non-nested surface container with hairline border
│       ├── study_text_field.dart   # Crisp input with focus states
│       ├── class_timeline_tile.dart# Vertical schedule tile with time & status pill
│       ├── attendance_donut_ring.dart # Radial attendance percentage painter
│       ├── metric_stat_tile.dart   # Compact home stat tile (Study, Attendance, Streak)
│       ├── status_pill.dart        # Present / Upcoming / Absent / Cancelled badge
│       ├── study_bottom_sheet.dart # Standardized rounded bottom sheet wrapper
│       └── study_empty_state.dart  # S-mark branded empty state
```

---

## 2. Component Categorization & Refactoring Plan

We categorize every existing component into: **KEEP**, **REFACTOR**, **MERGE**, or **CREATE**.

### 2.1 Web Components Audit Matrix

| Component Name | File Path | Status | Action Required |
| :--- | :--- | :--- | :--- |
| `AppSidebar` | `components/layout/AppSidebar.tsx` | **REFACTOR** | Consolidate 12 items into 6 core sections (Dashboard, Timetable, Attendance, Study, Analytics, Settings); replace hardcoded SVGs with Lucide; add active purple highlight pill. |
| `MobileNavDrawer` | `components/layout/MobileNavDrawer.tsx` | **REFACTOR** | Match new 6-item navigation; use semantic tokens; implement smooth drawer slide. |
| `DashboardHeader` | `components/dashboard/DashboardHeader.tsx` | **REFACTOR** | Remove generic greeting copy; align to "Good morning, Sachin. You're on track. Two classes left today." with date picker shortcut. |
| `DashboardMetricCard` | `components/dashboard/DashboardMetricCard.tsx` | **REFACTOR** | Transform from 3 heavy cards into a sleek, unified 4-metric strip (`MetricTile.tsx`). |
| `DashboardAttendanceCard` | `components/dashboard/DashboardAttendanceCard.tsx` | **MERGE** | Break apart: extract `NextClassCard` as the dominant hero and `TodayScheduleTimeline` as the schedule list. Delete nested card container. |
| `DashboardConsistencyCard` | `components/dashboard/DashboardConsistencyCard.tsx` | **REFACTOR** | Move full heatmap to `/analytics`; show compact 7-day sparkline or mini-heatmap on dashboard. |
| `ContinueLearning` | `components/dashboard/ContinueLearning.tsx` | **REFACTOR** | Flatten into clean horizontal row with video thumbnails and progress bars. |
| `QuickActions` | `components/dashboard/QuickActions.tsx` | **REFACTOR** | Convert from bulky grid into compact 4-action sidebar/column stack with Lucide icons. |
| `StudyLibrarySummary` | `components/dashboard/StudyLibrarySummary.tsx` | **MERGE** | Move to `/settings` or `/study`; remove from main dashboard to eliminate clutter. |
| `OverallAttendanceCard` | `components/attendance/OverallAttendanceCard.tsx` | **REFACTOR** | Replace bulky alert banners with clean header stats: overall percentage ring, safe bunks badge, and recovery warning tag. |
| `SubjectAttendanceCard` | `components/attendance/SubjectAttendanceCard.tsx` | **REFACTOR** | Use clean surface with circular progress indicator, subject code, room, and mathematical bunk count (`3 safe bunks`). |
| `TimetableGrid` | `components/timetable/TimetableGrid.tsx` | **REFACTOR** | Add sticky time headers, smooth horizontal scrolling, responsive 1-day/week toggle for small viewports. |
| `HeatmapGrid` | `components/analytics/HeatmapGrid.tsx` | **KEEP & REFACTOR** | Preserve mathematical 5-level coloring logic; expand width to full canvas; style in StudySpace purple tokens (`--color-study-100` to `--color-study-700`). |
| `MilestonesCard` | `components/analytics/MilestonesCard.tsx` | **REFACTOR** | Remove AI sparkles; style as quiet academic achievement shelf. |
| `StudySpaceLogo` | `components/shared/StudySpaceLogo.tsx` | **KEEP** | Perfect implementation; preserve as brand single source of truth. |
| `ThemeToggle` | `components/shared/ThemeToggle.tsx` | **KEEP** | Clean accessible toggle; preserve. |

### 2.2 Flutter Mobile Components Audit Matrix

| Component Name | File Path | Status | Action Required |
| :--- | :--- | :--- | :--- |
| `MainNavigationShell` | `mobile/lib/navigation/screens/main_navigation_shell.dart` | **REFACTOR** | Update bottom navigation bar with clean Lucide-style rounded icons, purple active tint, and haptic feedback on tap. |
| `HomeScreen` | `mobile/lib/home/screens/home_screen.dart` | **REFACTOR** | Eliminate vertical scroll bloat (660 lines with 9 nested cards). Recompose around: Hero Next Class banner -> 3-stat tile row -> Today's classes timeline. |
| `NextClassBanner` | `mobile/lib/home/widgets/next_class_banner.dart` | **REFACTOR** | Transform into dominant action card with clear "In 25 min" countdown and prominent one-tap **[ Mark Present ]** button. |
| `AttendanceOverviewScreen` | `mobile/lib/attendance/screens/attendance_overview_screen.dart` | **REFACTOR** | Replace clumsy 3-tab layout with SilverBook-inspired horizontal calendar week strip and vertical class timeline. |
| `AttendanceTimeline` | `mobile/lib/attendance/widgets/attendance_timeline.dart` | **REFACTOR** | Integrate swipe-to-mark gesture (`flutter_slidable`) while maintaining explicit tap buttons for accessibility. |
| `AttendanceRing` | `mobile/lib/attendance/widgets/attendance_ring.dart` | **KEEP** | Custom painter ring is well-implemented; update stroke colors to match new semantic tokens. |
| `SubjectDetailScreen` | `mobile/lib/attendance/screens/subject_detail_screen.dart` | **REFACTOR** | Implement 3 segmented tabs: Overview, Materials, Tasks; add course PDF list and interactive attendance target slider. |
| `WeeklyTimetableScreen` | `mobile/lib/timetable/screens/weekly_timetable_screen.dart` | **REFACTOR** | Add List vs Calendar segmented toggle, day selector with class dots, and bottom sheet slot inspector. |
| `TasksScreen` | `mobile/lib/tasks/screens/tasks_screen.dart` | **REFACTOR** | Implement filter pills (All, Today, Upcoming) and smooth checkbox strike-through animations. |

---

## 3. New Components to Create

### 3.1 Web Primitives (`components/ui/` and `components/shared/`)
1. **`ClassRow.tsx`**: Universal schedule row displaying start/end time, subject code, room pill, faculty name, and interactive status toggle ([Present] / [Absent] / [Upcoming]).
2. **`MetricTile.tsx`**: High-density metric display featuring large mono value, caption label, trend indicator (+18%), and optional icon.
3. **`DonutGauge.tsx`**: SVG circular progress gauge rendering attendance percentage with semantic coloring (Emerald for Safe, Amber for Warning, Red for Critical).
4. **`CommandPalette.tsx`**: Global `Cmd+K` / `Ctrl+K` searchable dialog powered by `cmdk` for instant jumping between subjects, classes, notes, and tools.
5. **`RecoveryPlannerSheet.tsx`**: Slide-over drawer allowing students to test "What if I miss next 2 classes?" with immediate calculation updates.

### 3.2 Flutter Mobile Primitives (`mobile/lib/design_system/widgets/`)
1. **`ClassTimelineTile`**: High-performance sliver tile with vertical timeline connector line, start/end time, subject name, room tag, and one-tap status action.
2. **`WeekDateStrip`**: Horizontal scrollable date bar showing day of week, date number, today indicator, and dot indicators for scheduled classes.
3. **`StudyBottomSheet`**: Standardized modal sheet with drag handle, title, close icon, and automatic height adjustment for slot details and cancellations.
4. **`AttendanceSwipeAction`**: Slidable action wrapper (`flutter_slidable`) exposing quick [Present] (green) and [Absent] (red) swipe gestures.

---

## 4. Component Catalog & Isolation Strategy: Storybook & Widgetbook

To prevent AI coding agents and developers from creating ad-hoc cards and unbudgeted visual styles, StudySpace establishes an isolated component catalog.

### 4.1 Web: Storybook Catalog
Storybook documents every reusable component in isolation with interactive controls (props, themes, states):
- **Stories to Build**:
  - `UI / Button`: Primary, Secondary, Ghost, Danger, Loading, Disabled.
  - `UI / Input`: Default, Filled, Focused, Error state.
  - `Attendance / ClassRow`: Present, Absent, Upcoming, Cancelled, Rescheduled states.
  - `Attendance / SubjectCard`: Safe (with bunks), Warning (1 bunk), Critical (recovery required).
  - `Attendance / DonutGauge`: 95% Safe, 76% Warning, 62% Critical.
  - `Dashboard / NextClassCard`: Imminent class (<30m), later class (>2h), no more classes today.
  - `Analytics / HeatmapCanvas`: Empty year, high activity, moderate activity.
  - `Shared / EmptyState`: No classes today, no tasks, no documents.

### 4.2 Flutter: Widgetbook Catalog
Widgetbook provides isolated Flutter widget previews directly within the mobile project:
- **Use Cases**:
  - Test widgets across diverse screen sizes (360x640 up to 1024x1366 tablet).
  - Test dynamic font scaling (1.0x, 1.25x, 1.5x, 2.0x) to eliminate text clipping.
  - Preview dark mode vs light mode side-by-side.
  - Validate offline indicator states and sync queue notifications without needing live Supabase connectivity.
