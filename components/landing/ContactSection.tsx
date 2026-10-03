'use client'

import React, { useState } from 'react'
import { Mail, Copy, Check, Send, MessageSquare } from 'lucide-react'

export default function ContactSection() {
  const emailAddress = 'studyspace2u@gmail.com'
  const [copied, setCopied] = useState(false)
  const [name, setName] = useState('')
  const [topic, setTopic] = useState('Feedback')
  const [message, setMessage] = useState('')

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(emailAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent(`[StudySpace ${topic}] from ${name || 'Student'}`)
    const body = encodeURIComponent(
      `Hi StudySpace Team,\n\n${message}\n\nFrom: ${name || 'A Student'}\nTopic: ${topic}`
    )
    window.location.href = `mailto:${emailAddress}?subject=${subject}&body=${body}`
  }

  return (
    <section
      id="contact"
      className="py-20 md:py-28 bg-white dark:bg-zinc-950 border-b border-slate-200/80 dark:border-zinc-800/80 transition-colors scroll-mt-16"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-zinc-900 border border-violet-200/70 dark:border-zinc-800 text-xs font-semibold text-violet-700 dark:text-violet-300">
            <Mail className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span>Get in Touch</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
            Have questions or ideas?{' '}
            <span className="text-violet-600 dark:text-violet-400">
              Talk to us.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed">
            Whether you found a bug, want to request an academic feature, or need help setting up your semester schedule — we read every message.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Email Card */}
          <div className="md:col-span-5 p-6 sm:p-7 rounded-3xl bg-slate-50/80 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 space-y-5">
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-semibold block">
                Direct Contact
              </span>
              <strong className="text-lg font-bold text-slate-900 dark:text-zinc-100 block">
                Email the developer directly
              </strong>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                No tickets, chatbots, or automated call queues. Messages go directly to our student developer inbox.
              </p>
            </div>

            {/* Email Address Pill */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-zinc-900 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-medium text-slate-900 dark:text-zinc-100 truncate">
                  {emailAddress}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-violet-400 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                title="Copy email to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Mailto Action */}
            <a
              href={`mailto:${emailAddress}?subject=${encodeURIComponent('[StudySpace Inquiry] Hello')}`}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs shadow-xs hover:shadow-violet-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Email from Default App</span>
            </a>

            <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800/60 space-y-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
              <p>✓ All student feedback reviewed personally</p>
              <p>✓ Bug fixes prioritized in weekly updates</p>
            </div>
          </div>

          {/* Right Column: Pre-filled Mail Client Launch Form */}
          <form
            onSubmit={handleSubmit}
            className="md:col-span-7 p-6 sm:p-7 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-4 shadow-xs"
          >
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800 text-xs font-bold text-slate-900 dark:text-zinc-100">
              <MessageSquare className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span>Compose Quick Message</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-left">
                <label htmlFor="contact-name" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Your Name or College
                </label>
                <input
                  id="contact-name"
                  type="text"
                  placeholder="e.g. Rahul, B.Tech 3rd yr"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label htmlFor="contact-topic" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Topic
                </label>
                <select
                  id="contact-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-violet-500 cursor-pointer"
                >
                  <option value="Feature Request">Feature Request</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="Feedback">Feedback / Review</option>
                  <option value="Timetable Scan Help">Timetable Scan Help</option>
                  <option value="General Question">General Question</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label htmlFor="contact-message" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="contact-message"
                required
                rows={4}
                placeholder="What can we help you with? Any suggestions to make your semester smoother..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs shadow-md hover:shadow-violet-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Launch Mail Client with Prefilled Details</span>
            </button>

            <p className="text-[11px] text-slate-400 dark:text-zinc-500 text-center font-mono">
              Opens your preferred email client (Gmail, Outlook, Mail app) ready to send.
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
