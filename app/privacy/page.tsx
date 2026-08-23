import type { Metadata } from 'next'
import Link from 'next/link'
import StudySpaceLogo from '@/components/shared/StudySpaceLogo'
import ThemeToggle from '@/components/shared/ThemeToggle'
import LandingFooter from '@/components/landing/LandingFooter'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'StudySpace Privacy Policy: Learn how we protect student data, manage authentication, and handle your study resources.',
}

export default function PrivacyPolicyPage() {
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
            <span>Official Policy Document</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Privacy Policy
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
              Introduction & Scope
            </h2>
            <p>
              Welcome to <strong>StudySpace</strong>. We provide a full-stack student productivity and learning workspace designed to help you organize study lectures, create timestamped notes, manage tasks, run Pomodoro sessions, and track study analytics.
            </p>
            <p className="mt-3">
              We take student data privacy seriously. This Privacy Policy explains what information we collect when you use StudySpace, how that data is stored and secured, and your rights regarding your personal information.
            </p>
          </section>

          {/* Section 2 */}
          <section className="p-6 sm:p-8 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#111726] shadow-xs">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-xs font-bold text-indigo-600 dark:text-indigo-400">2</span>
              Information We Collect
            </h2>
            <p>We collect only the minimum data required to deliver our educational productivity services:</p>

            <div className="mt-4 space-y-3">
              <div className="border-l-2 border-indigo-500 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">A. Account & Authentication Data</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  When you sign in using Google OAuth or email signup, we receive basic identity information: your email address, full name, and avatar image URL. We request only standard OAuth scopes (<code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">openid</code>, <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">email</code>, <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">profile</code>) and do not access your Google Drive, Gmail, or sensitive data.
                </p>
              </div>

              <div className="border-l-2 border-indigo-500 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">B. Study Data & User Content</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  We store the notes you write, video timestamps, saved study playlists, tasks and due dates, Pomodoro focus session durations, bookmark resources, and documents you explicitly upload to your private workspace.
                </p>
              </div>

              <div className="border-l-2 border-indigo-500 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">C. YouTube Integration Data</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  When you search or import educational videos or playlists, we fetch public video metadata (title, channel name, duration, thumbnail) via the YouTube Data API v3. We do not modify or access your private YouTube account.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="p-6 sm:p-8 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#111726] shadow-xs">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-xs font-bold text-indigo-600 dark:text-indigo-400">3</span>
              How We Protect Your Data
            </h2>
            <p>
              Security and data isolation are core architectural foundations of StudySpace:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <strong>Row Level Security (RLS):</strong> Every piece of user content (tasks, notes, Pomodoro records, bookmarks, documents) is secured at the database engine level via PostgreSQL Row Level Security. Only you can query or modify your personal records.
              </li>
              <li>
                <strong>Private Storage Buckets:</strong> Uploaded study documents are stored in private Supabase Storage buckets with strict user ownership boundaries.
              </li>
              <li>
                <strong>Encrypted Communications:</strong> All network traffic between your browser and our servers is encrypted in transit using industry-standard HTTPS / TLS 1.3.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="p-6 sm:p-8 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#111726] shadow-xs">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-xs font-bold text-indigo-600 dark:text-indigo-400">4</span>
              Zero Data Selling & Third-Party Sharing
            </h2>
            <p>
              <strong>We do not sell, rent, or trade your personal data.</strong> Your notes, study habits, and account details will never be sold to advertisers or third-party data brokers.
            </p>
            <p className="mt-3">
              We utilize trusted infrastructure providers solely to host and execute the application:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <li><strong>Supabase:</strong> Database hosting, user authentication, and secure file storage.</li>
              <li><strong>Vercel:</strong> Application hosting, edge delivery, and web performance analytics.</li>
              <li><strong>Google OAuth:</strong> Secure authentication provider for single sign-on.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="p-6 sm:p-8 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#111726] shadow-xs">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-xs font-bold text-indigo-600 dark:text-indigo-400">5</span>
              Your Rights & Account Deletion
            </h2>
            <p>
              You have complete control over your data in StudySpace. You may:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>View, edit, or delete any task, note, video, playlist, or document at any time directly in the app.</li>
              <li>Export your notes and study records.</li>
              <li>Request full account deletion and purge of all associated workspace data by contacting our support team.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="p-6 sm:p-8 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#111726] shadow-xs">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-xs font-bold text-indigo-600 dark:text-indigo-400">6</span>
              Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy or how your data is handled in StudySpace, please reach out to us:
            </p>
            <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 text-sm">
              <p><strong>StudySpace Team</strong></p>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Application Support & Privacy Compliance</p>
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
