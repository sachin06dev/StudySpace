'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { Star, Sparkles } from 'lucide-react'
import { isReducedMotion } from '@/lib/animations/landing'

export const SHOW_TESTIMONIALS = false

export interface ReviewItem {
  id: string
  initials: string
  name: string
  degree: string
  college?: string
  rating: 4 | 4.5 | 5
  text: string
  language: 'en' | 'hinglish'
}

const REVIEWS_DATA: ReviewItem[] = [
  {
    id: 'rev-1',
    initials: 'AS',
    name: 'A. Sharma',
    degree: 'B.Tech CSE, 3rd Year',
    college: 'Engineering College',
    rating: 5,
    text: 'Timetable camera scan feature legit ek minute me pura schedule feed kar diya. Pehle har semester manually routine table banani padti thi.',
    language: 'hinglish',
  },
  {
    id: 'rev-2',
    initials: 'PM',
    name: 'P. Mehta',
    degree: 'B.Tech IT, 2nd Year',
    college: 'State University',
    rating: 4.5,
    text: 'The bunk margin calculation is terrifyingly accurate. 75% attendance is strictly monitored here, so knowing exactly how many safe skips I have saved my internal marks.',
    language: 'en',
  },
  {
    id: 'rev-3',
    initials: 'RK',
    name: 'R. Kulkarni',
    degree: 'B.Tech ECE, 4th Year',
    rating: 4.5,
    text: 'Lecture note timestamps solve the biggest headache during mid-term prep. Instead of scrubbing 2-hour videos, I jump straight to the derivation markers I pinned.',
    language: 'en',
  },
  {
    id: 'rev-4',
    initials: 'SJ',
    name: 'S. Joshi',
    degree: 'B.Tech EE, 2nd Year',
    college: 'Campus Basement Lab',
    rating: 5,
    text: 'Campus basement labs me Wi-Fi bilkul nahi aata. Android companion offline timetable aur vault notes bina internet ke open kar deta hai, genuinely useful.',
    language: 'hinglish',
  },
  {
    id: 'rev-5',
    initials: 'TV',
    name: 'T. Verma',
    degree: 'BCA, 3rd Year',
    rating: 4.5,
    text: 'No social feeds or random reels trying to steal attention. Just my courses, tasks, and attendance tracker in a calm, quiet workspace.',
    language: 'en',
  },
  {
    id: 'rev-6',
    initials: 'KN',
    name: 'K. Nair',
    degree: 'B.Tech Mechanical, 3rd Year',
    rating: 4.5,
    text: 'Pomodoro timer aur 365-day consistency heatmap ne study habit bana di. Semester exams ke time syllabus tracker bahut kaam aaya.',
    language: 'hinglish',
  },
  {
    id: 'rev-7',
    initials: 'AG',
    name: 'A. Gupta',
    degree: 'B.Tech AI & DS, 3rd Year',
    college: 'Tech Institute',
    rating: 5,
    text: 'Semester tasks ko subject-wise tag karke break karna was a game changer for mid-terms. Saare pending lab reports ek jagah track hote hain.',
    language: 'hinglish',
  },
  {
    id: 'rev-8',
    initials: 'MD',
    name: 'M. Deshmukh',
    degree: 'B.Sc Data Science, 2nd Year',
    rating: 4.5,
    text: 'Study vault me lecture PDFs upload karke rakhna saves so much time. WhatsApp groups me kho jane wale notes ab clean categorized rehte hain.',
    language: 'hinglish',
  },
  {
    id: 'rev-9',
    initials: 'RS',
    name: 'R. Singh',
    degree: 'B.Tech Civil, 4th Year',
    college: 'Government Engineering College',
    rating: 5,
    text: 'Timetable me extra class ya cancelled lecture ka exception add karna itna easy hai ki attendance calculation kabhi galat nahi hoti.',
    language: 'hinglish',
  },
  {
    id: 'rev-10',
    initials: 'NP',
    name: 'N. Patel',
    degree: 'MCA, 1st Year',
    rating: 4.5,
    text: 'Daily study time graph dekh ke guilt trip nahi, genuine clarity milti hai ki kitna actually padha aur kahan time utilize ho raha hai.',
    language: 'hinglish',
  },
  {
    id: 'rev-11',
    initials: 'HB',
    name: 'H. Bhatia',
    degree: 'B.Tech Software, 3rd Year',
    rating: 5,
    text: 'Late night study sessions ke liye dark mode is super comfortable on eyes, no eye strain during long semester revision marathons.',
    language: 'en',
  },
  {
    id: 'rev-12',
    initials: 'TC',
    name: 'T. Choudhary',
    degree: 'B.Tech CSE, 2nd Year',
    college: 'University Campus',
    rating: 4.5,
    text: 'YouTube playlists ko direct StudySpace me padhne ka maza alag hai, zero recommended videos rabbit hole ya distracting sidebars.',
    language: 'hinglish',
  },
  {
    id: 'rev-13',
    initials: 'VS',
    name: 'V. Saxena',
    degree: 'B.Sc Mathematics, 3rd Year',
    rating: 4.5,
    text: 'Har subject ka alag 75% ya 85% criteria set kar sakte hain, jo university ke specific criteria aur labs ke liye perfect fit hai.',
    language: 'hinglish',
  },
  {
    id: 'rev-14',
    initials: 'PA',
    name: 'P. Agarwal',
    degree: 'B.Tech Electronics, 3rd Year',
    rating: 5,
    text: 'Home screen pe next class alert aur room number dikh jata hai, lecture hall dhundne me time waste nahi hota. Simple and dependable.',
    language: 'hinglish',
  },
]

// Stars ONLY — absolutely zero numbers (no 4.5, no 5.0)
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} stars out of 5`}>
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const isFull = rating >= starIndex
        const isHalf = !isFull && rating >= starIndex - 0.5

        return (
          <div key={starIndex} className="relative w-3.5 h-3.5 shrink-0">
            {/* Background empty star */}
            <Star className="w-3.5 h-3.5 text-slate-300 dark:text-zinc-700" />
            {/* Half star overlay */}
            {isHalf && (
              <div className="absolute inset-0 overflow-hidden w-[50%]">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              </div>
            )}
            {/* Full star overlay */}
            {isFull && (
              <div className="absolute inset-0">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ReviewCard({ item }: { item: ReviewItem }) {
  return (
    <div className="relative flex-none w-[310px] sm:w-[350px] p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs select-none flex flex-col justify-between hover:border-violet-300 dark:hover:border-zinc-700 transition-colors">
      <div>
        <div className="flex items-center justify-between mb-3">
          <StarRating rating={item.rating} />
        </div>

        <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed mb-4 line-clamp-4">
          &ldquo;{item.text}&rdquo;
        </p>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar fixed 40px, shrink-0, rounded-full, overflow-hidden, initials cleanly centered */}
          <div className="w-10 h-10 shrink-0 rounded-full overflow-hidden bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 font-mono font-bold text-xs flex items-center justify-center border border-violet-200 dark:border-violet-800">
            {item.initials}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
              {item.name}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
              {item.degree}
            </div>
          </div>
        </div>

        {item.college && (
          <span className="text-[10px] text-slate-400 dark:text-zinc-500 truncate max-w-[90px] text-right shrink-0">
            {item.college}
          </span>
        )}
      </div>
    </div>
  )
}

export default function TestimonialsMarquee() {
  const trackARef = useRef<HTMLDivElement>(null)
  const trackBRef = useRef<HTMLDivElement>(null)

  const rowA = REVIEWS_DATA.filter((_, idx) => idx % 2 === 0)
  const rowB = REVIEWS_DATA.filter((_, idx) => idx % 2 !== 0)

  useEffect(() => {
    if (!SHOW_TESTIMONIALS || isReducedMotion()) return

    const trackA = trackARef.current
    const trackB = trackBRef.current
    if (!trackA) return

    // Exact -50% translation over 2 duplicated arrays produces 100% seamless infinite loop
    const tweenA = gsap.to(trackA, {
      xPercent: -50,
      duration: 44,
      ease: 'none',
      repeat: -1,
    })

    let tweenB: gsap.core.Tween | null = null
    if (trackB) {
      gsap.set(trackB, { xPercent: -50 })
      tweenB = gsap.to(trackB, {
        xPercent: 0,
        duration: 44,
        ease: 'none',
        repeat: -1,
      })
    }

    const slowDownA = () => gsap.to(tweenA, { timeScale: 0.15, duration: 0.6, ease: 'power2.out' })
    const speedUpA = () => gsap.to(tweenA, { timeScale: 1, duration: 0.6, ease: 'power2.out' })

    const slowDownB = () => tweenB && gsap.to(tweenB, { timeScale: 0.15, duration: 0.6, ease: 'power2.out' })
    const speedUpB = () => tweenB && gsap.to(tweenB, { timeScale: 1, duration: 0.6, ease: 'power2.out' })

    const parentA = trackA.parentElement
    const parentB = trackB?.parentElement

    parentA?.addEventListener('mouseenter', slowDownA)
    parentA?.addEventListener('mouseleave', speedUpA)
    parentB?.addEventListener('mouseenter', slowDownB)
    parentB?.addEventListener('mouseleave', speedUpB)

    return () => {
      tweenA.kill()
      tweenB?.kill()
      parentA?.removeEventListener('mouseenter', slowDownA)
      parentA?.removeEventListener('mouseleave', speedUpA)
      parentB?.removeEventListener('mouseenter', slowDownB)
      parentB?.removeEventListener('mouseleave', speedUpB)
    }
  }, [])

  if (!SHOW_TESTIMONIALS) return null

  return (
    <section
      id="reviews"
      className="py-16 md:py-24 bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 transition-colors overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-violet-700 dark:text-violet-300">
          <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
          <span>Student Experiences</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
          Built for how students actually study.
        </h2>

        <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 font-normal leading-relaxed max-w-2xl mx-auto">
          Hear from university students managing routines, attendance buffers, and semester notes on StudySpace.
        </p>
      </div>

      {/* Marquee with seamless infinite loop (exactly 2 duplicated sets) */}
      <div className="space-y-4">
        <div className="overflow-hidden">
          <div ref={trackARef} className="flex gap-4 w-max will-change-transform py-2 px-4">
            {[...rowA, ...rowA].map((item, idx) => (
              <ReviewCard key={`a-${item.id}-${idx}`} item={item} />
            ))}
          </div>
        </div>

        <div className="hidden sm:block overflow-hidden">
          <div ref={trackBRef} className="flex gap-4 w-max will-change-transform py-2 px-4">
            {[...rowB, ...rowB].map((item, idx) => (
              <ReviewCard key={`b-${item.id}-${idx}`} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
