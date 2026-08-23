'use client'

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
      el.classList.add('ring-2', 'ring-indigo-500', 'transition-all', 'duration-500')
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-indigo-500')
      }, 1500)
    }
  }

  return (
    <div id="study-insights" className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-lg">💡</span>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Study Insights & Trends
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Deterministic patterns generated from your real study data
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400">
          Smart Insights
        </span>
      </div>

      {/* Insights List */}
      <div className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            onClick={() => handleScrollToTarget(insight.actionTarget)}
            className={`flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all ${
              insight.actionTarget ? 'cursor-pointer hover:shadow-xs group' : ''
            }`}
          >
            <span className="text-xl shrink-0 mt-0.5 group-hover:scale-110 transition-transform">{insight.icon}</span>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {insight.title}
                </h4>
                {insight.highlight && (
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                    {insight.highlight}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                {insight.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
