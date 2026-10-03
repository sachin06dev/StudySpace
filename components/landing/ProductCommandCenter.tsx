'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { SCREENSHOT_FEATURES } from '@/lib/config/screenshots'
import ScreenshotLightbox from './ScreenshotLightbox'
import {
  LayoutDashboard,
  CalendarDays,
  UserCheck,
  Video,
  Timer,
  CheckSquare,
  FolderLock,
  LineChart,
  Sun,
  Moon,
  Maximize2,
  Sparkles,
} from 'lucide-react'

const TAB_ICONS: Record<string, React.ElementType> = {
  dashboard: LayoutDashboard,
  attendance: UserCheck,
  timetable: CalendarDays,
  videos: Video,
  pomodoro: Timer,
  tasks: CheckSquare,
  documents: FolderLock,
  analytics: LineChart,
}

export default function ProductCommandCenter() {
  const { resolvedTheme } = useTheme()
  const [activeTabId, setActiveTabId] = useState('attendance')
  // Local preview theme override, initialized to match current system/app theme
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark' | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const currentTheme = previewTheme || (resolvedTheme === 'dark' ? 'dark' : 'light')
  const activeFeature = SCREENSHOT_FEATURES.find((f) => f.id === activeTabId) || SCREENSHOT_FEATURES[0]

  const activeImageSrc = currentTheme === 'dark' ? activeFeature.dark : activeFeature.light

  const togglePreviewTheme = () => {
    setPreviewTheme(currentTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <section id="demo" className="py-20 md:py-28 bg-white dark:bg-zinc-950 border-b border-slate-200/80 dark:border-zinc-800/80 transition-colors scroll-mt-20 relative">
      {/* Background ambient lighting */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-violet-600/10 dark:bg-violet-600/15 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-50 dark:bg-violet-950/60 border border-violet-200/70 dark:border-violet-800/70 text-xs font-semibold text-violet-700 dark:text-violet-300 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span>Interactive Product Command Center</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
            Explore every module.
            <span className="block mt-1 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 dark:from-violet-400 dark:via-purple-300 dark:to-pink-400">
              Zero placeholders. Pure real product.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Click through the core superpowers of StudySpace. See the authentic interface, inspect features in high definition, and toggle between Light and Dark mode.
          </p>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-8 sm:mb-12 no-scrollbar select-none">
          {SCREENSHOT_FEATURES.map((feature) => {
            const Icon = TAB_ICONS[feature.id] || LayoutDashboard
            const isActive = activeTabId === feature.id
            return (
              <button
                key={feature.id}
                type="button"
                onClick={() => setActiveTabId(feature.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 border ${
                  isActive
                    ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/20 scale-102'
                    : 'bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-zinc-400'}`} />
                <span>{feature.name}</span>
              </button>
            )
          })}
        </div>

        {/* Active Feature Showcase Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
          {/* Left / Detail Column: Feature Copy and Highlights */}
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left order-2 lg:order-1">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100/70 dark:bg-violet-950/70 border border-violet-200 dark:border-violet-800 text-xs font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                <span>{activeFeature.badge}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-100 leading-tight">
                {activeFeature.title}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-300 font-medium leading-relaxed">
                {activeFeature.tagline}
              </p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                {activeFeature.description}
              </p>
            </div>

            {/* Key Value Points Checklist */}
            <div className="space-y-2.5 pt-2 text-left">
              {activeFeature.highlights.map((point, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-zinc-300">
                  <div className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    ✓
                  </div>
                  <span className="leading-snug font-medium">{point}</span>
                </div>
              ))}
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-4">
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                <span>Inspect High-Res View</span>
              </button>

              <button
                type="button"
                onClick={togglePreviewTheme}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-violet-200 dark:border-violet-900 bg-violet-50/60 dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-900/50 text-violet-700 dark:text-violet-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                {currentTheme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>View in Light Theme</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-violet-500" />
                    <span>View in Dark Theme</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right / Visual Column: Browser Frame with Screenshot */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="relative rounded-3xl border border-slate-300/80 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 shadow-2xl overflow-hidden group">
              {/* Browser Window Bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-white/95 dark:bg-zinc-950/95 border-b border-slate-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-400 dark:bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-400 dark:bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400 dark:bg-emerald-500/80" />
                  <div className="hidden sm:flex items-center gap-1.5 ml-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                    <span className="text-emerald-500">🔒</span>
                    <span>studyspace4u.app/{activeFeature.id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePreviewTheme}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                    title={`Toggle preview theme (Current: ${currentTheme})`}
                  >
                    {currentTheme === 'dark' ? (
                      <Moon className="w-3.5 h-3.5 text-violet-400" />
                    ) : (
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    <span className="hidden sm:inline capitalize text-[11px]">{currentTheme}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
                    title="Open full resolution lightbox"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Screenshot Viewport Container */}
              <div
                onClick={() => setLightboxOpen(true)}
                className="relative w-full h-[360px] sm:h-[440px] md:h-[500px] overflow-hidden bg-slate-50 dark:bg-zinc-950 cursor-pointer"
              >
                <Image
                  key={`${activeFeature.id}-${currentTheme}`}
                  src={activeImageSrc}
                  alt={`${activeFeature.title} in ${currentTheme} theme`}
                  fill
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.01]"
                  sizes="(max-width: 1024px) 100vw, 750px"
                  priority
                  unoptimized
                />

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center pointer-events-none">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                    <Maximize2 className="w-3.5 h-3.5 text-violet-400" />
                    <span>Click to Expand Full Resolution</span>
                  </div>
                </div>
              </div>

              {/* Viewport Bottom Bar */}
              <div className="px-4 py-2 bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400 flex items-center justify-between">
                <span>Active Module: <strong className="text-slate-800 dark:text-zinc-200">{activeFeature.name}</strong></span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-violet-600 dark:text-violet-400">{currentTheme} Theme Mode</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <ScreenshotLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        src={activeImageSrc}
        title={activeFeature.title}
        theme={currentTheme}
        onToggleTheme={togglePreviewTheme}
      />
    </section>
  )
}
