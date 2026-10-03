'use client'

import React, { useTransition, useState } from 'react'
import Link from 'next/link'
import type { DashboardAttendanceData } from '@/lib/data/dashboardAttendance'
import type { AttendanceStatus } from '@/lib/data/attendance'
import { markAttendanceAction } from '@/lib/actions/attendance'

interface DashboardAttendanceCardProps {
  data: DashboardAttendanceData
}

export default function DashboardAttendanceCard({ data }: DashboardAttendanceCardProps) {
  const [isPending, startTransition] = useTransition()
  const [localStatuses, setLocalStatuses] = useState<Record<string, AttendanceStatus>>({})

  if (!data.hasActiveSemester || !data.semester) {
    return (
      <div className="p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-white dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100">
              Track Your Daily Attendance & Timetable
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Set up your semester or scan your schedule photo to see today&apos;s classes and bunk allowances.
            </p>
          </div>
        </div>

        <Link
          href="/timetable"
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shrink-0 text-center"
        >
          Setup Timetable →
        </Link>
      </div>
    )
  }

  const { overallSummary, nextClass, mostAtRiskSubject, todayClasses, semester, todayDate } = data

  const handleQuickMark = (
    classItem: typeof todayClasses[0],
    status: AttendanceStatus
  ) => {
    setLocalStatuses((prev) => ({ ...prev, [classItem.id]: status }))
    startTransition(async () => {
      await markAttendanceAction({
        semesterId: semester.id,
        subjectId: classItem.subjectId,
        timetableSlotId: classItem.slotId,
        classDate: todayDate,
        startTime: classItem.startTime,
        endTime: classItem.endTime,
        status,
      })
    })
  }

  return (
    <div className="bg-white/90 dark:bg-(--surface)/90 backdrop-blur-md rounded-2xl border border-gray-200/80 dark:border-(--border-subtle) p-5 shadow-2xs space-y-4">
      {/* Top Header: Overall standing & quick link */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-(--border-subtle)">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
            {overallSummary ? `${overallSummary.overallPercentage}%` : '--'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Attendance & Classes
              </h3>
              {overallSummary && (
                <span
                  className={`px-2 py-0.2 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                    overallSummary.riskState === 'SAFE'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : overallSummary.riskState === 'WARNING'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                  }`}
                >
                  {overallSummary.riskState}
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {overallSummary?.statusMessage || 'Overall attendance target tracked'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/attendance"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline"
          >
            Attendance Hub →
          </Link>
        </div>
      </div>

      {/* Highlights: Next Class & At-Risk Subject */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Next Class */}
        <div className="p-3 bg-gray-50/70 dark:bg-gray-900/40 rounded-xl border border-gray-200/60 dark:border-gray-800/60 space-y-1">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
            Next Upcoming Class
          </span>
          {nextClass ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                  {nextClass.subjectName}
                </p>
                <p className="text-[11px] text-gray-500">
                  {nextClass.startTime.slice(0, 5)} {nextClass.room ? `• ${nextClass.room}` : ''}
                </p>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300">
                {nextClass.classType}
              </span>
            </div>
          ) : (
            <p className="text-xs text-gray-500">No more classes scheduled today</p>
          )}
        </div>

        {/* Most At-Risk Subject */}
        <div className="p-3 bg-gray-50/70 dark:bg-gray-900/40 rounded-xl border border-gray-200/60 dark:border-gray-800/60 space-y-1">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
            Most At-Risk Subject
          </span>
          {mostAtRiskSubject ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                  {mostAtRiskSubject.subject.name}
                </p>
                <p className="text-[11px] text-gray-500">
                  {mostAtRiskSubject.percentage}% (Target: {mostAtRiskSubject.targetPercentage}%)
                </p>
              </div>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                  mostAtRiskSubject.riskState === 'CRITICAL'
                    ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                    : mostAtRiskSubject.riskState === 'WARNING'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                }`}
              >
                {mostAtRiskSubject.riskState}
              </span>
            </div>
          ) : (
            <p className="text-xs text-gray-500">All subjects in good standing</p>
          )}
        </div>
      </div>

      {/* Today's Classes List with One-Tap Attendance */}
      {todayClasses.length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
            Today&apos;s Classes ({todayClasses.length})
          </span>
          <div className="space-y-2">
            {todayClasses.map((c) => {
              const currentStatus = localStatuses[c.id] !== undefined ? localStatuses[c.id] : c.attendanceStatus

              return (
                <div
                  key={c.id}
                  className="p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-900/20 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 dark:text-gray-100">
                        {c.startTime.slice(0, 5)}
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {c.subjectName}
                      </span>
                      {c.room && <span className="text-[10px] text-gray-500">({c.room})</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleQuickMark(c, 'present')}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                        currentStatus === 'present'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50'
                      }`}
                    >
                      ✓ Present
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleQuickMark(c, 'absent')}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                        currentStatus === 'absent'
                          ? 'bg-red-600 text-white'
                          : 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 border border-red-200/50 dark:border-red-800/50'
                      }`}
                    >
                      ✕ Absent
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
