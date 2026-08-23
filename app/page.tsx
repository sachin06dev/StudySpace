import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LandingNavbar from '@/components/landing/LandingNavbar'
import HeroSection from '@/components/landing/HeroSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import StudyWorkflowSection from '@/components/landing/StudyWorkflowSection'
import AboutSection from '@/components/landing/AboutSection'
import FinalCTA from '@/components/landing/FinalCTA'
import LandingFooter from '@/components/landing/LandingFooter'

export const metadata: Metadata = {
  title: 'StudySpace — Learn, Organize & Track Your Progress',
  description:
    'StudySpace is a student-focused workspace for learning videos, notes, playlists, tasks, bookmarks, and progress tracking.',
}

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div id="top" className="min-h-screen bg-(--color-background) text-(--color-foreground) selection:bg-indigo-500 selection:text-white transition-colors">
      <LandingNavbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <StudyWorkflowSection />
        <AboutSection />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  )
}
