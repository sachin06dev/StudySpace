import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ThemeProvider } from '@/components/shared/ThemeProvider'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://studyspace4u.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'StudySpace 4U — All-in-One Academic & Student Study Workspace',
    template: '%s | StudySpace 4U',
  },
  description:
    'StudySpace 4U (studyspace4u) is the all-in-one student workspace: academic attendance tracker, smart bunk calculator, AI timetable scanner, YouTube lecture notes, Pomodoro timer, and private study vaults.',
  applicationName: 'StudySpace 4U',
  keywords: [
    'studyspace',
    'studyspace4u',
    'studyspace 4u',
    'study space',
    'studyspace nextjs',
    'academic workspace',
    'attendance tracker',
    'bunk calculator',
    'timetable schedule scanner',
    'student productivity',
    'pomodoro study timer',
    'timestamped video notes',
    'youtube lecture notes',
    'study tracker',
    'task manager',
    'student notes',
  ],
  authors: [{ name: 'StudySpace 4U Team', url: siteUrl }],
  creator: 'StudySpace 4U',
  publisher: 'StudySpace 4U',
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'google2b5d0d07a1a7a963',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    title: 'StudySpace 4U — All-in-One Academic & Student Study Workspace',
    description:
      'Organize your classes, calculate safe bunk allowance, watch lectures with timestamped notes, and maintain consistency with StudySpace 4U.',
    siteName: 'StudySpace 4U',
    images: [
      {
        url: '/StudySpace.png',
        width: 1200,
        height: 630,
        alt: 'StudySpace 4U Academic Workspace Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StudySpace 4U — All-in-One Academic & Student Study Workspace',
    description:
      'Organize your classes, calculate safe bunk allowance, watch lectures with timestamped notes, and maintain consistency with StudySpace 4U.',
    images: ['/StudySpace.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'StudySpace 4U',
      alternateName: ['studyspace4u', 'StudySpace', 'StudySpace4U'],
      description:
        'All-in-one student productivity and study workspace: attendance tracking, bunk calculator, AI timetable scanner, video timestamp notes, Pomodoro focus timer, and academic vaults.',
      inLanguage: 'en-US',
      publisher: {
        '@id': `${siteUrl}/#organization`,
      },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${siteUrl}/#application`,
      name: 'StudySpace 4U',
      alternateName: ['studyspace4u', 'StudySpace'],
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web, Android',
      url: siteUrl,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'Attendance Tracking with Bunk and Recovery Calculator',
        'AI Timetable Scanner',
        'Distraction-Free YouTube Lecture Hub with Timestamped Notes',
        'Persistent Pomodoro Focus Suite with Ambient Sounds',
        'Offline-First Android Client with Instant Synchronization',
        '365-Day Activity Heatmap and Consistency Analytics',
      ],
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'StudySpace 4U',
      alternateName: ['StudySpace', 'studyspace4u'],
      url: siteUrl,
      logo: `${siteUrl}/icon-512.png`,
      sameAs: [
        'https://github.com/sachin06dev/studyspace_nextjs',
      ],
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://i.ytimg.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
        <link rel="preconnect" href="https://img.youtube.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://img.youtube.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} antialiased min-h-screen bg-(--canvas) text-(--text-primary)`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  )
}
