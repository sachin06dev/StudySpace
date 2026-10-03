'use client'

import React, { useState, useEffect, useMemo, useTransition } from 'react'
import type { Subject, ClassType } from '@/lib/data/subjects'
import type { TimetableSlotWithSubject } from '@/lib/data/timetable'
import {
  createTimetableSlotAction,
  updateTimetableSlotAction,
  deleteTimetableSlotAction,
} from '@/lib/actions/timetable'
import { createSubjectAction } from '@/lib/actions/subjects'

const DAYS_OF_WEEK = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' },
]

const CLASS_TYPES: { value: ClassType; label: string }[] = [
  { value: 'theory', label: 'Theory / Lecture' },
  { value: 'lab', label: 'Lab / Practical' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'other', label: 'Other' },
]

interface TimetableSlotModalProps {
  isOpen: boolean
  onClose: () => void
  semesterId: string
  subjects: Subject[]
  editingSlot?: TimetableSlotWithSubject | null
  initialDay?: number
}

export default function TimetableSlotModal({
  isOpen,
  onClose,
  semesterId,
  subjects,
  editingSlot,
  initialDay = 0,
}: TimetableSlotModalProps) {
  const [isPending, startTransition] = useTransition()

  // Ensure subject list includes the clicked slot subject even if unlisted
  const allSubjects = useMemo(() => {
    if (editingSlot?.subject && !subjects.some((s) => s.id === editingSlot.subject.id)) {
      return [editingSlot.subject, ...subjects]
    }
    return subjects
  }, [subjects, editingSlot])

  // Form states initialized to clicked slot data or defaults
  const [dayOfWeek, setDayOfWeek] = useState<number>(
    editingSlot ? editingSlot.day_of_week : initialDay
  )
  const [subjectId, setSubjectId] = useState<string>(
    editingSlot ? editingSlot.subject_id : allSubjects[0]?.id || ''
  )
  const [startTime, setStartTime] = useState<string>(
    editingSlot ? editingSlot.start_time.slice(0, 5) : '09:00'
  )
  const [endTime, setEndTime] = useState<string>(
    editingSlot ? editingSlot.end_time.slice(0, 5) : '10:00'
  )
  const [roomOverride, setRoomOverride] = useState<string>(
    editingSlot?.room_override || ''
  )
  const [facultyOverride, setFacultyOverride] = useState<string>(
    editingSlot?.faculty_override || ''
  )
  const [classTypeOverride, setClassTypeOverride] = useState<ClassType | ''>(
    editingSlot?.class_type_override || ''
  )

  // Inline quick subject creation
  const [isCreatingSubject, setIsCreatingSubject] = useState(false)
  const [newSubName, setNewSubName] = useState('')
  const [newSubCode, setNewSubCode] = useState('')
  const [newSubFaculty, setNewSubFaculty] = useState('')
  const [newSubRoom, setNewSubRoom] = useState('')
  const [newSubType, setNewSubType] = useState<ClassType>('theory')
  const [newSubTarget, setNewSubTarget] = useState<string>('75')

  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Synchronize form states whenever the clicked slot or modal open state changes
  useEffect(() => {
    if (!isOpen) return

    if (editingSlot) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDayOfWeek(editingSlot.day_of_week)
      setSubjectId(editingSlot.subject_id)
      setStartTime(editingSlot.start_time.slice(0, 5))
      setEndTime(editingSlot.end_time.slice(0, 5))
      setRoomOverride(editingSlot.room_override || '')
      setFacultyOverride(editingSlot.faculty_override || '')
      setClassTypeOverride(editingSlot.class_type_override || '')
      setIsCreatingSubject(false)
    } else {
      setDayOfWeek(initialDay)
      setSubjectId(subjects[0]?.id || '')
      setStartTime('09:00')
      setEndTime('10:00')
      setRoomOverride('')
      setFacultyOverride('')
      setClassTypeOverride('')
      setIsCreatingSubject(subjects.length === 0)
    }
    setNewSubName('')
    setNewSubCode('')
    setNewSubFaculty('')
    setNewSubRoom('')
    setNewSubType('theory')
    setNewSubTarget('75')
    setErrorMsg(null)
  }, [editingSlot, initialDay, isOpen, subjects])

  if (!isOpen) return null

  const selectedSubject = allSubjects.find((s) => s.id === subjectId) || editingSlot?.subject

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (endTime <= startTime) {
      setErrorMsg('End time must be after start time.')
      return
    }

    startTransition(async () => {
      let effectiveSubjectId = subjectId

      // If user is adding a subject inline
      if (isCreatingSubject) {
        if (!newSubName.trim()) {
          setErrorMsg('Subject name is required.')
          return
        }

        const targetNum = newSubTarget ? parseFloat(newSubTarget) : null
        const subRes = await createSubjectAction({
          semesterId,
          name: newSubName.trim(),
          code: newSubCode.trim() || null,
          faculty: newSubFaculty.trim() || null,
          defaultRoom: newSubRoom.trim() || null,
          classType: newSubType,
          targetPercentage: targetNum,
        })

        if (!subRes.success || !subRes.data) {
          setErrorMsg(subRes.error || 'Failed to create subject')
          return
        }

        effectiveSubjectId = subRes.data.id
      }

      if (!effectiveSubjectId) {
        setErrorMsg('Please select or create a subject.')
        return
      }

      const formattedStartTime = startTime.length === 5 ? `${startTime}:00` : startTime
      const formattedEndTime = endTime.length === 5 ? `${endTime}:00` : endTime

      // Create or update slot
      if (editingSlot) {
        const res = await updateTimetableSlotAction(editingSlot.id, {
          subjectId: effectiveSubjectId,
          dayOfWeek,
          startTime: formattedStartTime,
          endTime: formattedEndTime,
          roomOverride: roomOverride.trim() || null,
          facultyOverride: facultyOverride.trim() || null,
          classTypeOverride: classTypeOverride || null,
        })

        if (!res.success) {
          setErrorMsg(res.error || 'Failed to update slot')
          return
        }
      } else {
        const res = await createTimetableSlotAction({
          semesterId,
          subjectId: effectiveSubjectId,
          dayOfWeek,
          startTime: formattedStartTime,
          endTime: formattedEndTime,
          roomOverride: roomOverride.trim() || null,
          facultyOverride: facultyOverride.trim() || null,
          classTypeOverride: classTypeOverride || null,
        })

        if (!res.success) {
          setErrorMsg(res.error || 'Failed to create slot')
          return
        }
      }

      onClose()
    })
  }

  const handleDelete = () => {
    if (!editingSlot) return
    if (!confirm('Are you sure you want to remove this class from your timetable?')) return

    startTransition(async () => {
      const res = await deleteTimetableSlotAction(editingSlot.id)
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to delete slot')
      } else {
        onClose()
      }
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50"
    >
      <div className="bg-white dark:bg-(--surface) border border-gray-200/80 dark:border-(--border-subtle) rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-(--border-subtle)">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {editingSlot ? 'Edit Class Slot' : 'Add Class to Timetable'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {editingSlot
                ? `Viewing and editing schedule details for ${editingSlot.subject.name}.`
                : `Schedule a recurring weekly class template.`}
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-(--surface-raised) transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Selected / Clicked Class Details Overview */}
        {editingSlot && (
          <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200/70 dark:border-purple-800/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                Selected Class Details
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-700/50">
                {editingSlot.class_type_override || editingSlot.subject.class_type || 'theory'}
              </span>
            </div>

            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-gray-900 dark:text-gray-100">
                  {editingSlot.subject.name}
                </h3>
                {editingSlot.subject.code && (
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Course Code: {editingSlot.subject.code}
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100 block">
                  {DAYS_OF_WEEK.find((d) => d.value === editingSlot.day_of_week)?.label}
                </span>
                <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                  {editingSlot.start_time.slice(0, 5)} – {editingSlot.end_time.slice(0, 5)}
                </span>
              </div>
            </div>

            {((editingSlot.room_override || editingSlot.subject.default_room) ||
              (editingSlot.faculty_override || editingSlot.subject.faculty)) && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-300 pt-1.5 border-t border-purple-100/70 dark:border-purple-900/40">
                {(editingSlot.room_override || editingSlot.subject.default_room) && (
                  <span>
                    <span className="text-gray-400 font-medium">Room: </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {editingSlot.room_override || editingSlot.subject.default_room}
                    </span>
                    {editingSlot.room_override && (
                      <span className="ml-1 text-[10px] text-purple-600 dark:text-purple-400 font-medium">(override)</span>
                    )}
                  </span>
                )}
                {(editingSlot.faculty_override || editingSlot.subject.faculty) && (
                  <span>
                    <span className="text-gray-400 font-medium">Faculty: </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {editingSlot.faculty_override || editingSlot.subject.faculty}
                    </span>
                    {editingSlot.faculty_override && (
                      <span className="ml-1 text-[10px] text-purple-600 dark:text-purple-400 font-medium">(override)</span>
                    )}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {errorMsg && (
          <div className="p-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Day of Week */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Day of the Week *
            </label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200/80 dark:border-(--border-subtle) bg-white dark:bg-(--surface-raised) text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            >
              {DAYS_OF_WEEK.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Time pickers */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Start Time *
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200/80 dark:border-(--border-subtle) bg-white dark:bg-(--surface-raised) text-gray-900 dark:text-gray-100 [color-scheme:light] dark:[color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                End Time *
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200/80 dark:border-(--border-subtle) bg-white dark:bg-(--surface-raised) text-gray-900 dark:text-gray-100 [color-scheme:light] dark:[color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
            </div>
          </div>

          {/* Subject selection or creation */}
          <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-(--border-subtle)">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Subject *
              </label>
              {allSubjects.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsCreatingSubject(!isCreatingSubject)}
                  className="text-xs text-purple-600 dark:text-purple-400 font-medium hover:underline cursor-pointer"
                >
                  {isCreatingSubject ? 'Choose Existing' : '+ Add New Subject'}
                </button>
              )}
            </div>

            {!isCreatingSubject && allSubjects.length > 0 ? (
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200/80 dark:border-(--border-subtle) bg-white dark:bg-(--surface-raised) text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              >
                {allSubjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} {sub.code ? `(${sub.code})` : ''} — {sub.class_type}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3.5 bg-gray-50/70 dark:bg-(--surface-raised)/40 rounded-xl border border-gray-200/80 dark:border-(--border-subtle) space-y-3">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                  New Subject Details
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[11px] text-gray-600 dark:text-gray-400">Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Data Structures"
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      required={isCreatingSubject}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200/80 dark:border-(--border-subtle) bg-white dark:bg-(--surface-raised) text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] text-gray-600 dark:text-gray-400">Code (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. CS201"
                      value={newSubCode}
                      onChange={(e) => setNewSubCode(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200/80 dark:border-(--border-subtle) bg-white dark:bg-(--surface-raised) text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[11px] text-gray-600 dark:text-gray-400">Class Type</label>
                    <select
                      value={newSubType}
                      onChange={(e) => setNewSubType(e.target.value as ClassType)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200/80 dark:border-(--border-subtle) bg-white dark:bg-(--surface-raised) text-gray-900 dark:text-gray-100"
                    >
                      {CLASS_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] text-gray-600 dark:text-gray-400">Attendance Target (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="75"
                      value={newSubTarget}
                      onChange={(e) => setNewSubTarget(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200/80 dark:border-(--border-subtle) bg-white dark:bg-(--surface-raised) text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[11px] text-gray-600 dark:text-gray-400">Faculty (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Smith"
                      value={newSubFaculty}
                      onChange={(e) => setNewSubFaculty(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200/80 dark:border-(--border-subtle) bg-white dark:bg-(--surface-raised) text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] text-gray-600 dark:text-gray-400">Room (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Lab 2"
                      value={newSubRoom}
                      onChange={(e) => setNewSubRoom(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200/80 dark:border-(--border-subtle) bg-white dark:bg-(--surface-raised) text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Slot Overrides (Optional) */}
          <div className="space-y-3 pt-1 border-t border-gray-100 dark:border-(--border-subtle)">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Slot Specific Details (Optional)
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs text-gray-700 dark:text-gray-300">Room / Lab</label>
                <input
                  type="text"
                  placeholder={selectedSubject?.default_room ? `Default: ${selectedSubject.default_room}` : 'e.g. Room 302, Lab 4'}
                  value={roomOverride}
                  onChange={(e) => setRoomOverride(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200/80 dark:border-(--border-subtle) bg-white dark:bg-(--surface-raised) text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-gray-700 dark:text-gray-300">Faculty / Teacher</label>
                <input
                  type="text"
                  placeholder={selectedSubject?.faculty ? `Default: ${selectedSubject.faculty}` : 'e.g. Prof. Sharma'}
                  value={facultyOverride}
                  onChange={(e) => setFacultyOverride(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200/80 dark:border-(--border-subtle) bg-white dark:bg-(--surface-raised) text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-gray-700 dark:text-gray-300">Class Type Override</label>
              <select
                value={classTypeOverride}
                onChange={(e) => setClassTypeOverride(e.target.value as ClassType | '')}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200/80 dark:border-(--border-subtle) bg-white dark:bg-(--surface-raised) text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              >
                <option value="">Use Subject Default {selectedSubject?.class_type ? `(${selectedSubject.class_type})` : ''}</option>
                {CLASS_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-(--border-subtle)">
            {editingSlot ? (
              <button
                type="button"
                disabled={isPending}
                onClick={handleDelete}
                className="px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
              >
                Delete Class
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-(--surface-raised) rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isPending ? 'Saving...' : editingSlot ? 'Update Class' : 'Add Class'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

