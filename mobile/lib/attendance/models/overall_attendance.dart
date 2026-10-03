import 'subject_attendance.dart';

class OverallAttendanceSummary {
  final int totalAttended;
  final int totalClasses;
  final double overallPercentage;
  final double targetPercentage;
  final int bunkAllowance;
  final int recoveryRequirement;
  final RiskState riskState;
  final String statusMessage;
  final int criticalSubjectsCount;
  final int warningSubjectsCount;
  final int safeSubjectsCount;
  final int totalSubjectsCount;

  OverallAttendanceSummary({
    required this.totalAttended,
    required this.totalClasses,
    required this.overallPercentage,
    required this.targetPercentage,
    required this.bunkAllowance,
    required this.recoveryRequirement,
    required this.riskState,
    required this.statusMessage,
    required this.criticalSubjectsCount,
    required this.warningSubjectsCount,
    required this.safeSubjectsCount,
    required this.totalSubjectsCount,
  });

  factory OverallAttendanceSummary.empty([double defaultTarget = 75.0]) {
    return OverallAttendanceSummary(
      totalAttended: 0,
      totalClasses: 0,
      overallPercentage: 100.0,
      targetPercentage: defaultTarget,
      bunkAllowance: 0,
      recoveryRequirement: 0,
      riskState: RiskState.safe,
      statusMessage: 'No classes tracked yet',
      criticalSubjectsCount: 0,
      warningSubjectsCount: 0,
      safeSubjectsCount: 0,
      totalSubjectsCount: 0,
    );
  }
}
