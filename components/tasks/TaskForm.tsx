'use client'

import { useState, useTransition, useRef } from 'react'
import { Plus, Calendar, AlertCircle } from 'lucide-react'
import { createTaskAction } from '@/lib/actions/tasks'
import type { TaskPriority } from '@/lib/data/tasks'

export default function TaskForm() {
  const [isPending, startTransition] = useTransition()
  const [isExpanded, setIsExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('Please enter a task title.')
      return
    }

    startTransition(async () => {
      const res = await createTaskAction({
        title: trimmedTitle,
        description: description.trim() || null,
        priority,
        dueDate: dueDate || null,
      })

      if (!res.success) {
        setError(res.error || 'Failed to create task. Please try again.')
      } else {
        setTitle('')
        setDescription('')
        setPriority('medium')
        setDueDate('')
        setIsExpanded(false)
      }
    })
  }

  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] shadow-xs transition-all overflow-hidden">
      <form onSubmit={handleSubmit} className="p-4 sm:p-5">
        {error && (
          <div className="mb-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-xs font-semibold hover:underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="space-y-3">
          {/* Quick-add main row */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--surface-muted)] text-[var(--accent)] flex items-center justify-center shrink-0 border border-[var(--border-subtle)]">
              <Plus className="w-4 h-4" />
            </div>

            <input
              ref={inputRef}
              id="task-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              placeholder="Add an academic task or assignment..."
              className="flex-1 text-sm font-medium text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-hidden bg-transparent"
              disabled={isPending}
            />

            {!isExpanded && title.trim().length > 0 && (
              <button
                type="submit"
                disabled={isPending}
                className="text-xs font-semibold text-white bg-[var(--accent)] hover:opacity-90 px-3 py-1.5 rounded-xl transition-colors shrink-0 shadow-xs"
              >
                Add
              </button>
            )}
          </div>

          {/* Expandable Options */}
          {isExpanded && (
            <div className="space-y-3 pt-3 border-t border-[var(--border-subtle)] animate-in fade-in-50 duration-[var(--duration-fast)] [animation-timing-function:var(--ease-smooth-out)]">
              {/* Optional Description */}
              <textarea
                id="task-description"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add assignment details, notes, or reference links..."
                className="w-full text-xs text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] bg-[var(--surface-muted)] rounded-xl p-2.5 border border-[var(--border-subtle)] focus:outline-hidden focus:border-[var(--accent)] resize-y transition-all"
                disabled={isPending}
              />

              {/* Controls bar: Priority pills + Due date + Action buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Priority selector */}
                  <div className="flex items-center gap-1 bg-[var(--surface-muted)] p-1 rounded-xl border border-[var(--border-subtle)] text-xs">
                    {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => {
                      const isSelected = priority === p
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`px-2.5 py-1 rounded-lg text-xs capitalize transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[var(--surface)] text-[var(--foreground)] font-semibold shadow-xs border border-[var(--border-subtle)]'
                              : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                          }`}
                        >
                          {p === 'high' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5" />}
                          {p === 'medium' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />}
                          {p === 'low' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5" />}
                          {p}
                        </button>
                      )
                    })}
                  </div>

                  {/* Due Date Picker */}
                  <div className="flex items-center gap-1.5 bg-[var(--surface-muted)] px-2.5 py-1.5 rounded-xl border border-[var(--border-subtle)] text-xs text-[var(--foreground-muted)]">
                    <Calendar className="w-3.5 h-3.5 text-[var(--foreground-muted)]" />
                    <input
                      id="task-due-date"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      disabled={isPending}
                      className="bg-transparent text-xs text-[var(--foreground)] focus:outline-hidden cursor-pointer"
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsExpanded(false)
                      setError(null)
                    }}
                    disabled={isPending}
                    className="text-xs font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isPending || !title.trim()}
                    className="text-xs font-semibold text-white bg-[var(--accent)] hover:opacity-90 disabled:opacity-50 px-4 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    {isPending ? 'Adding...' : 'Add Task'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
