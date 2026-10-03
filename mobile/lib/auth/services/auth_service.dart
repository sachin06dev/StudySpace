import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/config/env_config.dart';
import '../../core/supabase/supabase_client.dart';

class AuthService {
  final SupabaseClient _client = SupabaseService.client;

  User? get currentUser => _client.auth.currentUser;
  Session? get currentSession => _client.auth.currentSession;
  Stream<AuthState> get authStateChanges => _client.auth.onAuthStateChange;

  Future<AuthResponse> signIn({
    required String email,
    required String password,
  }) async {
    return await _client.auth.signInWithPassword(
      email: email.trim(),
      password: password,
    );
  }

  Future<AuthResponse> signUp({
    required String email,
    required String password,
  }) async {
    return await _client.auth.signUp(
      email: email.trim(),
      password: password,
    );
  }

  Future<bool> signInWithGoogle() async {
    return await _client.auth.signInWithOAuth(
      OAuthProvider.google,
      redirectTo: 'io.supabase.studyspace://login-callback',
    );
  }

  Future<void> signOut({SignOutScope scope = SignOutScope.local}) async {
    await _client.auth.signOut(scope: scope);
  }

  Future<void> signOutOtherDevices() async {
    await _client.auth.signOut(scope: SignOutScope.others);
  }

  Future<void> resetPassword(String email) async {
    await _client.auth.resetPasswordForEmail(email.trim());
  }

  /// Permanently deletes the user account, associated files, and authentication credentials.
  Future<void> deleteAccount() async {
    final session = _client.auth.currentSession;
    final token = session?.accessToken;

    // 1. If backend API is reachable, call web deletion endpoint for R2 & storage purge
    if (token != null && token.isNotEmpty) {
      try {
        final webBaseUrl = await EnvConfig.getEffectiveWebApiBaseUrl();
        final uri = Uri.parse('$webBaseUrl/api/user/delete-account');
        final response = await http.delete(
          uri,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
          body: jsonEncode({'confirm': 'DELETE'}),
        ).timeout(const Duration(seconds: 10));

        if (response.statusCode == 200) {
          debugPrint('[AuthService] Successfully purged account via web API endpoint');
        }
      } catch (e) {
        debugPrint('[AuthService] Web API account deletion notice (fallback to direct RPC): $e');
      }
    }

    // 2. Direct Supabase RPC execution
    // Calls delete_user_account() SECURITY DEFINER function to wipe all tables and DELETE FROM auth.users
    try {
      await _client.rpc('delete_user_account');
      debugPrint('[AuthService] Successfully executed delete_user_account RPC');
    } catch (e) {
      debugPrint('[AuthService] delete_user_account RPC notice: $e');
      if (currentUser != null) {
        rethrow;
      }
    }

    // 3. Complete local sign out
    try {
      await _client.auth.signOut(scope: SignOutScope.local);
    } catch (_) {}
  }

  /// Deletes all user study data (attendance, timetable, notes, tasks, etc.)
  /// while keeping the user account authenticated.
  Future<void> deleteStudyData() async {
    final session = _client.auth.currentSession;
    final token = session?.accessToken;
    final uid = currentUser?.id;

    // 1. Attempt web deletion endpoint if available
    if (token != null && token.isNotEmpty) {
      try {
        final webBaseUrl = await EnvConfig.getEffectiveWebApiBaseUrl();
        final uri = Uri.parse('$webBaseUrl/api/user/delete-data');
        final response = await http.delete(
          uri,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
          body: jsonEncode({'confirm': 'DELETE'}),
        ).timeout(const Duration(seconds: 10));

        if (response.statusCode == 200) {
          debugPrint('[AuthService] Successfully purged study data via web API');
          return;
        }
      } catch (e) {
        debugPrint('[AuthService] Web API delete-data notice (fallback to direct table cleanup): $e');
      }
    }

    // 2. Direct Supabase Client fallback
    if (uid != null) {
      try { await _client.from('attendance_records').delete().eq('user_id', uid); } catch (_) {}
      try {
        final semRes = await _client.from('semesters').select('id').eq('user_id', uid);
        final semList = semRes;
        final semIds = semList.map((s) => s['id']).toList();
        if (semIds.isNotEmpty) {
          try { await _client.from('timetable_exceptions').delete().filter('semester_id', 'in', semIds); } catch (_) {}
          try { await _client.from('timetable_slots').delete().filter('semester_id', 'in', semIds); } catch (_) {}
          try { await _client.from('subjects').delete().filter('semester_id', 'in', semIds); } catch (_) {}
        }
      } catch (_) {}
      try { await _client.from('semesters').delete().eq('user_id', uid); } catch (_) {}
      try { await _client.from('tasks').delete().eq('user_id', uid); } catch (_) {}
      try { await _client.from('pomodoro_sessions').delete().eq('user_id', uid); } catch (_) {}
      try { await _client.from('notes').delete().eq('user_id', uid); } catch (_) {}
      try { await _client.from('saved_videos').delete().eq('user_id', uid); } catch (_) {}
      try { await _client.from('saved_playlists').delete().eq('user_id', uid); } catch (_) {}
      try { await _client.from('study_resources').delete().eq('user_id', uid); } catch (_) {}
      try { await _client.from('video_timestamp_notes').delete().eq('user_id', uid); } catch (_) {}
      try { await _client.from('bookmarks').delete().eq('user_id', uid); } catch (_) {}
    }
  }
}


