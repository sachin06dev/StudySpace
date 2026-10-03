import 'package:flutter/material.dart';
import '../app_colors.dart';
import '../app_radii.dart';

enum AppSurfaceLevel {
  surface,
  raised,
  subtle,
}

/// Core StudySpace surface component mirroring the web's clean charcoal container system.
class AppSurface extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final BorderRadius? borderRadius;
  final AppSurfaceLevel level;
  final VoidCallback? onTap;
  final Border? customBorder;
  final bool hasBorder;
  final double? width;
  final double? height;

  const AppSurface({
    super.key,
    required this.child,
    this.padding,
    this.margin,
    this.borderRadius,
    this.level = AppSurfaceLevel.surface,
    this.onTap,
    this.customBorder,
    this.hasBorder = true,
    this.width,
    this.height,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final Color bgColor = switch (level) {
      AppSurfaceLevel.surface => AppColors.surface(context),
      AppSurfaceLevel.raised => AppColors.surfaceRaised(context),
      AppSurfaceLevel.subtle => isDark
          ? AppColors.surfaceMutedDark
          : AppColors.surfaceMutedLight,
    };

    final effectiveRadius = borderRadius ?? AppRadii.lg;

    final border = hasBorder
        ? (customBorder ??
            Border.all(
              color: AppColors.borderSubtle(context),
              width: 1.0,
            ))
        : null;

    final decoration = BoxDecoration(
      color: bgColor,
      borderRadius: effectiveRadius,
      border: border,
    );

    Widget content = Container(
      width: width,
      height: height,
      margin: margin,
      decoration: decoration,
      child: ClipRRect(
        borderRadius: effectiveRadius,
        child: padding != null
            ? Padding(padding: padding!, child: child)
            : child,
      ),
    );

    if (onTap != null) {
      content = Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: effectiveRadius,
          onTap: onTap,
          splashColor: AppColors.primary(context).withOpacity(0.08),
          highlightColor: AppColors.primary(context).withOpacity(0.04),
          child: content,
        ),
      );
    }

    return content;
  }
}
