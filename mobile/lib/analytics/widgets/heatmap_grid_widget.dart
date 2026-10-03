import 'package:flutter/material.dart';
import '../models/daily_activity.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/design_system/components/app_card.dart';

class HeatmapGridWidget extends StatefulWidget {
  final List<DailyActivity> days;
  final StreakStats streaks;
  final bool isDashboardPreview;

  const HeatmapGridWidget({
    super.key,
    required this.days,
    required this.streaks,
    this.isDashboardPreview = false,
  });

  @override
  State<HeatmapGridWidget> createState() => _HeatmapGridWidgetState();
}

class _HeatmapGridWidgetState extends State<HeatmapGridWidget> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.jumpTo(_scrollController.position.maxScrollExtent);
      }
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Color _getLevelColor(HeatmapActivityLevel level, BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    switch (level) {
      case HeatmapActivityLevel.level0:
        return isDark ? AppColors.surfaceRaised(context) : const Color(0xFFF1F5F9);
      case HeatmapActivityLevel.level1:
        return isDark ? AppColors.study900.withValues(alpha: 0.6) : AppColors.study200;
      case HeatmapActivityLevel.level2:
        return isDark ? AppColors.study700 : AppColors.study300;
      case HeatmapActivityLevel.level3:
        return isDark ? AppColors.study600 : AppColors.study500;
      case HeatmapActivityLevel.level4:
        return isDark ? AppColors.study400 : AppColors.study700;
    }
  }

  @override
  Widget build(BuildContext context) {
    // Group days into columns of 7 (Monday = 0, Sunday = 6)
    final weeks = <List<DailyActivity?>>[];
    List<DailyActivity?> currentWeek = [];

    if (widget.days.isNotEmpty) {
      // Offset first week so Monday is index 0
      final firstDay = widget.days.first;
      final firstMonIndex = (firstDay.dayOfWeek + 6) % 7;
      for (int i = 0; i < firstMonIndex; i++) {
        currentWeek.add(null);
      }

      for (final day in widget.days) {
        currentWeek.add(day);
        if (currentWeek.length == 7) {
          weeks.add(currentWeek);
          currentWeek = [];
        }
      }
      if (currentWeek.isNotEmpty) {
        while (currentWeek.length < 7) {
          currentWeek.add(null);
        }
        weeks.add(currentWeek);
      }
    }

    final displayWeeks = widget.isDashboardPreview && weeks.length > 16
        ? weeks.sublist(weeks.length - 16)
        : weeks;

    final content = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (!widget.isDashboardPreview) ...[
          // Title & Streak summary
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.calendar_today_rounded, size: 16, color: AppColors.primary(context)),
                      const SizedBox(width: AppSpacing.xs),
                      Text(
                        'Activity Heatmap',
                        style: AppTypography.headingSm.copyWith(
                          color: AppColors.textPrimary(context),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Daily qualifying focus consistency',
                    style: AppTypography.bodyXs.copyWith(color: AppColors.textMuted(context)),
                  ),
                ],
              ),
              // Current Streak Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.orange.withOpacity(0.12),
                  borderRadius: AppRadii.full,
                  border: Border.all(color: Colors.orange.withOpacity(0.3)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.local_fire_department_rounded, size: 14, color: Colors.orange),
                    const SizedBox(width: 4),
                    Text(
                      '${widget.streaks.currentStreak} day streak',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: Colors.orange,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),

          // Streak KPI Row
          Row(
            children: [
              Expanded(
                child: _buildKpiTile(
                  context,
                  title: 'Active Days',
                  value: '${widget.streaks.activeDays}',
                  icon: Icons.check_circle_outline_rounded,
                  color: AppColors.success,
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: _buildKpiTile(
                  context,
                  title: 'Longest Streak',
                  value: '${widget.streaks.longestStreak} d',
                  icon: Icons.emoji_events_outlined,
                  color: Colors.amber,
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: _buildKpiTile(
                  context,
                  title: 'Total Study',
                  value: widget.streaks.formattedTotalStudyTime,
                  icon: Icons.timer_outlined,
                  color: AppColors.primary(context),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
        ],

          // Heatmap Matrix
          SingleChildScrollView(
            controller: _scrollController,
            scrollDirection: Axis.horizontal,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Day initials column (Mon, Wed, Fri)
                Padding(
                  padding: const EdgeInsets.only(right: 6.0),
                  child: Column(
                    children: [
                      _buildDayInitial('M'),
                      const SizedBox(height: 3),
                      _buildDayInitial('T'),
                      const SizedBox(height: 3),
                      _buildDayInitial('W'),
                      const SizedBox(height: 3),
                      _buildDayInitial('T'),
                      const SizedBox(height: 3),
                      _buildDayInitial('F'),
                      const SizedBox(height: 3),
                      _buildDayInitial('S'),
                      const SizedBox(height: 3),
                      _buildDayInitial('S'),
                    ],
                  ),
                ),

                // Heatmap columns
                ...displayWeeks.map((week) {
                  return Padding(
                    padding: const EdgeInsets.only(right: 3.0),
                    child: Column(
                      children: week.map((day) {
                        if (day == null) {
                          return Container(
                            margin: const EdgeInsets.only(bottom: 3.0),
                            width: 14,
                            height: 14,
                            color: Colors.transparent,
                          );
                        }

                        final color = _getLevelColor(day.level, context);
                        return InkWell(
                          onTap: () => _showDaySheet(context, day),
                          borderRadius: BorderRadius.circular(3),
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 3.0),
                            width: 14,
                            height: 14,
                            decoration: BoxDecoration(
                              color: color,
                              borderRadius: BorderRadius.circular(3),
                              border: day.isToday
                                  ? Border.all(color: AppColors.primary(context), width: 1.5)
                                  : Border.all(color: Colors.black.withOpacity(0.04), width: 0.5),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  );
                }),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.md),

          // Legend
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              Text(
                'Less',
                style: TextStyle(fontSize: 10, color: AppColors.textMuted(context)),
              ),
              const SizedBox(width: 4),
              ...[
                HeatmapActivityLevel.level0,
                HeatmapActivityLevel.level1,
                HeatmapActivityLevel.level2,
                HeatmapActivityLevel.level3,
                HeatmapActivityLevel.level4,
              ].map((lvl) {
                return Container(
                  margin: const EdgeInsets.symmetric(horizontal: 1.5),
                  width: 10,
                  height: 10,
                  decoration: BoxDecoration(
                    color: _getLevelColor(lvl, context),
                    borderRadius: BorderRadius.circular(2),
                  ),
                );
              }),
              const SizedBox(width: 4),
              Text(
                'More',
                style: TextStyle(fontSize: 10, color: AppColors.textMuted(context)),
              ),
            ],
          ),
        ],
      );

    if (widget.isDashboardPreview) {
      return content;
    }

    return AppCard(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: content,
    );
  }

  Widget _buildDayInitial(String letter) {
    return SizedBox(
      height: 14,
      width: 12,
      child: Center(
        child: Text(
          letter,
          style: TextStyle(fontSize: 9, color: AppColors.textMuted(context).withOpacity(0.6)),
        ),
      ),
    );
  }

  Widget _buildKpiTile(
    BuildContext context, {
    required String title,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.surfaceMuted(context).withOpacity(0.4),
        borderRadius: AppRadii.md,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 12, color: color),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(fontSize: 10, color: AppColors.textMuted(context)),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              value,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary(context),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showDaySheet(BuildContext context, DailyActivity day) {
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
              _buildDetailItem('Study Time', day.formattedDuration, isHighlighted: true, context: context),
              const SizedBox(height: AppSpacing.sm),
              _buildDetailItem('Pomodoros Completed', '${day.pomodoroCount}', context: context),
              const SizedBox(height: AppSpacing.sm),
              _buildDetailItem('Tasks Finished', '${day.tasksCompletedCount}', context: context),
              const SizedBox(height: AppSpacing.sm),
              _buildDetailItem('Notes Created', '${day.notesCount}', context: context),
              const SizedBox(height: AppSpacing.sm),
              _buildDetailItem(
                'Qualifying Status',
                day.isQualifying ? 'Qualifying Day (≥20 min)' : 'Below Threshold (<20 min)',
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

  Widget _buildDetailItem(String label, String value, {bool isHighlighted = false, Color? textColor, required BuildContext context}) {
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
