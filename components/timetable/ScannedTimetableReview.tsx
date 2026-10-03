'use client'

import React, { useState, useTransition } from 'react'
import type { DetectedClassItem } from '@/lib/ai/timetableScanner'
import type { ClassType } from '@/lib/data/subjects'
import type { Semester } from '@/lib/data/semesters'
import { saveScannedTimetableAction } from '@/lib/actions/timetableAi'

const DAYS_OF_WEEK = [
  { value: 0, label: 'Mon' },
  { value: 1, label: 'Tue' },
  { value: 2, label: 'Wed' },
  { value: 3, label: 'Thu' },
  { value: 4, label: 'Fri' },
  { value: 5, label: 'Sat' },
  { value: 6, label: 'Sun' },
]

const CLASS_TYPES: { value: ClassType; label: string }[] = [
  { value: 'theory', label: 'Theory' },
  { value: 'lab', label: 'Lab' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'other', label: 'Other' },
]

interface ScannedTimetableReviewProps {
  initialClasses: DetectedClassItem[]
  suggestedSemesterName: string
  existingSemesters: Semester[]
  currentActiveSemesterId?: string | null
  onSaveSuccess: () => void
  onCancel: () => void
}

export default function ScannedTimetableReview({
  initialClasses,
  suggestedSemesterName,
  existingSemesters,
  currentActiveSemesterId,
  onSaveSuccess,
  onCancel,
}: ScannedTimetableReviewProps) {
  const [classes, setClasses] = useState<DetectedClassItem[]>(initialClasses)
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Semester assignment mode: 'existing' or 'new'
  const [semesterMode, setSemesterMode] = useState<'existing' | 'new'>(
    existingSemesters.length > 0 ? 'existing' : 'new'
  )
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>(
    currentActiveSemesterId || existingSemesters[0]?.id || ''
  )
  const [newSemesterName, setNewSemesterName] = useState(suggestedSemesterName)
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 120)
    return d.toISOString().split('T')[0]
  })
  const [setAsActive, setSetAsActive] = useState(true)

  const handleUpdateField = (
    index: number,
    field: keyof DetectedClassItem,
    value: unknown
  ) => {
    setClasses((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleDeleteRow = (index: number) => {
    setClasses((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDuplicateRow = (index: number) => {
    setClasses((prev) => {
      const target = prev[index]
      const copy: DetectedClassItem = {
        ...target,
        id: `detected_${Date.now()}_dup`,
      }
      return [...prev.slice(0, index + 1), copy, ...prev.slice(index + 1)]
    })
  }

  const handleAddRow = () => {
    const newRow: DetectedClassItem = {
      id: `detected_${Date.now()}_manual`,
      dayOfWeek: 0,
      startTime: '09:00',
      endTime: '10:00',
      subjectName: 'New Subject',
      subjectCode: null,
      faculty: null,
      room: null,
      classType: 'theory',
      confidence: 'high',
    }
    setClasses((prev) => [...prev, newRow])
  }

  const handleSave = () => {
    setErrorMsg(null)

    if (classes.length === 0) {
      setErrorMsg('No classes in the timetable to save.')
      return
    }

    // Validate rows
    for (let i = 0; i < classes.length; i++) {
      const c = classes[i]
      if (!c.subjectName.trim()) {
        setErrorMsg(`Row ${i + 1}: Subject name cannot be empty.`)
        return
      }
      if (c.endTime <= c.startTime) {
        setErrorMsg(`Row ${i + 1} (${c.subjectName}): End time must be after start time.`)
        return
      }
    }

    startTransition(async () => {
      const input = {
        semesterId: semesterMode === 'existing' ? selectedSemesterId : null,
        newSemester:
          semesterMode === 'new'
            ? {
                name: newSemesterName.trim() || 'New Semester',
                startDate,
                endDate,
                setAsActive,
              }
            : null,
        classes,
      }

      const res = await saveScannedTimetableAction(input)
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to save timetable')
      } else {
        onSaveSuccess()
      }
    })
  }

  return (
    <div className="space-y-5">
      {/* Header status */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
            {classes.length}
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100">
              Classes Extracted from Timetable
            </h3>
            <p className="text-[11px] text-gray-600 dark:text-gray-300">
              Review and edit any detected details before saving to your account.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddRow}
          className="px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-300 bg-white dark:bg-gray-900 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
        >
          + Add Missing Class
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl">
          {errorMsg}
        </div>
      )}

      {/* Editable Table */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="py-2.5 px-3 font-semibold w-24">Day</th>
              <th className="py-2.5 px-2 font-semibold w-32">Time</th>
              <th className="py-2.5 px-3 font-semibold">Subject Name *</th>
              <th className="py-2.5 px-2 font-semibold w-20">Code</th>
              <th className="py-2.5 px-2 font-semibold w-28">Type</th>
              <th className="py-2.5 px-2 font-semibold w-24">Room</th>
              <th className="py-2.5 px-2 font-semibold w-28">Faculty</th>
              <th className="py-2.5 px-2 text-right font-semibold w-16">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-(--border-subtle) bg-white dark:bg-(--surface)">
            {classes.map((c, index) => (
              <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                {/* Day */}
                <td className="py-1.5 px-3">
                  <select
                    value={c.dayOfWeek}
                    onChange={(e) =>
                      handleUpdateField(index, 'dayOfWeek', parseInt(e.target.value, 10))
                    }
                    className="w-full py-1 px-1.5 text-xs rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Time (Start - End) */}
                <td className="py-1.5 px-2">
                  <div className="flex items-center gap-1">
                    <input
                      type="time"
                      value={c.startTime}
                      onChange={(e) => handleUpdateField(index, 'startTime', e.target.value)}
                      className="w-16 py-1 px-1 text-[11px] rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 [color-scheme:light] dark:[color-scheme:dark]"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="time"
                      value={c.endTime}
                      onChange={(e) => handleUpdateField(index, 'endTime', e.target.value)}
                      className="w-16 py-1 px-1 text-[11px] rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                </td>

                {/* Subject Name */}
                <td className="py-1.5 px-3">
                  <input
                    type="text"
                    value={c.subjectName}
                    onChange={(e) => handleUpdateField(index, 'subjectName', e.target.value)}
                    className="w-full py-1 px-2 text-xs rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 font-medium"
                  />
                </td>

                {/* Code */}
                <td className="py-1.5 px-2">
                  <input
                    type="text"
                    value={c.subjectCode || ''}
                    onChange={(e) =>
                      handleUpdateField(index, 'subjectCode', e.target.value || null)
                    }
                    placeholder="CS101"
                    className="w-full py-1 px-1.5 text-xs rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500"
                  />
                </td>

                {/* Type */}
                <td className="py-1.5 px-2">
                  <select
                    value={c.classType}
                    onChange={(e) =>
                      handleUpdateField(index, 'classType', e.target.value as ClassType)
                    }
                    className="w-full py-1 px-1 text-xs rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                  >
                    {CLASS_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Room */}
                <td className="py-1.5 px-2">
                  <input
                    type="text"
                    value={c.room || ''}
                    onChange={(e) => handleUpdateField(index, 'room', e.target.value || null)}
                    placeholder="Room"
                    className="w-full py-1 px-1.5 text-xs rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500"
                  />
                </td>

                {/* Faculty */}
                <td className="py-1.5 px-2">
                  <input
                    type="text"
                    value={c.faculty || ''}
                    onChange={(e) => handleUpdateField(index, 'faculty', e.target.value || null)}
                    placeholder="Prof"
                    className="w-full py-1 px-1.5 text-xs rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500"
                  />
                </td>

                {/* Actions */}
                <td className="py-1.5 px-2 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => handleDuplicateRow(index)}
                      title="Duplicate row"
                      className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRow(index)}
                      title="Delete row"
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Target Semester Confirmation */}
      <div className="p-4 bg-gray-50/80 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 space-y-3">
        <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider block">
          Target Semester
        </span>

        {existingSemesters.length > 0 && (
          <div className="flex items-center gap-4 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="semesterMode"
                value="existing"
                checked={semesterMode === 'existing'}
                onChange={() => setSemesterMode('existing')}
                className="text-indigo-600"
              />
              <span>Add to existing semester</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="semesterMode"
                value="new"
                checked={semesterMode === 'new'}
                onChange={() => setSemesterMode('new')}
                className="text-indigo-600"
              />
              <span>Create new semester</span>
            </label>
          </div>
        )}

        {semesterMode === 'existing' && existingSemesters.length > 0 ? (
          <select
            value={selectedSemesterId}
            onChange={(e) => setSelectedSemesterId(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            {existingSemesters.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.start_date} to {s.end_date}) {s.is_active ? '• Active' : ''}
              </option>
            ))}
          </select>
        ) : (
          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <label className="block text-[11px] text-gray-600 dark:text-gray-400">
                Semester Name *
              </label>
              <input
                type="text"
                value={newSemesterName}
                onChange={(e) => setNewSemesterName(e.target.value)}
                placeholder="e.g. Fall 2026"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] text-gray-600 dark:text-gray-400">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] text-gray-600 dark:text-gray-400">
                  End Date *
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="activeSemesterCheckbox"
                checked={setAsActive}
                onChange={(e) => setSetAsActive(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600"
              />
              <label htmlFor="activeSemesterCheckbox" className="text-xs text-gray-700 dark:text-gray-300">
                Set as active semester immediately
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
        >
          Discard & Cancel
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={handleSave}
          className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
        >
          {isPending ? 'Saving Timetable...' : `Save ${classes.length} Classes to StudySpace`}
        </button>
      </div>
    </div>
  )
}
