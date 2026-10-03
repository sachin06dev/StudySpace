import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';
import '../database/database_helper.dart';
import '../services/connectivity_service.dart';
import '../supabase/supabase_client.dart';

enum SyncState { idle, syncing, offline, error }

class SyncEngine extends ChangeNotifier {
  static final SyncEngine instance = SyncEngine._internal();
  SyncEngine._internal() {
    _init();
  }

  SyncState _state = SyncState.idle;
  SyncState get state => _state;

  int _pendingCount = 0;
  int get pendingCount => _pendingCount;

  String? _lastError;
  String? get lastError => _lastError;

  void _init() {
    ConnectivityService.instance.onlineStream.listen((isOnline) {
      if (isOnline) {
        processQueue();
      } else {
        _state = SyncState.offline;
        notifyListeners();
      }
    });
    refreshPendingCount();
  }

  Future<void> refreshPendingCount() async {
    final pending = await DatabaseHelper.instance.getPendingSyncItems();
    _pendingCount = pending.length;
    notifyListeners();
  }

  Future<void> queueOperation({
    required String operationType,
    required String entityId,
    required Map<String, dynamic> payload,
  }) async {
    final idempotencyKey = '${operationType}_$entityId';
    await DatabaseHelper.instance.enqueueSync(
      id: const Uuid().v4(),
      actionType: operationType,
      idempotencyKey: idempotencyKey,
      payload: payload,
    );
    await refreshPendingCount();
  }

  Future<void> sync() => processQueue();

  Future<void> processQueue() async {
    if (!ConnectivityService.instance.isOnline) {
      _state = SyncState.offline;
      notifyListeners();
      return;
    }

    if (!SupabaseService.isAuthenticated) {
      return;
    }

    final items = await DatabaseHelper.instance.getPendingSyncItems();
    if (items.isEmpty) {
      _state = SyncState.idle;
      _pendingCount = 0;
      notifyListeners();
      return;
    }

    _state = SyncState.syncing;
    notifyListeners();

    final client = SupabaseService.client;
    final userId = SupabaseService.currentUserId;
    if (userId == null) return;

    for (final item in items) {
      final itemId = item['id'] as String;
      final actionType = item['action_type'] as String;
      final retryCount = item['retry_count'] as int;
      final payload = jsonDecode(item['payload'] as String) as Map<String, dynamic>;

      try {
        switch (actionType) {
          // Semester actions
          case 'DELETE_SEMESTER':
            final semesterId = payload['id'] as String;
            await client.from('semesters').delete().eq('id', semesterId).eq('user_id', userId);
            break;

          case 'SET_ACTIVE_SEMESTER':
            final semId = payload['id'] as String;
            await client.from('semesters').update({'is_active': false}).eq('user_id', userId);
            await client
                .from('semesters')
                .update({'is_active': true})
                .eq('id', semId)
                .eq('user_id', userId);
            break;

          // Attendance actions
          case 'UPSERT_ATTENDANCE':
            payload['user_id'] = userId;
            await client.from('attendance_records').upsert(payload);
            break;

          case 'DELETE_ATTENDANCE':
            final recordId = payload['id'] as String;
            await client
                .from('attendance_records')
                .delete()
                .eq('id', recordId)
                .eq('user_id', userId);
            break;

          // Subject actions
          case 'UPSERT_SUBJECT':
            payload['user_id'] = userId;
            await client.from('subjects').upsert(payload);
            break;

          case 'ARCHIVE_SUBJECT':
            final subjectId = payload['id'] as String;
            // 1. Remove recurring slots
            await client.from('timetable_slots').delete().eq('subject_id', subjectId).eq('user_id', userId);
            // 2. Mark archived
            await client
                .from('subjects')
                .update({'is_archived': true, 'updated_at': DateTime.now().toIso8601String()})
                .eq('id', subjectId)
                .eq('user_id', userId);
            break;

          case 'DELETE_SUBJECT':
            final subjectId = payload['id'] as String;
            await client.from('subjects').delete().eq('id', subjectId).eq('user_id', userId);
            break;

          // Slot actions
          case 'UPSERT_TIMETABLE_SLOT':
            payload['user_id'] = userId;
            await client.from('timetable_slots').upsert(payload);
            break;

          case 'DELETE_TIMETABLE_SLOT':
            final slotId = payload['id'] as String;
            await client.from('timetable_slots').delete().eq('id', slotId).eq('user_id', userId);
            break;

          // Exception actions
          case 'UPSERT_TIMETABLE_EXCEPTION':
            payload['user_id'] = userId;
            await client.from('timetable_exceptions').upsert(payload);
            break;

          case 'DELETE_TIMETABLE_EXCEPTION':
            final exId = payload['id'] as String;
            await client.from('timetable_exceptions').delete().eq('id', exId).eq('user_id', userId);
            break;

          // Task actions
          case 'UPSERT_TASK':
            payload['user_id'] = userId;
            await client.from('tasks').upsert(payload);
            break;

          case 'DELETE_TASK':
            final taskId = payload['id'] as String;
            await client.from('tasks').delete().eq('id', taskId).eq('user_id', userId);
            break;

          // Pomodoro session actions
          case 'UPSERT_POMODORO':
            payload['user_id'] = userId;
            await client.from('pomodoro_sessions').upsert(payload);
            break;

          // Video timestamp notes actions
          case 'UPSERT_NOTE':
            payload['user_id'] = userId;
            await client.from('video_timestamp_notes').upsert(payload);
            break;

          case 'DELETE_NOTE':
            final noteId = payload['id'] as String;
            await client.from('video_timestamp_notes').delete().eq('id', noteId).eq('user_id', userId);
            break;

          // Website Resources actions (Web Parity)
          case 'UPSERT_RESOURCE':
            payload['user_id'] = userId;
            await client.from('website_resources').upsert(payload);
            break;

          case 'DELETE_RESOURCE':
            final resourceId = payload['id'] as String;
            await client.from('website_resources').delete().eq('id', resourceId).eq('user_id', userId);
            break;

          // Saved Playlist actions (Web Parity)
          case 'UPSERT_PLAYLIST':
            payload['user_id'] = userId;
            await client.from('saved_playlists').upsert(payload);
            break;

          case 'DELETE_PLAYLIST':
            final playlistId = payload['id'] as String;
            await client.from('saved_playlists').delete().eq('id', playlistId).eq('user_id', userId);
            break;

          default:
            debugPrint('Unknown sync action type: $actionType');
        }

        // Successfully synced -> remove from queue
        await DatabaseHelper.instance.removeSyncItem(itemId);
      } catch (e) {
        debugPrint('SyncEngine error for item $itemId ($actionType): $e');
        _lastError = e.toString();
        await DatabaseHelper.instance.markSyncFailed(itemId, retryCount);
      }
    }

    await refreshPendingCount();
    _state = _pendingCount == 0 ? SyncState.idle : SyncState.error;
    notifyListeners();
  }
}
