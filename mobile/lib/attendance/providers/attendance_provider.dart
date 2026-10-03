import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:intl/intl.dart';
import 'package:sqflite/sqflite.dart';
import 'package:uuid/uuid.dart';
import '../models/attendance_record.dart';
import '../models/overall_attendance.dart';
import '../models/subject_attendance.dart';
import '../services/attendance_calculation_engine.dart';
import '../services/class_resolution_service.dart';
import '../../core/database/database_helper.dart';
import '../../core/realtime/realtime_sync_service.dart';
import '../../core/supabase/supabase_client.dart';
import '../../core/sync/sync_engine.dart';
import '../../notifications/services/timetable_notification_scheduler.dart';
import '../../timetable/models/semester.dart';
import '../../timetable/models/subject.dart';
import '../../timetable/models/timetable_slot.dart';
import '../../timetable/models/timetable_exception.dart';

class AttendanceProvider extends ChangeNotifier {
  final DatabaseHelper _db = DatabaseHelper.instance;
  final _uuid = const Uuid();
  StreamSubscription<RealtimeAttendanceEvent>? _realtimeSub;

  AttendanceProvider() {
    _initRealtimeListener();
    loadData();
  }

  void _initRealtimeListener() {
    _realtimeSub?.cancel();
    _realtimeSub = RealtimeSyncService.instance.attendanceEvents.listen((event) {
      _handleRealtimeAttendanceEvent(event);
    });
  }

  void _handleRealtimeAttendanceEvent(RealtimeAttendanceEvent event) {
    if (event.type == RealtimeEventType.delete) {
      _records.removeWhere((r) => r.id == event.recordId);
      _recalculate();
      notifyListeners();
    } else if (event.record != null) {
      final newRecord = event.record!;
      if (_activeSemester != null && newRecord.semesterId != _activeSemester!.id) {
        return;
      }
      final idx = _records.indexWhere((r) => r.id == newRecord.id);
      if (idx != -1) {
        _records[idx] = newRecord;
      } else {
        _records.add(newRecord);
      }
      _recalculate();
      notifyListeners();
    }
  }

  @override
  void dispose() {
    _realtimeSub?.cancel();
    super.dispose();
  }

  Semester? _activeSemester;
  Semester? get activeSemester => _activeSemester;

  List<Subject> _subjects = [];
  List<Subject> get subjects => _subjects;

  List<TimetableSlot> _slots = [];
  List<TimetableSlot> get slots => _slots;

  List<TimetableException> _exceptions = [];
  List<TimetableException> get exceptions => _exceptions;

  List<AttendanceRecord> _records = [];
  List<AttendanceRecord> get records => _records;

  String _selectedDate = DateFormat('yyyy-MM-dd').format(DateTime.now());
  String get selectedDate => _selectedDate;

  List<ResolvedClass> _todayClasses = [];
  /// Classes for the currently SELECTED date (used by AttendanceOverviewScreen).
  List<ResolvedClass> get todayClasses => _todayClasses;

  /// Classes for the real TODAY date — always anchored to DateTime.now().
  /// HomeScreen MUST use this getter to avoid showing stale data when the
  /// user was browsing a past date in the Attendance tab.
  List<ResolvedClass> get homeClasses => ClassResolutionService.resolveClassesForDate(
        date: DateFormat('yyyy-MM-dd').format(DateTime.now()),
        semester: _activeSemester,
        slots: _slots,
        subjects: _subjects,
        exceptions: _exceptions,
        records: _records,
      );

  OverallAttendanceSummary _overallSummary = OverallAttendanceSummary.empty();
  OverallAttendanceSummary get overallSummary => _overallSummary;

  List<SubjectAttendanceSummary> _subjectSummaries = [];
  List<SubjectAttendanceSummary> get subjectSummaries => _subjectSummaries;

  double _defaultTarget = 75.0;
  double get defaultTarget => _defaultTarget;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  void setSelectedDate(DateTime date) {
    _selectedDate = DateFormat('yyyy-MM-dd').format(date);
    _recalculate();
    notifyListeners();
  }

  void setDefaultTarget(double target) {
    _defaultTarget = target;
    _recalculate();
    notifyListeners();
  }

  Future<void> loadData({bool forceRefresh = false}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // 1. Load from local SQLite cache first for instant UI
      await _loadFromLocalCache();
      _recalculate();
      _isLoading = false;
      notifyListeners();

      // 2. Fetch fresh data from Supabase if authenticated
      if (SupabaseService.isAuthenticated) {
        await _fetchFromSupabase();
        _recalculate();
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error loading attendance data: $e');
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> _loadFromLocalCache() async {
    final db = await _db.database;

    // Active semester
    final semRows = await db.query(
      'cached_semesters',
      where: 'is_active = 1',
      limit: 1,
    );
    if (semRows.isNotEmpty) {
      _activeSemester = Semester.fromMap(semRows.first);
    } else {
      final anySemRows = await db.query('cached_semesters', limit: 1);
      if (anySemRows.isNotEmpty) {
        _activeSemester = Semester.fromMap(anySemRows.first);
      } else {
        _activeSemester = null;
      }
    }

    if (_activeSemester != null) {
      // Subjects
      final subRows = await db.query(
        'cached_subjects',
        where: 'semester_id = ?',
        whereArgs: [_activeSemester!.id],
      );
      _subjects = subRows.map((r) => Subject.fromMap(r)).toList();

      // Slots
      final slotRows = await db.query(
        'cached_timetable_slots',
        where: 'semester_id = ?',
        whereArgs: [_activeSemester!.id],
      );
      _slots = slotRows.map((r) => TimetableSlot.fromMap(r)).toList();

      // Exceptions
      final exRows = await db.query(
        'cached_timetable_exceptions',
        where: 'semester_id = ?',
        whereArgs: [_activeSemester!.id],
      );
      _exceptions = exRows.map((r) => TimetableException.fromMap(r)).toList();

      // Attendance records
      final recRows = await db.query(
        'cached_attendance_records',
        where: 'semester_id = ?',
        whereArgs: [_activeSemester!.id],
      );
      _records = recRows.map((r) => AttendanceRecord.fromMap(r)).toList();
    } else {
      _subjects = [];
      _slots = [];
      _exceptions = [];
      _records = [];
    }
  }

  Future<void> _fetchFromSupabase() async {
    final client = SupabaseService.client;
    final userId = SupabaseService.currentUserId;
    if (userId == null) return;

    try {
      // 1. Fetch user default target
      try {
        final userSettings = await client
            .from('user_settings')
            .select('default_attendance_target')
            .eq('user_id', userId)
            .maybeSingle();
        if (userSettings != null && userSettings['default_attendance_target'] != null) {
          _defaultTarget = (userSettings['default_attendance_target'] as num).toDouble();
        }
      } catch (_) {}

      // 2. Fetch active semester
      var semResponse = await client
          .from('semesters')
          .select()
          .eq('user_id', userId)
          .eq('is_active', true)
          .maybeSingle();

      if (semResponse == null) {
        final anySem = await client
            .from('semesters')
            .select()
            .eq('user_id', userId)
            .order('start_date', ascending: false)
            .limit(1)
            .maybeSingle();
        if (anySem != null) {
          semResponse = anySem;
        }
      }

      if (semResponse == null) {
        // Only wipe if there was no active semester in local cache
        if (_activeSemester == null) {
          _subjects = [];
          _slots = [];
          _exceptions = [];
          _records = [];
        }
        return;
      }

      _activeSemester = Semester.fromMap(semResponse);
      await _db.cacheData('cached_semesters', [_activeSemester!.toMap()]);

      final semId = _activeSemester!.id;

      // 3. Fetch subjects
      final subRes = await client.from('subjects').select().eq('semester_id', semId);
      final fetchedSubjects = (subRes as List).map((r) => Subject.fromMap(r)).toList();
      _subjects = fetchedSubjects;
      await _db.syncCacheTable(
        'cached_subjects',
        _subjects.map((s) => s.toMap()).toList(),
        filterColumn: 'semester_id',
        filterValue: semId,
      );

      // 4. Fetch slots
      final slotRes = await client.from('timetable_slots').select().eq('semester_id', semId);
      final fetchedSlots = (slotRes as List).map((r) => TimetableSlot.fromMap(r)).toList();
      _slots = fetchedSlots;
      await _db.syncCacheTable(
        'cached_timetable_slots',
        _slots.map((s) => s.toMap()).toList(),
        filterColumn: 'semester_id',
        filterValue: semId,
      );

      // 5. Fetch exceptions
      final exRes = await client.from('timetable_exceptions').select().eq('semester_id', semId);
      final fetchedExceptions = (exRes as List).map((r) => TimetableException.fromMap(r)).toList();
      _exceptions = fetchedExceptions;
      await _db.syncCacheTable(
        'cached_timetable_exceptions',
        _exceptions.map((e) => e.toMap()).toList(),
        filterColumn: 'semester_id',
        filterValue: semId,
      );

      // 6. Fetch records
      final recRes = await client.from('attendance_records').select().eq('semester_id', semId);
      final fetchedRecords = (recRes as List).map((r) => AttendanceRecord.fromMap(r)).toList();
      _records = fetchedRecords;
      await _db.syncCacheTable(
        'cached_attendance_records',
        _records.map((a) => a.toMap()).toList(),
        filterColumn: 'semester_id',
        filterValue: semId,
      );
    } catch (e) {
      debugPrint('Supabase fetch notice (offline or network error): $e');
      // DO NOT wipe local state! We keep our local SQLite cache intact!
    }
  }

  void _recalculate() {
    _todayClasses = ClassResolutionService.resolveClassesForDate(
      date: _selectedDate,
      semester: _activeSemester,
      slots: _slots,
      subjects: _subjects,
      exceptions: _exceptions,
      records: _records,
    );

    _subjectSummaries = _subjects
        .map(
          (s) => AttendanceCalculationEngine.calculateSubjectAttendance(
            subject: s,
            records: _records,
            defaultTarget: _defaultTarget,
          ),
        )
        .toList();

    _overallSummary = AttendanceCalculationEngine.calculateOverallAttendance(
      subjects: _subjects,
      records: _records,
      defaultTarget: _defaultTarget,
    );
  }

  /// ONE-TAP ATTENDANCE MARKING (Optimistic & Offline-First)
  Future<void> markAttendance({
    required ResolvedClass resolvedClass,
    required String status, // 'present', 'absent', 'cancelled'
    String? notes,
  }) async {
    final userId = SupabaseService.currentUserId ?? '';
    final semId = _activeSemester?.id ?? '';
    if (semId.isEmpty) return;

    final existingIndex = _records.indexWhere(
      (r) =>
          r.classDate == _selectedDate &&
          (r.timetableSlotId == resolvedClass.slotId ||
              (r.subjectId == resolvedClass.subjectId &&
                  ClassResolutionService.formatTimeDisplay(r.startTime) ==
                      ClassResolutionService.formatTimeDisplay(resolvedClass.startTime))),
    );

    final recordId = (resolvedClass.attendanceRecordId != null && resolvedClass.attendanceRecordId!.isNotEmpty)
        ? resolvedClass.attendanceRecordId!
        : (existingIndex >= 0 ? _records[existingIndex].id : _uuid.v4());

    final normStartTime = resolvedClass.startTime.split(':').length == 2
        ? '${resolvedClass.startTime}:00'
        : resolvedClass.startTime;
    final normEndTime = resolvedClass.endTime.split(':').length == 2
        ? '${resolvedClass.endTime}:00'
        : resolvedClass.endTime;

    final record = AttendanceRecord(
      id: recordId,
      userId: userId,
      semesterId: semId,
      subjectId: resolvedClass.subjectId,
      timetableSlotId: resolvedClass.slotId,
      classDate: _selectedDate,
      startTime: normStartTime,
      endTime: normEndTime,
      status: status,
      notes: notes,
      createdAt: DateTime.now().toIso8601String(),
      updatedAt: DateTime.now().toIso8601String(),
    );

    // 1. Instant Optimistic In-Memory Update
    if (existingIndex >= 0) {
      _records[existingIndex] = record;
    } else {
      _records.add(record);
    }
    _recalculate();
    notifyListeners();

    // 2. Persist to local SQLite cache
    final db = await _db.database;
    await db.insert(
      'cached_attendance_records',
      record.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );

    // 3. Enqueue idempotent sync action
    final idempotencyKey =
        'att_${userId}_${resolvedClass.subjectId}_${_selectedDate}_${resolvedClass.startTime}';

    await _db.enqueueSync(
      id: _uuid.v4(),
      actionType: 'UPSERT_ATTENDANCE',
      idempotencyKey: idempotencyKey,
      payload: record.toSupabaseMap(),
    );

    // 4. Trigger SyncEngine
    SyncEngine.instance.processQueue();
  }

  /// Delete or reset attendance record for a class
  Future<void> clearAttendance(String recordId) async {
    final existingIndex = _records.indexWhere((r) => r.id == recordId);
    if (existingIndex < 0) return;

    _records.removeAt(existingIndex);
    _recalculate();
    notifyListeners();

    final db = await _db.database;
    await db.delete('cached_attendance_records', where: 'id = ?', whereArgs: [recordId]);

    await _db.enqueueSync(
      id: _uuid.v4(),
      actionType: 'DELETE_ATTENDANCE',
      idempotencyKey: 'del_att_$recordId',
      payload: {'id': recordId},
    );

    SyncEngine.instance.processQueue();
  }

  /// Delete or reset attendance record for a resolved class (today or historical)
  Future<void> clearAttendanceForClass(ResolvedClass resolvedClass) async {
    if (resolvedClass.attendanceRecordId != null && resolvedClass.attendanceRecordId!.isNotEmpty) {
      await clearAttendance(resolvedClass.attendanceRecordId!);
      return;
    }

    final existingIndex = _records.indexWhere(
      (r) =>
          r.classDate == _selectedDate &&
          (r.timetableSlotId == resolvedClass.slotId ||
              (r.subjectId == resolvedClass.subjectId &&
                  ClassResolutionService.formatTimeDisplay(r.startTime) ==
                      ClassResolutionService.formatTimeDisplay(resolvedClass.startTime))),
    );

    if (existingIndex >= 0) {
      await clearAttendance(_records[existingIndex].id);
    }
  }

  /// Update attendance record status directly (e.g. from history screen: present, absent, cancelled)
  Future<void> updateRecordStatus(String recordId, String newStatus) async {
    final existingIndex = _records.indexWhere((r) => r.id == recordId);
    if (existingIndex < 0) return;

    final existing = _records[existingIndex];
    final updated = AttendanceRecord(
      id: existing.id,
      userId: existing.userId,
      semesterId: existing.semesterId,
      subjectId: existing.subjectId,
      timetableSlotId: existing.timetableSlotId,
      classDate: existing.classDate,
      startTime: existing.startTime,
      endTime: existing.endTime,
      status: newStatus,
      notes: existing.notes,
      createdAt: existing.createdAt,
      updatedAt: DateTime.now().toIso8601String(),
    );

    _records[existingIndex] = updated;
    _recalculate();
    notifyListeners();

    final db = await _db.database;
    await db.insert(
      'cached_attendance_records',
      updated.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );

    await _db.enqueueSync(
      id: _uuid.v4(),
      actionType: 'UPSERT_ATTENDANCE',
      idempotencyKey: 'att_${existing.userId}_${existing.subjectId}_${existing.classDate}_${existing.startTime}',
      payload: updated.toSupabaseMap(),
    );

    SyncEngine.instance.processQueue();
  }

  /// DIRECT CLASS CANCELLATION (Optimistic, Exception-backed & Offline-first)
  Future<void> cancelClass({
    required ResolvedClass resolvedClass,
    String? reason,
  }) async {
    final userId = SupabaseService.currentUserId ?? '';
    final semId = _activeSemester?.id ?? '';
    if (semId.isEmpty) return;

    if (resolvedClass.isExtra) {
      final actualExId = resolvedClass.id.replaceFirst('extra_', '');
      final exIdx = _exceptions.indexWhere((e) => e.id == actualExId);
      if (exIdx >= 0) {
        final existing = _exceptions[exIdx];
        final cancelReason = reason?.trim().isNotEmpty == true ? reason!.trim() : 'Class cancelled';
        final newNotes = existing.notes != null && existing.notes!.isNotEmpty
            ? '${existing.notes} [CANCELLED: $cancelReason]'
            : '[CANCELLED: $cancelReason]';

        final updatedEx = TimetableException(
          id: existing.id,
          userId: existing.userId,
          semesterId: existing.semesterId,
          timetableSlotId: existing.timetableSlotId,
          exceptionDate: existing.exceptionDate,
          exceptionType: existing.exceptionType,
          startTime: existing.startTime,
          endTime: existing.endTime,
          replacementDate: existing.replacementDate,
          replacementStartTime: existing.replacementStartTime,
          replacementEndTime: existing.replacementEndTime,
          subjectId: existing.subjectId,
          room: existing.room,
          faculty: existing.faculty,
          notes: newNotes,
          createdAt: existing.createdAt,
          updatedAt: DateTime.now().toIso8601String(),
        );

        _exceptions[exIdx] = updatedEx;

        // Clear any attendance marked for this extra class today
        final recIdx = _records.indexWhere(
          (r) =>
              r.classDate == _selectedDate &&
              r.subjectId == resolvedClass.subjectId &&
              r.timetableSlotId == null,
        );
        String? removedRecordId;
        if (recIdx >= 0) {
          removedRecordId = _records[recIdx].id;
          _records.removeAt(recIdx);
        }

        _recalculate();
        notifyListeners();

        final db = await _db.database;
        await db.update('cached_timetable_exceptions', updatedEx.toMap(), where: 'id = ?', whereArgs: [actualExId]);
        if (removedRecordId != null) {
          await db.delete('cached_attendance_records', where: 'id = ?', whereArgs: [removedRecordId]);
        }

        await _db.enqueueSync(
          id: _uuid.v4(),
          actionType: 'UPSERT_TIMETABLE_EXCEPTION',
          idempotencyKey: 'cancel_extra_$actualExId',
          payload: updatedEx.toSupabaseMap(),
        );

        if (removedRecordId != null) {
          await _db.enqueueSync(
            id: _uuid.v4(),
            actionType: 'DELETE_ATTENDANCE',
            idempotencyKey: 'del_att_$removedRecordId',
            payload: {'id': removedRecordId},
          );
        }

        SyncEngine.instance.processQueue();
        TimetableNotificationScheduler.scheduleDailyReminders(todayClasses: _todayClasses);
        return;
      }
    }

    final exId = _uuid.v4();
    final exception = TimetableException(
      id: exId,
      userId: userId,
      semesterId: semId,
      timetableSlotId: resolvedClass.slotId,
      exceptionDate: _selectedDate,
      exceptionType: 'cancelled',
      notes: reason,
      createdAt: DateTime.now().toIso8601String(),
      updatedAt: DateTime.now().toIso8601String(),
    );

    // 1. Add exception to in-memory list
    _exceptions.add(exception);

    // 2. Clear any attendance record marked for this class today so it's not counted
    final recIdx = _records.indexWhere(
      (r) =>
          r.classDate == _selectedDate &&
          (r.timetableSlotId == resolvedClass.slotId ||
              (r.subjectId == resolvedClass.subjectId &&
                  ClassResolutionService.formatTimeDisplay(r.startTime) ==
                      ClassResolutionService.formatTimeDisplay(resolvedClass.startTime))),
    );
    String? removedRecordId;
    if (recIdx >= 0) {
      removedRecordId = _records[recIdx].id;
      _records.removeAt(recIdx);
    }

    _recalculate();
    notifyListeners();

    // 3. Persist exception to SQLite
    final db = await _db.database;
    await db.insert(
      'cached_timetable_exceptions',
      exception.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );

    if (removedRecordId != null) {
      await db.delete('cached_attendance_records', where: 'id = ?', whereArgs: [removedRecordId]);
    }

    // 4. Enqueue sync operations
    await _db.enqueueSync(
      id: _uuid.v4(),
      actionType: 'UPSERT_TIMETABLE_EXCEPTION',
      idempotencyKey: 'cancel_${semId}_${resolvedClass.slotId ?? resolvedClass.id}_$_selectedDate',
      payload: exception.toSupabaseMap(),
    );

    if (removedRecordId != null) {
      await _db.enqueueSync(
        id: _uuid.v4(),
        actionType: 'DELETE_ATTENDANCE',
        idempotencyKey: 'del_att_$removedRecordId',
        payload: {'id': removedRecordId},
      );
    }

    SyncEngine.instance.processQueue();

    // 5. Reschedule today's notifications to suppress cancelled class reminder
    TimetableNotificationScheduler.scheduleDailyReminders(todayClasses: _todayClasses);
  }

  /// Delete an accidentally created extra class
  Future<void> deleteExtraClass({required ResolvedClass resolvedClass}) async {
    final actualExId = resolvedClass.id.replaceFirst('extra_', '');
    _exceptions.removeWhere((e) => e.id == actualExId);

    final recIdx = _records.indexWhere(
      (r) =>
          r.classDate == _selectedDate &&
          r.subjectId == resolvedClass.subjectId &&
          r.timetableSlotId == null,
    );
    String? removedRecordId;
    if (recIdx >= 0) {
      removedRecordId = _records[recIdx].id;
      _records.removeAt(recIdx);
    }

    _recalculate();
    notifyListeners();

    final db = await _db.database;
    await db.delete('cached_timetable_exceptions', where: 'id = ?', whereArgs: [actualExId]);
    if (removedRecordId != null) {
      await db.delete('cached_attendance_records', where: 'id = ?', whereArgs: [removedRecordId]);
    }

    await _db.enqueueSync(
      id: _uuid.v4(),
      actionType: 'DELETE_TIMETABLE_EXCEPTION',
      idempotencyKey: 'del_ex_$actualExId',
      payload: {'id': actualExId},
    );

    if (removedRecordId != null) {
      await _db.enqueueSync(
        id: _uuid.v4(),
        actionType: 'DELETE_ATTENDANCE',
        idempotencyKey: 'del_att_$removedRecordId',
        payload: {'id': removedRecordId},
      );
    }

    SyncEngine.instance.processQueue();
    TimetableNotificationScheduler.scheduleDailyReminders(todayClasses: _todayClasses);
  }

  /// RESTORE CANCELLED CLASS (Reverse Exception)
  Future<void> restoreCancelledClass({
    required ResolvedClass resolvedClass,
  }) async {
    final semId = _activeSemester?.id ?? '';
    if (semId.isEmpty) return;

    // Handle Extra Class Restore: strip [CANCELLED: ...] from notes
    if (resolvedClass.isExtra) {
      final actualExId = resolvedClass.id.replaceFirst('extra_', '');
      final exIndex = _exceptions.indexWhere((e) => e.id == actualExId);
      if (exIndex < 0) return;

      final existing = _exceptions[exIndex];
      final rawNotes = existing.notes ?? '';
      final cleanedNotes = rawNotes
          .replaceAll(RegExp(r'\[CANCELLED:[^\]]*\]'), '')
          .trim();

      final updatedEx = TimetableException(
        id: existing.id,
        userId: existing.userId,
        semesterId: existing.semesterId,
        timetableSlotId: existing.timetableSlotId,
        exceptionDate: existing.exceptionDate,
        exceptionType: existing.exceptionType,
        startTime: existing.startTime,
        endTime: existing.endTime,
        replacementDate: existing.replacementDate,
        replacementStartTime: existing.replacementStartTime,
        replacementEndTime: existing.replacementEndTime,
        subjectId: existing.subjectId,
        room: existing.room,
        faculty: existing.faculty,
        notes: cleanedNotes.isNotEmpty ? cleanedNotes : null,
        createdAt: existing.createdAt,
        updatedAt: DateTime.now().toIso8601String(),
      );

      _exceptions[exIndex] = updatedEx;
      _recalculate();
      notifyListeners();

      final db = await _db.database;
      await db.update('cached_timetable_exceptions', updatedEx.toMap(), where: 'id = ?', whereArgs: [actualExId]);

      await _db.enqueueSync(
        id: _uuid.v4(),
        actionType: 'UPSERT_TIMETABLE_EXCEPTION',
        idempotencyKey: 'restore_extra_$actualExId',
        payload: updatedEx.toSupabaseMap(),
      );

      SyncEngine.instance.processQueue();
      TimetableNotificationScheduler.scheduleDailyReminders(todayClasses: _todayClasses);
      return;
    }

    // Normal Slot Cancellation Exception
    final exIndex = _exceptions.indexWhere(
      (e) =>
          e.exceptionType == 'cancelled' &&
          e.exceptionDate == _selectedDate &&
          (e.timetableSlotId == resolvedClass.slotId || e.id == resolvedClass.id),
    );

    if (exIndex < 0) return;

    final exToRemove = _exceptions[exIndex];
    _exceptions.removeAt(exIndex);

    _recalculate();
    notifyListeners();

    // Remove from SQLite cache
    final db = await _db.database;
    await db.delete('cached_timetable_exceptions', where: 'id = ?', whereArgs: [exToRemove.id]);

    // Enqueue sync operation to delete from Supabase
    await _db.enqueueSync(
      id: _uuid.v4(),
      actionType: 'DELETE_TIMETABLE_EXCEPTION',
      idempotencyKey: 'del_ex_${exToRemove.id}',
      payload: {'id': exToRemove.id},
    );

    SyncEngine.instance.processQueue();

    // Reschedule notifications to restore alerts for active classes
    TimetableNotificationScheduler.scheduleDailyReminders(todayClasses: _todayClasses);
  }
}

