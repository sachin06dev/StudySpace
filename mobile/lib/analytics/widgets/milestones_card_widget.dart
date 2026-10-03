import 'package:flutter/material.dart';
import '../models/milestone_data.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/design_system/components/app_card.dart';

class MilestonesCardWidget extends StatelessWidget {
  final MilestoneData data;

  const MilestonesCardWidget({
    super.key,
    required this.data,
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
                  Icon(Icons.workspace_premium_outlined, size: 18, color: AppColors.primary(context)),
                  const SizedBox(width: AppSpacing.xs),
                  Text(
                    'Milestones & Badges',
                    style: AppTypography.headingSm.copyWith(
                      color: AppColors.textPrimary(context),
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primary(context).withOpacity(0.12),
                  borderRadius: AppRadii.full,
                ),
                child: Text(
                  '${data.unlockedCount}/${data.totalCount} unlocked',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary(context),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 2),
          Text(
            'Achievements earned through study consistency',
            style: AppTypography.bodyXs.copyWith(color: AppColors.textMuted(context)),
          ),
          const SizedBox(height: AppSpacing.md),

          // Badges Grid
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: AppSpacing.sm,
              mainAxisSpacing: AppSpacing.sm,
              childAspectRatio: 0.82,
            ),
            itemCount: data.milestones.length,
            itemBuilder: (context, index) {
              final m = data.milestones[index];
              return Container(
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  color: m.isUnlocked
                      ? AppColors.primary(context).withOpacity(0.08)
                      : AppColors.surfaceMuted(context).withOpacity(0.4),
                  borderRadius: AppRadii.md,
                  border: Border.all(
                    color: m.isUnlocked
                        ? AppColors.primary(context).withOpacity(0.35)
                        : AppColors.border(context).withOpacity(0.4),
                  ),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      m.icon,
                      style: TextStyle(
                        fontSize: 24,
                        color: m.isUnlocked ? null : Colors.grey,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      m.title,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: m.isUnlocked ? AppColors.textPrimary(context) : AppColors.textMuted(context),
                      ),
                      textAlign: TextAlign.center,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${m.current}/${m.target}',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: m.isUnlocked ? AppColors.primary(context) : AppColors.textMuted(context),
                      ),
                    ),
                    const SizedBox(height: 4),
                    ClipRRect(
                      borderRadius: AppRadii.full,
                      child: LinearProgressIndicator(
                        value: (m.progressPercent / 100.0).clamp(0.0, 1.0),
                        backgroundColor: AppColors.border(context).withOpacity(0.5),
                        color: m.isUnlocked ? AppColors.primary(context) : Colors.grey.shade400,
                        minHeight: 3,
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
