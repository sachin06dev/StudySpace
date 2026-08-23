import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getResources } from '@/lib/data/resources'
import PageHeader from '@/components/shared/PageHeader'
import StatsPill from '@/components/shared/StatsPill'
import ResourceForm from '@/components/resources/ResourceForm'
import ResourceLibrary from '@/components/resources/ResourceLibrary'
import ResourcesSkeleton from '@/components/resources/ResourcesSkeleton'

export const metadata = {
  title: 'Resources | StudySpace',
  description: 'Save and organize study links, documentation, and references',
}

async function ResourcesContent({ userId }: { userId: string }) {
  const resources = await getResources(userId)

  return (
    <div className="space-y-6">
      {resources.length > 0 && (
        <div className="flex justify-end -mt-2">
          <StatsPill
            items={[
              {
                value: resources.length,
                label: resources.length === 1 ? 'resource' : 'resources',
                highlight: true,
              },
            ]}
          />
        </div>
      )}

      {/* Resource Library & Category Filters */}
      <ResourceLibrary resources={resources} />
    </div>
  )
}

export default async function ResourcesPage() {
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
        title="Website Resources"
        description="Save and organize documentation, courses, cheat sheets, and study links in one place."
      />

      {/* Resource Creation Form */}
      <ResourceForm />

      <Suspense fallback={<ResourcesSkeleton />}>
        <ResourcesContent userId={user.id} />
      </Suspense>
    </div>
  )
}
