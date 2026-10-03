import 'package:flutter/material.dart';
import '../models/pomodoro_analytics_data.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/design_system/components/app_card.dart';

class PomodoroStatsCardWidget extends StatelessWidget {
  final PomodoroAnalyticsData data;

  const PomodoroStatsCardWidget({
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
                  const Text('⏱️', style: TextStyle(fontSize: 16)),
                  const SizedBox(width: AppSpacing.xs),
                  Text(
                    'Pomodoro Focus Insights',
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
                  '${data.totalCompleted} sessions',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary(context),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),

          // 2x2 KPI Grid
          Row(
            children: [
              Expanded(
                child: _buildMetricTile(
                  context,
                  title: 'Total Focus',
                  value: data.formattedFocusTime,
                  icon: Icons.access_time_filled_rounded,
                  color: const Color(0xFF6366F1),
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: _buildMetricTile(
                  context,
                  title: 'Avg Session',
                  value: '${data.averageSessionMinutes} min',
                  icon: Icons.av_timer_rounded,
                  color: const Color(0xFF10B981),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Row(
            children: [
              Expanded(
                child: _buildMetricTile(
                  context,
                  title: 'Longest Session',
                  value: data.formattedLongestSession,
                  icon: Icons.trending_up_rounded,
                  color: const Color(0xFFF59E0B),
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: _buildMetricTile(
                  context,
                  title: 'Best Day',
                  value: data.bestDayOfWeek != null ? data.bestDayOfWeek!.dayName : 'None',
                  icon: Icons.star_rounded,
                  color: const Color(0xFFEC4899),
                ),
              ),
            ],
          ),

          // Recent Sessions List
          if (data.recentSessions.isNotEmpty) ...[
            const Divider(height: 28),
            Text(
              'Recent Focus Sessions',
              style: AppTypography.headingXs.copyWith(color: AppColors.textPrimary(context)),
            ),
            const SizedBox(height: AppSpacing.sm),
            ...data.recentSessions.take(5).map((session) {
              return Container(
                margin: const EdgeInsets.only(bottom: AppSpacing.xs),
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
                decoration: BoxDecoration(
                  color: AppColors.surfaceMuted(context).withOpacity(0.3),
                  borderRadius: AppRadii.md,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: AppColors.primary(context).withOpacity(0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(Icons.check, size: 12, color: AppColors.primary(context)),
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              session.dateLabel,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textPrimary(context),
                              ),
                            ),
                            Text(
                              session.timeLabel,
                              style: TextStyle(fontSize: 10, color: AppColors.textMuted(context)),
                            ),
                          ],
                        ),
                      ],
                    ),
                    Text(
                      session.formattedDuration,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary(context),
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

  Widget _buildMetricTile(
    BuildContext context, {
    required String title,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Container(
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
            children: [
              Icon(icon, size: 14, color: color),
              const SizedBox(width: 6),
              Text(
                title,
                style: TextStyle(fontSize: 11, color: AppColors.textMuted(context)),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary(context),
            ),
          ),
        ],
      ),
    );
  }
}
