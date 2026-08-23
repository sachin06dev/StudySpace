import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTasks } from '@/lib/data/tasks'
import PageHeader from '@/components/shared/PageHeader'
import TaskForm from '@/components/tasks/TaskForm'
import TaskList from '@/components/tasks/TaskList'
import TasksSkeleton from '@/components/tasks/TasksSkeleton'

export const metadata = {
  title: 'Tasks | StudySpace',
  description: 'Manage and track your study tasks and assignments',
}

async function TasksContent({ userId }: { userId: string }) {
  const tasks = await getTasks(userId)

  return (
    <div className="space-y-6">
      {/* Task List with integrated optimistic state & dynamic stats pill */}
      <TaskList tasks={tasks} />
    </div>
  )
}

export default async function TasksPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Tasks"
        description="Plan, organize, and track your study goals and assignments."
      />

      {/* Task Creation Form paints immediately */}
      <TaskForm />

      <Suspense fallback={<TasksSkeleton />}>
        <TasksContent userId={user.id} />
      </Suspense>
    </div>
  )
}
