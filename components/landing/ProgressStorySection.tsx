'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import {
  Activity,
  Flame,
  TrendingUp,
  BarChart3,
  Maximize2,
  CheckCircle2,
  Sun,
  Moon,
  ShieldCheck,
  Calendar,
} from 'lucide-react'
import ScreenshotLightbox from './ScreenshotLightbox'

export default function ProgressStorySection() {
  const { resolvedTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<'full' | 'consistency' | 'performance'>('full')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [storyTheme, setStoryTheme] = useState<'light' | 'dark' | null>(null)

  const currentTheme = storyTheme || (resolvedTheme === 'dark' ? 'dark' : 'light')

  const toggleTheme = () => {
    setStoryTheme(currentTheme === 'dark' ? 'light' : 'dark')
  }

  const ASSETS = {
    full: {
      title: 'Comprehensive Academic Analytics Engine',
      badge: 'All Signals Unified',
      description: 'Your entire academic discipline plotted in one cohesive view: study time, attendance adherence, task velocity, and active habit streaks.',
      light: '/screenshots/light/analytics-full.png',
      dark: '/screenshots/dark/analytics-full.png',
      highlights: [
        'Total semester study hours tracked automatically across videos and Pomodoro sessions',
        'Overall attendance score vs. the 75% university requirement',
        'Task completion rate showing weekly velocity and pending project load',
      ],
    },
    consistency: {
      title: '365-Day Consistency Heatmap',
      badge: 'Habit Compounding',
      description: 'GitHub-style activity squares that show your daily study effort and reward long streaks.',
      light: '/screenshots/light/analytics-consistency.png',
      dark: '/screenshots/dark/analytics-consistency.png',
      highlights: [
        'GitHub-style visual heatmap of daily academic effort',
        'Highlights unbroken streaks and milestone achievements (7, 30, 100 days)',
        'Diurnal hourly breakdown reveals your personal peak productivity windows',
      ],
    },
    performance: {
      title: 'Subject Attendance & Performance Donuts',
      badge: 'Course Adherence',
      description: 'Subject-by-subject target adherence donuts ensuring you never drop below college minimums.',
      light: '/screenshots/light/analytics-performance.png',
      dark: '/screenshots/dark/analytics-performance.png',
      highlights: [
        'Individual course donut gauges showing exact safety margins',
        'Instant alerts for subjects nearing the 75% attendance boundary',
        'Recovery class requirements calculated in real time per subject',
      ],
    },
  }

  const activeAsset = ASSETS[activeTab]
  const currentImageSrc = currentTheme === 'dark' ? activeAsset.dark : activeAsset.light

  return (
    <section id="progress-story" className="py-20 md:py-28 bg-white dark:bg-zinc-950 border-b border-slate-200/80 dark:border-zinc-800/80 transition-colors scroll-mt-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 text-xs font-semibold text-emerald-700 dark:text-emerald-300 shadow-2xs">
            <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Feature Story • Progress</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
            Know whether you&apos;re{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-violet-600 dark:from-emerald-400 dark:via-teal-300 dark:to-violet-400">
              actually progressing.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto font-normal">
            Cramming at the last minute causes panic. StudySpace turns your daily efforts into visual momentum with 365-day consistency heatmaps, focus rhythm charts, and attendance health donuts.
          </p>
        </div>

        {/* 4 Compounding Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 max-w-5xl mx-auto mb-12 text-left">
          {[
            { icon: Activity, title: 'Study Velocity', value: '28.5 hrs/wk', desc: 'Auto-logged from video & Pomodoro' },
            { icon: ShieldCheck, title: 'Safe Bunk Margin', value: '84.6% Avg', desc: '3.4 classes safe buffer across courses' },
            { icon: Flame, title: 'Consistency Streak', value: '14 Days', desc: 'Daily academic engagement streak' },
            { icon: TrendingUp, title: 'Task Adherence', value: '94% On-time', desc: 'Zero missed assignments this term' },
          ].map((metric, i) => {
            const Icon = metric.icon
            return (
              <div
                key={i}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 space-y-1.5 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">{metric.title}</span>
                  <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <strong className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 block font-mono">
                  {metric.value}
                </strong>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block leading-tight">
                  {metric.desc}
                </span>
              </div>
            )
          })}
        </div>

        {/* Tab Selector */}
        <div className="flex items-center justify-center gap-2 mb-8 select-none flex-wrap">
          {[
            { id: 'full', label: 'Complete Analytics Engine', icon: BarChart3 },
            { id: 'consistency', label: '365-Day Consistency Heatmap', icon: Calendar },
            { id: 'performance', label: 'Attendance & Target Donuts', icon: ShieldCheck },
          ].map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as 'full' | 'consistency' | 'performance')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer border ${
                  isActive
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20 scale-102'
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
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
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
