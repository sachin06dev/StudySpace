'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import type { SubjectDistributionData } from '@/lib/data/analytics'
import { createCategoryAction } from '@/lib/actions/analytics'

export interface SubjectDistributionCardProps {
  data: SubjectDistributionData
}

export default function SubjectDistributionCard({ data }: SubjectDistributionCardProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Please enter a category name.')
      return
    }

    startTransition(async () => {
      const res = await createCategoryAction({
        name: trimmedName,
        icon: icon.trim() || null,
        description: description.trim() || null,
      })

      if (!res.success) {
        setError(res.error || 'Failed to create category.')
      } else {
        setSuccess(`Category "${trimmedName}" created successfully!`)
        setName('')
        setIcon('')
        setDescription('')
        setTimeout(() => {
          setShowCreateModal(false)
          setSuccess(null)
        }, 1500)
      }
    })
  }

  return (
    <>
      <div id="subject-distribution" className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col h-full space-y-4">
        {/* Header with Create Category Button */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏷️</span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Subject Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Categorized resources & study materials
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setError(null)
                setSuccess(null)
                setShowCreateModal(true)
              }}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 px-2.5 py-1 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>+ Category</span>
            </button>

            {data.mostStudiedSubject && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hidden sm:inline-block">
                Top: {data.mostStudiedSubject}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        {!data.hasData || data.categories.length === 0 ? (
          <div className="text-center py-6 px-4 bg-slate-50/60 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
            <div className="text-2xl">🔖</div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No subject tags yet
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Categorize your study resources and documents with subjects (e.g. DSA, Web Dev, DBMS, OS) to see your distribution.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <span>+ Create Your First Category</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Multi-segment Progress Bar with Interactive Hover */}
            <div className="w-full h-3.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex p-0.5 border border-slate-200/60 dark:border-slate-700/60">
              {data.categories.map((cat) => (
                <div
                  key={cat.name}
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor: cat.color,
                  }}
                  onMouseEnter={() => setHoveredCategory(cat.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={`h-full first:rounded-l-full last:rounded-r-full transition-all duration-300 cursor-pointer ${
                    hoveredCategory === cat.name ? 'brightness-125 scale-y-110 z-10' : ''
                  }`}
                  title={`${cat.name}: ${cat.percentage}% (${cat.count} items)`}
                />
              ))}
            </div>

            {/* Breakdown List with Direct Links to Resources */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {data.categories.map((cat) => (
                <Link
                  key={cat.name}
                  href={`/resources?category=${encodeURIComponent(cat.name.toLowerCase())}`}
                  onMouseEnter={() => setHoveredCategory(cat.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                    hoveredCategory === cat.name
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/80 shadow-xs'
                      : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.icon && <span className="text-xs">{cat.icon}</span>}
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {cat.name}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
                    {cat.percentage}% <span className="font-normal text-[11px]">({cat.count})</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Category Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏷️</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Add Study Category
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl">
                {success}
              </div>
            )}

            <form onSubmit={handleCreateCategory} className="space-y-3.5">
              <div>
                <label htmlFor="cat-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="cat-name"
                  type="text"
                  required
                  maxLength={50}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Operating Systems, Machine Learning..."
                  disabled={isPending}
                  className="w-full text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label htmlFor="cat-icon" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Icon Emoji <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  id="cat-icon"
                  type="text"
                  maxLength={5}
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="e.g. 🖥️, 🧠, ⚡"
                  disabled={isPending}
                  className="w-full text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label htmlFor="cat-desc" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  id="cat-desc"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Topics, courses, or notes under this category..."
                  disabled={isPending}
                  className="w-full text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isPending}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !name.trim()}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  {isPending ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
