import 'package:flutter/material.dart';
import '../models/weekly_graph_data.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/design_system/components/app_card.dart';

class WeeklyStudyChartWidget extends StatelessWidget {
  final WeeklyGraphData data;

  const WeeklyStudyChartWidget({
    super.key,
    required this.data,
  });

  @override
  Widget build(BuildContext context) {
    final maxMinutes = data.days.fold<int>(60, (max, d) => d.studyMinutes > max ? d.studyMinutes : max);

    return AppCard(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header & Stats
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Text('📊', style: TextStyle(fontSize: 16)),
                        const SizedBox(width: AppSpacing.xs),
                        Expanded(
                          child: Text(
                            'Study Time — This Week',
                            style: AppTypography.headingSm.copyWith(
                              color: AppColors.textPrimary(context),
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Monday to Sunday focus breakdown',
                      style: AppTypography.bodyXs.copyWith(
                        color: AppColors.textMuted(context),
                      ),
                    ),
                  ],
                ),
              ),
              // Comparison Pill
              _buildComparisonBadge(context),
            ],
          ),
          const SizedBox(height: AppSpacing.md),

          // Total & Daily Average Row
          Container(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
            decoration: BoxDecoration(
              color: AppColors.surfaceMuted(context).withOpacity(0.5),
              borderRadius: AppRadii.md,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                Column(
                  children: [
                    Text(
                      'Total This Week',
                      style: AppTypography.bodyXs.copyWith(color: AppColors.textMuted(context)),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      data.formattedWeekTotal,
                      style: AppTypography.headingSm.copyWith(
                        color: AppColors.primary(context),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                Container(
                  height: 28,
                  width: 1,
                  color: AppColors.border(context),
                ),
                Column(
                  children: [
                    Text(
                      'Daily Average',
                      style: AppTypography.bodyXs.copyWith(color: AppColors.textMuted(context)),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      data.formattedDailyAverage,
                      style: AppTypography.headingSm.copyWith(
                        color: AppColors.textPrimary(context),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),

          // 7-Column Bar Chart
          SizedBox(
            height: 180,
            child: LayoutBuilder(
              builder: (context, constraints) {
                return Stack(
                  children: [
                    // 20-minute threshold dashed line
                    if (maxMinutes >= 20)
                      Positioned(
                        left: 0,
                        right: 0,
                        bottom: 30 + ((20 / maxMinutes) * (180 - 65)),
                        child: Row(
                          children: List.generate(
                            30,
                            (index) => Expanded(
                              child: Container(
                                height: 1,
                                color: index % 2 == 0
                                    ? AppColors.textMuted(context).withOpacity(0.35)
                                    : Colors.transparent,
                              ),
                            ),
                          ),
                        ),
                      ),

                    // 7 Bars
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: data.days.map((day) {
                        final barHeight = maxMinutes > 0
                            ? ((day.studyMinutes / maxMinutes) * (180 - 65)).clamp(6.0, 180 - 65.0)
                            : 6.0;

                        return Expanded(
                          child: InkWell(
                            borderRadius: AppRadii.md,
                            onTap: () => _showDayDetails(context, day),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 2.0),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.end,
                                children: [
                                  // Top duration label
                                  SizedBox(
                                    height: 14,
                                    child: FittedBox(
                                      fit: BoxFit.scaleDown,
                                      child: Text(
                                        day.studyMinutes > 0 ? '${day.studyMinutes}m' : '',
                                        style: TextStyle(
                                          fontSize: 10,
                                          fontWeight: FontWeight.w600,
                                          color: day.isToday
                                              ? AppColors.primary(context)
                                              : AppColors.textMuted(context),
                                        ),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 4),

                                  // Bar track & fill
                                  Container(
                                    height: 180 - 65,
                                    width: double.infinity,
                                    constraints: const BoxConstraints(maxWidth: 36),
                                    decoration: BoxDecoration(
                                      color: AppColors.surfaceMuted(context),
                                      borderRadius: AppRadii.sm,
                                      border: Border.all(
                                        color: day.isToday
                                            ? AppColors.primary(context).withOpacity(0.4)
                                            : Colors.transparent,
                                      ),
                                    ),
                                    alignment: Alignment.bottomCenter,
                                    child: Stack(
                                      alignment: Alignment.bottomCenter,
                                      children: [
                                        AnimatedContainer(
                                          duration: const Duration(milliseconds: 400),
                                          curve: Curves.easeOutCubic,
                                          height: barHeight,
                                          width: double.infinity,
                                          decoration: BoxDecoration(
                                            borderRadius: AppRadii.sm,
                                            gradient: LinearGradient(
                                              begin: Alignment.bottomCenter,
                                              end: Alignment.topCenter,
                                              colors: day.isToday
                                                  ? [
                                                      AppColors.primary(context),
                                                      AppColors.primary(context).withOpacity(0.75),
                                                    ]
                                                  : day.isQualifying
                                                      ? [
                                                          const Color(0xFF6366F1),
                                                          const Color(0xFF818CF8),
                                                        ]
                                                      : day.studyMinutes > 0
                                                          ? [
                                                              AppColors.primary(context).withOpacity(0.3),
                                                              AppColors.primary(context).withOpacity(0.45),
                                                            ]
                                                          : [
                                                              Colors.transparent,
                                                              Colors.transparent,
                                                            ],
                                            ),
                                          ),
                                        ),
                                        if (day.isQualifying)
                                          Positioned(
                                            top: (180 - 65) - barHeight + 4,
                                            child: Container(
                                              padding: const EdgeInsets.all(2),
                                              decoration: BoxDecoration(
                                                color: Colors.white.withOpacity(0.9),
                                                shape: BoxShape.circle,
                                              ),
                                              child: const Icon(
                                                Icons.check,
                                                size: 8,
                                                color: AppColors.success,
                                              ),
                                            ),
                                          ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(height: 6),

                                  // Day label
                                  Text(
                                    day.dayName,
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: day.isToday ? FontWeight.bold : FontWeight.w500,
                                      color: day.isToday
                                          ? AppColors.primary(context)
                                          : AppColors.textPrimary(context),
                                    ),
                                  ),
                                  if (day.isToday)
                                    Container(
                                      margin: const EdgeInsets.only(top: 2),
                                      width: 4,
                                      height: 4,
                                      decoration: BoxDecoration(
                                        color: AppColors.primary(context),
                                        shape: BoxShape.circle,
                                      ),
                                    )
                                  else
                                    const SizedBox(height: 6),
                                ],
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                );
              },
            ),
          ),
          const SizedBox(height: AppSpacing.sm),

          // Footer
          Row(
            children: [
              Container(
                width: 12,
                height: 1,
                color: AppColors.textMuted(context),
              ),
              const SizedBox(width: AppSpacing.xs),
              Expanded(
                child: Text(
                  'Dashed line indicates 20-min daily qualifying threshold',
                  style: AppTypography.bodyXs.copyWith(
                    color: AppColors.textMuted(context),
                    fontSize: 10,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildComparisonBadge(BuildContext context) {
    switch (data.vsLastWeekStatus) {
      case VsLastWeekStatus.up:
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: AppColors.successBg(context),
            borderRadius: AppRadii.sm,
            border: Border.all(color: AppColors.successBorder(context)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.arrow_upward_rounded, size: 12, color: AppColors.successText(context)),
              const SizedBox(width: 2),
              Text(
                '+${data.vsLastWeekPercent}% vs last week',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.successText(context)),
              ),
            ],
          ),
        );
      case VsLastWeekStatus.down:
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: AppColors.dangerBg(context),
            borderRadius: AppRadii.sm,
            border: Border.all(color: AppColors.dangerBorder(context)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.arrow_downward_rounded, size: 12, color: AppColors.dangerText(context)),
              const SizedBox(width: 2),
              Text(
                '-${data.vsLastWeekPercent}% vs last week',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.dangerText(context)),
              ),
            ],
          ),
        );
      case VsLastWeekStatus.same:
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: AppColors.surfaceMuted(context),
            borderRadius: AppRadii.sm,
          ),
          child: Text(
            '0% vs last week',
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textMuted(context)),
          ),
        );
      case VsLastWeekStatus.noData:
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: AppColors.surfaceMuted(context),
            borderRadius: AppRadii.sm,
          ),
          child: Text(
            'No previous week',
            style: TextStyle(fontSize: 11, color: AppColors.textMuted(context)),
          ),
        );
    }
  }

  void _showDayDetails(BuildContext context, WeeklyGraphDay day) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadii.lgVal)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '${day.dayName}, ${day.dateStr}',
                    style: AppTypography.headingSm.copyWith(color: AppColors.textPrimary(context)),
                  ),
                  if (day.isToday)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.primary(context).withOpacity(0.15),
                        borderRadius: AppRadii.full,
                      ),
                      child: Text(
                        'Today',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary(context)),
                      ),
                    ),
                ],
              ),
              const Divider(height: 24),
              _buildDetailRow('Study Time', day.formattedDuration, isHighlighted: true, context: context),
              const SizedBox(height: AppSpacing.sm),
              _buildDetailRow('Completed Pomodoros', '${day.pomodoroCount}', context: context),
              const SizedBox(height: AppSpacing.sm),
              _buildDetailRow(
                'Qualifying Day',
                day.isQualifying ? 'Yes (≥20 min)' : 'No (<20 min)',
                textColor: day.isQualifying ? AppColors.success : AppColors.textMuted(context),
                context: context,
              ),
              const SizedBox(height: AppSpacing.md),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDetailRow(String label, String value, {bool isHighlighted = false, Color? textColor, required BuildContext context}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: AppTypography.bodySm.copyWith(color: AppColors.textMuted(context))),
        Text(
          value,
          style: AppTypography.bodySm.copyWith(
            fontWeight: isHighlighted ? FontWeight.bold : FontWeight.w600,
            color: textColor ?? (isHighlighted ? AppColors.primary(context) : AppColors.textPrimary(context)),
          ),
        ),
      ],
    );
  }
}
