import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/services/feedback_service.dart';
import 'attendance_tokens.dart';

/// Compact, elegant SilverBook-inspired calendar header for the Attendance Dashboard.
/// Supports a horizontal 7-day window with class presence indicator dots,
/// month navigation, and quick "Today" shortcut.
class AttendanceCalendarHeader extends StatefulWidget {
  final DateTime selectedDate;
  final Function(DateTime) onDateSelected;
  final Set<String> datesWithClasses; // YYYY-MM-DD set

  const AttendanceCalendarHeader({
    super.key,
    required this.selectedDate,
    required this.onDateSelected,
    this.datesWithClasses = const {},
  });

  @override
  State<AttendanceCalendarHeader> createState() => _AttendanceCalendarHeaderState();
}

class _AttendanceCalendarHeaderState extends State<AttendanceCalendarHeader> {
  late DateTime _anchorWeekStart;

  @override
  void initState() {
    super.initState();
    _anchorWeekStart = _getStartOfWeek(widget.selectedDate);
  }

  @override
  void didUpdateWidget(covariant AttendanceCalendarHeader oldWidget) {
    super.didUpdateWidget(oldWidget);
    // If selectedDate changed outside the current week, update anchor
    final newStart = _getStartOfWeek(widget.selectedDate);
    if (newStart != _anchorWeekStart) {
      _anchorWeekStart = newStart;
    }
  }

  /// Sunday is index 0 in SilverBook header (S M T W T F S)
  DateTime _getStartOfWeek(DateTime d) {
    // weekday: 1 = Mon, ..., 7 = Sun. If Sunday (7), diff is 0 days; if Mon (1), diff is 1 day.
    final diff = d.weekday % 7;
    return DateTime(d.year, d.month, d.day).subtract(Duration(days: diff));
  }

  void _shiftWeek(int weeks) {
    FeedbackService.instance.selection();
    setState(() {
      _anchorWeekStart = _anchorWeekStart.add(Duration(days: weeks * 7));
    });
  }

  void _goToToday() {
    FeedbackService.instance.selection();
    final today = DateTime.now();
    setState(() {
      _anchorWeekStart = _getStartOfWeek(today);
    });
    widget.onDateSelected(today);
  }

  bool _isSameDay(DateTime a, DateTime b) {
    return a.year == b.year && a.month == b.month && a.day == b.day;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = AttendanceTokens.isDark(context);
    final monthYearStr = DateFormat('MMMM yyyy').format(widget.selectedDate);
    final now = DateTime.now();
    final isSelectedToday = _isSameDay(widget.selectedDate, now);

    final dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    final weekDays = List.generate(7, (i) => _anchorWeekStart.add(Duration(days: i)));

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
      decoration: BoxDecoration(
        color: AttendanceTokens.card(context),
        borderRadius: AttendanceTokens.cardRadius,
        border: Border.all(color: AttendanceTokens.border(context)),
      ),
      child: Column(
        children: [
          // Month Header & Navigation
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                monthYearStr,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  letterSpacing: -0.2,
                  color: AttendanceTokens.textPrimary(context),
                ),
              ),
              Row(
                children: [
                  if (!isSelectedToday)
                    GestureDetector(
                      onTap: _goToToday,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                        margin: const EdgeInsets.only(right: 6),
                        decoration: BoxDecoration(
                          color: isDark
                              ? AttendanceTokens.darkCardElevated
                              : AttendanceTokens.lightCardElevated,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: AttendanceTokens.border(context)),
                        ),
                        child: const Text(
                          'Today',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AttendanceTokens.primaryBlue,
                          ),
                        ),
                      ),
                    ),
                  InkWell(
                    onTap: () => _shiftWeek(-1),
                    borderRadius: BorderRadius.circular(8),
                    child: Padding(
                      padding: const EdgeInsets.all(4.0),
                      child: Icon(
                        Icons.chevron_left_rounded,
                        size: 22,
                        color: AttendanceTokens.textMuted(context),
                      ),
                    ),
                  ),
                  InkWell(
                    onTap: () => _shiftWeek(1),
                    borderRadius: BorderRadius.circular(8),
                    child: Padding(
                      padding: const EdgeInsets.all(4.0),
                      child: Icon(
                        Icons.chevron_right_rounded,
                        size: 22,
                        color: AttendanceTokens.textMuted(context),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 14),

          // 7-Day Selector Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(7, (index) {
              final date = weekDays[index];
              final isSelected = _isSameDay(date, widget.selectedDate);
              final isToday = _isSameDay(date, now);
              final dateKey = DateFormat('yyyy-MM-dd').format(date);
              final hasClass = widget.datesWithClasses.contains(dateKey);

              return Expanded(
                child: GestureDetector(
                  onTap: () {
                    FeedbackService.instance.selection();
                    widget.onDateSelected(date);
                  },
                  behavior: HitTestBehavior.opaque,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 180),
                    margin: const EdgeInsets.symmetric(horizontal: 2.5),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? AttendanceTokens.primaryBlue
                          : (isToday
                              ? AppColors.primarySubtle(context)
                              : Colors.transparent),
                      borderRadius: AttendanceTokens.controlRadius,
                      border: isToday && !isSelected
                          ? Border.all(
                              color: AttendanceTokens.primaryBlue.withValues(alpha: 0.6),
                              width: 1.2,
                            )
                          : null,
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          dayLabels[index],
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: isSelected
                                ? Colors.white.withValues(alpha: 0.9)
                                : AttendanceTokens.textMuted(context),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${date.day}',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: isSelected ? FontWeight.w900 : FontWeight.w600,
                            color: isSelected
                                ? Colors.white
                                : AttendanceTokens.textPrimary(context),
                          ),
                        ),
                        const SizedBox(height: 4),
                        // Class indicator dot
                        Container(
                          width: 4,
                          height: 4,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: hasClass
                                ? (isSelected
                                    ? Colors.white
                                    : AttendanceTokens.primaryBlue)
                                : Colors.transparent,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}
