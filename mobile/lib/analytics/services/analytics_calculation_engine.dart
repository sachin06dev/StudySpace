import 'package:intl/intl.dart';
import '../models/daily_activity.dart';
import '../models/weekly_graph_data.dart';
import '../models/monthly_summary_data.dart';
import '../models/consistency_score_data.dart';
import '../models/pomodoro_analytics_data.dart';
import '../models/time_of_day_data.dart';
import '../models/milestone_data.dart';
import '../models/full_analytics_data.dart';
import '../../attendance/models/overall_attendance.dart';
import '../../attendance/models/subject_attendance.dart';
import '../../pomodoro/models/pomodoro_session.dart';
import '../../tasks/models/task.dart';
import '../../study/models/video_note.dart';

class InternalDailyAccumulator {
  final String dateStr;
  int studySeconds;
  int pomodoroCount;
  int notesCount;
  int tasksCompletedCount;

  InternalDailyAccumulator({
    required this.dateStr,
    this.studySeconds = 0,
    this.pomodoroCount = 0,
    this.notesCount = 0,
    this.tasksCompletedCount = 0,
  });
}

class AnalyticsCalculationEngine {
  static const int studyDayThresholdMinutes = 20;
  static const int defaultWeeklyGoalMinutes = 600; // 10 hours

  /// Formats minutes into human-readable duration string ("25 min", "1h 15m", "2h").
  static String formatStudyDuration(int totalMinutes) {
    if (totalMinutes <= 0) return '0 min';
    if (totalMinutes < 60) return '$totalMinutes min';
    final hours = totalMinutes ~/ 60;
    final rem = totalMinutes % 60;
    if (rem == 0) return '${hours}h';
    return '${hours}h ${rem}m';
  }

  /// Categorizes minutes into 5 heatmap activity levels.
  static HeatmapActivityLevel getHeatmapLevel(int minutes) {
    if (minutes <= 0) return HeatmapActivityLevel.level0;
    if (minutes <= 20) return HeatmapActivityLevel.level1;
    if (minutes <= 45) return HeatmapActivityLevel.level2;
    if (minutes <= 90) return HeatmapActivityLevel.level3;
    return HeatmapActivityLevel.level4;
  }

  /// Formats an ISO datetime string to localized YYYY-MM-DD calendar date
  static String toLocalDateString(String isoDate) {
    if (isoDate.isEmpty) return '';
    try {
      final dt = DateTime.parse(isoDate).toLocal();
      final y = dt.year.toString().padLeft(4, '0');
      final m = dt.month.toString().padLeft(2, '0');
      final d = dt.day.toString().padLeft(2, '0');
      return '$y-$m-$d';
    } catch (_) {
      return isoDate.length >= 10 ? isoDate.substring(0, 10) : '';
    }
  }

  /// Builds a daily activity accumulation map from local SQLite data.
  static Map<String, InternalDailyAccumulator> buildDailyMap({
    required List<PomodoroSession> sessions,
    required List<Task> tasks,
    required List<VideoNote> notes,
  }) {
    final map = <String, InternalDailyAccumulator>{};

    InternalDailyAccumulator getOrCreate(String dateStr) {
      return map.putIfAbsent(
        dateStr,
        () => InternalDailyAccumulator(dateStr: dateStr),
      );
    }

    // 1. Pomodoro Focus Sessions
    for (final s in sessions) {
      if (s.sessionType != 'focus') continue;
      if (s.status == 'completed' || s.actualSeconds > 0) {
        final dateStr = toLocalDateString(s.startedAt);
        if (dateStr.isEmpty) continue;

        final acc = getOrCreate(dateStr);
        final durSeconds = s.actualSeconds > 0 ? s.actualSeconds : s.plannedSeconds;
        acc.studySeconds += durSeconds;
        if (s.status == 'completed') {
          acc.pomodoroCount++;
        }
      }
    }

    // 2. Completed Tasks
    for (final t in tasks) {
      if (t.isCompleted && t.completedAt != null) {
        final dateStr = toLocalDateString(t.completedAt!);
        if (dateStr.isNotEmpty) {
          getOrCreate(dateStr).tasksCompletedCount++;
        }
      }
    }

    // 3. Video Timestamp Notes
    for (final n in notes) {
      if (n.createdAt != null) {
        final dateStr = toLocalDateString(n.createdAt!);
        if (dateStr.isNotEmpty) {
          getOrCreate(dateStr).notesCount++;
        }
      }
    }

    return map;
  }

  /// Generates a rolling N-day DailyActivity series (default 365 days).
  static List<DailyActivity> buildDailyActivitySeries({
    required Map<String, InternalDailyAccumulator> dailyMap,
    required DateTime referenceDate,
    int totalDays = 365,
  }) {
    final todayStr = DateFormat('yyyy-MM-dd').format(referenceDate);
    final dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    final result = <DailyActivity>[];

    for (int i = totalDays - 1; i >= 0; i--) {
      final d = referenceDate.subtract(Duration(days: i));
      final dateStr = DateFormat('yyyy-MM-dd').format(d);
      final dayOfWeek = d.weekday % 7; // 0 = Sun, 1 = Mon ... 6 = Sat
      final dayName = dayNames[dayOfWeek];

      final acc = dailyMap[dateStr];
      final studyMinutes = acc != null ? (acc.studySeconds / 60).round() : 0;
      final pomodoroCount = acc?.pomodoroCount ?? 0;
      final notesCount = acc?.notesCount ?? 0;
      final tasksCompletedCount = acc?.tasksCompletedCount ?? 0;
      final isQualifying = studyMinutes >= studyDayThresholdMinutes;
      final level = getHeatmapLevel(studyMinutes);
      final isToday = dateStr == todayStr;

      result.add(
        DailyActivity(
          dateStr: dateStr,
          dayOfWeek: dayOfWeek,
          dayName: dayName,
          studyMinutes: studyMinutes,
          formattedDuration: formatStudyDuration(studyMinutes),
          pomodoroCount: pomodoroCount,
          notesCount: notesCount,
          tasksCompletedCount: tasksCompletedCount,
          isQualifying: isQualifying,
          level: level,
          isToday: isToday,
        ),
      );
    }

    return result;
  }

  /// Calculates current streak, longest streak, and active days.
  static StreakStats calculateStreaks({
    required List<DailyActivity> days,
    required DateTime referenceDate,
  }) {
    final todayStr = DateFormat('yyyy-MM-dd').format(referenceDate);
    final yesterdayStr = DateFormat('yyyy-MM-dd').format(referenceDate.subtract(const Duration(days: 1)));

    int activeDays = 0;
    int totalStudyMinutes = 0;
    int totalPomodoros = 0;

    int longestStreak = 0;
    int runningStreak = 0;

    for (final day in days) {
      if (day.isQualifying) {
        activeDays++;
        runningStreak++;
        if (runningStreak > longestStreak) {
          longestStreak = runningStreak;
        }
      } else {
        runningStreak = 0;
      }
      totalStudyMinutes += day.studyMinutes;
      totalPomodoros += day.pomodoroCount;
    }

    // Determine current active streak walking backwards from today
    int currentStreak = 0;
    final dayMap = {for (final d in days) d.dateStr: d};

    final todayActivity = dayMap[todayStr];
    final yesterdayActivity = dayMap[yesterdayStr];

    if (todayActivity != null && todayActivity.isQualifying) {
      // Streak includes today
      DateTime cur = referenceDate;
      while (true) {
        final curStr = DateFormat('yyyy-MM-dd').format(cur);
        final act = dayMap[curStr];
        if (act != null && act.isQualifying) {
          currentStreak++;
          cur = cur.subtract(const Duration(days: 1));
        } else {
          break;
        }
      }
    } else if (yesterdayActivity != null && yesterdayActivity.isQualifying) {
      // Streak is still alive from yesterday
      DateTime cur = referenceDate.subtract(const Duration(days: 1));
      while (true) {
        final curStr = DateFormat('yyyy-MM-dd').format(cur);
        final act = dayMap[curStr];
        if (act != null && act.isQualifying) {
          currentStreak++;
          cur = cur.subtract(const Duration(days: 1));
        } else {
          break;
        }
      }
    }

    return StreakStats(
      currentStreak: currentStreak,
      longestStreak: longestStreak,
      activeDays: activeDays,
      totalStudyMinutes: totalStudyMinutes,
      formattedTotalStudyTime: formatStudyDuration(totalStudyMinutes),
      totalPomodoros: totalPomodoros,
    );
  }

  /// Computes the 7-day weekly study graph (Monday to Sunday) and compares with previous week.
  static WeeklyGraphData calculateWeeklyGraph({
    required Map<String, InternalDailyAccumulator> dailyMap,
    required DateTime referenceDate,
  }) {
    final dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    final todayStr = DateFormat('yyyy-MM-dd').format(referenceDate);

    // Find current week's Monday (weekday: 1 = Mon ... 7 = Sun)
    final mondayOffset = referenceDate.weekday - 1;
    final currentMonday = referenceDate.subtract(Duration(days: mondayOffset));
    final prevMonday = currentMonday.subtract(const Duration(days: 7));

    final currentDays = <WeeklyGraphDay>[];
    int currentWeekTotalMinutes = 0;

    for (int i = 0; i < 7; i++) {
      final d = currentMonday.add(Duration(days: i));
      final dateStr = DateFormat('yyyy-MM-dd').format(d);
      final acc = dailyMap[dateStr];
      final studyMinutes = acc != null ? (acc.studySeconds / 60).round() : 0;
      final pomodoroCount = acc?.pomodoroCount ?? 0;
      final isQualifying = studyMinutes >= studyDayThresholdMinutes;
      final isToday = dateStr == todayStr;

      currentWeekTotalMinutes += studyMinutes;
      currentDays.add(
        WeeklyGraphDay(
          dayName: dayNames[i],
          dateStr: dateStr,
          studyMinutes: studyMinutes,
          formattedDuration: formatStudyDuration(studyMinutes),
          pomodoroCount: pomodoroCount,
          isQualifying: isQualifying,
          isToday: isToday,
        ),
      );
    }

    // Previous week total
    int previousWeekTotalMinutes = 0;
    for (int i = 0; i < 7; i++) {
      final d = prevMonday.add(Duration(days: i));
      final dateStr = DateFormat('yyyy-MM-dd').format(d);
      final acc = dailyMap[dateStr];
      if (acc != null) {
        previousWeekTotalMinutes += (acc.studySeconds / 60).round();
      }
    }

    // Daily average for current week
    final daysPassed = referenceDate.weekday; // 1 (Mon) to 7 (Sun)
    final dailyAverageMinutes = daysPassed > 0 ? (currentWeekTotalMinutes / daysPassed).round() : 0;

    // Comparison with previous week
    int? vsLastWeekPercent;
    VsLastWeekStatus status = VsLastWeekStatus.noData;
    final diff = currentWeekTotalMinutes - previousWeekTotalMinutes;

    if (previousWeekTotalMinutes > 0) {
      vsLastWeekPercent = ((diff / previousWeekTotalMinutes) * 100).round();
      if (vsLastWeekPercent > 0) {
        status = VsLastWeekStatus.up;
      } else if (vsLastWeekPercent < 0) {
        status = VsLastWeekStatus.down;
        vsLastWeekPercent = vsLastWeekPercent.abs();
      } else {
        status = VsLastWeekStatus.same;
      }
    } else if (currentWeekTotalMinutes > 0) {
      status = VsLastWeekStatus.up;
      vsLastWeekPercent = 100;
    }

    return WeeklyGraphData(
      days: currentDays,
      currentWeekTotalMinutes: currentWeekTotalMinutes,
      formattedWeekTotal: formatStudyDuration(currentWeekTotalMinutes),
      dailyAverageMinutes: dailyAverageMinutes,
      formattedDailyAverage: formatStudyDuration(dailyAverageMinutes),
      previousWeekTotalMinutes: previousWeekTotalMinutes,
      formattedPreviousWeekTotal: formatStudyDuration(previousWeekTotalMinutes),
      vsLastWeekPercent: vsLastWeekPercent,
      vsLastWeekDiffMinutes: diff,
      vsLastWeekStatus: status,
    );
  }

  /// Calculates consistency score (0–100) based on active days, streak, and weekly goal.
  static ConsistencyScoreData calculateConsistencyScore({
    required int activeDaysLast30,
    required int currentStreak,
    required int weekStudyMinutes,
    int goalMinutes = defaultWeeklyGoalMinutes,
  }) {
    // 1. Active days factor (max 40 pts)
    final studyDaysScoreRaw = (activeDaysLast30.clamp(0, 30) / 30.0) * 40.0;
    final studyDaysScore = (studyDaysScoreRaw * 10).round() / 10.0;

    // 2. Streak factor (max 35 pts)
    final streakScoreRaw = (currentStreak.clamp(0, 14) / 14.0) * 35.0;
    final streakScore = (streakScoreRaw * 10).round() / 10.0;

    // 3. Weekly goal factor (max 25 pts)
    final goalRate = goalMinutes > 0 ? (weekStudyMinutes / goalMinutes).clamp(0.0, 1.0) : 0.0;
    final goalScoreRaw = goalRate * 25.0;
    final goalScore = (goalScoreRaw * 10).round() / 10.0;

    final overallScore = (studyDaysScore + streakScore + goalScore).round().clamp(0, 100);

    String ratingLabel = 'Getting Started';
    if (overallScore >= 85) {
      ratingLabel = 'Excellent Consistency';
    } else if (overallScore >= 70) {
      ratingLabel = 'Strong Habit';
    } else if (overallScore >= 50) {
      ratingLabel = 'Staying Consistent';
    } else if (overallScore >= 25) {
      ratingLabel = 'Building Momentum';
    }

    final improvements = <ConsistencyScoreImprovement>[];

    if (activeDaysLast30 < 30) {
      improvements.add(
        const ConsistencyScoreImprovement(
          title: 'Active Study Days',
          action: 'Log a qualifying session (≥20 min) today to boost your habit score',
          pointsGain: 1.3,
          category: 'days',
        ),
      );
    }

    if (currentStreak < 14) {
      final nextStreak = currentStreak + 1;
      final nextScore = ((nextStreak.clamp(0, 14) / 14.0) * 35.0 * 10).round() / 10.0;
      final gain = ((nextScore - streakScore) * 10).round() / 10.0;
      improvements.add(
        ConsistencyScoreImprovement(
          title: 'Consistency Streak',
          action: 'Maintain your streak tomorrow to reach $nextStreak ${nextStreak == 1 ? 'day' : 'days'}',
          pointsGain: gain > 0 ? gain : 2.5,
          category: 'streak',
        ),
      );
    }

    if (weekStudyMinutes < goalMinutes) {
      final remMins = goalMinutes - weekStudyMinutes;
      final goalGain = ((25.0 - goalScore) * 10).round() / 10.0;
      improvements.add(
        ConsistencyScoreImprovement(
          title: 'Weekly Study Goal',
          action: 'Complete ${formatStudyDuration(remMins)} more this week to reach 100% target',
          pointsGain: goalGain > 0 ? goalGain : 5.0,
          category: 'goal',
        ),
      );
    }

    return ConsistencyScoreData(
      overallScore: overallScore,
      ratingLabel: ratingLabel,
      studyDaysScore: studyDaysScore,
      streakScore: streakScore,
      goalScore: goalScore,
      activeDaysLast30: activeDaysLast30,
      currentStreak: currentStreak,
      weekStudyMinutes: weekStudyMinutes,
      goalMinutes: goalMinutes,
      improvements: improvements,
    );
  }

  /// Computes deep-dive Pomodoro statistics and recent session history.
  static PomodoroAnalyticsData calculatePomodoroAnalytics({
    required List<PomodoroSession> sessions,
  }) {
    int totalCompleted = 0;
    int totalFocusSeconds = 0;
    int longestSeconds = 0;
    final dayOfWeekCount = <String, ({int count, int seconds})>{
      'Mon': (count: 0, seconds: 0),
      'Tue': (count: 0, seconds: 0),
      'Wed': (count: 0, seconds: 0),
      'Thu': (count: 0, seconds: 0),
      'Fri': (count: 0, seconds: 0),
      'Sat': (count: 0, seconds: 0),
      'Sun': (count: 0, seconds: 0),
    };

    final recentList = <RecentPomodoroSession>[];

    for (final s in sessions) {
      if (s.sessionType != 'focus') continue;

      final durSec = s.actualSeconds > 0 ? s.actualSeconds : s.plannedSeconds;
      totalFocusSeconds += durSec;

      if (s.status == 'completed') {
        totalCompleted++;
        if (durSec > longestSeconds) {
          longestSeconds = durSec;
        }

        try {
          final dt = DateTime.parse(s.startedAt);
          final dayName = DateFormat('E').format(dt);
          if (dayOfWeekCount.containsKey(dayName)) {
            final cur = dayOfWeekCount[dayName]!;
            dayOfWeekCount[dayName] = (count: cur.count + 1, seconds: cur.seconds + durSec);
          }

          if (recentList.length < 10) {
            recentList.add(
              RecentPomodoroSession(
                id: s.id,
                startedAt: s.startedAt,
                dateLabel: DateFormat('d MMM').format(dt),
                timeLabel: DateFormat('h:mm a').format(dt),
                durationMinutes: (durSec / 60).round(),
                formattedDuration: formatStudyDuration((durSec / 60).round()),
              ),
            );
          }
        } catch (_) {}
      }
    }

    final totalFocusMinutes = (totalFocusSeconds / 60).round();
    final avgMinutes = totalCompleted > 0 ? (totalFocusMinutes / totalCompleted).round() : 0;
    final longestMinutes = (longestSeconds / 60).round();

    // Find best day of week
    BestDayOfWeekData? bestDay;
    int maxFocusSec = 0;
    dayOfWeekCount.forEach((day, data) {
      if (data.seconds > maxFocusSec) {
        maxFocusSec = data.seconds;
        bestDay = BestDayOfWeekData(
          dayName: day,
          sessionCount: data.count,
          focusMinutes: (data.seconds / 60).round(),
        );
      }
    });

    return PomodoroAnalyticsData(
      totalCompleted: totalCompleted,
      totalFocusMinutes: totalFocusMinutes,
      formattedFocusTime: formatStudyDuration(totalFocusMinutes),
      averageSessionMinutes: avgMinutes,
      longestSessionMinutes: longestMinutes,
      formattedLongestSession: formatStudyDuration(longestMinutes),
      recentSessions: recentList,
      bestDayOfWeek: bestDay,
    );
  }

  /// Calculates time of day rhythm: Morning (5-12), Afternoon (12-17), Evening (17-21), Night (21-5).
  static TimeOfDayData calculateTimeOfDay({
    required List<PomodoroSession> sessions,
  }) {
    int morningSeconds = 0;
    int afternoonSeconds = 0;
    int eveningSeconds = 0;
    int nightSeconds = 0;

    int morningPomodoros = 0;
    int afternoonPomodoros = 0;
    int eveningPomodoros = 0;
    int nightPomodoros = 0;

    for (final s in sessions) {
      if (s.sessionType != 'focus') continue;
      if (s.status == 'completed' || s.actualSeconds > 0) {
        final durSec = s.actualSeconds > 0 ? s.actualSeconds : s.plannedSeconds;
        try {
          final dt = DateTime.parse(s.startedAt);
          final hour = dt.hour;

          if (hour >= 5 && hour < 12) {
            morningSeconds += durSec;
            if (s.status == 'completed') morningPomodoros++;
          } else if (hour >= 12 && hour < 17) {
            afternoonSeconds += durSec;
            if (s.status == 'completed') afternoonPomodoros++;
          } else if (hour >= 17 && hour < 21) {
            eveningSeconds += durSec;
            if (s.status == 'completed') eveningPomodoros++;
          } else {
            nightSeconds += durSec;
            if (s.status == 'completed') nightPomodoros++;
          }
        } catch (_) {}
      }
    }

    final morningMinutes = (morningSeconds / 60).round();
    final afternoonMinutes = (afternoonSeconds / 60).round();
    final eveningMinutes = (eveningSeconds / 60).round();
    final nightMinutes = (nightSeconds / 60).round();

    final totalMinutes = morningMinutes + afternoonMinutes + eveningMinutes + nightMinutes;
    String? peakPeriod;
    double? peakPercentage;
    final hasEnoughData = totalMinutes >= 60;

    if (hasEnoughData) {
      final map = {
        'Morning': morningMinutes,
        'Afternoon': afternoonMinutes,
        'Evening': eveningMinutes,
        'Night': nightMinutes,
      };
      final sorted = map.entries.toList()..sort((a, b) => b.value.compareTo(a.value));
      if (sorted.first.value > 0) {
        peakPeriod = sorted.first.key;
        peakPercentage = ((sorted.first.value / totalMinutes) * 1000).round() / 10.0;
      }
    }

    return TimeOfDayData(
      morningMinutes: morningMinutes,
      afternoonMinutes: afternoonMinutes,
      eveningMinutes: eveningMinutes,
      nightMinutes: nightMinutes,
      morningPomodoros: morningPomodoros,
      afternoonPomodoros: afternoonPomodoros,
      eveningPomodoros: eveningPomodoros,
      nightPomodoros: nightPomodoros,
      peakPeriod: peakPeriod,
      peakPercentage: peakPercentage,
      hasEnoughData: hasEnoughData,
    );
  }

  /// Calculates milestone unlocks based on active study days and streak.
  static MilestoneData calculateMilestones({
    required int activeDays,
    required int currentStreak,
    required int longestStreak,
  }) {
    final maxStreak = currentStreak > longestStreak ? currentStreak : longestStreak;

    final rawMilestones = [
      (
        id: 'days-5',
        title: 'First Steps',
        desc: 'Log 5 qualifying active study days',
        cat: 'days',
        target: 5,
        current: activeDays,
        icon: '🌱',
        badgeColor: 'emerald',
      ),
      (
        id: 'days-10',
        title: 'Double Digits',
        desc: 'Reach 10 active study days',
        cat: 'days',
        target: 10,
        current: activeDays,
        icon: '🎯',
        badgeColor: 'indigo',
      ),
      (
        id: 'days-25',
        title: 'Quarter Century',
        desc: 'Accumulate 25 active study days',
        cat: 'days',
        target: 25,
        current: activeDays,
        icon: '⭐',
        badgeColor: 'amber',
      ),
      (
        id: 'days-50',
        title: 'Halfway to 100',
        desc: 'Complete 50 active study days',
        cat: 'days',
        target: 50,
        current: activeDays,
        icon: '🚀',
        badgeColor: 'purple',
      ),
      (
        id: 'days-100',
        title: 'Century Club',
        desc: 'Achieve 100 active study days',
        cat: 'days',
        target: 100,
        current: activeDays,
        icon: '👑',
        badgeColor: 'yellow',
      ),
      (
        id: 'streak-3',
        title: 'Spark',
        desc: 'Maintain a 3-day study streak',
        cat: 'streak',
        target: 3,
        current: maxStreak,
        icon: '🔥',
        badgeColor: 'orange',
      ),
      (
        id: 'streak-7',
        title: 'Solid Week',
        desc: 'Hit a full 7-day streak',
        cat: 'streak',
        target: 7,
        current: maxStreak,
        icon: '⚡',
        badgeColor: 'indigo',
      ),
      (
        id: 'streak-14',
        title: 'Fortnight Habit',
        desc: '14 consecutive days of active study',
        cat: 'streak',
        target: 14,
        current: maxStreak,
        icon: '💎',
        badgeColor: 'teal',
      ),
      (
        id: 'streak-30',
        title: 'Iron Will',
        desc: '30-day unstoppable focus streak',
        cat: 'streak',
        target: 30,
        current: maxStreak,
        icon: '🏆',
        badgeColor: 'rose',
      ),
    ];

    int unlocked = 0;
    final items = rawMilestones.map((m) {
      final isUnlocked = m.current >= m.target;
      if (isUnlocked) unlocked++;
      final pct = (m.current / m.target).clamp(0.0, 1.0);
      return MilestoneItem(
        id: m.id,
        title: m.title,
        description: m.desc,
        category: m.cat,
        target: m.target,
        current: m.current,
        isUnlocked: isUnlocked,
        progressPercent: (pct * 100).roundToDouble(),
        icon: m.icon,
        badgeColor: m.badgeColor,
      );
    }).toList();

    return MilestoneData(
      milestones: items,
      unlockedCount: unlocked,
      totalCount: items.length,
    );
  }

  /// Calculates monthly summary series for the last N calendar months.
  static ({
    MonthlySummaryData currentMonth,
    Map<String, MonthlySummaryData> monthlySummaries,
  }) calculateMonthlySummaries({
    required Map<String, InternalDailyAccumulator> dailyMap,
    required DateTime referenceDate,
    int monthsCount = 12,
  }) {
    final summaries = <String, MonthlySummaryData>{};
    MonthlySummaryData? currentMonthData;

    final nowYear = referenceDate.year;
    final nowMonth = referenceDate.month;

    for (int i = 0; i < monthsCount; i++) {
      int targetYear = nowYear;
      int targetMonth = nowMonth - i;
      while (targetMonth <= 0) {
        targetMonth += 12;
        targetYear -= 1;
      }

      final monthKey = '$targetYear-${targetMonth.toString().padLeft(2, '0')}';
      final dt = DateTime(targetYear, targetMonth, 1);
      final monthName = DateFormat('MMMM yyyy').format(dt);
      final daysInMonth = DateTime(targetYear, targetMonth + 1, 0).day;

      int totalMinutes = 0;
      int activeDays = 0;
      int pomodoroCount = 0;

      for (int day = 1; day <= daysInMonth; day++) {
        final dStr = '$targetYear-${targetMonth.toString().padLeft(2, '0')}-${day.toString().padLeft(2, '0')}';
        final acc = dailyMap[dStr];
        if (acc != null) {
          final mins = (acc.studySeconds / 60).round();
          totalMinutes += mins;
          if (mins >= studyDayThresholdMinutes) {
            activeDays++;
          }
          pomodoroCount += acc.pomodoroCount;
        }
      }

      final dailyAvg = daysInMonth > 0 ? (totalMinutes / daysInMonth).round() : 0;
      final isCurrent = targetYear == nowYear && targetMonth == nowMonth;

      final item = MonthlySummaryData(
        monthKey: monthKey,
        monthName: monthName,
        year: targetYear,
        month: targetMonth,
        totalMinutes: totalMinutes,
        formattedTotal: formatStudyDuration(totalMinutes),
        activeDays: activeDays,
        dailyAverageMinutes: dailyAvg,
        formattedDailyAverage: formatStudyDuration(dailyAvg),
        pomodoroCount: pomodoroCount,
        isCurrentMonth: isCurrent,
      );

      summaries[monthKey] = item;
      if (isCurrent) {
        currentMonthData = item;
      }
    }

    return (
      currentMonth: currentMonthData ?? MonthlySummaryData.empty(),
      monthlySummaries: summaries,
    );
  }

  /// Master aggregation method building complete analytics data.
  static FullAnalyticsData aggregateFullAnalytics({
    required List<PomodoroSession> sessions,
    required List<Task> tasks,
    required List<VideoNote> notes,
    required OverallAttendanceSummary overallAttendance,
    required List<SubjectAttendanceSummary> subjectAttendanceList,
    required DateTime referenceDate,
    String timezone = 'UTC',
  }) {
    // 1. Daily accumulator map
    final dailyMap = buildDailyMap(sessions: sessions, tasks: tasks, notes: notes);

    // 2. Rolling 365-day series
    final heatmapDays = buildDailyActivitySeries(
      dailyMap: dailyMap,
      referenceDate: referenceDate,
      totalDays: 365,
    );

    // 3. Streak statistics
    final streaks = calculateStreaks(days: heatmapDays, referenceDate: referenceDate);

    // 4. Weekly graph
    final weeklyGraph = calculateWeeklyGraph(dailyMap: dailyMap, referenceDate: referenceDate);

    // 5. Active days in last 30 days
    final thirtyDaysAgo = referenceDate.subtract(const Duration(days: 30));
    final activeDays30 = heatmapDays.where((d) {
      final dt = DateTime.tryParse(d.dateStr);
      return dt != null && dt.isAfter(thirtyDaysAgo) && d.isQualifying;
    }).length;

    // 6. Consistency score
    final consistencyScore = calculateConsistencyScore(
      activeDaysLast30: activeDays30,
      currentStreak: streaks.currentStreak,
      weekStudyMinutes: weeklyGraph.currentWeekTotalMinutes,
    );

    // 7. Pomodoro analytics
    final pomodoro = calculatePomodoroAnalytics(sessions: sessions);

    // 8. Time of day
    final timeOfDay = calculateTimeOfDay(sessions: sessions);

    // 9. Milestones
    final milestones = calculateMilestones(
      activeDays: streaks.activeDays,
      currentStreak: streaks.currentStreak,
      longestStreak: streaks.longestStreak,
    );

    // 10. Monthly summaries
    final monthlyResult = calculateMonthlySummaries(
      dailyMap: dailyMap,
      referenceDate: referenceDate,
    );

    // 11. Top summary metrics
    final todayStr = DateFormat('yyyy-MM-dd').format(referenceDate);
    final todayAcc = dailyMap[todayStr];
    final todayMins = todayAcc != null ? (todayAcc.studySeconds / 60).round() : 0;
    final todayPoms = todayAcc?.pomodoroCount ?? 0;

    final completedTasksCount = tasks.where((t) => t.isCompleted).length;
    final totalTasksCount = tasks.length;
    final pendingTasksCount = tasks.where((t) => !t.isCompleted).length;
    final taskPct = totalTasksCount > 0 ? ((completedTasksCount / totalTasksCount) * 100).round() : 0;

    final summary = AnalyticsSummary(
      today: AnalyticsSummaryMetrics(
        studyMinutes: todayMins,
        pomodoroCount: todayPoms,
        formattedDuration: formatStudyDuration(todayMins),
      ),
      week: AnalyticsSummaryMetrics(
        studyMinutes: weeklyGraph.currentWeekTotalMinutes,
        pomodoroCount: weeklyGraph.days.fold(0, (sum, d) => sum + d.pomodoroCount),
        formattedDuration: weeklyGraph.formattedWeekTotal,
      ),
      tasks: AnalyticsTasksMetrics(
        total: totalTasksCount,
        completed: completedTasksCount,
        pending: pendingTasksCount,
        completionPercentage: taskPct,
      ),
      attendance: AnalyticsAttendanceMetrics(
        overallPercentage: overallAttendance.overallPercentage,
        targetPercentage: overallAttendance.targetPercentage,
        totalAttended: overallAttendance.totalAttended,
        totalClasses: overallAttendance.totalClasses,
        safeCount: overallAttendance.safeSubjectsCount,
        warningCount: overallAttendance.warningSubjectsCount,
        criticalCount: overallAttendance.criticalSubjectsCount,
        bunkAllowance: overallAttendance.bunkAllowance,
        recoveryRequirement: overallAttendance.recoveryRequirement,
      ),
      timezone: timezone,
    );

    return FullAnalyticsData(
      summary: summary,
      streaks: streaks,
      heatmapDays: heatmapDays,
      weeklyGraph: weeklyGraph,
      monthlySummary: monthlyResult.currentMonth,
      monthlySummaries: monthlyResult.monthlySummaries,
      consistencyScore: consistencyScore,
      pomodoro: pomodoro,
      timeOfDay: timeOfDay,
      milestones: milestones,
      timezone: timezone,
    );
  }
}
