import React from 'react'

export default function ValuePillarsSection() {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-(--canvas) border-b border-gray-200/80 dark:border-(--border-subtle) transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/60 border border-violet-200/60 dark:border-violet-800/60 text-xs font-semibold text-violet-700 dark:text-violet-300">
            <span>One Unified Space</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            One place for your whole study routine.
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            Everything connects together. Your schedule informs your attendance, your lectures connect to your notes, and your focus time builds your progress.
          </p>
        </div>

        {/* 3 Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {/* Pillar 1: Classes & Attendance */}
          <div className="flex flex-col justify-between rounded-3xl border border-gray-200/80 dark:border-(--border-subtle) bg-gray-50/50 dark:bg-(--surface) p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-violet-300 dark:hover:border-violet-800/80 transition-all group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-base border border-violet-100 dark:border-violet-900/50">
                01
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Stay on top of classes
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Know where you need to be and mark attendance in one tap. See your margin before attendance falls below university requirements.
              </p>
            </div>

            {/* Visual Crop */}
            <div className="mt-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-3.5 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">Data Structures · Rm 402</span>
                <span className="px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-bold text-[9px]">
                  11:30 AM
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px] text-center font-semibold">
                <div className="py-1 rounded-lg bg-emerald-600 text-white shadow-2xs">✓ Present</div>
                <div className="py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">✕ Absent</div>
                <div className="py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400">Cancel</div>
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 flex justify-between pt-0.5">
                <span>Current: <strong className="text-emerald-600 dark:text-emerald-400">82%</strong></span>
                <span className="text-violet-600 dark:text-violet-400 font-medium">Safe Margin</span>
              </div>
            </div>
          </div>

          {/* Pillar 2: Distraction-Free Study */}
          <div className="flex flex-col justify-between rounded-3xl border border-gray-200/80 dark:border-(--border-subtle) bg-gray-50/50 dark:bg-(--surface) p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-violet-300 dark:hover:border-violet-800/80 transition-all group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-base border border-violet-100 dark:border-violet-900/50">
                02
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Study without the clutter
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Watch lecture courses with zero comment feeds or clickbait sidebars. Click any timestamp to jump directly back to that concept.
              </p>
            </div>

            {/* Visual Crop */}
            <div className="mt-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-3.5 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">CS50 · Algorithms</span>
                <span className="px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-[9px]">
                  Focused
                </span>
              </div>
              <div className="p-2 rounded-xl bg-violet-50/70 dark:bg-violet-950/40 border border-violet-200/60 dark:border-violet-900/40 text-[10px] space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-violet-700 dark:text-violet-300">
                  <span className="px-1 py-0.2 rounded bg-violet-200/70 dark:bg-violet-900/70 font-mono text-[9px]">04:12</span>
                  <span className="truncate">Binary search tree balance</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-[9px] line-clamp-1">
                  Rotation logic preserves in-order traversal property.
                </p>
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 flex justify-between pt-0.5">
                <span>Timer: <strong className="text-violet-600 dark:text-violet-400">25:00</strong> Focus</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Session #3</span>
              </div>
            </div>
          </div>

          {/* Pillar 3: Progress & Consistency */}
          <div className="flex flex-col justify-between rounded-3xl border border-gray-200/80 dark:border-(--border-subtle) bg-gray-50/50 dark:bg-(--surface) p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-violet-300 dark:hover:border-violet-800/80 transition-all group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-base border border-violet-100 dark:border-violet-900/50">
                03
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Keep your progress visible
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Consistency is the foundation of college success. Build daily study streaks, check off weekly assignments, and inspect your consistency heatmap.
              </p>
            </div>

            {/* Visual Crop */}
            <div className="mt-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-3.5 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-gray-900 dark:text-gray-100">Weekly Consistency</span>
                <span className="px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 font-bold text-[9px]">
                  🔥 7-Day Streak
                </span>
              </div>
              {/* Mini Heatmap Strip */}
              <div className="grid grid-cols-7 gap-1 pt-1">
                {[
                  { d: 'M', lvl: 3 },
                  { d: 'T', lvl: 4 },
                  { d: 'W', lvl: 2 },
                  { d: 'T', lvl: 4 },
                  { d: 'F', lvl: 3 },
                  { d: 'S', lvl: 1 },
                  { d: 'S', lvl: 4 },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-full aspect-square rounded-md ${item.lvl === 4
                          ? 'bg-violet-600 dark:bg-violet-500'
                          : item.lvl === 3
                            ? 'bg-violet-400 dark:bg-violet-600/70'
                            : item.lvl === 2
                              ? 'bg-violet-300 dark:bg-violet-700/50'
                              : 'bg-violet-100 dark:bg-violet-900/40'
                        }`}
                    />
                    <span className="text-[8px] text-gray-400">{item.d}</span>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 flex justify-between pt-0.5">
                <span>Tasks: <strong className="text-emerald-600 dark:text-emerald-400">4 / 4 Complete</strong></span>
                <span className="text-gray-400 font-medium">18.5h Total</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
