import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:studyspace/attendance/widgets/attendance_tokens.dart';
import 'package:studyspace/core/design_system/app_colors.dart';
import 'package:studyspace/core/design_system/app_gradients.dart';
import 'package:studyspace/core/theme/app_theme.dart';
import 'package:studyspace/core/theme/study_theme_extension.dart';

void main() {
  group('Dark Mode Contrast & Gray-Charcoal Refinement Tests', () {
    test('AppColors dark palette matches authoritative gray-charcoal tokens', () {
      expect(AppColors.canvasDark, equals(const Color(0xFF18181B)));
      expect(AppColors.surfaceDark, equals(const Color(0xFF202023)));
      expect(AppColors.surfaceRaisedDark, equals(const Color(0xFF27272A)));
      expect(AppColors.surfaceElevatedDark, equals(const Color(0xFF2F2F33)));
      expect(AppColors.borderSubtleDark, equals(const Color(0xFF3F3F46)));
      expect(AppColors.borderStrongDark, equals(const Color(0xFF52525B)));
      expect(AppColors.textPrimaryDark, equals(const Color(0xFFF4F4F5)));
      expect(AppColors.textSecondaryDark, equals(const Color(0xFFD4D4D8)));
      expect(AppColors.textMutedDark, equals(const Color(0xFFA1A1AA)));
      expect(AppColors.textDisabledDark, equals(const Color(0xFF71717A)));
    });

    test('Strict luminance step progression: Canvas < Surface < Raised < Elevated', () {
      // Ensure canvas is darker than surface, surface darker than raised, etc.
      expect(AppColors.canvasDark.computeLuminance(),
          lessThan(AppColors.surfaceDark.computeLuminance()));
      expect(AppColors.surfaceDark.computeLuminance(),
          lessThan(AppColors.surfaceRaisedDark.computeLuminance()));
      expect(AppColors.surfaceRaisedDark.computeLuminance(),
          lessThan(AppColors.surfaceElevatedDark.computeLuminance()));
      expect(AppColors.surfaceElevatedDark.computeLuminance(),
          lessThan(AppColors.borderSubtleDark.computeLuminance()));
    });

    test('Text contrast hierarchy is strictly ordered', () {
      expect(AppColors.textMutedDark.computeLuminance(),
          lessThan(AppColors.textSecondaryDark.computeLuminance()));
      expect(AppColors.textSecondaryDark.computeLuminance(),
          lessThan(AppColors.textPrimaryDark.computeLuminance()));
      expect(AppColors.textDisabledDark.computeLuminance(),
          lessThan(AppColors.textMutedDark.computeLuminance()));
    });

    test('AppTheme darkTheme binds to the new gray-charcoal tokens', () {
      final theme = AppTheme.darkTheme;
      expect(theme.scaffoldBackgroundColor, equals(const Color(0xFF18181B)));
      expect(theme.colorScheme.surface, equals(const Color(0xFF202023)));
      expect(theme.colorScheme.onSurface, equals(const Color(0xFFF4F4F5)));
      expect(theme.colorScheme.outline, equals(const Color(0xFF3F3F46)));
      expect(theme.cardTheme.color, equals(const Color(0xFF202023)));
      expect(theme.navigationBarTheme.backgroundColor, equals(const Color(0xFF202023)));
      expect(theme.dialogTheme.backgroundColor, equals(const Color(0xFF202023)));
      expect(theme.bottomSheetTheme.backgroundColor, equals(const Color(0xFF202023)));
    });

    test('AttendanceTokens dark palette aligns with gray-charcoal standard', () {
      expect(AttendanceTokens.darkBackground, equals(const Color(0xFF18181B)));
      expect(AttendanceTokens.darkCard, equals(const Color(0xFF202023)));
      expect(AttendanceTokens.darkCardElevated, equals(const Color(0xFF27272A)));
      expect(AttendanceTokens.darkBorder, equals(const Color(0xFF3F3F46)));
      expect(AttendanceTokens.darkTextPrimary, equals(const Color(0xFFF4F4F5)));
      expect(AttendanceTokens.darkTextSecondary, equals(const Color(0xFFD4D4D8)));
      expect(AttendanceTokens.darkTextMuted, equals(const Color(0xFFA1A1AA)));
      expect(AttendanceTokens.notMarkedBgDark, equals(const Color(0xFF27272A)));
    });

    test('StudySpaceThemeExtension.dark uses gray-charcoal hierarchy', () {
      const ext = StudySpaceThemeExtension.dark;
      expect(ext.canvas, equals(const Color(0xFF18181B)));
      expect(ext.surface, equals(const Color(0xFF202023)));
      expect(ext.surfaceRaised, equals(const Color(0xFF27272A)));
      expect(ext.borderSubtle, equals(const Color(0xFF3F3F46)));
      expect(ext.borderStrong, equals(const Color(0xFF52525B)));
      expect(ext.textPrimary, equals(const Color(0xFFF4F4F5)));
      expect(ext.textSecondary, equals(const Color(0xFFD4D4D8)));
      expect(ext.textMuted, equals(const Color(0xFFA1A1AA)));
    });

    test('Light mode tokens remain completely unchanged', () {
      expect(AppColors.canvasLight, equals(const Color(0xFFF8FAFC)));
      expect(AppColors.surfaceLight, equals(const Color(0xFFFFFFFF)));
      expect(AppColors.surfaceRaisedLight, equals(const Color(0xFFF1F5F9)));
      expect(AppColors.borderSubtleLight, equals(const Color(0xFFE2E8F0)));
      expect(AppColors.textPrimaryLight, equals(const Color(0xFF0F172A)));
      expect(AppColors.textSecondaryLight, equals(const Color(0xFF475569)));
      expect(AppColors.textMutedLight, equals(const Color(0xFF64748B)));

      final lightTheme = AppTheme.lightTheme;
      expect(lightTheme.scaffoldBackgroundColor, equals(const Color(0xFFF8FAFC)));
      expect(lightTheme.colorScheme.surface, equals(const Color(0xFFFFFFFF)));
    });

    testWidgets('Dynamic helpers resolve correct dark palette in dark context',
        (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: ThemeMode.dark,
          home: Builder(
            builder: (context) {
              expect(AppColors.isDark(context), isTrue);
              expect(AppColors.canvas(context), equals(const Color(0xFF18181B)));
              expect(AppColors.surface(context), equals(const Color(0xFF202023)));
              expect(AppColors.surfaceRaised(context), equals(const Color(0xFF27272A)));
              expect(AppColors.surfaceElevated(context), equals(const Color(0xFF2F2F33)));
              expect(AppColors.borderSubtle(context), equals(const Color(0xFF3F3F46)));
              expect(AppColors.textPrimary(context), equals(const Color(0xFFF4F4F5)));
              expect(AppColors.textSecondary(context), equals(const Color(0xFFD4D4D8)));
              expect(AppColors.textMuted(context), equals(const Color(0xFFA1A1AA)));
              expect(AppColors.textDisabled(context), equals(const Color(0xFF71717A)));

              final heroGrad = AppGradients.heroCard(context);
              expect(heroGrad.colors.first, equals(const Color(0xFF27272A)));
              expect(heroGrad.colors.last, equals(const Color(0xFF202023)));

              return const SizedBox();
            },
          ),
        ),
      );
    });
  });
}
