import type { ResolvedClass } from './resolution'

export interface AttendanceNotificationInsight {
  type: 'morning_summary' | 'next_class' | 'unmarked_reminder' | 'safe'
  title: string
  message: string
  classId?: string
  subjectName?: string
  time?: string
  urgency: 'low' | 'medium' | 'high'
}

/**
 * Computes notification foundations for today's classes based on current localized time.
 * Used by web dashboard alert card and ready for future Flutter local push notifications.
 */
export function getTodayAttendanceNotifications(
  todayClasses: ResolvedClass[],
  currentTimeStr: string // "HH:mm"
): AttendanceNotificationInsight[] {
  const insights: AttendanceNotificationInsight[] = []

  if (todayClasses.length === 0) {
    return insights
  }

  // 1. Morning Summary (general daily outlook)
  insights.push({
    type: 'morning_summary',
    title: "Today's Schedule",
    message: `You have ${todayClasses.length} ${
      todayClasses.length === 1 ? 'class' : 'classes'
    } scheduled today.`,
    urgency: 'low',
  })

  // 2. Next Upcoming Class
  const upcoming = todayClasses.find(
    (c) => c.startTime.slice(0, 5) > currentTimeStr && !c.isCancelled
  )
  if (upcoming) {
    const loc = upcoming.room ? ` in ${upcoming.room}` : ''
    insights.push({
      type: 'next_class',
      title: 'Upcoming Class',
      message: `${upcoming.subjectName} starts at ${upcoming.startTime.slice(0, 5)}${loc}.`,
      classId: upcoming.id,
      subjectName: upcoming.subjectName,
      time: upcoming.startTime.slice(0, 5),
      urgency: 'medium',
    })
  }

  // 3. Unmarked Past Class Reminder
  const unmarkedPast = todayClasses.find(
    (c) =>
      c.endTime.slice(0, 5) <= currentTimeStr &&
      !c.isCancelled &&
      c.attendanceStatus === null
  )
  if (unmarkedPast) {
    insights.push({
      type: 'unmarked_reminder',
      title: 'Attendance Reminder',
      message: `Did you attend ${unmarkedPast.subjectName} (${unmarkedPast.startTime.slice(0, 5)} - ${unmarkedPast.endTime.slice(0, 5)})?`,
      classId: unmarkedPast.id,
      subjectName: unmarkedPast.subjectName,
      time: unmarkedPast.startTime.slice(0, 5),
      urgency: 'high',
    })
  }

  return insights
}
