import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'StudySpace 4U: Student Productivity & Academic Workspace',
    short_name: 'StudySpace 4U',
    description:
      'A unified academic workspace for students and lifelong learners: attendance tracking, bunk calculator, AI timetable scanning, lecture viewing, timestamped notes, Pomodoro timer, tasks, and private documents.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0d0d0f',
    theme_color: '#7c3aed',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
