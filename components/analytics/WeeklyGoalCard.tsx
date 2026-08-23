'use client'

import { useState, useTransition } from 'react'
import type { WeeklyGoalData } from '@/lib/data/analytics'
import { formatStudyDuration } from '@/lib/analytics/utils'
import { updateWeeklyGoalAction } from '@/lib/actions/analytics'

export interface WeeklyGoalCardProps {
  data: WeeklyGoalData
}

export default function WeeklyGoalCard({ data }: WeeklyGoalCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [goalHoursInput, setGoalHoursInput] = useState<string>(String(data.goalHours || Math.round(data.goalMinutes / 60)))
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Local optimistic state
  const [currentGoalHours, setCurrentGoalHours] = useState<number>(data.goalHours || Math.round(data.goalMinutes / 60))

  const goalMinutes = currentGoalHours * 60
  const progressPercent = Math.min(100, Math.round((data.currentMinutes / goalMinutes) * 100))
  const remainingMinutes = Math.max(0, goalMinutes - data.currentMinutes)
  const isAchieved = data.currentMinutes >= goalMinutes

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const numHours = parseFloat(goalHoursInput)
    if (isNaN(numHours) || numHours < 1 || numHours > 168) {
      setError('Please enter a goal between 1 and 168 hours.')
      return
    }

    startTransition(async () => {
      const res = await updateWeeklyGoalAction(numHours)
      if (!res.success) {
        setError(res.error || 'Failed to update weekly goal.')
      } else {
        setCurrentGoalHours(numHours)
        setIsEditing(false)
      }
    })
  }

  return (
    <div id="weekly-goal" className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col h-full space-y-4">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Weekly Study Goal
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Target: {currentGoalHours}h per week
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing && (
            <button
              type="button"
              onClick={() => {
                setGoalHoursInput(String(currentGoalHours))
                setError(null)
                setIsEditing(true)
              }}
              className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              Edit
            </button>
          )}

          {isAchieved ? (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span>🎉</span>
              <span>Achieved</span>
            </span>
          ) : (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400">
              {progressPercent}%
            </span>
          )}
        </div>
      </div>

      {/* Inline Goal Editor Modal / Form */}
      {isEditing ? (
        <form onSubmit={handleSave} className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-3 animate-in fade-in duration-150">
          <div>
            <label htmlFor="goal-hours" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Set Weekly Study Target (Hours)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="goal-hours"
                type="number"
                min="1"
                max="168"
                step="1"
                value={goalHoursInput}
                onChange={(e) => setGoalHoursInput(e.target.value)}
                disabled={isPending}
                required
                className="w-24 text-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">hours / week</span>
            </div>
            {error && <p className="text-[11px] text-rose-500 mt-1 font-medium">{error}</p>}
          </div>

          <div className="flex items-center gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={isPending}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              {isPending ? 'Saving...' : 'Save Goal'}
            </button>
          </div>
        </form>
      ) : (
        /* Progress View */
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {formatStudyDuration(data.currentMinutes)}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                / {currentGoalHours}h
              </span>
            </div>

            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {isAchieved ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Goal complete!</span>
              ) : (
                <span>{formatStudyDuration(remainingMinutes)} remaining</span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700/60">
            <div
              style={{ width: `${progressPercent}%` }}
              className={`h-full rounded-full transition-all duration-700 ${
                isAchieved
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-indigo-500 to-indigo-600'
              }`}
            />
          </div>
        </div>
      )}
    </div>
  )
}
