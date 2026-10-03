# StudySpace — Flutter Mobile Redesign Blueprint (Android Companion)

> **Document Status**: Complete Implementation Blueprint  
> **Audience**: Flutter Engineers, Mobile Architects, AI Coding Agents  
> **Target Paradigm**: Action-First, One-Handed Ergonomics, Fast Offline Flow ($<16\text{ms}$ SQLite Reads), Tactile Haptics  
> **Core Architectural Rule**: Provider state management preserved; SQLite cache & SyncEngine preserved; zero duplicate domain calculations.

---

## 1. Mobile Navigation & Shell (`MainNavigationShell.dart`)

- **Current**: 5-tab `BottomNavigationBar` (`Home`, `Attendance`, `Timetable`, `Study`, `Profile`) using `IndexedStack` with standard Material icons.
- **Problem**: Inconsistent icon weights; lacks active indicator pills; bottom bar elevation looks dated compared to modern Android gestures.
- **Target (Images 1, 3, 5)**:
  - **4 or 5 Core Destinations**:
    1. **Home**: Daily operational hub, next class hero banner, today's timeline.
    2. **Timetable**: Weekly schedule, daily slots, room/faculty overrides.
    3. **Attendance**: Calendar date strip, one-tap class status, bunk allowances.
    4. **Study**: 25:00 focus timer, course materials, quick tasks.
    5. **Analytics** (or More/Settings): Consistency heatmap, trends, account.
  - **Visual Styling**: Translucent floating or pinned bottom bar with blurred background (`BackdropFilter`), clean Lucide-style line icons, purple active indicator pill, and tactile haptic feedback on tab change (`FeedbackService.instance.lightImpact()`).
- **Reusable Widgets**: `AppBottomBar`, `StudySpaceMark`.

---

## 2. Screen-by-Screen Mobile Redesign Specifications

### 2.1 Home Screen (`HomeScreen.dart`)
- **Current**: 660-line monolithic file with 9 stacked cards causing severe vertical scroll fatigue (>2000px height).
- **Problem**: Next class is not immediately actionable; metrics row overflows on narrow screens (360px); redundant widgets (Library summary, Pomodoro duplicate).
- **Target (Images 1, 2, 4, 5)**:
  - **Primary Focus**: Immediate situational awareness: knowing the next class and marking it in one tap.
  - **Layout (CustomScrollView + Slivers)**:
    - **Header**: Quiet greeting ("Good morning, Sachin.") with today's date ("Tue, 15 Jul") and small profile avatar in the upper right.
    - **Hero Next Class Card**:
      - Course Name ("Software Engineering Lab").
      - Time & Room ("08:30 - 09:30 • CT-09").
      - Countdown pill ("In 25 min" in subtle violet).
      - Prominent primary purple **[ Mark Present ]** button (48px tap height) triggering immediate haptic feedback and enqueuing attendance sync.
    - **Quick Stats Row**: 3 compact horizontal tiles (`MetricStatTile`):
      1. Study (`2h 14m`, bar icon).
      2. Attendance (`84.7%`, circular ring donut).
      3. Streak (`7 days`, flame icon).
    - **Today's Classes Timeline**: Vertical list showing the rest of today's schedule (`08:30 SE Lab [Present]`, `09:30 AEM [Upcoming]`, `11:00 DBMS [Upcoming]`, `13:00 OS [Upcoming]`). Header features "See all →" shortcut to Timetable.
- **Reusable Widgets**: `NextClassHeroCard`, `MetricStatTile`, `ClassTimelineTile`, `StatusPill`.
- **Touch & Ergonomics**: Dominant [Mark Present] button positioned in the lower half of the hero card, within easy thumb reach.
- **Data Dependencies**: `AttendanceProvider`, `TasksProvider`, `PomodoroProvider`.
- **Risk**: Low. Data is loaded from local SQLite cache in $<16\text{ms}$.

---

### 2.2 Attendance Screen (`AttendanceOverviewScreen.dart`)
- **Current**: Clunky 3-tab layout (Timetable/Today, My Subjects, Attendance History) with overlapping calendar dates and dense card lists.
- **Problem**: High navigation friction; switching tabs resets date context; marking classes requires opening sub-screens.
- **Target (Images 1, 3, SilverBook Inspiration)**:
  - **Primary Focus**: Fluid date-strip browsing and one-tap or swipe class attendance logging.
  - **Layout**:
    - **App Bar**: "Attendance", month/year picker ("Jul 2025 v"), search icon, filter shortcut.
    - **Horizontal Week Strip (`WeekDateStrip`)**:
      - 7-day pill strip (`Mon 14`, `Tue 15` [active], `Wed 16`, `Thu 17`, `Fri 18`...).
      - Selected date highlighted with purple pill background.
      - Dot indicators beneath dates signify scheduled classes.
    - **Class Timeline List**:
      - Vertical list of resolved classes for the active date.
      - Each class row displays: Time column (`08:30 - 09:30`), Subject Code (`SE Lab`), Room (`CT-09`), and one-tap status button:
        - `[ Present ]` (Emerald fill).
        - `[ Mark ]` (Quiet outlined purple button).
        - `[ Absent ]` (Red fill).
    - **Swipe Actions (`flutter_slidable`)**:
      - Swiping right reveals green `[Present]` action with tactile confirmation.
      - Swiping left reveals red `[Absent]` and grey `[Cancel]` actions.
    - **Bottom Action**: "View Full Timetable" link button.
- **Reusable Widgets**: `WeekDateStrip`, `ClassTimelineTile`, `StatusPill`, `SlidableAction`.
- **Touch & Ergonomics**: Tap on card opens details; button directly logs status; swipe provides quick power-user shortcut.
- **Data Dependencies**: `AttendanceProvider`, `TimetableProvider`, `SyncEngine`.
- **Risk**: Medium. Slidable gestures must not conflict with horizontal week-strip swiping. (Resolved by bounding Slidable strictly to vertical class rows).

---

### 2.3 Timetable Screen (`WeeklyTimetableScreen.dart`)
- **Current**: Vertical list with day tabs; slot creation requires navigating to a separate full-page form.
- **Target (Images 1, 4, 5)**:
  - **Primary Focus**: Frictionless weekly schedule review and fast slot/exception creation.
  - **Layout**:
    - **Top Bar**: Search icon, view toggle (`List` vs `Calendar`).
    - **Day Selector Strip**: `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`.
    - **Class Cards**: Clean vertical cards displaying:
      - Start/End time.
      - Course Title & Code.
      - Room tag & Faculty name.
      - Chevron right opening the slot inspector sheet.
    - **Floating Action Button**: Purple circular `+` button in bottom right corner opening `AddSlotBottomSheet`.
- **Reusable Widgets**: `DaySelectorStrip`, `TimetableSlotCard`, `StudyBottomSheet`.
- **Touch & Ergonomics**: Floating action button positioned 16px above bottom navigation bar for effortless thumb reach.
- **Data Dependencies**: `TimetableProvider`.

---

### 2.4 Subject Detail Screen (`SubjectDetailScreen.dart`)
- **Current**: Plain text list of statistics and baseline inputs.
- **Target (Images 1, 2, 4)**:
  - **Primary Focus**: Comprehensive course companion bringing together attendance health, lecture notes, syllabus, and course documents.
  - **Layout**:
    - **Sliver App Bar**: Subject title ("Software Engineering"), code, room, and faculty.
    - **Segmented Tabs**: `Overview`, `Materials`, `Tasks`.
    - **Overview Tab**:
      - Large Attendance Donut Gauge (`86.7%`, `26 / 30 classes`).
      - Bunk Status Badge: `3 Safe Bunks Remaining` or `Attend next 2 classes`.
      - 3 Quick Action Tiles in a horizontal row: `[📝 Notes]`, `[📎 Add Material]`, `[✓ Add Task]`.
      - **Recent Materials List**: PDF cards (`SE_Module_1.pdf`, `Lab_Manual.pdf`) with file size and date.
- **Reusable Widgets**: `AttendanceDonutRing`, `SegmentedControl`, `ActionTile`, `MaterialFileCard`.
- **Data Dependencies**: `AttendanceProvider`, `StudyProvider`, `TasksProvider`.

---

### 2.5 Study & Focus Screen (`StudyScreen.dart`)
- **Current**: Cluttered screen mixing YouTube video links, task lists, and timer controls.
- **Target (Images 1, 2, 4, 5)**:
  - **Primary Focus**: Distraction-free Pomodoro focus sessions.
  - **Layout**:
    - **Segmented Mode Selector**: `Focus`, `Materials`, `Tasks`.
    - **Focus Session View**:
      - Large circular timer ring (`25:00`).
      - Play / Pause FAB centered inside the ring.
      - Session counter: `Pomodoro 1 / 4`.
      - Today's Focus Stat: `2h 14m` studied today with mini purple bar chart.
      - Ambient academic quote card at bottom ("Discipline is a form of self-respect.").
- **Reusable Widgets**: `PomodoroRingPainter`, `PlayPauseButton`, `MiniSparklineChart`.
- **Data Dependencies**: `PomodoroProvider`.

---

### 2.6 Analytics Screen (`AnalyticsScreen.dart`)
- **Current**: Multiple generic card widgets with text counts.
- **Target (Images 1, 2, 3, 5)**:
  - **Primary Focus**: Visual study consistency matrix and longitudinal habit patterns.
  - **Layout**:
    - **Segmented Tabs**: `Study`, `Attendance`, `Subjects`.
    - **Study Tab**:
      - **Study Consistency Matrix**: 30/60-day contribution heatmap rendered in 5 shades of StudySpace purple. Header: `14 active days · Current streak: 7 days 🔥`.
      - **This Week Duration**: Bar chart displaying study minutes across Mon–Sun with total hours (`32h 18m`) and daily average (`2h 14m avg per day`).
      - **Diurnal Rhythm Breakdown**: Morning vs Afternoon vs Evening hours.
- **Reusable Widgets**: `HeatmapMatrixWidget`, `WeeklyBarChartWidget`, `StatChip`.
- **Data Dependencies**: `AnalyticsProvider`.

---

### 2.7 Tasks Screen (`TasksScreen.dart`)
- **Current**: Basic ListView with checkboxes.
- **Target (Images 2, 4)**:
  - **Primary Focus**: Swift task capture and completion.
  - **Layout**:
    - **Filter Pills**: `All`, `Today`, `Upcoming`.
    - **Task Rows**: Custom animated checkbox, task title, subject tag pill, due date badge, priority dot.
    - **Slidable Actions**: Swipe right to complete (green); swipe left to delete (red).
    - **FAB**: Purple `+` button opening quick task creation sheet.
- **Reusable Widgets**: `TaskTile`, `FilterPillBar`, `SlidableAction`.
- **Data Dependencies**: `TasksProvider`.

---

### 2.8 Settings & Profile Screen (`ProfileScreen.dart`)
- **Current**: Raw text buttons and basic account details.
- **Target (Images 2, 4)**:
  - **Layout**:
    - Profile Header: Avatar circle (`S`), Name, email.
    - Grouped List Sections with chevrons:
      1. **Account**: Email, university, semester.
      2. **Appearance**: Theme toggle (Dark / Light / System).
      3. **Notifications**: Class reminders, morning digest, attendance prompts.
      4. **Data & Sync**: SQLite cache size, pending sync queue items, manual sync button.
      5. **App Widget**: Android home screen widget setup & configuration.
      6. **Help & Feedback**: Report issue, suggestion.
      7. **About**: StudySpace v1.0.0, privacy policy, terms.
- **Reusable Widgets**: `SettingsGroupList`, `SettingsTile`.

---

## 3. High-Value Roadmap Feature: Android Home Screen Widget (`home_widget`)

A major product differentiator highlighted in our architectural review is the **StudySpace Android Home Screen Widget**. Rather than opening the app, a university student can check their next class directly from their phone's home screen.

### 3.1 Widget Specification
```
┌─────────────────────────────────────────┐
│ STUDYSPACE                      84.7% ◉ │
├─────────────────────────────────────────┤
│ NEXT CLASS                              │
│ Software Engineering Lab                │
│ 08:30 - 09:30 · CT-09                   │
│                                         │
│ [ ✓ Mark Present ]    [ In 25 min ]     │
└─────────────────────────────────────────┘
```
- **Package**: `home_widget` (Flutter $\leftrightarrow$ Android AppWidgetProvider bridge).
- **Data Feeds**: Next class time, subject name, room, attendance percentage.
- **Interactive Action**: Tapping `[ ✓ Mark Present ]` dispatches background intent to update SQLite and enqueue Supabase sync without launching the full UI.

---

## 4. Timetable AI Scanner Flow (`ScanTimetableScreen.dart`)

- **Flow**:
  1. Student selects Camera or Gallery photo of university paper timetable.
  2. Image bytes are sent in-memory to `/api/timetable/scan` (Bearer token auth).
  3. Multimodal vision (Gemini 2.0 / 1.5 Flash) returns structured JSON timetable slots.
  4. Student reviews detected classes in `ScannedTimetableReviewScreen`, edits any misidentified room or time, and confirms batch import into local SQLite + Supabase.
