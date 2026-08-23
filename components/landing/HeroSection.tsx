import Link from 'next/link'
import ProductPreviewMockup from './ProductPreviewMockup'

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 lg:pt-24 lg:pb-32">
      {/* Ambient background decoration */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/3 right-0 w-[400px] h-[300px] bg-purple-500/10 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start lg:items-center">
          {/* Left Column: Hero Content & CTAs (stable visual footprint) */}
          <div className="hero-content lg:col-span-6 space-y-6 text-center lg:text-left lg:min-h-[500px] flex flex-col justify-center">
            {/* Student Trust Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 shadow-2xs self-center lg:self-start">
              <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
              <span>Built for focused study sessions • Zero distractions</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 leading-[1.18] sm:leading-[1.2]">
              Learn smarter.{' '}
              <span className="block my-1 pb-2.5 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                Stay organized.
              </span>
              Make progress.
            </h1>

            {/* Supporting Message */}
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              StudySpace brings your learning resources, YouTube study sessions, notes, tasks, playlists, and progress into one focused workspace.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md hover:shadow-indigo-500/20 active:scale-95 transition-all"
              >
                <span>Get Started</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>

              <Link
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold text-sm backdrop-blur-xs transition-colors"
              >
                Explore Features
              </Link>
            </div>

            {/* Fast Value Highlights */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-gray-200/60 dark:border-gray-800/60 text-center lg:text-left">
              <div>
                <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">100%</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Distraction Free</p>
              </div>
              <div>
                <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Timestamped</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Video Notes</p>
              </div>
              <div>
                <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Unified</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Task &amp; Focus Flow</p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Styled Preview Mockup Shell */}
          <div className="interactive-session-shell lg:col-span-6 w-full">
            <ProductPreviewMockup />
          </div>
        </div>
      </div>
    </section>
  )
}
