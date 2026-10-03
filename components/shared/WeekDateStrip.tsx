'use client'

import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface WeekDateStripProps {
  selectedDate: string // YYYY-MM-DD
  onSelectDate: (date: string) => void
  datesWithClasses?: Set<string>
  className?: string
  allowWeekNavigation?: boolean
}

/**
 * Returns Monday of the week for a given YYYY-MM-DD date.
 */
function getStartOfWeek(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const day = date.getDay() // 0 = Sun, 1 = Mon ...
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  return date
}

function formatDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function WeekDateStrip({
  selectedDate,
  onSelectDate,
  datesWithClasses,
  className = '',
  allowWeekNavigation = true,
}: WeekDateStripProps) {
  const startOfWeek = getStartOfWeek(selectedDate)

  // Generate 7 days (Monday to Sunday)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    const dateStr = formatDateStr(d)
    const isSelected = dateStr === selectedDate
    const isToday = formatDateStr(new Date()) === dateStr
    const hasClasses = datesWithClasses ? datesWithClasses.has(dateStr) : false
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
    const dayNum = d.getDate()
    const monthName = d.toLocaleDateString('en-US', { month: 'short' })

    return {
      date: d,
      dateStr,
      dayName,
      dayNum,
      monthName,
      isSelected,
      isToday,
      hasClasses,
    }
  })

  const handlePrevWeek = () => {
    const prev = new Date(startOfWeek)
    prev.setDate(prev.getDate() - 7)
    onSelectDate(formatDateStr(prev))
  }

  const handleNextWeek = () => {
    const next = new Date(startOfWeek)
    next.setDate(next.getDate() + 7)
    onSelectDate(formatDateStr(next))
  }

  const handleToday = () => {
    onSelectDate(formatDateStr(new Date()))
  }

  const currentMonthLabel = `${days[0].monthName} ${days[0].date.getFullYear()}`

  return (
    <div
      className={`bg-white/80 dark:bg-(--surface)/80 backdrop-blur-md rounded-2xl border border-gray-200/80 dark:border-(--border-subtle) p-3.5 shadow-2xs space-y-2.5 ${className}`}
    >
      {/* Navigation Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            {currentMonthLabel}
          </span>
          <button
            type="button"
            onClick={handleToday}
            className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 px-2 py-0.5 rounded-md hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors cursor-pointer"
          >
            Today
          </button>
        </div>

        {allowWeekNavigation && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevWeek}
              aria-label="Previous week"
              className="p-1 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextWeek}
              aria-label="Next week"
              className="p-1 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 7-Day Strip */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((item) => (
          <button
            key={item.dateStr}
            type="button"
            onClick={() => onSelectDate(item.dateStr)}
            className={`flex flex-col items-center justify-center py-2 sm:py-2.5 px-1 rounded-xl transition-all relative cursor-pointer group ${
              item.isSelected
                ? 'bg-purple-600 text-white shadow-xs font-bold'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800/80 text-gray-700 dark:text-gray-300'
            }`}
          >
            <span
              className={`text-[10px] uppercase font-semibold tracking-wider ${
                item.isSelected
                  ? 'text-purple-100'
                  : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
              }`}
            >
              {item.dayName}
            </span>
            <span className="text-sm sm:text-base font-bold leading-tight mt-0.5">
              {item.dayNum}
            </span>

            {/* Indicator Dots: Classes present or today marker */}
            <div className="flex items-center gap-1 mt-1 h-1.5">
              {item.hasClasses && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    item.isSelected
                      ? 'bg-white'
                      : 'bg-purple-500 dark:bg-purple-400'
                  }`}
                />
              )}
              {item.isToday && !item.isSelected && (
                <span className="w-1 h-1 rounded-full bg-emerald-500" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default WeekDateStrip
