import 'package:flutter/material.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/app_typography.dart';

class DashboardMetricsRow extends StatelessWidget {
  final String studyTimeFormatted;
  final int pomodoroCount;
  final int completedTasks;
  final int totalTasks;
  final VoidCallback onOpenAnalytics;
  final VoidCallback onOpenPomodoro;
  final VoidCallback onOpenTasks;

  const DashboardMetricsRow({
    super.key,
    required this.studyTimeFormatted,
    required this.pomodoroCount,
    required this.completedTasks,
    required this.totalTasks,
    required this.onOpenAnalytics,
    required this.onOpenPomodoro,
    required this.onOpenTasks,
  });

  @override
  Widget build(BuildContext context) {
    final taskPct = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).round() : 0;
    final taskDescription = totalTasks > 0 ? '$taskPct% done' : 'No tasks yet';

    return Row(
      children: [
        // 1. Study Time Today (Indigo)
        Expanded(
          child: _buildMetricCard(
            context,
            label: 'Study Today',
            value: studyTimeFormatted,
            sublabel: 'View analytics →',
            icon: Icons.access_time_rounded,
            accentColor: AppColors.primary(context),
            textColor: AppColors.primary(context),
            onTap: onOpenAnalytics,
          ),
        ),
        const SizedBox(width: AppSpacing.sm),

        // 2. Pomodoros Today (Emerald)
        Expanded(
          child: _buildMetricCard(
            context,
            label: 'Pomodoros',
            value: '$pomodoroCount',
            sublabel: 'Timer →',
            icon: Icons.check_circle_rounded,
            accentColor: AppColors.success,
            textColor: AppColors.successText(context),
            onTap: onOpenPomodoro,
          ),
        ),
        const SizedBox(width: AppSpacing.sm),

        // 3. Tasks Progress (Amber)
        Expanded(
          child: _buildMetricCard(
            context,
            label: 'Tasks Done',
            value: '$completedTasks / $totalTasks',
            sublabel: taskDescription,
            icon: Icons.assignment_turned_in_rounded,
            accentColor: AppColors.warning,
            textColor: AppColors.warningText(context),
            onTap: onOpenTasks,
          ),
        ),
      ],
    );
  }

  Widget _buildMetricCard(
    BuildContext context, {
    required String label,
    required String value,
    required String sublabel,
    required IconData icon,
    required Color accentColor,
    required Color textColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: AppRadii.lg,
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: AppColors.card(context),
          borderRadius: AppRadii.lg,
          border: Border.all(color: AppColors.border(context)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.all(5),
                  decoration: BoxDecoration(
                    color: accentColor.withValues(alpha: 0.12),
                    borderRadius: AppRadii.sm,
                  ),
                  child: Icon(icon, size: 14, color: accentColor),
                ),
                Icon(Icons.arrow_forward_ios_rounded, size: 10, color: AppColors.textMuted(context)),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: AppColors.textMuted(context),
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 2),
            FittedBox(
              fit: BoxFit.scaleDown,
              alignment: Alignment.centerLeft,
              child: Text(
                value,
                style: AppTypography.headingMd.copyWith(
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary(context),
                ),
              ),
            ),
            const SizedBox(height: 2),
            Text(
              sublabel,
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w600,
                color: textColor,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
