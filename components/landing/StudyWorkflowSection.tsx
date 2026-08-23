import React from 'react'

interface WorkflowStage {
  stage: string
  title: string
  action: string
  detail: string
  tag: string
}

const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    stage: '01',
    title: 'Choose a playlist & lesson',
    action: 'Select your course playlist from your study library',
    detail: 'Pick up immediately where you left off with saved progress and lesson order.',
    tag: 'Playlists',
  },
  {
    stage: '02',
    title: 'Start Pomodoro focus session',
    action: 'Set your focus interval (25m standard or custom)',
    detail: 'Block distractions with an integrated timer visible across all views.',
    tag: 'Pomodoro',
  },
  {
    stage: '03',
    title: 'Watch & capture timestamped notes',
    action: 'Type notes with one-click timestamp synchronization',
    detail: 'Pin formulas, theorems, and questions to the exact second in the lecture video.',
    tag: 'Smart Notes',
  },
  {
    stage: '04',
    title: 'Mark complete & update tasks',
    action: 'Tick off lesson status and associated checklist items',
    detail: 'Automatically updates course completion percentage and pending task tallies.',
    tag: 'Tasks',
  },
  {
    stage: '05',
    title: 'Review progress & analytics',
    action: 'Inspect study duration, streaks, and consistency heatmap',
    detail: 'Stay motivated with daily focus statistics and milestone achievements.',
    tag: 'Analytics',
  },
]

export default function StudyWorkflowSection() {
  return (
    <section id="workflow" className="py-20 md:py-28 scroll-mt-16 bg-gray-50/50 dark:bg-gray-950/40 border-y border-gray-200/60 dark:border-gray-800/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-block text-xs font-bold tracking-wider uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/60">
            Real Study Session
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            A seamless study workflow from start to finish
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
            Experience how StudySpace keeps your entire study session in one uninterrupted flow.
          </p>
        </div>

        {/* Workflow Timeline / Steps */}
        <div className="max-w-4xl mx-auto space-y-4">
          {WORKFLOW_STAGES.map((item, idx) => (
            <div
              key={idx}
              className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#0c111e] hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-start sm:items-center gap-4">
                {/* Stage number bubble */}
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-mono font-bold text-sm flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/50">
                  {item.stage}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                      {item.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {item.detail}
                  </p>
                </div>
              </div>

              {/* Action pill on right */}
              <div className="self-end sm:self-center shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40 px-3 py-1.5 rounded-lg border border-indigo-100/60 dark:border-indigo-900/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  {item.action}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
