import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAllNotesForUser } from '@/lib/data/timestampNotes'
import PageHeader from '@/components/shared/PageHeader'
import StatsPill from '@/components/shared/StatsPill'
import NotesLibrary from '@/components/notes/NotesLibrary'
import NotesSkeleton from '@/components/notes/NotesSkeleton'

export const metadata = {
  title: 'Notes | StudySpace',
  description: 'Search, review, and jump to timestamped study notes across all your saved videos.',
}

async function NotesContent({ userId }: { userId: string }) {
  const notes = await getAllNotesForUser(userId)

  return (
    <div className="space-y-6">
      {notes.length > 0 && (
        <div className="flex justify-end -mt-2">
          <StatsPill
            items={[
              {
                value: notes.length,
                label: notes.length === 1 ? 'note' : 'notes',
                highlight: true,
              },
            ]}
          />
        </div>
      )}

      <NotesLibrary initialNotes={notes} />
    </div>
  )
}

export default async function NotesPage() {
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
        title="Study Notes"
        description="Search, review, and jump to timestamped notes captured across your video lectures and tutorials."
      />

      <Suspense fallback={<NotesSkeleton />}>
        <NotesContent userId={user.id} />
      </Suspense>
    </div>
  )
}
