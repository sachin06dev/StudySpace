import 'package:flutter_test/flutter_test.dart';
import 'package:studyspace/analytics/services/analytics_calculation_engine.dart';
import 'package:studyspace/attendance/models/attendance_record.dart';
import 'package:studyspace/attendance/models/overall_attendance.dart';
import 'package:studyspace/attendance/services/attendance_calculation_engine.dart';
import 'package:studyspace/pomodoro/models/pomodoro_session.dart';
import 'package:studyspace/study/models/video_note.dart';
import 'package:studyspace/tasks/models/task.dart';
import 'package:studyspace/timetable/models/subject.dart';

void main() {
  group('Dashboard Parity & Data Aggregation Tests', () {
    test('aggregateFullAnalytics combines all data streams correctly', () {
      final now = DateTime(2026, 9, 15, 12, 0, 0);

      final sessions = [
        PomodoroSession(
          id: 'p1',
          userId: 'u1',
          sessionType: 'focus',
          plannedSeconds: 1500, // 25 min
          actualSeconds: 1500,
          startedAt: '2026-09-15T09:00:00Z',
          completedAt: '2026-09-15T09:25:00Z',
          status: 'completed',
        ),
      ];

      final tasks = [
        Task(
          id: 't1',
          userId: 'u1',
          title: 'Review Algorithms',
          status: 'completed',
          completedAt: '2026-09-15T10:00:00Z',
        ),
        Task(
          id: 't2',
          userId: 'u1',
          title: 'Submit Assignment',
          status: 'pending',
        ),
      ];

      final notes = [
        VideoNote(
          id: 'n1',
          userId: 'u1',
          videoId: 'v1',
          timestampSeconds: 120,
          content: 'Key concept here',
          createdAt: '2026-09-15T11:00:00Z',
        ),
      ];

      final subjects = [
        Subject(
          id: 'sub1',
          userId: 'u1',
          semesterId: 'sem1',
          name: 'Computer Networks',
          targetPercentage: 75.0,
          baselineAttended: 8,
          baselineTotal: 10,
        ),
      ];

      final records = [
        AttendanceRecord(
          id: 'ar1',
          userId: 'u1',
          semesterId: 'sem1',
          subjectId: 'sub1',
          classDate: '2026-09-15',
          startTime: '10:00:00',
          endTime: '11:00:00',
          status: 'present',
        ),
      ];

      final subjectSummaries = [
        AttendanceCalculationEngine.calculateSubjectAttendance(
          subject: subjects.first,
          records: records,
          defaultTarget: 75.0,
        ),
      ];

      final overallSummary = AttendanceCalculationEngine.calculateOverallAttendance(
        subjects: subjects,
        records: records,
        defaultTarget: 75.0,
      );

      final full = AnalyticsCalculationEngine.aggregateFullAnalytics(
        sessions: sessions,
        tasks: tasks,
        notes: notes,
        overallAttendance: overallSummary,
        subjectAttendanceList: subjectSummaries,
        referenceDate: now,
        timezone: 'UTC',
      );

      // Verify Today's study stats
      expect(full.summary.today.studyMinutes, 25);
      expect(full.summary.today.pomodoroCount, 1);
      expect(full.summary.today.formattedDuration, '25 min');

      // Verify Tasks stats: 1 completed, 2 total = 50%
      expect(full.summary.tasks.completed, 1);
      expect(full.summary.tasks.total, 2);
      expect(full.summary.tasks.pending, 1);
      expect(full.summary.tasks.completionPercentage, 50);

      // Verify Attendance metrics: 8 + 1 = 9 attended out of 11 total = 81.8%
      expect(full.summary.attendance.totalAttended, 9);
      expect(full.summary.attendance.totalClasses, 11);
      expect(full.summary.attendance.overallPercentage, 81.8);
      expect(full.summary.attendance.warningCount, 1);
      expect(full.summary.attendance.criticalCount, 0);

      // Verify Streaks & Consistency
      expect(full.streaks.activeDays >= 1, isTrue);
      expect(full.consistencyScore.overallScore > 0, isTrue);
    });

    test('Empty datasets handle gracefully without exceptions or NaN', () {
      final now = DateTime(2026, 9, 15);
      final emptyFull = AnalyticsCalculationEngine.aggregateFullAnalytics(
        sessions: [],
        tasks: [],
        notes: [],
        overallAttendance: OverallAttendanceSummary.empty(),
        subjectAttendanceList: [],
        referenceDate: now,
      );

      expect(emptyFull.summary.today.studyMinutes, 0);
      expect(emptyFull.summary.today.pomodoroCount, 0);
      expect(emptyFull.summary.tasks.completionPercentage, 0);
      expect(emptyFull.streaks.activeDays, 0);
      expect(emptyFull.consistencyScore.overallScore, 0);
      expect(emptyFull.consistencyScore.ratingLabel, 'Getting Started');
      expect(emptyFull.weeklyGraph.currentWeekTotalMinutes, 0);
      expect(emptyFull.timeOfDay.hasEnoughData, isFalse);
    });
  });
}
