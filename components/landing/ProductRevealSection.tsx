'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Sun,
  Moon,
  Sparkles,
  ShieldCheck,
  CheckSquare2,
  Lock,
  ArrowUpRight,
} from 'lucide-react'
import { isReducedMotion } from '@/lib/animations/landing'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function ProductRevealSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const windowRef = useRef<HTMLDivElement>(null)
  const [activeTheme, setActiveTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    if (!containerRef.current || !windowRef.current || isReducedMotion()) return

    const win = windowRef.current
    const mm = gsap.matchMedia()

    // Desktop: 3D perspective tilt reveal
    mm.add('(min-width: 1024px)', () => {
      gsap.fromTo(
        win,
        {
          scale: 0.92,
          rotationX: 14,
          y: 70,
          opacity: 0.85,
          transformPerspective: 1200,
          transformOrigin: 'top center',
        },
        {
          scale: 1,
          rotationX: 0,
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%',
            end: 'top 30%',
            scrub: 0.8,
          },
        }
      )
    })

    // Mobile: scale and opacity only (avoids rotationX compositor stall)
    mm.add('(max-width: 1023px)', () => {
      gsap.fromTo(
        win,
        {
          scale: 0.95,
          y: 30,
          opacity: 0.85,
        },
        {
          scale: 1,
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%',
            end: 'top 40%',
            scrub: 0.8,
          },
        }
      )
    })

    return () => {
      mm.revert()
    }
  }, [])

  return (
    <section
      id="product"
      ref={containerRef}
      className="py-16 md:py-24 relative overflow-hidden bg-slate-50/50 dark:bg-zinc-950/40 border-b border-slate-200/80 dark:border-zinc-800/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/70 border border-violet-200/80 dark:border-violet-800/70 text-xs font-semibold text-violet-700 dark:text-violet-300">
            <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span>StudySpace Workspace</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
            Everything you need for your week.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 leading-relaxed">
            Classes, attendance, lectures, tasks, notes, documents, and focus — all together in one clean view.
          </p>
        </div>

        {/* 3D Browser Composition Frame */}
        <div className="relative max-w-5xl mx-auto">
          {/* Subtle Ambient Backlight Glow */}
          <div
            className="absolute -inset-2 bg-gradient-to-r from-violet-600/25 via-purple-600/20 to-pink-600/20 rounded-3xl blur-2xl opacity-60 pointer-events-none -z-10"
            aria-hidden="true"
          />

          <div
            ref={windowRef}
            className="rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden will-change-transform"
          >
            {/* Window Browser Chrome Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-100/90 dark:bg-zinc-950/90 border-b border-slate-200 dark:border-zinc-800 select-none">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400/80 dark:bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400/80 dark:bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400/80 dark:bg-emerald-500/80 inline-block" />
              </div>

              {/* Centered URL Pill */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700/60 font-mono text-[11px] text-slate-600 dark:text-zinc-300">
                <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                <span>studyspace.app/dashboard</span>
              </div>

              {/* Light/Dark Preview Mode Switcher */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTheme(activeTheme === 'dark' ? 'light' : 'dark')}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Toggle Light/Dark Preview"
                >
                  {activeTheme === 'dark' ? (
                    <>
                      <Moon className="w-3.5 h-3.5 text-violet-400" />
                      <span className="hidden sm:inline text-[11px]">Dark Mode</span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span className="hidden sm:inline text-[11px]">Light Mode</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Real Screenshot Viewport */}
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9.5] max-h-[580px] bg-slate-900 overflow-hidden">
              <Image
                key={activeTheme}
                src={activeTheme === 'dark' ? '/screenshots/dark/dashboard.png' : '/screenshots/light/dashboard.png'}
                alt="StudySpace Live Academic Dashboard Interface"
                fill
                priority
                unoptimized
                sizes="(max-width: 1200px) 100vw, 1024px"
                className="object-cover object-top transition-opacity duration-300"
              />

              {/* Subtle gradient vignette at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none" />
            </div>

            {/* Window Status Footer */}
            <div className="px-4 py-2.5 bg-slate-50/90 dark:bg-zinc-950/90 border-t border-slate-200 dark:border-zinc-800 text-[11.5px] text-slate-500 dark:text-zinc-400 flex items-center justify-between">
              <div className="flex items-center gap-2 font-medium">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Web + Android App</span>
                <span className="hidden sm:inline text-slate-300 dark:text-zinc-700">|</span>
                <span className="hidden sm:inline font-mono text-[10px] text-violet-600 dark:text-violet-400">
                  INSTANT SYNC
                </span>
              </div>
              <a
                href="/signup"
                className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400 font-semibold hover:underline"
              >
                <span>Launch Workspace</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Floating Live Badges overlapping the browser */}
          <div className="hidden md:flex absolute -bottom-5 left-8 z-20 items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-slate-200/90 dark:border-zinc-700 shadow-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <div className="text-left text-xs">
              <span className="font-bold text-slate-900 dark:text-zinc-100 block">Attendance Safeguard</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Bunk buffer: 4 classes safe</span>
            </div>
          </div>

          <div className="hidden md:flex absolute -top-5 right-8 z-20 items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-slate-200/90 dark:border-zinc-700 shadow-xl">
            <CheckSquare2 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 font-mono">
              ✓ Synced across your laptop &amp; phone
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
