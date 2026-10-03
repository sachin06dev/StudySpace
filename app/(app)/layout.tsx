import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import {
  getCachedUser,
  getCachedUserSettings,
  getCachedUserProfile,
  getCachedUserTimezone,
} from '@/lib/data/cachedUser'
import { resolveUserDisplayName } from '@/lib/utils/userName'
import { TimerProvider } from '@/lib/pomodoro/timerStore'
import PomodoroCompletionModal from '@/components/pomodoro/PomodoroCompletionModal'
import AppShell from '@/components/layout/AppShell'
import TimezoneSync from '@/components/shared/TimezoneSync'
import DeviceRegistration from '@/components/shared/DeviceRegistration'
import StudySpaceRealtimeProvider from '@/components/realtime/StudySpaceRealtimeProvider'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCachedUser()

  if (!user) {
    redirect('/login')
  }

  const [userSettings, profile] = await Promise.all([
    getCachedUserSettings(user.id),
    getCachedUserProfile(user.id),
  ])

  let timezone = profile?.timezone || 'UTC'
  if (!timezone || timezone === 'UTC') {
    timezone = await getCachedUserTimezone(user.id)
  }

  const userName = resolveUserDisplayName({
    profile: profile || undefined,
    userMetadata: user.user_metadata as Record<string, unknown>,
    email: user.email,
  })

  return (
    <TimerProvider initialSettings={userSettings}>
      <TimezoneSync currentTimezone={timezone} />
      <DeviceRegistration />
      <StudySpaceRealtimeProvider>
        <AppShell userEmail={user.email} userName={userName}>
          {children}
        </AppShell>
      </StudySpaceRealtimeProvider>
      <PomodoroCompletionModal />
    </TimerProvider>
  )
}

