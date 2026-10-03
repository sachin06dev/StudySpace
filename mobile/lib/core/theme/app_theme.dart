import 'package:flutter/material.dart';
import '../design_system/app_colors.dart';
import 'study_theme_extension.dart';

class AppTheme {
  AppTheme._();

  // Brand Colors
  static const Color primaryLight = AppColors.primaryLight;
  static const Color primaryDark = AppColors.primaryDark;
  static const Color accentViolet = AppColors.accentViolet;

  // Surface & Background - Light Mode
  static const Color backgroundLight = AppColors.backgroundLight;
  static const Color surfaceCardLight = AppColors.cardLight;
  static const Color surfaceMutedLight = AppColors.surfaceMutedLight;
  static const Color borderLight = AppColors.borderLight;
  static const Color textPrimaryLight = AppColors.textPrimaryLight;
  static const Color textMutedLight = AppColors.textMutedLight;

  // Surface & Background - Dark Mode
  static const Color backgroundDark = AppColors.backgroundDark;
  static const Color surfaceCardDark = AppColors.cardDark;
  static const Color surfaceMutedDark = AppColors.surfaceMutedDark;
  static const Color borderDark = AppColors.borderDark;
  static const Color textPrimaryDark = AppColors.textPrimaryDark;
  static const Color textMutedDark = AppColors.textMutedDark;

  // Attendance Risk Colors
  static const Color statusSafe = AppColors.success;
  static const Color statusSafeBgLight = AppColors.successBgLight;
  static const Color statusSafeBgDark = AppColors.successBgDark;

  static const Color statusWarning = AppColors.warning;
  static const Color statusWarningBgLight = AppColors.warningBgLight;
  static const Color statusWarningBgDark = AppColors.warningBgDark;

  static const Color statusCritical = AppColors.danger;
  static const Color statusCriticalBgLight = AppColors.dangerBgLight;
  static const Color statusCriticalBgDark = AppColors.dangerBgDark;

  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    primaryColor: primaryLight,
    scaffoldBackgroundColor: backgroundLight,
    extensions: const [StudySpaceThemeExtension.light],
    colorScheme: const ColorScheme.light(
      primary: primaryLight,
      onPrimary: Colors.white,
      secondary: accentViolet,
      onSecondary: Colors.white,
      surface: surfaceCardLight,
      onSurface: textPrimaryLight,
      surfaceContainerHighest: surfaceMutedLight,
      outline: borderLight,
      outlineVariant: borderLight,
      error: statusCritical,
      onError: Colors.white,
    ),
    cardTheme: CardThemeData(
      color: surfaceCardLight,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: borderLight, width: 1),
      ),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: backgroundLight,
      foregroundColor: textPrimaryLight,
      elevation: 0,
      scrolledUnderElevation: 0,
      surfaceTintColor: Colors.transparent,
      centerTitle: false,
      titleTextStyle: TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.bold,
        color: textPrimaryLight,
      ),
      iconTheme: IconThemeData(color: textPrimaryLight),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: surfaceCardLight,
      indicatorColor: AppColors.study100,
      elevation: 0,
      surfaceTintColor: Colors.transparent,
      labelTextStyle: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: primaryLight,
          );
        }
        return const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: textMutedLight,
        );
      }),
      iconTheme: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return const IconThemeData(color: primaryLight, size: 22);
        }
        return const IconThemeData(color: textMutedLight, size: 22);
      }),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: surfaceCardLight,
      selectedItemColor: primaryLight,
      unselectedItemColor: textMutedLight,
      elevation: 8,
      type: BottomNavigationBarType.fixed,
    ),
    tabBarTheme: TabBarThemeData(
      indicatorColor: primaryLight,
      labelColor: primaryLight,
      unselectedLabelColor: textMutedLight,
      dividerColor: borderLight,
      labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
      unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13),
    ),
    dividerTheme: const DividerThemeData(
      color: borderLight,
      thickness: 1,
      space: 1,
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: surfaceMutedLight,
      labelStyle: const TextStyle(color: textMutedLight, fontSize: 14),
      hintStyle: const TextStyle(color: textMutedLight, fontSize: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: borderLight),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: borderLight),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: primaryLight, width: 1.8),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primaryLight,
        foregroundColor: Colors.white,
        elevation: 0,
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: primaryLight,
        side: const BorderSide(color: borderLight),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: primaryLight,
        textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
      ),
    ),
    dialogTheme: DialogThemeData(
      backgroundColor: surfaceCardLight,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      titleTextStyle: const TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.bold,
        color: textPrimaryLight,
      ),
      contentTextStyle: const TextStyle(fontSize: 14, color: textMutedLight),
    ),
    bottomSheetTheme: const BottomSheetThemeData(
      backgroundColor: surfaceCardLight,
      modalBackgroundColor: surfaceCardLight,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
    ),
    floatingActionButtonTheme: const FloatingActionButtonThemeData(
      backgroundColor: primaryLight,
      foregroundColor: Colors.white,
      elevation: 3,
      shape: CircleBorder(),
    ),
    progressIndicatorTheme: const ProgressIndicatorThemeData(
      color: primaryLight,
      linearTrackColor: surfaceMutedLight,
    ),
  );

  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    primaryColor: primaryDark,
    scaffoldBackgroundColor: backgroundDark,
    extensions: const [StudySpaceThemeExtension.dark],
    colorScheme: const ColorScheme.dark(
      primary: primaryDark,
      onPrimary: Colors.white,
      secondary: accentViolet,
      onSecondary: Colors.white,
      surface: surfaceCardDark,
      onSurface: textPrimaryDark,
      onSurfaceVariant: AppColors.textSecondaryDark,
      surfaceContainerHighest: surfaceMutedDark,
      surfaceContainer: surfaceCardDark,
      surfaceContainerLow: backgroundDark,
      outline: borderDark,
      outlineVariant: borderDark,
      error: statusCritical,
      onError: Colors.white,
    ),
    cardTheme: CardThemeData(
      color: surfaceCardDark,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: borderDark, width: 1),
      ),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: backgroundDark,
      foregroundColor: textPrimaryDark,
      elevation: 0,
      scrolledUnderElevation: 0,
      surfaceTintColor: Colors.transparent,
      centerTitle: false,
      titleTextStyle: TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.bold,
        color: textPrimaryDark,
      ),
      iconTheme: IconThemeData(color: textPrimaryDark),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: surfaceCardDark,
      indicatorColor: primaryDark.withValues(alpha: 0.18),
      elevation: 0,
      surfaceTintColor: Colors.transparent,
      labelTextStyle: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: primaryDark,
          );
        }
        return const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: textMutedDark,
        );
      }),
      iconTheme: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return const IconThemeData(color: primaryDark, size: 22);
        }
        return const IconThemeData(color: textMutedDark, size: 22);
      }),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: surfaceCardDark,
      selectedItemColor: primaryDark,
      unselectedItemColor: textMutedDark,
      elevation: 8,
      type: BottomNavigationBarType.fixed,
    ),
    tabBarTheme: TabBarThemeData(
      indicatorColor: primaryDark,
      labelColor: primaryDark,
      unselectedLabelColor: textMutedDark,
      dividerColor: borderDark,
      labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
      unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13),
    ),
    dividerTheme: const DividerThemeData(
      color: borderDark,
      thickness: 1,
      space: 1,
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: surfaceMutedDark,
      labelStyle: const TextStyle(color: textMutedDark, fontSize: 14),
      hintStyle: const TextStyle(color: textMutedDark, fontSize: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: borderDark),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: borderDark),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: primaryDark, width: 1.8),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primaryDark,
        foregroundColor: Colors.white,
        elevation: 0,
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: primaryDark,
        side: const BorderSide(color: borderDark),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: primaryDark,
        textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
      ),
    ),
    dialogTheme: DialogThemeData(
      backgroundColor: surfaceCardDark,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: const BorderSide(color: borderDark, width: 1),
      ),
      titleTextStyle: const TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.bold,
        color: textPrimaryDark,
      ),
      contentTextStyle: const TextStyle(fontSize: 14, color: textMutedDark),
    ),
    bottomSheetTheme: const BottomSheetThemeData(
      backgroundColor: surfaceCardDark,
      modalBackgroundColor: surfaceCardDark,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        side: BorderSide(color: borderDark, width: 1),
      ),
    ),
    floatingActionButtonTheme: const FloatingActionButtonThemeData(
      backgroundColor: primaryDark,
      foregroundColor: Colors.white,
      elevation: 3,
      shape: CircleBorder(),
    ),
    progressIndicatorTheme: const ProgressIndicatorThemeData(
      color: primaryDark,
      linearTrackColor: surfaceMutedDark,
    ),
  );
}
