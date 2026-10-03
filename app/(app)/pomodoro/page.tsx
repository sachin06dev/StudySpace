import { redirect } from 'next/navigation'
import { getCachedUser, getCachedUserTimezone } from '@/lib/data/cachedUser'
import { getRecentSessions } from '@/lib/data/pomodoro'
import PageHeader from '@/components/shared/PageHeader'
import PomodoroTimer from '@/components/pomodoro/PomodoroTimer'
import SessionHistory from '@/components/pomodoro/SessionHistory'

export const metadata = {
  title: 'Pomodoro | StudySpace',
  description: 'Customizable Pomodoro timer and study session tracker',
}

export default async function PomodoroPage() {
  const user = await getCachedUser()

  if (!user) {
    redirect('/login')
  }

  const [sessions, timezone] = await Promise.all([
    getRecentSessions(user.id, 50),
    getCachedUserTimezone(user.id),
  ])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Pomodoro Timer"
        description="Focus deeply with interval cycles, customizable break times, and session tracking."
      />

      {/* Main Timer */}
      <PomodoroTimer />

      {/* Session History */}
      <SessionHistory sessions={sessions} timezone={timezone} />
    </div>
  )
}


