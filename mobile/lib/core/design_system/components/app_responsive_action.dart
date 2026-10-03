import 'package:flutter/material.dart';
import 'app_button.dart';
import 'app_icon_button.dart';

/// Responsive action control that adapts between icon+text on wide layouts
/// and icon-only (with accessible semantics & tooltip) on compact screens (<400dp).
/// Completely eliminates "+ Add ..." button overflow on mobile.
class AppResponsiveAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback? onPressed;
  final AppButtonVariant buttonVariant;
  final AppIconButtonVariant iconVariant;
  final double thresholdWidth;
  final bool forceCompact;

  const AppResponsiveAction({
    super.key,
    required this.icon,
    required this.label,
    required this.onPressed,
    this.buttonVariant = AppButtonVariant.primary,
    this.iconVariant = AppIconButtonVariant.primary,
    this.thresholdWidth = 380.0,
    this.forceCompact = false,
  });

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isCompact = forceCompact || screenWidth < thresholdWidth;

    if (isCompact) {
      return AppIconButton(
        icon: icon,
        tooltip: label,
        onPressed: onPressed,
        variant: iconVariant,
      );
    }

    return AppButton(
      label: label,
      icon: icon,
      onPressed: onPressed,
      variant: buttonVariant,
      isFullWidth: false,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
    );
  }
}
