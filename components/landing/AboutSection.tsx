'use client'

import Image from 'next/image'
import Link from 'next/link'
import { aboutData, type AboutData } from '@/lib/config/about'

interface AboutSectionProps {
  data?: AboutData
}

export default function AboutSection({ data = aboutData }: AboutSectionProps) {
  const { name, role, bio, image, heading, intro, socialLinks } = data

  const hasSocials =
    Boolean(socialLinks?.github) ||
    Boolean(socialLinks?.linkedin) ||
    Boolean(socialLinks?.email) ||
    Boolean(socialLinks?.instagram) ||
    Boolean(socialLinks?.portfolio) ||
    Boolean(socialLinks?.twitter)

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="py-20 md:py-28 scroll-mt-16 bg-gray-50/50 dark:bg-gray-950/40 border-t border-gray-200/60 dark:border-gray-800/60 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <span className="inline-block text-xs font-bold tracking-wider uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/60">
            {heading || 'About StudySpace'}
          </span>
          <h2
            id="about-heading"
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100"
          >
            Built for students, by a student developer
          </h2>
          {intro && (
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              {intro}
            </p>
          )}
        </div>

        {/* Creator Profile Card */}
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#0c111e] p-6 sm:p-8 md:p-10 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden">
            {/* Subtle ambient accent glow */}
            <div
              className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/10 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none"
              aria-hidden="true"
            />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Profile Image Column */}
              <div className="md:col-span-4 flex flex-col items-center">
                <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-3xl overflow-hidden border-2 border-indigo-100 dark:border-indigo-900/60 ring-4 ring-indigo-50/80 dark:ring-indigo-950/40 shadow-md bg-gray-100 dark:bg-gray-800 shrink-0">
                  <Image
                    src={image || '/profile/profile-placeholder.svg'}
                    alt={`${name} profile`}
                    fill
                    sizes="(max-width: 640px) 160px, 192px"
                    className="object-cover"
                    priority={false}
                  />
                </div>

                {/* Role Pill under image on mobile / centered */}
                <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                  <span>Creator &amp; Developer</span>
                </div>
              </div>

              {/* Profile Details Column */}
              <div className="md:col-span-8 space-y-4 text-center md:text-left">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                    {name}
                  </h3>
                  <p className="text-sm sm:text-base font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                    {role}
                  </p>
                </div>

                {/* Personal / Project Bio */}
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  {bio}
                </p>

                {/* StudySpace Mission Quote */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800/80 text-xs sm:text-sm text-gray-600 dark:text-gray-400 italic">
                  &ldquo;StudySpace is designed to eliminate fragmented study sessions by keeping lecture videos, timestamped notes, Pomodoro focus, and tasks in one calm interface.&rdquo;
                </div>

                {/* Social & External Links */}
                {hasSocials && (
                  <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                    {socialLinks?.github && (
                      <Link
                        href={socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${name} GitHub Profile`}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-xs active:scale-95 transition-all"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                          />
                        </svg>
                        <span>GitHub</span>
                      </Link>
                    )}

                    {socialLinks?.linkedin && (
                      <Link
                        href={socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${name} LinkedIn Profile`}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-xs active:scale-95 transition-all"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                        </svg>
                        <span>LinkedIn</span>
                      </Link>
                    )}

                    {socialLinks?.email && (
                      <Link
                        href={`mailto:${socialLinks.email}`}
                        aria-label={`Contact Me at ${socialLinks.email}`}
                        title={`Email: ${socialLinks.email}`}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-xs active:scale-95 transition-all"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                          />
                        </svg>
                        <span>Contact Me</span>
                      </Link>
                    )}

                    {socialLinks?.instagram && (
                      <Link
                        href={socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${name} Instagram Profile`}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-xs active:scale-95 transition-all"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                        <span>Instagram</span>
                      </Link>
                    )}

                    {socialLinks?.portfolio && (
                      <Link
                        href={socialLinks.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${name} Portfolio Website`}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-xs active:scale-95 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                        </svg>
                        <span>Portfolio</span>
                      </Link>
                    )}

                    {socialLinks?.twitter && (
                      <Link
                        href={socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${name} Twitter / X Profile`}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-xs active:scale-95 transition-all"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        <span>X / Twitter</span>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
