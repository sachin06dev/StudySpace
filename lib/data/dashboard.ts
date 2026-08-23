import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import {
  getDashboardActivityAndHeatmap,
  getZonedDateParts,
  formatLocalDate,
  type DailyActivity,
  type StreakStats,
  type YearlyActivityData,
  type CompactConsistencyData,
} from '@/lib/data/analytics'

import type { Task } from '@/lib/data/tasks'
import type { SavedVideoWithDetails } from '@/lib/data/videos'
import type { SavedPlaylistWithDetails } from '@/lib/data/playlists'

export type LearningItemType = 'video' | 'playlist' | 'document' | 'resource'

export interface RecentLearningItem {
  id: string
  title: string
  type: LearningItemType
  href: string
  thumbnailUrl: string | null
  channelOrDomain: string | null
  durationOrSize: string | null
  progressPercent: number | null
  status: 'saved' | 'in_progress' | 'completed' | 'not_started' | null
  updatedAt: string | null
}

export interface DashboardData {
  user: {
    id: string
    name: string | null
    email: string | null
    timezone: string
  }
  greeting: {
    salutation: string
    heading: string
    subheading: string
    formattedDate: string
  }
  today: {
    studyMinutes: number
    pomodoroCount: number
    formattedDuration: string
    completedTasks: number
    totalTasks: number
    pendingTasks: number
    taskCompletionPercentage: number
  }
  consistency: CompactConsistencyData
  heatmap: {
    days: DailyActivity[]
    streaks: StreakStats
    timezone: string
    yearlyData: Record<number, YearlyActivityData>
    availableYears: number[]
    selectedYear: number
  }
  pendingTasks: Task[]
  recentLearning: RecentLearningItem[]
  libraryCounts: {
    videos: number
    playlists: number
    resources: number
    documents: number
    notes: number
  }
}

/**
 * Computes a localized greeting salutation based on the hour in the user's timezone.
 */
function getGreetingSalutation(hour: number): string {
  if (hour >= 5 && hour < 12) {
    return 'Good morning'
  }
  if (hour >= 12 && hour < 17) {
    return 'Good afternoon'
  }
  return 'Good evening'
}

/**
 * Formats a localized date string in user's timezone (e.g., "Thursday, August 20, 2026").
 */
function getFormattedLocalDate(date: Date, timeZone: string): string {
  return formatLocalDate(date, timeZone)
}


/**
 * Aggregates all dashboard data for the authenticated user.
 */
export async function getDashboardData(
  userId: string,
  userEmail?: string | null,
  userMetadata?: Record<string, unknown> | null
): Promise<DashboardData> {
  const supabase = await createClient()
  let cookieTz: string | undefined
  try {
    const cookieStore = await cookies()
    cookieTz = cookieStore.get('user-timezone')?.value
  } catch {}

  // 1. Fetch User Profile for display name & timezone
  const profilePromise = supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
    .then(({ data, error }) => {
      if (error) {
        console.error('Error fetching user profile for dashboard:', error)
      }
      return data
    })

  // 2. Fetch Targeted Dashboard Activity & Heatmap in parallel (optimized)
  const analyticsPromise = getDashboardActivityAndHeatmap(userId, cookieTz)

  // 3. Fetch Top 5 Pending Tasks (ordered by due date then created date)
  const tasksPromise = supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(5)
    .then(({ data, error }) => {
      if (error) {
        console.error('Error fetching pending tasks for dashboard:', error)
        return []
      }
      return (data || []) as Task[]
    })

  // 4. Fetch Recent / In-Progress Videos
  const videosPromise = supabase
    .from('saved_videos')
    .select(`
      *,
      video:youtube_videos (*)
    `)
    .eq('user_id', userId)
    .order('last_watched_at', { ascending: false, nullsFirst: false })
    .order('saved_at', { ascending: false })
    .limit(6)
    .then(({ data, error }) => {
      if (error) {
        console.error('Error fetching saved videos for dashboard:', error)
        return []
      }
      return (data || []).filter((item) => item.video) as SavedVideoWithDetails[]
    })

  // 5. Fetch Recent Saved Playlists
  const playlistsPromise = supabase
    .from('saved_playlists')
    .select(`
      *,
      playlist:youtube_playlists (*)
    `)
    .eq('user_id', userId)
    .order('saved_at', { ascending: false })
    .limit(4)
    .then(async ({ data, error }) => {
      if (error || !data) {
        if (error) console.error('Error fetching saved playlists for dashboard:', error)
        return []
      }

      const validPlaylists = data.filter((item) => item.playlist)
      const playlistIds = validPlaylists.map((p) => p.playlist_id)

      if (playlistIds.length === 0) return []

      const { data: videoCounts } = await supabase
        .from('playlist_items')
        .select('playlist_id')
        .in('playlist_id', playlistIds)

      const countMap = new Map<string, number>()
      if (videoCounts) {
        for (const item of videoCounts) {
          countMap.set(item.playlist_id, (countMap.get(item.playlist_id) || 0) + 1)
        }
      }

      return validPlaylists.map((item) => ({
        ...item,
        video_count: countMap.get(item.playlist_id) || 0,
      })) as SavedPlaylistWithDetails[]
    })

  // 6. Fetch Exact Library Counts (using HEAD count queries in parallel)
  const countVideosPromise = Promise.resolve(
    supabase
      .from('saved_videos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
  )
    .then(({ count }) => count || 0)
    .catch(() => 0)

  const countPlaylistsPromise = Promise.resolve(
    supabase
      .from('saved_playlists')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
  )
    .then(({ count }) => count || 0)
    .catch(() => 0)

  const countResourcesPromise = Promise.resolve(
    supabase
      .from('website_resources')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
  )
    .then(({ count }) => count || 0)
    .catch(() => 0)

  const countDocumentsPromise = Promise.resolve(
    supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
  )
    .then(({ count }) => count || 0)
    .catch(() => 0)

  const countNotesPromise = Promise.resolve(
    supabase
      .from('video_timestamp_notes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
  )
    .then(({ count }) => count || 0)
    .catch(() => 0)

  // Await all parallel operations
  const [
    profile,
    analytics,
    pendingTasks,
    recentVideos,
    recentPlaylists,
    countVideos,
    countPlaylists,
    countResources,
    countDocuments,
    countNotes,
  ] = await Promise.all([
    profilePromise,
    analyticsPromise,
    tasksPromise,
    videosPromise,
    playlistsPromise,
    countVideosPromise,
    countPlaylistsPromise,
    countResourcesPromise,
    countDocumentsPromise,
    countNotesPromise,
  ])

  // Resolve user display name
  const rawName =
    profile?.display_name ||
    profile?.full_name ||
    (userMetadata?.full_name as string) ||
    (userMetadata?.name as string) ||
    (userEmail ? userEmail.split('@')[0] : null)

  const userName = rawName ? rawName.trim() : null
  const timezone =
    profile?.timezone && profile.timezone !== 'UTC'
      ? profile.timezone
      : cookieTz || analytics.timezone || profile?.timezone || 'UTC'

  // Determine localized greeting
  const now = new Date()
  const zonedParts = getZonedDateParts(now, timezone)
  const salutation = getGreetingSalutation(zonedParts.hour)
  const formattedDate = getFormattedLocalDate(now, timezone)

  const heading = userName ? `${salutation}, ${userName}` : `${salutation}`
  const subheading = "Let's make today productive."

  // Map and assemble recent learning items
  const learningItems: RecentLearningItem[] = []

  // 1. In-progress videos first (where progress > 0 and not completed)
  const inProgressVideos = (recentVideos as SavedVideoWithDetails[]).filter(
    (v: SavedVideoWithDetails) =>
      v.status === 'in_progress' || (v.watch_progress_seconds > 0 && v.status !== 'completed')
  )
  for (const sv of inProgressVideos) {
    const duration = sv.video.duration_seconds || 0
    const progress = sv.watch_progress_seconds || 0
    const progressPercent =
      duration > 0 && progress > 0 ? Math.min(100, Math.round((progress / duration) * 100)) : 0

    learningItems.push({
      id: sv.id,
      title: sv.video.title,
      type: 'video',
      href: `/videos/${sv.id}`,
      thumbnailUrl: sv.video.thumbnail_url,
      channelOrDomain: sv.video.channel_name,
      durationOrSize: duration > 0 ? `${Math.round(duration / 60)} min` : null,
      progressPercent: progressPercent > 0 ? progressPercent : null,
      status: 'in_progress',
      updatedAt: sv.last_watched_at || sv.saved_at,
    })
  }

  // 2. Saved videos (not yet in progress, or recently saved)
  const otherVideos = (recentVideos as SavedVideoWithDetails[]).filter(
    (v: SavedVideoWithDetails) =>
      !inProgressVideos.some((ipv: SavedVideoWithDetails) => ipv.id === v.id)
  )
  for (const sv of otherVideos) {
    if (learningItems.length >= 4) break
    const duration = sv.video.duration_seconds || 0
    learningItems.push({
      id: sv.id,
      title: sv.video.title,
      type: 'video',
      href: `/videos/${sv.id}`,
      thumbnailUrl: sv.video.thumbnail_url,
      channelOrDomain: sv.video.channel_name,
      durationOrSize: duration > 0 ? `${Math.round(duration / 60)} min` : null,
      progressPercent: sv.status === 'completed' ? 100 : null,
      status: sv.status,
      updatedAt: sv.saved_at,
    })
  }

  // 3. Saved Playlists
  for (const sp of recentPlaylists) {
    if (learningItems.length >= 6) break
    learningItems.push({
      id: sp.id,
      title: sp.playlist.title,
      type: 'playlist',
      href: `/playlists/${sp.playlist_id || sp.id}`,
      thumbnailUrl: sp.playlist.thumbnail_url,
      channelOrDomain: sp.playlist.channel_name,
      durationOrSize: `${sp.video_count} ${sp.video_count === 1 ? 'video' : 'videos'}`,
      progressPercent: null,
      status: 'saved',
      updatedAt: sp.saved_at,
    })
  }

  return {
    user: {
      id: userId,
      name: userName,
      email: userEmail || null,
      timezone,
    },
    greeting: {
      salutation,
      heading,
      subheading,
      formattedDate,
    },
    today: {
      studyMinutes: analytics.today.studyMinutes,
      pomodoroCount: analytics.today.pomodoroCount,
      formattedDuration: analytics.today.formattedDuration,
      completedTasks: analytics.today.completedTasks,
      totalTasks: analytics.today.totalTasks,
      pendingTasks: analytics.today.pendingTasks,
      taskCompletionPercentage: analytics.today.taskCompletionPercentage,
    },
    consistency: analytics.consistency,
    heatmap: analytics.heatmap,
    pendingTasks,
    recentLearning: learningItems,
    libraryCounts: {
      videos: countVideos,
      playlists: countPlaylists,
      resources: countResources,
      documents: countDocuments,
      notes: countNotes,
    },
  }
}
