'use client'

import { useState } from 'react'
import VideoCard from '@/components/videos/VideoCard'
import { removeVideo, markVideoCompleted } from '@/lib/actions/videos'
import type { VideosPageData, SavedVideoWithDetails, VideoStatus } from '@/lib/data/videos'

interface VideoLibraryProps {
  pageData: VideosPageData
}

type TabFilter = 'all' | 'in_progress' | 'completed' | 'added'

const PAGE_SIZE = 12

export default function VideoLibrary({ pageData }: VideoLibraryProps) {
  const [prevPageData, setPrevPageData] = useState<VideosPageData>(pageData)
  const [data, setData] = useState<VideosPageData>(pageData)
  const [activeTab, setActiveTab] = useState<TabFilter>('all')
  const [completedVisibleCount, setCompletedVisibleCount] = useState<number>(PAGE_SIZE)
  const [allVisibleCount, setAllVisibleCount] = useState<number>(PAGE_SIZE)
  const [error, setError] = useState<string | null>(null)

  // Sync state when server prop updates
  if (prevPageData !== pageData) {
    setPrevPageData(pageData)
    setData(pageData)
  }

  const { allVideos, inProgressVideos, completedVideos, addedVideos, counts } = data

  // Optimistic Delete Handler
  const handleDeleteVideo = async (savedVideoId: string) => {
    setError(null)
    const prevData = data

    // 1. Optimistic removal from all lists and count update
    setData((current) => {
      const newAll = current.allVideos.filter((v) => v.id !== savedVideoId)
      const newInProgress = current.inProgressVideos.filter((v) => v.id !== savedVideoId)
      const newCompleted = current.completedVideos.filter((v) => v.id !== savedVideoId)
      const newAdded = current.addedVideos.filter((v) => v.id !== savedVideoId)

      return {
        allVideos: newAll,
        inProgressVideos: newInProgress,
        completedVideos: newCompleted,
        addedVideos: newAdded,
        counts: {
          total: newAll.length,
          inProgress: newInProgress.length,
          completed: newCompleted.length,
          added: newAdded.length,
        },
      }
    })

    // 2. Server mutation in background
    try {
      const res = await removeVideo(savedVideoId)
      if (!res.success) {
        setData(prevData)
        setError(res.error || 'Failed to remove video.')
      }
    } catch {
      setData(prevData)
      setError('Network error while removing video.')
    }
  }

  // Optimistic Toggle Watched Handler
  const handleToggleWatched = async (savedVideoId: string, willBeCompleted: boolean) => {
    setError(null)
    const prevData = data
    const targetStatus: VideoStatus = willBeCompleted ? 'completed' : 'in_progress'

    // 1. Optimistic update
    setData((current) => {
      const updateVideoStatus = (v: SavedVideoWithDetails): SavedVideoWithDetails => {
        if (v.id !== savedVideoId) return v
        return {
          ...v,
          status: targetStatus,
          completed_at: willBeCompleted ? new Date().toISOString() : null,
        }
      }

      const newAll = current.allVideos.map(updateVideoStatus)
      const newInProgress = newAll.filter((v) => v.status === 'in_progress')
      const newCompleted = newAll.filter((v) => v.status === 'completed')
      const newAdded = current.addedVideos.map(updateVideoStatus)

      return {
        allVideos: newAll,
        inProgressVideos: newInProgress,
        completedVideos: newCompleted,
        addedVideos: newAdded,
        counts: {
          total: newAll.length,
          inProgress: newInProgress.length,
          completed: newCompleted.length,
          added: newAdded.length,
        },
      }
    })

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

  const tabs: { id: TabFilter; label: string; count: number; icon: React.ReactNode }[] = [
    {
      id: 'all',
      label: 'All Videos',
      count: counts.total,
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      count: counts.inProgress,
      icon: (
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
      ),
    },
    {
      id: 'completed',
      label: 'Completed',
      count: counts.completed,
      icon: (
        <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    {
      id: 'added',
      label: 'Added Videos',
      count: counts.added,
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
  ]

  let currentVideos: SavedVideoWithDetails[] = []
  let hasMore = false
  let remainingCount = 0
  let onLoadMore: (() => void) | undefined

  if (activeTab === 'all') {
    currentVideos = allVideos.slice(0, allVisibleCount)
    hasMore = allVideos.length > allVisibleCount
    remainingCount = allVideos.length - allVisibleCount
    onLoadMore = () => setAllVisibleCount((prev) => prev + PAGE_SIZE)
  } else if (activeTab === 'in_progress') {
    currentVideos = inProgressVideos
  } else if (activeTab === 'completed') {
    currentVideos = completedVideos.slice(0, completedVisibleCount)
    hasMore = completedVideos.length > completedVisibleCount
    remainingCount = completedVideos.length - completedVisibleCount
    onLoadMore = () => setCompletedVisibleCount((prev) => prev + PAGE_SIZE)
  } else if (activeTab === 'added') {
    currentVideos = addedVideos
  }

  return (
    <div className="space-y-5">
      {/* Error Banner */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex justify-between items-center animate-in fade-in-50">
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-gray-200 dark:border-gray-800 pb-2.5 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive
                    ? 'bg-gray-700 dark:bg-gray-300 text-gray-100 dark:text-gray-900'
                    : 'bg-gray-200/80 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Videos Grid / Tab Empty State */}
      {currentVideos.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center transition-colors">
          <div className="max-w-md mx-auto space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {activeTab === 'in_progress'
                ? 'No videos currently in progress.'
                : activeTab === 'completed'
                ? 'No completed videos yet.'
                : activeTab === 'added'
                ? 'No individually added videos.'
                : 'No videos found.'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {activeTab === 'in_progress'
                ? 'When you start watching any video (from your library or saved playlists), it will appear here automatically.'
                : activeTab === 'completed'
                ? 'When you finish watching a video or mark it as watched, it will be cataloged here.'
                : activeTab === 'added'
                ? 'Paste any YouTube video URL above to save standalone videos directly to your library.'
                : 'Save videos above or start watching videos from your saved playlists to see them here.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentVideos.map((savedVideo, index) => (
              <VideoCard
                key={savedVideo.id}
                savedVideo={savedVideo}
                priority={index === 0}
                onDelete={handleDeleteVideo}
                onToggleWatched={handleToggleWatched}
              />
            ))}
          </div>

          {/* Load More Button for paginated tabs */}
          {hasMore && onLoadMore && (
            <div className="flex justify-center pt-2 pb-4">
              <button
                type="button"
                onClick={onLoadMore}
                className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <span>Load More Videos</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-bold">
                  {remainingCount} more
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
