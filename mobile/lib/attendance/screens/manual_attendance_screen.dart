import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:uuid/uuid.dart';
import '../../core/database/database_helper.dart';
import '../../core/services/feedback_service.dart';
import '../../core/supabase/supabase_client.dart';
import '../../core/sync/sync_engine.dart';
import '../../timetable/models/subject.dart';
import '../models/attendance_record.dart';
import '../providers/attendance_provider.dart';
import '../widgets/attendance_tokens.dart';

/// SilverBook-inspired Manual Attendance Screen.
/// Adds attendance counts for unscheduled or extra classes per component.
class ManualAttendanceScreen extends StatefulWidget {
  final Subject? initialSubject;

  const ManualAttendanceScreen({
    super.key,
    this.initialSubject,
  });

  @override
  State<ManualAttendanceScreen> createState() => _ManualAttendanceScreenState();
}

class _ManualAttendanceScreenState extends State<ManualAttendanceScreen> {
  final _uuid = const Uuid();
  String? _selectedSubjectId;
  DateTime _classDate = DateTime.now();

  int _lecturePresent = 0;
  int _lectureAbsent = 0;

  int _tutorialPresent = 0;
  int _tutorialAbsent = 0;

  int _practicalPresent = 0;
  int _practicalAbsent = 0;

  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialSubject != null) {
      _selectedSubjectId = widget.initialSubject!.id;
    }
  }

  Future<void> _pickDate() async {
    FeedbackService.instance.selection();
    final picked = await showDatePicker(
      context: context,
      initialDate: _classDate,
      firstDate: DateTime(2020),
      lastDate: DateTime(2035),
    );
    if (picked != null) {
      setState(() => _classDate = picked);
    }
  }

  Future<void> _save() async {
    if (_selectedSubjectId == null || _selectedSubjectId!.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a subject')),
      );
      return;
    }

    final totalCount = _lecturePresent +
        _lectureAbsent +
        _tutorialPresent +
        _tutorialAbsent +
        _practicalPresent +
        _practicalAbsent;

    if (totalCount == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please add at least one present or absent count')),
      );
      return;
    }

    setState(() => _isSaving = true);

    try {
      final attendanceProvider = context.read<AttendanceProvider>();
      final semId = attendanceProvider.activeSemester?.id ?? '';
      final userId = SupabaseService.currentUserId ?? '';
      final dateStr = DateFormat('yyyy-MM-dd').format(_classDate);
      final db = await DatabaseHelper.instance.database;

      final List<AttendanceRecord> newRecords = [];

      void addRecords(int present, int absent, String componentType) {
        for (int i = 0; i < present; i++) {
          newRecords.add(AttendanceRecord(
            id: _uuid.v4(),
            userId: userId,
            semesterId: semId,
            subjectId: _selectedSubjectId!,
            timetableSlotId: null, // Unscheduled manual class
            classDate: dateStr,
            startTime: '10:00:00',
            endTime: '11:00:00',
            status: 'present',
            notes: 'Manual $componentType attendance',
            createdAt: DateTime.now().toIso8601String(),
            updatedAt: DateTime.now().toIso8601String(),
          ));
        }
        for (int i = 0; i < absent; i++) {
          newRecords.add(AttendanceRecord(
            id: _uuid.v4(),
            userId: userId,
            semesterId: semId,
            subjectId: _selectedSubjectId!,
            timetableSlotId: null,
            classDate: dateStr,
            startTime: '10:00:00',
            endTime: '11:00:00',
            status: 'absent',
            notes: 'Manual $componentType attendance',
            createdAt: DateTime.now().toIso8601String(),
            updatedAt: DateTime.now().toIso8601String(),
          ));
        }
      }

      addRecords(_lecturePresent, _lectureAbsent, 'Lecture');
      addRecords(_tutorialPresent, _tutorialAbsent, 'Tutorial');
      addRecords(_practicalPresent, _practicalAbsent, 'Practical');

      // Persist to local cache and enqueue sync
      for (final rec in newRecords) {
        await db.insert('cached_attendance_records', rec.toMap());
        await DatabaseHelper.instance.enqueueSync(
          id: _uuid.v4(),
          actionType: 'UPSERT_ATTENDANCE',
          idempotencyKey: 'att_manual_${rec.id}',
          payload: rec.toSupabaseMap(),
        );
      }

      SyncEngine.instance.processQueue();
      await attendanceProvider.loadData(forceRefresh: true);
      FeedbackService.instance.attendanceSuccess();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Added $totalCount manual class attendance record(s)')),
        );
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save manual attendance: $e')),
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
    final subjects = attendanceProvider.subjects;

    if (_selectedSubjectId == null && subjects.isNotEmpty) {
      _selectedSubjectId = subjects.first.id;
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
          'Manual Attendance',
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
                    onPressed: _save,
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
              // Header explanatory text
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AttendanceTokens.primaryBlue.withValues(alpha: 0.1),
                  borderRadius: AttendanceTokens.cardRadius,
                  border: Border.all(color: AttendanceTokens.primaryBlue.withValues(alpha: 0.25)),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.info_outline_rounded, size: 20, color: AttendanceTokens.primaryBlue),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Add attendance for classes that are not placed on your regular timetable schedule. Counts immediately update your subject statistics.',
                        style: TextStyle(
                          fontSize: 12.5,
                          height: 1.4,
                          color: AttendanceTokens.textSecondary(context),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Subject selection
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: AttendanceTokens.card(context),
                  borderRadius: AttendanceTokens.cardRadius,
                  border: Border.all(color: AttendanceTokens.border(context)),
                ),
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
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: AttendanceTokens.textPrimary(context),
                          ),
                        ),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedSubjectId = val);
                    },
                  ),
                ),
              ),

              const SizedBox(height: 14),

              // Date tile
              Container(
                decoration: BoxDecoration(
                  color: AttendanceTokens.card(context),
                  borderRadius: AttendanceTokens.cardRadius,
                  border: Border.all(color: AttendanceTokens.border(context)),
                ),
                child: ListTile(
                  leading: const Icon(Icons.calendar_today_outlined, size: 20),
                  title: const Text('Date of classes', style: TextStyle(fontSize: 14)),
                  trailing: Text(
                    DateFormat('EEE, d MMM yyyy').format(_classDate),
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AttendanceTokens.primaryBlue,
                    ),
                  ),
                  onTap: _pickDate,
                ),
              ),

              const SizedBox(height: 20),

              // Component Card: Lecture, Tutorial, Practical
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: AttendanceTokens.card(context),
                  borderRadius: AttendanceTokens.cardRadius,
                  border: Border.all(color: AttendanceTokens.border(context)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildComponentBlock(
                      'LECTURE',
                      'L',
                      present: _lecturePresent,
                      absent: _lectureAbsent,
                      onPresentChanged: (v) => setState(() => _lecturePresent = v),
                      onAbsentChanged: (v) => setState(() => _lectureAbsent = v),
                    ),
                    Divider(height: 24, color: AttendanceTokens.border(context)),
                    _buildComponentBlock(
                      'TUTORIAL',
                      'T',
                      present: _tutorialPresent,
                      absent: _tutorialAbsent,
                      onPresentChanged: (v) => setState(() => _tutorialPresent = v),
                      onAbsentChanged: (v) => setState(() => _tutorialAbsent = v),
                    ),
                    Divider(height: 24, color: AttendanceTokens.border(context)),
                    _buildComponentBlock(
                      'PRACTICAL',
                      'P',
                      present: _practicalPresent,
                      absent: _practicalAbsent,
                      onPresentChanged: (v) => setState(() => _practicalPresent = v),
                      onAbsentChanged: (v) => setState(() => _practicalAbsent = v),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildComponentBlock(
    String label,
    String badge, {
    required int present,
    required int absent,
    required ValueChanged<int> onPresentChanged,
    required ValueChanged<int> onAbsentChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              width: 26,
              height: 26,
              decoration: BoxDecoration(
                color: AttendanceTokens.primaryBlue.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(6),
              ),
              alignment: Alignment.center,
              child: Text(
                badge,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                  color: AttendanceTokens.primaryBlue,
                ),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.5,
                color: AttendanceTokens.textPrimary(context),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        // Present counter
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Row(
              children: [
                Icon(Icons.check_circle_rounded, size: 16, color: AttendanceTokens.present),
                SizedBox(width: 6),
                Text('Present', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
              ],
            ),
            _buildCounterStepper(present, onPresentChanged, AttendanceTokens.present),
          ],
        ),
        const SizedBox(height: 8),
        // Absent counter
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Row(
              children: [
                Icon(Icons.cancel_rounded, size: 16, color: AttendanceTokens.absent),
                SizedBox(width: 6),
                Text('Absent', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
              ],
            ),
            _buildCounterStepper(absent, onAbsentChanged, AttendanceTokens.absent),
          ],
        ),
      ],
    );
  }

  Widget _buildCounterStepper(int value, ValueChanged<int> onChanged, Color activeColor) {
    return Row(
      children: [
        InkWell(
          onTap: value > 0
              ? () {
                  FeedbackService.instance.light();
                  onChanged(value - 1);
                }
              : null,
          borderRadius: BorderRadius.circular(6),
          child: Container(
            padding: const EdgeInsets.all(5),
            decoration: BoxDecoration(
              color: AttendanceTokens.border(context).withValues(alpha: 0.4),
              borderRadius: BorderRadius.circular(6),
            ),
            child: const Icon(Icons.remove_rounded, size: 16),
          ),
        ),
        SizedBox(
          width: 36,
          child: Text(
            '$value',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w900,
              color: value > 0 ? activeColor : AttendanceTokens.textPrimary(context),
            ),
          ),
        ),
        InkWell(
          onTap: () {
            FeedbackService.instance.light();
            onChanged(value + 1);
          },
          borderRadius: BorderRadius.circular(6),
          child: Container(
            padding: const EdgeInsets.all(5),
            decoration: BoxDecoration(
              color: AttendanceTokens.border(context).withValues(alpha: 0.4),
              borderRadius: BorderRadius.circular(6),
            ),
            child: const Icon(Icons.add_rounded, size: 16),
          ),
        ),
      ],
    );
  }
}
