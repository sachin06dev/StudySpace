import 'daily_activity.dart';
import 'weekly_graph_data.dart';
import 'monthly_summary_data.dart';
import 'consistency_score_data.dart';
import 'pomodoro_analytics_data.dart';
import 'time_of_day_data.dart';
import 'milestone_data.dart';

class AnalyticsSummaryMetrics {
  final int studyMinutes;
  final int pomodoroCount;
  final String formattedDuration;

  const AnalyticsSummaryMetrics({
    required this.studyMinutes,
    required this.pomodoroCount,
    required this.formattedDuration,
  });
}

class AnalyticsTasksMetrics {
  final int total;
  final int completed;
  final int pending;
  final int completionPercentage;

  const AnalyticsTasksMetrics({
    required this.total,
    required this.completed,
    required this.pending,
    required this.completionPercentage,
  });
}

class AnalyticsAttendanceMetrics {
  final double overallPercentage;
  final double targetPercentage;
  final int totalAttended;
  final int totalClasses;
  final int safeCount;
  final int warningCount;
  final int criticalCount;
  final int bunkAllowance;
  final int recoveryRequirement;

  const AnalyticsAttendanceMetrics({
    required this.overallPercentage,
    required this.targetPercentage,
    required this.totalAttended,
    required this.totalClasses,
    required this.safeCount,
    required this.warningCount,
    required this.criticalCount,
    required this.bunkAllowance,
    required this.recoveryRequirement,
  });

  factory AnalyticsAttendanceMetrics.empty() {
    return const AnalyticsAttendanceMetrics(
      overallPercentage: 100.0,
      targetPercentage: 75.0,
      totalAttended: 0,
      totalClasses: 0,
      safeCount: 0,
      warningCount: 0,
      criticalCount: 0,
      bunkAllowance: 0,
      recoveryRequirement: 0,
    );
  }
}

class AnalyticsSummary {
  final AnalyticsSummaryMetrics today;
  final AnalyticsSummaryMetrics week;
  final AnalyticsTasksMetrics tasks;
  final AnalyticsAttendanceMetrics attendance;
  final String timezone;

  const AnalyticsSummary({
    required this.today,
    required this.week,
    required this.tasks,
    required this.attendance,
    required this.timezone,
  });

  factory AnalyticsSummary.empty() {
    return AnalyticsSummary(
      today: const AnalyticsSummaryMetrics(studyMinutes: 0, pomodoroCount: 0, formattedDuration: '0 min'),
      week: const AnalyticsSummaryMetrics(studyMinutes: 0, pomodoroCount: 0, formattedDuration: '0 min'),
      tasks: const AnalyticsTasksMetrics(total: 0, completed: 0, pending: 0, completionPercentage: 0),
      attendance: AnalyticsAttendanceMetrics.empty(),
      timezone: 'UTC',
    );
  }
}

class FullAnalyticsData {
  final AnalyticsSummary summary;
  final StreakStats streaks;
  final List<DailyActivity> heatmapDays;
  final WeeklyGraphData weeklyGraph;
  final MonthlySummaryData monthlySummary;
  final Map<String, MonthlySummaryData> monthlySummaries;
  final ConsistencyScoreData consistencyScore;
  final PomodoroAnalyticsData pomodoro;
  final TimeOfDayData timeOfDay;
  final MilestoneData milestones;
  final String timezone;

  const FullAnalyticsData({
    required this.summary,
    required this.streaks,
    required this.heatmapDays,
    required this.weeklyGraph,
    required this.monthlySummary,
    required this.monthlySummaries,
    required this.consistencyScore,
    required this.pomodoro,
    required this.timeOfDay,
    required this.milestones,
    required this.timezone,
  });

  factory FullAnalyticsData.empty() {
    return FullAnalyticsData(
      summary: AnalyticsSummary.empty(),
      streaks: StreakStats.empty(),
      heatmapDays: const [],
      weeklyGraph: WeeklyGraphData.empty(),
      monthlySummary: MonthlySummaryData.empty(),
      monthlySummaries: const {},
      consistencyScore: ConsistencyScoreData.empty(),
      pomodoro: PomodoroAnalyticsData.empty(),
      timeOfDay: TimeOfDayData.empty(),
      milestones: MilestoneData.empty(),
      timezone: 'UTC',
    );
  }
}
