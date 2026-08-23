import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSavedPlaylists } from '@/lib/data/playlists'
import PageHeader from '@/components/shared/PageHeader'
import AddPlaylistForm from '@/components/playlists/AddPlaylistForm'
import PlaylistLibrary from '@/components/playlists/PlaylistLibrary'
import PlaylistsSkeleton from '@/components/playlists/PlaylistsSkeleton'

export const metadata = {
  title: 'Playlists | StudySpace',
  description: 'Organize entire YouTube course playlists and video series in your study library',
}

async function PlaylistsContent({ userId }: { userId: string }) {
  const savedPlaylists = await getSavedPlaylists(userId)

  return <PlaylistLibrary initialPlaylists={savedPlaylists} />
}

export default async function PlaylistsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Study Playlists"
        description="Import full YouTube course playlists, lecture series, and structured tutorials."
      />

      {/* Add Playlist Form */}
      <AddPlaylistForm />

      <Suspense fallback={<PlaylistsSkeleton />}>
        <PlaylistsContent userId={user.id} />
      </Suspense>
    </div>
  )
}
