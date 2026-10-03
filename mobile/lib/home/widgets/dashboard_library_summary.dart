import 'package:flutter/material.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/design_system/components/app_card.dart';

class DashboardLibrarySummary extends StatelessWidget {
  final int videosCount;
  final int notesCount;
  final int tasksCount;
  final int subjectsCount;

  const DashboardLibrarySummary({
    super.key,
    required this.videosCount,
    required this.notesCount,
    required this.tasksCount,
    required this.subjectsCount,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text('🗂️', style: TextStyle(fontSize: 16)),
              const SizedBox(width: AppSpacing.xs),
              Text(
                'Study Library Summary',
                style: AppTypography.headingSm.copyWith(
                  color: AppColors.textPrimary(context),
                ),
              ),
            ],
          ),
          const SizedBox(height: 2),
          Text(
            'Saved resources across your local workspace',
            style: AppTypography.bodyXs.copyWith(color: AppColors.textMuted(context)),
          ),
          const SizedBox(height: AppSpacing.md),

          Row(
            children: [
              Expanded(
                child: _buildTile(
                  context,
                  title: 'Videos',
                  count: videosCount,
                  icon: Icons.video_library_rounded,
                  color: AppColors.danger,
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: _buildTile(
                  context,
                  title: 'Notes',
                  count: notesCount,
                  icon: Icons.edit_note_rounded,
                  color: AppColors.primary(context),
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: _buildTile(
                  context,
                  title: 'Tasks',
                  count: tasksCount,
                  icon: Icons.checklist_rounded,
                  color: AppColors.warning,
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: _buildTile(
                  context,
                  title: 'Subjects',
                  count: subjectsCount,
                  icon: Icons.school_rounded,
                  color: AppColors.success,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTile(
    BuildContext context, {
    required String title,
    required int count,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.sm),
      decoration: BoxDecoration(
        color: AppColors.surfaceMuted(context).withValues(alpha: 0.5),
        borderRadius: AppRadii.md,
        border: Border.all(color: AppColors.border(context)),
      ),
      child: Column(
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(height: 4),
          Text(
            '$count',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary(context),
            ),
          ),
          Text(
            title,
            style: TextStyle(fontSize: 9, color: AppColors.textMuted(context)),
          ),
        ],
      ),
    );
  }
}
