import { redirect } from 'next/navigation'
import { getCachedUser } from '@/lib/data/cachedUser'
import { getSemesters } from '@/lib/data/semesters'
import { getSubjectsBySemester } from '@/lib/data/subjects'
import {
  getTimetableSlotsWithSubjects,
  getTimetableExceptions,
} from '@/lib/data/timetable'
import TimetableClientView from '@/components/timetable/TimetableClientView'

export const metadata = {
  title: 'Timetable | StudySpace',
  description: 'Manage your weekly schedule, classes, and recurring timetable.',
}

export default async function TimetablePage() {
  const user = await getCachedUser()

  if (!user) {
    redirect('/login')
  }

  const semesters = await getSemesters(user.id)
  const activeSemester = semesters.find((s) => s.is_active) || null

  let slots: Awaited<ReturnType<typeof getTimetableSlotsWithSubjects>> = []
  let subjects: Awaited<ReturnType<typeof getSubjectsBySemester>> = []
  let exceptions: Awaited<ReturnType<typeof getTimetableExceptions>> = []

  if (activeSemester) {
    const [slotsData, subjectsData, exceptionsData] = await Promise.all([
      getTimetableSlotsWithSubjects(activeSemester.id, user.id),
      getSubjectsBySemester(activeSemester.id, user.id),
      getTimetableExceptions(activeSemester.id, user.id),
    ])
    slots = slotsData
    subjects = subjectsData
    exceptions = exceptionsData
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <TimetableClientView
        semesters={semesters}
        activeSemester={activeSemester}
        slots={slots}
        subjects={subjects}
        exceptions={exceptions}
      />
    </div>
  )
}
