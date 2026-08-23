import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserSettings } from '@/lib/data/pomodoro'
import { getUserTimezone } from '@/lib/data/analytics'
import PageHeader from '@/components/shared/PageHeader'
import SettingsView from '@/components/settings/SettingsView'

export const metadata = {
  title: 'Settings | StudySpace',
  description: 'Manage your StudySpace account preferences, default Pomodoro intervals, and profile.',
}

export default async function SettingsPage() {
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
