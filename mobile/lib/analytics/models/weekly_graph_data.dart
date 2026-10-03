enum VsLastWeekStatus {
  up,
  down,
  same,
  noData,
}

class WeeklyGraphDay {
  final String dayName;
  final String dateStr;
  final int studyMinutes;
  final String formattedDuration;
  final int pomodoroCount;
  final bool isQualifying;
  final bool isToday;

  const WeeklyGraphDay({
    required this.dayName,
    required this.dateStr,
    required this.studyMinutes,
    required this.formattedDuration,
    required this.pomodoroCount,
    required this.isQualifying,
    required this.isToday,
  });
}

class WeeklyGraphData {
  final List<WeeklyGraphDay> days;
  final int currentWeekTotalMinutes;
  final String formattedWeekTotal;
  final int dailyAverageMinutes;
  final String formattedDailyAverage;
  final int previousWeekTotalMinutes;
  final String formattedPreviousWeekTotal;
  final int? vsLastWeekPercent;
  final int vsLastWeekDiffMinutes;
  final VsLastWeekStatus vsLastWeekStatus;

  const WeeklyGraphData({
    required this.days,
    required this.currentWeekTotalMinutes,
    required this.formattedWeekTotal,
    required this.dailyAverageMinutes,
    required this.formattedDailyAverage,
    required this.previousWeekTotalMinutes,
    required this.formattedPreviousWeekTotal,
    this.vsLastWeekPercent,
    required this.vsLastWeekDiffMinutes,
    required this.vsLastWeekStatus,
  });

  factory WeeklyGraphData.empty() {
    return const WeeklyGraphData(
      days: [],
      currentWeekTotalMinutes: 0,
      formattedWeekTotal: '0 min',
      dailyAverageMinutes: 0,
      formattedDailyAverage: '0 min',
      previousWeekTotalMinutes: 0,
      formattedPreviousWeekTotal: '0 min',
      vsLastWeekPercent: null,
      vsLastWeekDiffMinutes: 0,
      vsLastWeekStatus: VsLastWeekStatus.noData,
    );
  }
}
