import 'package:intl/intl.dart';
import '../models/attendance_record.dart';
import '../../timetable/models/timetable_slot.dart';
import '../../timetable/models/timetable_exception.dart';
import '../../timetable/models/semester.dart';

enum AttendanceHeatmapLevel {
  noClasses, // 0 classes or non-class day
  veryLow,   // < 50%
  low,       // 50% - 74.9%
  medium,    // 75% - 84.9% (target range)
  high,      // 85% - 99.9%
  excellent, // 100%
}

class DailyAttendanceSummary {
  final String dateStr;
  final DateTime date;
  final int dayOfWeek; // 0 = Mon, 6 = Sun
  final String dayName;
  final int attendedClasses;
  final int absentClasses;
  final int cancelledClasses;
  final int totalClasses; // attended + absent (cancelled excluded)
  final double percentage; // 0.0 to 100.0
  final AttendanceHeatmapLevel level;
  final bool isToday;
  final bool isFuture;
  final bool isOutsideSemester;
  final List<AttendanceRecord> records;

  DailyAttendanceSummary({
    required this.dateStr,
    required this.date,
    required this.dayOfWeek,
    required this.dayName,
    required this.attendedClasses,
    required this.absentClasses,
    required this.cancelledClasses,
    required this.totalClasses,
    required this.percentage,
    required this.level,
    required this.isToday,
    required this.isFuture,
    required this.isOutsideSemester,
    required this.records,
  });

  String get label {
    if (isFuture) return 'Future date';
    if (isOutsideSemester) return 'Outside semester';
    if (totalClasses == 0) {
      if (cancelledClasses > 0) return 'All classes cancelled ($cancelledClasses)';
      return 'No classes scheduled';
    }
    return '${percentage.toStringAsFixed(0)}% attendance ($attendedClasses/$totalClasses attended)';
  }
}

class AttendanceHeatmapEngine {
  /// Computes daily attendance summaries for a date range (default last 90 or 120 days).
  static List<DailyAttendanceSummary> buildSeries({
    required List<AttendanceRecord> records,
    required List<TimetableSlot> slots,
    required List<TimetableException> exceptions,
    Semester? semester,
    DateTime? referenceDate,
    int totalDays = 90,
  }) {
    final ref = referenceDate ?? DateTime.now();
    final today = DateTime(ref.year, ref.month, ref.day);
    final todayStr = DateFormat('yyyy-MM-dd').format(today);

    // Group records by date string
    final recordsByDate = <String, List<AttendanceRecord>>{};
    for (final r in records) {
      recordsByDate.putIfAbsent(r.classDate, () => []).add(r);
    }

    // Group cancelled exceptions by date string
    final cancelledExceptionsByDate = <String, List<TimetableException>>{};
    for (final ex in exceptions) {
      if (ex.exceptionType == 'cancelled') {
        cancelledExceptionsByDate.putIfAbsent(ex.exceptionDate, () => []).add(ex);
      }
    }

    DateTime? semStart;
    DateTime? semEnd;
    if (semester != null) {
      try {
        semStart = DateTime.parse(semester.startDate);
        semEnd = DateTime.parse(semester.endDate);
      } catch (_) {}
    }

    final dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    final result = <DailyAttendanceSummary>[];

    for (int i = totalDays - 1; i >= 0; i--) {
      final d = today.subtract(Duration(days: i));
      final dateStr = DateFormat('yyyy-MM-dd').format(d);
      // Dart DateTime.weekday: Mon=1 ... Sun=7 -> map to 0=Mon ... 6=Sun
      final dayOfWeek = d.weekday - 1;
      final dayName = dayNames[dayOfWeek];
      final isToday = dateStr == todayStr;
      final isFuture = d.isAfter(today);

      final isOutsideSemester = (semStart != null && d.isBefore(semStart)) ||
          (semEnd != null && d.isAfter(semEnd));

      final dayRecords = recordsByDate[dateStr] ?? [];
      final cancelledExceptions = cancelledExceptionsByDate[dateStr] ?? [];

      int attended = 0;
      int absent = 0;
      int cancelled = cancelledExceptions.length;

      for (final r in dayRecords) {
        if (r.status == 'present') {
          attended++;
        } else if (r.status == 'absent') {
          absent++;
        } else if (r.status == 'cancelled') {
          cancelled++;
        }
      }

      final total = attended + absent;
      double percentage = 0.0;
      AttendanceHeatmapLevel level = AttendanceHeatmapLevel.noClasses;

      if (isFuture || isOutsideSemester) {
        level = AttendanceHeatmapLevel.noClasses;
      } else if (total > 0) {
        percentage = (attended / total) * 100;
        if (percentage >= 100.0) {
          level = AttendanceHeatmapLevel.excellent;
        } else if (percentage >= 85.0) {
          level = AttendanceHeatmapLevel.high;
        } else if (percentage >= 75.0) {
          level = AttendanceHeatmapLevel.medium;
        } else if (percentage >= 50.0) {
          level = AttendanceHeatmapLevel.low;
        } else {
          level = AttendanceHeatmapLevel.veryLow;
        }
      } else {
        level = AttendanceHeatmapLevel.noClasses;
      }

      result.add(
        DailyAttendanceSummary(
          dateStr: dateStr,
          date: d,
          dayOfWeek: dayOfWeek,
          dayName: dayName,
          attendedClasses: attended,
          absentClasses: absent,
          cancelledClasses: cancelled,
          totalClasses: total,
          percentage: percentage,
          level: level,
          isToday: isToday,
          isFuture: isFuture,
          isOutsideSemester: isOutsideSemester,
          records: dayRecords,
        ),
      );
    }

    return result;
  }
}
