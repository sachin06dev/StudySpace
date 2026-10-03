'use client'

import React, { useState } from 'react'
import { Plus, Camera, AlertCircle } from 'lucide-react'
import type { Subject } from '@/lib/data/subjects'
import type { TimetableSlotWithSubject, TimetableException } from '@/lib/data/timetable'
import type { Semester } from '@/lib/data/semesters'
import TimetableSlotModal from './TimetableSlotModal'
import TimetableExceptionModal from './TimetableExceptionModal'
import TimetableDayView from './TimetableDayView'

const DAYS = [
  { dayIndex: 0, name: 'Monday', short: 'Mon' },
  { dayIndex: 1, name: 'Tuesday', short: 'Tue' },
  { dayIndex: 2, name: 'Wednesday', short: 'Wed' },
  { dayIndex: 3, name: 'Thursday', short: 'Thu' },
  { dayIndex: 4, name: 'Friday', short: 'Fri' },
  { dayIndex: 5, name: 'Saturday', short: 'Sat' },
  { dayIndex: 6, name: 'Sunday', short: 'Sun' },
]

const CLASS_TYPE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  theory: {
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800/60',
  },
  lab: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800/60',
  },
  tutorial: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800/60',
  },
  other: {
    bg: 'bg-slate-50 dark:bg-slate-900/40',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-800/60',
  },
}

interface TimetableGridProps {
  semester: Semester
  slots: TimetableSlotWithSubject[]
  subjects: Subject[]
  exceptions: TimetableException[]
  onOpenScanModal?: () => void
}

export default function TimetableGrid({
  semester,
  slots,
  subjects,
  exceptions,
  onOpenScanModal,
}: TimetableGridProps) {
  // Default to today's day of week: Mon=0 ... Sun=6
  const todayDayIndex = (new Date().getDay() + 6) % 7
  const [selectedDay, setSelectedDay] = useState<number>(todayDayIndex)
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false)
  const [isExceptionModalOpen, setIsExceptionModalOpen] = useState(false)
  const [editingSlot, setEditingSlot] = useState<TimetableSlotWithSubject | null>(null)
  const [targetAddDay, setTargetAddDay] = useState<number>(0)

  // Group slots by day
  const slotsByDay: Record<number, TimetableSlotWithSubject[]> = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
  }

  for (const slot of slots) {
    if (slotsByDay[slot.day_of_week]) {
      slotsByDay[slot.day_of_week].push(slot)
    }
  }

  // Sort each day's slots by start_time
  for (let d = 0; d < 7; d++) {
    slotsByDay[d].sort((a, b) => a.start_time.localeCompare(b.start_time))
  }

  const handleOpenAddSlot = (day: number) => {
    setEditingSlot(null)
    setTargetAddDay(day)
    setIsSlotModalOpen(true)
  }

  const handleOpenEditSlot = (slot: TimetableSlotWithSubject) => {
    setEditingSlot(slot)
    setTargetAddDay(slot.day_of_week)
    setIsSlotModalOpen(true)
  }

  const formatTime = (t: string) => t.slice(0, 5)

  return (
    <div className="space-y-5">
      {/* Top Action & Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 bg-white/90 dark:bg-(--surface)/90 backdrop-blur-md rounded-3xl border border-gray-200/80 dark:border-(--border-subtle) shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight">
              Weekly Timetable
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
              {semester.name}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {semester.start_date} to {semester.end_date} • {slots.length} recurring weekly slots
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenScanModal && (
            <button
              type="button"
              onClick={onOpenScanModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-xs transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Scan Timetable Photo</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExceptionModalOpen(true)}
            className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-(--surface-raised) hover:bg-gray-200 dark:hover:bg-(--surface-elevated) rounded-xl transition-colors cursor-pointer"
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>Exceptions</span>
            {exceptions.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold ml-0.5">
                {exceptions.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleOpenAddSlot(selectedDay)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Class</span>
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Day Switcher Tabs (Visible on screens < 1024px) */}
      <div className="lg:hidden space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {DAYS.map((d) => {
            const count = slotsByDay[d.dayIndex]?.length || 0
            const isSelected = selectedDay === d.dayIndex
            return (
              <button
                key={d.dayIndex}
                type="button"
                onClick={() => setSelectedDay(d.dayIndex)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white dark:bg-(--surface-raised) border border-gray-200/80 dark:border-(--border-subtle) text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                }`}
              >
                <span>{d.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 dark:bg-(--surface-elevated) text-gray-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Mobile Day View Timeline */}
        <TimetableDayView
          dayName={DAYS[selectedDay].name}
          dayIndex={selectedDay}
          slots={slotsByDay[selectedDay] || []}
          onAddSlot={handleOpenAddSlot}
          onEditSlot={handleOpenEditSlot}
        />
      </div>

      {/* Desktop 7-Column Schedule Grid (Visible on screens >= 1024px) */}
      <div className="hidden lg:grid lg:grid-cols-7 gap-3 items-start">
        {DAYS.map((day) => {
          const daySlots = slotsByDay[day.dayIndex]
          const isToday = todayDayIndex === day.dayIndex

          return (
            <div
              key={day.dayIndex}
              className={`flex flex-col rounded-3xl border ${
                isToday
                  ? 'border-purple-300 dark:border-purple-800 bg-purple-50/20 dark:bg-purple-950/10'
                  : 'border-gray-200/80 dark:border-(--border-subtle) bg-white/70 dark:bg-(--surface)/70'
              } backdrop-blur-xs p-3 space-y-3 min-h-[460px] transition-colors`}
            >
              {/* Day Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-(--border-subtle)">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs font-black tracking-tight ${
                      isToday
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {day.name}
                  </span>
                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-gray-400 px-1.5 py-0.2 rounded-full bg-gray-100 dark:bg-(--surface-raised)">
                    {daySlots.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenAddSlot(day.dayIndex)}
                    title={`Add class for ${day.name}`}
                    className="p-1 rounded-md text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Day Slot Cards */}
              {daySlots.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10 text-center opacity-40 hover:opacity-100 transition-opacity">
                  <p className="text-[11px] text-gray-400">No classes</p>
                  <button
                    type="button"
                    onClick={() => handleOpenAddSlot(day.dayIndex)}
                    className="mt-1 text-[10px] text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              ) : (
                <div className="space-y-2 flex-1">
                  {daySlots.map((slot) => {
                    const classType = slot.class_type_override || slot.subject.class_type || 'theory'
                    const style = CLASS_TYPE_STYLES[classType] || CLASS_TYPE_STYLES.other
                    const room = slot.room_override || slot.subject.default_room
                    const faculty = slot.faculty_override || slot.subject.faculty

                    return (
                      <div
                        key={slot.id}
                        onClick={() => handleOpenEditSlot(slot)}
                        className={`group p-3 rounded-2xl border ${style.border} ${style.bg} hover:shadow-xs hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer space-y-1.5`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400">
                          <span>
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                          </span>
                          <span
                            className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded ${style.text}`}
                          >
                            {classType}
                          </span>
                        </div>

                        <div className="text-xs font-bold text-gray-900 dark:text-gray-100 line-clamp-2">
                          {slot.subject.name}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 pt-0.5">
                          {room ? (
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                              Rm {room}
                            </span>
                          ) : (
                            <span />
                          )}
                          {faculty && (
                            <span className="truncate max-w-[80px]" title={faculty}>
                              {faculty}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Slot Add/Edit Modal: Conditionally mounted with specific slot key */}
      {isSlotModalOpen && (
        <TimetableSlotModal
          key={editingSlot ? `slot-edit-${editingSlot.id}` : `slot-add-${targetAddDay}`}
          isOpen={isSlotModalOpen}
          onClose={() => {
            setIsSlotModalOpen(false)
            setEditingSlot(null)
          }}
          semesterId={semester.id}
          subjects={subjects}
          editingSlot={editingSlot}
          initialDay={targetAddDay}
        />
      )}

      {/* Exception Management Modal */}
      {isExceptionModalOpen && (
        <TimetableExceptionModal
          key="exception-modal"
          isOpen={isExceptionModalOpen}
          onClose={() => setIsExceptionModalOpen(false)}
          semesterId={semester.id}
          slots={slots}
          subjects={subjects}
          existingExceptions={exceptions}
        />
      )}
    </div>
  )
}
