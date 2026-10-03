'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { isReducedMotion } from '@/lib/animations/landing'

const MARQUEE_ITEMS = [
  'Timetable Scanner',
  '1-Tap Attendance',
  'Safe Bunk Margins',
  'YouTube Lecture Hub',
  'Timestamped Notes',
  'Pomodoro Focus Suite',
  'Academic Vault',
  '365-Day Consistency Analytics',
  'Web & Android Sync',
]

export default function InfiniteFeatureMarquee() {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)

  useEffect(() => {
    if (!trackRef.current || isReducedMotion()) return

    const track = trackRef.current

    // Infinite seamless loop
    tweenRef.current = gsap.to(track, {
      xPercent: -50,
      repeat: -1,
      duration: 28,
      ease: 'none',
    })

    return () => {
      tweenRef.current?.kill()
    }
  }, [])

  const handleMouseEnter = () => {
    if (tweenRef.current) {
      gsap.to(tweenRef.current, { timeScale: 1.8, duration: 0.4, ease: 'power2.out' })
    }
  }

  const handleMouseLeave = () => {
    if (tweenRef.current) {
      gsap.to(tweenRef.current, { timeScale: 1.0, duration: 0.4, ease: 'power2.out' })
    }
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="py-6 sm:py-8 border-y border-slate-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 overflow-hidden relative select-none"
    >

      {/* Marquee Track */}
      <div ref={trackRef} className="flex w-max will-change-transform">
        {/* Double repeat for seamless looping */}
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 px-6 sm:px-8 shrink-0">
            <span className="text-sm sm:text-base font-semibold tracking-tight text-slate-800 dark:text-zinc-200 font-sans">
              {item}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500/60 dark:bg-violet-400/60 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
