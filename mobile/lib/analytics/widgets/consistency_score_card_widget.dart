import 'package:flutter/material.dart';
import '../models/consistency_score_data.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/design_system/components/app_card.dart';

class ConsistencyScoreCardWidget extends StatelessWidget {
  final ConsistencyScoreData data;

  const ConsistencyScoreCardWidget({
    super.key,
    required this.data,
  });

  Color _getScoreColor(int score, BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    if (score >= 85) return isDark ? const Color(0xFF10B981) : const Color(0xFF047857);
    if (score >= 70) return const Color(0xFF6366F1);
    if (score >= 50) return isDark ? const Color(0xFF3B82F6) : const Color(0xFF1D4ED8);
    if (score >= 25) return isDark ? const Color(0xFFF59E0B) : const Color(0xFF92400E);
    return isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B);
  }

  @override
  Widget build(BuildContext context) {
    final scoreColor = _getScoreColor(data.overallScore, context);

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
                  Icon(Icons.track_changes_rounded, size: 18, color: AppColors.primary(context)),
                  const SizedBox(width: AppSpacing.xs),
                  Text(
                    'Consistency Score',
                    style: AppTypography.headingSm.copyWith(
                      color: AppColors.textPrimary(context),
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: scoreColor.withOpacity(0.12),
                  borderRadius: AppRadii.full,
                  border: Border.all(color: scoreColor.withOpacity(0.3)),
                ),
                child: Text(
                  data.ratingLabel,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: scoreColor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),

          // Big Score Display Row
          Row(
            children: [
              Text(
                '${data.overallScore}',
                style: TextStyle(
                  fontSize: 38,
                  fontWeight: FontWeight.w900,
                  color: scoreColor,
                  letterSpacing: -1,
                ),
              ),
              const SizedBox(width: 4),
              Padding(
                padding: const EdgeInsets.only(top: 14.0),
                child: Text(
                  '/100',
                  style: AppTypography.bodySm.copyWith(
                    color: AppColors.textMuted(context),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const Spacer(),
              // Mini circular ring
              SizedBox(
                width: 44,
                height: 44,
                child: CircularProgressIndicator(
                  value: (data.overallScore / 100.0).clamp(0.0, 1.0),
                  backgroundColor: AppColors.surfaceMuted(context),
                  color: scoreColor,
                  strokeWidth: 5,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),

          // 3 Factor Progress Bars
          _buildFactorRow(
            context,
            label: 'Active Study Days',
            scoreText: '${data.studyDaysScore.toStringAsFixed(1)} / 40 pts',
            sublabel: '${data.activeDaysLast30} of 30 days',
            progress: (data.studyDaysScore / 40.0).clamp(0.0, 1.0),
            color: const Color(0xFF10B981),
          ),
          const SizedBox(height: AppSpacing.sm),
          _buildFactorRow(
            context,
            label: 'Consistency Streak',
            scoreText: '${data.streakScore.toStringAsFixed(1)} / 35 pts',
            sublabel: '${data.currentStreak} of 14 target days',
            progress: (data.streakScore / 35.0).clamp(0.0, 1.0),
            color: const Color(0xFF6366F1),
          ),
          const SizedBox(height: AppSpacing.sm),
          _buildFactorRow(
            context,
            label: 'Weekly Study Goal',
            scoreText: '${data.goalScore.toStringAsFixed(1)} / 25 pts',
            sublabel: '${data.weekStudyMinutes} of ${data.goalMinutes} min',
            progress: (data.goalScore / 25.0).clamp(0.0, 1.0),
            color: const Color(0xFF3B82F6),
          ),

          // Improvement Tips
          if (data.improvements.isNotEmpty) ...[
            const Divider(height: 28),
            Text(
              'How to Gain Points',
              style: AppTypography.headingXs.copyWith(color: AppColors.textPrimary(context)),
            ),
            const SizedBox(height: AppSpacing.xs),
            ...data.improvements.map((tip) {
              return Padding(
                padding: const EdgeInsets.only(top: 6.0),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      margin: const EdgeInsets.only(top: 4),
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color: scoreColor,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: Text(
                        tip.action,
                        style: AppTypography.bodyXs.copyWith(
                          color: AppColors.textMuted(context),
                        ),
                      ),
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

  Widget _buildFactorRow(
    BuildContext context, {
    required String label,
    required String scoreText,
    required String sublabel,
    required double progress,
    required Color color,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: AppTypography.bodyXs.copyWith(fontWeight: FontWeight.w600, color: AppColors.textPrimary(context))),
            Text(scoreText, style: AppTypography.bodyXs.copyWith(fontWeight: FontWeight.bold, color: color)),
          ],
        ),
        const SizedBox(height: 4),
        ClipRRect(
          borderRadius: AppRadii.full,
          child: LinearProgressIndicator(
            value: progress,
            backgroundColor: AppColors.surfaceMuted(context),
            color: color,
            minHeight: 5,
          ),
        ),
        const SizedBox(height: 2),
        Text(sublabel, style: TextStyle(fontSize: 10, color: AppColors.textMuted(context))),
      ],
    );
  }
}
