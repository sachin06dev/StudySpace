'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initLenis, isReducedMotion } from '@/lib/animations/landing'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function LandingMotionEffects() {
  const progressBarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const reduced = isReducedMotion()

    // 0. Lenis — initLenis() returns its own cleanup fn; call it on unmount
    const destroyLenis = reduced ? undefined : initLenis()

    // 1. Top Scroll Progress Bar
    if (progressBarRef.current && !reduced) {
      gsap.to(progressBarRef.current, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.25,
        },
      })
    }

    // 2. Refresh ScrollTrigger once after fonts load (prevents repeated layout shift during scroll)
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh()
      })
    }

    return () => {
      destroyLenis?.()
    }
  }, [])

  return (
    <>
      {/* Top Scroll Progress Indicator */}
      <div
        ref={progressBarRef}
        aria-hidden="true"
        className="fixed top-0 left-0 h-[2.5px] w-full bg-violet-600 z-50 origin-left scale-x-0 pointer-events-none"
      />
    </>
  )
}
