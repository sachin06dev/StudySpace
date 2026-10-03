'use client'

import React from 'react'
import { Plus, MapPin, User, Edit2 } from 'lucide-react'
import type { TimetableSlotWithSubject } from '@/lib/data/timetable'

interface TimetableDayViewProps {
  dayName: string
  dayIndex: number
  slots: TimetableSlotWithSubject[]
  onAddSlot: (dayIndex: number) => void
  onEditSlot: (slot: TimetableSlotWithSubject) => void
}

const CLASS_TYPE_BADGES: Record<string, { bg: string; text: string }> = {
  theory: {
    bg: 'bg-purple-100 dark:bg-purple-950/70',
    text: 'text-purple-700 dark:text-purple-300',
  },
  lab: {
    bg: 'bg-blue-100 dark:bg-blue-950/70',
    text: 'text-blue-700 dark:text-blue-300',
  },
  tutorial: {
    bg: 'bg-amber-100 dark:bg-amber-950/70',
    text: 'text-amber-700 dark:text-amber-300',
  },
  other: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
  },
}

export function TimetableDayView({
  dayName,
  dayIndex,
  slots,
  onAddSlot,
  onEditSlot,
}: TimetableDayViewProps) {
  const formatTime = (t: string) => t.slice(0, 5)

  return (
    <div className="rounded-3xl border border-gray-200/80 dark:border-(--border-subtle) bg-white/90 dark:bg-(--surface)/90 backdrop-blur-md p-5 sm:p-6 shadow-2xs space-y-4">
      {/* Day Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-(--border-subtle)">
        <div>
          <h3 className="text-base font-black text-gray-900 dark:text-gray-100 tracking-tight">
            {dayName}&apos;s Schedule
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {slots.length} {slots.length === 1 ? 'class slot' : 'class slots'} scheduled
          </p>
        </div>

        <button
          type="button"
          onClick={() => onAddSlot(dayIndex)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Slot</span>
        </button>
      </div>

      {/* Slots Timeline List */}
      {slots.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
            No classes on {dayName}.
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
            You don&apos;t have any recurring classes configured for this day.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onAddSlot(dayIndex)}
              className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
            >
              + Add first class for {dayName}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {slots.map((slot) => {
            const classType = slot.class_type_override || slot.subject.class_type || 'theory'
            const badge = CLASS_TYPE_BADGES[classType] || CLASS_TYPE_BADGES.other
            const room = slot.room_override || slot.subject.default_room
            const faculty = slot.faculty_override || slot.subject.faculty

            return (
              <div
                key={slot.id}
                onClick={() => onEditSlot(slot)}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-gray-100 dark:border-(--border-subtle) hover:border-purple-300 dark:hover:border-purple-800 bg-gray-50/50 dark:bg-(--surface-raised)/40 hover:bg-white dark:hover:bg-(--surface-raised) transition-all cursor-pointer"
              >
                {/* Left: Time badge + Subject info */}
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="flex flex-col items-center justify-center w-16 py-2 rounded-xl bg-white dark:bg-(--surface-raised) border border-gray-200/60 dark:border-(--border-subtle) shrink-0 text-center">
                    <span className="text-xs font-black text-gray-900 dark:text-gray-100 leading-tight">
                      {formatTime(slot.start_time)}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">
                      {formatTime(slot.end_time)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {slot.subject.name}
                      </h4>
                      {slot.subject.code && (
                        <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">
                          {slot.subject.code}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 text-xs text-gray-500 dark:text-gray-400">
                      {room && (
                        <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
                          <MapPin className="w-3 h-3 text-purple-500" />
                          Room {room}
                        </span>
                      )}
                      {faculty && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-gray-400" />
                          {faculty}
                        </span>
                      )}
                      <span
                        className={`capitalize text-[10px] font-bold px-2 py-0.2 rounded-md ${badge.bg} ${badge.text}`}
                      >
                        {classType}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Edit indicator */}
                <div className="flex items-center justify-end gap-2 text-xs text-purple-600 dark:text-purple-400 font-semibold opacity-80 group-hover:opacity-100">
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Slot</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default TimetableDayView
