/**
 * Automated Verification Suite for StudySpace Attendance & Timetable Engine
 * Run with: npx tsx scripts/test-attendance.ts
 */

import {
  calculateBunkAllowance,
  calculateRecoveryRequirement,
  calculateSubjectAttendance,
} from '../lib/attendance/calculations'
import {
  resolveClassesForDate,
  getIsoDayOfWeek,
} from '../lib/attendance/resolution'
import { mapSilverBookToStudySpace } from '../lib/attendance/silverbookCompatibility'
import type { Subject } from '../lib/data/subjects'
import type { AttendanceRecord } from '../lib/data/attendance'
import type { Semester } from '../lib/data/semesters'
import type { TimetableSlot, TimetableException } from '../lib/data/timetable'

function assert(condition: boolean, testName: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${testName}`)
    process.exit(1)
  } else {
    console.log(`✓ PASSED: ${testName}`)
  }
}

console.log('--- 1. Testing Bunk Allowance Calculation ---')
// Current 78.57% (33/42), Target 75% -> can miss 2 classes: 33/(42+2) = 33/44 = 75.0%
const bunk1 = calculateBunkAllowance(33, 42, 75)
assert(bunk1 === 2, `Bunk allowance for 33/42 at 75% target is 2 (got ${bunk1})`)

// Exactly at target: 30/40 = 75%, Target 75% -> can miss 0 classes
const bunk2 = calculateBunkAllowance(30, 40, 75)
assert(bunk2 === 0, `Bunk allowance for 30/40 at 75% target is 0 (got ${bunk2})`)

// Below target: 17/25 = 68%, Target 75% -> cannot miss any classes
const bunk3 = calculateBunkAllowance(17, 25, 75)
assert(bunk3 === 0, `Bunk allowance for 17/25 at 75% target is 0 (got ${bunk3})`)

// Zero classes held yet -> bunk 0
const bunk4 = calculateBunkAllowance(0, 0, 75)
assert(bunk4 === 0, `Bunk allowance for 0/0 is 0 (got ${bunk4})`)

console.log('\n--- 2. Testing Recovery Requirement Calculation ---')
// Below target: 17/24 = 70.8%, Target 75% -> attend next 4 classes: (17+4)/(24+4) = 21/28 = 75.0%
const rec1 = calculateRecoveryRequirement(17, 24, 75)
assert(rec1 === 4, `Recovery for 17/24 at 75% target is 4 (got ${rec1})`)

// Above target: 33/42, Target 75% -> 0 classes needed
const rec2 = calculateRecoveryRequirement(33, 42, 75)
assert(rec2 === 0, `Recovery for 33/42 at 75% target is 0 (got ${rec2})`)

// Target 100% with absences -> impossible mathematically (Infinity)
const rec3 = calculateRecoveryRequirement(9, 10, 100)
assert(rec3 === Infinity, `Recovery for 9/10 at 100% target is Infinity (got ${rec3})`)

console.log('\n--- 3. Testing Subject Attendance with Baseline & Cancelled Exclusion ---')
const sampleSubject: Subject = {
  id: 'sub-1',
  user_id: 'user-1',
  semester_id: 'sem-1',
  name: 'Operating Systems',
  code: 'CS301',
  faculty: 'Dr. Turing',
  default_room: 'Lab 2',
  class_type: 'theory',
  credits: 4,
  target_percentage: 75.0,
  baseline_attended: 20,
  baseline_total: 25,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const sampleRecords: AttendanceRecord[] = [
  {
    id: 'rec-1',
    user_id: 'user-1',
    semester_id: 'sem-1',
    subject_id: 'sub-1',
    timetable_slot_id: 'slot-1',
    class_date: '2026-09-01',
    start_time: '09:00',
    end_time: '10:00',
    status: 'present',
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'rec-2',
    user_id: 'user-1',
    semester_id: 'sem-1',
    subject_id: 'sub-1',
    timetable_slot_id: 'slot-1',
    class_date: '2026-09-02',
    start_time: '09:00',
    end_time: '10:00',
    status: 'present',
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'rec-3',
    user_id: 'user-1',
    semester_id: 'sem-1',
    subject_id: 'sub-1',
    timetable_slot_id: 'slot-1',
    class_date: '2026-09-03',
    start_time: '09:00',
    end_time: '10:00',
    status: 'absent',
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'rec-4',
    user_id: 'user-1',
    semester_id: 'sem-1',
    subject_id: 'sub-1',
    timetable_slot_id: 'slot-1',
    class_date: '2026-09-04',
    start_time: '09:00',
    end_time: '10:00',
    status: 'cancelled', // Must be excluded from counts!
    notes: 'Teacher absent',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const subjectSummary = calculateSubjectAttendance(sampleSubject, sampleRecords, 75.0)
// Effective attended: 20 baseline + 2 present = 22
// Effective total: 25 baseline + 2 present + 1 absent = 28 (cancelled not counted)
// 22 / 28 = 78.57% -> 78.6%
assert(subjectSummary.effectiveAttended === 22, `Effective attended is 22 (got ${subjectSummary.effectiveAttended})`)
assert(subjectSummary.effectiveTotal === 28, `Effective total is 28 (got ${subjectSummary.effectiveTotal})`)
assert(subjectSummary.percentage === 78.6, `Effective percentage is 78.6% (got ${subjectSummary.percentage})`)
assert(subjectSummary.cancelledCount === 1, `Cancelled count is 1 (got ${subjectSummary.cancelledCount})`)
assert(subjectSummary.bunkAllowance === 1, `Bunk allowance is 1 (got ${subjectSummary.bunkAllowance})`)

console.log('\n--- 4. Testing Timetable Resolution (Slots + Exceptions + Records) ---')
const sampleSemester: Semester = {
  id: 'sem-1',
  user_id: 'user-1',
  name: 'Fall 2026',
  start_date: '2026-08-01',
  end_date: '2026-12-31',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

// 2026-09-14 is a Monday (ISO day 0)
const isoMonday = getIsoDayOfWeek('2026-09-14')
assert(isoMonday === 0, `2026-09-14 is Monday / day 0 (got ${isoMonday})`)

// 2026-09-20 is a Sunday (ISO day 6)
const isoSunday = getIsoDayOfWeek('2026-09-20')
assert(isoSunday === 6, `2026-09-20 is Sunday / day 6 (got ${isoSunday})`)

const sampleSlots: TimetableSlot[] = [
  {
    id: 'slot-mon-1',
    user_id: 'user-1',
    semester_id: 'sem-1',
    subject_id: 'sub-1',
    day_of_week: 0, // Monday
    start_time: '09:30:00',
    end_time: '10:30:00',
    room_override: null,
    faculty_override: null,
    class_type_override: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'slot-mon-2',
    user_id: 'user-1',
    semester_id: 'sem-1',
    subject_id: 'sub-1',
    day_of_week: 0, // Monday - overlapping slot
    start_time: '09:30:00',
    end_time: '10:30:00',
    room_override: 'Room B',
    faculty_override: null,
    class_type_override: 'lab',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'slot-mon-cancelled',
    user_id: 'user-1',
    semester_id: 'sem-1',
    subject_id: 'sub-1',
    day_of_week: 0, // Monday
    start_time: '11:00:00',
    end_time: '12:00:00',
    room_override: null,
    faculty_override: null,
    class_type_override: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const sampleExceptions: TimetableException[] = [
  // 1. Cancel slot-mon-cancelled on 2026-09-14
  {
    id: 'ex-cancel-1',
    user_id: 'user-1',
    semester_id: 'sem-1',
    timetable_slot_id: 'slot-mon-cancelled',
    exception_date: '2026-09-14',
    exception_type: 'cancelled',
    start_time: null,
    end_time: null,
    replacement_date: null,
    replacement_start_time: null,
    replacement_end_time: null,
    subject_id: null,
    room: null,
    faculty: null,
    notes: 'National holiday',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // 2. Extra ad-hoc class on 2026-09-14 at 14:00
  {
    id: 'ex-extra-1',
    user_id: 'user-1',
    semester_id: 'sem-1',
    timetable_slot_id: null,
    exception_date: '2026-09-14',
    exception_type: 'extra',
    start_time: '14:00:00',
    end_time: '15:00:00',
    replacement_date: null,
    replacement_start_time: null,
    replacement_end_time: null,
    subject_id: 'sub-1',
    room: 'Seminar Hall',
    faculty: 'Guest Lecturer',
    notes: 'Special workshop',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const resolved = resolveClassesForDate({
  date: '2026-09-14',
  semester: sampleSemester,
  slots: sampleSlots,
  subjects: [sampleSubject],
  exceptions: sampleExceptions,
  records: [],
})

assert(resolved.length === 4, `4 classes resolved for Monday (got ${resolved.length})`)

const cancelledItem = resolved.find((c) => c.slotId === 'slot-mon-cancelled')
assert(cancelledItem?.isCancelled === true, 'Cancelled slot is marked as cancelled')

const extraItem = resolved.find((c) => c.isExtra === true)
assert(extraItem !== undefined, 'Extra class was resolved')
assert(extraItem?.room === 'Seminar Hall', 'Extra class has custom room')

// Overlapping slots test
const overlaps = resolved.filter((c) => c.startTime === '09:30:00')
assert(overlaps.length === 2, `2 overlapping slots at 09:30 resolved (got ${overlaps.length})`)

console.log('\n--- 5. Testing SilverBook Import Compatibility ---')
const silverBookPayload = mapSilverBookToStudySpace(
  {
    semesterName: 'Spring 2026',
    startDate: '2026-01-10',
    endDate: '2026-05-20',
    subjects: [
      {
        name: 'Database Management Systems',
        code: 'CS401',
        type: 'theory',
        attendedClasses: 18,
        totalClasses: 22,
        targetPercentage: 80,
      },
    ],
    timetable: [
      {
        dayOfWeek: 1, // Tuesday in ISO
        startTime: '10:00',
        endTime: '11:00',
        subjectName: 'Database Management Systems',
        room: 'Lab 1',
      },
    ],
  },
  {
    startDate: '2026-01-10',
    endDate: '2026-05-20',
  }
)

assert(silverBookPayload.semester.name === 'Spring 2026', 'SilverBook semester mapped')
assert(silverBookPayload.subjects[0].baselineAttended === 18, 'Baseline attended mapped')
assert(silverBookPayload.subjects[0].baselineTotal === 22, 'Baseline total mapped')
assert(silverBookPayload.timetableSlots[0].dayOfWeek === 1, 'Timetable day mapped')

console.log('\n=============================================')
console.log('🎉 ALL ATTENDANCE & TIMETABLE TESTS PASSED!')
console.log('=============================================')
