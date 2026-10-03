'use client'

import { useState, useEffect } from 'react'
import { Calendar, CheckCircle2, ChevronDown, ChevronUp, AlertCircle, Clock } from 'lucide-react'
import TaskItem from './TaskItem'
import StatsPill from '@/components/shared/StatsPill'
import {
  toggleTaskStatusAction,
  deleteTaskAction,
  updateTaskAction,
} from '@/lib/actions/tasks'
import type { Task } from '@/lib/data/tasks'
import { realtimeEventBus } from '@/lib/realtime/eventBus'

interface TaskListProps {
  tasks: Task[]
}

export default function TaskList({ tasks }: TaskListProps) {
  const [prevTasks, setPrevTasks] = useState(tasks)
  const [items, setItems] = useState<Task[]>(tasks)
  const [showCompleted, setShowCompleted] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Listen to cross-client real-time events on tasks
  useEffect(() => {
    const unsubscribe = realtimeEventBus.subscribe<Task>('tasks', (payload) => {
      if (payload.eventType === 'DELETE') {
        const deletedId = (payload.old?.id || payload.new?.id) as string
        if (deletedId) {
          setItems((current) => current.filter((t) => t.id !== deletedId))
        }
      } else if (payload.eventType === 'INSERT') {
        if (payload.new && payload.new.id) {
          setItems((current) => {
            if (current.some((t) => t.id === payload.new.id)) return current
            return [payload.new as Task, ...current]
          })
        }
      } else if (payload.eventType === 'UPDATE') {
        if (payload.new && payload.new.id) {
          setItems((current) =>
            current.map((t) => (t.id === payload.new.id ? (payload.new as Task) : t))
          )
        }
      }
    })

    return () => unsubscribe()
  }, [])

  // Sync state with server-provided tasks when prop changes
  if (prevTasks !== tasks) {
    setPrevTasks(tasks)
    setItems(tasks)
  }

  const isTodayOrOverdue = (task: Task) => {
    if (!task.due_date) return false
    try {
      const [year, month, day] = task.due_date.split('-').map(Number)
      if (!year || !month || !day) return false
      const target = new Date(year, month - 1, day)
      target.setHours(23, 59, 59, 999)
      const todayEnd = new Date()
      todayEnd.setHours(23, 59, 59, 999)
      return target.getTime() <= todayEnd.getTime()
    } catch {
      return false
    }
  }

  const pendingTasks = items.filter((t) => t.status === 'pending')
  const completedTasks = items.filter((t) => t.status === 'completed')

  const todayTasks = pendingTasks.filter(isTodayOrOverdue)
  const upcomingTasks = pendingTasks.filter((t) => !isTodayOrOverdue(t))

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
      <div className="bg-[var(--surface)] rounded-2xl border border-dashed border-[var(--border-subtle)] p-12 text-center transition-colors">
        <div className="mx-auto w-12 h-12 rounded-xl bg-[var(--surface-muted)] text-[var(--accent)] flex items-center justify-center mb-3 border border-[var(--border-subtle)]">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-[var(--foreground)] mb-1">No tasks yet</h3>
        <p className="text-xs text-[var(--foreground-muted)] max-w-sm mx-auto leading-relaxed">
          Create your first academic task above to organize coursework, exam prep, and deadlines.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Dynamic Stats Pill */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-[var(--foreground-muted)] font-medium">
          {pendingTasks.length} active {pendingTasks.length === 1 ? 'task' : 'tasks'}
        </div>
        <StatsPill
          items={[
            { value: pendingTasks.length, label: 'pending' },
            { value: completedTasks.length, label: 'completed', highlight: true },
          ]}
        />
      </div>

      {/* Global Task Error Banner */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex justify-between items-center animate-in fade-in-50">
          <span className="flex items-center gap-1.5 font-medium">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="font-semibold hover:underline ml-3 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. Today / Overdue Section */}
      {todayTasks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Today & Overdue</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {todayTasks.length}
              </span>
            </h2>
          </div>

          <div className="space-y-2">
            {todayTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        </div>
      )}

      {/* 2. Upcoming / Backlog Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Upcoming & Backlog</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--surface-muted)] text-[var(--foreground-muted)] border border-[var(--border-subtle)]">
              {upcomingTasks.length}
            </span>
          </h2>
        </div>

        {upcomingTasks.length === 0 && todayTasks.length === 0 ? (
          <div className="bg-[var(--surface-muted)] rounded-2xl border border-[var(--border-subtle)] p-6 text-center text-xs text-[var(--foreground-muted)]">
            All pending tasks are done. Great job.
          </div>
        ) : upcomingTasks.length === 0 ? (
          <div className="bg-[var(--surface-muted)] rounded-2xl border border-[var(--border-subtle)] p-4 text-center text-xs text-[var(--foreground-muted)]">
            No upcoming tasks beyond today.
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingTasks.map((task) => (
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

      {/* 3. Completed Section (Collapsible) */}
      {completedTasks.length > 0 && (
        <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
          <button
            type="button"
            onClick={() => setShowCompleted(!showCompleted)}
            className="w-full flex items-center justify-between text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider hover:text-[var(--foreground)] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Completed</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--surface-muted)] text-[var(--foreground-muted)] border border-[var(--border-subtle)]">
                {completedTasks.length}
              </span>
            </div>

            <span className="text-xs font-normal lowercase text-[var(--accent)] hover:underline flex items-center gap-1">
              <span>{showCompleted ? 'Hide' : 'Show'}</span>
              {showCompleted ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </span>
          </button>

          {showCompleted && (
            <div className="space-y-2 animate-in fade-in-50 duration-150">
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
