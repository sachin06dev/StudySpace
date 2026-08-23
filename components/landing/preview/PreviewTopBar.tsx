'use client'

import React from 'react'
import type { PreviewSection } from './previewDemoData'

interface PreviewTopBarProps {
  activeSection: PreviewSection
  onNavigate?: (section: PreviewSection) => void
}

export default function PreviewTopBar({
  activeSection,
}: PreviewTopBarProps) {
  return (
    <div className="flex items-center justify-between gap-2.5 sm:gap-4 px-3 sm:px-4 py-2.5 bg-gray-50/90 dark:bg-gray-900/90 border-b border-gray-200/80 dark:border-gray-800/80 text-xs text-gray-500 backdrop-blur-xs select-none">
      {/* Left: Window Traffic Dots & Simulated URL */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-initial">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/80 dark:bg-red-500/70 inline-block transition-transform hover:scale-125" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80 dark:bg-amber-500/70 inline-block transition-transform hover:scale-125" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 dark:bg-emerald-500/70 inline-block transition-transform hover:scale-125" />
        </div>

        {/* Dynamic URL badge */}
        <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-md bg-gray-200/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 font-mono text-[10px] sm:text-[11px] text-gray-600 dark:text-gray-400 truncate min-w-0 max-w-[135px] min-[390px]:max-w-[180px] sm:max-w-none">
          <svg className="w-3 h-3 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="truncate">studyspace.app/{activeSection}</span>
        </div>
      </div>

      {/* Right: Interactive Transparency Badge */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Transparent Demo Indicator Badge */}
        <div className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping shrink-0" />
          <span className="font-semibold tracking-wide whitespace-nowrap">
            <span className="hidden min-[360px]:inline">Interactive </span>Preview
          </span>
          <span className="text-indigo-400 dark:text-indigo-500 hidden md:inline">• Demo Data</span>
        </div>
      </div>
    </div>
  )
}
