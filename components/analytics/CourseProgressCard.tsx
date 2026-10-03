import Link from 'next/link'
import Image from 'next/image'
import type { PlaylistProgressData } from '@/lib/data/analytics'

export interface CourseProgressCardProps {
  data: PlaylistProgressData
}

export default function CourseProgressCard({ data }: CourseProgressCardProps) {
  return (
    <div id="course-progress" className="bg-white dark:bg-(--surface) border border-slate-200/80 dark:border-(--border-subtle) rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-(--border-subtle)">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎓</span>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Course & Playlist Progress
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track completion across your saved courses
            </p>
          </div>
        </div>

        <Link
          href="/playlists"
          className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors flex items-center gap-1"
        >
          <span>View All</span>
          <span>→</span>
        </Link>
      </div>

      {/* Playlists List or Empty State */}
      {!data.hasData || data.playlists.length === 0 ? (
        <div className="text-center py-6 px-4 bg-slate-50/60 dark:bg-(--surface-raised)/30 border border-dashed border-slate-200 dark:border-(--border-subtle) rounded-2xl space-y-2">
          <div className="text-2xl">📚</div>
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            No saved courses yet
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Save structured YouTube playlists or learning courses to track your completion and study time here.
          </p>
          <div className="pt-1">
            <Link
              href="/playlists"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 px-3.5 py-1.5 rounded-xl shadow-xs transition-colors"
            >
              <span>Explore Playlists</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {data.playlists.slice(0, 4).map((pl) => (
            <Link
              key={pl.id}
              href={`/playlists/${pl.playlistId || pl.id}`}
              className="group block bg-slate-50/70 dark:bg-(--surface-raised)/50 hover:bg-slate-100/80 dark:hover:bg-(--surface-raised) border border-slate-200/60 dark:border-(--border-subtle) hover:border-purple-300 dark:hover:border-purple-600/50 rounded-2xl p-3.5 transition-all shadow-xs"
            >
              <div className="flex items-start gap-3">
                {pl.thumbnailUrl ? (
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-(--border-subtle)">
                    <Image
                      src={pl.thumbnailUrl}
                      alt={pl.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-[var(--duration-fast)] [transition-timing-function:var(--ease-smooth-out)]"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-base shrink-0">
                    ▶
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {pl.title}
                    </h4>
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400 shrink-0">
                      {pl.progressPercent}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="truncate">
                      {pl.channelName || 'YouTube Playlist'} • {pl.completedVideos} / {pl.totalVideos} videos
                    </span>
                    {pl.totalDurationSeconds > 0 && (
                      <span className="shrink-0 font-medium text-slate-600 dark:text-slate-300">
                        {pl.formattedDuration} watched
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200/80 dark:bg-(--surface-raised) h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      style={{ width: `${pl.progressPercent}%` }}
                      className={`h-full rounded-full transition-all duration-[var(--duration-very-slow)] [transition-timing-function:var(--ease-smooth-out)] ${
                        pl.progressPercent === 100
                          ? 'bg-emerald-500'
                          : 'bg-purple-600 dark:bg-purple-400'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
