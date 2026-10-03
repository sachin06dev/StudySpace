import '../../timetable/models/subject.dart';

enum RiskState { safe, warning, critical }

class SubjectAttendanceSummary {
  final Subject subject;
  final int effectiveAttended;
  final int effectiveTotal;
  final int presentCount;
  final int absentCount;
  final int cancelledCount;
  final double percentage;
  final double targetPercentage;
  final int bunkAllowance;
  final int recoveryRequirement;
  final RiskState riskState;
  final String statusMessage;

  SubjectAttendanceSummary({
    required this.subject,
    required this.effectiveAttended,
    required this.effectiveTotal,
    required this.presentCount,
    required this.absentCount,
    required this.cancelledCount,
    required this.percentage,
    required this.targetPercentage,
    required this.bunkAllowance,
    required this.recoveryRequirement,
    required this.riskState,
    required this.statusMessage,
  });

  factory SubjectAttendanceSummary.empty() {
    return SubjectAttendanceSummary(
      subject: Subject.empty(),
      effectiveAttended: 0,
      effectiveTotal: 0,
      presentCount: 0,
      absentCount: 0,
      cancelledCount: 0,
      percentage: 100.0,
      targetPercentage: 75.0,
      bunkAllowance: 0,
      recoveryRequirement: 0,
      riskState: RiskState.safe,
      statusMessage: '',
    );
  }
}
