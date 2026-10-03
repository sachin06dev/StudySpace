'use client'

import React, { useState } from 'react'
import {
  Zap,
  Laptop,
  Smartphone,
  Monitor,
  Cloud,
  ShieldCheck,
  FileText,
  CheckSquare2,
} from 'lucide-react'

export default function RealtimeEcosystemSection() {
  const [activeSyncAction, setActiveSyncAction] = useState<'task' | 'attendance' | 'note'>('task')
  const [syncPulsing, setSyncPulsing] = useState(false)
  const [syncedCount, setSyncedCount] = useState(128)

  const triggerSync = (action: 'task' | 'attendance' | 'note') => {
    setActiveSyncAction(action)
    setSyncPulsing(true)
    setSyncedCount((c) => c + 1)
    setTimeout(() => setSyncPulsing(false), 900)
  }

  const ACTIONS = {
    task: {
      label: 'Task Completed',
      icon: CheckSquare2,
      desc: 'Checking off "OS Lab 4" on your laptop instantly removes it on your Android phone and library PC.',
      payload: '{"event": "task.completed", "id": "t-842", "title": "OS Lab 4", "sync_time": "36ms"}',
    },
    attendance: {
      label: 'Attendance Marked',
      icon: ShieldCheck,
      desc: 'Marking "CS204 Present" outside the lecture hall updates your safe bunk calculations on desktop within 40ms.',
      payload: '{"event": "attendance.logged", "status": "present", "safe_bunks": 3, "sync_time": "41ms"}',
    },
    note: {
      label: 'Note Timestamp Pinned',
      icon: FileText,
      desc: 'Typing a video note at 04:12 on desktop syncs to your mobile app for revision on your commute.',
      payload: '{"event": "note.created", "timestamp": "04:12", "topic": "Page Fault", "sync_time": "38ms"}',
    },
  }

  const currentAction = ACTIONS[activeSyncAction]

  return (
    <section id="realtime" className="py-20 md:py-28 bg-slate-50 dark:bg-zinc-950/80 border-b border-slate-200/80 dark:border-zinc-800/80 transition-colors scroll-mt-16 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-violet-600/10 dark:bg-violet-600/15 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100 dark:bg-violet-950/70 border border-violet-200/70 dark:border-violet-800/70 text-xs font-semibold text-violet-700 dark:text-violet-300 shadow-2xs font-mono">
            <Zap className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span>Real-Time Broadcast Engine • {syncedCount} Events Processed</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
            One change.{' '}
            <span className="block mt-1 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 dark:from-violet-400 dark:via-purple-300 dark:to-pink-400">
              Everywhere.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto font-normal">
            StudySpace keeps your workspace synchronized across web and mobile in real time. Never worry about conflicting spreadsheet copies or outdated attendance logs again.
          </p>
        </div>

        {/* Action Triggers Strip */}
        <div className="flex items-center justify-center gap-3 mb-10 select-none flex-wrap">
          <button
            type="button"
            onClick={() => triggerSync('task')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer border ${
              activeSyncAction === 'task'
                ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/20 scale-102'
                : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <CheckSquare2 className="w-4 h-4" />
            <span>Trigger Task Completion</span>
          </button>

          <button
            type="button"
            onClick={() => triggerSync('attendance')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer border ${
              activeSyncAction === 'attendance'
                ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/20 scale-102'
                : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Trigger Attendance Sync</span>
          </button>

          <button
            type="button"
            onClick={() => triggerSync('note')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer border ${
              activeSyncAction === 'note'
                ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/20 scale-102'
                : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Trigger Video Note Jump</span>
          </button>
        </div>

        {/* Animated Real-Time Architecture Canvas */}
        <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-8 text-center relative overflow-hidden">
          {/* Source Device: Laptop Browser A */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 text-[11px] font-bold text-violet-700 dark:text-violet-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>SOURCE DEVICE (STUDENT LAPTOP)</span>
            </div>

            <div className={`p-4 rounded-2xl border transition-all duration-300 ${
              syncPulsing
                ? 'bg-violet-600 text-white border-violet-500 shadow-lg scale-105'
                : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <Laptop className="w-5 h-5 text-violet-500" />
                <strong className="text-sm font-bold">MacBook Pro · Web Workspace</strong>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mt-0.5 font-mono">
                {currentAction.label} triggered
              </span>
            </div>
          </div>

          {/* Central Conduit: Cloud Realtime Engine */}
          <div className="relative flex flex-col items-center justify-center py-2">
            {/* Pulsing Line */}
            <div className="w-0.5 h-8 bg-gradient-to-b from-violet-600 via-purple-500 to-pink-500" />

            <div className={`my-1 p-3.5 rounded-2xl border flex items-center gap-3 transition-all duration-300 ${
              syncPulsing
                ? 'bg-purple-600 text-white border-purple-400 shadow-xl shadow-purple-500/30 scale-105'
                : 'bg-violet-50 dark:bg-violet-950/50 border-violet-200 dark:border-violet-800 text-slate-900 dark:text-zinc-100'
            }`}>
              <Cloud className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              <div className="text-left">
                <strong className="text-xs font-bold block">StudySpace Cloud Engine</strong>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                  Supabase Realtime Broadcast (Latency: ~38ms)
                </span>
              </div>
            </div>

            {/* Split Lines Downwards */}
            <div className="w-0.5 h-8 bg-gradient-to-b from-pink-500 via-purple-500 to-violet-600" />
          </div>

          {/* Target Devices: Browser B, Library PC, Android Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Destination 1 */}
            <div className={`p-4 rounded-2xl border transition-all duration-300 ${
              syncPulsing
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-900 dark:text-emerald-200 scale-102'
                : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200'
            }`}>
              <Smartphone className="w-5 h-5 text-violet-600 dark:text-violet-400 mx-auto mb-1.5" />
              <strong className="text-xs font-bold block">Android Companion</strong>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-mono">
                {syncPulsing ? 'Synced in 38ms ✓' : 'Flutter Background Sync'}
              </span>
            </div>

            {/* Destination 2 */}
            <div className={`p-4 rounded-2xl border transition-all duration-300 ${
              syncPulsing
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-900 dark:text-emerald-200 scale-102'
                : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200'
            }`}>
              <Monitor className="w-5 h-5 text-violet-600 dark:text-violet-400 mx-auto mb-1.5" />
              <strong className="text-xs font-bold block">Campus Library PC</strong>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-mono">
                {syncPulsing ? 'Updated instantly ✓' : 'Chrome Session'}
              </span>
            </div>

            {/* Destination 3 */}
            <div className={`p-4 rounded-2xl border transition-all duration-300 ${
              syncPulsing
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-900 dark:text-emerald-200 scale-102'
                : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200'
            }`}>
              <Laptop className="w-5 h-5 text-violet-600 dark:text-violet-400 mx-auto mb-1.5" />
              <strong className="text-xs font-bold block">Home Desktop</strong>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-mono">
                {syncPulsing ? 'Active & Up-to-date ✓' : 'Edge / Firefox Session'}
              </span>
            </div>
          </div>

          {/* Action Explanation Payload Box */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-left space-y-2">
            <div className="flex items-center justify-between text-xs">
              <strong className="font-mono text-slate-800 dark:text-zinc-200">
                Payload Event: {currentAction.label}
              </strong>
              <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                BROADCAST STATUS: 200 OK
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              {currentAction.desc}
            </p>
            <div className="p-2.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto">
              <code>{currentAction.payload}</code>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
