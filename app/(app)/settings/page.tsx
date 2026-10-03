import { redirect } from 'next/navigation'
import {
  getCachedUser,
  getCachedUserSettings,
  getCachedUserTimezone,
} from '@/lib/data/cachedUser'
import PageHeader from '@/components/shared/PageHeader'
import SettingsView from '@/components/settings/SettingsView'

export const metadata = {
  title: 'Settings | StudySpace',
  description: 'Manage your StudySpace account preferences, default Pomodoro intervals, and profile.',
}

export default async function SettingsPage() {
  const user = await getCachedUser()

  if (!user) {
    redirect('/login')
  }

  const [userSettings, timezone] = await Promise.all([
    getCachedUserSettings(user.id),
    getCachedUserTimezone(user.id),
  ])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account profile, default study timer durations, and workspace preferences."
      />

      <SettingsView
        user={{
          id: user.id,
          email: user.email || null,
          createdAt: user.created_at,
        }}
        initialSettings={userSettings}
        timezone={timezone}
      />
    </div>
  )
}
