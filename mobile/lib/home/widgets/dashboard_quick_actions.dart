import 'package:flutter/material.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/design_system/components/app_card.dart';

class DashboardQuickActions extends StatelessWidget {
  final VoidCallback onAddTask;
  final VoidCallback onStartFocus;
  final VoidCallback onAddVideo;
  final VoidCallback onViewTimetable;
  final VoidCallback onScanTimetable;
  final VoidCallback onOpenAnalytics;

  const DashboardQuickActions({
    super.key,
    required this.onAddTask,
    required this.onStartFocus,
    required this.onAddVideo,
    required this.onViewTimetable,
    required this.onScanTimetable,
    required this.onOpenAnalytics,
  });

  @override
  Widget build(BuildContext context) {
    final actions = [
      (
        label: 'Add Task',
        desc: 'New goal',
        icon: Icons.add_task_rounded,
        color: AppColors.primary(context),
        onTap: onAddTask,
      ),
      (
        label: 'Start Focus',
        desc: '25m Timer',
        icon: Icons.play_circle_outline_rounded,
        color: AppColors.success,
        onTap: onStartFocus,
      ),
      (
        label: 'Add Video',
        desc: 'YouTube',
        icon: Icons.video_collection_outlined,
        color: AppColors.danger,
        onTap: onAddVideo,
      ),
      (
        label: 'Timetable',
        desc: 'Schedule',
        icon: Icons.calendar_month_outlined,
        color: AppColors.accentViolet,
        onTap: onViewTimetable,
      ),
      (
        label: 'AI Scanner',
        desc: 'OCR Parse',
        icon: Icons.document_scanner_outlined,
        color: AppColors.accentBlue,
        onTap: onScanTimetable,
      ),
      (
        label: 'Analytics',
        desc: 'Habits',
        icon: Icons.insights_rounded,
        color: AppColors.warning,
        onTap: onOpenAnalytics,
      ),
    ];

    return AppCard(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text('⚡', style: TextStyle(fontSize: 16)),
              const SizedBox(width: AppSpacing.xs),
              Text(
                'Quick Actions',
                style: AppTypography.headingSm.copyWith(
                  color: AppColors.textPrimary(context),
                ),
              ),
            ],
          ),
          const SizedBox(height: 2),
          Text(
            'Fast shortcuts to study tools',
            style: AppTypography.bodyXs.copyWith(color: AppColors.textMuted(context)),
          ),
          const SizedBox(height: AppSpacing.md),

          // 3x2 Grid
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: AppSpacing.sm,
              mainAxisSpacing: AppSpacing.sm,
              childAspectRatio: 1.15,
            ),
            itemCount: actions.length,
            itemBuilder: (context, index) {
              final action = actions[index];
              return InkWell(
                onTap: action.onTap,
                borderRadius: AppRadii.md,
                child: Container(
                  padding: const EdgeInsets.all(AppSpacing.sm),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceMuted(context).withValues(alpha: 0.5),
                    borderRadius: AppRadii.md,
                    border: Border.all(color: AppColors.border(context)),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: action.color.withValues(alpha: 0.12),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(action.icon, size: 16, color: action.color),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        action.label,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary(context),
                        ),
                        textAlign: TextAlign.center,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        action.desc,
                        style: TextStyle(
                          fontSize: 9,
                          color: AppColors.textMuted(context),
                        ),
                        textAlign: TextAlign.center,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
