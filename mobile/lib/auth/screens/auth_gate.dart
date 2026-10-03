import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import 'login_screen.dart';
import '../../attendance/providers/attendance_provider.dart';
import '../../navigation/screens/main_navigation_shell.dart';
import '../../timetable/providers/timetable_provider.dart';

class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  bool _initializedData = false;

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();

    if (authProvider.isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    if (!authProvider.isAuthenticated) {
      _initializedData = false;
      return const LoginScreen();
    }

    // Load initial attendance & timetable data once authenticated
    if (!_initializedData) {
      _initializedData = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        context.read<AttendanceProvider>().loadData();
        context.read<TimetableProvider>().loadSemesters();
      });
    }

    return const MainNavigationShell();
  }
}
