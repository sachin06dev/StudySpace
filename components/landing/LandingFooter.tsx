import React from 'react'
import Link from 'next/link'
import StudySpaceLogo from '@/components/shared/StudySpaceLogo'

export default function LandingFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-12 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-slate-100 dark:border-zinc-800">
          {/* Brand Column (5 cols) */}
          <div className="md:col-span-5 space-y-3">
            <Link
              href="#top"
              className="inline-flex items-center group"
              aria-label="StudySpace 4U Home"
            >
              <StudySpaceLogo size="md" showText iconClassName="group-hover:scale-105 transition-transform" />
            </Link>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm leading-relaxed">
              StudySpace 4U (studyspace4u) — Your unified academic workspace across Web and Android. Keep your timetable, attendance margins, lecture notes, and study consistency together.
            </p>
            {/* System Status Pill */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Navigation Links (7 cols) */}
          <div className="md:col-span-7 grid grid-cols-3 gap-6 text-xs">
            {/* Column 1: Product */}
            <div className="space-y-3">
              <span className="font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider text-[11px]">
                Product
              </span>
              <ul className="space-y-2 text-slate-600 dark:text-zinc-400">
                <li>
                  <Link href="/#features" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/#product" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                    Product Showcase
                  </Link>
                </li>
                <li>
                  <Link href="/#reviews" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                    Student Reviews
                  </Link>
                </li>
                <li>
                  <Link href="/#faq" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/#contact" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Platforms */}
            <div className="space-y-3">
              <span className="font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider text-[11px]">
                Platforms
              </span>
              <ul className="space-y-2 text-slate-600 dark:text-zinc-400">
                <li>
                  <Link href="/#android" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                    Study Companion App
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                    Web Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                    Get Started Free
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Legal & Team */}
            <div className="space-y-3">
              <span className="font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider text-[11px]">
                Project
              </span>
              <ul className="space-y-2 text-slate-600 dark:text-zinc-400">
                <li>
                  <Link href="/about" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                    About StudySpace 4U
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/delete-account" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                    Data Deletion
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar & Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-zinc-500 gap-3">
          <p>© {currentYear} StudySpace 4U (studyspace4u). Academic workspace &amp; study companion.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-slate-600 dark:hover:text-zinc-300 transition-colors">
              Privacy
            </Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-slate-600 dark:hover:text-zinc-300 transition-colors">
              Terms
            </Link>
            <span>·</span>
            <a
              href="https://github.com/sachin06dev/studyspace_nextjs/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
            >
              MIT License
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
