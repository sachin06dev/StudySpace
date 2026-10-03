'use client'

import { useState, useMemo, useSyncExternalStore } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import VideoCard from '@/components/videos/VideoCard'
import { removeVideo, markVideoCompleted } from '@/lib/actions/videos'
import { formatDuration } from '@/lib/youtube/client'
import type { VideosPageData, SavedVideoWithDetails, VideoStatus } from '@/lib/data/videos'

interface VideoLibraryProps {
  pageData: VideosPageData
}

type TabFilter = 'all' | 'individual' | 'in_progress' | 'completed'

interface LastWatchedState {
  savedVideoId: string
  videoId: string
  title: string
  channelName: string | null
  thumbnailUrl: string | null
  timestamp: number
  duration: number
  fromPlaylist?: string | null
  playlistTitle?: string | null
}

const PAGE_SIZE = 12

function subscribeToStorage(callback: () => void) {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

function getStoredLastWatched() {
  try {
    return localStorage.getItem('studyspace_last_watched_video')
  } catch {
    return null
  }
}

function getServerSnapshot() {
  return null
}

export default function VideoLibrary({ pageData }: VideoLibraryProps) {
  const [prevPageData, setPrevPageData] = useState<VideosPageData>(pageData)
  const [data, setData] = useState<VideosPageData>(pageData)
  const [activeTab, setActiveTab] = useState<TabFilter>('all')
  const [completedVisibleCount, setCompletedVisibleCount] = useState<number>(PAGE_SIZE)
  const [allVisibleCount, setAllVisibleCount] = useState<number>(PAGE_SIZE)
  const [error, setError] = useState<string | null>(null)
  const [isLastWatchedDismissed, setIsLastWatchedDismissed] = useState(false)

  const storedJson = useSyncExternalStore(subscribeToStorage, getStoredLastWatched, getServerSnapshot)

  const lastWatched = useMemo<LastWatchedState | null>(() => {
    if (!storedJson) return null
    try {
      const parsed = JSON.parse(storedJson) as LastWatchedState
      if (parsed?.savedVideoId && parsed?.title) {
        return parsed
      }
    } catch {}
    return null
  }, [storedJson])

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

  const [searchQuery, setSearchQuery] = useState('')

  // Filter based on search query
  const applySearch = (videosList: SavedVideoWithDetails[]) => {
    if (!searchQuery.trim()) return videosList
    const q = searchQuery.toLowerCase().trim()
    return videosList.filter((v) => {
      const matchTitle = v.video.title.toLowerCase().includes(q)
      const matchChannel = v.video.channel_name?.toLowerCase().includes(q) || false
      return matchTitle || matchChannel
    })
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
      id: 'individual',
      label: 'Individual Videos',
      count: counts.added,
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      count: counts.inProgress,
      icon: (
        <span className="w-2 h-2 rounded-full bg-[var(--warning)] animate-pulse" />
      ),
    },
    {
      id: 'completed',
      label: 'Completed',
      count: counts.completed,
      icon: (
        <svg className="w-3.5 h-3.5 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
  ]

  let tabVideos: SavedVideoWithDetails[] = []
  let hasMore = false
  let remainingCount = 0
  let onLoadMore: (() => void) | undefined

  if (activeTab === 'all') {
    const searched = applySearch(allVideos)
    tabVideos = searched.slice(0, allVisibleCount)
    hasMore = searched.length > allVisibleCount
    remainingCount = searched.length - allVisibleCount
    onLoadMore = () => setAllVisibleCount((prev) => prev + PAGE_SIZE)
  } else if (activeTab === 'individual') {
    tabVideos = applySearch(addedVideos)
  } else if (activeTab === 'in_progress') {
    tabVideos = applySearch(inProgressVideos)
  } else if (activeTab === 'completed') {
    const searched = applySearch(completedVideos)
    tabVideos = searched.slice(0, completedVisibleCount)
    hasMore = searched.length > completedVisibleCount
    remainingCount = searched.length - completedVisibleCount
    onLoadMore = () => setCompletedVisibleCount((prev) => prev + PAGE_SIZE)
  }

  // Highlight continue watching if on "all" tab and no active search
  const showContinueWatching = activeTab === 'all' && !searchQuery.trim() && inProgressVideos.length > 0

  return (
    <div className="space-y-6">
      {/* Resume Last Watched Prominent Banner */}
      {lastWatched && !isLastWatchedDismissed && (
        <div className="bg-gradient-to-r from-[var(--surface)] via-[var(--surface-raised)] to-[var(--surface)] border border-[var(--accent)]/30 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 transition-all animate-in fade-in-50">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Thumbnail */}
            <div className="relative w-20 sm:w-28 aspect-video rounded-lg overflow-hidden bg-black/40 shrink-0 border border-[var(--border-subtle)]">
              {lastWatched.thumbnailUrl ? (
                <Image
                  src={lastWatched.thumbnailUrl}
                  alt={lastWatched.title}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-[var(--text-muted)]">
                  Video
                </div>
              )}
              {lastWatched.timestamp > 0 && lastWatched.duration > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/60">
                  <div
                    className="h-full bg-[var(--accent)]"
                    style={{
                      width: `${Math.min(100, Math.round((lastWatched.timestamp / lastWatched.duration) * 100))}%`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Title & Info */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse shrink-0" />
                <span className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider">
                  Resume Last Watched
                </span>
                {lastWatched.playlistTitle && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border-subtle)] hidden sm:inline-block truncate max-w-[140px]">
                    {lastWatched.playlistTitle}
                  </span>
                )}
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate mt-1">
                {lastWatched.title}
              </h4>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5 font-mono">
                Stopped at {formatDuration(lastWatched.timestamp)}
                {lastWatched.duration > 0 && ` / ${formatDuration(lastWatched.duration)}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <Link
              href={
                lastWatched.fromPlaylist
                  ? `/videos/${lastWatched.savedVideoId}?t=${lastWatched.timestamp}&fromPlaylist=${encodeURIComponent(lastWatched.fromPlaylist)}`
                  : `/videos/${lastWatched.savedVideoId}?t=${lastWatched.timestamp}`
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold hover:bg-[var(--accent-hover)] transition-all shadow-xs cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>Resume at {formatDuration(lastWatched.timestamp)}</span>
            </Link>
            <button
              type="button"
              onClick={() => setIsLastWatchedDismissed(true)}
              className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] rounded-xl transition-colors cursor-pointer"
              title="Dismiss resume banner"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-3 rounded-xl bg-[var(--danger-muted)] border border-[var(--danger-border)] text-xs text-[var(--danger)] flex justify-between items-center animate-in fade-in-50">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-[var(--danger)] hover:opacity-80 font-semibold cursor-pointer ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Controls Bar: Search & Filter Tabs */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-2 border-b border-[var(--border-subtle)]">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved videos or channels..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-subtle)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)] border border-[var(--border-subtle)]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[var(--surface-raised)] text-[var(--text-muted)]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}

          {/* Quick Jump to Course Playlists */}
          <Link
            href="/playlists"
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)] border border-[var(--border-subtle)] transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ml-1"
          >
            <svg className="w-3.5 h-3.5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>Course Playlists</span>
          </Link>
        </div>
      </div>

      {/* Continue Watching Section (when on All tab without search) */}
      {showContinueWatching && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--warning)] animate-pulse" />
              Continue Watching
            </h3>
            <span className="text-xs text-[var(--text-muted)]">
              {inProgressVideos.length} in progress
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {inProgressVideos.slice(0, 4).map((savedVideo) => (
              <VideoCard
                key={`continue-${savedVideo.id}`}
                savedVideo={savedVideo}
                onDelete={handleDeleteVideo}
                onToggleWatched={handleToggleWatched}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Video Collection Header (if continue watching is displayed) */}
      {showContinueWatching && (
        <div className="pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
            All Saved Videos
          </h3>
        </div>
      )}

      {/* Videos Grid / Tab Empty State */}
      {tabVideos.length === 0 ? (
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-8 text-center transition-colors">
          <div className="max-w-md mx-auto space-y-2">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {searchQuery.trim()
                ? `No videos match "${searchQuery}"`
                : activeTab === 'in_progress'
                ? 'No videos currently in progress.'
                : activeTab === 'completed'
                ? 'No completed videos yet.'
                : activeTab === 'individual'
                ? 'No individual standalone videos.'
                : 'No study videos found.'}
            </p>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              {searchQuery.trim()
                ? 'Try searching with a different term or channel name.'
                : activeTab === 'in_progress'
                ? 'Start watching a lesson and your in-progress videos will appear here.'
                : activeTab === 'completed'
                ? 'When you finish watching a video or mark it as watched, it will be cataloged here.'
                : activeTab === 'individual'
                ? 'Paste any YouTube video URL above to save standalone videos directly to your library.'
                : 'Start watching a lesson and your recent videos will appear here.'}
            </p>
            {searchQuery.trim() && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs font-semibold text-[var(--accent)] hover:underline cursor-pointer"
              >
                Clear search query
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'individual' ? (
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--surface-raised)] border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-mono uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Video</th>
                      <th className="py-3 px-4 hidden sm:table-cell">Channel</th>
                      <th className="py-3 px-4 hidden md:table-cell">Duration</th>
                      <th className="py-3 px-4">Progress</th>
                      <th className="py-3 px-4 hidden lg:table-cell">Last Watched</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {tabVideos.map((savedVideo) => {
                      const durSecs = savedVideo.video.duration_seconds || 0
                      const progSecs = savedVideo.watch_progress_seconds || 0
                      const percent = durSecs > 0 ? Math.min(100, Math.round((progSecs / durSecs) * 100)) : 0
                      const isComplete = savedVideo.status === 'completed'
                      const lastWatchedText = savedVideo.last_watched_at
                        ? new Date(savedVideo.last_watched_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Never'

                      return (
                        <tr
                          key={savedVideo.id}
                          className="hover:bg-[var(--surface-raised)]/60 transition-colors group"
                        >
                          <td className="py-3 px-4 max-w-xs">
                            <div className="flex items-center gap-3">
                              {savedVideo.video.thumbnail_url && (
                                <div className="relative w-16 h-10 rounded-lg overflow-hidden shrink-0 bg-black/20">
                                  <Image
                                    src={savedVideo.video.thumbnail_url}
                                    alt={savedVideo.video.title}
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                  />
                                </div>
                              )}
                              <div className="min-w-0">
                                <Link
                                  href={`/videos/${savedVideo.id}`}
                                  className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)] line-clamp-1 group-hover:underline"
                                >
                                  {savedVideo.video.title}
                                </Link>
                                <span className="text-[11px] text-[var(--text-muted)] sm:hidden block truncate">
                                  {savedVideo.video.channel_name || 'YouTube'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 hidden sm:table-cell text-[var(--text-secondary)] truncate max-w-[150px]">
                            {savedVideo.video.channel_name || 'YouTube'}
                          </td>
                          <td className="py-3 px-4 hidden md:table-cell text-[var(--text-muted)] font-mono">
                            {formatDuration(durSecs)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-[var(--surface-raised)] border border-[var(--border-subtle)] overflow-hidden hidden sm:block">
                                <div
                                  className={`h-full rounded-full ${
                                    isComplete ? 'bg-[var(--success)]' : 'bg-[var(--accent)]'
                                  }`}
                                  style={{ width: `${isComplete ? 100 : percent}%` }}
                                />
                              </div>
                              <span
                                className={`text-[11px] font-mono font-medium ${
                                  isComplete
                                    ? 'text-[var(--success)]'
                                    : percent > 0
                                    ? 'text-[var(--accent)]'
                                    : 'text-[var(--text-muted)]'
                                }`}
                              >
                                {isComplete ? '100%' : `${percent}%`}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 hidden lg:table-cell text-[var(--text-muted)]">
                            {lastWatchedText}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                href={`/videos/${savedVideo.id}`}
                                className="px-2.5 py-1 rounded-lg bg-[var(--accent)] text-white text-[11px] font-semibold hover:bg-[var(--accent-hover)] transition-colors"
                              >
                                Watch
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleToggleWatched(savedVideo.id, !isComplete)}
                                title={isComplete ? 'Mark In Progress' : 'Mark Completed'}
                                className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                                  isComplete
                                    ? 'border-[var(--success)]/40 text-[var(--success)] hover:bg-[var(--success)]/10'
                                    : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)]'
                                }`}
                              >
                                {isComplete ? '✓' : '○'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteVideo(savedVideo.id)}
                                title="Remove video"
                                className="p-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-red-500 hover:border-red-500/40 transition-colors cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {tabVideos.map((savedVideo, index) => (
                <VideoCard
                  key={savedVideo.id}
                  savedVideo={savedVideo}
                  priority={index === 0}
                  onDelete={handleDeleteVideo}
                  onToggleWatched={handleToggleWatched}
                />
              ))}
            </div>
          )}

          {/* Load More Button for paginated tabs */}
          {hasMore && onLoadMore && (
            <div className="flex justify-center pt-2 pb-4">
              <button
                type="button"
                onClick={onLoadMore}
                className="px-5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--accent)] hover:shadow-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <span>Load More Videos</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-raised)] text-[var(--text-muted)] font-mono font-bold">
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
