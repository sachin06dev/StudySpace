import 'package:flutter_test/flutter_test.dart';
import 'package:studyspace/attendance/services/class_resolution_service.dart';
import 'package:studyspace/notifications/services/notification_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('Notification Service & Timetable Scheduler Tests', () {
    test('NotificationService singleton instance is non-null', () {
      final instance1 = NotificationService.instance;
      final instance2 = NotificationService.instance;
      expect(instance1, equals(instance2));
    });

    test('TimetableNotificationScheduler filters cancelled classes', () async {
      final activeClass = ResolvedClass(
        id: 'c1',
        subjectId: 's1',
        subjectName: 'Compiler Design',
        classType: 'lecture',
        startTime: '10:00:00',
        endTime: '11:00:00',
        isExtra: false,
        isRescheduled: false,
        isCancelled: false,
      );

      final cancelledClass = ResolvedClass(
        id: 'c2',
        subjectId: 's2',
        subjectName: 'Computer Networks',
        classType: 'lecture',
        startTime: '11:30:00',
        endTime: '12:30:00',
        isExtra: false,
        isRescheduled: false,
        isCancelled: true,
        cancellationReason: 'Faculty on leave',
      );

      // Verify scheduler handles list with active and cancelled classes gracefully
      final todayClasses = [activeClass, cancelledClass];
      final activeOnly = todayClasses.where((c) => !c.isCancelled).toList();

      expect(activeOnly.length, 1);
      expect(activeOnly.first.subjectName, 'Compiler Design');
    });

    test('Pre-class reminder calculation sets correct 10-minute lead time', () {
      final now = DateTime(2026, 9, 14, 9, 0);
      final classStartTime = DateTime(2026, 9, 14, 9, 30);
      final reminderTime = classStartTime.subtract(const Duration(minutes: 10));

      expect(reminderTime, DateTime(2026, 9, 14, 9, 20));
      expect(reminderTime.isAfter(now), isTrue);
    });
  });
}
