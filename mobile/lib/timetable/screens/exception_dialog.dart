import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../providers/timetable_provider.dart';
import '../../attendance/providers/attendance_provider.dart';

class ExceptionDialog extends StatefulWidget {
  const ExceptionDialog({super.key});

  @override
  State<ExceptionDialog> createState() => _ExceptionDialogState();
}

class _ExceptionDialogState extends State<ExceptionDialog> {
  String _exceptionType = 'cancelled'; // 'cancelled' | 'extra' | 'rescheduled'

  DateTime _date = DateTime.now();
  DateTime _replacementDate = DateTime.now().add(const Duration(days: 1));
  String? _selectedSlotId;
  String? _selectedSubjectId;

  final _startCtrl = TextEditingController(text: '09:00');
  final _endCtrl = TextEditingController(text: '10:00');
  final _repStartCtrl = TextEditingController(text: '14:00');
  final _repEndCtrl = TextEditingController(text: '15:00');
  final _notesCtrl = TextEditingController();

  @override
  void dispose() {
    _startCtrl.dispose();
    _endCtrl.dispose();
    _repStartCtrl.dispose();
    _repEndCtrl.dispose();
    _notesCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final timetableProvider = context.read<TimetableProvider>();
    final attendanceProvider = context.read<AttendanceProvider>();
    final subjects = timetableProvider.subjects.isNotEmpty
        ? timetableProvider.subjects
        : attendanceProvider.subjects;
    final slots = timetableProvider.slots.isNotEmpty
        ? timetableProvider.slots
        : attendanceProvider.slots;

    if (_selectedSlotId == null && slots.isNotEmpty) {
      _selectedSlotId = slots.first.id;
    }
    if (_selectedSubjectId == null && subjects.isNotEmpty) {
      _selectedSubjectId = subjects.first.id;
    }

    final dateFmt = DateFormat('yyyy-MM-dd');

    return AlertDialog(
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      title: const Text('Schedule Exception'),
      content: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 400),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              DropdownButtonFormField<String>(
                initialValue: _exceptionType,
                isExpanded: true,
                decoration: const InputDecoration(labelText: 'Exception Type'),
                items: const [
                  DropdownMenuItem(value: 'cancelled', child: Text('Cancel a Class')),
                  DropdownMenuItem(value: 'extra', child: Text('Add Extra Class')),
                  DropdownMenuItem(value: 'rescheduled', child: Text('Reschedule a Class')),
                ],
                onChanged: (val) {
                  if (val != null) setState(() => _exceptionType = val);
                },
              ),
              const SizedBox(height: 16),

              // Date picker
              OutlinedButton.icon(
                icon: const Icon(Icons.calendar_today, size: 16),
                label: Text('Date: ${dateFmt.format(_date)}'),
                onPressed: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: _date,
                    firstDate: DateTime(2020),
                    lastDate: DateTime(2035),
                  );
                  if (picked != null) setState(() => _date = picked);
                },
              ),
              const SizedBox(height: 12),

              if (_exceptionType == 'cancelled' || _exceptionType == 'rescheduled') ...[
                DropdownButtonFormField<String>(
                  initialValue: _selectedSlotId,
                  isExpanded: true,
                  decoration: const InputDecoration(labelText: 'Affected Class Slot'),
                  items: slots.map((s) {
                    final sub = subjects.firstWhere(
                      (sub) => sub.id == s.subjectId,
                      orElse: () => subjects.first,
                    );
                    return DropdownMenuItem(
                      value: s.id,
                      child: Text(
                        '${sub.name} (${s.startTime.substring(0, 5)})',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    );
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedSlotId = val);
                  },
                ),
                const SizedBox(height: 12),
              ],

              if (_exceptionType == 'extra') ...[
                DropdownButtonFormField<String>(
                  initialValue: _selectedSubjectId,
                  isExpanded: true,
                  decoration: const InputDecoration(labelText: 'Subject'),
                  items: subjects
                      .map((s) => DropdownMenuItem(
                            value: s.id,
                            child: Text(
                              s.name,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ))
                      .toList(),
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedSubjectId = val);
                  },
                ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _startCtrl,
                      decoration: const InputDecoration(labelText: 'Start (HH:mm)'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: _endCtrl,
                      decoration: const InputDecoration(labelText: 'End (HH:mm)'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
            ],

            if (_exceptionType == 'rescheduled') ...[
              OutlinedButton.icon(
                icon: const Icon(Icons.event_repeat, size: 16),
                label: Text('New Date: ${dateFmt.format(_replacementDate)}'),
                onPressed: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: _replacementDate,
                    firstDate: DateTime(2020),
                    lastDate: DateTime(2035),
                  );
                  if (picked != null) setState(() => _replacementDate = picked);
                },
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _repStartCtrl,
                      decoration: const InputDecoration(labelText: 'New Start'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: _repEndCtrl,
                      decoration: const InputDecoration(labelText: 'New End'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
            ],

            TextField(
              controller: _notesCtrl,
              decoration: const InputDecoration(labelText: 'Reason / Notes (Optional)'),
            ),
          ],
        ),
      ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: () async {
            final dateStr = dateFmt.format(_date);
            final notes = _notesCtrl.text.trim().isNotEmpty ? _notesCtrl.text.trim() : null;

            if (_exceptionType == 'cancelled' && _selectedSlotId != null) {
              await timetableProvider.cancelClass(
                slotId: _selectedSlotId!,
                date: dateStr,
                notes: notes,
              );
            } else if (_exceptionType == 'extra' && _selectedSubjectId != null) {
              await timetableProvider.addExtraClass(
                subjectId: _selectedSubjectId!,
                date: dateStr,
                startTime: '${_startCtrl.text.trim()}:00',
                endTime: '${_endCtrl.text.trim()}:00',
                notes: notes,
              );
            } else if (_exceptionType == 'rescheduled' && _selectedSlotId != null) {
              final repDateStr = dateFmt.format(_replacementDate);
              await timetableProvider.rescheduleClass(
                slotId: _selectedSlotId!,
                originalDate: dateStr,
                replacementDate: repDateStr,
                replacementStartTime: '${_repStartCtrl.text.trim()}:00',
                replacementEndTime: '${_repEndCtrl.text.trim()}:00',
                notes: notes,
              );
            }

            // Refresh attendance provider to immediately update today's classes
            await attendanceProvider.loadData(forceRefresh: true);

            if (context.mounted) {
              Navigator.of(context).pop();
            }
          },
          child: const Text('Confirm Exception'),
        ),
      ],
    );
  }
}
