'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { Clock, MapPin, User, CheckCircle2, XCircle, ArrowRight, Sparkles } from 'lucide-react'
import type { ResolvedClass } from '@/lib/attendance/resolution'
import type { AttendanceStatus } from '@/lib/data/attendance'
import { markAttendanceAction } from '@/lib/actions/attendance'
import { StatusPill } from '@/components/ui/StatusPill'
import { Button } from '@/components/ui/Button'

interface NextClassCardProps {
  nextClass: ResolvedClass | null
  todayDate: string
  semesterId: string | null
  hasActiveSemester: boolean
  remainingClassesCount?: number
}

export function NextClassCard({
  nextClass,
  todayDate,
  semesterId,
  hasActiveSemester,
  remainingClassesCount = 0,
}: NextClassCardProps) {
  const [isPending, startTransition] = useTransition()
  const [markedStatus, setMarkedStatus] = useState<AttendanceStatus | null>(
    nextClass?.attendanceStatus || null
  )

  if (!hasActiveSemester || !semesterId) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-purple-200/70 dark:border-(--border-subtle) bg-gradient-to-br from-purple-50/70 via-white to-purple-50/30 dark:from-purple-950/20 dark:via-(--surface) dark:to-purple-950/10 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-md">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300">
              <Sparkles className="w-3 h-3" />
              <span>Timetable Onboarding</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              Start Tracking Your Classes
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Set up your semester schedule or scan a timetable photo to get smart bunk allowances and daily class reminders.
            </p>
          </div>
          <Link href="/timetable" className="shrink-0 max-w-full">
            <Button variant="primary" size="md" className="w-full sm:w-auto shrink-0">
              <span>Setup Timetable</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!nextClass) {
    return (
      <div className="rounded-3xl border border-gray-200/80 dark:border-(--border-subtle) bg-white/90 dark:bg-(--surface)/90 backdrop-blur-md p-6 sm:p-7 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>All Clear Today</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              No Upcoming Classes Today
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              You&apos;re completely caught up on your scheduled classes for today. Great time for deep focus or catching up on tasks.
            </p>
          </div>
          <Link href="/timetable" className="shrink-0 max-w-full">
            <Button variant="outline" size="sm" className="shrink-0 whitespace-nowrap text-xs">
              View Timetable →
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleMark = (status: AttendanceStatus) => {
    setMarkedStatus(status)
    startTransition(async () => {
      await markAttendanceAction({
        semesterId,
        subjectId: nextClass.subjectId,
        timetableSlotId: nextClass.slotId,
        classDate: todayDate,
        startTime: nextClass.startTime,
        endTime: nextClass.endTime,
        status,
      })
    })
  }

  const formatTime = (t: string) => t.slice(0, 5)

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 dark:border-(--border-subtle) bg-white/95 dark:bg-(--surface)/95 backdrop-blur-md p-6 sm:p-7 shadow-2xs space-y-5">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300">
            Next Class
          </span>
          {remainingClassesCount > 1 && (
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
              • {remainingClassesCount} classes left today
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-[var(--surface-raised)] text-gray-700 dark:text-[var(--text-secondary)] border border-transparent dark:border-[var(--border-subtle)]">
            <Clock className="w-3 h-3 text-purple-500" />
            <span>{formatTime(nextClass.startTime)} - {formatTime(nextClass.endTime)}</span>
          </span>
        </div>
      </div>

      {/* Main Course Hero */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-[var(--text-primary)] tracking-tight">
            {nextClass.subjectName}
          </h2>
          {nextClass.subjectCode && (
            <span className="text-xs font-bold text-gray-400 dark:text-[var(--text-muted)]">
              {nextClass.subjectCode}
            </span>
          )}
        </div>

        {/* Room & Faculty Details */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-600 dark:text-[var(--text-muted)]">
          {nextClass.room && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-purple-500 shrink-0" />
              <span className="font-semibold text-gray-900 dark:text-[var(--text-primary)]">Room {nextClass.room}</span>
            </div>
          )}
          {nextClass.faculty && (
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{nextClass.faculty}</span>
            </div>
          )}
          <span className="capitalize text-[11px] font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-[var(--surface-raised)] text-gray-600 dark:text-[var(--text-muted)] border border-transparent dark:border-[var(--border-subtle)]">
            {nextClass.classType}
          </span>
        </div>
      </div>

      {/* Primary Attendance Action Row */}
      <div className="pt-1 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 dark:border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          {markedStatus === 'present' ? (
            <div className="flex items-center gap-2">
              <StatusPill status="present" size="md" />
              <button
                type="button"
                onClick={() => handleMark('absent')}
                disabled={isPending}
                className="text-[11px] font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 underline cursor-pointer"
              >
                Change to absent
              </button>
            </div>
          ) : markedStatus === 'absent' ? (
            <div className="flex items-center gap-2">
              <StatusPill status="absent" size="md" />
              <button
                type="button"
                onClick={() => handleMark('present')}
                disabled={isPending}
                className="text-[11px] font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 underline cursor-pointer"
              >
                Change to present
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => handleMark('present')}
                disabled={isPending}
                className="font-bold cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                <span>Mark Present</span>
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => handleMark('absent')}
                disabled={isPending}
                className="text-gray-600 dark:text-gray-300 cursor-pointer"
              >
                <XCircle className="w-4 h-4 mr-1.5 text-rose-500" />
                <span>Mark Absent</span>
              </Button>
            </div>
          )}
        </div>

        <Link
          href={`/attendance/${nextClass.subjectId}`}
          className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 inline-flex items-center gap-1 group"
        >
          <span>Course Standing</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  )
}

export default NextClassCard
