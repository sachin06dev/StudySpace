import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';
import '../models/task.dart';
import '../../core/database/database_helper.dart';
import '../../core/realtime/realtime_sync_service.dart';
import '../../core/supabase/supabase_client.dart';
import '../../core/sync/sync_engine.dart';

class TasksProvider extends ChangeNotifier {
  final _uuid = const Uuid();
  final DatabaseHelper _db = DatabaseHelper.instance;
  StreamSubscription<RealtimeTaskEvent>? _realtimeSub;

  List<Task> _tasks = [];
  List<Task> get tasks => _tasks;

  List<Task> get pendingTasks => _tasks.where((t) => !t.isCompleted).toList();
  List<Task> get completedTasks => _tasks.where((t) => t.isCompleted).toList();

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  TasksProvider() {
    _initRealtimeListener();
    loadTasks();
  }

  void _initRealtimeListener() {
    _realtimeSub?.cancel();
    _realtimeSub = RealtimeSyncService.instance.taskEvents.listen((event) {
      if (event.type == RealtimeEventType.delete) {
        _tasks.removeWhere((t) => t.id == event.taskId);
        notifyListeners();
      } else if (event.task != null) {
        final idx = _tasks.indexWhere((t) => t.id == event.task!.id);
        if (idx != -1) {
          _tasks[idx] = event.task!;
        } else {
          _tasks.insert(0, event.task!);
        }
        notifyListeners();
      }
    });
  }

  @override
  void dispose() {
    _realtimeSub?.cancel();
    super.dispose();
  }

  Future<void> loadTasks() async {
    _isLoading = true;
    notifyListeners();

    try {
      // 1. Instant local read from SQLite
      final db = await _db.database;
      final cachedRows = await db.query('cached_tasks', orderBy: 'created_at DESC');
      if (cachedRows.isNotEmpty) {
        _tasks = cachedRows.map((r) => Task.fromMap(r)).toList();
        _isLoading = false;
        notifyListeners();
      }

      // 2. Fetch remote if authenticated
      if (SupabaseService.isAuthenticated) {
        final client = SupabaseService.client;
        final userId = SupabaseService.currentUserId;
        if (userId != null) {
          final res = await client
              .from('tasks')
              .select()
              .eq('user_id', userId)
              .order('created_at', ascending: false);

          final remoteTasks = (res as List).map((r) => Task.fromMap(r)).toList();
          _tasks = remoteTasks;

          // Sync cache with remote to prune removed rows
          await _db.syncCacheTable(
            'cached_tasks',
            remoteTasks.map((t) => t.toMap()).toList(),
          );
        }
      }
    } catch (e) {
      debugPrint('Error loading tasks: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> toggleTaskStatus(Task task) async {
    final newStatus = task.isCompleted ? 'pending' : 'completed';
    final completedAt = newStatus == 'completed' ? DateTime.now().toIso8601String() : null;
    final now = DateTime.now().toIso8601String();

    final updatedTask = Task(
      id: task.id,
      userId: task.userId,
      title: task.title,
      description: task.description,
      status: newStatus,
      priority: task.priority,
      dueDate: task.dueDate,
      completedAt: completedAt,
      createdAt: task.createdAt,
      updatedAt: now,
    );

    // 1. Optimistic update
    final index = _tasks.indexWhere((t) => t.id == task.id);
    if (index >= 0) {
      _tasks[index] = updatedTask;
      notifyListeners();
    }

    // 2. SQLite local update
    try {
      final db = await _db.database;
      await db.update(
        'cached_tasks',
        updatedTask.toMap(),
        where: 'id = ?',
        whereArgs: [task.id],
      );
    } catch (e) {
      debugPrint('Error updating local task: $e');
    }

    // 3. Queue in SyncEngine
    await SyncEngine.instance.queueOperation(
      operationType: 'UPSERT_TASK',
      entityId: task.id,
      payload: updatedTask.toSupabaseMap(),
    );

    // 4. Trigger sync
    SyncEngine.instance.sync();
  }

  Future<void> addTask({
    required String title,
    String? description,
    String priority = 'medium',
    String? dueDate,
  }) async {
    final userId = SupabaseService.currentUserId ?? 'offline-user';
    final now = DateTime.now().toIso8601String();

    final task = Task(
      id: _uuid.v4(),
      userId: userId,
      title: title,
      description: description,
      status: 'pending',
      priority: priority,
      dueDate: dueDate,
      createdAt: now,
      updatedAt: now,
    );

    // 1. Optimistic insert
    _tasks.insert(0, task);
    notifyListeners();

    // 2. SQLite local insert
    try {
      final db = await _db.database;
      await db.insert('cached_tasks', task.toMap());
    } catch (e) {
      debugPrint('Error caching local task: $e');
    }

    // 3. Queue in SyncEngine
    await SyncEngine.instance.queueOperation(
      operationType: 'UPSERT_TASK',
      entityId: task.id,
      payload: task.toSupabaseMap(),
    );

    // 4. Trigger sync
    SyncEngine.instance.sync();
  }

  Future<void> updateTask(Task task) async {
    final now = DateTime.now().toIso8601String();
    final updated = Task(
      id: task.id,
      userId: task.userId,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      completedAt: task.completedAt,
      createdAt: task.createdAt,
      updatedAt: now,
    );

    final idx = _tasks.indexWhere((t) => t.id == task.id);
    if (idx >= 0) {
      _tasks[idx] = updated;
      notifyListeners();
    }

    try {
      final db = await _db.database;
      await db.update('cached_tasks', updated.toMap(), where: 'id = ?', whereArgs: [task.id]);
    } catch (e) {
      debugPrint('Error updating local task: $e');
    }

    await SyncEngine.instance.queueOperation(
      operationType: 'UPSERT_TASK',
      entityId: task.id,
      payload: updated.toSupabaseMap(),
    );

    SyncEngine.instance.sync();
  }

  Future<void> deleteTask(String taskId) async {
    _tasks.removeWhere((t) => t.id == taskId);
    notifyListeners();

    try {
      final db = await _db.database;
      await db.delete('cached_tasks', where: 'id = ?', whereArgs: [taskId]);
    } catch (e) {
      debugPrint('Error deleting local task: $e');
    }

    await SyncEngine.instance.queueOperation(
      operationType: 'DELETE_TASK',
      entityId: taskId,
      payload: {'id': taskId},
    );

    SyncEngine.instance.sync();
  }
}
