import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/timetable_slot.dart';
import '../providers/timetable_provider.dart';
import '../../attendance/providers/attendance_provider.dart';

class EditSlotDialog extends StatefulWidget {
  final TimetableSlot? existingSlot;
  final int? initialDay;

  const EditSlotDialog({
    super.key,
    this.existingSlot,
    this.initialDay,
  });

  @override
  State<EditSlotDialog> createState() => _EditSlotDialogState();
}

class _EditSlotDialogState extends State<EditSlotDialog> {
  final _formKey = GlobalKey<FormState>();
  late String _selectedSubjectId;
  late int _selectedDay;
  late TextEditingController _startCtrl;
  late TextEditingController _endCtrl;
  late TextEditingController _roomCtrl;
  late TextEditingController _facultyCtrl;
  String _classType = 'theory';

  final List<String> _days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  @override
  void initState() {
    super.initState();
    final slot = widget.existingSlot;
    _selectedDay = slot?.dayOfWeek ?? widget.initialDay ?? 0;
    _selectedSubjectId = slot?.subjectId ?? '';
    _startCtrl = TextEditingController(
      text: slot != null ? slot.startTime.substring(0, 5) : '09:00',
    );
    _endCtrl = TextEditingController(
      text: slot != null ? slot.endTime.substring(0, 5) : '10:00',
    );
    _roomCtrl = TextEditingController(text: slot?.roomOverride ?? '');
    _facultyCtrl = TextEditingController(text: slot?.facultyOverride ?? '');
    _classType = slot?.classTypeOverride ?? 'theory';
  }

  @override
  void dispose() {
    _startCtrl.dispose();
    _endCtrl.dispose();
    _roomCtrl.dispose();
    _facultyCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final timetableProvider = context.read<TimetableProvider>();
    final attendanceProvider = context.read<AttendanceProvider>();
    final subjects = timetableProvider.subjects.isNotEmpty
        ? timetableProvider.subjects
        : attendanceProvider.subjects;

    if (_selectedSubjectId.isEmpty && subjects.isNotEmpty) {
      _selectedSubjectId = subjects.first.id;
    }

    return AlertDialog(
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      title: Text(widget.existingSlot != null ? 'Edit Class Slot' : 'Add Class Slot'),
      content: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 400),
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
            children: [
              if (subjects.isEmpty)
                const Padding(
                  padding: EdgeInsets.only(bottom: 12.0),
                  child: Text(
                    'No subjects created yet! Please add a subject first.',
                    style: TextStyle(color: Colors.red),
                  ),
                )
              else
                DropdownButtonFormField<String>(
                  initialValue: _selectedSubjectId.isNotEmpty ? _selectedSubjectId : null,
                  isExpanded: true,
                  decoration: const InputDecoration(labelText: 'Subject*'),
                  items: subjects
                      .map(
                        (s) => DropdownMenuItem(
                          value: s.id,
                          child: Text(
                            s.name,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      )
                      .toList(),
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedSubjectId = val);
                  },
                ),
              const SizedBox(height: 12),
              DropdownButtonFormField<int>(
                initialValue: _selectedDay,
                decoration: const InputDecoration(labelText: 'Day of Week'),
                items: List.generate(
                  7,
                  (i) => DropdownMenuItem(value: i, child: Text(_days[i])),
                ),
                onChanged: (val) {
                  if (val != null) setState(() => _selectedDay = val);
                },
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _startCtrl,
                      decoration: const InputDecoration(labelText: 'Start (HH:mm)'),
                      validator: (val) => val == null || val.isEmpty ? 'Required' : null,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextFormField(
                      controller: _endCtrl,
                      decoration: const InputDecoration(labelText: 'End (HH:mm)'),
                      validator: (val) => val == null || val.isEmpty ? 'Required' : null,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _roomCtrl,
                      decoration: const InputDecoration(labelText: 'Room'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      initialValue: _classType,
                      decoration: const InputDecoration(labelText: 'Type'),
                      items: const [
                        DropdownMenuItem(value: 'theory', child: Text('Theory')),
                        DropdownMenuItem(value: 'lab', child: Text('Lab')),
                        DropdownMenuItem(value: 'tutorial', child: Text('Tutorial')),
                        DropdownMenuItem(value: 'other', child: Text('Other')),
                      ],
                      onChanged: (val) {
                        if (val != null) setState(() => _classType = val);
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _facultyCtrl,
                decoration: const InputDecoration(labelText: 'Faculty'),
              ),
            ],
          ),
        ),
      ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: subjects.isEmpty
              ? null
              : () async {
                  if (!_formKey.currentState!.validate()) return;

                  final startTime = '${_startCtrl.text.trim()}:00';
                  final endTime = '${_endCtrl.text.trim()}:00';
                  final room = _roomCtrl.text.trim().isNotEmpty ? _roomCtrl.text.trim() : null;
                  final faculty =
                      _facultyCtrl.text.trim().isNotEmpty ? _facultyCtrl.text.trim() : null;

                  if (widget.existingSlot != null) {
                    final updated = TimetableSlot(
                      id: widget.existingSlot!.id,
                      userId: widget.existingSlot!.userId,
                      semesterId: widget.existingSlot!.semesterId,
                      subjectId: _selectedSubjectId,
                      dayOfWeek: _selectedDay,
                      startTime: startTime,
                      endTime: endTime,
                      roomOverride: room,
                      facultyOverride: faculty,
                      classTypeOverride: _classType,
                    );
                    await timetableProvider.updateSlot(updated);
                  } else {
                    await timetableProvider.addSlot(
                      subjectId: _selectedSubjectId,
                      dayOfWeek: _selectedDay,
                      startTime: startTime,
                      endTime: endTime,
                      roomOverride: room,
                      facultyOverride: faculty,
                      classTypeOverride: _classType,
                    );
                  }

                  if (context.mounted) {
                    Navigator.of(context).pop();
                  }
                },
          child: const Text('Save'),
        ),
      ],
    );
  }
}
