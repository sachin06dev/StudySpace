'use client'

import { useEffect, useRef } from 'react'
import type { MilestoneItem } from '@/lib/data/analytics'
import MilestoneBadgeIcon from './MilestoneBadgeIcon'

export interface MilestoneDetailsModalProps {
  milestone: MilestoneItem | null
  isOpen: boolean
  onClose: () => void
}

export default function MilestoneDetailsModal({
  milestone,
  isOpen,
  onClose,
}: MilestoneDetailsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)

  // Save previously focused element & trap escape key
  useEffect(() => {
    if (!isOpen) return

    previousActiveElementRef.current = document.activeElement as HTMLElement | null

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    // Lock body scroll while modal is active
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    window.addEventListener('keydown', handleKeyDown)

    // Focus close button or container on open
    const focusable = modalRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable) {
      focusable.focus()
    } else {
      modalRef.current?.focus()
    }

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
      // Restore focus to the previously active element
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus()
      }
    }
  }, [isOpen, onClose])

  if (!isOpen || !milestone) return null

  const isUnlocked = milestone.isUnlocked
  const remaining = Math.max(0, milestone.target - milestone.current)
  const isDaysCategory = milestone.category === 'days'

  const requirementText = isDaysCategory
    ? `Log at least 20 minutes of study on ${milestone.target} separate calendar days.`
    : `Maintain an unbroken study streak of at least ${milestone.target} consecutive days (≥20 min/day).`

  const categoryLabel = isDaysCategory ? 'Active Days' : 'Streak'
  const categoryFullLabel = isDaysCategory
    ? '🌱 Active Days Milestone'
    : '🔥 Consistency Streak Milestone'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      {/* Modal Dialog Card */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="milestone-modal-title"
        aria-describedby="milestone-modal-description"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-5 text-left outline-none animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
      >
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <MilestoneBadgeIcon item={milestone} size="lg" />

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  id="milestone-modal-title"
                  className="text-base sm:text-lg font-bold text-slate-900 dark:text-white"
                >
                  {milestone.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
                  {categoryFullLabel}
                </span>

                {isUnlocked ? (
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    Unlocked ✓
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60">
                    In Progress
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close milestone details"
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Milestone Description */}
        <div className="space-y-1.5">
          <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            About This Milestone
          </h4>
          <p
            id="milestone-modal-description"
            className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-relaxed"
          >
            {milestone.description}
          </p>
        </div>

        {/* Unlock Requirement */}
        <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            <span>🎯</span>
            <span>Unlock Requirement</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {requirementText}
          </p>
        </div>

        {/* Progress Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {isUnlocked ? 'Achievement Status' : 'Current Progress'}
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {milestone.current} / {milestone.target} {milestone.target === 1 ? 'day' : 'days'}{' '}
              <span className="text-slate-400 font-normal">({milestone.progressPercent}%)</span>
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700/60">
            <div
              style={{ width: `${milestone.progressPercent}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                isUnlocked
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-xs shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500'
              }`}
            />
          </div>

          {/* Helper / Motivation Note */}
          {isUnlocked ? (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300">
              <span className="text-base">🏆</span>
              <span className="font-medium">
                Milestone Unlocked! You have accomplished this study consistency goal.
              </span>
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              ⚡ Only <span className="font-bold text-slate-700 dark:text-slate-200">{remaining}</span> more{' '}
              {remaining === 1 ? 'day' : 'days'} needed to unlock this badge!
            </p>
          )}
        </div>

        {/* Quick Facts Breakdown Grid */}
        <div className="grid grid-cols-3 gap-2.5 pt-1 text-center">
          <div className="bg-slate-50/80 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Target
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 block">
              {milestone.target} {milestone.target === 1 ? 'Day' : 'Days'}
            </span>
          </div>

          <div className="bg-slate-50/80 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Your Record
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 block">
              {milestone.current} {milestone.current === 1 ? 'Day' : 'Days'}
            </span>
          </div>

          <div className="bg-slate-50/80 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Category
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 block">
              {categoryLabel}
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
