export interface AboutSocialLinks {
  github?: string
  linkedin?: string
  instagram?: string
  portfolio?: string
  twitter?: string
  email?: string
}

export interface AboutData {
  name: string
  role: string
  bio: string
  image: string
  heading?: string
  intro?: string
  socialLinks: AboutSocialLinks
}

/**
 * Centralized About Us & Creator Configuration
 *
 * To update your profile details in the future:
 * 1. Place your profile image in `public/profile/your-photo.jpg` (or .png/.webp)
 * 2. Update `image: "/profile/your-photo.jpg"` below
 * 3. Fill in your name, role, bio, and social media handles
 */
export const aboutData: AboutData = {
  name: 'Sachin',
  role: 'B.Tech IT Student & Developer',
  bio: "I'm building StudySpace to make student learning more organized and productive by bringing learning, notes, tasks, playlists, and progress tracking into one place.",
  heading: 'About StudySpace',
  intro:
    'StudySpace is an all-in-one learning and productivity platform built to help students learn, organize, and track their progress in one place.',
  image: '/profile/sachin.webp',

  socialLinks: {
    github: 'https://github.com/sachin06dev',
    linkedin: 'https://www.linkedin.com/in/sachin06dev',
    instagram: '',
    portfolio: '',
    email: 'sachin06.dev@gmail.com',
  },
}

