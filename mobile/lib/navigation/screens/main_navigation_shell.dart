import 'package:flutter/material.dart';
import '../../analytics/screens/analytics_screen.dart';
import '../../attendance/screens/attendance_overview_screen.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_icons.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/services/feedback_service.dart';
import '../../home/screens/home_screen.dart';
import '../../study/screens/study_screen.dart';
import '../../timetable/screens/weekly_timetable_screen.dart';

import '../../core/updater/update_dialog.dart';
import '../../core/updater/updater_service.dart';

class MainNavigationShell extends StatefulWidget {
  final int initialIndex;

  const MainNavigationShell({
    super.key,
    this.initialIndex = 0,
  });

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkAppUpdates();
    });
  }

  Future<void> _checkAppUpdates() async {
    try {
      final res = await UpdaterService.instance.checkForUpdates();
      if (res.hasUpdate && res.latestRelease != null && mounted) {
        final shouldShow = await UpdaterService.instance.shouldShowUpdateDialog(
          res.latestRelease!,
          isMandatory: res.isMandatory,
        );
        if (shouldShow && mounted) {
          UpdateDialog.show(
            context,
            manifest: res.latestRelease!,
            isMandatory: res.isMandatory,
            currentBuild: res.currentVersion.versionCode,
          );
        }
      }
    } catch (_) {}
  }

  void _onTabTapped(int index) {
    if (_currentIndex != index) {
      FeedbackService.instance.selection();
      setState(() {
        _currentIndex = index;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = AppColors.isDark(context);

    // 5 canonical destinations matching the StudySpace web product hierarchy
    final screens = [
      HomeScreen(onNavigateTab: _onTabTapped),
      const AttendanceOverviewScreen(),
      const WeeklyTimetableScreen(),
      const StudyScreen(),
      const AnalyticsScreen(),
    ];

    return LayoutBuilder(
      builder: (context, constraints) {
        final isWideLayout = constraints.maxWidth >= 640;

        if (isWideLayout) {
          // Adaptive Navigation Rail for Tablet / Desktop layouts
          return Scaffold(
            body: Row(
              children: [
                NavigationRail(
                  selectedIndex: _currentIndex.clamp(0, 4),
                  onDestinationSelected: _onTabTapped,
                  labelType: NavigationRailLabelType.all,
                  backgroundColor: AppColors.surface(context),
                  indicatorColor: isDark ? AppColors.primary(context).withValues(alpha: 0.18) : AppColors.study100,
                  selectedIconTheme: IconThemeData(
                    color: AppColors.primary(context),
                    size: 22,
                  ),
                  unselectedIconTheme: IconThemeData(
                    color: AppColors.textMuted(context),
                    size: 22,
                  ),
                  selectedLabelTextStyle: AppTypography.caption.copyWith(
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary(context),
                  ),
                  unselectedLabelTextStyle: AppTypography.caption.copyWith(
                    fontWeight: FontWeight.w500,
                    color: AppColors.textMuted(context),
                  ),
                  destinations: const [
                    NavigationRailDestination(
                      icon: Icon(AppIcons.home),
                      selectedIcon: Icon(AppIcons.home),
                      label: Text('Home'),
                    ),
                    NavigationRailDestination(
                      icon: Icon(AppIcons.attendance),
                      selectedIcon: Icon(AppIcons.attendance),
                      label: Text('Attendance'),
                    ),
                    NavigationRailDestination(
                      icon: Icon(AppIcons.timetable),
                      selectedIcon: Icon(AppIcons.timetable),
                      label: Text('Timetable'),
                    ),
                    NavigationRailDestination(
                      icon: Icon(AppIcons.study),
                      selectedIcon: Icon(AppIcons.study),
                      label: Text('Study'),
                    ),
                    NavigationRailDestination(
                      icon: Icon(AppIcons.analytics),
                      selectedIcon: Icon(AppIcons.analytics),
                      label: Text('Analytics'),
                    ),
                  ],
                ),
                const VerticalDivider(thickness: 1, width: 1),
                Expanded(
                  child: IndexedStack(
                    index: _currentIndex,
                    children: screens,
                  ),
                ),
              ],
            ),
          );
        }

        // Mobile Phone Layout with Material 3 NavigationBar and Lucide Icons
        final navBarIndex = _currentIndex.clamp(0, 4);

        return Scaffold(
          body: IndexedStack(
            index: navBarIndex,
            children: screens,
          ),
          bottomNavigationBar: Container(
            decoration: BoxDecoration(
              border: Border(
                top: BorderSide(
                  color: AppColors.borderSubtle(context),
                  width: 1.0,
                ),
              ),
            ),
            child: NavigationBar(
              selectedIndex: navBarIndex,
              onDestinationSelected: _onTabTapped,
              backgroundColor: AppColors.surface(context),
              surfaceTintColor: Colors.transparent,
              indicatorColor: isDark ? AppColors.primary(context).withValues(alpha: 0.18) : AppColors.study100,
              destinations: const [
                NavigationDestination(
                  icon: Icon(AppIcons.home, size: 20),
                  selectedIcon: Icon(AppIcons.home, size: 20),
                  label: 'Home',
                ),
                NavigationDestination(
                  icon: Icon(AppIcons.attendance, size: 20),
                  selectedIcon: Icon(AppIcons.attendance, size: 20),
                  label: 'Attendance',
                ),
                NavigationDestination(
                  icon: Icon(AppIcons.timetable, size: 20),
                  selectedIcon: Icon(AppIcons.timetable, size: 20),
                  label: 'Timetable',
                ),
                NavigationDestination(
                  icon: Icon(AppIcons.study, size: 20),
                  selectedIcon: Icon(AppIcons.study, size: 20),
                  label: 'Study',
                ),
                NavigationDestination(
                  icon: Icon(AppIcons.analytics, size: 20),
                  selectedIcon: Icon(AppIcons.analytics, size: 20),
                  label: 'Analytics',
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
