import 'package:flutter/material.dart';
import '../../attendance/models/overall_attendance.dart';
import '../../attendance/models/subject_attendance.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_typography.dart';

class AttendanceQuickStatsCard extends StatelessWidget {
  final OverallAttendanceSummary summary;
  final VoidCallback onTap;

  const AttendanceQuickStatsCard({
    super.key,
    required this.summary,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    Color statusColor;
    Color statusTextColor;
    Color statusBgColor;
    String statusLabel;
    IconData statusIcon;

    switch (summary.riskState) {
      case RiskState.safe:
        statusColor = AppColors.success;
        statusTextColor = AppColors.successText(context);
        statusBgColor = AppColors.successBg(context);
        statusLabel = 'Safe';
        statusIcon = Icons.check_circle_outline;
        break;
      case RiskState.warning:
        statusColor = AppColors.warning;
        statusTextColor = AppColors.warningText(context);
        statusBgColor = AppColors.warningBg(context);
        statusLabel = 'Warning';
        statusIcon = Icons.warning_amber_rounded;
        break;
      case RiskState.critical:
        statusColor = AppColors.danger;
        statusTextColor = AppColors.dangerText(context);
        statusBgColor = AppColors.dangerBg(context);
        statusLabel = 'Critical';
        statusIcon = Icons.error_outline_rounded;
        break;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: AppColors.card(context),
        borderRadius: AppRadii.lg,
        border: Border.all(color: AppColors.border(context)),
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: AppRadii.lg,
        child: InkWell(
          onTap: onTap,
          borderRadius: AppRadii.lg,
          child: Padding(
            padding: const EdgeInsets.all(18.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'ATTENDANCE',
                      style: AppTypography.overline.copyWith(
                        color: AppColors.textMuted(context),
                        letterSpacing: 1.0,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: statusBgColor,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(statusIcon, size: 14, color: statusTextColor),
                          const SizedBox(width: 4),
                          Text(
                            statusLabel,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: statusTextColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    Text(
                      '${summary.overallPercentage.toStringAsFixed(1)}%',
                      style: AppTypography.display.copyWith(
                        fontSize: 34,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -1.0,
                        color: AppColors.textPrimary(context),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      'Target ${summary.targetPercentage.toStringAsFixed(0)}%',
                      style: AppTypography.caption.copyWith(
                        color: AppColors.textMuted(context),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: summary.totalClasses > 0
                        ? (summary.overallPercentage / 100.0).clamp(0.0, 1.0)
                        : 1.0,
                    backgroundColor: AppColors.surfaceMuted(context),
                    valueColor: AlwaysStoppedAnimation<Color>(statusColor),
                    minHeight: 6,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      summary.statusMessage,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: statusTextColor,
                      ),
                    ),
                    Text(
                      '${summary.totalAttended} / ${summary.totalClasses} classes',
                      style: AppTypography.caption.copyWith(
                        color: AppColors.textMuted(context),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
