'use client'

import React, { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'
import Image from 'next/image'
import {
  Smartphone,
  Download,
  WifiOff,
  Zap,
  ShieldCheck,
  Calendar,
  Home,
  BookOpen,
  BarChart3,
  Share2,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import ShareQRModal from '@/components/landing/ShareQRModal'
import type { MobileReleaseManifest } from '@/lib/config/release'
import { FALLBACK_RELEASE_MANIFEST } from '@/lib/config/release'
import { isReducedMotion } from '@/lib/animations/landing'

type TabType = 'home' | 'attendance' | 'timetable' | 'study' | 'analytics'

interface TabConfig {
  id: TabType
  label: string
  icon: React.ComponentType<{ className?: string }>
  image: string
  alt: string
  tagline: string
  description: string
}

const TABS: TabConfig[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    image: '/screenshots/mobile/home.webp',
    alt: 'StudySpace Mobile Home Screen with Class Schedule and Quick Attendance',
    tagline: 'Daily Hub',
    description: "Today's classes, countdown timer, quick attendance actions, and active study streak.",
  },
  {
    id: 'attendance',
    label: 'Attendance',
    icon: ShieldCheck,
    image: '/screenshots/mobile/attendance.webp',
    alt: 'StudySpace Mobile Attendance Screen with Bunk Calculator',
    tagline: 'Smart Safeguard',
    description: '1-tap Present, Absent & Cancel with live bunk margins calculated per subject.',
  },
  {
    id: 'timetable',
    label: 'Timetable',
    icon: Calendar,
    image: '/screenshots/mobile/timetable.webp',
    alt: 'StudySpace Mobile Timetable Screen with Weekly Routine',
    tagline: 'Offline Routine',
    description: 'Weekly campus schedule cached locally with room numbers and class timings.',
  },
  {
    id: 'study',
    label: 'Study',
    icon: BookOpen,
    image: '/screenshots/mobile/study.webp',
    alt: 'StudySpace Mobile Study Hub with Notes and Videos',
    tagline: 'Focused Study',
    description: 'Lecture videos with timestamped notes, Pomodoro study sessions, and private documents.',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    image: '/screenshots/mobile/analytics.webp',
    alt: 'StudySpace Mobile Analytics Screen with Study Trends and Hours',
    tagline: 'Growth Insights',
    description: 'Consistency heatmap, study hour trends, and subject-wise attendance breakdown.',
  },
]

// Real phone screen viewport using authentic mobile app screenshots (WebP, 1080x2400)
function PhoneScreenViewport({ activeTab }: { activeTab: TabType }) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (contentRef.current && !isReducedMotion()) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0.85, scale: 0.985 },
        { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }
      )
    }
  }, [activeTab])

  return (
    <div
      ref={contentRef}
      className="relative w-full aspect-[1080/2400] bg-zinc-950 overflow-hidden"
    >
      {TABS.map((tab) => {
        const isSelected = activeTab === tab.id
        return (
          <div
            key={tab.id}
            className={`absolute inset-0 transition-opacity duration-300 ease-out ${
              isSelected ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <Image
              src={tab.image}
              alt={tab.alt}
              fill
              sizes="(max-width: 640px) 280px, 310px"
              className="object-cover object-top select-none"
              priority={tab.id === 'home'}
              loading={tab.id === 'home' ? 'eager' : 'lazy'}
            />
          </div>
        )
      })}
    </div>
  )
}

export default function AndroidPhoneShowcaseSection({
  release,
}: {
  release?: MobileReleaseManifest
}) {
  const activeRelease = release || FALLBACK_RELEASE_MANIFEST
  const [activeTab, setActiveTab] = useState<TabType>('home')
  const [isHovered, setIsHovered] = useState(false)
  const [isFullyInView, setIsFullyInView] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)

  const phoneContainerRef = useRef<HTMLDivElement>(null)
  const phoneFrameRef = useRef<HTMLDivElement>(null)

  // Canonical download URL from site URL
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://studyspace4u.vercel.app'
  const downloadUrl = `${siteUrl.replace(/\/$/, '')}/api/download/android`

  // 1. Entrance animation (once: true, strictly no scroll scrubbing)
  useEffect(() => {
    if (!phoneFrameRef.current || isReducedMotion()) return

    gsap.from(phoneFrameRef.current, {
      y: 28,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      clearProps: 'transform,opacity',
    })
  }, [])

  // 2. IntersectionObserver (detect when phone is prominently in view)
  useEffect(() => {
    if (!phoneContainerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        setIsFullyInView(entry.isIntersecting && entry.intersectionRatio >= 0.6)
      },
      {
        threshold: [0.6],
      }
    )

    observer.observe(phoneContainerRef.current)
    return () => observer.disconnect()
  }, [])

  // 3. Calm auto-cycle: pauses on hover, reduced motion, or when QR modal is open
  useEffect(() => {
    if (!isFullyInView || isHovered || isReducedMotion() || shareModalOpen) return

    const interval = setInterval(() => {
      setActiveTab((current) => {
        const currentIdx = TABS.findIndex((t) => t.id === current)
        const nextIdx = (currentIdx + 1) % TABS.length
        return TABS[nextIdx].id
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [isFullyInView, isHovered, shareModalOpen])

  return (
    <section
      id="android"
      className="py-16 md:py-24 bg-slate-50/50 dark:bg-zinc-950/40 border-b border-slate-200 dark:border-zinc-800 transition-colors relative"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-violet-700 dark:text-violet-300">
            <Smartphone className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span>Study Companion App</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
            StudySpace goes with you.
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 font-normal leading-relaxed">
            Your timetable, tasks, attendance, notes, and recent study activity stay with you on your phone.
          </p>

          {/* Interactive Screen Selector Tabs */}
          <div className="flex items-center justify-center gap-1.5 pt-2 overflow-x-auto pb-2 select-none">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isSelected = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:text-slate-900 dark:hover:text-zinc-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Active Tab Focus Pill */}
          <div className="pt-1 flex items-center justify-center min-h-[28px]">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-900/60 text-xs text-violet-700 dark:text-violet-300 font-medium transition-all">
              <span className="font-bold font-mono">{TABS.find((t) => t.id === activeTab)?.tagline}:</span>
              <span className="text-slate-600 dark:text-zinc-300">{TABS.find((t) => t.id === activeTab)?.description}</span>
            </span>
          </div>
        </div>

        {/* Device Showcase Composition */}
        <div
          ref={phoneContainerRef}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center max-w-5xl mx-auto"
        >
          {/* Phone Frame — Sleek Matte Black Hardware Case */}
          <div className="lg:col-span-5 flex justify-center order-1">
            <div
              ref={phoneFrameRef}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onTouchStart={() => setIsHovered(true)}
              onTouchEnd={() => setIsHovered(false)}
              className="relative w-[280px] sm:w-[310px] rounded-[44px] border-[10px] border-zinc-950 dark:border-black bg-zinc-950 shadow-2xl overflow-hidden select-none"
            >
              {/* Speaker / Camera Notch */}
              <div className="h-5 bg-zinc-950 flex items-center justify-center pt-1.5 z-20 relative pointer-events-none">
                <div className="w-14 h-2 bg-zinc-800 rounded-full" />
              </div>

              {/* Local Screen Content Viewport */}
              <PhoneScreenViewport activeTab={activeTab} />
            </div>
          </div>

          {/* Right Benefits Column */}
          <div className="lg:col-span-7 space-y-5 text-left order-2">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 font-mono">
                Study Anywhere
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-100">
                Built for the campus hallway, not just your desk.
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed">
                You don’t have your laptop open when walking between lecture halls. The study companion app puts your immediate academic needs right in your pocket.
              </p>
            </div>

            {/* Benefit Checkpoints */}
            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <WifiOff className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-sm font-bold text-slate-900 dark:text-zinc-100 block">
                    100% Offline Timetable &amp; Cache
                  </strong>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Campus basements and dead zones won’t lock you out. Your timetable and recent data are stored locally on your device.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
                <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-sm font-bold text-slate-900 dark:text-zinc-100 block">
                    1-Tap Attendance Outside Class
                  </strong>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Mark classes Present or Absent in seconds. The app recalculates your safe bunk margin immediately.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-sm font-bold text-slate-900 dark:text-zinc-100 block">
                    Instant Cloud Synchronization
                  </strong>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Everything you log on your phone syncs to your web dashboard automatically as soon as you reconnect.
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Download Actions & QR Code */}
            <div className="pt-2 flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="/api/download/android"
                  download={`StudySpace-v${activeRelease.latestVersion}.apk`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download APK (v{activeRelease.latestVersion})</span>
                </a>

                <button
                  type="button"
                  onClick={() => setShareModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 font-semibold text-sm transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  <span>Share QR Code</span>
                </button>
              </div>

              <span className="text-xs text-slate-400 font-mono block">
                Direct install · No store account required
              </span>

              {/* High-Fidelity Scannable QR Code on Desktop */}
              <div className="hidden lg:flex items-center gap-5 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs max-w-lg">
                <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-xs shrink-0">
                  <QRCodeSVG
                    value={downloadUrl}
                    size={160}
                    level="H"
                    includeMargin={true}
                    imageSettings={{
                      src: '/favicon.ico',
                      height: 32,
                      width: 32,
                      excavate: true,
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 block">
                    Mobile Install
                  </span>
                  <strong className="text-sm font-bold text-slate-900 dark:text-zinc-100 block">
                    Scan with your phone camera
                  </strong>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Downloads the verified APK file directly to your phone. Open and install in 1 tap.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShareModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline pt-0.5 cursor-pointer"
                  >
                    <span>Create sharable study companion app QR card</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Branded QR Modal */}
      <ShareQRModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        downloadUrl={downloadUrl}
        versionText={activeRelease.latestVersion}
      />
    </section>
  )
}
