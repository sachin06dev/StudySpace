'use client'

import React, { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

const FAQS: FAQItem[] = [
  {
    question: 'Is StudySpace free for college students?',
    answer:
      'Yes. StudySpace is free for university students. You can set up your semester timetable, track attendance with safety buffers, organize lecture courses, take unlimited timestamped notes, and run Pomodoro focus sessions with zero subscription fees.',
  },
  {
    question: 'Does StudySpace remove YouTube ads?',
    answer:
      "No. Lectures play through YouTube's official embedded player, so any ads YouTube serves still appear. StudySpace adds notes, progress tracking, playlists and focus tools around the video.",
  },
  {
    question: 'How does the attendance safety margin calculation work?',
    answer:
      'StudySpace benchmarks your attendance against your university requirement (typically 75% or 85%). If your attendance is currently healthy, the app tells you exactly how many lectures you can safely afford to miss before dropping below your goal. If you are in the danger zone, it calculates the exact number of consecutive classes you must attend to recover.',
  },
  {
    question: 'Can I use StudySpace across both laptop and Android phone?',
    answer:
      'Yes. StudySpace is designed as a unified ecosystem. Use the full desktop web workspace for deep focus: side-by-side video lecture notes, timetable scanning, and document organization. Use the Android app for quick on-the-go actions: 1-tap attendance marking outside lecture halls and offline room lookups.',
  },
  {
    question: 'How do timestamped lecture notes work?',
    answer:
      'When studying a video course, clicking the note button captures your current playback timestamp (for example 04:12). You can type formulas, code snippets, or concept summaries. Weeks later during exam revision, clicking that timestamp jumps the player directly to that second so you never waste time searching for explanations.',
  },
  {
    question: 'Does the Android companion app work without an internet connection?',
    answer:
      'Yes. The Android companion app features offline-first SQLite storage. You can check your weekly timetable, find your lecture classroom, and log attendance even in campus basements without mobile network or Wi-Fi. All changes synchronize automatically as soon as your device reconnects.',
  },
  {
    question: 'What files can I store in the Academic Vault?',
    answer:
      'The Academic Vault supports course syllabus documents, lecture slide PDFs, and previous years question papers up to 50MB per file. Files are indexed by course subject so you can preview them directly in your browser without cluttering your personal downloads folder.',
  },
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx))
  }

  return (
    <section id="faq" className="py-20 md:py-28 scroll-mt-16 bg-slate-50/50 dark:bg-zinc-950/40 border-b border-slate-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/60 border border-violet-200/70 dark:border-violet-800/70 text-xs font-semibold text-violet-700 dark:text-violet-300">
            <HelpCircle className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
            Got questions? We have answers.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 leading-relaxed">
            Everything you need to know about StudySpace, attendance safety, and cross-platform synchronization.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3.5">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden transition-all shadow-2xs hover:border-violet-300 dark:hover:border-violet-800/80"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer select-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-zinc-100">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 transition-transform duration-[var(--duration-fast)] [transition-timing-function:var(--ease-smooth-out)] ${isOpen ? 'rotate-180 bg-violet-600 text-white dark:bg-violet-600 dark:text-white' : ''
                      }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed border-t border-slate-100 dark:border-zinc-800/60 pt-4 animate-in fade-in-50 duration-[var(--duration-fast)] [animation-timing-function:var(--ease-smooth-out)]">
                    {faq.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
