'use client'

import { useState } from 'react'
import { BarChart3 } from 'lucide-react'
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
    <div id="weekly-chart" className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header & Comparison summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[var(--accent)]" />
            <h3 className="text-base font-bold text-[var(--foreground)]">
              Study Time — This Week
            </h3>
          </div>
          <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
            Monday to Sunday focus breakdown & daily metrics
          </p>
        </div>

        {/* Weekly Stats & Comparison Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-[var(--foreground-muted)]">Total This Week</div>
            <div className="text-base font-bold text-[var(--accent)]">
              {data.formattedWeekTotal}
            </div>
          </div>

          <div className="h-8 w-px bg-[var(--border-subtle)] hidden sm:block" />

          <div className="text-right hidden sm:block">
            <div className="text-xs text-[var(--foreground-muted)]">Daily Average</div>
            <div className="text-sm font-semibold text-[var(--foreground)]">
              {data.formattedDailyAverage}
            </div>
          </div>

          {/* Comparison pill */}
          {data.vsLastWeekStatus === 'up' && data.vsLastWeekPercent !== null && (
            <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-2.5 py-1.5 rounded-xl">
              <span>↑</span>
              <span>+{data.vsLastWeekPercent}% vs last week</span>
            </div>
          )}

          {data.vsLastWeekStatus === 'down' && data.vsLastWeekPercent !== null && (
            <div className="flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold px-2.5 py-1.5 rounded-xl">
              <span>↓</span>
              <span>{data.vsLastWeekPercent}% vs last week</span>
            </div>
          )}

          {data.vsLastWeekStatus === 'same' && (
            <div className="flex items-center gap-1 bg-[var(--surface-muted)] border border-[var(--border-subtle)] text-[var(--foreground-muted)] text-xs font-medium px-2.5 py-1.5 rounded-xl">
              <span>=</span>
              <span>0% vs last week</span>
            </div>
          )}

          {data.vsLastWeekStatus === 'no_data' && (
            <div className="text-xs text-[var(--foreground-muted)] bg-[var(--surface-muted)] border border-[var(--border-subtle)] px-2.5 py-1 rounded-xl">
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
              <div className={`text-[11px] font-semibold text-[var(--foreground)] h-4 transition-transform ${isHovered ? 'scale-110 text-[var(--accent)] font-bold' : ''}`}>
                {day.studyMinutes > 0 ? day.formattedDuration : ''}
              </div>

              {/* Bar track */}
              <div className={`w-full max-w-[48px] h-40 bg-[var(--surface-muted)] rounded-2xl flex flex-col justify-end p-1 relative overflow-hidden border transition-all duration-150 ${
                isHovered
                  ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/20'
                  : 'border-[var(--border-subtle)]'
              }`}>
                {/* Qualifying indicator line at 20m mark */}
                {maxMinutes >= 20 && (
                  <div
                    style={{ bottom: `${(20 / maxMinutes) * 100}%` }}
                    className="absolute left-0 right-0 border-b border-dashed border-[var(--border-strong)] pointer-events-none z-10"
                    title="20m Qualifying Threshold"
                  />
                )}

                {/* Animated Fill Bar */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-xl transition-all duration-[var(--duration-very-slow)] [transition-timing-function:var(--ease-smooth-out)] relative ${
                    day.isToday
                      ? 'bg-[var(--accent)] shadow-xs'
                      : day.isQualifying
                      ? 'bg-[var(--accent)] opacity-85'
                      : day.studyMinutes > 0
                      ? 'bg-purple-200 dark:bg-purple-900/60'
                      : 'bg-transparent'
                  } ${isHovered ? 'brightness-110' : ''}`}
                >
                  {/* Qualifying check badge */}
                  {day.isQualifying && (
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[var(--surface)] text-emerald-500 text-[9px] flex items-center justify-center font-bold shadow-xs">
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
                      ? 'text-[var(--accent)] font-bold'
                      : 'text-[var(--foreground-muted)]'
                  }`}
                >
                  {day.dayName}
                </span>
                {day.isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-0.5" />
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
          className="bg-[var(--surface-overlay)] text-[var(--foreground)] backdrop-blur-md border border-[var(--border-subtle)] rounded-xl px-3.5 py-2.5 shadow-xl text-xs space-y-1.5 min-w-[160px] animate-in fade-in zoom-in-[0.98] duration-[var(--duration-quick)] [animation-timing-function:var(--ease-out)]"
        >
          <div className="font-semibold text-[var(--foreground)] border-b border-[var(--border-subtle)] pb-1 flex items-center justify-between gap-2">
            <span>{formatTooltipDate(hoveredDay.dateStr)}</span>
            {hoveredDay.isToday && (
              <span className="text-[10px] bg-[var(--accent-subtle)] text-[var(--accent)] px-1.5 py-0.5 rounded font-mono">
                Today
              </span>
            )}
          </div>

          <div className="space-y-1 pt-0.5">
            <div className="flex justify-between items-center text-[var(--accent)] font-bold">
              <span>Study time:</span>
              <span>{hoveredDay.studyMinutes > 0 ? hoveredDay.formattedDuration : '0 min'}</span>
            </div>

            <div className="flex justify-between items-center text-[var(--foreground-muted)] text-[11px]">
              <span>Pomodoros:</span>
              <span>{hoveredDay.pomodoroCount || 0}</span>
            </div>

            <div className="flex justify-between items-center text-[11px] pt-0.5 border-t border-[var(--border-subtle)]">
              <span className="text-[var(--foreground-muted)]">Qualifying day:</span>
              <span className={hoveredDay.isQualifying ? 'text-emerald-500 font-semibold' : 'text-[var(--foreground-muted)] font-normal'}>
                {hoveredDay.isQualifying ? 'Yes (≥20m)' : 'No (<20m)'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Chart Footer Note */}
      <div className="flex items-center justify-between text-[11px] text-[var(--foreground-muted)] pt-2 border-t border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <span className="w-3 border-b border-dashed border-[var(--border-strong)]" />
          <span>Dashed line indicates 20-minute daily qualifying threshold</span>
        </div>
        <div className="hidden sm:block">
          Previous week total: <span className="font-semibold text-[var(--foreground)]">{data.formattedPreviousWeekTotal}</span>
        </div>
      </div>
    </div>
  )
}
