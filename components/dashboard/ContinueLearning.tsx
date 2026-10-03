import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { RecentLearningItem } from '@/lib/data/dashboard'

interface ContinueLearningProps {
  items: RecentLearningItem[]
}

export default function ContinueLearning({ items }: ContinueLearningProps) {
  const hasItems = items.length > 0

  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-5 sm:p-6 shadow-2xs transition-colors">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)]">Continue Learning</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Pick up right where you left off in your study library
          </p>
        </div>

        <Link
          href="/videos"
          className="text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] flex items-center gap-1 hover:underline"
        >
          <span>View all library</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {hasItems ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, index) => {
            const isVideo = item.type === 'video'
            const isInProgress = item.status === 'in_progress' && (item.progressPercent ?? 0) > 0

            return (
              <div
                key={`${item.type}-${item.id}`}
                className="group relative bg-[var(--surface-raised)] rounded-xl border border-[var(--border-subtle)] hover:border-[var(--border-strong)] shadow-2xs hover:shadow-md transition-all flex flex-col overflow-hidden justify-between"
              >
                <div>
                  {/* Thumbnail / Header */}
                  <Link href={item.href} className="relative aspect-video w-full bg-[var(--surface-elevated)] overflow-hidden block">
                    {item.thumbnailUrl ? (
                      <Image
                        src={item.thumbnailUrl}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-[var(--duration-fast)] [transition-timing-function:var(--ease-smooth-out)]"
                        priority={index === 0}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[var(--surface-elevated)] text-[var(--text-muted)] text-xs">
                        {item.type === 'playlist' ? 'Playlist' : 'Video'}
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                    {/* Type Badge */}
                    <div className="absolute top-2 left-2">
                      {item.type === 'playlist' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/20 backdrop-blur-xs text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40">
                          Playlist
                        </span>
                      ) : isInProgress ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/20 backdrop-blur-xs text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          <span>In Progress</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-white">
                          Video
                        </span>
                      )}
                    </div>

                    {/* Duration / Count Badge */}
                    {item.durationOrSize && (
                      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-white text-[11px] font-medium">
                        {item.durationOrSize}
                      </div>
                    )}

                    {/* Progress Bar */}
                    {item.progressPercent && item.progressPercent > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/50">
                        <div
                          className="h-full bg-purple-600 dark:bg-purple-500 transition-all duration-[var(--duration-slow)] [transition-timing-function:var(--ease-smooth-out)]"
                          style={{ width: `${item.progressPercent}%` }}
                        />
                      </div>
                    )}
                  </Link>

                  {/* Body Info */}
                  <div className="p-3.5">
                    <Link
                      href={item.href}
                      className="block text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors line-clamp-2 leading-snug"
                      title={item.title}
                    >
                      {item.title}
                    </Link>

                    {item.channelOrDomain && (
                      <p className="text-xs text-[var(--text-muted)] mt-1 truncate">
                        {item.channelOrDomain}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-3.5 pb-3.5 pt-2.5 flex items-center justify-between border-t border-[var(--border-subtle)]">
                  {isInProgress && item.progressPercent ? (
                    <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                      {item.progressPercent}% watched
                    </span>
                  ) : (
                    <span className="text-[11px] text-[var(--text-muted)] capitalize">
                      {item.type}
                    </span>
                  )}

                  <Link
                    href={item.href}
                    className="text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] flex items-center gap-1"
                  >
                    <span>{isInProgress ? 'Resume' : isVideo ? 'Watch' : 'View'}</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="py-10 px-4 text-center bg-[var(--surface-raised)]/50 rounded-xl border border-dashed border-[var(--border-subtle)]">
          <div className="mx-auto w-12 h-12 rounded-full bg-[var(--accent-muted)] text-[var(--accent)] flex items-center justify-center mb-3">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Your study library is empty</h3>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto mb-4">
            Add a YouTube tutorial, lecture playlist, document, or resource to begin building your study workspace.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/videos"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 px-3.5 py-1.5 rounded-xl shadow-xs transition-colors"
            >
              <span>Add Video</span>
            </Link>
            <Link
              href="/playlists"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)] bg-[var(--surface)] hover:bg-[var(--surface-elevated)] border border-[var(--border-subtle)] px-3.5 py-1.5 rounded-xl shadow-xs transition-colors"
            >
              <span>Browse Playlists</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
