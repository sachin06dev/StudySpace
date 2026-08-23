import React from 'react'

export interface StatItem {
  label?: string
  value: string | number
  highlight?: boolean
}

interface StatsPillProps {
  items: StatItem[]
  className?: string
}

export default function StatsPill({ items, className = '' }: StatsPillProps) {
  if (!items || items.length === 0) return null

  return (
    <div
      className={`inline-flex items-center gap-2.5 bg-gray-100/90 dark:bg-gray-800/90 px-3.5 py-1.5 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-200/80 dark:border-gray-700/80 shadow-2xs transition-colors ${className}`}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="text-gray-300 dark:text-gray-600 select-none">•</span>}
          <span>
            <strong className={item.highlight ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-900 dark:text-gray-100 font-semibold'}>
              {item.value}
            </strong>
            {item.label ? ` ${item.label}` : ''}
          </span>
        </React.Fragment>
      ))}
    </div>
  )
}
