import 'package:flutter_test/flutter_test.dart';
import 'package:studyspace/attendance/models/attendance_record.dart';
import 'package:studyspace/attendance/services/class_resolution_service.dart';
import 'package:studyspace/timetable/models/semester.dart';
import 'package:studyspace/timetable/models/subject.dart';
import 'package:studyspace/timetable/models/timetable_exception.dart';
import 'package:studyspace/timetable/models/timetable_slot.dart';

void main() {
  group('Class Resolution Service Tests', () {
    test('getIsoDayOfWeek correctly maps YYYY-MM-DD to ISO day of week', () {
      // 2026-09-14 is Monday => 0
      expect(ClassResolutionService.getIsoDayOfWeek('2026-09-14'), 0);
      // 2026-09-15 is Tuesday => 1
      expect(ClassResolutionService.getIsoDayOfWeek('2026-09-15'), 1);
      // 2026-09-20 is Sunday => 6
      expect(ClassResolutionService.getIsoDayOfWeek('2026-09-20'), 6);
    });

    test('resolveClassesForDate returns empty if date is outside semester bounds', () {
      final semester = Semester(
        id: 'sem_1',
        userId: 'u1',
        name: 'Fall 2026',
        startDate: '2026-09-01',
        endDate: '2026-12-31',
        isActive: true,
      );

      final result = ClassResolutionService.resolveClassesForDate(
        date: '2026-08-15', // Outside bounds
        semester: semester,
        slots: [],
        subjects: [],
        exceptions: [],
        records: [],
      );

      expect(result.isEmpty, isTrue);
    });

    test('resolveClassesForDate handles cancelled, extra, and rescheduled occurrences', () {
      final semester = Semester(
        id: 'sem_1',
        userId: 'u1',
        name: 'Fall 2026',
        startDate: '2026-09-01',
        endDate: '2026-12-31',
        isActive: true,
      );

      final sub1 = Subject(
        id: 'sub_1',
        userId: 'u1',
        semesterId: 'sem_1',
        name: 'Data Structures',
        defaultRoom: 'CT-03',
      );

      final sub2 = Subject(
        id: 'sub_2',
        userId: 'u1',
        semesterId: 'sem_1',
        name: 'OOP Lab',
        defaultRoom: 'Lab-01',
        classType: 'lab',
      );

      // Slot 1: Every Monday 09:30 - 10:30 (Data Structures)
      final slot1 = TimetableSlot(
        id: 'slot_1',
        userId: 'u1',
        semesterId: 'sem_1',
        subjectId: 'sub_1',
        dayOfWeek: 0, // Monday
        startTime: '09:30:00',
        endTime: '10:30:00',
      );

      // Slot 2: Every Monday 11:00 - 12:00 (Cancelled on 2026-09-14)
      final slot2 = TimetableSlot(
        id: 'slot_2',
        userId: 'u1',
        semesterId: 'sem_1',
        subjectId: 'sub_1',
        dayOfWeek: 0, // Monday
        startTime: '11:00:00',
        endTime: '12:00:00',
      );

      final cancelEx = TimetableException(
        id: 'ex_cancel',
        userId: 'u1',
        semesterId: 'sem_1',
        timetableSlotId: 'slot_2',
        exceptionDate: '2026-09-14',
        exceptionType: 'cancelled',
      );

      // Extra class: Monday 2026-09-14 14:00 - 16:00 (OOP Lab)
      final extraEx = TimetableException(
        id: 'ex_extra',
        userId: 'u1',
        semesterId: 'sem_1',
        subjectId: 'sub_2',
        exceptionDate: '2026-09-14',
        exceptionType: 'extra',
        startTime: '14:00:00',
        endTime: '16:00:00',
      );

      final record1 = AttendanceRecord(
        id: 'rec_1',
        userId: 'u1',
        semesterId: 'sem_1',
        subjectId: 'sub_1',
        timetableSlotId: 'slot_1',
        classDate: '2026-09-14',
        startTime: '09:30:00',
        endTime: '10:30:00',
        status: 'present',
      );

      final classes = ClassResolutionService.resolveClassesForDate(
        date: '2026-09-14', // Monday
        semester: semester,
        slots: [slot1, slot2],
        subjects: [sub1, sub2],
        exceptions: [cancelEx, extraEx],
        records: [record1],
      );

      expect(classes.length, 3);

      // Class 1: Slot 1 marked present
      expect(classes[0].subjectName, 'Data Structures');
      expect(classes[0].attendanceStatus, 'present');
      expect(classes[0].isCancelled, isFalse);

      // Class 2: Slot 2 cancelled
      expect(classes[1].startTime, '11:00');
      expect(classes[1].isCancelled, isTrue);

      // Class 3: Extra Class
      expect(classes[2].subjectName, 'OOP Lab');
      expect(classes[2].isExtra, isTrue);
      expect(classes[2].startTime, '14:00');
    });
  });
}
