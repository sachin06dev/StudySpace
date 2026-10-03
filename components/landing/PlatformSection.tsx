import React from 'react'
import { Laptop, Smartphone, CheckCircle2 } from 'lucide-react'

export default function PlatformSection() {
  return (
    <section className="py-16 md:py-24 border-b border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-950/30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/60 border border-violet-200/70 dark:border-violet-800/70 text-xs font-semibold text-violet-700 dark:text-violet-300">
            <span>Web &amp; Android Ecosystem</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
            Your study space, wherever you are.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 leading-relaxed">
            Plan and study on your laptop when you have time to focus. Check classes, log attendance, and review notes on your phone when you are on the move.
          </p>
        </div>

        {/* Dual Platform Showcase Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Web Platform Card */}
          <div className="relative flex flex-col justify-between rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-xs hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-100 dark:border-violet-900/50">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                      Laptops &amp; Desktops
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100">
                      StudySpace on Web
                    </h3>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                  Full Workstation
                </span>
              </div>

              <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
                Plan, study, and organize on a larger screen. Side-by-side lecture video player with live timestamped note-taking, full timetable management, document vault, and focused Pomodoro blocks.
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                {[
                  'Side-by-side video & notes',
                  'Timetable configuration',
                  'Document vault viewer',
                  'Detailed consistency heatmap',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" />
                    <span className="truncate">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Realistic Web Window Frame */}
            <div className="mt-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/80 p-3 shadow-inner">
              <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200 dark:border-zinc-800 text-[10px] text-slate-400">
                <div className="flex gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                </div>
                <span className="font-mono text-[9px] text-slate-400 mx-auto">studyspace.app/dashboard</span>
              </div>
              <div className="pt-2.5 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                  <span>Semester 4 Schedule</span>
                  <span className="text-violet-600 dark:text-violet-400 font-mono text-[10px]">84% Target Met</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="w-[84%] h-full bg-violet-600 rounded-full" />
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-[10px]">
                  <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/60">
                    <span className="text-slate-400 block text-[9px]">Classes Today</span>
                    <strong className="text-slate-900 dark:text-zinc-100">4 Scheduled</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/60">
                    <span className="text-slate-400 block text-[9px]">Pomodoro Goal</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">4 / 6 Done</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/60">
                    <span className="text-slate-400 block text-[9px]">Vault Docs</span>
                    <strong className="text-violet-600 dark:text-violet-400">12 Stored</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Android Companion Card */}
          <div className="relative flex flex-col justify-between rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-xs hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-100 dark:border-violet-900/50">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                      On-the-Go Companion
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100">
                      StudySpace on Android
                    </h3>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/60">
                  Mobile Companion
                </span>
              </div>

              <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
                Check attendance, timetable, notes, and study progress on the go. 1-tap attendance marking right outside your classroom door, offline timetable access, and fast schedule checks.
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                {[
                  '1-tap attendance marking',
                  'Offline-ready timetable',
                  'Mobile lecture watching',
                  'Instant schedule lookups',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" />
                    <span className="truncate">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Companion Snapshot */}
            <div className="mt-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/80 p-3 shadow-inner">
              <div className="flex items-center justify-between text-[10px] pb-2 border-b border-slate-200 dark:border-zinc-800 text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-zinc-300">Android Quick Actions</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[9px]">● Connected</span>
              </div>
              <div className="pt-2.5 space-y-2">
                <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-900 dark:text-zinc-100 block">Next: Algorithms Lab</span>
                    <span className="text-[9px] text-slate-400">Lab 3 · 02:00 PM</span>
                  </div>
                  <div className="flex gap-1">
                    <span className="px-2 py-1 rounded-lg bg-emerald-600 text-white text-[9px] font-bold">✓ Present</span>
                    <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-[9px]">✕</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
