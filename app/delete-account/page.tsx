import type { Metadata } from 'next'
import Link from 'next/link'
import LegalPageShell, { TocItem, SummaryPoint } from '@/components/legal/LegalPageShell'
import { ArrowRight, Trash2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Delete Account & Data | StudySpace 4U',
  description:
    'Learn how to permanently delete your StudySpace 4U account, export your academic records, or clear your study data.',
  alternates: {
    canonical: '/delete-account',
  },
}

const TOC: TocItem[] = [
  { id: 'section-overview', number: 1, title: 'Overview & Policy' },
  { id: 'section-self-serve', number: 2, title: 'Self-Serve Deletion in App' },
  { id: 'section-data-export', number: 3, title: 'Exporting Data Before Deletion' },
  { id: 'section-erased-data', number: 4, title: 'What Data Is Erased' },
  { id: 'section-assisted-deletion', number: 5, title: 'Assisted Deletion Requests' },
]

const SUMMARY_POINTS: SummaryPoint[] = [
  {
    title: 'Instant & Self-Serve',
    desc: 'You can permanently delete your account and all data directly inside Settings → Export & Data Control.',
  },
  {
    title: 'Irreversible Deletion',
    desc: 'All notes, attendance logs, timetables, tasks, and cloud storage files in Supabase and Cloudflare R2 are permanently purged.',
  },
  {
    title: 'Zero Latency Export',
    desc: 'You can download a full JSON archive of your entire workspace at any time before confirming deletion.',
  },
  {
    title: 'Assisted Deletion Available',
    desc: 'If you cannot access your account, email studyspace2u@gmail.com for manual verification and deletion.',
  },
]

export default function DeleteAccountPage() {
  const lastUpdated = 'October 2, 2026'

  return (
    <LegalPageShell
      badge="Data Governance"
      title="Delete Account & Data"
      lastUpdated={lastUpdated}
      toc={TOC}
      summaryPoints={SUMMARY_POINTS}
    >
      {/* Section 1 */}
      <section
        id="section-overview"
        className="p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] shadow-xs scroll-mt-28 space-y-4"
      >
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/10 text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20 font-mono">
            1
          </span>
          Overview &amp; Policy
        </h2>
        <div className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <p>
            At <strong>StudySpace</strong>, we respect your right to digital privacy and complete autonomy over your personal information. You can permanently delete your account, purge specific study datasets, or export your academic records at any time without fees or delays.
          </p>
          <p>
            Account deletion is permanent and immediate. When confirmed, your authentication credentials, cloud profile, uploaded files, and study records are permanently eradicated from our primary databases and storage servers.
          </p>
        </div>
      </section>

      {/* Section 2 */}
      <section
        id="section-self-serve"
        className="p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] shadow-xs scroll-mt-28 space-y-4"
      >
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/10 text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20 font-mono">
            2
          </span>
          Self-Serve Deletion in App
        </h2>
        <div className="space-y-4 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <p>
            You can delete your account or study data yourself in seconds without contacting customer support:
          </p>
          <ol className="list-decimal pl-5 space-y-2 text-zinc-600 dark:text-zinc-400">
            <li>
              Log in to your StudySpace workspace on Web or Mobile.
            </li>
            <li>
              Navigate to <strong>Settings</strong> from the navigation sidebar or menu.
            </li>
            <li>
              Scroll to the <strong>Export &amp; Data Control</strong> section at the bottom.
            </li>
            <li>
              Choose either <strong>Delete My Study Data</strong> (to reset records while keeping your login) or <strong>Delete My Account</strong> (to erase everything permanently).
            </li>
            <li>
              Confirm your password (if applicable), type <code className="font-mono font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-1 rounded">DELETE</code>, and confirm.
            </li>
          </ol>

          <div className="pt-2">
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-xs"
            >
              <Trash2 className="w-4 h-4" />
              <span>Go to Settings Data Control</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section
        id="section-data-export"
        className="p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] shadow-xs scroll-mt-28 space-y-4"
      >
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/10 text-xs font-bold text-violet-600 dark:text-violet-400 border border-violet-500/20 font-mono">
            3
          </span>
          Exporting Data Before Deletion
        </h2>
        <div className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <p>
            Because deletion is irreversible, we strongly advise exporting your data first. You can download an unencrypted, structured JSON archive containing:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-600 dark:text-zinc-400">
            <li>All study notes and video timestamp annotations</li>
            <li>All attendance records, safe bunk calculations, and subject rosters</li>
            <li>Timetable schedules, exceptions, and semester configurations</li>
            <li>Pomodoro focus session history and streak counters</li>
            <li>Saved video libraries, playlists, and study web bookmarks</li>
          </ul>
          <p className="pt-1">
            To export, click <strong>Download JSON</strong> inside <strong>Settings → Export All Data</strong>.
          </p>
        </div>
      </section>

      {/* Section 4 */}
      <section
        id="section-erased-data"
        className="p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] shadow-xs scroll-mt-28 space-y-4"
      >
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono">
            4
          </span>
          What Data Is Erased
        </h2>
        <div className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <p>
            When an account is deleted, the following resources are purged via database cascading constraints and cloud storage cleanup pipelines:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-1">
              <p className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">PostgreSQL Relational Tables</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Semesters, subjects, timetable slots, exceptions, attendance logs, tasks, notes, user settings, and registered devices.
              </p>
            </div>
            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-1">
              <p className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">File &amp; Document Storage</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                All uploaded PDF notes and document attachments in Supabase Storage and Cloudflare R2 under your user ID prefix.
              </p>
            </div>
            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-1">
              <p className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">Auth &amp; Session Tokens</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Identity credentials in Supabase Auth, active JWT refresh tokens, and cross-platform mobile session keys.
              </p>
            </div>
            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-1">
              <p className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">Local Device Caches</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                SQLite offline cache tables on the Flutter mobile app are cleared on sign-out and account reset.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 */}
      <section
        id="section-assisted-deletion"
        className="p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] shadow-xs scroll-mt-28 space-y-4"
      >
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/10 text-xs font-bold text-violet-600 dark:text-violet-400 border border-violet-500/20 font-mono">
            5
          </span>
          Assisted Deletion Requests
        </h2>
        <div className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <p>
            If you have lost access to your account or prefer our team to delete your records manually, send an email from the email address registered with your StudySpace account to:
          </p>
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono">
              studyspace2u@gmail.com
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Subject: Account &amp; Data Deletion Request
            </p>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Assisted requests are processed within 24 to 48 hours following identity confirmation.
          </p>
        </div>
      </section>
    </LegalPageShell>
  )
}
