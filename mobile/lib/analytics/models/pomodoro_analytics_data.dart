class RecentPomodoroSession {
  final String id;
  final String startedAt;
  final String dateLabel; // "Today", "Yesterday", "22 Aug"
  final String timeLabel; // "3:45 PM"
  final int durationMinutes;
  final String formattedDuration;

  const RecentPomodoroSession({
    required this.id,
    required this.startedAt,
    required this.dateLabel,
    required this.timeLabel,
    required this.durationMinutes,
    required this.formattedDuration,
  });
}

class BestDayOfWeekData {
  final String dayName;
  final int sessionCount;
  final int focusMinutes;

  const BestDayOfWeekData({
    required this.dayName,
    required this.sessionCount,
    required this.focusMinutes,
  });
}

class PomodoroAnalyticsData {
  final int totalCompleted;
  final int totalFocusMinutes;
  final String formattedFocusTime;
  final int averageSessionMinutes;
  final int longestSessionMinutes;
  final String formattedLongestSession;
  final List<RecentPomodoroSession> recentSessions;
  final BestDayOfWeekData? bestDayOfWeek;

  const PomodoroAnalyticsData({
    required this.totalCompleted,
    required this.totalFocusMinutes,
    required this.formattedFocusTime,
    required this.averageSessionMinutes,
    required this.longestSessionMinutes,
    required this.formattedLongestSession,
    required this.recentSessions,
    this.bestDayOfWeek,
  });

  factory PomodoroAnalyticsData.empty() {
    return const PomodoroAnalyticsData(
      totalCompleted: 0,
      totalFocusMinutes: 0,
      formattedFocusTime: '0 min',
      averageSessionMinutes: 0,
      longestSessionMinutes: 0,
      formattedLongestSession: '0 min',
      recentSessions: [],
      bestDayOfWeek: null,
    );
  }
}
