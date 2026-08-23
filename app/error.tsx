'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled Application Error:', error)
  }, [error])

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <div className="max-w-md w-full text-center bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-100 dark:border-red-800 flex items-center justify-center text-red-600 dark:text-red-400 mx-auto mb-4 font-bold text-xl">
          !
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2 text-gray-900 dark:text-gray-100">
          Something went wrong
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          An unexpected error occurred while loading this page. Please try again or return to the dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer"
          >
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
