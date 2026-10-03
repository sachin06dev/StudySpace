import 'package:flutter/material.dart';
import '../../analytics/models/daily_activity.dart';
import '../../analytics/models/consistency_score_data.dart';
import '../../analytics/widgets/heatmap_grid_widget.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/design_system/components/app_card.dart';

class DashboardConsistencyCard extends StatelessWidget {
  final List<DailyActivity> heatmapDays;
  final StreakStats streaks;
  final ConsistencyScoreData consistencyScore;
  final VoidCallback onOpenAnalytics;

  const DashboardConsistencyCard({
    super.key,
    required this.heatmapDays,
    required this.streaks,
    required this.consistencyScore,
    required this.onOpenAnalytics,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header & Score Pill
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Text('⚡', style: TextStyle(fontSize: 16)),
                  const SizedBox(width: AppSpacing.xs),
                  Text(
                    'Study Journey',
                    style: AppTypography.headingSm.copyWith(
                      color: AppColors.textPrimary(context),
                    ),
                  ),
                ],
              ),
              InkWell(
                onTap: onOpenAnalytics,
                borderRadius: AppRadii.full,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.primary(context).withValues(alpha: 0.12),
                    borderRadius: AppRadii.full,
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Score: ${consistencyScore.overallScore}',
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
          const SizedBox(height: 2),
          Text(
            'Daily consistency, streaks, and qualifying study days',
            style: AppTypography.bodyXs.copyWith(color: AppColors.textMuted(context)),
          ),
          const SizedBox(height: AppSpacing.md),

          // Streak KPI Row
          Row(
            children: [
              Expanded(
                child: _buildPill(
                  context,
                  title: 'Current Streak',
                  value: '${streaks.currentStreak} days',
                  icon: '🔥',
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: _buildPill(
                  context,
                  title: 'Active Days',
                  value: '${streaks.activeDays} days',
                  icon: '🎯',
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: _buildPill(
                  context,
                  title: 'Habit Rating',
                  value: consistencyScore.ratingLabel,
                  icon: '⭐',
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),

          // Mini Heatmap Preview
          HeatmapGridWidget(
            days: heatmapDays,
            streaks: streaks,
            isDashboardPreview: true,
          ),
        ],
      ),
    );
  }

  Widget _buildPill(
    BuildContext context, {
    required String title,
    required String value,
    required String icon,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.surfaceMuted(context).withValues(alpha: 0.5),
        borderRadius: AppRadii.md,
        border: Border.all(color: AppColors.border(context)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(icon, style: const TextStyle(fontSize: 11)),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(fontSize: 10, color: AppColors.textMuted(context)),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 3),
          Text(
            value,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary(context),
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
