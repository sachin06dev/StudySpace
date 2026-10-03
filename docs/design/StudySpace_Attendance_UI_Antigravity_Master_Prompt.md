# StudySpace - Flutter Attendance UI Redesign
## SilverBook-Inspired Design System + Antigravity Implementation Master Prompt

> **Use this prompt with Antigravity / Gemini Flash high.**
>
> The attached reference PDF is the visual source of truth for the design direction. StudySpace must be inspired by the reference, not copied pixel-for-pixel.

---

# 0. Mission

Redesign the **StudySpace Flutter Attendance interface** so it feels as polished, compact, fast, and visually coherent as the SilverBook interface shown in the attached PDF.

The target is:

**SilverBook-level usability and visual discipline + StudySpace branding + StudySpace's existing architecture/data/backend.**

Do not treat this as a greenfield app.

This is a **UI/UX implementation task inside the current Flutter app**, after the previous Flutter + Attendance integration work.

---

# 1. Critical Context

The current repository already contains an integrated Flutter Android app and attendance functionality.

The following integration has already happened:

- `feature/attendance-foundation` was merged into `integration/flutter-attendance`
- `feature/flutter-android` was merged into `integration/flutter-attendance`
- the branch is already integrated
- Web lint/build passed
- Flutter analyze passed
- Flutter tests passed
- Flutter debug APK built successfully
- Supabase migrations are synchronized

Do **NOT** redo the merge.

Do **NOT** create a new attendance architecture.

Do **NOT** replace the existing attendance backend merely to reproduce the reference UI.

Your job is to improve the Flutter Attendance experience by building the interface correctly on top of the existing implementation.

---

# 2. First Rule: Inspect Before Editing

Before writing or changing UI code, inspect the repository.

Determine:

1. current Flutter app entry points
2. current routing/navigation
3. current theme system
4. current typography
5. current reusable UI components
6. current attendance screens
7. current attendance repositories/services
8. current attendance state-management approach
9. current Supabase integration
10. current attendance models
11. current loading/error/offline handling
12. current Add Class / Add Subject flows
13. current Attendance History implementation
14. current Subject Detail implementation

Do not assume filenames.

Use the actual repository structure.

Create a short internal map before implementation:

```text
Current attendance architecture:
- navigation:
- state management:
- data layer:
- repositories:
- main screens:
- reusable components:
- theme:
- offline/sync:
```

Then implement.

---

# 3. Reference PDF Analysis

The PDF contains 27 reference screens.

Use these page groups as visual references:

### Pages 1-2
Timetable / dashboard:
- calendar header
- selected day
- vertical timeline
- class cards
- attendance circular indicators
- quick status actions
- floating Add Class

### Pages 3-4
Export / Import:
- focused screens
- large code field
- one clear blue CTA
- explanation text

### Pages 5-6
Settings:
- grouped sections
- icon-led rows
- compact dark UI

### Pages 7-10
Add Class:
- simple form-row architecture
- date/time controls
- subject selector
- component selector
- repeat toggle
- notes/link fields

### Page 11
Empty timetable:
- illustration
- concise empty message
- prominent Add Class

### Page 12
Subjects:
- overall attendance card
- subject list
- circular attendance indicators

### Page 13
Add Subject:
- required attendance threshold
- component weighting
- plus/minus controls

### Pages 14-15
Subject details:
- large attendance percentage
- required attendance bar
- component statistics
- trend graph
- upcoming classes

### Pages 16-20
Attendance history:
- compact class list
- filter controls
- bottom-sheet filters

### Pages 21-23
Manual attendance:
- dedicated manual entry
- component-based Present/Absent counts
- explanatory text
- long-press/select interaction

### Page 24
Time format:
- compact preference dialog

### Pages 25-27
Import/export information dialogs:
- explain consequences before action
- clear acknowledgement
- avoid hidden destructive behavior

### Final account screen
Destructive account/data hierarchy:
- warning
- reset option
- re-authentication before deletion

---

# 4. Design Target

The target visual language is:

```text
Dark background
    ↓
Layered dark surfaces
    ↓
Strong white hierarchy
    ↓
Blue primary interaction
    ↓
Circular attendance feedback
    ↓
Rounded compact cards
    ↓
Thin separators
    ↓
Minimal visual noise
```

Do not turn StudySpace into a direct SilverBook clone.

Preserve StudySpace branding and existing navigation where possible.

---

# 5. Color System

Use a restrained palette.

## Base
- near-black / dark charcoal background
- slightly lighter charcoal cards
- subtly lighter elevated sheets
- low-opacity neutral dividers

## Text
- near-white primary text
- light gray secondary text
- medium gray tertiary text

## Primary accent
Use one dominant StudySpace blue for:
- primary buttons
- selected calendar date
- progress ring
- selected controls
- important interactive icons

Optional supporting cyan/teal may be used very sparingly.

Do not introduce random new accent colors screen-by-screen.

---

# 6. Attendance Status Colors

Use semantic colors consistently:

```text
Present       -> green family
Absent        -> red family
Cancelled     -> amber/neutral family
Not Marked    -> muted gray
Primary       -> StudySpace blue
```

Do not oversaturate the interface.

---

# 7. Shape Language

Target:

- cards: approximately 14-18 px radius
- small controls: approximately 8-12 px radius
- pills: fully rounded
- buttons: rounded
- dividers: thin and subtle
- circular progress: consistent thickness
- bottom sheets: rounded top corners

Use shared constants/tokens.

Do not scatter hardcoded radii throughout the code.

---

# 8. Typography

Create a clear hierarchy.

### Highest priority
- screen title
- attendance percentage
- subject title
- current time / class time

### Medium
- faculty
- room
- next class
- component name

### Low
- helper text
- explanations
- secondary status metadata

Use the existing StudySpace font/theme system where available.

Do not add a strange new font merely because the reference resembles one.

---

# 9. Navigation Model

Inspect current StudySpace navigation first.

Do not create redundant navigation.

Attendance should conceptually contain:

```text
Attendance
├── Timetable / Today
├── Subjects
├── History
└── Secondary
    ├── Manual Attendance
    ├── Import Timetable
    ├── Export Timetable
    └── Attendance Settings
```

Map these into the existing StudySpace navigation architecture rather than forcing this exact tree if the current app already has a better structure.

---

# 10. SCREEN 1 - Attendance Dashboard

Build the main attendance/timetable experience around the reference pattern.

Target structure:

```text
Attendance                     [Calendar] [More]

September 2026

S  M  T  W  T  F  S
... calendar ...
      selected date

│ 08:30
│   ○
│   ┌──────────────────────────────┐
│   │ L  SE Lab              80% ◯ │
│   │    Faculty • Room            │
│   │    Can miss up to X classes  │
│   │ [Can] [Abs] [Pre]            │
│   └──────────────────────────────┘
│
│ 10:30
│   ○
│   └──────────────────────────────┘

                    [+ Add class]
```

### Requirements

Implement:

- compact month/date selector
- selected-day state
- vertical timeline
- time labels
- timeline dots
- class cards
- component badge
- subject
- faculty / room metadata
- missability / attendance context where current data supports it
- circular attendance indicator
- quick attendance status action
- floating Add Class

The layout must remain legible on real Android devices.

---

# 11. Class Card

Build a reusable `AttendanceClassCard`-style component.

Responsibilities:

- display class identity
- display time
- display component
- display secondary metadata
- display attendance context
- display current status
- expose fast status actions

It must support:

```text
loading
normal
present
absent
cancelled
not marked
disabled
error
```

Do not hardcode fake class examples.

Use real repository/state data.

---

# 12. Attendance Ring

Create or reuse a shared attendance-ring component.

It must be reusable across:

- dashboard
- subject list
- subject detail

Required behavior:

- accepts percentage
- supports semantic state/threshold
- consistent stroke width
- correct text centering
- animation only when useful
- handles 0%, 100%, and missing values safely

Do not create three visually different progress rings.

---

# 13. Empty State

Use the reference's pattern:

```text
        [Illustration]

      No classes today

  Your schedule is clear.

            [+ Add class]
```

Requirements:

- clear message
- optional supporting text
- one primary CTA
- visual illustration only when useful

Do not copy SilverBook artwork/assets.

Use StudySpace-compatible illustration assets or a simple original illustration.

---

# 14. SCREEN 2 - Subjects

Target structure:

```text
My Subjects                     [More]

┌────────────────────────────────┐
│ Overall Attendance        85% ◯│
│ Total attended: 81 / 95        │
└────────────────────────────────┘

85% ◯   OOPS
        Next class Thu...

80% ◯   AEM
        Next class Tue...

92% ◯   DSA
        Next class Tue...

                    [+ Add subject]
```

Requirements:

- overall attendance card first
- subject list
- consistent percentage rings
- next class metadata
- quick scan readability
- Add Subject action

---

# 15. SCREEN 3 - Subject Detail

Build the detail screen with this hierarchy:

```text
<  OOPS                           [...]

85.71%

Required: 75%

──────── attendance relation ────

┌────────────────────────────────┐
│ Components                     │
│                                │
│ L  LECTURE                     │
│    Weight: 1                   │
│    [progress]        12/14     │
└────────────────────────────────┘

┌────────────────────────────────┐
│ Attendance trend               │
│ Aug 1 - Sep 14                 │
│                                │
│    [simple trend chart]        │
└────────────────────────────────┘

┌────────────────────────────────┐
│ Upcoming classes            >  │
│ Thu, 17 Sep   01:30 - 02:30    │
│ Fri, 18 Sep   09:30 - 10:30    │
└────────────────────────────────┘
```

Requirements:

- percentage dominance
- required attendance clearly visible
- component breakdown
- simple chart
- upcoming classes
- readable on a small screen
- no giant dashboard effect

---

# 16. SCREEN 4 - Attendance History

Target:

```text
<  OOPS

[Date ▼] [Status ▼] [Component ▼] [Faculty ▼]

L  Sat, 1 Aug 2026
   11:00 - 01:00 PM
   Faculty
   LECTURE                  Absent  ⓧ

L  Mon, 3 Aug 2026
   08:30 - 09:30 AM
   Faculty
   LECTURE                 Present  ✓
```

Requirements:

- performant list
- compact rows
- status at right
- clear date/time hierarchy
- filters at top

---

# 17. Filter Bottom Sheets

Implement reusable filter bottom sheets.

Required filters:

### Date
- All past classes
- Past month
- Next month
- All upcoming classes

### Attendance status
- Present
- Absent
- Cancelled
- Not Marked

### Class component
- Lecture
- Tutorial
- Practical

### Faculty
- dynamically derived faculty options

Footer:

```text
Clear all                 Apply
```

Requirements:

- selections persist while sheet is open
- Apply is explicit
- Clear All works
- active filters are visible after closing
- no destructive data changes
- sheet remains usable with long option lists

---

# 18. SCREEN 5 - Add Class

Implement a polished form using reusable form rows.

Structure:

```text
[X]                           [Save]

Select subject...
Class component...
Add faculty name

Date
Starts at
Ends at
Does not repeat            [switch]

Add meeting link
Add notes
```

Use:
- native date picker
- native time picker
- bottom-sheet selection where appropriate
- proper validation
- keyboard-safe layouts

The UI should feel like the reference concept but use StudySpace's components.

---

# 19. SCREEN 6 - Add Subject

Implement:

```text
Subject Name

Required attendance
[slider]

Component weights

LECTURE       [-] 1 [+]
TUTORIAL      [-] 1 [+]
PRACTICAL     [-] 1 [+]

[Save]
```

Use the current backend/model rules.

Do not invent calculation logic.

Validate allowed ranges.

---

# 20. SCREEN 7 - Manual Attendance

Reference behavior must be preserved conceptually.

Implement:

```text
Manual Attendance

Add attendance for classes
that are not scheduled.

┌──────────────────────────────┐
│ L  LECTURE                   │
│    Present [0]               │
│    Absent  [0]               │
│                              │
│ T  TUTORIAL                  │
│    Present [0]               │
│    Absent  [0]               │
│                              │
│ P  PRACTICAL                 │
│    Present [0]               │
│    Absent  [0]               │
└──────────────────────────────┘

[Save]
```

Keep all current attendance calculation semantics.

---

# 21. SCREEN 8 - Import / Export

Only implement functionality that the current StudySpace backend supports.

### Export

```text
Export Timetable

Share your classes and timetable.

[original StudySpace illustration]

Your timetable code

[ CODE ]

[Share code]
```

### Import

```text
Import timetable

Enter the timetable code.

[ ] [ ] [ ] [ ] [ ] [ ] [ ]

[Submit]
```

Before action, explain important consequences through a proper dialog when necessary.

Do not claim that attendance is preserved if the backend does not support that guarantee.

---

# 22. SCREEN 9 - Settings

Organize using grouped sections.

Potential groups:

```text
SYNC / BACKUP
- attendance sync
- last sync
- cellular sync

NOTIFICATIONS
- upcoming class reminder

DISPLAY
- theme
- time format

ACCOUNT & DATA
- account
- reset data
- delete account

SUPPORT
- feedback
- privacy
```

Only show settings supported by the current product.

Do not create fake toggles.

---

# 23. Account / Destructive Screens

Destructive actions must follow clear hierarchy.

Required UX:

```text
Warning
↓
Explain consequences
↓
Offer safer reset option if supported
↓
Require confirmation
↓
Require re-authentication where necessary
↓
Final destructive action
```

Never make account deletion easy to trigger accidentally.

---

# 24. Reusable Flutter Components

Prefer a component architecture along these lines:

```text
AttendanceScaffold
AttendanceCalendar
AttendanceTimeline
AttendanceTimelineMarker
AttendanceClassCard
AttendanceRing
AttendanceStatusAction
AttendanceStatusSelector
AttendanceFilterChip
AttendanceFilterSheet
SubjectAttendanceCard
SubjectAttendanceRow
SubjectAttendanceHeader
AttendanceTrendChart
UpcomingClassesCard
AttendanceEmptyState
AttendanceFormRow
ManualAttendanceCard
```

Do not blindly create all of them if equivalent existing components already exist.

Reuse before duplicating.

---

# 25. Design Tokens

Centralize:

```text
AppColors
AppSpacing
AppRadii
AppTypography
AppElevation
AppDurations
AttendanceStatusTokens
```

At minimum centralize:

- background
- surface
- elevated surface
- primary blue
- text levels
- divider
- status colors
- standard card radius
- standard control radius
- standard horizontal padding
- standard vertical spacing

---

# 26. Responsive Rules

The reference PDF is portrait mobile UI.

Do not hardcode dimensions based on the screenshot.

The UI must adapt to:

- small Android phones
- normal phones
- tall phones
- large font settings where possible
- different status-bar heights
- device safe areas

Use:
- `SafeArea`
- flexible layouts
- constrained text
- scrolling where required
- minimum touch targets
- `LayoutBuilder` only where it genuinely helps

Do not use arbitrary pixel coordinates.

---

# 27. Loading / Error / Offline States

Every major screen must support:

### Loading
Skeleton or subtle progress state that matches the dark UI.

### Empty
Purposeful empty state.

### Error
Readable explanation + retry action.

### Offline
Show local cached information when available and explain pending sync.

### Syncing
Do not block the entire screen for small background sync operations.

The UI must make state understandable without exposing technical error strings.

---

# 28. Accessibility

Ensure:

- touch targets are large enough
- contrast is strong
- icon-only actions have semantics
- text does not overflow
- status is not conveyed by color alone
- charts have a useful textual summary
- bottom sheets work with accessibility navigation

---

# 29. Animation

Use motion sparingly.

Good:
- calendar selection
- bottom-sheet entrance
- list updates
- progress change
- small tap feedback

Bad:
- distracting bouncing
- long transitions
- animation that delays attendance marking

Attendance actions should feel immediate.

---

# 30. Data / Security Rules

Absolutely do not:

- expose Supabase service-role keys
- expose Gemini keys
- bypass RLS
- hardcode user IDs
- hardcode attendance numbers
- hardcode faculty lists
- hardcode subjects
- write directly to database tables from UI widgets if the existing repository/service layer should handle it

Use existing services/repositories.

---

# 31. Important Existing Backend Constraint

This is primarily a **presentation and interaction redesign**.

Preserve the existing attendance domain logic.

If the current backend already provides:

- overall attendance
- subject attendance
- component attendance
- scheduled classes
- attendance history
- manual attendance
- timetable data

the redesigned Flutter UI must consume that existing data rather than replacing the data model.

Only modify backend/domain logic when a UI requirement exposes a genuine existing defect.

---

# 32. Implementation Phases

## Phase 1
Design system and reusable attendance widgets.

## Phase 2
Dashboard / timetable.

## Phase 3
Subjects + subject detail.

## Phase 4
History + filters.

## Phase 5
Add class + Add subject + manual attendance.

## Phase 6
Import/export + settings + destructive screens.

## Phase 7
Polish + responsive fixes + QA.

Do not attempt a giant one-file rewrite.

Commit meaningful phases separately.

---

# 33. Git Safety

Before editing:

```bash
git status
git branch --show-current
git log -5 --oneline
```

Confirm the current integration branch.

During implementation:

- make small meaningful commits
- never reset hard
- never run `git clean -fd`
- never force-push
- never discard user changes
- do not merge into `main` automatically

If unexpected repository changes appear, stop and report them.

---

# 34. Validation After Each Phase

Run the smallest relevant checks after each implementation batch.

At minimum before completion:

```bash
flutter analyze
flutter test
flutter build apk --debug
```

Also run any existing project-specific tests related to attendance.

Do not declare success from code inspection alone.

---

# 35. Visual QA

This is critical.

After implementation, run the app on a real Android emulator/device.

Visually inspect:

1. dashboard
2. calendar selection
3. class card
4. attendance status action
5. subjects
6. subject detail
7. history
8. filter sheet
9. add class
10. add subject
11. manual attendance
12. import/export
13. settings
14. empty states
15. loading/error/offline states

Check for:

- clipping
- overflow
- inconsistent spacing
- tiny text
- weak contrast
- broken icons
- wrong dark surfaces
- bad bottom-sheet height
- keyboard overlap
- scrolling problems
- status-bar issues
- inconsistent button sizes
- inconsistent progress rings

---

# 36. Visual Comparison Method

Use the attached SilverBook PDF as inspiration.

For each major screen, ask:

```text
Does StudySpace have the same UX clarity?
Does the visual hierarchy feel equally strong?
Is the layout compact without becoming cramped?
Are primary actions obvious?
Does attendance information appear immediately?
Does the screen feel intentional rather than generic?
```

Do NOT ask:

```text
Is this pixel-identical to SilverBook?
```

Pixel copying is not the goal.

---

# 37. Anti-Patterns

Do not produce:

- generic Material 3 default pages with random blue buttons
- excessive gradients
- glassmorphism everywhere
- oversized cards
- giant dashboard widgets
- too many colors
- giant icons
- crowded text
- excessive shadows
- inconsistent rounded corners
- fake analytics
- duplicated state management
- hardcoded mock data
- placeholder lorem ipsum
- UI-only attendance mutations that bypass repositories

---

# 38. Definition of Done

Do not call the work complete until all of the following are true:

### Design
- consistent dark visual system
- consistent blue accent
- consistent rings/cards/chips
- clear typography hierarchy
- coherent navigation

### Functionality
- dashboard works with real attendance data
- subjects work
- subject detail works
- history works
- filters work
- add class works
- add subject works
- manual attendance works
- import/export works only where supported
- settings work only where supported

### Reliability
- loading states
- empty states
- error states
- offline/sync states
- retry behavior

### Engineering
- no security regressions
- no duplicate architecture
- reusable widgets
- no hardcoded attendance data
- no secret keys in Flutter

### QA
- `flutter analyze` passes
- `flutter test` passes
- debug APK builds
- real-device/emulator visual QA completed

---

# 39. Final Report Required From Antigravity

At the end, report:

## 1. Files changed
Group by:
- design system
- dashboard
- subjects
- detail
- history
- forms
- settings
- shared components

## 2. Screens completed
Use checkboxes.

## 3. Reused existing components
Explain what was reused instead of duplicated.

## 4. Backend changes
State explicitly:
- none
or
- exact changes and why they were necessary

## 5. Tests
Provide commands and results.

## 6. Visual QA
State:
- emulator/device used
- screen sizes checked
- issues found
- issues fixed

## 7. Git
Provide:
- current branch
- commits created
- current `git status`

## 8. Known limitations
List only real remaining limitations.

---

# 40. Final Instruction

Build the UI with the discipline of a production mobile product.

The SilverBook PDF is the **visual inspiration**:
- compact timetable
- strong attendance visibility
- clean dark interface
- blue primary action
- circular progress
- bottom-sheet filters
- focused forms
- polished empty states

StudySpace remains the **product and source of truth**:
- existing backend
- existing attendance logic
- existing Supabase security
- existing Flutter architecture
- existing StudySpace branding
- existing navigation patterns

Make the interface feel like:

**"StudySpace, but with the same level of attendance UX quality that made SilverBook enjoyable to use."**

Do not stop at making it functional.

Finish it to a polished, real-device-ready Flutter UI.
