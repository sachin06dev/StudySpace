import 'package:flutter_test/flutter_test.dart';
import 'package:studyspace/attendance/models/attendance_record.dart';
import 'package:studyspace/attendance/models/subject_attendance.dart';
import 'package:studyspace/attendance/services/attendance_calculation_engine.dart';
import 'package:studyspace/timetable/models/subject.dart';

void main() {
  group('Attendance Calculation Engine Tests', () {
    test('calculateBunkAllowance returns correct count at 75% target', () {
      // 8 attended out of 10 = 80%. Target 75%.
      // 8 / (10 + m) >= 0.75 => 10 + m <= 8 / 0.75 = 10.66 => m <= 0.66 => 0 miss
      expect(AttendanceCalculationEngine.calculateBunkAllowance(8, 10, 75.0), 0);

      // 9 attended out of 10 = 90%. Target 75%.
      // 9 / (10 + m) >= 0.75 => 10 + m <= 9 / 0.75 = 12 => m <= 2 miss
      expect(AttendanceCalculationEngine.calculateBunkAllowance(9, 10, 75.0), 2);
    });

    test('calculateBunkAllowance handles edge cases (target 0, target > 100, zero total)', () {
      expect(AttendanceCalculationEngine.calculateBunkAllowance(0, 0, 75.0), 0);
      expect(AttendanceCalculationEngine.calculateBunkAllowance(5, 10, 0.0), 999);
      expect(AttendanceCalculationEngine.calculateBunkAllowance(10, 10, 105.0), 0);
    });

    test('calculateRecoveryRequirement returns correct count when below target', () {
      // 6 attended out of 10 = 60%. Target 75%.
      // (6 + r) / (10 + r) >= 0.75 => 6 + r >= 7.5 + 0.75r => 0.25r >= 1.5 => r >= 6
      expect(AttendanceCalculationEngine.calculateRecoveryRequirement(6, 10, 75.0), 6);

      // 10 attended out of 10 = 100%. Target 75%.
      expect(AttendanceCalculationEngine.calculateRecoveryRequirement(10, 10, 75.0), 0);
    });

    test('calculateRecoveryRequirement handles 100% target after absence', () {
      // Missed 1 class with 100% target => mathematically impossible
      final req = AttendanceCalculationEngine.calculateRecoveryRequirement(9, 10, 100.0);
      expect(req >= 999999, isTrue);
    });

    test('calculateSubjectAttendance includes baseline and ignores cancelled records', () {
      final subject = Subject(
        id: 'sub_1',
        userId: 'u1',
        semesterId: 'sem_1',
        name: 'Operating Systems',
        targetPercentage: 75.0,
        baselineAttended: 10,
        baselineTotal: 10,
      );

      final records = [
        AttendanceRecord(
          id: 'r1',
          userId: 'u1',
          semesterId: 'sem_1',
          subjectId: 'sub_1',
          classDate: '2026-09-14',
          startTime: '09:30:00',
          endTime: '10:30:00',
          status: 'present',
        ),
        AttendanceRecord(
          id: 'r2',
          userId: 'u1',
          semesterId: 'sem_1',
          subjectId: 'sub_1',
          classDate: '2026-09-15',
          startTime: '09:30:00',
          endTime: '10:30:00',
          status: 'absent',
        ),
        AttendanceRecord(
          id: 'r3',
          userId: 'u1',
          semesterId: 'sem_1',
          subjectId: 'sub_1',
          classDate: '2026-09-16',
          startTime: '09:30:00',
          endTime: '10:30:00',
          status: 'cancelled', // Must not count towards total
        ),
      ];

      final summary = AttendanceCalculationEngine.calculateSubjectAttendance(
        subject: subject,
        records: records,
        defaultTarget: 75.0,
      );

      // Effective attended: 10 + 1 = 11
      // Effective total: 10 + 1 (present) + 1 (absent) = 12 (cancelled ignored)
      expect(summary.effectiveAttended, 11);
      expect(summary.effectiveTotal, 12);
      expect(summary.cancelledCount, 1);
      // 11 / 12 = 91.7%
      expect(summary.percentage, 91.7);
      expect(summary.riskState, RiskState.safe);
    });

    test('determineRiskState returns WARNING when on track but bunk allowance <= 1', () {
      final risk = AttendanceCalculationEngine.determineRiskState(
        percentage: 75.0,
        target: 75.0,
        bunkAllowance: 0,
        recoveryRequirement: 0,
        totalClasses: 12,
      );

      expect(risk.riskState, RiskState.warning);
      expect(risk.statusMessage, 'On track, but cannot miss next class');
    });
  });
}
