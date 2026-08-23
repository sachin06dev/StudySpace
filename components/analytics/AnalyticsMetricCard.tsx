import React from 'react'

export interface AnalyticsMetricCardProps {
  label: string
  value: string | number
  description: string
  icon: React.ReactNode
  variant?: 'indigo' | 'emerald' | 'amber' | 'violet' | 'blue'
  footerNote?: string
}

const variantStyles = {
  indigo: {
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800',
    accentBorder: 'border-indigo-100/60 dark:border-indigo-900/40',
    valueText: 'text-indigo-950 dark:text-indigo-200',
  },
  emerald: {
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800',
    accentBorder: 'border-emerald-100/60 dark:border-emerald-900/40',
    valueText: 'text-emerald-950 dark:text-emerald-200',
  },
  amber: {
    iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800',
    accentBorder: 'border-amber-100/60 dark:border-amber-900/40',
    valueText: 'text-amber-950 dark:text-amber-200',
  },
  violet: {
    iconBg: 'bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-800',
    accentBorder: 'border-violet-100/60 dark:border-violet-900/40',
    valueText: 'text-violet-950 dark:text-violet-200',
  },
  blue: {
    iconBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800',
    accentBorder: 'border-blue-100/60 dark:border-blue-900/40',
    valueText: 'text-blue-950 dark:text-blue-200',
  },
}

export default function AnalyticsMetricCard({
  label,
  value,
  description,
  icon,
  variant = 'indigo',
  footerNote,
}: AnalyticsMetricCardProps) {
  const styles = variantStyles[variant] || variantStyles.indigo

  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-5 sm:p-6 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {label}
          </p>
          <p className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${styles.valueText}`}>
            {value}
          </p>
        </div>

        <div
          className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${styles.iconBg}`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{description}</span>
        {footerNote && <span className="font-medium text-gray-400 dark:text-gray-500">{footerNote}</span>}
      </div>
    </div>
  )
}
