export default function AnalyticsLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
      {/* Page Header Skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-36 bg-gray-200 rounded-lg" />
        <div className="h-4 w-72 bg-gray-100 rounded-md" />
      </div>

      {/* 4 Metric Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="h-3.5 w-24 bg-gray-200 rounded" />
                <div className="h-8 w-20 bg-gray-300 rounded-lg" />
              </div>
              <div className="w-11 h-11 rounded-xl bg-gray-100 border border-gray-200/60" />
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <div className="h-3 w-28 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Task Completion Card Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="space-y-2">
            <div className="h-5 w-36 bg-gray-200 rounded-md" />
            <div className="h-3.5 w-56 bg-gray-100 rounded" />
          </div>
          <div className="h-7 w-24 bg-gray-100 rounded-lg" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-3 w-24 bg-gray-100 rounded" />
            <div className="h-3 w-20 bg-gray-100 rounded" />
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full" />
        </div>

        <div className="grid grid-cols-3 gap-2.5 pt-2">
          <div className="h-16 bg-gray-50 rounded-xl border border-gray-100" />
          <div className="h-16 bg-gray-50 rounded-xl border border-gray-100" />
          <div className="h-16 bg-gray-50 rounded-xl border border-gray-100" />
        </div>
      </div>
    </div>
  )
}
