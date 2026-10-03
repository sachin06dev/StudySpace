import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../core/services/feedback_service.dart';
import '../../scanner/screens/scan_timetable_screen.dart';
import '../../timetable/models/subject.dart';
import '../../timetable/models/timetable_slot.dart';
import '../../timetable/providers/timetable_provider.dart';
import '../providers/attendance_provider.dart';
import '../widgets/attendance_tokens.dart';

/// SilverBook-inspired Timetable Import / Export screen.
/// Provides code-based timetable sharing and imports with clear educational dialogs.
class TimetableImportExportScreen extends StatefulWidget {
  final int initialTabIndex; // 0: Export, 1: Import

  const TimetableImportExportScreen({
    super.key,
    this.initialTabIndex = 0,
  });

  @override
  State<TimetableImportExportScreen> createState() => _TimetableImportExportScreenState();
}

class _TimetableImportExportScreenState extends State<TimetableImportExportScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _importCodeCtrl = TextEditingController();
  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: 2,
      vsync: this,
      initialIndex: widget.initialTabIndex,
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    _importCodeCtrl.dispose();
    super.dispose();
  }

  String _generateExportCode(List<Subject> subjects, List<TimetableSlot> slots) {
    if (subjects.isEmpty) return 'EMPTY-TIMETABLE';

    final data = {
      'v': 1,
      'app': 'studyspace',
      'subjects': subjects.map((s) => {
        'id': s.id,
        'name': s.name,
        'code': s.code,
        'faculty': s.faculty,
        'room': s.defaultRoom,
        'type': s.classType,
        'target': s.targetPercentage,
      }).toList(),
      'slots': slots.map((sl) => {
        'subId': sl.subjectId,
        'day': sl.dayOfWeek,
        'start': sl.startTime,
        'end': sl.endTime,
        'room': sl.roomOverride,
        'faculty': sl.facultyOverride,
        'type': sl.classTypeOverride,
      }).toList(),
    };

    final jsonStr = jsonEncode(data);
    final rawBytes = utf8.encode(jsonStr);
    try {
      final compressedBytes = zlib.encode(rawBytes);
      return 'SP1.${base64Url.encode(compressedBytes)}';
    } catch (_) {
      // Fallback to uncompressed Base64 if compression unavailable
      return base64Url.encode(rawBytes);
    }
  }

  Future<void> _handleImport() async {
    final code = _importCodeCtrl.text.trim();
    if (code.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please paste a timetable code')),
      );
      return;
    }

    try {
      String jsonStr;
      if (code.startsWith('SP1.')) {
        // Compact SP1 format with zlib compression
        final payload = code.substring(4);
        final compressed = base64Url.decode(payload);
        final decompressed = zlib.decode(compressed);
        jsonStr = utf8.decode(decompressed);
      } else {
        // Backwards compatibility for uncompressed base64 or legacy formats
        try {
          final bytes = base64Url.decode(code);
          try {
            // Attempt decompression in case SP1 prefix was stripped
            final decompressed = zlib.decode(bytes);
            jsonStr = utf8.decode(decompressed);
          } catch (_) {
            jsonStr = utf8.decode(bytes);
          }
        } catch (_) {
          jsonStr = code; // Direct raw JSON fallback
        }
      }

      final Map<String, dynamic> data = jsonDecode(jsonStr);

      if (data['app'] != 'studyspace' || data['subjects'] == null) {
        throw Exception('Invalid StudySpace timetable format');
      }

      final rawSubjects = data['subjects'] as List;
      final rawSlots = (data['slots'] ?? []) as List;

      // Show confirmation dialog with rich visual preview of subjects and slot counts
      final bool? confirmed = await showDialog<bool>(
        context: context,
        builder: (ctx) => AlertDialog(
          backgroundColor: AttendanceTokens.card(ctx),
          shape: const RoundedRectangleBorder(borderRadius: AttendanceTokens.cardRadius),
          title: const Row(
            children: [
              Icon(Icons.calendar_today_rounded, size: 20, color: AttendanceTokens.primaryBlue),
              SizedBox(width: 8),
              Text('Timetable Preview'),
            ],
          ),
          content: ConstrainedBox(
            constraints: const BoxConstraints(maxHeight: 280),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Found ${rawSubjects.length} subject(s) and ${rawSlots.length} schedule slot(s). Review before importing:',
                    style: TextStyle(fontSize: 12.5, color: AttendanceTokens.textSecondary(ctx)),
                  ),
                  const SizedBox(height: 12),
                  ...rawSubjects.map((s) {
                    final sName = s['name'] as String? ?? 'Untitled';
                    final sCode = s['code'] as String?;
                    final sType = (s['type'] ?? 'theory') as String;
                    return Container(
                      margin: const EdgeInsets.only(bottom: 6),
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: AttendanceTokens.elevated(ctx),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(
                              sCode != null ? '$sName ($sCode)' : sName,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: AttendanceTokens.textPrimary(ctx),
                              ),
                            ),
                          ),
                          Text(
                            sType.toUpperCase(),
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: AttendanceTokens.textMuted(ctx),
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                  const SizedBox(height: 8),
                  Text(
                    'Note: Personal attendance records are not included in shared codes.',
                    style: TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: AttendanceTokens.textMuted(ctx)),
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(false),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.of(ctx).pop(true),
              style: ElevatedButton.styleFrom(
                backgroundColor: AttendanceTokens.primaryBlue,
                foregroundColor: Colors.white,
              ),
              child: const Text('Import Timetable'),
            ),
          ],
        ),
      );

      if (confirmed != true) return;

      setState(() => _isProcessing = true);

      final timetable = context.read<TimetableProvider>();
      final attendance = context.read<AttendanceProvider>();

      // Map old subject IDs to new subject IDs to preserve relationships
      final Map<String, String> idMapping = {};

      for (final s in rawSubjects) {
        final originalId = s['id'] as String? ?? '';
        final name = s['name'] as String? ?? 'Untitled';
        final subCode = s['code'] as String?;
        final faculty = s['faculty'] as String?;
        final room = s['room'] as String?;
        final type = (s['type'] ?? 'theory') as String;
        final target = s['target'] != null ? (s['target'] as num).toDouble() : null;

        await timetable.addSubject(
          name: name,
          code: subCode,
          faculty: faculty,
          defaultRoom: room,
          classType: type,
          targetPercentage: target,
        );

        // Find the newly inserted subject in provider
        final latestSub = timetable.subjects.lastWhere(
          (sub) => sub.name == name,
          orElse: () => Subject.empty(),
        );
        if (latestSub.id.isNotEmpty && originalId.isNotEmpty) {
          idMapping[originalId] = latestSub.id;
        }
      }

      // Add slots
      for (final sl in rawSlots) {
        final oldSubId = sl['subId'] as String? ?? '';
        final newSubId = idMapping[oldSubId] ?? (timetable.subjects.isNotEmpty ? timetable.subjects.first.id : '');
        if (newSubId.isEmpty) continue;

        final day = sl['day'] as int? ?? 0;
        final start = sl['start'] as String? ?? '09:00:00';
        final end = sl['end'] as String? ?? '10:00:00';
        final room = sl['room'] as String?;
        final faculty = sl['faculty'] as String?;
        final type = sl['type'] as String?;

        await timetable.addSlot(
          subjectId: newSubId,
          dayOfWeek: day,
          startTime: start,
          endTime: end,
          roomOverride: room,
          facultyOverride: faculty,
          classTypeOverride: type,
        );
      }

      await attendance.loadData(forceRefresh: true);
      FeedbackService.instance.attendanceSuccess();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Successfully imported ${rawSubjects.length} subject(s)!')),
        );
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to import code: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isProcessing = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final timetable = context.watch<TimetableProvider>();
    final attendance = context.watch<AttendanceProvider>();
    final subjects = timetable.subjects.isNotEmpty ? timetable.subjects : attendance.subjects;
    final slots = timetable.slots.isNotEmpty ? timetable.slots : attendance.slots;

    final exportCode = _generateExportCode(subjects, slots);

    return Scaffold(
      backgroundColor: AttendanceTokens.bg(context),
      appBar: AppBar(
        backgroundColor: AttendanceTokens.bg(context),
        elevation: 0,
        title: Text(
          'Share & Import Timetable',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: AttendanceTokens.textPrimary(context),
          ),
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AttendanceTokens.primaryBlue,
          labelColor: AttendanceTokens.primaryBlue,
          unselectedLabelColor: AttendanceTokens.textMuted(context),
          tabs: const [
            Tab(text: 'Export Code'),
            Tab(text: 'Import Code'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Tab 1: Export
          SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Illustration graphic
                Container(
                  width: 76,
                  height: 76,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AttendanceTokens.primaryBlue.withValues(alpha: 0.12),
                    border: Border.all(
                      color: AttendanceTokens.primaryBlue.withValues(alpha: 0.3),
                    ),
                  ),
                  child: const Icon(
                    Icons.share_rounded,
                    size: 36,
                    color: AttendanceTokens.primaryBlue,
                  ),
                ),

                const SizedBox(height: 18),

                Text(
                  'Share Timetable',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.3,
                    color: AttendanceTokens.textPrimary(context),
                  ),
                ),

                const SizedBox(height: 6),

                Text(
                  'Share your classes and weekly schedule with classmates.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 13,
                    color: AttendanceTokens.textMuted(context),
                  ),
                ),

                const SizedBox(height: 24),

                // Code display container
                Container(
                  width: double.infinity,
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
                          Expanded(
                            child: Text(
                              'Your timetable code (${subjects.length} subjects, ${slots.length} slots):',
                              style: TextStyle(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w600,
                                color: AttendanceTokens.textMuted(context),
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AttendanceTokens.primaryBlue.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(
                                color: AttendanceTokens.primaryBlue.withValues(alpha: 0.3),
                              ),
                            ),
                            child: const Text(
                              'SP1 Compact',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                                color: AttendanceTokens.primaryBlue,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AttendanceTokens.elevated(context),
                          borderRadius: AttendanceTokens.controlRadius,
                        ),
                        child: SelectableText(
                          exportCode,
                          maxLines: 4,
                          style: const TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // Copy button
                ElevatedButton.icon(
                  onPressed: () {
                    FeedbackService.instance.selection();
                    Clipboard.setData(ClipboardData(text: exportCode));
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Timetable code copied to clipboard!')),
                    );
                  },
                  icon: const Icon(Icons.copy_rounded, size: 18),
                  label: const Text('Copy Code', style: TextStyle(fontWeight: FontWeight.w700)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AttendanceTokens.primaryBlue,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 12),
                    shape: const RoundedRectangleBorder(
                      borderRadius: AttendanceTokens.pillRadius,
                    ),
                  ),
                ),

                const SizedBox(height: 24),

                // Privacy note
                Row(
                  children: [
                    const Icon(Icons.lock_outline_rounded, size: 16, color: AttendanceTokens.present),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Attendance records and personal logs are strictly private and never included in timetable codes.',
                        style: TextStyle(fontSize: 11.5, color: AttendanceTokens.textMuted(context)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Tab 2: Import
          SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Container(
                  width: 76,
                  height: 76,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AttendanceTokens.primaryBlue.withValues(alpha: 0.12),
                    border: Border.all(
                      color: AttendanceTokens.primaryBlue.withValues(alpha: 0.3),
                    ),
                  ),
                  child: const Icon(
                    Icons.download_rounded,
                    size: 36,
                    color: AttendanceTokens.primaryBlue,
                  ),
                ),

                const SizedBox(height: 18),

                Text(
                  'Import Timetable',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.3,
                    color: AttendanceTokens.textPrimary(context),
                  ),
                ),

                const SizedBox(height: 6),

                Text(
                  'Paste a code shared by a friend to add their schedule.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 13,
                    color: AttendanceTokens.textMuted(context),
                  ),
                ),

                const SizedBox(height: 24),

                // Code text field
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: AttendanceTokens.card(context),
                    borderRadius: AttendanceTokens.cardRadius,
                    border: Border.all(color: AttendanceTokens.border(context)),
                  ),
                  child: TextField(
                    controller: _importCodeCtrl,
                    maxLines: 4,
                    decoration: const InputDecoration(
                      hintText: 'Paste timetable code here (SP1... or Base64)...',
                      border: InputBorder.none,
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                _isProcessing
                    ? const CircularProgressIndicator()
                    : ElevatedButton.icon(
                        onPressed: _handleImport,
                        icon: const Icon(Icons.input_rounded, size: 18),
                        label: const Text('Submit Code', style: TextStyle(fontWeight: FontWeight.w700)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AttendanceTokens.primaryBlue,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 12),
                          shape: const RoundedRectangleBorder(
                            borderRadius: AttendanceTokens.pillRadius,
                          ),
                        ),
                      ),

                const SizedBox(height: 28),

                // Scan alternative
                OutlinedButton.icon(
                  onPressed: () {
                    FeedbackService.instance.selection();
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => const ScanTimetableScreen(),
                      ),
                    );
                  },
                  icon: const Icon(Icons.document_scanner_rounded, size: 18),
                  label: const Text('Or Scan Physical Timetable with AI'),
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: AttendanceTokens.primaryBlue.withValues(alpha: 0.6)),
                    foregroundColor: AttendanceTokens.primaryBlue,
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    shape: const RoundedRectangleBorder(
                      borderRadius: AttendanceTokens.controlRadius,
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
}
