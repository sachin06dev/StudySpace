import '../../timetable/models/semester.dart';
import '../../timetable/models/subject.dart';
import '../../timetable/models/timetable_slot.dart';
import '../../timetable/models/timetable_exception.dart';
import '../models/attendance_record.dart';

class ResolvedClass {
  final String id;
  final String? slotId;
  final String subjectId;
  final String subjectName;
  final String? subjectCode;
  final String? faculty;
  final String? room;
  final String classType;
  final String startTime;
  final String endTime;
  final bool isExtra;
  final bool isRescheduled;
  final bool isCancelled;
  final String? cancellationReason;
  final String? attendanceStatus; // 'present', 'absent', 'cancelled', or null
  final String? attendanceRecordId;

  ResolvedClass({
    required this.id,
    this.slotId,
    required this.subjectId,
    required this.subjectName,
    this.subjectCode,
    this.faculty,
    this.room,
    required this.classType,
    required this.startTime,
    required this.endTime,
    required this.isExtra,
    required this.isRescheduled,
    required this.isCancelled,
    this.cancellationReason,
    this.attendanceStatus,
    this.attendanceRecordId,
  });

  ResolvedClass copyWithStatus(String? newStatus, String? newRecordId) {
    return ResolvedClass(
      id: id,
      slotId: slotId,
      subjectId: subjectId,
      subjectName: subjectName,
      subjectCode: subjectCode,
      faculty: faculty,
      room: room,
      classType: classType,
      startTime: startTime,
      endTime: endTime,
      isExtra: isExtra,
      isRescheduled: isRescheduled,
      isCancelled: isCancelled,
      cancellationReason: cancellationReason,
      attendanceStatus: newStatus,
      attendanceRecordId: newRecordId ?? attendanceRecordId,
    );
  }
}

class ClassResolutionService {
  /// Parses YYYY-MM-DD to ISO 8601 day of week:
  /// 0 = Monday ... 6 = Sunday
  static int getIsoDayOfWeek(String dateString) {
    final parts = dateString.split('-');
    final y = int.parse(parts[0]);
    final m = int.parse(parts[1]);
    final d = int.parse(parts[2]);

    final date = DateTime.utc(y, m, d);
    final weekday = date.weekday; // In Dart DateTime: 1 = Monday, ..., 7 = Sunday
    return weekday - 1; // 0 = Mon, ..., 6 = Sun
  }

  /// Normalizes time string to "HH:mm" format.
  static String formatTimeDisplay(String timeStr) {
    if (timeStr.isEmpty) return '';
    final parts = timeStr.split(':');
    if (parts.length >= 2) {
      final hours = parts[0].padLeft(2, '0');
      final minutes = parts[1].padLeft(2, '0');
      return '$hours:$minutes';
    }
    return timeStr;
  }

  /// Resolves all classes for a specific calendar date (YYYY-MM-DD).
  static List<ResolvedClass> resolveClassesForDate({
    required String date,
    required Semester? semester,
    required List<TimetableSlot> slots,
    required List<Subject> subjects,
    required List<TimetableException> exceptions,
    required List<AttendanceRecord> records,
  }) {
    if (semester == null) return [];

    // Outside semester boundary => no classes
    if (date.compareTo(semester.startDate) < 0 || date.compareTo(semester.endDate) > 0) {
      return [];
    }

    final subjectMap = <String, Subject>{};
    for (final s in subjects) {
      subjectMap[s.id] = s;
    }

    final isoDay = getIsoDayOfWeek(date);
    final resolved = <ResolvedClass>[];

    final cancelledSlotIds = <String>{};
    final rescheduledAwaySlotIds = <String>{};
    final rescheduledToToday = <TimetableException>[];
    final extraClassesToday = <TimetableException>[];

    for (final ex in exceptions) {
      if (ex.exceptionType == 'cancelled' && ex.exceptionDate == date && ex.timetableSlotId != null) {
        cancelledSlotIds.add(ex.timetableSlotId!);
      } else if (ex.exceptionType == 'rescheduled' &&
          ex.exceptionDate == date &&
          ex.timetableSlotId != null) {
        rescheduledAwaySlotIds.add(ex.timetableSlotId!);
      } else if (ex.exceptionType == 'rescheduled' && ex.replacementDate == date) {
        rescheduledToToday.add(ex);
      } else if (ex.exceptionType == 'extra' && ex.exceptionDate == date) {
        extraClassesToday.add(ex);
      }
    }

    // 1. Recurring weekly slots
    final todaySlots = slots.where((s) => s.dayOfWeek == isoDay).toList();

    for (final slot in todaySlots) {
      if (rescheduledAwaySlotIds.contains(slot.id)) {
        continue; // Moved to another day
      }

      final isCancelled = cancelledSlotIds.contains(slot.id);
      final subject = subjectMap[slot.subjectId];
      final subjectName = subject?.name ?? 'Unknown Subject';
      final subjectCode = subject?.code;
      final faculty = slot.facultyOverride ?? subject?.faculty;
      final room = slot.roomOverride ?? subject?.defaultRoom;
      final classType = slot.classTypeOverride ?? subject?.classType ?? 'theory';

      // Find matching attendance record
      AttendanceRecord? matchedRecord;
      for (final r in records) {
        if (r.timetableSlotId == slot.id ||
            (r.subjectId == slot.subjectId &&
                formatTimeDisplay(r.startTime) == formatTimeDisplay(slot.startTime))) {
          matchedRecord = r;
          break;
        }
      }

      resolved.add(
        ResolvedClass(
          id: 'slot_${slot.id}',
          slotId: slot.id,
          subjectId: slot.subjectId,
          subjectName: subjectName,
          subjectCode: subjectCode,
          faculty: faculty,
          room: room,
          classType: classType,
          startTime: formatTimeDisplay(slot.startTime),
          endTime: formatTimeDisplay(slot.endTime),
          isExtra: false,
          isRescheduled: false,
          isCancelled: isCancelled,
          cancellationReason: isCancelled ? 'Class cancelled' : null,
          attendanceStatus: matchedRecord?.status,
          attendanceRecordId: matchedRecord?.id,
        ),
      );
    }

    // 2. Rescheduled classes moving to today
    for (final ex in rescheduledToToday) {
      // Find original slot if any
      TimetableSlot? origSlot;
      if (ex.timetableSlotId != null) {
        for (final s in slots) {
          if (s.id == ex.timetableSlotId) {
            origSlot = s;
            break;
          }
        }
      }

      final subjectId = ex.subjectId ?? origSlot?.subjectId ?? '';
      final subject = subjectMap[subjectId];
      final subjectName = subject?.name ?? 'Rescheduled Class';
      final subjectCode = subject?.code;
      final faculty = ex.faculty ?? origSlot?.facultyOverride ?? subject?.faculty;
      final room = ex.room ?? origSlot?.roomOverride ?? subject?.defaultRoom;
      final classType = origSlot?.classTypeOverride ?? subject?.classType ?? 'theory';
      final startTime = formatTimeDisplay(ex.replacementStartTime ?? origSlot?.startTime ?? '00:00');
      final endTime = formatTimeDisplay(ex.replacementEndTime ?? origSlot?.endTime ?? '00:00');

      AttendanceRecord? matchedRecord;
      for (final r in records) {
        if (r.timetableSlotId == ex.timetableSlotId ||
            (r.subjectId == subjectId && formatTimeDisplay(r.startTime) == startTime)) {
          matchedRecord = r;
          break;
        }
      }

      resolved.add(
        ResolvedClass(
          id: 'resched_${ex.id}',
          slotId: ex.timetableSlotId,
          subjectId: subjectId,
          subjectName: subjectName,
          subjectCode: subjectCode,
          faculty: faculty,
          room: room,
          classType: classType,
          startTime: startTime,
          endTime: endTime,
          isExtra: false,
          isRescheduled: true,
          isCancelled: false,
          attendanceStatus: matchedRecord?.status,
          attendanceRecordId: matchedRecord?.id,
        ),
      );
    }

    // 3. Extra classes occurring today
    for (final ex in extraClassesToday) {
      final subject = ex.subjectId != null ? subjectMap[ex.subjectId] : null;
      final subjectName = subject?.name ?? 'Extra Class';
      final subjectCode = subject?.code;
      final faculty = ex.faculty ?? subject?.faculty;
      final room = ex.room ?? subject?.defaultRoom;
      final classType = subject?.classType ?? 'theory';
      final startTime = formatTimeDisplay(ex.startTime ?? ex.replacementStartTime ?? '00:00');
      final endTime = formatTimeDisplay(ex.endTime ?? ex.replacementEndTime ?? '00:00');

      AttendanceRecord? matchedRecord;
      for (final r in records) {
        if (r.subjectId == ex.subjectId && formatTimeDisplay(r.startTime) == startTime) {
          matchedRecord = r;
          break;
        }
      }

      final isCancelled = ex.notes != null && ex.notes!.contains('[CANCELLED');
      String? cancellationReason;
      if (isCancelled) {
        final match = RegExp(r'\[CANCELLED:\s*([^\]]+)\]').firstMatch(ex.notes!);
        cancellationReason = match != null ? match.group(1) : 'Class cancelled';
      }

      resolved.add(
        ResolvedClass(
          id: 'extra_${ex.id}',
          slotId: null,
          subjectId: ex.subjectId ?? '',
          subjectName: subjectName,
          subjectCode: subjectCode,
          faculty: faculty,
          room: room,
          classType: classType,
          startTime: startTime,
          endTime: endTime,
          isExtra: true,
          isRescheduled: false,
          isCancelled: isCancelled,
          cancellationReason: cancellationReason,
          attendanceStatus: isCancelled ? 'cancelled' : matchedRecord?.status,
          attendanceRecordId: matchedRecord?.id,
        ),
      );
    }

    // Sort chronologically by startTime
    resolved.sort((a, b) => a.startTime.compareTo(b.startTime));

    return resolved;
  }
}
