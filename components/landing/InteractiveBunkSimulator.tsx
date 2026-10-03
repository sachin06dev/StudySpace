'use client'

import React, { useState } from 'react'
import { CheckCircle2, AlertTriangle, ShieldCheck, RotateCcw, Sparkles } from 'lucide-react'

export default function InteractiveBunkSimulator() {
  const [attended, setAttended] = useState(25)
  const [total, setTotal] = useState(30)
  const [targetPercent, setTargetPercent] = useState<75 | 85>(75)

  const targetRatio = targetPercent / 100
  const currentPercentage = total > 0 ? Math.round((attended / total) * 1000) / 10 : 0
  const isSafe = currentPercentage >= targetPercent

  // Safe to bunk calculation
  // (attended) / (total + x) >= targetRatio => attended >= targetRatio * total + targetRatio * x => x <= (attended - targetRatio * total) / targetRatio
  const safeToBunk = Math.max(0, Math.floor((attended - targetRatio * total) / targetRatio))

  // Recovery needed calculation
  // (attended + y) / (total + y) >= targetRatio => attended + y >= targetRatio * total + targetRatio * y => y * (1 - targetRatio) >= targetRatio * total - attended
  const neededToRecover = Math.max(0, Math.ceil((targetRatio * total - attended) / (1 - targetRatio)))

  const handleMarkPresent = () => {
    setAttended((a) => a + 1)
    setTotal((t) => t + 1)
  }

  const handleMarkAbsent = () => {
    setTotal((t) => t + 1)
  }

  const handleReset = () => {
    setAttended(25)
    setTotal(30)
  }

  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-xl transition-all">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3 text-violet-600" />
            <span>Live Interactive Simulator</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100">
            Smart Attendance & Bunk Engine
          </h3>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo</span>
        </button>
      </div>

      {/* Target Threshold Toggle */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/70 dark:border-zinc-800 mb-6">
        <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400">
          University Target Threshold:
        </span>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setTargetPercent(75)}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              targetPercent === 75
                ? 'bg-violet-600 text-white shadow-2xs'
                : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800'
            }`}
          >
            75% Rule
          </button>
          <button
            type="button"
            onClick={() => setTargetPercent(85)}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              targetPercent === 85
                ? 'bg-violet-600 text-white shadow-2xs'
                : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800'
            }`}
          >
            85% Honors
          </button>
        </div>
      </div>

      {/* Primary Status Card */}
      <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-zinc-950/80 border border-slate-200/80 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              Computer Systems & Networks (CS301)
            </span>
            <div className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              {attended} attended of {total} total lectures
            </div>
          </div>
          <div className="text-right">
            <span
              className={`text-3xl font-black font-mono tracking-tight ${
                isSafe ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400'
              }`}
            >
              {currentPercentage}%
            </span>
            <div className="text-[10px] text-slate-400 font-mono">
              Target: {targetPercent}%
            </div>
          </div>
        </div>

        {/* Progress Bar with 75% / 85% Target Pin */}
        <div className="w-full h-3 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden relative">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isSafe ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
            style={{ width: `${Math.min(100, currentPercentage)}%` }}
          />
          {/* Target marker line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10"
            style={{ left: `${targetPercent}%` }}
            title={`Minimum Target (${targetPercent}%)`}
          />
        </div>

        {/* Real-Time Mathematical Verdict */}
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs sm:text-sm font-medium ${
            isSafe
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200'
          }`}
        >
          {isSafe ? (
            <>
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>Safe Margin:</strong> You can safely bunk{' '}
                <span className="font-bold underline decoration-emerald-500 decoration-2 font-mono">
                  {safeToBunk} more {safeToBunk === 1 ? 'class' : 'classes'}
                </span>{' '}
                without dropping below {targetPercent}%.
              </span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                <strong>Action Needed:</strong> You must attend the next{' '}
                <span className="font-bold underline decoration-amber-500 decoration-2 font-mono">
                  {neededToRecover} consecutive {neededToRecover === 1 ? 'class' : 'classes'}
                </span>{' '}
                to restore safe standing!
              </span>
            </>
          )}
        </div>
      </div>

      {/* Simulator Test Action Buttons */}
      <div className="pt-5 space-y-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block text-center">
          Test Live Class Scenarios:
        </span>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleMarkPresent}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark Present (+1)</span>
          </button>
          <button
            type="button"
            onClick={handleMarkAbsent}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Mark Absent (Bunk)</span>
          </button>
        </div>
      </div>
    </div>
  )
}
