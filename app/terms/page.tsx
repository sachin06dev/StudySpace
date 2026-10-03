import type { Metadata } from 'next'
import LegalPageShell, { TocItem, SummaryPoint } from '@/components/legal/LegalPageShell'

export const metadata: Metadata = {
  title: 'Terms of Service — StudySpace 4U',
  description:
    'StudySpace 4U Terms of Service: Guidelines, acceptable use, and terms for using the StudySpace 4U learning workspace.',
  alternates: {
    canonical: '/terms',
  },
}

const TOC: TocItem[] = [
  { id: 'section-1', number: 1, title: 'Acceptance of Terms' },
  { id: 'section-2', number: 2, title: 'User Accounts & Security' },
  { id: 'section-3', number: 3, title: 'Acceptable Use Policy' },
  { id: 'section-4', number: 4, title: 'YouTube API Services' },
  { id: 'section-5', number: 5, title: 'User Content & Ownership' },
  { id: 'section-6', number: 6, title: 'Disclaimer & Limitation of Liability' },
  { id: 'section-7', number: 7, title: 'Contact' },
]

const SUMMARY_POINTS: SummaryPoint[] = [
  {
    title: 'Student Productivity Purpose',
    desc: 'StudySpace is designed strictly to help students manage courses, timetables, and learning sessions.',
  },
  {
    title: '100% Content Ownership',
    desc: 'You retain full ownership of all notes, tasks, and documents you create or store on StudySpace.',
  },
  {
    title: 'Responsible Usage',
    desc: 'Use the platform respectfully. Do not upload malicious files, attempt security breaches, or disrupt the service.',
  },
  {
    title: 'Third-Party Compliance',
    desc: 'YouTube lecture integrations comply with YouTube Terms of Service and standard Google developer policies.',
  },
]

export default function TermsOfServicePage() {
  const lastUpdated = 'August 23, 2026'

  return (
    <LegalPageShell
      badge="Official Legal Agreement"
      title="Terms of Service"
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
          Acceptance of Terms
        </h2>
        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          By accessing, browsing, or using the <strong>StudySpace</strong> web application (the &quot;Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
        </p>
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
          User Accounts & Security
        </h2>
        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          To access personalized workspace features, you must register for an account using Google authentication or a valid email address. You agree to:
        </p>
        <ul className="list-disc pl-5 mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <li>Provide accurate, current, and complete information during signup.</li>
          <li>Maintain the confidentiality of your login credentials.</li>
          <li>Promptly notify us if you suspect unauthorized access or any security breach of your account.</li>
        </ul>
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
          Acceptable Use Policy
        </h2>
        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          StudySpace is designed to support learning and productivity. You agree not to use the Service to:
        </p>
        <ul className="list-disc pl-5 mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <li>Upload malicious code, viruses, or harmful software.</li>
          <li>Upload unlawful, infringing, abusive, or harmful materials to document storage.</li>
          <li>Attempt to gain unauthorized access to other users&apos; accounts or workspace data.</li>
          <li>Interfere with or disrupt the integrity and performance of the Service.</li>
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
          YouTube API Services
        </h2>
        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          StudySpace utilizes the YouTube Data API v3 to enable video search, playlist organization, and lecture playback with timestamped note-taking. By using YouTube-powered features in StudySpace, you also agree to be bound by the{' '}
          <a
            href="https://www.youtube.com/t/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-600 dark:text-violet-400 font-semibold underline"
          >
            YouTube Terms of Service
          </a>{' '}
          and Google Privacy Policy.
        </p>
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
          User Content & Ownership
        </h2>
        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          You retain all ownership rights to the notes, task lists, and documents you create or upload in StudySpace. StudySpace does not claim any intellectual property rights over your personal study materials.
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
          Disclaimer & Limitation of Liability
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          StudySpace is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind. While we strive for 100% uptime and data reliability, we cannot guarantee uninterrupted or error-free service. To the maximum extent permitted by law, StudySpace shall not be liable for any indirect or incidental damages resulting from your use of the service.
        </p>
      </section>

      {/* Section 7 */}
      <section
        id="section-7"
        className="p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] shadow-xs scroll-mt-28"
      >
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/10 text-xs font-bold text-violet-600 dark:text-violet-400 border border-violet-500/20 font-mono">
            7
          </span>
          Contact
        </h2>
        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          For legal inquiries or questions concerning these Terms, contact:
        </p>
        <div className="mt-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-sm">
          <p className="font-bold text-zinc-900 dark:text-zinc-100">StudySpace Team</p>
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
