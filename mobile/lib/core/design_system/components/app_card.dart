import 'package:flutter/material.dart';
import '../app_colors.dart';
import '../app_radii.dart';

class AppCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;
  final Color? backgroundColor;
  final Color? borderColor;
  final double borderWidth;
  final BorderRadius? borderRadius;

  const AppCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.onTap,
    this.backgroundColor,
    this.borderColor,
    this.borderWidth = 1.0,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveBg = backgroundColor ?? AppColors.card(context);
    final effectiveBorder = borderColor ?? AppColors.border(context);
    final effectiveRadius = borderRadius ?? AppRadii.lg;

    final shape = RoundedRectangleBorder(
      borderRadius: effectiveRadius,
      side: BorderSide(color: effectiveBorder, width: borderWidth),
    );

    if (onTap != null) {
      return Material(
        color: effectiveBg,
        shape: shape,
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          child: Padding(
            padding: padding,
            child: child,
          ),
        ),
      );
    }

    return Material(
      color: effectiveBg,
      shape: shape,
      clipBehavior: Clip.antiAlias,
      child: Padding(
        padding: padding,
        child: child,
      ),
    );
  }
}
