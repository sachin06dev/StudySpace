'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { Calendar, Plus, ChevronDown, GraduationCap } from 'lucide-react'
import type { Semester } from '@/lib/data/semesters'
import type { Subject } from '@/lib/data/subjects'
import type {
  OverallAttendanceSummary,
  SubjectAttendanceSummary,
} from '@/lib/attendance/calculations'
import type { ResolvedClass } from '@/lib/attendance/resolution'
import { resolveClassesForDate } from '@/lib/attendance/resolution'
import type { AttendanceRecordWithSubject } from '@/lib/data/attendance'
import type { TimetableSlot, TimetableException } from '@/lib/data/timetable'
import OverallAttendanceCard from './OverallAttendanceCard'
import TodayClassesCard from './TodayClassesCard'
import SubjectAttendanceCard from './SubjectAttendanceCard'
import AttendanceHistoryList from './AttendanceHistoryList'
import WeekDateStrip from '@/components/shared/WeekDateStrip'
import SemesterSelectorModal from '@/components/timetable/SemesterSelectorModal'

interface AttendanceClientViewProps {
  semesters: Semester[]
  activeSemester: Semester | null
  todayDate: string
  todayClasses: ResolvedClass[]
  overallSummary: OverallAttendanceSummary | null
  subjectSummaries: SubjectAttendanceSummary[]
  records: AttendanceRecordWithSubject[]
  subjects: Subject[]
  slots?: TimetableSlot[]
  exceptions?: TimetableException[]
}

export default function AttendanceClientView({
  semesters,
  activeSemester,
  todayDate,
  todayClasses,
  overallSummary,
  subjectSummaries,
  records,
  subjects,
  slots = [],
  exceptions = [],
}: AttendanceClientViewProps) {
  const [selectedDate, setSelectedDate] = useState<string>(todayDate)
  const [isSemesterModalOpen, setIsSemesterModalOpen] = useState(false)

  // Compute active dates with scheduled classes for the date strip
  const datesWithClasses = useMemo(() => {
    const dates = new Set<string>()
    if (!activeSemester || slots.length === 0) return dates

    const activeDays = new Set(slots.map((s) => s.day_of_week))

    // Check surrounding 60 days
    const baseDate = new Date(selectedDate)
    for (let i = -30; i <= 30; i++) {
      const d = new Date(baseDate)
      d.setDate(baseDate.getDate() + i)
      const dateStr = d.toISOString().split('T')[0]

      if (dateStr >= activeSemester.start_date && dateStr <= activeSemester.end_date) {
        const jsDay = d.getDay()
        const isoDay = (jsDay + 6) % 7
        if (activeDays.has(isoDay)) {
          dates.add(dateStr)
        }
      }
    }
    return dates
  }, [activeSemester, slots, selectedDate])

  // Resolve classes for currently selected date
  const resolvedClassesForSelectedDate = useMemo(() => {
    if (selectedDate === todayDate && todayClasses.length > 0) {
      return todayClasses
    }
    if (!activeSemester) return []

    return resolveClassesForDate({
      date: selectedDate,
      semester: activeSemester,
      slots,
      subjects,
      exceptions,
      records,
    })
  }, [selectedDate, todayDate, todayClasses, activeSemester, slots, subjects, exceptions, records])

  return (
    <div className="space-y-6">
      {/* Top Bar: Title, active semester pill, and quick links */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-gray-100 dark:border-gray-800/80">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">
            Attendance Hub
          </span>
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
            Class Attendance & Standing
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Track daily attendance, compute safe bunk allowances, and maintain academic standing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeSemester ? (
            <button
              type="button"
              onClick={() => setIsSemesterModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{activeSemester.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsSemesterModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors cursor-pointer shadow-xs"
            >
              Select Semester
            </button>
          )}

          <Link
            href="/timetable"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-purple-500" />
            <span>Timetable</span>
          </Link>
        </div>
      </div>

      {!activeSemester ? (
        /* Empty State */
        <div className="text-center py-16 px-6 bg-white/90 dark:bg-(--surface)/90 backdrop-blur-md rounded-3xl border border-gray-200/80 dark:border-(--border-subtle) shadow-2xs max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs">
            <GraduationCap className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
              No Active Semester
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Please activate an academic semester to track attendance, calculate safe bunk allowances, and view course metrics.
            </p>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsSemesterModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              Setup Semester
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1. Overall Standing Card */}
          {overallSummary && (
            <OverallAttendanceCard
              summary={overallSummary}
              semesterName={activeSemester.name}
            />
          )}

          {/* 2. Interactive Navigation: Horizontal Week Date Strip */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Week Schedule & Classes
              </span>
              <span className="text-[11px] text-gray-400 dark:text-gray-500">
                Selected: {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>

            <WeekDateStrip
              selectedDate={selectedDate}
              onSelectDate={(date) => setSelectedDate(date)}
              datesWithClasses={datesWithClasses}
            />
          </div>

          {/* 3. Daily Schedule Timeline for the Selected Date */}
          <TodayClassesCard
            semesterId={activeSemester.id}
            date={selectedDate}
            todayClasses={resolvedClassesForSelectedDate}
          />

          {/* 4. Subject Standing Section Header */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                  Subject Standing & Bunk Allowances
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Individual course targets, safe bunks, and required recovery classes
                </p>
              </div>

              <Link
                href="/timetable"
                className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add / Manage Courses</span>
              </Link>
            </div>

            {subjectSummaries.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-white/50 dark:bg-gray-900/30">
                <p className="text-xs text-gray-500">
                  No courses added to this semester yet.
                </p>
                <Link
                  href="/timetable"
                  className="mt-3 inline-block px-3.5 py-1.5 text-xs font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors shadow-xs"
                >
                  Add Classes in Timetable
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjectSummaries.map((summary) => (
                  <SubjectAttendanceCard key={summary.subject.id} summary={summary} />
                ))}
              </div>
            )}
          </div>

          {/* 5. Historical Record Log */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800/80">
            <AttendanceHistoryList
              records={records}
              subjects={subjects}
            />
          </div>
        </div>
      )}

      {/* Semester Selector Modal */}
      <SemesterSelectorModal
        isOpen={isSemesterModalOpen}
        onClose={() => setIsSemesterModalOpen(false)}
        semesters={semesters}
        activeSemesterId={activeSemester?.id}
      />
    </div>
  )
}
