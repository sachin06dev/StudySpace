import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://studyspace4u.vercel.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/login',
          '/signup',
          '/privacy',
          '/terms',
          '/delete-account',
          '/manifest.webmanifest',
          '/favicon.ico',
          '/icon.png',
          '/apple-icon.png',
        ],
        disallow: [
          '/api/',
          '/auth/',
          '/dashboard',
          '/dashboard/',
          '/attendance',
          '/attendance/',
          '/timetable',
          '/timetable/',
          '/tasks',
          '/tasks/',
          '/pomodoro',
          '/pomodoro/',
          '/videos',
          '/videos/',
          '/playlists',
          '/playlists/',
          '/notes',
          '/notes/',
          '/resources',
          '/resources/',
          '/documents',
          '/documents/',
          '/analytics',
          '/analytics/',
          '/settings',
          '/settings/',
          '/study',
          '/study/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
