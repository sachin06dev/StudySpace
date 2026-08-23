import Link from 'next/link'

export interface TaskCompletionCardProps {
  total: number
  completed: number
  pending: number
  completionPercentage: number
}

export default function TaskCompletionCard({
  total,
  completed,
  pending,
  completionPercentage,
}: TaskCompletionCardProps) {
  const hasTasks = total > 0

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Task Completion</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Progress overview of all planned study tasks
          </p>
        </div>

        {hasTasks && (
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-xl sm:text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {completionPercentage}%
            </span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">completed</span>
          </div>
        )}
      </div>

      {hasTasks ? (
        <div className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
              <span>Overall Progress</span>
              <span>
                {completed} of {total} {total === 1 ? 'task' : 'tasks'}
              </span>
            </div>

            <div
              className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-0.5 border border-gray-200/60 dark:border-gray-700"
              role="progressbar"
              aria-valuenow={completionPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Task completion: ${completionPercentage}%`}
            >
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, completionPercentage))}%` }}
              />
            </div>
          </div>

          {/* Stats Breakdown Badges */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <div className="bg-gray-50 dark:bg-gray-800/80 rounded-xl p-3 border border-gray-100 dark:border-gray-700 text-center">
              <span className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total
              </span>
              <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">{total}</span>
            </div>

            <div className="bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl p-3 border border-emerald-100 dark:border-emerald-800 text-center">
              <span className="block text-[11px] font-medium text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                Completed
              </span>
              <span className="text-base sm:text-lg font-bold text-emerald-800 dark:text-emerald-200">{completed}</span>
            </div>

            <div className="bg-amber-50/70 dark:bg-amber-950/40 rounded-xl p-3 border border-amber-100 dark:border-amber-800 text-center">
              <span className="block text-[11px] font-medium text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                Pending
              </span>
              <span className="text-base sm:text-lg font-bold text-amber-800 dark:text-amber-200">{pending}</span>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="py-8 px-4 text-center bg-gray-50/60 dark:bg-gray-800/40 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
          <div className="mx-auto w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 mb-3">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No tasks yet</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            Create tasks to start tracking your completion progress and stay organized.
          </p>
          <div className="mt-4">
            <Link
              href="/tasks"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 px-3 py-1.5 rounded-lg transition-colors"
            >
              <span>Go to Tasks</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
