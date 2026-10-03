'use client'

import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  ShieldCheck,
  CheckSquare2,
  Clock,
  Play,
  Pause,
  Plus,
  RotateCcw,
  Video,
  FileText,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'

interface SimTask {
  id: string
  title: string
  subject: string
  completed: boolean
}

export default function LivingWorkspaceSimulator() {
  // 1. Attendance state
  const [attendedClasses, setAttendedClasses] = useState(28)
  const [totalClasses, setTotalClasses] = useState(33)
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null)

  // 2. Tasks state
  const [tasks, setTasks] = useState<SimTask[]>([
    { id: '1', title: 'Submit OS Lab 4: Semaphore Implementation', subject: 'CS204', completed: false },
    { id: '2', title: 'Revise B+ Tree indexing algorithms', subject: 'CS202', completed: false },
    { id: '3', title: 'Prepare slide deck for Software Eng viva', subject: 'CS208', completed: true },
  ])

  // 3. Pomodoro timer state
  const [timerSeconds, setTimerSeconds] = useState(25 * 60)
  const [timerRunning, setTimerRunning] = useState(false)

  // 4. Video & Notes state
  const [activeNoteTimestamp, setActiveNoteTimestamp] = useState('04:12')
  const [videoSeeking, setVideoSeeking] = useState(false)

  // Attendance math
  const attendancePct = totalClasses > 0 ? ((attendedClasses / totalClasses) * 100).toFixed(1) : '0.0'
  const pctNum = parseFloat(attendancePct)
  // Safe bunk calculation: floor((attended - 0.75 * total) / 0.75)
  const safeBunks = Math.max(0, Math.floor((attendedClasses - 0.75 * totalClasses) / 0.75))

  // Pomodoro ticking effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 25 * 60))
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerRunning])

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Simulator actions
  const handleMarkPresent = () => {
    setAttendedClasses((a) => a + 1)
    setTotalClasses((t) => t + 1)
    setLastActionMessage('Marked Present! Attendance buffer increased.')
    setTimeout(() => setLastActionMessage(null), 3000)
  }

  const handleMarkAbsent = () => {
    setTotalClasses((t) => t + 1)
    setLastActionMessage('Marked Absent. Safe bunk allowance recomputed.')
    setTimeout(() => setLastActionMessage(null), 3000)
  }

  const handleAddTask = () => {
    const newTasks = [
      'Read Chapter 5: Virtual Memory Paging',
      'Download syllabus PDF from Vault',
      'Complete Discrete Mathematics proof set',
      'Review Graph Theory lecture video',
    ]
    const randomTitle = newTasks[Math.floor(Math.random() * newTasks.length)]
    setTasks((prev) => [
      { id: Date.now().toString(), title: randomTitle, subject: 'CS204', completed: false },
      ...prev,
    ])
    setLastActionMessage('New academic assignment added to priority checklist.')
    setTimeout(() => setLastActionMessage(null), 3000)
  }

  const toggleTaskCompletion = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  const handleSeekNote = (timestamp: string) => {
    setActiveNoteTimestamp(timestamp)
    setVideoSeeking(true)
    setLastActionMessage(`Video sought to timestamp ${timestamp}`)
    setTimeout(() => setVideoSeeking(false), 800)
    setTimeout(() => setLastActionMessage(null), 3000)
  }

  const handleReset = () => {
    setAttendedClasses(28)
    setTotalClasses(33)
    setTimerSeconds(25 * 60)
    setTimerRunning(false)
    setActiveNoteTimestamp('04:12')
    setTasks([
      { id: '1', title: 'Submit OS Lab 4: Semaphore Implementation', subject: 'CS204', completed: false },
      { id: '2', title: 'Revise B+ Tree indexing algorithms', subject: 'CS202', completed: false },
      { id: '3', title: 'Prepare slide deck for Software Eng viva', subject: 'CS208', completed: true },
    ])
    setLastActionMessage('Simulator reset to initial state.')
    setTimeout(() => setLastActionMessage(null), 2500)
  }

  return (
    <section id="simulator" className="py-20 md:py-28 bg-white dark:bg-zinc-950 border-b border-slate-200/80 dark:border-zinc-800/80 transition-colors scroll-mt-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-50 dark:bg-violet-950/70 border border-violet-200/70 dark:border-violet-800/70 text-xs font-semibold text-violet-700 dark:text-violet-300 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span>Interactive Living Workspace</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
            Try StudySpace right here.{' '}
            <span className="block mt-1 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 dark:from-violet-400 dark:via-purple-300 dark:to-pink-400">
              No account required.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto font-normal">
            Interact with the simulated dashboard below. Tap the control triggers on the right to mark attendance, start your Pomodoro clock, add assignments, or jump video note timestamps.
          </p>
        </div>

        {/* Live Simulator Composition (Left: Mini StudySpace UI | Right: Interactive Triggers) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
          {/* Left: Mini Simulated StudySpace Workspace Window */}
          <div className="lg:col-span-7 rounded-3xl border border-slate-300/80 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/90 shadow-2xl overflow-hidden transition-all text-left">
            {/* Window Top Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-200/80 dark:bg-zinc-950 border-b border-slate-300/60 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono font-medium text-slate-600 dark:text-zinc-400 ml-2">
                  live-simulator.studyspace.internal
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                ACTIVE SESSION
              </span>
            </div>

            {/* Notification Toast if action fired */}
            {lastActionMessage && (
              <div className="bg-violet-600 text-white text-xs px-4 py-2 font-medium flex items-center justify-between transition-all animate-in fade-in">
                <span>⚡ {lastActionMessage}</span>
                <span className="font-mono text-[10px] opacity-75">&lt;50ms local sync</span>
              </div>
            )}

            {/* Simulated Workspace Dashboard Content */}
            <div className="p-5 sm:p-6 space-y-5">
              {/* Row 1: Attendance Card & Pomodoro Timer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Attendance Bunk Calculator Card */}
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider font-mono">
                      CS204 Attendance
                    </span>
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <strong className="text-3xl font-extrabold text-slate-900 dark:text-zinc-100 font-mono">
                      {attendancePct}%
                    </strong>
                    <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
                      {attendedClasses}/{totalClasses} slots
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        pctNum >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, pctNum))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-zinc-800/80">
                    <span className="text-slate-500 dark:text-zinc-400">75% University Rule</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      Safe Bunks: {safeBunks} classes
                    </span>
                  </div>
                </div>

                {/* 2. Pomodoro Focus Timer Card */}
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider font-mono">
                      Deep Work Session
                    </span>
                    <Clock className="w-4 h-4 text-violet-500" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <strong className="text-3xl font-extrabold text-slate-900 dark:text-zinc-100 font-mono">
                      {formatTimer(timerSeconds)}
                    </strong>
                    <button
                      type="button"
                      onClick={() => setTimerRunning(!timerRunning)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                        timerRunning
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          : 'bg-violet-600 text-white hover:bg-violet-700'
                      }`}
                    >
                      {timerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                      <span>{timerRunning ? 'Pause' : 'Start'}</span>
                    </button>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-violet-600 transition-all duration-300"
                      style={{ width: `${((1500 - timerSeconds) / 1500) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-zinc-800/80">
                    <span className="text-slate-500 dark:text-zinc-400">Classic 25/5 Interval</span>
                    <span className="text-violet-600 dark:text-violet-400 font-semibold">
                      {timerRunning ? 'Session in progress...' : 'Ready to focus'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 2: Video Player & Timestamped Note Jump */}
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    <strong className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                      Operating Systems Lecture 12: Memory Management & Paging
                    </strong>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                    Lecture Hub
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-pink-500" />
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                        Pinned Definition Note: Page Fault vs. TLB Miss
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      &quot;A page fault occurs when a program tries to access memory that has not been mapped...&quot;
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSeekNote('04:12')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        activeNoteTimestamp === '04:12'
                          ? 'bg-violet-600 text-white shadow-xs'
                          : 'bg-violet-100 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300'
                      }`}
                    >
                      ▶ 04:12
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSeekNote('11:45')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        activeNoteTimestamp === '11:45'
                          ? 'bg-violet-600 text-white shadow-xs'
                          : 'bg-violet-100 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300'
                      }`}
                    >
                      ▶ 11:45
                    </button>
                  </div>
                </div>

                {videoSeeking && (
                  <div className="text-[11px] text-violet-600 dark:text-violet-400 font-mono animate-pulse">
                    Seeking player to timestamp {activeNoteTimestamp}...
                  </div>
                )}
              </div>

              {/* Row 3: Live Academic Tasks Checklist */}
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckSquare2 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    <strong className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                      Urgent Semester Checklist ({tasks.filter((t) => !t.completed).length} pending)
                    </strong>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400">Click circle to toggle</span>
                </div>

                <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTaskCompletion(task.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer select-none transition-colors ${
                        task.completed
                          ? 'bg-slate-50 dark:bg-zinc-900 border-slate-200/60 dark:border-zinc-800 text-slate-400 line-through'
                          : 'bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 hover:border-violet-400 text-slate-800 dark:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate pr-2">
                        <span
                          className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 text-[10px] ${
                            task.completed
                              ? 'bg-violet-600 border-violet-600 text-white'
                              : 'border-slate-300 dark:border-zinc-700'
                          }`}
                        >
                          {task.completed && '✓'}
                        </span>
                        <span className="truncate">{task.title}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 shrink-0">
                        {task.subject}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Interactive Control Station */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-50 dark:bg-zinc-900/70 border border-slate-200 dark:border-zinc-800 shadow-xl space-y-6 text-left">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-violet-600 dark:text-violet-400 block font-bold mb-1">
                Control Triggers
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100">
                Trigger Real Workplace Actions
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed mt-1">
                Click any action below to test the instant calculations and state changes that happen inside StudySpace.
              </p>
            </div>

            <div className="space-y-3">
              {/* Trigger 1: Mark Present */}
              <button
                type="button"
                onClick={handleMarkPresent}
                className="w-full p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-xs hover:shadow-md transition-all text-left flex items-start gap-3 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold group-hover:scale-105 transition-transform">
                  ✓
                </div>
                <div>
                  <strong className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">
                    Mark OS Class Present (+1)
                  </strong>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block leading-tight">
                    Increases attendance % and enlarges safe bunk margin.
                  </span>
                </div>
              </button>

              {/* Trigger 2: Mark Absent / Bunk */}
              <button
                type="button"
                onClick={handleMarkAbsent}
                className="w-full p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:border-rose-400 dark:hover:border-rose-500 shadow-xs hover:shadow-md transition-all text-left flex items-start gap-3 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 font-bold group-hover:scale-105 transition-transform">
                  ✕
                </div>
                <div>
                  <strong className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">
                    Mark Class Absent (Test Bunk)
                  </strong>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block leading-tight">
                    Decreases attendance % and verifies whether you stay above 75%.
                  </span>
                </div>
              </button>

              {/* Trigger 3: Add Assignment Task */}
              <button
                type="button"
                onClick={handleAddTask}
                className="w-full p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:border-violet-500 dark:hover:border-violet-500 shadow-xs hover:shadow-md transition-all text-left flex items-start gap-3 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 font-bold group-hover:scale-105 transition-transform">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">
                    + Add Academic Task
                  </strong>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block leading-tight">
                    Appends a new assignment to the urgent checklist.
                  </span>
                </div>
              </button>

              {/* Trigger 4: Toggle Pomodoro Clock */}
              <button
                type="button"
                onClick={() => setTimerRunning(!timerRunning)}
                className="w-full p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:border-violet-500 dark:hover:border-violet-500 shadow-xs hover:shadow-md transition-all text-left flex items-start gap-3 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 font-bold group-hover:scale-105 transition-transform">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">
                    {timerRunning ? 'Pause Deep Work Timer' : 'Start 25:00 Pomodoro Session'}
                  </strong>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block leading-tight">
                    Toggles the persistent ticking study interval.
                  </span>
                </div>
              </button>
            </div>

            {/* Reset & Free Signup Callout */}
            <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo State</span>
              </button>

              <Link
                href="/signup"
                className="inline-flex items-center gap-1 text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline"
              >
                <span>Get your own workspace</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
