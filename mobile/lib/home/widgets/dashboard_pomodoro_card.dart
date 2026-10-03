import 'package:flutter/material.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/design_system/components/app_card.dart';

class DashboardPomodoroCard extends StatelessWidget {
  final int studyMinutes;
  final int pomodoroCount;
  final String formattedDuration;
  final VoidCallback onStartFocus;

  const DashboardPomodoroCard({
    super.key,
    required this.studyMinutes,
    required this.pomodoroCount,
    required this.formattedDuration,
    required this.onStartFocus,
  });

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
                  const Text('🍅', style: TextStyle(fontSize: 16)),
                  const SizedBox(width: AppSpacing.xs),
                  Text(
                    'Focus Timer',
                    style: AppTypography.headingSm.copyWith(
                      color: AppColors.textPrimary(context),
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.successBg(context),
                  borderRadius: AppRadii.full,
                ),
                child: Text(
                  '$pomodoroCount sessions',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: AppColors.successText(context),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 2),
          Text(
            'High-productivity Pomodoro intervals',
            style: AppTypography.bodyXs.copyWith(color: AppColors.textMuted(context)),
          ),
          const SizedBox(height: AppSpacing.md),

          // Focus stats container
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: AppColors.surfaceMuted(context).withValues(alpha: 0.5),
              borderRadius: AppRadii.md,
              border: Border.all(color: AppColors.border(context)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                Column(
                  children: [
                    Text(
                      'Today Focus Time',
                      style: TextStyle(fontSize: 10, color: AppColors.textMuted(context)),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      formattedDuration,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary(context),
                      ),
                    ),
                  ],
                ),
                Container(height: 24, width: 1, color: AppColors.border(context)),
                Column(
                  children: [
                    Text(
                      'Completed Cycles',
                      style: TextStyle(fontSize: 10, color: AppColors.textMuted(context)),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '$pomodoroCount',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary(context),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.md),

          // Start Focus Button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: onStartFocus,
              icon: const Icon(Icons.play_arrow_rounded),
              label: const Text('Start 25-min Focus', style: TextStyle(fontWeight: FontWeight.bold)),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary(context),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: AppRadii.md),
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
