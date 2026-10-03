import 'package:flutter/material.dart';

/// Authoritative StudySpace typography system mirroring the web hierarchy.
/// Primary: Plus Jakarta Sans
/// Technical & Data: JetBrains Mono with tabular numbers.
class AppTypography {
  AppTypography._();

  static const String fontSans = 'PlusJakartaSans';
  static const String fontMono = 'JetBrainsMono';

  // ──────────────── Core Specification Roles ────────────────

  static const TextStyle display = TextStyle(
    fontFamily: fontSans,
    fontSize: 28,
    fontWeight: FontWeight.w800,
    letterSpacing: -0.5,
    height: 1.2,
  );

  static const TextStyle headline = TextStyle(
    fontFamily: fontSans,
    fontSize: 22,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.3,
    height: 1.25,
  );

  static const TextStyle title = TextStyle(
    fontFamily: fontSans,
    fontSize: 18,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.2,
    height: 1.3,
  );

  static const TextStyle sectionTitle = TextStyle(
    fontFamily: fontSans,
    fontSize: 16,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.15,
    height: 1.35,
  );

  static const TextStyle body = TextStyle(
    fontFamily: fontSans,
    fontSize: 14,
    fontWeight: FontWeight.w400,
    height: 1.45,
  );

  static const TextStyle bodyMedium = TextStyle(
    fontFamily: fontSans,
    fontSize: 14,
    fontWeight: FontWeight.w500,
    height: 1.45,
  );

  static const TextStyle bodySmall = TextStyle(
    fontFamily: fontSans,
    fontSize: 12,
    fontWeight: FontWeight.w400,
    height: 1.4,
  );

  static const TextStyle label = TextStyle(
    fontFamily: fontSans,
    fontSize: 12,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.1,
    height: 1.35,
  );

  static const TextStyle caption = TextStyle(
    fontFamily: fontSans,
    fontSize: 11,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.2,
    height: 1.3,
  );

  static const TextStyle mono = TextStyle(
    fontFamily: fontMono,
    fontSize: 14,
    fontWeight: FontWeight.w600,
    fontFeatures: [FontFeature.tabularFigures()],
    height: 1.2,
  );

  static const TextStyle monoSmall = TextStyle(
    fontFamily: fontMono,
    fontSize: 12,
    fontWeight: FontWeight.w600,
    fontFeatures: [FontFeature.tabularFigures()],
    height: 1.2,
  );

  static const TextStyle dataStat = TextStyle(
    fontFamily: fontMono,
    fontSize: 20,
    fontWeight: FontWeight.w700,
    height: 1.1,
    fontFeatures: [FontFeature.tabularFigures()],
  );

  static const TextStyle button = TextStyle(
    fontFamily: fontSans,
    fontSize: 14,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.1,
  );

  static const TextStyle overline = TextStyle(
    fontFamily: fontSans,
    fontSize: 10,
    fontWeight: FontWeight.w800,
    letterSpacing: 1.0,
  );

  // ──────────────── Backward Compatible Aliases ────────────────
  static const TextStyle heading1 = headline;
  static const TextStyle heading2 = title;
  static const TextStyle heading3 = sectionTitle;
  static const TextStyle h1 = headline;
  static const TextStyle h2 = title;
  static const TextStyle h3 = sectionTitle;
  static const TextStyle headingMd = title;
  static const TextStyle headingSm = sectionTitle;
  static const TextStyle headingXs = TextStyle(
    fontFamily: fontSans,
    fontSize: 14,
    fontWeight: FontWeight.w600,
    letterSpacing: -0.1,
    height: 1.35,
  );
  static const TextStyle bodyBold = TextStyle(
    fontFamily: fontSans,
    fontSize: 14,
    fontWeight: FontWeight.bold,
    height: 1.45,
  );
  static const TextStyle bodySm = bodySmall;
  static const TextStyle bodyXs = caption;
  static const TextStyle dataMono = monoSmall;
}
