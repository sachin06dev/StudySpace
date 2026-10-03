'use client'

import React, { useState } from 'react'
import type { Semester } from '@/lib/data/semesters'
import type { Subject } from '@/lib/data/subjects'
import type { TimetableSlotWithSubject, TimetableException } from '@/lib/data/timetable'
import TimetableGrid from './TimetableGrid'
import SemesterSelectorModal from './SemesterSelectorModal'
import ScanTimetableModal from './ScanTimetableModal'

interface TimetableClientViewProps {
  semesters: Semester[]
  activeSemester: Semester | null
  slots: TimetableSlotWithSubject[]
  subjects: Subject[]
  exceptions: TimetableException[]
}

export default function TimetableClientView({
  semesters,
  activeSemester,
  slots,
  subjects,
  exceptions,
}: TimetableClientViewProps) {
  const [isSemesterModalOpen, setIsSemesterModalOpen] = useState(false)
  const [isScanModalOpen, setIsScanModalOpen] = useState(false)

  return (
    <div className="space-y-6">
      {/* Top Header / Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
            Class Timetable
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Manage your weekly schedule, classes, and daily timetable.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeSemester && (
            <button
              type="button"
              onClick={() => setIsSemesterModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{activeSemester.name}</span>
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsSemesterModalOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Semesters
          </button>
        </div>
      </div>

      {/* Main Content */}
      {!activeSemester ? (
        /* Empty State: No active semester */
        <div className="text-center py-16 px-6 bg-white/80 dark:bg-(--surface)/80 backdrop-blur-md rounded-2xl border border-gray-200/80 dark:border-(--border-subtle) shadow-2xs max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
              No Active Semester Selected
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Create your semester and add your recurring weekly classes to start tracking your daily attendance and bunk allowances.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsScanModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-xs transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
              <span>Scan Timetable Photo (AI)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSemesterModalOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              + Create Semester Manually
            </button>
          </div>
        </div>
      ) : (
        /* Active Semester Timetable Grid */
        <TimetableGrid
          semester={activeSemester}
          slots={slots}
          subjects={subjects}
          exceptions={exceptions}
          onOpenScanModal={() => setIsScanModalOpen(true)}
        />
      )}

      {/* Global Modals */}
      <SemesterSelectorModal
        isOpen={isSemesterModalOpen}
        onClose={() => setIsSemesterModalOpen(false)}
        semesters={semesters}
        activeSemesterId={activeSemester?.id}
      />

      <ScanTimetableModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        existingSemesters={semesters}
        currentActiveSemesterId={activeSemester?.id}
      />
    </div>
  )
}
