import { redirect, notFound } from 'next/navigation'
import { getCachedUser } from '@/lib/data/cachedUser'
import { getSubject } from '@/lib/data/subjects'
import {
  getAttendanceRecordsWithSubject,
  getDefaultAttendanceTarget,
} from '@/lib/data/attendance'
import { calculateSubjectAttendance } from '@/lib/attendance/calculations'
import SubjectDetailClientView from '@/components/attendance/SubjectDetailClientView'

interface SubjectDetailPageProps {
  params: Promise<{ subjectId: string }>
}

export async function generateMetadata({ params }: SubjectDetailPageProps) {
  const { subjectId } = await params
  const user = await getCachedUser()

  if (!user) return { title: 'Attendance | StudySpace' }

  const subject = await getSubject(subjectId, user.id)
  if (!subject) return { title: 'Subject Not Found | StudySpace' }

  return {
    title: `${subject.name} - Attendance | StudySpace`,
    description: `Attendance metrics and class history for ${subject.name}.`,
  }
}

export default async function SubjectDetailPage({ params }: SubjectDetailPageProps) {
  const { subjectId } = await params
  const user = await getCachedUser()

  if (!user) {
    redirect('/login')
  }

  const subject = await getSubject(subjectId, user.id)
  if (!subject) {
    notFound()
  }

  const [records, defaultTarget] = await Promise.all([
    getAttendanceRecordsWithSubject(subject.semester_id, user.id, {
      subjectId: subject.id,
    }),
    getDefaultAttendanceTarget(user.id),
  ])

  const hasRecords = records.length > 0
  const summary = calculateSubjectAttendance(subject, records, defaultTarget)

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <SubjectDetailClientView
        subject={subject}
        summary={summary}
        records={records}
        hasRealRecords={hasRecords}
      />
    </div>
  )
}
