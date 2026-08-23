import Link from 'next/link'
import StudySpaceLogo from '@/components/shared/StudySpaceLogo'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <div className="max-w-md w-full text-center bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <Link href="/" className="inline-block mb-4 group">
          <StudySpaceLogo size="xl" iconClassName="group-hover:scale-105 transition-transform" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight mb-2 text-gray-900 dark:text-gray-100">
          Page not found (404)
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          The page or study resource you are looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  )
}
