'use client'

import { useState } from 'react'
import { Trophy } from 'lucide-react'
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
      className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col h-full space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[var(--accent)]" />
          <div>
            <h3 className="text-base font-bold text-[var(--foreground)]">
              Consistency Milestones
            </h3>
            <p className="text-xs text-[var(--foreground-muted)]">
              Active day achievements & streak badges
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-[var(--accent-subtle)] border border-[var(--border-subtle)] text-[var(--accent)]">
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
            className={`p-3.5 rounded-xl border text-left w-full transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] hover:scale-[1.01] active:scale-[0.99] group ${
              m.isUnlocked
                ? 'bg-amber-500/5 border-amber-500/30 shadow-xs ring-1 ring-amber-500/20 hover:border-amber-500/50'
                : 'bg-[var(--surface-muted)] border-[var(--border-subtle)] opacity-85 hover:opacity-100 hover:border-[var(--accent)]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="transition-transform group-hover:scale-105">
                <MilestoneBadgeIcon item={m} />
              </div>

              {m.isUnlocked ? (
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">
                  Unlocked ✓
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-[var(--foreground-muted)] shrink-0">
                  {m.current} / {m.target}
                </span>
              )}
            </div>

            <div className="mt-2.5">
              <h4 className="text-xs font-bold text-[var(--foreground)] truncate group-hover:text-[var(--accent)] transition-colors">
                {m.title}
              </h4>
              <p className="text-[11px] text-[var(--foreground-muted)] line-clamp-1 mt-0.5">
                {m.description}
              </p>
            </div>

            {/* Progress line if locked */}
            {!m.isUnlocked && (
              <div className="w-full bg-[var(--surface-overlay)] h-1 rounded-full overflow-hidden mt-2 border border-[var(--border-subtle)]">
                <div
                  style={{ width: `${m.progressPercent}%` }}
                  className="h-full bg-[var(--accent)] rounded-full transition-all duration-[var(--duration-very-slow)] [transition-timing-function:var(--ease-smooth-out)]"
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
