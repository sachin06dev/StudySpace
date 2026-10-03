import 'package:flutter/material.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/services/feedback_service.dart';
import '../../core/utils/time_formatter.dart';

class FastTimePickerSheet extends StatefulWidget {
  final String title;
  final TimeOfDay initialTime;
  final TimeOfDay? minTime; // Optional lower bound (for end time > start time)
  final TimeOfDay? referenceStartTime; // If picking end time, used for quick duration chips

  const FastTimePickerSheet({
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
      builder: (_) => FastTimePickerSheet(
        title: title,
        initialTime: initialTime,
        minTime: minTime,
        referenceStartTime: referenceStartTime,
      ),
    );
  }

  @override
  State<FastTimePickerSheet> createState() => _FastTimePickerSheetState();
}

class _FastTimePickerSheetState extends State<FastTimePickerSheet> {
  late int _selectedHour12; // 1 to 12
  late int _selectedMinute; // 0 to 55 in 5m steps
  late bool _isPm;
  bool _useWheelPicker = false;

  final List<int> _quickMinutes = [0, 15, 30, 45];
  final List<int> _allFiveMinutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  late FixedExtentScrollController _hourWheelCtrl;
  late FixedExtentScrollController _minuteWheelCtrl;
  late FixedExtentScrollController _periodWheelCtrl;

  @override
  void initState() {
    super.initState();
    final h24 = widget.initialTime.hour;
    _isPm = h24 >= 12;
    _selectedHour12 = h24 % 12 == 0 ? 12 : h24 % 12;

    final rawMin = widget.initialTime.minute;
    _selectedMinute = ((rawMin / 5).round() * 5).clamp(0, 55);

    _initWheelControllers();
  }

  void _initWheelControllers() {
    _hourWheelCtrl = FixedExtentScrollController(initialItem: _selectedHour12 - 1);
    final minuteIndex = _allFiveMinutes.indexOf(_selectedMinute);
    _minuteWheelCtrl = FixedExtentScrollController(
      initialItem: minuteIndex >= 0 ? minuteIndex : 0,
    );
    _periodWheelCtrl = FixedExtentScrollController(initialItem: _isPm ? 1 : 0);
  }

  @override
  void dispose() {
    _hourWheelCtrl.dispose();
    _minuteWheelCtrl.dispose();
    _periodWheelCtrl.dispose();
    super.dispose();
  }

  TimeOfDay get _resolvedTimeOfDay {
    int h24 = _selectedHour12 % 12;
    if (_isPm) h24 += 12;
    return TimeOfDay(hour: h24, minute: _selectedMinute);
  }

  bool _isInvalidMinTime() {
    if (widget.minTime == null) return false;
    final curr = _resolvedTimeOfDay;
    final currMinutes = curr.hour * 60 + curr.minute;
    final minMinutes = widget.minTime!.hour * 60 + widget.minTime!.minute;
    return currMinutes <= minMinutes;
  }

  void _setDurationFromReference(int durationMinutes) {
    if (widget.referenceStartTime == null) return;
    final startTotal = widget.referenceStartTime!.hour * 60 + widget.referenceStartTime!.minute;
    final endTotal = (startTotal + durationMinutes).clamp(0, 23 * 60 + 55);

    final h24 = endTotal ~/ 60;
    final min = (endTotal % 60 ~/ 5) * 5;

    setState(() {
      _isPm = h24 >= 12;
      _selectedHour12 = h24 % 12 == 0 ? 12 : h24 % 12;
      _selectedMinute = min;
    });
    FeedbackService.instance.selection();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = AppColors.isDark(context);
    final isInvalid = _isInvalidMinTime();

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
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Handle
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

            // Header & Wheel Toggle
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
                  icon: Icon(
                    _useWheelPicker ? Icons.grid_view_rounded : Icons.unfold_more_rounded,
                    color: AppColors.primary(context),
                  ),
                  tooltip: _useWheelPicker ? 'Switch to Quick Grid' : 'Switch to Scroll Wheel',
                  onPressed: () {
                    FeedbackService.instance.selection();
                    setState(() => _useWheelPicker = !_useWheelPicker);
                  },
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            // Main Time Display Badge (12-Hour AM/PM)
            Container(
              padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
              decoration: BoxDecoration(
                color: isInvalid
                    ? AppColors.danger.withValues(alpha: 0.1)
                    : AppColors.primary(context).withValues(alpha: 0.08),
                borderRadius: AppRadii.lg,
                border: Border.all(
                  color: isInvalid
                      ? AppColors.danger
                      : AppColors.primary(context).withValues(alpha: 0.3),
                  width: 1.5,
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    TimeFormatter.format12Hour(_resolvedTimeOfDay),
                    style: TextStyle(
                      fontSize: 34,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.5,
                      color: isInvalid ? AppColors.danger : AppColors.primary(context),
                    ),
                  ),
                  if (widget.referenceStartTime != null) ...[
                    const SizedBox(width: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.primary(context).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '${((_resolvedTimeOfDay.hour * 60 + _resolvedTimeOfDay.minute) - (widget.referenceStartTime!.hour * 60 + widget.referenceStartTime!.minute)).clamp(0, 720)}m',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary(context),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),

            if (isInvalid) ...[
              const SizedBox(height: 6),
              Text(
                'End time must be after ${TimeFormatter.format12Hour(widget.minTime)}',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 12, color: AppColors.danger, fontWeight: FontWeight.bold),
              ),
            ],

            const SizedBox(height: AppSpacing.lg),

            // Content Mode: Grid vs Scroll Wheel
            if (_useWheelPicker)
              _buildWheelPicker(context)
            else
              _buildGridPicker(context),

            // Quick Duration Chips (if picking end time)
            if (widget.referenceStartTime != null) ...[
              const SizedBox(height: AppSpacing.md),
              Text(
                'Quick Durations from Start',
                style: AppTypography.caption.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 6),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildDurationChip('45 min', 45),
                    const SizedBox(width: 6),
                    _buildDurationChip('50 min', 50),
                    const SizedBox(width: 6),
                    _buildDurationChip('1 hour', 60),
                    const SizedBox(width: 6),
                    _buildDurationChip('1h 30m', 90),
                    const SizedBox(width: 6),
                    _buildDurationChip('2 hours', 120),
                  ],
                ),
              ),
            ],

            const SizedBox(height: AppSpacing.xl),

            // Bottom Actions
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.of(context).pop(),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: const Text('Cancel'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: isInvalid
                        ? null
                        : () {
                            FeedbackService.instance.selection();
                            Navigator.of(context).pop(_resolvedTimeOfDay);
                          },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary(context),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: const Text('Confirm Time'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGridPicker(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 1. Period Selector (AM / PM)
        Row(
          children: [
            Expanded(
              child: _buildSelectableChip(
                label: 'AM',
                isSelected: !_isPm,
                onTap: () {
                  FeedbackService.instance.selection();
                  setState(() => _isPm = false);
                },
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildSelectableChip(
                label: 'PM',
                isSelected: _isPm,
                onTap: () {
                  FeedbackService.instance.selection();
                  setState(() => _isPm = true);
                },
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.md),

        // 2. Hour Grid (1 to 12)
        Text('Hour', style: AppTypography.caption.copyWith(fontWeight: FontWeight.bold)),
        const SizedBox(height: 6),
        Column(
          children: [
            Row(
              children: [1, 2, 3, 4, 5, 6].map((h) {
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 2),
                    child: _buildSelectableChip(
                      label: '$h',
                      isSelected: _selectedHour12 == h,
                      onTap: () {
                        FeedbackService.instance.selection();
                        setState(() => _selectedHour12 = h);
                      },
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 6),
            Row(
              children: [7, 8, 9, 10, 11, 12].map((h) {
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 2),
                    child: _buildSelectableChip(
                      label: '$h',
                      isSelected: _selectedHour12 == h,
                      onTap: () {
                        FeedbackService.instance.selection();
                        setState(() => _selectedHour12 = h);
                      },
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ),

        const SizedBox(height: AppSpacing.md),

        // 3. Quick Minutes (00, 15, 30, 45)
        Text('Quick Minutes', style: AppTypography.caption.copyWith(fontWeight: FontWeight.bold)),
        const SizedBox(height: 6),
        Row(
          children: _quickMinutes.map((m) {
            final mStr = m.toString().padLeft(2, '0');
            return Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 2),
                child: _buildSelectableChip(
                  label: mStr,
                  isSelected: _selectedMinute == m,
                  onTap: () {
                    FeedbackService.instance.selection();
                    setState(() => _selectedMinute = m);
                  },
                ),
              ),
            );
          }).toList(),
        ),

        const SizedBox(height: 10),

        // 4. 5-Minute Fine Granularity row
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: _allFiveMinutes.map((m) {
              final isQuick = _quickMinutes.contains(m);
              if (isQuick) return const SizedBox.shrink();
              final mStr = m.toString().padLeft(2, '0');
              return Padding(
                padding: const EdgeInsets.only(right: 6),
                child: ChoiceChip(
                  label: Text(':$mStr'),
                  selected: _selectedMinute == m,
                  selectedColor: AppColors.primary(context),
                  labelStyle: TextStyle(
                    color: _selectedMinute == m ? Colors.white : AppColors.textPrimary(context),
                    fontSize: 12,
                  ),
                  onSelected: (_) {
                    FeedbackService.instance.selection();
                    setState(() => _selectedMinute = m);
                  },
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  Widget _buildWheelPicker(BuildContext context) {
    return Container(
      height: 160,
      margin: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          // Hour Wheel (1 to 12)
          Expanded(
            child: ListWheelScrollView.useDelegate(
              controller: _hourWheelCtrl,
              itemExtent: 44,
              perspective: 0.003,
              physics: const FixedExtentScrollPhysics(),
              onSelectedItemChanged: (idx) {
                FeedbackService.instance.selection();
                setState(() => _selectedHour12 = idx + 1);
              },
              childDelegate: ListWheelChildBuilderDelegate(
                childCount: 12,
                builder: (ctx, i) {
                  final h = i + 1;
                  final isSelected = _selectedHour12 == h;
                  return Center(
                    child: Text(
                      '$h',
                      style: TextStyle(
                        fontSize: isSelected ? 24 : 16,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        color: isSelected ? AppColors.primary(context) : AppColors.textMuted(context),
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
          const Text(':', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),

          // Minute Wheel (00, 05, 10 ... 55)
          Expanded(
            child: ListWheelScrollView.useDelegate(
              controller: _minuteWheelCtrl,
              itemExtent: 44,
              perspective: 0.003,
              physics: const FixedExtentScrollPhysics(),
              onSelectedItemChanged: (idx) {
                FeedbackService.instance.selection();
                setState(() => _selectedMinute = _allFiveMinutes[idx]);
              },
              childDelegate: ListWheelChildBuilderDelegate(
                childCount: _allFiveMinutes.length,
                builder: (ctx, i) {
                  final min = _allFiveMinutes[i];
                  final isSelected = _selectedMinute == min;
                  return Center(
                    child: Text(
                      min.toString().padLeft(2, '0'),
                      style: TextStyle(
                        fontSize: isSelected ? 24 : 16,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        color: isSelected ? AppColors.primary(context) : AppColors.textMuted(context),
                      ),
                    ),
                  );
                },
              ),
            ),
          ),

          // AM / PM Wheel
          Expanded(
            child: ListWheelScrollView(
              controller: _periodWheelCtrl,
              itemExtent: 44,
              perspective: 0.003,
              physics: const FixedExtentScrollPhysics(),
              onSelectedItemChanged: (idx) {
                FeedbackService.instance.selection();
                setState(() => _isPm = idx == 1);
              },
              children: [
                Center(
                  child: Text(
                    'AM',
                    style: TextStyle(
                      fontSize: !_isPm ? 22 : 16,
                      fontWeight: !_isPm ? FontWeight.bold : FontWeight.normal,
                      color: !_isPm ? AppColors.primary(context) : AppColors.textMuted(context),
                    ),
                  ),
                ),
                Center(
                  child: Text(
                    'PM',
                    style: TextStyle(
                      fontSize: _isPm ? 22 : 16,
                      fontWeight: _isPm ? FontWeight.bold : FontWeight.normal,
                      color: _isPm ? AppColors.primary(context) : AppColors.textMuted(context),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSelectableChip({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary(context) : AppColors.surfaceMuted(context),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? AppColors.primary(context) : AppColors.border(context),
          ),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : AppColors.textPrimary(context),
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
            fontSize: 13,
          ),
        ),
      ),
    );
  }

  Widget _buildDurationChip(String label, int minutes) {
    return ActionChip(
      label: Text(label),
      labelStyle: TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.w600,
        color: AppColors.primary(context),
      ),
      backgroundColor: AppColors.primary(context).withValues(alpha: 0.1),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      onPressed: () => _setDurationFromReference(minutes),
    );
  }
}
