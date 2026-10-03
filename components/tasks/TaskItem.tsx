'use client'

import { useState, useTransition } from 'react'
import { Check, Calendar, Pencil, Trash2, AlertCircle } from 'lucide-react'
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

  return (
    <div
      className={`group bg-[var(--surface)] rounded-2xl border transition-all ${
        isCompleted
          ? 'border-[var(--border-subtle)] bg-[var(--surface-muted)]/40 opacity-75'
          : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)] shadow-xs'
      } ${isPending ? 'opacity-60 pointer-events-none' : ''}`}
    >
      {errorMessage && (
        <div className="p-3 bg-rose-500/10 border-b border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex justify-between items-center">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errorMessage}</span>
          </span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-xs font-semibold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {isEditing ? (
        /* Edit Mode */
        <form onSubmit={handleSaveEdit} className="p-4 space-y-3">
          <div>
            <label htmlFor={`edit-title-${task.id}`} className="block text-xs font-semibold text-[var(--foreground-muted)] mb-1">
              Title
            </label>
            <input
              id={`edit-title-${task.id}`}
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full text-sm font-medium text-[var(--foreground)] bg-[var(--surface-muted)] rounded-xl p-2.5 border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:outline-hidden"
              disabled={isPending}
            />
          </div>

          <div>
            <label htmlFor={`edit-desc-${task.id}`} className="block text-xs font-semibold text-[var(--foreground-muted)] mb-1">
              Description
            </label>
            <textarea
              id={`edit-desc-${task.id}`}
              rows={2}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Add details or notes..."
              className="w-full text-xs text-[var(--foreground)] bg-[var(--surface-muted)] rounded-xl p-2 border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:outline-hidden resize-y"
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--foreground-muted)] mb-1">Priority</label>
              <div className="flex gap-1.5">
                {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setEditPriority(p)}
                    className={`flex-1 text-xs py-1.5 px-2 rounded-lg border capitalize cursor-pointer transition-all ${
                      editPriority === p
                        ? 'bg-[var(--surface)] text-[var(--foreground)] font-semibold border-[var(--accent)] shadow-xs'
                        : 'bg-[var(--surface-muted)] border-[var(--border-subtle)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor={`edit-due-${task.id}`} className="block text-xs font-semibold text-[var(--foreground-muted)] mb-1">
                Due Date
              </label>
              <input
                id={`edit-due-${task.id}`}
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="w-full text-xs text-[var(--foreground)] bg-[var(--surface-muted)] rounded-xl p-1.5 border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={isPending}
              className="text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)] px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--surface-muted)] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !editTitle.trim()}
              className="text-xs font-semibold text-white bg-[var(--accent)] hover:opacity-90 px-3.5 py-1.5 rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
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
            className={`mt-0.5 shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
              isCompleted
                ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                : 'border-[var(--border-strong)] hover:border-[var(--accent)] bg-[var(--surface)]'
            }`}
          >
            {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </button>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Quiet priority dot */}
              {task.priority === 'high' && (
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="High Priority" />
              )}
              {task.priority === 'medium' && (
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Medium Priority" />
              )}

              <h3
                className={`text-sm font-semibold leading-snug break-words ${
                  isCompleted
                    ? 'line-through text-[var(--foreground-muted)] font-normal'
                    : 'text-[var(--foreground)]'
                }`}
              >
                {task.title}
              </h3>

              {/* Due Date Badge */}
              {dueDateInfo && (
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                    dueDateInfo.isOverdue
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-semibold'
                      : dueDateInfo.isToday
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-semibold'
                      : 'bg-[var(--surface-muted)] text-[var(--foreground-muted)] border-[var(--border-subtle)]'
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  {dueDateInfo.isOverdue
                    ? `Overdue: ${dueDateInfo.formatted}`
                    : dueDateInfo.isToday
                    ? 'Today'
                    : dueDateInfo.formatted}
                </span>
              )}
            </div>

            {/* Description */}
            {task.description && (
              <p
                className={`text-xs mt-1 whitespace-pre-wrap ${
                  isCompleted ? 'text-[var(--foreground-muted)] line-through' : 'text-[var(--foreground-muted)]'
                }`}
              >
                {task.description}
              </p>
            )}
          </div>

          {/* Actions: Edit & Delete */}
          <div className="shrink-0 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            {isConfirmingDelete ? (
              <div className="flex items-center gap-1 bg-rose-500/10 p-1 rounded-xl border border-rose-500/20 animate-in fade-in-50">
                <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400 px-1">Delete?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="text-xs bg-rose-600 text-white font-semibold px-2 py-0.5 rounded-lg hover:bg-rose-700 transition-colors cursor-pointer"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  disabled={isPending}
                  className="text-xs bg-[var(--surface)] text-[var(--foreground)] font-medium px-2 py-0.5 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
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
                  className="w-8 h-8 flex items-center justify-center text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)] rounded-xl transition-colors cursor-pointer"
                  title="Edit task"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  disabled={isPending}
                  aria-label="Delete task"
                  className="w-8 h-8 flex items-center justify-center text-[var(--foreground-muted)] hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
