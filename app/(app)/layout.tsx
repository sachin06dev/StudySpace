import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserSettings } from '@/lib/data/pomodoro'
import { getUserTimezone } from '@/lib/data/analytics'
import { TimerProvider } from '@/lib/pomodoro/timerStore'
import PomodoroCompletionModal from '@/components/pomodoro/PomodoroCompletionModal'
import AppShell from '@/components/layout/AppShell'
import TimezoneSync from '@/components/shared/TimezoneSync'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [userSettings, timezone] = await Promise.all([
    getUserSettings(user.id),
    getUserTimezone(user.id),
  ])

  return (
    <TimerProvider initialSettings={userSettings}>
      <TimezoneSync currentTimezone={timezone} />
      <AppShell userEmail={user.email}>
        {children}
      </AppShell>
      <PomodoroCompletionModal />
    </TimerProvider>
  )
}


