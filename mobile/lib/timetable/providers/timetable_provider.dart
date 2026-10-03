import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:sqflite/sqflite.dart';
import 'package:uuid/uuid.dart';
import '../models/semester.dart';
import '../models/subject.dart';
import '../models/timetable_slot.dart';
import '../models/timetable_exception.dart';
import '../../core/database/database_helper.dart';
import '../../core/realtime/realtime_sync_service.dart';
import '../../core/services/connectivity_service.dart';
import '../../core/supabase/supabase_client.dart';
import '../../core/sync/sync_engine.dart';

class TimetableProvider extends ChangeNotifier {
  final DatabaseHelper _db = DatabaseHelper.instance;
  final _uuid = const Uuid();
  StreamSubscription<RealtimeTimetableEvent>? _realtimeSub;

  TimetableProvider() {
    _initRealtimeListener();
    loadSemesters();
  }

  void _initRealtimeListener() {
    _realtimeSub?.cancel();
    _realtimeSub = RealtimeSyncService.instance.timetableEvents.listen((_) {
      loadSemesters();
    });
  }

  @override
  void dispose() {
    _realtimeSub?.cancel();
    super.dispose();
  }

  List<Semester> _allSemesters = [];
  List<Semester> get allSemesters => _allSemesters;

  Semester? _activeSemester;
  Semester? get activeSemester => _activeSemester;

  List<Subject> _subjects = [];
  List<Subject> get subjects => _subjects;

  List<TimetableSlot> _slots = [];
  List<TimetableSlot> get slots => _slots;

  List<TimetableException> _exceptions = [];
  List<TimetableException> get exceptions => _exceptions;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _deletingSemesterId;
  String? get deletingSemesterId => _deletingSemesterId;
  bool isDeletingSemester(String id) => _deletingSemesterId == id;

  int _selectedDayTab = 0; // 0 = Mon ... 6 = Sun
  int get selectedDayTab => _selectedDayTab;

  void setSelectedDayTab(int day) {
    _selectedDayTab = day;
    notifyListeners();
  }

  Future<void> loadSemesters() async {
    _isLoading = true;
    notifyListeners();

    try {
      // 1. Load from local SQLite cache first for instant offline availability
      final db = await _db.database;
      final cachedSemRows = await db.query(
        'cached_semesters',
        orderBy: 'start_date DESC',
      );
      if (cachedSemRows.isNotEmpty) {
        _allSemesters = cachedSemRows.map((r) => Semester.fromMap(r)).toList();
        _activeSemester = _allSemesters.firstWhere(
          (s) => s.isActive,
          orElse: () => _allSemesters.first,
        );
        if (_activeSemester != null) {
          await _loadTimetableFromCache(_activeSemester!.id);
        }
        _isLoading = false;
        notifyListeners();
      }

      // 2. Fetch fresh data from Supabase if authenticated
      if (SupabaseService.isAuthenticated) {
        final client = SupabaseService.client;
        final userId = SupabaseService.currentUserId;
        if (userId != null) {
          try {
            final res = await client
                .from('semesters')
                .select()
                .eq('user_id', userId)
                .order('start_date', ascending: false);

            final remoteSemesters = (res as List).map((r) => Semester.fromMap(r)).toList();
            if (remoteSemesters.isNotEmpty) {
              _allSemesters = remoteSemesters;
              _activeSemester = _allSemesters.firstWhere(
                (s) => s.isActive,
                orElse: () => _allSemesters.first,
              );
              await _db.cacheData(
                'cached_semesters',
                _allSemesters.map((s) => s.toMap()).toList(),
              );
              if (_activeSemester != null) {
                await loadTimetableForSemester(_activeSemester!.id);
              }
            }
          } catch (e) {
            debugPrint('Notice loading semesters from Supabase (offline): $e');
          }
        }
      }
    } catch (e) {
      debugPrint('Error loading semesters: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> _loadTimetableFromCache(String semesterId) async {
    final db = await _db.database;
    final subRows = await db.query(
      'cached_subjects',
      where: 'semester_id = ?',
      whereArgs: [semesterId],
    );
    _subjects = subRows.map((r) => Subject.fromMap(r)).toList();

    final slotRows = await db.query(
      'cached_timetable_slots',
      where: 'semester_id = ?',
      whereArgs: [semesterId],
    );
    _slots = slotRows.map((r) => TimetableSlot.fromMap(r)).toList();

    final exRows = await db.query(
      'cached_timetable_exceptions',
      where: 'semester_id = ?',
      whereArgs: [semesterId],
    );
    _exceptions = exRows.map((r) => TimetableException.fromMap(r)).toList();
  }

  Future<void> loadTimetableForSemester(String semesterId) async {
    // 1. Load from local cache first
    await _loadTimetableFromCache(semesterId);
    notifyListeners();

    // 2. Fetch fresh data from Supabase if authenticated
    if (SupabaseService.isAuthenticated) {
      try {
        final client = SupabaseService.client;

        final subRes = await client.from('subjects').select().eq('semester_id', semesterId);
        _subjects = (subRes as List).map((r) => Subject.fromMap(r)).toList();
        await _db.cacheData('cached_subjects', _subjects.map((s) => s.toMap()).toList());

        final slotRes = await client.from('timetable_slots').select().eq('semester_id', semesterId);
        _slots = (slotRes as List).map((r) => TimetableSlot.fromMap(r)).toList();
        await _db.cacheData('cached_timetable_slots', _slots.map((s) => s.toMap()).toList());

        final exRes = await client.from('timetable_exceptions').select().eq('semester_id', semesterId);
        _exceptions = (exRes as List).map((r) => TimetableException.fromMap(r)).toList();
        await _db.cacheData('cached_timetable_exceptions', _exceptions.map((e) => e.toMap()).toList());

        notifyListeners();
      } catch (e) {
        debugPrint('Notice loading timetable from Supabase (offline): $e');
      }
    }
  }

  // --- Semester Operations ---

  Future<Semester?> createSemester({
    required String name,
    required String startDate,
    required String endDate,
    bool setActive = true,
  }) async {
    final client = SupabaseService.client;
    final userId = SupabaseService.currentUserId;
    if (userId == null) return null;

    final db = await _db.database;
    if (setActive && _activeSemester != null) {
      await db.update('cached_semesters', {'is_active': 0}, where: 'user_id = ?', whereArgs: [userId]);
      if (SupabaseService.isAuthenticated && ConnectivityService.instance.isOnline) {
        try {
          await client
              .from('semesters')
              .update({'is_active': false})
              .eq('user_id', userId)
              .eq('is_active', true);
        } catch (_) {}
      }
    }

    final newSem = Semester(
      id: _uuid.v4(),
      userId: userId,
      name: name,
      startDate: startDate,
      endDate: endDate,
      isActive: setActive,
    );

    _allSemesters.insert(0, newSem);
    if (setActive) {
      _activeSemester = newSem;
      _subjects = [];
      _slots = [];
      _exceptions = [];
    }
    notifyListeners();

    await db.insert(
      'cached_semesters',
      newSem.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );

    if (SupabaseService.isAuthenticated && ConnectivityService.instance.isOnline) {
      try {
        await client.from('semesters').insert(newSem.toSupabaseMap());
      } catch (e) {
        debugPrint('Notice inserting semester to Supabase: $e');
      }
    }

    return newSem;
  }

  Future<void> switchActiveSemester(String semesterId) async {
    final client = SupabaseService.client;
    final userId = SupabaseService.currentUserId;
    if (userId == null) return;

    final db = await _db.database;
    await db.update('cached_semesters', {'is_active': 0}, where: 'user_id = ?', whereArgs: [userId]);
    await db.update('cached_semesters', {'is_active': 1}, where: 'id = ?', whereArgs: [semesterId]);

    final targetSem = _allSemesters.firstWhere((s) => s.id == semesterId, orElse: () => _allSemesters.first);
    _activeSemester = targetSem;
    await _loadTimetableFromCache(semesterId);
    notifyListeners();

    final isOnline = SupabaseService.isAuthenticated && ConnectivityService.instance.isOnline;
    if (isOnline) {
      try {
        await client.from('semesters').update({'is_active': false}).eq('user_id', userId);
        await client
            .from('semesters')
            .update({'is_active': true})
            .eq('id', semesterId)
            .eq('user_id', userId);
      } catch (e) {
        debugPrint('Notice switching active semester on Supabase: $e');
      }
    } else {
      await SyncEngine.instance.queueOperation(
        operationType: 'SET_ACTIVE_SEMESTER',
        entityId: semesterId,
        payload: {'id': semesterId},
      );
    }
  }

  Future<bool> updateSemester({
    required String semesterId,
    String? name,
    String? startDate,
    String? endDate,
  }) async {
    final client = SupabaseService.client;
    final userId = SupabaseService.currentUserId;
    if (userId == null) return false;

    final index = _allSemesters.indexWhere((s) => s.id == semesterId);
    if (index == -1) return false;

    final existing = _allSemesters[index];
    final finalName = (name != null && name.trim().isNotEmpty) ? name.trim() : existing.name;
    final finalStart = startDate ?? existing.startDate;
    final finalEnd = endDate ?? existing.endDate;

    if (finalEnd.compareTo(finalStart) < 0) {
      throw Exception('End date must be on or after start date.');
    }

    final updatedSem = Semester(
      id: existing.id,
      userId: existing.userId,
      name: finalName,
      startDate: finalStart,
      endDate: finalEnd,
      isActive: existing.isActive,
    );

    // Update in-memory state
    _allSemesters[index] = updatedSem;
    if (_activeSemester?.id == semesterId) {
      _activeSemester = updatedSem;
    }
    notifyListeners();

    // Update local SQLite cache
    final db = await _db.database;
    await db.update(
      'cached_semesters',
      updatedSem.toMap(),
      where: 'id = ?',
      whereArgs: [semesterId],
    );

    // Update remote Supabase
    final isOnline = SupabaseService.isAuthenticated && ConnectivityService.instance.isOnline;
    if (isOnline) {
      try {
        await client.from('semesters').update({
          'name': finalName,
          'start_date': finalStart,
          'end_date': finalEnd,
        }).eq('id', semesterId).eq('user_id', userId);
      } catch (e) {
        debugPrint('Notice updating semester on Supabase: $e');
        return false;
      }
    } else {
      await SyncEngine.instance.queueOperation(
        operationType: 'UPDATE_SEMESTER',
        entityId: semesterId,
        payload: {
          'id': semesterId,
          'name': finalName,
          'start_date': finalStart,
          'end_date': finalEnd,
        },
      );
    }
    return true;
  }

  Future<void> deleteSemester(String semesterId) async {
    final client = SupabaseService.client;
    final userId = SupabaseService.currentUserId;
    if (userId == null) return;

    _deletingSemesterId = semesterId;
    notifyListeners();

    try {
      final isOnline = SupabaseService.isAuthenticated && ConnectivityService.instance.isOnline;

      if (isOnline) {
        // Attempt remote deletion first. If it fails, error will bubble up, preserving local state.
        await client
            .from('semesters')
            .delete()
            .eq('id', semesterId)
            .eq('user_id', userId);
      } else {
        // Offline: queue mutation via SyncEngine
        await SyncEngine.instance.queueOperation(
          operationType: 'DELETE_SEMESTER',
          entityId: semesterId,
          payload: {'id': semesterId},
        );
      }

      // Atomically cascade-delete from local SQLite cache
      await _db.deleteSemesterFromCache(semesterId);

      // In-memory update
      final wasActive = _activeSemester?.id == semesterId;
      _allSemesters.removeWhere((s) => s.id == semesterId);

      if (wasActive) {
        if (_allSemesters.isNotEmpty) {
          final nextSem = _allSemesters.first;
          final db = await _db.database;
          await db.update('cached_semesters', {'is_active': 1}, where: 'id = ?', whereArgs: [nextSem.id]);

          if (isOnline) {
            try {
              await client.from('semesters').update({'is_active': false}).eq('user_id', userId);
              await client
                  .from('semesters')
                  .update({'is_active': true})
                  .eq('id', nextSem.id)
                  .eq('user_id', userId);
            } catch (e) {
              debugPrint('Notice activating next semester on Supabase: $e');
            }
          } else {
            await SyncEngine.instance.queueOperation(
              operationType: 'SET_ACTIVE_SEMESTER',
              entityId: nextSem.id,
              payload: {'id': nextSem.id},
            );
          }

          _activeSemester = Semester(
            id: nextSem.id,
            userId: nextSem.userId,
            name: nextSem.name,
            startDate: nextSem.startDate,
            endDate: nextSem.endDate,
            isActive: true,
            createdAt: nextSem.createdAt,
            updatedAt: nextSem.updatedAt,
          );
          final idx = _allSemesters.indexWhere((s) => s.id == nextSem.id);
          if (idx != -1) {
            _allSemesters[idx] = _activeSemester!;
          }

          await _loadTimetableFromCache(nextSem.id);
        } else {
          // No semesters left: clear active semester and all related state
          _activeSemester = null;
          _subjects = [];
          _slots = [];
          _exceptions = [];
        }
      }
    } finally {
      _deletingSemesterId = null;
      notifyListeners();
    }
  }

  // --- Subject Operations ---

  Future<void> addSubject({
    required String name,
    String? code,
    String? faculty,
    String? defaultRoom,
    String classType = 'theory',
    double? credits,
    double? targetPercentage,
    int baselineAttended = 0,
    int baselineTotal = 0,
  }) async {
    final client = SupabaseService.client;
    final userId = SupabaseService.currentUserId ?? '';
    final semId = _activeSemester?.id;
    if (semId == null) return;

    final sub = Subject(
      id: _uuid.v4(),
      userId: userId,
      semesterId: semId,
      name: name,
      code: code,
      faculty: faculty,
      defaultRoom: defaultRoom,
      classType: classType,
      credits: credits,
      targetPercentage: targetPercentage,
      baselineAttended: baselineAttended,
      baselineTotal: baselineTotal,
    );

    _subjects.add(sub);
    notifyListeners();

    final db = await _db.database;
    await db.insert(
      'cached_subjects',
      sub.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );

    await SyncEngine.instance.queueOperation(
      operationType: 'UPSERT_SUBJECT',
      entityId: sub.id,
      payload: sub.toSupabaseMap(),
    );

    if (SupabaseService.isAuthenticated && ConnectivityService.instance.isOnline) {
      try {
        await client.from('subjects').insert(sub.toSupabaseMap());
      } catch (e) {
        debugPrint('Notice syncing subject to Supabase: $e');
      }
    }
  }

  Future<void> updateSubject(Subject subject) async {
    final client = SupabaseService.client;
    final index = _subjects.indexWhere((s) => s.id == subject.id);
    if (index != -1) {
      _subjects[index] = subject;
      notifyListeners();
    }

    final db = await _db.database;
    await db.insert(
      'cached_subjects',
      subject.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );

    await SyncEngine.instance.queueOperation(
      operationType: 'UPSERT_SUBJECT',
      entityId: subject.id,
      payload: subject.toSupabaseMap(),
    );

    if (SupabaseService.isAuthenticated && ConnectivityService.instance.isOnline) {
      try {
        await client.from('subjects').update(subject.toSupabaseMap()).eq('id', subject.id);
      } catch (e) {
        debugPrint('Notice syncing subject update to Supabase: $e');
      }
    }
  }

  Future<int> getAttendanceRecordCount(String subjectId) async {
    try {
      final db = await _db.database;
      final localRows = await db.query(
        'cached_attendance_records',
        columns: ['id'],
        where: 'subject_id = ?',
        whereArgs: [subjectId],
      );
      if (localRows.isNotEmpty) {
        return localRows.length;
      }

      if (SupabaseService.isAuthenticated) {
        final client = SupabaseService.client;
        final res = await client
            .from('attendance_records')
            .select('id')
            .eq('subject_id', subjectId);
        return (res as List).length;
      }
    } catch (e) {
      debugPrint('Error checking attendance count: $e');
    }
    return 0;
  }

  Future<void> archiveSubject(String subjectId) async {
    try {
      final db = await _db.database;
      await db.update(
        'cached_subjects',
        {'is_archived': 1},
        where: 'id = ?',
        whereArgs: [subjectId],
      );
      await db.delete(
        'cached_timetable_slots',
        where: 'subject_id = ?',
        whereArgs: [subjectId],
      );

      // Queue in sync engine
      final sync = SyncEngine.instance;
      await sync.queueOperation(
        operationType: 'ARCHIVE_SUBJECT',
        entityId: subjectId,
        payload: {'id': subjectId},
      );

      if (SupabaseService.isAuthenticated) {
        final client = SupabaseService.client;
        await client.from('subjects').update({'is_archived': true}).eq('id', subjectId);
        await client.from('timetable_slots').delete().eq('subject_id', subjectId);
      }
    } catch (e) {
      debugPrint('Error archiving subject: $e');
    } finally {
      if (_activeSemester != null) {
        await loadTimetableForSemester(_activeSemester!.id);
      }
    }
  }

  Future<void> restoreSubject(String subjectId) async {
    try {
      final db = await _db.database;
      await db.update(
        'cached_subjects',
        {'is_archived': 0},
        where: 'id = ?',
        whereArgs: [subjectId],
      );

      final sync = SyncEngine.instance;
      await sync.queueOperation(
        operationType: 'UPSERT_SUBJECT',
        entityId: subjectId,
        payload: {'id': subjectId, 'is_archived': false},
      );

      if (SupabaseService.isAuthenticated) {
        final client = SupabaseService.client;
        await client.from('subjects').update({'is_archived': false}).eq('id', subjectId);
      }
    } catch (e) {
      debugPrint('Error restoring subject: $e');
    } finally {
      if (_activeSemester != null) {
        await loadTimetableForSemester(_activeSemester!.id);
      }
    }
  }

  Future<void> deleteSubject(String subjectId) async {
    try {
      final db = await _db.database;
      await db.delete('cached_subjects', where: 'id = ?', whereArgs: [subjectId]);
      await db.delete('cached_timetable_slots', where: 'subject_id = ?', whereArgs: [subjectId]);

      final sync = SyncEngine.instance;
      await sync.queueOperation(
        operationType: 'DELETE_SUBJECT',
        entityId: subjectId,
        payload: {'id': subjectId},
      );

      if (SupabaseService.isAuthenticated) {
        final client = SupabaseService.client;
        await client.from('subjects').delete().eq('id', subjectId);
      }
    } catch (e) {
      debugPrint('Error deleting subject: $e');
    } finally {
      if (_activeSemester != null) {
        await loadTimetableForSemester(_activeSemester!.id);
      }
    }
  }

  // --- Slot Operations ---

  Future<void> addSlot({
    required String subjectId,
    required int dayOfWeek,
    required String startTime,
    required String endTime,
    String? roomOverride,
    String? facultyOverride,
    String? classTypeOverride,
  }) async {
    final client = SupabaseService.client;
    final userId = SupabaseService.currentUserId ?? '';
    final semId = _activeSemester?.id;
    if (semId == null) return;

    final slot = TimetableSlot(
      id: _uuid.v4(),
      userId: userId,
      semesterId: semId,
      subjectId: subjectId,
      dayOfWeek: dayOfWeek,
      startTime: startTime,
      endTime: endTime,
      roomOverride: roomOverride,
      facultyOverride: facultyOverride,
      classTypeOverride: classTypeOverride,
    );

    _slots.add(slot);
    notifyListeners();

    final db = await _db.database;
    await db.insert(
      'cached_timetable_slots',
      slot.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );

    await SyncEngine.instance.queueOperation(
      operationType: 'UPSERT_TIMETABLE_SLOT',
      entityId: slot.id,
      payload: slot.toSupabaseMap(),
    );

    if (SupabaseService.isAuthenticated && ConnectivityService.instance.isOnline) {
      try {
        await client.from('timetable_slots').insert(slot.toSupabaseMap());
      } catch (e) {
        debugPrint('Notice syncing slot to Supabase: $e');
      }
    }
  }

  Future<void> updateSlot(TimetableSlot slot) async {
    final client = SupabaseService.client;
    final index = _slots.indexWhere((s) => s.id == slot.id);
    if (index != -1) {
      _slots[index] = slot;
      notifyListeners();
    }

    final db = await _db.database;
    await db.insert(
      'cached_timetable_slots',
      slot.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );

    await SyncEngine.instance.queueOperation(
      operationType: 'UPSERT_TIMETABLE_SLOT',
      entityId: slot.id,
      payload: slot.toSupabaseMap(),
    );

    if (SupabaseService.isAuthenticated && ConnectivityService.instance.isOnline) {
      try {
        await client.from('timetable_slots').update(slot.toSupabaseMap()).eq('id', slot.id);
      } catch (e) {
        debugPrint('Notice syncing slot update to Supabase: $e');
      }
    }
  }

  Future<void> deleteSlot(String slotId) async {
    final client = SupabaseService.client;
    _slots.removeWhere((s) => s.id == slotId);
    notifyListeners();

    final db = await _db.database;
    await db.delete(
      'cached_timetable_slots',
      where: 'id = ?',
      whereArgs: [slotId],
    );

    await SyncEngine.instance.queueOperation(
      operationType: 'DELETE_TIMETABLE_SLOT',
      entityId: slotId,
      payload: {'id': slotId},
    );

    if (SupabaseService.isAuthenticated && ConnectivityService.instance.isOnline) {
      try {
        await client.from('timetable_slots').delete().eq('id', slotId);
      } catch (e) {
        debugPrint('Notice deleting slot from Supabase: $e');
      }
    }
  }

  // --- Exception Operations ---

  Future<void> cancelClass({
    required String slotId,
    required String date,
    String? notes,
  }) async {
    final client = SupabaseService.client;
    final userId = SupabaseService.currentUserId ?? '';
    final semId = _activeSemester?.id;
    if (semId == null) return;

    final ex = TimetableException(
      id: _uuid.v4(),
      userId: userId,
      semesterId: semId,
      timetableSlotId: slotId,
      exceptionDate: date,
      exceptionType: 'cancelled',
      notes: notes,
    );

    _exceptions.add(ex);
    notifyListeners();

    final db = await _db.database;
    await db.insert(
      'cached_timetable_exceptions',
      ex.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );

    await SyncEngine.instance.queueOperation(
      operationType: 'UPSERT_TIMETABLE_EXCEPTION',
      entityId: ex.id,
      payload: ex.toSupabaseMap(),
    );

    if (SupabaseService.isAuthenticated && ConnectivityService.instance.isOnline) {
      try {
        await client.from('timetable_exceptions').insert(ex.toSupabaseMap());
      } catch (e) {
        debugPrint('Notice syncing cancel exception to Supabase: $e');
      }
    }
  }

  Future<void> addExtraClass({
    required String subjectId,
    required String date,
    required String startTime,
    required String endTime,
    String? room,
    String? faculty,
    String? notes,
  }) async {
    final client = SupabaseService.client;
    final userId = SupabaseService.currentUserId ?? '';
    final semId = _activeSemester?.id;
    if (semId == null) return;

    final ex = TimetableException(
      id: _uuid.v4(),
      userId: userId,
      semesterId: semId,
      subjectId: subjectId,
      exceptionDate: date,
      exceptionType: 'extra',
      startTime: startTime,
      endTime: endTime,
      room: room,
      faculty: faculty,
      notes: notes,
    );

    _exceptions.add(ex);
    notifyListeners();

    final db = await _db.database;
    await db.insert(
      'cached_timetable_exceptions',
      ex.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );

    await SyncEngine.instance.queueOperation(
      operationType: 'UPSERT_TIMETABLE_EXCEPTION',
      entityId: ex.id,
      payload: ex.toSupabaseMap(),
    );

    if (SupabaseService.isAuthenticated && ConnectivityService.instance.isOnline) {
      try {
        await client.from('timetable_exceptions').insert(ex.toSupabaseMap());
      } catch (e) {
        debugPrint('Notice syncing extra exception to Supabase: $e');
      }
    }
  }

  Future<void> rescheduleClass({
    required String slotId,
    required String originalDate,
    required String replacementDate,
    required String replacementStartTime,
    required String replacementEndTime,
    String? room,
    String? faculty,
    String? notes,
  }) async {
    final client = SupabaseService.client;
    final userId = SupabaseService.currentUserId ?? '';
    final semId = _activeSemester?.id;
    if (semId == null) return;

    final ex = TimetableException(
      id: _uuid.v4(),
      userId: userId,
      semesterId: semId,
      timetableSlotId: slotId,
      exceptionDate: originalDate,
      exceptionType: 'rescheduled',
      replacementDate: replacementDate,
      replacementStartTime: replacementStartTime,
      replacementEndTime: replacementEndTime,
      room: room,
      faculty: faculty,
      notes: notes,
    );

    _exceptions.add(ex);
    notifyListeners();

    final db = await _db.database;
    await db.insert(
      'cached_timetable_exceptions',
      ex.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );

    await SyncEngine.instance.queueOperation(
      operationType: 'UPSERT_TIMETABLE_EXCEPTION',
      entityId: ex.id,
      payload: ex.toSupabaseMap(),
    );

    if (SupabaseService.isAuthenticated && ConnectivityService.instance.isOnline) {
      try {
        await client.from('timetable_exceptions').insert(ex.toSupabaseMap());
      } catch (e) {
        debugPrint('Notice syncing reschedule exception to Supabase: $e');
      }
    }
  }
}
