'use client'

import { useState } from 'react'
import TaskItem from './TaskItem'
import StatsPill from '@/components/shared/StatsPill'
import {
  toggleTaskStatusAction,
  deleteTaskAction,
  updateTaskAction,
} from '@/lib/actions/tasks'
import type { Task } from '@/lib/data/tasks'

interface TaskListProps {
  tasks: Task[]
}

export default function TaskList({ tasks }: TaskListProps) {
  const [prevTasks, setPrevTasks] = useState(tasks)
  const [items, setItems] = useState<Task[]>(tasks)
  const [showCompleted, setShowCompleted] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Sync state with server-provided tasks when prop changes
  if (prevTasks !== tasks) {
    setPrevTasks(tasks)
    setItems(tasks)
  }

  const pendingTasks = items.filter((t) => t.status === 'pending')
  const completedTasks = items.filter((t) => t.status === 'completed')

  // Optimistic Toggle Handler
  const handleToggle = async (task: Task) => {
    setErrorMessage(null)
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed'
    const prevItems = items

    // 1. Optimistic immediate update
    setItems((current) =>
      current.map((t) =>
        t.id === task.id
          ? {
              ...t,
              status: nextStatus,
              completed_at: nextStatus === 'completed' ? new Date().toISOString() : null,
              updated_at: new Date().toISOString(),
            }
          : t
      )
    )

    // 2. Server mutation in background
    try {
      const res = await toggleTaskStatusAction(task.id, nextStatus)
      if (!res.success) {
        setItems(prevItems)
        setErrorMessage(res.error || 'Failed to update task status')
      }
    } catch {
      setItems(prevItems)
      setErrorMessage('Network error while updating task status')
    }
  }

  // Optimistic Delete Handler
  const handleDelete = async (taskId: string) => {
    setErrorMessage(null)
    const prevItems = items

    // 1. Optimistic immediate removal
    setItems((current) => current.filter((t) => t.id !== taskId))

    // 2. Server mutation in background
    try {
      const res = await deleteTaskAction(taskId)
      if (!res.success) {
        setItems(prevItems)
        setErrorMessage(res.error || 'Failed to delete task')
      }
    } catch {
      setItems(prevItems)
      setErrorMessage('Network error while deleting task')
    }
  }

  // Optimistic Edit / Update Handler
  const handleUpdate = async (updatedTask: Task) => {
    setErrorMessage(null)
    const prevItems = items

    // 1. Optimistic immediate update
    setItems((current) =>
      current.map((t) => (t.id === updatedTask.id ? { ...updatedTask, updated_at: new Date().toISOString() } : t))
    )

    // 2. Server mutation in background
    try {
      const res = await updateTaskAction(updatedTask.id, {
        title: updatedTask.title,
        description: updatedTask.description,
        priority: updatedTask.priority,
        dueDate: updatedTask.due_date,
      })
      if (!res.success) {
        setItems(prevItems)
        setErrorMessage(res.error || 'Failed to save task updates')
      }
    } catch {
      setItems(prevItems)
      setErrorMessage('Network error while saving task updates')
    }
  }

  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-800 p-12 text-center transition-colors">
        <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">No tasks yet</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          Create your first task above to start organizing your study goals and assignments.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Dynamic Stats Pill updated instantly on every interaction */}
      <div className="flex justify-end -mt-2">
        <StatsPill
          items={[
            { value: pendingTasks.length, label: 'pending' },
            { value: completedTasks.length, label: 'completed', highlight: true },
          ]}
        />
      </div>

      {/* Global Task Error Banner if an action fails & rolls back */}
      {errorMessage && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex justify-between items-center animate-in fade-in-50">
          <span className="font-medium">{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 font-semibold ml-3 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Pending Tasks Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <span>To Do</span>
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              {pendingTasks.length}
            </span>
          </h2>
        </div>

        {pendingTasks.length === 0 ? (
          <div className="bg-white/60 dark:bg-gray-800/40 rounded-xl border border-gray-200/80 dark:border-gray-800 p-6 text-center text-sm text-gray-500 dark:text-gray-400">
            🎉 All pending tasks are done! Great job.
          </div>
        ) : (
          <div className="space-y-2.5">
            {pendingTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Completed Tasks Section */}
      {completedTasks.length > 0 && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
          <button
            type="button"
            onClick={() => setShowCompleted(!showCompleted)}
            className="w-full flex items-center justify-between mb-3 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <span>Completed</span>
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                {completedTasks.length}
              </span>
            </div>
            <span className="text-xs font-normal lowercase text-indigo-600 dark:text-indigo-400 hover:underline">
              {showCompleted ? 'Hide' : 'Show'}
            </span>
          </button>

          {showCompleted && (
            <div className="space-y-2.5 animate-in fade-in-50 duration-150">
              {completedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

