import 'package:flutter/material.dart';
import '../../attendance/services/class_resolution_service.dart';
import '../../attendance/providers/attendance_provider.dart';
import '../../attendance/widgets/cancel_class_sheet.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/components/app_button.dart';
import '../../core/services/feedback_service.dart';
import '../../core/utils/time_formatter.dart';
import '../../scanner/screens/scan_timetable_screen.dart';

class NextClassHeroCard extends StatelessWidget {
  final ResolvedClass? nextClass;
  final bool hasActiveSemester;
  final AttendanceProvider attendanceProvider;
  final VoidCallback? onSetupTimetable;

  const NextClassHeroCard({
    super.key,
    required this.nextClass,
    required this.hasActiveSemester,
    required this.attendanceProvider,
    this.onSetupTimetable,
  });

  @override
  Widget build(BuildContext context) {
    if (!hasActiveSemester) {
      return Container(
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          color: AppColors.card(context),
          borderRadius: AppRadii.xl,
          border: Border.all(color: AppColors.border(context)),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppColors.primarySubtle(context).withValues(alpha: 0.5),
              AppColors.card(context),
            ],
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.primarySubtle(context),
                    borderRadius: AppRadii.full,
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.auto_awesome_rounded, size: 12, color: AppColors.primary(context)),
                      const SizedBox(width: 4),
                      Text(
                        'TIMETABLE SETUP',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.8,
                          color: AppColors.primary(context),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              'Set Up Your Schedule',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                letterSpacing: -0.3,
                color: AppColors.textPrimary(context),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Scan your university timetable or set up classes to start tracking attendance and bunk allowances.',
              style: TextStyle(
                fontSize: 12,
                color: AppColors.textMuted(context),
                height: 1.4,
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            AppButton(
              label: 'Scan Timetable Photo',
              icon: Icons.document_scanner_rounded,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              onPressed: () {
                FeedbackService.instance.selection();
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const ScanTimetableScreen()),
                );
              },
            ),
          ],
        ),
      );
    }

    if (nextClass == null) {
      return Container(
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          color: AppColors.card(context),
          borderRadius: AppRadii.xl,
          border: Border.all(color: AppColors.border(context)),
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: AppColors.successBg(context),
                borderRadius: AppRadii.lg,
              ),
              child: Icon(
                Icons.check_circle_rounded,
                color: AppColors.success,
                size: 24,
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'All Clear Today',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary(context),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'No upcoming classes scheduled. Great time for deep focus.',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.textMuted(context),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    }

    final cls = nextClass!;
    final timeStr = TimeFormatter.formatRange(cls.startTime, cls.endTime);
    final isMarked = cls.attendanceStatus != null;
    final isPresent = cls.attendanceStatus == 'present';

    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.card(context),
        borderRadius: AppRadii.xl,
        border: Border.all(color: AppColors.border(context)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Meta Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primarySubtle(context),
                  borderRadius: AppRadii.full,
                ),
                child: Text(
                  'NEXT CLASS',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.8,
                    color: AppColors.primary(context),
                  ),
                ),
              ),
              Row(
                children: [
                  Icon(
                    Icons.schedule_rounded,
                    size: 14,
                    color: AppColors.textMuted(context),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    timeStr,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary(context),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),

          // Course Title
          Text(
            cls.subjectName,
            style: TextStyle(
              fontSize: 19,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.3,
              color: AppColors.textPrimary(context),
            ),
          ),
          const SizedBox(height: 4),

          // Room & Faculty meta
          Wrap(
            spacing: 12,
            runSpacing: 4,
            children: [
              if (cls.room != null && cls.room!.isNotEmpty)
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.room_outlined,
                      size: 14,
                      color: AppColors.primary(context),
                    ),
                    const SizedBox(width: 3),
                    Text(
                      'Room ${cls.room}',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textSecondary(context),
                      ),
                    ),
                  ],
                ),
              if (cls.faculty != null && cls.faculty!.isNotEmpty)
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.person_outline_rounded,
                      size: 14,
                      color: AppColors.textMuted(context),
                    ),
                    const SizedBox(width: 3),
                    Text(
                      cls.faculty!,
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.textMuted(context),
                      ),
                    ),
                  ],
                ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.surfaceRaised(context),
                  borderRadius: AppRadii.sm,
                ),
                child: Text(
                  cls.classType.toUpperCase(),
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.5,
                    color: AppColors.textMuted(context),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),

          // Action Row (Thumb Reachable)
          if (cls.isCancelled)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.surfaceMuted(context),
                borderRadius: AppRadii.md,
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
                        'Class Cancelled',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textMuted(context),
                        ),
                      ),
                    ],
                  ),
                  TextButton(
                    onPressed: () {
                      FeedbackService.instance.light();
                      attendanceProvider.restoreCancelledClass(resolvedClass: cls);
                    },
                    child: Text(
                      'Restore',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary(context),
                      ),
                    ),
                  ),
                ],
              ),
            )
          else if (isMarked)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: isPresent
                    ? AppColors.successBg(context)
                    : AppColors.dangerBg(context),
                borderRadius: AppRadii.md,
                border: Border.all(
                  color: isPresent
                      ? AppColors.successBorder(context)
                      : AppColors.dangerBorder(context),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(
                        isPresent ? Icons.check_circle_rounded : Icons.cancel_rounded,
                        size: 18,
                        color: isPresent ? AppColors.success : AppColors.danger,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        isPresent ? 'Marked Present' : 'Marked Absent',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: isPresent
                              ? AppColors.successText(context)
                              : AppColors.dangerText(context),
                        ),
                      ),
                    ],
                  ),
                  TextButton(
                    onPressed: () {
                      FeedbackService.instance.selection();
                      final newStatus = isPresent ? 'absent' : 'present';
                      attendanceProvider.markAttendance(
                        resolvedClass: cls,
                        status: newStatus,
                      );
                    },
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: Text(
                      'Change',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primary(context),
                      ),
                    ),
                  ),
                ],
              ),
            )
          else
            LayoutBuilder(
              builder: (context, constraints) {
                Widget buildPresentBtn() {
                  return AppButton(
                    label: 'Present',
                    icon: Icons.check_circle_outline_rounded,
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 11),
                    onPressed: () {
                      FeedbackService.instance.attendanceSuccess();
                      attendanceProvider.markAttendance(
                        resolvedClass: cls,
                        status: 'present',
                      );
                    },
                  );
                }

                Widget buildAbsentBtn() {
                  return AppButton(
                    label: 'Absent',
                    icon: Icons.close_rounded,
                    variant: AppButtonVariant.outline,
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 11),
                    onPressed: () {
                      FeedbackService.instance.attendanceAbsent();
                      attendanceProvider.markAttendance(
                        resolvedClass: cls,
                        status: 'absent',
                      );
                    },
                  );
                }

                Widget buildCancelBtn() {
                  return AppButton(
                    label: 'Cancel',
                    icon: Icons.event_busy_rounded,
                    variant: AppButtonVariant.outline,
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 11),
                    onPressed: () {
                      FeedbackService.instance.selection();
                      CancelClassSheet.show(
                        context,
                        resolvedClass: cls,
                        onConfirm: (reason) {
                          attendanceProvider.cancelClass(
                            resolvedClass: cls,
                            reason: reason,
                          );
                        },
                      );
                    },
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
    );
  }
}
