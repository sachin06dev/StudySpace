'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, Smartphone, Sparkles, CheckCircle2, ShieldCheck, Clock } from 'lucide-react'
import type { MobileReleaseManifest } from '@/lib/config/release'
import { FALLBACK_RELEASE_MANIFEST } from '@/lib/config/release'
import { setupMagnetic, isReducedMotion } from '@/lib/animations/landing'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function FinalCTA({
  release,
}: {
  release?: MobileReleaseManifest
}) {
  const activeRelease = release || FALLBACK_RELEASE_MANIFEST
  const downloadUrl = '/api/download/android'
  const cardRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const cleanupMagnetic = buttonRef.current ? setupMagnetic(buttonRef.current, 0.25, 0.35) : () => {}

    if (cardRef.current && !isReducedMotion()) {
      gsap.fromTo(
        cardRef.current,
        { scale: 0.96, opacity: 0.9, y: 20 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top 85%',
            end: 'top 50%',
            scrub: true,
          },
        }
      )
    }

    return () => {
      cleanupMagnetic()
    }
  }, [])

  return (
    <section className="py-16 md:py-24 relative overflow-hidden bg-slate-50/50 dark:bg-zinc-950/40 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={cardRef}
          className="relative rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 sm:p-12 md:p-14 text-center shadow-md"
        >
          <div className="relative z-10 max-w-3xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-violet-700 dark:text-violet-300">
              <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              <span>Get Started</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
              Make this semester a little easier.
            </h2>

            <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto font-normal">
              Set up your subjects once and keep everything together in one private, focused study workspace.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <Link
                ref={buttonRef}
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm shadow-xs active:scale-95 transition-all group"
              >
                <span>Start free</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-750 text-slate-800 dark:text-zinc-200 font-semibold text-sm transition-colors"
              >
                <span>Log in</span>
              </Link>

              <a
                href={downloadUrl}
                download={`StudySpace-v${activeRelease.latestVersion}.apk`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 font-medium text-xs transition-colors"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android APK (v{activeRelease.latestVersion})</span>
              </a>
            </div>

            {/* Verified micro guarantees */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-zinc-400 font-medium pt-3 border-t border-slate-100 dark:border-zinc-800">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Free for university students
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Zero account data sold
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                Offline companion app
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
