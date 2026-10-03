import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../analytics/providers/analytics_provider.dart';
import '../../analytics/screens/analytics_screen.dart';
import '../../attendance/services/class_resolution_service.dart';
import '../../attendance/models/subject_attendance.dart';
import '../../attendance/providers/attendance_provider.dart';
import '../../auth/providers/auth_provider.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/design_system/components/app_logo.dart';
import '../../core/design_system/components/metric_stat_tile.dart';
import '../../core/services/feedback_service.dart';
import '../../core/sync/sync_engine.dart';
import '../../pomodoro/providers/pomodoro_provider.dart';
import '../../pomodoro/screens/pomodoro_screen.dart';
import '../../profile/screens/profile_screen.dart';
import '../../study/providers/study_provider.dart';
import '../../tasks/providers/tasks_provider.dart';
import '../../tasks/screens/tasks_screen.dart';
import '../../core/utils/user_name_resolver.dart';
import '../widgets/next_class_hero_card.dart';
import '../widgets/today_class_card.dart';

class HomeScreen extends StatelessWidget {
  final ValueChanged<int>? onNavigateTab;

  const HomeScreen({
    super.key,
    this.onNavigateTab,
  });

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour >= 5 && hour < 12) return 'GOOD MORNING';
    if (hour >= 12 && hour < 17) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  }


  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final attendanceProvider = context.watch<AttendanceProvider>();
    final tasksProvider = context.watch<TasksProvider>();
    final pomodoroProvider = context.watch<PomodoroProvider>();
    final studyProvider = context.watch<StudyProvider>();
    final analyticsProvider = context.watch<AnalyticsProvider>();
    final syncEngine = context.watch<SyncEngine>();

    final todayFormatted = DateFormat('EEEE, d MMMM').format(DateTime.now());
    final classes = attendanceProvider.homeClasses;
    final hasSemester = attendanceProvider.activeSemester != null;

    final user = authProvider.user;
    final userName = UserNameResolver.resolveDisplayName(user);

    // Analytics summary
    final analyticsData = analyticsProvider.data;

    // Next class resolution
    final nowTimeStr = DateFormat('HH:mm').format(DateTime.now());
    ResolvedClass? nextClass;
    for (final c in classes) {
      if (!c.isCancelled && c.startTime.substring(0, 5).compareTo(nowTimeStr) >= 0) {
        nextClass = c;
        break;
      }
    }
    nextClass ??= classes.where((c) => !c.isCancelled).firstOrNull;

    // Attendance standing
    final overallSummary = attendanceProvider.overallSummary;
    final overallPercentStr = '${overallSummary.overallPercentage.toStringAsFixed(1)}%';

    // Find critical subject if any
    final criticalSubject = attendanceProvider.subjectSummaries.firstWhere(
      (s) => s.riskState == RiskState.critical,
      orElse: () => SubjectAttendanceSummary.empty(),
    );
    final hasCriticalSubject = criticalSubject.subject.id.isNotEmpty;

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 20,
        title: Row(
          children: [
            const AppLogo.mark(height: 28, width: 28),
            const SizedBox(width: AppSpacing.sm),
            Text(
              'StudySpace',
              style: AppTypography.headingMd.copyWith(
                fontWeight: FontWeight.w900,
                letterSpacing: -0.5,
              ),
            ),
          ],
        ),
        actions: [
          // Realtime Sync Status Indicator
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            margin: const EdgeInsets.only(right: 4),
            decoration: BoxDecoration(
              color: syncEngine.state == SyncState.offline
                  ? AppColors.warningBg(context)
                  : syncEngine.pendingCount > 0
                      ? AppColors.primarySubtle(context)
                      : AppColors.successBg(context),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 6,
                  height: 6,
                  decoration: BoxDecoration(
                    color: syncEngine.state == SyncState.offline
                        ? AppColors.warning
                        : syncEngine.pendingCount > 0
                            ? AppColors.primary(context)
                            : AppColors.success,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 5),
                Text(
                  syncEngine.state == SyncState.offline
                      ? 'Offline'
                      : syncEngine.pendingCount > 0
                          ? 'Syncing'
                          : 'Synced',
                  style: TextStyle(
                    fontSize: 10.5,
                    fontWeight: FontWeight.w700,
                    color: syncEngine.state == SyncState.offline
                        ? AppColors.warningText(context)
                        : syncEngine.pendingCount > 0
                            ? AppColors.primary(context)
                            : AppColors.successText(context),
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.timer_outlined),
            tooltip: 'Focus Timer',
            onPressed: () {
              FeedbackService.instance.selection();
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const PomodoroScreen()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.insights_rounded),
            tooltip: 'Analytics',
            onPressed: () {
              FeedbackService.instance.selection();
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const AnalyticsScreen()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            tooltip: 'Settings',
            onPressed: () {
              FeedbackService.instance.selection();
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const ProfileScreen()),
              );
            },
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            await Future.wait([
              attendanceProvider.loadData(forceRefresh: true),
              tasksProvider.loadTasks(),
              pomodoroProvider.loadSessions(),
              studyProvider.loadData(),
              analyticsProvider.loadAnalytics(),
            ]);
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 18.0, vertical: 12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. Sync / Offline Status
                if (syncEngine.state == SyncState.offline || syncEngine.pendingCount > 0)
                  Container(
                    margin: const EdgeInsets.only(bottom: 14),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: syncEngine.state == SyncState.offline
                          ? AppColors.warningBg(context)
                          : AppColors.primarySubtle(context),
                      borderRadius: AppRadii.md,
                      border: Border.all(
                        color: syncEngine.state == SyncState.offline
                            ? AppColors.warningBorder(context)
                            : AppColors.primary(context),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          syncEngine.state == SyncState.offline
                              ? Icons.cloud_off_rounded
                              : Icons.sync_rounded,
                          size: 16,
                          color: syncEngine.state == SyncState.offline
                              ? AppColors.warningText(context)
                              : AppColors.primary(context),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            syncEngine.state == SyncState.offline
                                ? 'Saved offline · Will sync when connected (${syncEngine.pendingCount} pending)'
                                : 'Syncing changes with cloud...',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: syncEngine.state == SyncState.offline
                                  ? AppColors.warningText(context)
                                  : AppColors.primary(context),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                // 2. Greeting Header
                Text(
                  _getGreeting(),
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1.2,
                    color: AppColors.primary(context),
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'Good day, $userName',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.5,
                    color: AppColors.textPrimary(context),
                  ),
                ),
                Text(
                  'Today · $todayFormatted',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.textMuted(context),
                  ),
                ),
                const SizedBox(height: AppSpacing.lg),

                // 3. Critical Warning Alert (if any subject at risk)
                if (hasCriticalSubject)
                  Container(
                    margin: const EdgeInsets.only(bottom: AppSpacing.md),
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: AppColors.dangerBg(context),
                      borderRadius: AppRadii.lg,
                      border: Border.all(color: AppColors.dangerBorder(context)),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.warning_amber_rounded, color: AppColors.danger, size: 20),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Attendance Warning: ${criticalSubject.subject.name}',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.dangerText(context),
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '${criticalSubject.percentage.toStringAsFixed(1)}% (Target: ${criticalSubject.targetPercentage.toStringAsFixed(0)}%) · ${criticalSubject.statusMessage}',
                                style: TextStyle(
                                  fontSize: 11,
                                  color: AppColors.textPrimary(context),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                // 4. Hero Anchor: Next Class Hero Card
                NextClassHeroCard(
                  nextClass: nextClass,
                  hasActiveSemester: hasSemester,
                  attendanceProvider: attendanceProvider,
                  onSetupTimetable: () => onNavigateTab?.call(2),
                ),
                const SizedBox(height: AppSpacing.xl),

                // 5. Compact High-Density Metric Row
                LayoutBuilder(
                  builder: (context, constraints) {
                    return Row(
                      children: [
                        Expanded(
                          child: MetricStatTile(
                            label: 'Focus Time',
                            value: analyticsData.summary.today.formattedDuration.isEmpty
                                ? '0m'
                                : analyticsData.summary.today.formattedDuration,
                            icon: Icons.timer_outlined,
                            onTap: () {
                              FeedbackService.instance.selection();
                              Navigator.of(context).push(
                                MaterialPageRoute(builder: (_) => const PomodoroScreen()),
                              );
                            },
                          ),
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: MetricStatTile(
                            label: 'Attendance',
                            value: overallPercentStr,
                            icon: Icons.school_outlined,
                            delta: overallSummary.riskState == RiskState.safe
                                ? 'SAFE'
                                : overallSummary.riskState == RiskState.critical
                                    ? 'DEFICIT'
                                    : null,
                            isPositive: overallSummary.riskState == RiskState.safe,
                            onTap: () {
                              FeedbackService.instance.selection();
                              onNavigateTab?.call(1);
                            },
                          ),
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: MetricStatTile(
                            label: 'Streak',
                            value: '${analyticsData.streaks.currentStreak}d',
                            icon: Icons.local_fire_department_rounded,
                            onTap: () {
                              FeedbackService.instance.selection();
                              Navigator.of(context).push(
                                MaterialPageRoute(builder: (_) => const AnalyticsScreen()),
                              );
                            },
                          ),
                        ),
                      ],
                    );
                  },
                ),
                const SizedBox(height: AppSpacing.xxl),

                // 6. Today's Classes Timeline (Primary daily operational flow)
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "Today's Schedule",
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -0.3,
                        color: AppColors.textPrimary(context),
                      ),
                    ),
                    TextButton(
                      onPressed: () {
                        FeedbackService.instance.selection();
                        onNavigateTab?.call(2); // Timetable tab
                      },
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      child: Text(
                        'View Timetable →',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primary(context),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.md),

                if (attendanceProvider.isLoading && !hasSemester)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 28, horizontal: 20),
                    decoration: BoxDecoration(
                      color: AppColors.card(context),
                      borderRadius: AppRadii.lg,
                      border: Border.all(color: AppColors.border(context)),
                    ),
                    child: Center(
                      child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary(context)),
                    ),
                  )
                else if (!hasSemester)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 28, horizontal: 20),
                    decoration: BoxDecoration(
                      color: AppColors.card(context),
                      borderRadius: AppRadii.lg,
                      border: Border.all(color: AppColors.border(context)),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.calendar_month_outlined,
                          size: 36,
                          color: AppColors.textMuted(context),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          'No Timetable Synced Yet',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary(context),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Set up your active semester and timetable slots to start tracking your daily schedule.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 12,
                            color: AppColors.textMuted(context),
                          ),
                        ),
                        const SizedBox(height: 14),
                        ElevatedButton.icon(
                          onPressed: () {
                            FeedbackService.instance.selection();
                            onNavigateTab?.call(2);
                          },
                          icon: const Icon(Icons.add_rounded, size: 16),
                          label: const Text('Set Up Timetable', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary(context),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          ),
                        ),
                      ],
                    ),
                  )
                else if (classes.isEmpty)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 28, horizontal: 20),
                    decoration: BoxDecoration(
                      color: AppColors.card(context),
                      borderRadius: AppRadii.lg,
                      border: Border.all(color: AppColors.border(context)),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.wb_sunny_outlined,
                          size: 36,
                          color: AppColors.primary(context).withValues(alpha: 0.7),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          'No Classes Today',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary(context),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'No classes scheduled for today. Enjoy your day or catch up on study tasks.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 12,
                            color: AppColors.textMuted(context),
                          ),
                        ),
                      ],
                    ),
                  )
                else ...[
                  if (syncEngine.state == SyncState.offline)
                    Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceMuted(context),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: AppColors.border(context)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.cloud_off_rounded, size: 14, color: AppColors.textMuted(context)),
                          const SizedBox(width: 6),
                          Text(
                            'Offline Mode — Available from local cache',
                            style: TextStyle(fontSize: 11, color: AppColors.textMuted(context), fontWeight: FontWeight.w500),
                          ),
                        ],
                      ),
                    ),
                  for (int i = 0; i < classes.length; i++)
                    TodayClassCard(
                      resolvedClass: classes[i],
                      margin: i == classes.length - 1
                          ? EdgeInsets.zero
                          : const EdgeInsets.only(bottom: AppSpacing.md),
                      onMarkAttendance: (status) {
                        attendanceProvider.markAttendance(
                          resolvedClass: classes[i],
                          status: status,
                        );
                      },
                      onClearAttendance: () {
                        if (classes[i].attendanceRecordId != null) {
                          attendanceProvider.clearAttendance(classes[i].attendanceRecordId!);
                        }
                      },
                      onCancelClass: (reason) {
                        attendanceProvider.cancelClass(
                          resolvedClass: classes[i],
                          reason: reason,
                        );
                      },
                      onRestoreClass: () {
                        attendanceProvider.restoreCancelledClass(
                          resolvedClass: classes[i],
                        );
                      },
                    ),
                ],
                const SizedBox(height: AppSpacing.xl),

                // 7. Mini Attendance Card (Direct shortcut to Attendance)
                if (hasSemester)
                  Padding(
                    padding: const EdgeInsets.only(bottom: AppSpacing.md),
                    child: InkWell(
                      borderRadius: AppRadii.lg,
                      onTap: () {
                        FeedbackService.instance.selection();
                        onNavigateTab?.call(1); // Attendance tab
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        decoration: BoxDecoration(
                          color: AppColors.card(context),
                          borderRadius: AppRadii.lg,
                          border: Border.all(color: AppColors.border(context)),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 38,
                              height: 38,
                              decoration: BoxDecoration(
                                color: overallSummary.overallPercentage >= 75
                                    ? AppColors.successBg(context)
                                    : AppColors.dangerBg(context),
                                shape: BoxShape.circle,
                              ),
                              child: Center(
                                child: Icon(
                                  overallSummary.overallPercentage >= 75
                                      ? Icons.check_circle_outline_rounded
                                      : Icons.warning_amber_rounded,
                                  color: overallSummary.overallPercentage >= 75
                                      ? AppColors.success
                                      : AppColors.danger,
                                  size: 20,
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        attendanceProvider.activeSemester?.name ?? 'Attendance Standing',
                                        style: TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w700,
                                          color: AppColors.textPrimary(context),
                                        ),
                                      ),
                                      Text(
                                        overallPercentStr,
                                        style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w900,
                                          color: overallSummary.overallPercentage >= 75
                                              ? AppColors.successText(context)
                                              : AppColors.dangerText(context),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 2),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        '${overallSummary.totalAttended} of ${overallSummary.totalClasses} classes attended',
                                        style: TextStyle(
                                          fontSize: 11,
                                          color: AppColors.textMuted(context),
                                        ),
                                      ),
                                      Text(
                                        'View details →',
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w600,
                                          color: AppColors.primary(context),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

                // 8. Minimal Supporting Actions Row (Quiet, clean ergonomics)
                Row(
                  children: [
                    Expanded(
                      child: InkWell(
                        borderRadius: AppRadii.md,
                        onTap: () {
                          FeedbackService.instance.selection();
                          Navigator.of(context).push(
                            MaterialPageRoute(builder: (_) => const TasksScreen()),
                          );
                        },
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.card(context),
                            borderRadius: AppRadii.md,
                            border: Border.all(color: AppColors.border(context)),
                          ),
                          child: Row(
                            children: [
                              Icon(Icons.check_box_outlined, size: 20, color: AppColors.primary(context)),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Tasks',
                                      style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.textPrimary(context),
                                      ),
                                    ),
                                    Text(
                                      '${tasksProvider.pendingTasks.length} pending',
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: AppColors.textMuted(context),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: InkWell(
                        borderRadius: AppRadii.md,
                        onTap: () {
                          FeedbackService.instance.selection();
                          onNavigateTab?.call(3); // Study tab
                        },
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.card(context),
                            borderRadius: AppRadii.md,
                            border: Border.all(color: AppColors.border(context)),
                          ),
                          child: Row(
                            children: [
                              Icon(Icons.menu_book_outlined, size: 20, color: AppColors.primary(context)),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Materials',
                                      style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.textPrimary(context),
                                      ),
                                    ),
                                    Text(
                                      'Notes & Vault',
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: AppColors.textMuted(context),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.xxl),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
