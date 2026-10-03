import 'package:flutter_test/flutter_test.dart';
import 'package:studyspace/pomodoro/models/pomodoro_session.dart';
import 'package:studyspace/tasks/models/task.dart';
import 'package:studyspace/timetable/models/subject.dart';

void main() {
  group('Task Module Tests', () {
    test('Task creation and status toggling', () {
      final task = Task(
        id: 't1',
        userId: 'u1',
        title: 'Complete Lab Report',
        description: 'Experiment 4 on Dijkstra',
        priority: 'high',
        dueDate: '2026-09-18',
      );

      expect(task.isCompleted, isFalse);
      expect(task.priority, 'high');

      final completedTask = Task(
        id: task.id,
        userId: task.userId,
        title: task.title,
        description: task.description,
        status: 'completed',
        priority: task.priority,
        dueDate: task.dueDate,
        completedAt: '2026-09-15T10:00:00Z',
      );

      expect(completedTask.isCompleted, isTrue);
      expect(completedTask.completedAt, isNotNull);

      // Verify SQLite serialization
      final map = completedTask.toMap();
      expect(map['status'], 'completed');
      expect(map['priority'], 'high');

      final restored = Task.fromMap(map);
      expect(restored.id, 't1');
      expect(restored.isCompleted, isTrue);
    });
  });

  group('Pomodoro Focus Tests', () {
    test('Pomodoro session progress and intervals', () {
      final session = PomodoroSession(
        id: 'p1',
        userId: 'u1',
        sessionType: 'focus',
        plannedSeconds: 1500, // 25 mins
        actualSeconds: 1500,
        startedAt: '2026-09-15T09:00:00Z',
        completedAt: '2026-09-15T09:25:00Z',
        status: 'completed',
      );

      expect(session.plannedSeconds, 1500);
      expect(session.actualSeconds, 1500);
      expect(session.status, 'completed');

      final map = session.toMap();
      expect(map['session_type'], 'focus');
      expect(map['actual_seconds'], 1500);

      final restored = PomodoroSession.fromMap(map);
      expect(restored.sessionType, 'focus');
      expect(restored.status, 'completed');
    });

    test('Break interval configurations', () {
      final shortBreak = PomodoroSession(
        id: 'p2',
        userId: 'u1',
        sessionType: 'short_break',
        plannedSeconds: 300, // 5 mins
        actualSeconds: 300,
        startedAt: '2026-09-15T09:25:00Z',
        completedAt: '2026-09-15T09:30:00Z',
        status: 'completed',
      );

      expect(shortBreak.sessionType, 'short_break');
      expect(shortBreak.plannedSeconds, 300);
    });
  });

  group('Subject Archive & Historical Data Protection Tests', () {
    test('Subject archive preserves subject identity and data fields', () {
      final subject = Subject(
        id: 'sub_123',
        userId: 'u1',
        semesterId: 'sem_1',
        name: 'Calculus III',
        code: 'MATH301',
        targetPercentage: 80.0,
        baselineAttended: 12,
        baselineTotal: 15,
        isArchived: false,
      );

      expect(subject.isArchived, isFalse);

      final archived = Subject(
        id: subject.id,
        userId: subject.userId,
        semesterId: subject.semesterId,
        name: subject.name,
        code: subject.code,
        targetPercentage: subject.targetPercentage,
        baselineAttended: subject.baselineAttended,
        baselineTotal: subject.baselineTotal,
        isArchived: true,
      );

      expect(archived.isArchived, isTrue);
      expect(archived.baselineAttended, 12);
      expect(archived.baselineTotal, 15);

      // Verify toMap stores is_archived as integer for SQLite
      final map = archived.toMap();
      expect(map['is_archived'], 1);

      final fromDb = Subject.fromMap(map);
      expect(fromDb.isArchived, isTrue);
    });
  });
}
