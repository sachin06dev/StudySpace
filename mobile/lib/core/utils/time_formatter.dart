import 'package:flutter/material.dart';

/// Central time formatting utility ensuring consistent 12-hour AM/PM presentation
/// throughout the StudySpace application while preserving ISO 24-hour storage.
class TimeFormatter {
  /// Converts any time representation (HH:mm, HH:mm:ss, TimeOfDay, DateTime)
  /// into clean 12-hour AM/PM format (e.g. "9:00 AM", "12:00 PM", "4:30 PM").
  static String format12Hour(dynamic input) {
    if (input == null) return '';

    int hour = 0;
    int minute = 0;

    if (input is TimeOfDay) {
      hour = input.hour;
      minute = input.minute;
    } else if (input is DateTime) {
      hour = input.hour;
      minute = input.minute;
    } else if (input is String) {
      final trimmed = input.trim();
      if (trimmed.isEmpty) return '';

      // Check if already in 12-hour format (e.g. "9:30 AM")
      if (RegExp(r'^\d{1,2}:\d{2}\s*(?:AM|PM)$', caseSensitive: false).hasMatch(trimmed)) {
        return trimmed.toUpperCase();
      }

      final parts = trimmed.split(':');
      if (parts.length >= 2) {
        hour = int.tryParse(parts[0]) ?? 0;
        minute = int.tryParse(parts[1]) ?? 0;
      } else {
        return trimmed;
      }
    } else {
      return input.toString();
    }

    final period = hour >= 12 ? 'PM' : 'AM';
    int h12 = hour % 12;
    if (h12 == 0) h12 = 12;

    final mStr = minute.toString().padLeft(2, '0');
    return '$h12:$mStr $period';
  }

  /// Formats a start and end time into a clean range: "9:00 AM – 10:30 AM"
  static String formatRange(dynamic start, dynamic end) {
    final s = format12Hour(start);
    final e = format12Hour(end);
    if (s.isEmpty && e.isEmpty) return '';
    if (s.isEmpty) return e;
    if (e.isEmpty) return s;
    return '$s – $e';
  }

  /// Parses a 24-hour time string ("HH:mm" or "HH:mm:ss") into TimeOfDay.
  static TimeOfDay parse24Hour(String? str, {TimeOfDay fallback = const TimeOfDay(hour: 9, minute: 0)}) {
    if (str == null || str.trim().isEmpty) return fallback;
    final parts = str.trim().split(':');
    if (parts.length >= 2) {
      final h = int.tryParse(parts[0]) ?? fallback.hour;
      final m = int.tryParse(parts[1]) ?? fallback.minute;
      return TimeOfDay(hour: h.clamp(0, 23), minute: m.clamp(0, 59));
    }
    return fallback;
  }

  /// Converts TimeOfDay into a 24-hour "HH:mm" string for storage / APIs.
  static String to24HourString(TimeOfDay t) {
    final hh = t.hour.toString().padLeft(2, '0');
    final mm = t.minute.toString().padLeft(2, '0');
    return '$hh:$mm';
  }

  /// Converts TimeOfDay into a 24-hour "HH:mm:ss" string for database slots.
  static String to24HourDbString(TimeOfDay t) {
    return '${to24HourString(t)}:00';
  }
}
