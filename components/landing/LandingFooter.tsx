import Link from 'next/link'
import StudySpaceLogo from '@/components/shared/StudySpaceLogo'

export default function LandingFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#090d16] py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand and Description */}
          <div className="space-y-2 text-center md:text-left">
            <Link
              href="#top"
              className="inline-flex items-center group"
              aria-label="StudySpace Home"
            >
              <StudySpaceLogo size="sm" showText iconClassName="group-hover:scale-105 transition-transform" />
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
              A unified student workspace for learning videos, timestamped notes, playlists, tasks, and progress analytics.
            </p>
          </div>

          {/* Quick Links */}
          <nav
            aria-label="Footer Navigation"
            className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-gray-600 dark:text-gray-400"
          >
            <Link
              href="#features"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              How it Works
            </Link>
            <Link
              href="#workflow"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Workflow
            </Link>
            <Link
              href="#about"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              About
            </Link>
            <Link
              href="/privacy"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/login"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Get Started
            </Link>
          </nav>
        </div>

        {/* Bottom divider & Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 dark:text-gray-500 gap-4">
          <p>© {currentYear} StudySpace. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
