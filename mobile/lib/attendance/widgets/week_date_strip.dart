import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/services/feedback_service.dart';

class WeekDateStrip extends StatelessWidget {
  final String selectedDate;
  final ValueChanged<String> onSelectDate;
  final Set<String> datesWithClasses;
  final bool allowWeekNavigation;

  const WeekDateStrip({
    super.key,
    required this.selectedDate,
    required this.onSelectDate,
    this.datesWithClasses = const {},
    this.allowWeekNavigation = true,
  });

  DateTime _getStartOfWeek(DateTime date) {
    // ISO weekday: 1 = Mon ... 7 = Sun
    final diff = date.weekday - 1;
    return DateTime(date.year, date.month, date.day).subtract(Duration(days: diff));
  }

  @override
  Widget build(BuildContext context) {
    DateTime currentParsed;
    try {
      currentParsed = DateTime.parse(selectedDate);
    } catch (_) {
      currentParsed = DateTime.now();
    }

    final startOfWeek = _getStartOfWeek(currentParsed);
    final todayStr = DateFormat('yyyy-MM-dd').format(DateTime.now());
    final monthHeader = DateFormat('MMMM yyyy').format(startOfWeek);

    final days = List.generate(7, (index) {
      final d = startOfWeek.add(Duration(days: index));
      final dateStr = DateFormat('yyyy-MM-dd').format(d);
      final isSelected = dateStr == selectedDate;
      final isToday = dateStr == todayStr;
      final hasClasses = datesWithClasses.contains(dateStr);
      final dayName = DateFormat('E').format(d); // Mon, Tue...
      final dayNum = d.day.toString();

      return _DayItemData(
        date: d,
        dateStr: dateStr,
        dayName: dayName,
        dayNum: dayNum,
        isSelected: isSelected,
        isToday: isToday,
        hasClasses: hasClasses,
      );
    });

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.card(context),
        borderRadius: AppRadii.lg,
        border: Border.all(color: AppColors.border(context)),
      ),
      child: Column(
        children: [
          // Month Label & Navigation Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Text(
                    monthHeader,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary(context),
                    ),
                  ),
                  const SizedBox(width: 8),
                  InkWell(
                    borderRadius: BorderRadius.circular(6),
                    onTap: () {
                      FeedbackService.instance.selection();
                      onSelectDate(todayStr);
                    },
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      child: Text(
                        'Today',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primary(context),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              if (allowWeekNavigation)
                Row(
                  children: [
                    InkWell(
                      borderRadius: BorderRadius.circular(8),
                      onTap: () {
                        FeedbackService.instance.selection();
                        final prev = startOfWeek.subtract(const Duration(days: 7));
                        onSelectDate(DateFormat('yyyy-MM-dd').format(prev));
                      },
                      child: Padding(
                        padding: const EdgeInsets.all(4),
                        child: Icon(
                          Icons.chevron_left_rounded,
                          size: 20,
                          color: AppColors.textMuted(context),
                        ),
                      ),
                    ),
                    InkWell(
                      borderRadius: BorderRadius.circular(8),
                      onTap: () {
                        FeedbackService.instance.selection();
                        final next = startOfWeek.add(const Duration(days: 7));
                        onSelectDate(DateFormat('yyyy-MM-dd').format(next));
                      },
                      child: Padding(
                        padding: const EdgeInsets.all(4),
                        child: Icon(
                          Icons.chevron_right_rounded,
                          size: 20,
                          color: AppColors.textMuted(context),
                        ),
                      ),
                    ),
                  ],
                ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),

          // 7-day strip
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: days.map((day) {
              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 2),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(12),
                    onTap: () {
                      FeedbackService.instance.selection();
                      onSelectDate(day.dateStr);
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        color: day.isSelected
                            ? AppColors.primary(context)
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(12),
                        border: day.isToday && !day.isSelected
                            ? Border.all(color: AppColors.primary(context).withValues(alpha: 0.5))
                            : null,
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            day.dayName.substring(0, 1), // M, T, W...
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: day.isSelected
                                  ? Colors.white.withValues(alpha: 0.8)
                                  : AppColors.textMuted(context),
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            day.dayNum,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w800,
                              color: day.isSelected
                                  ? Colors.white
                                  : AppColors.textPrimary(context),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Container(
                            width: 4,
                            height: 4,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: day.hasClasses
                                  ? (day.isSelected
                                      ? Colors.white
                                      : AppColors.primary(context))
                                  : Colors.transparent,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

class _DayItemData {
  final DateTime date;
  final String dateStr;
  final String dayName;
  final String dayNum;
  final bool isSelected;
  final bool isToday;
  final bool hasClasses;

  _DayItemData({
    required this.date,
    required this.dateStr,
    required this.dayName,
    required this.dayNum,
    required this.isSelected,
    required this.isToday,
    required this.hasClasses,
  });
}
