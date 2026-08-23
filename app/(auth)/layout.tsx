import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StudySpaceLogo from '@/components/shared/StudySpaceLogo'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 transition-colors">
      {/* Official StudySpace Brand Logo Header above Card */}
      <div className="mb-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center group focus-visible:outline-none"
          aria-label="StudySpace Home"
        >
          <StudySpaceLogo
            size="lg"
            showText
            showSubtitle
            subtitle="Student Productivity Workspace"
            iconClassName="group-hover:scale-105 transition-transform"
          />
        </Link>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-gray-900 p-8 shadow-sm transition-colors">
        {children}
      </div>

      {/* Auth footer links */}
      <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <Link href="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          Privacy Policy
        </Link>
        <span>•</span>
        <Link href="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          Terms of Service
        </Link>
      </div>
    </div>
  )
}
