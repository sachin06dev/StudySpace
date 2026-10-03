import 'package:flutter_test/flutter_test.dart';
import 'package:studyspace/analytics/models/daily_activity.dart';
import 'package:studyspace/analytics/models/weekly_graph_data.dart';
import 'package:studyspace/analytics/services/analytics_calculation_engine.dart';
import 'package:studyspace/pomodoro/models/pomodoro_session.dart';

void main() {
  group('Analytics Calculation Engine — Unit Tests', () {
    test('Threshold and formatting constants match web canonical values', () {
      expect(AnalyticsCalculationEngine.studyDayThresholdMinutes, 20);
      expect(AnalyticsCalculationEngine.defaultWeeklyGoalMinutes, 600);

      expect(AnalyticsCalculationEngine.formatStudyDuration(0), '0 min');
      expect(AnalyticsCalculationEngine.formatStudyDuration(25), '25 min');
      expect(AnalyticsCalculationEngine.formatStudyDuration(60), '1h');
      expect(AnalyticsCalculationEngine.formatStudyDuration(75), '1h 15m');
      expect(AnalyticsCalculationEngine.formatStudyDuration(160), '2h 40m');
    });

    test('getHeatmapLevel classifies into 5 distinct levels identically to web', () {
      expect(AnalyticsCalculationEngine.getHeatmapLevel(0), HeatmapActivityLevel.level0);
      expect(AnalyticsCalculationEngine.getHeatmapLevel(-5), HeatmapActivityLevel.level0);
      expect(AnalyticsCalculationEngine.getHeatmapLevel(10), HeatmapActivityLevel.level1);
      expect(AnalyticsCalculationEngine.getHeatmapLevel(20), HeatmapActivityLevel.level1);
      expect(AnalyticsCalculationEngine.getHeatmapLevel(21), HeatmapActivityLevel.level2);
      expect(AnalyticsCalculationEngine.getHeatmapLevel(45), HeatmapActivityLevel.level2);
      expect(AnalyticsCalculationEngine.getHeatmapLevel(60), HeatmapActivityLevel.level3);
      expect(AnalyticsCalculationEngine.getHeatmapLevel(90), HeatmapActivityLevel.level3);
      expect(AnalyticsCalculationEngine.getHeatmapLevel(91), HeatmapActivityLevel.level4);
      expect(AnalyticsCalculationEngine.getHeatmapLevel(180), HeatmapActivityLevel.level4);
    });

    test('calculateConsistencyScore matches web 40/35/25 formula and ratings', () {
      // 0 activity
      final zeroScore = AnalyticsCalculationEngine.calculateConsistencyScore(
        activeDaysLast30: 0,
        currentStreak: 0,
        weekStudyMinutes: 0,
      );
      expect(zeroScore.overallScore, 0);
      expect(zeroScore.ratingLabel, 'Getting Started');
      expect(zeroScore.studyDaysScore, 0.0);
      expect(zeroScore.streakScore, 0.0);
      expect(zeroScore.goalScore, 0.0);

      // Max activity
      final maxScore = AnalyticsCalculationEngine.calculateConsistencyScore(
        activeDaysLast30: 30,
        currentStreak: 14,
        weekStudyMinutes: 600,
      );
      expect(maxScore.overallScore, 100);
      expect(maxScore.ratingLabel, 'Excellent Consistency');
      expect(maxScore.studyDaysScore, 40.0);
      expect(maxScore.streakScore, 35.0);
      expect(maxScore.goalScore, 25.0);

      // Partial score: 15 active days (20 pts), 7 streak (17.5 pts), 300 min (12.5 pts) = 50 pts
      final midScore = AnalyticsCalculationEngine.calculateConsistencyScore(
        activeDaysLast30: 15,
        currentStreak: 7,
        weekStudyMinutes: 300,
      );
      expect(midScore.studyDaysScore, 20.0);
      expect(midScore.streakScore, 17.5);
      expect(midScore.goalScore, 12.5);
      expect(midScore.overallScore, 50);
      expect(midScore.ratingLabel, 'Staying Consistent');
    });

    test('Streak calculation counts qualifying days (>= 20m)', () {
      final today = DateTime(2026, 9, 15);
      final days = [
        DailyActivity(
          dateStr: '2026-09-13',
          dayOfWeek: 0,
          dayName: 'Sun',
          studyMinutes: 25,
          formattedDuration: '25 min',
          pomodoroCount: 1,
          notesCount: 0,
          tasksCompletedCount: 0,
          isQualifying: true,
          level: HeatmapActivityLevel.level2,
          isToday: false,
        ),
        DailyActivity(
          dateStr: '2026-09-14',
          dayOfWeek: 1,
          dayName: 'Mon',
          studyMinutes: 50,
          formattedDuration: '50 min',
          pomodoroCount: 2,
          notesCount: 1,
          tasksCompletedCount: 1,
          isQualifying: true,
          level: HeatmapActivityLevel.level3,
          isToday: false,
        ),
        DailyActivity(
          dateStr: '2026-09-15',
          dayOfWeek: 2,
          dayName: 'Tue',
          studyMinutes: 25,
          formattedDuration: '25 min',
          pomodoroCount: 1,
          notesCount: 0,
          tasksCompletedCount: 0,
          isQualifying: true,
          level: HeatmapActivityLevel.level2,
          isToday: true,
        ),
      ];

      final streaks = AnalyticsCalculationEngine.calculateStreaks(
        days: days,
        referenceDate: today,
      );

      expect(streaks.currentStreak, 3);
      expect(streaks.longestStreak, 3);
      expect(streaks.activeDays, 3);
      expect(streaks.totalStudyMinutes, 100);
      expect(streaks.totalPomodoros, 4);
    });

    test('Weekly graph comparisons calculate correct percentages and status', () {
      final now = DateTime(2026, 9, 15); // Tuesday
      final dailyMap = {
        '2026-09-14': InternalDailyAccumulator(dateStr: '2026-09-14', studySeconds: 3000), // 50m
        '2026-09-15': InternalDailyAccumulator(dateStr: '2026-09-15', studySeconds: 3000), // 50m
        // Prev week
        '2026-09-07': InternalDailyAccumulator(dateStr: '2026-09-07', studySeconds: 3000), // 50m
      };

      final weekly = AnalyticsCalculationEngine.calculateWeeklyGraph(
        dailyMap: dailyMap,
        referenceDate: now,
      );

      expect(weekly.currentWeekTotalMinutes, 100);
      expect(weekly.previousWeekTotalMinutes, 50);
      expect(weekly.vsLastWeekStatus, VsLastWeekStatus.up);
      // (100 - 50) / 50 = +100%
      expect(weekly.vsLastWeekPercent, 100);
    });

    test('Time of day rhythm allocates focus intervals correctly', () {
      final sessions = [
        PomodoroSession(
          id: 'p1',
          userId: 'u1',
          sessionType: 'focus',
          plannedSeconds: 1500,
          actualSeconds: 1500,
          startedAt: '2026-09-15T08:00:00Z', // Morning (hour 8)
          status: 'completed',
        ),
        PomodoroSession(
          id: 'p2',
          userId: 'u1',
          sessionType: 'focus',
          plannedSeconds: 1500,
          actualSeconds: 1500,
          startedAt: '2026-09-15T14:00:00Z', // Afternoon (hour 14)
          status: 'completed',
        ),
        PomodoroSession(
          id: 'p3',
          userId: 'u1',
          sessionType: 'focus',
          plannedSeconds: 1500,
          actualSeconds: 1500,
          startedAt: '2026-09-15T19:00:00Z', // Evening (hour 19)
          status: 'completed',
        ),
        PomodoroSession(
          id: 'p4',
          userId: 'u1',
          sessionType: 'focus',
          plannedSeconds: 1500,
          actualSeconds: 1500,
          startedAt: '2026-09-15T22:00:00Z', // Night (hour 22)
          status: 'completed',
        ),
      ];

      final timeOfDay = AnalyticsCalculationEngine.calculateTimeOfDay(sessions: sessions);
      expect(timeOfDay.morningMinutes, 25);
      expect(timeOfDay.afternoonMinutes, 25);
      expect(timeOfDay.eveningMinutes, 25);
      expect(timeOfDay.nightMinutes, 25);
      expect(timeOfDay.hasEnoughData, isTrue);
    });

    test('Milestones correctly unlock based on active days and streak targets', () {
      final milestones = AnalyticsCalculationEngine.calculateMilestones(
        activeDays: 10,
        currentStreak: 7,
        longestStreak: 7,
      );

      final unlockedIds = milestones.milestones.where((m) => m.isUnlocked).map((m) => m.id).toList();
      // 'days-5' (target 5) and 'days-10' (target 10) should be unlocked
      expect(unlockedIds.contains('days-5'), isTrue);
      expect(unlockedIds.contains('days-10'), isTrue);
      // 'days-25' should be locked
      expect(unlockedIds.contains('days-25'), isFalse);
      // 'streak-3' and 'streak-7' should be unlocked
      expect(unlockedIds.contains('streak-3'), isTrue);
      expect(unlockedIds.contains('streak-7'), isTrue);
      expect(unlockedIds.contains('streak-14'), isFalse);
    });
  });
}
