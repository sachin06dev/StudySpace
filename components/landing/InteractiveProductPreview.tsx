'use client'

import React, { useState } from 'react'
import type { PreviewSection } from './preview/previewDemoData'
import PreviewTopBar from './preview/PreviewTopBar'
import PreviewSidebar, { PREVIEW_NAV_ITEMS } from './preview/PreviewSidebar'
import DashboardPreview from './preview/DashboardPreview'
import TasksPreview from './preview/TasksPreview'
import PomodoroPreview from './preview/PomodoroPreview'
import VideosPreview from './preview/VideosPreview'
import PlaylistsPreview from './preview/PlaylistsPreview'
import ResourcesPreview from './preview/ResourcesPreview'
import NotesPreview from './preview/NotesPreview'
import DocumentsPreview from './preview/DocumentsPreview'
import AnalyticsPreview from './preview/AnalyticsPreview'

export default function InteractiveProductPreview() {
  const [activeSection, setActiveSection] = useState<PreviewSection>('dashboard')
  const [selectedTimestamp, setSelectedTimestamp] = useState<number | undefined>(undefined)

  const handleNavigate = (section: PreviewSection) => {
    setActiveSection(section)
  }

  const handleSelectTimestamp = (timestampSecs: number) => {
    setSelectedTimestamp(timestampSecs)
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto lg:max-w-none group">
      {/* Background glow layers */}
      <div
        className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 -z-10"
        aria-hidden="true"
      />

      {/* Main Mockup Window Container */}
      <div className="relative rounded-2xl border border-gray-200/90 dark:border-gray-800/90 bg-white dark:bg-[#0c111e] shadow-2xl overflow-hidden transition-all duration-300">
        {/* Browser Top Bar */}
        <PreviewTopBar
          activeSection={activeSection}
          onNavigate={handleNavigate}
        />

        {/* Mobile Horizontal Section Tabs (< sm viewports) */}
        <div className="sm:hidden flex items-center gap-1 p-2 bg-gray-50/80 dark:bg-gray-900/60 border-b border-gray-200/70 dark:border-gray-800/70 overflow-x-auto select-none">
          {PREVIEW_NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-white/80 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 border border-gray-200/60 dark:border-gray-700/60'
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                <span>{item.name}</span>
              </button>
            )
          })}
        </div>

        {/* Interior Layout: Sidebar + Active Section Workspace (Stable Reserved Height) */}
        <div className="flex h-[470px] sm:h-[490px] md:h-[500px] items-stretch">
          {/* Desktop/Tablet Sidebar (Hidden on mobile where top scroll tabs exist) */}
          <div className="hidden sm:flex shrink-0 h-full">
            <PreviewSidebar
              activeSection={activeSection}
              onNavigate={handleNavigate}
            />
          </div>

          {/* Active Section Content Workspace */}
          <main className="flex-1 min-w-0 bg-gray-50/30 dark:bg-transparent h-full overflow-y-auto overflow-x-hidden">
            <div key={activeSection} className="animate-in fade-in-50 duration-200 min-h-full">
              {activeSection === 'dashboard' && (
                <DashboardPreview
                  onNavigate={handleNavigate}
                  onSelectTimestamp={handleSelectTimestamp}
                />
              )}
              {activeSection === 'tasks' && <TasksPreview />}
              {activeSection === 'pomodoro' && <PomodoroPreview />}
              {activeSection === 'videos' && (
                <VideosPreview initialTimestampSecs={selectedTimestamp} />
              )}
              {activeSection === 'playlists' && (
                <PlaylistsPreview onNavigate={handleNavigate} />
              )}
              {activeSection === 'resources' && <ResourcesPreview />}
              {activeSection === 'notes' && (
                <NotesPreview
                  onNavigate={handleNavigate}
                  onSelectTimestamp={handleSelectTimestamp}
                />
              )}
              {activeSection === 'documents' && <DocumentsPreview />}
              {activeSection === 'analytics' && <AnalyticsPreview />}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
