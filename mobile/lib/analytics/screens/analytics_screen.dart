import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/analytics_provider.dart';
import '../widgets/attendance_analytics_card_widget.dart';
import '../widgets/consistency_score_card_widget.dart';
import '../widgets/heatmap_grid_widget.dart';
import '../widgets/milestones_card_widget.dart';
import '../widgets/monthly_summary_card_widget.dart';
import '../widgets/time_of_day_card_widget.dart';
import '../widgets/weekly_study_chart_widget.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/design_system/components/app_button.dart';
import '../../core/design_system/components/app_card.dart';
import '../../core/services/feedback_service.dart';
import '../../core/sync/sync_engine.dart';
import '../../pomodoro/screens/pomodoro_screen.dart';

class AnalyticsScreen extends StatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  State<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends State<AnalyticsScreen> {
  bool _showAttendanceDetails = false;

  @override
  Widget build(BuildContext context) {
    final analyticsProvider = context.watch<AnalyticsProvider>();
    final syncEngine = context.watch<SyncEngine>();

    final data = analyticsProvider.data;
    final isOffline = syncEngine.state == SyncState.offline;

    final hasStudyData = data.streaks.activeDays > 0 ||
        data.summary.today.studyMinutes > 0 ||
        data.summary.week.studyMinutes > 0 ||
        data.summary.tasks.completed > 0;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Analytics',
          style: AppTypography.headingMd.copyWith(fontWeight: FontWeight.w800),
        ),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Refresh analytics',
            onPressed: () => analyticsProvider.loadAnalytics(),
          ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () => analyticsProvider.loadAnalytics(),
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Offline banner if disconnected
                if (isOffline) ...[
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppColors.warningBg(context),
                      borderRadius: AppRadii.md,
                      border: Border.all(color: AppColors.warningBorder(context)),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.cloud_off_rounded, size: 14, color: AppColors.warningText(context)),
                        const SizedBox(width: 8),
                        Text(
                          'Offline · Showing local cached analytics',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AppColors.warningText(context),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                ],

                // Semester Filter Bar
                _buildSemesterFilter(context, analyticsProvider),

                if (!hasStudyData) ...[
                  _buildEmptyState(context),
                ] else ...[
                  // 1. Key Consistency Metric & Quick KPIs
                  _buildConsistencySection(context, data),
                  const SizedBox(height: AppSpacing.lg),

                  // 2. Activity Heatmap
                  HeatmapGridWidget(days: data.heatmapDays, streaks: data.streaks),
                  const SizedBox(height: AppSpacing.lg),

                  // 3. Weekly Focus Trend
                  WeeklyStudyChartWidget(data: data.weeklyGraph),
                  const SizedBox(height: AppSpacing.lg),

                  // 4. Study Rhythm / Time-of-Day Analysis
                  TimeOfDayCardWidget(data: data.timeOfDay),
                  const SizedBox(height: AppSpacing.lg),

                  // 5. Milestones & Achievements
                  MilestonesCardWidget(data: data.milestones),
                  const SizedBox(height: AppSpacing.lg),

                  // 6. Actionable Insights
                  _buildActionableInsights(context, data),
                  const SizedBox(height: AppSpacing.lg),

                  // Secondary: Attendance Analytics Toggle
                  AppCard(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        InkWell(
                          onTap: () => setState(() => _showAttendanceDetails = !_showAttendanceDetails),
                          borderRadius: AppRadii.md,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Icon(Icons.school_outlined, size: 18, color: AppColors.primary(context)),
                                  const SizedBox(width: AppSpacing.xs),
                                  Text(
                                    'Attendance Standing',
                                    style: AppTypography.headingSm.copyWith(
                                      color: AppColors.textPrimary(context),
                                    ),
                                  ),
                                ],
                              ),
                              Icon(
                                _showAttendanceDetails
                                    ? Icons.keyboard_arrow_up_rounded
                                    : Icons.keyboard_arrow_down_rounded,
                                color: AppColors.textMuted(context),
                              ),
                            ],
                          ),
                        ),
                        if (_showAttendanceDetails) ...[
                          const SizedBox(height: AppSpacing.md),
                          AttendanceAnalyticsCardWidget(metrics: data.summary.attendance),
                          const SizedBox(height: AppSpacing.md),
                          MonthlySummaryCardWidget(
                            currentMonth: data.monthlySummary,
                            monthlySummaries: data.monthlySummaries,
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: AppSpacing.lg),
                ],

                // Timezone and Calculation Footer
                Center(
                  child: Text(
                    'Timezone: ${data.timezone} · Local calculations',
                    style: TextStyle(fontSize: 11, color: AppColors.textMuted(context)),
                  ),
                ),
                const SizedBox(height: AppSpacing.xl),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return AppCard(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 36),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.primarySubtle(context),
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.insights_outlined,
              size: 32,
              color: AppColors.primary(context),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            'Not enough study data yet',
            style: AppTypography.headingSm.copyWith(
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary(context),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Start a focus session or complete tasks to begin building your activity history.',
            textAlign: TextAlign.center,
            style: AppTypography.bodySm.copyWith(
              color: AppColors.textMuted(context),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          AppButton(
            label: 'Start Focus Session',
            icon: Icons.play_arrow_rounded,
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const PomodoroScreen()),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildConsistencySection(BuildContext context, dynamic data) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Consistency Score Card
        ConsistencyScoreCardWidget(data: data.consistencyScore),
        const SizedBox(height: AppSpacing.sm),

        // 3 Compact Key Metrics Strip
        Row(
          children: [
            Expanded(
              child: _buildMetricTile(
                context,
                label: 'Streak',
                value: '${data.streaks.currentStreak}d',
                sublabel: 'Best ${data.streaks.longestStreak}d',
                icon: Icons.local_fire_department_rounded,
                color: Colors.orange,
              ),
            ),
            const SizedBox(width: AppSpacing.xs),
            Expanded(
              child: _buildMetricTile(
                context,
                label: 'Today',
                value: data.summary.today.formattedDuration,
                sublabel: '${data.summary.today.pomodoroCount} sessions',
                icon: Icons.timer_outlined,
                color: AppColors.primary(context),
              ),
            ),
            const SizedBox(width: AppSpacing.xs),
            Expanded(
              child: _buildMetricTile(
                context,
                label: 'Tasks',
                value: '${data.summary.tasks.completed}',
                sublabel: '${data.summary.tasks.completionPercentage}% done',
                icon: Icons.check_circle_outline_rounded,
                color: AppColors.success,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildMetricTile(
    BuildContext context, {
    required String label,
    required String value,
    required String sublabel,
    required IconData icon,
    required Color color,
  }) {
    return AppCard(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                label.toUpperCase(),
                style: AppTypography.caption.copyWith(
                  color: AppColors.textMuted(context),
                  fontWeight: FontWeight.w700,
                  fontSize: 10,
                  letterSpacing: 0.5,
                ),
              ),
              Icon(icon, size: 14, color: color),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: AppTypography.dataStat.copyWith(
              fontSize: 18,
              color: AppColors.textPrimary(context),
            ),
          ),
          const SizedBox(height: 2),
          Text(
            sublabel,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: AppTypography.caption.copyWith(
              color: AppColors.textMuted(context),
              fontSize: 10,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionableInsights(BuildContext context, dynamic data) {
    final insights = <String>[];

    if (data.streaks.currentStreak >= 3) {
      insights.add('Strong momentum: You have a ${data.streaks.currentStreak}-day active study streak.');
    } else if (data.streaks.currentStreak == 0) {
      insights.add('Complete a 25-minute focus session today to kickstart your study streak.');
    }

    if (data.timeOfDay.peakPeriod != null) {
      insights.add('Peak focus window: Your most productive hours occur during the ${data.timeOfDay.peakPeriod?.toLowerCase()} hours.');
    }

    if (data.summary.tasks.pending > 0) {
      insights.add('${data.summary.tasks.pending} active task${data.summary.tasks.pending > 1 ? 's' : ''} remaining on your study agenda.');
    }

    if (insights.isEmpty) {
      insights.add('Maintain steady daily sessions to unlock personalized study rhythm recommendations.');
    }

    return AppCard(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.lightbulb_outline_rounded, size: 18, color: AppColors.warningText(context)),
              const SizedBox(width: AppSpacing.xs),
              Text(
                'Study Insights',
                style: AppTypography.headingSm.copyWith(
                  color: AppColors.textPrimary(context),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          ...insights.map((insight) => Padding(
                padding: const EdgeInsets.only(bottom: 10.0),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      margin: const EdgeInsets.only(top: 5),
                      width: 5,
                      height: 5,
                      decoration: BoxDecoration(
                        color: AppColors.primary(context),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        insight,
                        style: AppTypography.bodySm.copyWith(
                          color: AppColors.textPrimary(context),
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }

  Widget _buildSemesterFilter(BuildContext context, AnalyticsProvider provider) {
    final semesters = provider.semesters;
    if (semesters.isEmpty) return const SizedBox.shrink();

    final selectedId = provider.selectedSemesterId;

    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      height: 38,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          _buildSemesterPill(
            context: context,
            label: 'All Time',
            isSelected: selectedId == null,
            onTap: () {
              FeedbackService.instance.selection();
              provider.selectSemester(null);
            },
          ),
          ...semesters.map((s) {
            final isSelected = selectedId == s.id;
            final label = s.isActive ? '${s.name} (Active)' : s.name;
            return Padding(
              padding: const EdgeInsets.only(left: 8),
              child: _buildSemesterPill(
                context: context,
                label: label,
                isSelected: isSelected,
                isActiveBadge: s.isActive,
                onTap: () {
                  FeedbackService.instance.selection();
                  provider.selectSemester(s.id);
                },
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildSemesterPill({
    required BuildContext context,
    required String label,
    required bool isSelected,
    bool isActiveBadge = false,
    required VoidCallback onTap,
  }) {
    final isDark = AppColors.isDark(context);
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOutCubic,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: isSelected
                ? AppColors.primary(context)
                : (isDark ? AppColors.surfaceMuted(context) : AppColors.card(context)),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isSelected
                  ? AppColors.primary(context)
                  : AppColors.border(context),
              width: isSelected ? 1.4 : 1.0,
            ),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: AppColors.primary(context).withValues(alpha: 0.25),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : null,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (isActiveBadge && !isSelected) ...[
                Container(
                  width: 6,
                  height: 6,
                  margin: const EdgeInsets.only(right: 6),
                  decoration: const BoxDecoration(
                    color: AppColors.success,
                    shape: BoxShape.circle,
                  ),
                ),
              ],
              Text(
                label,
                style: TextStyle(
                  fontSize: 12.5,
                  fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                  color: isSelected
                      ? Colors.white
                      : AppColors.textPrimary(context),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
