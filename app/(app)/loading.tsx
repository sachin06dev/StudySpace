export default function AppLoading() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-pulse py-2">
      {/* Header skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-7 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        <div className="h-4 w-72 bg-gray-100 dark:bg-gray-850 rounded-md" />
      </div>

      {/* Metric cards grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-white dark:bg-[#111726] border border-gray-100 dark:border-gray-800/80 p-5 shadow-xs"
          >
            <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded mb-3" />
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>

      {/* Main content grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-72 rounded-2xl bg-white dark:bg-[#111726] border border-gray-100 dark:border-gray-800/80 p-6 shadow-xs" />
        <div className="lg:col-span-1 h-72 rounded-2xl bg-white dark:bg-[#111726] border border-gray-100 dark:border-gray-800/80 p-6 shadow-xs" />
      </div>
    </div>
  )
}
