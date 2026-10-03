'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { SubjectAttendanceSummary } from '@/lib/attendance/calculations'
import DonutGauge from '@/components/ui/DonutGauge'

interface SubjectAttendanceCardProps {
  summary: SubjectAttendanceSummary
}

export default function SubjectAttendanceCard({ summary }: SubjectAttendanceCardProps) {
  const {
    subject,
    effectiveAttended,
    effectiveTotal,
    percentage,
    targetPercentage,
    bunkAllowance,
    recoveryRequirement,
    riskState,
    statusMessage,
  } = summary

  const riskBadge =
    riskState === 'SAFE'
      ? {
          bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60',
          dot: 'bg-emerald-500',
          label: `${bunkAllowance} bunk${bunkAllowance === 1 ? '' : 's'} safe`,
        }
      : riskState === 'WARNING'
      ? {
          bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60',
          dot: 'bg-amber-500',
          label: '1 bunk left',
        }
      : {
          bg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60',
          dot: 'bg-rose-500',
          label: recoveryRequirement === Infinity
            ? 'Deficit'
            : `Need +${recoveryRequirement}`,
        }

  return (
    <Link
      href={`/attendance/${subject.id}`}
      className="group bg-white/90 dark:bg-(--surface)/90 backdrop-blur-md rounded-3xl border border-gray-200/80 dark:border-(--border-subtle) p-5 shadow-2xs hover:border-purple-300 dark:hover:border-purple-800 transition-all flex flex-col justify-between space-y-4 cursor-pointer"
    >
      {/* Top Meta */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate"
              title={subject.name}
            >
              {subject.name}
            </h3>
            {subject.code && (
              <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 shrink-0">
                {subject.code}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
            <span className="capitalize px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium">
              {subject.class_type}
            </span>
            {subject.default_room && <span>Room {subject.default_room}</span>}
          </div>
        </div>

        {/* Semantic Status Pill */}
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${riskBadge.bg}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${riskBadge.dot}`} />
          <span>{riskBadge.label}</span>
        </span>
      </div>

      {/* Center Gauge + Numbers */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <div className="space-y-1">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {effectiveAttended} of {effectiveTotal} classes
          </div>
          <div className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">
            Target: {targetPercentage}%
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
            {statusMessage}
          </div>
        </div>

        <DonutGauge
          value={percentage}
          target={targetPercentage}
          size={58}
          strokeWidth={6}
          variant="auto"
        />
      </div>

      {/* Footer link hint */}
      <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs text-purple-600 dark:text-purple-400 font-semibold">
        <span>View Subject Standing</span>
        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  )
}
