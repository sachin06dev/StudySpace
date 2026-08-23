import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getDocuments } from '@/lib/data/documents'
import PageHeader from '@/components/shared/PageHeader'
import StatsPill from '@/components/shared/StatsPill'
import UploadDocumentForm from '@/components/documents/UploadDocumentForm'
import DocumentLibrary from '@/components/documents/DocumentLibrary'
import DocumentsSkeleton from '@/components/documents/DocumentsSkeleton'

export const metadata = {
  title: 'Documents | StudySpace',
  description: 'Upload, organize, and access your study files, PDFs, and lecture notes',
}

async function DocumentsContent({ userId }: { userId: string }) {
  const documents = await getDocuments(userId)

  return (
    <div className="space-y-6">
      {documents.length > 0 && (
        <div className="flex justify-end -mt-2">
          <StatsPill
            items={[
              {
                value: documents.length,
                label: documents.length === 1 ? 'document' : 'documents',
                highlight: true,
              },
            ]}
          />
        </div>
      )}

      {/* Document Library & Filters */}
      <DocumentLibrary documents={documents} />
    </div>
  )
}

export default async function DocumentsPage() {
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
        title="Study Documents"
        description="Store and organize PDFs, lecture slides, assignments, and notes with secure cloud storage."
      />

      {/* Upload Document Form */}
      <UploadDocumentForm />

      <Suspense fallback={<DocumentsSkeleton />}>
        <DocumentsContent userId={user.id} />
      </Suspense>
    </div>
  )
}
