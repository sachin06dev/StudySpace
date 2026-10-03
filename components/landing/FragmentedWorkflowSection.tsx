'use client'

import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  FileSpreadsheet,
  CalendarDays,
  Video,
  FileEdit,
  Timer,
  CheckSquare,
  Sparkles,
  ArrowDown,
} from 'lucide-react'
import { isReducedMotion } from '@/lib/animations/landing'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface FragmentItem {
  id: string
  title: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  badgeText: string
  colorTheme: {
    bg: string
    border: string
    text: string
    badgeBg: string
    badgeText: string
  }
  desktopOffset: {
    x: number
    y: number
    rotate: number
  }
}

const FRAGMENT_ITEMS: FragmentItem[] = [
  {
    id: 'attendance',
    title: 'Manual Attendance Log',
    subtitle: 'Guessing safe bunk margins by memory',
    icon: FileSpreadsheet,
    badgeText: 'Error prone',
    colorTheme: {
      bg: 'bg-white dark:bg-zinc-900',
      border: 'border-rose-200 dark:border-rose-900/60',
      text: 'text-rose-600 dark:text-rose-400',
      badgeBg: 'bg-rose-50 dark:bg-rose-950/60',
      badgeText: 'text-rose-700 dark:text-rose-300',
    },
    desktopOffset: { x: -310, y: -110, rotate: -5 },
  },
  {
    id: 'timetable',
    title: 'Paper Timetable Photo',
    subtitle: 'Zooming into a blurred classroom snapshot',
    icon: CalendarDays,
    badgeText: 'Unsearchable',
    colorTheme: {
      bg: 'bg-white dark:bg-zinc-900',
      border: 'border-amber-200 dark:border-amber-900/60',
      text: 'text-amber-600 dark:text-amber-400',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/60',
      badgeText: 'text-amber-700 dark:text-amber-300',
    },
    desktopOffset: { x: 310, y: -110, rotate: 5 },
  },
  {
    id: 'lectures',
    title: 'Ad-Heavy Video Tabs',
    subtitle: 'Losing timestamps when revising lectures',
    icon: Video,
    badgeText: 'Distracting',
    colorTheme: {
      bg: 'bg-white dark:bg-zinc-900',
      border: 'border-red-200 dark:border-red-900/60',
      text: 'text-red-600 dark:text-red-400',
      badgeBg: 'bg-red-50 dark:bg-red-950/60',
      badgeText: 'text-red-700 dark:text-red-300',
    },
    desktopOffset: { x: -340, y: 15, rotate: -4 },
  },
  {
    id: 'notes',
    title: 'Unlinked Random Notes',
    subtitle: 'Saved in miscellaneous folders and chats',
    icon: FileEdit,
    badgeText: 'Disconnected',
    colorTheme: {
      bg: 'bg-white dark:bg-zinc-900',
      border: 'border-violet-200 dark:border-violet-900/60',
      text: 'text-violet-600 dark:text-violet-400',
      badgeBg: 'bg-violet-50 dark:bg-violet-950/60',
      badgeText: 'text-violet-700 dark:text-violet-300',
    },
    desktopOffset: { x: 340, y: 15, rotate: 4 },
  },
  {
    id: 'timer',
    title: 'Separate Phone Timer',
    subtitle: 'Focus time never linked to actual subjects',
    icon: Timer,
    badgeText: 'No insights',
    colorTheme: {
      bg: 'bg-white dark:bg-zinc-900',
      border: 'border-blue-200 dark:border-blue-900/60',
      text: 'text-blue-600 dark:text-blue-400',
      badgeBg: 'bg-blue-50 dark:bg-blue-950/60',
      badgeText: 'text-blue-700 dark:text-blue-300',
    },
    desktopOffset: { x: -290, y: 135, rotate: -6 },
  },
  {
    id: 'tasks',
    title: 'Sticky Note Tasks',
    subtitle: 'Deadlines scattered across paper slips',
    icon: CheckSquare,
    badgeText: 'Missed dates',
    colorTheme: {
      bg: 'bg-white dark:bg-zinc-900',
      border: 'border-emerald-200 dark:border-emerald-900/60',
      text: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60',
      badgeText: 'text-emerald-700 dark:text-emerald-300',
    },
    desktopOffset: { x: 290, y: 135, rotate: 6 },
  },
]

export default function FragmentedWorkflowSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const unifiedCardRef = useRef<HTMLDivElement>(null)
  const scrubWordsRef = useRef<HTMLSpanElement[]>([])
  // Para words: each word in the "Your timetable is in one place..." line
  const paraWordsRef = useRef<HTMLSpanElement[]>([])

  // Toggle state between scattered and unified
  const [activeMode, setActiveMode] = useState<'converged' | 'scattered'>('converged')
  const isAnimatingManualRef = useRef(false)

  useEffect(() => {
    if (!sectionRef.current || isReducedMotion()) return

    const validCards = cardsRef.current.filter((c): c is HTMLDivElement => c !== null)
    const validWords = scrubWordsRef.current.filter((w): w is HTMLSpanElement => w !== null)

    const mm = gsap.matchMedia()

    // Desktop/Tablet (>= 768px): Natural, scrubbed convergence without page locking
    mm.add('(min-width: 768px)', () => {
      // 1. Initial positions: cards spread outwards around the center
      validCards.forEach((card, idx) => {
        const item = FRAGMENT_ITEMS[idx]
        if (item) {
          gsap.set(card, {
            x: item.desktopOffset.x,
            y: item.desktopOffset.y,
            rotation: item.desktopOffset.rotate,
            opacity: 0.95,
            scale: 1,
            pointerEvents: 'auto',
          })
        }
      })

      if (unifiedCardRef.current) {
        gsap.set(unifiedCardRef.current, {
          scale: 0.96,
          opacity: 0.88,
          y: 8,
        })
      }

      if (validWords.length > 0) {
        gsap.set(validWords, { opacity: 0.35 })
      }

      // Para words: starting dimmed
      const validParaWords = paraWordsRef.current.filter((w): w is HTMLSpanElement => w !== null)
      if (validParaWords.length > 0) {
        gsap.set(validParaWords, { opacity: 0.15 })
      }

      // 2. ScrollTrigger timeline: starts promptly as soon as section enters viewport
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%', // Starts early — no delayed trigger
          end: 'center 42%', // Reaches clean convergence comfortably before user leaves
          scrub: 0.8,
          onUpdate: (self) => {
            if (isAnimatingManualRef.current) return
            if (self.progress > 0.55) {
              setActiveMode('converged')
            } else {
              setActiveMode('scattered')
            }
          },
        },
      })

      // Fragmented cards glide into the center unified card
      tl.to(
        validCards,
        {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 0.6,
          opacity: 0,
          stagger: 0.02,
          ease: 'power2.inOut',
        },
        0
      )

      // Center card becomes fully illuminated
      if (unifiedCardRef.current) {
        tl.to(
          unifiedCardRef.current,
          {
            scale: 1,
            opacity: 1,
            y: 0,
            ease: 'power2.out',
          },
          0.1
        )
      }

      // Word-by-word headline reveal
      if (validWords.length > 0) {
        tl.to(
          validWords,
          {
            opacity: 1,
            stagger: 0.05,
            ease: 'power1.out',
          },
          0.15
        )
      }

      // Para words reveal in sync — slightly later so headline finishes first
      if (validParaWords.length > 0) {
        tl.to(
          validParaWords,
          {
            opacity: 1,
            stagger: 0.025,
            ease: 'power1.out',
          },
          0.25
        )
      }
    })

    // Mobile (< 768px): Graceful entrance without offscreen horizontal card collisions
    mm.add('(max-width: 767px)', () => {
      const validParaWordsMobile = paraWordsRef.current.filter((w): w is HTMLSpanElement => w !== null)
      if (validParaWordsMobile.length > 0) {
        gsap.set(validParaWordsMobile, { opacity: 0.15 })
      }

      if (unifiedCardRef.current) {
        gsap.fromTo(
          unifiedCardRef.current,
          { opacity: 0.8, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            scrollTrigger: {
              trigger: unifiedCardRef.current,
              start: 'top 85%',
            },
          }
        )
      }

      if (validWords.length > 0) {
        gsap.to(validWords, {
          opacity: 1,
          stagger: 0.08,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
          },
        })
      }

      if (validParaWordsMobile.length > 0) {
        gsap.to(validParaWordsMobile, {
          opacity: 1,
          stagger: 0.04,
          duration: 0.4,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 78%',
          },
        })
      }
    })

    return () => {
      mm.revert()
    }
  }, [])

  // Manual interactive switch handler (smooth programmatic override)
  const handleModeSwitch = (mode: 'converged' | 'scattered') => {
    setActiveMode(mode)
    isAnimatingManualRef.current = true

    const validCards = cardsRef.current.filter((c): c is HTMLDivElement => c !== null)
    const validWords = scrubWordsRef.current.filter((w): w is HTMLSpanElement => w !== null)

    if (mode === 'scattered') {
      validCards.forEach((card, idx) => {
        const item = FRAGMENT_ITEMS[idx]
        if (item) {
          gsap.to(card, {
            x: item.desktopOffset.x,
            y: item.desktopOffset.y,
            rotation: item.desktopOffset.rotate,
            scale: 1,
            opacity: 0.95,
            duration: 0.45,
            ease: 'back.out(1.3)',
          })
        }
      })
      if (unifiedCardRef.current) {
        gsap.to(unifiedCardRef.current, {
          scale: 0.96,
          opacity: 0.88,
          y: 8,
          duration: 0.4,
          ease: 'power2.out',
        })
      }
      if (validWords.length > 0) {
        gsap.to(validWords, { opacity: 0.4, duration: 0.3 })
      }
    } else {
      gsap.to(validCards, {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 0.6,
        opacity: 0,
        duration: 0.4,
        stagger: 0.02,
        ease: 'power2.inOut',
      })
      if (unifiedCardRef.current) {
        gsap.to(unifiedCardRef.current, {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: 'back.out(1.4)',
        })
      }
      if (validWords.length > 0) {
        gsap.to(validWords, { opacity: 1, duration: 0.3 })
      }
    }

    setTimeout(() => {
      isAnimatingManualRef.current = false
    }, 550)
  }

  return (
    <section
      ref={sectionRef}
      className="relative bg-slate-50 dark:bg-zinc-950 transition-colors py-16 sm:py-24 px-4 sm:px-6 overflow-hidden z-10"
    >
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-900/60 text-xs font-semibold text-rose-700 dark:text-rose-400 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>The Reality</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
            {['College', 'is', 'already', 'complicated.'].map((word, i) => (
              <React.Fragment key={i}>
                <span
                  ref={(el) => {
                    if (el) scrubWordsRef.current[i] = el
                  }}
                  className="inline-block transition-colors"
                >
                  {word}
                </span>
                {i < 3 && ' '}
              </React.Fragment>
            ))}
          </h2>
          {/* Animated paragraph — words revealed progressively by GSAP scrub */}
          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 mt-3 max-w-xl mx-auto leading-relaxed">
            {[
              'Your', 'timetable', 'is', 'in', 'one', 'place.', 'Notes', 'are', 'somewhere', 'else.',
              'Attendance', 'needs', 'another', 'app.', 'StudySpace', 'brings', 'it', 'together.'
            ].map((word, i) => (
              <React.Fragment key={i}>
                <span
                  ref={(el) => {
                    if (el) paraWordsRef.current[i] = el
                  }}
                  className="inline-block"
                >
                  {word}
                </span>
                {i < 17 && ' '}
              </React.Fragment>
            ))}
          </p>

          {/* Interactive State Toggle */}
          <div className="mt-6 inline-flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-zinc-800/80 border border-slate-300/80 dark:border-zinc-700/80">
            <button
              type="button"
              onClick={() => handleModeSwitch('scattered')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeMode === 'scattered'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              The Scattered Reality
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('converged')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeMode === 'converged'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Unified StudySpace</span>
            </button>
          </div>
        </div>

        {/* Mobile-Only Fragmented Pain Points Bar (< 768px) */}
        <div className="w-full md:hidden mb-8 grid grid-cols-2 gap-2 max-w-md mx-auto">
          {FRAGMENT_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={`mobile-${item.id}`}
                className={`p-2.5 rounded-xl border ${item.colorTheme.bg} ${item.colorTheme.border}`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className={`w-3.5 h-3.5 ${item.colorTheme.text}`} />
                  <span className="text-[11px] font-semibold text-slate-900 dark:text-zinc-100 truncate">
                    {item.title}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400">
                  <span className="truncate">{item.badgeText}</span>
                  <span className="text-rose-500 font-bold">✕</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Desktop Interactive Convergence Stage (>= 768px) */}
        <div
          ref={stageRef}
          className="relative w-full max-w-5xl min-h-[380px] sm:min-h-[440px] flex items-center justify-center my-2"
        >
          {/* FRAGMENTED CARDS: Spread out on desktop, converge inward on scroll */}
          {FRAGMENT_ITEMS.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={item.id}
                ref={(el) => {
                  cardsRef.current[idx] = el
                }}
                className={`hidden md:block absolute w-56 p-3.5 rounded-2xl border ${item.colorTheme.bg} ${item.colorTheme.border} shadow-lg z-20 transition-shadow select-none`}
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${item.colorTheme.text}`} />
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                      {item.title}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">
                  {item.subtitle}
                </p>
                <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold font-mono ${item.colorTheme.badgeBg} ${item.colorTheme.badgeText}`}
                  >
                    {item.badgeText}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Isolated</span>
                </div>
              </div>
            )
          })}

          {/* ========================================================
              UNIFIED CENTERPIECE — REVEALED AS FRAGMENTS CONVERGE
              ======================================================== */}
          <div
            ref={unifiedCardRef}
            className="relative z-10 w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-violet-600 dark:border-violet-500 shadow-xl text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 font-mono text-xs font-bold mb-4 border border-violet-200 dark:border-violet-800">
              <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              <span>ALL IN ONE PLACE</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-100 mb-3 tracking-tight">
              {['Keep', 'your', 'whole', 'semester', 'together.'].map((word, i) => (
                <React.Fragment key={i}>
                  <span
                    ref={(el) => {
                      if (el) scrubWordsRef.current[i] = el
                    }}
                    className="transition-colors duration-200"
                  >
                    {word}
                  </span>
                  {i < 4 && ' '}
                </React.Fragment>
              ))}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed mb-6">
              When your timetable, attendance, lecture notes, and study timer connect to the same subjects, everything stays organized.
            </p>

            {/* Core Pillars Inside Unified Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60">
                <span className="text-[10px] text-slate-400 block font-mono">TIMETABLE</span>
                <strong className="text-xs text-slate-800 dark:text-zinc-200">AI Digitized</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60">
                <span className="text-[10px] text-slate-400 block font-mono">ATTENDANCE</span>
                <strong className="text-xs text-emerald-600 dark:text-emerald-400">Safe Margins</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60">
                <span className="text-[10px] text-slate-400 block font-mono">LECTURES</span>
                <strong className="text-xs text-violet-600 dark:text-violet-400">Timestamped</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60">
                <span className="text-[10px] text-slate-400 block font-mono">DEVICES</span>
                <strong className="text-xs text-purple-600 dark:text-purple-400">Web &amp; Android</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Cue */}
        <div className="mt-8 flex items-center gap-2 text-xs font-mono text-slate-400 dark:text-zinc-500">
          <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          <span>Keep scrolling to explore core features</span>
        </div>
      </div>
    </section>
  )
}
