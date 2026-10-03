import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'auth/providers/auth_provider.dart';
import 'auth/screens/auth_gate.dart';
import 'analytics/providers/analytics_provider.dart';
import 'attendance/providers/attendance_provider.dart';
import 'core/services/feedback_service.dart';
import 'core/supabase/supabase_client.dart';
import 'core/sync/sync_engine.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/theme_provider.dart';
import 'notifications/services/notification_service.dart';
import 'pomodoro/providers/pomodoro_provider.dart';
import 'study/providers/study_provider.dart';
import 'tasks/providers/tasks_provider.dart';
import 'timetable/providers/timetable_provider.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Supabase Auth & Client
  try {
    await SupabaseService.initialize();
  } catch (e) {
    debugPrint('Supabase init warning: $e');
  }

  // Non-blocking initialization for notifications to guarantee ultra-fast first frame
  NotificationService.instance.initialize().catchError((e) {
    debugPrint('Notifications non-blocking init warning: $e');
  });

  runApp(const StudySpaceApp());
}

class StudySpaceApp extends StatelessWidget {
  const StudySpaceApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => AttendanceProvider()),
        ChangeNotifierProvider(create: (_) => TimetableProvider()),
        ChangeNotifierProvider(create: (_) => TasksProvider()),
        ChangeNotifierProvider(create: (_) => PomodoroProvider()),
        ChangeNotifierProvider(create: (_) => StudyProvider()),
        ChangeNotifierProvider(create: (_) => AnalyticsProvider()),
        ChangeNotifierProvider.value(value: FeedbackService.instance),
        ChangeNotifierProvider.value(value: SyncEngine.instance),
      ],
      child: Consumer<ThemeProvider>(
        builder: (context, themeProvider, _) {
          return MaterialApp(
            title: 'StudySpace',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: themeProvider.themeMode,
            home: const AuthGate(),
          );
        },
      ),
    );
  }
}
