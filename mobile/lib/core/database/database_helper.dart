import 'dart:convert';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._internal();
  static Database? _database;

  DatabaseHelper._internal();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, 'studyspace_offline.db');

    return await openDatabase(
      path,
      version: 7,
      onCreate: _createDb,
      onUpgrade: _onUpgrade,
    );
  }

  Future<void> _createDb(Database db, int version) async {
    // 1. Semesters
    await db.execute('''
      CREATE TABLE cached_semesters (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 0,
        created_at TEXT,
        updated_at TEXT
      )
    ''');

    // 2. Subjects (includes is_archived)
    await db.execute('''
      CREATE TABLE cached_subjects (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        semester_id TEXT NOT NULL,
        name TEXT NOT NULL,
        code TEXT,
        faculty TEXT,
        default_room TEXT,
        class_type TEXT NOT NULL DEFAULT 'theory',
        credits REAL,
        target_percentage REAL,
        baseline_attended INTEGER NOT NULL DEFAULT 0,
        baseline_total INTEGER NOT NULL DEFAULT 0,
        is_archived INTEGER NOT NULL DEFAULT 0,
        created_at TEXT,
        updated_at TEXT
      )
    ''');

    // 3. Timetable Slots
    await db.execute('''
      CREATE TABLE cached_timetable_slots (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        semester_id TEXT NOT NULL,
        subject_id TEXT NOT NULL,
        day_of_week INTEGER NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        room_override TEXT,
        faculty_override TEXT,
        class_type_override TEXT,
        created_at TEXT,
        updated_at TEXT
      )
    ''');

    // 4. Timetable Exceptions
    await db.execute('''
      CREATE TABLE cached_timetable_exceptions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        semester_id TEXT NOT NULL,
        timetable_slot_id TEXT,
        exception_date TEXT NOT NULL,
        exception_type TEXT NOT NULL,
        start_time TEXT,
        end_time TEXT,
        replacement_date TEXT,
        replacement_start_time TEXT,
        replacement_end_time TEXT,
        subject_id TEXT,
        room TEXT,
        faculty TEXT,
        notes TEXT,
        created_at TEXT,
        updated_at TEXT
      )
    ''');

    // 5. Attendance Records
    await db.execute('''
      CREATE TABLE cached_attendance_records (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        semester_id TEXT NOT NULL,
        subject_id TEXT NOT NULL,
        timetable_slot_id TEXT,
        class_date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        status TEXT NOT NULL,
        notes TEXT,
        created_at TEXT,
        updated_at TEXT
      )
    ''');

    // 6. Tasks
    await db.execute('''
      CREATE TABLE cached_tasks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        priority TEXT NOT NULL DEFAULT 'medium',
        due_date TEXT,
        completed_at TEXT,
        created_at TEXT,
        updated_at TEXT
      )
    ''');

    // 7. Pomodoro Sessions
    await db.execute('''
      CREATE TABLE cached_pomodoro_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        session_type TEXT NOT NULL,
        planned_seconds INTEGER NOT NULL,
        actual_seconds INTEGER NOT NULL DEFAULT 0,
        started_at TEXT NOT NULL,
        completed_at TEXT,
        status TEXT NOT NULL,
        created_at TEXT
      )
    ''');

    // 8. Saved Videos
    await db.execute('''
      CREATE TABLE cached_saved_videos (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        video_id TEXT NOT NULL,
        youtube_video_id TEXT,
        title TEXT NOT NULL,
        description TEXT,
        thumbnail_url TEXT,
        channel_name TEXT,
        channel_id TEXT,
        duration_seconds INTEGER,
        watch_progress_seconds INTEGER DEFAULT 0,
        status TEXT DEFAULT 'saved',
        last_watched_at TEXT,
        created_at TEXT
      )
    ''');

    // 9. Contextual Video Notes
    await db.execute('''
      CREATE TABLE cached_video_notes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        video_id TEXT NOT NULL,
        timestamp_seconds INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT,
        updated_at TEXT
      )
    ''');

    // 10. Idempotent Offline Sync Queue
    await db.execute('''
      CREATE TABLE sync_queue (
        id TEXT PRIMARY KEY,
        action_type TEXT NOT NULL,
        idempotency_key TEXT UNIQUE NOT NULL,
        payload TEXT NOT NULL,
        created_at TEXT NOT NULL,
        retry_count INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pending'
      )
    ''');

    // 11. Website Resources (Web Parity)
    await db.execute('''
      CREATE TABLE cached_website_resources (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        description TEXT,
        category TEXT,
        favicon_url TEXT,
        created_at TEXT,
        updated_at TEXT
      )
    ''');

    // 12. Saved Playlists (Web Parity)
    await db.execute('''
      CREATE TABLE cached_saved_playlists (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        playlist_id TEXT NOT NULL,
        catalog_playlist_id TEXT,
        title TEXT NOT NULL,
        description TEXT,
        thumbnail_url TEXT,
        channel_name TEXT,
        video_count INTEGER DEFAULT 0,
        saved_at TEXT
      )
    ''');

    // 13. Study Documents (Academic Vault)
    await db.execute('''
      CREATE TABLE cached_documents (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        file_name TEXT NOT NULL,
        storage_key TEXT NOT NULL,
        storage_provider TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        file_size_bytes INTEGER NOT NULL,
        category TEXT,
        created_at TEXT,
        updated_at TEXT
      )
    ''');

    // Fast search indexes
    await db.execute('CREATE INDEX idx_cached_slots_day ON cached_timetable_slots (day_of_week)');
    await db.execute('CREATE INDEX idx_cached_attendance_date ON cached_attendance_records (class_date)');
    await db.execute('CREATE INDEX idx_cached_attendance_subject ON cached_attendance_records (subject_id)');
    await db.execute('CREATE INDEX idx_cached_tasks_user_status ON cached_tasks (user_id, status)');
    await db.execute('CREATE INDEX idx_cached_notes_video ON cached_video_notes (video_id)');
    await db.execute('CREATE INDEX idx_cached_resources_user ON cached_website_resources (user_id)');
    await db.execute('CREATE INDEX idx_cached_playlists_user ON cached_saved_playlists (user_id)');
    await db.execute('CREATE INDEX idx_cached_documents_user ON cached_documents (user_id)');
  }

  Future<void> _onUpgrade(Database db, int oldVersion, int newVersion) async {
    if (oldVersion < 2) {
      // Add is_archived to cached_subjects
      try {
        await db.execute('ALTER TABLE cached_subjects ADD COLUMN is_archived INTEGER NOT NULL DEFAULT 0');
      } catch (_) {}

      // Add cached_tasks
      await db.execute('''
        CREATE TABLE IF NOT EXISTS cached_tasks (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          priority TEXT NOT NULL DEFAULT 'medium',
          due_date TEXT,
          completed_at TEXT,
          created_at TEXT,
          updated_at TEXT
        )
      ''');

      // Add cached_pomodoro_sessions
      await db.execute('''
        CREATE TABLE IF NOT EXISTS cached_pomodoro_sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          session_type TEXT NOT NULL,
          planned_seconds INTEGER NOT NULL,
          actual_seconds INTEGER NOT NULL DEFAULT 0,
          started_at TEXT NOT NULL,
          completed_at TEXT,
          status TEXT NOT NULL,
          created_at TEXT
        )
      ''');

      // Add cached_saved_videos
      await db.execute('''
        CREATE TABLE IF NOT EXISTS cached_saved_videos (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          video_id TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          thumbnail_url TEXT,
          channel_name TEXT,
          channel_id TEXT,
          duration_seconds INTEGER,
          created_at TEXT
        )
      ''');

      // Add cached_video_notes
      await db.execute('''
        CREATE TABLE IF NOT EXISTS cached_video_notes (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          video_id TEXT NOT NULL,
          timestamp_seconds INTEGER NOT NULL,
          content TEXT NOT NULL,
          created_at TEXT,
          updated_at TEXT
        )
      ''');

      await db.execute('CREATE INDEX IF NOT EXISTS idx_cached_tasks_user_status ON cached_tasks (user_id, status)');
      await db.execute('CREATE INDEX IF NOT EXISTS idx_cached_notes_video ON cached_video_notes (video_id)');
    }

    if (oldVersion < 3) {
      try {
        await db.execute('ALTER TABLE cached_saved_videos ADD COLUMN watch_progress_seconds INTEGER DEFAULT 0');
      } catch (_) {}
      try {
        await db.execute("ALTER TABLE cached_saved_videos ADD COLUMN status TEXT DEFAULT 'saved'");
      } catch (_) {}
      try {
        await db.execute('ALTER TABLE cached_saved_videos ADD COLUMN last_watched_at TEXT');
      } catch (_) {}
    }

    if (oldVersion < 4) {
      await db.execute('''
        CREATE TABLE IF NOT EXISTS cached_website_resources (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          url TEXT NOT NULL,
          description TEXT,
          category TEXT,
          favicon_url TEXT,
          created_at TEXT,
          updated_at TEXT
        )
      ''');
      await db.execute('''
        CREATE TABLE IF NOT EXISTS cached_saved_playlists (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          playlist_id TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          thumbnail_url TEXT,
          channel_name TEXT,
          video_count INTEGER DEFAULT 0,
          saved_at TEXT
        )
      ''');
      try {
        await db.execute('CREATE INDEX IF NOT EXISTS idx_cached_resources_user ON cached_website_resources (user_id)');
        await db.execute('CREATE INDEX IF NOT EXISTS idx_cached_playlists_user ON cached_saved_playlists (user_id)');
      } catch (_) {}
    }

    if (oldVersion < 5) {
      try {
        await db.execute('ALTER TABLE cached_saved_videos ADD COLUMN youtube_video_id TEXT');
      } catch (_) {}
    }

    if (oldVersion < 6) {
      await db.execute('''
        CREATE TABLE IF NOT EXISTS cached_documents (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          file_name TEXT NOT NULL,
          storage_key TEXT NOT NULL,
          storage_provider TEXT NOT NULL,
          mime_type TEXT NOT NULL,
          file_size_bytes INTEGER NOT NULL,
          category TEXT,
          created_at TEXT,
          updated_at TEXT
        )
      ''');
      try {
        await db.execute('CREATE INDEX IF NOT EXISTS idx_cached_documents_user ON cached_documents (user_id)');
      } catch (_) {}
    }

    if (oldVersion < 7) {
      try {
        await db.execute('ALTER TABLE cached_saved_playlists ADD COLUMN catalog_playlist_id TEXT');
      } catch (_) {}
    }
  }

  // Generic Cache Upsert
  Future<void> cacheData(String table, List<Map<String, dynamic>> items) async {
    if (items.isEmpty) return;
    final db = await database;
    final batch = db.batch();
    for (final item in items) {
      batch.insert(table, item, conflictAlgorithm: ConflictAlgorithm.replace);
    }
    await batch.commit(noResult: true);
  }

  /// Synchronizes local table with fresh remote items, automatically deleting
  /// records that were removed on the remote server to prevent ghost entries.
  Future<void> syncCacheTable(
    String table,
    List<Map<String, dynamic>> remoteItems, {
    String? filterColumn,
    dynamic filterValue,
  }) async {
    final db = await database;
    final remoteIds = remoteItems.map((i) => i['id'] as String).toSet();

    await db.transaction((txn) async {
      // 1. Delete local items in scope that are NOT in remoteIds
      if (filterColumn != null && filterValue != null) {
        final localRows = await txn.query(
          table,
          columns: ['id'],
          where: '$filterColumn = ?',
          whereArgs: [filterValue],
        );
        for (final r in localRows) {
          final id = r['id'] as String;
          if (!remoteIds.contains(id)) {
            await txn.delete(table, where: 'id = ?', whereArgs: [id]);
          }
        }
      }

      // 2. Upsert fresh remote items
      final batch = txn.batch();
      for (final item in remoteItems) {
        batch.insert(table, item, conflictAlgorithm: ConflictAlgorithm.replace);
      }
      await batch.commit(noResult: true);
    });
  }

  // Semester deletion from cache (cascading all semester-scoped local tables)
  Future<void> deleteSemesterFromCache(String semesterId) async {
    final db = await database;
    await db.transaction((txn) async {
      await txn.delete('cached_attendance_records', where: 'semester_id = ?', whereArgs: [semesterId]);
      await txn.delete('cached_timetable_exceptions', where: 'semester_id = ?', whereArgs: [semesterId]);
      await txn.delete('cached_timetable_slots', where: 'semester_id = ?', whereArgs: [semesterId]);
      await txn.delete('cached_subjects', where: 'semester_id = ?', whereArgs: [semesterId]);
      await txn.delete('cached_semesters', where: 'id = ?', whereArgs: [semesterId]);
    });
  }

  // Subject deletion / archiving from cache
  Future<void> deleteSubjectFromCache(String subjectId) async {
    final db = await database;
    await db.transaction((txn) async {
      await txn.delete('cached_subjects', where: 'id = ?', whereArgs: [subjectId]);
      await txn.delete('cached_timetable_slots', where: 'subject_id = ?', whereArgs: [subjectId]);
    });
  }

  Future<void> archiveSubjectInCache(String subjectId) async {
    final db = await database;
    await db.transaction((txn) async {
      await txn.update(
        'cached_subjects',
        {'is_archived': 1},
        where: 'id = ?',
        whereArgs: [subjectId],
      );
      // Remove recurring timetable slots
      await txn.delete('cached_timetable_slots', where: 'subject_id = ?', whereArgs: [subjectId]);
    });
  }

  // Queue Mutation
  Future<void> enqueueSync({
    required String id,
    required String actionType,
    required String idempotencyKey,
    required Map<String, dynamic> payload,
  }) async {
    final db = await database;
    await db.insert(
      'sync_queue',
      {
        'id': id,
        'action_type': actionType,
        'idempotency_key': idempotencyKey,
        'payload': jsonEncode(payload),
        'created_at': DateTime.now().toIso8601String(),
        'retry_count': 0,
        'status': 'pending',
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  // Get Pending Sync Items
  Future<List<Map<String, dynamic>>> getPendingSyncItems() async {
    final db = await database;
    return await db.query(
      'sync_queue',
      where: 'status = ?',
      whereArgs: ['pending'],
      orderBy: 'created_at ASC',
    );
  }

  // Delete Synced Item
  Future<void> removeSyncItem(String id) async {
    final db = await database;
    await db.delete('sync_queue', where: 'id = ?', whereArgs: [id]);
  }

  // Mark Sync Item Failed
  Future<void> markSyncFailed(String id, int currentRetries) async {
    final db = await database;
    await db.update(
      'sync_queue',
      {
        'retry_count': currentRetries + 1,
        'status': currentRetries >= 5 ? 'dead_letter' : 'pending',
      },
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  // Clear cache on logout
  Future<void> clearAllCache() async {
    final db = await database;
    await db.delete('cached_semesters');
    await db.delete('cached_subjects');
    await db.delete('cached_timetable_slots');
    await db.delete('cached_timetable_exceptions');
    await db.delete('cached_attendance_records');
    await db.delete('cached_tasks');
    await db.delete('cached_pomodoro_sessions');
    await db.delete('cached_saved_videos');
    await db.delete('cached_video_notes');
    await db.delete('cached_website_resources');
    await db.delete('cached_saved_playlists');
    await db.delete('cached_documents');
    await db.delete('sync_queue');
  }

  // --- Study Documents Cache Methods ---

  Future<List<Map<String, dynamic>>> getCachedDocuments([String? userId]) async {
    final db = await database;
    if (userId != null && userId.isNotEmpty) {
      return await db.query(
        'cached_documents',
        where: 'user_id = ?',
        whereArgs: [userId],
        orderBy: 'created_at DESC',
      );
    }
    return await db.query(
      'cached_documents',
      orderBy: 'created_at DESC',
    );
  }

  Future<void> cacheDocuments(List<dynamic> items, {String? userId}) async {
    final list = items.map((e) {
      if (e is Map<String, dynamic>) return e;
      return (e as dynamic).toMap() as Map<String, dynamic>;
    }).toList();
    if (userId != null && userId.isNotEmpty) {
      await syncCacheTable('cached_documents', list, filterColumn: 'user_id', filterValue: userId);
    } else {
      await syncCacheTable('cached_documents', list);
    }
  }

  Future<void> insertCachedDocument(Map<String, dynamic> docMap) async {
    final db = await database;
    await db.insert('cached_documents', docMap, conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<void> deleteCachedDocument(String id) async {
    final db = await database;
    await db.delete('cached_documents', where: 'id = ?', whereArgs: [id]);
  }
}
