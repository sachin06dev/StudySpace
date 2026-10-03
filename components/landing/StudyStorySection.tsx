'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import {
  Video,
  ListMusic,
  FileText,
  Maximize2,
  CheckCircle2,
  Sun,
  Moon,
} from 'lucide-react'
import ScreenshotLightbox from './ScreenshotLightbox'

export default function StudyStorySection() {
  const { resolvedTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<'player' | 'playlists' | 'notes'>('player')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [storyTheme, setStoryTheme] = useState<'light' | 'dark' | null>(null)

  const currentTheme = storyTheme || (resolvedTheme === 'dark' ? 'dark' : 'light')

  const toggleTheme = () => {
    setStoryTheme(currentTheme === 'dark' ? 'light' : 'dark')
  }

  const ASSETS = {
    player: {
      title: 'YouTube Lecture Hub',
      badge: 'Curriculum Focus',
      description: 'Stream university playlists without clickbait recommendation feeds or comment clutter.',
      light: '/screenshots/light/videos-player.png',
      dark: '/screenshots/dark/videos-player.png',
      highlights: [
        'Organized YouTube player stripped of distracting algorithmic recommendation feeds',
        'Auto-resume memory remembers the exact second you left off',
        'Full keyboard playback shortcuts with adjustable study speed',
      ],
    },
    playlists: {
      title: 'Structured Subject Playlists',
      badge: 'Curriculum Organization',
      description: 'Group semester YouTube playlists into neat courses with trackable completion bars.',
      light: '/screenshots/light/playlists.png',
      dark: '/screenshots/dark/playlists.png',
      highlights: [
        'Organized by semester course codes and professor lecture series',
        'Progress completion bar calculates watched vs. remaining lectures',
        'Seamless 1-click import from public YouTube playlist URLs',
      ],
    },
    notes: {
      title: 'Timestamped Lecture Notes',
      badge: 'Interactive Jump Anchors',
      description: 'Take notes with live clickable timestamp tags that jump player playback directly to key definitions.',
      light: '/screenshots/light/notes.png',
      dark: '/screenshots/dark/notes.png',
      highlights: [
        'Click timestamp pills (e.g. 04:12) to seek video playback instantly',
        'Full Markdown support with syntax highlighting, formulas, and checklists',
        'Search across all lecture notes by keyword during semester exam revision',
      ],
    },
  }

  const activeAsset = ASSETS[activeTab]
  const currentImageSrc = currentTheme === 'dark' ? activeAsset.dark : activeAsset.light

  return (
    <section id="study-story" className="py-20 md:py-28 bg-slate-50 dark:bg-zinc-950/70 border-b border-slate-200/80 dark:border-zinc-800/80 transition-colors scroll-mt-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 text-xs font-semibold text-blue-700 dark:text-blue-300 shadow-2xs">
            <Video className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Feature Story • Study</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
            Everything you need to{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 dark:from-blue-400 dark:via-violet-400 dark:to-purple-300">
              actually study.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto font-normal">
            No algorithmic sidebars. No rabbit holes. Just pure academic focus with synchronized notes that anchor to lecture timestamps.
          </p>
        </div>

        {/* 4-Step Narrative Flow Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto mb-12 text-center">
          {[
            { step: '01', title: 'WATCH', desc: 'Distraction-free lectures' },
            { step: '02', title: 'NOTE', desc: 'Timestamped key concepts' },
            { step: '03', title: 'FOCUS', desc: 'Persistent deep work clock' },
            { step: '04', title: 'REMEMBER', desc: '1-click formula review' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1"
            >
              <span className="text-[10px] font-mono font-bold text-violet-600 dark:text-violet-400">
                STEP {item.step}
              </span>
              <strong className="text-xs font-extrabold text-slate-900 dark:text-zinc-100 block tracking-wider">
                {item.title}
              </strong>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block leading-tight">
                {item.desc}
              </span>
            </div>
          ))}
        </div>

        {/* Tab Selector */}
        <div className="flex items-center justify-center gap-2 mb-8 select-none">
          {[
            { id: 'player', label: 'Distraction-Free Video', icon: Video },
            { id: 'playlists', label: 'Course Playlists', icon: ListMusic },
            { id: 'notes', label: 'Timestamped Notes', icon: FileText },
          ].map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as 'player' | 'playlists' | 'notes')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer border ${
                  isActive
                    ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/20 scale-102'
                    : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Feature Display Window */}
        <div className="max-w-5xl mx-auto rounded-3xl border border-slate-300/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden transition-all text-left">
          {/* Window Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-100/90 dark:bg-zinc-950/90 border-b border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 hidden sm:inline">
                {activeAsset.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-medium border border-slate-200 dark:border-zinc-700 transition-colors cursor-pointer"
              >
                {currentTheme === 'dark' ? <Moon className="w-3.5 h-3.5 text-violet-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                <span className="text-[10px] uppercase font-mono">{currentTheme}</span>
              </button>

              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-medium border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="text-[10px] hidden sm:inline">Inspect Full HD</span>
              </button>
            </div>
          </div>

          {/* Screenshot Showcase Viewport */}
          <div
            className="relative w-full h-[380px] sm:h-[480px] md:h-[560px] bg-slate-100 dark:bg-zinc-950 overflow-hidden cursor-zoom-in group"
            onClick={() => setLightboxOpen(true)}
          >
            <Image
              key={`${activeTab}-${currentTheme}`}
              src={currentImageSrc}
              alt={activeAsset.title}
              fill
              className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.015]"
              sizes="(max-width: 1024px) 100vw, 1024px"
              unoptimized
            />
            {/* Hover overlay hint */}
            <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Click to inspect 100% resolution</span>
            </div>
          </div>

          {/* Window Footer Feature Highlights */}
          <div className="p-6 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeAsset.highlights.map((highlight, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ScreenshotLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        src={currentImageSrc}
        title={activeAsset.title}
        theme={currentTheme}
        onToggleTheme={toggleTheme}
      />
    </section>
  )
}
