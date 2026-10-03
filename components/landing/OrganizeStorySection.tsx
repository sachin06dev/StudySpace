'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import {
  CalendarDays,
  ShieldCheck,
  CheckSquare,
  FolderLock,
  Maximize2,
  CheckCircle2,
  Sun,
  Moon,
  ScanLine,
  ArrowRight,
} from 'lucide-react'
import ScreenshotLightbox from './ScreenshotLightbox'

export default function OrganizeStorySection() {
  const { resolvedTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<'attendance' | 'timetable' | 'tasks' | 'documents'>('attendance')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [storyTheme, setStoryTheme] = useState<'light' | 'dark' | null>(null)

  // Interactive Bunk Threshold selector for this section
  const [targetThreshold, setTargetThreshold] = useState<75 | 85>(75)

  const currentTheme = storyTheme || (resolvedTheme === 'dark' ? 'dark' : 'light')

  const toggleTheme = () => {
    setStoryTheme(currentTheme === 'dark' ? 'light' : 'dark')
  }

  const ASSETS = {
    attendance: {
      title: 'Attendance Safeguard & Bunk Math',
      badge: 'Zero Attendance Anxiety',
      description: 'Mark classes Present, Absent, or Cancel in 1 tap. Know exact classes you can skip while remaining above your college threshold.',
      light: '/screenshots/light/attendance-master.png',
      dark: '/screenshots/dark/attendance-master.png',
      highlights: [
        'Dynamic Bunk Buffer computes exact lectures you can miss without penalty',
        'Recovery Calculator determines consecutive classes required to exit low attendance danger',
        'Subject-by-subject history calendar editable anytime with zero data loss',
      ],
    },
    timetable: {
      title: 'AI Timetable & Routine Scanner',
      badge: 'Computer Vision OCR',
      description: 'Snap a picture of your printed college timetable. Gemini Vision automatically parses course slots, professors, and room numbers.',
      light: '/screenshots/light/timetable.png',
      dark: '/screenshots/dark/timetable.png',
      highlights: [
        'Instant OCR extraction parses complex printed grids in ~1.2 seconds',
        'Color-coded weekly view with room numbers and professor names',
        'Works completely offline on the Android companion app without campus Wi-Fi',
      ],
    },
    tasks: {
      title: 'Academic Task Matrix',
      badge: 'Urgency & Course Linked',
      description: 'Balance lab assignments, quiz revision, and final project deadlines with an academic-aware task planner.',
      light: '/screenshots/light/tasks.png',
      dark: '/screenshots/dark/tasks.png',
      highlights: [
        'Prioritized Eisenhower classification for critical semester deadlines',
        'Color-tagged by university courses for clean mental separation',
        'Integrates directly into your daily dashboard next-class checklist',
      ],
    },
    documents: {
      title: 'Academic Vault',
      badge: 'Encrypted Cloud Storage',
      description: 'Store semester syllabi, previous years exam papers, and lab manuals in a structured private vault.',
      light: '/screenshots/light/documents.png',
      dark: '/screenshots/dark/documents.png',
      highlights: [
        'Support for PDFs, presentations, and documents up to 50MB',
        'Fast in-browser PDF preview with instant download',
        'Organized cleanly by semester, subject, and resource category',
      ],
    },
  }

  const activeAsset = ASSETS[activeTab]
  const currentImageSrc = currentTheme === 'dark' ? activeAsset.dark : activeAsset.light

  return (
    <section id="organize-story" className="py-20 md:py-28 bg-white dark:bg-zinc-950 border-b border-slate-200/80 dark:border-zinc-800/80 transition-colors scroll-mt-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/60 text-xs font-semibold text-amber-700 dark:text-amber-300 shadow-2xs">
            <CalendarDays className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Feature Story • Organize</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
            Your semester,{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 dark:from-amber-400 dark:via-orange-300 dark:to-rose-400">
              finally organized.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto font-normal">
            No more manual calculations on napkins before bunking. No more hunting through chaotic group chats for the syllabus PDF.
          </p>
        </div>

        {/* AI Vision Scanner Spotlight Banner */}
        <div className="max-w-4xl mx-auto mb-12 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-violet-950/70 via-purple-950/50 to-zinc-900 border border-violet-800/60 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-left">
            <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-violet-600/30">
              <ScanLine className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-violet-300 uppercase">
                AI Vision Feature Spotlight
              </span>
              <strong className="text-sm sm:text-base font-bold text-white block">
                From timetable photo to organized schedule in 1.2s
              </strong>
              <span className="text-xs text-zinc-300">
                Snap a camera photo of your routine sheet · OCR extracts every room, slot, and course code automatically.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-violet-300 bg-violet-900/60 px-3 py-1.5 rounded-xl border border-violet-700/60 shrink-0">
            <span>PHOTO</span>
            <ArrowRight className="w-3 h-3" />
            <span>AI SCAN</span>
            <ArrowRight className="w-3 h-3" />
            <span className="text-emerald-300 font-bold">TIMETABLE</span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center justify-center gap-2 mb-8 select-none flex-wrap">
          {[
            { id: 'attendance', label: 'Attendance & Safe Bunks', icon: ShieldCheck },
            { id: 'timetable', label: 'Weekly Timetable', icon: CalendarDays },
            { id: 'tasks', label: 'Priority Tasks Matrix', icon: CheckSquare },
            { id: 'documents', label: 'Academic Vault', icon: FolderLock },
          ].map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as 'attendance' | 'timetable' | 'tasks' | 'documents')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer border ${
                  isActive
                    ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-500/20 scale-102'
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
              {activeTab === 'attendance' && (
                <div className="hidden sm:flex items-center gap-1 bg-slate-200 dark:bg-zinc-800 p-0.5 rounded-lg text-xs font-mono mr-2">
                  <button
                    type="button"
                    onClick={() => setTargetThreshold(75)}
                    className={`px-2 py-0.5 rounded-md transition-colors ${
                      targetThreshold === 75
                        ? 'bg-amber-600 text-white font-bold'
                        : 'text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    75% Rule
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetThreshold(85)}
                    className={`px-2 py-0.5 rounded-md transition-colors ${
                      targetThreshold === 85
                        ? 'bg-amber-600 text-white font-bold'
                        : 'text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    85% Rule
                  </button>
                </div>
              )}

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
                  <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
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
