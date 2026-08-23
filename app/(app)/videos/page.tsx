import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getVideosPageData } from '@/lib/data/videos'
import PageHeader from '@/components/shared/PageHeader'
import StatsPill from '@/components/shared/StatsPill'
import EmptyState from '@/components/shared/EmptyState'
import AddVideoForm from '@/components/videos/AddVideoForm'
import VideoLibrary from '@/components/videos/VideoLibrary'
import VideosSkeleton from '@/components/videos/VideosSkeleton'

export const metadata = {
  title: 'Videos | StudySpace',
  description: 'Save and organize YouTube videos for your study sessions',
}

async function VideosContent({ userId }: { userId: string }) {
  const pageData = await getVideosPageData(userId)
  const { total, inProgress, completed } = pageData.counts

  return (
    <div className="space-y-6">
      {total > 0 && (
        <div className="flex justify-end -mt-2">
          <StatsPill
            items={[
              {
                value: total,
                label: total === 1 ? 'video' : 'videos',
                highlight: true,
              },
              {
                value: inProgress,
                label: 'in progress',
              },
              {
                value: completed,
                label: 'completed',
              },
            ]}
          />
        </div>
      )}

      {/* Videos Library / Empty State */}
      {total === 0 ? (
        <EmptyState
          icon={
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          }
          title="No videos saved yet"
          description="Paste a YouTube video link above to add tutorials, lectures, or study sessions to your personal library."
          note="Supports standard YouTube links, youtu.be, and shorts"
        />
      ) : (
        <VideoLibrary pageData={pageData} />
      )}
    </div>
  )
}

export default async function VideosPage() {
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
        title="Study Videos"
        description="Collect lectures, tutorials, and educational videos in your personal study library."
      />

      {/* Add Video Form renders immediately */}
      <AddVideoForm />

      {/* Dynamic Video Library streams in */}
      <Suspense fallback={<VideosSkeleton />}>
        <VideosContent userId={user.id} />
      </Suspense>
    </div>
  )
}
