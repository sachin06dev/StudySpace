'use client'

import React, { useState, useTransition, useMemo } from 'react'
import Link from 'next/link'
import type { Subject } from '@/lib/data/subjects'
import type { SubjectAttendanceSummary } from '@/lib/attendance/calculations'
import { calculateBunkAllowance, calculateRecoveryRequirement } from '@/lib/attendance/calculations'
import type { AttendanceRecordWithSubject, AttendanceStatus } from '@/lib/data/attendance'
import {
  markAttendanceAction,
  updateAttendanceRecordAction,
  deleteAttendanceRecordAction,
} from '@/lib/actions/attendance'
import { updateSubjectAction, archiveSubjectAction, deleteSubjectAction } from '@/lib/actions/subjects'
import { useRouter } from 'next/navigation'
import DonutGauge from '@/components/ui/DonutGauge'
import {
  ChevronLeft,
  Calendar,
  Clock,
  User,
  MapPin,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Layers,
  Sparkles,
} from 'lucide-react'

interface SubjectDetailClientViewProps {
  subject: Subject
  summary: SubjectAttendanceSummary
  records: AttendanceRecordWithSubject[]
  hasRealRecords: boolean
}

export default function SubjectDetailClientView({
  subject,
  summary,
  records,
  hasRealRecords,
}: SubjectDetailClientViewProps) {
  const [isPending, startTransition] = useTransition()
  const [isMarkingPast, setIsMarkingPast] = useState(false)
  const [isEditingSubject, setIsEditingSubject] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [historyFilter, setHistoryFilter] = useState<'all' | 'present' | 'absent' | 'cancelled'>('all')
  const [showSimulator, setShowSimulator] = useState(false)
  const [simAttend, setSimAttend] = useState(0)
  const [simMiss, setSimMiss] = useState(0)
  const router = useRouter()

  // Past record form state
  const [pastDate, setPastDate] = useState(new Date().toISOString().split('T')[0])
  const [pastStart, setPastStart] = useState('09:00')
  const [pastEnd, setPastEnd] = useState('10:00')
  const [pastStatus, setPastStatus] = useState<AttendanceStatus>('present')
  const [pastNotes, setPastNotes] = useState('')

  // Edit subject form state
  const [editName, setEditName] = useState(subject.name)
  const [editCode, setEditCode] = useState(subject.code || '')
  const [editFaculty, setEditFaculty] = useState(subject.faculty || '')
  const [editRoom, setEditRoom] = useState(subject.default_room || '')
  const [editTarget, setEditTarget] = useState(
    subject.target_percentage != null ? subject.target_percentage.toString() : '75'
  )
  const [editBaselineAttended, setEditBaselineAttended] = useState(
    subject.baseline_attended.toString()
  )
  const [editBaselineTotal, setEditBaselineTotal] = useState(
    subject.baseline_total.toString()
  )
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Simulator calculation
  const simResult = useMemo(() => {
    const nextAttended = summary.effectiveAttended + simAttend
    const nextTotal = summary.effectiveTotal + simAttend + simMiss
    const nextPct = nextTotal > 0 ? Math.round((nextAttended / nextTotal) * 1000) / 10 : 100
    const diff = Math.round((nextPct - summary.percentage) * 10) / 10
    const nextBunk = calculateBunkAllowance(nextAttended, nextTotal, summary.targetPercentage)
    const nextRecovery = calculateRecoveryRequirement(nextAttended, nextTotal, summary.targetPercentage)
    return {
      percentage: nextPct,
      diff,
      bunk: nextBunk,
      recovery: nextRecovery,
      isAbove: nextPct >= summary.targetPercentage,
    }
  }, [summary, simAttend, simMiss])

  const filteredRecords = useMemo(() => {
    if (historyFilter === 'all') return records
    return records.filter((r) => r.status === historyFilter)
  }, [records, historyFilter])

  const handleMarkPast = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    if (pastEnd <= pastStart) {
      setErrorMsg('End time must be after start time.')
      return
    }

    startTransition(async () => {
      const res = await markAttendanceAction({
        semesterId: subject.semester_id,
        subjectId: subject.id,
        classDate: pastDate,
        startTime: `${pastStart}:00`,
        endTime: `${pastEnd}:00`,
        status: pastStatus,
        notes: pastNotes.trim() || null,
      })

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to record attendance')
      } else {
        setIsMarkingPast(false)
        setPastNotes('')
      }
    })
  }

  const handleUpdateSubject = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    const targetNum = editTarget ? parseFloat(editTarget) : null
    const baseAttended = parseInt(editBaselineAttended, 10) || 0
    const baseTotal = parseInt(editBaselineTotal, 10) || 0

    if (baseAttended > baseTotal) {
      setErrorMsg('Baseline attended cannot exceed baseline total.')
      return
    }

    startTransition(async () => {
      const res = await updateSubjectAction(subject.id, {
        name: editName.trim(),
        code: editCode.trim() || null,
        faculty: editFaculty.trim() || null,
        defaultRoom: editRoom.trim() || null,
        targetPercentage: targetNum,
        baselineAttended: baseAttended,
        baselineTotal: baseTotal,
      })

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to update subject')
      } else {
        setIsEditingSubject(false)
      }
    })
  }

  const handleUpdateRecordStatus = (
    recordId: string,
    newStatus: AttendanceStatus
  ) => {
    startTransition(async () => {
      await updateAttendanceRecordAction(recordId, subject.id, { status: newStatus })
    })
  }

  const handleDeleteRecord = (recordId: string) => {
    if (!confirm('Are you sure you want to delete this session record?')) return
    startTransition(async () => {
      await deleteAttendanceRecordAction(recordId, subject.id)
    })
  }

  const riskBadgeStyle =
    summary.riskState === 'SAFE'
      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
      : summary.riskState === 'WARNING'
      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
      : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
        <Link
          href="/attendance"
          className="hover:text-[var(--foreground)] flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Attendance</span>
        </Link>
        <span className="opacity-40">/</span>
        <span className="font-semibold text-[var(--foreground)] truncate max-w-xs">{subject.name}</span>
      </div>

      {/* 2. Hero Academic Profile Card */}
      <section className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl p-5 sm:p-6 shadow-2xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Donut Gauge & Subject Summary */}
          <div className="flex items-start sm:items-center gap-5 sm:gap-6">
            <div className="shrink-0">
              <DonutGauge
                value={summary.percentage}
                target={summary.targetPercentage}
                size={116}
                strokeWidth={9}
                sublabel={`Goal ${summary.targetPercentage}%`}
              />
            </div>

            <div className="space-y-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)] truncate">
                  {subject.name}
                </h1>
                {subject.code && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[var(--foreground-muted)] uppercase tracking-wide">
                    {subject.code}
                  </span>
                )}
                <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border uppercase tracking-wider ${riskBadgeStyle}`}>
                  {summary.riskState}
                </span>
              </div>

              {/* Status Message */}
              <p className="text-xs text-[var(--foreground-muted)] flex items-center gap-1.5">
                {summary.riskState === 'SAFE' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : summary.riskState === 'WARNING' ? (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                )}
                <span>{summary.statusMessage}</span>
              </p>

              {/* Meta tags: Type, Faculty, Room */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[var(--foreground-muted)]">
                <span className="inline-flex items-center gap-1 capitalize">
                  <Layers className="w-3 h-3" />
                  <span>{subject.class_type}</span>
                </span>
                {subject.faculty && (
                  <span className="inline-flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{subject.faculty}</span>
                  </span>
                )}
                {subject.default_room && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{subject.default_room}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 shrink-0">
            <button
              type="button"
              onClick={() => setIsMarkingPast(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-study-600 hover:bg-study-700 active:scale-[0.98] rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Class</span>
            </button>

            <button
              type="button"
              onClick={() => setIsEditingSubject(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[var(--foreground)] bg-[var(--surface-raised)] hover:bg-[var(--surface-overlay)] border border-[var(--border-subtle)] rounded-xl transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-[var(--foreground-muted)]" />
              <span>Edit</span>
            </button>

            <button
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
              title="Archive or Delete Subject"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{hasRealRecords || subject.baseline_total > 0 ? 'Archive' : 'Delete'}</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-center justify-between">
            <span>{errorMsg}</span>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-xs hover:underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}
      </section>

      {/* 3. Four Core Academic Metrics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Effective Attendance */}
        <div className="p-4 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl space-y-1 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)] block">
            Classes Attended
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[var(--foreground)]">
              {summary.effectiveAttended}
            </span>
            <span className="text-xs text-[var(--foreground-muted)]">
              / {summary.effectiveTotal}
            </span>
          </div>
          <p className="text-[11px] text-[var(--foreground-muted)] pt-0.5">
            Live: {summary.presentCount}P · {summary.absentCount}A
          </p>
        </div>

        {/* Bunk Allowance */}
        <div className="p-4 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl space-y-1 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)] block">
            Bunk Allowance
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[var(--foreground)]">
              {summary.bunkAllowance >= 999 ? 'Unlimited' : summary.bunkAllowance}
            </span>
            {summary.bunkAllowance < 999 && (
              <span className="text-xs text-[var(--foreground-muted)]">classes</span>
            )}
          </div>
          <p className="text-[11px] text-[var(--foreground-muted)] pt-0.5">
            {summary.bunkAllowance > 0
              ? 'Can miss safely above target'
              : 'Zero margin to miss classes'}
          </p>
        </div>

        {/* Recovery Needed */}
        <div className="p-4 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl space-y-1 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)] block">
            Recovery Needed
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[var(--foreground)]">
              {summary.recoveryRequirement > 0 ? summary.recoveryRequirement : '0'}
            </span>
            <span className="text-xs text-[var(--foreground-muted)]">
              {summary.recoveryRequirement > 0 ? 'consecutive' : 'classes'}
            </span>
          </div>
          <p className="text-[11px] text-[var(--foreground-muted)] pt-0.5">
            {summary.recoveryRequirement > 0
              ? `To reach ${summary.targetPercentage}% target`
              : 'On track with target'}
          </p>
        </div>

        {/* Baseline Info */}
        <div className="p-4 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl space-y-1 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)] block">
            Baseline History
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[var(--foreground)]">
              {subject.baseline_attended}
            </span>
            <span className="text-xs text-[var(--foreground-muted)]">
              / {subject.baseline_total}
            </span>
          </div>
          <p className="text-[11px] text-[var(--foreground-muted)] pt-0.5">
            {subject.baseline_total > 0
              ? 'Migrated baseline records'
              : 'No prior baseline configured'}
          </p>
        </div>
      </section>

      {/* 4. What-If Attendance Simulator */}
      <section className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowSimulator(!showSimulator)}
            className="flex items-center gap-2 text-sm font-bold text-[var(--foreground)] hover:text-study-600 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-study-500" />
            <span>Attendance What-If Simulator</span>
            <span className="text-[11px] font-medium text-[var(--foreground-muted)]">
              {showSimulator ? '(Click to collapse)' : '(Simulate upcoming classes)'}
            </span>
          </button>

          {showSimulator && (simAttend > 0 || simMiss > 0) && (
            <button
              type="button"
              onClick={() => {
                setSimAttend(0)
                setSimMiss(0)
              }}
              className="text-xs text-study-600 dark:text-study-400 hover:underline cursor-pointer"
            >
              Reset Simulation
            </button>
          )}
        </div>

        {showSimulator && (
          <div className="pt-2 border-t border-[var(--border-subtle)] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Attend controls */}
            <div className="p-3 bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  Attend Next: +{simAttend}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSimAttend(Math.max(0, simAttend - 1))}
                    className="w-6 h-6 rounded bg-[var(--surface)] border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--surface-overlay)] cursor-pointer"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimAttend(simAttend + 1)}
                    className="w-6 h-6 rounded bg-[var(--surface)] border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--surface-overlay)] cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={15}
                value={simAttend}
                onChange={(e) => setSimAttend(parseInt(e.target.value, 10))}
                className="w-full accent-study-600"
              />
            </div>

            {/* Miss controls */}
            <div className="p-3 bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-rose-700 dark:text-rose-400">
                  Miss Next: +{simMiss}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSimMiss(Math.max(0, simMiss - 1))}
                    className="w-6 h-6 rounded bg-[var(--surface)] border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--surface-overlay)] cursor-pointer"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimMiss(simMiss + 1)}
                    className="w-6 h-6 rounded bg-[var(--surface)] border border-[var(--border-subtle)] text-xs font-bold hover:bg-[var(--surface-overlay)] cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={15}
                value={simMiss}
                onChange={(e) => setSimMiss(parseInt(e.target.value, 10))}
                className="w-full accent-rose-500"
              />
            </div>

            {/* Projected Result */}
            <div className="p-3 bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-xl flex flex-col justify-center">
              <span className="text-[10px] font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">
                Projected Percentage
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-black text-[var(--foreground)]">
                  {simResult.percentage}%
                </span>
                <span
                  className={`text-xs font-bold ${
                    simResult.diff > 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : simResult.diff < 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-[var(--foreground-muted)]'
                  }`}
                >
                  {simResult.diff > 0 ? `+${simResult.diff}%` : `${simResult.diff}%`}
                </span>
              </div>
              <p className="text-[10px] text-[var(--foreground-muted)] mt-1">
                Allowance: {simResult.bunk >= 999 ? '∞' : simResult.bunk} · Recovery:{' '}
                {simResult.recovery}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* 5. Class History Log */}
      <section className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
          <div>
            <h2 className="text-base font-bold text-[var(--foreground)]">
              Class History Log ({records.length})
            </h2>
            <p className="text-xs text-[var(--foreground-muted)]">
              Verified sessions recorded for this course
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setHistoryFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                historyFilter === 'all'
                  ? 'bg-study-600 text-white shadow-xs'
                  : 'text-[var(--foreground-muted)] hover:bg-[var(--surface-raised)]'
              }`}
            >
              All ({records.length})
            </button>
            <button
              type="button"
              onClick={() => setHistoryFilter('present')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                historyFilter === 'present'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 dark:text-emerald-400 hover:bg-[var(--surface-raised)]'
              }`}
            >
              Present ({summary.presentCount})
            </button>
            <button
              type="button"
              onClick={() => setHistoryFilter('absent')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                historyFilter === 'absent'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 dark:text-rose-400 hover:bg-[var(--surface-raised)]'
              }`}
            >
              Absent ({summary.absentCount})
            </button>
            <button
              type="button"
              onClick={() => setHistoryFilter('cancelled')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                historyFilter === 'cancelled'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-700 dark:text-amber-400 hover:bg-[var(--surface-raised)]'
              }`}
            >
              Cancelled ({summary.cancelledCount})
            </button>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-[var(--border-subtle)] rounded-xl space-y-2">
            <p className="text-xs text-[var(--foreground-muted)]">
              {records.length === 0
                ? `No attendance sessions recorded yet for ${subject.name}.`
                : `No sessions found matching filter "${historyFilter}".`}
            </p>
            {records.length === 0 && (
              <button
                type="button"
                onClick={() => setIsMarkingPast(true)}
                className="text-xs font-semibold text-study-600 hover:underline cursor-pointer"
              >
                + Record attendance session
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)]">
            {filteredRecords.map((r) => (
              <div
                key={r.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-[var(--surface-raised)]/40 px-2 rounded-lg transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--foreground)] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[var(--foreground-muted)]" />
                      {r.class_date}
                    </span>
                    <span className="text-[var(--foreground-muted)] opacity-40">•</span>
                    <span className="text-[var(--foreground-muted)] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {r.start_time.slice(0, 5)} - {r.end_time.slice(0, 5)}
                    </span>
                  </div>
                  {r.notes && (
                    <p className="text-[11px] text-[var(--foreground-muted)] italic">
                      &ldquo;{r.notes}&rdquo;
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <select
                    disabled={isPending}
                    value={r.status}
                    onChange={(e) =>
                      handleUpdateRecordStatus(r.id, e.target.value as AttendanceStatus)
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider cursor-pointer border ${
                      r.status === 'present'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : r.status === 'absent'
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleDeleteRecord(r.id)}
                    className="p-1.5 text-[var(--foreground-muted)] hover:text-rose-600 rounded-lg hover:bg-[var(--surface-overlay)] transition-colors cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. Record Past Class Modal */}
      {isMarkingPast && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50"
        >
          <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <h3 className="text-sm font-bold text-[var(--foreground)]">
                Record Attendance for {subject.name}
              </h3>
              <button
                type="button"
                onClick={() => setIsMarkingPast(false)}
                className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleMarkPast} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[var(--foreground)]">
                  Class Date *
                </label>
                <input
                  type="date"
                  value={pastDate}
                  onChange={(e) => setPastDate(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] text-[var(--foreground)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-xs text-[var(--foreground-muted)]">Start Time</label>
                  <input
                    type="time"
                    value={pastStart}
                    onChange={(e) => setPastStart(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] text-[var(--foreground)] [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs text-[var(--foreground-muted)]">End Time</label>
                  <input
                    type="time"
                    value={pastEnd}
                    onChange={(e) => setPastEnd(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] text-[var(--foreground)] [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[var(--foreground)]">
                  Status *
                </label>
                <select
                  value={pastStatus}
                  onChange={(e) => setPastStatus(e.target.value as AttendanceStatus)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] text-[var(--foreground)] cursor-pointer"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-[var(--foreground-muted)]">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 4 quiz"
                  value={pastNotes}
                  onChange={(e) => setPastNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] text-[var(--foreground)]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMarkingPast(false)}
                  className="px-3 py-1.5 text-xs text-[var(--foreground-muted)] hover:bg-[var(--surface-raised)] rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-study-600 hover:bg-study-700 rounded-xl transition-colors cursor-pointer"
                >
                  {isPending ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Edit Subject Modal */}
      {isEditingSubject && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50"
        >
          <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <h3 className="text-sm font-bold text-[var(--foreground)]">
                Edit Subject Configuration
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingSubject(false)}
                className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateSubject} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[var(--foreground)]">
                  Subject Name *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] text-[var(--foreground)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-xs text-[var(--foreground-muted)]">Code</label>
                  <input
                    type="text"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] text-[var(--foreground)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs text-[var(--foreground-muted)]">Target %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editTarget}
                    onChange={(e) => setEditTarget(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] text-[var(--foreground)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-xs text-[var(--foreground-muted)]">Faculty</label>
                  <input
                    type="text"
                    value={editFaculty}
                    onChange={(e) => setEditFaculty(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] text-[var(--foreground)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs text-[var(--foreground-muted)]">Default Room</label>
                  <input
                    type="text"
                    value={editRoom}
                    onChange={(e) => setEditRoom(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] text-[var(--foreground)]"
                  />
                </div>
              </div>

              {/* Baseline Info */}
              <div className="p-3 bg-[var(--surface-raised)] rounded-xl border border-[var(--border-subtle)] space-y-2">
                <span className="text-[11px] font-semibold text-[var(--foreground-muted)] uppercase tracking-wider block">
                  Previous Attendance Baseline
                </span>
                {hasRealRecords ? (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400">
                    Locked: Live attendance records exist for this subject. Baseline cannot be modified.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-[var(--foreground-muted)]">Attended Prior</label>
                      <input
                        type="number"
                        min="0"
                        value={editBaselineAttended}
                        onChange={(e) => setEditBaselineAttended(e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--foreground)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[var(--foreground-muted)]">Total Prior</label>
                      <input
                        type="number"
                        min="0"
                        value={editBaselineTotal}
                        onChange={(e) => setEditBaselineTotal(e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--foreground)]"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingSubject(false)}
                  className="px-3 py-1.5 text-xs text-[var(--foreground-muted)] hover:bg-[var(--surface-raised)] rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-study-600 hover:bg-study-700 rounded-xl transition-colors cursor-pointer"
                >
                  {isPending ? 'Saving...' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Archive / Delete Confirmation Modal */}
      {isConfirmingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--foreground)]">
                  {hasRealRecords || subject.baseline_total > 0
                    ? `Archive "${subject.name}"?`
                    : `Delete "${subject.name}"?`}
                </h3>
                <p className="text-xs text-[var(--foreground-muted)]">
                  {hasRealRecords || subject.baseline_total > 0
                    ? 'Preserve your attendance history while removing from active schedule'
                    : 'Permanent removal with no attendance history'}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-[var(--surface-raised)] rounded-xl border border-[var(--border-subtle)] text-xs text-[var(--foreground-muted)] leading-relaxed">
              {hasRealRecords || subject.baseline_total > 0 ? (
                <p>
                  This subject has <strong>{summary.effectiveTotal} classes</strong> recorded. To protect your academic attendance integrity, it will be <strong>archived</strong>. Its recurring weekly timetable slots will be removed, but all your past attendance records, notes, and percentages will be strictly preserved.
                </p>
              ) : (
                <p>
                  This subject has <strong>0 recorded classes</strong>. It will be permanently deleted from your semester along with any scheduled slots.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setIsConfirmingDelete(false)}
                className="px-3.5 py-2 text-xs font-semibold text-[var(--foreground)] bg-[var(--surface-raised)] hover:bg-[var(--surface-overlay)] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  startTransition(async () => {
                    if (hasRealRecords || subject.baseline_total > 0) {
                      const res = await archiveSubjectAction(subject.id)
                      if (!res.success) {
                        setErrorMsg(res.error || 'Failed to archive subject')
                        setIsConfirmingDelete(false)
                      } else {
                        router.push('/attendance')
                      }
                    } else {
                      const res = await deleteSubjectAction(subject.id)
                      if (!res.success) {
                        setErrorMsg(res.error || 'Failed to delete subject')
                        setIsConfirmingDelete(false)
                      } else {
                        router.push('/attendance')
                      }
                    }
                  })
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isPending
                  ? 'Processing...'
                  : hasRealRecords || subject.baseline_total > 0
                  ? 'Confirm Archive'
                  : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
