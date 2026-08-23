'use client'

import React, { useState } from 'react'
import { PREVIEW_PLAYLISTS, type PreviewPlaylist, type PreviewSection } from './previewDemoData'

interface PlaylistsPreviewProps {
  onNavigate: (section: PreviewSection) => void
}

export default function PlaylistsPreview({ onNavigate }: PlaylistsPreviewProps) {
  const [playlists] = useState<PreviewPlaylist[]>(PREVIEW_PLAYLISTS)
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>(PREVIEW_PLAYLISTS[0].id)
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all')

  const selectedPlaylist =
    playlists.find((p) => p.id === selectedPlaylistId) || playlists[0]

  const filteredPlaylists = playlists.filter((p) => {
    const isCompleted = p.completedCount === p.videoCount
    if (filter === 'in_progress') return !isCompleted
    if (filter === 'completed') return isCompleted
    return true
  })

  return (
    <div className="p-3 sm:p-4 md:p-5 space-y-3.5 text-xs select-none">
      {/* Top Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100 dark:border-gray-800 min-w-0">
        <div className="min-w-0">
          <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 dark:text-gray-100 truncate">
            Study Playlists &amp; Courses
          </h3>
          <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            Track structured curriculums, lesson progress, and video collections.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/80 p-1 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            All ({playlists.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('in_progress')}
            className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
              filter === 'in_progress'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            In Progress (4)
          </button>
        </div>
      </div>

      {/* Main Grid: Playlist Cards Grid on Left, Selected Playlist Detail Drawer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5 items-start">
        {/* Left: Playlist Cards (7 columns on lg+) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 min-w-0">
          {filteredPlaylists.map((pl) => {
            const isSelected = selectedPlaylistId === pl.id
            const percent = Math.round((pl.completedCount / pl.videoCount) * 100)
            return (
              <div
                key={pl.id}
                onClick={() => setSelectedPlaylistId(pl.id)}
                className={`p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-w-0 ${
                  isSelected
                    ? 'bg-indigo-50/60 dark:bg-indigo-950/50 border-indigo-400 dark:border-indigo-600 shadow-sm ring-1 ring-indigo-400'
                    : 'bg-white dark:bg-gray-800/90 border-gray-200/80 dark:border-gray-700/80 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5 min-w-0">
                    <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[8px] sm:text-[9px] font-bold border border-purple-200/60 dark:border-purple-800/60 shrink-0">
                      {pl.category}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-gray-500 font-mono shrink-0">
                      {pl.videoCount} vids
                    </span>
                  </div>

                  <h4 className="font-bold text-gray-900 dark:text-gray-100 text-[11px] sm:text-xs line-clamp-2 leading-snug">
                    {pl.title}
                  </h4>
                  <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5 truncate">{pl.channelName}</p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800/80 space-y-1">
                  <div className="flex justify-between text-[9px] sm:text-[10px] text-gray-500">
                    <span>
                      {pl.completedCount}/{pl.videoCount} watched
                    </span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {percent}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Right: Selected Playlist Detail Drawer (5 columns on lg+) */}
        <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/70 p-3 sm:p-3.5 space-y-2.5 shadow-2xs min-w-0">
          <div>
            <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 dark:border-gray-800 min-w-0">
              <span className="text-[9px] sm:text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Curriculum Details
              </span>
              <span className="text-[9px] sm:text-[10px] text-gray-400 shrink-0">{selectedPlaylist.videoCount} lectures</span>
            </div>

            <h4 className="font-bold text-gray-900 dark:text-gray-100 text-[11px] sm:text-xs mt-1.5 leading-snug truncate">
              {selectedPlaylist.title}
            </h4>
            <p className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
              {selectedPlaylist.description}
            </p>

            {/* Lesson Items */}
            <div className="mt-2.5 space-y-1.5">
              <span className="text-[9px] sm:text-[10px] font-semibold text-gray-400 block mb-1">
                Lessons in Course:
              </span>
              {selectedPlaylist.items.map((item, idx) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1.5 p-1.5 sm:p-2 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 text-[9px] sm:text-[10px] min-w-0"
                >
                  <span
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded flex items-center justify-center text-[8px] sm:text-[9px] font-bold shrink-0 ${
                      item.completed
                        ? 'bg-emerald-500 text-white'
                        : 'border border-indigo-400 text-indigo-600 dark:text-indigo-400'
                    }`}
                  >
                    {item.completed ? '✓' : idx + 1}
                  </span>
                  <span className="truncate text-gray-800 dark:text-gray-200 font-medium">
                    {item.title}
                  </span>
                  <span className="text-gray-400 font-mono shrink-0 text-[8px] sm:text-[9px]">{item.duration}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('videos')}
            className="w-full py-1.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[10px] sm:text-xs rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Continue Watching</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  )
}
