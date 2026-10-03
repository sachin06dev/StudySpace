import 'package:flutter/material.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/design_system/components/app_card.dart';
import '../../study/models/saved_video.dart';

class DashboardContinueLearning extends StatelessWidget {
  final List<SavedVideo> savedVideos;
  final ValueChanged<SavedVideo> onSelectVideo;
  final VoidCallback onViewAll;

  const DashboardContinueLearning({
    super.key,
    required this.savedVideos,
    required this.onSelectVideo,
    required this.onViewAll,
  });

  @override
  Widget build(BuildContext context) {
    if (savedVideos.isEmpty) return const SizedBox.shrink();

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
                  const Text('📚', style: TextStyle(fontSize: 16)),
                  const SizedBox(width: AppSpacing.xs),
                  Text(
                    'Continue Learning',
                    style: AppTypography.headingSm.copyWith(
                      color: AppColors.textPrimary(context),
                    ),
                  ),
                ],
              ),
              InkWell(
                onTap: onViewAll,
                borderRadius: AppRadii.sm,
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  child: Row(
                    children: [
                      Text(
                        'View all (${savedVideos.length})',
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
            'Recent video lectures and timestamped study notes',
            style: AppTypography.bodyXs.copyWith(color: AppColors.textMuted(context)),
          ),
          const SizedBox(height: AppSpacing.md),

          // Video items
          ...savedVideos.take(3).map((video) {
            return InkWell(
              onTap: () => onSelectVideo(video),
              borderRadius: AppRadii.md,
              child: Container(
                margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  color: AppColors.surfaceMuted(context).withOpacity(0.3),
                  borderRadius: AppRadii.md,
                  border: Border.all(color: AppColors.border(context).withOpacity(0.6)),
                ),
                child: Row(
                  children: [
                    // Thumbnail
                    ClipRRect(
                      borderRadius: AppRadii.sm,
                      child: Container(
                        width: 56,
                        height: 42,
                        color: AppColors.surfaceMuted(context),
                        child: video.thumbnailUrl != null && video.thumbnailUrl!.isNotEmpty
                            ? Image.network(
                                video.thumbnailUrl!,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => const Icon(Icons.play_circle_outline_rounded),
                              )
                            : const Icon(Icons.play_circle_outline_rounded),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),

                    // Details
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            video.title,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textPrimary(context),
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            video.channelName ?? 'Study Video',
                            style: TextStyle(fontSize: 10, color: AppColors.textMuted(context)),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: AppSpacing.xs),
                    Icon(Icons.play_arrow_rounded, color: AppColors.primary(context), size: 20),
                  ],
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}
