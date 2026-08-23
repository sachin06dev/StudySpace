'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  formatDateTooltip,
  getZonedDateParts,
  normalizeDayOfWeek,
} from '@/lib/analytics/utils'
import type {
  DailyActivity,
  StreakStats,
  YearlyActivityData,
} from '@/lib/data/analytics'

export interface HeatmapGridProps {
  days: DailyActivity[]
  streaks: StreakStats
  timezone: string
  mode?: 'dashboard' | 'analytics'
  period?: '90d' | '365d' | 'ytd'
  interactive?: boolean
  showLegend?: boolean
  showStats?: boolean
  yearlyData?: Record<number, YearlyActivityData>
  availableYears?: number[]
  selectedYear?: number
}

export default function HeatmapGrid({
  days: defaultDays,
  streaks: defaultStreaks,
  timezone,
  mode = 'analytics',
  interactive = true,
  showLegend = true,
  showStats,
  yearlyData,
}: HeatmapGridProps) {
  const isDashboardMode = mode === 'dashboard'
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Current calendar year in user's target timezone
  const currentYearNum = useMemo(() => {
    return getZonedDateParts(new Date(), timezone).year
  }, [timezone])

  // Current month index (0 = Jan, 1 = Feb, ..., 7 = Aug, ..., 11 = Dec)
  const currentMonthIndex = useMemo(() => {
    return getZonedDateParts(new Date(), timezone).month - 1
  }, [timezone])

  // Dataset strictly for the current calendar year (Jan 1 to Dec 31)
  const currentDataset = useMemo(() => {
    if (yearlyData && yearlyData[currentYearNum]) {
      return yearlyData[currentYearNum]
    }
    return {
      days: defaultDays,
      streaks: defaultStreaks,
      year: currentYearNum,
      isCurrentYear: true,
    }
  }, [yearlyData, currentYearNum, defaultDays, defaultStreaks])

  // Full calendar year (Jan 1 - Dec 31)
  const activeDays = useMemo(() => currentDataset.days || [], [currentDataset])
  const activeStreaks = currentDataset.streaks

  // Total activities count in the current year
  const totalActivitiesCount = useMemo(() => {
    return activeDays.reduce((acc, d) => {
      if (!d) return acc
      return acc + (d.pomodoroCount || 0) + (d.notesCount || 0) + (d.tasksCompletedCount || 0)
    }, 0)
  }, [activeDays])

  const [hoveredDay, setHoveredDay] = useState<DailyActivity | null>(null)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)

  // Organize the flat array into columns of 7 days (Monday to Sunday)
  const { weeks, monthHeaders } = useMemo(() => {
    if (!activeDays || activeDays.length === 0) {
      return { weeks: [], monthHeaders: [] }
    }

    const weeksList: (DailyActivity | null)[][] = []
    let currentWeek: (DailyActivity | null)[] = []

    // Pad the very first week so the first day lands on its correct Monday-first weekday
    const firstDay = activeDays[0]
    const firstDayMonIndex = normalizeDayOfWeek(firstDay.dayOfWeek)

    for (let p = 0; p < firstDayMonIndex; p++) {
      currentWeek.push(null)
    }

    for (const day of activeDays) {
      currentWeek.push(day)
      if (currentWeek.length === 7) {
        weeksList.push(currentWeek)
        currentWeek = []
      }
    }

    // Pad the last week if not full
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null)
      }
      weeksList.push(currentWeek)
    }

    // Compute month label positions across week columns
    const headers: { monthName: string; colIndex: number; monthNum: number }[] = []
    let lastMonth = -1
    let lastColIdx = -99

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    weeksList.forEach((week, colIdx) => {
      const firstValidDay = week.find((d) => d !== null)
      if (!firstValidDay) return

      // Check if this week contains the 1st of a month, or if it's the very first column
      const startOfMonthDay = week.find((d) => d !== null && d.dateStr.endsWith('-01'))
      const keyDay = startOfMonthDay || (colIdx === 0 ? firstValidDay : null)

      if (keyDay) {
        const monthNum = parseInt(keyDay.dateStr.split('-')[1], 10) - 1
        if (monthNum !== lastMonth && colIdx - lastColIdx >= 2) {
          headers.push({
            monthName: monthNames[monthNum],
            colIndex: colIdx,
            monthNum,
          })
          lastMonth = monthNum
          lastColIdx = colIdx
        }
      } else if (colIdx > 0) {
        const monthNum = parseInt(firstValidDay.dateStr.split('-')[1], 10) - 1
        if (monthNum !== lastMonth && lastMonth !== -1 && colIdx - lastColIdx >= 3) {
          headers.push({
            monthName: monthNames[monthNum],
            colIndex: colIdx,
            monthNum,
          })
          lastMonth = monthNum
          lastColIdx = colIdx
        }
      }
    })

    return { weeks: weeksList, monthHeaders: headers }
  }, [activeDays])

  // Center the current month horizontally on initial mount / mobile viewport entry
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const animId = requestAnimationFrame(() => {
      if (container.scrollWidth > container.clientWidth) {
        const targetMonthEl =
          (container.querySelector(`[data-month="${currentMonthIndex}"]`) as HTMLElement | null) ||
          (container.querySelector(`[data-month-col="${currentMonthIndex}"]`) as HTMLElement | null)

        if (targetMonthEl) {
          const targetScroll = Math.max(
            0,
            targetMonthEl.offsetLeft + targetMonthEl.offsetWidth / 2 - container.clientWidth / 2
          )
          container.scrollLeft = targetScroll
        }
      }
    })

    return () => cancelAnimationFrame(animId)
  }, [currentMonthIndex, weeks.length])

  // Cell level color mapper (StudySpace purple theme)
  const getCellColorClass = (level: number, isNull: boolean) => {
    if (isNull) return 'bg-transparent border-transparent pointer-events-none'
    switch (level) {
      case 1:
        return 'bg-indigo-200 dark:bg-indigo-950/80 border-indigo-300 dark:border-indigo-800/60 hover:ring-2 hover:ring-indigo-400'
      case 2:
        return 'bg-indigo-400 dark:bg-indigo-700 border-indigo-500 dark:border-indigo-600 hover:ring-2 hover:ring-indigo-300'
      case 3:
        return 'bg-indigo-600 dark:bg-indigo-500 border-indigo-700 dark:border-indigo-400 hover:ring-2 hover:ring-indigo-200'
      case 4:
        return 'bg-indigo-800 dark:bg-indigo-400 border-indigo-900 dark:border-indigo-300 shadow-xs hover:ring-2 hover:ring-indigo-100'
      case 0:
      default:
        return 'bg-slate-100 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/50 hover:ring-2 hover:ring-slate-400'
    }
  }

  // Format localized date for tooltip: e.g. "Saturday, August 22, 2026"
  const formatTooltipDate = (dateStr: string) => {
    return formatDateTooltip(dateStr)
  }

  const renderStats = showStats ?? !isDashboardMode

  return (
    <div
      id={isDashboardMode ? 'dashboard-heatmap' : 'heatmap-grid'}
      className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs transition-all ${
        isDashboardMode ? 'p-5 sm:p-6 space-y-4' : 'p-5 sm:p-6 space-y-4'
      }`}
    >
      {/* 1. Header Area */}
      {isDashboardMode ? (
        /* Dashboard Mode Header: "Your Study Journey" + Compact Streak Badges */
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
              🗓️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Your Study Journey
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
                  {currentYearNum}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                🔥 <span className="font-semibold text-slate-700 dark:text-slate-200">{activeStreaks.currentStreak} day streak</span> • {activeStreaks.activeDays} active days • Longest: {activeStreaks.longestStreak} days
              </p>
            </div>
          </div>

          <Link
            href="/analytics"
            className="self-start sm:self-auto text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center gap-1 shrink-0"
          >
            <span>View Analytics</span>
            <span>→</span>
          </Link>
        </div>
      ) : (
        /* Full Analytics Header: Title / Submissions Summary + Current Year + Compact Stats */
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          {/* Left: Summary Title & Subtitle */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {totalActivitiesCount}{' '}
                {totalActivitiesCount === 1 ? 'activity' : 'activities'} in {currentYearNum}
              </h2>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Contribution activity tracked in your timezone ({timezone})
            </p>
          </div>

          {/* Right: Compact Streak & Active Day Badges */}
          {renderStats && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
              <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1.5">
                <span className="text-slate-500 dark:text-slate-400">Total active days</span>
                <span className="font-bold text-slate-900 dark:text-white">{activeStreaks.activeDays}</span>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1.5">
                <span className="text-slate-500 dark:text-slate-400">Max streak</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {activeStreaks.longestStreak} {activeStreaks.longestStreak === 1 ? 'day' : 'days'}
                </span>
              </div>

              {activeStreaks.currentStreak > 0 && (
                <div className="px-3 py-1.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/50 flex items-center gap-1.5">
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">🔥 Current</span>
                  <span className="font-bold text-indigo-700 dark:text-indigo-300">
                    {activeStreaks.currentStreak} {activeStreaks.currentStreak === 1 ? 'day' : 'days'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. Edge-to-Edge Grid (Fills rectangle box evenly, centered on mount for mobile) */}
      <div ref={scrollContainerRef} className="overflow-x-auto pb-1 scrollbar-thin">
        <div className="w-full min-w-[700px] select-none">
          {/* Week Columns Grid: 53 columns evenly distributed to 100% width */}
          <div className="w-full flex items-start gap-[2px] sm:gap-[3px] md:gap-[4px]">
            {weeks.map((week, colIdx) => {
              const firstDayInWeek = week.find((d) => d !== null)
              const colMonth = firstDayInWeek
                ? parseInt(firstDayInWeek.dateStr.split('-')[1], 10) - 1
                : undefined

              return (
                <div
                  key={`col-${colIdx}`}
                  data-month-col={colMonth}
                  className="flex-1 flex flex-col gap-[2px] sm:gap-[3px] md:gap-[4px]"
                >
                  {week.map((day, rowIdx) => {
                    if (!day) {
                      return (
                        <div
                          key={`empty-${colIdx}-${rowIdx}`}
                          className="w-full aspect-square rounded-[2px] sm:rounded-[3px] bg-transparent pointer-events-none"
                        />
                      )
                    }

                    const isHovered = hoveredDay?.dateStr === day.dateStr

                    return (
                      <button
                        key={day.dateStr}
                        type="button"
                        aria-label={`${formatTooltipDate(day.dateStr)}: ${day.studyMinutes} minutes studied`}
                        onMouseEnter={(e) => {
                          if (!interactive) return
                          setHoveredDay(day)
                          const rect = e.currentTarget.getBoundingClientRect()
                          setMousePos({ x: rect.left + rect.width / 2, y: rect.top })
                        }}
                        onMouseLeave={() => setHoveredDay(null)}
                        onClick={(e) => {
                          if (!interactive) return
                          setHoveredDay(day)
                          const rect = e.currentTarget.getBoundingClientRect()
                          setMousePos({ x: rect.left + rect.width / 2, y: rect.top })
                        }}
                        onFocus={(e) => {
                          if (!interactive) return
                          setHoveredDay(day)
                          const rect = e.currentTarget.getBoundingClientRect()
                          setMousePos({ x: rect.left + rect.width / 2, y: rect.top })
                        }}
                        onBlur={() => setHoveredDay(null)}
                        className={`w-full aspect-square rounded-[2px] sm:rounded-[3px] border transition-all duration-150 cursor-pointer ${getCellColorClass(
                          day.level,
                          false
                        )} ${
                          day.isToday
                            ? 'ring-1.5 ring-indigo-500 dark:ring-indigo-400 ring-offset-1 dark:ring-offset-slate-900'
                            : ''
                        } ${isHovered ? 'scale-150 z-20 shadow-md' : ''}`}
                      />
                    )
                  })}
                </div>
              )
            })}
          </div>

          {/* Month labels along bottom matching column positions */}
          <div
            className="w-full grid gap-[2px] sm:gap-[3px] md:gap-[4px] mt-2.5 text-[10px] font-medium text-slate-400 dark:text-slate-500 select-none"
            style={{
              gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
            }}
          >
            {monthHeaders.map((m, idx) => (
              <div
                key={`${m.monthName}-${m.colIndex}-${idx}`}
                data-month={m.monthNum}
                style={{
                  gridColumnStart: m.colIndex + 1,
                }}
                className="text-left truncate overflow-visible"
              >
                {m.monthName}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Interactive Floating Tooltip */}
      {hoveredDay && mousePos && (
        <div
          style={{
            position: 'fixed',
            left: `${mousePos.x}px`,
            top: `${mousePos.y - 10}px`,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
          className="bg-slate-900/95 dark:bg-slate-800/95 text-white backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-2 shadow-xl text-xs space-y-1 min-w-[160px] animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="font-semibold text-slate-200 border-b border-slate-700/60 pb-1 flex items-center justify-between gap-2">
            <span>{formatTooltipDate(hoveredDay.dateStr)}</span>
            {hoveredDay.isToday && (
              <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded font-mono">
                Today
              </span>
            )}
          </div>

          <div className="pt-0.5 space-y-0.5">
            <div className="font-bold text-indigo-300">
              {hoveredDay.studyMinutes > 0 ? (
                <span>⏱️ {hoveredDay.formattedDuration} studied</span>
              ) : (
                <span className="text-slate-400 font-normal">No activity</span>
              )}
            </div>

            {hoveredDay.pomodoroCount > 0 && (
              <div className="text-[11px] text-slate-300">
                🍅 {hoveredDay.pomodoroCount}{' '}
                {hoveredDay.pomodoroCount === 1 ? 'Pomodoro' : 'Pomodoros'} completed
              </div>
            )}

            {hoveredDay.notesCount > 0 && (
              <div className="text-[11px] text-slate-300">
                📝 {hoveredDay.notesCount} {hoveredDay.notesCount === 1 ? 'note' : 'notes'} created
              </div>
            )}

            {hoveredDay.tasksCompletedCount > 0 && (
              <div className="text-[11px] text-slate-300">
                ✅ {hoveredDay.tasksCompletedCount}{' '}
                {hoveredDay.tasksCompletedCount === 1 ? 'task' : 'tasks'} completed
              </div>
            )}

            {hoveredDay.isQualifying && (
              <div className="text-[10px] text-emerald-400 font-medium pt-0.5">
                ✓ Qualifying study day (≥20m)
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Legend & Motivational Footer */}
      {showLegend && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5">
            {isDashboardMode ? (
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                Keep going. You&apos;re building consistency.
              </span>
            ) : (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                <span>A qualifying study day requires at least 20 minutes of focus time.</span>
              </>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <span className="text-[11px]">Less</span>
            <div className="flex items-center gap-1">
              <div
                className="w-2.5 h-2.5 rounded-[2px] bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/50"
                title="Level 0: 0m"
              />
              <div
                className="w-2.5 h-2.5 rounded-[2px] bg-indigo-200 dark:bg-indigo-950/80 border border-indigo-300 dark:border-indigo-800/60"
                title="Level 1: 1–20m"
              />
              <div
                className="w-2.5 h-2.5 rounded-[2px] bg-indigo-400 dark:bg-indigo-700 border border-indigo-500 dark:border-indigo-600"
                title="Level 2: 21–45m"
              />
              <div
                className="w-2.5 h-2.5 rounded-[2px] bg-indigo-600 dark:bg-indigo-500 border border-indigo-700 dark:border-indigo-400"
                title="Level 3: 46–90m"
              />
              <div
                className="w-2.5 h-2.5 rounded-[2px] bg-indigo-800 dark:bg-indigo-400 border border-indigo-900 dark:border-indigo-300"
                title="Level 4: 90m+"
              />
            </div>
            <span className="text-[11px]">More</span>
          </div>
        </div>
      )}
    </div>
  )
}

export { HeatmapGrid as StudyActivityHeatmap }
