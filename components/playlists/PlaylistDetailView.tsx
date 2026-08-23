'use client'

import { useState } from 'react'
import Image from 'next/image'
import VideoCard from '@/components/videos/VideoCard'
import { markVideoCompleted } from '@/lib/actions/videos'
import type { PlaylistWithItems } from '@/lib/data/playlists'
import type { VideoStatus } from '@/lib/data/videos'

interface PlaylistDetailViewProps {
  playlistData: PlaylistWithItems
  playlistId: string
}

export default function PlaylistDetailView({
  playlistData,
  playlistId,
}: PlaylistDetailViewProps) {
  const [prevData, setPrevData] = useState(playlistData)
  const [data, setData] = useState<PlaylistWithItems>(playlistData)
  const [error, setError] = useState<string | null>(null)

  if (prevData !== playlistData) {
    setPrevData(playlistData)
    setData(playlistData)
  }

  const { playlist, items, video_count, saved_at } = data

  const completedCount = items.filter(
    (item) => item.savedVideo.status === 'completed'
  ).length

  // Optimistic Toggle Watched inside Playlist
  const handleToggleWatched = async (savedVideoId: string, willBeCompleted: boolean) => {
    setError(null)
    const prevData = data
    const targetStatus: VideoStatus = willBeCompleted ? 'completed' : 'in_progress'

    // 1. Optimistic update
    setData((current) => ({
      ...current,
      items: current.items.map((item) => {
        if (item.savedVideo.id !== savedVideoId) return item
        return {
          ...item,
          savedVideo: {
            ...item.savedVideo,
            status: targetStatus,
            completed_at: willBeCompleted ? new Date().toISOString() : null,
          },
        }
      }),
    }))

    // 2. Server mutation in background
    try {
      const res = await markVideoCompleted(savedVideoId, willBeCompleted)
      if (!res.success) {
        setData(prevData)
        setError(res.error || 'Failed to update watch status.')
      }
    } catch {
      setData(prevData)
      setError('Network error while updating watch status.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex justify-between items-center animate-in fade-in-50">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 font-semibold cursor-pointer ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Playlist Hero / Header Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row gap-6 items-start transition-colors">
        {/* Playlist Thumbnail */}
        <div className="relative aspect-video w-full md:w-72 shrink-0 rounded-xl overflow-hidden bg-gray-900 shadow-xs">
          {playlist.thumbnail_url ? (
            <Image
              src={playlist.thumbnail_url}
              alt={playlist.title}
              fill
              sizes="(max-width: 768px) 100vw, 288px"
              className="object-cover"
              priority={true}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              No Thumbnail
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs">
            <span className="bg-black/70 px-2 py-0.5 rounded-md font-medium">
              {video_count} {video_count === 1 ? 'video' : 'videos'}
            </span>
            {completedCount > 0 && (
              <span className="bg-emerald-600/90 px-2 py-0.5 rounded-md font-medium">
                {completedCount}/{video_count} completed
              </span>
            )}
          </div>
        </div>

        {/* Playlist Metadata Info */}
        <div className="flex-1 flex flex-col justify-between self-stretch">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full border bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span>YouTube Playlist</span>
              </span>

              {saved_at && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Saved on{' '}
                  {new Date(saved_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight leading-snug">
              {playlist.title}
            </h1>

            {playlist.channel_name && (
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{playlist.channel_name}</span>
              </p>
            )}

            {playlist.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 line-clamp-3 leading-relaxed whitespace-pre-line">
                {playlist.description}
              </p>
            )}
          </div>

          {/* Quick Info Footer */}
          <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div>
              <span className="text-gray-400 dark:text-gray-500">Total videos:</span>{' '}
              <strong className="text-gray-700 dark:text-gray-200">{video_count}</strong>
            </div>
            <div>
              <span className="text-gray-400 dark:text-gray-500">Completed:</span>{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">{completedCount}</strong>
            </div>
            <div>
              <span className="text-gray-400 dark:text-gray-500">Remaining:</span>{' '}
              <strong className="text-gray-700 dark:text-gray-200">{Math.max(0, video_count - completedCount)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Videos Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Playlist Videos</h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {video_count} {video_count === 1 ? 'item' : 'items'} in order
          </span>
        </div>

        {items.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center text-sm text-gray-500 dark:text-gray-400">
            This playlist contains no available videos.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <div key={item.id} className="relative">
                {/* Position Badge */}
                <div className="absolute top-2 left-2 z-10 bg-black/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs pointer-events-none">
                  #{item.position + 1}
                </div>
                <VideoCard
                  savedVideo={item.savedVideo}
                  fromPlaylist={playlistId}
                  onToggleWatched={handleToggleWatched}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
