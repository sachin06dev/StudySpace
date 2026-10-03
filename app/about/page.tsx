import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  GraduationCap,
  Shield,
  Smartphone,
  Sparkles,
  BookOpen,
  Clock,
  Video,
  FileText,
  Calendar,
  Activity,
  CheckCircle2,
  FolderLock,
  Bookmark,
  Camera,
  ArrowRight,
} from 'lucide-react'
import LandingMotionEffects from '@/components/landing/LandingMotionEffects'
import LandingNavbar from '@/components/landing/LandingNavbar'
import LandingFooter from '@/components/landing/LandingFooter'
import { aboutData } from '@/lib/config/about'

export const metadata: Metadata = {
  title: 'About StudySpace 4U — Academic Workspace Built for Students',
  description:
    'Learn about the story behind StudySpace 4U (studyspace4u), our principles of distraction-free studying, and the 12 verified features unifying the university student workflow.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About StudySpace 4U — Academic Workspace Built for Students',
    description:
      'Learn about the story behind StudySpace 4U (studyspace4u), our principles of distraction-free studying, and the 12 verified features unifying the university student workflow.',
    type: 'website',
  },
}

const PRINCIPLES = [
  {
    icon: GraduationCap,
    title: 'Free for University Students',
    desc: 'Core academic tracking, timetable management, and study focus tools are completely free for students with no hidden paywalls.',
  },
  {
    icon: Shield,
    title: 'Zero Data Selling',
    desc: 'Zero behavioral tracking or advertising algorithms. Every note and record is strictly protected by PostgreSQL Row Level Security (RLS).',
  },
  {
    icon: Smartphone,
    title: 'Offline-First Android Companion',
    desc: 'Campus networks drop frequently. The Flutter Android app uses an on-device SQLite database for instant, offline attendance logging.',
  },
  {
    icon: Sparkles,
    title: 'Transparent & Built for Students',
    desc: 'Crafted with Next.js 16, Supabase, and Flutter. Designed around the everyday schedule and coursework needs of university students.',
  },
]

const FEATURES_12 = [
  {
    num: '01',
    icon: Calendar,
    title: 'Attendance & Bunk Margin Engine',
    desc: 'Calculates exact safe skips remaining and required consecutive recovery classes to maintain your college 75% criteria.',
  },
  {
    num: '02',
    icon: Camera,
    title: 'Multimodal AI Timetable Scanner',
    desc: 'Snap a photo of your printed or handwritten schedule; Google Gemini multimodal vision parses and builds your semester timetable.',
  },
  {
    num: '03',
    icon: BookOpen,
    title: 'Weekly Schedule & Exception Engine',
    desc: 'Full semester schedule template with dynamic handling for cancelled, extra, and rescheduled lectures.',
  },
  {
    num: '04',
    icon: Video,
    title: 'YouTube Lecture Hub',
    desc: 'Import course playlists and watch educational videos in a focused player with video-anchored notes and progress memory.',
  },
  {
    num: '05',
    icon: Clock,
    title: 'Video-Anchored Timestamped Notes',
    desc: 'Take notes while watching lectures. Clicking any note instantly seeks the video back to that exact second.',
  },
  {
    num: '06',
    icon: FileText,
    title: 'Centralized Timestamp Notes Search',
    desc: 'Search, tag, and review all lecture notes across all your subjects in one centralized repository.',
  },
  {
    num: '07',
    icon: Clock,
    title: 'Navigation-Persistent Pomodoro Suite',
    desc: 'Background focus timer that survives page transitions across the web app, with configurable work/break cycles and audio chimes.',
  },
  {
    num: '08',
    icon: CheckCircle2,
    title: 'Priority Academic Tasks',
    desc: 'Manage assignments, lab submissions, and exam prep with high, medium, and low priority tags and completion history.',
  },
  {
    num: '09',
    icon: Bookmark,
    title: 'Categorized Website Resources',
    desc: 'Save documentation, syllabus portals, reference repositories, and study links organized by subject category.',
  },
  {
    num: '10',
    icon: FolderLock,
    title: 'Academic Document Vault',
    desc: 'Private PDF document viewer and secure dual storage (Supabase & Cloudflare R2) for syllabus PDFs and previous year papers.',
  },
  {
    num: '11',
    icon: Activity,
    title: '365-Day Heatmap & Consistency Score',
    desc: 'Gamified consistency rating (0–100) based on active study days, qualifying streaks, and diurnal study habits.',
  },
  {
    num: '12',
    icon: Smartphone,
    title: 'Offline Flutter Android Companion',
    desc: 'Haptic attendance marking, background SQLite sync queue, and on-device class notifications before every lecture.',
  },
]

export default function AboutPage() {
  const { name, role, image, socialLinks } = aboutData

  return (
    <div
      id="top"
      className="min-h-screen bg-(--color-background) text-(--color-foreground) selection:bg-violet-500 selection:text-white transition-colors"
    >
      <LandingMotionEffects />
      <LandingNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Story Header */}
        <div className="max-w-3xl mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 font-mono">
            <span>The Origin & Vision</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
            Built by a student who was tired of{' '}
            <span className="text-violet-600 dark:text-violet-400">six different apps.</span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed pt-2">
            Every semester, university students juggle a messy puzzle: watching lectures on YouTube, jotting notes in loose text files, setting phone timers for focus, calculating attendance margins in their heads, and hunting for syllabus PDFs in downloads.
          </p>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            StudySpace (studyspace4u) was engineered to bring that entire academic workflow into a single, reliable workspace across Web and Android — so you spend less time organizing and more time learning.
          </p>
        </div>

        {/* Creator Bio Card */}
        <section id="creator" className="mb-20 p-6 sm:p-10 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden shadow-md ring-2 ring-violet-500/30 bg-zinc-100 dark:bg-zinc-800">
                <Image
                  src={image}
                  alt={`${name} profile picture`}
                  fill
                  sizes="160px"
                  className="object-cover"
                  priority
                />
              </div>
              <h2 className="mt-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {name}
              </h2>
              <p className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                {role}
              </p>
            </div>

            <div className="md:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                <span>Developer Note</span>
              </div>
              <div className="space-y-3 text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
                <p>
                  I was constantly overwhelmed managing college across scattered tools: timetable photos buried in my gallery, unorganized lecture bookmarks, and attendance that was always a guessing game until the final warning list came out.
                </p>
                <p>
                  I built StudySpace to resolve this chaos—bringing your timetable, safe bunk thresholds, and timestamped lecture notes into one focused, distraction-free space.
                </p>
              </div>

              {/* Social Links */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {socialLinks?.github && (
                  <a
                    href={socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                  >
                    GitHub ↗
                  </a>
                )}
                {socialLinks?.linkedin && (
                  <a
                    href={socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                  >
                    LinkedIn ↗
                  </a>
                )}
                {socialLinks?.email && (
                  <a
                    href={`mailto:${socialLinks.email}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                  >
                    Email ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 4 Core Principles */}
        <section className="mb-20">
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              Our Core Principles
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              What we stand for and how we protect the student learning experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRINCIPLES.map((p, i) => {
              const Icon = p.icon
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                      {p.title}
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* 12 Verified Features */}
        <section className="mb-20">
          <div className="max-w-2xl mb-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 font-mono mb-3">
              <span>Complete System Breakdown</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              The 12 Core Ecosystem Modules
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Grounded strictly in the StudySpace architecture and production code.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES_12.map((f) => {
              const Icon = f.icon
              return (
                <div
                  key={f.num}
                  className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] shadow-xs hover:border-violet-500/40 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-violet-600 dark:text-violet-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-600 font-bold">
                        {f.num}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                      {f.title}
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="p-8 sm:p-12 rounded-3xl border border-violet-500/30 bg-violet-500/[0.03] dark:bg-violet-500/[0.04] text-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Ready to streamline your semester?
          </h2>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
            Start using StudySpace across Web and Android. Free, secure, and built specifically for your academic workflow.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow-violet-500/25 transition-all"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/#android"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs sm:text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Smartphone className="w-4 h-4 text-violet-500" />
              <span>Get Android App</span>
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
