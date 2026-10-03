import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LandingMotionEffects from '@/components/landing/LandingMotionEffects'
import LandingNavbar from '@/components/landing/LandingNavbar'
import HeroSection from '@/components/landing/HeroSection'
import InfiniteFeatureMarquee from '@/components/landing/InfiniteFeatureMarquee'
import FragmentedWorkflowSection from '@/components/landing/FragmentedWorkflowSection'
import CoreFeaturesStorySection from '@/components/landing/CoreFeaturesStorySection'
import FeatureStackSection from '@/components/landing/FeatureStackSection'
import ProductShowcaseSection from '@/components/landing/ProductShowcaseSection'
import ThemeComparisonSection from '@/components/landing/ThemeComparisonSection'
import AndroidPhoneShowcaseSection from '@/components/landing/AndroidPhoneShowcaseSection'
import TestimonialsMarquee from '@/components/landing/TestimonialsMarquee'
import FAQSection from '@/components/landing/FAQSection'
import ContactSection from '@/components/landing/ContactSection'
import FinalCTA from '@/components/landing/FinalCTA'
import LandingFooter from '@/components/landing/LandingFooter'

import { fetchLatestReleaseManifest } from '@/lib/config/release'

export const metadata: Metadata = {
  title: 'StudySpace 4U — All-in-One Academic & Student Study Workspace',
  description:
    'StudySpace 4U (studyspace4u) is the all-in-one student workspace: academic attendance tracker, smart bunk calculator, AI timetable scanner, timestamped lecture notes, Pomodoro timer, and private study vaults across Web and Android.',
  keywords: [
    'studyspace',
    'studyspace4u',
    'studyspace 4u',
    'studyspace web',
    'academic workspace',
    'student planner',
    'attendance tracker',
    'bunk calculator',
    'timetable schedule scanner',
    'timestamped lecture notes',
    'pomodoro study timer',
    'academic vault',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'StudySpace 4U — All-in-One Academic & Student Study Workspace',
    description:
      'Organize your classes, calculate safe bunk allowance, watch lectures with timestamped notes, and maintain consistency with StudySpace 4U across Web and Android.',
    type: 'website',
  },
}

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  const release = await fetchLatestReleaseManifest()

  return (
    <div
      id="top"
      className="min-h-screen bg-(--color-background) text-(--color-foreground) selection:bg-violet-500 selection:text-white transition-colors"
    >
      {/* 0. Top scroll progress bar & clean ScrollTrigger refresh; Lenis init */}
      <LandingMotionEffects />

      {/* 1. Solid navbar with no blur jitter */}
      <LandingNavbar />

      <main>
        {/* 2. Hero: Line-by-line masked reveal, theme-driven interactive workspace demo, fixed side cards */}
        <HeroSection release={release} />

        {/* 3. Smooth Infinite Feature Marquee rail */}
        <InfiniteFeatureMarquee />

        {/* 4. Fragmented → Unified pinned scroll (the only pinned section on the page) */}
        <FragmentedWorkflowSection />

        {/* 5. Core Feature sandbox: tight crops of specific features (attendance, timer, notes, vault) */}
        <CoreFeaturesStorySection />

        {/* 6. Cinematic stacking cards feature sequence */}
        <FeatureStackSection />

        {/* 7. Product Showcase: Real animated components (heatmap, bunk counter, pomodoro, notes, timetable, tasks) */}
        <ProductShowcaseSection />

        {/* 8. Light/Dark drag compare slider before app section (accessible, zero gradients) */}
        <ThemeComparisonSection />

        {/* 9. Android Phone Showcase: 60% viewport observer, 3.5s hold, local tab state, scannable QR */}
        <AndroidPhoneShowcaseSection release={release} />

        {/* 10. Student Reviews: Marquee of authentic English/Hinglish student experiences */}
        <TestimonialsMarquee />

        {/* 12. Accessible FAQ accordion with YouTube ads clarification */}
        <FAQSection />

        {/* 13. Contact Section */}
        <ContactSection />

        {/* 14. Closing Statement CTA */}
        <FinalCTA release={release} />
      </main>

      {/* 15. Restrained clean footer */}
      <LandingFooter />
    </div>
  )
}
