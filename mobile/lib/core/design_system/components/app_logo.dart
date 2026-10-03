import 'package:flutter/material.dart';

enum AppLogoVariant {
  /// Logo mark + horizontal typography
  horizontal,

  /// Isolated shield/mark
  mark,

  /// Full square logo
  full,
}

/// Official StudySpace branded logo widget.
/// Guarantees aspect-ratio preservation and BoxFit.contain to eliminate clipping/zooming.
class AppLogo extends StatelessWidget {
  final double? height;
  final double? width;
  final AppLogoVariant variant;
  final BoxFit fit;

  const AppLogo({
    super.key,
    this.height = 36,
    this.width,
    this.variant = AppLogoVariant.horizontal,
    this.fit = BoxFit.contain,
  });

  const AppLogo.mark({
    super.key,
    this.height = 40,
    this.width = 40,
    this.fit = BoxFit.contain,
  }) : variant = AppLogoVariant.mark;

  const AppLogo.horizontal({
    super.key,
    this.height = 36,
    this.width,
    this.fit = BoxFit.contain,
  }) : variant = AppLogoVariant.horizontal;

  const AppLogo.full({
    super.key,
    this.height = 64,
    this.width,
    this.fit = BoxFit.contain,
  }) : variant = AppLogoVariant.full;

  String get _assetPath {
    switch (variant) {
      case AppLogoVariant.mark:
        return 'assets/branding/studyspace-mark.png';
      case AppLogoVariant.full:
        return 'assets/branding/studyspace-logo.png';
      case AppLogoVariant.horizontal:
        return 'assets/branding/studyspace-logo-horizontal.png';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Image.asset(
      _assetPath,
      height: height,
      width: width,
      fit: fit,
      errorBuilder: (context, error, stackTrace) {
        // High-fidelity fallback badge preserving StudySpace visual language
        return Container(
          height: height ?? 36,
          width: width ?? (variant == AppLogoVariant.horizontal ? 130 : 36),
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
            ),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.school_rounded, color: Colors.white, size: 18),
              if (variant == AppLogoVariant.horizontal) ...[
                const SizedBox(width: 6),
                const Text(
                  'StudySpace',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                    fontSize: 14,
                    letterSpacing: -0.5,
                  ),
                ),
              ],
            ],
          ),
        );
      },
    );
  }
}
