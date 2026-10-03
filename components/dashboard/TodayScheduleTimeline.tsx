'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { MapPin, CheckCircle2, XCircle, ArrowRight, Calendar } from 'lucide-react'
import type { ResolvedClass } from '@/lib/attendance/resolution'
import type { AttendanceStatus } from '@/lib/data/attendance'
import { markAttendanceAction } from '@/lib/actions/attendance'
import { StatusPill } from '@/components/ui/StatusPill'

interface TodayScheduleTimelineProps {
  todayClasses: ResolvedClass[]
  todayDate: string
  semesterId: string | null
}

export function TodayScheduleTimeline({
  todayClasses,
  todayDate,
  semesterId,
}: TodayScheduleTimelineProps) {
  const [isPending, startTransition] = useTransition()
  const [localStatuses, setLocalStatuses] = useState<Record<string, AttendanceStatus>>({})

  const handleMark = (
    item: ResolvedClass,
    status: AttendanceStatus
  ) => {
    if (!semesterId) return
    setLocalStatuses((prev) => ({ ...prev, [item.id]: status }))
    startTransition(async () => {
      await markAttendanceAction({
        semesterId,
        subjectId: item.subjectId,
        timetableSlotId: item.slotId,
        classDate: todayDate,
        startTime: item.startTime,
        endTime: item.endTime,
        status,
      })
    })
  }

  const formatTime = (t: string) => t.slice(0, 5)

  return (
    <div className="bg-white/90 dark:bg-(--surface)/90 backdrop-blur-md rounded-3xl border border-gray-200/80 dark:border-(--border-subtle) p-5 sm:p-6 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-(--border-subtle)">
        <div className="flex items-center gap-2 min-w-0">
          <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
          <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 tracking-tight truncate">
            Today&apos;s Schedule
          </h3>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-(--surface-raised) text-gray-600 dark:text-gray-400 shrink-0">
            {todayClasses.length} {todayClasses.length === 1 ? 'class' : 'classes'}
          </span>
        </div>

        <Link
          href="/timetable"
          className="shrink-0 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 inline-flex items-center gap-1 group whitespace-nowrap"
        >
          <span>View Timetable</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Classes List */}
      {todayClasses.length === 0 ? (
        <div className="py-10 text-center space-y-2">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            No classes scheduled for today.
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
            Your daily timetable is clear. You can review your weekly schedule or plan ahead.
          </p>
          <div className="pt-2">
            <Link
              href="/timetable"
              className="inline-block text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
            >
              Open Timetable →
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {todayClasses.map((c) => {
            const currentStatus = localStatuses[c.id] !== undefined
              ? localStatuses[c.id]
              : c.attendanceStatus

            return (
              <div
                key={c.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-gray-100 dark:border-(--border-subtle) hover:border-purple-200 dark:hover:border-purple-900/60 bg-gray-50/50 dark:bg-(--surface-raised)/40 hover:bg-white dark:hover:bg-(--surface-raised) transition-all"
              >
                {/* Left: Time + Details */}
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="flex flex-col items-center justify-center w-14 py-1.5 rounded-xl bg-white dark:bg-[var(--surface-elevated)] border border-gray-200/60 dark:border-[var(--border-subtle)] shrink-0 text-center">
                    <span className="text-xs font-black text-gray-900 dark:text-[var(--text-primary)] leading-tight">
                      {formatTime(c.startTime)}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-[var(--text-muted)] font-medium">
                      {formatTime(c.endTime)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/attendance/${c.subjectId}`}
                        className="text-xs sm:text-sm font-bold text-gray-900 dark:text-[var(--text-primary)] hover:text-[var(--accent)] dark:hover:text-[var(--accent)] transition-colors"
                      >
                        {c.subjectName}
                      </Link>
                      {c.subjectCode && (
                        <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                          {c.subjectCode}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-gray-500 dark:text-gray-400">
                      {c.room && (
                        <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
                          <MapPin className="w-3 h-3 text-purple-500" />
                          {c.room}
                        </span>
                      )}
                      {c.faculty && <span>{c.faculty}</span>}
                      <span className="capitalize">{c.classType}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Status Pill & Quick Action */}
                <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800/60">
                  {currentStatus ? (
                    <div className="flex items-center gap-1.5">
                      <StatusPill status={currentStatus} size="sm" />
                      <button
                        type="button"
                        onClick={() => handleMark(c, currentStatus === 'present' ? 'absent' : 'present')}
                        disabled={isPending}
                        title={`Toggle to ${currentStatus === 'present' ? 'absent' : 'present'}`}
                        className="text-[10px] text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 font-semibold px-1.5 py-0.5 cursor-pointer"
                      >
                        Toggle
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleMark(c, 'present')}
                        disabled={isPending}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/50 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Present</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMark(c, 'absent')}
                        disabled={isPending}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/50 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Absent</span>
                      </button>
                    </div>
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

export default TodayScheduleTimeline
