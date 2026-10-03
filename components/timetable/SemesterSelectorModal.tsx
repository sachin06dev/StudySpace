'use client'

import React, { useState, useTransition } from 'react'
import type { Semester } from '@/lib/data/semesters'
import {
  createSemesterAction,
  updateSemesterAction,
  setActiveSemesterAction,
  archiveSemesterAction,
  deleteSemesterAction,
} from '@/lib/actions/semesters'

interface SemesterSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  semesters: Semester[]
  activeSemesterId?: string | null
}

export default function SemesterSelectorModal({
  isOpen,
  onClose,
  semesters,
  activeSemesterId,
}: SemesterSelectorModalProps) {
  const [isPending, startTransition] = useTransition()
  const [isCreating, setIsCreating] = useState(false)
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null)
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 120)
    return d.toISOString().split('T')[0]
  })
  const [setAsActive, setSetAsActive] = useState(true)

  // Edit states
  const [editName, setEditName] = useState('')
  const [editStartDate, setEditStartDate] = useState('')
  const [editEndDate, setEditEndDate] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    if (!name.trim()) {
      setErrorMsg('Semester name is required.')
      return
    }
    if (endDate < startDate) {
      setErrorMsg('End date must be on or after start date.')
      return
    }

    startTransition(async () => {
      const res = await createSemesterAction({
        name: name.trim(),
        startDate,
        endDate,
        isActive: setAsActive,
      })
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to create semester')
      } else {
        setName('')
        setIsCreating(false)
        onClose()
      }
    })
  }

  const handleActivate = (id: string) => {
    setErrorMsg(null)
    startTransition(async () => {
      const res = await setActiveSemesterAction(id)
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to activate semester')
      }
    })
  }

  const handleArchive = (id: string) => {
    setErrorMsg(null)
    startTransition(async () => {
      const res = await archiveSemesterAction(id)
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to archive semester')
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this semester? This will also remove its subjects and timetable slots.')) {
      return
    }
    setErrorMsg(null)
    startTransition(async () => {
      const res = await deleteSemesterAction(id)
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to delete semester')
      }
    })
  }

  const handleStartEdit = (sem: Semester) => {
    setEditingSemester(sem)
    setEditName(sem.name)
    setEditStartDate(sem.start_date)
    setEditEndDate(sem.end_date)
    setIsCreating(false)
    setErrorMsg(null)
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSemester) return
    setErrorMsg(null)
    if (!editName.trim()) {
      setErrorMsg('Semester name cannot be empty.')
      return
    }
    if (editEndDate < editStartDate) {
      setErrorMsg('End date must be on or after start date.')
      return
    }
    if (editStartDate !== editingSemester.start_date || editEndDate !== editingSemester.end_date) {
      if (!confirm('Changing semester dates adjusts your academic calendar. Historical attendance linked to this semester will remain preserved. Proceed?')) {
        return
      }
    }

    startTransition(async () => {
      const res = await updateSemesterAction(editingSemester.id, {
        name: editName.trim(),
        startDate: editStartDate,
        endDate: editEndDate,
      })
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to update semester')
      } else {
        setEditingSemester(null)
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
              Manage Semesters
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Select your active semester or create a new one.
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

        {errorMsg && (
          <div className="p-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl">
            {errorMsg}
          </div>
        )}

        {/* Existing Semesters List */}
        {!isCreating && !editingSemester && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Existing Semesters ({semesters.length})
              </span>
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                + New Semester
              </button>
            </div>

            {semesters.length === 0 ? (
              <div className="text-center py-6 px-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                <p className="text-xs text-gray-500">No semesters found. Create your first semester below.</p>
                <button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  className="mt-3 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                  Create Semester
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {semesters.map((sem) => {
                  const isActive = sem.is_active || sem.id === activeSemesterId
                  return (
                    <div
                      key={sem.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                        isActive
                          ? 'border-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-2xs'
                          : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30'
                      }`}
                    >
                      <div className="space-y-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {sem.name}
                          </span>
                          {isActive ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                              Archived
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          {sem.start_date} to {sem.end_date}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleStartEdit(sem)}
                          className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors cursor-pointer"
                          title="Edit semester"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {!isActive ? (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleActivate(sem.id)}
                            className="px-2.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors cursor-pointer"
                          >
                            Set Active
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleArchive(sem.id)}
                            className="px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                          >
                            Archive
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleDelete(sem.id)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                          title="Delete semester"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Edit Semester Form */}
        {editingSemester && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Edit Semester
              </span>
              <button
                type="button"
                onClick={() => setEditingSemester(null)}
                className="text-xs text-gray-500 hover:underline cursor-pointer"
              >
                Back to list
              </button>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Semester Name *
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g. Semester 3 - Phase 2"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  End Date *
                </label>
                <input
                  type="date"
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-gray-600 dark:text-gray-400">
              Editing semester dates adjusts the active academic cycle. All historical attendance records remain safely preserved and linked to this semester.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingSemester(null)}
                className="px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {/* Create Semester Form */}
        {isCreating && (
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Create New Semester
              </span>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-xs text-gray-500 hover:underline"
              >
                Back to list
              </button>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Semester Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 2026-27 Semester 1"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  End Date *
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="setAsActiveCheckbox"
                checked={setAsActive}
                onChange={(e) => setSetAsActive(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <label
                htmlFor="setAsActiveCheckbox"
                className="text-xs text-gray-700 dark:text-gray-300 cursor-pointer select-none"
              >
                Set as active semester (deactivates current active semester)
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isPending ? 'Creating...' : 'Create Semester'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
