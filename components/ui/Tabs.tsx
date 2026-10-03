'use client'

import React from 'react'
import { motion } from 'motion/react'

export interface TabItem {
  id: string
  label: string
  count?: number
  icon?: React.ReactNode
}

export interface TabsProps {
  tabs: TabItem[]
  activeTab: string
  onChange: (tabId: string) => void
  size?: 'sm' | 'md'
  className?: string
}

export default function Tabs({
  tabs,
  activeTab,
  onChange,
  size = 'md',
  className = '',
}: TabsProps) {
  return (
    <div
      role="tablist"
      className={`inline-flex items-center p-1 bg-(--surface-raised) rounded-(--radius-md) border border-(--border-subtle) select-none ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center justify-center font-medium transition-colors cursor-pointer rounded-(--radius-sm) z-10 ${
              size === 'sm' ? 'px-2.5 py-1 text-xs gap-1.5' : 'px-3.5 py-1.5 text-sm gap-2'
            } ${
              isActive
                ? 'text-(--text-primary) font-semibold'
                : 'text-(--text-secondary) hover:text-(--text-primary)'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabPill"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className="absolute inset-0 bg-(--surface) rounded-(--radius-sm) shadow-xs border border-(--border-subtle) -z-10"
              />
            )}
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-(--radius-full) tabular-nums font-mono ${
                  isActive
                    ? 'bg-(--accent-muted) text-(--accent)'
                    : 'bg-(--border-subtle) text-(--text-muted)'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
