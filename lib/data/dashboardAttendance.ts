import { getActiveSemester, type Semester } from './semesters'
import { getSubjectsBySemester } from './subjects'
import { getTimetableSlots, getTimetableExceptions } from './timetable'
import {
  getAttendanceRecordsWithSubject,
  getDefaultAttendanceTarget,
} from './attendance'
import {
  calculateSubjectAttendance,
  calculateOverallAttendance,
  type OverallAttendanceSummary,
  type SubjectAttendanceSummary,
} from '@/lib/attendance/calculations'
import { resolveClassesForDate, type ResolvedClass } from '@/lib/attendance/resolution'
import { getTodayAttendanceNotifications, type AttendanceNotificationInsight } from '@/lib/attendance/notifications'
import { getZonedDateParts } from '@/lib/analytics/dateUtils'

export interface DashboardAttendanceData {
  hasActiveSemester: boolean
  semester: Semester | null
  todayDate: string
  todayClasses: ResolvedClass[]
  overallSummary: OverallAttendanceSummary | null
  mostAtRiskSubject: SubjectAttendanceSummary | null
  nextClass: ResolvedClass | null
  notificationInsight: AttendanceNotificationInsight | null
}

/**
 * Fetch compact attendance overview for the main dashboard.
 * Designed to fail gracefully if attendance tables are empty or no semester is active.
 */
export async function getDashboardAttendanceData(
  userId: string,
  timezone: string = 'UTC'
): Promise<DashboardAttendanceData> {
  try {
    const parts = getZonedDateParts(new Date(), timezone)
    const todayDate = `${parts.year}-${parts.month.toString().padStart(2, '0')}-${parts.day
      .toString()
      .padStart(2, '0')}`
    const currentTimeStr = `${parts.hour.toString().padStart(2, '0')}:${parts.minute
      .toString()
      .padStart(2, '0')}`

    const activeSemester = await getActiveSemester(userId)
    if (!activeSemester) {
      return {
        hasActiveSemester: false,
        semester: null,
        todayDate,
        todayClasses: [],
        overallSummary: null,
        mostAtRiskSubject: null,
        nextClass: null,
        notificationInsight: null,
      }
    }

    const [subjects, slots, exceptions, records, defaultTarget] = await Promise.all([
      getSubjectsBySemester(activeSemester.id, userId),
      getTimetableSlots(activeSemester.id, userId),
      getTimetableExceptions(activeSemester.id, userId),
      getAttendanceRecordsWithSubject(activeSemester.id, userId),
      getDefaultAttendanceTarget(userId),
    ])

    // Resolve today's classes
    const todayClasses = resolveClassesForDate({
      date: todayDate,
      semester: activeSemester,
      slots,
      subjects,
      exceptions,
      records,
    })

    // Compute subject attendance summaries
    const subjectSummaries = subjects.map((sub) =>
      calculateSubjectAttendance(sub, records, defaultTarget)
    )

    // Compute overall attendance
    const overallSummary = calculateOverallAttendance(subjectSummaries, defaultTarget)

    // Find most at-risk subject (CRITICAL first, then WARNING, then lowest percentage)
    let mostAtRisk: SubjectAttendanceSummary | null = null
    for (const sub of subjectSummaries) {
      if (!mostAtRisk) {
        mostAtRisk = sub
        continue
      }
      if (sub.riskState === 'CRITICAL' && mostAtRisk.riskState !== 'CRITICAL') {
        mostAtRisk = sub
      } else if (
        sub.riskState === mostAtRisk.riskState &&
        sub.percentage < mostAtRisk.percentage
      ) {
        mostAtRisk = sub
      }
    }

    // Find next upcoming class today
    const nextClass =
      todayClasses.find(
        (c) => c.startTime.slice(0, 5) >= currentTimeStr && !c.isCancelled
      ) || null

    // Get notifications
    const notifications = getTodayAttendanceNotifications(todayClasses, currentTimeStr)
    const notificationInsight = notifications.find((n) => n.urgency === 'high') || notifications[0] || null

    return {
      hasActiveSemester: true,
      semester: activeSemester,
      todayDate,
      todayClasses,
      overallSummary,
      mostAtRiskSubject: mostAtRisk,
      nextClass,
      notificationInsight,
    }
  } catch (err) {
    console.error('Error fetching dashboard attendance data:', err)
    return {
      hasActiveSemester: false,
      semester: null,
      todayDate: '',
      todayClasses: [],
      overallSummary: null,
      mostAtRiskSubject: null,
      nextClass: null,
      notificationInsight: null,
    }
  }
}
