'use client'

import { Lightbulb } from 'lucide-react'
import type { StudyInsightItem } from '@/lib/data/analytics'

export interface StudyInsightsCardProps {
  insights: StudyInsightItem[]
}

export default function StudyInsightsCard({ insights }: StudyInsightsCardProps) {
  const handleScrollToTarget = (actionTarget?: string) => {
    if (!actionTarget) return
    const el = document.getElementById(actionTarget)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('ring-2', 'ring-[var(--accent)]', 'transition-all', 'duration-500')
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-[var(--accent)]')
      }, 1500)
    }
  }

  return (
    <div id="study-insights" className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-[var(--accent)]" />
          <div>
            <h3 className="text-base font-bold text-[var(--foreground)]">
              Study Insights & Trends
            </h3>
            <p className="text-xs text-[var(--foreground-muted)]">
              Deterministic patterns generated from your real study data
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-[var(--accent-subtle)] border border-[var(--border-subtle)] text-[var(--accent)]">
          Smart Insights
        </span>
      </div>

      {/* Insights List */}
      <div className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            onClick={() => handleScrollToTarget(insight.actionTarget)}
            className={`flex items-start gap-3.5 p-3.5 rounded-xl bg-[var(--surface-muted)] border border-[var(--border-subtle)] hover:border-[var(--accent)] transition-all ${
              insight.actionTarget ? 'cursor-pointer hover:shadow-xs group' : ''
            }`}
          >
            <span className="text-lg shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
              {insight.icon}
            </span>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                  {insight.title}
                </h4>
                {insight.highlight && (
                  <span className="text-[11px] font-bold text-[var(--accent)] shrink-0">
                    {insight.highlight}
                  </span>
                )}
              </div>

              <p className="text-xs text-[var(--foreground-muted)] mt-0.5 leading-relaxed">
                {insight.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
