'use client'

import { useState } from 'react'
import type { MonthlySummaryData } from '@/lib/data/analytics'

export interface MonthlySummaryCardProps {
  data: MonthlySummaryData
  monthlySummaries?: Record<string, MonthlySummaryData>
  availableMonthKeys?: string[]
}

export default function MonthlySummaryCard({
  data: initialData,
  monthlySummaries,
  availableMonthKeys,
}: MonthlySummaryCardProps) {
  // If monthlySummaries map is provided, use it for rich month navigation
  const monthKeysList = availableMonthKeys && availableMonthKeys.length > 0
    ? availableMonthKeys
    : [initialData.monthKey || 'current']

  const [currentKeyIndex, setCurrentKeyIndex] = useState<number>(0)

  const activeKey = monthKeysList[currentKeyIndex]
  const currentMonthData = (monthlySummaries && monthlySummaries[activeKey]) || initialData

  const isLatestMonth = currentKeyIndex === 0
  const isOldestMonth = currentKeyIndex >= monthKeysList.length - 1

  const handlePrevMonth = () => {
    if (!isOldestMonth) {
      setCurrentKeyIndex((prev) => prev + 1)
    }
  }

  const handleNextMonth = () => {
    if (!isLatestMonth) {
      setCurrentKeyIndex((prev) => prev - 1)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col h-full space-y-4">
      {/* Header with Month Navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-lg">📅</span>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {currentMonthData.monthName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Monthly overview & daily pace
            </p>
          </div>
        </div>

        {/* Month Stepper: Prev & Next buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={isOldestMonth}
            aria-label="Previous month"
            className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer text-xs font-bold"
          >
            ‹
          </button>

          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 px-1">
            {currentMonthData.isCurrentMonth ? (
              <span className="text-indigo-600 dark:text-indigo-400">Current</span>
            ) : (
              <span>History</span>
            )}
          </span>

          <button
            type="button"
            onClick={handleNextMonth}
            disabled={isLatestMonth}
            aria-label="Next month"
            className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer text-xs font-bold"
          >
            ›
          </button>
        </div>
      </div>

      {/* 4 Key Metrics for Selected Month */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Total Time */}
        <div className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl p-3.5">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span>⏱️</span>
            <span>Total Studied</span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
            {currentMonthData.formattedTotal || '0 min'}
          </div>
        </div>

        {/* Active Days */}
        <div className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl p-3.5">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span>🎯</span>
            <span>Active Days</span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
            {currentMonthData.activeDays || 0} {currentMonthData.activeDays === 1 ? 'day' : 'days'}
          </div>
        </div>

        {/* Daily Average */}
        <div className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl p-3.5">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span>📊</span>
            <span>Daily Average</span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
            {currentMonthData.formattedDailyAverage || '0 min'}
          </div>
        </div>

        {/* Pomodoros Completed */}
        <div className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl p-3.5">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span>🍅</span>
            <span>Pomodoros</span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
            {currentMonthData.pomodoroCount || 0}
          </div>
        </div>
      </div>
    </div>
  )
}
