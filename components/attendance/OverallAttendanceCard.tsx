'use client'

import React from 'react'
import type { OverallAttendanceSummary } from '@/lib/attendance/calculations'
import DonutGauge from '@/components/ui/DonutGauge'

interface OverallAttendanceCardProps {
  summary: OverallAttendanceSummary
  semesterName: string
}

export default function OverallAttendanceCard({
  summary,
  semesterName,
}: OverallAttendanceCardProps) {
  const {
    overallPercentage,
    targetPercentage,
    totalAttended,
    totalClasses,
    bunkAllowance,
    recoveryRequirement,
    riskState,
    statusMessage,
    criticalSubjectsCount,
    warningSubjectsCount,
    safeSubjectsCount,
  } = summary

  const riskBadge =
    riskState === 'SAFE'
      ? {
          bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60',
          dot: 'bg-emerald-500',
          label: `${bunkAllowance} Safe Bunk${bunkAllowance === 1 ? '' : 's'} Available`,
        }
      : riskState === 'WARNING'
      ? {
          bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60',
          dot: 'bg-amber-500',
          label: 'Warning: 1 Bunk Left',
        }
      : {
          bg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60',
          dot: 'bg-rose-500',
          label: recoveryRequirement === Infinity
            ? 'Deficit: Mathematical Limit'
            : `Deficit: Attend next ${recoveryRequirement} class${recoveryRequirement === 1 ? '' : 'es'}`,
        }

  return (
    <div className="bg-white/90 dark:bg-(--surface)/90 backdrop-blur-md rounded-3xl border border-gray-200/80 dark:border-(--border-subtle) p-5 sm:p-6 shadow-2xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Gauge + Main Stats */}
        <div className="flex items-center gap-5">
          <DonutGauge
            value={overallPercentage}
            target={targetPercentage}
            size={76}
            strokeWidth={7}
            variant="auto"
          />

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                Overall Attendance
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${riskBadge.bg}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${riskBadge.dot}`} />
                <span>{riskBadge.label}</span>
              </span>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              {statusMessage || `${totalAttended} of ${totalClasses} classes attended in ${semesterName}.`}
            </p>

            <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-400 dark:text-gray-500">
              <span>Target: {targetPercentage}%</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400">{safeSubjectsCount} Safe</span>
              {warningSubjectsCount > 0 && (
                <>
                  <span>•</span>
                  <span className="text-amber-600 dark:text-amber-400">{warningSubjectsCount} Warning</span>
                </>
              )}
              {criticalSubjectsCount > 0 && (
                <>
                  <span>•</span>
                  <span className="text-rose-600 dark:text-rose-400">{criticalSubjectsCount} Critical</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick Numerical Counters */}
        <div className="flex items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-800/80">
          <div className="px-4 py-2 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200/60 dark:border-gray-800/60 text-center">
            <div className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">
              Attended
            </div>
            <div className="text-lg font-black text-gray-900 dark:text-gray-100 tabular-nums leading-tight">
              {totalAttended}
            </div>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200/60 dark:border-gray-800/60 text-center">
            <div className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">
              Conducted
            </div>
            <div className="text-lg font-black text-gray-900 dark:text-gray-100 tabular-nums leading-tight">
              {totalClasses}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
