import 'package:flutter_test/flutter_test.dart';
import 'package:studyspace/attendance/models/attendance_record.dart';
import 'package:studyspace/attendance/services/attendance_heatmap_engine.dart';

void main() {
  group('AttendanceHeatmapEngine — 5-Level Intensity & Edge Case Tests', () {
    final refDate = DateTime(2026, 9, 14); // Monday

    test('Zero class days yield noClasses level and do not penalize student', () {
      final result = AttendanceHeatmapEngine.buildSeries(
        records: [],
        slots: [],
        exceptions: [],
        referenceDate: refDate,
        totalDays: 7,
      );

      expect(result.length, 7);
      for (final day in result) {
        expect(day.totalClasses, 0);
        expect(day.percentage, 0.0);
        expect(day.level, AttendanceHeatmapLevel.noClasses);
        expect(day.label, contains('No classes'));
      }
    });

    test('100% attendance days map to excellent level', () {
      final records = [
        AttendanceRecord(
          id: 'r1',
          userId: 'u1',
          semesterId: 'sem1',
          subjectId: 'sub1',
          classDate: '2026-09-14',
          startTime: '09:00',
          endTime: '10:00',
          status: 'present',
        ),
        AttendanceRecord(
          id: 'r2',
          userId: 'u1',
          semesterId: 'sem1',
          subjectId: 'sub2',
          classDate: '2026-09-14',
          startTime: '10:15',
          endTime: '11:15',
          status: 'present',
        ),
      ];

      final result = AttendanceHeatmapEngine.buildSeries(
        records: records,
        slots: [],
        exceptions: [],
        referenceDate: refDate,
        totalDays: 1,
      );

      expect(result.length, 1);
      final today = result.first;
      expect(today.totalClasses, 2);
      expect(today.attendedClasses, 2);
      expect(today.percentage, 100.0);
      expect(today.level, AttendanceHeatmapLevel.excellent);
    });

    test('Cancelled classes are excluded from the attendance denominator', () {
      final records = [
        AttendanceRecord(
          id: 'r1',
          userId: 'u1',
          semesterId: 'sem1',
          subjectId: 'sub1',
          classDate: '2026-09-14',
          startTime: '09:00',
          endTime: '10:00',
          status: 'present',
        ),
        AttendanceRecord(
          id: 'r2',
          userId: 'u1',
          semesterId: 'sem1',
          subjectId: 'sub2',
          classDate: '2026-09-14',
          startTime: '10:15',
          endTime: '11:15',
          status: 'cancelled',
        ),
      ];

      final result = AttendanceHeatmapEngine.buildSeries(
        records: records,
        slots: [],
        exceptions: [],
        referenceDate: refDate,
        totalDays: 1,
      );

      final today = result.first;
      expect(today.attendedClasses, 1);
      expect(today.cancelledClasses, 1);
      expect(today.totalClasses, 1); // 1 present + 0 absent (cancelled excluded)
      expect(today.percentage, 100.0); // 1 out of 1 attended
      expect(today.level, AttendanceHeatmapLevel.excellent);
    });

    test('All cancelled classes day does not record failure', () {
      final records = [
        AttendanceRecord(
          id: 'r1',
          userId: 'u1',
          semesterId: 'sem1',
          subjectId: 'sub1',
          classDate: '2026-09-14',
          startTime: '09:00',
          endTime: '10:00',
          status: 'cancelled',
        ),
      ];

      final result = AttendanceHeatmapEngine.buildSeries(
        records: records,
        slots: [],
        exceptions: [],
        referenceDate: refDate,
        totalDays: 1,
      );

      final today = result.first;
      expect(today.totalClasses, 0);
      expect(today.cancelledClasses, 1);
      expect(today.level, AttendanceHeatmapLevel.noClasses);
      expect(today.label, contains('All classes cancelled'));
    });

    test('Partial attendance maps correctly across 5 levels', () {
      // 1 out of 2 attended = 50% -> low
      final rec50 = [
        AttendanceRecord(
          id: 'r1',
          userId: 'u1',
          semesterId: 'sem1',
          subjectId: 'sub1',
          classDate: '2026-09-14',
          startTime: '09:00',
          endTime: '10:00',
          status: 'present',
        ),
        AttendanceRecord(
          id: 'r2',
          userId: 'u1',
          semesterId: 'sem1',
          subjectId: 'sub2',
          classDate: '2026-09-14',
          startTime: '10:15',
          endTime: '11:15',
          status: 'absent',
        ),
      ];

      final res50 = AttendanceHeatmapEngine.buildSeries(
        records: rec50,
        slots: [],
        exceptions: [],
        referenceDate: refDate,
        totalDays: 1,
      );
      expect(res50.first.level, AttendanceHeatmapLevel.low);
      expect(res50.first.percentage, 50.0);

      // 0 out of 2 attended = 0% -> veryLow
      final rec0 = [
        AttendanceRecord(
          id: 'r1',
          userId: 'u1',
          semesterId: 'sem1',
          subjectId: 'sub1',
          classDate: '2026-09-14',
          startTime: '09:00',
          endTime: '10:00',
          status: 'absent',
        ),
      ];

      final res0 = AttendanceHeatmapEngine.buildSeries(
        records: rec0,
        slots: [],
        exceptions: [],
        referenceDate: refDate,
        totalDays: 1,
      );
      expect(res0.first.level, AttendanceHeatmapLevel.veryLow);
    });

    test('Ensures Monday is mapped to dayOfWeek index 0', () {
      // 2026-09-14 is Monday
      final result = AttendanceHeatmapEngine.buildSeries(
        records: [],
        slots: [],
        exceptions: [],
        referenceDate: refDate,
        totalDays: 1,
      );

      expect(result.first.dayOfWeek, 0); // Mon
      expect(result.first.dayName, 'Mon');
    });
  });
}
