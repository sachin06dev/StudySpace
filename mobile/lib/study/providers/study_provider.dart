import 'dart:async';
import 'dart:convert';
import 'dart:io' as io;
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:uuid/uuid.dart';
import '../models/saved_playlist.dart';
import '../models/saved_video.dart';
import '../models/study_document.dart';
import '../models/video_note.dart';
import '../models/website_resource.dart';
import '../../core/config/env_config.dart';
import '../../core/database/database_helper.dart';
import '../../core/realtime/realtime_sync_service.dart';
import '../../core/supabase/supabase_client.dart';
import '../../core/sync/sync_engine.dart';

class StudyProvider extends ChangeNotifier {
  final DatabaseHelper _db = DatabaseHelper.instance;
  final _uuid = const Uuid();
  StreamSubscription<RealtimeDocumentEvent>? _realtimeSub;
  StreamSubscription<RealtimeStudyEvent>? _studySub;

  List<SavedVideo> _savedVideos = [];
  List<SavedVideo> get savedVideos => _savedVideos;

  List<SavedPlaylist> _savedPlaylists = [];
  List<SavedPlaylist> get savedPlaylists => _savedPlaylists;

  List<StudyDocument> _documents = [];
  List<StudyDocument> get documents => _documents;

  List<WebsiteResource> _resources = [];
  List<WebsiteResource> get resources => _resources;

  List<VideoNote> _notes = [];
  List<VideoNote> get notes => _notes;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  StudyProvider() {
    _initRealtimeListener();
    loadData();
  }

  void _initRealtimeListener() {
    _realtimeSub?.cancel();
    _realtimeSub = RealtimeSyncService.instance.documentEvents.listen((event) {
      _handleRealtimeDocumentEvent(event);
    });

    _studySub?.cancel();
    _studySub = RealtimeSyncService.instance.studyEvents.listen((_) {
      loadData();
    });
  }

  void _handleRealtimeDocumentEvent(RealtimeDocumentEvent event) {
    if (event.type == RealtimeEventType.delete) {
      _documents.removeWhere((d) => d.id == event.documentId);
      notifyListeners();
    } else if (event.document != null) {
      final newDoc = event.document!;
      final idx = _documents.indexWhere((d) => d.id == newDoc.id);
      if (idx != -1) {
        _documents[idx] = newDoc;
      } else {
        _documents.insert(0, newDoc);
      }
      notifyListeners();
    }
  }

  @override
  void dispose() {
    _realtimeSub?.cancel();
    _studySub?.cancel();
    super.dispose();
  }

  Future<void> loadData() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // 1. Instant local read from SQLite
      final db = await _db.database;

      // Saved Videos
      final cachedVideoRows = await db.query('cached_saved_videos');
      if (cachedVideoRows.isNotEmpty) {
        _savedVideos = cachedVideoRows.map((r) => SavedVideo.fromMap(r)).toList();
      }

      // Saved Playlists
      try {
        final cachedPlaylistRows = await db.query('cached_saved_playlists');
        if (cachedPlaylistRows.isNotEmpty) {
          _savedPlaylists = cachedPlaylistRows.map((r) => SavedPlaylist.fromMap(r)).toList();
        }
      } catch (_) {}

      // Documents
      try {
        final cachedDocRows = await _db.getCachedDocuments();
        if (cachedDocRows.isNotEmpty) {
          _documents = cachedDocRows.map((r) => StudyDocument.fromMap(r)).toList();
        }
      } catch (_) {}

      // Website Resources
      try {
        final cachedResourceRows = await db.query('cached_website_resources', orderBy: 'created_at DESC');
        if (cachedResourceRows.isNotEmpty) {
          _resources = cachedResourceRows.map((r) => WebsiteResource.fromMap(r)).toList();
        }
      } catch (_) {}

      // Video Notes
      final cachedNoteRows = await db.query('cached_video_notes', orderBy: 'created_at DESC');
      if (cachedNoteRows.isNotEmpty) {
        _notes = cachedNoteRows.map((r) => VideoNote.fromMap(r)).toList();
      }
      notifyListeners();

      // 2. Fetch fresh remote data if authenticated
      if (SupabaseService.isAuthenticated) {
        final userId = SupabaseService.currentUserId;
        if (userId != null) {
          final client = SupabaseService.client;

          // Saved videos
          try {
            final vRes = await client
                .from('saved_videos')
                .select('*, video:youtube_videos(*)')
                .eq('user_id', userId)
                .order('saved_at', ascending: false);

            final remoteVideos = (vRes as List).map((r) => SavedVideo.fromMap(r)).toList();
            _savedVideos = remoteVideos;
            await _db.syncCacheTable(
              'cached_saved_videos',
              remoteVideos.map((v) => v.toMap()).toList(),
            );
          } catch (e) {
            debugPrint('Remote videos fetch notice: $e');
          }

            // Saved playlists
          try {
            final pRes = await client
                .from('saved_playlists')
                .select('*, playlist:youtube_playlists(*)')
                .eq('user_id', userId)
                .order('saved_at', ascending: false);

            final rawList = pRes as List;

            // Build a supplemental count from playlist_items as a fallback
            // for playlists whose catalog row has video_count = 0.
            final playlistCatalogIds = rawList
                .map((r) => r['playlist_id'] as String?)
                .where((id) => id != null && id.isNotEmpty)
                .map((id) => id!)
                .toList();

            final countMap = <String, int>{};
            if (playlistCatalogIds.isNotEmpty) {
              try {
                final itemsData = await client
                    .from('playlist_items')
                    .select('playlist_id')
                    .inFilter('playlist_id', playlistCatalogIds);

                for (final item in (itemsData as List)) {
                  final pid = item['playlist_id'] as String?;
                  if (pid != null) {
                    countMap[pid] = (countMap[pid] ?? 0) + 1;
                  }
                }
              } catch (e) {
                debugPrint('Notice counting playlist items: $e');
              }
            }

            final remotePlaylists = rawList.map((r) {
              final pid = (r['playlist_id'] ?? '') as String;
              final playlistObj = r['playlist'] as Map<String, dynamic>?;

              // Prefer the catalog row's video_count (already maintained by
              // the server-side import job). Fall back to the runtime count
              // from playlist_items only when catalog says 0, then to 0.
              final catalogCount = (playlistObj?['video_count'] as num?)?.toInt() ?? 0;
              final runtimeCount = countMap[pid] ?? 0;
              final resolvedCount = catalogCount > 0 ? catalogCount : runtimeCount;

              final copy = Map<String, dynamic>.from(r as Map);
              copy['video_count'] = resolvedCount;
              return SavedPlaylist.fromMap(copy);
            }).toList();

            _savedPlaylists = remotePlaylists;
            await _db.syncCacheTable(
              'cached_saved_playlists',
              remotePlaylists.map((p) => p.toMap()).toList(),
            );

          } catch (e) {
            debugPrint('Remote playlists fetch notice: $e');
          }

          // Documents
          try {
            final docRes = await client
                .from('documents')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', ascending: false);

            final remoteDocs = (docRes as List).map((r) => StudyDocument.fromMap(r)).toList();
            _documents = remoteDocs;
            await _db.cacheDocuments(remoteDocs);
          } catch (e) {
            debugPrint('Remote documents fetch notice: $e');
          }

          // Website resources
          try {
            final rRes = await client
                .from('website_resources')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', ascending: false);

            final remoteResources = (rRes as List).map((r) => WebsiteResource.fromMap(r)).toList();
            _resources = remoteResources;
            await _db.syncCacheTable(
              'cached_website_resources',
              remoteResources.map((r) => r.toMap()).toList(),
            );
          } catch (e) {
            debugPrint('Remote resources fetch notice: $e');
          }

          // Video timestamp notes
          try {
            final nRes = await client
                .from('video_timestamp_notes')
                .select('*, video:youtube_videos(*)')
                .eq('user_id', userId)
                .order('created_at', ascending: false);

            final remoteNotes = (nRes as List).map((r) => VideoNote.fromMap(r)).toList();
            _notes = remoteNotes;
            await _db.syncCacheTable(
              'cached_video_notes',
              remoteNotes.map((n) => n.toMap()).toList(),
            );
          } catch (e) {
            debugPrint('Remote notes fetch notice: $e');
          }
        }
      }
    } catch (e) {
      debugPrint('Error loading study data: $e');
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // --- YouTube Video Methods ---

  Future<bool> addVideoFromUrl(String url) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final token = await SupabaseService.getValidAccessToken();
      if (token == null) {
        _errorMessage = 'User session expired or not authenticated. Please sign in again.';
        return false;
      }

      final baseUrl = await EnvConfig.getEffectiveWebApiBaseUrl();
      final uri = Uri.parse('$baseUrl/api/youtube/video');

      final headers = <String, String>{
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      };

      final response = await http
          .post(
            uri,
            headers: headers,
            body: jsonEncode({'url': url}),
          )
          .timeout(const Duration(seconds: 20));

      if (response.statusCode >= 200 && response.statusCode < 300) {
        await loadData();
        return true;
      } else {
        try {
          final body = jsonDecode(response.body);
          _errorMessage = body['error'] ?? 'Failed to add video.';
        } catch (_) {
          _errorMessage = 'Server returned error ${response.statusCode}';
        }
        return false;
      }
    } catch (e) {
      debugPrint('Error adding video: $e');
      _errorMessage = 'Network error: could not add video.';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> deleteVideo(String savedVideoId) async {
    _savedVideos.removeWhere((v) => v.id == savedVideoId);
    notifyListeners();

    try {
      final db = await _db.database;
      await db.delete('cached_saved_videos', where: 'id = ?', whereArgs: [savedVideoId]);
    } catch (e) {
      debugPrint('Error deleting cached video: $e');
    }

    if (SupabaseService.isAuthenticated) {
      try {
        await SupabaseService.client
            .from('saved_videos')
            .delete()
            .eq('id', savedVideoId);
      } catch (e) {
        debugPrint('Error deleting remote saved video: $e');
      }
    }
  }

  Future<void> updateVideoProgress(String savedVideoId, int progressSeconds, {String? status}) async {
    final idx = _savedVideos.indexWhere((v) => v.id == savedVideoId);
    if (idx != -1) {
      final existing = _savedVideos[idx];
      final newStatus = status ?? (progressSeconds > 0 ? (existing.durationSeconds > 0 && progressSeconds >= existing.durationSeconds - 10 ? 'completed' : 'in_progress') : existing.status);
      _savedVideos[idx] = existing.copyWith(
        watchProgressSeconds: progressSeconds,
        status: newStatus,
        lastWatchedAt: DateTime.now().toIso8601String(),
      );
      notifyListeners();

      try {
        final db = await _db.database;
        await db.update(
          'cached_saved_videos',
          {
            'progress_seconds': progressSeconds,
            'status': newStatus,
            'last_watched_at': DateTime.now().toIso8601String(),
          },
          where: 'id = ?',
          whereArgs: [savedVideoId],
        );
      } catch (e) {
        debugPrint('Error updating cached video progress: $e');
      }

      if (SupabaseService.isAuthenticated) {
        try {
          await SupabaseService.client
              .from('saved_videos')
              .update({
                'progress_seconds': progressSeconds,
                'status': newStatus,
                'last_watched_at': DateTime.now().toIso8601String(),
              })
              .eq('id', savedVideoId);
        } catch (e) {
          debugPrint('Error updating remote saved video progress: $e');
        }
      }
    }
  }

  // --- YouTube Playlist Methods ---

  Future<bool> addPlaylistFromUrl(String url) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final token = await SupabaseService.getValidAccessToken();
      if (token == null) {
        _errorMessage = 'User session expired or not authenticated. Please sign in again.';
        return false;
      }

      final baseUrl = await EnvConfig.getEffectiveWebApiBaseUrl();
      final uri = Uri.parse('$baseUrl/api/youtube/playlist');

      final headers = <String, String>{
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      };

      final response = await http
          .post(
            uri,
            headers: headers,
            body: jsonEncode({'url': url}),
          )
          .timeout(const Duration(seconds: 45));

      if (response.statusCode >= 200 && response.statusCode < 300) {
        await loadData();
        return true;
      } else {
        try {
          final body = jsonDecode(response.body);
          _errorMessage = body['error'] ?? 'Failed to add playlist.';
        } catch (_) {
          _errorMessage = 'Server returned error ${response.statusCode}';
        }
        return false;
      }
    } catch (e) {
      debugPrint('Error adding playlist: $e');
      _errorMessage = 'Network error: could not add playlist.';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> deletePlaylist(String savedPlaylistId) async {
    _savedPlaylists.removeWhere((p) => p.id == savedPlaylistId);
    notifyListeners();

    try {
      final db = await _db.database;
      await db.delete('cached_saved_playlists', where: 'id = ?', whereArgs: [savedPlaylistId]);
    } catch (e) {
      debugPrint('Error deleting cached playlist: $e');
    }

    if (SupabaseService.isAuthenticated) {
      try {
        await SupabaseService.client
            .from('saved_playlists')
            .delete()
            .eq('id', savedPlaylistId);
      } catch (e) {
        debugPrint('Error deleting remote saved playlist: $e');
      }
    }
  }

  // --- Document Vault Methods ---

  Future<String?> getDocumentDownloadUrl(String documentId) async {
    try {
      final token = await SupabaseService.getValidAccessToken();
      final baseUrl = await EnvConfig.getEffectiveWebApiBaseUrl();
      final uri = Uri.parse('$baseUrl/api/documents/url?id=$documentId');

      final headers = <String, String>{};
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }

      debugPrint('[DocumentView] Stage: REQUEST_SENT, Endpoint: /api/documents/url, DocId: $documentId');
      final response = await http.get(uri, headers: headers).timeout(const Duration(seconds: 10));
      debugPrint('[DocumentView] Stage: RESPONSE_RECEIVED, Status: ${response.statusCode}');

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final json = jsonDecode(response.body);
        if (json['success'] == true && json['data']?['url'] != null) {
          debugPrint('[DocumentView] Stage: PRESIGNED_GET_READY, DocId: $documentId');
          return json['data']['url'] as String;
        }
      } else {
        debugPrint('[DocumentView] Stage: ERROR_RESPONSE, Status: ${response.statusCode}');
      }
      return null;
    } catch (e) {
      debugPrint('[DocumentView] Stage: EXCEPTION, Error: $e');
      return null;
    }
  }

  Future<void> deleteDocument(String documentId) async {
    _documents.removeWhere((d) => d.id == documentId);
    notifyListeners();

    try {
      await _db.deleteCachedDocument(documentId);
    } catch (e) {
      debugPrint('Error deleting cached document: $e');
    }

    if (SupabaseService.isAuthenticated) {
      try {
        await SupabaseService.client
            .from('documents')
            .delete()
            .eq('id', documentId);
      } catch (e) {
        debugPrint('Error deleting remote document: $e');
      }
    }
  }

  /// Upload a PDF document to Academic Vault via presigned R2 URL with 10MB limit enforcement
  Future<StudyDocument?> uploadDocument({
    required String filePath,
    required String fileName,
    required int fileSizeBytes,
    required String title,
    String? category,
    String? description,
  }) async {
    // 1. Client-side validation: must be PDF and <= 10MB
    if (!fileName.toLowerCase().endsWith('.pdf')) {
      throw Exception('Only PDF files (.pdf) are supported.');
    }
    const maxSizeBytes = 10 * 1024 * 1024; // 10 MB
    if (fileSizeBytes > maxSizeBytes) {
      throw Exception('Mobile PDF uploads are limited to 10 MB.');
    }

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final token = await SupabaseService.getValidAccessToken();
      if (token == null) {
        throw Exception('Please sign in to upload documents.');
      }

      final baseUrl = await EnvConfig.getEffectiveWebApiBaseUrl();

      // 2. Request presigned upload URL from backend API
      final presignedUri = Uri.parse('$baseUrl/api/documents/upload-url');
      debugPrint('[DocumentUpload] Stage: REQUEST_UPLOAD_URL, Endpoint: /api/documents/upload-url');
      final presignedRes = await http.post(
        presignedUri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'fileName': fileName,
          'fileSizeBytes': fileSizeBytes,
          'mimeType': 'application/pdf',
        }),
      ).timeout(const Duration(seconds: 15));

      debugPrint('[DocumentUpload] Stage: UPLOAD_URL_RESPONSE, Status: ${presignedRes.statusCode}');
      if (presignedRes.statusCode != 200) {
        String msg = 'Failed to authorize document upload (HTTP ${presignedRes.statusCode}).';
        try {
          final errJson = jsonDecode(presignedRes.body);
          if (errJson is Map && errJson['error'] != null) {
            msg = errJson['error'].toString();
          }
        } catch (_) {}
        debugPrint('[DocumentUpload] Stage: UPLOAD_URL_ERROR, Status: ${presignedRes.statusCode}, Msg: $msg');
        throw Exception(msg);
      }

      final presignedData = jsonDecode(presignedRes.body)['data'];
      final documentId = presignedData['documentId'] as String;
      final uploadUrl = presignedData['uploadUrl'] as String;
      final storageKey = presignedData['storageKey'] as String;
      final storageProvider = presignedData['storageProvider'] as String? ?? 'r2';

      // 3. Direct binary upload to R2 via PUT (Safe logging: only short key and size)
      final fileBytes = await io.File(filePath).readAsBytes();
      final shortKey = storageKey.split('/').last;
      debugPrint('[DocumentUpload] Stage: R2_PUT_START, Key: $shortKey, Size: ${fileBytes.length}B');
      final uploadRes = await http.put(
        Uri.parse(uploadUrl),
        headers: {
          'Content-Type': 'application/pdf',
        },
        body: fileBytes,
      ).timeout(const Duration(seconds: 60));

      debugPrint('[DocumentUpload] Stage: R2_PUT_RESPONSE, Status: ${uploadRes.statusCode}');
      if (uploadRes.statusCode < 200 || uploadRes.statusCode >= 300) {
        debugPrint('[DocumentUpload] Stage: R2_PUT_ERROR, Status: ${uploadRes.statusCode}');
        throw Exception('Cloud storage upload failed (HTTP ${uploadRes.statusCode}).');
      }

      // 4. Save metadata record to backend API / Supabase
      final saveUri = Uri.parse('$baseUrl/api/documents');
      debugPrint('[DocumentUpload] Stage: SAVE_METADATA_REQUEST, Endpoint: /api/documents');
      final saveRes = await http.post(
        saveUri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'id': documentId,
          'title': title.trim().isNotEmpty ? title.trim() : fileName,
          'fileName': fileName,
          'storageKey': storageKey,
          'storageProvider': storageProvider,
          'fileSizeBytes': fileSizeBytes,
          'mimeType': 'application/pdf',
          'category': category ?? 'other',
          'description': description?.trim(),
        }),
      ).timeout(const Duration(seconds: 15));

      debugPrint('[DocumentUpload] Stage: SAVE_METADATA_RESPONSE, Status: ${saveRes.statusCode}');
      if (saveRes.statusCode != 200) {
        String msg = 'Failed to save document metadata (HTTP ${saveRes.statusCode}).';
        try {
          final errJson = jsonDecode(saveRes.body);
          if (errJson is Map && errJson['error'] != null) {
            msg = errJson['error'].toString();
          }
        } catch (_) {}
        debugPrint('[DocumentUpload] Stage: SAVE_METADATA_ERROR, Status: ${saveRes.statusCode}, Msg: $msg');
        throw Exception(msg);
      }

      final savedDocMap = jsonDecode(saveRes.body)['data'];
      final newDoc = StudyDocument.fromMap(savedDocMap);
      debugPrint('[DocumentUpload] Stage: SUCCESS, DocId: $documentId');

      // 5. Update local in-memory state & SQLite cache
      _documents.insert(0, newDoc);
      await _db.insertCachedDocument(newDoc.toMap());
      notifyListeners();

      return newDoc;
    } catch (e) {
      debugPrint('Error uploading document: $e');
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // --- Website Resources Methods (Web Parity + Offline First) ---

  Future<WebsiteResource> addResource({
    required String url,
    required String title,
    String? description,
    String? category,
  }) async {
    final userId = SupabaseService.currentUserId ?? 'offline-user';
    final cleanUrl = url.trim().startsWith(RegExp(r'https?:\/\/', caseSensitive: false))
        ? url.trim()
        : 'https://${url.trim()}';

    String? faviconUrl;
    try {
      final host = Uri.parse(cleanUrl).host;
      if (host.isNotEmpty) {
        faviconUrl = 'https://www.google.com/s2/favicons?domain=${Uri.encodeComponent(host)}&sz=64';
      }
    } catch (_) {}

    final now = DateTime.now().toIso8601String();
    final resource = WebsiteResource(
      id: _uuid.v4(),
      userId: userId,
      title: title.trim().isNotEmpty ? title.trim() : Uri.parse(cleanUrl).host,
      url: cleanUrl,
      description: description?.trim().isNotEmpty == true ? description!.trim() : null,
      category: category ?? 'other',
      faviconUrl: faviconUrl,
      createdAt: now,
      updatedAt: now,
    );

    // 1. Optimistic insert
    _resources.insert(0, resource);
    notifyListeners();

    // 2. Cache locally in SQLite immediately
    try {
      final db = await _db.database;
      await db.insert('cached_website_resources', resource.toMap());
    } catch (e) {
      debugPrint('Error caching website resource: $e');
    }

    // 3. Queue in SyncEngine
    await SyncEngine.instance.queueOperation(
      operationType: 'UPSERT_RESOURCE',
      entityId: resource.id,
      payload: resource.toSupabaseMap(),
    );

    SyncEngine.instance.sync();
    return resource;
  }

  Future<void> deleteResource(String resourceId) async {
    _resources.removeWhere((r) => r.id == resourceId);
    notifyListeners();

    try {
      final db = await _db.database;
      await db.delete('cached_website_resources', where: 'id = ?', whereArgs: [resourceId]);
    } catch (e) {
      debugPrint('Error deleting cached resource: $e');
    }

    await SyncEngine.instance.queueOperation(
      operationType: 'DELETE_RESOURCE',
      entityId: resourceId,
      payload: {'id': resourceId},
    );

    SyncEngine.instance.sync();
  }

  // --- Timestamped Notes Methods ---

  Future<void> addNote({
    required String videoId,
    required int timestampSeconds,
    required String content,
  }) async {
    final userId = SupabaseService.currentUserId ?? 'offline-user';
    final now = DateTime.now().toIso8601String();

    final note = VideoNote(
      id: _uuid.v4(),
      userId: userId,
      videoId: videoId,
      timestampSeconds: timestampSeconds,
      content: content.trim(),
      createdAt: now,
    );

    // Optimistic insert
    _notes.insert(0, note);
    notifyListeners();

    // Cache locally
    try {
      final db = await _db.database;
      await db.insert('cached_video_notes', note.toMap());
    } catch (e) {
      debugPrint('Error caching note: $e');
    }

    // Queue in SyncEngine
    await SyncEngine.instance.queueOperation(
      operationType: 'UPSERT_NOTE',
      entityId: note.id,
      payload: note.toSupabaseMap(),
    );

    SyncEngine.instance.sync();
  }

  Future<void> deleteNote(String noteId) async {
    _notes.removeWhere((n) => n.id == noteId);
    notifyListeners();

    try {
      final db = await _db.database;
      await db.delete('cached_video_notes', where: 'id = ?', whereArgs: [noteId]);
    } catch (e) {
      debugPrint('Error deleting cached note: $e');
    }

    await SyncEngine.instance.queueOperation(
      operationType: 'DELETE_NOTE',
      entityId: noteId,
      payload: {'id': noteId},
    );

    SyncEngine.instance.sync();
  }
}
