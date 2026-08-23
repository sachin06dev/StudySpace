'use client'

import React, { useState } from 'react'
import { INITIAL_TASKS, type PreviewTask } from './previewDemoData'

export default function TasksPreview() {
  const [tasks, setTasks] = useState<PreviewTask[]>(INITIAL_TASKS)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'normal'>('high')

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    const newTask: PreviewTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      category: 'Study Goal',
      priority: newTaskPriority,
      dueDate: 'Today',
      completed: false,
    }
    setTasks((prev) => [newTask, ...prev])
    setNewTaskTitle('')
  }

  const pendingTasks = tasks.filter((t) => !t.completed)
  const completedTasks = tasks.filter((t) => t.completed)

  const displayedTasks =
    filter === 'all' ? tasks : filter === 'pending' ? pendingTasks : completedTasks

  const priorityStyles = {
    high: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    medium: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    normal: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  }

  return (
    <div className="p-3 sm:p-4 md:p-5 space-y-3.5 text-xs select-none">
      {/* Header & Dynamic Stats Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100 dark:border-gray-800 min-w-0">
        <div className="min-w-0">
          <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 dark:text-gray-100 truncate">
            Study Tasks &amp; Goals
          </h3>
          <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            Organize assignments, lecture reviews, and daily focus milestones.
          </p>
        </div>

        {/* Dynamic Interactive Stats Pill */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-gray-100 dark:bg-gray-800/80 px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-semibold text-gray-600 dark:text-gray-300 border border-gray-200/80 dark:border-gray-700/80 shrink-0">
          <span className="text-amber-600 dark:text-amber-400">{pendingTasks.length} pending</span>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <span className="text-emerald-600 dark:text-emerald-400">{completedTasks.length} completed</span>
        </div>
      </div>

      {/* Quick Add Demo Task Form */}
      <form onSubmit={handleAddTask} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a new demo task (e.g. Solve Binary Search tree)..."
          className="flex-1 min-w-[180px] bg-white dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 border border-gray-200/80 dark:border-gray-700/80 rounded-xl px-3 py-1.5 sm:py-2 text-xs focus:outline-hidden focus:border-indigo-500"
        />
        <select
          value={newTaskPriority}
          onChange={(e) => setNewTaskPriority(e.target.value as 'high' | 'medium' | 'normal')}
          className="bg-white dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200/80 dark:border-gray-700/80 rounded-xl px-2 py-1.5 sm:py-2 text-xs focus:outline-hidden focus:border-indigo-500 cursor-pointer hidden sm:block shrink-0"
        >
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="normal">Normal</option>
        </select>
        <button
          type="submit"
          disabled={!newTaskTitle.trim()}
          className="px-3 sm:px-3.5 py-1.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold rounded-xl text-xs shadow-2xs transition-colors shrink-0 cursor-pointer"
        >
          Add Task
        </button>
      </form>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-gray-100 dark:border-gray-800 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-2.5 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
            filter === 'all'
              ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          All ({tasks.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('pending')}
          className={`px-2.5 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
            filter === 'pending'
              ? 'bg-amber-600 text-white'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          Pending ({pendingTasks.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('completed')}
          className={`px-2.5 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
            filter === 'completed'
              ? 'bg-emerald-600 text-white'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          Completed ({completedTasks.length})
        </button>
      </div>

      {/* Task List Items */}
      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
        {displayedTasks.map((task) => (
          <div
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className={`group p-2 sm:p-2.5 rounded-xl border flex items-center justify-between gap-2.5 sm:gap-3 transition-all cursor-pointer min-w-0 ${
              task.completed
                ? 'bg-gray-50/70 dark:bg-gray-900/40 border-gray-200/60 dark:border-gray-800/60 opacity-80'
                : 'bg-white dark:bg-gray-800/90 border-gray-200/80 dark:border-gray-700/80 hover:border-indigo-300 dark:hover:border-indigo-600 shadow-2xs'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {/* Checkbox button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleTask(task.id)
                }}
                className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md flex items-center justify-center text-[9px] sm:text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                  task.completed
                    ? 'bg-emerald-500 text-white'
                    : 'border-2 border-indigo-400 dark:border-indigo-500 hover:border-indigo-600 dark:hover:border-indigo-400 bg-white dark:bg-gray-800'
                }`}
              >
                {task.completed ? '✓' : ''}
              </button>

              <div className="min-w-0 flex-1">
                <p
                  className={`text-[11px] sm:text-xs font-medium text-gray-900 dark:text-gray-100 truncate ${
                    task.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''
                  }`}
                >
                  {task.title}
                </p>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                  <span className="truncate">{task.category}</span>
                  <span>•</span>
                  <span className="shrink-0">Due {task.dueDate}</span>
                </div>
              </div>
            </div>

            {/* Priority and Status Badges */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-semibold border ${
                  priorityStyles[task.priority]
                }`}
              >
                {task.priority.toUpperCase()}
              </span>
              <span
                className={`px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-semibold hidden sm:inline-block ${
                  task.completed
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                {task.completed ? 'Done' : 'To Do'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
