import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../providers/timetable_provider.dart';
import 'fast_time_picker_sheet.dart';
import '../../attendance/providers/attendance_provider.dart';
import '../../core/utils/time_formatter.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/services/feedback_service.dart';

class AddExtraClassSheet extends StatefulWidget {
  final DateTime? initialDate;

  const AddExtraClassSheet({
    super.key,
    this.initialDate,
  });

  static Future<void> show(BuildContext context, {DateTime? initialDate}) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => AddExtraClassSheet(initialDate: initialDate),
    );
  }

  @override
  State<AddExtraClassSheet> createState() => _AddExtraClassSheetState();
}

class _AddExtraClassSheetState extends State<AddExtraClassSheet> {
  late DateTime _selectedDate;
  late String _selectedSubjectId;
  late TimeOfDay _startTime;
  late TimeOfDay _endTime;
  final TextEditingController _roomCtrl = TextEditingController();
  final TextEditingController _facultyCtrl = TextEditingController();
  final TextEditingController _notesCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _selectedDate = widget.initialDate ?? DateTime.now();
    _selectedSubjectId = '';
    _startTime = const TimeOfDay(hour: 11, minute: 0);
    _endTime = const TimeOfDay(hour: 12, minute: 0);
  }

  @override
  void dispose() {
    _roomCtrl.dispose();
    _facultyCtrl.dispose();
    _notesCtrl.dispose();
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
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.accentViolet.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.auto_awesome, color: AppColors.accentViolet, size: 20),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      'Add Extra Class',
                      style: AppTypography.heading3.copyWith(
                        color: AppColors.textPrimary(context),
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
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

            // Date Picker Button
            Text(
              'DATE',
              style: AppTypography.overline.copyWith(color: AppColors.textMuted(context)),
            ),
            const SizedBox(height: 6),
            InkWell(
              onTap: () async {
                final picked = await showDatePicker(
                  context: context,
                  initialDate: _selectedDate,
                  firstDate: DateTime(2020),
                  lastDate: DateTime(2035),
                );
                if (picked != null) {
                  FeedbackService.instance.selection();
                  setState(() => _selectedDate = picked);
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
                child: Row(
                  children: [
                    Icon(Icons.calendar_today_rounded, size: 16, color: AppColors.primary(context)),
                    const SizedBox(width: 8),
                    Text(
                      DateFormat('EEEE, d MMMM yyyy').format(_selectedDate),
                      style: AppTypography.bodyBold.copyWith(color: AppColors.textPrimary(context)),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: AppSpacing.md),

            // Fast 12-hour Start and End Time Selectors
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
                        title: 'Start Time',
                        initialTime: _startTime,
                      );
                      if (picked != null) {
                        setState(() {
                          _startTime = picked;
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
                          Text('Start', style: AppTypography.caption.copyWith(color: AppColors.textMuted(context))),
                          const SizedBox(height: 2),
                          Row(
                            children: [
                              Icon(Icons.schedule_rounded, size: 16, color: AppColors.primary(context)),
                              const SizedBox(width: 6),
                              Text(TimeFormatter.format12Hour(_startTime), style: AppTypography.bodyBold),
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
                        title: 'End Time',
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
                          Text('End', style: AppTypography.caption.copyWith(color: AppColors.textMuted(context))),
                          const SizedBox(height: 2),
                          Row(
                            children: [
                              Icon(Icons.schedule_rounded, size: 16, color: AppColors.primary(context)),
                              const SizedBox(width: 6),
                              Text(TimeFormatter.format12Hour(_endTime), style: AppTypography.bodyBold),
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

            // Optional Room
            TextField(
              controller: _roomCtrl,
              decoration: InputDecoration(
                labelText: 'Room (Optional)',
                hintText: 'e.g. Lab 4',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
              ),
            ),

            const SizedBox(height: AppSpacing.xl),

            // Save Button
            ElevatedButton.icon(
              onPressed: _selectedSubjectId.isEmpty
                  ? null
                  : () async {
                      FeedbackService.instance.timetableSaved();
                      Navigator.of(context).pop();

                      final dateStr = DateFormat('yyyy-MM-dd').format(_selectedDate);
                      final startStr = '${_formatTime(_startTime)}:00';
                      final endStr = '${_formatTime(_endTime)}:00';

                      await timetableProvider.addExtraClass(
                        subjectId: _selectedSubjectId,
                        date: dateStr,
                        startTime: startStr,
                        endTime: endStr,
                        room: _roomCtrl.text.trim().isNotEmpty ? _roomCtrl.text.trim() : null,
                        faculty: _facultyCtrl.text.trim().isNotEmpty ? _facultyCtrl.text.trim() : null,
                        notes: _notesCtrl.text.trim().isNotEmpty ? _notesCtrl.text.trim() : null,
                      );

                      // Refresh attendance provider so today's resolved classes include the extra class
                      await attendanceProvider.loadData();
                    },
              icon: const Icon(Icons.add_rounded, size: 20),
              label: const Text(
                'Schedule Extra Class',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.accentViolet,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
