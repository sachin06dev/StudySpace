# StudySpace Attendance Interface
## SilverBook-Inspired UI Analysis & Implementation Plan

### 1. Objective

The goal is to redesign the **StudySpace Flutter Attendance experience** using the attached SilverBook screenshots as the primary visual reference.

This is an **inspiration/reference exercise, not a pixel-for-pixel clone**. StudySpace should adopt the parts that make SilverBook feel polished and easy to use:

- dark-first visual hierarchy
- compact academic dashboard layout
- strong attendance-at-a-glance feedback
- calendar + timeline scheduling
- circular attendance indicators
- bottom sheets for filters and selections
- clean rounded cards
- strong blue primary actions
- minimal visual noise
- fast, touch-friendly interactions

The final interface must still look like **StudySpace**, not a branded SilverBook copy.

---

# 2. What the PDF Shows

The PDF contains 27 mobile UI screens covering timetable, attendance, subjects, settings, sharing/importing, manual attendance, filters, and account management.

The most important reference screens are:

| PDF page | Reference area | Important UI pattern |
|---|---|---|
| 1-2 | Dashboard / timetable | month calendar + vertical class timeline + class cards + attendance ring + floating Add class |
| 3-4 | Export / Import timetable | focused single-purpose screens, large code field, blue CTA |
| 5-6 | Settings | grouped settings sections, icon-led rows, dark surfaces |
| 7-10 | Add class flow | simple form rows, time picker, subject/component selectors |
| 11 | Empty timetable | large illustration + clear empty-state message + Add class |
| 12 | Subjects list | overall attendance summary + subject rows with rings |
| 13 | Add subject | required attendance slider + component weight controls |
| 14-15 | Subject details | large attendance percentage + component stats + trend graph + upcoming classes |
| 16-20 | Attendance history | compact class rows + filter chips + bottom-sheet filters |
| 21-23 | Manual attendance | component-based manual counters + long-press interaction |
| 24 | Time format | modal preference selection |
| 25-27 | Import/export explanations | educational dialogs and confirmation surfaces |
| 28 | Account deletion | destructive action hierarchy |

### Important source observations

The timetable screens combine a compact month/week calendar with a vertical timeline and class cards. Each class card shows subject/component information, faculty/room-style metadata, missability information, an attendance percentage ring, and quick status actions. This gives a strong "everything important is visible without opening the class" experience. [SilverBook PDF, pages 1-2]

The Subjects screen emphasizes attendance first: there is an overall attendance summary followed by individual subjects, each with its own circular percentage indicator. [SilverBook PDF, page 12]

The Subject Detail flow uses a strong hierarchy: subject name and percentage first, then required-attendance progress, component-level information, an attendance trend chart, and upcoming classes. [SilverBook PDF, pages 14-15]

The attendance-history flow uses horizontal filter controls and bottom sheets for Date, Attendance Status, Class Component, and Faculty. [SilverBook PDF, pages 16-20]

The manual attendance screen separates scheduled attendance from manually added attendance and uses component-specific Present/Absent inputs. [SilverBook PDF, pages 21-23]

The Import/Export flow uses single-purpose screens with large code entry/display and clear blue actions, plus explanatory dialogs before potentially confusing operations. [SilverBook PDF, pages 3-4 and 25-27]

---

# 3. Recommended StudySpace Attendance Information Architecture

## Primary Attendance Area

StudySpace should have a dedicated **Attendance** section in the Flutter app.

Recommended top-level structure:

```text
Attendance
├── Today / Timetable
├── Subjects
├── History
└── More
    ├── Manual Attendance
    ├── Import Timetable
    ├── Export Timetable
    └── Attendance Settings
```

Do not create unnecessary top-level navigation items just to match SilverBook. Reuse the current StudySpace navigation structure where possible.

---

# 4. Screen-by-Screen UI Plan

## A. Attendance Dashboard / Timetable

### Primary purpose
Answer these questions immediately:

1. What classes do I have today?
2. Which classes are next?
3. What is my current attendance?
4. Can I mark today's classes quickly?

### Layout

```text
[Status bar]

Attendance                     [Calendar] [More]

September 2026
S  M  T  W  T  F  S
... mini calendar ...
        [selected date]

│ 08:30
│   ○
│   ┌──────────────────────────────┐
│   │ L  Subject Name        85% ◯ │
│   │    Faculty • Room            │
│   │    Can miss 1 class           │
│   │ [Cancel] [Absent] [Present]  │
│   └──────────────────────────────┘
│
│ 10:30
│   ○
│   ┌──────────────────────────────┐
│   │ T  Another Subject      92% ◯│
│   └──────────────────────────────┘

                    [+ Add class]

[Bottom navigation]
```

### Design direction

- Preserve the SilverBook-style timeline concept.
- Use a **single accent blue** for primary interaction.
- Use subject/component initials in blue circular badges.
- Use circular attendance indicators for quick scanning.
- Avoid overly dense shadows.
- Cards should be dark-on-dark but with a subtle elevated surface.
- Make the timeline visually continuous from the first class to the last class.
- Keep Add Class as a floating or elevated primary action.

### StudySpace improvement

The dashboard should also expose useful StudySpace context where it naturally fits, such as:
- upcoming class
- attendance warning
- quick "mark attendance" action
- class/lecture link when already present in StudySpace data

Do not overload the screen with unrelated productivity features.

---

# 5. B. Subjects Screen

### Layout

```text
My Subjects                         [More]

┌──────────────────────────────────┐
│ Overall Attendance          85% ○│
│ Total attended: 81 / 95          │
└──────────────────────────────────┘

85% ○   OOPS
        Next class Thu, 17 Sep

80% ○   AEM
        Next class Tue, 15 Sep

92% ○   DSA
        Next class Tue, 15 Sep

...

                     [+ Add subject]

[Bottom navigation]
```

### Design rules

- Overall attendance is the first visual priority.
- Subject rows should be compact enough to scan quickly.
- Percentage rings must be consistent across dashboard, subject list, and subject detail.
- Required-attendance threshold should be visually distinguishable from actual attendance.
- Subject name should carry more weight than secondary metadata.

---

# 6. C. Subject Detail

This should become the strongest analytical screen in the Attendance module.

### Layout

```text
<  OOPS                         [More]

85.71%
Required: 75%
─────────────── progress ──────

┌────────────────────────────────┐
│ Components                     │
│                                │
│ L  LECTURE                     │
│    Weight: 1                   │
│    [attendance progress]       │
│                   12/14 (85%)  │
│                                │
│    Added manually: 0/0        │
└────────────────────────────────┘

┌────────────────────────────────┐
│ Attendance trend               │
│ Aug 1 - Sep 14                 │
│                                │
│ 100%      ╲───────────────     │
│           trend line           │
└────────────────────────────────┘

┌────────────────────────────────┐
│ Upcoming classes            >  │
│ L  Thu, 17 Sep   01:30-02:30  │
│ L  Fri, 18 Sep   09:30-10:30  │
│ ...                            │
└────────────────────────────────┘
```

### Design direction

- Large percentage at the top.
- Strong visual relationship between actual attendance and required attendance.
- Component breakdown in a card.
- Simple trend chart, not a dashboard full of charts.
- Upcoming classes should be actionable.
- Avoid excessive decoration.

---

# 7. D. Attendance History

### Top area

```text
<  OOPS

[Date ▼] [Status ▼] [Components ▼] [Faculty ▼]

L  Sat, 1 Aug 2026
   11:00 - 01:00 PM
   Faculty
   LECTURE                         Absent  ⓧ

L  Mon, 3 Aug 2026
   08:30 - 09:30 AM
   Faculty
   LECTURE                        Present  ✓
```

### Filtering interaction

Use bottom sheets similar to the reference:

```text
Date                         [×]

All past classes                         ○
Past month                              ○
Next month                              ○
All upcoming classes                    ○

                 Clear all      [Apply]
```

Other filter sheets:
- Attendance status
  - Present
  - Absent
  - Class Cancelled
  - Not Marked
- Class component
  - Lecture
  - Tutorial
  - Practical
- Faculty
  - dynamically loaded faculty names

### Important UX rule

Filtering must be non-destructive and reversible. The user should always know:
- which filters are active
- how to clear them
- how many results match, when useful

---

# 8. E. Add Class

The Add Class experience should feel like an intentional form, not a generic Flutter form page.

Reference structure from the PDF:

```text
[X]                         [Save]

Select subject...
Class component...
Add faculty name

Date                       Mon, 14 Sep 2026
Starts at                  11:00 AM
Ends at                    01:00 PM
Does not repeat            [switch]

Add meeting link
Add notes
```

### StudySpace implementation

Use reusable form-row components:
- leading icon
- label / value
- tap target
- optional helper text
- divider

Use native Flutter interaction where it gives the better UX:
- date picker
- time picker
- selection bottom sheet/dialog
- text input
- switch

Do not reproduce Android dialogs blindly if the existing StudySpace design system has a better shared component.

---

# 9. F. Add Subject

Reference features:
- subject name
- required attendance threshold
- lecture/tutorial/practical component weighting
- plus/minus controls

### Better StudySpace component

Use a reusable weight selector:

```text
LECTURE
[-]       1       [+]

TUTORIAL
[-]       1       [+]

PRACTICAL
[-]       1       [+]

[Save]
```

The implementation must validate allowed ranges and keep backend calculations consistent.

---

# 10. G. Empty States

The reference uses a visual illustration with a short message and a primary action. [SilverBook PDF, page 11]

StudySpace should follow the pattern:

```text
        [Illustration]

      No classes today

  Your schedule is clear.
  Add a class to get started.

            [+ Add class]
```

### Rule

Use illustration/visual hierarchy only when it improves the empty-state experience. Do not fill every empty state with decorative art.

---

# 11. H. Manual Attendance

Reference behavior:
- dedicated manual-entry page
- component-specific inputs
- Present and Absent counts
- explanation that manual classes are not placed on the schedule
- long-press/select interaction for history items

[SilverBook PDF, pages 21-23]

### StudySpace plan

```text
Manual Attendance
Add attendance for unscheduled classes.

┌──────────────────────────────┐
│ L  LECTURE                   │
│    Present [ 0 ]             │
│    Absent  [ 0 ]             │
│                              │
│ T  TUTORIAL                  │
│    Present [ 0 ]             │
│    Absent  [ 0 ]             │
└──────────────────────────────┘

                 [Save]
```

---

# 12. I. Import / Export Timetable

The reference uses code-based sharing.

### Export

```text
Export Timetable

Share your classes and timetable
with friends.

[illustration]

Your timetable code

[ 6197320                         ]

             [Share code]
```

### Import

```text
Import timetable

Enter the Timetable Code...

[ ] [ ] [ ] [ ] [ ] [ ] [ ]

             [Submit]
```

### StudySpace requirement

Before implementing this UI, Antigravity must inspect the **already-merged backend/API/database behavior** and determine what import/export functionality is actually supported.

The UI must not invent a fake feature just because SilverBook has it.

---

# 13. J. Settings

The reference groups settings into clear sections:

- Backup
- Notifications
- Display
- Account & Data
- Support

[SilverBook PDF, pages 5-7]

For StudySpace, keep only settings that the current product can genuinely support.

Recommended structure:

```text
Settings

BACKUP / SYNC
    Sync attendance
    Last sync
    Sync over cellular

NOTIFICATIONS
    Upcoming class reminder

DISPLAY
    Theme
    Time format

ACCOUNT & DATA
    Account
    Reset attendance data
    Delete account

SUPPORT
    Send feedback
    Privacy
```

Do not add a backup service or notification behavior without confirming the existing backend/mobile implementation.

---

# 14. Visual Design System

## Color roles

Use a restrained palette.

### Base
- Background: near-black / very dark charcoal
- Surface: slightly lighter charcoal
- Elevated surface: slightly lighter than surface
- Divider: low-opacity neutral
- Primary text: near-white
- Secondary text: cool light gray
- Muted text: medium gray

### Accent
- Primary blue: the dominant CTA and selected-state color
- Optional cyan/teal: sparingly for section labels or secondary emphasis
- Purple: reserve for very specific selected/active states only if it fits the StudySpace brand

Do not use many unrelated accent colors.

## Attendance status colors

Use status colors consistently but gently:

- Present: positive green family
- Absent: red family
- Cancelled: neutral/orange family
- Not marked: muted gray

The visual language should never become a rainbow dashboard.

---

# 15. Shape Language

Reference characteristics:
- rounded cards
- large rounded buttons
- pill filters
- circular progress
- compact iconography
- thin outlines

Recommended StudySpace rules:
- Card radius: roughly 14-18 px
- Small controls: 8-12 px
- Pills: fully rounded
- Buttons: rounded, not excessively pill-shaped unless they are clearly action chips
- Thin 1 px dividers
- Avoid excessive borders around every tiny element

Use shared constants so the UI stays consistent.

---

# 16. Typography

The reference uses a modern geometric/sans-serif feel with strong weight contrast.

StudySpace should use:
- clear display/title size for page headers
- medium/bold subject titles
- smaller secondary metadata
- very compact supporting labels

Typography must prioritize:
1. subject name
2. attendance percentage
3. time
4. status
5. secondary metadata

Do not imitate a proprietary font blindly. Use the existing StudySpace font stack or a legal/system-safe equivalent.

---

# 17. Motion & Interaction

Keep motion purposeful.

Use:
- subtle page transitions
- bottom-sheet entrance animation
- tap feedback
- progress animation when useful
- filter-state transitions
- smooth calendar selection

Avoid:
- decorative bouncing everywhere
- slow transitions
- animations that delay marking attendance

Attendance actions must feel immediate.

---

# 18. Flutter Architecture Guidance

Antigravity must inspect the current Flutter project before changing code.

The implementation should prefer reusable widgets such as:

```text
AttendanceScaffold
AttendanceCalendar
AttendanceTimeline
AttendanceClassCard
AttendanceRing
AttendanceStatusSelector
AttendanceFilterChip
AttendanceFilterSheet
SubjectAttendanceRow
SubjectAttendanceHeader
AttendanceTrendChart
UpcomingClassesCard
ManualAttendanceCard
AttendanceEmptyState
AttendanceFormRow
```

Use the existing state-management, repository, Supabase, routing, and theme architecture already present in the project.

Do not introduce a second architecture simply to build this UI.

---

# 19. Non-Negotiable Product Rules

1. UI redesign must not break attendance calculations.
2. UI redesign must not bypass Supabase RLS.
3. UI must use existing attendance APIs/repositories where already implemented.
4. Never put service-role keys in Flutter.
5. Never hardcode demo attendance values.
6. Every state must be designed:
   - loading
   - loaded
   - empty
   - error
   - offline
   - partial/syncing
7. Every important mutation needs visible feedback.
8. Long lists must remain performant.
9. Accessibility and touch targets must be respected.
10. The implementation must work on real Android screen sizes, not only the emulator size shown in the reference PDF.

---

# 20. Recommended Build Order

### Phase 1 - Design foundation
- Attendance theme tokens
- typography
- spacing
- radii
- shared buttons/chips/cards
- attendance ring

### Phase 2 - Dashboard
- calendar
- timeline
- class card
- mark-attendance actions
- empty state
- Add class

### Phase 3 - Subjects
- subjects list
- overall attendance
- subject detail
- component cards
- trend graph
- upcoming classes

### Phase 4 - History
- history list
- filter chips
- four bottom-sheet filter types
- active-filter state

### Phase 5 - Input flows
- add class
- add subject
- manual attendance

### Phase 6 - Secondary flows
- timetable import/export
- settings refinements
- destructive account/data screens

### Phase 7 - QA
- dark theme visual QA
- small-screen QA
- large-screen QA
- loading/error/offline QA
- data correctness
- regression testing

---

# 21. Definition of Done

Attendance UI is ready only when:

- the visual system is consistent across all attendance screens
- navigation feels coherent with the rest of StudySpace
- the dashboard is understandable within seconds
- attendance marking is fast
- subject attendance is scannable
- history filters are easy to use
- no fake/demo data exists
- loading/error/empty/offline states are implemented
- backend behavior is unchanged unless explicitly required
- `flutter analyze` passes
- `flutter test` passes
- a debug APK builds successfully
- at least one real-device visual pass has been performed
