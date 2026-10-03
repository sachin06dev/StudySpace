'use client'

import React, { useState, useTransition } from 'react'
import type { Subject } from '@/lib/data/subjects'
import type { TimetableSlotWithSubject, TimetableException, ExceptionType } from '@/lib/data/timetable'
import {
  createTimetableExceptionAction,
  deleteTimetableExceptionAction,
} from '@/lib/actions/timetable'

interface TimetableExceptionModalProps {
  isOpen: boolean
  onClose: () => void
  semesterId: string
  slots: TimetableSlotWithSubject[]
  subjects: Subject[]
  existingExceptions: TimetableException[]
  preselectedSlotId?: string | null
  preselectedDate?: string | null
}

const DAYS_NAME = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function TimetableExceptionModal({
  isOpen,
  onClose,
  semesterId,
  slots,
  subjects,
  existingExceptions,
  preselectedSlotId,
  preselectedDate,
}: TimetableExceptionModalProps) {
  const [isPending, startTransition] = useTransition()
  const todayStr = new Date().toISOString().split('T')[0]

  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create')
  const [exceptionType, setExceptionType] = useState<ExceptionType>('cancelled')
  const [exceptionDate, setExceptionDate] = useState<string>(preselectedDate || todayStr)
  const [slotId, setSlotId] = useState<string>(preselectedSlotId || slots[0]?.id || '')

  // Extra class fields
  const [subjectId, setSubjectId] = useState<string>(subjects[0]?.id || '')
  const [startTime, setStartTime] = useState('11:00')
  const [endTime, setEndTime] = useState('12:00')
  const [room, setRoom] = useState('')
  const [faculty, setFaculty] = useState('')

  // Rescheduled fields
  const [replacementDate, setReplacementDate] = useState(todayStr)
  const [replacementStartTime, setReplacementStartTime] = useState('14:00')
  const [replacementEndTime, setReplacementEndTime] = useState('15:00')

  const [notes, setNotes] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (exceptionType === 'cancelled') {
      if (!slotId) {
        setErrorMsg('Please select a class to cancel.')
        return
      }
    } else if (exceptionType === 'extra') {
      if (!subjectId) {
        setErrorMsg('Please select a subject for the extra class.')
        return
      }
      if (endTime <= startTime) {
        setErrorMsg('End time must be after start time.')
        return
      }
    } else if (exceptionType === 'rescheduled') {
      if (!slotId) {
        setErrorMsg('Please select a class to reschedule.')
        return
      }
      if (replacementEndTime <= replacementStartTime) {
        setErrorMsg('Replacement end time must be after replacement start time.')
        return
      }
    }

    startTransition(async () => {
      const res = await createTimetableExceptionAction({
        semesterId,
        exceptionDate,
        exceptionType,
        timetableSlotId: exceptionType !== 'extra' ? slotId : null,
        subjectId: exceptionType === 'extra' ? subjectId : null,
        startTime: exceptionType === 'extra' ? `${startTime}:00` : null,
        endTime: exceptionType === 'extra' ? `${endTime}:00` : null,
        replacementDate: exceptionType === 'rescheduled' ? replacementDate : null,
        replacementStartTime: exceptionType === 'rescheduled' ? `${replacementStartTime}:00` : null,
        replacementEndTime: exceptionType === 'rescheduled' ? `${replacementEndTime}:00` : null,
        room: room.trim() || null,
        faculty: faculty.trim() || null,
        notes: notes.trim() || null,
      })

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to save timetable exception')
      } else {
        onClose()
      }
    })
  }

  const handleDelete = (id: string) => {
    setErrorMsg(null)
    startTransition(async () => {
      const res = await deleteTimetableExceptionAction(id)
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to delete exception')
      }
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50"
    >
      <div className="bg-white dark:bg-(--surface) border border-gray-200 dark:border-(--border-subtle) rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-(--border-subtle)">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Timetable Exceptions
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Cancel, reschedule, or add extra classes for specific dates.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab buttons */}
        <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800/80 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'create'
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-2xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Add Exception
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manage')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'manage'
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-2xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Manage Existing ({existingExceptions.length})
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl">
            {errorMsg}
          </div>
        )}

        {activeTab === 'create' ? (
          <form onSubmit={handleCreate} className="space-y-4">
            {/* Exception Type Radio Pills */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Exception Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setExceptionType('cancelled')}
                  className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition-all ${
                    exceptionType === 'cancelled'
                      ? 'border-red-500/50 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300'
                      : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/40'
                  }`}
                >
                  ✕ Cancel Class
                </button>
                <button
                  type="button"
                  onClick={() => setExceptionType('extra')}
                  className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition-all ${
                    exceptionType === 'extra'
                      ? 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                      : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/40'
                  }`}
                >
                  + Extra Class
                </button>
                <button
                  type="button"
                  onClick={() => setExceptionType('rescheduled')}
                  className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition-all ${
                    exceptionType === 'rescheduled'
                      ? 'border-amber-500/50 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300'
                      : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/40'
                  }`}
                >
                  ↷ Reschedule
                </button>
              </div>
            </div>

            {/* Exception Date */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                {exceptionType === 'rescheduled' ? 'Original Date *' : 'Affected Date *'}
              </label>
              <input
                type="date"
                value={exceptionDate}
                onChange={(e) => setExceptionDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Class Slot picker (for Cancelled or Rescheduled) */}
            {exceptionType !== 'extra' && (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Select Class Slot *
                </label>
                {slots.length === 0 ? (
                  <p className="text-xs text-amber-600">No timetable slots available to cancel.</p>
                ) : (
                  <select
                    value={slotId}
                    onChange={(e) => setSlotId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  >
                    {slots.map((s) => (
                      <option key={s.id} value={s.id}>
                        {DAYS_NAME[s.day_of_week]} {s.start_time.slice(0, 5)} - {s.subject?.name || 'Class'}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Extra Class Specific Fields */}
            {exceptionType === 'extra' && (
              <div className="space-y-3 p-3.5 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Subject *
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.class_type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs text-gray-600 dark:text-gray-400">Start Time *</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs text-gray-600 dark:text-gray-400">End Time *</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs text-gray-600 dark:text-gray-400">Room</label>
                    <input
                      type="text"
                      placeholder="Optional room"
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs text-gray-600 dark:text-gray-400">Faculty</label>
                    <input
                      type="text"
                      placeholder="Optional teacher"
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Rescheduled Specific Fields */}
            {exceptionType === 'rescheduled' && (
              <div className="space-y-3 p-3.5 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-200 dark:border-gray-800">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                  New Replacement Schedule
                </span>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    New Calendar Date *
                  </label>
                  <input
                    type="date"
                    value={replacementDate}
                    onChange={(e) => setReplacementDate(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs text-gray-600 dark:text-gray-400">New Start Time *</label>
                    <input
                      type="time"
                      value={replacementStartTime}
                      onChange={(e) => setReplacementStartTime(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs text-gray-600 dark:text-gray-400">New End Time *</label>
                    <input
                      type="time"
                      value={replacementEndTime}
                      onChange={(e) => setReplacementEndTime(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Reason / Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Teacher on leave, sports day, makeup class"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isPending ? 'Saving...' : 'Apply Exception'}
              </button>
            </div>
          </form>
        ) : (
          /* Manage Existing Exceptions Tab */
          <div className="space-y-3">
            {existingExceptions.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-500 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                No timetable exceptions recorded for this semester.
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {existingExceptions.map((ex) => (
                  <div
                    key={ex.id}
                    className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 flex items-center justify-between"
                  >
                    <div className="space-y-0.5 text-xs min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                            ex.exception_type === 'cancelled'
                              ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                              : ex.exception_type === 'extra'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {ex.exception_type}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {ex.exception_date}
                        </span>
                      </div>
                      {ex.exception_type === 'rescheduled' && (
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          Moved to {ex.replacement_date} ({ex.replacement_start_time?.slice(0, 5)} - {ex.replacement_end_time?.slice(0, 5)})
                        </p>
                      )}
                      {ex.notes && (
                        <p className="text-[11px] text-gray-600 dark:text-gray-300 italic">
                          &ldquo;{ex.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDelete(ex.id)}
                      className="px-2.5 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
