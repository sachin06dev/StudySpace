import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Timer,
  CheckSquare,
  FileText,
  FolderLock,
  Video,
  ListVideo,
  Globe,
  ArrowRight,
  Play,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getVideosPageData } from '@/lib/data/videos'
import { getRecentSessions } from '@/lib/data/pomodoro'
import { getTasks } from '@/lib/data/tasks'

export const metadata = {
  title: 'Study Hub | StudySpace',
  description: 'Your unified academic focus and study workspace.',
}

export default async function StudyHubPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch real study context in parallel
  const [videoDataResult, sessionsResult, tasksResult] = await Promise.allSettled([
    getVideosPageData(user.id),
    getRecentSessions(user.id, 5),
    getTasks(user.id),
  ])

  const videoData = videoDataResult.status === 'fulfilled' ? videoDataResult.value : null
  const recentSessions = sessionsResult.status === 'fulfilled' ? sessionsResult.value : []
  const tasks = tasksResult.status === 'fulfilled' ? tasksResult.value : []

  // Extract continue items
  const inProgressVideo = videoData?.inProgressVideos?.[0] || videoData?.allVideos?.[0] || null
  const latestSession = recentSessions[0] || null
  const pendingTasks = tasks.filter((t) => t.status === 'pending')
  const completedTasksToday = tasks.filter((t) => {
    if (t.status !== 'completed' || !t.completed_at) return false
    const d = new Date(t.completed_at)
    const today = new Date()
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    )
  })

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* 1. Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
            Study Workspace
          </h1>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--border-subtle)]">
            Academic Suite
          </span>
        </div>
        <p className="text-sm text-[var(--foreground-muted)] mt-1">
          Your consolidated toolkit for focus sessions, lecture review, and task execution.
        </p>
      </div>

      {/* 2. CONTINUE SECTION (Active Focus & In-Progress Content) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
            Continue Learning
          </h2>
          {inProgressVideo && (
            <Link
              href={`/videos/${inProgressVideo.video_id}`}
              className="text-xs font-semibold text-[var(--accent)] hover:underline flex items-center gap-1"
            >
              <span>Resume video</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Continue Card 1: Focus Status */}
          <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-subtle)] border border-[var(--border-subtle)] text-[var(--accent)] flex items-center justify-center shrink-0">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--foreground)]">
                    Deep Focus Instrument
                  </h3>
                  <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
                    {latestSession
                      ? `Last session: ${Math.round(latestSession.actual_seconds / 60)}m focus completed`
                      : 'No focus sessions recorded today'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[var(--surface-muted)] text-[var(--foreground-muted)] border border-[var(--border-subtle)]">
                Pomodoro
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <span className="text-xs text-[var(--foreground-muted)] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>25m Focus • 5m Rest Interval</span>
              </span>
              <Link
                href="/pomodoro"
                className="text-xs font-semibold text-white bg-[var(--accent)] hover:opacity-90 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shrink-0 shadow-xs"
              >
                <span>Start Session</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Continue Card 2: Recent Coursework or Video */}
          <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            {inProgressVideo ? (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-[var(--border-subtle)] text-[var(--accent)] flex items-center justify-center shrink-0">
                      <Video className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[var(--foreground)] truncate">
                        {inProgressVideo.video.title}
                      </h3>
                      <p className="text-xs text-[var(--foreground-muted)] truncate mt-0.5">
                        {inProgressVideo.video.channel_name || 'Lecture Video'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[var(--surface-muted)] text-[var(--foreground-muted)] border border-[var(--border-subtle)] shrink-0 ml-2">
                    {Math.round((inProgressVideo.watch_progress_seconds / (inProgressVideo.video.duration_seconds || 1)) * 100)}%
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <span className="text-xs text-[var(--foreground-muted)]">
                    Progress: {Math.floor(inProgressVideo.watch_progress_seconds / 60)}m watched
                  </span>
                  <Link
                    href={`/videos/${inProgressVideo.video_id}`}
                    className="text-xs font-semibold text-[var(--foreground)] hover:text-[var(--accent)] bg-[var(--surface-muted)] hover:bg-[var(--surface)] px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Resume</span>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-[var(--border-subtle)]">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--foreground)]">
                        Daily Objectives
                      </h3>
                      <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
                        {pendingTasks.length} pending • {completedTasksToday.length} completed today
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[var(--surface-muted)] text-[var(--foreground-muted)] border border-[var(--border-subtle)]">
                    Tasks
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <span className="text-xs text-[var(--foreground-muted)]">
                    Stay on top of deadlines
                  </span>
                  <Link
                    href="/tasks"
                    className="text-xs font-semibold text-[var(--foreground)] hover:text-[var(--accent)] bg-[var(--surface-muted)] px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] transition-colors flex items-center gap-1 shrink-0"
                  >
                    <span>View Tasks</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 3. LEARN SECTION (Video Lectures, Playlists, Lecture Notes) */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
          Learn & Synthesize
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/videos"
            className="group bg-[var(--surface)] border border-[var(--border-subtle)] hover:border-[var(--accent)] rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--surface-muted)] group-hover:bg-[var(--accent-subtle)] text-[var(--foreground-muted)] group-hover:text-[var(--accent)] flex items-center justify-center transition-colors">
                  <Video className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-[var(--surface-muted)] text-[var(--foreground-muted)] border border-[var(--border-subtle)]">
                  {videoData?.counts.total ?? 0} Saved
                </span>
              </div>

              <h3 className="text-base font-bold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                Video Lectures
              </h3>
              <p className="text-xs text-[var(--foreground-muted)] mt-1 line-clamp-2 leading-relaxed">
                Watch curated course lectures with real-time timestamped markdown notes.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--accent)] font-semibold">
              <span>Open Lectures</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <Link
            href="/playlists"
            className="group bg-[var(--surface)] border border-[var(--border-subtle)] hover:border-[var(--accent)] rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--surface-muted)] group-hover:bg-[var(--accent-subtle)] text-[var(--foreground-muted)] group-hover:text-[var(--accent)] flex items-center justify-center transition-colors">
                  <ListVideo className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-[var(--surface-muted)] text-[var(--foreground-muted)] border border-[var(--border-subtle)]">
                  Courses
                </span>
              </div>

              <h3 className="text-base font-bold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                Study Playlists
              </h3>
              <p className="text-xs text-[var(--foreground-muted)] mt-1 line-clamp-2 leading-relaxed">
                Structured YouTube video courses grouped by semester subject and module.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--accent)] font-semibold">
              <span>View Playlists</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <Link
            href="/notes"
            className="group bg-[var(--surface)] border border-[var(--border-subtle)] hover:border-[var(--accent)] rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--surface-muted)] group-hover:bg-[var(--accent-subtle)] text-[var(--foreground-muted)] group-hover:text-[var(--accent)] flex items-center justify-center transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-[var(--surface-muted)] text-[var(--foreground-muted)] border border-[var(--border-subtle)]">
                  Knowledge
                </span>
              </div>

              <h3 className="text-base font-bold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                Lecture Notes
              </h3>
              <p className="text-xs text-[var(--foreground-muted)] mt-1 line-clamp-2 leading-relaxed">
                Searchable, timestamped notes linked to precise video lecture moments.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--accent)] font-semibold">
              <span>Review Notes</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </section>

      {/* 4. ORGANIZE SECTION (Tasks, Document Vault, Web Resources) */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
          Organize & Manage
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/tasks"
            className="group bg-[var(--surface)] border border-[var(--border-subtle)] hover:border-[var(--accent)] rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--surface-muted)] group-hover:bg-[var(--accent-subtle)] text-[var(--foreground-muted)] group-hover:text-[var(--accent)] flex items-center justify-center transition-colors">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-[var(--surface-muted)] text-[var(--foreground-muted)] border border-[var(--border-subtle)]">
                  {pendingTasks.length} Pending
                </span>
              </div>

              <h3 className="text-base font-bold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                Academic Tasks
              </h3>
              <p className="text-xs text-[var(--foreground-muted)] mt-1 line-clamp-2 leading-relaxed">
                Prioritized assignment trackers, lab write-up deadlines, and exam milestones.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--accent)] font-semibold">
              <span>Manage Tasks</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <Link
            href="/documents"
            className="group bg-[var(--surface)] border border-[var(--border-subtle)] hover:border-[var(--accent)] rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--surface-muted)] group-hover:bg-[var(--accent-subtle)] text-[var(--foreground-muted)] group-hover:text-[var(--accent)] flex items-center justify-center transition-colors">
                  <FolderLock className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-[var(--surface-muted)] text-[var(--foreground-muted)] border border-[var(--border-subtle)]">
                  Vault
                </span>
              </div>

              <h3 className="text-base font-bold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                Document Vault
              </h3>
              <p className="text-xs text-[var(--foreground-muted)] mt-1 line-clamp-2 leading-relaxed">
                Private cloud storage for course syllabi, past exam papers, and laboratory PDFs.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--accent)] font-semibold">
              <span>Access Vault</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <Link
            href="/resources"
            className="group bg-[var(--surface)] border border-[var(--border-subtle)] hover:border-[var(--accent)] rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--surface-muted)] group-hover:bg-[var(--accent-subtle)] text-[var(--foreground-muted)] group-hover:text-[var(--accent)] flex items-center justify-center transition-colors">
                  <Globe className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-[var(--surface-muted)] text-[var(--foreground-muted)] border border-[var(--border-subtle)]">
                  Links
                </span>
              </div>

              <h3 className="text-base font-bold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                Web Resources
              </h3>
              <p className="text-xs text-[var(--foreground-muted)] mt-1 line-clamp-2 leading-relaxed">
                Quick-access bookmarks, university portals, documentation, and coding sandboxes.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--accent)] font-semibold">
              <span>Browse Links</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}
