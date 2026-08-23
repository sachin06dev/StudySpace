export default function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading analytics...">
      {/* 365-Day Heatmap Skeleton */}
      <div className="h-64 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-7 shadow-xs space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="h-6 w-48 bg-slate-100 dark:bg-slate-800 rounded-lg" />
          <div className="flex gap-3">
            <div className="h-12 w-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            <div className="h-12 w-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            <div className="h-12 w-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
        <div className="h-32 w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl" />
      </div>

      {/* Weekly Chart Skeleton */}
      <div className="h-56 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs" />

      {/* 3 Columns Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-44 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs" />
        <div className="h-44 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs" />
        <div className="h-44 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs" />
      </div>

      {/* 2 Columns Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-52 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs" />
        <div className="h-52 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs" />
      </div>
    </div>
  )
}
