import 'package:flutter/material.dart';
import '../models/subject_attendance.dart';
import '../services/class_resolution_service.dart';
import 'attendance_class_card.dart';
import 'attendance_tokens.dart';

/// SilverBook-inspired continuous vertical timeline widget for displaying daily classes.
class AttendanceTimeline extends StatelessWidget {
  final List<ResolvedClass> classes;
  final Map<String, SubjectAttendanceSummary> subjectSummaries;
  final Function(ResolvedClass resolvedClass, String status) onMarkAttendance;
  final Function(ResolvedClass resolvedClass) onClearAttendance;
  final Function(ResolvedClass resolvedClass, String reason)? onCancelClass;
  final Function(ResolvedClass resolvedClass)? onRestoreClass;
  final Function(ResolvedClass resolvedClass)? onClassTap;
  final bool isMini;

  const AttendanceTimeline({
    super.key,
    required this.classes,
    required this.subjectSummaries,
    required this.onMarkAttendance,
    required this.onClearAttendance,
    this.onCancelClass,
    this.onRestoreClass,
    this.onClassTap,
    this.isMini = false,
  });

  @override
  Widget build(BuildContext context) {
    if (classes.isEmpty) {
      return const SizedBox.shrink();
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: classes.length,
      itemBuilder: (context, index) {
        final c = classes[index];
        final summary = subjectSummaries[c.subjectId];
        final isLast = index == classes.length - 1;

        return Stack(
          clipBehavior: Clip.none,
          children: [
            // Continuous Vertical Connecting Line (drawn behind, from dot down to bottom of item)
            if (!isLast)
              Positioned(
                left: 26,
                top: 24,
                bottom: 0,
                child: Container(
                  width: 1.5,
                  color: AttendanceTokens.border(context).withValues(alpha: 0.7),
                ),
              ),

            // Natural height Row containing Time column and Class Card
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Timeline Column (Time label + dot)
                SizedBox(
                  width: 54,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Start Time Label
                      Text(
                        ClassResolutionService.formatTimeDisplay(c.startTime),
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: AttendanceTokens.textSecondary(context),
                        ),
                      ),
                      const SizedBox(height: 4),
                      // Timeline Node Dot
                      Container(
                        width: 10,
                        height: 10,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: c.attendanceStatus == 'present'
                              ? AttendanceTokens.present
                              : (c.attendanceStatus == 'absent'
                                  ? AttendanceTokens.absent
                                  : (c.isCancelled
                                      ? AttendanceTokens.cancelled
                                      : AttendanceTokens.primaryBlue)),
                          border: Border.all(
                            color: AttendanceTokens.card(context),
                            width: 2.0,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(width: 8),

                // Class Card - SIZES 100% NATURALLY WITHOUT CLIPPING
                Expanded(
                  child: AttendanceClassCard(
                    resolvedClass: c,
                    subjectSummary: summary,
                    isMini: isMini,
                    onMarkAttendance: (status) => onMarkAttendance(c, status),
                    onClearAttendance: () => onClearAttendance(c),
                    onCancelClass: onCancelClass != null
                        ? (reason) => onCancelClass!(c, reason)
                        : null,
                    onRestoreClass: onRestoreClass != null
                        ? () => onRestoreClass!(c)
                        : null,
                    onTap: onClassTap != null ? () => onClassTap!(c) : null,
                  ),
                ),
              ],
            ),
          ],
        );
      },
    );
  }
}
