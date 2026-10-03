import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/services/feedback_service.dart';
import '../../timetable/models/subject.dart';
import '../../timetable/providers/timetable_provider.dart';
import '../providers/attendance_provider.dart';
import '../widgets/attendance_tokens.dart';

/// SilverBook-inspired Add / Edit Subject screen.
/// Includes required attendance slider and component configuration.
class AddSubjectScreen extends StatefulWidget {
  final Subject? existingSubject;

  const AddSubjectScreen({
    super.key,
    this.existingSubject,
  });

  @override
  State<AddSubjectScreen> createState() => _AddSubjectScreenState();
}

class _AddSubjectScreenState extends State<AddSubjectScreen> {
  final TextEditingController _nameCtrl = TextEditingController();
  final TextEditingController _codeCtrl = TextEditingController();
  final TextEditingController _facultyCtrl = TextEditingController();
  final TextEditingController _roomCtrl = TextEditingController();

  late double _targetPercentage;
  String _classType = 'theory';

  // Steppers for component weights / baseline
  int _lectureWeight = 1;
  int _tutorialWeight = 1;
  int _practicalWeight = 1;

  int _baselineAttended = 0;
  int _baselineTotal = 0;

  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    final sub = widget.existingSubject;
    final defaultTarget = context.read<AttendanceProvider>().defaultTarget;

    if (sub != null) {
      _nameCtrl.text = sub.name;
      _codeCtrl.text = sub.code ?? '';
      _facultyCtrl.text = sub.faculty ?? '';
      _roomCtrl.text = sub.defaultRoom ?? '';
      _targetPercentage = sub.targetPercentage ?? defaultTarget;
      _classType = sub.classType;
      _baselineAttended = sub.baselineAttended;
      _baselineTotal = sub.baselineTotal;
    } else {
      _targetPercentage = defaultTarget;
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _codeCtrl.dispose();
    _facultyCtrl.dispose();
    _roomCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final name = _nameCtrl.text.trim();
    if (name.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Subject name is required')),
      );
      return;
    }

    if (_baselineAttended > _baselineTotal) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Attended classes cannot exceed total classes')),
      );
      return;
    }

    setState(() => _isSaving = true);

    try {
      final timetable = context.read<TimetableProvider>();
      final attendance = context.read<AttendanceProvider>();

      if (widget.existingSubject != null) {
        final updated = Subject(
          id: widget.existingSubject!.id,
          userId: widget.existingSubject!.userId,
          semesterId: widget.existingSubject!.semesterId,
          name: name,
          code: _codeCtrl.text.trim().isNotEmpty ? _codeCtrl.text.trim() : null,
          faculty: _facultyCtrl.text.trim().isNotEmpty ? _facultyCtrl.text.trim() : null,
          defaultRoom: _roomCtrl.text.trim().isNotEmpty ? _roomCtrl.text.trim() : null,
          classType: _classType,
          targetPercentage: _targetPercentage,
          baselineAttended: _baselineAttended,
          baselineTotal: _baselineTotal,
          isArchived: widget.existingSubject!.isArchived,
        );
        await timetable.updateSubject(updated);
      } else {
        await timetable.addSubject(
          name: name,
          code: _codeCtrl.text.trim().isNotEmpty ? _codeCtrl.text.trim() : null,
          faculty: _facultyCtrl.text.trim().isNotEmpty ? _facultyCtrl.text.trim() : null,
          defaultRoom: _roomCtrl.text.trim().isNotEmpty ? _roomCtrl.text.trim() : null,
          classType: _classType,
          targetPercentage: _targetPercentage,
          baselineAttended: _baselineAttended,
          baselineTotal: _baselineTotal,
        );
      }

      await attendance.loadData(forceRefresh: true);
      FeedbackService.instance.attendanceSuccess();

      if (mounted) {
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save subject: $e')),
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
          widget.existingSubject != null ? 'Edit Subject' : 'Add Subject',
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
              // Basic details card
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
                      controller: _nameCtrl,
                      decoration: const InputDecoration(
                        icon: Icon(Icons.menu_book_rounded, size: 20),
                        labelText: 'Subject Name*',
                        hintText: 'e.g. Object Oriented Programming',
                        border: InputBorder.none,
                      ),
                    ),
                    Divider(height: 1, color: AttendanceTokens.border(context)),
                    TextField(
                      controller: _codeCtrl,
                      decoration: const InputDecoration(
                        icon: Icon(Icons.tag_rounded, size: 20),
                        labelText: 'Subject Code (optional)',
                        hintText: 'e.g. CS201',
                        border: InputBorder.none,
                      ),
                    ),
                    Divider(height: 1, color: AttendanceTokens.border(context)),
                    TextField(
                      controller: _facultyCtrl,
                      decoration: const InputDecoration(
                        icon: Icon(Icons.person_outline_rounded, size: 20),
                        labelText: 'Default Faculty (optional)',
                        hintText: 'e.g. Prof. Alan Turing',
                        border: InputBorder.none,
                      ),
                    ),
                    Divider(height: 1, color: AttendanceTokens.border(context)),
                    TextField(
                      controller: _roomCtrl,
                      decoration: const InputDecoration(
                        icon: Icon(Icons.meeting_room_outlined, size: 20),
                        labelText: 'Default Room (optional)',
                        hintText: 'e.g. Hall 402',
                        border: InputBorder.none,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Required attendance threshold card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AttendanceTokens.card(context),
                  borderRadius: AttendanceTokens.cardRadius,
                  border: Border.all(color: AttendanceTokens.border(context)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Required Attendance',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: AttendanceTokens.textPrimary(context),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AttendanceTokens.primaryBlue.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            '${_targetPercentage.toStringAsFixed(0)}%',
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w900,
                              color: AttendanceTokens.primaryBlue,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    SliderTheme(
                      data: SliderTheme.of(context).copyWith(
                        activeTrackColor: AttendanceTokens.primaryBlue,
                        inactiveTrackColor: AttendanceTokens.border(context),
                        thumbColor: AttendanceTokens.primaryBlue,
                        overlayColor: AttendanceTokens.primaryBlue.withValues(alpha: 0.2),
                      ),
                      child: Slider(
                        value: _targetPercentage,
                        min: 50.0,
                        max: 100.0,
                        divisions: 50,
                        onChanged: (val) {
                          FeedbackService.instance.light();
                          setState(() => _targetPercentage = val);
                        },
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Component Weights Card (SilverBook reference)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AttendanceTokens.card(context),
                  borderRadius: AttendanceTokens.cardRadius,
                  border: Border.all(color: AttendanceTokens.border(context)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Component Weights',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AttendanceTokens.textPrimary(context),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Relative weight applied when computing attendance',
                      style: TextStyle(
                        fontSize: 11.5,
                        color: AttendanceTokens.textMuted(context),
                      ),
                    ),
                    const SizedBox(height: 14),
                    _buildWeightStepper(
                      'LECTURE',
                      'L',
                      _lectureWeight,
                      (v) => setState(() => _lectureWeight = v),
                    ),
                    Divider(height: 16, color: AttendanceTokens.border(context)),
                    _buildWeightStepper(
                      'TUTORIAL',
                      'T',
                      _tutorialWeight,
                      (v) => setState(() => _tutorialWeight = v),
                    ),
                    Divider(height: 16, color: AttendanceTokens.border(context)),
                    _buildWeightStepper(
                      'PRACTICAL',
                      'P',
                      _practicalWeight,
                      (v) => setState(() => _practicalWeight = v),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Prior / Baseline attendance (for mid-semester imports)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AttendanceTokens.card(context),
                  borderRadius: AttendanceTokens.cardRadius,
                  border: Border.all(color: AttendanceTokens.border(context)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Initial / Past Attendance',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AttendanceTokens.textPrimary(context),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Optional count for past classes already completed before tracking',
                      style: TextStyle(
                        fontSize: 11.5,
                        color: AttendanceTokens.textMuted(context),
                      ),
                    ),
                    const SizedBox(height: 14),
                    _buildWeightStepper(
                      'Attended Classes',
                      '✓',
                      _baselineAttended,
                      (v) => setState(() => _baselineAttended = v),
                    ),
                    Divider(height: 16, color: AttendanceTokens.border(context)),
                    _buildWeightStepper(
                      'Total Classes',
                      'Σ',
                      _baselineTotal,
                      (v) => setState(() => _baselineTotal = v),
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

  Widget _buildWeightStepper(String label, String badge, int value, ValueChanged<int> onChanged) {
    return Row(
      children: [
        Container(
          width: 24,
          height: 24,
          decoration: BoxDecoration(
            color: AttendanceTokens.primaryBlue.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(6),
          ),
          alignment: Alignment.center,
          child: Text(
            badge,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w800,
              color: AttendanceTokens.primaryBlue,
            ),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            label,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: AttendanceTokens.textPrimary(context),
            ),
          ),
        ),
        InkWell(
          onTap: value > 0
              ? () {
                  FeedbackService.instance.light();
                  onChanged(value - 1);
                }
              : null,
          borderRadius: BorderRadius.circular(6),
          child: Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: AttendanceTokens.border(context).withValues(alpha: 0.4),
              borderRadius: BorderRadius.circular(6),
            ),
            child: const Icon(Icons.remove_rounded, size: 16),
          ),
        ),
        SizedBox(
          width: 38,
          child: Text(
            '$value',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w800,
              color: AttendanceTokens.textPrimary(context),
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
            padding: const EdgeInsets.all(6),
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
