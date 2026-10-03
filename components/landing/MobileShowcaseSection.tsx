'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import type { MobileReleaseManifest } from '@/lib/config/release'
import { FALLBACK_RELEASE_MANIFEST } from '@/lib/config/release'

type MobileScreen = 'home' | 'attendance' | 'timetable' | 'study' | 'analytics'

interface ScreenInfo {
  id: MobileScreen
  label: string
  subtitle: string
  pill: string
  imageSrc: string
}

const SCREENS: ScreenInfo[] = [
  {
    id: 'home',
    label: 'Home',
    subtitle: "Today's schedule, next class countdown & quick attendance actions",
    pill: 'Daily Hub',
    imageSrc: '/images/app/app-home.jpg',
  },
  {
    id: 'attendance',
    label: 'Attendance',
    subtitle: '1-tap Present, Absent & Cancel with live margin calculation per subject',
    pill: 'Live Tracker',
    imageSrc: '/images/app/app-attendance.jpg',
  },
  {
    id: 'timetable',
    label: 'Timetable',
    subtitle: 'Full weekly offline routine — rooms, timings, no Wi-Fi needed',
    pill: 'Offline Schedule',
    imageSrc: '/images/app/app-timetable.jpg',
  },
  {
    id: 'study',
    label: 'Study',
    subtitle: 'Lecture videos with timestamped note jumps — study smarter, not longer',
    pill: 'Focused Video',
    imageSrc: '/images/app/app-study.jpg',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    subtitle: 'Consistency heatmap, study streaks & subject-wise attendance breakdown',
    pill: 'Compounding Habits',
    imageSrc: '/images/app/app-analytics.jpg',
  },
]

export default function MobileShowcaseSection({
  release,
}: {
  release?: MobileReleaseManifest
}) {
  const [activeScreen, setActiveScreen] = useState<MobileScreen>('home')
  const activeRelease = release || FALLBACK_RELEASE_MANIFEST
  const downloadUrl = '/api/download/android'

  const currentScreen = SCREENS.find((s) => s.id === activeScreen)!

  return (
    <section id="app" className="py-20 md:py-28 scroll-mt-16 bg-white dark:bg-(--canvas) transition-colors border-b border-gray-200/80 dark:border-(--border-subtle)">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/60 border border-violet-200/60 dark:border-violet-800/60 text-xs font-semibold text-violet-700 dark:text-violet-300">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.996-3.4572c.1561-.2706.0634-.6163-.2073-.7724-.2705-.1562-.6163-.0635-.7724.2072l-2.0246 3.5067c-1.5367-.7016-3.2662-1.0924-5.1232-1.0924-1.857 0-3.5865.3908-5.1232 1.0924L4.6062 5.3057c-.1561-.2707-.502-.3634-.7725-.2072-.2707.1561-.3634.5018-.2073.7724l1.996 3.4572C2.4577 11.047 0 14.8872 0 19.3414h24c0-4.4542-2.4577-8.2944-6.1185-10.02" />
            </svg>
            <span>Android Companion App</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 leading-tight">
            StudySpace on Android.
          </h2>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            Your classes, attendance and study tools wherever you are.
          </p>
        </div>

        {/* Screen Switcher Chips */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-10 select-none">
          {SCREENS.map((screen) => {
            const isActive = activeScreen === screen.id
            return (
              <button
                key={screen.id}
                type="button"
                onClick={() => setActiveScreen(screen.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-xs scale-102'
                    : 'bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/80'
                }`}
              >
                {screen.label}
              </button>
            )
          })}
        </div>

        {/* Device Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center max-w-6xl mx-auto">
          {/* Left Context: Screen highlights */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left order-2 lg:order-1">
            <div className="space-y-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 uppercase tracking-wider">
                {currentScreen.pill}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                {currentScreen.label} Experience
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg mx-auto lg:mx-0">
                {currentScreen.subtitle}. Everything you mark on your Android phone syncs immediately to your desktop workspace.
              </p>
            </div>

            {/* Mobile Feature Highlights */}
            <div className="space-y-3 pt-1 text-left">
              {[
                { title: '1-Tap Attendance', desc: 'Present, Absent, or Cancel right outside your classroom door' },
                { title: 'Offline Timetable', desc: 'Look up room numbers and lecture timings without waiting for campus Wi-Fi' },
                { title: 'Real-time Sync', desc: 'Your progress stays completely unified across phone and laptop' },
              ].map((item, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-(--surface) border border-gray-200/80 dark:border-(--border-subtle) flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-violet-100 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-gray-900 dark:text-gray-100 block">
                      {item.title}
                    </strong>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      {item.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Release Version Info & Download CTA */}
            <div className="pt-2 flex flex-col space-y-3">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-violet-50 dark:bg-violet-950/50 border border-violet-200/80 dark:border-violet-800/60 text-xs font-semibold text-violet-700 dark:text-violet-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Latest Version: v{activeRelease.latestVersion} (Build {activeRelease.latestBuild})
                </span>
                {activeRelease.apkSize > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {(activeRelease.apkSize / (1024 * 1024)).toFixed(1)} MB
                  </span>
                )}
              </div>

              {activeRelease.releaseNotes && activeRelease.releaseNotes.length > 0 && (
                <div className="p-3 rounded-xl bg-violet-50/40 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40 text-left">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300 block mb-1">
                    What&apos;s New:
                  </span>
                  <ul className="space-y-0.5 text-xs text-gray-600 dark:text-gray-400">
                    {activeRelease.releaseNotes.map((note, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="text-violet-500">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
                <a
                  href={downloadUrl}
                  download={`StudySpace-v${activeRelease.latestVersion}.apk`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm shadow-md hover:shadow-violet-500/25 active:scale-95 transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.996-3.4572c.1561-.2706.0634-.6163-.2073-.7724-.2705-.1562-.6163-.0635-.7724.2072l-2.0246 3.5067c-1.5367-.7016-3.2662-1.0924-5.1232-1.0924-1.857 0-3.5865.3908-5.1232 1.0924L4.6062 5.3057c-.1561-.2707-.502-.3634-.7725-.2072-.2707.1561-.3634.5018-.2073.7724l1.996 3.4572C2.4577 11.047 0 14.8872 0 19.3414h24c0-4.4542-2.4577-8.2944-6.1185-10.02" />
                  </svg>
                  <span>Download Release APK</span>
                </a>

                <Link
                  href="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold text-sm transition-colors"
                >
                  Use Web Workspace
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Real Phone Screenshot in Device Frame */}
          <div className="lg:col-span-6 flex justify-center order-1 lg:order-2">
            <div className="relative w-full max-w-[280px] sm:max-w-[300px]">
              {/* Phone outer frame */}
              <div className="relative rounded-[44px] border-[10px] border-zinc-800 dark:border-zinc-700 bg-zinc-900 shadow-2xl shadow-violet-500/10 overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-24 h-5 bg-zinc-800 dark:bg-zinc-700 rounded-b-2xl" />

                {/* Screenshot — aspect ratio locked to ~9:19.5 (Android tall screen) */}
                <div className="relative w-full" style={{ paddingBottom: '216%' }}>
                  {SCREENS.map((screen) => (
                    <div
                      key={screen.id}
                      className={`absolute inset-0 transition-opacity duration-300 ${
                        screen.id === activeScreen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                      }`}
                    >
                      <Image
                        src={screen.imageSrc}
                        alt={`StudySpace Android app — ${screen.label} screen`}
                        fill
                        sizes="(max-width: 640px) 280px, 300px"
                        className="object-cover object-top"
                        quality={85}
                        priority={screen.id === 'home'}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Side Volume Buttons (decorative) */}
              <div className="absolute -right-3 top-20 w-1.5 h-10 bg-zinc-700 rounded-r-sm" />
              <div className="absolute -left-3 top-16 w-1.5 h-6 bg-zinc-700 rounded-l-sm" />
              <div className="absolute -left-3 top-24 w-1.5 h-6 bg-zinc-700 rounded-l-sm" />
              <div className="absolute -left-3 top-32 w-1.5 h-10 bg-zinc-700 rounded-l-sm" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
