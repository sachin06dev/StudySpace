import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:sqflite/sqflite.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../database/database_helper.dart';
import '../supabase/supabase_client.dart';
import '../../attendance/models/attendance_record.dart';
import '../../study/models/study_document.dart';
import '../../tasks/models/task.dart';

enum RealtimeEventType { insert, update, delete }

class RealtimeAttendanceEvent {
  final RealtimeEventType type;
  final AttendanceRecord? record;
  final String recordId;

  RealtimeAttendanceEvent({
    required this.type,
    this.record,
    required this.recordId,
  });
}

class RealtimeDocumentEvent {
  final RealtimeEventType type;
  final StudyDocument? document;
  final String documentId;

  RealtimeDocumentEvent({
    required this.type,
    this.document,
    required this.documentId,
  });
}

class RealtimeTaskEvent {
  final RealtimeEventType type;
  final Task? task;
  final String taskId;

  RealtimeTaskEvent({
    required this.type,
    this.task,
    required this.taskId,
  });
}

class RealtimeTimetableEvent {
  final String table;
  final RealtimeEventType type;
  final String entityId;
  final Map<String, dynamic> record;

  RealtimeTimetableEvent({
    required this.table,
    required this.type,
    required this.entityId,
    required this.record,
  });
}

class RealtimePomodoroEvent {
  final String table;
  final RealtimeEventType type;
  final Map<String, dynamic> record;

  RealtimePomodoroEvent({
    required this.table,
    required this.type,
    required this.record,
  });
}

class RealtimeStudyEvent {
  final String table;
  final RealtimeEventType type;
  final String entityId;
  final Map<String, dynamic> record;

  RealtimeStudyEvent({
    required this.table,
    required this.type,
    required this.entityId,
    required this.record,
  });
}

class RealtimeSyncService {
  static final RealtimeSyncService instance = RealtimeSyncService._internal();
  RealtimeSyncService._internal();

  RealtimeChannel? _channel;
  String? _activeUserId;
  bool _isConnecting = false;

  final _attendanceController = StreamController<RealtimeAttendanceEvent>.broadcast();
  Stream<RealtimeAttendanceEvent> get attendanceEvents => _attendanceController.stream;

  final _documentController = StreamController<RealtimeDocumentEvent>.broadcast();
  Stream<RealtimeDocumentEvent> get documentEvents => _documentController.stream;

  final _taskController = StreamController<RealtimeTaskEvent>.broadcast();
  Stream<RealtimeTaskEvent> get taskEvents => _taskController.stream;

  final _timetableController = StreamController<RealtimeTimetableEvent>.broadcast();
  Stream<RealtimeTimetableEvent> get timetableEvents => _timetableController.stream;

  final _pomodoroController = StreamController<RealtimePomodoroEvent>.broadcast();
  Stream<RealtimePomodoroEvent> get pomodoroEvents => _pomodoroController.stream;

  final _studyController = StreamController<RealtimeStudyEvent>.broadcast();
  Stream<RealtimeStudyEvent> get studyEvents => _studyController.stream;

  final _deviceRevocationController = StreamController<String>.broadcast();
  Stream<String> get deviceRevocationEvents => _deviceRevocationController.stream;

  bool get isActive => _channel != null;
  String? get activeUserId => _activeUserId;

  static const List<String> _userScopedTables = [
    'attendance_records',
    'documents',
    'tasks',
    'semesters',
    'subjects',
    'timetable_slots',
    'timetable_exceptions',
    'pomodoro_sessions',
    'user_settings',
    'website_resources',
    'saved_playlists',
    'saved_videos',
    'video_timestamp_notes',
    'user_devices',
  ];

  Future<void> start(String userId) async {
    if (_activeUserId == userId && _channel != null) {
      return;
    }

    if (_isConnecting) return;
    _isConnecting = true;

    try {
      await stop();

      _activeUserId = userId;
      final client = SupabaseService.client;
      final channelName = 'realtime_mobile_full_${userId}_${DateTime.now().millisecondsSinceEpoch}';
      final channel = client.channel(channelName);

      for (final table in _userScopedTables) {
        channel.onPostgresChanges(
          event: PostgresChangeEvent.all,
          schema: 'public',
          table: table,
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'user_id',
            value: userId,
          ),
          callback: (payload) {
            _dispatchTableChange(table, payload, userId);
          },
        );
      }

      channel.subscribe((status, [error]) {
        debugPrint('[RealtimeSyncService] Full sync channel status: $status, error: $error');
      });

      _channel = channel;
    } catch (e) {
      debugPrint('[RealtimeSyncService] Failed to start full realtime sync: $e');
    } finally {
      _isConnecting = false;
    }
  }

  Future<void> _dispatchTableChange(
    String table,
    PostgresChangePayload payload,
    String userId,
  ) async {
    try {
      final isDelete = payload.eventType == PostgresChangeEvent.delete;
      final raw = isDelete ? payload.oldRecord : payload.newRecord;
      final entityId = (raw['id'] ?? payload.oldRecord['id'] ?? payload.newRecord['id']) as String?;

      // Check if there is an un-synced offline action in sync_queue for this entity
      if (entityId != null) {
        final pending = await DatabaseHelper.instance.getPendingSyncItems();
        final hasPending = pending.any((item) =>
            item['payload'].toString().contains(entityId));
        if (hasPending) {
          debugPrint('[RealtimeSyncService] Skipping $table echo for $entityId due to pending local mutation');
          return;
        }
      }

      final eventType = isDelete
          ? RealtimeEventType.delete
          : (payload.eventType == PostgresChangeEvent.insert
              ? RealtimeEventType.insert
              : RealtimeEventType.update);

      final db = await DatabaseHelper.instance.database;

      // 1. Attendance Records
      if (table == 'attendance_records') {
        if (entityId == null) return;
        if (isDelete) {
          await db.delete('cached_attendance_records', where: 'id = ?', whereArgs: [entityId]);
          _attendanceController.add(RealtimeAttendanceEvent(type: RealtimeEventType.delete, recordId: entityId));
        } else {
          final record = AttendanceRecord.fromMap(raw);
          await db.insert('cached_attendance_records', record.toMap(), conflictAlgorithm: ConflictAlgorithm.replace);
          _attendanceController.add(RealtimeAttendanceEvent(type: eventType, record: record, recordId: entityId));
        }
        return;
      }

      // 2. Documents
      if (table == 'documents') {
        if (entityId == null) return;
        if (isDelete) {
          await db.delete('cached_documents', where: 'id = ?', whereArgs: [entityId]);
          _documentController.add(RealtimeDocumentEvent(type: RealtimeEventType.delete, documentId: entityId));
        } else {
          final doc = StudyDocument.fromMap(raw);
          await DatabaseHelper.instance.insertCachedDocument(doc.toMap());
          _documentController.add(RealtimeDocumentEvent(type: eventType, document: doc, documentId: entityId));
        }
        return;
      }

      // 3. Tasks
      if (table == 'tasks') {
        if (entityId == null) return;
        if (isDelete) {
          await db.delete('cached_tasks', where: 'id = ?', whereArgs: [entityId]);
          _taskController.add(RealtimeTaskEvent(type: RealtimeEventType.delete, taskId: entityId));
        } else {
          final task = Task.fromMap(raw);
          await db.insert('cached_tasks', task.toMap(), conflictAlgorithm: ConflictAlgorithm.replace);
          _taskController.add(RealtimeTaskEvent(type: eventType, task: task, taskId: entityId));
        }
        return;
      }

      // 4. Timetable (semesters, subjects, timetable_slots, timetable_exceptions)
      if (table == 'semesters' ||
          table == 'subjects' ||
          table == 'timetable_slots' ||
          table == 'timetable_exceptions') {
        final cacheTable = 'cached_$table';
        if (entityId != null) {
          if (isDelete) {
            await db.delete(cacheTable, where: 'id = ?', whereArgs: [entityId]);
          } else {
            await db.insert(cacheTable, raw, conflictAlgorithm: ConflictAlgorithm.replace);
          }
        }
        _timetableController.add(RealtimeTimetableEvent(
          table: table,
          type: eventType,
          entityId: entityId ?? '',
          record: raw,
        ));
        return;
      }

      // 5. Pomodoro sessions & User Settings
      if (table == 'pomodoro_sessions' || table == 'user_settings') {
        if (table == 'pomodoro_sessions' && entityId != null) {
          if (isDelete) {
            await db.delete('cached_pomodoro_sessions', where: 'id = ?', whereArgs: [entityId]);
          } else {
            await db.insert('cached_pomodoro_sessions', raw, conflictAlgorithm: ConflictAlgorithm.replace);
          }
        }
        _pomodoroController.add(RealtimePomodoroEvent(
          table: table,
          type: eventType,
          record: raw,
        ));
        return;
      }

      // 6. Study (website_resources, saved_playlists, saved_videos, video_timestamp_notes)
      if (table == 'website_resources' ||
          table == 'saved_playlists' ||
          table == 'saved_videos' ||
          table == 'video_timestamp_notes') {
        String cacheTable;
        if (table == 'website_resources') {
          cacheTable = 'cached_website_resources';
        } else if (table == 'saved_playlists') {
          cacheTable = 'cached_saved_playlists';
        } else if (table == 'saved_videos') {
          cacheTable = 'cached_saved_videos';
        } else {
          cacheTable = 'cached_video_notes';
        }

        if (entityId != null) {
          if (isDelete) {
            await db.delete(cacheTable, where: 'id = ?', whereArgs: [entityId]);
          } else {
            await db.insert(cacheTable, raw, conflictAlgorithm: ConflictAlgorithm.replace);
          }
        }

        _studyController.add(RealtimeStudyEvent(
          table: table,
          type: eventType,
          entityId: entityId ?? '',
          record: raw,
        ));
        return;
      }

      // 7. Device session revocation / removal
      if (table == 'user_devices') {
        final prefs = await SharedPreferences.getInstance();
        final currentDeviceId = prefs.getString('studyspace_mobile_device_id');
        if (currentDeviceId != null && currentDeviceId.isNotEmpty) {
          final targetDeviceId =
              (isDelete ? payload.oldRecord['device_id'] : raw['device_id'])?.toString();
          final isRevoked = raw['is_revoked'] == true || raw['is_revoked'] == 1;

          if (targetDeviceId == currentDeviceId && (isDelete || isRevoked)) {
            debugPrint(
                '[RealtimeSyncService] Mobile device session was removed/revoked from another client. Emitting revocation...');
            _deviceRevocationController.add(currentDeviceId);
          }
        }
        return;
      }
    } catch (e) {
      debugPrint('[RealtimeSyncService] Error dispatching table change for $table: $e');
    }
  }

  Future<void> stop() async {
    if (_channel != null) {
      try {
        await SupabaseService.client.removeChannel(_channel!);
      } catch (e) {
        debugPrint('[RealtimeSyncService] Error removing channel: $e');
      }
      _channel = null;
    }
    _activeUserId = null;
  }
}
