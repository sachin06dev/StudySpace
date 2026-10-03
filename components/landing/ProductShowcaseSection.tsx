'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ShieldCheck,
  Timer,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ScanLine,
  FileText,
  Flame,
  VolumeX,
} from 'lucide-react'
import { isReducedMotion } from '@/lib/animations/landing'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// 1. 365-Day Activity Heatmap Component
function ActivityHeatmapMock() {
  const [hoveredDay, setHoveredDay] = useState<{ date: string; hours: number } | null>(null)

  const weeks = useMemo(() => {
    // Deterministic pseudo-random generation to avoid server/client hydration mismatch
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed * 9301 + 49297) * 233280
      return x - Math.floor(x)
    }

    const list = []
    for (let w = 0; w < 44; w++) {
      const days = []
      for (let d = 0; d < 7; d++) {
        const seed = w * 7 + d + 73
        const rand = seededRandom(seed)
        let level = 0
        let hours = 0
        // Natural random distribution: scattered study days, exam peaks, realistic gaps
        if (rand > 0.45 && rand <= 0.72) {
          level = 1
          hours = 1.5
        } else if (rand > 0.72 && rand <= 0.88) {
          level = 2
          hours = 3.0
        } else if (rand > 0.88) {
          level = 3
          hours = 4.5
        }
        days.push({ level, hours, date: `Week ${w + 1}, Day ${d + 1}` })
      }
      list.push(days)
    }
    return list
  }, [])

  return (
    <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-left shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center font-bold">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100">
              Study Consistency Heatmap
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Logs every focus minute across your courses
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          284 Active Days
        </span>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-3">
        <div className="inline-flex gap-1.5 min-w-[420px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1.5">
              {week.map((day, di) => {
                const colorClass =
                  day.level === 3
                    ? 'bg-emerald-600 dark:bg-emerald-500'
                    : day.level === 2
                    ? 'bg-emerald-400 dark:bg-emerald-600'
                    : day.level === 1
                    ? 'bg-emerald-200 dark:bg-emerald-800/80'
                    : 'bg-slate-100 dark:bg-zinc-800'
                return (
                  <div
                    key={di}
                    onMouseEnter={() => setHoveredDay({ date: day.date, hours: day.hours })}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={`w-3 h-3 rounded-xs ${colorClass} transition-transform hover:scale-125 cursor-pointer`}
                    title={`${day.date}: ${day.hours}h`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-mono">
        <span>{hoveredDay ? `${hoveredDay.date}: ${hoveredDay.hours} hrs logged` : 'Hover squares to inspect logged study intervals'}</span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-xs bg-slate-100 dark:bg-zinc-800" />
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-200 dark:bg-emerald-800" />
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400 dark:bg-emerald-600" />
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 dark:bg-emerald-500" />
          <span>More</span>
        </div>
      </div>
    </div>
  )
}

// 2. Attendance Ring with Bunk-Buffer Counter
function AttendanceRingMock() {
  const [attended, setAttended] = useState(24)
  const [total, setTotal] = useState(28)

  const percentage = Math.round((attended / total) * 1000) / 10
  const safeBunks = Math.max(0, Math.floor(attended / 0.75 - total))
  const neededClasses = Math.max(0, Math.ceil(3 * total - 4 * attended))

  const circumference = 2 * Math.PI * 40
  const strokeDashoffset = circumference - (Math.min(100, percentage) / 100) * circumference

  return (
    <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-left shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800 flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100">
              Attendance Margin Engine
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">CS402 · Operating Systems</p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-slate-500 dark:text-zinc-400">
          Threshold: 75.0%
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
        {/* Progress Ring */}
        <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
          <svg className="w-28 h-28 -rotate-90">
            <circle
              cx="56"
              cy="56"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-100 dark:text-zinc-800"
              fill="none"
            />
            <circle
              cx="56"
              cy="56"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={percentage >= 75 ? 'text-emerald-500 transition-all duration-500' : 'text-amber-500 transition-all duration-500'}
              fill="none"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-xl font-extrabold font-mono text-slate-900 dark:text-zinc-100">
              {percentage}%
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {attended}/{total} held
            </span>
          </div>
        </div>

        {/* Live Calculation Panel */}
        <div className="space-y-2 flex-1 w-full">
          {percentage >= 75 ? (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
              <div className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                Safe to miss {safeBunks} {safeBunks === 1 ? 'class' : 'classes'}
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                Attendance stays above the mandatory 75% university requirement.
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800">
              <div className="text-sm font-bold text-amber-800 dark:text-amber-300">
                Must attend next {neededClasses} classes
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                To recover above the 75.0% threshold.
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setAttended((a) => a + 1)
                setTotal((t) => t + 1)
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 cursor-pointer"
            >
              +1 Present
            </button>
            <button
              type="button"
              onClick={() => setTotal((t) => t + 1)}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300 cursor-pointer"
            >
              +1 Absent
            </button>
            <button
              type="button"
              onClick={() => {
                setAttended(24)
                setTotal(28)
              }}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer ml-auto"
              title="Reset simulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// 3. Pomodoro Ring Component
function PomodoroRingMock() {
  const [seconds, setSeconds] = useState(1500)
  const [isRunning, setIsRunning] = useState(false)
  const session = 3

  useEffect(() => {
    if (!isRunning) return
    const id = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 1500))
    }, 1000)
    return () => clearInterval(id)
  }, [isRunning])

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`

  const circumference = 2 * Math.PI * 40
  const strokeDashoffset = circumference - ((1500 - seconds) / 1500) * circumference

  return (
    <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-left shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800 flex items-center justify-center font-bold">
            <Timer className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100">
              Pomodoro Focus Suite
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Deep work timer with ambient focus soundscapes
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-pink-600 dark:text-pink-400">
          Round {session} of 4
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
        <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
          <svg className="w-28 h-28 -rotate-90">
            <circle
              cx="56"
              cy="56"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-100 dark:text-zinc-800"
              fill="none"
            />
            <circle
              cx="56"
              cy="56"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-pink-500 transition-all duration-300"
              fill="none"
            />
          </svg>
          <div className="absolute text-center">
            <div className="text-xl font-extrabold font-mono text-slate-900 dark:text-zinc-100">
              {timeStr}
            </div>
            <span className="text-[9px] font-mono text-slate-400">
              {isRunning ? 'FOCUSING' : 'IDLE'}
            </span>
          </div>
        </div>

        <div className="space-y-2 flex-1 w-full">
          <div>
            <span className="text-sm font-bold text-slate-900 dark:text-zinc-100 block">
              DSA: Binary Search Tree Balancing
            </span>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Completed intervals log directly into your consistency heatmap.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsRunning(!isRunning)}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {isRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Focus</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRunning(false)
                setSeconds(1500)
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// 4. Timestamped Notes on a Video Timeline
function VideoTimelineNotesMock() {
  const notes = [
    {
      time: '04:15',
      seconds: 255,
      title: 'Process Control Block (PCB) & CPU Context',
      desc: 'The operating system kernel stores process state, PID, register values, and priority in the PCB. During a context switch, the OS saves state into PCB and restores the next scheduled thread.',
      keyTakeaway: 'Context switching has direct hardware overhead; keeping PCB lookups in L1 cache optimizes thread scheduling.',
    },
    {
      time: '14:32',
      seconds: 872,
      title: 'Virtual Memory & Page Table Translation',
      desc: 'Hardware MMU translates virtual page numbers to physical frames. When a page table entry is marked absent, the CPU traps to the kernel with a page fault interrupt to fetch the block from disk.',
      keyTakeaway: 'Multi-level paging reduces page table memory footprint, while TLB caching prevents a 2x memory penalty.',
    },
    {
      time: '28:50',
      seconds: 1730,
      title: 'Semaphore Wait/Signal & Mutex Synchronization',
      desc: 'Dijkstra counting semaphores use atomic wait (P) and signal (V) operations to manage shared hardware buffers and prevent race conditions between concurrent worker threads.',
      keyTakeaway: 'Always acquire resource locks in strict hierarchical order to avoid classic dining philosophers deadlocks.',
    },
  ]
  const [activeNoteIdx, setActiveNoteIdx] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const active = notes[activeNoteIdx]

  return (
    <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-left shadow-md space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800 flex items-center justify-center font-bold">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100">
              YouTube Lecture Hub &amp; Notes
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Video-anchored notes synced to real study lectures
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-[11px] font-mono text-slate-600 dark:text-zinc-300">
          <VolumeX className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
          <span>Muted by Default</span>
        </div>
      </div>

      {/* Embedded Study Video (Muted by Default) */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-slate-200 dark:border-zinc-800 shadow-inner group">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/8jLOx1hD3_o?start=${active.seconds}&autoplay=${isPlaying ? 1 : 0}&mute=1&controls=1&rel=0&modestbranding=1`}
          title="Study Lecture Video Showcase"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />

        {/* Video Overlay Control Bar */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/90 hover:bg-violet-600 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
            <span>{isPlaying ? 'Pause' : 'Play Lecture'}</span>
          </button>
          <span className="px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-xs text-[10.5px] font-mono text-zinc-300 border border-white/10">
            Current: {active.time}
          </span>
        </div>
      </div>

      {/* Timeline Scrub Bar with Markers */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
        <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-zinc-400 mb-2">
          <span className="text-violet-600 dark:text-violet-400 font-bold">{active.time}</span>
          <span>48:20 Total</span>
        </div>

        <div className="relative h-2.5 bg-slate-200 dark:bg-zinc-800 rounded-full cursor-pointer">
          <div
            className="h-full bg-violet-600 rounded-full transition-all duration-300"
            style={{ width: `${(active.seconds / (48 * 60 + 20)) * 100}%` }}
          />
          {notes.map((n, i) => {
            const leftPercent = (n.seconds / (48 * 60 + 20)) * 100
            return (
              <button
                key={n.time}
                type="button"
                onClick={() => {
                  setActiveNoteIdx(i)
                  setIsPlaying(true)
                }}
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all cursor-pointer ${
                  i === activeNoteIdx
                    ? 'bg-violet-600 border-white dark:border-zinc-900 scale-125 z-10 ring-2 ring-violet-400'
                    : 'bg-white dark:bg-zinc-400 border-violet-600 hover:scale-110'
                }`}
                style={{ left: `calc(${leftPercent}% - 8px)` }}
                title={`Jump to ${n.time} · ${n.title}`}
              />
            )
          })}
        </div>

        <div className="flex justify-between items-center pt-2 text-[10px] font-mono text-slate-400 dark:text-zinc-500">
          <span>Click any marker to seek the video</span>
          <span>Topic: Algorithms &amp; Memory</span>
        </div>
      </div>

      {/* Note Explanation Card */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 text-xs font-mono font-bold">
              {active.time}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100">
              {active.title}
            </span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase font-mono">
            Synced Note
          </span>
        </div>
        <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
          {active.desc}
        </p>
        <div className="p-2.5 rounded-xl bg-violet-50/70 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900/60 text-[11px] text-violet-900 dark:text-violet-300">
          <strong>Key Exam Takeaway:</strong> {active.keyTakeaway}
        </div>
      </div>
    </div>
  )
}

// 5. OCR Timetable Scanner Result
function TimetableScanMock() {
  const [selectedDay, setSelectedDay] = useState<'Tue' | 'Wed' | 'Thu'>('Tue')

  const schedule = {
    Tue: [
      { time: '09:00 - 10:00', code: 'CS401', name: 'Database Systems', room: 'A-204' },
      { time: '11:30 - 01:00', code: 'CS402', name: 'Operating Systems Lab', room: 'Rm 402' },
      { time: '02:00 - 03:00', code: 'CS403', name: 'Computer Networks', room: 'B-101' },
    ],
    Wed: [
      { time: '10:00 - 11:30', code: 'CS404', name: 'Algorithms Analysis', room: 'C-302' },
      { time: '01:30 - 03:00', code: 'CS405', name: 'Software Engineering', room: 'Rm 201' },
    ],
    Thu: [
      { time: '09:00 - 10:30', code: 'CS401', name: 'Database Systems Lab', room: 'Lab 3' },
      { time: '11:00 - 12:30', code: 'CS403', name: 'Computer Networks', room: 'B-101' },
      { time: '02:00 - 03:30', code: 'CS406', name: 'Machine Learning Elective', room: 'Rm 505' },
    ],
  }

  return (
    <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-left shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-bold">
            <ScanLine className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100">
              OCR Timetable Scanner
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Class schedule digitized from notice photo
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          99.4% Extraction
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        {(['Tue', 'Wed', 'Thu'] as const).map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => setSelectedDay(day)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              selectedDay === day
                ? 'bg-violet-600 text-white'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {schedule[selectedDay].map((slot) => (
          <div
            key={slot.time}
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs"
          >
            <div>
              <span className="font-bold text-slate-900 dark:text-zinc-100 block">
                {slot.name}
              </span>
              <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                {slot.code} · {slot.room}
              </span>
            </div>
            <span className="font-mono text-xs font-semibold text-violet-600 dark:text-violet-400">
              {slot.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// 6. Task List with Priority & Completion
function TaskListMock() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Submit OS Semaphore lab report', tag: 'Lab', completed: true },
    { id: 2, title: 'Solve 5 Dynamic Programming problems', tag: 'DSA', completed: false },
    { id: 3, title: 'Read Computer Networks Chapter 4', tag: 'Theory', completed: false },
    { id: 4, title: 'Review DBMS ER model diagram', tag: 'Midterm', completed: true },
  ])

  const toggle = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  const doneCount = tasks.filter((t) => t.completed).length

  return (
    <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-left shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100">
              Course Tasks &amp; Milestones
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Subject-linked assignment checklist
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
          {doneCount} / {tasks.length} Completed
        </span>
      </div>

      <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2 mb-3.5 overflow-hidden">
        <div
          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(doneCount / tasks.length) * 100}%` }}
        />
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <button
            key={task.id}
            type="button"
            onClick={() => toggle(task.id)}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
              task.completed
                ? 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-400 line-through'
                : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 hover:border-purple-400'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  task.completed
                    ? 'bg-purple-600 text-white'
                    : 'border border-slate-300 dark:border-zinc-700'
                }`}
              >
                {task.completed && '✓'}
              </span>
              <span className="truncate">{task.title}</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 shrink-0 ml-2">
              {task.tag}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// Main Product Showcase Section — Reveals components one by one as the user scrolls down
export default function ProductShowcaseSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const itemsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (!sectionRef.current || isReducedMotion()) return

    const items = itemsRef.current.filter((el): el is HTMLDivElement => el !== null)

    const ctx = gsap.context(() => {
      items.forEach((item) => {
        gsap.from(item, {
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            once: true,
          },
          y: 35,
          opacity: 0,
          duration: 0.7,
          ease: 'power2.out',
          clearProps: 'transform,opacity',
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const features = [
    {
      badge: 'CONSISTENCY ENGINE',
      title: 'Study activity heatmap across 365 days',
      desc: 'Build honest study habits that compound. Every Pomodoro focus interval and lecture note session logs automatically into an activity matrix so you can track consistency across the entire academic year.',
      component: <ActivityHeatmapMock />,
    },
    {
      badge: 'ATTENDANCE SAFEGUARD',
      title: 'Attendance ring with safe-bunk calculation',
      desc: 'Never wonder if you can afford to skip tomorrow’s lecture. The attendance engine monitors your percentage against the mandatory 75% threshold and tells you exactly how many skips remain safe.',
      component: <AttendanceRingMock />,
    },
    {
      badge: 'DEEP WORK SUITE',
      title: 'Pomodoro focus timer connected to your courses',
      desc: 'Structured 25-minute focus intervals designed for textbook reading, assignment coding, and revision. Keeps you in the zone without distraction.',
      component: <PomodoroRingMock />,
    },
    {
      badge: 'LECTURE HUB & NOTES',
      title: 'Timestamped notes pinned directly to video seconds',
      desc: 'Watch curriculum lectures in one workspace. Pin definitions, code snippets, and derivations to the exact second so clicking any note seeks the video immediately during exam prep.',
      component: <VideoTimelineNotesMock />,
    },
    {
      badge: 'COMPUTER VISION OCR',
      title: 'Digitize your college routine from a photo in seconds',
      desc: 'Snap a photo of the college routine board. StudySpace extracts classes, timings, rooms, and professors into your daily schedule countdown.',
      component: <TimetableScanMock />,
    },
    {
      badge: 'SEMESTER MILESTONES',
      title: 'Course-linked checklist and assignment tracker',
      desc: 'Stop scattering tasks across chat apps. Organize lab submissions, exam preparation, and reading chapters directly linked to each semester course.',
      component: <TaskListMock />,
    },
  ]

  return (
    <section
      id="product"
      ref={sectionRef}
      className="py-16 md:py-24 bg-slate-50/50 dark:bg-zinc-950/40 relative border-b border-slate-200 dark:border-zinc-800"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-violet-700 dark:text-violet-300">
            <span>PRODUCT SHOWCASE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
            Every core tool, crafted for your semester.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 font-normal leading-relaxed">
            Real animated components running inside StudySpace. Scroll down to explore each tool one by one.
          </p>
        </div>

        {/* 6 Features One by One as you scroll down */}
        <div className="space-y-16 sm:space-y-20">
          {features.map((feat, idx) => (
            <div
              key={feat.title}
              ref={(el) => {
                itemsRef.current[idx] = el
              }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
            >
              {/* Text Narrative */}
              <div className={`lg:col-span-5 space-y-3 text-left ${idx % 2 === 1 ? 'lg:order-2' : 'lg:order-1'}`}>
                <span className="inline-block text-[11px] font-mono font-bold tracking-wider text-violet-600 dark:text-violet-400">
                  {feat.badge}
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-100 leading-snug">
                  {feat.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed font-normal">
                  {feat.desc}
                </p>
              </div>

              {/* Interactive Mock Component */}
              <div className={`lg:col-span-7 ${idx % 2 === 1 ? 'lg:order-1' : 'lg:order-2'}`}>
                {feat.component}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
