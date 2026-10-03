import {
  calculateBunkAllowance,
  calculateRecoveryRequirement,
  determineRiskState,
  calculateSubjectAttendance,
} from '../lib/attendance/calculations'
import {
  resolveClassesForDate,
  getIsoDayOfWeek,
} from '../lib/attendance/resolution'
import type { Subject } from '../lib/data/subjects'
import type { AttendanceRecord } from '../lib/data/attendance'
import type { Semester } from '../lib/data/semesters'
import type { TimetableSlot, TimetableException } from '../lib/data/timetable'

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`)
    process.exit(1)
  }
  console.log(`✓ ${msg}`)
}

console.log('=== VERIFYING SECTION 3: ATTENDANCE EDGE CASES ===\n')

// 1. Target = 0
{
  const bunk = calculateBunkAllowance(5, 10, 0)
  const rec = calculateRecoveryRequirement(5, 10, 0)
  const risk = determineRiskState(50, 0, bunk, rec, 10)
  assert(bunk === 999, 'Target=0 bunk allowance returns 999 (Unlimited)')
  assert(rec === 0, 'Target=0 recovery requirement returns 0')
  assert(risk.riskState === 'SAFE', 'Target=0 risk state is SAFE')
  assert(!risk.statusMessage.includes('NaN') && !risk.statusMessage.includes('Infinity'), 'Target=0 message has no NaN/Infinity')
}

// 2. Target = 75
{
  const bunkSafe = calculateBunkAllowance(8, 10, 75) // 80% -> can miss 0
  const bunkSurplus = calculateBunkAllowance(9, 10, 75) // 90% -> 9/(10+m) >= 0.75 -> m <= 2
  const recDeficit = calculateRecoveryRequirement(6, 10, 75) // 60% -> (6+r)/(10+r) >= 0.75 -> r >= 6
  assert(bunkSafe === 0, 'Target=75 at 80% can miss 0')
  assert(bunkSurplus === 2, 'Target=75 at 90% can miss 2')
  assert(recDeficit === 6, 'Target=75 at 60% requires 6 recovery classes')
  assert(bunkSafe >= 0 && bunkSurplus >= 0, 'Bunk allowance is never negative')
  assert(recDeficit >= 0, 'Recovery requirement is never negative')
}

// 3. Target = 100
{
  const bunk100 = calculateBunkAllowance(10, 10, 100) // 100% -> can miss 0
  const rec100Missed = calculateRecoveryRequirement(9, 10, 100) // Missed 1 class -> Infinity
  const risk100 = determineRiskState(90, 100, 0, rec100Missed, 10)
  assert(bunk100 === 0, 'Target=100 at 100% can miss 0')
  assert(rec100Missed === Infinity, 'Target=100 with missed class returns Infinity')
  assert(risk100.riskState === 'CRITICAL', 'Target=100 missed class is CRITICAL')
  assert(risk100.statusMessage === 'Cannot reach target mathematically', 'Target=100 uses user-friendly message without Infinity')
}

// 4. Zero Attendance (total = 0)
{
  const bunkZero = calculateBunkAllowance(0, 0, 75)
  const recZero = calculateRecoveryRequirement(0, 0, 75)
  const riskZero = determineRiskState(100, 75, bunkZero, recZero, 0)
  assert(bunkZero === 0, 'Zero attendance bunk allowance is 0 (not NaN)')
  assert(recZero === 0, 'Zero attendance recovery requirement is 0 (not NaN)')
  assert(riskZero.statusMessage === 'No classes tracked yet', 'Zero attendance returns clean friendly message')
  assert(riskZero.riskState === 'SAFE', 'Zero attendance default state is SAFE')
}

// 5. Attendance already above target
{
  const recAbove = calculateRecoveryRequirement(10, 10, 75)
  assert(recAbove === 0, 'Attendance above target has 0 recovery requirement (never negative)')
}

// 6. Cancelled-only classes
{
  const dummySubject: Subject = {
    id: 's-cancelled',
    user_id: 'u-1',
    semester_id: 'sem-1',
    name: 'Cancelled Subject',
    code: null,
    faculty: null,
    default_room: null,
    class_type: 'theory',
    credits: 3,
    target_percentage: 75,
    baseline_attended: 0,
    baseline_total: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const cancelledRecords: AttendanceRecord[] = [
    {
      id: 'c-1',
      user_id: 'u-1',
      semester_id: 'sem-1',
      subject_id: 's-cancelled',
      timetable_slot_id: null,
      class_date: '2026-09-10',
      start_time: '10:00',
      end_time: '11:00',
      status: 'cancelled',
      notes: 'Rain delay',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'c-2',
      user_id: 'u-1',
      semester_id: 'sem-1',
      subject_id: 's-cancelled',
      timetable_slot_id: null,
      class_date: '2026-09-11',
      start_time: '10:00',
      end_time: '11:00',
      status: 'cancelled',
      notes: 'Holiday',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]

  const summary = calculateSubjectAttendance(dummySubject, cancelledRecords, 75)
  assert(summary.effectiveAttended === 0, 'Cancelled-only effective attended is 0')
  assert(summary.effectiveTotal === 0, 'Cancelled-only effective total is 0 (cancelled excluded)')
  assert(summary.cancelledCount === 2, 'Cancelled count correctly tracked as 2')
  assert(summary.percentage === 100, 'Cancelled-only displays clean 100% without NaN')
  assert(summary.statusMessage === 'No classes tracked yet', 'Cancelled-only displays friendly message')
}

// 7. Multiple classes for same subject on same date (Double period)
{
  const dummySubject: Subject = {
    id: 's-double',
    user_id: 'u-1',
    semester_id: 'sem-1',
    name: 'Lab Session',
    code: 'CS102',
    faculty: null,
    default_room: null,
    class_type: 'lab',
    credits: 2,
    target_percentage: 75,
    baseline_attended: 0,
    baseline_total: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const doubleRecords: AttendanceRecord[] = [
    {
      id: 'd-1',
      user_id: 'u-1',
      semester_id: 'sem-1',
      subject_id: 's-double',
      timetable_slot_id: null,
      class_date: '2026-09-12',
      start_time: '09:00',
      end_time: '10:00',
      status: 'present',
      notes: 'Period 1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'd-2',
      user_id: 'u-1',
      semester_id: 'sem-1',
      subject_id: 's-double',
      timetable_slot_id: null,
      class_date: '2026-09-12',
      start_time: '10:00',
      end_time: '11:00',
      status: 'absent',
      notes: 'Period 2',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]

  const summary = calculateSubjectAttendance(dummySubject, doubleRecords, 75)
  assert(summary.effectiveAttended === 1, 'Double period: 1 attended')
  assert(summary.effectiveTotal === 2, 'Double period: 2 total on same date')
  assert(summary.percentage === 50, 'Double period: 50% attendance')
}

// 8. Semester boundaries (Start & End boundary tests)
{
  const sem: Semester = {
    id: 'sem-bounds',
    user_id: 'u-1',
    name: 'Bounded Semester',
    start_date: '2026-09-01',
    end_date: '2026-11-30',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const slot: TimetableSlot = {
    id: 's-tue',
    user_id: 'u-1',
    semester_id: 'sem-bounds',
    subject_id: 'sub-tue',
    day_of_week: 1, // Tuesday
    start_time: '10:00:00',
    end_time: '11:00:00',
    room_override: null,
    faculty_override: null,
    class_type_override: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const sub: Subject = {
    id: 'sub-tue',
    user_id: 'u-1',
    semester_id: 'sem-bounds',
    name: 'Tuesday Course',
    code: null,
    faculty: null,
    default_room: null,
    class_type: 'theory',
    credits: 3,
    target_percentage: 75,
    baseline_attended: 0,
    baseline_total: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // 2026-08-31 is Monday (before semester start)
  const beforeStart = resolveClassesForDate({
    date: '2026-08-31',
    semester: sem,
    slots: [slot],
    subjects: [sub],
    exceptions: [],
    records: [],
  })
  assert(beforeStart.length === 0, 'Date before semester start yields 0 classes')

  // 2026-09-01 is Tuesday (exact start date) -> 2026-09-01 is Tuesday (ISO day 1)
  assert(getIsoDayOfWeek('2026-09-01') === 1, '2026-09-01 is Tuesday')
  const atStart = resolveClassesForDate({
    date: '2026-09-01',
    semester: sem,
    slots: [slot],
    subjects: [sub],
    exceptions: [],
    records: [],
  })
  assert(atStart.length === 1, 'Date at exact semester start date resolves recurring class')

  // 2026-12-01 is after semester end
  const afterEnd = resolveClassesForDate({
    date: '2026-12-01',
    semester: sem,
    slots: [slot],
    subjects: [sub],
    exceptions: [],
    records: [],
  })
  assert(afterEnd.length === 0, 'Date after semester end yields 0 classes')
}

// 9. Rescheduled & Extra class resolution
{
  const sem: Semester = {
    id: 'sem-ex',
    user_id: 'u-1',
    name: 'Exception Semester',
    start_date: '2026-09-01',
    end_date: '2026-12-31',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const sub: Subject = {
    id: 'sub-ex',
    user_id: 'u-1',
    semester_id: 'sem-ex',
    name: 'Physics',
    code: 'PHY101',
    faculty: null,
    default_room: 'Hall A',
    class_type: 'theory',
    credits: 4,
    target_percentage: 75,
    baseline_attended: 0,
    baseline_total: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // Regular Monday slot: 09:00 - 10:00
  const slot: TimetableSlot = {
    id: 'slot-mon',
    user_id: 'u-1',
    semester_id: 'sem-ex',
    subject_id: 'sub-ex',
    day_of_week: 0, // Monday
    start_time: '09:00:00',
    end_time: '10:00:00',
    room_override: null,
    faculty_override: null,
    class_type_override: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // Rescheduled from Monday 2026-09-14 to Wednesday 2026-09-16 at 15:00 - 16:00
  const reschedEx: TimetableException = {
    id: 'resched-1',
    user_id: 'u-1',
    semester_id: 'sem-ex',
    timetable_slot_id: 'slot-mon',
    exception_date: '2026-09-14',
    exception_type: 'rescheduled',
    start_time: null,
    end_time: null,
    replacement_date: '2026-09-16',
    replacement_start_time: '15:00:00',
    replacement_end_time: '16:00:00',
    subject_id: null,
    room: 'Hall B',
    faculty: null,
    notes: 'Moved due to maintenance',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // Verify Monday 2026-09-14 has NO slot (it moved away)
  const mondayClasses = resolveClassesForDate({
    date: '2026-09-14',
    semester: sem,
    slots: [slot],
    subjects: [sub],
    exceptions: [reschedEx],
    records: [],
  })
  assert(mondayClasses.length === 0, 'Rescheduled-away class does not appear on original date')

  // Verify Wednesday 2026-09-16 HAS the rescheduled class
  const wednesdayClasses = resolveClassesForDate({
    date: '2026-09-16',
    semester: sem,
    slots: [slot],
    subjects: [sub],
    exceptions: [reschedEx],
    records: [],
  })
  assert(wednesdayClasses.length === 1, 'Rescheduled class appears on replacement date')
  assert(wednesdayClasses[0].isRescheduled === true, 'isRescheduled flag is true')
  assert(wednesdayClasses[0].startTime === '15:00:00', 'Rescheduled class uses replacement start time')
  assert(wednesdayClasses[0].room === 'Hall B', 'Rescheduled class uses custom room')
}

console.log('\n=============================================')
console.log('🎉 ALL EDGE CASES AND BOUNDARY TESTS PASSED!')
console.log('=============================================\n')
