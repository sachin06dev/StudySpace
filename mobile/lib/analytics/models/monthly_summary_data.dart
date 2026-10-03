class MonthlySummaryData {
  final String monthKey; // e.g. "2026-09"
  final String monthName; // e.g. "September 2026"
  final int year;
  final int month;
  final int totalMinutes;
  final String formattedTotal;
  final int activeDays;
  final int dailyAverageMinutes;
  final String formattedDailyAverage;
  final int pomodoroCount;
  final bool isCurrentMonth;

  const MonthlySummaryData({
    required this.monthKey,
    required this.monthName,
    required this.year,
    required this.month,
    required this.totalMinutes,
    required this.formattedTotal,
    required this.activeDays,
    required this.dailyAverageMinutes,
    required this.formattedDailyAverage,
    required this.pomodoroCount,
    required this.isCurrentMonth,
  });

  factory MonthlySummaryData.empty() {
    return const MonthlySummaryData(
      monthKey: '',
      monthName: '',
      year: 0,
      month: 0,
      totalMinutes: 0,
      formattedTotal: '0 min',
      activeDays: 0,
      dailyAverageMinutes: 0,
      formattedDailyAverage: '0 min',
      pomodoroCount: 0,
      isCurrentMonth: false,
    );
  }
}
