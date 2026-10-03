enum HeatmapActivityLevel {
  level0, // 0 min
  level1, // 1-20 min
  level2, // 21-45 min
  level3, // 46-90 min
  level4, // > 90 min
}

class DailyActivity {
  final String dateStr; // YYYY-MM-DD
  final int dayOfWeek; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  final String dayName; // 'Mon', 'Tue', etc.
  final int studyMinutes;
  final String formattedDuration;
  final int pomodoroCount;
  final int notesCount;
  final int tasksCompletedCount;
  final bool isQualifying;
  final HeatmapActivityLevel level;
  final bool isToday;

  const DailyActivity({
    required this.dateStr,
    required this.dayOfWeek,
    required this.dayName,
    required this.studyMinutes,
    required this.formattedDuration,
    required this.pomodoroCount,
    required this.notesCount,
    required this.tasksCompletedCount,
    required this.isQualifying,
    required this.level,
    required this.isToday,
  });
}

class StreakStats {
  final int currentStreak;
  final int longestStreak;
  final int activeDays;
  final int totalStudyMinutes;
  final String formattedTotalStudyTime;
  final int totalPomodoros;

  const StreakStats({
    required this.currentStreak,
    required this.longestStreak,
    required this.activeDays,
    required this.totalStudyMinutes,
    required this.formattedTotalStudyTime,
    required this.totalPomodoros,
  });

  factory StreakStats.empty() {
    return const StreakStats(
      currentStreak: 0,
      longestStreak: 0,
      activeDays: 0,
      totalStudyMinutes: 0,
      formattedTotalStudyTime: '0 min',
      totalPomodoros: 0,
    );
  }
}

class YearlyActivityData {
  final int year;
  final List<DailyActivity> days;
  final StreakStats streaks;
  final bool isCurrentYear;

  const YearlyActivityData({
    required this.year,
    required this.days,
    required this.streaks,
    required this.isCurrentYear,
  });
}
