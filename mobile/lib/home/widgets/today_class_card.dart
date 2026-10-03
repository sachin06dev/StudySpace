import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../attendance/models/subject_attendance.dart';
import '../../attendance/providers/attendance_provider.dart';
import '../../attendance/screens/subject_detail_screen.dart';
import '../../attendance/services/class_resolution_service.dart';
import '../../attendance/widgets/cancel_class_sheet.dart';
import '../../timetable/widgets/repeat_class_sheet.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/services/feedback_service.dart';
import '../../core/utils/time_formatter.dart';

class TodayClassCard extends StatelessWidget {
  final ResolvedClass resolvedClass;
  final Function(String status) onMarkAttendance;
  final VoidCallback onClearAttendance;
  final void Function(String? reason)? onCancelClass;
  final VoidCallback? onRestoreClass;
  final EdgeInsetsGeometry? margin;

  const TodayClassCard({
    super.key,
    required this.resolvedClass,
    required this.onMarkAttendance,
    required this.onClearAttendance,
    this.onCancelClass,
    this.onRestoreClass,
    this.margin,
  });

  bool _isOngoing() {
    try {
      final now = DateTime.now();
      final currentMinutes = now.hour * 60 + now.minute;

      final startParts = resolvedClass.startTime.split(':');
      final endParts = resolvedClass.endTime.split(':');
      final startMin = int.parse(startParts[0]) * 60 + int.parse(startParts[1]);
      final endMin = int.parse(endParts[0]) * 60 + int.parse(endParts[1]);

      return currentMinutes >= startMin && currentMinutes < endMin;
    } catch (_) {
      return false;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = AppColors.isDark(context);
    final isMarkedPresent = resolvedClass.attendanceStatus == 'present';
    final isMarkedAbsent = resolvedClass.attendanceStatus == 'absent';
    final isCancelled = resolvedClass.isCancelled;
    final isOngoing = _isOngoing() && !isCancelled;

    // Visual State Determination
    Color cardBorder;
    Color cardBg = AppColors.card(context);
    double borderWidth = 1.0;

    if (isCancelled) {
      cardBorder = AppColors.border(context).withValues(alpha: 0.5);
      cardBg = isDark
          ? AppColors.card(context).withValues(alpha: 0.6)
          : AppColors.surfaceMuted(context).withValues(alpha: 0.5);
    } else if (isMarkedPresent) {
      cardBorder = AppColors.success.withValues(alpha: 0.7);
      borderWidth = 1.6;
    } else if (isMarkedAbsent) {
      cardBorder = AppColors.danger.withValues(alpha: 0.7);
      borderWidth = 1.6;
    } else if (isOngoing) {
      cardBorder = AppColors.primary(context);
      borderWidth = 1.8;
    } else {
      cardBorder = AppColors.border(context);
    }

    return Container(
      margin: margin ?? const EdgeInsets.only(bottom: AppSpacing.md),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 220),
        curve: Curves.easeOutCubic,
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: AppRadii.lg,
          border: Border.all(color: cardBorder, width: borderWidth),
          boxShadow: isOngoing
              ? [
                  BoxShadow(
                    color: AppColors.primary(context).withValues(alpha: isDark ? 0.25 : 0.12),
                    blurRadius: 12,
                    offset: const Offset(0, 3),
                  ),
                ]
              : null,
        ),
        padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: Time, Badges & Overflow Menu
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Time & Live badge
              Row(
                children: [
                  Icon(
                    Icons.access_time_rounded,
                    size: 15,
                    color: isOngoing
                        ? AppColors.primary(context)
                        : (isCancelled
                            ? AppColors.textMuted(context)
                            : AppColors.textPrimary(context)),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    TimeFormatter.formatRange(resolvedClass.startTime, resolvedClass.endTime),
                    style: AppTypography.caption.copyWith(
                      fontWeight: FontWeight.w700,
                      color: isOngoing
                          ? AppColors.primary(context)
                          : (isCancelled
                              ? AppColors.textMuted(context)
                              : AppColors.textPrimary(context)),
                    ),
                  ),
                  if (isOngoing) ...[
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.primary(context).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 6,
                            height: 6,
                            decoration: BoxDecoration(
                              color: AppColors.primary(context),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'LIVE',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w900,
                              color: AppColors.primary(context),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),

              // Badges & Overflow
              Row(
                children: [
                  if (resolvedClass.isExtra)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                      margin: const EdgeInsets.only(right: 6),
                      decoration: BoxDecoration(
                        color: AppColors.accentViolet.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.auto_awesome, size: 11, color: AppColors.accentViolet),
                          SizedBox(width: 3),
                          Text(
                            'Extra',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: AppColors.accentViolet,
                            ),
                          ),
                        ],
                      ),
                    ),
                  if (resolvedClass.isRescheduled)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                      margin: const EdgeInsets.only(right: 6),
                      decoration: BoxDecoration(
                        color: AppColors.warningBg(context),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        'Rescheduled',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: AppColors.warningText(context),
                        ),
                      ),
                    ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceMuted(context),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      resolvedClass.classType.toUpperCase(),
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.5,
                        color: AppColors.textMuted(context),
                      ),
                    ),
                  ),
                  const SizedBox(width: 4),

                  // Compact Overflow Menu
                  PopupMenuButton<String>(
                    icon: Icon(
                      Icons.more_vert_rounded,
                      size: 18,
                      color: AppColors.textMuted(context),
                    ),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                    color: AppColors.card(context),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    onSelected: (val) {
                      FeedbackService.instance.selection();
                      if (val == 'cancel') {
                        if (onCancelClass != null) {
                          CancelClassSheet.show(
                            context,
                            resolvedClass: resolvedClass,
                            onConfirm: onCancelClass!,
                          );
                        }
                      } else if (val == 'restore') {
                        onRestoreClass?.call();
                      } else if (val == 'repeat') {
                        final currentIso = (DateTime.now().weekday - 1) % 7;
                        RepeatClassSheet.showForResolvedClass(
                          context,
                          resolvedClass: resolvedClass,
                          dayOfWeek: currentIso,
                        );
                      } else if (val == 'change') {
                        onClearAttendance();
                      } else if (val == 'history') {
                        final attProvider = context.read<AttendanceProvider>();
                        final summary = attProvider.subjectSummaries.firstWhere(
                          (s) => s.subject.id == resolvedClass.subjectId,
                          orElse: () => SubjectAttendanceSummary.empty(),
                        );
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => SubjectDetailScreen(subjectSummary: summary),
                          ),
                        );
                      }
                    },
                    itemBuilder: (ctx) => [
                      if (!isCancelled) ...[
                        const PopupMenuItem(
                          value: 'cancel',
                          child: Row(
                            children: [
                              Icon(Icons.event_busy_rounded, size: 18, color: AppColors.danger),
                              SizedBox(width: 10),
                              Text('Cancel Class', style: TextStyle(color: AppColors.danger)),
                            ],
                          ),
                        ),
                        if (!resolvedClass.isExtra)
                          const PopupMenuItem(
                            value: 'repeat',
                            child: Row(
                              children: [
                                Icon(Icons.repeat_rounded, size: 18, color: AppColors.brandPrimary),
                                SizedBox(width: 10),
                                Text('Repeat Class'),
                              ],
                            ),
                          ),
                      ] else
                        const PopupMenuItem(
                          value: 'restore',
                          child: Row(
                            children: [
                              Icon(Icons.restore_rounded, size: 18, color: AppColors.brandPrimary),
                              SizedBox(width: 10),
                              Text('Restore Class'),
                            ],
                          ),
                        ),
                      if (isMarkedPresent || isMarkedAbsent)
                        const PopupMenuItem(
                          value: 'change',
                          child: Row(
                            children: [
                              Icon(Icons.edit_outlined, size: 18),
                              SizedBox(width: 10),
                              Text('Change Attendance'),
                            ],
                          ),
                        ),
                      const PopupMenuItem(
                        value: 'history',
                        child: Row(
                          children: [
                            Icon(Icons.history_rounded, size: 18),
                            SizedBox(width: 10),
                            Text('View Attendance History'),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 10),

          // Subject Name
          Text(
            resolvedClass.subjectName,
            style: AppTypography.heading2.copyWith(
              decoration: isCancelled ? TextDecoration.lineThrough : null,
              color: isCancelled
                  ? AppColors.textMuted(context).withValues(alpha: 0.65)
                  : AppColors.textPrimary(context),
            ),
          ),

          const SizedBox(height: 4),

          // Room & Faculty details
          Row(
            children: [
              if (resolvedClass.room != null && resolvedClass.room!.isNotEmpty) ...[
                Icon(
                  Icons.meeting_room_outlined,
                  size: 14,
                  color: AppColors.textMuted(context),
                ),
                const SizedBox(width: 4),
                Text(
                  'Room ${resolvedClass.room}',
                  style: AppTypography.caption.copyWith(
                    color: AppColors.textMuted(context),
                  ),
                ),
                const SizedBox(width: 14),
              ],
              if (resolvedClass.faculty != null && resolvedClass.faculty!.isNotEmpty) ...[
                Icon(
                  Icons.person_outline,
                  size: 14,
                  color: AppColors.textMuted(context),
                ),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    resolvedClass.faculty!,
                    overflow: TextOverflow.ellipsis,
                    style: AppTypography.caption.copyWith(
                      color: AppColors.textMuted(context),
                    ),
                  ),
                ),
              ],
            ],
          ),

          const SizedBox(height: 14),

          // Visual State / Attendance Action Row
          if (isCancelled)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 14),
              decoration: BoxDecoration(
                color: AppColors.surfaceMuted(context),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.border(context).withValues(alpha: 0.6)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(Icons.event_busy_rounded, size: 16, color: AppColors.textMuted(context)),
                      const SizedBox(width: 8),
                      Text(
                        resolvedClass.cancellationReason != null &&
                                resolvedClass.cancellationReason!.isNotEmpty
                            ? 'Cancelled: ${resolvedClass.cancellationReason}'
                            : 'Class Cancelled',
                        style: TextStyle(
                          color: AppColors.textMuted(context),
                          fontWeight: FontWeight.w600,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                  if (onRestoreClass != null)
                    InkWell(
                      onTap: () {
                        FeedbackService.instance.light();
                        onRestoreClass!();
                      },
                      borderRadius: BorderRadius.circular(6),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        child: Text(
                          'Restore',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary(context),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            )
          else if (isMarkedPresent || isMarkedAbsent)
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: isMarkedPresent ? AppColors.successBg(context) : AppColors.dangerBg(context),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: isMarkedPresent ? AppColors.success : AppColors.danger,
                      width: 1,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        isMarkedPresent ? Icons.check_circle_rounded : Icons.cancel_rounded,
                        size: 16,
                        color: isMarkedPresent ? AppColors.successText(context) : AppColors.dangerText(context),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        isMarkedPresent ? 'Present' : 'Absent',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                          color: isMarkedPresent ? AppColors.successText(context) : AppColors.dangerText(context),
                        ),
                      ),
                    ],
                  ),
                ),
                TextButton.icon(
                  onPressed: () {
                    FeedbackService.instance.selection();
                    onClearAttendance();
                  },
                  icon: const Icon(Icons.refresh_rounded, size: 16),
                  label: const Text('Change'),
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.primary(context),
                  ),
                ),
              ],
            )
          else
            LayoutBuilder(
              builder: (context, constraints) {
                Widget buildPresentBtn() {
                  return ElevatedButton.icon(
                    onPressed: () {
                      FeedbackService.instance.attendanceSuccess();
                      onMarkAttendance('present');
                    },
                    icon: const Icon(Icons.check_rounded, size: 16),
                    label: const Text(
                      'Present',
                      style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12.5),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.success,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(vertical: 11, horizontal: 4),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  );
                }

                Widget buildAbsentBtn() {
                  return OutlinedButton.icon(
                    onPressed: () {
                      FeedbackService.instance.attendanceAbsent();
                      onMarkAttendance('absent');
                    },
                    icon: Icon(Icons.close_rounded, size: 16, color: AppColors.dangerText(context)),
                    label: Text(
                      'Absent',
                      style: TextStyle(
                        color: AppColors.dangerText(context),
                        fontWeight: FontWeight.w700,
                        fontSize: 12.5,
                      ),
                    ),
                    style: OutlinedButton.styleFrom(
                      backgroundColor: AppColors.danger.withValues(alpha: isDark ? 0.12 : 0.06),
                      side: BorderSide(color: AppColors.danger.withValues(alpha: 0.6), width: 1.2),
                      padding: const EdgeInsets.symmetric(vertical: 11, horizontal: 4),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  );
                }

                Widget buildCancelBtn() {
                  final isMarked = isMarkedPresent || isMarkedAbsent;
                  const label = 'Cancel';
                  final icon = isMarked ? Icons.remove_circle_outline_rounded : Icons.event_busy_rounded;

                  return OutlinedButton.icon(
                    onPressed: () {
                      FeedbackService.instance.selection();
                      if (isMarked) {
                        onClearAttendance();
                      } else {
                        // Instant 1-tap cancellation without modal dialog
                        onCancelClass?.call(null);
                      }
                    },
                    onLongPress: () {
                      // Optional: long-press opens reason sheet if user wants to add an explanation
                      FeedbackService.instance.medium();
                      CancelClassSheet.show(
                        context,
                        resolvedClass: resolvedClass,
                        onConfirm: (reason) {
                          onCancelClass?.call(reason);
                        },
                      );
                    },
                    icon: Icon(
                      icon,
                      size: 16,
                      color: isMarked ? AppColors.warningText(context) : AppColors.textSecondary(context),
                    ),
                    label: Text(
                      label,
                      style: TextStyle(
                        color: isMarked ? AppColors.warningText(context) : AppColors.textSecondary(context),
                        fontWeight: FontWeight.w700,
                        fontSize: 12.5,
                      ),
                    ),
                    style: OutlinedButton.styleFrom(
                      backgroundColor: isMarked
                          ? AppColors.warningBg(context).withValues(alpha: 0.12)
                          : AppColors.surfaceMuted(context),
                      side: BorderSide(
                        color: isMarked
                            ? AppColors.warningBorder(context).withValues(alpha: 0.7)
                            : AppColors.border(context),
                        width: 1.0,
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 11, horizontal: 4),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  );
                }

                if (constraints.maxWidth >= 280) {
                  return Row(
                    children: [
                      Expanded(child: buildPresentBtn()),
                      const SizedBox(width: 6),
                      Expanded(child: buildAbsentBtn()),
                      const SizedBox(width: 6),
                      Expanded(child: buildCancelBtn()),
                    ],
                  );
                }
                return Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: [
                    buildPresentBtn(),
                    buildAbsentBtn(),
                    buildCancelBtn(),
                  ],
                );
              },
            ),
        ],
      ),
    ));
  }
}
