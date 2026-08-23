'use client'

import { useState } from 'react'
import type { TimeOfDayData } from '@/lib/data/analytics'
import { formatStudyDuration } from '@/lib/analytics/utils'

export interface ProductiveTimeCardProps {
  data: TimeOfDayData
}

export default function ProductiveTimeCard({ data }: ProductiveTimeCardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(data.peakPeriod)

  const periods = [
    {
      name: 'Morning',
      time: '5 AM – 12 PM',
      minutes: data.morningMinutes,
      pomodoros: data.morningPomodoros,
      icon: '🌅',
    },
    {
      name: 'Afternoon',
      time: '12 PM – 5 PM',
      minutes: data.afternoonMinutes,
      pomodoros: data.afternoonPomodoros,
      icon: '☀️',
    },
    {
      name: 'Evening',
      time: '5 PM – 9 PM',
      minutes: data.eveningMinutes,
      pomodoros: data.eveningPomodoros,
      icon: '🌆',
    },
    {
      name: 'Night',
      time: '9 PM – 5 AM',
      minutes: data.nightMinutes,
      pomodoros: data.nightPomodoros,
      icon: '🌙',
    },
  ]

  const totalMins = data.morningMinutes + data.afternoonMinutes + data.eveningMinutes + data.nightMinutes

  return (
    <div id="productive-time" className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-lg">⏰</span>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Peak Focus Window
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Time-of-day study productivity & rhythm
            </p>
          </div>
        </div>

        {data.hasEnoughData && data.peakPeriod && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400">
            {data.peakPeriod} Peak ({data.peakPercentage}%)
          </span>
        )}
      </div>

      {!data.hasEnoughData ? (
        <div className="text-center py-6 px-4 bg-slate-50/60 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-1.5">
          <div className="text-2xl">⏳</div>
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Discovering your rhythm
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Complete at least 3 Pomodoro focus sessions to unlock insights into your most productive time of day.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {periods.map((p) => {
            const isPeak = p.name === data.peakPeriod
            const isSelected = selectedPeriod === p.name
            const percent = totalMins > 0 ? Math.round((p.minutes / totalMins) * 100) : 0

            return (
              <div
                key={p.name}
                onClick={() => setSelectedPeriod(p.name)}
                onMouseEnter={() => setSelectedPeriod(p.name)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-400/30 shadow-xs'
                    : isPeak
                    ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200/80 dark:border-indigo-800/60'
                    : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/50 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                    <span>{p.icon}</span>
                    <span>{p.name}</span>
                  </span>
                  <span className={`font-bold ${isPeak ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
                    {percent}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  <span>{p.time}</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {formatStudyDuration(p.minutes)}
                  </span>
                </div>

                {/* Micro Progress Bar */}
                <div className="w-full bg-slate-200/70 dark:bg-slate-700/70 h-1 rounded-full overflow-hidden mt-2">
                  <div
                    style={{ width: `${percent}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      isPeak ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-slate-400 dark:bg-slate-500'
                    }`}
                  />
                </div>

                {/* Interactive Detail Pill */}
                {isSelected && p.pomodoros > 0 && (
                  <div className="mt-2 pt-1.5 border-t border-indigo-200/60 dark:border-indigo-800/60 text-[10px] text-indigo-700 dark:text-indigo-300 font-medium flex justify-between animate-in fade-in">
                    <span>🍅 {p.pomodoros} {p.pomodoros === 1 ? 'session' : 'sessions'}</span>
                    <span>{percent}% of tracked time</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
