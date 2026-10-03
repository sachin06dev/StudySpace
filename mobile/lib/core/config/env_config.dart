import 'package:shared_preferences/shared_preferences.dart';

class EnvConfig {
  static const String supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://wdiclosjnnriaixsitfl.supabase.co',
  );

  static const String supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: 'sb_publishable_lWnb8VcZoaOFxqEi1Hod-g_TZXi-QzS',
  );

  static const String _apiBaseUrl = String.fromEnvironment('API_BASE_URL');
  static const String _webApiBaseUrl = String.fromEnvironment('WEB_API_BASE_URL');

  static const String webApiBaseUrl = _apiBaseUrl != ''
      ? _apiBaseUrl
      : (_webApiBaseUrl != ''
          ? _webApiBaseUrl
          : 'https://studyspace4u.vercel.app');

  static const String _customApiUrlKey = 'custom_api_base_url';

  /// Resolves the active backend URL, respecting any user/developer override saved in settings.
  static Future<String> getEffectiveWebApiBaseUrl() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final custom = prefs.getString(_customApiUrlKey)?.trim();
      if (custom != null && custom.isNotEmpty) {
        return custom.endsWith('/') ? custom.substring(0, custom.length - 1) : custom;
      }
    } catch (_) {}
    return webApiBaseUrl.endsWith('/')
        ? webApiBaseUrl.substring(0, webApiBaseUrl.length - 1)
        : webApiBaseUrl;
  }

  /// Sets or clears a custom API base URL (e.g. LAN IP for development without USB).
  static Future<void> setCustomWebApiBaseUrl(String? url) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      if (url == null || url.trim().isEmpty) {
        await prefs.remove(_customApiUrlKey);
      } else {
        await prefs.setString(_customApiUrlKey, url.trim());
      }
    } catch (_) {}
  }

  // Mobile Release Distribution (Cloudflare R2 public development URL or custom domain)
  static const String _configuredReleaseBaseUrl = String.fromEnvironment(
    'MOBILE_RELEASE_BASE_URL',
    defaultValue: '',
  );

  static const String _customReleaseUrlKey = 'custom_mobile_release_base_url';

  /// Fallback release base URL if not configured via dart-define
  static String get defaultReleaseBaseUrl {
    if (_configuredReleaseBaseUrl.isNotEmpty) {
      return _configuredReleaseBaseUrl.replaceAll(RegExp(r'/+$'), '');
    }
    // Default to the web app root which serves /api/release/latest and /api/download/android
    return webApiBaseUrl.replaceAll(RegExp(r'/+$'), '');
  }

  /// Resolves the active release base URL, respecting any user/developer override saved in settings.
  static Future<String> getEffectiveReleaseBaseUrl() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final custom = prefs.getString(_customReleaseUrlKey)?.trim();
      if (custom != null && custom.isNotEmpty) {
        return custom.endsWith('/') ? custom.substring(0, custom.length - 1) : custom;
      }
    } catch (_) {}
    return defaultReleaseBaseUrl;
  }

  /// Allows developers or testers to override the update release URL in Settings.
  static Future<void> setCustomReleaseBaseUrl(String? url) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      if (url == null || url.trim().isEmpty) {
        await prefs.remove(_customReleaseUrlKey);
      } else {
        await prefs.setString(_customReleaseUrlKey, url.trim());
      }
    } catch (_) {}
  }
}
