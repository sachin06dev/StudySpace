import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/attendance_heatmap_engine.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/design_system/components/app_card.dart';

class AttendanceHeatmapWidget extends StatefulWidget {
  final List<DailyAttendanceSummary> days;
  final bool isCompact;

  const AttendanceHeatmapWidget({
    super.key,
    required this.days,
    this.isCompact = false,
  });

  @override
  State<AttendanceHeatmapWidget> createState() => _AttendanceHeatmapWidgetState();
}

class _AttendanceHeatmapWidgetState extends State<AttendanceHeatmapWidget> {
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

  Color _getLevelColor(AttendanceHeatmapLevel level, BuildContext context) {
    final isDark = AppColors.isDark(context);
    switch (level) {
      case AttendanceHeatmapLevel.noClasses:
        return isDark ? AppColors.surfaceRaised(context) : const Color(0xFFE2E8F0);
      case AttendanceHeatmapLevel.veryLow:
        return isDark ? const Color(0xFFEF4444) : const Color(0xFFF87171);
      case AttendanceHeatmapLevel.low:
        return isDark ? const Color(0xFFF59E0B) : const Color(0xFFFBBF24);
      case AttendanceHeatmapLevel.medium:
        return isDark ? const Color(0xFF84CC16) : const Color(0xFFA3E635);
      case AttendanceHeatmapLevel.high:
        return isDark ? const Color(0xFF10B981) : const Color(0xFF34D399);
      case AttendanceHeatmapLevel.excellent:
        return isDark ? const Color(0xFF059669) : const Color(0xFF10B981);
    }
  }

  @override
  Widget build(BuildContext context) {
    // Group days into columns of 7 (Monday = 0, Sunday = 6)
    final weeks = <List<DailyAttendanceSummary?>>[];
    List<DailyAttendanceSummary?> currentWeek = [];

    if (widget.days.isNotEmpty) {
      // Offset first week so Monday is index 0
      final firstDay = widget.days.first;
      final firstMonOffset = firstDay.dayOfWeek; // 0=Mon, 6=Sun
      for (int i = 0; i < firstMonOffset; i++) {
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

    final isDark = AppColors.isDark(context);

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
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: AppColors.primary(context).withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      Icons.calendar_month_rounded,
                      size: 18,
                      color: AppColors.primary(context),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Text(
                    'Attendance Heatmap',
                    style: AppTypography.headingSm.copyWith(
                      color: AppColors.textPrimary(context),
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.surfaceMuted(context),
                  borderRadius: AppRadii.full,
                ),
                child: Text(
                  '${widget.days.length} Days',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textMuted(context),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            'Daily attendance intensity & consistency (excluding cancelled classes)',
            style: AppTypography.bodyXs.copyWith(color: AppColors.textMuted(context)),
          ),
          const SizedBox(height: AppSpacing.md),

          // Heatmap Matrix
          SingleChildScrollView(
            controller: _scrollController,
            scrollDirection: Axis.horizontal,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Day initials column (M, T, W, T, F, S, S)
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
                ...weeks.map((week) {
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
                          onTap: () => _showDayDetailSheet(context, day),
                          borderRadius: BorderRadius.circular(3),
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 3.0),
                            width: 14,
                            height: 14,
                            decoration: BoxDecoration(
                              color: color,
                              borderRadius: BorderRadius.circular(3),
                              border: day.isToday
                                  ? Border.all(color: AppColors.primary(context), width: 1.6)
                                  : Border.all(
                                      color: isDark
                                          ? Colors.white.withValues(alpha: 0.05)
                                          : Colors.black.withValues(alpha: 0.06),
                                      width: 0.5,
                                    ),
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

          // 5-Level Legend
          Wrap(
            alignment: WrapAlignment.spaceBetween,
            crossAxisAlignment: WrapCrossAlignment.center,
            spacing: 8,
            runSpacing: 4,
            children: [
              _buildLegendItem(context, 'No Class', AttendanceHeatmapLevel.noClasses),
              _buildLegendItem(context, '<50%', AttendanceHeatmapLevel.veryLow),
              _buildLegendItem(context, '50-74%', AttendanceHeatmapLevel.low),
              _buildLegendItem(context, '75-84%', AttendanceHeatmapLevel.medium),
              _buildLegendItem(context, '85-99%', AttendanceHeatmapLevel.high),
              _buildLegendItem(context, '100%', AttendanceHeatmapLevel.excellent),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDayInitial(String initial) {
    return SizedBox(
      height: 14,
      width: 12,
      child: Center(
        child: Text(
          initial,
          style: TextStyle(
            fontSize: 9,
            fontWeight: FontWeight.bold,
            color: Colors.grey.shade500,
          ),
        ),
      ),
    );
  }

  Widget _buildLegendItem(BuildContext context, String label, AttendanceHeatmapLevel level) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(
            color: _getLevelColor(level, context),
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w500,
            color: AppColors.textMuted(context),
          ),
        ),
      ],
    );
  }

  void _showDayDetailSheet(BuildContext context, DailyAttendanceSummary day) {
    final formattedDate = DateFormat('EEEE, MMMM d, yyyy').format(day.date);
    final isDark = AppColors.isDark(context);

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        decoration: BoxDecoration(
          color: AppColors.card(ctx),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.textMuted(ctx).withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      formattedDate,
                      style: AppTypography.heading3.copyWith(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      day.isToday ? 'Today · Attendance Record' : 'Historical Class Attendance',
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted(ctx)),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: _getLevelColor(day.level, ctx).withValues(alpha: isDark ? 0.3 : 0.15),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: _getLevelColor(day.level, ctx), width: 1.2),
                  ),
                  child: Text(
                    day.totalClasses > 0 ? '${day.percentage.toStringAsFixed(0)}%' : 'No Class',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      color: _getLevelColor(day.level, ctx),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.surfaceMuted(ctx),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.border(ctx)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildStatTile(ctx, 'Attended', '${day.attendedClasses}', AppColors.success),
                  _buildStatTile(ctx, 'Absent', '${day.absentClasses}', AppColors.danger),
                  _buildStatTile(ctx, 'Cancelled', '${day.cancelledClasses}', AppColors.textMuted(ctx)),
                  _buildStatTile(ctx, 'Total Counted', '${day.totalClasses}', AppColors.primary(ctx)),
                ],
              ),
            ),
            const SizedBox(height: 14),
            Text(
              day.label,
              style: TextStyle(
                fontSize: 13,
                color: AppColors.textPrimary(ctx),
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildStatTile(BuildContext context, String label, String value, Color color) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: TextStyle(fontSize: 11, color: AppColors.textMuted(context)),
        ),
      ],
    );
  }
}
