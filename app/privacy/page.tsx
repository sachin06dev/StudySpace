import type { Metadata } from 'next'
import LegalPageShell, { TocItem, SummaryPoint } from '@/components/legal/LegalPageShell'

export const metadata: Metadata = {
  title: 'Privacy Policy — StudySpace 4U',
  description:
    'StudySpace 4U Privacy Policy: Learn how we protect student data, manage authentication, and handle your study resources.',
  alternates: {
    canonical: '/privacy',
  },
}

const TOC: TocItem[] = [
  { id: 'section-1', number: 1, title: 'Introduction & Scope' },
  { id: 'section-2', number: 2, title: 'Information We Collect' },
  { id: 'section-3', number: 3, title: 'How We Protect Your Data' },
  { id: 'section-4', number: 4, title: 'Zero Data Selling & Third-Party Sharing' },
  { id: 'section-5', number: 5, title: 'Your Rights & Account Deletion' },
  { id: 'section-6', number: 6, title: 'Contact Us' },
]

const SUMMARY_POINTS: SummaryPoint[] = [
  {
    title: 'Minimal Data Collection',
    desc: 'We collect only your basic profile and study data (notes, tasks, attendance) necessary to run your workspace.',
  },
  {
    title: 'Row Level Security',
    desc: 'All notes and documents are isolated at the database level with PostgreSQL Row Level Security (RLS).',
  },
  {
    title: 'Zero Data Selling',
    desc: 'We never sell, rent, or trade your personal data or study habits to advertisers or data brokers.',
  },
  {
    title: 'Full User Control',
    desc: 'You can export or delete your notes, documents, and entire account at any time.',
  },
]

export default function PrivacyPolicyPage() {
  const lastUpdated = 'August 23, 2026'

  return (
    <LegalPageShell
      badge="Official Policy Document"
      title="Privacy Policy"
      lastUpdated={lastUpdated}
      toc={TOC}
      summaryPoints={SUMMARY_POINTS}
    >
      {/* Section 1 */}
      <section
        id="section-1"
        className="p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] shadow-xs scroll-mt-28"
      >
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/10 text-xs font-bold text-violet-600 dark:text-violet-400 border border-violet-500/20 font-mono">
            1
          </span>
          Introduction & Scope
        </h2>
        <div className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <p>
            Welcome to <strong>StudySpace</strong>. We provide a full-stack student productivity and learning workspace designed to help you organize study lectures, create timestamped notes, manage tasks, run Pomodoro sessions, and track study analytics.
          </p>
          <p>
            We take student data privacy seriously. This Privacy Policy explains what information we collect when you use StudySpace, how that data is stored and secured, and your rights regarding your personal information.
          </p>
        </div>
      </section>

      {/* Section 2 */}
      <section
        id="section-2"
        className="p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] shadow-xs scroll-mt-28"
      >
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/10 text-xs font-bold text-violet-600 dark:text-violet-400 border border-violet-500/20 font-mono">
            2
          </span>
          Information We Collect
        </h2>
        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          We collect only the minimum data required to deliver our educational productivity services:
        </p>

        <div className="mt-4 space-y-4">
          <div className="border-l-2 border-violet-600 pl-4 py-0.5">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
              A. Account & Authentication Data
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
              When you sign in using Google OAuth or email signup, we receive basic identity information: your email address, full name, and avatar image URL. We request only standard OAuth scopes (<code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono">openid</code>, <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono">email</code>, <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono">profile</code>) and do not access your Google Drive, Gmail, or sensitive data.
            </p>
          </div>

          <div className="border-l-2 border-violet-600 pl-4 py-0.5">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
              B. Study Data & User Content
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
              We store the notes you write, video timestamps, saved study playlists, tasks and due dates, Pomodoro focus session durations, bookmark resources, and documents you explicitly upload to your private workspace.
            </p>
          </div>

          <div className="border-l-2 border-violet-600 pl-4 py-0.5">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
              C. YouTube Integration Data
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
              When you search or import educational videos or playlists, we fetch public video metadata (title, channel name, duration, thumbnail) via the YouTube Data API v3. We do not modify or access your private YouTube account.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section
        id="section-3"
        className="p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] shadow-xs scroll-mt-28"
      >
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/10 text-xs font-bold text-violet-600 dark:text-violet-400 border border-violet-500/20 font-mono">
            3
          </span>
          How We Protect Your Data
        </h2>
        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          Security and data isolation are core architectural foundations of StudySpace:
        </p>
        <ul className="list-disc pl-5 mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <li>
            <strong className="text-zinc-900 dark:text-zinc-200">Row Level Security (RLS):</strong> Every piece of user content (tasks, notes, Pomodoro records, bookmarks, documents) is secured at the database engine level via PostgreSQL Row Level Security. Only you can query or modify your personal records.
          </li>
          <li>
            <strong className="text-zinc-900 dark:text-zinc-200">Private Storage Buckets:</strong> Uploaded study documents are stored in private Supabase Storage buckets with strict user ownership boundaries.
          </li>
          <li>
            <strong className="text-zinc-900 dark:text-zinc-200">Encrypted Communications:</strong> All network traffic between your browser and our servers is encrypted in transit using industry-standard HTTPS / TLS 1.3.
          </li>
        </ul>
      </section>

      {/* Section 4 */}
      <section
        id="section-4"
        className="p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] shadow-xs scroll-mt-28"
      >
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/10 text-xs font-bold text-violet-600 dark:text-violet-400 border border-violet-500/20 font-mono">
            4
          </span>
          Zero Data Selling & Third-Party Sharing
        </h2>
        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <strong>We do not sell, rent, or trade your personal data.</strong> Your notes, study habits, and account details will never be sold to advertisers or third-party data brokers.
        </p>
        <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          We utilize trusted infrastructure providers solely to host and execute the application:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
          <li>
            <strong className="text-zinc-900 dark:text-zinc-200">Supabase:</strong> Database hosting, user authentication, and secure file storage.
          </li>
          <li>
            <strong className="text-zinc-900 dark:text-zinc-200">Vercel:</strong> Application hosting, edge delivery, and web performance analytics.
          </li>
          <li>
            <strong className="text-zinc-900 dark:text-zinc-200">Google OAuth:</strong> Secure authentication provider for single sign-on.
          </li>
        </ul>
      </section>

      {/* Section 5 */}
      <section
        id="section-5"
        className="p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] shadow-xs scroll-mt-28"
      >
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/10 text-xs font-bold text-violet-600 dark:text-violet-400 border border-violet-500/20 font-mono">
            5
          </span>
          Your Rights & Account Deletion
        </h2>
        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          You have complete control over your data in StudySpace. You may:
        </p>
        <ul className="list-disc pl-5 mt-3 space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
          <li>View, edit, or delete any task, note, video, playlist, or document at any time directly in the app.</li>
          <li>
            <strong className="text-zinc-900 dark:text-zinc-200">Export your data:</strong>{' '}
            Download a full JSON export of your notes, tasks, attendance records, timetable, and study history at any time from <strong>Settings → Export All Data</strong>.
          </li>
          <li>
            <strong className="text-zinc-900 dark:text-zinc-200">Delete your data:</strong>{' '}
            Clear all your study data (notes, tasks, attendance) without closing your account from <strong>Settings → Delete My Study Data</strong>.
          </li>
          <li>
            <strong className="text-zinc-900 dark:text-zinc-200">Delete your account:</strong>{' '}
            Permanently delete your StudySpace account, files, and all associated cloud data from <strong>Settings → Delete My Account</strong> or via our public deletion page at <a href="/delete-account" className="text-violet-600 dark:text-violet-400 font-semibold underline hover:no-underline">/delete-account</a>.
          </li>
        </ul>
        <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-3">
          <strong>Summary of Deletion &amp; Export:</strong> You can export all your data at any time from Settings → Export All Data, or permanently delete all your data and account via Settings → Delete My Account or by visiting our public deletion page at <a href="/delete-account" className="underline font-semibold">/delete-account</a>.
        </p>
      </section>

      {/* Section 6 */}
      <section
        id="section-6"
        className="p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] shadow-xs scroll-mt-28"
      >
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/10 text-xs font-bold text-violet-600 dark:text-violet-400 border border-violet-500/20 font-mono">
            6
          </span>
          Contact Us
        </h2>
        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          If you have any questions about this Privacy Policy or how your data is handled in StudySpace, please reach out to us:
        </p>
        <div className="mt-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-sm">
          <p className="font-bold text-zinc-900 dark:text-zinc-100">StudySpace Team</p>
          <p className="text-zinc-600 dark:text-zinc-400 mt-0.5">Application Support & Privacy Compliance</p>
          <p className="mt-2">
            <a
              href="mailto:studyspace2u@gmail.com"
              className="text-violet-600 dark:text-violet-400 hover:underline font-semibold"
            >
              studyspace2u@gmail.com
            </a>
          </p>
        </div>
      </section>
    </LegalPageShell>
  )
}
