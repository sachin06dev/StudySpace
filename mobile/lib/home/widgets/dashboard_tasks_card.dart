import 'package:flutter/material.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/design_system/components/app_card.dart';
import '../../tasks/models/task.dart';

class DashboardTasksCard extends StatelessWidget {
  final List<Task> pendingTasks;
  final int totalTasks;
  final int completedTasks;
  final ValueChanged<Task> onToggleTask;
  final VoidCallback onAddTask;
  final VoidCallback onManageTasks;

  const DashboardTasksCard({
    super.key,
    required this.pendingTasks,
    required this.totalTasks,
    required this.completedTasks,
    required this.onToggleTask,
    required this.onAddTask,
    required this.onManageTasks,
  });

  Color _getPriorityColor(String priority, BuildContext context) {
    switch (priority.toLowerCase()) {
      case 'high':
        return AppColors.dangerText(context);
      case 'medium':
        return AppColors.warningText(context);
      case 'low':
      default:
        return AppColors.accentBlue;
    }
  }

  Color _getPriorityBg(String priority, BuildContext context) {
    switch (priority.toLowerCase()) {
      case 'high':
        return AppColors.dangerBg(context);
      case 'medium':
        return AppColors.warningBg(context);
      case 'low':
      default:
        return AppColors.primarySubtle(context);
    }
  }

  @override
  Widget build(BuildContext context) {
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
                  const Text('📋', style: TextStyle(fontSize: 16)),
                  const SizedBox(width: AppSpacing.xs),
                  Text(
                    'Pending Tasks',
                    style: AppTypography.headingSm.copyWith(
                      color: AppColors.textPrimary(context),
                    ),
                  ),
                ],
              ),
              InkWell(
                onTap: onManageTasks,
                borderRadius: AppRadii.sm,
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  child: Row(
                    children: [
                      Text(
                        'Manage ($completedTasks/$totalTasks)',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary(context),
                        ),
                      ),
                      const SizedBox(width: 2),
                      Icon(Icons.arrow_forward_ios_rounded, size: 10, color: AppColors.primary(context)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),

          // Tasks List or Empty State
          if (pendingTasks.isEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: AppSpacing.lg, horizontal: AppSpacing.md),
              decoration: BoxDecoration(
                color: AppColors.surfaceMuted(context).withValues(alpha: 0.5),
                borderRadius: AppRadii.md,
              ),
              child: Column(
                children: [
                  const Icon(Icons.check_circle_outline_rounded, size: 32, color: AppColors.success),
                  const SizedBox(height: 6),
                  Text(
                    'All caught up!',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textPrimary(context)),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'No pending tasks for today.',
                    style: TextStyle(fontSize: 11, color: AppColors.textMuted(context)),
                  ),
                ],
              ),
            )
          else
            ...pendingTasks.take(4).map((task) {
              final prioColor = _getPriorityColor(task.priority, context);
              final prioBg = _getPriorityBg(task.priority, context);
              return Container(
                margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  color: AppColors.surfaceMuted(context).withValues(alpha: 0.4),
                  borderRadius: AppRadii.md,
                  border: Border.all(color: AppColors.border(context)),
                ),
                child: Row(
                  children: [
                    Checkbox(
                      value: task.isCompleted,
                      activeColor: AppColors.primary(context),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                      onChanged: (_) => onToggleTask(task),
                    ),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            task.title,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textPrimary(context),
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          if (task.description != null && task.description!.isNotEmpty)
                            Text(
                              task.description!,
                              style: TextStyle(fontSize: 11, color: AppColors.textMuted(context)),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                        ],
                      ),
                    ),
                    const SizedBox(width: AppSpacing.xs),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: prioBg,
                        borderRadius: AppRadii.sm,
                      ),
                      child: Text(
                        task.priority.toUpperCase(),
                        style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: prioColor),
                      ),
                    ),
                  ],
                ),
              );
            }),
          const SizedBox(height: AppSpacing.sm),

          // Add Task Quick Action Button
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: onAddTask,
              icon: const Icon(Icons.add_rounded, size: 16),
              label: const Text('Add Task', style: TextStyle(fontSize: 12)),
              style: OutlinedButton.styleFrom(
                shape: RoundedRectangleBorder(borderRadius: AppRadii.md),
                padding: const EdgeInsets.symmetric(vertical: 10),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
