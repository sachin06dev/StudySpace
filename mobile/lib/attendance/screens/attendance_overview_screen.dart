import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/services/feedback_service.dart';
import '../../timetable/models/timetable_slot.dart';
import '../../timetable/providers/timetable_provider.dart';
import '../models/subject_attendance.dart';
import '../providers/attendance_provider.dart';
import '../widgets/attendance_empty_state.dart';
import '../widgets/attendance_ring.dart';
import '../widgets/attendance_timeline.dart';
import '../widgets/attendance_tokens.dart';
import '../widgets/week_date_strip.dart';
import 'add_class_screen.dart';
import 'attendance_history_screen.dart';
import 'attendance_settings_screen.dart';
import 'manual_attendance_screen.dart';
import 'subject_detail_screen.dart';
import 'timetable_import_export_screen.dart';

/// SilverBook-inspired unified Attendance Screen for StudySpace.
/// Integrates a 7-day date strip, vertical daily class timeline,
/// one-tap attendance marking, and course-by-course bunk allowances.
class AttendanceOverviewScreen extends StatefulWidget {
  final int initialTab;

  const AttendanceOverviewScreen({
    super.key,
    this.initialTab = 0,
  });

  @override
  State<AttendanceOverviewScreen> createState() => _AttendanceOverviewScreenState();
}

class _AttendanceOverviewScreenState extends State<AttendanceOverviewScreen> {
  bool _isCompactView = false;
  static const double _swipeVelocityThreshold = 300.0;

  @override
  void initState() {
    super.initState();
    _loadPreferences();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AttendanceProvider>().loadData();
    });
  }

  Future<void> _loadPreferences() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      if (mounted) {
        setState(() {
          _isCompactView = prefs.getBool('attendance_compact_view') ?? false;
        });
      }
    } catch (_) {}
  }

  Set<String> _computeDatesWithClasses(List<TimetableSlot> slots, String selectedDate) {
    final dates = <String>{};
    try {
      final selectedDt = DateTime.parse(selectedDate);
      final diff = selectedDt.weekday - 1; // ISO: 1=Mon ... 7=Sun
      final startOfWeek = DateTime(selectedDt.year, selectedDt.month, selectedDt.day).subtract(Duration(days: diff));

      final activeDays = slots.map((s) => s.dayOfWeek).toSet();

      for (int i = 0; i < 7; i++) {
        final d = startOfWeek.add(Duration(days: i));
        final isoDay = (d.weekday - 1) % 7;
        if (activeDays.contains(isoDay)) {
          dates.add(DateFormat('yyyy-MM-dd').format(d));
        }
      }
    } catch (_) {}
    return dates;
  }

  @override
  Widget build(BuildContext context) {
    final attendanceProvider = context.watch<AttendanceProvider>();
    final timetableProvider = context.watch<TimetableProvider>();

    final selectedDate = attendanceProvider.selectedDate;
    final hasSemester = attendanceProvider.activeSemester != null;
    final activeSemester = attendanceProvider.activeSemester;

    final slots = timetableProvider.slots.isNotEmpty
        ? timetableProvider.slots
        : attendanceProvider.slots;

    final datesWithClasses = _computeDatesWithClasses(slots, selectedDate);
    final summaryMap = {for (var s in attendanceProvider.subjectSummaries) s.subject.id: s};
    final resolvedClasses = attendanceProvider.todayClasses;

    // Date formatted label
    String dateHeading = 'Today';
    try {
      final parsed = DateTime.parse(selectedDate);
      final now = DateTime.now();
      if (parsed.year == now.year && parsed.month == now.month && parsed.day == now.day) {
        dateHeading = 'Today · ${DateFormat('d MMMM').format(parsed)}';
      } else {
        dateHeading = DateFormat('EEEE, d MMMM').format(parsed);
      }
    } catch (_) {}

    return Scaffold(
      backgroundColor: AttendanceTokens.bg(context),
      appBar: AppBar(
        backgroundColor: AttendanceTokens.bg(context),
        elevation: 0,
        titleSpacing: 20,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Attendance',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w900,
                letterSpacing: -0.5,
                color: AttendanceTokens.textPrimary(context),
              ),
            ),
            if (activeSemester != null)
              Text(
                activeSemester.name,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: AppColors.primary(context),
                ),
              ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.history_rounded),
            tooltip: 'Attendance History',
            onPressed: () {
              FeedbackService.instance.selection();
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const AttendanceHistoryScreen()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.add_rounded),
            tooltip: 'Add Class',
            onPressed: () {
              FeedbackService.instance.selection();
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const AddClassScreen()),
              );
            },
          ),
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert_rounded),
            color: AttendanceTokens.card(context),
            shape: const RoundedRectangleBorder(borderRadius: AttendanceTokens.controlRadius),
            onSelected: (val) {
              FeedbackService.instance.selection();
              if (val == 'manual') {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const ManualAttendanceScreen()),
                );
              } else if (val == 'import') {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const TimetableImportExportScreen(initialTabIndex: 1)),
                );
              } else if (val == 'export') {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const TimetableImportExportScreen(initialTabIndex: 0)),
                );
              } else if (val == 'settings') {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const AttendanceSettingsScreen()),
                );
              }
            },
            itemBuilder: (_) => [
              const PopupMenuItem(
                value: 'manual',
                child: Row(
                  children: [
                    Icon(Icons.checklist_rounded, size: 18),
                    SizedBox(width: 10),
                    Text('Manual Attendance'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'import',
                child: Row(
                  children: [
                    Icon(Icons.file_download_outlined, size: 18),
                    SizedBox(width: 10),
                    Text('Import Timetable'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'export',
                child: Row(
                  children: [
                    Icon(Icons.file_upload_outlined, size: 18),
                    SizedBox(width: 10),
                    Text('Export Timetable'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'settings',
                child: Row(
                  children: [
                    Icon(Icons.tune_rounded, size: 18),
                    SizedBox(width: 10),
                    Text('Attendance Settings'),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SafeArea(
        child: GestureDetector(
          onHorizontalDragEnd: (details) {
            final velocity = details.primaryVelocity ?? 0;
            if (velocity.abs() < _swipeVelocityThreshold) return;
            final selectedDt = DateTime.tryParse(selectedDate) ?? DateTime.now();
            if (velocity < 0) {
              // Swipe left → next week
              final next = selectedDt.add(const Duration(days: 7));
              attendanceProvider.setSelectedDate(next);
            } else {
              // Swipe right → previous week
              final prev = selectedDt.subtract(const Duration(days: 7));
              attendanceProvider.setSelectedDate(prev);
            }
          },
          child: RefreshIndicator(
          onRefresh: () => attendanceProvider.loadData(forceRefresh: true),
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (!hasSemester)
                  AttendanceEmptyState(
                    title: 'No Active Semester',
                    message: 'Set up your semester and subjects to begin tracking attendance.',
                    actionLabel: 'Add Semester',
                    onAction: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const AddClassScreen()),
                      );
                    },
                  )
                else ...[
                  // 1. Horizontal 7-Day Date Strip
                  WeekDateStrip(
                    selectedDate: selectedDate,
                    onSelectDate: (dateStr) {
                      attendanceProvider.setSelectedDate(DateTime.tryParse(dateStr) ?? DateTime.now());
                    },
                    datesWithClasses: datesWithClasses,
                  ),
                  const SizedBox(height: AppSpacing.md),

                  // 2. Schedule Section Header with Compact View Toggle
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        dateHeading,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.3,
                          color: AttendanceTokens.textPrimary(context),
                        ),
                      ),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            '${resolvedClasses.where((c) => c.attendanceStatus != null).length}/${resolvedClasses.length} marked',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: AttendanceTokens.textMuted(context),
                            ),
                          ),
                          const SizedBox(width: 8),
                          InkWell(
                            onTap: () async {
                              FeedbackService.instance.selection();
                              setState(() => _isCompactView = !_isCompactView);
                              try {
                                final prefs = await SharedPreferences.getInstance();
                                await prefs.setBool('attendance_compact_view', _isCompactView);
                              } catch (_) {}
                            },
                            borderRadius: BorderRadius.circular(6),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                              decoration: BoxDecoration(
                                color: _isCompactView
                                    ? AppColors.primary(context).withValues(alpha: 0.12)
                                    : AppColors.surfaceMuted(context),
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(
                                  color: _isCompactView
                                      ? AppColors.primary(context).withValues(alpha: 0.3)
                                      : AppColors.border(context),
                                  width: 1.0,
                                ),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    _isCompactView ? Icons.view_headline_rounded : Icons.view_agenda_rounded,
                                    size: 13,
                                    color: _isCompactView ? AppColors.primary(context) : AttendanceTokens.textMuted(context),
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    _isCompactView ? 'Mini' : 'Cards',
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w700,
                                      color: _isCompactView ? AppColors.primary(context) : AttendanceTokens.textMuted(context),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.sm),

                  // 3. Vertical Daily Class Timeline
                  if (resolvedClasses.isEmpty)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: AttendanceTokens.card(context),
                        borderRadius: AppRadii.lg,
                        border: Border.all(color: AttendanceTokens.border(context)),
                      ),
                      child: Column(
                        children: [
                          Icon(
                            Icons.event_available_rounded,
                            size: 36,
                            color: AppColors.primary(context).withValues(alpha: 0.6),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'No Classes Scheduled',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: AttendanceTokens.textPrimary(context),
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Your schedule is clear for this day.',
                            style: TextStyle(
                              fontSize: 12,
                              color: AttendanceTokens.textMuted(context),
                            ),
                          ),
                        ],
                      ),
                    )
                  else
                    AttendanceTimeline(
                      classes: resolvedClasses,
                      subjectSummaries: summaryMap,
                      isMini: _isCompactView,
                      onMarkAttendance: (resolvedClass, status) {
                        attendanceProvider.markAttendance(
                          resolvedClass: resolvedClass,
                          status: status,
                        );
                      },
                      onClearAttendance: (resolvedClass) {
                        attendanceProvider.clearAttendanceForClass(resolvedClass);
                      },
                      onCancelClass: (resolvedClass, reason) {
                        // One-tap cancel — immediately marks class cancelled without lingering bottom popups
                        attendanceProvider.cancelClass(
                          resolvedClass: resolvedClass,
                          reason: reason,
                        );
                      },
                      onRestoreClass: (resolvedClass) {
                        attendanceProvider.restoreCancelledClass(resolvedClass: resolvedClass);
                      },
                      onClassTap: (resolvedClass) {
                        final summary = summaryMap[resolvedClass.subjectId];
                        if (summary != null) {
                          FeedbackService.instance.selection();
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => SubjectDetailScreen(subjectSummary: summary),
                            ),
                          );
                        }
                      },
                    ),

                  const SizedBox(height: AppSpacing.lg),

                  // 4. Course Attendance Standing Section
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Course Standing (${attendanceProvider.subjectSummaries.length})',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.3,
                          color: AttendanceTokens.textPrimary(context),
                        ),
                      ),
                      TextButton(
                        onPressed: () {
                          FeedbackService.instance.selection();
                          Navigator.of(context).push(
                            MaterialPageRoute(builder: (_) => const AttendanceHistoryScreen()),
                          );
                        },
                        style: TextButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                        child: Text(
                          'History →',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary(context),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.xs),

                  // Course list
                  ...attendanceProvider.subjectSummaries.map((summary) {
                    final isSafe = summary.riskState == RiskState.safe;
                    final isCritical = summary.riskState == RiskState.critical;

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: InkWell(
                        borderRadius: AppRadii.lg,
                        onTap: () {
                          FeedbackService.instance.selection();
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => SubjectDetailScreen(subjectSummary: summary),
                            ),
                          );
                        },
                        child: Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: AttendanceTokens.card(context),
                            borderRadius: AppRadii.lg,
                            border: Border.all(color: AttendanceTokens.border(context)),
                          ),
                          child: Row(
                            children: [
                              AttendanceRing(
                                percentage: summary.percentage,
                                target: summary.targetPercentage,
                                size: 48,
                                strokeWidth: 5,
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      summary.subject.name,
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w800,
                                        color: AttendanceTokens.textPrimary(context),
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      '${summary.effectiveAttended} of ${summary.effectiveTotal} classes attended',
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: AttendanceTokens.textMuted(context),
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                          decoration: BoxDecoration(
                                            color: isSafe
                                                ? AppColors.successBg(context)
                                                : isCritical
                                                    ? AppColors.dangerBg(context)
                                                    : AppColors.warningBg(context),
                                            borderRadius: AppRadii.sm,
                                            border: Border.all(
                                              color: isSafe
                                                  ? AppColors.successBorder(context)
                                                  : isCritical
                                                      ? AppColors.dangerBorder(context)
                                                      : AppColors.warningBorder(context),
                                            ),
                                          ),
                                          child: Text(
                                            isSafe
                                                ? '${summary.bunkAllowance} bunks safe'
                                                : isCritical
                                                    ? 'Need +${summary.recoveryRequirement} classes'
                                                    : '1 bunk left',
                                            style: TextStyle(
                                              fontSize: 10,
                                              fontWeight: FontWeight.w700,
                                              color: isSafe
                                                  ? AppColors.successText(context)
                                                  : isCritical
                                                      ? AppColors.dangerText(context)
                                                      : AppColors.warningText(context),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              Icon(
                                Icons.chevron_right_rounded,
                                color: AttendanceTokens.textMuted(context),
                                size: 20,
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }),
                  const SizedBox(height: AppSpacing.xl),
                ],
              ],
            ),
          ),
          ),
        ),
      ),
    );
  }
}
