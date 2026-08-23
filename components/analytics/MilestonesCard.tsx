'use client'

import { useState } from 'react'
import type { MilestoneData, MilestoneItem } from '@/lib/data/analytics'
import MilestoneBadgeIcon from './MilestoneBadgeIcon'
import MilestoneDetailsModal from './MilestoneDetailsModal'

export interface MilestonesCardProps {
  data: MilestoneData
}

export default function MilestonesCard({ data }: MilestonesCardProps) {
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneItem | null>(null)

  return (
    <div
      id="milestones-card"
      className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col h-full space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏆</span>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Consistency Milestones
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active day achievements & streak badges
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400">
          {data.unlockedCount} / {data.totalCount} Unlocked
        </span>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {data.milestones.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setSelectedMilestone(m)}
            aria-label={`View details for ${m.title} milestone (${
              m.isUnlocked ? 'Unlocked' : `${m.current} of ${m.target} completed`
            })`}
            className={`p-3.5 rounded-2xl border text-left w-full transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 hover:scale-[1.02] active:scale-[0.99] group ${
              m.isUnlocked
                ? 'bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-amber-300/80 dark:border-amber-700/60 shadow-xs ring-1 ring-amber-400/20 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md'
                : 'bg-slate-50/70 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-800/60 opacity-85 hover:opacity-100 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="transition-transform group-hover:scale-105">
                <MilestoneBadgeIcon item={m} />
              </div>

              {m.isUnlocked ? (
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-800 shrink-0">
                  Unlocked ✓
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 shrink-0">
                  {m.current} / {m.target}
                </span>
              )}
            </div>

            <div className="mt-2.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {m.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                {m.description}
              </p>
            </div>

            {/* Progress line if locked */}
            {!m.isUnlocked && (
              <div className="w-full bg-slate-200/80 dark:bg-slate-700/80 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  style={{ width: `${m.progressPercent}%` }}
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500 group-hover:bg-indigo-600"
                />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Milestone Details Modal */}
      <MilestoneDetailsModal
        milestone={selectedMilestone}
        isOpen={Boolean(selectedMilestone)}
        onClose={() => setSelectedMilestone(null)}
      />
    </div>
  )
}
