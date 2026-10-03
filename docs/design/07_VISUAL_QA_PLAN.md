# StudySpace — Visual QA, Accessibility & Anti-Regression Plan

> **Document Status**: Complete QA Blueprint  
> **Audience**: QA Engineers, Design Reviewers, Frontend & Mobile Developers, AI Coding Agents  
> **Objective**: Ensure that every redesigned screen conforms strictly to the Design System Blueprint, passes WCAG AA contrast standards, exhibits zero horizontal overflow, and eliminates generic AI slop.

---

## 1. Web Visual QA & Viewport Inspection Matrix

Every web route must be validated across the 11 target viewports using browser developer tools and automated Playwright test scripts.

### 1.1 Viewport Inspection Protocol

| Breakpoint | Target Device Context | Inspection Checkpoints | Failure Criteria |
| :--- | :--- | :--- | :--- |
| **320px** | iPhone SE (1st gen), compact devices | Navigation collapses to mobile header; metric cards stack vertically; buttons maintain full width with $\ge 44\text{px}$ tap height. | Horizontal scrollbar on body; text clipping on buttons; overlapping badges. |
| **360px** | Standard compact Android | Class rows format time above subject name; room tag fits cleanly; date picker fits without squishing. | Horizontal overflow; text collision between time and status pill. |
| **390px** | iPhone 12–16 Pro | Next Class hero card displays course name, room, countdown pill, and [Mark Present] button cleanly. | Action buttons wrapping into multiple uneven lines. |
| **412px** | Samsung Galaxy S20–S24 / Pixel | Slide-over drawers (Vaul) and modals do not clip inputs when virtual keyboard is engaged. | Input fields hidden behind soft keyboard. |
| **768px** | iPad Mini portrait, foldable fold | Timetable switches from 7-column grid to responsive Day-Strip + Timeline; Dashboard shifts to 2-column split. | 7-column timetable squishing columns into unreadable vertical slivers. |
| **834px** | iPad Air / Pro 11" portrait | Sidebar auto-collapses or reduces to 64px icon rail; main content has minimum 550px working area. | Content squished; charts clipping right-hand borders. |
| **1024px** | iPad landscape, small laptops | Fixed 64px/256px sidebar visible; 5/7-column timetable grid fits comfortably with sticky time markers. | Timetable time column not sticking during horizontal scroll. |
| **1280px** | 720p external displays, MacBook Air | Full 3-column dashboard grid renders cleanly (Hero split, Metric strip, Today's schedule, Study chart, Quick actions). | Uneven column gaps; cards misaligned at bottom. |
| **1366px** | Standard laptop monitors | Page container bounded by `max-w-7xl` with centered margins; typography remains readable. | Excessively long text lines (>80 characters per line). |
| **1440px** | MacBook Pro 14"/16", 2K displays | High-density operational layout renders with optimal contrast and controlled whitespace. | Blurry raster images; oversized icons. |
| **1920px** | 1080p full desktop, ultrawide monitors | Layout remains neatly centered within `max-w-7xl` or `max-w-[1400px]`; no ribbon-stretching of cards. | Full-width container stretching cards into 1900px wide banners. |

---

## 2. Flutter Mobile Visual & Accessibility QA Matrix

### 2.1 Screen Size & Constraint Inspection
Mobile layouts must be verified on physical Android devices or emulators at the following configurations:
- **Small Android Phone (360x640dp, mdpi / xhdpi)**: Verify zero RenderFlex overflow on `HomeScreen` quick stats row.
- **Standard Phone (393x852dp, xxhdpi)**: Verify week calendar strip renders full 7 days with clear class dots.
- **Large Phone / Phablet (412x915dp, xxxhdpi)**: Verify floating action buttons maintain comfortable thumb reach.
- **Tablet / Foldable (600dp+ width)**: Verify lists and cards are bounded by `ConstrainedBox(maxWidth: 600)` to prevent excessive horizontal stretching.

### 2.2 Accessibility Text Scale Factor Audit (1.0x to 2.0x)
Android allows users to set font sizes up to $2.0\times$ in accessibility settings.
- **Verification Rule**: Launch the Flutter app with `MediaQuery(data: MediaQuery.of(context).copyWith(textScaler: TextScaler.linear(1.5)), ...)`:
  - Class timeline tiles must expand vertically rather than throwing yellow-and-black striped `RenderFlex overflowed` errors.
  - Buttons must expand their height rather than clipping text.
  - Donut gauges must scale proportionally or keep fixed radius with text centering.

### 2.3 Offline State & Sync Verification Protocol
1. Launch Flutter app with Wi-Fi and Cellular data disabled.
2. Navigate to `AttendanceScreen` -> verify data loads instantly from SQLite in $<16\text{ms}$.
3. Tap `[Mark Present]` on a class -> verify instant visual update, green badge switch, and tactile vibration via `FeedbackService`.
4. Inspect `studyspace_offline.db` -> verify record is stored in `attendance_records` and queued in `sync_queue`.
5. Enable Wi-Fi -> verify `ConnectivityService` triggers `SyncEngine.instance.processQueue()` and mutations succeed against Supabase PostgREST with zero data loss.

---

## 3. Anti-AI-Slop Visual Compliance Checklist

Every page and screen must pass this audit before being considered complete:

```markdown
### Visual Design System Audit
- [ ] No more than ONE primary gradient per viewport.
- [ ] Strictly 3 surfaces used: Canvas, Surface, Raised.
- [ ] Zero instances of "card-inside-card" with nested borders.
- [ ] All border radiuses conform strictly to: sm (6px), md (10px), lg (16px), or full.
- [ ] All borders use subtle hairline tokens (1px border-border-subtle).
- [ ] All icons belong to Lucide (Web & Mobile); zero emojis in UI buttons, tabs, or badges.
- [ ] Status colors conform strictly to WCAG AA: Emerald (Safe), Amber (Warning), Red (Critical).
- [ ] Numbers and clock times use tabular monospace font (JetBrains Mono / tnum).

### Content & Voice Audit
- [ ] No SaaS marketing jargon ("Unlock your potential", "Smart AI magic", "Seamless experience").
- [ ] All copy is direct, factual, and student-focused ("Two classes left today", "3 safe bunks available").
- [ ] Empty states use the official StudySpace S-mark geometry, not generic cartoon vectors.

### Loading & Motion Audit
- [ ] Zero full-screen blank loading spinners; all loading states use structured skeletons.
- [ ] All animations respect prefers-reduced-motion (collapsing to 0.01ms duration).
- [ ] No experimental Next.js View Transitions in production; standard transitions only.
```

---

## 4. Accessibility & Contrast Verification (WCAG AA Compliance)

All text-to-background combinations must achieve a minimum contrast ratio of **4.5:1** for normal text and **3:1** for large text:

| Token Pair | Foreground | Background | Calculated Contrast | WCAG AA Status |
| :--- | :--- | :--- | :--- | :--- |
| **Light Primary Text** | `#0f172a` (Slate 900) | `#ffffff` (White) | `16.3 : 1` | **PASS (AAA)** |
| **Light Secondary Text**| `#475569` (Slate 600) | `#ffffff` (White) | `7.1 : 1` | **PASS (AAA)** |
| **Light Muted Text** | `#64748b` (Slate 500) | `#ffffff` (White) | `4.6 : 1` | **PASS (AA)** |
| **Light Safe Status** | `#047857` (Emerald 700)| `#ecfdf5` (Emerald 50) | `5.2 : 1` | **PASS (AA)** |
| **Light Warning Status**| `#92400e` (Amber 800) | `#fffbeb` (Amber 50) | `6.8 : 1` | **PASS (AA)** |
| **Light Critical Status**| `#991b1b` (Red 800) | `#fef2f2` (Red 50) | `7.3 : 1` | **PASS (AAA)** |
| **Dark Primary Text** | `#f8fafc` (Slate 50) | `#090d16` (Obsidian) | `17.4 : 1` | **PASS (AAA)** |
| **Dark Secondary Text** | `#cbd5e1` (Slate 300) | `#111726` (Navy Card) | `9.4 : 1` | **PASS (AAA)** |
| **Dark Muted Text** | `#94a3b8` (Slate 400) | `#111726` (Navy Card) | `5.1 : 1` | **PASS (AA)** |
| **Dark Safe Status** | `#a7f3d0` (Emerald 200)| `#064e3b` (Emerald 900) | `7.2 : 1` | **PASS (AAA)** |
| **Dark Warning Status** | `#fde68a` (Amber 200) | `#78350f` (Amber 900) | `7.9 : 1` | **PASS (AAA)** |
| **Dark Critical Status**| `#fecaca` (Red 200) | `#7f1d1d` (Red 900) | `7.4 : 1` | **PASS (AAA)** |
| **Brand Primary Purple**| `#ffffff` (White) | `#7c3aed` (Study 600) | `5.3 : 1` | **PASS (AA)** |
