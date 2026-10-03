import 'package:flutter/material.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/services/feedback_service.dart';

class FiveMinuteTimePickerSheet extends StatefulWidget {
  final String title;
  final TimeOfDay initialTime;
  final TimeOfDay? minTime; // Optional lower bound (for end time > start time)
  final TimeOfDay? referenceStartTime; // If picking end time, used for duration quick chips

  const FiveMinuteTimePickerSheet({
    super.key,
    required this.title,
    required this.initialTime,
    this.minTime,
    this.referenceStartTime,
  });

  static Future<TimeOfDay?> show(
    BuildContext context, {
    required String title,
    required TimeOfDay initialTime,
    TimeOfDay? minTime,
    TimeOfDay? referenceStartTime,
  }) {
    return showModalBottomSheet<TimeOfDay>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => FiveMinuteTimePickerSheet(
        title: title,
        initialTime: initialTime,
        minTime: minTime,
        referenceStartTime: referenceStartTime,
      ),
    );
  }

  @override
  State<FiveMinuteTimePickerSheet> createState() => _FiveMinuteTimePickerSheetState();
}

class _FiveMinuteTimePickerSheetState extends State<FiveMinuteTimePickerSheet> {
  late int _selectedHour;
  late int _selectedMinute;

  final List<int> _fiveMinuteIncrements = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  @override
  void initState() {
    super.initState();
    _selectedHour = widget.initialTime.hour;
    // Snap initial minute to nearest 5-minute increment
    final rawMin = widget.initialTime.minute;
    _selectedMinute = (rawMin / 5).round() * 5;
    if (_selectedMinute >= 60) {
      _selectedMinute = 55;
    }
  }

  void _adjustTime(int deltaMinutes) {
    int total = _selectedHour * 60 + _selectedMinute + deltaMinutes;
    if (total < 0) total = 0;
    if (total > 23 * 60 + 55) total = 23 * 60 + 55;

    setState(() {
      _selectedHour = total ~/ 60;
      _selectedMinute = (total % 60 ~/ 5) * 5;
    });
    FeedbackService.instance.selection();
  }

  void _setDurationFromReference(int durationMinutes) {
    if (widget.referenceStartTime == null) return;
    final startTotal = widget.referenceStartTime!.hour * 60 + widget.referenceStartTime!.minute;
    final endTotal = (startTotal + durationMinutes).clamp(0, 23 * 60 + 55);

    setState(() {
      _selectedHour = endTotal ~/ 60;
      _selectedMinute = (endTotal % 60 ~/ 5) * 5;
    });
    FeedbackService.instance.selection();
  }

  bool _isInvalidMinTime() {
    if (widget.minTime == null) return false;
    final currentTotal = _selectedHour * 60 + _selectedMinute;
    final minTotal = widget.minTime!.hour * 60 + widget.minTime!.minute;
    return currentTotal <= minTotal;
  }

  String _formatDisplay() {
    final hh = _selectedHour.toString().padLeft(2, '0');
    final mm = _selectedMinute.toString().padLeft(2, '0');
    return '$hh:$mm';
  }

  @override
  Widget build(BuildContext context) {
    final isDark = AppColors.isDark(context);
    final hasError = _isInvalidMinTime();

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
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 36,
              height: 4,
              margin: const EdgeInsets.only(bottom: AppSpacing.md),
              decoration: BoxDecoration(
                color: AppColors.textMuted(context).withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                widget.title,
                style: AppTypography.heading3.copyWith(
                  color: AppColors.textPrimary(context),
                  fontWeight: FontWeight.w800,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close_rounded),
                onPressed: () => Navigator.of(context).pop(),
                color: AppColors.textMuted(context),
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.sm),

          // Big Time Display with Quick Adjusters
          Container(
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
            decoration: BoxDecoration(
              color: AppColors.surfaceMuted(context),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: hasError ? AppColors.danger : AppColors.border(context),
                width: hasError ? 1.5 : 1.0,
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                IconButton(
                  icon: const Icon(Icons.remove_circle_outline_rounded, size: 28),
                  color: AppColors.primary(context),
                  onPressed: () => _adjustTime(-5),
                ),
                Text(
                  _formatDisplay(),
                  style: const TextStyle(
                    fontSize: 38,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -1,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.add_circle_outline_rounded, size: 28),
                  color: AppColors.primary(context),
                  onPressed: () => _adjustTime(5),
                ),
              ],
            ),
          ),

          if (hasError) ...[
            const SizedBox(height: 6),
            const Text(
              'End time must be strictly after start time',
              style: TextStyle(color: AppColors.danger, fontSize: 12, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
          ],

          // Quick Duration Chips (if reference start time exists)
          if (widget.referenceStartTime != null) ...[
            const SizedBox(height: AppSpacing.md),
            Text(
              'QUICK DURATION',
              style: AppTypography.overline.copyWith(color: AppColors.textMuted(context)),
            ),
            const SizedBox(height: 6),
            Wrap(
              spacing: 8,
              runSpacing: 6,
              children: [
                _buildQuickDurationChip('45 min', 45),
                _buildQuickDurationChip('50 min', 50),
                _buildQuickDurationChip('1 hr', 60),
                _buildQuickDurationChip('1 hr 30m', 90),
                _buildQuickDurationChip('2 hr', 120),
              ],
            ),
          ],

          const SizedBox(height: AppSpacing.md),

          // Hour Selector
          Text(
            'HOUR (24-HR)',
            style: AppTypography.overline.copyWith(color: AppColors.textMuted(context)),
          ),
          const SizedBox(height: 6),
          SizedBox(
            height: 38,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: 24,
              separatorBuilder: (_, __) => const SizedBox(width: 6),
              itemBuilder: (ctx, h) {
                final isSelected = _selectedHour == h;
                return ChoiceChip(
                  label: Text(h.toString().padLeft(2, '0')),
                  selected: isSelected,
                  selectedColor: AppColors.primary(context),
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.white : AppColors.textPrimary(context),
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                    fontSize: 12,
                  ),
                  backgroundColor: AppColors.surfaceMuted(context),
                  side: BorderSide(
                    color: isSelected ? AppColors.primary(context) : AppColors.border(context),
                  ),
                  onSelected: (selected) {
                    if (selected) {
                      FeedbackService.instance.selection();
                      setState(() => _selectedHour = h);
                    }
                  },
                );
              },
            ),
          ),

          const SizedBox(height: AppSpacing.md),

          // Minute Selector (5-minute increments)
          Text(
            'MINUTE (5-MIN INTERVALS)',
            style: AppTypography.overline.copyWith(color: AppColors.textMuted(context)),
          ),
          const SizedBox(height: 6),
          Wrap(
            spacing: 8,
            runSpacing: 6,
            children: _fiveMinuteIncrements.map((min) {
              final isSelected = _selectedMinute == min;
              return ChoiceChip(
                label: Text(min.toString().padLeft(2, '0')),
                selected: isSelected,
                selectedColor: AppColors.primary(context),
                labelStyle: TextStyle(
                  color: isSelected ? Colors.white : AppColors.textPrimary(context),
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                  fontSize: 12,
                ),
                backgroundColor: AppColors.surfaceMuted(context),
                side: BorderSide(
                  color: isSelected ? AppColors.primary(context) : AppColors.border(context),
                ),
                onSelected: (selected) {
                  if (selected) {
                    FeedbackService.instance.selection();
                    setState(() => _selectedMinute = min);
                  }
                },
              );
            }).toList(),
          ),

          const SizedBox(height: AppSpacing.lg),

          // Confirm Button
          ElevatedButton(
            onPressed: hasError
                ? null
                : () {
                    FeedbackService.instance.timetableSaved();
                    Navigator.of(context).pop(TimeOfDay(hour: _selectedHour, minute: _selectedMinute));
                  },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary(context),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text(
              'Done',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickDurationChip(String label, int minutes) {
    return ActionChip(
      label: Text(
        '+$label',
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: AppColors.primary(context),
        ),
      ),
      backgroundColor: AppColors.primary(context).withValues(alpha: 0.1),
      side: BorderSide(color: AppColors.primary(context).withValues(alpha: 0.3)),
      onPressed: () => _setDurationFromReference(minutes),
    );
  }
}
