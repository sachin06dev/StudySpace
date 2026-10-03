import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../services/auth_service.dart';
import '../../core/config/env_config.dart';
import '../../core/database/database_helper.dart';
import '../../core/realtime/realtime_sync_service.dart';
import '../../core/supabase/supabase_client.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();

  User? _user;
  User? get user => _user;
  bool get isAuthenticated => _user != null;

  bool _isLoading = true;
  bool get isLoading => _isLoading;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  AuthProvider() {
    _init();
  }

  void _init() {
    _user = _authService.currentUser;
    _isLoading = false;

    if (_user != null) {
      _registerCurrentDevice();
      RealtimeSyncService.instance.start(_user!.id);
    }

    // Listen to real-time remote device revocation
    RealtimeSyncService.instance.deviceRevocationEvents.listen((deviceId) async {
      final prefs = await SharedPreferences.getInstance();
      final myId = prefs.getString('studyspace_mobile_device_id');
      if (myId != null && myId == deviceId) {
        debugPrint('[AuthProvider] This mobile device was removed/revoked by user. Signing out...');
        await signOut();
      }
    });

    _authService.authStateChanges.listen((data) {
      _user = data.session?.user ?? _authService.currentUser;
      _isLoading = false;
      notifyListeners();

      if (data.session != null &&
          (data.event == AuthChangeEvent.initialSession ||
              data.event == AuthChangeEvent.signedIn ||
              data.event == AuthChangeEvent.tokenRefreshed)) {
        _registerCurrentDevice(session: data.session);
        RealtimeSyncService.instance.start(data.session!.user.id);
      } else if (data.event == AuthChangeEvent.signedOut) {
        RealtimeSyncService.instance.stop();
      } else if (_user != null) {
        _registerCurrentDevice();
        RealtimeSyncService.instance.start(_user!.id);
      }
    });
  }

  Future<void> _registerCurrentDevice({Session? session}) async {
    final user = _user ?? _authService.currentUser;
    if (user == null) return;
    try {
      final prefs = await SharedPreferences.getInstance();
      var id = prefs.getString('studyspace_mobile_device_id');
      if (id == null || id.isEmpty) {
        id =
            'mobile_${DateTime.now().millisecondsSinceEpoch}_${(1000 + (DateTime.now().microsecond % 9000))}';
        await prefs.setString('studyspace_mobile_device_id', id);
      }

      final platformName =
          Platform.isAndroid ? 'Android' : (Platform.isIOS ? 'iOS' : 'Mobile');
      final deviceName = '$platformName Phone (StudySpace App)';

      final token = session?.accessToken ?? _authService.currentSession?.accessToken;

      // 1. Authenticated POST to web backend: /api/devices/register
      if (token != null && token.isNotEmpty) {
        try {
          final baseUrl = await EnvConfig.getEffectiveWebApiBaseUrl();
          final uri = Uri.parse('$baseUrl/api/devices/register');
          final response = await http
              .post(
                uri,
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer $token',
                },
                body: jsonEncode({
                  'deviceId': id,
                  'deviceName': deviceName,
                  'deviceType': 'mobile',
                  'platform': platformName,
                  'browser': 'StudySpace App',
                }),
              )
              .timeout(const Duration(seconds: 8));

          if (response.statusCode == 200) {
            debugPrint('[AuthProvider] Mobile device registered via API: $id');
            return;
          } else if (response.statusCode == 403) {
            debugPrint('[AuthProvider] Mobile device was revoked from account. Signing out...');
            await signOut();
            return;
          }
        } catch (apiErr) {
          debugPrint(
              '[AuthProvider] API registration notice: $apiErr, falling back to direct DB upsert');
        }
      }

      // 2. Direct Supabase DB upsert as reliable fallback
      final existing = await SupabaseService.client
          .from('user_devices')
          .select('is_revoked')
          .eq('user_id', user.id)
          .eq('device_id', id)
          .maybeSingle();

      if (existing != null && (existing['is_revoked'] == true || existing['is_revoked'] == 1)) {
        debugPrint('[AuthProvider] Device is revoked in DB. Signing out...');
        await signOut();
        return;
      }

      await SupabaseService.client.from('user_devices').upsert({
        'user_id': user.id,
        'device_id': id,
        'device_name': deviceName,
        'device_type': 'mobile',
        'platform': platformName,
        'browser': 'StudySpace App',
        'is_revoked': false,
        'last_active_at': DateTime.now().toIso8601String(),
      }, onConflict: 'user_id,device_id');
      debugPrint('[AuthProvider] Mobile device registered via Supabase client: $id');
    } catch (e) {
      debugPrint('[AuthProvider] Device registration error: $e');
    }
  }

  Future<bool> signIn(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _authService.signIn(
        email: email,
        password: password,
      );
      _user = response.user;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      _errorMessage = _cleanErrorMessage(e);
      notifyListeners();
      return false;
    }
  }

  Future<bool> signUp(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _authService.signUp(
        email: email,
        password: password,
      );
      _user = response.user;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      _errorMessage = _cleanErrorMessage(e);
      notifyListeners();
      return false;
    }
  }

  Future<bool> signInWithGoogle() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final success = await _authService.signInWithGoogle();
      _isLoading = false;
      notifyListeners();
      return success;
    } catch (e) {
      _isLoading = false;
      _errorMessage = _cleanErrorMessage(e);
      notifyListeners();
      return false;
    }
  }

  Future<void> signOut() async {
    _isLoading = true;
    notifyListeners();

    try {
      await RealtimeSyncService.instance.stop();
      await _authService.signOut();
      await DatabaseHelper.instance.clearAllCache();
    } finally {
      _user = null;
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Permanently deletes the user account from Supabase and purges all local cached data.
  Future<bool> deleteAccount() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await RealtimeSyncService.instance.stop();
      await _authService.deleteAccount();
      await DatabaseHelper.instance.clearAllCache();
      _user = null;
      return true;
    } catch (e) {
      _errorMessage = _cleanErrorMessage(e);
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Clears all cloud and local study data without deleting the user's account.
  Future<bool> deleteStudyData() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await RealtimeSyncService.instance.stop();
      await _authService.deleteStudyData();
      await DatabaseHelper.instance.clearAllCache();
      return true;
    } catch (e) {
      _errorMessage = _cleanErrorMessage(e);
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }


  Future<void> signOutOtherDevices() async {
    _isLoading = true;
    notifyListeners();

    try {
      await _authService.signOutOtherDevices();
    } catch (e) {
      _errorMessage = _cleanErrorMessage(e);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  String _cleanErrorMessage(dynamic e) {
    if (e is AuthException) {
      return e.message;
    }
    return e.toString().replaceFirst('Exception: ', '');
  }
}
