import 'package:flutter/material.dart';

/// Authoritative StudySpace design tokens matching the web design system.
/// Unifies 11-step Study purple, 3-tier surfaces, and WCAG AA status colors.
class AppColors {
  AppColors._();

  // 11-Step Authoritative StudySpace Purple Palette
  static const Color study50 = Color(0xFFFBF8FF);
  static const Color study100 = Color(0xFFF4ECFF);
  static const Color study200 = Color(0xFFE9D8FD);
  static const Color study300 = Color(0xFFD6B4FC);
  static const Color study400 = Color(0xFFBB82F7);
  static const Color study500 = Color(0xFF9F52F1);
  static const Color study600 = Color(0xFF7C3AED); // Primary Brand Purple
  static const Color study700 = Color(0xFF6D28D9); // Deep Brand Purple
  static const Color study800 = Color(0xFF5B21B6);
  static const Color study900 = Color(0xFF4C1D95);
  static const Color study950 = Color(0xFF2E1065);

  // Brand Primaries & Accents
  static const Color primaryLight = study600; // #7C3AED
  static const Color primaryDark = Color(0xFF8B5CF6); // #8B5CF6 (Vibrant on dark)
  static const Color accentPink = Color(0xFFEC4899); // Pink Accent
  static const Color accentPinkDark = Color(0xFFF43F5E);
  static const Color accentViolet = Color(0xFF8B5CF6);
  static const Color accentBlue = Color(0xFF3B82F6);

  // Light Mode Surfaces (3-Tier Hierarchy)
  static const Color canvasLight = Color(0xFFF8FAFC); // Slate 50
  static const Color surfaceLight = Color(0xFFFFFFFF); // Pure White
  static const Color surfaceRaisedLight = Color(0xFFF1F5F9); // Slate 100
  static const Color borderSubtleLight = Color(0xFFE2E8F0); // Slate 200
  static const Color borderStrongLight = Color(0xFFCBD5E1); // Slate 300
  static const Color textPrimaryLight = Color(0xFF0F172A); // Slate 900
  static const Color textSecondaryLight = Color(0xFF475569); // Slate 600
  static const Color textMutedLight = Color(0xFF64748B); // Slate 500

  // Dark Mode Surfaces (Refined Gray-Charcoal Hierarchy)
  static const Color canvasDark = Color(0xFF18181B); // Charcoal Canvas
  static const Color surfaceDark = Color(0xFF202023); // Elevated Charcoal Surface
  static const Color surfaceRaisedDark = Color(0xFF27272A); // Raised Surface
  static const Color surfaceElevatedDark = Color(0xFF2F2F33); // Elevated Surface / Panels
  static const Color borderSubtleDark = Color(0xFF3F3F46); // Subtle Border
  static const Color borderStrongDark = Color(0xFF52525B); // Strong Border
  static const Color textPrimaryDark = Color(0xFFF4F4F5); // Crisp Primary Text
  static const Color textSecondaryDark = Color(0xFFD4D4D8); // Clear Secondary Text
  static const Color textMutedDark = Color(0xFFA1A1AA); // Muted Text
  static const Color textDisabledDark = Color(0xFF71717A); // Disabled Text

  // Status & Risk Tokens (WCAG AA Compliant)
  // Safe / Present
  static const Color success = Color(0xFF10B981);
  static const Color successBgLight = Color(0xFFECFDF5);
  static const Color successBgDark = Color(0xFF064E3B);
  static const Color successTextLight = Color(0xFF047857);
  static const Color successTextDark = Color(0xFFA7F3D0);
  static const Color successBorderLight = Color(0xFFA7F3D0);
  static const Color successBorderDark = Color(0xFF047857);

  // Warning / Upcoming
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningBgLight = Color(0xFFFFFBEB);
  static const Color warningBgDark = Color(0xFF78350F);
  static const Color warningTextLight = Color(0xFF92400E);
  static const Color warningTextDark = Color(0xFFFDE68A);
  static const Color warningBorderLight = Color(0xFFFDE68A);
  static const Color warningBorderDark = Color(0xFFB45309);

  // Danger / Critical / Absent
  static const Color danger = Color(0xFFEF4444);
  static const Color dangerBgLight = Color(0xFFFEF2F2);
  static const Color dangerBgDark = Color(0xFF7F1D1D);
  static const Color dangerTextLight = Color(0xFF991B1B);
  static const Color dangerTextDark = Color(0xFFFECACA);
  static const Color dangerBorderLight = Color(0xFFFECACA);
  static const Color dangerBorderDark = Color(0xFFB91C1C);

  // Neutral / Cancelled
  static const Color cancelled = Color(0xFF64748B);
  static const Color cancelledBgLight = Color(0xFFF1F5F9);
  static const Color cancelledBgDark = Color(0xFF27272A);

  // Info
  static const Color info = Color(0xFF3B82F6);
  static const Color infoBgLight = Color(0xFFEFF6FF);
  static const Color infoBgDark = Color(0xFF1E3A8A);
  static const Color infoTextLight = Color(0xFF1D4ED8);
  static const Color infoTextDark = Color(0xFFBFDBFE);
  static const Color infoBorderLight = Color(0xFFBFDBFE);
  static const Color infoBorderDark = Color(0xFF1D4ED8);

  // Backward-Compatible Aliases
  static const Color backgroundLight = canvasLight;
  static const Color backgroundDark = canvasDark;
  static const Color cardLight = surfaceLight;
  static const Color cardDark = surfaceDark;
  static const Color surfaceMutedLight = surfaceRaisedLight;
  static const Color surfaceMutedDark = surfaceRaisedDark;
  static const Color borderLight = borderSubtleLight;
  static const Color borderDark = borderSubtleDark;

  static const Color brandPrimary = primaryLight;
  static const Color brandPrimaryLight = study500;
  static const Color error = danger;
  static const Color errorBgLight = dangerBgLight;
  static const Color errorBgDark = dangerBgDark;
  static const Color darkTextSecondary = textMutedDark;
  static const Color lightTextSecondary = textMutedLight;
  static const Color darkTextPrimary = textPrimaryDark;
  static const Color lightTextPrimary = textPrimaryLight;
  static const Color darkBorder = borderDark;
  static const Color lightBorder = borderLight;
  static const Color darkCard = cardDark;
  static const Color lightCard = cardLight;
  static const Color darkBackground = backgroundDark;
  static const Color lightBackground = backgroundLight;

  // Dynamic Theme Helpers
  static bool isDark(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark;

  static Color primary(BuildContext context) =>
      isDark(context) ? primaryDark : primaryLight;

  static Color card(BuildContext context) =>
      isDark(context) ? cardDark : cardLight;

  static Color surface(BuildContext context) =>
      isDark(context) ? surfaceDark : surfaceLight;

  static Color surfaceRaised(BuildContext context) =>
      isDark(context) ? surfaceRaisedDark : surfaceRaisedLight;

  static Color background(BuildContext context) =>
      isDark(context) ? backgroundDark : backgroundLight;

  static Color border(BuildContext context) =>
      isDark(context) ? borderDark : borderLight;

  static Color borderStrong(BuildContext context) =>
      isDark(context) ? borderStrongDark : borderStrongLight;

  static Color textPrimary(BuildContext context) =>
      isDark(context) ? textPrimaryDark : textPrimaryLight;

  static Color textSecondary(BuildContext context) =>
      isDark(context) ? textSecondaryDark : textSecondaryLight;

  static Color textMuted(BuildContext context) =>
      isDark(context) ? textMutedDark : textMutedLight;

  static Color surfaceMuted(BuildContext context) =>
      isDark(context) ? surfaceMutedDark : surfaceMutedLight;

  static Color canvas(BuildContext context) =>
      isDark(context) ? canvasDark : canvasLight;

  static Color borderSubtle(BuildContext context) =>
      isDark(context) ? borderSubtleDark : borderSubtleLight;

  static Color accentPinkColor(BuildContext context) =>
      isDark(context) ? accentPinkDark : accentPink;

  // Semantic Status Helpers
  static Color successText(BuildContext context) =>
      isDark(context) ? successTextDark : successTextLight;

  static Color successBg(BuildContext context) =>
      isDark(context) ? successBgDark : successBgLight;

  static Color successBorder(BuildContext context) =>
      isDark(context) ? successBorderDark : successBorderLight;

  static Color warningText(BuildContext context) =>
      isDark(context) ? warningTextDark : warningTextLight;

  static Color warningBg(BuildContext context) =>
      isDark(context) ? warningBgDark : warningBgLight;

  static Color warningBorder(BuildContext context) =>
      isDark(context) ? warningBorderDark : warningBorderLight;

  static Color dangerText(BuildContext context) =>
      isDark(context) ? dangerTextDark : dangerTextLight;

  static Color dangerBg(BuildContext context) =>
      isDark(context) ? dangerBgDark : dangerBgLight;

  static Color dangerBorder(BuildContext context) =>
      isDark(context) ? dangerBorderDark : dangerBorderLight;

  static Color surfaceElevated(BuildContext context) =>
      isDark(context) ? surfaceElevatedDark : surfaceRaisedLight;

  static Color textDisabled(BuildContext context) =>
      isDark(context) ? textDisabledDark : textMutedLight;

  static Color primarySubtle(BuildContext context) =>
      isDark(context) ? const Color(0xFF2D1E4A) : study100;

  static Color primarySubtleText(BuildContext context) =>
      isDark(context) ? study300 : study700;
}
