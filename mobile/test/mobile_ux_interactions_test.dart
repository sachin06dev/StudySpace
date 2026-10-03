import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:studyspace/attendance/models/attendance_record.dart';
import 'package:studyspace/attendance/services/attendance_calculation_engine.dart';
import 'package:studyspace/attendance/services/class_resolution_service.dart';
import 'package:studyspace/timetable/models/semester.dart';
import 'package:studyspace/timetable/models/subject.dart';
import 'package:studyspace/timetable/models/timetable_exception.dart';
import 'package:studyspace/timetable/models/timetable_slot.dart';

void main() {
  group('Mobile UX & Timetable Interaction Tests', () {
    test('5-Minute time snapping rounds minutes to nearest 5', () {
      int snapMinutes(int minute) {
        return (minute / 5).round() * 5;
      }

      expect(snapMinutes(0), 0);
      expect(snapMinutes(2), 0);
      expect(snapMinutes(3), 5);
      expect(snapMinutes(7), 5);
      expect(snapMinutes(8), 10);
      expect(snapMinutes(58), 60);
    });

    test('Timetable slot validates that endTime is strictly after startTime', () {
      bool isValidSlotTime(TimeOfDay start, TimeOfDay end) {
        final startMinutes = start.hour * 60 + start.minute;
        final endMinutes = end.hour * 60 + end.minute;
        return endMinutes > startMinutes;
      }

      expect(
        isValidSlotTime(
          const TimeOfDay(hour: 9, minute: 0),
          const TimeOfDay(hour: 10, minute: 0),
        ),
        isTrue,
      );

      expect(
        isValidSlotTime(
          const TimeOfDay(hour: 10, minute: 0),
          const TimeOfDay(hour: 10, minute: 0),
        ),
        isFalse,
      );

      expect(
        isValidSlotTime(
          const TimeOfDay(hour: 11, minute: 0),
          const TimeOfDay(hour: 10, minute: 0),
        ),
        isFalse,
      );

      expect(
        isValidSlotTime(
          const TimeOfDay(hour: 9, minute: 55),
          const TimeOfDay(hour: 10, minute: 0),
        ),
        isTrue,
      );
    });

    test('Cancelled classes are excluded from attendance denominator and percentage', () {
      final subject = Subject(
        id: 'sub_math',
        userId: 'u1',
        semesterId: 'sem_1',
        name: 'Mathematics',
        targetPercentage: 75.0,
      );

      // 4 present, 1 absent, 2 cancelled
      final records = [
        AttendanceRecord(
          id: 'r1',
          userId: 'u1',
          semesterId: 'sem_1',
          subjectId: 'sub_math',
          classDate: '2026-09-01',
          startTime: '09:00:00',
          endTime: '10:00:00',
          status: 'present',
        ),
        AttendanceRecord(
          id: 'r2',
          userId: 'u1',
          semesterId: 'sem_1',
          subjectId: 'sub_math',
          classDate: '2026-09-02',
          startTime: '09:00:00',
          endTime: '10:00:00',
          status: 'present',
        ),
        AttendanceRecord(
          id: 'r3',
          userId: 'u1',
          semesterId: 'sem_1',
          subjectId: 'sub_math',
          classDate: '2026-09-03',
          startTime: '09:00:00',
          endTime: '10:00:00',
          status: 'present',
        ),
        AttendanceRecord(
          id: 'r4',
          userId: 'u1',
          semesterId: 'sem_1',
          subjectId: 'sub_math',
          classDate: '2026-09-04',
          startTime: '09:00:00',
          endTime: '10:00:00',
          status: 'present',
        ),
        AttendanceRecord(
          id: 'r5',
          userId: 'u1',
          semesterId: 'sem_1',
          subjectId: 'sub_math',
          classDate: '2026-09-05',
          startTime: '09:00:00',
          endTime: '10:00:00',
          status: 'absent',
        ),
        AttendanceRecord(
          id: 'r6',
          userId: 'u1',
          semesterId: 'sem_1',
          subjectId: 'sub_math',
          classDate: '2026-09-06',
          startTime: '09:00:00',
          endTime: '10:00:00',
          status: 'cancelled',
        ),
        AttendanceRecord(
          id: 'r7',
          userId: 'u1',
          semesterId: 'sem_1',
          subjectId: 'sub_math',
          classDate: '2026-09-07',
          startTime: '09:00:00',
          endTime: '10:00:00',
          status: 'cancelled',
        ),
      ];

      final summary = AttendanceCalculationEngine.calculateSubjectAttendance(
        subject: subject,
        records: records,
      );

      // Effective total should be 4 + 1 = 5 (cancelled classes excluded!)
      expect(summary.effectiveTotal, 5);
      expect(summary.effectiveAttended, 4);
      expect(summary.presentCount, 4);
      expect(summary.absentCount, 1);
      expect(summary.cancelledCount, 2);
      expect(summary.percentage, 80.0); // 4 / 5 = 80%, not 4 / 7
    });

    test('Extra classes merge chronologically into normal timetable', () {
      final semester = Semester(
        id: 'sem_1',
        userId: 'u1',
        name: 'Fall 2026',
        startDate: '2026-08-01',
        endDate: '2026-12-31',
        isActive: true,
      );

      final regularSlots = [
        TimetableSlot(
          id: 'slot_1',
          userId: 'u1',
          semesterId: 'sem_1',
          subjectId: 'sub_ds',
          dayOfWeek: 0, // Monday
          startTime: '10:00:00',
          endTime: '11:00:00',
        ),
        TimetableSlot(
          id: 'slot_2',
          userId: 'u1',
          semesterId: 'sem_1',
          subjectId: 'sub_dbms',
          dayOfWeek: 0, // Monday
          startTime: '14:00:00',
          endTime: '15:00:00',
        ),
      ];

      final extraException = TimetableException(
        id: 'ex_1',
        userId: 'u1',
        semesterId: 'sem_1',
        subjectId: 'sub_math',
        exceptionType: 'extra',
        exceptionDate: '2026-09-14',
        replacementStartTime: '12:00:00',
        replacementEndTime: '13:00:00',
        notes: 'Extra revision class',
      );

      // Resolve classes for Monday 2026-09-14
      final resolved = ClassResolutionService.resolveClassesForDate(
        date: '2026-09-14',
        semester: semester,
        slots: regularSlots,
        exceptions: [extraException],
        subjects: [
          Subject(id: 'sub_ds', userId: 'u1', semesterId: 'sem_1', name: 'Data Structures'),
          Subject(id: 'sub_dbms', userId: 'u1', semesterId: 'sem_1', name: 'DBMS'),
          Subject(id: 'sub_math', userId: 'u1', semesterId: 'sem_1', name: 'Extra Mathematics'),
        ],
        records: [],
      );

      expect(resolved.length, 3);
      // Verify sorted chronologically: 10:00 -> 12:00 -> 14:00
      expect(resolved[0].startTime.substring(0, 5), '10:00');
      expect(resolved[0].isExtra, isFalse);

      expect(resolved[1].startTime.substring(0, 5), '12:00');
      expect(resolved[1].isExtra, isTrue);
      expect(resolved[1].subjectName, 'Extra Mathematics');

      expect(resolved[2].startTime.substring(0, 5), '14:00');
      expect(resolved[2].isExtra, isFalse);
    });

    test('Timestamp-based Pomodoro calculates remaining seconds deterministically', () {
      final now = DateTime.now();
      final plannedEnd = now.add(const Duration(minutes: 25));

      // After 5 minutes elapsed
      final simulatedResumeTime = now.add(const Duration(minutes: 5, seconds: 12));
      final remaining = plannedEnd.difference(simulatedResumeTime).inSeconds;

      expect(remaining, (25 * 60) - (5 * 60 + 12));
      expect(remaining, 1188); // 19m 48s remaining
    });
  });
}
