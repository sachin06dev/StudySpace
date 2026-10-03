import 'package:flutter/material.dart';
import '../app_colors.dart';

/// Clean subtle divider matching the web's border styling.
class AppDivider extends StatelessWidget {
  final double height;
  final double thickness;
  final EdgeInsetsGeometry? padding;
  final Color? color;

  const AppDivider({
    super.key,
    this.height = 1.0,
    this.thickness = 1.0,
    this.padding,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveColor = color ?? AppColors.borderSubtle(context);

    Widget divider = Divider(
      height: height,
      thickness: thickness,
      color: effectiveColor,
    );

    if (padding != null) {
      divider = Padding(padding: padding!, child: divider);
    }

    return divider;
  }
}
