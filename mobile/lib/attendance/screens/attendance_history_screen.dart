import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../core/services/feedback_service.dart';
import '../../core/utils/time_formatter.dart';
import '../../timetable/models/subject.dart';
import '../models/attendance_record.dart';
import '../providers/attendance_provider.dart';
import '../widgets/attendance_filter_sheet.dart';
import '../widgets/attendance_tokens.dart';

/// SilverBook-inspired Attendance History Screen.
/// Provides compact chronological class records, filter chips, and bottom sheets
/// for Date, Status, Class Component, and dynamically derived Faculty.
class AttendanceHistoryScreen extends StatefulWidget {
  final String? initialSubjectId;

  const AttendanceHistoryScreen({
    super.key,
    this.initialSubjectId,
  });

  @override
  State<AttendanceHistoryScreen> createState() => _AttendanceHistoryScreenState();
}

class _AttendanceHistoryScreenState extends State<AttendanceHistoryScreen> {
  late String _filterSubjectId;
  String _filterDateRange = 'ALL';
  String _filterStatus = 'ALL';
  String _filterComponent = 'ALL';
  String _filterFaculty = 'ALL';

  @override
  void initState() {
    super.initState();
    _filterSubjectId = widget.initialSubjectId ?? 'ALL';
  }

  void _showDateFilterSheet() {
    AttendanceFilterSheet.show(
      context: context,
      title: 'Filter by Date',
      options: const [
        FilterOption(value: 'ALL', label: 'All past classes'),
        FilterOption(value: 'THIS_MONTH', label: 'This month'),
        FilterOption(value: 'PAST_MONTH', label: 'Past month'),
        FilterOption(value: 'TODAY', label: 'Today only'),
      ],
      selectedValue: _filterDateRange,
      onApply: (val) => setState(() => _filterDateRange = val),
    );
  }

  void _showStatusFilterSheet() {
    AttendanceFilterSheet.show(
      context: context,
      title: 'Filter by Status',
      options: const [
        FilterOption(value: 'ALL', label: 'All Statuses'),
        FilterOption(value: 'present', label: 'Present', icon: Icons.check_circle_rounded),
        FilterOption(value: 'absent', label: 'Absent', icon: Icons.cancel_rounded),
        FilterOption(value: 'cancelled', label: 'Class Cancelled', icon: Icons.event_busy_rounded),
      ],
      selectedValue: _filterStatus,
      onApply: (val) => setState(() => _filterStatus = val),
    );
  }

  void _showComponentFilterSheet() {
    AttendanceFilterSheet.show(
      context: context,
      title: 'Filter by Component',
      options: const [
        FilterOption(value: 'ALL', label: 'All Components'),
        FilterOption(value: 'theory', label: 'Lecture'),
        FilterOption(value: 'tutorial', label: 'Tutorial'),
        FilterOption(value: 'lab', label: 'Practical / Lab'),
      ],
      selectedValue: _filterComponent,
      onApply: (val) => setState(() => _filterComponent = val),
    );
  }

  void _showFacultyFilterSheet(List<Subject> subjects) {
    final facultySet = <String>{};
    for (final s in subjects) {
      if (s.faculty != null && s.faculty!.trim().isNotEmpty) {
        facultySet.add(s.faculty!.trim());
      }
    }

    final options = [
      const FilterOption(value: 'ALL', label: 'All Faculty'),
      ...facultySet.map((f) => FilterOption(value: f, label: f)),
    ];

    AttendanceFilterSheet.show(
      context: context,
      title: 'Filter by Faculty',
      options: options,
      selectedValue: _filterFaculty,
      onApply: (val) => setState(() => _filterFaculty = val),
    );
  }

  void _showRecordActionDialog(AttendanceRecord record, Subject? subject) {
    FeedbackService.instance.selection();
    showModalBottomSheet(
      context: context,
      backgroundColor: AttendanceTokens.card(context),
      shape: const RoundedRectangleBorder(borderRadius: AttendanceTokens.sheetRadius),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16.0, horizontal: 20.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                subject?.name ?? 'Attendance Record',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 4),
              Text(
                '${record.classDate} · ${record.status.toUpperCase()}',
                style: TextStyle(fontSize: 12, color: AttendanceTokens.textMuted(ctx)),
              ),
              ListTile(
                leading: const Icon(Icons.check_circle_rounded, color: AttendanceTokens.present),
                title: const Text('Mark Present', style: TextStyle(fontWeight: FontWeight.w600)),
                onTap: () async {
                  Navigator.of(ctx).pop();
                  final provider = context.read<AttendanceProvider>();
                  await provider.updateRecordStatus(record.id, 'present');
                },
              ),
              ListTile(
                leading: const Icon(Icons.cancel_rounded, color: AttendanceTokens.absent),
                title: const Text('Mark Absent', style: TextStyle(fontWeight: FontWeight.w600)),
                onTap: () async {
                  Navigator.of(ctx).pop();
                  final provider = context.read<AttendanceProvider>();
                  await provider.updateRecordStatus(record.id, 'absent');
                },
              ),
              ListTile(
                leading: const Icon(Icons.event_busy_rounded, color: AttendanceTokens.cancelled),
                title: const Text('Mark Cancelled', style: TextStyle(fontWeight: FontWeight.w600)),
                onTap: () async {
                  Navigator.of(ctx).pop();
                  final provider = context.read<AttendanceProvider>();
                  await provider.updateRecordStatus(record.id, 'cancelled');
                },
              ),
              ListTile(
                leading: Icon(Icons.delete_outline_rounded, color: AttendanceTokens.textMuted(ctx)),
                title: const Text('Remove Attendance Record'),
                onTap: () async {
                  Navigator.of(ctx).pop();
                  await context.read<AttendanceProvider>().clearAttendance(record.id);
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Attendance record removed.')),
                    );
                  }
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AttendanceProvider>();
    final subjects = provider.subjects;
    final subjectMap = {for (var s in subjects) s.id: s};

    // Filter records
    final now = DateTime.now();
    final filtered = provider.records.where((r) {
      if (_filterSubjectId != 'ALL' && r.subjectId != _filterSubjectId) {
        return false;
      }
      if (_filterStatus != 'ALL' && r.status != _filterStatus) {
        return false;
      }
      final s = subjectMap[r.subjectId];
      if (_filterComponent != 'ALL' && s?.classType != _filterComponent) {
        return false;
      }
      if (_filterFaculty != 'ALL' && s?.faculty != _filterFaculty) {
        return false;
      }
      if (_filterDateRange != 'ALL') {
        final d = DateTime.tryParse(r.classDate);
        if (d != null) {
          if (_filterDateRange == 'TODAY') {
            if (d.year != now.year || d.month != now.month || d.day != now.day) return false;
          } else if (_filterDateRange == 'THIS_MONTH') {
            if (d.year != now.year || d.month != now.month) return false;
          } else if (_filterDateRange == 'PAST_MONTH') {
            final prevMonth = now.month == 1 ? 12 : now.month - 1;
            final prevYear = now.month == 1 ? now.year - 1 : now.year;
            if (d.year != prevYear || d.month != prevMonth) return false;
          }
        }
      }
      return true;
    }).toList()
      ..sort((a, b) => b.classDate.compareTo(a.classDate));

    final title = _filterSubjectId != 'ALL' && subjectMap[_filterSubjectId] != null
        ? subjectMap[_filterSubjectId]!.name
        : 'Attendance History';

    return Scaffold(
      backgroundColor: AttendanceTokens.bg(context),
      appBar: AppBar(
        backgroundColor: AttendanceTokens.bg(context),
        elevation: 0,
        title: Text(
          title,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: AttendanceTokens.textPrimary(context),
          ),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Horizontal Filter Chips Row
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: AttendanceTokens.card(context),
                border: Border(bottom: BorderSide(color: AttendanceTokens.border(context))),
              ),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildFilterChip(
                      label: 'Date',
                      value: _filterDateRange,
                      onTap: _showDateFilterSheet,
                    ),
                    const SizedBox(width: 8),
                    _buildFilterChip(
                      label: 'Status',
                      value: _filterStatus,
                      onTap: _showStatusFilterSheet,
                    ),
                    const SizedBox(width: 8),
                    _buildFilterChip(
                      label: 'Component',
                      value: _filterComponent,
                      onTap: _showComponentFilterSheet,
                    ),
                    const SizedBox(width: 8),
                    _buildFilterChip(
                      label: 'Faculty',
                      value: _filterFaculty,
                      onTap: () => _showFacultyFilterSheet(subjects),
                    ),
                  ],
                ),
              ),
            ),

            // Class Record Feed
            Expanded(
              child: filtered.isEmpty
                  ? Center(
                      child: Text(
                        'No attendance records found matching filters.',
                        style: TextStyle(fontSize: 13, color: AttendanceTokens.textMuted(context)),
                      ),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      itemCount: filtered.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (context, index) {
                        final record = filtered[index];
                        final subject = subjectMap[record.subjectId];
                        return _buildHistoryRow(context, record, subject);
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip({
    required String label,
    required String value,
    required VoidCallback onTap,
  }) {
    final isActive = value != 'ALL';

    return InkWell(
      onTap: () {
        FeedbackService.instance.selection();
        onTap();
      },
      borderRadius: AttendanceTokens.pillRadius,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isActive
              ? AttendanceTokens.primaryBlue
              : AttendanceTokens.border(context).withValues(alpha: 0.35),
          borderRadius: AttendanceTokens.pillRadius,
          border: Border.all(
            color: isActive ? AttendanceTokens.primaryBlue : AttendanceTokens.border(context),
            width: 1.0,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              isActive ? '$label: $value' : '$label ▼',
              style: TextStyle(
                fontSize: 12,
                fontWeight: isActive ? FontWeight.w700 : FontWeight.w600,
                color: isActive ? Colors.white : AttendanceTokens.textSecondary(context),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHistoryRow(BuildContext context, AttendanceRecord record, Subject? subject) {
    final isPresent = record.status == 'present';
    final isAbsent = record.status == 'absent';

    Color statusColor;
    String statusLabel;
    IconData statusIcon;

    if (isPresent) {
      statusColor = AttendanceTokens.present;
      statusLabel = 'Present';
      statusIcon = Icons.check_circle_rounded;
    } else if (isAbsent) {
      statusColor = AttendanceTokens.absent;
      statusLabel = 'Absent';
      statusIcon = Icons.cancel_rounded;
    } else {
      statusColor = AttendanceTokens.cancelled;
      statusLabel = 'Cancelled';
      statusIcon = Icons.event_busy_rounded;
    }

    String formattedDate = record.classDate;
    try {
      formattedDate = DateFormat('EEE, d MMM yyyy').format(DateTime.parse(record.classDate));
    } catch (_) {}

    final timeRange = TimeFormatter.formatRange(record.startTime, record.endTime);
    final componentType = (subject?.classType ?? 'Lecture').toUpperCase();
    final componentInitial = componentType.isNotEmpty ? componentType[0] : 'L';

    return Container(
      decoration: BoxDecoration(
        color: AttendanceTokens.card(context),
        borderRadius: AttendanceTokens.cardRadius,
        border: Border.all(color: AttendanceTokens.border(context)),
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: AttendanceTokens.cardRadius,
        child: InkWell(
          onTap: () => _showRecordActionDialog(record, subject),
          borderRadius: AttendanceTokens.cardRadius,
          child: Padding(
            padding: const EdgeInsets.all(14.0),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Component badge
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: AttendanceTokens.primaryBlue.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    componentInitial,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: AttendanceTokens.primaryBlue,
                    ),
                  ),
                ),

                const SizedBox(width: 12),

                // Date, Time, Subject & Faculty metadata
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        formattedDate,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: AttendanceTokens.textPrimary(context),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        timeRange,
                        style: TextStyle(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w500,
                          color: AttendanceTokens.textMuted(context),
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        [
                          subject?.name ?? 'Subject',
                          if (subject?.faculty != null && subject!.faculty!.isNotEmpty)
                            subject.faculty!,
                          componentType,
                        ].join(' · '),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 11,
                          color: AttendanceTokens.textMuted(context),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(width: 10),

                // Status label on right
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: statusColor.withValues(alpha: 0.4)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        statusLabel,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: statusColor,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Icon(statusIcon, size: 14, color: statusColor),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
