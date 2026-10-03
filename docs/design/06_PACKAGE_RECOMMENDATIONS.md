# StudySpace — Package Audit & Disciplined Dependency Roadmap

> **Document Status**: Complete Specification  
> **Audience**: Lead Engineers, DevOps, AI Coding Agents  
> **Core Principle**: Do not fix "AI slop" by creating "dependency slop." Every package must justify its bundle weight, maintenance cost, and architectural alignment.

---

## 1. Web Ecosystem Package Evaluation (Next.js 16 + React 19)

### 1.1 Web Dependency Audit Matrix

| Package | Classification | Architectural Role & Justification | Action Plan |
| :--- | :--- | :--- | :--- |
| **Tailwind CSS v4** | **ALREADY AVAILABLE** | Core styling engine. Tailwind v4 with `@theme` and `@custom-variant dark` provides zero-runtime, lightning-fast styling with first-class container query support. | Keep; define design tokens in CSS variables. |
| **next-themes** | **ALREADY AVAILABLE** | Flawless dark/light/system theme switching without FOUC (flash of unstyled content) or hydration mismatch. | Keep as root theme provider. |
| **@supabase/ssr** | **ALREADY AVAILABLE** | Cookie-based Supabase session handling and JWT refresher for Next.js App Router and Middleware. | Keep; do not alter. |
| **Lucide Icons** (`lucide-react`) | **ADD NOW (Phase A)** | High-cohesion, modern icon set matching StudySpace's academic identity. Eliminates fragmented, unmaintainable inline SVG paths. | Install in Phase A; replace all hardcoded SVGs. |
| **Motion** (`motion`) | **ADD NOW (Phase A)** | Modern React animation library (evolution of Framer Motion). Enables smooth layout transitions, modal popups, and tab indicators. | Install in Phase A for UI state transitions. |
| **@daypicker/react** | **ADD NOW (Phase A)** | Modern, accessible calendar primitive (v10) for timetable date picking and attendance filtering. | Install in Phase A for date navigation. |
| **Sonner** (`sonner`) | **ADD NOW (Phase B)** | Fast, accessible, stacked toast notifications with zero-boilerplate dismissal and action buttons. | Install in Phase B for server action feedback. |
| **Vaul** (`vaul`) | **ADD NOW (Phase B)** | Mobile drawer primitive for touch-first slide-over sheets, class inspectors, and timetable exception modals. | Install in Phase B for mobile drawer dialogs. |
| **cmdk** (`cmdk`) | **ADD NOW (Phase B)** | Unstyled, accessible command palette primitive. Enables instant `Cmd+K` global searching across courses, classes, notes, and tasks. | Install in Phase B for global keyboard navigation. |
| **nuqs** (`nuqs`) | **ADD NOW (Phase B)** | Type-safe URL search param state manager. Essential for sharable timetable day filters, date navigation, and tab states without page reloads. | Install in Phase B for URL state synchronization. |
| **React Hook Form + Zod** | **ADD NOW (Phase B)** | High-performance, schema-validated forms. Ensures bulletproof validation on course creation, slot editing, and baseline attendance numbers. | Install in Phase B for modals and settings. |
| **Recharts** (`recharts`) | **ADD NOW (Phase C)** | Declarative, SVG-based charting library. Powers the weekly study hours comparison and diurnal focus rhythm charts. | Install in Phase C for analytics visualizations. |
| **TanStack Virtual** | **ADD LATER (Phase C)** | DOM virtualization for long lists (e.g. 500+ attendance records, lecture notes, documents). | Add when historical records exceed 100 items. |
| **TanStack Table** | **ADD LATER (Phase C)** | Headless table state manager for advanced sorting, column filtering, and pagination in attendance history and document vaults. | Add during deep attendance history refactor. |
| **@dnd-kit/react** | **OPTIONAL (Phase D)** | Modern drag-and-drop toolkit. | Add strictly if drag-and-drop timetable reordering or task Kanban boards are implemented. |
| **Playwright + axe-core** | **ADD LATER (Phase E)** | End-to-end visual regression testing and WCAG automated accessibility auditing. | Add in QA and CI pipeline. |
| **Storybook** | **ADD LATER (Phase E)** | Isolated component catalog. Prevents AI agents and developers from introducing ad-hoc cards and non-system styles. | Add to lock design system catalog. |
| **Sentry** (`@sentry/nextjs`) | **ADD LATER** | Production error and performance monitoring. | Add prior to public multi-tenant launch. |
| **Serwist** | **AVOID NOW** | Progressive Web App (PWA) service worker toolkit. Adds caching complexity to Next.js server streaming. | Defer; mobile companion is already natively covered by Flutter. |
| **Base UI** | **AVOID AS REPLACEMENT** | Unstyled component library from MUI team. While conceptually interesting, StudySpace already has a shadcn/Radix trajectory. | Do not migrate from Radix to Base UI; restyle existing primitives. |
| **Next.js View Transitions** | **AVOID IN PRODUCTION** | Next.js' `viewTransition` configuration is officially marked experimental and not recommended for production. | Prohibited; use CSS transitions + Motion. |

---

## 2. Flutter Mobile Package Evaluation (`/mobile`)

### 2.1 Flutter Dependency Audit Matrix

| Package | Classification | Architectural Role & Justification | Action Plan |
| :--- | :--- | :--- | :--- |
| **provider** | **ALREADY AVAILABLE** | Established state management engine across `AttendanceProvider`, `TimetableProvider`, etc. | Keep; Provider is stable and clean. |
| **sqflite** + **path** | **ALREADY AVAILABLE** | Local SQLite persistence layer (`studyspace_offline.db`). Enables $<16\text{ms}$ instant reads and offline durability. | Keep; non-negotiable core. |
| **connectivity_plus** | **ALREADY AVAILABLE** | Monitors cellular / Wi-Fi network state to trigger automatic background sync in `SyncEngine`. | Keep. |
| **flutter_local_notifications**| **ALREADY AVAILABLE** | Local on-device notifications for morning class lineup, 10m pre-class reminders, and post-class attendance prompts. | Keep. |
| **audioplayers** | **ALREADY AVAILABLE** | Audio feedback synthesizer for Pomodoro completion chimes. | Keep. |
| **youtube_player_iframe** | **ALREADY AVAILABLE** | In-app YouTube video playback for lecture notes. | Keep. |
| **flutter_animate** | **ADD NOW (Priority 1)**| Expressive, declarative chained animations for fade-ins, micro-interactions, and slide reveals without verbose `AnimationController` boilerplate. | Add in Priority 1. |
| **skeletonizer** | **ADD NOW (Priority 1)**| Transforms the actual widget tree into high-fidelity loading skeleton states, supporting both box and Sliver layouts. | Add in Priority 1 to replace spinners. |
| **cached_network_image** | **ADD NOW (Priority 1)**| High-performance memory and disk image caching with smooth fade-in transitions for YouTube thumbnails and avatars. | Add in Priority 1. |
| **flutter_svg** | **ADD NOW (Priority 1)**| Renders crisp vector assets and Lucide icon SVGs across all Android screen densities. | Add in Priority 1. |
| **flutter_slidable** | **ADD NOW (Priority 2)**| High-quality swipe-action library. Enables SilverBook-style swipe-to-mark attendance (`[Present]` right, `[Absent]` left) and task completion. | Add in Priority 2. |
| **fl_chart** | **ADD NOW (Priority 2)**| Native Flutter charting library for weekly focus hour bars and attendance trend lines. | Add in Priority 2 for mobile analytics. |
| **home_widget** | **ADD NOW (Priority 2)**| High-value bridge connecting Flutter state to Android native Home Screen AppWidgets. Displays next class and allows 1-tap attendance marking. | Add in Priority 2 as key mobile feature. |
| **widgetbook** | **OPTIONAL (Priority 3)**| Isolated widget catalog and golden testing environment for Flutter. | Add during design system stabilization. |
| **rive** | **OPTIONAL (Priority 3)**| Interactive vector animation runtime. | Add strictly if an interactive animated S-mark or focus mascot is desired. |
| **responsive_framework** | **AVOID** | Third-party responsiveness wrapper. | **Do not install**. Flutter's native primitives (`LayoutBuilder`, `MediaQuery`, `Flexible`, `Wrap`, `Slivers`) are superior and sufficient. |
| **go_router** | **AVOID REWRITE** | Declarative URL-based router. | The app's existing `IndexedStack` + `Navigator` navigation is already robust and sufficient; do not rewrite. |

---

## 3. Phased Installation Protocol (Dependency Hygiene)

To maintain stability and prevent "all-at-once" breaking changes, dependencies must be added in isolated, verified batches.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PHASED DEPENDENCY ROLLOUT ORDER                      │
└────────────────────────────────────────────────────────────────────────┘

  WEB IMPLEMENTATION BATCHES:
  Phase A: Visual Foundation  ──► npm install motion lucide-react @daypicker/react
  Phase B: User Interaction   ──► npm install sonner vaul cmdk nuqs react-hook-form zod
  Phase C: Analytical Data    ──► npm install recharts @tanstack/react-virtual
  Phase D: Specialized DnD    ──► npm install @dnd-kit/react (if required)
  Phase E: Quality & Testing  ──► npm install -D storybook playwright @axe-core/playwright

  FLUTTER IMPLEMENTATION BATCHES:
  Priority 1: Core Foundation ──► flutter pub add flutter_animate skeletonizer cached_network_image flutter_svg
  Priority 2: Features & UX   ──► flutter pub add flutter_slidable fl_chart home_widget
  Priority 3: Refinements     ──► flutter pub add -d widgetbook (optional)
```

> [!NOTE]
> During Phase 0, **zero packages have been installed**. This roadmap serves as the locked installation guide when execution begins.
