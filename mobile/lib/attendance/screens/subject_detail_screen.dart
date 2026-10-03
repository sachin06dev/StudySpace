import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../core/services/feedback_service.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/utils/time_formatter.dart';
import '../../timetable/models/timetable_slot.dart';
import '../../timetable/providers/timetable_provider.dart';
import '../models/attendance_record.dart';
import '../models/subject_attendance.dart';
import '../providers/attendance_provider.dart';
import '../widgets/attendance_ring.dart';
import '../widgets/attendance_tokens.dart';
import 'add_subject_screen.dart';
import 'attendance_history_screen.dart';
import 'manual_attendance_screen.dart';

/// Quiet Academic Subject Detail Screen.
/// Highlights AttendanceRing dominance, required attendance threshold,
/// component-level breakdowns, rolling attendance trend chart, and upcoming schedule.
class SubjectDetailScreen extends StatelessWidget {
  final SubjectAttendanceSummary subjectSummary;

  const SubjectDetailScreen({
    super.key,
    required this.subjectSummary,
  });

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AttendanceProvider>();
    final timetable = context.watch<TimetableProvider>();

    // Live update summary if present in provider
    final liveSummary = provider.subjectSummaries.firstWhere(
      (s) => s.subject.id == subjectSummary.subject.id,
      orElse: () => subjectSummary,
    );

    final subjectRecords = provider.records
        .where((r) => r.subjectId == liveSummary.subject.id)
        .toList()
      ..sort((a, b) => a.classDate.compareTo(b.classDate));

    // Timetable slots for this subject
    final subjectSlots = timetable.slots
        .where((s) => s.subjectId == liveSummary.subject.id)
        .toList();

    return Scaffold(
      backgroundColor: AttendanceTokens.bg(context),
      appBar: AppBar(
        backgroundColor: AttendanceTokens.bg(context),
        elevation: 0,
        title: Text(
          liveSummary.subject.name,
          style: TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w800,
            color: AttendanceTokens.textPrimary(context),
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        actions: [
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert_rounded),
            color: AttendanceTokens.card(context),
            shape: const RoundedRectangleBorder(borderRadius: AttendanceTokens.controlRadius),
            onSelected: (val) {
              FeedbackService.instance.selection();
              if (val == 'manual') {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => ManualAttendanceScreen(initialSubject: liveSummary.subject),
                  ),
                );
              } else if (val == 'edit') {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => AddSubjectScreen(existingSubject: liveSummary.subject),
                  ),
                );
              } else if (val == 'history') {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => AttendanceHistoryScreen(initialSubjectId: liveSummary.subject.id),
                  ),
                );
              }
            },
            itemBuilder: (_) => [
              const PopupMenuItem(
                value: 'manual',
                child: Row(
                  children: [
                    Icon(Icons.playlist_add_check_rounded, size: 18, color: AppColors.study600),
                    SizedBox(width: 10),
                    Text('Record Past Class'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'history',
                child: Row(
                  children: [
                    Icon(Icons.history_rounded, size: 18),
                    SizedBox(width: 10),
                    Text('View Subject History'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'edit',
                child: Row(
                  children: [
                    Icon(Icons.edit_outlined, size: 18),
                    SizedBox(width: 10),
                    Text('Edit Subject'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Dominant AttendanceRing Hero Card
              _buildPercentageHero(context, liveSummary),

              const SizedBox(height: 14),

              // 2. Four Academic Metric Tiles
              _buildMetricTiles(context, liveSummary),

              const SizedBox(height: 14),

              // 3. Components Breakdown Card
              _buildComponentsCard(context, liveSummary, subjectRecords),

              const SizedBox(height: 14),

              // 4. Attendance Trend Chart
              _buildTrendChartCard(context, liveSummary, subjectRecords),

              const SizedBox(height: 14),

              // 5. Upcoming Classes Card
              _buildUpcomingClassesCard(context, subjectSlots),

              const SizedBox(height: 14),

              // 6. Direct Link to Subject History
              InkWell(
                onTap: () {
                  FeedbackService.instance.selection();
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => AttendanceHistoryScreen(initialSubjectId: liveSummary.subject.id),
                    ),
                  );
                },
                borderRadius: AttendanceTokens.cardRadius,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  decoration: BoxDecoration(
                    color: AttendanceTokens.card(context),
                    borderRadius: AttendanceTokens.cardRadius,
                    border: Border.all(color: AttendanceTokens.border(context)),
                  ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Row(
                            children: [
                              const Icon(Icons.history_rounded, size: 20, color: AppColors.study600),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  'Class History (${subjectRecords.length} records)',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    color: AttendanceTokens.textPrimary(context),
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        Icon(Icons.chevron_right_rounded, color: AttendanceTokens.textMuted(context), size: 20),
                      ],
                    ),
                ),
              ),

              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPercentageHero(BuildContext context, SubjectAttendanceSummary summary) {
    final target = summary.targetPercentage;
    final isSafe = summary.riskState == RiskState.safe;
    final isWarning = summary.riskState == RiskState.warning;

    final Color statusColor = isSafe
        ? AttendanceTokens.present
        : isWarning
            ? AttendanceTokens.cancelled
            : AttendanceTokens.absent;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AttendanceTokens.card(context),
        borderRadius: AttendanceTokens.cardRadius,
        border: Border.all(color: AttendanceTokens.border(context)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Attendance Ring as Visual Anchor
          AttendanceRing(
            percentage: summary.percentage,
            target: summary.targetPercentage,
            size: 84.0,
            strokeWidth: 7.0,
            fontSize: 18.0,
            useSemanticColor: true,
          ),

          const SizedBox(width: 18),

          // Subject Context & Advice
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Wrap(
                  spacing: 6,
                  runSpacing: 4,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    if (summary.subject.code != null && summary.subject.code!.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AttendanceTokens.isDark(context)
                              ? Colors.white.withValues(alpha: 0.08)
                              : Colors.black.withValues(alpha: 0.05),
                          borderRadius: BorderRadius.circular(5),
                        ),
                        child: Text(
                          summary.subject.code!,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AttendanceTokens.textSecondary(context),
                          ),
                        ),
                      ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: AttendanceTokens.isDark(context)
                            ? Colors.white.withValues(alpha: 0.06)
                            : Colors.black.withValues(alpha: 0.04),
                        borderRadius: BorderRadius.circular(5),
                      ),
                      child: Text(
                        'Goal: ${target.toStringAsFixed(0)}%',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: AttendanceTokens.textSecondary(context),
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 8),

                // Status Message / Advice
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(top: 2.0),
                      child: Icon(
                        isSafe
                            ? Icons.check_circle_rounded
                            : isWarning
                                ? Icons.info_rounded
                                : Icons.warning_rounded,
                        size: 15,
                        color: statusColor,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        summary.statusMessage.isNotEmpty
                            ? summary.statusMessage
                            : '${summary.percentage.toStringAsFixed(1)}% attendance',
                        style: TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w700,
                          color: statusColor,
                          height: 1.3,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricTiles(BuildContext context, SubjectAttendanceSummary summary) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final cardWidth = (constraints.maxWidth - 10) / 2;

        return Wrap(
          spacing: 10,
          runSpacing: 10,
          children: [
            // Tile 1: Classes Attended
            _buildMetricItem(
              context,
              width: cardWidth,
              label: 'ATTENDED',
              value: '${summary.effectiveAttended} / ${summary.effectiveTotal}',
              subtext: 'Live: ${summary.presentCount}P · ${summary.absentCount}A',
            ),

            // Tile 2: Bunk Allowance
            _buildMetricItem(
              context,
              width: cardWidth,
              label: 'BUNK ALLOWANCE',
              value: summary.bunkAllowance >= 999 ? 'Unlimited' : '${summary.bunkAllowance} classes',
              subtext: summary.bunkAllowance > 0 ? 'Safe to miss' : 'Zero margin',
            ),

            // Tile 3: Recovery Needed
            _buildMetricItem(
              context,
              width: cardWidth,
              label: 'RECOVERY',
              value: summary.recoveryRequirement > 0 ? '${summary.recoveryRequirement} classes' : '0 classes',
              subtext: summary.recoveryRequirement > 0
                  ? 'To reach ${summary.targetPercentage.toStringAsFixed(0)}%'
                  : 'On target',
            ),

            // Tile 4: Baseline
            _buildMetricItem(
              context,
              width: cardWidth,
              label: 'BASELINE',
              value: '${summary.subject.baselineAttended} / ${summary.subject.baselineTotal}',
              subtext: summary.subject.baselineTotal > 0 ? 'Prior baseline' : 'No offset',
            ),
          ],
        );
      },
    );
  }

  Widget _buildMetricItem(
    BuildContext context, {
    required double width,
    required String label,
    required String value,
    required String subtext,
  }) {
    return Container(
      width: width,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: AttendanceTokens.card(context),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AttendanceTokens.border(context)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.5,
              color: AttendanceTokens.textMuted(context),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w900,
              color: AttendanceTokens.textPrimary(context),
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 2),
          Text(
            subtext,
            style: TextStyle(
              fontSize: 10.5,
              color: AttendanceTokens.textMuted(context),
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildComponentsCard(
    BuildContext context,
    SubjectAttendanceSummary summary,
    List<AttendanceRecord> records,
  ) {
    final lectureAttended = summary.presentCount;
    final lectureTotal = summary.presentCount + summary.absentCount;

    return Container(
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
            'Components',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w800,
              color: AttendanceTokens.textPrimary(context),
            ),
          ),
          const SizedBox(height: 12),

          // Lecture component row
          _buildComponentRow(
            context,
            initial: 'L',
            name: summary.subject.classType.toUpperCase(),
            weight: 1,
            attended: lectureAttended,
            total: lectureTotal,
          ),

          if (summary.subject.baselineTotal > 0) ...[
            Divider(height: 18, color: AttendanceTokens.border(context)),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Baseline offset:',
                  style: TextStyle(fontSize: 11.5, color: AttendanceTokens.textMuted(context)),
                ),
                Text(
                  '${summary.subject.baselineAttended}/${summary.subject.baselineTotal}',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: AttendanceTokens.textSecondary(context),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildComponentRow(
    BuildContext context, {
    required String initial,
    required String name,
    required int weight,
    required int attended,
    required int total,
  }) {
    final pct = total > 0 ? (attended / total * 100).toStringAsFixed(0) : '—';

    return Row(
      children: [
        Container(
          width: 26,
          height: 26,
          decoration: BoxDecoration(
            color: AppColors.study600.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(6),
          ),
          alignment: Alignment.center,
          child: Text(
            initial,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w800,
              color: AppColors.study600,
            ),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            name,
            style: TextStyle(
              fontSize: 12.5,
              fontWeight: FontWeight.w700,
              color: AttendanceTokens.textPrimary(context),
            ),
          ),
        ),
        Text(
          '$attended/$total ($pct%)',
          style: TextStyle(
            fontSize: 12.5,
            fontWeight: FontWeight.w800,
            color: AttendanceTokens.textPrimary(context),
          ),
        ),
      ],
    );
  }

  Widget _buildTrendChartCard(
    BuildContext context,
    SubjectAttendanceSummary summary,
    List<AttendanceRecord> records,
  ) {
    String dateRangeStr = 'Semester';
    if (records.isNotEmpty) {
      final first = records.first.classDate;
      final last = records.last.classDate;
      try {
        final d1 = DateFormat('MMM d').format(DateTime.parse(first));
        final d2 = DateFormat('MMM d').format(DateTime.parse(last));
        dateRangeStr = '$d1 - $d2';
      } catch (_) {}
    }

    return Container(
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
                'Attendance Trend',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  color: AttendanceTokens.textPrimary(context),
                ),
              ),
              Text(
                dateRangeStr,
                style: TextStyle(
                  fontSize: 11,
                  color: AttendanceTokens.textMuted(context),
                ),
              ),
            ],
          ),

          const SizedBox(height: 14),

          // Trend Chart Visualization
          SizedBox(
            height: 80,
            width: double.infinity,
            child: records.isEmpty
                ? Center(
                    child: Text(
                      'Log classes to view attendance trend over time.',
                      style: TextStyle(
                        fontSize: 11.5,
                        color: AttendanceTokens.textMuted(context),
                      ),
                    ),
                  )
                : CustomPaint(
                    painter: _TrendChartPainter(
                      records: records,
                      target: summary.targetPercentage,
                      primaryColor: AppColors.study600,
                      targetColor: AttendanceTokens.textMuted(context),
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildUpcomingClassesCard(BuildContext context, List<TimetableSlot> slots) {
    final now = DateTime.now();
    final todayIso = (now.weekday - 1) % 7;
    final dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Sort slots by day relative to today
    final sortedSlots = List<TimetableSlot>.from(slots)
      ..sort((a, b) {
        final diffA = (a.dayOfWeek - todayIso + 7) % 7;
        final diffB = (b.dayOfWeek - todayIso + 7) % 7;
        return diffA.compareTo(diffB);
      });

    return Container(
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
            'Upcoming Classes',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w800,
              color: AttendanceTokens.textPrimary(context),
            ),
          ),
          const SizedBox(height: 12),

          if (sortedSlots.isEmpty)
            Text(
              'No recurring timetable slots configured for this subject.',
              style: TextStyle(fontSize: 11.5, color: AttendanceTokens.textMuted(context)),
            )
          else
            ...sortedSlots.take(3).map((slot) {
              final dayLabel = dayNames[slot.dayOfWeek];
              final timeRange = TimeFormatter.formatRange(slot.startTime, slot.endTime);
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 5.0),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.study600.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(5),
                      ),
                      child: Text(
                        dayLabel,
                        style: const TextStyle(
                          fontSize: 10.5,
                          fontWeight: FontWeight.w800,
                          color: AppColors.study600,
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        timeRange,
                        style: TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w600,
                          color: AttendanceTokens.textPrimary(context),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (slot.roomOverride != null && slot.roomOverride!.isNotEmpty)
                      Text(
                        'Room ${slot.roomOverride}',
                        style: TextStyle(
                          fontSize: 11,
                          color: AttendanceTokens.textMuted(context),
                        ),
                      ),
                  ],
                ),
              );
            }),
        ],
      ),
    );
  }
}

class _TrendChartPainter extends CustomPainter {
  final List<AttendanceRecord> records;
  final double target;
  final Color primaryColor;
  final Color targetColor;

  _TrendChartPainter({
    required this.records,
    required this.target,
    required this.primaryColor,
    required this.targetColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (records.isEmpty) return;

    // Calculate rolling percentage points
    final points = <double>[];
    int attended = 0;
    int total = 0;

    for (final r in records) {
      if (r.status == 'cancelled') continue;
      total++;
      if (r.status == 'present') attended++;
      points.add(total > 0 ? (attended / total) * 100 : 100.0);
    }

    if (points.isEmpty) return;

    // Draw dashed target line
    final targetY = size.height - (target / 100.0 * size.height);
    final targetPaint = Paint()
      ..color = targetColor.withValues(alpha: 0.35)
      ..strokeWidth = 1.0
      ..style = PaintingStyle.stroke;

    double startX = 0;
    while (startX < size.width) {
      canvas.drawLine(
        Offset(startX, targetY),
        Offset((startX + 5).clamp(0.0, size.width), targetY),
        targetPaint,
      );
      startX += 9;
    }

    // Draw trend line
    final linePaint = Paint()
      ..color = primaryColor
      ..strokeWidth = 2.0
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final path = Path();
    final dx = points.length > 1 ? size.width / (points.length - 1) : size.width;

    for (int i = 0; i < points.length; i++) {
      final x = i * dx;
      final y = (size.height - (points[i] / 100.0 * size.height)).clamp(0.0, size.height);
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }

    canvas.drawPath(path, linePaint);

    // Draw points
    final dotPaint = Paint()..color = primaryColor;
    for (int i = 0; i < points.length; i++) {
      final x = i * dx;
      final y = (size.height - (points[i] / 100.0 * size.height)).clamp(0.0, size.height);
      canvas.drawCircle(Offset(x, y), 2.5, dotPaint);
    }
  }

  @override
  bool shouldRepaint(covariant _TrendChartPainter oldDelegate) => true;
}
