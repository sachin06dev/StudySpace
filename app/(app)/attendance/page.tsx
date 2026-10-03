import { redirect } from 'next/navigation'
import { getCachedUser, getCachedUserTimezone } from '@/lib/data/cachedUser'
import { getSemesters } from '@/lib/data/semesters'
import { getSubjectsBySemester } from '@/lib/data/subjects'
import {
  getTimetableSlots,
  getTimetableExceptions,
} from '@/lib/data/timetable'
import {
  getAttendanceRecordsWithSubject,
  getDefaultAttendanceTarget,
} from '@/lib/data/attendance'
import {
  calculateSubjectAttendance,
  calculateOverallAttendance,
  type SubjectAttendanceSummary,
  type OverallAttendanceSummary,
} from '@/lib/attendance/calculations'
import { resolveClassesForDate, type ResolvedClass } from '@/lib/attendance/resolution'
import { getZonedDateParts } from '@/lib/analytics/dateUtils'
import AttendanceClientView from '@/components/attendance/AttendanceClientView'

export const metadata = {
  title: 'Attendance | StudySpace',
  description: 'Track your class attendance, safe bunk allowances, and recovery status.',
}

export default async function AttendancePage() {
  const user = await getCachedUser()

  if (!user) {
    redirect('/login')
  }

  // Timezone & local date (request-memoized)
  const timezone = await getCachedUserTimezone(user.id)
  const parts = getZonedDateParts(new Date(), timezone)
  const todayDate = `${parts.year}-${parts.month.toString().padStart(2, '0')}-${parts.day
    .toString()
    .padStart(2, '0')}`

  const [semesters, defaultTarget] = await Promise.all([
    getSemesters(user.id),
    getDefaultAttendanceTarget(user.id),
  ])
  const activeSemester = semesters.find((s) => s.is_active) || null

  let todayClasses: ResolvedClass[] = []
  let subjectSummaries: SubjectAttendanceSummary[] = []
  let overallSummary: OverallAttendanceSummary | null = null
  let records: Awaited<ReturnType<typeof getAttendanceRecordsWithSubject>> = []
  let subjects: Awaited<ReturnType<typeof getSubjectsBySemester>> = []
  let slots: Awaited<ReturnType<typeof getTimetableSlots>> = []
  let exceptions: Awaited<ReturnType<typeof getTimetableExceptions>> = []

  if (activeSemester) {
    const [subjectsData, slotsData, exceptionsData, recordsData] = await Promise.all([
      getSubjectsBySemester(activeSemester.id, user.id),
      getTimetableSlots(activeSemester.id, user.id),
      getTimetableExceptions(activeSemester.id, user.id),
      getAttendanceRecordsWithSubject(activeSemester.id, user.id),
    ])

    subjects = subjectsData
    records = recordsData
    slots = slotsData
    exceptions = exceptionsData

    // 1. Resolve classes for today
    todayClasses = resolveClassesForDate({
      date: todayDate,
      semester: activeSemester,
      slots: slotsData,
      subjects: subjectsData,
      exceptions: exceptionsData,
      records: recordsData,
    })

    // 2. Compute attendance metrics for each subject
    subjectSummaries = subjectsData.map((sub) =>
      calculateSubjectAttendance(sub, recordsData, defaultTarget)
    )

    // 3. Compute overall attendance
    overallSummary = calculateOverallAttendance(subjectSummaries, defaultTarget)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <AttendanceClientView
        semesters={semesters}
        activeSemester={activeSemester}
        todayDate={todayDate}
        todayClasses={todayClasses}
        overallSummary={overallSummary}
        subjectSummaries={subjectSummaries}
        records={records}
        subjects={subjects}
        slots={slots}
        exceptions={exceptions}
      />
    </div>
  )
}
