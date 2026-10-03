import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/timetable_slot.dart';
import '../providers/timetable_provider.dart';
import '../../attendance/providers/attendance_provider.dart';
import '../../attendance/services/class_resolution_service.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/services/feedback_service.dart';
import '../../core/utils/time_formatter.dart';

class RepeatClassSheet extends StatefulWidget {
  final String subjectId;
  final String subjectName;
  final String startTime;
  final String endTime;
  final String? room;
  final String? faculty;
  final String classType;
  final int sourceDayOfWeek;

  const RepeatClassSheet({
    super.key,
    required this.subjectId,
    required this.subjectName,
    required this.startTime,
    required this.endTime,
    this.room,
    this.faculty,
    required this.classType,
    required this.sourceDayOfWeek,
  });

  static Future<void> showForResolvedClass(
    BuildContext context, {
    required ResolvedClass resolvedClass,
    required int dayOfWeek,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => RepeatClassSheet(
        subjectId: resolvedClass.subjectId,
        subjectName: resolvedClass.subjectName,
        startTime: resolvedClass.startTime,
        endTime: resolvedClass.endTime,
        room: resolvedClass.room,
        faculty: resolvedClass.faculty,
        classType: resolvedClass.classType,
        sourceDayOfWeek: dayOfWeek,
      ),
    );
  }

  static Future<void> showForSlot(
    BuildContext context, {
    required TimetableSlot slot,
    required String subjectName,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => RepeatClassSheet(
        subjectId: slot.subjectId,
        subjectName: subjectName,
        startTime: slot.startTime,
        endTime: slot.endTime,
        room: slot.roomOverride,
        faculty: slot.facultyOverride,
        classType: slot.classTypeOverride ?? 'theory',
        sourceDayOfWeek: slot.dayOfWeek,
      ),
    );
  }

  @override
  State<RepeatClassSheet> createState() => _RepeatClassSheetState();
}

class _RepeatClassSheetState extends State<RepeatClassSheet> {
  static const List<String> _dayShort = [
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
    'Sun',
  ];

  late Set<int> _selectedDays;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    // Default selected days includes the source day
    _selectedDays = {widget.sourceDayOfWeek};
  }

  void _selectWeekdays() {
    FeedbackService.instance.selection();
    setState(() {
      _selectedDays = {0, 1, 2, 3, 4}; // Mon - Fri
    });
  }

  void _selectAllDays() {
    FeedbackService.instance.selection();
    setState(() {
      _selectedDays = {0, 1, 2, 3, 4, 5, 6}; // Mon - Sun
    });
  }

  void _clearDays() {
    FeedbackService.instance.selection();
    setState(() {
      _selectedDays = {widget.sourceDayOfWeek};
    });
  }

  Future<void> _handleSave() async {
    final newDays = _selectedDays.where((d) => d != widget.sourceDayOfWeek).toList();
    if (newDays.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select at least one additional day to repeat this class.'),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    setState(() => _isSaving = true);
    FeedbackService.instance.timetableSaved();

    try {
      final timetableProvider = context.read<TimetableProvider>();
      final attendanceProvider = context.read<AttendanceProvider>();

      final startFormatted = widget.startTime.length == 5 ? '${widget.startTime}:00' : widget.startTime;
      final endFormatted = widget.endTime.length == 5 ? '${widget.endTime}:00' : widget.endTime;

      // Check which days already have an identical slot to avoid accidental duplicates
      final existingDays = timetableProvider.slots
          .where((s) => s.subjectId == widget.subjectId && s.startTime == startFormatted)
          .map((s) => s.dayOfWeek)
          .toSet();

      int addedCount = 0;
      for (final day in newDays) {
        if (!existingDays.contains(day)) {
          await timetableProvider.addSlot(
            subjectId: widget.subjectId,
            dayOfWeek: day,
            startTime: startFormatted,
            endTime: endFormatted,
            roomOverride: widget.room,
            facultyOverride: widget.faculty,
            classTypeOverride: widget.classType,
          );
          addedCount++;
        }
      }

      // Trigger data refresh to reflect the new slots in attendance summaries
      await attendanceProvider.loadData(forceRefresh: false);

      if (mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              addedCount > 0
                  ? 'Class repeated across $addedCount additional day(s)!'
                  : 'Classes already exist on the selected day(s).',
            ),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSaving = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to repeat class: $e'),
            backgroundColor: AppColors.danger,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = AppColors.isDark(context);

    return Container(
      decoration: BoxDecoration(
        color: AppColors.card(context),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(AppRadii.xlVal)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.5 : 0.15),
            blurRadius: 20,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      padding: EdgeInsets.only(
        left: AppSpacing.lg,
        right: AppSpacing.lg,
        top: AppSpacing.md,
        bottom: MediaQuery.of(context).viewInsets.bottom + AppSpacing.xl,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag Handle
          Center(
            child: Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.border(context),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.md),

          // Title & Header
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.primary(context).withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  Icons.repeat_rounded,
                  color: AppColors.primary(context),
                  size: 22,
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Repeat Class',
                      style: AppTypography.headingMd.copyWith(fontWeight: FontWeight.w800),
                    ),
                    Text(
                      'Schedule this class on other days of the week',
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted(context)),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.md),

          // Class Details Summary Card
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.surfaceMuted(context),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border(context).withValues(alpha: 0.5)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        widget.subjectName,
                        style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w700),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.primary(context).withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        widget.classType.toUpperCase(),
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          color: AppColors.primary(context),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(Icons.access_time_rounded, size: 14, color: AppColors.textMuted(context)),
                    const SizedBox(width: 4),
                    Text(
                      TimeFormatter.formatRange(widget.startTime, widget.endTime),
                      style: AppTypography.caption.copyWith(
                        fontWeight: FontWeight.w600,
                        color: AppColors.textMuted(context),
                      ),
                    ),
                    if (widget.room != null && widget.room!.isNotEmpty) ...[
                      const SizedBox(width: 10),
                      Icon(Icons.meeting_room_outlined, size: 14, color: AppColors.textMuted(context)),
                      const SizedBox(width: 3),
                      Text(
                        widget.room!,
                        style: AppTypography.caption.copyWith(color: AppColors.textMuted(context)),
                      ),
                    ],
                    if (widget.faculty != null && widget.faculty!.isNotEmpty) ...[
                      const SizedBox(width: 10),
                      Icon(Icons.person_outline_rounded, size: 14, color: AppColors.textMuted(context)),
                      const SizedBox(width: 3),
                      Text(
                        widget.faculty!,
                        style: AppTypography.caption.copyWith(color: AppColors.textMuted(context)),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: AppSpacing.lg),

          // Quick Presets
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'REPEAT ON DAYS',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.5,
                  color: AppColors.textMuted(context),
                ),
              ),
              Row(
                children: [
                  GestureDetector(
                    onTap: _selectWeekdays,
                    child: Text(
                      'Mon-Fri',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primary(context),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  GestureDetector(
                    onTap: _selectAllDays,
                    child: Text(
                      'All Days',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primary(context),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  GestureDetector(
                    onTap: _clearDays,
                    child: Text(
                      'Reset',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textMuted(context),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.sm),

          // Days Selector Grid
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: List.generate(7, (index) {
              final isSelected = _selectedDays.contains(index);
              final isSourceDay = index == widget.sourceDayOfWeek;

              return FilterChip(
                selected: isSelected,
                label: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(_dayShort[index]),
                    if (isSourceDay) ...[
                      const SizedBox(width: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? Colors.white.withValues(alpha: 0.25)
                              : AppColors.textMuted(context).withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          'Orig',
                          style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ],
                ),
                selectedColor: AppColors.primary(context),
                checkmarkColor: Colors.white,
                labelStyle: TextStyle(
                  fontWeight: FontWeight.w700,
                  color: isSelected ? Colors.white : AppColors.textPrimary(context),
                ),
                backgroundColor: AppColors.surfaceMuted(context),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                  side: BorderSide(
                    color: isSelected
                        ? AppColors.primary(context)
                        : AppColors.border(context),
                  ),
                ),
                onSelected: (selected) {
                  FeedbackService.instance.selection();
                  setState(() {
                    if (selected) {
                      _selectedDays.add(index);
                    } else {
                      // Prevent deselecting if it is the only one selected
                      if (_selectedDays.length > 1) {
                        _selectedDays.remove(index);
                      }
                    }
                  });
                },
              );
            }),
          ),

          const SizedBox(height: AppSpacing.xl),

          // Submit Button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isSaving ? null : _handleSave,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary(context),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: _isSaving
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Text(
                      'Repeat Class Across Selected Days',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                    ),
            ),
          ),
        ],
      ),
    );
  }
}
