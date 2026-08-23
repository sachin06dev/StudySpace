import type { Metadata } from 'next'
import Link from 'next/link'
import StudySpaceLogo from '@/components/shared/StudySpaceLogo'
import ThemeToggle from '@/components/shared/ThemeToggle'
import LandingFooter from '@/components/landing/LandingFooter'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'StudySpace Terms of Service: Guidelines, acceptable use, and terms for using the StudySpace learning workspace.',
}

export default function TermsOfServicePage() {
  const lastUpdated = 'August 23, 2026'

  return (
    <div className="min-h-screen bg-(--color-background) text-(--color-foreground) selection:bg-indigo-500 selection:text-white transition-colors">
      {/* Header Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-200/80 dark:border-gray-800/80 bg-white/85 dark:bg-[#090d16]/85 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center group focus-visible:outline-none"
            aria-label="StudySpace Home"
          >
            <StudySpaceLogo size="md" showText showSubtitle iconClassName="group-hover:scale-105 transition-transform" />
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/"
              className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/login"
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 text-xs font-semibold shadow-xs hover:shadow-indigo-500/25 transition-all cursor-pointer"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 mb-4">
            <span>Official Legal Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Last updated: <time dateTime="2026-08-23">{lastUpdated}</time>
          </p>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8 text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300">
          {/* Section 1 */}
          <section className="p-6 sm:p-8 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#111726] shadow-xs">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-xs font-bold text-indigo-600 dark:text-indigo-400">1</span>
              Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or using the <strong>StudySpace</strong> web application (the &quot;Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          {/* Section 2 */}
          <section className="p-6 sm:p-8 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#111726] shadow-xs">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-xs font-bold text-indigo-600 dark:text-indigo-400">2</span>
              User Accounts & Security
            </h2>
            <p>
              To access personalized workspace features, you must register for an account using Google authentication or a valid email address. You agree to:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>Provide accurate, current, and complete information during signup.</li>
              <li>Maintain the confidentiality of your login credentials.</li>
              <li>Promptly notify us if you suspect unauthorized access or any security breach of your account.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="p-6 sm:p-8 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#111726] shadow-xs">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-xs font-bold text-indigo-600 dark:text-indigo-400">3</span>
              Acceptable Use Policy
            </h2>
            <p>
              StudySpace is designed to support learning and productivity. You agree not to use the Service to:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>Upload malicious code, viruses, or harmful software.</li>
              <li>Upload unlawful, infringing, abusive, or harmful materials to document storage.</li>
              <li>Attempt to gain unauthorized access to other users&apos; accounts or workspace data.</li>
              <li>Interfere with or disrupt the integrity and performance of the Service.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="p-6 sm:p-8 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#111726] shadow-xs">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-xs font-bold text-indigo-600 dark:text-indigo-400">4</span>
              YouTube API Services
            </h2>
            <p>
              StudySpace utilizes the YouTube Data API v3 to enable video search, playlist organization, and lecture playback with timestamped note-taking. By using YouTube-powered features in StudySpace, you also agree to be bound by the{' '}
              <a
                href="https://www.youtube.com/t/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 font-medium underline"
              >
                YouTube Terms of Service
              </a>{' '}
              and Google Privacy Policy.
            </p>
          </section>

          {/* Section 5 */}
          <section className="p-6 sm:p-8 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#111726] shadow-xs">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-xs font-bold text-indigo-600 dark:text-indigo-400">5</span>
              User Content & Ownership
            </h2>
            <p>
              You retain all ownership rights to the notes, task lists, and documents you create or upload in StudySpace. StudySpace does not claim any intellectual property rights over your personal study materials.
            </p>
          </section>

          {/* Section 6 */}
          <section className="p-6 sm:p-8 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#111726] shadow-xs">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-xs font-bold text-indigo-600 dark:text-indigo-400">6</span>
              Disclaimer & Limitation of Liability
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              StudySpace is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind. While we strive for 100% uptime and data reliability, we cannot guarantee uninterrupted or error-free service. To the maximum extent permitted by law, StudySpace shall not be liable for any indirect or incidental damages resulting from your use of the service.
            </p>
          </section>

          {/* Section 7 */}
          <section className="p-6 sm:p-8 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#111726] shadow-xs">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-xs font-bold text-indigo-600 dark:text-indigo-400">7</span>
              Contact
            </h2>
            <p>
              For legal inquiries or questions concerning these Terms, contact:
            </p>
            <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 text-sm">
              <p><strong>StudySpace Team</strong></p>
              <p className="mt-1">
                <a
                  href="mailto:studyspace2u@gmail.com"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  studyspace2u@gmail.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
