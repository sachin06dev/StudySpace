import '../../attendance/services/class_resolution_service.dart';
import 'notification_service.dart';

class TimetableNotificationScheduler {
  static final NotificationService _notifications = NotificationService.instance;

  /// Reschedules notifications based on resolved classes for today
  static Future<void> scheduleDailyReminders({
    required List<ResolvedClass> todayClasses,
    bool enableClassReminders = true,
    bool enableAttendancePrompts = true,
    bool enableMorningSummary = true,
  }) async {
    await _notifications.cancelAllNotifications();

    final now = DateTime.now();

    // 1. Morning Summary (e.g., 7:30 AM)
    if (enableMorningSummary && todayClasses.isNotEmpty) {
      final morningTime = DateTime(now.year, now.month, now.day, 7, 30);
      if (morningTime.isAfter(now)) {
        final activeClasses = todayClasses.where((c) => !c.isCancelled).length;
        await _notifications.scheduleNotification(
          id: 1001,
          title: 'Good Morning!',
          body: activeClasses == 1
              ? 'You have 1 class scheduled today.'
              : 'You have $activeClasses classes scheduled today.',
          scheduledDate: morningTime,
        );
      }
    }

    // 2. Class Reminders & Attendance Prompts
    int idCounter = 2000;
    for (final c in todayClasses) {
      if (c.isCancelled) continue; // Do not notify for cancelled class

      final startParts = c.startTime.split(':');
      final endParts = c.endTime.split(':');
      if (startParts.length < 2 || endParts.length < 2) continue;

      final startHour = int.tryParse(startParts[0]) ?? 0;
      final startMin = int.tryParse(startParts[1]) ?? 0;
      final classStartTime = DateTime(now.year, now.month, now.day, startHour, startMin);

      final endHour = int.tryParse(endParts[0]) ?? 0;
      final endMin = int.tryParse(endParts[1]) ?? 0;
      final classEndTime = DateTime(now.year, now.month, now.day, endHour, endMin);

      // A. 10 minutes before class
      if (enableClassReminders) {
        final preClassTime = classStartTime.subtract(const Duration(minutes: 10));
        if (preClassTime.isAfter(now)) {
          final roomInfo = c.room != null && c.room!.isNotEmpty ? ' in ${c.room}' : '';
          await _notifications.scheduleNotification(
            id: idCounter++,
            title: '${c.subjectName} starting soon',
            body: '${c.subjectName} starts in 10 minutes$roomInfo.',
            scheduledDate: preClassTime,
            payload: c.id,
          );
        }
      }

      // B. After class: Did you attend?
      if (enableAttendancePrompts && c.attendanceStatus == null) {
        if (classEndTime.isAfter(now)) {
          await _notifications.scheduleNotification(
            id: idCounter++,
            title: 'Class ended: ${c.subjectName}',
            body: 'Did you attend? Tap to mark your attendance.',
            scheduledDate: classEndTime,
            payload: c.id,
          );
        }
      }
    }
  }
}
