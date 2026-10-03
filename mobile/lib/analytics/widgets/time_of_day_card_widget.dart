import 'package:flutter/material.dart';
import '../models/time_of_day_data.dart';
import '../services/analytics_calculation_engine.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/design_system/components/app_card.dart';

class TimeOfDayCardWidget extends StatelessWidget {
  final TimeOfDayData data;

  const TimeOfDayCardWidget({
    super.key,
    required this.data,
  });

  @override
  Widget build(BuildContext context) {
    final totalMinutes = data.morningMinutes + data.afternoonMinutes + data.eveningMinutes + data.nightMinutes;

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
                  Icon(Icons.wb_sunny_outlined, size: 18, color: AppColors.primary(context)),
                  const SizedBox(width: AppSpacing.xs),
                  Text(
                    'Study Rhythm',
                    style: AppTypography.headingSm.copyWith(
                      color: AppColors.textPrimary(context),
                    ),
                  ),
                ],
              ),
              if (data.peakPeriod != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF59E0B).withOpacity(0.12),
                    borderRadius: AppRadii.full,
                    border: Border.all(color: const Color(0xFFF59E0B).withOpacity(0.3)),
                  ),
                  child: Text(
                    '${data.peakPeriod} Peak',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFFF59E0B),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 2),
          Text(
            'Focus distribution across times of day',
            style: AppTypography.bodyXs.copyWith(color: AppColors.textMuted(context)),
          ),
          const SizedBox(height: AppSpacing.md),

          // 4 Period Breakdown Bars
          _buildPeriodRow(
            context,
            label: 'Morning (5 AM – 12 PM)',
            minutes: data.morningMinutes,
            pomodoros: data.morningPomodoros,
            totalMinutes: totalMinutes,
            color: const Color(0xFFF59E0B), // Amber/Sun
          ),
          const SizedBox(height: AppSpacing.sm),
          _buildPeriodRow(
            context,
            label: 'Afternoon (12 PM – 5 PM)',
            minutes: data.afternoonMinutes,
            pomodoros: data.afternoonPomodoros,
            totalMinutes: totalMinutes,
            color: const Color(0xFF3B82F6), // Blue
          ),
          const SizedBox(height: AppSpacing.sm),
          _buildPeriodRow(
            context,
            label: 'Evening (5 PM – 9 PM)',
            minutes: data.eveningMinutes,
            pomodoros: data.eveningPomodoros,
            totalMinutes: totalMinutes,
            color: const Color(0xFF8B5CF6), // Purple
          ),
          const SizedBox(height: AppSpacing.sm),
          _buildPeriodRow(
            context,
            label: 'Night (9 PM – 5 AM)',
            minutes: data.nightMinutes,
            pomodoros: data.nightPomodoros,
            totalMinutes: totalMinutes,
            color: const Color(0xFF6366F1), // Indigo
          ),
        ],
      ),
    );
  }

  Widget _buildPeriodRow(
    BuildContext context, {
    required String label,
    required int minutes,
    required int pomodoros,
    required int totalMinutes,
    required Color color,
  }) {
    final ratio = totalMinutes > 0 ? (minutes / totalMinutes).clamp(0.0, 1.0) : 0.0;
    final pct = (ratio * 100).round();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textPrimary(context)),
            ),
            Text(
              '${AnalyticsCalculationEngine.formatStudyDuration(minutes)} ($pct%)',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: color),
            ),
          ],
        ),
        const SizedBox(height: 4),
        ClipRRect(
          borderRadius: AppRadii.full,
          child: LinearProgressIndicator(
            value: ratio,
            backgroundColor: AppColors.surfaceMuted(context),
            color: color,
            minHeight: 6,
          ),
        ),
      ],
    );
  }
}
