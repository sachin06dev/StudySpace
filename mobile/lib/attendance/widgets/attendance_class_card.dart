import 'package:flutter/material.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/services/feedback_service.dart';
import '../../core/utils/time_formatter.dart';
import '../models/subject_attendance.dart';
import '../services/class_resolution_service.dart';
import 'attendance_tokens.dart';
import 'cancel_class_sheet.dart';
import '../../timetable/widgets/repeat_class_sheet.dart';

/// Redesigned Attendance class card matching the authoritative Dashboard visual language.
/// Natural vertical layout, complete [Present] [Absent] [Cancel] action row,
/// no clipping, no overflow, and responsive across all screen widths (320dp to 600dp+).
class AttendanceClassCard extends StatelessWidget {
  final ResolvedClass resolvedClass;
  final SubjectAttendanceSummary? subjectSummary;
  final Function(String status) onMarkAttendance;
  final VoidCallback onClearAttendance;
  final Function(String reason)? onCancelClass;
  final VoidCallback? onRestoreClass;
  final VoidCallback? onTap;
  final EdgeInsetsGeometry? margin;
  final bool isMini;

  const AttendanceClassCard({
    super.key,
    required this.resolvedClass,
    this.subjectSummary,
    required this.onMarkAttendance,
    required this.onClearAttendance,
    this.onCancelClass,
    this.onRestoreClass,
    this.onTap,
    this.margin,
    this.isMini = false,
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
    final isCancelled = resolvedClass.isCancelled;
    final isMarkedPresent = resolvedClass.attendanceStatus == 'present';
    final isMarkedAbsent = resolvedClass.attendanceStatus == 'absent';
    final isMarked = isMarkedPresent || isMarkedAbsent;
    final isOngoing = _isOngoing() && !isCancelled;

    final formattedTime = TimeFormatter.formatRange(
      resolvedClass.startTime,
      resolvedClass.endTime,
    );

    // Border & Background Determination matching Dashboard
    Color cardBorder;
    Color cardBg = AppColors.card(context);
    double borderWidth = 1.0;

    if (isCancelled) {
      cardBorder = AppColors.border(context).withValues(alpha: 0.5);
      cardBg = isDark
          ? AppColors.card(context).withValues(alpha: 0.6)
          : AppColors.surfaceMuted(context).withValues(alpha: 0.5);
    } else if (isMarkedPresent) {
      cardBorder = AppColors.success.withValues(alpha: 0.75);
      borderWidth = 1.6;
    } else if (isMarkedAbsent) {
      cardBorder = AppColors.danger.withValues(alpha: 0.75);
      borderWidth = 1.6;
    } else if (isOngoing) {
      cardBorder = AppColors.primary(context);
      borderWidth = 1.8;
    } else {
      cardBorder = AppColors.border(context);
    }

    return AnimatedContainer(
      duration: const Duration(milliseconds: 220),
      curve: Curves.easeOutCubic,
      margin: margin ?? EdgeInsets.only(bottom: isMini ? AppSpacing.sm : AppSpacing.md),
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
      child: Material(
        color: Colors.transparent,
        borderRadius: AppRadii.lg,
        child: InkWell(
          onTap: onTap,
          borderRadius: AppRadii.lg,
          child: Padding(
            padding: EdgeInsets.all(isMini ? 12.0 : 16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                // 1. Header Row: Time range + Live indicator & Type badge + Overflow Menu
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Time range & LIVE badge
                    Expanded(
                      child: Row(
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
                          Flexible(
                            child: Text(
                              formattedTime,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: AppTypography.caption.copyWith(
                                fontWeight: FontWeight.w700,
                                color: isOngoing
                                    ? AppColors.primary(context)
                                    : (isCancelled
                                        ? AppColors.textMuted(context)
                                        : AppColors.textPrimary(context)),
                              ),
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
                    ),

                    // Badges (Extra / Rescheduled) + Class Type pill + Menu
                    Row(
                      mainAxisSize: MainAxisSize.min,
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
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
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

                        // Overflow menu (⋮)
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
                            } else if (val == 'clear') {
                              onClearAttendance();
                            } else if (val == 'history') {
                              onTap?.call();
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
                            if (isMarked)
                              const PopupMenuItem(
                                value: 'clear',
                                child: Row(
                                  children: [
                                    Icon(Icons.refresh_rounded, size: 18),
                                    SizedBox(width: 10),
                                    Text('Clear Attendance'),
                                  ],
                                ),
                              ),
                            const PopupMenuItem(
                              value: 'history',
                              child: Row(
                                children: [
                                  Icon(Icons.history_rounded, size: 18),
                                  SizedBox(width: 10),
                                  Text('View Subject Details'),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),

                // 2. Subject Title & Metadata (Full or Mini)
                if (isMini) ...[
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          resolvedClass.subjectName,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppTypography.heading3.copyWith(
                            fontSize: 14.5,
                            fontWeight: FontWeight.w800,
                            decoration: isCancelled ? TextDecoration.lineThrough : null,
                            color: isCancelled
                                ? AppColors.textMuted(context).withValues(alpha: 0.65)
                                : AppColors.textPrimary(context),
                          ),
                        ),
                      ),
                      if (resolvedClass.room != null && resolvedClass.room!.isNotEmpty) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.surfaceMuted(context),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            'R-${resolvedClass.room}',
                            style: TextStyle(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textMuted(context),
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ] else ...[
                  const SizedBox(height: 10),
                  Text(
                    resolvedClass.subjectName,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: AppTypography.heading2.copyWith(
                      decoration: isCancelled ? TextDecoration.lineThrough : null,
                      color: isCancelled
                          ? AppColors.textMuted(context).withValues(alpha: 0.65)
                          : AppColors.textPrimary(context),
                    ),
                  ),
                  const SizedBox(height: 4),
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
                        const SizedBox(width: 12),
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
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppTypography.caption.copyWith(
                              color: AppColors.textMuted(context),
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ],

                // 4. Standing / Missability Advice (if summary available)
                if (subjectSummary != null && !isCancelled) ...[
                  SizedBox(height: isMini ? 6 : 10),
                  Row(
                    children: [
                      Icon(
                        subjectSummary!.riskState == RiskState.safe
                            ? Icons.check_circle_outline_rounded
                            : Icons.info_outline_rounded,
                        size: isMini ? 12 : 13,
                        color: subjectSummary!.riskState == RiskState.safe
                            ? AttendanceTokens.present
                            : (subjectSummary!.riskState == RiskState.warning
                                ? AttendanceTokens.cancelled
                                : AttendanceTokens.absent),
                      ),
                      const SizedBox(width: 5),
                      Expanded(
                        child: Text(
                          subjectSummary!.statusMessage,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: isMini ? 10.5 : 11.5,
                            fontWeight: FontWeight.w600,
                            color: subjectSummary!.riskState == RiskState.safe
                                ? AttendanceTokens.present
                                : (subjectSummary!.riskState == RiskState.warning
                                    ? AttendanceTokens.cancelled
                                    : AttendanceTokens.absent),
                          ),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        '${subjectSummary!.percentage.toStringAsFixed(0)}%',
                        style: TextStyle(
                          fontSize: isMini ? 10.5 : 11.5,
                          fontWeight: FontWeight.w800,
                          color: AttendanceTokens.textSecondary(context),
                        ),
                      ),
                    ],
                  ),
                ],

                SizedBox(height: isMini ? 8 : 14),

                // 5. Action Row: Cancelled banner OR 3-Button Attendance Control
                if (isCancelled)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 9, horizontal: 12),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceMuted(context),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.border(context).withValues(alpha: 0.6)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Row(
                            children: [
                              Icon(Icons.event_busy_rounded, size: 16, color: AppColors.textMuted(context)),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  resolvedClass.cancellationReason != null &&
                                          resolvedClass.cancellationReason!.isNotEmpty
                                      ? 'Cancelled: ${resolvedClass.cancellationReason}'
                                      : 'Class Cancelled',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    color: AppColors.textMuted(context),
                                    fontWeight: FontWeight.w600,
                                    fontSize: 12.5,
                                  ),
                                ),
                              ),
                            ],
                          ),
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
                else
                  // 3-Button Action Row: [Present] [Absent] [Reset/Cancel]
                  Builder(
                    builder: (context) {
                      final btnHeight = isMini ? 32.0 : 40.0;
                      final fontSize = isMini ? 11.0 : 12.5;
                      final iconSize = isMini ? 14.0 : 16.0;
                      final btnRadius = BorderRadius.circular(isMini ? 8 : 10);

                      Widget buildPresentBtn() {
                        final isSelected = isMarkedPresent;
                        return Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: () {
                              FeedbackService.instance.attendanceSuccess();
                              onMarkAttendance('present');
                            },
                            borderRadius: btnRadius,
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              curve: Curves.easeOutCubic,
                              height: btnHeight,
                              padding: const EdgeInsets.symmetric(horizontal: 4),
                              alignment: Alignment.center,
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? AppColors.success
                                    : AppColors.success.withValues(alpha: isDark ? 0.12 : 0.08),
                                borderRadius: btnRadius,
                                border: Border.all(
                                  color: isSelected
                                      ? AppColors.success
                                      : AppColors.success.withValues(alpha: 0.6),
                                  width: isSelected ? 1.5 : 1.1,
                                ),
                              ),
                              child: FittedBox(
                                fit: BoxFit.scaleDown,
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      Icons.check_rounded,
                                      size: iconSize,
                                      color: isSelected ? Colors.white : AppColors.successText(context),
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      'Present',
                                      style: TextStyle(
                                        color: isSelected ? Colors.white : AppColors.successText(context),
                                        fontWeight: isSelected ? FontWeight.w800 : FontWeight.w700,
                                        fontSize: fontSize,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        );
                      }

                      Widget buildAbsentBtn() {
                        final isSelected = isMarkedAbsent;
                        return Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: () {
                              FeedbackService.instance.attendanceAbsent();
                              onMarkAttendance('absent');
                            },
                            borderRadius: btnRadius,
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              curve: Curves.easeOutCubic,
                              height: btnHeight,
                              padding: const EdgeInsets.symmetric(horizontal: 4),
                              alignment: Alignment.center,
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? AppColors.danger
                                    : AppColors.danger.withValues(alpha: isDark ? 0.12 : 0.08),
                                borderRadius: btnRadius,
                                border: Border.all(
                                  color: isSelected
                                      ? AppColors.danger
                                      : AppColors.danger.withValues(alpha: 0.6),
                                  width: isSelected ? 1.5 : 1.1,
                                ),
                              ),
                              child: FittedBox(
                                fit: BoxFit.scaleDown,
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      Icons.close_rounded,
                                      size: iconSize,
                                      color: isSelected ? Colors.white : AppColors.dangerText(context),
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      'Absent',
                                      style: TextStyle(
                                        color: isSelected ? Colors.white : AppColors.dangerText(context),
                                        fontWeight: isSelected ? FontWeight.w800 : FontWeight.w700,
                                        fontSize: fontSize,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        );
                      }

                      Widget buildCancelBtn() {
                        const label = 'Cancel';
                        final icon = isMarked
                            ? Icons.remove_circle_outline_rounded
                            : Icons.event_busy_rounded;
                        return Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: () {
                              FeedbackService.instance.selection();
                              if (isMarked) {
                                onClearAttendance();
                              } else if (onCancelClass != null) {
                                CancelClassSheet.show(
                                  context,
                                  resolvedClass: resolvedClass,
                                  onConfirm: onCancelClass!,
                                );
                              }
                            },
                            borderRadius: btnRadius,
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              curve: Curves.easeOutCubic,
                              height: btnHeight,
                              padding: const EdgeInsets.symmetric(horizontal: 4),
                              alignment: Alignment.center,
                              decoration: BoxDecoration(
                                color: isMarked
                                    ? AppColors.warningBg(context).withValues(alpha: 0.12)
                                    : AppColors.surfaceMuted(context),
                                borderRadius: btnRadius,
                                border: Border.all(
                                  color: isMarked
                                      ? AppColors.warningBorder(context).withValues(alpha: 0.7)
                                      : AppColors.border(context),
                                  width: 1.0,
                                ),
                              ),
                              child: FittedBox(
                                fit: BoxFit.scaleDown,
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      icon,
                                      size: iconSize,
                                      color: isMarked
                                          ? AppColors.warningText(context)
                                          : AppColors.textSecondary(context),
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      label,
                                      style: TextStyle(
                                        color: isMarked
                                            ? AppColors.warningText(context)
                                            : AppColors.textSecondary(context),
                                        fontWeight: FontWeight.w700,
                                        fontSize: fontSize,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        );
                      }

                      return Row(
                        children: [
                          Expanded(child: buildPresentBtn()),
                          SizedBox(width: isMini ? 6 : 8),
                          Expanded(child: buildAbsentBtn()),
                          SizedBox(width: isMini ? 6 : 8),
                          Expanded(child: buildCancelBtn()),
                        ],
                      );
                    },
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
