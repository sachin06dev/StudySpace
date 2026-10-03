import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:uuid/uuid.dart';
import '../models/scanned_class.dart';
import '../../core/config/env_config.dart';
import '../../core/database/database_helper.dart';
import '../../core/supabase/supabase_client.dart';
import '../../timetable/models/semester.dart';
import '../../timetable/models/subject.dart';
import '../../timetable/models/timetable_slot.dart';

class ScanTimetableResult {
  final List<ScannedClassItem> classes;
  final String suggestedSemesterName;
  final int rawCount;

  ScanTimetableResult({
    required this.classes,
    required this.suggestedSemesterName,
    required this.rawCount,
  });
}

class TimetableScannerService {
  final _uuid = const Uuid();
  final DatabaseHelper _db = DatabaseHelper.instance;

  /// Uploads timetable image to Next.js vision scanning endpoint
  Future<ScanTimetableResult> scanImage(File imageFile) async {
    final token = await SupabaseService.getValidAccessToken();

    if (token == null) {
      throw Exception('Please sign in to scan your timetable.');
    }

    final baseUrl = await EnvConfig.getEffectiveWebApiBaseUrl();
    final url = Uri.parse('$baseUrl/api/timetable/scan');

    // Determine MIME type from file extension
    final path = imageFile.path.toLowerCase();
    String subType = 'jpeg';
    if (path.endsWith('.png')) {
      subType = 'png';
    } else if (path.endsWith('.webp')) {
      subType = 'webp';
    } else if (path.endsWith('.heic')) {
      subType = 'heic';
    } else if (path.endsWith('.heif')) {
      subType = 'heif';
    }

    http.Response response;
    try {
      debugPrint('[AI_Scan] Stage: REQUEST_SENT, Endpoint: ${url.path}, MIME: image/$subType');
      final request = http.MultipartRequest('POST', url)
        ..headers['Authorization'] = 'Bearer $token'
        ..files.add(
          await http.MultipartFile.fromPath(
            'file',
            imageFile.path,
            contentType: MediaType('image', subType),
          ),
        );

      final streamedResponse = await request.send().timeout(
        const Duration(seconds: 45),
        onTimeout: () => throw TimeoutException('The AI scanner took too long to respond.'),
      );

      response = await http.Response.fromStream(streamedResponse);
      debugPrint('[AI_Scan] Stage: RESPONSE_RECEIVED, Status: ${response.statusCode}');
    } on SocketException catch (_) {
      debugPrint('[AI_Scan] Stage: NETWORK_ERROR (SocketException)');
      throw Exception('Couldn\'t reach StudySpace server. Check your connection and try again.');
    } on TimeoutException {
      debugPrint('[AI_Scan] Stage: TIMEOUT');
      throw Exception('AI scanning timed out. Please try again with a sharper photo.');
    } catch (e) {
      debugPrint('[AI_Scan] Stage: EXCEPTION, Error: $e');
      throw Exception('Network error during scan: $e');
    }

    if (response.statusCode == 404) {
      debugPrint('[AI_Scan] Stage: ENDPOINT_NOT_FOUND (404)');
      throw Exception(
        'AI Timetable Scanner endpoint is not found at $baseUrl (HTTP 404). '
        'Ensure the latest backend is deployed, or configure your development server address in Settings.',
      );
    }

    if (response.statusCode != 200) {
      String msg = 'Failed to extract timetable (HTTP ${response.statusCode}).';
      try {
        final body = jsonDecode(response.body);
        if (body is Map && body['error'] != null) {
          msg = body['error'].toString();
        }
      } catch (_) {}
      debugPrint('[AI_Scan] Stage: PROVIDER_OR_SERVER_ERROR, Status: ${response.statusCode}, Msg: $msg');
      throw Exception(msg);
    }

    try {
      final body = jsonDecode(response.body);
      if (body is! Map) {
        throw Exception('Invalid response format from AI scanner service.');
      }

      final dynamic rawList = body['entries'] ??
          body['classes'] ??
          (body['data'] is Map ? (body['data']['entries'] ?? body['data']['classes']) : null);

      if (rawList is! List) {
        throw Exception('The timetable could not be read clearly. Try a sharper image or PDF.');
      }

      final items = <ScannedClassItem>[];
      for (int i = 0; i < rawList.length; i++) {
        if (rawList[i] is Map<String, dynamic>) {
          items.add(ScannedClassItem.fromMap(rawList[i], 'scan_$i'));
        } else if (rawList[i] is Map) {
          items.add(ScannedClassItem.fromMap(Map<String, dynamic>.from(rawList[i]), 'scan_$i'));
        }
      }

      if (items.isEmpty) {
        throw Exception('The timetable could not be read clearly. Try a sharper image or PDF.');
      }

      final suggestedName = body['suggestedSemesterName'] ??
          (body['data'] is Map ? body['data']['suggestedSemesterName'] : null) ??
          'Current Semester';

      final rawCount = body['rawCount'] ??
          (body['data'] is Map ? body['data']['rawCount'] : null) ??
          items.length;

      return ScanTimetableResult(
        classes: items,
        suggestedSemesterName: suggestedName.toString(),
        rawCount: rawCount is int ? rawCount : items.length,
      );
    } catch (e) {
      if (e is Exception) rethrow;
      throw Exception('Could not parse extracted timetable data: $e');
    }
  }

  /// Persists scanned classes to Supabase and updates local SQLite cache.
  /// Supports either targeting an existing semester or creating a new one.
  Future<Semester> saveScannedTimetable({
    String? targetSemesterId,
    required String semesterName,
    required String startDate,
    required String endDate,
    bool setActive = true,
    required List<ScannedClassItem> classes,
  }) async {
    final client = SupabaseService.client;
    final userId = SupabaseService.currentUserId;
    if (userId == null) throw Exception('Not authenticated');

    Semester semester;
    String semId;

    if (targetSemesterId != null) {
      // Use existing semester
      semId = targetSemesterId;
      final semData = await client
          .from('semesters')
          .select()
          .eq('id', semId)
          .eq('user_id', userId)
          .single();
      semester = Semester.fromMap(semData);
    } else {
      // 1. If activating new semester, deactivate existing active semesters
      if (setActive) {
        await client
            .from('semesters')
            .update({'is_active': false})
            .eq('user_id', userId)
            .eq('is_active', true);
      }

      // 2. Create new semester
      semId = _uuid.v4();
      semester = Semester(
        id: semId,
        userId: userId,
        name: semesterName.trim().isNotEmpty ? semesterName.trim() : 'New Semester',
        startDate: startDate,
        endDate: endDate,
        isActive: setActive,
      );
      await client.from('semesters').insert(semester.toSupabaseMap());
    }

    // 3. Fetch existing subjects in this semester to avoid duplicates
    final existingSubjectsRes = await client
        .from('subjects')
        .select()
        .eq('semester_id', semId)
        .eq('user_id', userId);
    
    final subjectNameToId = <String, String>{};
    for (final s in (existingSubjectsRes as List)) {
      final name = (s['name'] as String).toLowerCase().trim();
      subjectNameToId[name] = s['id'] as String;
    }

    // 4. Create missing subjects
    final newSubjects = <Subject>[];
    for (final item in classes) {
      final normName = item.subjectName.trim().toLowerCase();
      if (!subjectNameToId.containsKey(normName)) {
        final subId = _uuid.v4();
        subjectNameToId[normName] = subId;

        final subject = Subject(
          id: subId,
          userId: userId,
          semesterId: semId,
          name: item.subjectName.trim(),
          code: item.subjectCode,
          faculty: item.faculty,
          defaultRoom: item.room,
          classType: item.classType,
          targetPercentage: 75.0,
        );
        newSubjects.add(subject);
      }
    }

    if (newSubjects.isNotEmpty) {
      await client.from('subjects').insert(newSubjects.map((s) => s.toSupabaseMap()).toList());
    }

    // 5. Create timetable slots
    final slots = <TimetableSlot>[];
    for (final item in classes) {
      final subId = subjectNameToId[item.subjectName.trim().toLowerCase()];
      if (subId == null) continue;

      final slot = TimetableSlot(
        id: _uuid.v4(),
        userId: userId,
        semesterId: semId,
        subjectId: subId,
        dayOfWeek: item.dayOfWeek,
        startTime: item.startTime.length == 5 ? '${item.startTime}:00' : item.startTime,
        endTime: item.endTime.length == 5 ? '${item.endTime}:00' : item.endTime,
        roomOverride: item.room,
        facultyOverride: item.faculty,
        classTypeOverride: item.classType,
      );
      slots.add(slot);
    }

    if (slots.isNotEmpty) {
      await client.from('timetable_slots').insert(slots.map((s) => s.toSupabaseMap()).toList());
    }

    // 6. Update local SQLite cache immediately
    try {
      await _db.cacheData('cached_semesters', [semester.toMap()]);
      if (newSubjects.isNotEmpty) {
        await _db.cacheData('cached_subjects', newSubjects.map((s) => s.toMap()).toList());
      }
      if (slots.isNotEmpty) {
        await _db.cacheData('cached_timetable_slots', slots.map((s) => s.toMap()).toList());
      }
    } catch (cacheErr) {
      debugPrint('Local SQLite cache update warning during scan save: $cacheErr');
    }

    return semester;
  }
}
