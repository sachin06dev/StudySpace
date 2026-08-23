'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toggleTaskStatusAction } from '@/lib/actions/tasks'
import type { Task, TaskPriority } from '@/lib/data/tasks'

interface DashboardTaskListProps {
  tasks: Task[]
  totalTasks: number
  completedTasks: number
}

const priorityStyles: Record<TaskPriority, { bg: string; text: string; border: string; label: string }> = {
  high: {
    bg: 'bg-rose-50 dark:bg-rose-950/60',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
    label: 'High',
  },
  medium: {
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    label: 'Med',
  },
  low: {
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    label: 'Low',
  },
}

export default function DashboardTaskList({
  tasks,
  totalTasks,
  completedTasks,
}: DashboardTaskListProps) {
  const [prevProps, setPrevProps] = useState({ tasks, totalTasks, completedTasks })
  const [items, setItems] = useState<Task[]>(tasks)
  const [completedCount, setCompletedCount] = useState<number>(completedTasks)
  const [totalCount, setTotalCount] = useState<number>(totalTasks)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (
    prevProps.tasks !== tasks ||
    prevProps.totalTasks !== totalTasks ||
    prevProps.completedTasks !== completedTasks
  ) {
    setPrevProps({ tasks, totalTasks, completedTasks })
    setItems(tasks)
    setCompletedCount(completedTasks)
    setTotalCount(totalTasks)
  }

  const handleToggle = async (taskId: string) => {
    setErrorMessage(null)
    const prevItems = items
    const prevCompleted = completedCount

    // 1. Optimistically remove from pending tasks list & increment completed count
    setItems((curr) => curr.filter((t) => t.id !== taskId))
    setCompletedCount((prev) => Math.min(totalCount, prev + 1))

    // 2. Dispatch background server action with targetStatus = 'completed'
    try {
      const res = await toggleTaskStatusAction(taskId, 'completed')
      if (!res.success) {
        setItems(prevItems)
        setCompletedCount(prevCompleted)
        setErrorMessage(res.error || 'Failed to update task')
      }
    } catch {
      setItems(prevItems)
      setCompletedCount(prevCompleted)
      setErrorMessage('Network error while updating task')
    }
  }

  const formatDueDate = (
    dateStr: string | null
  ): { formatted: string; isOverdue: boolean; isToday: boolean } | null => {
    if (!dateStr) return null
    try {
      const [year, month, day] = dateStr.split('-').map(Number)
      if (!year || !month || !day) return { formatted: dateStr, isOverdue: false, isToday: false }

      const target = new Date(year, month - 1, day)
      target.setHours(0, 0, 0, 0)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const isOverdue = target.getTime() < today.getTime()
      const isToday = target.getTime() === today.getTime()

      const formatted = isToday
        ? 'Today'
        : target.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })

      return { formatted, isOverdue, isToday }
    } catch {
      return { formatted: dateStr, isOverdue: false, isToday: false }
    }
  }

  const hasTasks = items.length > 0

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full transition-colors">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Today&apos;s Tasks</h2>
            {items.length > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                {items.length}
              </span>
            )}
          </div>

          <Link
            href="/tasks"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 hover:underline"
          >
            <span>View all</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-3 p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex justify-between items-center animate-in fade-in-50">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-500 hover:text-red-700 font-semibold cursor-pointer ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Task List */}
        {hasTasks ? (
          <div className="space-y-2.5">
            {items.map((task) => {
              const priority = priorityStyles[task.priority] || priorityStyles.medium
              const dueInfo = formatDueDate(task.due_date)

              return (
                <div
                  key={task.id}
                  className="group flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 hover:bg-white dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Checkbox button */}
                    <button
                      type="button"
                      onClick={() => handleToggle(task.id)}
                      aria-label="Mark task as completed"
                      className="min-w-[28px] min-h-[28px] rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-600 dark:hover:border-indigo-400 bg-white dark:bg-gray-800 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                    >
                    </button>

                    {/* Task Title */}
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate" title={task.title}>
                      {task.title}
                    </span>
                  </div>

                  {/* Badges: Priority & Due Date */}
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                    {dueInfo && (
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                          dueInfo.isOverdue
                            ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                            : dueInfo.isToday
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <svg
                          className="w-3 h-3 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="whitespace-nowrap">{dueInfo.formatted}</span>
                      </span>
                    )}

                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-md border whitespace-nowrap ${priority.bg} ${priority.text} ${priority.border}`}
                    >
                      {priority.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="py-8 px-4 text-center bg-gray-50/60 dark:bg-gray-800/40 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
            <div className="mx-auto w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2.5">
              {totalCount > 0 && completedCount === totalCount ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              )}
            </div>

            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {totalCount > 0 && completedCount === totalCount
                ? 'All caught up!'
                : 'No pending tasks'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-xs mx-auto">
              {totalCount > 0 && completedCount === totalCount
                ? `You have completed all ${totalCount} tasks.`
                : 'Plan your next study assignment or goal.'}
            </p>

            <div className="mt-3.5">
              <Link
                href="/tasks"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 px-3 py-1.5 rounded-lg transition-colors"
              >
                <span>{totalCount === 0 ? 'Create task' : 'Manage tasks'}</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer summary bar if tasks exist */}
      {totalCount > 0 && (
        <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            {completedCount} of {totalCount} tasks completed
          </span>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            {Math.round((completedCount / totalCount) * 100)}%
          </span>
        </div>
      )}
    </div>
  )
}
