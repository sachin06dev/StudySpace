# StudySpace — Fast Implementation Roadmap & Execution Strategy

> **Document Status**: Complete Execution Roadmap  
> **Audience**: Project Leads, Full-Stack Engineers, Mobile Developers, AI Coding Agents  
> **Git Policy**: All work executes directly on `main`. Zero feature branches. Non-destructive, incremental commits.  
> **Guiding Principle**: Dependency-aware batching. Combine tightly-coupled UI improvements rather than fragmenting work into dozens of sluggish micro-phases.

---

## 1. Fast Execution Strategy & Dependency-Aware Batching

To complete this redesign rapidly without risking regressions, development is organized into **8 dependency-aware phases**. Tightly-coupled layers (e.g. design tokens + core shared primitives; web shell + responsive navigation) are combined to achieve maximum development velocity.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   FAST IMPLEMENTATION ROADMAP PHASES                   │
└────────────────────────────────────────────────────────────────────────┘

  [Phase 0: Audit & Blueprint] ──────────► COMPLETE (docs/design/*)
            │
            ▼
  [Phase 1: Design System & Primitives] ──► Web tokens.css + Flutter design_system
            │
            ▼
  [Phase 2: Web Shell & Navigation] ─────► 6-item sidebar + mobile header + cmdk
            │
            ▼
  [Phase 3: Flutter Shell & Navigation] ──► AppTheme + modern bottom bar + haptics
            │
            ▼
  [Phase 4: Core Academic Experience] ───► Dashboard + Attendance + Timetable + Subjects
            │
            ▼
  [Phase 5: Analytics, Study & Tasks] ───► Full Heatmap + Focus Timer + Tasks List
            │
            ▼
  [Phase 6: Vault, Lectures & Settings] ─► Videos + Notes + Docs + Android Widget
            │
            ▼
  [Phase 7: Landing, Auth & Polish] ─────► Auth forms + fast landing + S-mark illustrations
            │
            ▼
  [Phase 8: Comprehensive QA & Release] ──► 11 breakpoints + Flutter text scale + offline sync
```

---

## 2. Phase-by-Phase Execution Plan

### Phase 0: Full Product + UI/UX + Responsiveness Audit (CURRENT)
- **Status**: **COMPLETE**.
- **Deliverables**: Comprehensive audit files under `docs/design/` (00 to 08).
- **Verification**: Zero application code changed; package.json unchanged; pubspec.yaml unchanged; database unchanged.

---

### Phase 1: Design System Foundation & Shared Primitives
- **Objective**: Establish the "Quiet Academic / Technical Productivity" tokens and core primitive components on both Web and Mobile.
- **Batched Deliverables**:
  - **Web**:
    - Add dependencies: `motion`, `lucide-react`, `@daypicker/react`.
    - Create `design-system/tokens.css` with 11-step Study purple, 3 surfaces (`--canvas`, `--surface`, `--surface-raised`), borders, radii, and status tokens.
    - Integrate tokens into `app/globals.css` using Tailwind v4 `@theme`.
    - Build core primitives in `components/ui/` and `components/shared/`: `Button`, `Input`, `Dialog`, `Sheet`, `Badge`, `StatusPill`, `MetricTile`, `DonutGauge`, `ClassRow`.
  - **Flutter**:
    - Add dependencies: `flutter_animate`, `skeletonizer`, `cached_network_image`, `flutter_svg`.
    - Refactor `mobile/lib/core/design_system/`: update `app_colors.dart` with 11-step Study purple, update `app_radii.dart`, `app_spacing.dart`, and `app_typography.dart`.
    - Build mobile primitives in `mobile/lib/design_system/widgets/`: `StudyButton`, `StudyCard`, `ClassTimelineTile`, `StatusPill`, `AttendanceDonutRing`.
- **Verification**: Zero compile errors (`npm run build`, `flutter analyze`); tokens render identically in light and dark modes.

---

### Phase 2: Web Shell & Responsive Navigation
- **Objective**: Redesign the desktop and mobile navigation shell.
- **Batched Deliverables**:
  - Refactor `components/layout/AppSidebar.tsx`: reduce 12 flat items to 6 intentional destinations (Dashboard, Timetable, Attendance, Study, Analytics, Settings); add active purple pill; integrate Lucide icons; pin profile/settings section to bottom.
  - Refactor `MobileHeader.tsx` and `MobileNavDrawer.tsx` with smooth drawer transitions and accessible touch targets ($\ge 44\text{px}$).
  - Implement global command palette (`components/ui/command.tsx` powered by `cmdk`) for `Cmd+K` / `Ctrl+K` searching.
- **Verification**: Flawless navigation across all routes; zero horizontal overflow on mobile viewports (320px to 834px).

---

### Phase 3: Flutter Shell, Navigation & Adaptive Foundation
- **Objective**: Redesign the mobile navigation bar and theme foundation.
- **Batched Deliverables**:
  - Refactor `mobile/lib/core/theme/app_theme.dart` with new Material 3 `ColorScheme` bindings for light and dark modes.
  - Refactor `MainNavigationShell.dart`: sleek bottom navigation bar with Lucide icons, purple active indicators, and subtle haptic feedback on tab change.
  - Implement `StudyBottomSheet` wrapper for slide-up sheets.
- **Verification**: Flawless tab switching; no yellow-and-black overflow banners; smooth transitions.

---

### Phase 4: Core Academic Experience (Dashboard + Attendance + Timetable + Subjects)
- **Objective**: Redesign the heart of StudySpace across both Web and Mobile.
- **Batched Deliverables**:
  - **Web**:
    - Refactor `app/(app)/dashboard/page.tsx`: Hero split (Next Class card with countdown and [Mark Present] button + Mountain quote card) -> 4-metric strip -> Today's Schedule timeline (left) + Study Activity bar chart & Quick Actions (right).
    - Refactor `app/(app)/attendance/page.tsx`: Week-strip date navigation -> Today's class status toggles -> Subject cards with circular progress rings and explicit bunk badges (`3 safe bunks`).
    - Refactor `app/(app)/attendance/[subjectId]/page.tsx`: Tabbed course mastery view (Overview, Materials, Tasks, History) + interactive target recovery simulator.
    - Refactor `app/(app)/timetable/page.tsx`: Desktop 5/7-column grid with sticky time headers + mobile responsive Day Timeline view.
  - **Flutter**:
    - Refactor `HomeScreen.dart`: Hero Next Class card with prominent one-tap [Mark Present] button -> 3-stat tile row -> Today's classes list.
    - Refactor `AttendanceOverviewScreen.dart`: SilverBook-inspired horizontal week date strip + vertical class timeline list + swipe actions (`flutter_slidable`).
    - Refactor `WeeklyTimetableScreen.dart`: Day selector strip + clean class cards + bottom sheet slot inspector.
    - Refactor `SubjectDetailScreen.dart`: Overview / Materials / Tasks tabs + attendance donut ring.
- **Verification**: Complete attendance and timetable workflow functional; attendance calculations remain 100% mathematically identical; instant SQLite updates ($<16\text{ms}$).

---

### Phase 5: Analytics, Study, Tasks & Pomodoro
- **Objective**: Elevate productivity and habit tracking.
- **Batched Deliverables**:
  - **Web**:
    - Refactor `app/(app)/analytics/page.tsx`: Expand 365-day study consistency heatmap as the dominant hero canvas in StudySpace purple tokens; add weekly hours comparison bar chart and diurnal rhythm breakdown; quiet milestone shelf.
    - Refactor `app/(app)/tasks/page.tsx`: Filter tabs (All, Today, Upcoming), priority dots, subject chips, inline date picker.
    - Refactor `app/(app)/pomodoro/page.tsx`: Distraction-free focus timer ring, subject tag selector, ambient completion audio.
  - **Flutter**:
    - Refactor `AnalyticsScreen.dart`: 30/60-day purple contribution matrix + weekly bar chart.
    - Refactor `StudyScreen.dart`: 25:00 focus ring + materials + tasks.
    - Refactor `TasksScreen.dart`: Filter pills, slidable complete/delete actions.
- **Verification**: Heatmap renders flawlessly; Pomodoro persists across navigation; task mutations reflect immediately.

---

### Phase 6: Academic Vault (Videos, Notes, Documents) & Android Home Widget
- **Objective**: Refine lecture study tools and build the high-value native mobile widget.
- **Batched Deliverables**:
  - **Web**:
    - Refactor `app/(app)/videos/[videoId]/page.tsx`: 65%/35% theater split layout (YouTube player + timestamp notes panel with one-click seeking).
    - Refactor `app/(app)/documents/page.tsx`: Private PDF vault with presigned URL previews and clean file size tags.
    - Refactor `app/(app)/settings/page.tsx`: Clean grouped settings list.
  - **Flutter**:
    - Build Android Home Screen Widget (`home_widget`): Display next class, room, attendance percentage, and background [Mark Present] intent.
    - Refactor `ProfileScreen.dart` with grouped settings tiles and widget setup instructions.
- **Verification**: Video seeking works instantly; documents open securely; Android widget updates on class changes.

---

### Phase 7: Landing Page, Authentication & Final Visual Polish
- **Objective**: Transform onboarding and marketing into an editorial, high-converting showcase.
- **Batched Deliverables**:
  - Redesign `app/(auth)/login/page.tsx` and `app/(auth)/signup/page.tsx` with minimalist card-on-canvas styling and brand purple accents.
  - Redesign `app/page.tsx` (Landing page): High-impact typography, real product screenshots, interactive seeking demo, zero generic AI hype copy. Fast LCP ($<0.8\text{s}$).
  - Implement StudySpace brand geometry / S-mark empty states across all views.
- **Verification**: Lighthouse performance score $\ge 95$; zero accessibility errors on landing page.

---

### Phase 8: Comprehensive Responsive, Accessibility & Regression QA
- **Objective**: Full cross-platform verification before final sign-off.
- **Batched Deliverables**:
  - Validate Web across 11 breakpoints (320px to 1920px) with zero horizontal overflow.
  - Validate Flutter across small/large phones and tablets with $1.5\times$ text scaling.
  - Execute complete offline sync cycle in Flutter (offline mark -> SQLite cache -> reconnect -> SyncEngine flush).
  - Run `npm run lint` and `npm run build` with zero errors.
- **Verification**: All items in `07_VISUAL_QA_PLAN.md` pass with green checkmarks.

---

## 3. Git Safety Protocols (Continuous Production on Main)

Because all development occurs on `main` without feature branches, engineers and AI agents must strictly follow these rules:
1. **Never Run Destructive Commands**: Never run `git reset --hard`, `git clean -fd`, `git push --force`, or `git checkout .`.
2. **Atomic Non-Breaking Commits**: Every commit must leave the application in a clean, fully-compiling state.
3. **Pre-Commit Verification**:
   ```bash
   # Before committing Web changes:
   npm run lint
   npm run build

   # Before committing Mobile changes:
   cd mobile && flutter analyze
   ```
4. **Preserve Environment & Secrets**: Never stage `.env.local` or commit API keys.

---

## 4. High-Risk Areas & Mitigation Strategies

| High-Risk Area | Potential Failure Mode | Built-in Mitigation Strategy |
| :--- | :--- | :--- |
| **Attendance Calculations** | Discrepancy between Web and Mobile bunk allowance or recovery numbers. | Strict prohibition against inline math in UI components. Both Web and Mobile must consume pre-calculated domain fields from `calculations.ts` and `subject_attendance.dart`. |
| **Timetable Exception Rescheduling** | Shifted class shows up twice or fails to un-render on its original date. | Preserve `resolveClassesForDate()` without alteration; test with unit cases for cancelled, rescheduled, and extra classes. |
| **Cloudflare R2 Presigned URLs** | PDF document links expiring while the student is reading. | Generate presigned GET URLs with safe 15-minute expiration windows; provide instant refresh on modal open. |
| **Flutter Offline Sync Queue** | Lost marks or duplicate attendance entries on intermittent connectivity. | Preserve deterministic idempotency keys (`att_${userId}_${subjectId}_${date}_${time}`) and exponential backoff in `SyncEngine`. |

---

## 5. Immediate Next Action

With Phase 0 complete and approved:
- **Proceed directly to Phase 1**: Install Phase A dependencies (`motion`, `lucide-react`, `@daypicker/react`), establish `design-system/tokens.css` with 11-step Study purple, and build core web/mobile primitives.
