'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  AttendanceIllustration,
  TimetableScannerIllustration,
  StudyMediaNotesIllustration,
  PomodoroIllustration,
  AcademicVaultIllustration,
  AnalyticsHeatmapIllustration,
} from './StudySpaceIllustrations'

interface FeatureDetail {
  id: string
  category: string
  title: string
  tagline: string
  description: string
  bulletPoints: string[]
  visualType: string
}

const FEATURES: FeatureDetail[] = [
  {
    id: 'dashboard',
    category: 'Daily Overview',
    title: 'Know what your day looks like at a glance.',
    tagline: 'See your next class, attendance, study time and tasks from one place.',
    description:
      'When you sit down to study, you shouldn\'t have to open four tabs just to know what you need to do. StudySpace brings together your upcoming class, today\'s timetable slots, attendance percentage, and priority tasks on one clean screen.',
    bulletPoints: [
      'Next class countdown with room number and professor',
      'Instant attendance health and threshold indicator',
      'Today\'s focused study hours and active streak',
      'Checklist for your immediate assignments and revision',
    ],
    visualType: 'dashboard',
  },
  {
    id: 'attendance',
    category: 'Attendance Tracking',
    title: 'Stay ahead of attendance.',
    tagline: 'Mark each class in seconds and see where you stand before attendance becomes a problem.',
    description:
      'Never wonder whether you can afford to miss a lecture. Mark classes Present, Absent, or Cancel an accidental tap. StudySpace calculates your exact percentage and tells you how many consecutive classes you need to attend to stay safely above your goal.',
    bulletPoints: [
      'Three direct actions: Present, Absent, and Cancel',
      'Safety alerts calculate classes needed for 75% or 85%',
      'Historical dates remain fully editable whenever you need',
      'Synchronized instantly between your laptop and your phone',
    ],
    visualType: 'attendance',
  },
  {
    id: 'timetable',
    category: 'Timetable & Schedule',
    title: 'Turn a timetable photo into your schedule.',
    tagline: 'Upload your campus routine image and let StudySpace extract your weekly classes.',
    description:
      'Setting up a semester routine shouldn\'t take hours of manual typing. Snap a photo of your printed college routine or upload an image. StudySpace reads the grid, identifies subjects, timings, classrooms, and creates your weekly schedule in moments.',
    bulletPoints: [
      'Upload a photo or screenshot of your university routine',
      'Automatic detection of courses, days, hours, and rooms',
      'Review and adjust any slot before confirming',
      'Immediately drives your daily schedule and next-class alerts',
    ],
    visualType: 'timetable',
  },
  {
    id: 'lectures',
    category: 'Course Lectures',
    title: 'Keep your lectures in one place.',
    tagline: 'Study video courses without algorithmic rabbit holes, ads, or distraction feeds.',
    description:
      'Organize your lecture playlists and tutorial series into dedicated course hubs. StudySpace strips away recommendation sidebars and chaotic comments so you can focus entirely on understanding course concepts.',
    bulletPoints: [
      'Save full course playlists or individual lecture videos',
      'Continue-watching progress remembers where you left off',
      'Organized lesson order indexed by subject',
      'Side-by-side study player with integrated note-taking',
    ],
    visualType: 'lectures',
  },
  {
    id: 'notes',
    category: 'Timestamped Notes',
    title: 'Take notes that remember where you learned them.',
    tagline: 'Pin exact concepts to precise video seconds for lightning revision before exams.',
    description:
      'Taking notes while watching lectures usually means losing the original context. With StudySpace, one click pins your note to that exact moment (e.g. 03:30). When you review weeks later, click the timestamp to jump straight to the explanation.',
    bulletPoints: [
      'One-click timestamp pinning synced to lecture playback',
      'Clicking any timestamp seeks the video directly to that second',
      'Formatted notes for formulas, definitions, and summaries',
      'Search your notes across all saved courses at exam time',
    ],
    visualType: 'notes',
  },
  {
    id: 'pomodoro',
    category: 'Focus Timer',
    title: 'Make focused study sessions easier.',
    tagline: 'Study in focused sessions and keep the time you spend learning visible.',
    description:
      'Beat procrastination with structured focus blocks. Whether you prefer classic 25-minute sprints or extended 50-minute focus blocks, StudySpace runs seamlessly in the background and automatically records your study minutes to your weekly progress.',
    bulletPoints: [
      'Customizable focus, short break, and long break durations',
      'Persistent timer follows you across all study tools',
      'Completed study time logs automatically to your analytics',
      'Builds real study streaks without manual time-tracking',
    ],
    visualType: 'pomodoro',
  },
  {
    id: 'tasks',
    category: 'Academic Tasks',
    title: 'Keep assignments and study work moving.',
    tagline: 'Prioritize assignments, lab submissions, and revision checklists by subject.',
    description:
      'Generic to-do apps lack academic context. StudySpace organizes tasks directly by course with high, medium, and low priority tags and clear due dates. Check items off from your dashboard as you complete them throughout the day.',
    bulletPoints: [
      'Priority flags with clear deadlines for assignments and labs',
      'Direct integration with your daily dashboard focus list',
      'Fast one-click completion toggles',
      'Keeps your semester priorities clear and manageable',
    ],
    visualType: 'tasks',
  },
  {
    id: 'vault',
    category: 'Academic Vault',
    title: 'Keep your study material close.',
    tagline: 'Store your course syllabus, lecture PDFs, and previous question papers.',
    description:
      'Never dig through messy download folders or lost chat messages right before class. Keep syllabus PDFs, professor slides, lab manuals, and exam question papers neatly organized by subject in your secure vault.',
    bulletPoints: [
      'Dedicated subject folders for PDFs and lecture slides',
      'Instant in-browser preview without downloading duplicates',
      'Organize question papers and revision blueprints together',
      'Access your documents on desktop or on the go on Android',
    ],
    visualType: 'vault',
  },
  {
    id: 'resources',
    category: 'Saved Resources',
    title: 'Save the resources you actually use.',
    tagline: 'Store official documentation, GitHub repositories, and study cheat sheets.',
    description:
      'Clean up your browser bookmarks. Store your go-to documentation links, interactive tools, and reference repositories organized by course so you can launch them with a single click during study sessions.',
    bulletPoints: [
      'Save web links with course tags and descriptive notes',
      'Quick-launch reference docs with one click',
      'Grouped logically alongside your lecture playlists',
      'Available everywhere you access your StudySpace',
    ],
    visualType: 'resources',
  },
  {
    id: 'analytics',
    category: 'Consistency & Analytics',
    title: 'See your progress, not just your plans.',
    tagline: 'Track attendance margins, weekly study hours, and your consistency heatmap.',
    description:
      'Real progress comes from regular consistency. StudySpace turns your daily study sessions into visual feedback. Check attendance safety margins across all subjects and inspect the consistency heatmap to review your learning momentum.',
    bulletPoints: [
      'Subject-by-subject attendance trends and safety buffers',
      'Interactive consistency heatmap with glass inspection details',
      'Total study hours and completed Pomodoro interval tallies',
      'Factual habit data based on real completed study work',
    ],
    visualType: 'analytics',
  },
]

export default function FeaturesSection() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <section id="features" className="py-20 md:py-28 scroll-mt-16 bg-gray-50/40 dark:bg-gray-950/40 border-b border-gray-200/80 dark:border-(--border-subtle) transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/60 border border-violet-200/60 dark:border-violet-800/60 text-xs font-semibold text-violet-700 dark:text-violet-300">
            <span>The StudySpace Experience</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Built for how students actually study.
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
            Every feature connects directly to your daily college routine. No fluff, no complicated setup, just clear academic clarity.
          </p>
        </div>

        {/* Sticky Glass Feature Rail */}
        <div className="sticky top-20 z-30 mb-16 py-2 px-3 rounded-2xl bg-white/85 dark:bg-(--surface)/85 backdrop-blur-md border border-gray-200/80 dark:border-(--border-subtle) shadow-xs max-w-4xl mx-auto overflow-x-auto select-none">
          <div className="flex items-center justify-start sm:justify-center gap-1 min-w-max">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'attendance', label: 'Attendance' },
              { id: 'timetable', label: 'Timetable' },
              { id: 'lectures', label: 'Study Media' },
              { id: 'notes', label: 'Notes' },
              { id: 'pomodoro', label: 'Focus' },
              { id: 'tasks', label: 'Tasks' },
              { id: 'vault', label: 'Vault' },
              { id: 'resources', label: 'Resources' },
              { id: 'analytics', label: 'Analytics' },
            ].map((tab) => (
              <a
                key={tab.id}
                href={`#feature-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-violet-600 text-white shadow-2xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                }`}
              >
                {tab.label}
              </a>
            ))}
          </div>
        </div>

        {/* 10 Feature Storytelling Sections */}
        <div className="space-y-24 md:space-y-32">
          {FEATURES.map((feature, index) => {
            const isEven = index % 2 === 0

            return (
              <div
                key={feature.id}
                id={`feature-${feature.id}`}
                className="scroll-mt-36 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center"
              >
                {/* Text Column */}
                <div
                  className={`lg:col-span-6 space-y-5 ${
                    isEven ? 'lg:order-1' : 'lg:order-2'
                  }`}
                >
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-violet-600 dark:text-violet-400 tracking-wider uppercase">
                      {feature.category}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight leading-snug">
                      {feature.title}
                    </h3>
                  </div>

                  <p className="text-sm sm:text-base font-semibold text-violet-700 dark:text-violet-300">
                    {feature.tagline}
                  </p>

                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>

                  <ul className="space-y-2.5 pt-2">
                    {feature.bulletPoints.map((point, ptIdx) => (
                      <li key={ptIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                        <span className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          ✓
                        </span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2">
                    <Link
                      href="/signup"
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 group"
                    >
                      <span>Try this in StudySpace</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                  </div>
                </div>

                {/* Visual Column */}
                <div
                  className={`lg:col-span-6 ${
                    isEven ? 'lg:order-2' : 'lg:order-1'
                  }`}
                >
                  <FeatureVisual visualType={feature.visualType} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function FeatureVisual({ visualType }: { visualType: string }) {
  // Feature 1: Dashboard
  if (visualType === 'dashboard') {
    return (
      <div className="rounded-3xl border border-gray-200/90 dark:border-(--border-subtle) bg-white dark:bg-(--surface) p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
            <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100">StudySpace Dashboard</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200/60 dark:border-emerald-800/60">
            Semester 4 Active
          </span>
        </div>

        {/* Next Class Alert Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-transparent border border-violet-200/70 dark:border-violet-800/60 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <strong className="text-gray-900 dark:text-gray-100">Operating Systems (CS204)</strong>
            </div>
            <span className="font-mono text-violet-600 dark:text-violet-400 font-bold text-[11px]">Starts in 25m</span>
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">
            Room 304 · Prof. Vance · Attendance: <strong className="text-violet-600 dark:text-violet-400 font-semibold">84%</strong>
          </p>
          <div className="grid grid-cols-3 gap-1.5 pt-1 text-center font-semibold text-[10px]">
            <div className="py-1.5 rounded-xl bg-emerald-600 text-white shadow-2xs">✓ Present</div>
            <div className="py-1.5 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">✕ Absent</div>
            <div className="py-1.5 rounded-xl bg-white dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700">Cancel</div>
          </div>
        </div>

        {/* Quick Dashboard Metrics */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200/70 dark:border-gray-800/60">
            <span className="text-[10px] text-gray-500 block">Today&apos;s Focus</span>
            <strong className="text-base font-extrabold text-violet-600 dark:text-violet-400">3h 15m</strong>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">4 Pomodoro sessions</span>
          </div>
          <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200/70 dark:border-gray-800/60">
            <span className="text-[10px] text-gray-500 block">Overall Attendance</span>
            <strong className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">84.2%</strong>
            <span className="text-[10px] text-gray-400 block mt-0.5">University target: 75%</span>
          </div>
        </div>
      </div>
    )
  }

  // Feature 2: Attendance
  if (visualType === 'attendance') {
    return <AttendanceIllustration />
  }

  // Feature 3: Timetable + Scanner
  if (visualType === 'timetable') {
    return <TimetableScannerIllustration />
  }

  // Feature 4: Lectures / Study Media
  if (visualType === 'lectures') {
    return (
      <div className="rounded-3xl border border-gray-200/90 dark:border-(--border-subtle) bg-white dark:bg-(--surface) p-5 sm:p-6 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800 text-xs">
          <span className="font-bold text-gray-900 dark:text-gray-100">CS50: Lecture 4 (Memory &amp; Pointers)</span>
          <span className="px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 text-[10px] font-bold">
            Distraction-Free
          </span>
        </div>

        {/* Video Player Mockup Frame */}
        <div className="relative aspect-video rounded-2xl bg-gradient-to-tr from-gray-950 via-slate-900 to-violet-950 flex flex-col justify-between p-3 border border-violet-900/40 text-white shadow-inner">
          <div className="flex justify-between text-[10px]">
            <span className="px-2 py-0.5 rounded bg-black/60 font-mono">1080p HD</span>
            <span className="px-2 py-0.5 rounded bg-violet-600/90 font-semibold">Study Mode</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center mx-auto text-white shadow-md">
            ▶
          </div>
          <div className="space-y-1">
            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="w-2/3 h-full bg-violet-500 rounded-full" />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-gray-300">
              <span>24:15</span>
              <span>42:00</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800/80">
            <span className="text-gray-400 block text-[9px]">Curated Playlist</span>
            <strong className="text-gray-900 dark:text-gray-100 truncate block">Algorithms &amp; Systems</strong>
          </div>
          <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800/80">
            <span className="text-gray-400 block text-[9px]">Course Progress</span>
            <strong className="text-emerald-600 dark:text-emerald-400 block">8 of 12 Watched (66%)</strong>
          </div>
        </div>
      </div>
    )
  }

  // Feature 5: Timestamped Notes
  if (visualType === 'notes') {
    return <StudyMediaNotesIllustration />
  }

  // Feature 6: Pomodoro Focus
  if (visualType === 'pomodoro') {
    return <PomodoroIllustration />
  }

  // Feature 7: Tasks
  if (visualType === 'tasks') {
    return (
      <div className="rounded-3xl border border-gray-200/90 dark:border-(--border-subtle) bg-white dark:bg-(--surface) p-5 sm:p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800 text-xs">
          <span className="font-bold text-gray-900 dark:text-gray-100">Course Milestones &amp; Tasks</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">3 of 4 Done</span>
        </div>

        <div className="space-y-2">
          {[
            { title: 'Submit OS Thread Synchronization Lab', due: 'Today 5:00 PM', priority: 'High', done: true, course: 'CS204' },
            { title: 'Revise B-Tree balancing before quiz', due: 'Tomorrow', priority: 'High', done: true, course: 'CS201' },
            { title: 'Complete Pomodoro Interval #5', due: 'Today', priority: 'Med', done: true, course: 'Study' },
            { title: 'Draft Literature Review for Project', due: 'Thursday', priority: 'Med', done: false, course: 'CS205' },
          ].map((task, i) => (
            <div
              key={i}
              className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                task.done
                  ? 'bg-gray-50/80 dark:bg-gray-900/40 border-gray-200/60 dark:border-gray-800/60 text-gray-400'
                  : 'bg-white dark:bg-gray-800/90 border-violet-200 dark:border-violet-900/60 text-gray-900 dark:text-gray-100 font-medium'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[9px] font-bold shrink-0 ${task.done ? 'bg-emerald-600 text-white' : 'border border-violet-400'}`}>
                  {task.done ? '✓' : ''}
                </span>
                <span className={`truncate ${task.done ? 'line-through' : ''}`}>{task.title}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="px-1.5 py-0.2 rounded bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 font-mono text-[9px]">
                  {task.course}
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-semibold ${
                  task.priority === 'High' ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}>
                  {task.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Feature 8: Academic Vault
  if (visualType === 'vault') {
    return <AcademicVaultIllustration />
  }

  // Feature 9: Saved Resources
  if (visualType === 'resources') {
    return (
      <div className="rounded-3xl border border-gray-200/90 dark:border-(--border-subtle) bg-white dark:bg-(--surface) p-5 sm:p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800 text-xs">
          <span className="font-bold text-gray-900 dark:text-gray-100">Curated Study Resources</span>
          <span className="text-violet-600 dark:text-violet-400 font-semibold text-[11px]">8 Links</span>
        </div>

        <div className="space-y-2">
          {[
            { title: 'Visualgo: Algorithm Visualizer', tag: 'Data Structures', url: 'visualgo.net' },
            { title: 'POSIX Threads Programming Guide', tag: 'Operating Systems', url: 'llnl.gov/computing' },
            { title: 'PostgreSQL Official Documentation', tag: 'Databases', url: 'postgresql.org/docs' },
          ].map((res, i) => (
            <div key={i} className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200/70 dark:border-gray-800/70 flex items-center justify-between gap-2 text-xs">
              <div className="min-w-0">
                <strong className="text-gray-900 dark:text-gray-100 block truncate">{res.title}</strong>
                <span className="text-[10px] text-gray-400 font-mono">{res.url}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 text-[9px] font-semibold shrink-0">
                {res.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Feature 10: Analytics
  if (visualType === 'analytics') {
    return <AnalyticsHeatmapIllustration />
  }

  return null
}
