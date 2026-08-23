import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ThemeProvider } from '@/components/shared/ThemeProvider'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'StudySpace — All-in-One Student Productivity & Study Workspace',
    template: '%s | StudySpace',
  },
  description:
    'A unified productivity workspace for students and lifelong learners: lecture viewing, timestamped notes, Pomodoro timer, task management, website bookmarks, private documents, and analytics.',
  applicationName: 'StudySpace',
  keywords: [
    'study workspace',
    'student productivity',
    'pomodoro timer',
    'timestamped video notes',
    'youtube study',
    'study tracker',
    'task manager',
    'student notes',
  ],
  authors: [{ name: 'StudySpace' }],
  creator: 'StudySpace',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://studyspace.vercel.app'),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'StudySpace — All-in-One Student Productivity Workspace',
    description:
      'Organize your lectures, notes, tasks, Pomodoro sessions, and documents in one seamless workspace.',
    siteName: 'StudySpace',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StudySpace — All-in-One Student Productivity Workspace',
    description:
      'Organize your lectures, notes, tasks, Pomodoro sessions, and documents in one seamless workspace.',
  },
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
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-(--color-background) text-(--color-foreground)`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  )
}
