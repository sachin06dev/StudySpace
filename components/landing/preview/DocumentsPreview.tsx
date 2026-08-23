'use client'

import React, { useState } from 'react'
import { PREVIEW_DOCUMENTS, type PreviewDocument } from './previewDemoData'

export default function DocumentsPreview() {
  const [documents] = useState<PreviewDocument[]>(PREVIEW_DOCUMENTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [activePreviewDoc, setActivePreviewDoc] = useState<PreviewDocument | null>(null)

  const categories = ['all', 'Notes', 'Reference', 'College']

  const filteredDocs = documents.filter((doc) => {
    const matchesCategory =
      selectedCategory === 'all' || doc.category.toLowerCase() === selectedCategory.toLowerCase()
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="p-3 sm:p-4 md:p-5 space-y-3.5 text-xs select-none">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100 dark:border-gray-800 min-w-0">
        <div className="min-w-0">
          <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 dark:text-gray-100 truncate">
            Study Documents &amp; Handouts
          </h3>
          <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            Organize lecture PDFs, exam PYQs, and revision cheatsheets in one vault.
          </p>
        </div>

        {/* Live Search */}
        <div className="relative w-full sm:w-52 shrink-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search PDF or subject..."
            className="w-full bg-white dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 text-xs border border-gray-200/80 dark:border-gray-700/80 rounded-xl pl-7 pr-3 py-1.5 focus:outline-hidden focus:border-indigo-500"
          />
          <span className="absolute left-2.5 top-1.5 text-gray-400 text-[10px]">🔍</span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold capitalize transition-colors cursor-pointer shrink-0 ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {cat === 'all' ? 'All Documents' : cat}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 max-h-[280px] overflow-y-auto pr-1">
        {filteredDocs.map((doc) => {
          return (
            <div
              key={doc.id}
              onClick={() => setActivePreviewDoc(doc)}
              className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 hover:border-indigo-300 dark:hover:border-indigo-600 shadow-2xs transition-all flex flex-col justify-between cursor-pointer group min-w-0"
            >
              <div>
                {/* Top Row: File Icon, Category Badge */}
                <div className="flex items-center justify-between gap-1.5 mb-2 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 font-bold text-[9px] sm:text-[10px] flex items-center justify-center border border-red-200/80 dark:border-red-800/80 shrink-0">
                      {doc.fileType.toUpperCase()}
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-medium text-gray-400 truncate">
                      {doc.fileSize}
                    </span>
                  </div>

                  <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[8px] sm:text-[9px] font-bold border border-indigo-200/60 dark:border-indigo-800/60 shrink-0">
                    {doc.category}
                  </span>
                </div>

                {/* Title */}
                <h4 className="font-bold text-gray-900 dark:text-gray-100 text-[11px] sm:text-xs line-clamp-1 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {doc.title}
                </h4>

                {/* Summary Preview */}
                <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                  {doc.summary}
                </p>
              </div>

              {/* Bottom Footer: Date & Preview Action */}
              <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[9px] sm:text-[10px] text-gray-400">
                <span className="truncate">Uploaded {doc.uploadedDate}</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold group-hover:underline shrink-0 ml-1">
                  Quick View →
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Simulated Document Preview Modal */}
      {activePreviewDoc && (
        <div className="p-3 sm:p-3.5 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 space-y-2 animate-in fade-in-50">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base shrink-0">📄</span>
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-indigo-950 dark:text-indigo-100 truncate">
                  {activePreviewDoc.title}
                </h4>
                <p className="text-[9px] sm:text-[10px] text-indigo-700 dark:text-indigo-300 truncate">
                  {activePreviewDoc.fileSize} • {activePreviewDoc.pageCount} pages • {activePreviewDoc.category}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActivePreviewDoc(null)}
              className="text-[10px] sm:text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:text-indigo-950 dark:hover:text-white px-2 py-1 bg-white/60 dark:bg-indigo-900/60 rounded-lg cursor-pointer shrink-0"
            >
              Close
            </button>
          </div>
          <p className="text-[10px] sm:text-[11px] text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-900/60 p-2 sm:p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/60 leading-relaxed">
            {activePreviewDoc.summary}
          </p>
        </div>
      )}
    </div>
  )
}
