'use client'

import { useState } from 'react'
import { Clock, Sunrise, Sun, Sunset, Moon, Hourglass, Timer } from 'lucide-react'
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
      Icon: Sunrise,
    },
    {
      name: 'Afternoon',
      time: '12 PM – 5 PM',
      minutes: data.afternoonMinutes,
      pomodoros: data.afternoonPomodoros,
      Icon: Sun,
    },
    {
      name: 'Evening',
      time: '5 PM – 9 PM',
      minutes: data.eveningMinutes,
      pomodoros: data.eveningPomodoros,
      Icon: Sunset,
    },
    {
      name: 'Night',
      time: '9 PM – 5 AM',
      minutes: data.nightMinutes,
      pomodoros: data.nightPomodoros,
      Icon: Moon,
    },
  ]

  const totalMins = data.morningMinutes + data.afternoonMinutes + data.eveningMinutes + data.nightMinutes

  return (
    <div id="productive-time" className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[var(--accent)]" />
          <div>
            <h3 className="text-base font-bold text-[var(--foreground)]">
              Peak Focus Window
            </h3>
            <p className="text-xs text-[var(--foreground-muted)]">
              Time-of-day study productivity & rhythm
            </p>
          </div>
        </div>

        {data.hasEnoughData && data.peakPeriod && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-[var(--accent-subtle)] border border-[var(--border-subtle)] text-[var(--accent)]">
            {data.peakPeriod} Peak ({data.peakPercentage}%)
          </span>
        )}
      </div>

      {!data.hasEnoughData ? (
        <div className="text-center py-6 px-4 bg-[var(--surface-muted)] border border-dashed border-[var(--border-subtle)] rounded-xl space-y-2">
          <Hourglass className="w-6 h-6 mx-auto text-[var(--foreground-muted)]" />
          <h4 className="text-sm font-semibold text-[var(--foreground)]">
            Discovering your rhythm
          </h4>
          <p className="text-xs text-[var(--foreground-muted)] max-w-sm mx-auto">
            Complete at least 3 Pomodoro focus sessions to unlock insights into your most productive time of day.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {periods.map((p) => {
            const isPeak = p.name === data.peakPeriod
            const isSelected = selectedPeriod === p.name
            const percent = totalMins > 0 ? Math.round((p.minutes / totalMins) * 100) : 0
            const Icon = p.Icon

            return (
              <div
                key={p.name}
                onClick={() => setSelectedPeriod(p.name)}
                onMouseEnter={() => setSelectedPeriod(p.name)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--accent-subtle)] border-[var(--accent)] ring-1 ring-[var(--accent)]/30 shadow-xs'
                    : isPeak
                    ? 'bg-[var(--accent-subtle)]/50 border-[var(--border-subtle)]'
                    : 'bg-[var(--surface-muted)] border-[var(--border-subtle)] hover:bg-[var(--surface)]'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-[var(--foreground)]">
                    <Icon className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>{p.name}</span>
                  </span>
                  <span className={`font-bold ${isPeak ? 'text-[var(--accent)]' : 'text-[var(--foreground-muted)]'}`}>
                    {percent}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[var(--foreground-muted)] mt-1">
                  <span>{p.time}</span>
                  <span className="font-semibold text-[var(--foreground)]">
                    {formatStudyDuration(p.minutes)}
                  </span>
                </div>

                {/* Micro Progress Bar */}
                <div className="w-full bg-[var(--surface-overlay)] h-1 rounded-full overflow-hidden mt-2 border border-[var(--border-subtle)]">
                  <div
                    style={{ width: `${percent}%` }}
                    className={`h-full rounded-full transition-all duration-[var(--duration-very-slow)] [transition-timing-function:var(--ease-smooth-out)] ${
                      isPeak ? 'bg-[var(--accent)]' : 'bg-[var(--foreground-muted)] opacity-40'
                    }`}
                  />
                </div>

                {/* Interactive Detail Pill */}
                {isSelected && p.pomodoros > 0 && (
                  <div className="mt-2 pt-1.5 border-t border-[var(--border-subtle)] text-[10px] text-[var(--accent)] font-medium flex justify-between animate-in fade-in">
                    <span className="flex items-center gap-1">
                      <Timer className="w-3 h-3" />
                      <span>{p.pomodoros} {p.pomodoros === 1 ? 'session' : 'sessions'}</span>
                    </span>
                    <span>{percent}% tracked</span>
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
