import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest_all.dart' as tz;

class NotificationService {
  static final NotificationService instance = NotificationService._internal();
  final FlutterLocalNotificationsPlugin _notificationsPlugin = FlutterLocalNotificationsPlugin();

  bool _isInitialized = false;

  NotificationService._internal();

  Future<void> initialize() async {
    if (_isInitialized) return;

    tz.initializeTimeZones();

    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const initSettings = InitializationSettings(android: androidSettings);

    await _notificationsPlugin.initialize(
      initSettings,
      onDidReceiveNotificationResponse: (details) {
        debugPrint('Notification clicked: ${details.payload}');
      },
    );

    // Request notification permission for Android 13+ (API 33+)
    final androidImplementation = _notificationsPlugin
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();
    if (androidImplementation != null) {
      await androidImplementation.requestNotificationsPermission();
    }

    _isInitialized = true;
  }

  Future<void> showInstantNotification({
    required int id,
    required String title,
    required String body,
    String? payload,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      'studyspace_alerts',
      'StudySpace Alerts',
      channelDescription: 'Instant alerts and updates from StudySpace',
      importance: Importance.high,
      priority: Priority.high,
    );

    await _notificationsPlugin.show(
      id,
      title,
      body,
      const NotificationDetails(android: androidDetails),
      payload: payload,
    );
  }

  Future<void> scheduleNotification({
    required int id,
    required String title,
    required String body,
    required DateTime scheduledDate,
    String? payload,
  }) async {
    if (scheduledDate.isBefore(DateTime.now())) return;

    const androidDetails = AndroidNotificationDetails(
      'studyspace_classes',
      'Class & Attendance Reminders',
      channelDescription: 'Timetable class alerts and attendance prompts',
      importance: Importance.high,
      priority: Priority.high,
    );

    await _notificationsPlugin.zonedSchedule(
      id,
      title,
      body,
      tz.TZDateTime.from(scheduledDate, tz.local),
      const NotificationDetails(android: androidDetails),
      androidScheduleMode: AndroidScheduleMode.inexactAllowWhileIdle,
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
      payload: payload,
    );
  }

  Future<void> cancelNotification(int id) async {
    await _notificationsPlugin.cancel(id);
  }

  Future<void> cancelAllNotifications() async {
    await _notificationsPlugin.cancelAll();
  }

  /// Live Ongoing Pomodoro Notification (Native Android Chronometer Countdown)
  Future<void> showOngoingPomodoroNotification({
    required String title,
    required String body,
    required int plannedEndTimeMillis,
    bool isPaused = false,
  }) async {
    final androidDetails = AndroidNotificationDetails(
      'studyspace_pomodoro',
      'Focus & Pomodoro Timer',
      channelDescription: 'Live timer and countdown notification for active focus sessions',
      importance: Importance.low,
      priority: Priority.low,
      ongoing: true,
      onlyAlertOnce: true,
      showWhen: true,
      usesChronometer: !isPaused,
      chronometerCountDown: !isPaused,
      when: plannedEndTimeMillis,
    );

    await _notificationsPlugin.show(
      3001,
      title,
      body,
      NotificationDetails(android: androidDetails),
    );
  }

  /// Scheduled Completion Notification (Plays sound and vibrates on session finish)
  Future<void> showPomodoroCompletedNotification({
    required String title,
    required String body,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      'studyspace_pomodoro_completion',
      'Pomodoro Session Completed',
      channelDescription: 'Alerts when a Pomodoro focus or break session finishes',
      importance: Importance.max,
      priority: Priority.high,
      playSound: true,
      enableVibration: true,
    );

    try {
      await _notificationsPlugin.show(
        3002,
        title,
        body,
        const NotificationDetails(android: androidDetails),
      );
    } catch (e) {
      debugPrint('Error showing pomodoro completion notification: $e');
    }
  }

  Future<void> schedulePomodoroCompletionNotification({
    required String title,
    required String body,
    required DateTime completionTime,
  }) async {
    if (completionTime.isBefore(DateTime.now())) return;

    const androidDetails = AndroidNotificationDetails(
      'studyspace_pomodoro_completion',
      'Pomodoro Session Completed',
      channelDescription: 'Alerts when a Pomodoro focus or break session finishes',
      importance: Importance.max,
      priority: Priority.high,
      playSound: true,
      enableVibration: true,
    );

    try {
      await _notificationsPlugin.zonedSchedule(
        3002,
        title,
        body,
        tz.TZDateTime.from(completionTime, tz.local),
        const NotificationDetails(android: androidDetails),
        androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
        uiLocalNotificationDateInterpretation:
            UILocalNotificationDateInterpretation.absoluteTime,
      );
    } catch (_) {
      try {
        await _notificationsPlugin.zonedSchedule(
          3002,
          title,
          body,
          tz.TZDateTime.from(completionTime, tz.local),
          const NotificationDetails(android: androidDetails),
          androidScheduleMode: AndroidScheduleMode.inexactAllowWhileIdle,
          uiLocalNotificationDateInterpretation:
              UILocalNotificationDateInterpretation.absoluteTime,
        );
      } catch (e) {
        debugPrint('Error scheduling pomodoro notification: $e');
      }
    }
  }

  /// Cancel Pomodoro notifications when stopped or finished
  Future<void> cancelPomodoroNotifications({bool includeCompletion = true}) async {
    try {
      await _notificationsPlugin.cancel(3001);
      if (includeCompletion) {
        await _notificationsPlugin.cancel(3002);
      }
    } catch (e) {
      debugPrint('Error cancelling pomodoro notification: $e');
    }
  }
}
