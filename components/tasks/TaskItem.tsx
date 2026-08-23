'use client'

import { useState, useTransition } from 'react'
import { toggleTaskStatusAction, updateTaskAction, deleteTaskAction } from '@/lib/actions/tasks'
import type { Task, TaskPriority } from '@/lib/data/tasks'

interface TaskItemProps {
  task: Task
  onToggle?: (task: Task) => void
  onDelete?: (taskId: string) => void
  onUpdate?: (updatedTask: Task) => void
}

export default function TaskItem({
  task,
  onToggle,
  onDelete,
  onUpdate,
}: TaskItemProps) {
  const [isPending, startTransition] = useTransition()
  const [isEditing, setIsEditing] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  // Edit state
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDescription, setEditDescription] = useState(task.description || '')
  const [editPriority, setEditPriority] = useState<TaskPriority>(task.priority)
  const [editDueDate, setEditDueDate] = useState(task.due_date || '')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isCompleted = task.status === 'completed'

  const handleToggle = () => {
    if (onToggle) {
      onToggle(task)
      return
    }

    startTransition(async () => {
      const nextStatus = isCompleted ? 'pending' : 'completed'
      const res = await toggleTaskStatusAction(task.id, nextStatus)
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to update task status')
      }
    })
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const trimmedTitle = editTitle.trim()
    if (!trimmedTitle) {
      setErrorMessage('Task title cannot be empty.')
      return
    }

    const updatedData: Task = {
      ...task,
      title: trimmedTitle,
      description: editDescription.trim() || null,
      priority: editPriority,
      due_date: editDueDate || null,
    }

    if (onUpdate) {
      onUpdate(updatedData)
      setIsEditing(false)
      return
    }

    startTransition(async () => {
      const res = await updateTaskAction(task.id, {
        title: trimmedTitle,
        description: editDescription.trim() || null,
        priority: editPriority,
        dueDate: editDueDate || null,
      })

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to update task')
      } else {
        setIsEditing(false)
      }
    })
  }

  const handleCancelEdit = () => {
    setEditTitle(task.title)
    setEditDescription(task.description || '')
    setEditPriority(task.priority)
    setEditDueDate(task.due_date || '')
    setErrorMessage(null)
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(task.id)
      return
    }

    startTransition(async () => {
      const res = await deleteTaskAction(task.id)
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to delete task')
        setIsConfirmingDelete(false)
      }
    })
  }

  // Due date formatting and overdue check
  const formatDueDate = (dateStr: string | null): { formatted: string; isOverdue: boolean; isToday: boolean } | null => {
    if (!dateStr) return null
    try {
      // Split YYYY-MM-DD to avoid timezone shifting
      const [year, month, day] = dateStr.split('-').map(Number)
      if (!year || !month || !day) {
        return { formatted: dateStr, isOverdue: false, isToday: false }
      }
      const date = new Date(year, month - 1, day)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const target = new Date(year, month - 1, day)
      target.setHours(0, 0, 0, 0)

      const isOverdue = !isCompleted && target.getTime() < today.getTime()
      const isToday = target.getTime() === today.getTime()

      const formatted = date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      })

      return {
        formatted,
        isOverdue,
        isToday,
      }
    } catch {
      return { formatted: dateStr, isOverdue: false, isToday: false }
    }
  }

  const dueDateInfo = formatDueDate(task.due_date)

  const priorityBadges: Record<TaskPriority, { label: string; className: string }> = {
    low: {
      label: 'Low',
      className: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    },
    medium: {
      label: 'Medium',
      className: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    },
    high: {
      label: 'High',
      className: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    },
  }

  return (
    <div
      className={`group bg-white dark:bg-gray-900 rounded-xl border transition-all ${
        isCompleted
          ? 'border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/60 opacity-80'
          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 shadow-xs hover:shadow-sm'
      } ${isPending ? 'opacity-60 pointer-events-none' : ''}`}
    >
      {errorMessage && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border-b border-red-100 dark:border-red-800 text-xs text-red-600 dark:text-red-300 flex justify-between items-center">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-700 font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {isEditing ? (
        /* Edit Mode */
        <form onSubmit={handleSaveEdit} className="p-4 space-y-3">
          <div>
            <label htmlFor={`edit-title-${task.id}`} className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Title
            </label>
            <input
              id={`edit-title-${task.id}`}
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-300 dark:border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
              disabled={isPending}
            />
          </div>

          <div>
            <label htmlFor={`edit-desc-${task.id}`} className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Description
            </label>
            <textarea
              id={`edit-desc-${task.id}`}
              rows={2}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Add details or notes..."
              className="w-full text-xs text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-300 dark:border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden resize-y"
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Priority</label>
              <div className="flex gap-1.5">
                {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setEditPriority(p)}
                    className={`flex-1 text-xs py-1 px-2 rounded-md border capitalize cursor-pointer transition-all ${
                      editPriority === p
                        ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300 font-semibold ring-1 ring-indigo-400 dark:ring-indigo-600'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor={`edit-due-${task.id}`} className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                Due Date
              </label>
              <input
                id={`edit-due-${task.id}`}
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="w-full text-xs text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 rounded-md p-1.5 border border-gray-300 dark:border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={isPending}
              className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !editTitle.trim()}
              className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        /* Normal View Mode */
        <div className="p-4 flex items-start gap-3.5">
          {/* Status Checkbox Button */}
          <button
            type="button"
            onClick={handleToggle}
            disabled={isPending}
            aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
            className={`mt-0.5 shrink-0 min-w-[28px] min-h-[28px] rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
              isCompleted
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-gray-800'
            }`}
          >
            {isCompleted && (
              <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3
                className={`text-sm font-semibold leading-snug break-words ${
                  isCompleted ? 'line-through text-gray-400 dark:text-gray-500 font-normal' : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                {task.title}
              </h3>

              {/* Priority Badge */}
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                  priorityBadges[task.priority].className
                }`}
              >
                {priorityBadges[task.priority].label}
              </span>

              {/* Due Date Badge */}
              {dueDateInfo && (
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                    dueDateInfo.isOverdue
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 font-semibold'
                      : dueDateInfo.isToday
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800 font-semibold'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {dueDateInfo.isOverdue
                    ? `Overdue: ${dueDateInfo.formatted}`
                    : dueDateInfo.isToday
                    ? 'Due Today'
                    : `Due ${dueDateInfo.formatted}`}
                </span>
              )}
            </div>

            {/* Description */}
            {task.description && (
              <p
                className={`text-xs mt-1 whitespace-pre-wrap ${
                  isCompleted ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {task.description}
              </p>
            )}
          </div>

          {/* Actions: Edit & Delete */}
          <div className="shrink-0 flex items-center gap-1">
            {isConfirmingDelete ? (
              <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/50 p-1 rounded-lg border border-red-200 dark:border-red-900 animate-in fade-in-50">
                <span className="text-[11px] font-medium text-red-700 dark:text-red-300 px-1">Delete?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="text-xs bg-red-600 text-white font-semibold px-2.5 py-1 rounded-md hover:bg-red-700 transition-colors cursor-pointer min-h-[32px]"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  disabled={isPending}
                  className="text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium px-2.5 py-1 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer min-h-[32px]"
                >
                  No
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  disabled={isPending}
                  aria-label="Edit task"
                  className="min-w-[36px] min-h-[36px] flex items-center justify-center p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                  title="Edit task"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  disabled={isPending}
                  aria-label="Delete task"
                  className="min-w-[36px] min-h-[36px] flex items-center justify-center p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                  title="Delete task"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
