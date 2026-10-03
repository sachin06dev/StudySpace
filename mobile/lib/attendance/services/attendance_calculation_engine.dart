import '../models/attendance_record.dart';
import '../models/overall_attendance.dart';
import '../models/subject_attendance.dart';
import '../../timetable/models/subject.dart';

class AttendanceCalculationEngine {
  /// Calculate the maximum additional classes a student can miss while staying at or above target.
  static int calculateBunkAllowance(int attended, int total, double target) {
    if (target <= 0) return 999;
    if (target > 100) return 0;
    if (total == 0) return 0;

    final currentPercent = (attended / total) * 100;
    if (currentPercent < target) return 0;

    // attended / (total + m) >= target / 100 => m <= (attended * 100 / target) - total
    final maxMiss = ((attended * 100) / target - total).floor();
    return maxMiss < 0 ? 0 : maxMiss;
  }

  /// Calculate the minimum consecutive classes a student must attend to reach target percentage.
  static int calculateRecoveryRequirement(int attended, int total, double target) {
    if (target <= 0) return 0;
    if (total == 0) return 0;

    final currentPercent = (attended / total) * 100;
    if (currentPercent >= target) return 0;

    if (target >= 100) {
      // 100% can never be mathematically recovered after an absence
      return attended < total ? 999999 : 0;
    }

    // (attended + r) / (total + r) >= target / 100 => r >= (target * total - 100 * attended) / (100 - target)
    final req = ((target * total - 100 * attended) / (100 - target)).ceil();
    return req < 0 ? 0 : req;
  }

  /// Determine risk state and explanation status message.
  static ({RiskState riskState, String statusMessage}) determineRiskState({
    required double percentage,
    required double target,
    required int bunkAllowance,
    required int recoveryRequirement,
    required int totalClasses,
  }) {
    if (totalClasses == 0) {
      return (
        riskState: RiskState.safe,
        statusMessage: 'No classes tracked yet',
      );
    }

    if (percentage < target) {
      final recText = recoveryRequirement >= 999999
          ? 'Cannot reach target mathematically'
          : 'Attend next $recoveryRequirement class${recoveryRequirement == 1 ? '' : 'es'} to recover';

      return (
        riskState: RiskState.critical,
        statusMessage: recText,
      );
    }

    if (bunkAllowance <= 1) {
      return (
        riskState: RiskState.warning,
        statusMessage: bunkAllowance == 0
            ? 'On track, but cannot miss next class'
            : 'You can miss 1 class',
      );
    }

    return (
      riskState: RiskState.safe,
      statusMessage: 'You can miss $bunkAllowance class${bunkAllowance == 1 ? '' : 'es'}',
    );
  }

  /// Calculate attendance metrics for a specific subject.
  static SubjectAttendanceSummary calculateSubjectAttendance({
    required Subject subject,
    required List<AttendanceRecord> records,
    double defaultTarget = 75.0,
  }) {
    final target = subject.targetPercentage ?? defaultTarget;

    int presentCount = 0;
    int absentCount = 0;
    int cancelledCount = 0;

    for (final record in records) {
      if (record.subjectId != subject.id) continue;
      if (record.status == 'present') {
        presentCount++;
      } else if (record.status == 'absent') {
        absentCount++;
      } else if (record.status == 'cancelled') {
        cancelledCount++;
      }
    }

    final effectiveAttended = subject.baselineAttended + presentCount;
    final effectiveTotal = subject.baselineTotal + presentCount + absentCount;

    final percentage = effectiveTotal > 0
        ? ((effectiveAttended / effectiveTotal) * 1000).round() / 10.0
        : 100.0;

    final bunkAllowance = calculateBunkAllowance(effectiveAttended, effectiveTotal, target);
    final recoveryRequirement =
        calculateRecoveryRequirement(effectiveAttended, effectiveTotal, target);

    final riskInfo = determineRiskState(
      percentage: percentage,
      target: target,
      bunkAllowance: bunkAllowance,
      recoveryRequirement: recoveryRequirement,
      totalClasses: effectiveTotal,
    );

    return SubjectAttendanceSummary(
      subject: subject,
      effectiveAttended: effectiveAttended,
      effectiveTotal: effectiveTotal,
      presentCount: presentCount,
      absentCount: absentCount,
      cancelledCount: cancelledCount,
      percentage: percentage,
      targetPercentage: target,
      bunkAllowance: bunkAllowance,
      recoveryRequirement: recoveryRequirement,
      riskState: riskInfo.riskState,
      statusMessage: riskInfo.statusMessage,
    );
  }

  /// Calculate aggregated semester-wide attendance metrics across all subjects.
  static OverallAttendanceSummary calculateOverallAttendance({
    required List<Subject> subjects,
    required List<AttendanceRecord> records,
    double defaultTarget = 75.0,
  }) {
    if (subjects.isEmpty) {
      return OverallAttendanceSummary.empty(defaultTarget);
    }

    int totalAttended = 0;
    int totalClasses = 0;
    int criticalCount = 0;
    int warningCount = 0;
    int safeCount = 0;

    for (final subject in subjects) {
      final summary = calculateSubjectAttendance(
        subject: subject,
        records: records,
        defaultTarget: defaultTarget,
      );

      totalAttended += summary.effectiveAttended;
      totalClasses += summary.effectiveTotal;

      switch (summary.riskState) {
        case RiskState.critical:
          criticalCount++;
          break;
        case RiskState.warning:
          warningCount++;
          break;
        case RiskState.safe:
          safeCount++;
          break;
      }
    }

    final overallPercentage = totalClasses > 0
        ? ((totalAttended / totalClasses) * 1000).round() / 10.0
        : 100.0;

    final bunkAllowance = calculateBunkAllowance(totalAttended, totalClasses, defaultTarget);
    final recoveryRequirement =
        calculateRecoveryRequirement(totalAttended, totalClasses, defaultTarget);

    final riskInfo = determineRiskState(
      percentage: overallPercentage,
      target: defaultTarget,
      bunkAllowance: bunkAllowance,
      recoveryRequirement: recoveryRequirement,
      totalClasses: totalClasses,
    );

    return OverallAttendanceSummary(
      totalAttended: totalAttended,
      totalClasses: totalClasses,
      overallPercentage: overallPercentage,
      targetPercentage: defaultTarget,
      bunkAllowance: bunkAllowance,
      recoveryRequirement: recoveryRequirement,
      riskState: riskInfo.riskState,
      statusMessage: riskInfo.statusMessage,
      criticalSubjectsCount: criticalCount,
      warningSubjectsCount: warningCount,
      safeSubjectsCount: safeCount,
      totalSubjectsCount: subjects.length,
    );
  }
}
