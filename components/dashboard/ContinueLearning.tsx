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
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-5 sm:p-6 shadow-xs transition-colors">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Continue Learning</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Pick up right where you left off in your study library
          </p>
        </div>

        <Link
          href="/videos"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 hover:underline"
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
                className="group relative bg-white dark:bg-gray-800/80 rounded-xl border border-gray-200/90 dark:border-gray-700/80 hover:border-gray-300 dark:hover:border-gray-600 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden justify-between"
              >
                <div>
                  {/* Thumbnail / Header */}
                  <Link href={item.href} className="relative aspect-video w-full bg-gray-900 overflow-hidden block">
                    {item.thumbnailUrl ? (
                      <Image
                        src={item.thumbnailUrl}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        priority={index === 0}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400 text-xs">
                        {item.type === 'playlist' ? 'Playlist' : 'Video'}
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                    {/* Type Badge */}
                    <div className="absolute top-2 left-2">
                      {item.type === 'playlist' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-900/80 backdrop-blur-xs text-purple-200 border border-purple-400/20">
                          Playlist
                        </span>
                      ) : isInProgress ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-900/80 backdrop-blur-xs text-amber-200 border border-amber-400/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          <span>In Progress</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-gray-200">
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
                      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-900/70">
                        <div
                          className="h-full bg-red-600 transition-all duration-300"
                          style={{ width: `${item.progressPercent}%` }}
                        />
                      </div>
                    )}
                  </Link>

                  {/* Body Info */}
                  <div className="p-3.5">
                    <Link
                      href={item.href}
                      className="block text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2 leading-snug"
                      title={item.title}
                    >
                      {item.title}
                    </Link>

                    {item.channelOrDomain && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                        {item.channelOrDomain}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-3.5 pb-3.5 pt-1 flex items-center justify-between border-t border-gray-100 dark:border-gray-700/60">
                  {isInProgress && item.progressPercent ? (
                    <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                      {item.progressPercent}% watched
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 capitalize">
                      {item.type}
                    </span>
                  )}

                  <Link
                    href={item.href}
                    className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1"
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
        <div className="py-10 px-4 text-center bg-gray-50/60 dark:bg-gray-800/40 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mb-3">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Your study library is empty</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-4">
            Add a YouTube tutorial, lecture playlist, document, or resource to begin building your study workspace.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/videos"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-3.5 py-1.5 rounded-xl shadow-xs transition-colors"
            >
              <span>Add Video</span>
            </Link>
            <Link
              href="/playlists"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 px-3.5 py-1.5 rounded-xl shadow-xs transition-colors"
            >
              <span>Browse Playlists</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
