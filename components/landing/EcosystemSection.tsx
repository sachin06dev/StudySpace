'use client'

import React, { useState } from 'react'
import {
  Sparkles,
  BookOpen,
  Calendar,
  TrendingUp,
  Video,
  ListMusic,
  FileText,
  Clock,
  CheckSquare,
  ShieldCheck,
  FolderLock,
  Flame,
  Activity,
  ArrowRight,
} from 'lucide-react'

interface EcosystemNode {
  id: string
  name: string
  category: 'learn' | 'organize' | 'improve'
  icon: React.ElementType
  tagline: string
  impact: string
  connectedTo: string[]
}

const NODES: EcosystemNode[] = [
  // LEARN
  {
    id: 'videos',
    name: 'Lecture Videos',
    category: 'learn',
    icon: Video,
    tagline: 'Focused course playback with video-anchored notes',
    impact: 'Feeds timestamp jumps directly into Notes & logs study hours to Analytics',
    connectedTo: ['notes', 'analytics', 'pomodoro'],
  },
  {
    id: 'playlists',
    name: 'Curated Playlists',
    category: 'learn',
    icon: ListMusic,
    tagline: 'Structured subject curricula with progress tracking',
    impact: 'Organizes course video series and links with syllabus in Documents',
    connectedTo: ['videos', 'documents'],
  },
  {
    id: 'notes',
    name: 'Timestamped Notes',
    category: 'learn',
    icon: FileText,
    tagline: 'Clickable timestamp jumps anchored to video seconds',
    impact: 'Allows 1-click review of complex formulas during exam prep',
    connectedTo: ['videos', 'tasks'],
  },

  // ORGANIZE
  {
    id: 'timetable',
    name: 'AI Timetable',
    category: 'organize',
    icon: Calendar,
    tagline: 'OCR photo scanner turning routine photos into live schedules',
    impact: 'Automatically generates today’s attendance slots and class countdowns',
    connectedTo: ['attendance', 'tasks'],
  },
  {
    id: 'attendance',
    name: 'Attendance & Bunks',
    category: 'organize',
    icon: ShieldCheck,
    tagline: '1-tap Present/Absent/Cancel with safe bunk margin calculation',
    impact: 'Ensures you never fall below 75% and informs daily attendance streaks',
    connectedTo: ['timetable', 'analytics'],
  },
  {
    id: 'tasks',
    name: 'Academic Tasks',
    category: 'organize',
    icon: CheckSquare,
    tagline: 'Priority checklist categorized by subject and deadlines',
    impact: 'Connects assignments to subject exams and logs completions in real time',
    connectedTo: ['timetable', 'notes'],
  },
  {
    id: 'documents',
    name: 'Academic Vault',
    category: 'organize',
    icon: FolderLock,
    tagline: 'Encrypted private document storage for question papers and slides',
    impact: 'Keeps syllabus and past years question papers 1 tap away during study sessions',
    connectedTo: ['playlists', 'tasks'],
  },

  // IMPROVE
  {
    id: 'pomodoro',
    name: 'Pomodoro Focus',
    category: 'improve',
    icon: Clock,
    tagline: 'Persistent study intervals that survive view navigation',
    impact: 'Records completed deep work sessions directly into consistency curves',
    connectedTo: ['videos', 'analytics'],
  },
  {
    id: 'analytics',
    name: 'Analytics Engine',
    category: 'improve',
    icon: Activity,
    tagline: '365-day GitHub-style consistency heatmap and study velocity',
    impact: 'Reveals peak productivity hours and compounds motivation over semesters',
    connectedTo: ['attendance', 'pomodoro'],
  },
  {
    id: 'streaks',
    name: 'Study Streaks',
    category: 'improve',
    icon: Flame,
    tagline: 'Gamified streak tracking and milestone badge achievements',
    impact: 'Rewards daily attendance adherence and consistent deep work habits',
    connectedTo: ['analytics', 'attendance'],
  },
]

export default function EcosystemSection() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'learn' | 'organize' | 'improve'>('all')
  const [selectedNodeId, setSelectedNodeId] = useState<string>('attendance')

  const selectedNode = NODES.find((n) => n.id === selectedNodeId) || NODES[4]

  return (
    <section id="ecosystem" className="py-20 md:py-28 bg-slate-50 dark:bg-zinc-950/60 border-y border-slate-200/80 dark:border-zinc-800/80 transition-colors scroll-mt-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100 dark:bg-violet-950/70 border border-violet-200/70 dark:border-violet-800/70 text-xs font-semibold text-violet-700 dark:text-violet-300 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span>The StudySpace Ecosystem</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
            One workspace.{' '}
            <span className="block mt-1 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 dark:from-violet-400 dark:via-purple-300 dark:to-pink-400">
              Every part of studying.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto font-normal">
            Studying isn&apos;t a set of isolated chores. When you mark attendance, your bunk buffer updates. When you finish a lecture, your notes pin to video timestamps. When you focus, your streak grows.
          </p>
        </div>

        {/* Filter Pillars */}
        <div className="flex items-center justify-center gap-2 mb-10 select-none flex-wrap">
          {[
            { id: 'all', label: 'All Connected Nodes', count: 10 },
            { id: 'learn', label: 'Learn', icon: BookOpen, count: 3 },
            { id: 'organize', label: 'Organize', icon: Calendar, count: 4 },
            { id: 'improve', label: 'Improve', icon: TrendingUp, count: 3 },
          ].map((pillar) => {
            const isActive = activeCategory === pillar.id
            const Icon = pillar.icon
            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => setActiveCategory(pillar.id as 'all' | 'learn' | 'organize' | 'improve')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer border ${
                  isActive
                    ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/20 scale-102'
                    : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{pillar.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                  }`}
                >
                  {pillar.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Connected Ecosystem Grid & Ripple Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Interactive Node Map */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {NODES.filter((n) => activeCategory === 'all' || n.category === activeCategory).map((node) => {
              const Icon = node.icon
              const isSelected = selectedNodeId === node.id
              const isConnected = selectedNode.connectedTo.includes(node.id)

              let categoryBadge = 'Learn'
              let categoryColor = 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800/60'
              if (node.category === 'organize') {
                categoryBadge = 'Organize'
                categoryColor = 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/60'
              } else if (node.category === 'improve') {
                categoryBadge = 'Improve'
                categoryColor = 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60'
              }

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left select-none ${
                    isSelected
                      ? 'bg-white dark:bg-zinc-900 border-violet-500 dark:border-violet-500 shadow-xl shadow-violet-500/10 ring-2 ring-violet-500/20 scale-102'
                      : isConnected
                      ? 'bg-violet-50/50 dark:bg-violet-950/20 border-violet-300 dark:border-violet-800/60 hover:bg-violet-50 dark:hover:bg-violet-950/40'
                      : 'bg-white/80 dark:bg-zinc-900/80 border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-zinc-900'
                  }`}
                >
                  {/* Category Pill & State */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${categoryColor}`}>
                      {categoryBadge}
                    </span>
                    {isSelected && (
                      <span className="flex h-2 w-2 rounded-full bg-violet-600 animate-ping" />
                    )}
                    {!isSelected && isConnected && (
                      <span className="text-[10px] font-mono font-semibold text-violet-600 dark:text-violet-400">
                        Connected ⇄
                      </span>
                    )}
                  </div>

                  {/* Node Title & Icon */}
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-700 dark:text-zinc-200 shrink-0">
                      <Icon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <strong className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                      {node.name}
                    </strong>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                    {node.tagline}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Right: Selected Node Ecosystem Detail Card */}
          <div className="lg:col-span-4 sticky top-24 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl space-y-5 text-left">
            <div className="space-y-2 border-b border-slate-100 dark:border-zinc-800 pb-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-violet-600 dark:text-violet-400 block font-bold">
                Ecosystem Connection Spotlight
              </span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-violet-100 dark:bg-violet-950 flex items-center justify-center text-violet-600 dark:text-violet-400">
                  {React.createElement(selectedNode.icon, { className: 'w-5 h-5' })}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                    {selectedNode.name}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-zinc-400">
                    Pillar: {selectedNode.category.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 block">
                How it transforms studying:
              </span>
              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-slate-200/60 dark:border-zinc-800">
                {selectedNode.impact}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 block">
                Connected Workflows:
              </span>
              <div className="space-y-1.5">
                {selectedNode.connectedTo.map((targetId) => {
                  const target = NODES.find((n) => n.id === targetId)
                  if (!target) return null
                  const TargetIcon = target.icon
                  return (
                    <div
                      key={targetId}
                      className="p-2.5 rounded-xl bg-violet-50/60 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/40 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <TargetIcon className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                        <span className="font-semibold text-slate-800 dark:text-zinc-200">
                          {target.name}
                        </span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-violet-500" />
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block leading-tight">
                💡 Every action you take syncs across both web workspace and Android app in sub-50ms real time.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
