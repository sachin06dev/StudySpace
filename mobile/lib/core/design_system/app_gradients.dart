import 'package:flutter/material.dart';
import 'app_colors.dart';

/// Systematic curated gradients for StudySpace features.
/// Web parity: Purple-to-pink primary brand identity.
/// Strictly neutral charcoal dark mode compatible (no navy / blue drift).
class AppGradients {
  AppGradients._();

  /// Authoritative StudySpace Brand Purple-to-Pink Gradient
  static LinearGradient brand(BuildContext context) {
    final isDark = AppColors.isDark(context);
    return LinearGradient(
      colors: isDark
          ? const [Color(0xFF8B5CF6), Color(0xFFF43F5E)]
          : const [Color(0xFF7C3AED), Color(0xFFEC4899)],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    );
  }

  /// Static primary brand gradient alias
  static const LinearGradient primary = LinearGradient(
    colors: [Color(0xFF7C3AED), Color(0xFFEC4899)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  /// Subtle hero card gradient
  static LinearGradient heroCard(BuildContext context) {
    final isDark = AppColors.isDark(context);
    return LinearGradient(
      colors: isDark
          ? [
              const Color(0xFF27272A),
              const Color(0xFF202023),
            ]
          : [
              const Color(0xFFFBF8FF),
              const Color(0xFFFFFFFF),
            ],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    );
  }

  /// Attendance card gradient (soft neutral purple accent)
  static LinearGradient attendance(BuildContext context) {
    final isDark = AppColors.isDark(context);
    return LinearGradient(
      colors: isDark
          ? [
              const Color(0xFF27272A),
              const Color(0xFF202023),
            ]
          : [
              const Color(0xFFFBF8FF),
              const Color(0xFFF4ECFF).withValues(alpha: 0.5),
            ],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    );
  }

  /// Study / focus card gradient (soft emerald / teal tone)
  static LinearGradient study(BuildContext context) {
    final isDark = AppColors.isDark(context);
    return LinearGradient(
      colors: isDark
          ? [
              const Color(0xFF27272A),
              const Color(0xFF202023),
            ]
          : [
              const Color(0xFFF8FAFC),
              const Color(0xFFECFDF5).withValues(alpha: 0.5),
            ],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    );
  }

  /// Pomodoro accent gradient (amber / rose tone)
  static const LinearGradient pomodoro = LinearGradient(
    colors: [Color(0xFFF43F5E), Color(0xFFFB923C)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  /// Analytics data card gradient (neutral dark hierarchy)
  static LinearGradient analytics(BuildContext context) {
    final isDark = AppColors.isDark(context);
    return LinearGradient(
      colors: isDark
          ? [
              const Color(0xFF27272A),
              const Color(0xFF202023),
            ]
          : [
              const Color(0xFFF8FAFC),
              const Color(0xFFF1F5F9),
            ],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    );
  }

  /// Hero mesh banner gradient
  static const LinearGradient heroMesh = LinearGradient(
    colors: [Color(0xFF7C3AED), Color(0xFF9333EA), Color(0xFFEC4899)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
