'use client'

import React from 'react'

/**
 * Bespoke StudySpace Vector Illustrations
 * Product-specific, clean, academic-focused, purple/charcoal palette.
 * Free of generic startup slop.
 */

// 1. Attendance Illustration: circular percentage ring + Present/Absent/Cancel pill controls
export function AttendanceIllustration({ className = '' }: { className?: string }) {
  return (
    <div className={`relative flex flex-col items-center justify-center p-6 rounded-3xl bg-linear-to-b from-white to-gray-50 dark:from-(--surface) dark:to-gray-900/60 border border-gray-200/90 dark:border-(--border-subtle) shadow-sm ${className}`}>
      {/* Background radial accent */}
      <div className="absolute inset-0 bg-radial from-violet-500/10 via-transparent to-transparent rounded-3xl pointer-events-none" />

      {/* SVG Ring */}
      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
          {/* Background Track */}
          <circle
            cx="60"
            cy="60"
            r="48"
            className="stroke-gray-200 dark:stroke-gray-800"
            strokeWidth="9"
            fill="none"
          />
          {/* Minimum Target Marker (75%) */}
          <circle
            cx="60"
            cy="60"
            r="48"
            stroke="currentColor"
            strokeWidth="9"
            strokeDasharray="2 300"
            strokeDashoffset="-226"
            className="text-amber-500 z-10"
            fill="none"
          />
          {/* Progress Arc (84.2%) */}
          <circle
            cx="60"
            cy="60"
            r="48"
            stroke="url(#attendanceGradient)"
            strokeWidth="9"
            strokeDasharray="301.6"
            strokeDashoffset="47.6"
            strokeLinecap="round"
            fill="none"
          />
          <defs>
            <linearGradient id="attendanceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black tracking-tight text-gray-900 dark:text-gray-100 font-mono">
            84.2%
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            +9.2% Above Target
          </span>
        </div>
      </div>

      {/* Direct Action Chips */}
      <div className="mt-4 grid grid-cols-3 gap-2 w-full max-w-xs text-center font-semibold text-xs">
        <div className="py-2 px-2.5 rounded-xl bg-emerald-600 text-white shadow-xs flex items-center justify-center gap-1.5 transition-transform hover:scale-102">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>Present</span>
        </div>
        <div className="py-2 px-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-1.5 transition-transform hover:scale-102">
          <svg className="w-3.5 h-3.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Absent</span>
        </div>
        <div className="py-2 px-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-1.5 transition-transform hover:scale-102">
          <span>Cancel</span>
        </div>
      </div>

      {/* Safety Buffer Indicator */}
      <div className="mt-3.5 px-3 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/50 border border-violet-200/60 dark:border-violet-800/50 text-[11px] text-violet-700 dark:text-violet-300 flex items-center gap-2">
        <span className="font-bold text-violet-600 dark:text-violet-400 font-mono">SAFE</span>
        <span className="text-gray-600 dark:text-gray-400">Can safely miss 2 classes without dropping under 75%</span>
      </div>
    </div>
  )
}

// 2. Timetable & AI Scanner Illustration: photo grid -> scanner laser -> extracted schedule cards
export function TimetableScannerIllustration({ className = '' }: { className?: string }) {
  return (
    <div className={`relative p-5 sm:p-6 rounded-3xl bg-linear-to-b from-white to-gray-50 dark:from-(--surface) dark:to-gray-900/60 border border-gray-200/90 dark:border-(--border-subtle) shadow-sm ${className}`}>
      {/* Scanner viewfinder brackets */}
      <div className="relative rounded-2xl border-2 border-dashed border-violet-400/50 dark:border-violet-600/50 p-4 bg-violet-50/20 dark:bg-violet-950/20 overflow-hidden">
        {/* Animated Laser Scan Line */}
        <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-violet-500 to-transparent top-1/2 -translate-y-1/2 shadow-lg shadow-violet-500/50 animate-pulse" />

        <div className="flex items-center justify-between pb-3 text-xs text-gray-500 dark:text-gray-400 border-b border-violet-200/40 dark:border-violet-800/40 font-mono">
          <span className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400 font-bold">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Routine Photo Scan
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
            5 Classes Detected
          </span>
        </div>

        {/* Extracted Class Slots */}
        <div className="space-y-2 mt-3">
          {[
            { subject: 'Operating Systems', code: 'CS204', time: '09:00 to 10:00 AM', room: 'Rm 304', color: 'border-l-violet-500' },
            { subject: 'Data Structures Lab', code: 'CS201L', time: '10:15 to 12:15 PM', room: 'Lab 2', color: 'border-l-emerald-500' },
            { subject: 'Computer Networks', code: 'CS205', time: '01:30 to 02:30 PM', room: 'Rm 402', color: 'border-l-pink-500' },
          ].map((slot, i) => (
            <div
              key={i}
              className={`p-2.5 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-200/70 dark:border-gray-700/60 ${slot.color} border-l-4 flex items-center justify-between shadow-2xs`}
            >
              <div>
                <strong className="text-xs text-gray-900 dark:text-gray-100 block">{slot.subject}</strong>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">{slot.room} · {slot.code}</span>
              </div>
              <span className="font-mono text-[10px] font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 px-2 py-0.5 rounded-md">
                {slot.time}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3.5 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
        <span>Instant verification &amp; 1-click weekly schedule import</span>
        <span className="font-semibold text-violet-600 dark:text-violet-400">Zero manual typing →</span>
      </div>
    </div>
  )
}

// 3. Timestamped Notes Illustration: video timeline + pinned timestamp pill + synced note card
export function StudyMediaNotesIllustration({ className = '' }: { className?: string }) {
  return (
    <div className={`p-5 sm:p-6 rounded-3xl bg-linear-to-b from-white to-gray-50 dark:from-(--surface) dark:to-gray-900/60 border border-gray-200/90 dark:border-(--border-subtle) shadow-sm space-y-4 ${className}`}>
      {/* Video Player Mock Header */}
      <div className="rounded-2xl bg-gray-900 p-3.5 text-white space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <strong className="font-medium text-xs text-gray-200">CS50: Lecture 5 (Data Structures)</strong>
          </div>
          <span className="font-mono text-[10px] text-gray-400">18:45 / 54:20</span>
        </div>

        {/* Video Scrubber Timeline */}
        <div className="relative w-full h-2 bg-gray-800 rounded-full cursor-pointer">
          <div className="h-full bg-violet-500 rounded-full w-1/3" />
          {/* Pinned Timestamp Dot */}
          <div className="absolute top-1/2 left-[35%] -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-violet-600 border-2 border-white shadow-md flex items-center justify-center cursor-pointer">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-0.5">
          <span>00:00</span>
          <span className="px-2 py-0.5 rounded-md bg-violet-900/80 text-violet-200 font-mono text-[10px] font-bold">
            03:30 Hash collision chaining
          </span>
          <span>54:20</span>
        </div>
      </div>

      {/* Connected Note Card */}
      <div className="relative pl-6 space-y-1.5 before:content-[''] before:absolute before:left-2 before:top-1 before:bottom-1 before:w-0.5 before:bg-violet-300 dark:before:bg-violet-700">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 text-xs font-mono font-bold">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Jump to 03:30</span>
        </div>
        <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">
          Hash collision resolution via linked-list chaining
        </h4>
        <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
          When multiple keys produce identical hash indices, items are appended to a linked list node at table[index]. Worst-case lookup degrades to O(N) if collisions concentrate.
        </p>
      </div>
    </div>
  )
}

// 4. Pomodoro Focus Illustration: timer dial + session count + streak badge
export function PomodoroIllustration({ className = '' }: { className?: string }) {
  return (
    <div className={`p-5 sm:p-6 rounded-3xl bg-linear-to-b from-white to-gray-50 dark:from-(--surface) dark:to-gray-900/60 border border-gray-200/90 dark:border-(--border-subtle) shadow-sm flex flex-col items-center justify-center ${className}`}>
      {/* Circular Timer Progress */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="50"
            className="stroke-gray-200 dark:stroke-gray-800"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="60"
            cy="60"
            r="50"
            stroke="url(#pomoGradient)"
            strokeWidth="8"
            strokeDasharray="314.15"
            strokeDashoffset="78.5"
            strokeLinecap="round"
            fill="none"
          />
          <defs>
            <linearGradient id="pomoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-mono text-3xl font-black text-gray-900 dark:text-gray-100">
            18:42
          </span>
          <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 tracking-wider uppercase mt-0.5">
            Focus Block
          </span>
        </div>
      </div>

      {/* Session Progress Indicator */}
      <div className="mt-4 flex items-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`w-2.5 h-2.5 rounded-full ${
              s <= 3
                ? 'bg-violet-600 dark:bg-violet-400 ring-2 ring-violet-300 dark:ring-violet-800'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1.5 font-medium">
          Session 3 of 4
        </span>
      </div>

      <div className="mt-3 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
        Today: 2h 45m Focused Study Logged
      </div>
    </div>
  )
}

// 5. Academic Vault Illustration: stacked documents with course labels & PDF previews
export function AcademicVaultIllustration({ className = '' }: { className?: string }) {
  return (
    <div className={`p-5 sm:p-6 rounded-3xl bg-linear-to-b from-white to-gray-50 dark:from-(--surface) dark:to-gray-900/60 border border-gray-200/90 dark:border-(--border-subtle) shadow-sm space-y-3 ${className}`}>
      <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800 text-xs">
        <span className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
          <svg className="w-4 h-4 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Academic Vault
        </span>
        <span className="text-[10px] text-gray-400 font-mono">12 Documents</span>
      </div>

      <div className="space-y-2">
        {[
          { title: 'CS204_Syllabus_2026.pdf', size: '1.2 MB', course: 'OS', badge: 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300' },
          { title: 'Lecture_04_Virtual_Memory.pdf', size: '4.8 MB', course: 'OS', badge: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300' },
          { title: 'Midterm_2025_Solved_Paper.pdf', size: '2.1 MB', course: 'DS', badge: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' },
        ].map((doc, idx) => (
          <div
            key={idx}
            className="p-3 rounded-2xl bg-white dark:bg-gray-800/70 border border-gray-200/80 dark:border-gray-700/60 flex items-center justify-between shadow-2xs hover:border-violet-400 transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-mono text-[10px] font-bold shrink-0">
                PDF
              </span>
              <div className="min-w-0">
                <strong className="text-xs text-gray-900 dark:text-gray-100 truncate block">
                  {doc.title}
                </strong>
                <span className="text-[10px] text-gray-400">{doc.size}</span>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${doc.badge}`}>
              {doc.course}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// 6. Analytics Heatmap Illustration: multi-week consistency matrix + detail glass tooltip
export function AnalyticsHeatmapIllustration({ className = '' }: { className?: string }) {
  // 5 weeks x 7 days sample activity
  const weeks = [
    [1, 2, 3, 4, 3, 2, 1],
    [2, 3, 4, 4, 3, 1, 3],
    [3, 4, 4, 3, 4, 2, 2],
    [2, 4, 3, 4, 4, 3, 4],
    [3, 4, 4, 4, 3, 2, 4],
  ]

  return (
    <div className={`p-5 sm:p-6 rounded-3xl bg-linear-to-b from-white to-gray-50 dark:from-(--surface) dark:to-gray-900/60 border border-gray-200/90 dark:border-(--border-subtle) shadow-sm space-y-4 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider block">Consistency Matrix</span>
          <strong className="text-sm font-bold text-gray-900 dark:text-gray-100">Semester Activity Heatmap</strong>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-violet-50 dark:bg-violet-950/60 border border-violet-200/60 dark:border-violet-800/60 text-[10px] font-bold text-violet-700 dark:text-violet-300 font-mono">
          🔥 14-Day Streak
        </span>
      </div>

      {/* Heatmap Grid */}
      <div className="space-y-1.5">
        <div className="grid grid-cols-7 gap-1.5 text-center text-[9px] text-gray-400 font-mono">
          <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
        </div>
        {weeks.map((week, wIdx) => (
          <div key={wIdx} className="grid grid-cols-7 gap-1.5">
            {week.map((level, dIdx) => (
              <div
                key={dIdx}
                className={`aspect-square rounded-lg transition-transform hover:scale-110 cursor-pointer ${
                  level === 4
                    ? 'bg-violet-600 dark:bg-violet-500 shadow-2xs'
                    : level === 3
                    ? 'bg-violet-400 dark:bg-violet-600/75'
                    : level === 2
                    ? 'bg-violet-300 dark:bg-violet-800/60'
                    : 'bg-violet-100 dark:bg-violet-950/50'
                }`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Interactive Inspection Glass Panel */}
      <div className="p-3 rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-violet-200/80 dark:border-violet-800/70 shadow-sm flex items-center justify-between text-xs backdrop-blur-xs">
        <div>
          <span className="text-[10px] text-gray-400 font-mono block">Thursday, Sep 18</span>
          <strong className="text-gray-900 dark:text-gray-100 text-xs">3h 45m Focused Study</strong>
        </div>
        <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
          4 of 4 Classes Attended
        </span>
      </div>
    </div>
  )
}
