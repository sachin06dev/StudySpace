'use client'

import React, { useState, useEffect } from 'react'
import { ChevronDown, FileText, ShieldCheck, CheckCircle2 } from 'lucide-react'
import LandingMotionEffects from '@/components/landing/LandingMotionEffects'
import LandingNavbar from '@/components/landing/LandingNavbar'
import LandingFooter from '@/components/landing/LandingFooter'

export interface TocItem {
  id: string
  number: number
  title: string
}

export interface SummaryPoint {
  title: string
  desc: string
}

interface LegalPageShellProps {
  badge: string
  title: string
  lastUpdated: string
  toc: TocItem[]
  summaryPoints: SummaryPoint[]
  children: React.ReactNode
}

export default function LegalPageShell({
  badge,
  title,
  lastUpdated,
  toc,
  summaryPoints,
  children,
}: LegalPageShellProps) {
  const [activeId, setActiveId] = useState<string>(toc[0]?.id || '')
  const [mobileTocOpen, setMobileTocOpen] = useState(false)

  // Scroll-spy observer for desktop TOC
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-100px 0px -60% 0px', threshold: 0.1 }
    )

    toc.forEach((item) => {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [toc])

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const target = document.getElementById(id)
    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY - 90
      window.scrollTo({ top, behavior: 'smooth' })
      setActiveId(id)
      setMobileTocOpen(false)
    }
  }

  return (
    <div
      id="top"
      className="min-h-screen bg-(--color-background) text-(--color-foreground) selection:bg-violet-500 selection:text-white transition-colors"
    >
      <LandingMotionEffects />
      <LandingNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Page Header */}
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 mb-4">
            <FileText className="w-3.5 h-3.5" />
            <span>{badge}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            {title}
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-mono">
            Last updated: <time>{lastUpdated}</time>
          </p>
        </div>

        {/* Quick summary Box */}
        <div className="mb-12 p-6 sm:p-8 rounded-2xl bg-violet-500/[0.03] dark:bg-violet-500/[0.04] border border-violet-500/20 max-w-4xl">
          <div className="flex items-center gap-2.5 mb-3 text-violet-700 dark:text-violet-300 font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span>Quick summary (Informational Only)</span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
            This summary is provided for quick student comprehension and does not replace the binding legal text below.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {summaryPoints.map((pt, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-zinc-900 dark:text-zinc-100 font-semibold block">
                    {pt.title}
                  </strong>
                  <span className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {pt.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Collapsible TOC */}
        <div className="lg:hidden mb-8 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-[#121215] overflow-hidden">
          <button
            type="button"
            onClick={() => setMobileTocOpen(!mobileTocOpen)}
            className="w-full flex items-center justify-between p-4 text-xs font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer"
            aria-expanded={mobileTocOpen}
          >
            <span>Table of Contents ({toc.length} sections)</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                mobileTocOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
          {mobileTocOpen && (
            <div className="p-4 pt-0 border-t border-zinc-100 dark:border-zinc-800/80 space-y-1.5 text-xs">
              {toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => scrollToSection(e, item.id)}
                  className={`block py-1.5 px-2 rounded-lg transition-colors ${
                    activeId === item.id
                      ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <span className="font-mono text-zinc-400 mr-2">{item.number}.</span>
                  {item.title}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Two-Column Grid: Sticky TOC on Desktop + Legal Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Sticky TOC (Desktop) */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4 font-mono">
                Contents
              </h2>
              <nav className="space-y-1 text-xs" aria-label="Table of contents">
                {toc.map((item) => {
                  const isActive = activeId === item.id
                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={(e) => scrollToSection(e, item.id)}
                      className={`flex items-center gap-2.5 py-2 px-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 font-semibold border-l-2 border-violet-600'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                      }`}
                    >
                      <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
                        0{item.number}
                      </span>
                      <span className="truncate">{item.title}</span>
                    </a>
                  )
                })}
              </nav>

              <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-400 dark:text-zinc-500 space-y-1">
                <p>Have questions?</p>
                <a
                  href="mailto:studyspace2u@gmail.com"
                  className="text-violet-600 dark:text-violet-400 font-medium hover:underline block"
                >
                  studyspace2u@gmail.com
                </a>
              </div>
            </div>
          </aside>

          {/* Legal Content (Right Column) */}
          <div className="lg:col-span-8 max-w-3xl space-y-8">
            {children}
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
