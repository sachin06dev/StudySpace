import 'package:flutter/material.dart';
import '../models/full_analytics_data.dart';
import '../../attendance/models/subject_attendance.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/design_system/components/app_card.dart';

class AttendanceAnalyticsCardWidget extends StatelessWidget {
  final AnalyticsAttendanceMetrics metrics;
  final List<SubjectAttendanceSummary> subjectSummaries;

  const AttendanceAnalyticsCardWidget({
    super.key,
    required this.metrics,
    this.subjectSummaries = const [],
  });

  Color _getRiskColor(double percentage, double target) {
    if (percentage >= target) return AppColors.success;
    if (percentage >= target - 10) return AppColors.warning;
    return AppColors.danger;
  }

  @override
  Widget build(BuildContext context) {
    final statusColor = _getRiskColor(metrics.overallPercentage, metrics.targetPercentage);

    return AppCard(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Text('🎓', style: TextStyle(fontSize: 16)),
                  const SizedBox(width: AppSpacing.xs),
                  Text(
                    'Attendance Overview',
                    style: AppTypography.headingSm.copyWith(
                      color: AppColors.textPrimary(context),
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.12),
                  borderRadius: AppRadii.full,
                  border: Border.all(color: statusColor.withOpacity(0.3)),
                ),
                child: Text(
                  '${metrics.overallPercentage.toStringAsFixed(1)}%',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: statusColor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),

          // Overview KPI Chips
          Row(
            children: [
              Expanded(
                child: _buildMetricTile(
                  context,
                  title: 'Classes Attended',
                  value: '${metrics.totalAttended} / ${metrics.totalClasses}',
                  icon: Icons.check_circle_outline_rounded,
                  color: AppColors.success,
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: _buildMetricTile(
                  context,
                  title: 'Target Required',
                  value: '${metrics.targetPercentage.toStringAsFixed(0)}%',
                  icon: Icons.flag_outlined,
                  color: AppColors.primary(context),
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: _buildMetricTile(
                  context,
                  title: metrics.overallPercentage >= metrics.targetPercentage ? 'Safe to Miss' : 'Must Attend',
                  value: metrics.overallPercentage >= metrics.targetPercentage
                      ? '${metrics.bunkAllowance} cls'
                      : '${metrics.recoveryRequirement} cls',
                  icon: metrics.overallPercentage >= metrics.targetPercentage
                      ? Icons.beach_access_rounded
                      : Icons.warning_amber_rounded,
                  color: metrics.overallPercentage >= metrics.targetPercentage
                      ? AppColors.success
                      : AppColors.danger,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),

          // Risk breakdown badges
          Row(
            children: [
              _buildRiskCountPill(context, 'Safe', metrics.safeCount, AppColors.success),
              const SizedBox(width: AppSpacing.xs),
              _buildRiskCountPill(context, 'Warning', metrics.warningCount, AppColors.warning),
              const SizedBox(width: AppSpacing.xs),
              _buildRiskCountPill(context, 'Critical', metrics.criticalCount, AppColors.danger),
            ],
          ),

          // Subject comparison list
          if (subjectSummaries.isNotEmpty) ...[
            const Divider(height: 28),
            Text(
              'Subject Performance',
              style: AppTypography.headingXs.copyWith(color: AppColors.textPrimary(context)),
            ),
            const SizedBox(height: AppSpacing.sm),
            ...subjectSummaries.map((sub) {
              final subColor = _getRiskColor(sub.percentage, sub.targetPercentage);
              return Container(
                margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.surfaceMuted(context).withOpacity(0.4),
                  borderRadius: AppRadii.md,
                  border: Border.all(color: AppColors.border(context).withOpacity(0.6)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            sub.subject.name,
                            style: AppTypography.bodySm.copyWith(
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimary(context),
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Text(
                          '${sub.percentage.toStringAsFixed(1)}%',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: subColor,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    ClipRRect(
                      borderRadius: AppRadii.full,
                      child: LinearProgressIndicator(
                        value: (sub.percentage / 100.0).clamp(0.0, 1.0),
                        backgroundColor: AppColors.border(context).withOpacity(0.5),
                        color: subColor,
                        minHeight: 5,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '${sub.effectiveAttended} / ${sub.effectiveTotal} attended',
                          style: TextStyle(fontSize: 11, color: AppColors.textMuted(context)),
                        ),
                        Text(
                          sub.statusMessage,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w500,
                            color: subColor,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            }),
          ],
        ],
      ),
    );
  }

  Widget _buildMetricTile(
    BuildContext context, {
    required String title,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.surfaceMuted(context).withOpacity(0.4),
        borderRadius: AppRadii.md,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 12, color: color),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(fontSize: 10, color: AppColors.textMuted(context)),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              value,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary(context),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRiskCountPill(BuildContext context, String label, int count, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: AppRadii.sm,
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 6,
              height: 6,
              decoration: BoxDecoration(color: color, shape: BoxShape.circle),
            ),
            const SizedBox(width: 4),
            Text(
              '$label: $count',
              style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: color),
            ),
          ],
        ),
      ),
    );
  }
}
