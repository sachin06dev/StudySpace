'use client'

import { useState } from 'react'
import { Target, HelpCircle, Lightbulb, Sparkles, X } from 'lucide-react'
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
    if (score >= 70) return 'text-[var(--accent)] stroke-[var(--accent)]'
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
      <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col h-full space-y-4">
        {/* Header with Explanation Button */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[var(--accent)]" />
            <div>
              <h3 className="text-base font-bold text-[var(--foreground)]">
                Consistency Score
              </h3>
              <p className="text-xs text-[var(--foreground-muted)]">
                Transparent 100-point habit rating
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowFormulaModal(true)}
              className="text-[11px] text-[var(--foreground-muted)] hover:text-[var(--accent)] bg-[var(--surface-muted)] hover:bg-[var(--accent-subtle)] px-2 py-1 rounded-lg border border-[var(--border-subtle)] transition-colors cursor-pointer flex items-center gap-1"
              title="How is this calculated?"
            >
              <HelpCircle className="w-3 h-3" />
              <span>How it works</span>
            </button>

            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-[var(--surface-muted)] text-[var(--foreground)] border border-[var(--border-subtle)]">
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
                className="stroke-[var(--surface-muted)]"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                className={`transition-all duration-[var(--duration-very-slow)] [transition-timing-function:var(--ease-smooth-out)] ${getScoreColor(data.overallScore)}`}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center group-hover:scale-105 transition-transform">
              <span className="text-2xl font-black text-[var(--foreground)]">
                {data.overallScore}
              </span>
              <span className="text-[10px] text-[var(--foreground-muted)] font-medium -mt-1">/ 100</span>
            </div>
          </div>

          {/* Sub-Score Breakdown */}
          <div className="flex-1 space-y-2.5">
            {/* Active Days (40 pts) */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--foreground-muted)] flex items-center gap-1">
                  <span>Active Days</span>
                  <span className="text-[10px] opacity-70">({data.breakdown.activeDaysLast30}/30d)</span>
                </span>
                <span className="font-bold text-[var(--foreground)]">
                  {data.breakdown.studyDaysScore} / 40
                </span>
              </div>
              <div className="w-full bg-[var(--surface-muted)] h-1.5 rounded-full overflow-hidden">
                <div
                  style={{ width: `${(data.breakdown.studyDaysScore / 40) * 100}%` }}
                  className="h-full bg-[var(--accent)] rounded-full transition-all duration-[var(--duration-very-slow)] [transition-timing-function:var(--ease-smooth-out)]"
                />
              </div>
            </div>

            {/* Streak (35 pts) */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--foreground-muted)] flex items-center gap-1">
                  <span>Streak Factor</span>
                  <span className="text-[10px] opacity-70">({data.breakdown.currentStreak}/14d)</span>
                </span>
                <span className="font-bold text-[var(--foreground)]">
                  {data.breakdown.streakScore} / 35
                </span>
              </div>
              <div className="w-full bg-[var(--surface-muted)] h-1.5 rounded-full overflow-hidden">
                <div
                  style={{ width: `${(data.breakdown.streakScore / 35) * 100}%` }}
                  className="h-full bg-[var(--accent)] rounded-full transition-all duration-[var(--duration-very-slow)] [transition-timing-function:var(--ease-smooth-out)]"
                />
              </div>
            </div>

            {/* Weekly Goal (25 pts) */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--foreground-muted)] flex items-center gap-1">
                  <span>Weekly Goal</span>
                  <span className="text-[10px] opacity-70">
                    ({formatStudyDuration(data.breakdown.weekStudyMinutes)} / {formatStudyDuration(data.breakdown.goalMinutes)})
                  </span>
                </span>
                <span className="font-bold text-[var(--foreground)]">
                  {data.breakdown.goalScore} / 25
                </span>
              </div>
              <div className="w-full bg-[var(--surface-muted)] h-1.5 rounded-full overflow-hidden">
                <div
                  style={{ width: `${(data.breakdown.goalScore / 25) * 100}%` }}
                  className="h-full bg-[var(--accent)] rounded-full transition-all duration-[var(--duration-very-slow)] [transition-timing-function:var(--ease-smooth-out)]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action Button */}
        <div className="mt-auto pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setShowImprovementModal(true)}
            className="text-xs font-semibold text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>How to improve your score</span>
            <span>→</span>
          </button>
          <span className="text-[11px] text-[var(--foreground-muted)]">Max 100 pts</span>
        </div>
      </div>

      {/* Formula Explanation Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-[var(--duration-fast)] [animation-timing-function:var(--ease-smooth-out)]">
          <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-[var(--foreground)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[var(--accent)]" />
                <h3 className="text-base font-bold text-[var(--foreground)]">
                  How Consistency is Calculated
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFormulaModal(false)}
                className="w-7 h-7 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)] flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-[var(--foreground-muted)] leading-relaxed">
              <p>
                Your Consistency Score is evaluated across three transparent, habit-forming pillars totaling 100 points:
              </p>

              {/* Pillar 1 */}
              <div className="bg-[var(--surface-muted)] p-3 rounded-xl border border-[var(--border-subtle)] space-y-1">
                <div className="flex justify-between font-bold text-[var(--foreground)]">
                  <span>1. Active Days (Last 30 Days)</span>
                  <span className="text-[var(--accent)]">40 Points Max</span>
                </div>
                <p className="text-[11px]">
                  Formula: <code className="font-mono text-[var(--foreground)]">(Active Qualifying Days / 30) × 40</code>
                </p>
                <p className="text-[11px]">
                  Logging ≥20 minutes of study on any calendar day qualifies as an active day.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="bg-[var(--surface-muted)] p-3 rounded-xl border border-[var(--border-subtle)] space-y-1">
                <div className="flex justify-between font-bold text-[var(--foreground)]">
                  <span>2. Streak Factor</span>
                  <span className="text-[var(--accent)]">35 Points Max</span>
                </div>
                <p className="text-[11px]">
                  Formula: <code className="font-mono text-[var(--foreground)]">min(35, (Current Streak / 14) × 35)</code>
                </p>
                <p className="text-[11px]">
                  Building a 14-day consecutive habit unlocks the full 35 streak points.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="bg-[var(--surface-muted)] p-3 rounded-xl border border-[var(--border-subtle)] space-y-1">
                <div className="flex justify-between font-bold text-[var(--foreground)]">
                  <span>3. Weekly Study Goal Progress</span>
                  <span className="text-[var(--accent)]">25 Points Max</span>
                </div>
                <p className="text-[11px]">
                  Formula: <code className="font-mono text-[var(--foreground)]">min(25, (This Week Focus / Weekly Goal) × 25)</code>
                </p>
                <p className="text-[11px]">
                  Hitting 100% of your weekly target grants all 25 goal points.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowFormulaModal(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[var(--accent)] hover:opacity-90 rounded-xl transition-colors cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Improvement Guidance Modal */}
      {showImprovementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-[var(--duration-fast)] [animation-timing-function:var(--ease-smooth-out)]">
          <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-[var(--foreground)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--accent)]" />
                <div>
                  <h3 className="text-base font-bold text-[var(--foreground)]">
                    Actionable Ways to Improve
                  </h3>
                  <p className="text-[11px] text-[var(--foreground-muted)]">
                    Current Score: <span className="font-bold text-[var(--accent)]">{data.overallScore}/100</span> ({data.ratingLabel})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowImprovementModal(false)}
                className="w-7 h-7 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)] flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {data.improvements.map((imp, idx) => (
                <div
                  key={idx}
                  className="bg-[var(--surface-muted)] border border-[var(--border-subtle)] p-3.5 rounded-xl flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-bold text-[var(--foreground)]">
                      {imp.title}
                    </div>
                    <div className="text-xs text-[var(--foreground-muted)] mt-0.5 leading-relaxed">
                      {imp.action}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-xl shrink-0">
                    +{imp.pointsGain} pts
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowImprovementModal(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[var(--accent)] hover:opacity-90 rounded-xl transition-colors cursor-pointer"
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
