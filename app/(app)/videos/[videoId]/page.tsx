import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSavedVideo } from '@/lib/data/videos'
import { getNotesForVideo } from '@/lib/data/timestampNotes'
import VideoWatchView from '@/components/videos/VideoWatchView'

interface VideoDetailPageProps {
  params: Promise<{ videoId: string }>
  searchParams?: Promise<{ fromPlaylist?: string }>
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
  const fromPlaylist = resolvedSearchParams?.fromPlaylist

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

  const initialNotes = await getNotesForVideo(user.id, savedVideo.video_id)

  return (
    <VideoWatchView
      savedVideo={savedVideo}
      initialNotes={initialNotes}
      fromPlaylist={fromPlaylist}
    />
  )
}
