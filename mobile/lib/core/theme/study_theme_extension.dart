import 'package:flutter/material.dart';
import '../design_system/app_colors.dart';

/// Systematic StudySpace ThemeExtension for type-safe semantic tokens.
/// Accessible via: Theme.of(context).extension<StudySpaceThemeExtension>()
@immutable
class StudySpaceThemeExtension extends ThemeExtension<StudySpaceThemeExtension> {
  final Color canvas;
  final Color surface;
  final Color surfaceRaised;
  final Color borderSubtle;
  final Color borderStrong;
  final Color accent;
  final Color accentHover;
  final Color accentMuted;
  final Color accentPink;
  final Color textPrimary;
  final Color textSecondary;
  final Color textMuted;
  final Color statusSafe;
  final Color statusWarning;
  final Color statusCritical;
  final Color statusCancelled;
  final Color statusInfo;
  final Color gradientStart;
  final Color gradientEnd;

  const StudySpaceThemeExtension({
    required this.canvas,
    required this.surface,
    required this.surfaceRaised,
    required this.borderSubtle,
    required this.borderStrong,
    required this.accent,
    required this.accentHover,
    required this.accentMuted,
    required this.accentPink,
    required this.textPrimary,
    required this.textSecondary,
    required this.textMuted,
    required this.statusSafe,
    required this.statusWarning,
    required this.statusCritical,
    required this.statusCancelled,
    required this.statusInfo,
    required this.gradientStart,
    required this.gradientEnd,
  });

  static const light = StudySpaceThemeExtension(
    canvas: AppColors.canvasLight,
    surface: AppColors.surfaceLight,
    surfaceRaised: AppColors.surfaceRaisedLight,
    borderSubtle: AppColors.borderSubtleLight,
    borderStrong: AppColors.borderStrongLight,
    accent: AppColors.study600,
    accentHover: AppColors.study700,
    accentMuted: AppColors.study100,
    accentPink: AppColors.accentPink,
    textPrimary: AppColors.textPrimaryLight,
    textSecondary: AppColors.textSecondaryLight,
    textMuted: AppColors.textMutedLight,
    statusSafe: AppColors.successTextLight,
    statusWarning: AppColors.warningTextLight,
    statusCritical: AppColors.dangerTextLight,
    statusCancelled: AppColors.cancelled,
    statusInfo: AppColors.infoTextLight,
    gradientStart: AppColors.study600,
    gradientEnd: AppColors.accentPink,
  );

  static const dark = StudySpaceThemeExtension(
    canvas: AppColors.canvasDark,
    surface: AppColors.surfaceDark,
    surfaceRaised: AppColors.surfaceRaisedDark,
    borderSubtle: AppColors.borderSubtleDark,
    borderStrong: AppColors.borderStrongDark,
    accent: AppColors.primaryDark,
    accentHover: AppColors.study400,
    accentMuted: Color(0xFF2D1E4A),
    accentPink: AppColors.accentPinkDark,
    textPrimary: AppColors.textPrimaryDark,
    textSecondary: AppColors.textSecondaryDark,
    textMuted: AppColors.textMutedDark,
    statusSafe: AppColors.successTextDark,
    statusWarning: AppColors.warningTextDark,
    statusCritical: AppColors.dangerTextDark,
    statusCancelled: AppColors.cancelled,
    statusInfo: AppColors.infoTextDark,
    gradientStart: AppColors.primaryDark,
    gradientEnd: AppColors.accentPinkDark,
  );

  @override
  StudySpaceThemeExtension copyWith({
    Color? canvas,
    Color? surface,
    Color? surfaceRaised,
    Color? borderSubtle,
    Color? borderStrong,
    Color? accent,
    Color? accentHover,
    Color? accentMuted,
    Color? accentPink,
    Color? textPrimary,
    Color? textSecondary,
    Color? textMuted,
    Color? statusSafe,
    Color? statusWarning,
    Color? statusCritical,
    Color? statusCancelled,
    Color? statusInfo,
    Color? gradientStart,
    Color? gradientEnd,
  }) {
    return StudySpaceThemeExtension(
      canvas: canvas ?? this.canvas,
      surface: surface ?? this.surface,
      surfaceRaised: surfaceRaised ?? this.surfaceRaised,
      borderSubtle: borderSubtle ?? this.borderSubtle,
      borderStrong: borderStrong ?? this.borderStrong,
      accent: accent ?? this.accent,
      accentHover: accentHover ?? this.accentHover,
      accentMuted: accentMuted ?? this.accentMuted,
      accentPink: accentPink ?? this.accentPink,
      textPrimary: textPrimary ?? this.textPrimary,
      textSecondary: textSecondary ?? this.textSecondary,
      textMuted: textMuted ?? this.textMuted,
      statusSafe: statusSafe ?? this.statusSafe,
      statusWarning: statusWarning ?? this.statusWarning,
      statusCritical: statusCritical ?? this.statusCritical,
      statusCancelled: statusCancelled ?? this.statusCancelled,
      statusInfo: statusInfo ?? this.statusInfo,
      gradientStart: gradientStart ?? this.gradientStart,
      gradientEnd: gradientEnd ?? this.gradientEnd,
    );
  }

  @override
  StudySpaceThemeExtension lerp(
    covariant ThemeExtension<StudySpaceThemeExtension>? other,
    double t,
  ) {
    if (other is! StudySpaceThemeExtension) return this;
    return StudySpaceThemeExtension(
      canvas: Color.lerp(canvas, other.canvas, t) ?? canvas,
      surface: Color.lerp(surface, other.surface, t) ?? surface,
      surfaceRaised: Color.lerp(surfaceRaised, other.surfaceRaised, t) ?? surfaceRaised,
      borderSubtle: Color.lerp(borderSubtle, other.borderSubtle, t) ?? borderSubtle,
      borderStrong: Color.lerp(borderStrong, other.borderStrong, t) ?? borderStrong,
      accent: Color.lerp(accent, other.accent, t) ?? accent,
      accentHover: Color.lerp(accentHover, other.accentHover, t) ?? accentHover,
      accentMuted: Color.lerp(accentMuted, other.accentMuted, t) ?? accentMuted,
      accentPink: Color.lerp(accentPink, other.accentPink, t) ?? accentPink,
      textPrimary: Color.lerp(textPrimary, other.textPrimary, t) ?? textPrimary,
      textSecondary: Color.lerp(textSecondary, other.textSecondary, t) ?? textSecondary,
      textMuted: Color.lerp(textMuted, other.textMuted, t) ?? textMuted,
      statusSafe: Color.lerp(statusSafe, other.statusSafe, t) ?? statusSafe,
      statusWarning: Color.lerp(statusWarning, other.statusWarning, t) ?? statusWarning,
      statusCritical: Color.lerp(statusCritical, other.statusCritical, t) ?? statusCritical,
      statusCancelled: Color.lerp(statusCancelled, other.statusCancelled, t) ?? statusCancelled,
      statusInfo: Color.lerp(statusInfo, other.statusInfo, t) ?? statusInfo,
      gradientStart: Color.lerp(gradientStart, other.gradientStart, t) ?? gradientStart,
      gradientEnd: Color.lerp(gradientEnd, other.gradientEnd, t) ?? gradientEnd,
    );
  }
}
