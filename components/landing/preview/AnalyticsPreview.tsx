'use client'

import React, { useState } from 'react'
import { PREVIEW_ANALYTICS } from './previewDemoData'

export default function AnalyticsPreview() {
  const [hoveredDay, setHoveredDay] = useState<string | null>(null)
  const maxHours = 4.0

  const activeDayData = PREVIEW_ANALYTICS.weeklyHours.find((d) => d.day === hoveredDay)

  return (
    <div className="p-3 sm:p-4 md:p-5 space-y-3.5 text-xs select-none">
      {/* Header & Quick Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100 dark:border-gray-800 min-w-0">
        <div className="min-w-0">
          <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 dark:text-gray-100 truncate">
            Study Analytics &amp; Consistency
          </h3>
          <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            Track daily study hours, pomodoro streaks, and subject focus balance.
          </p>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-orange-50 dark:bg-orange-950/60 px-2.5 sm:px-3 py-1 rounded-xl text-orange-700 dark:text-orange-300 font-bold text-[10px] sm:text-[11px] border border-orange-200/80 dark:border-orange-800/80 shadow-2xs shrink-0">
          <span>🔥</span>
          <span>7-Day Active Streak</span>
        </div>
      </div>

      {/* 4 Quick Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
        <div className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-2xs min-w-0">
          <span className="text-[9px] sm:text-[10px] text-gray-500 font-medium block truncate">Total Time</span>
          <span className="text-xs sm:text-base font-extrabold text-indigo-600 dark:text-indigo-400 block mt-0.5 truncate">
            {PREVIEW_ANALYTICS.summary.totalStudyTime}
          </span>
          <span className="text-[8px] sm:text-[9px] text-emerald-600 font-semibold mt-0.5 block truncate">
            +18% this week
          </span>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-2xs min-w-0">
          <span className="text-[9px] sm:text-[10px] text-gray-500 font-medium block truncate">Pomodoros</span>
          <span className="text-xs sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 block mt-0.5 truncate">
            {PREVIEW_ANALYTICS.summary.pomodoroCount} Done
          </span>
          <span className="text-[8px] sm:text-[9px] text-gray-400 mt-0.5 block truncate">Target: 30</span>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-2xs min-w-0">
          <span className="text-[9px] sm:text-[10px] text-gray-500 font-medium block truncate">Consistency</span>
          <span className="text-xs sm:text-base font-extrabold text-purple-600 dark:text-purple-400 block mt-0.5 truncate">
            {PREVIEW_ANALYTICS.summary.consistencyScore}%
          </span>
          <span className="text-[8px] sm:text-[9px] text-purple-600 font-semibold mt-0.5 block truncate">Outstanding</span>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-2xs min-w-0">
          <span className="text-[9px] sm:text-[10px] text-gray-500 font-medium block truncate">Tasks Done</span>
          <span className="text-xs sm:text-base font-extrabold text-amber-600 dark:text-amber-400 block mt-0.5 truncate">
            {PREVIEW_ANALYTICS.summary.tasksDone}
          </span>
          <span className="text-[8px] sm:text-[9px] text-amber-600 font-semibold mt-0.5 block truncate">85% completed</span>
        </div>
      </div>

      {/* Split View: Weekly Bar Chart on Left, Subject Distribution on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5 items-stretch">
        {/* Left: Weekly Study Hours Bar Chart (7 cols on lg+) */}
        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/70 p-3 sm:p-3.5 space-y-2.5 shadow-2xs flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 dark:border-gray-800 min-w-0">
              <span className="font-bold text-gray-900 dark:text-gray-100 text-[10px] sm:text-xs truncate">
                Weekly Study Time
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 truncate ml-2">
                {activeDayData ? `${activeDayData.fullDay}: ${activeDayData.label}` : 'Hover bars to inspect'}
              </span>
            </div>

            {/* Interactive Bar Chart */}
            <div className="pt-3 pb-1 flex items-end justify-between gap-1.5 sm:gap-2 h-32 sm:h-36 min-w-0">
              {PREVIEW_ANALYTICS.weeklyHours.map((item) => {
                const heightPercent = (item.hours / maxHours) * 100
                const isHovered = hoveredDay === item.day
                return (
                  <div
                    key={item.day}
                    onMouseEnter={() => setHoveredDay(item.day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className="flex-1 flex flex-col items-center gap-1 group cursor-pointer min-w-0"
                  >
                    {/* Tooltip on hover */}
                    <div
                      className={`text-[8px] sm:text-[9px] font-mono font-bold px-1 py-0.5 rounded bg-gray-900 text-white transition-opacity ${
                        isHovered ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      {item.hours}h
                    </div>

                    {/* Bar Pill */}
                    <div className="w-full max-w-[24px] sm:max-w-[28px] bg-gray-100 dark:bg-gray-800 rounded-t-lg h-20 sm:h-24 flex items-end p-0.5">
                      <div
                        className={`w-full rounded-t-md transition-all duration-300 ${
                          isHovered
                            ? 'bg-indigo-600'
                            : 'bg-gradient-to-t from-indigo-500 to-indigo-400 group-hover:from-indigo-600 group-hover:to-indigo-500'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>

                    {/* Day label */}
                    <span
                      className={`text-[9px] sm:text-[10px] font-semibold ${
                        isHovered
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {item.day}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between text-[9px] sm:text-[10px] text-gray-400">
            <span>Goal: 20 hrs/wk</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">92% Met</span>
          </div>
        </div>

        {/* Right: Subject Focus Breakdown (5 cols on lg+) */}
        <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/70 p-3 sm:p-3.5 space-y-2.5 shadow-2xs flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 dark:border-gray-800 min-w-0">
              <span className="font-bold text-gray-900 dark:text-gray-100 text-[10px] sm:text-xs truncate">
                Subject Focus
              </span>
              <span className="text-[9px] sm:text-[10px] text-gray-400 shrink-0">4 Subjects</span>
            </div>

            <div className="mt-2.5 space-y-2">
              {PREVIEW_ANALYTICS.subjectBreakdown.map((sb) => (
                <div key={sb.subject} className="space-y-1 min-w-0">
                  <div className="flex items-center justify-between text-[9px] sm:text-[10px] min-w-0">
                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
                      {sb.subject}
                    </span>
                    <span className="text-gray-400 font-mono shrink-0 ml-1">{sb.hours}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${sb.color} rounded-full`}
                      style={{ width: `${sb.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 text-[9px] sm:text-[10px] text-gray-400 flex items-center justify-between">
            <span>Pomodoro Focus</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">● Optimal</span>
          </div>
        </div>
      </div>
    </div>
  )
}
