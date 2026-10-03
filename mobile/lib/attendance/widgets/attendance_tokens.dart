import 'package:flutter/material.dart';
import '../../core/design_system/app_colors.dart';

/// Centralized design tokens for the StudySpace Attendance subsystem
/// aligned with the authoritative charcoal dark mode and web design language.
class AttendanceTokens {
  // --- Neutral Charcoal Dark Palette (Replacing legacy navy/obsidian) ---
  static const Color darkBackground = Color(0xFF18181B); // Canvas
  static const Color darkCard = Color(0xFF202023);       // Surface
  static const Color darkCardElevated = Color(0xFF27272A); // Raised
  static const Color darkBorder = Color(0xFF3F3F46);     // Subtle Border
  static const Color darkTextPrimary = Color(0xFFF4F4F5);// Primary text
  static const Color darkTextSecondary = Color(0xFFD4D4D8);// Secondary text
  static const Color darkTextMuted = Color(0xFFA1A1AA);  // Muted text

  // --- Light Palette ---
  static const Color lightBackground = Color(0xFFF8FAFC);
  static const Color lightCard = Color(0xFFFFFFFF);
  static const Color lightCardElevated = Color(0xFFF4F4F5);
  static const Color lightBorder = Color(0xFFE4E4E7);
  static const Color lightTextPrimary = Color(0xFF09090B);
  static const Color lightTextSecondary = Color(0xFF52525B);
  static const Color lightTextMuted = Color(0xFF71717A);

  // --- Primary Accent: StudySpace Purple ---
  static const Color primaryBlue = Color(0xFF7C3AED);      // Brand purple
  static const Color primaryPurple = Color(0xFF7C3AED);    // Brand purple
  static const Color primaryBlueHover = Color(0xFF6D28D9); // Purple 700
  static const Color primaryBlueSubtle = Color(0xFF2D1E4A);// Soft neutral purple tint

  // --- Semantic Attendance Status Colors ---
  static const Color present = Color(0xFF10B981);         // Emerald green
  static const Color presentBgDark = Color(0xFF064E3B);
  static const Color presentBgLight = Color(0xFFECFDF5);

  static const Color absent = Color(0xFFEF4444);          // Coral red
  static const Color absentBgDark = Color(0xFF7F1D1D);
  static const Color absentBgLight = Color(0xFFFEF2F2);

  static const Color cancelled = Color(0xFFF59E0B);       // Warm amber / neutral
  static const Color cancelledBgDark = Color(0xFF78350F);
  static const Color cancelledBgLight = Color(0xFFFFFBEB);

  static const Color notMarked = Color(0xFF71717A);       // Charcoal neutral
  static const Color notMarkedBgDark = Color(0xFF27272A);
  static const Color notMarkedBgLight = Color(0xFFF4F4F5);

  // --- Radii ---
  static const double cardRadiusVal = 16.0;
  static const double controlRadiusVal = 10.0;
  static const double pillRadiusVal = 999.0;

  static const BorderRadius cardRadius = BorderRadius.all(Radius.circular(cardRadiusVal));
  static const BorderRadius controlRadius = BorderRadius.all(Radius.circular(controlRadiusVal));
  static const BorderRadius pillRadius = BorderRadius.all(Radius.circular(pillRadiusVal));
  static const BorderRadius sheetRadius = BorderRadius.vertical(top: Radius.circular(20.0));

  // --- Dynamic Theme Helpers ---
  static bool isDark(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark;

  static Color bg(BuildContext context) => AppColors.canvas(context);

  static Color card(BuildContext context) => AppColors.surface(context);

  static Color elevated(BuildContext context) => AppColors.surfaceRaised(context);

  static Color border(BuildContext context) => AppColors.borderSubtle(context);

  static Color textPrimary(BuildContext context) => AppColors.textPrimary(context);

  static Color textSecondary(BuildContext context) => AppColors.textSecondary(context);

  static Color textMuted(BuildContext context) => AppColors.textMuted(context);

  static Color accent(BuildContext context) => AppColors.primary(context);

  // Status color resolver
  static Color statusColor(String? status, {double target = 75.0, double current = 0.0}) {
    if (status == 'present') return present;
    if (status == 'absent') return absent;
    if (status == 'cancelled') return cancelled;
    return notMarked;
  }
}
