# StudySpace — Responsive Strategy & Cross-Device Engineering

> **Document Status**: Complete Specification  
> **Audience**: Frontend Engineers, Mobile Engineers, QA Engineers  
> **Core Principle**: Layout rules and fluid constraints—not bloated third-party frameworks—are the foundation of true responsiveness.

---

## 1. Web Breakpoint Spectrum & Viewport Analysis

StudySpace evaluates and guarantees layout integrity across 11 distinct viewport widths spanning mobile, tablet, laptop, and widescreen desktop monitors.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   STUDYSPACE WEB BREAKPOINT SPECTRUM                   │
└────────────────────────────────────────────────────────────────────────┘
  320px  360px  390px  412px │  768px   834px │ 1024px  1280px 1366px 1440px 1920px
  [── Compact Mobile ──────] │ [─ Tablets ──] │ [── Desktop & Widescreen ─────]
```

### 1.1 Viewport Audit Matrix

| Viewport Width | Reference Device Category | Key Responsive Challenge in Current Code | Architectural Solution |
| :--- | :--- | :--- | :--- |
| **320px** | iPhone SE (1st gen), small Android | Metric card text overflows; buttons clip; horizontal scroll on body. | `flex-col` stacking; text size drops to `text-xs`; buttons expand to `w-full` with minimum 44px tap height; `overflow-x-hidden` on main. |
| **360px** | Standard compact Android devices | Class row time column collides with status badge; table padding excessive. | Class row converts to stacked layout (time on top, subject and badge below); container horizontal padding locked to `px-3`. |
| **390px** | iPhone 12/13/14/15/16 Pro | Next Class card action buttons (`[Mark Present]`, `[View Details]`) wrap awkwardly. | Primary action button full width; secondary action rendered as text link or compact icon button. |
| **412px** | Samsung Galaxy S20–S24, Google Pixel | Bottom sheet inputs get obscured by virtual software keyboard. | Dynamic viewport units (`dvh`) used for modal drawers; form inputs scroll into view on focus. |
| **768px** | iPad Mini, small tablets in portrait | Timetable 7-column grid squishes columns to $<100\text{px}$, causing severe text wrapping. | Switch Timetable from 7-column grid to **Day-Strip + Daily Timeline view**; Dashboard shifts to 2-column layout. |
| **834px** | iPad Air / iPad Pro 11" portrait | Sidebar takes 256px width, leaving only 578px for main content, squishing analytics charts. | Implement collapsible icon-only sidebar rail (width `64px`) or auto-collapsing drawer on viewports $<1024\text{px}$. |
| **1024px** | iPad landscape, small laptops | Desktop sidebar becomes visible; 7-column timetable grid fits comfortably with minimal padding. | Fixed desktop sidebar expands to `w-64`; timetable switches to 5-day / 7-day multi-column view. |
| **1280px** | Standard 720p external monitors, MacBook Air | Optimal baseline desktop viewport. | Full 3-column dashboard grid active; Next Class hero (col-span-2) + Mountain quote card (col-span-1). |
| **1366px** | Standard budget laptop displays | High prevalence among university students globally. | Maximum container width bounded to `max-w-7xl` with `mx-auto` to prevent excessive line length. |
| **1440px** | MacBook Pro 14"/16", 2K external displays | Ample whitespace available. | 3-column operational layout (Schedule timeline, Study chart, Quick actions) renders at optimal density. |
| **1920px** | 1080p full desktop, ultrawide monitors | Excessive whitespace if unconstrained; cards stretch into elongated flat ribbons. | Strict `max-w-7xl` (1280px) or `max-w-[1400px]` boundary with centered alignment; margins expand naturally. |

---

## 2. Web Root Cause Analysis: Fixing Current Layout Failures

### 2.1 Fixed-Width Failures in Current Web Code
- **Problem**: In `DashboardAttendanceCard.tsx` and `WeeklyStudyChart.tsx`, elements with hardcoded minimum widths (e.g., `min-w-[640px]`) cause horizontal overflow below 700px.
- **Root Cause**: `overflow-x-auto` was added as a quick patch around tables, forcing horizontal scrollbars on mobile.
- **Solution**: Replace wide horizontal tables on mobile with card-row lists (`ClassRow.tsx`), reserving multi-column tables strictly for viewports $\ge 1024\text{px}$.

### 2.2 Navigation Clutter Failure
- **Problem**: `AppSidebar.tsx` renders 12 items. When the screen height is short (e.g., 768px laptop screen with browser chrome), the bottom profile section and theme toggle are pushed below the fold.
- **Root Cause**: Sidebar lacks intelligent categorization and occupies excessive vertical space with oversized item padding.
- **Solution**: Reduce navigation to 6 core destinations. Profile section pinned to the bottom using `mt-auto` with clean flexbox anchoring.

### 2.3 Long String Truncation Strategy
University course schedules frequently contain long titles (e.g., *"Design and Analysis of Advanced Algorithms Laboratory"*, *"Prof. Dr. Christopher Van Der Bilt"*):
- **Rule 1**: Subject names in class rows use `truncate font-semibold max-w-[200px] sm:max-w-none`.
- **Rule 2**: Secondary metadata (room code, faculty) is separated by quiet dot dividers (`CT-09 · Ms. Khushi Parmar`) with `text-xs text-text-muted truncate`.
- **Rule 3**: Hovering on truncated text reveals the full title via accessible tooltip (`Tooltip.tsx`).

### 2.4 Container Queries (`@container`)
For modular cards that render in different column spans depending on page layout (e.g., `NextClassCard` on Dashboard vs Subject Page):
```css
.card-container {
  container-type: inline-size;
}

@container (max-width: 400px) {
  .class-action-row {
    flex-direction: column;
  }
}
```

---

## 3. Flutter Mobile Responsive Architecture

### 3.1 Architectural Stack Decision: Native Primitives Over Packages
As verified in our architectural review, adding `responsive_framework` to Flutter is **unnecessary and discouraged**. The current stable branch of `responsive_framework` is dated, and StudySpace's mobile layout issues are caused by improper constraint handling, not a missing package.

StudySpace relies on Flutter's battle-tested layout primitives:
```dart
LayoutBuilder     // For conditional layouts based on parent constraints
MediaQuery        // For screen dimensions, orientation, and textScaler
Flexible          // For proportional flex items without overflow
Expanded          // For greedy single-axis space allocation
Wrap              // For overflowing chips, tags, and button groups
Sliver layouts    // CustomScrollView, SliverAppBar, SliverList for fluid scrolling
SafeArea          // Dynamic notch and navigation bar insets
ConstrainedBox    // Bounding maximum card widths on tablets
TextOverflow      // Ellipsis on long subject/faculty names
```

### 3.2 Dynamic Font & Text Scale Factor Defense
A major failure point in Flutter apps is text clipping when the user has set Android's font size or display scaling to $1.5\times$ or $2.0\times$ (accessibility settings).

```dart
// Prohibited: Fixed container heights with text children
Container(height: 48, child: Text('Software Engineering Lab')) // OVERFLOWS!

// Required: Intrinsic heights with dynamic constraints
ConstrainedBox(
  constraints: const BoxConstraints(minHeight: 48),
  child: Padding(
    padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
    child: Text(
      'Software Engineering Lab',
      maxLines: 2,
      overflow: TextOverflow.ellipsis,
    ),
  ),
)
```

### 3.3 Form Factors & Adaptation Rules

#### 1. Small Phones (Android API 21+, width 320–360dp)
- Calendar week strip displays 5 days instead of 7, with horizontal snap scrolling.
- Quick stats row stacks as 2x2 grid or single-row carousel rather than 3 squished horizontal columns.
- Primary buttons enforce `minHeight: 48` for reliable tap ergonomics.

#### 2. Standard & Large Phones (width 390–430dp)
- Default mobile baseline.
- Calendar week strip displays full 7 days (`Mon` through `Sun`).
- Next Class hero banner displays full course name, room, and [Mark Present] button side-by-side.

#### 3. Foldables & Tablets (width 600dp+)
- `ConstrainedBox(constraints: BoxConstraints(maxWidth: 600))` applied to home and attendance content so lists do not stretch awkwardly across a 10-inch screen.
- In landscape mode, use a 2-pane split view: Left pane shows the calendar timeline; right pane displays selected class details, attendance history, and syllabus notes.

---

## 4. Modal, Sheet & Dialog Strategy Across Platforms

| Interaction Type | Desktop Web ($\ge 1024\text{px}$) | Mobile Web & Tablet ($<1024\text{px}$) | Flutter Android App |
| :--- | :--- | :--- | :--- |
| **Class Slot Inspector** | Centered Modal Dialog (`Dialog.tsx`) | Slide-over Drawer (`Sheet.tsx` / Vaul) | Rounded Bottom Sheet (`StudyBottomSheet`) |
| **Timetable Exception (Cancel/Extra)** | Centered Dialog with form | Slide-over Drawer | Bottom Sheet with date picker |
| **AI Timetable Scan Review** | Full-width split dialog (image left, JSON right) | Full-screen step-by-step review page | Full-screen review screen (`ScannedTimetableReviewScreen`) |
| **Course Details** | Dedicated page (`/attendance/[subjectId]`) | Dedicated page | Tabbed screen with sliver app bar |
| **Quick Attendance Actions** | One-tap buttons in table row | One-tap buttons in class card | One-tap button + Swipe action (`flutter_slidable`) |

---

## 5. Responsive Verification Matrix for Testing

Every screen must pass manual or automated inspection at these exact viewport widths before PR approval:
- [ ] **320px**: Zero horizontal body scrolling; no clipped text on action buttons.
- [ ] **390px**: Next Class banner renders with all buttons and countdown visible.
- [ ] **768px**: Timetable shifts gracefully to Day Timeline view; no squished columns.
- [ ] **1024px**: Sidebar expands cleanly; multi-column timetable renders with sticky time column.
- [ ] **1440px**: Content centers within `max-w-7xl`; no ribbon-stretched cards.
- [ ] **Flutter TextScale 1.5x**: Zero red "RenderFlex overflowed" errors across all screens.
