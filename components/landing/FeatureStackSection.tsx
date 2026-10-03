'use client'

import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ShieldCheck,
  ScanLine,
  Video,
  Timer,
  FolderLock,
  Layers,
  ArrowRight,
} from 'lucide-react'
import { isReducedMotion } from '@/lib/animations/landing'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const STACK_CARDS = [
  {
    id: 'attendance',
    num: '01',
    category: 'Attendance Safeguard',
    title: 'Mathematical precision for attendance and safe bunk margins.',
    description:
      'Never wonder whether you can skip tomorrow morning’s lecture. StudySpace calculates your exact percentage and informs you how many classes you can afford to miss or must attend to stay above 75%.',
    icon: ShieldCheck,
    tag: 'Safe Bunk Engine',
    imageLight: '/screenshots/light/attendance-master.png',
    imageDark: '/screenshots/dark/attendance-master.png',
  },
  {
    id: 'timetable',
    num: '02',
    category: 'Computer Vision',
    title: 'Digitize your schedule from a routine photo in seconds.',
    description:
      'Snap a picture of your college routine board. StudySpace parses classes, timings, room numbers, and professors into your daily countdown.',
    icon: ScanLine,
    tag: 'OCR Scheduling',
    imageLight: '/screenshots/light/timetable.png',
    imageDark: '/screenshots/dark/timetable.png',
  },
  {
    id: 'videos',
    num: '03',
    category: 'YouTube Lecture Hub',
    title: 'Watch YouTube lectures with video-anchored notes.',
    description:
      'Save playlist videos by subject. Add notes at specific seconds, and click any note during revision to jump right back to the explanation.',
    icon: Video,
    tag: 'Timestamp Notes',
    imageLight: '/screenshots/light/videos-player.png',
    imageDark: '/screenshots/dark/videos-player.png',
  },
  {
    id: 'focus',
    num: '04',
    category: 'Deep Work Suite',
    title: 'Pomodoro focus sessions that feed your actual progress.',
    description:
      'Integrated focus timer with ambient soundscapes. Completed sessions log automatically into your consistency heatmap and subject analytics.',
    icon: Timer,
    tag: '25m Focus Intervals',
    imageLight: '/screenshots/light/pomodoro.png',
    imageDark: '/screenshots/dark/pomodoro.png',
  },
  {
    id: 'vault',
    num: '05',
    category: 'Academic Storage',
    title: 'Your course syllabus, slides, and exam papers in one vault.',
    description:
      'Stop searching through unorganized chat groups and email threads. Keep all subject materials organized by semester.',
    icon: FolderLock,
    tag: 'Document Vault',
    imageLight: '/screenshots/light/documents.png',
    imageDark: '/screenshots/dark/documents.png',
  },
]

export default function FeatureStackSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (!containerRef.current || isReducedMotion()) return

    const cards = cardsRef.current.filter((c): c is HTMLDivElement => c !== null)

    // ScrollTrigger stacking animation
    cards.forEach((card, index) => {
      if (index === cards.length - 1) return // last card doesn't need to scale down

      gsap.to(card, {
        scale: 0.94,
        opacity: 0.5,
        ease: 'none',
        scrollTrigger: {
          trigger: cards[index + 1],
          start: 'top 75%',
          end: 'top 20%',
          scrub: true,
        },
      })
    })

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.trigger && cards.includes(st.vars.trigger as HTMLDivElement)) {
          st.kill()
        }
      })
    }
  }, [])

  return (
    <section ref={containerRef} className="py-16 md:py-24 bg-slate-50 dark:bg-zinc-950 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-violet-700 dark:text-violet-300">
            <Layers className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span>FEATURE SUITE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
            Engineered specifically for your semester.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 font-normal leading-relaxed">
            Scroll down to review the core pillars that turn chaotic study routines into an organized academic system.
          </p>
        </div>

        {/* Stacking Card Container */}
        <div className="space-y-8 sm:space-y-12">
          {STACK_CARDS.map((card, i) => {
            const Icon = card.icon
            return (
              <div
                key={card.id}
                ref={(el) => {
                  cardsRef.current[i] = el
                }}
                className="sticky top-20 sm:top-24 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-md p-6 sm:p-8 overflow-hidden"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Left Column: Story details */}
                  <div className="lg:col-span-6 space-y-3.5 text-left">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-2xl sm:text-3xl font-extrabold text-violet-600 dark:text-violet-400">
                        {card.num}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-violet-50 dark:bg-zinc-800 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-zinc-700">
                        {card.tag}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-zinc-100 leading-snug">
                      {card.title}
                    </h3>

                    <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed">
                      {card.description}
                    </p>

                    <div className="pt-1">
                      <a
                        href="/signup"
                        className="inline-flex items-center gap-2 text-violet-600 dark:text-violet-400 font-semibold text-sm hover:underline group cursor-pointer"
                      >
                        <span>Try {card.category} in StudySpace</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </div>

                  {/* Right Column: Real Screenshot preview (Theme-aware dual render, zero gradients) */}
                  <div className="lg:col-span-6">
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-950 aspect-[16/10] shadow-sm">
                      <Image
                        src={card.imageLight}
                        alt={card.title}
                        fill
                        unoptimized
                        sizes="(max-width: 1024px) 100vw, 560px"
                        className="object-cover object-top dark:hidden"
                      />
                      <Image
                        src={card.imageDark}
                        alt={card.title}
                        fill
                        unoptimized
                        sizes="(max-width: 1024px) 100vw, 560px"
                        className="object-cover object-top hidden dark:block"
                      />
                      <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-700 text-[10px] text-slate-700 dark:text-zinc-300 font-mono">
                        <Icon className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                        <span>Real StudySpace UI Preview</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
