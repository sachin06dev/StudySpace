import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'attendance_tokens.dart';

/// Reusable SilverBook-inspired circular attendance ring indicator.
/// Used consistently across Dashboard, Subject list, Subject detail, and Hero cards.
class AttendanceRing extends StatelessWidget {
  final double? percentage;
  final double target;
  final double size;
  final double? strokeWidth;
  final bool showText;
  final double? fontSize;
  final Color? color;
  final bool useSemanticColor;

  const AttendanceRing({
    super.key,
    required this.percentage,
    this.target = 75.0,
    this.size = 40.0,
    this.strokeWidth,
    this.showText = true,
    this.fontSize,
    this.color,
    this.useSemanticColor = true,
  });

  const AttendanceRing.compact({
    super.key,
    required this.percentage,
    this.target = 75.0,
    this.size = 30.0,
    this.strokeWidth = 2.8,
    this.showText = true,
    this.fontSize = 8.5,
    this.color,
    this.useSemanticColor = true,
  });

  const AttendanceRing.hero({
    super.key,
    required this.percentage,
    this.target = 75.0,
    this.size = 76.0,
    this.strokeWidth = 6.0,
    this.showText = true,
    this.fontSize = 17.0,
    this.color,
    this.useSemanticColor = true,
  });

  Color _resolveColor(BuildContext context) {
    if (color != null) return color!;
    if (percentage == null) return AttendanceTokens.notMarked;

    if (!useSemanticColor) {
      return AttendanceTokens.primaryBlue;
    }

    final p = percentage!;
    if (p >= target) {
      return AttendanceTokens.primaryBlue; // Dominant StudySpace blue
    } else if (p >= target - 10.0) {
      return AttendanceTokens.cancelled;   // Warning amber
    } else {
      return AttendanceTokens.absent;      // Critical red
    }
  }

  @override
  Widget build(BuildContext context) {
    final ringColor = _resolveColor(context);
    final resolvedStroke = strokeWidth ?? (size * 0.09).clamp(2.5, 6.0);
    final resolvedFontSize = fontSize ?? (size * 0.28).clamp(8.0, 20.0);
    final isDark = AttendanceTokens.isDark(context);

    final trackColor = isDark
        ? AttendanceTokens.darkBorder.withValues(alpha: 0.8)
        : AttendanceTokens.lightBorder;

    final validPercentage = percentage != null ? percentage!.clamp(0.0, 100.0) : 0.0;
    final progress = validPercentage / 100.0;

    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          CustomPaint(
            size: Size(size, size),
            painter: _AttendanceRingPainter(
              progress: progress,
              color: ringColor,
              trackColor: trackColor,
              strokeWidth: resolvedStroke,
            ),
          ),
          if (showText)
            Text(
              percentage != null ? '${percentage!.toStringAsFixed(0)}%' : '—',
              style: TextStyle(
                fontSize: resolvedFontSize,
                fontWeight: FontWeight.w800,
                color: ringColor,
                letterSpacing: -0.3,
                height: 1.0,
              ),
            ),
        ],
      ),
    );
  }
}

class _AttendanceRingPainter extends CustomPainter {
  final double progress;
  final Color color;
  final Color trackColor;
  final double strokeWidth;

  _AttendanceRingPainter({
    required this.progress,
    required this.color,
    required this.trackColor,
    required this.strokeWidth,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.width - strokeWidth) / 2;

    // Background track
    final trackPaint = Paint()
      ..color = trackColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth;

    canvas.drawCircle(center, radius, trackPaint);

    if (progress <= 0.0) return;

    // Foreground sweep arc
    final progressPaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    // Start from top (-pi / 2)
    const startAngle = -math.pi / 2;
    final sweepAngle = 2 * math.pi * progress.clamp(0.0, 1.0);

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      startAngle,
      sweepAngle,
      false,
      progressPaint,
    );
  }

  @override
  bool shouldRepaint(covariant _AttendanceRingPainter oldDelegate) {
    return oldDelegate.progress != progress ||
        oldDelegate.color != color ||
        oldDelegate.trackColor != trackColor ||
        oldDelegate.strokeWidth != strokeWidth;
  }
}
