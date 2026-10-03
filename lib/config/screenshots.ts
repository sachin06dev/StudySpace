export interface ScreenshotPair {
  id: string
  name: string
  category: string
  badge: string
  title: string
  tagline: string
  description: string
  highlights: string[]
  light: string
  dark: string
  aspectRatio: string
}

export const SCREENSHOT_FEATURES: ScreenshotPair[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    category: 'Daily Overview',
    badge: 'Command Center',
    title: 'Your Entire Academic Day, At a Single Glance',
    tagline: 'See your next class, attendance buffers, study streak, and urgent assignments in one place.',
    description:
      'Instead of opening 4 tabs, loose spreadsheets, and scattered apps, StudySpace greets you with your personalized daily schedule, next-class countdown with room number and professor, attendance health bars, and immediate tasks.',
    highlights: [
      'Next class countdown with room & professor details',
      'Instant attendance health & safe bunk indicators',
      'Today\'s focused study hours and active streak',
      'Prioritized checklist for assignments and exam revision',
    ],
    light: '/screenshots/light/dashboard.png',
    dark: '/screenshots/dark/dashboard.png',
    aspectRatio: '1523/2811',
  },
  {
    id: 'attendance',
    name: 'Attendance & Bunks',
    category: 'Attendance Safeguard',
    badge: 'Smart Math Engine',
    title: 'Stay Effortlessly Ahead of Your Attendance Threshold',
    tagline: 'Know exactly how many classes you can safely bunk, or how many you must attend to recover.',
    description:
      'University attendance rules are unforgiving. StudySpace replaces mental math and anxiety with mathematical precision: mark classes Present, Absent, or Cancel in 1 tap, and get instant calculations for 75% or 85% safety buffers.',
    highlights: [
      '1-Tap quick actions: Present, Absent, or Cancel',
      'Dynamic Bunk Buffer: Tells you exactly how many lectures you can miss',
      'Recovery Calculator: Computes consecutive classes needed to return above 75%',
      'Historical calendar log editable anytime with zero data loss',
    ],
    light: '/screenshots/light/attendance-master.png',
    dark: '/screenshots/dark/attendance-master.png',
    aspectRatio: '1552/3563',
  },
  {
    id: 'timetable',
    name: 'AI Timetable',
    category: 'Smart Scheduling',
    badge: 'Computer Vision OCR',
    title: 'Snap a Routine Photo. Get a Living Schedule.',
    tagline: 'Upload your campus timetable image and let StudySpace digitize every slot.',
    description:
      'Say goodbye to typing 30 weekly class slots by hand. Snap a picture of your college timetable or upload an image. StudySpace automatically detects days, timings, course codes, professors, and classroom numbers.',
    highlights: [
      'Automatic routine grid parsing with Gemini AI Vision',
      'Review and fine-tune detected slots before saving',
      'Color-coded weekly timetable with instant room lookups',
      'Offline-first synchronization with Android companion app',
    ],
    light: '/screenshots/light/timetable.png',
    dark: '/screenshots/dark/timetable.png',
    aspectRatio: '1563/1417',
  },
  {
    id: 'videos',
    name: 'Lectures & Notes',
    category: 'YouTube Lecture Hub',
    badge: 'Video-Timestamp Sync',
    title: 'Watch Course Lectures Without Algorithmic Rabbitholes',
    tagline: 'Focused playback with video-anchored notes that seek the exact second on click.',
    description:
      'Study YouTube playlists and lecture series without recommendation sidebars, clickbait, or comments. Take notes that pin directly to video timestamps (e.g., 04:15) so you can jump back to tricky concepts during exam week with one click.',
    highlights: [
      'Stripped of YouTube distraction feeds, comments, and sidebars',
      'Clickable timestamp notes that jump directly to playback time',
      'Markdown note formatting for definitions, equations, and code',
      'Subject-organized playlists with resume-playback memory',
    ],
    light: '/screenshots/light/videos-player.png',
    dark: '/screenshots/dark/videos-player.png',
    aspectRatio: '1561/2490',
  },
  {
    id: 'pomodoro',
    name: 'Pomodoro Focus',
    category: 'Deep Work',
    badge: 'Persistent Timer',
    title: 'Scientifically Engineered Study Intervals',
    tagline: 'A persistent Pomodoro timer that survives page navigation and logs real academic hours.',
    description:
      'Most online timers lose your session the moment you click away. The StudySpace Pomodoro suite keeps ticking in the background, offering custom work/break intervals, soft audio chimes, and automatic session recording into your habit heatmap.',
    highlights: [
      'Persistent timer state that never resets when switching views',
      'Customizable intervals (Classic 25/5, Deep 50/10, or Long 90/20)',
      'Acoustic chimes and notifications when intervals conclude',
      'Every completed session compounds your weekly study velocity',
    ],
    light: '/screenshots/light/pomodoro.png',
    dark: '/screenshots/dark/pomodoro.png',
    aspectRatio: '1173/1246',
  },
  {
    id: 'tasks',
    name: 'Tasks Matrix',
    category: 'Task Planner',
    badge: 'Subject-Linked Priority',
    title: 'Never Let an Assignment or Lab Submission Slip',
    tagline: 'Prioritize by urgency and subject with a clean academic checklist.',
    description:
      'Generic to-do apps lack academic context. In StudySpace, every task connects to its university course, due date, and priority level, helping you balance continuous semester assessments with final exam preparation.',
    highlights: [
      'Eisenhower-style urgency & importance classification',
      'Course tagging and color identification',
      'Due date countdown alerts and completion stats',
      'Seamless integration into your daily dashboard overview',
    ],
    light: '/screenshots/light/tasks.png',
    dark: '/screenshots/dark/tasks.png',
    aspectRatio: '1177/1330',
  },
  {
    id: 'documents',
    name: 'Academic Vault',
    category: 'Secure Documents',
    badge: 'Cloud Storage Vault',
    title: 'Your Course Syllabus, Question Papers & Lab Manuals',
    tagline: 'Encrypted private document storage organized by semester and subject.',
    description:
      'Stop searching through chaotic WhatsApp class groups for last semester\'s question papers or syllabus PDFs. Upload and categorize lecture slides, lab manuals, and notes with lightning-fast in-browser preview and secure cloud storage.',
    highlights: [
      'Support for PDFs, presentations, and study materials up to 50MB',
      'Organized by subject, document category, and academic year',
      'Instant in-browser document preview with download access',
      'Presigned secure links ensuring private, protected access',
    ],
    light: '/screenshots/light/documents.png',
    dark: '/screenshots/dark/documents.png',
    aspectRatio: '1515/1221',
  },
  {
    id: 'analytics',
    name: 'Analytics Engine',
    category: 'Consistency & Streaks',
    badge: '365-Day Heatmap',
    title: 'Watch Your Academic Consistency Compound Daily',
    tagline: 'GitHub-style activity heatmaps, study velocity curves, and milestone badges.',
    description:
      'Consistency beats last-minute cramming. StudySpace tracks your daily focus hours, attendance adherence, study rhythm across 24 hours, and awards milestone badges as your discipline compounds into top academic performance.',
    highlights: [
      '365-Day activity heatmap tracking daily academic sessions',
      'Diurnal rhythm charts revealing your peak focus hours',
      'Attendance vs. Target donut comparisons across all subjects',
      'Gamified streak counters and milestone achievement badges',
    ],
    light: '/screenshots/light/analytics-full.png',
    dark: '/screenshots/dark/analytics-full.png',
    aspectRatio: '1501/3376',
  },
]
