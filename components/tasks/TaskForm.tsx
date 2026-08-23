'use client'

import { useState, useTransition } from 'react'
import { createTaskAction } from '@/lib/actions/tasks'
import type { TaskPriority } from '@/lib/data/tasks'

export default function TaskForm() {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState<string | null>(null)

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
        // Reset form
        setTitle('')
        setDescription('')
        setPriority('medium')
        setDueDate('')
        setIsOpen(false)
      }
    })
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs transition-all overflow-hidden mb-8">
      <form onSubmit={handleSubmit} className="p-5">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 font-semibold text-xs ml-2 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="task-title" className="sr-only">
              Task Title
            </label>
            <input
              id="task-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setIsOpen(true)}
              placeholder="What do you need to study or work on?"
              className="w-full text-base font-medium text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-hidden py-1 border-b border-transparent focus:border-gray-300 dark:focus:border-gray-700 transition-colors bg-transparent"
              disabled={isPending}
            />
          </div>

          {/* Expandable options */}
          {(isOpen || title.length > 0) && (
            <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800 animate-in fade-in-50 duration-150">
              <div>
                <label htmlFor="task-description" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Description (optional)
                </label>
                <textarea
                  id="task-description"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details, notes, or links..."
                  className="w-full text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-gray-50 dark:bg-gray-800/80 rounded-lg p-2.5 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden transition-all resize-y"
                  disabled={isPending}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Priority Selector */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Priority
                  </label>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => {
                      const isSelected = priority === p
                      let activeStyle = ''
                      if (p === 'low') {
                        activeStyle = isSelected
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-semibold ring-1 ring-emerald-400 dark:ring-emerald-600'
                          : 'bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/60 border-emerald-100 dark:border-emerald-900'
                      } else if (p === 'medium') {
                        activeStyle = isSelected
                          ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-semibold ring-1 ring-amber-400 dark:ring-amber-600'
                          : 'bg-amber-50/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100/70 dark:hover:bg-amber-950/60 border-amber-100 dark:border-amber-900'
                      } else {
                        activeStyle = isSelected
                          ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700 font-semibold ring-1 ring-rose-400 dark:ring-rose-600'
                          : 'bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 hover:bg-rose-100/70 dark:hover:bg-rose-950/60 border-rose-100 dark:border-rose-900'
                      }

                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          disabled={isPending}
                          className={`flex-1 capitalize text-xs py-1.5 px-3 rounded-lg border transition-all cursor-pointer text-center ${activeStyle}`}
                        >
                          {p}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label htmlFor="task-due-date" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Due Date (optional)
                  </label>
                  <input
                    id="task-due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    disabled={isPending}
                    className="w-full text-xs text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/80 rounded-lg p-2 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    setError(null)
                  }}
                  disabled={isPending}
                  className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !title.trim()}
                  className="inline-flex items-center justify-center text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  {isPending ? (
                    <span className="flex items-center gap-1.5">
                      <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Adding...
                    </span>
                  ) : (
                    'Add Task'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
