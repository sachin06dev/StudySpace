import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../models/scanned_class.dart';
import '../services/timetable_scanner_service.dart';
import '../../attendance/providers/attendance_provider.dart';
import '../../timetable/providers/timetable_provider.dart';

class ScannedTimetableReviewScreen extends StatefulWidget {
  final ScanTimetableResult scanResult;

  const ScannedTimetableReviewScreen({
    super.key,
    required this.scanResult,
  });

  @override
  State<ScannedTimetableReviewScreen> createState() => _ScannedTimetableReviewScreenState();
}

class _ScannedTimetableReviewScreenState extends State<ScannedTimetableReviewScreen> {
  final TimetableScannerService _scannerService = TimetableScannerService();
  late List<ScannedClassItem> _classes;
  late TextEditingController _semesterNameController;
  late DateTime _startDate;
  late DateTime _endDate;
  bool _isSaving = false;
  bool _saveToExisting = false;

  final List<String> _dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  @override
  void initState() {
    super.initState();
    _classes = List.from(widget.scanResult.classes);
    _semesterNameController = TextEditingController(
      text: widget.scanResult.suggestedSemesterName.isNotEmpty
          ? widget.scanResult.suggestedSemesterName
          : 'Current Semester',
    );
    final now = DateTime.now();
    _startDate = DateTime(now.year, now.month, 1);
    _endDate = DateTime(now.year, now.month + 4, 30);
  }

  @override
  void dispose() {
    _semesterNameController.dispose();
    super.dispose();
  }

  void _editClassDialog(int index) {
    final item = _classes[index];
    final nameCtrl = TextEditingController(text: item.subjectName);
    final codeCtrl = TextEditingController(text: item.subjectCode ?? '');
    final facultyCtrl = TextEditingController(text: item.faculty ?? '');
    final roomCtrl = TextEditingController(text: item.room ?? '');
    final startCtrl = TextEditingController(text: item.startTime);
    final endCtrl = TextEditingController(text: item.endTime);
    int selectedDay = item.dayOfWeek;
    String selectedType = item.classType;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: const Text('Edit Class'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: nameCtrl,
                  decoration: const InputDecoration(labelText: 'Subject Name*'),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: codeCtrl,
                        decoration: const InputDecoration(labelText: 'Code'),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        value: selectedType,
                        decoration: const InputDecoration(labelText: 'Type'),
                        items: const [
                          DropdownMenuItem(value: 'theory', child: Text('Theory')),
                          DropdownMenuItem(value: 'lab', child: Text('Lab')),
                          DropdownMenuItem(value: 'tutorial', child: Text('Tutorial')),
                          DropdownMenuItem(value: 'other', child: Text('Other')),
                        ],
                        onChanged: (val) {
                          if (val != null) setDialogState(() => selectedType = val);
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<int>(
                  value: selectedDay,
                  decoration: const InputDecoration(labelText: 'Day of Week'),
                  items: List.generate(
                    7,
                    (i) => DropdownMenuItem(value: i, child: Text(_dayNames[i])),
                  ),
                  onChanged: (val) {
                    if (val != null) setDialogState(() => selectedDay = val);
                  },
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: startCtrl,
                        decoration: const InputDecoration(labelText: 'Start (HH:mm)'),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextField(
                        controller: endCtrl,
                        decoration: const InputDecoration(labelText: 'End (HH:mm)'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: roomCtrl,
                        decoration: const InputDecoration(labelText: 'Room'),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextField(
                        controller: facultyCtrl,
                        decoration: const InputDecoration(labelText: 'Faculty'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                if (nameCtrl.text.trim().isEmpty) return;
                setState(() {
                  _classes[index] = ScannedClassItem(
                    id: item.id,
                    dayOfWeek: selectedDay,
                    startTime: startCtrl.text.trim(),
                    endTime: endCtrl.text.trim(),
                    subjectName: nameCtrl.text.trim(),
                    subjectCode: codeCtrl.text.trim().isNotEmpty ? codeCtrl.text.trim() : null,
                    faculty: facultyCtrl.text.trim().isNotEmpty ? facultyCtrl.text.trim() : null,
                    room: roomCtrl.text.trim().isNotEmpty ? roomCtrl.text.trim() : null,
                    classType: selectedType,
                  );
                });
                Navigator.of(ctx).pop();
              },
              child: const Text('Save'),
            ),
          ],
        ),
      ),
    );
  }

  void _addNewClass() {
    setState(() {
      _classes.add(
        ScannedClassItem(
          id: 'manual_${DateTime.now().millisecondsSinceEpoch}',
          dayOfWeek: 0,
          startTime: '09:00',
          endTime: '10:00',
          subjectName: 'New Subject',
          classType: 'theory',
        ),
      );
    });
    _editClassDialog(_classes.length - 1);
  }

  Future<void> _handleConfirmSave() async {
    if (_classes.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Add at least one class before saving.')),
      );
      return;
    }

    setState(() => _isSaving = true);

    try {
      final startStr = DateFormat('yyyy-MM-dd').format(_startDate);
      final endStr = DateFormat('yyyy-MM-dd').format(_endDate);

      final timetableProvider = context.read<TimetableProvider>();
      final activeSem = timetableProvider.activeSemester;
      final String? targetSemesterId = (_saveToExisting && activeSem != null) ? activeSem.id : null;

      await _scannerService.saveScannedTimetable(
        targetSemesterId: targetSemesterId,
        semesterName: _semesterNameController.text.trim(),
        startDate: startStr,
        endDate: endStr,
        setActive: true,
        classes: _classes,
      );

      if (mounted) {
        // Refresh local attendance and timetable providers
        await context.read<AttendanceProvider>().loadData(forceRefresh: true);
        await timetableProvider.loadSemesters();
        if (timetableProvider.activeSemester != null) {
          await timetableProvider.loadTimetableForSemester(timetableProvider.activeSemester!.id);
        }

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Timetable imported successfully!'),
            backgroundColor: Colors.green,
          ),
        );

        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSaving = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to save timetable: $e'),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dateFmt = DateFormat('d MMM yyyy');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Review Extracted Timetable'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_rounded),
            tooltip: 'Add Class',
            onPressed: _addNewClass,
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Header summary
            Container(
              padding: const EdgeInsets.all(16),
              color: theme.colorScheme.surface,
              child: Column(
                children: [
                  Consumer<TimetableProvider>(
                    builder: (context, tp, _) {
                      final activeSem = tp.activeSemester;
                      if (activeSem == null) return const SizedBox.shrink();
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Row(
                          children: [
                            Checkbox(
                              value: _saveToExisting,
                              onChanged: (val) {
                                setState(() => _saveToExisting = val ?? false);
                              },
                            ),
                            Expanded(
                              child: Text(
                                'Add to active semester: "${activeSem.name}"',
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                  if (!_saveToExisting) ...[
                    TextField(
                      controller: _semesterNameController,
                      decoration: const InputDecoration(
                        labelText: 'New Semester Name',
                        prefixIcon: Icon(Icons.school_outlined),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            icon: const Icon(Icons.date_range, size: 18),
                            label: Text('Starts: ${dateFmt.format(_startDate)}'),
                            onPressed: () async {
                              final picked = await showDatePicker(
                                context: context,
                                initialDate: _startDate,
                                firstDate: DateTime(2020),
                                lastDate: DateTime(2035),
                              );
                              if (picked != null) setState(() => _startDate = picked);
                            },
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: OutlinedButton.icon(
                            icon: const Icon(Icons.date_range, size: 18),
                            label: Text('Ends: ${dateFmt.format(_endDate)}'),
                            onPressed: () async {
                              final picked = await showDatePicker(
                                context: context,
                                initialDate: _endDate,
                                firstDate: _startDate,
                                lastDate: DateTime(2035),
                              );
                              if (picked != null) setState(() => _endDate = picked);
                            },
                          ),
                        ),
                      ],
                    ),
                  ],
                  const SizedBox(height: 8),
                  Text(
                    '${_classes.length} recurring classes detected',
                    style: TextStyle(
                      color: theme.colorScheme.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),

            const Divider(height: 1),

            // Class list
            Expanded(
              child: _classes.isEmpty
                  ? const Center(child: Text('No classes detected. Tap + to add.'))
                  : ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount: _classes.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (ctx, i) {
                        final item = _classes[i];
                        return Card(
                          child: ListTile(
                            leading: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: theme.colorScheme.primary.withOpacity(0.12),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                _dayNames[item.dayOfWeek],
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: theme.colorScheme.primary,
                                ),
                              ),
                            ),
                            title: Text(
                              item.subjectName,
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                            subtitle: Text(
                              '${item.startTime} - ${item.endTime}${item.room != null ? ' · Room ${item.room}' : ''}',
                            ),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.edit_outlined, size: 20),
                                  onPressed: () => _editClassDialog(i),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.delete_outline, size: 20, color: Colors.red),
                                  onPressed: () {
                                    setState(() => _classes.removeAt(i));
                                  },
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),

            // Confirm bottom bar
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: ElevatedButton(
                onPressed: _isSaving ? null : _handleConfirmSave,
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size.fromHeight(50),
                ),
                child: _isSaving
                    ? const CircularProgressIndicator(color: Colors.white)
                    : Text('Confirm & Save (${_classes.length} Classes)'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
