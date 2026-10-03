export interface SearchResultItem {
  id: string
  title: string
  subtitle?: string
  category: string
  href: string
  badge?: string
  resultType?: 'feature' | 'content'
}

export interface GroupedSearchResults {
  category: string
  items: SearchResultItem[]
}

export interface AppFeature {
  id: string
  title: string
  subtitle: string
  href: string
  keywords: string[]
  badge?: string
}

export const APP_FEATURES: AppFeature[] = [
  {
    id: 'feature-dashboard',
    title: 'Dashboard',
    subtitle: 'Daily overview, quick stats & class schedule',
    href: '/dashboard',
    keywords: ['dashboard', 'home', 'overview', 'summary', 'today', 'stats'],
  },
  {
    id: 'feature-timetable',
    title: 'Timetable & Classes',
    subtitle: 'Weekly class schedule, rooms, faculty & daily agenda',
    href: '/timetable',
    keywords: ['timetable', 'schedule', 'classes', 'period', 'routine', 'lecture', 'room', 'faculty'],
  },
  {
    id: 'feature-attendance',
    title: 'Attendance Tracker',
    subtitle: 'Track subject criteria, percentage, bunk calculator & records',
    href: '/attendance',
    keywords: ['attendance', 'present', 'absent', 'bunk', 'criteria', 'percentage', 'subjects', 'safe'],
  },
  {
    id: 'feature-pomodoro',
    title: 'Pomodoro Timer',
    subtitle: 'Focus intervals, custom breaks & deep study timer',
    href: '/dashboard#pomodoro',
    keywords: ['pomodoro', 'timer', 'focus', 'clock', 'interval', 'stopwatch', 'study timer'],
  },
  {
    id: 'feature-videos',
    title: 'Study Videos',
    subtitle: 'Curated YouTube lectures, video player & study vault',
    href: '/videos',
    keywords: ['videos', 'youtube', 'lecture', 'watch', 'video library', 'lessons'],
  },
  {
    id: 'feature-playlists',
    title: 'Course Playlists',
    subtitle: 'Structured video curricula & course progression',
    href: '/playlists',
    keywords: ['playlists', 'courses', 'curriculum', 'course playlists', 'playlist'],
  },
  {
    id: 'feature-notes',
    title: 'Timestamped Notes',
    subtitle: 'Lecture notes with instant video jump points & knowledge vault',
    href: '/notes',
    keywords: ['notes', 'study notes', 'timestamp', 'lecture notes', 'summary', 'take notes'],
  },
  {
    id: 'feature-tasks',
    title: 'Tasks & Deadlines',
    subtitle: 'Assignments, homework, study goals & priority task tracking',
    href: '/tasks',
    keywords: ['tasks', 'todo', 'assignments', 'homework', 'deadlines', 'priority', 'checklist'],
  },
  {
    id: 'feature-documents',
    title: 'Academic Documents',
    subtitle: 'PDFs, syllabus, previous year question papers & files',
    href: '/documents',
    keywords: ['documents', 'files', 'pdf', 'syllabus', 'pyq', 'question papers', 'materials'],
  },
  {
    id: 'feature-resources',
    title: 'Website Resources',
    subtitle: 'Bookmarked developer docs, tutorials & reference links',
    href: '/resources',
    keywords: ['resources', 'links', 'bookmarks', 'references', 'websites', 'urls', 'docs'],
  },
  {
    id: 'feature-analytics',
    title: 'Academic Analytics',
    subtitle: 'Study hours, attendance trends, subject distributions & insights',
    href: '/analytics',
    keywords: ['analytics', 'charts', 'study hours', 'insights', 'reports', 'attendance trends', 'metrics'],
  },
  {
    id: 'feature-settings',
    title: 'Settings & Profile',
    subtitle: 'Account preferences, notifications, theme & session management',
    href: '/settings',
    keywords: ['settings', 'preferences', 'profile', 'theme', 'dark mode', 'account', 'devices', 'sessions'],
  },
]
