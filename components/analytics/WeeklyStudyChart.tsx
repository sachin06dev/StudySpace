'use client'

import { useState } from 'react'
import type { WeeklyGraphData, WeeklyGraphDay } from '@/lib/data/analytics'

export interface WeeklyStudyChartProps {
  data: WeeklyGraphData
}

export default function WeeklyStudyChart({ data }: WeeklyStudyChartProps) {
  const [hoveredDay, setHoveredDay] = useState<WeeklyGraphDay | null>(null)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)

  const maxMinutes = Math.max(60, ...data.days.map((d) => d.studyMinutes))

  const formatTooltipDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number)
      const date = new Date(Date.UTC(y, m - 1, d))
      return new Intl.DateTimeFormat('en-US', {
        timeZone: 'UTC',
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      }).format(date)
    } catch {
      return dateStr
    }
  }

  return (
    <div id="weekly-chart" className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header & Comparison summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Study Time — This Week
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monday to Sunday focus breakdown & daily metrics
          </p>
        </div>

        {/* Weekly Stats & Comparison Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-500 dark:text-slate-400">Total This Week</div>
            <div className="text-base font-bold text-indigo-600 dark:text-indigo-400">
              {data.formattedWeekTotal}
            </div>
          </div>

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-500 dark:text-slate-400">Daily Average</div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {data.formattedDailyAverage}
            </div>
          </div>

          {/* Comparison pill */}
          {data.vsLastWeekStatus === 'up' && data.vsLastWeekPercent !== null && (
            <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold px-2.5 py-1.5 rounded-xl">
              <span>↑</span>
              <span>+{data.vsLastWeekPercent}% vs last week</span>
            </div>
          )}

          {data.vsLastWeekStatus === 'down' && data.vsLastWeekPercent !== null && (
            <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs font-semibold px-2.5 py-1.5 rounded-xl">
              <span>↓</span>
              <span>{data.vsLastWeekPercent}% vs last week</span>
            </div>
          )}

          {data.vsLastWeekStatus === 'same' && (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium px-2.5 py-1.5 rounded-xl">
              <span>=</span>
              <span>0% vs last week</span>
            </div>
          )}

          {data.vsLastWeekStatus === 'no_data' && (
            <div className="text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 px-2.5 py-1 rounded-xl">
              No previous-week data
            </div>
          )}
        </div>
      </div>

      {/* Bar Chart Grid */}
      <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-4">
        {data.days.map((day) => {
          const heightPercent = maxMinutes > 0 ? Math.max(8, Math.round((day.studyMinutes / maxMinutes) * 100)) : 8
          const isHovered = hoveredDay?.dateStr === day.dateStr

          return (
            <div
              key={day.dateStr}
              className="flex flex-col items-center gap-2 group cursor-pointer"
              onMouseEnter={(e) => {
                setHoveredDay(day)
                const rect = e.currentTarget.getBoundingClientRect()
                setMousePos({ x: rect.left + rect.width / 2, y: rect.top })
              }}
              onMouseLeave={() => setHoveredDay(null)}
              onClick={(e) => {
                setHoveredDay(day)
                const rect = e.currentTarget.getBoundingClientRect()
                setMousePos({ x: rect.left + rect.width / 2, y: rect.top })
              }}
              onFocus={(e) => {
                setHoveredDay(day)
                const rect = e.currentTarget.getBoundingClientRect()
                setMousePos({ x: rect.left + rect.width / 2, y: rect.top })
              }}
              onBlur={() => setHoveredDay(null)}
              tabIndex={0}
              role="button"
              aria-label={`${formatTooltipDate(day.dateStr)}: ${day.studyMinutes} minutes studied, ${day.pomodoroCount || 0} pomodoros`}
            >
              {/* Top value label */}
              <div className={`text-[11px] font-semibold text-slate-700 dark:text-slate-300 h-4 transition-transform ${isHovered ? 'scale-110 text-indigo-600 dark:text-indigo-400 font-bold' : ''}`}>
                {day.studyMinutes > 0 ? day.formattedDuration : ''}
              </div>

              {/* Bar track */}
              <div className={`w-full max-w-[48px] h-40 bg-slate-100 dark:bg-slate-800/50 rounded-2xl flex flex-col justify-end p-1 relative overflow-hidden border transition-all duration-150 ${
                isHovered
                  ? 'border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-400/20'
                  : 'border-slate-200/50 dark:border-slate-800'
              }`}>
                {/* Qualifying indicator line at 20m mark */}
                {maxMinutes >= 20 && (
                  <div
                    style={{ bottom: `${(20 / maxMinutes) * 100}%` }}
                    className="absolute left-0 right-0 border-b border-dashed border-slate-300 dark:border-slate-700 pointer-events-none z-10"
                    title="20m Qualifying Threshold"
                  />
                )}

                {/* Animated Fill Bar */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-xl transition-all duration-500 relative ${
                    day.isToday
                      ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-md shadow-indigo-500/20'
                      : day.isQualifying
                      ? 'bg-gradient-to-t from-indigo-500 to-indigo-400'
                      : day.studyMinutes > 0
                      ? 'bg-indigo-300 dark:bg-indigo-900/60'
                      : 'bg-transparent'
                  } ${isHovered ? 'brightness-110' : ''}`}
                >
                  {/* Qualifying check badge */}
                  {day.isQualifying && (
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-emerald-600 dark:text-emerald-400 text-[9px] flex items-center justify-center font-bold shadow-xs">
                      ✓
                    </div>
                  )}
                </div>
              </div>

              {/* Day Label */}
              <div className="flex flex-col items-center">
                <span
                  className={`text-xs font-semibold ${
                    day.isToday
                      ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {day.dayName}
                </span>
                {day.isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-0.5" />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Floating Interactive Tooltip */}
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
          className="bg-slate-900/95 dark:bg-slate-800/95 text-white backdrop-blur-md border border-slate-700/80 rounded-xl px-3.5 py-2.5 shadow-xl text-xs space-y-1.5 min-w-[160px] animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="font-semibold text-slate-200 border-b border-slate-700/60 pb-1 flex items-center justify-between gap-2">
            <span>{formatTooltipDate(hoveredDay.dateStr)}</span>
            {hoveredDay.isToday && (
              <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded font-mono">
                Today
              </span>
            )}
          </div>

          <div className="space-y-1 pt-0.5">
            <div className="flex justify-between items-center text-indigo-300 font-bold">
              <span>Study time:</span>
              <span>{hoveredDay.studyMinutes > 0 ? hoveredDay.formattedDuration : '0 min'}</span>
            </div>

            <div className="flex justify-between items-center text-slate-300 text-[11px]">
              <span>Pomodoros:</span>
              <span>{hoveredDay.pomodoroCount || 0}</span>
            </div>

            <div className="flex justify-between items-center text-[11px] pt-0.5 border-t border-slate-700/40">
              <span className="text-slate-400">Qualifying day:</span>
              <span className={hoveredDay.isQualifying ? 'text-emerald-400 font-semibold' : 'text-slate-400 font-normal'}>
                {hoveredDay.isQualifying ? 'Yes (≥20m)' : 'No (<20m)'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Chart Footer Note */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="w-3 border-b border-dashed border-slate-400 dark:border-slate-600" />
          <span>Dashed line indicates 20-minute daily qualifying threshold</span>
        </div>
        <div className="hidden sm:block">
          Previous week total: <span className="font-semibold text-slate-600 dark:text-slate-400">{data.formattedPreviousWeekTotal}</span>
        </div>
      </div>
    </div>
  )
}
