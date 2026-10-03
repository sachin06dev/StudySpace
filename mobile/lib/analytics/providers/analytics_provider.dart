import 'package:flutter/foundation.dart';
import '../models/full_analytics_data.dart';
import '../services/analytics_calculation_engine.dart';
import '../../core/database/database_helper.dart';
import '../../attendance/models/attendance_record.dart';
import '../../attendance/services/attendance_calculation_engine.dart';
import '../../pomodoro/models/pomodoro_session.dart';
import '../../study/models/video_note.dart';
import '../../tasks/models/task.dart';
import '../../timetable/models/semester.dart';
import '../../timetable/models/subject.dart';

import '../../core/supabase/supabase_client.dart';

class AnalyticsProvider extends ChangeNotifier {
  final DatabaseHelper _db = DatabaseHelper.instance;

  FullAnalyticsData _data = FullAnalyticsData.empty();
  FullAnalyticsData get data => _data;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  DateTime? _lastUpdated;
  DateTime? get lastUpdated => _lastUpdated;

  List<Semester> _semesters = [];
  List<Semester> get semesters => _semesters;

  String? _selectedSemesterId;
  String? get selectedSemesterId => _selectedSemesterId;

  AnalyticsProvider() {
    loadAnalytics();
  }

  void selectSemester(String? semesterId) {
    if (_selectedSemesterId == semesterId) return;
    _selectedSemesterId = semesterId;
    loadAnalytics();
  }

  /// Recalculates full analytics from local SQLite cache tables, refreshing from Supabase when online.
  Future<void> loadAnalytics() async {
    _isLoading = true;
    notifyListeners();

    try {
      if (SupabaseService.isAuthenticated) {
        final userId = SupabaseService.currentUserId;
        if (userId != null) {
          try {
            final pRes = await SupabaseService.client
                .from('pomodoro_sessions')
                .select()
                .eq('user_id', userId)
                .order('started_at', ascending: false)
                .limit(365);
            final remoteSessions = (pRes as List).map((r) => PomodoroSession.fromMap(r)).toList();
            if (remoteSessions.isNotEmpty) {
              await _db.cacheData(
                'cached_pomodoro_sessions',
                remoteSessions.map((s) => s.toMap()).toList(),
              );
            }
          } catch (e) {
            debugPrint('Remote analytics sync notice: $e');
          }
        }
      }

      final db = await _db.database;

      // 0. Read Semesters
      final semRows = await db.query('cached_semesters', orderBy: 'start_date DESC');
      _semesters = semRows.map((r) => Semester.fromMap(r)).toList();

      Semester? activeSemester;
      if (_selectedSemesterId != null) {
        final found = _semesters.where((s) => s.id == _selectedSemesterId);
        if (found.isNotEmpty) {
          activeSemester = found.first;
        }
      }

      // 1. Read Pomodoro sessions
      final pomRows = await db.query('cached_pomodoro_sessions', orderBy: 'started_at DESC');
      final sessions = pomRows.map((r) => PomodoroSession.fromMap(r)).toList();

      // 2. Read Tasks
      final taskRows = await db.query('cached_tasks', orderBy: 'created_at DESC');
      final tasks = taskRows.map((r) => Task.fromMap(r)).toList();

      // 3. Read Video Notes
      final noteRows = await db.query('cached_video_notes', orderBy: 'created_at DESC');
      final notes = noteRows.map((r) => VideoNote.fromMap(r)).toList();

      // 4. Read Subjects and Attendance Records
      final subjectRows = await db.query('cached_subjects', where: 'is_archived = 0');
      final subjects = subjectRows.map((r) => Subject.fromMap(r)).toList();

      final recordRows = await db.query('cached_attendance_records');
      final records = recordRows.map((r) => AttendanceRecord.fromMap(r)).toList();

      // Filter by semester if selected
      DateTime? startDate;
      DateTime? endDate;
      if (activeSemester != null) {
        startDate = DateTime.tryParse(activeSemester.startDate);
        final parsedEnd = DateTime.tryParse(activeSemester.endDate);
        if (parsedEnd != null) {
          endDate = DateTime(parsedEnd.year, parsedEnd.month, parsedEnd.day, 23, 59, 59);
        }
      }

      final selectedSem = activeSemester;
      final semId = selectedSem?.id;

      final filteredSubjects = semId != null
          ? subjects.where((s) => s.semesterId == semId).toList()
          : subjects;

      final subjectIds = filteredSubjects.map((s) => s.id).toSet();
      final filteredRecords = semId != null
          ? records
              .where((r) => subjectIds.contains(r.subjectId) || r.semesterId == semId)
              .toList()
          : records;

      final filteredSessions = activeSemester != null
          ? sessions.where((s) {
              final dt = DateTime.tryParse(s.startedAt);
              if (dt == null) return false;
              if (startDate != null && dt.isBefore(startDate)) return false;
              if (endDate != null && dt.isAfter(endDate)) return false;
              return true;
            }).toList()
          : sessions;

      final filteredTasks = activeSemester != null
          ? tasks.where((t) {
              final dtStr = t.completedAt ?? t.createdAt;
              if (dtStr == null) return true;
              final dt = DateTime.tryParse(dtStr);
              if (dt == null) return true;
              if (startDate != null && dt.isBefore(startDate)) return false;
              if (endDate != null && dt.isAfter(endDate)) return false;
              return true;
            }).toList()
          : tasks;

      final filteredNotes = activeSemester != null
          ? notes.where((n) {
              if (n.createdAt == null) return true;
              final dt = DateTime.tryParse(n.createdAt!);
              if (dt == null) return true;
              if (startDate != null && dt.isBefore(startDate)) return false;
              if (endDate != null && dt.isAfter(endDate)) return false;
              return true;
            }).toList()
          : notes;

      // Calculate attendance summaries for filtered dataset
      final subjectSummaries = filteredSubjects
          .map((sub) => AttendanceCalculationEngine.calculateSubjectAttendance(
                subject: sub,
                records: filteredRecords,
              ))
          .toList();

      final overallAttendance = AttendanceCalculationEngine.calculateOverallAttendance(
        subjects: filteredSubjects,
        records: filteredRecords,
      );

      // Master aggregation with semester-scoped data
      _data = AnalyticsCalculationEngine.aggregateFullAnalytics(
        sessions: filteredSessions,
        tasks: filteredTasks,
        notes: filteredNotes,
        overallAttendance: overallAttendance,
        subjectAttendanceList: subjectSummaries,
        referenceDate: DateTime.now(),
      );

      _lastUpdated = DateTime.now();
    } catch (e) {
      debugPrint('Error computing analytics: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
