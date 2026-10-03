import 'package:flutter/material.dart';
import '../../core/services/feedback_service.dart';
import 'attendance_tokens.dart';

/// SilverBook-inspired empty state for the Timetable Dashboard.
class AttendanceEmptyState extends StatelessWidget {
  final String title;
  final String message;
  final String actionLabel;
  final VoidCallback? onAction;
  final IconData icon;

  const AttendanceEmptyState({
    super.key,
    this.title = 'No classes today',
    this.message = 'Your schedule is clear.',
    this.actionLabel = 'Add class',
    this.onAction,
    this.icon = Icons.event_available_rounded,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = AttendanceTokens.isDark(context);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
      decoration: BoxDecoration(
        color: AttendanceTokens.card(context),
        borderRadius: AttendanceTokens.cardRadius,
        border: Border.all(color: AttendanceTokens.border(context)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Graphic container
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isDark
                  ? AttendanceTokens.primaryBlue.withValues(alpha: 0.12)
                  : const Color(0xFFEFF6FF),
              border: Border.all(
                color: AttendanceTokens.primaryBlue.withValues(alpha: 0.25),
                width: 1.5,
              ),
            ),
            child: Icon(
              icon,
              size: 34,
              color: AttendanceTokens.primaryBlue,
            ),
          ),

          const SizedBox(height: 18),

          // Title
          Text(
            title,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.3,
              color: AttendanceTokens.textPrimary(context),
            ),
          ),

          const SizedBox(height: 6),

          // Subtitle
          Text(
            message,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: AttendanceTokens.textMuted(context),
              height: 1.4,
            ),
          ),

          if (onAction != null) ...[
            const SizedBox(height: 22),
            ElevatedButton.icon(
              onPressed: () {
                FeedbackService.instance.selection();
                onAction!();
              },
              icon: const Icon(Icons.add_rounded, size: 18),
              label: Text(
                actionLabel,
                style: const TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 13,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: AttendanceTokens.primaryBlue,
                foregroundColor: Colors.white,
                elevation: 0,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 11),
                shape: const RoundedRectangleBorder(
                  borderRadius: AttendanceTokens.pillRadius,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
