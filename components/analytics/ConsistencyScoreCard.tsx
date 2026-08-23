'use client'

import { useState } from 'react'
import type { ConsistencyScoreData } from '@/lib/data/analytics'
import { formatStudyDuration } from '@/lib/analytics/utils'

export interface ConsistencyScoreCardProps {
  data: ConsistencyScoreData
}

export default function ConsistencyScoreCard({ data }: ConsistencyScoreCardProps) {
  const [showFormulaModal, setShowFormulaModal] = useState(false)
  const [showImprovementModal, setShowImprovementModal] = useState(false)

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-500 stroke-emerald-500'
    if (score >= 70) return 'text-indigo-500 stroke-indigo-500'
    if (score >= 50) return 'text-blue-500 stroke-blue-500'
    if (score >= 25) return 'text-amber-500 stroke-amber-500'
    return 'text-slate-400 stroke-slate-400'
  }

  // Circular gauge parameters
  const radius = 38
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (data.overallScore / 100) * circumference

  return (
    <>
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col h-full space-y-4">
        {/* Header with Explanation Button */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Consistency Score
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transparent 100-point habit rating
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowFormulaModal(true)}
              className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 p-1.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60 transition-colors cursor-pointer"
              title="How is this calculated?"
            >
              ℹ️ How it works
            </button>

            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {data.ratingLabel}
            </span>
          </div>
        </div>

        {/* Main Score Area */}
        <div className="flex items-center gap-6">
          {/* Radial Circle */}
          <div
            onClick={() => setShowImprovementModal(true)}
            className="relative w-24 h-24 shrink-0 flex items-center justify-center cursor-pointer group"
            title="Click to see ways to improve your score"
          >
            <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
              {/* Background circle */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                className={`transition-all duration-1000 ease-out ${getScoreColor(data.overallScore)}`}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center group-hover:scale-105 transition-transform">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {data.overallScore}
              </span>
              <span className="text-[10px] text-slate-400 font-medium -mt-1">/ 100</span>
            </div>
          </div>

          {/* Sub-Score Breakdown */}
          <div className="flex-1 space-y-2.5">
            {/* Active Days (40 pts) */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <span>Active Days</span>
                  <span className="text-[10px] text-slate-400">({data.breakdown.activeDaysLast30}/30d)</span>
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {data.breakdown.studyDaysScore} / 40
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  style={{ width: `${(data.breakdown.studyDaysScore / 40) * 100}%` }}
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                />
              </div>
            </div>

            {/* Streak (35 pts) */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <span>Streak Factor</span>
                  <span className="text-[10px] text-slate-400">({data.breakdown.currentStreak}/14d)</span>
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {data.breakdown.streakScore} / 35
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  style={{ width: `${(data.breakdown.streakScore / 35) * 100}%` }}
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                />
              </div>
            </div>

            {/* Weekly Goal (25 pts) */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <span>Weekly Goal</span>
                  <span className="text-[10px] text-slate-400">
                    ({formatStudyDuration(data.breakdown.weekStudyMinutes)} / {formatStudyDuration(data.breakdown.goalMinutes)})
                  </span>
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {data.breakdown.goalScore} / 25
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  style={{ width: `${(data.breakdown.goalScore / 25) * 100}%` }}
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action Button */}
        <div className="mt-auto pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setShowImprovementModal(true)}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>💡 How to improve your score</span>
            <span>→</span>
          </button>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Max 100 pts</span>
        </div>
      </div>

      {/* Formula Explanation Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">🧮</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  How Consistency is Calculated
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFormulaModal(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                Your Consistency Score is evaluated across three transparent, habit-forming pillars totaling 100 points:
              </p>

              {/* Pillar 1 */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>1. Active Days (Last 30 Days)</span>
                  <span className="text-indigo-600 dark:text-indigo-400">40 Points Max</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Formula: <code className="font-mono text-slate-700 dark:text-slate-300">(Active Qualifying Days / 30) × 40</code>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Logging ≥20 minutes of study on any calendar day qualifies as an active day.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>2. Streak Factor</span>
                  <span className="text-indigo-600 dark:text-indigo-400">35 Points Max</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Formula: <code className="font-mono text-slate-700 dark:text-slate-300">min(35, (Current Streak / 14) × 35)</code>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Building a 14-day consecutive habit unlocks the full 35 streak points.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>3. Weekly Study Goal Progress</span>
                  <span className="text-indigo-600 dark:text-indigo-400">25 Points Max</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Formula: <code className="font-mono text-slate-700 dark:text-slate-300">min(25, (This Week Focus / Weekly Goal) × 25)</code>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Hitting 100% of your weekly target grants all 25 goal points.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowFormulaModal(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Improvement Guidance Modal */}
      {showImprovementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚀</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Actionable Ways to Improve
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Current Score: <span className="font-bold text-indigo-600 dark:text-indigo-400">{data.overallScore}/100</span> ({data.ratingLabel})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowImprovementModal(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              {data.improvements.map((imp, idx) => (
                <div
                  key={idx}
                  className="bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/60 p-3.5 rounded-2xl flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                      {imp.title}
                    </div>
                    <div className="text-xs text-indigo-800/80 dark:text-indigo-300/80 mt-0.5 leading-relaxed">
                      {imp.action}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 px-2 py-1 rounded-xl shrink-0">
                    +{imp.pointsGain} pts
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowImprovementModal(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
