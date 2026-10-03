import 'package:flutter/material.dart';
import '../app_colors.dart';
import '../app_radii.dart';
import '../app_typography.dart';

enum AppChipTone { safe, warning, danger, neutral, primary, success, error, info }
typedef AppChipVariant = AppChipTone;

class AppChip extends StatelessWidget {
  final String label;
  final AppChipTone tone;
  final AppChipVariant? variant;
  final IconData? icon;
  final VoidCallback? onTap;

  const AppChip({
    super.key,
    required this.label,
    this.tone = AppChipTone.neutral,
    this.variant,
    this.icon,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveTone = variant ?? tone;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    Color bg;
    Color fg;
    Color border;

    switch (effectiveTone) {
      case AppChipTone.safe:
      case AppChipTone.success:
        bg = isDark ? AppColors.successBgDark : AppColors.successBgLight;
        fg = isDark ? const Color(0xFFA7F3D0) : const Color(0xFF065F46);
        border = isDark ? const Color(0xFF047857) : const Color(0xFFA7F3D0);
        break;
      case AppChipTone.warning:
        bg = isDark ? AppColors.warningBgDark : AppColors.warningBgLight;
        fg = isDark ? const Color(0xFFFDE68A) : const Color(0xFF92400E);
        border = isDark ? const Color(0xFFB45309) : const Color(0xFFFDE68A);
        break;
      case AppChipTone.danger:
      case AppChipTone.error:
        bg = isDark ? AppColors.dangerBgDark : AppColors.dangerBgLight;
        fg = isDark ? const Color(0xFFFECACA) : const Color(0xFF991B1B);
        border = isDark ? const Color(0xFFB91C1C) : const Color(0xFFFECACA);
        break;
      case AppChipTone.primary:
        bg = isDark ? const Color(0xFF2D1E4A) : AppColors.study100;
        fg = isDark ? const Color(0xFFD6B4FC) : AppColors.study700;
        border = isDark ? const Color(0xFF6D28D9) : AppColors.study200;
        break;
      case AppChipTone.info:
        bg = isDark ? AppColors.infoBgDark : AppColors.infoBgLight;
        fg = isDark ? AppColors.infoTextDark : AppColors.infoTextLight;
        border = isDark ? AppColors.infoBorderDark : AppColors.infoBorderLight;
        break;
      case AppChipTone.neutral:
        bg = AppColors.surfaceMuted(context);
        fg = AppColors.textPrimary(context);
        border = AppColors.border(context);
        break;
    }

    final content = Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: AppRadii.pill,
        border: Border.all(color: border, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 12, color: fg),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: AppTypography.caption.copyWith(
              color: fg,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );

    if (onTap != null) {
      return GestureDetector(onTap: onTap, child: content);
    }
    return content;
  }
}
