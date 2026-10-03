import 'dart:ui';
import 'package:flutter/material.dart';
import '../app_colors.dart';
import '../app_radii.dart';

/// Reusable glassmorphic surface mirroring the web's subtle backdrop blur cards and headers.
class AppGlassSurface extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final BorderRadius? borderRadius;
  final double blur;
  final double opacity;
  final Gradient? gradientTint;
  final Border? customBorder;
  final VoidCallback? onTap;
  final double? width;
  final double? height;

  const AppGlassSurface({
    super.key,
    required this.child,
    this.padding,
    this.margin,
    this.borderRadius,
    this.blur = 10.0,
    this.opacity = 0.75,
    this.gradientTint,
    this.customBorder,
    this.onTap,
    this.width,
    this.height,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final effectiveRadius = borderRadius ?? AppRadii.lg;

    final Color fallbackBg = isDark
        ? AppColors.surfaceRaisedDark.withValues(alpha: opacity)
        : AppColors.surfaceLight.withValues(alpha: opacity);

    final border = customBorder ??
        Border.all(
          color: (isDark ? Colors.white : Colors.black).withValues(alpha: 0.08),
          width: 1.0,
        );

    Widget content = ClipRRect(
      borderRadius: effectiveRadius,
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
        child: Container(
          width: width,
          height: height,
          decoration: BoxDecoration(
            color: fallbackBg,
            gradient: gradientTint,
            borderRadius: effectiveRadius,
            border: border,
          ),
          padding: padding,
          child: child,
        ),
      ),
    );

    if (margin != null) {
      content = Padding(padding: margin!, child: content);
    }

    if (onTap != null) {
      content = Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: effectiveRadius,
          onTap: onTap,
          child: content,
        ),
      );
    }

    return content;
  }
}
