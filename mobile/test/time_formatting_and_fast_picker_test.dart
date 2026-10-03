import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:studyspace/core/utils/time_formatter.dart';

void main() {
  group('TimeFormatter — 12-Hour AM/PM Presentation Tests', () {
    test('Correctly converts 24-hour strings to 12-hour AM/PM format', () {
      expect(TimeFormatter.format12Hour('09:00'), '9:00 AM');
      expect(TimeFormatter.format12Hour('09:00:00'), '9:00 AM');
      expect(TimeFormatter.format12Hour('09:05:00'), '9:05 AM');
      expect(TimeFormatter.format12Hour('12:00'), '12:00 PM');
      expect(TimeFormatter.format12Hour('12:30:00'), '12:30 PM');
      expect(TimeFormatter.format12Hour('14:45'), '2:45 PM');
      expect(TimeFormatter.format12Hour('16:20:00'), '4:20 PM');
      expect(TimeFormatter.format12Hour('23:55'), '11:55 PM');
      expect(TimeFormatter.format12Hour('00:00'), '12:00 AM');
      expect(TimeFormatter.format12Hour('00:15:00'), '12:15 AM');
    });

    test('Preserves already formatted 12-hour strings', () {
      expect(TimeFormatter.format12Hour('9:30 AM'), '9:30 AM');
      expect(TimeFormatter.format12Hour('4:15 pm'), '4:15 PM');
    });

    test('Formats TimeOfDay objects accurately', () {
      expect(
        TimeFormatter.format12Hour(const TimeOfDay(hour: 8, minute: 30)),
        '8:30 AM',
      );
      expect(
        TimeFormatter.format12Hour(const TimeOfDay(hour: 12, minute: 0)),
        '12:00 PM',
      );
      expect(
        TimeFormatter.format12Hour(const TimeOfDay(hour: 17, minute: 5)),
        '5:05 PM',
      );
      expect(
        TimeFormatter.format12Hour(const TimeOfDay(hour: 0, minute: 45)),
        '12:45 AM',
      );
    });

    test('formatRange cleanly formats start and end time pairs', () {
      expect(
        TimeFormatter.formatRange('09:00', '10:30'),
        '9:00 AM – 10:30 AM',
      );
      expect(
        TimeFormatter.formatRange('11:45:00', '13:15:00'),
        '11:45 AM – 1:15 PM',
      );
      expect(
        TimeFormatter.formatRange(
          const TimeOfDay(hour: 14, minute: 0),
          const TimeOfDay(hour: 15, minute: 50),
        ),
        '2:00 PM – 3:50 PM',
      );
    });

    test('parse24Hour accurately converts strings to TimeOfDay', () {
      final t1 = TimeFormatter.parse24Hour('09:15');
      expect(t1.hour, 9);
      expect(t1.minute, 15);

      final t2 = TimeFormatter.parse24Hour('16:45:00');
      expect(t2.hour, 16);
      expect(t2.minute, 45);

      final fallback = TimeFormatter.parse24Hour(null);
      expect(fallback.hour, 9);
      expect(fallback.minute, 0);
    });
  });
}
