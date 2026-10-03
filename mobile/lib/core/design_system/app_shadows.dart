import 'package:flutter/material.dart';
import 'app_colors.dart';

/// Elevation and shadow primitives tailored for StudySpace dark and light modes.
class AppShadows {
  AppShadows._();

  static List<BoxShadow> sm(BuildContext context) {
    final isDark = AppColors.isDark(context);
    return [
      BoxShadow(
        color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.05),
        blurRadius: 4,
        offset: const Offset(0, 1),
      ),
    ];
  }

  static List<BoxShadow> md(BuildContext context) {
    final isDark = AppColors.isDark(context);
    return [
      BoxShadow(
        color: Colors.black.withValues(alpha: isDark ? 0.4 : 0.08),
        blurRadius: 10,
        offset: const Offset(0, 4),
      ),
    ];
  }

  static List<BoxShadow> lg(BuildContext context) {
    final isDark = AppColors.isDark(context);
    return [
      BoxShadow(
        color: Colors.black.withValues(alpha: isDark ? 0.5 : 0.12),
        blurRadius: 20,
        offset: const Offset(0, 8),
      ),
    ];
  }

  static List<BoxShadow> glow(Color color, {double opacity = 0.25, double blur = 14}) {
    return [
      BoxShadow(
        color: color.withValues(alpha: opacity),
        blurRadius: blur,
        offset: const Offset(0, 4),
      ),
    ];
  }
}
