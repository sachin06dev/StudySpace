'use client'

import React, { useTransition, useState } from 'react'
import type { ResolvedClass } from '@/lib/attendance/resolution'
import type { AttendanceStatus } from '@/lib/data/attendance'
import { markAttendanceAction } from '@/lib/actions/attendance'
import {
  cancelTimetableExceptionAction,
  deleteTimetableExceptionAction,
  restoreTimetableExceptionAction,
} from '@/lib/actions/timetable'

interface TodayClassesCardProps {
  semesterId: string
  date: string // YYYY-MM-DD
  todayClasses: ResolvedClass[]
}

export default function TodayClassesCard({
  semesterId,
  date,
  todayClasses,
}: TodayClassesCardProps) {
  const [isPending, startTransition] = useTransition()
  const [localStatuses, setLocalStatuses] = useState<Record<string, AttendanceStatus>>({})
  const [activeSlotIdPending, setActiveSlotIdPending] = useState<string | null>(null)

  const handleCancelExtra = (c: ResolvedClass) => {
    if (!c.isExtra) return
    const exId = c.id.replace('extra_', '')

    setActiveSlotIdPending(c.id)
    startTransition(async () => {
      await cancelTimetableExceptionAction(exId, 'Class cancelled')
      setActiveSlotIdPending(null)
    })
  }

  const handleDeleteExtra = (c: ResolvedClass) => {
    if (!c.isExtra) return
    if (!confirm('Are you sure you want to delete this extra class?')) return
    const exId = c.id.replace('extra_', '')

    setActiveSlotIdPending(c.id)
    startTransition(async () => {
      await deleteTimetableExceptionAction(exId)
      setActiveSlotIdPending(null)
    })
  }

  const handleRestoreExtra = (c: ResolvedClass) => {
    if (!c.isExtra) return
    const exId = c.id.replace('extra_', '')

    setActiveSlotIdPending(c.id)
    startTransition(async () => {
      await restoreTimetableExceptionAction(exId)
      setActiveSlotIdPending(null)
    })
  }

  const handleMark = (
    c: ResolvedClass,
    status: AttendanceStatus
  ) => {
    // Optimistically update local status
    setLocalStatuses((prev) => ({ ...prev, [c.id]: status }))
    setActiveSlotIdPending(c.id)

    startTransition(async () => {
      await markAttendanceAction({
        semesterId,
        subjectId: c.subjectId,
        timetableSlotId: c.slotId,
        classDate: date,
        startTime: c.startTime,
        endTime: c.endTime,
        status,
      })
      setActiveSlotIdPending(null)
    })
  }

  return (
    <div className="bg-white/90 dark:bg-(--surface)/90 backdrop-blur-md rounded-2xl border border-gray-200/80 dark:border-(--border-subtle) p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-(--border-subtle)">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Today&apos;s Schedule & Attendance
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              One-tap attendance marking for today&apos;s classes
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
          {todayClasses.length} {todayClasses.length === 1 ? 'class' : 'classes'}
        </span>
      </div>

      {todayClasses.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl space-y-2">
          <div className="w-10 h-10 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
            No classes scheduled for today!
          </p>
          <p className="text-[11px] text-gray-500">
            Enjoy your free day or work on your study tasks.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {todayClasses.map((c) => {
            const currentStatus = localStatuses[c.id] !== undefined ? localStatuses[c.id] : c.attendanceStatus
            const isItemPending = isPending && activeSlotIdPending === c.id

            return (
              <div
                key={c.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  currentStatus === 'present'
                    ? 'border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20'
                    : currentStatus === 'absent'
                    ? 'border-red-500/40 bg-red-50/40 dark:bg-red-950/20'
                    : currentStatus === 'cancelled'
                    ? 'border-gray-300 dark:border-gray-700 bg-gray-100/50 dark:bg-gray-800/30 opacity-75'
                    : 'border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/40 hover:border-indigo-200'
                }`}
              >
                {/* Left: Time & Subject Info */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                      {c.startTime.slice(0, 5)} - {c.endTime.slice(0, 5)}
                    </span>
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      {c.classType}
                    </span>
                    {c.isExtra && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        Extra
                      </span>
                    )}
                    {c.isRescheduled && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        Rescheduled
                      </span>
                    )}
                    {c.isCancelled && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                        Cancelled Exception
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                      {c.subjectName}
                    </h3>
                    {c.subjectCode && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({c.subjectCode})
                      </span>
                    )}
                  </div>

                  {(c.room || c.faculty) && (
                    <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
                      {c.room && <span>Room: {c.room}</span>}
                      {c.faculty && <span>Faculty: {c.faculty}</span>}
                    </div>
                  )}
                </div>

                {/* Right: Quick Action Attendance Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {c.isCancelled ? (
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200/80 dark:border-red-900/60">
                        {c.cancellationReason || 'Cancelled'}
                      </span>
                      {c.isExtra && (
                        <>
                          <button
                            type="button"
                            disabled={isItemPending}
                            onClick={() => handleRestoreExtra(c)}
                            title="Restore extra class to active state"
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
                          >
                            Restore
                          </button>
                          <button
                            type="button"
                            disabled={isItemPending}
                            onClick={() => handleDeleteExtra(c)}
                            title="Delete extra class record"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Present Button */}
                      <button
                        type="button"
                        disabled={isItemPending}
                        onClick={() => handleMark(c, 'present')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          currentStatus === 'present'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 border border-emerald-200/60 dark:border-emerald-800/60'
                        }`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Present</span>
                      </button>

                      {/* Absent Button */}
                      <button
                        type="button"
                        disabled={isItemPending}
                        onClick={() => handleMark(c, 'absent')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          currentStatus === 'absent'
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/50 border border-red-200/60 dark:border-red-800/60'
                        }`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Absent</span>
                      </button>

                      {c.isExtra ? (
                        <>
                          {/* Cancel Extra Class Button */}
                          <button
                            type="button"
                            disabled={isItemPending}
                            onClick={() => handleCancelExtra(c)}
                            title="Cancel this extra class (will not count toward totals)"
                            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200/60 dark:border-amber-800/60 transition-all cursor-pointer"
                          >
                            <span>Cancel</span>
                          </button>

                          {/* Delete Extra Class Button */}
                          <button
                            type="button"
                            disabled={isItemPending}
                            onClick={() => handleDeleteExtra(c)}
                            title="Delete this extra class"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      ) : (
                        /* Slot Cancelled Button */
                        <button
                          type="button"
                          disabled={isItemPending}
                          onClick={() => handleMark(c, 'cancelled')}
                          title="Class did not take place (does not count toward totals)"
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            currentStatus === 'cancelled'
                              ? 'bg-gray-700 text-white dark:bg-gray-600 shadow-xs'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <span>Cancelled</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
