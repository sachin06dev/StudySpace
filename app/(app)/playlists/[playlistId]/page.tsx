import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPlaylistWithItems } from '@/lib/data/playlists'
import PlaylistDetailView from '@/components/playlists/PlaylistDetailView'

interface PlaylistDetailPageProps {
  params: Promise<{ playlistId: string }>
}

export async function generateMetadata({ params }: PlaylistDetailPageProps) {
  const { playlistId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { title: 'Playlist | StudySpace' }

  const data = await getPlaylistWithItems(user.id, playlistId)
  if (!data) return { title: 'Playlist Not Found | StudySpace' }

  return {
    title: `${data.playlist.title} | StudySpace`,
    description: data.playlist.description || `Study playlist: ${data.playlist.title}`,
  }
}

export default async function PlaylistDetailPage({ params }: PlaylistDetailPageProps) {
  const { playlistId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const playlistData = await getPlaylistWithItems(user.id, playlistId)

  if (!playlistData) {
    notFound()
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href="/playlists"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Playlists</span>
        </Link>
      </div>

      <PlaylistDetailView playlistData={playlistData} playlistId={playlistId} />
    </div>
  )
}
