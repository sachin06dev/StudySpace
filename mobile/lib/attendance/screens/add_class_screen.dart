import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../core/services/feedback_service.dart';
import '../../timetable/models/timetable_slot.dart';
import '../../timetable/providers/timetable_provider.dart';
import '../providers/attendance_provider.dart';
import '../widgets/attendance_tokens.dart';

/// SilverBook-inspired Add / Edit Class screen.
/// Supports selecting subjects, component types, times, dates, and weekly recurrence.
class AddClassScreen extends StatefulWidget {
  final DateTime? initialDate;
  final TimetableSlot? existingSlot;

  const AddClassScreen({
    super.key,
    this.initialDate,
    this.existingSlot,
  });

  @override
  State<AddClassScreen> createState() => _AddClassScreenState();
}

class _AddClassScreenState extends State<AddClassScreen> {
  late DateTime _selectedDate;
  String? _selectedSubjectId;
  String _classType = 'theory'; // 'theory' (Lecture), 'lab' (Practical), 'tutorial'
  TimeOfDay _startTime = const TimeOfDay(hour: 9, minute: 0);
  TimeOfDay _endTime = const TimeOfDay(hour: 10, minute: 0);
  bool _repeatsWeekly = true;

  final TextEditingController _facultyCtrl = TextEditingController();
  final TextEditingController _roomCtrl = TextEditingController();
  final TextEditingController _notesCtrl = TextEditingController();

  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _selectedDate = widget.initialDate ?? DateTime.now();

    final slot = widget.existingSlot;
    if (slot != null) {
      _selectedSubjectId = slot.subjectId;
      _classType = slot.classTypeOverride ?? 'theory';
      _facultyCtrl.text = slot.facultyOverride ?? '';
      _roomCtrl.text = slot.roomOverride ?? '';
      _repeatsWeekly = true;

      try {
        final sParts = slot.startTime.split(':');
        _startTime = TimeOfDay(hour: int.parse(sParts[0]), minute: int.parse(sParts[1]));
        final eParts = slot.endTime.split(':');
        _endTime = TimeOfDay(hour: int.parse(eParts[0]), minute: int.parse(eParts[1]));
      } catch (_) {}
    }
  }

  @override
  void dispose() {
    _facultyCtrl.dispose();
    _roomCtrl.dispose();
    _notesCtrl.dispose();
    super.dispose();
  }

  String _formatTimeOfDay(TimeOfDay tod) {
    final now = DateTime.now();
    final dt = DateTime(now.year, now.month, now.day, tod.hour, tod.minute);
    return DateFormat('hh:mm a').format(dt);
  }

  String _toTimeString(TimeOfDay tod) {
    return '${tod.hour.toString().padLeft(2, '0')}:${tod.minute.toString().padLeft(2, '0')}:00';
  }

  Future<void> _pickTime(bool isStart) async {
    FeedbackService.instance.selection();
    final initial = isStart ? _startTime : _endTime;
    final picked = await showTimePicker(
      context: context,
      initialTime: initial,
    );
    if (picked != null) {
      setState(() {
        if (isStart) {
          _startTime = picked;
          // Auto-adjust end time if <= start time
          final startMinutes = picked.hour * 60 + picked.minute;
          final endMinutes = _endTime.hour * 60 + _endTime.minute;
          if (endMinutes <= startMinutes) {
            final newEndMin = (startMinutes + 60) % (24 * 60);
            _endTime = TimeOfDay(hour: newEndMin ~/ 60, minute: newEndMin % 60);
          }
        } else {
          _endTime = picked;
        }
      });
    }
  }

  Future<void> _pickDate() async {
    FeedbackService.instance.selection();
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(2020),
      lastDate: DateTime(2035),
    );
    if (picked != null) {
      setState(() {
        _selectedDate = picked;
      });
    }
  }

  Future<void> _saveClass() async {
    if (_selectedSubjectId == null || _selectedSubjectId!.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a subject')),
      );
      return;
    }

    final startMinutes = _startTime.hour * 60 + _startTime.minute;
    final endMinutes = _endTime.hour * 60 + _endTime.minute;
    if (endMinutes <= startMinutes) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('End time must be after start time')),
      );
      return;
    }

    setState(() => _isSaving = true);

    try {
      final timetableProvider = context.read<TimetableProvider>();
      final attendanceProvider = context.read<AttendanceProvider>();

      if (_repeatsWeekly) {
        // Recurring slot for day of week: ISO 0 = Mon ... 6 = Sun
        final isoDay = (_selectedDate.weekday - 1) % 7;

        if (widget.existingSlot != null) {
          final updated = widget.existingSlot!.copyWith(
            subjectId: _selectedSubjectId,
            dayOfWeek: isoDay,
            startTime: _toTimeString(_startTime),
            endTime: _toTimeString(_endTime),
            facultyOverride: _facultyCtrl.text.trim().isNotEmpty ? _facultyCtrl.text.trim() : null,
            roomOverride: _roomCtrl.text.trim().isNotEmpty ? _roomCtrl.text.trim() : null,
            classTypeOverride: _classType,
          );
          await timetableProvider.updateSlot(updated);
        } else {
          await timetableProvider.addSlot(
            subjectId: _selectedSubjectId!,
            dayOfWeek: isoDay,
            startTime: _toTimeString(_startTime),
            endTime: _toTimeString(_endTime),
            facultyOverride: _facultyCtrl.text.trim().isNotEmpty ? _facultyCtrl.text.trim() : null,
            roomOverride: _roomCtrl.text.trim().isNotEmpty ? _roomCtrl.text.trim() : null,
            classTypeOverride: _classType,
          );
        }
      } else {
        // One-off ad-hoc class exception
        final dateStr = DateFormat('yyyy-MM-dd').format(_selectedDate);
        await timetableProvider.addExtraClass(
          subjectId: _selectedSubjectId!,
          date: dateStr,
          startTime: _toTimeString(_startTime),
          endTime: _toTimeString(_endTime),
          room: _roomCtrl.text.trim().isNotEmpty ? _roomCtrl.text.trim() : null,
          faculty: _facultyCtrl.text.trim().isNotEmpty ? _facultyCtrl.text.trim() : null,
          notes: _notesCtrl.text.trim().isNotEmpty ? _notesCtrl.text.trim() : null,
        );
      }

      await attendanceProvider.loadData(forceRefresh: true);
      FeedbackService.instance.attendanceSuccess();

      if (mounted) {
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save class: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSaving = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final attendanceProvider = context.watch<AttendanceProvider>();
    final timetableProvider = context.watch<TimetableProvider>();
    final subjects = timetableProvider.subjects.isNotEmpty
        ? timetableProvider.subjects
        : attendanceProvider.subjects;

    if (_selectedSubjectId == null && subjects.isNotEmpty) {
      _selectedSubjectId = subjects.first.id;
      if (_facultyCtrl.text.isEmpty && subjects.first.faculty != null) {
        _facultyCtrl.text = subjects.first.faculty!;
      }
      if (_roomCtrl.text.isEmpty && subjects.first.defaultRoom != null) {
        _roomCtrl.text = subjects.first.defaultRoom!;
      }
    }

    return Scaffold(
      backgroundColor: AttendanceTokens.bg(context),
      appBar: AppBar(
        backgroundColor: AttendanceTokens.bg(context),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          widget.existingSlot != null ? 'Edit Class' : 'Add Class',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: AttendanceTokens.textPrimary(context),
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 14),
            child: _isSaving
                ? const Center(
                    child: SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  )
                : TextButton(
                    onPressed: _saveClass,
                    child: const Text(
                      'Save',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: AttendanceTokens.primaryBlue,
                      ),
                    ),
                  ),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Section 1: Subject Selector Card
              Container(
                decoration: BoxDecoration(
                  color: AttendanceTokens.card(context),
                  borderRadius: AttendanceTokens.cardRadius,
                  border: Border.all(color: AttendanceTokens.border(context)),
                ),
                child: Column(
                  children: [
                    // Subject dropdown row
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: Row(
                        children: [
                          const Icon(Icons.school_outlined, size: 20, color: AttendanceTokens.primaryBlue),
                          const SizedBox(width: 12),
                          Expanded(
                            child: DropdownButtonHideUnderline(
                              child: DropdownButton<String>(
                                value: _selectedSubjectId,
                                isExpanded: true,
                                hint: const Text('Select subject...'),
                                dropdownColor: AttendanceTokens.card(context),
                                items: subjects.map((s) {
                                  return DropdownMenuItem(
                                    value: s.id,
                                    child: Text(
                                      s.name,
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                        color: AttendanceTokens.textPrimary(context),
                                      ),
                                    ),
                                  );
                                }).toList(),
                                onChanged: (val) {
                                  if (val != null) {
                                    setState(() {
                                      _selectedSubjectId = val;
                                      final matched = subjects.firstWhere((s) => s.id == val);
                                      if (matched.faculty != null && matched.faculty!.isNotEmpty) {
                                        _facultyCtrl.text = matched.faculty!;
                                      }
                                      if (matched.defaultRoom != null && matched.defaultRoom!.isNotEmpty) {
                                        _roomCtrl.text = matched.defaultRoom!;
                                      }
                                      _classType = matched.classType;
                                    });
                                  }
                                },
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    Divider(height: 1, color: AttendanceTokens.border(context)),

                    // Component selector row (Lecture / Tutorial / Practical)
                    Padding(
                      padding: const EdgeInsets.all(14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Class Component',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: AttendanceTokens.textMuted(context),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              _buildComponentChip('theory', 'Lecture', 'L'),
                              const SizedBox(width: 8),
                              _buildComponentChip('tutorial', 'Tutorial', 'T'),
                              const SizedBox(width: 8),
                              _buildComponentChip('lab', 'Practical', 'P'),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Section 2: Metadata (Faculty & Room)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                decoration: BoxDecoration(
                  color: AttendanceTokens.card(context),
                  borderRadius: AttendanceTokens.cardRadius,
                  border: Border.all(color: AttendanceTokens.border(context)),
                ),
                child: Column(
                  children: [
                    TextField(
                      controller: _facultyCtrl,
                      decoration: const InputDecoration(
                        icon: Icon(Icons.person_outline_rounded, size: 20),
                        hintText: 'Faculty name (optional)',
                        border: InputBorder.none,
                      ),
                    ),
                    Divider(height: 1, color: AttendanceTokens.border(context)),
                    TextField(
                      controller: _roomCtrl,
                      decoration: const InputDecoration(
                        icon: Icon(Icons.meeting_room_outlined, size: 20),
                        hintText: 'Room number / Hall (optional)',
                        border: InputBorder.none,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Section 3: Schedule / Date & Time
              Container(
                decoration: BoxDecoration(
                  color: AttendanceTokens.card(context),
                  borderRadius: AttendanceTokens.cardRadius,
                  border: Border.all(color: AttendanceTokens.border(context)),
                ),
                child: Column(
                  children: [
                    // Date
                    ListTile(
                      leading: const Icon(Icons.calendar_today_outlined, size: 20),
                      title: const Text('Date', style: TextStyle(fontSize: 14)),
                      trailing: Text(
                        DateFormat('EEE, d MMM yyyy').format(_selectedDate),
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: AttendanceTokens.primaryBlue,
                        ),
                      ),
                      onTap: _pickDate,
                    ),
                    Divider(height: 1, color: AttendanceTokens.border(context)),
                    // Starts at
                    ListTile(
                      leading: const Icon(Icons.access_time_rounded, size: 20),
                      title: const Text('Starts at', style: TextStyle(fontSize: 14)),
                      trailing: Text(
                        _formatTimeOfDay(_startTime),
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: AttendanceTokens.primaryBlue,
                        ),
                      ),
                      onTap: () => _pickTime(true),
                    ),
                    Divider(height: 1, color: AttendanceTokens.border(context)),
                    // Ends at
                    ListTile(
                      leading: const Icon(Icons.update_rounded, size: 20),
                      title: const Text('Ends at', style: TextStyle(fontSize: 14)),
                      trailing: Text(
                        _formatTimeOfDay(_endTime),
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: AttendanceTokens.primaryBlue,
                        ),
                      ),
                      onTap: () => _pickTime(false),
                    ),
                    Divider(height: 1, color: AttendanceTokens.border(context)),
                    // Repeats weekly
                    SwitchListTile(
                      value: _repeatsWeekly,
                      title: const Text('Repeats weekly', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                      subtitle: Text(
                        _repeatsWeekly
                            ? 'Repeats every ${DateFormat('EEEE').format(_selectedDate)}'
                            : 'Single ad-hoc class occurrence',
                        style: TextStyle(fontSize: 12, color: AttendanceTokens.textMuted(context)),
                      ),
                      onChanged: (val) => setState(() => _repeatsWeekly = val),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Section 4: Notes
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                decoration: BoxDecoration(
                  color: AttendanceTokens.card(context),
                  borderRadius: AttendanceTokens.cardRadius,
                  border: Border.all(color: AttendanceTokens.border(context)),
                ),
                child: TextField(
                  controller: _notesCtrl,
                  maxLines: 2,
                  decoration: const InputDecoration(
                    icon: Icon(Icons.notes_rounded, size: 20),
                    hintText: 'Add notes or meeting link (optional)',
                    border: InputBorder.none,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildComponentChip(String type, String label, String initial) {
    final isSelected = _classType == type;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _classType = type),
        borderRadius: AttendanceTokens.controlRadius,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected
                ? AttendanceTokens.primaryBlue
                : AttendanceTokens.border(context).withValues(alpha: 0.3),
            borderRadius: AttendanceTokens.controlRadius,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                initial,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                  color: isSelected ? Colors.white : AttendanceTokens.textMuted(context),
                ),
              ),
              const SizedBox(width: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                  color: isSelected ? Colors.white : AttendanceTokens.textPrimary(context),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
