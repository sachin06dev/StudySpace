import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/timetable_slot.dart';
import '../providers/timetable_provider.dart';
import 'fast_time_picker_sheet.dart';
import 'repeat_class_sheet.dart';
import '../../attendance/providers/attendance_provider.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/utils/time_formatter.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/services/feedback_service.dart';

class AddSlotSheet extends StatefulWidget {
  final TimetableSlot? existingSlot;
  final int? initialDay;

  const AddSlotSheet({
    super.key,
    this.existingSlot,
    this.initialDay,
  });

  static Future<void> show(
    BuildContext context, {
    TimetableSlot? existingSlot,
    int? initialDay,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => AddSlotSheet(
        existingSlot: existingSlot,
        initialDay: initialDay,
      ),
    );
  }

  @override
  State<AddSlotSheet> createState() => _AddSlotSheetState();
}

class _AddSlotSheetState extends State<AddSlotSheet> {
  late String _selectedSubjectId;
  late int _selectedDay;
  late TimeOfDay _startTime;
  late TimeOfDay _endTime;
  late String _classType;
  final TextEditingController _roomCtrl = TextEditingController();
  final TextEditingController _facultyCtrl = TextEditingController();

  final List<String> _dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  final List<String> _classTypes = ['theory', 'lab', 'tutorial', 'other'];

  @override
  void initState() {
    super.initState();
    final slot = widget.existingSlot;
    _selectedDay = slot?.dayOfWeek ?? widget.initialDay ?? 0;
    _selectedSubjectId = slot?.subjectId ?? '';
    _classType = slot?.classTypeOverride ?? 'theory';

    if (slot != null) {
      final sParts = slot.startTime.split(':');
      _startTime = TimeOfDay(hour: int.parse(sParts[0]), minute: int.parse(sParts[1]));
      final eParts = slot.endTime.split(':');
      _endTime = TimeOfDay(hour: int.parse(eParts[0]), minute: int.parse(eParts[1]));
      _roomCtrl.text = slot.roomOverride ?? '';
      _facultyCtrl.text = slot.facultyOverride ?? '';
    } else {
      _startTime = const TimeOfDay(hour: 9, minute: 0);
      _endTime = const TimeOfDay(hour: 10, minute: 0);
    }
  }

  @override
  void dispose() {
    _roomCtrl.dispose();
    _facultyCtrl.dispose();
    super.dispose();
  }

  String _formatTime(TimeOfDay t) {
    return '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final timetableProvider = context.watch<TimetableProvider>();
    final attendanceProvider = context.watch<AttendanceProvider>();
    final subjects = timetableProvider.subjects.isNotEmpty
        ? timetableProvider.subjects
        : attendanceProvider.subjects;

    if (_selectedSubjectId.isEmpty && subjects.isNotEmpty) {
      _selectedSubjectId = subjects.first.id;
    }

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
      child: SingleChildScrollView(
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

            // Title
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  widget.existingSlot != null ? 'Edit Class Slot' : 'Add Class Slot',
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

            const SizedBox(height: AppSpacing.md),

            // Subject Selector
            Text(
              'SUBJECT',
              style: AppTypography.overline.copyWith(color: AppColors.textMuted(context)),
            ),
            const SizedBox(height: 6),
            if (subjects.isEmpty)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.warningBg(context),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  'No subjects created yet. Please create a subject first.',
                  style: TextStyle(color: AppColors.warningText(context), fontSize: 13),
                ),
              )
            else
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.surfaceMuted(context),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border(context)),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _selectedSubjectId.isNotEmpty ? _selectedSubjectId : null,
                    isExpanded: true,
                    dropdownColor: AppColors.card(context),
                    items: subjects.map((s) {
                      return DropdownMenuItem(
                        value: s.id,
                        child: Text(
                          s.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: AppColors.textPrimary(context),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) {
                        FeedbackService.instance.selection();
                        setState(() => _selectedSubjectId = val);
                      }
                    },
                  ),
                ),
              ),

            const SizedBox(height: AppSpacing.md),

            // Day of Week Chips - Responsive adaptive pills or Wrap for <330dp
            Text(
              'DAY OF WEEK',
              style: AppTypography.overline.copyWith(color: AppColors.textMuted(context)),
            ),
            const SizedBox(height: 6),
            LayoutBuilder(
              builder: (context, constraints) {
                if (constraints.maxWidth >= 330) {
                  return Row(
                    children: List.generate(7, (i) {
                      final isSelected = _selectedDay == i;
                      return Expanded(
                        child: Padding(
                          padding: EdgeInsets.only(right: i < 6 ? 4.0 : 0),
                          child: InkWell(
                            onTap: () {
                              FeedbackService.instance.selection();
                              setState(() => _selectedDay = i);
                            },
                            borderRadius: BorderRadius.circular(8),
                            child: Container(
                              alignment: Alignment.center,
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              decoration: BoxDecoration(
                                color: isSelected ? AppColors.primary(context) : AppColors.surfaceMuted(context),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: isSelected ? AppColors.primary(context) : AppColors.border(context),
                                ),
                              ),
                              child: Text(
                                _dayLabels[i],
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                                  color: isSelected ? Colors.white : AppColors.textPrimary(context),
                                ),
                              ),
                            ),
                          ),
                        ),
                      );
                    }),
                  );
                }
                return Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: List.generate(7, (i) {
                    final isSelected = _selectedDay == i;
                    return InkWell(
                      onTap: () {
                        FeedbackService.instance.selection();
                        setState(() => _selectedDay = i);
                      },
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected ? AppColors.primary(context) : AppColors.surfaceMuted(context),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: isSelected ? AppColors.primary(context) : AppColors.border(context),
                          ),
                        ),
                        child: Text(
                          _dayLabels[i],
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                            color: isSelected ? Colors.white : AppColors.textPrimary(context),
                          ),
                        ),
                      ),
                    );
                  }),
                );
              },
            ),

            const SizedBox(height: AppSpacing.md),

            // Start and End Time (Fast 12-hour picker)
            Text(
              'TIMING',
              style: AppTypography.overline.copyWith(color: AppColors.textMuted(context)),
            ),
            const SizedBox(height: 6),
            Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: () async {
                      final picked = await FastTimePickerSheet.show(
                        context,
                        title: 'Select Start Time',
                        initialTime: _startTime,
                      );
                      if (picked != null) {
                        setState(() {
                          _startTime = picked;
                          // If end time is not after start time, auto adjust end time by 1 hour
                          final sMin = picked.hour * 60 + picked.minute;
                          final eMin = _endTime.hour * 60 + _endTime.minute;
                          if (eMin <= sMin) {
                            final nextTotal = (sMin + 60).clamp(0, 23 * 60 + 55);
                            _endTime = TimeOfDay(hour: nextTotal ~/ 60, minute: (nextTotal % 60 ~/ 5) * 5);
                          }
                        });
                      }
                    },
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 14),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceMuted(context),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.border(context)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Start Time', style: AppTypography.caption.copyWith(color: AppColors.textMuted(context))),
                          const SizedBox(height: 2),
                          Row(
                            children: [
                              Icon(Icons.schedule_rounded, size: 16, color: AppColors.primary(context)),
                              const SizedBox(width: 6),
                              Text(
                                TimeFormatter.format12Hour(_startTime),
                                style: AppTypography.bodyBold.copyWith(color: AppColors.textPrimary(context)),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: InkWell(
                    onTap: () async {
                      final picked = await FastTimePickerSheet.show(
                        context,
                        title: 'Select End Time',
                        initialTime: _endTime,
                        minTime: _startTime,
                        referenceStartTime: _startTime,
                      );
                      if (picked != null) {
                        setState(() => _endTime = picked);
                      }
                    },
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 14),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceMuted(context),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.border(context)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('End Time', style: AppTypography.caption.copyWith(color: AppColors.textMuted(context))),
                          const SizedBox(height: 2),
                          Row(
                            children: [
                              Icon(Icons.schedule_rounded, size: 16, color: AppColors.primary(context)),
                              const SizedBox(width: 6),
                              Text(
                                TimeFormatter.format12Hour(_endTime),
                                style: AppTypography.bodyBold.copyWith(color: AppColors.textPrimary(context)),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: AppSpacing.md),

            // Class Type Segmented Chips
            Text(
              'CLASS TYPE',
              style: AppTypography.overline.copyWith(color: AppColors.textMuted(context)),
            ),
            const SizedBox(height: 6),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _classTypes.map((type) {
                final isSelected = _classType == type;
                return ChoiceChip(
                  label: Text(type.toUpperCase()),
                  selected: isSelected,
                  selectedColor: AppColors.primary(context),
                  labelStyle: TextStyle(
                    fontSize: 11,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                    color: isSelected ? Colors.white : AppColors.textPrimary(context),
                  ),
                  backgroundColor: AppColors.surfaceMuted(context),
                  side: BorderSide(
                    color: isSelected ? AppColors.primary(context) : AppColors.border(context),
                  ),
                  onSelected: (selected) {
                    if (selected) {
                      FeedbackService.instance.selection();
                      setState(() => _classType = type);
                    }
                  },
                );
              }).toList(),
            ),

            const SizedBox(height: AppSpacing.md),

            // Optional Room & Faculty
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _roomCtrl,
                    decoration: InputDecoration(
                      labelText: 'Room (Optional)',
                      hintText: 'e.g. 302',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: _facultyCtrl,
                    decoration: InputDecoration(
                      labelText: 'Faculty (Optional)',
                      hintText: 'e.g. Dr. Smith',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: AppSpacing.xl),

            // Save / Delete Buttons
            Row(
              children: [
                if (widget.existingSlot != null) ...[
                  IconButton(
                    tooltip: 'Repeat class across other days',
                    icon: const Icon(Icons.repeat_rounded, color: AppColors.brandPrimary),
                    onPressed: () {
                      FeedbackService.instance.selection();
                      final sub = subjects.firstWhere(
                        (s) => s.id == widget.existingSlot!.subjectId,
                        orElse: () => subjects.first,
                      );
                      Navigator.of(context).pop();
                      RepeatClassSheet.showForSlot(
                        context,
                        slot: widget.existingSlot!,
                        subjectName: sub.name,
                      );
                    },
                  ),
                  const SizedBox(width: 4),
                  IconButton(
                    icon: const Icon(Icons.delete_outline_rounded, color: AppColors.danger),
                    onPressed: () async {
                      FeedbackService.instance.selection();
                      final confirm = await showDialog<bool>(
                        context: context,
                        builder: (ctx) => AlertDialog(
                          title: const Text('Delete Slot?'),
                          content: const Text('Are you sure you want to delete this weekly class slot?'),
                          actions: [
                            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
                              onPressed: () => Navigator.pop(ctx, true),
                              child: const Text('Delete', style: TextStyle(color: Colors.white)),
                            ),
                          ],
                        ),
                      );
                      if (confirm == true && mounted) {
                        Navigator.of(context).pop();
                        await timetableProvider.deleteSlot(widget.existingSlot!.id);
                      }
                    },
                  ),
                  const SizedBox(width: 8),
                ],
                Expanded(
                  child: ElevatedButton(
                    onPressed: _selectedSubjectId.isEmpty
                        ? null
                        : () async {
                            FeedbackService.instance.timetableSaved();
                            Navigator.of(context).pop();

                            final startStr = '${_formatTime(_startTime)}:00';
                            final endStr = '${_formatTime(_endTime)}:00';

                            if (widget.existingSlot != null) {
                              final updated = widget.existingSlot!.copyWith(
                                subjectId: _selectedSubjectId,
                                dayOfWeek: _selectedDay,
                                startTime: startStr,
                                endTime: endStr,
                                roomOverride: _roomCtrl.text.trim().isNotEmpty ? _roomCtrl.text.trim() : null,
                                facultyOverride: _facultyCtrl.text.trim().isNotEmpty ? _facultyCtrl.text.trim() : null,
                                classTypeOverride: _classType,
                              );
                              await timetableProvider.updateSlot(updated);
                            } else {
                              await timetableProvider.addSlot(
                                subjectId: _selectedSubjectId,
                                dayOfWeek: _selectedDay,
                                startTime: startStr,
                                endTime: endStr,
                                roomOverride: _roomCtrl.text.trim().isNotEmpty ? _roomCtrl.text.trim() : null,
                                facultyOverride: _facultyCtrl.text.trim().isNotEmpty ? _facultyCtrl.text.trim() : null,
                                classTypeOverride: _classType,
                              );
                            }
                          },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary(context),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text(
                      widget.existingSlot != null ? 'Update Slot' : 'Save Slot',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
