'use client'

import React, { useState, useTransition } from 'react'
import type { AttendanceRecordWithSubject, AttendanceStatus } from '@/lib/data/attendance'
import type { Subject } from '@/lib/data/subjects'
import {
  updateAttendanceRecordAction,
  deleteAttendanceRecordAction,
} from '@/lib/actions/attendance'

interface AttendanceHistoryListProps {
  records: AttendanceRecordWithSubject[]
  subjects: Subject[]
  activeSubjectId?: string
}

export default function AttendanceHistoryList({
  records,
  subjects,
  activeSubjectId,
}: AttendanceHistoryListProps) {
  const [isPending, startTransition] = useTransition()
  const [selectedSubject, setSelectedSubject] = useState<string>(activeSubjectId || '')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [searchDate, setSearchDate] = useState<string>('')

  // Filter records
  const filtered = records.filter((r) => {
    if (selectedSubject && r.subject_id !== selectedSubject) return false
    if (selectedStatus && r.status !== selectedStatus) return false
    if (searchDate && r.class_date !== searchDate) return false
    return true
  })

  const handleUpdateStatus = (recordId: string, subjectId: string, newStatus: AttendanceStatus) => {
    startTransition(async () => {
      await updateAttendanceRecordAction(recordId, subjectId, { status: newStatus })
    })
  }

  const handleDelete = (recordId: string, subjectId: string) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) return
    startTransition(async () => {
      await deleteAttendanceRecordAction(recordId, subjectId)
    })
  }

  return (
    <div className="bg-white/90 dark:bg-(--surface)/90 backdrop-blur-md rounded-2xl border border-gray-200/80 dark:border-(--border-subtle) p-5 shadow-2xs space-y-4">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-(--border-subtle)">
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            Attendance Records Log
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Chronological audit of all marked classes
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {!activeSubjectId && subjects.length > 0 && (
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
            >
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
          >
            <option value="">All Statuses</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
          />

          {(selectedSubject || selectedStatus || searchDate) && (
            <button
              type="button"
              onClick={() => {
                setSelectedSubject('')
                setSelectedStatus('')
                setSearchDate('')
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline px-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table / List */}
      {filtered.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
          <p className="text-xs text-gray-500">No attendance records found matching filters.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[460px] overflow-y-auto pr-1">
          {filtered.map((record) => (
            <div
              key={record.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              {/* Date & Subject */}
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    {record.class_date}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {record.start_time.slice(0, 5)} - {record.end_time.slice(0, 5)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                    {record.subject?.name || 'Class'}
                  </span>
                  {record.subject?.code && (
                    <span className="text-[11px] text-gray-500">({record.subject.code})</span>
                  )}
                  {record.notes && (
                    <span className="text-[11px] text-gray-500 italic truncate max-w-xs">
                      &ldquo;{record.notes}&rdquo;
                    </span>
                  )}
                </div>
              </div>

              {/* Status pills & quick actions */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Status selector */}
                <select
                  disabled={isPending}
                  value={record.status}
                  onChange={(e) =>
                    handleUpdateStatus(record.id, record.subject_id, e.target.value as AttendanceStatus)
                  }
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider cursor-pointer border ${
                    record.status === 'present'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : record.status === 'absent'
                      ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-800'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                {/* Delete button */}
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDelete(record.id, record.subject_id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  title="Delete record"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
