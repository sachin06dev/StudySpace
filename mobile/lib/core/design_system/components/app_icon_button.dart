import 'package:flutter/material.dart';
import '../app_colors.dart';
import '../app_radii.dart';

enum AppIconButtonVariant {
  primary,
  secondary,
  outline,
  ghost,
}

/// Accessible icon button adhering to StudySpace 44dp+ touch targets and semantic styling.
class AppIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onPressed;
  final String tooltip;
  final AppIconButtonVariant variant;
  final double size;
  final double iconSize;
  final Color? color;
  final Color? backgroundColor;

  const AppIconButton({
    super.key,
    required this.icon,
    required this.tooltip,
    this.onPressed,
    this.variant = AppIconButtonVariant.secondary,
    this.size = 40.0,
    this.iconSize = 18.0,
    this.color,
    this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    Color fg;
    Color bg;
    Border? border;

    switch (variant) {
      case AppIconButtonVariant.primary:
        fg = Colors.white;
        bg = AppColors.primary(context);
        break;
      case AppIconButtonVariant.secondary:
        fg = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
        bg = isDark ? AppColors.surfaceRaisedDark : AppColors.surfaceRaisedLight;
        border = Border.all(color: AppColors.borderSubtle(context), width: 1.0);
        break;
      case AppIconButtonVariant.outline:
        fg = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
        bg = Colors.transparent;
        border = Border.all(color: AppColors.borderSubtle(context), width: 1.0);
        break;
      case AppIconButtonVariant.ghost:
        fg = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
        bg = Colors.transparent;
        break;
    }

    if (color != null) fg = color!;
    if (backgroundColor != null) bg = backgroundColor!;

    final radius = AppRadii.md;

    return Semantics(
      button: true,
      label: tooltip,
      enabled: onPressed != null,
      child: Tooltip(
        message: tooltip,
        child: Material(
          color: bg,
          borderRadius: radius,
          child: InkWell(
            borderRadius: radius,
            onTap: onPressed,
            child: Container(
              constraints: const BoxConstraints(minWidth: 44.0, minHeight: 44.0),
              width: size < 44.0 ? 44.0 : size,
              height: size < 44.0 ? 44.0 : size,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                borderRadius: radius,
                border: border,
              ),
              child: Icon(
                icon,
                size: iconSize,
                color: onPressed == null ? fg.withOpacity(0.4) : fg,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
