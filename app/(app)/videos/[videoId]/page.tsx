import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSavedVideo } from '@/lib/data/videos'
import { getNotesForVideo } from '@/lib/data/timestampNotes'
import { getPlaylistWithItems, findUserPlaylistForVideo } from '@/lib/data/playlists'
import VideoWatchView, { type PlaylistNavInfo } from '@/components/videos/VideoWatchView'

interface VideoDetailPageProps {
  params: Promise<{ videoId: string }>
  searchParams?: Promise<{ fromPlaylist?: string; t?: string }>
}

export async function generateMetadata({ params }: VideoDetailPageProps) {
  const { videoId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { title: 'Video | StudySpace' }

  const savedVideo = await getSavedVideo(user.id, videoId)
  if (!savedVideo) return { title: 'Video Not Found | StudySpace' }

  return {
    title: `${savedVideo.video.title} | StudySpace`,
    description: `Study video: ${savedVideo.video.title}`,
  }
}

export default async function VideoDetailPage({ params, searchParams }: VideoDetailPageProps) {
  const { videoId } = await params
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const initialTimestamp = resolvedSearchParams?.t
    ? parseInt(resolvedSearchParams.t, 10)
    : undefined

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const savedVideo = await getSavedVideo(user.id, videoId)

  if (!savedVideo) {
    notFound()
  }

  // Resolve playlist ID: either explicitly supplied via URL or discovered from user's playlists
  let activePlaylistId = resolvedSearchParams?.fromPlaylist
  if (!activePlaylistId) {
    activePlaylistId = (await findUserPlaylistForVideo(user.id, savedVideo.video_id)) || undefined
  }

  const [initialNotes, playlistData] = await Promise.all([
    getNotesForVideo(user.id, savedVideo.video_id),
    activePlaylistId ? getPlaylistWithItems(user.id, activePlaylistId) : Promise.resolve(null),
  ])

  let playlistNav: PlaylistNavInfo | null = null
  if (playlistData) {
    const items = playlistData.items
    const currentIndex = items.findIndex(
      (item) => item.savedVideo.id === savedVideo.id || item.video_id === savedVideo.video_id
    )
    if (currentIndex !== -1) {
      const prevItem = currentIndex > 0 ? items[currentIndex - 1] : null
      const nextItem = currentIndex < items.length - 1 ? items[currentIndex + 1] : null
      playlistNav = {
        playlistId: playlistData.playlist.id,
        playlistTitle: playlistData.playlist.title,
        currentIndex: currentIndex + 1,
        totalVideos: items.length,
        previousVideo: prevItem
          ? { id: prevItem.savedVideo.id, title: prevItem.video.title }
          : null,
        nextVideo: nextItem
          ? { id: nextItem.savedVideo.id, title: nextItem.video.title }
          : null,
      }
    }
  }

  return (
    <VideoWatchView
      key={savedVideo.id}
      savedVideo={savedVideo}
      initialNotes={initialNotes}
      fromPlaylist={activePlaylistId}
      initialTimestamp={!isNaN(initialTimestamp as number) ? initialTimestamp : undefined}
      playlistNav={playlistNav}
    />
  )
}
