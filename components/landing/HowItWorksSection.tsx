import React from 'react'

interface Step {
  number: string
  title: string
  description: string
  detail: string
  icon: React.ReactNode
}

const STEPS: Step[] = [
  {
    number: '01',
    title: 'Add your learning content',
    description:
      'Import full YouTube course playlists, single lecture videos, or save important reference links and documents directly into your workspace.',
    detail: 'Instant import with auto-fetched metadata & video lengths',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Study, take notes & manage tasks',
    description:
      'Start a Pomodoro focus timer, watch lectures without distractions, write timestamped notes in real time, and check off your study tasks.',
    detail: 'Keep your notes pinned to exact video moments',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Track your progress',
    description:
      'Review daily focus duration, completed Pomodoro intervals, course playlist completion rates, and daily consistency streaks on your analytics dashboard.',
    detail: 'Visual consistency heatmap & study milestones',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
]

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-block text-xs font-bold tracking-wider uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/60">
            How it Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Simple 3-step study flow
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
            StudySpace unites your entire study cycle from gathering materials to tracking mastery.
          </p>
        </div>

        {/* 3 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map((step, idx) => (
            <div
              key={idx}
              className="relative flex flex-col justify-between rounded-2xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#0c111e] p-7 shadow-xs hover:shadow-md transition-all duration-200"
            >
              <div>
                {/* Step Top Bar: Number Badge + Icon */}
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-2xl font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                    {step.number}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 flex items-center justify-center">
                    {step.icon}
                  </div>
                </div>

                {/* Step Title */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 tracking-tight">
                  {step.title}
                </h3>

                {/* Step Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  {step.description}
                </p>
              </div>

              {/* Step Detail Footer */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800/70 text-xs font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <span>→</span>
                <span>{step.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
