import 'package:supabase_flutter/supabase_flutter.dart';
import '../config/env_config.dart';

class SupabaseService {
  static SupabaseClient get client => Supabase.instance.client;

  static User? get currentUser => client.auth.currentUser;
  static String? get currentUserId => client.auth.currentUser?.id;
  static bool get isAuthenticated => client.auth.currentUser != null;

  /// Returns a valid non-expired access token, auto-refreshing if needed.
  static Future<String?> getValidAccessToken() async {
    final session = client.auth.currentSession;
    if (session == null) return null;
    if (session.isExpired) {
      try {
        final res = await client.auth.refreshSession();
        return res.session?.accessToken ?? session.accessToken;
      } catch (_) {
        return session.accessToken;
      }
    }
    return session.accessToken;
  }

  static Future<void> initialize() async {
    await Supabase.initialize(
      url: EnvConfig.supabaseUrl,
      anonKey: EnvConfig.supabaseAnonKey,
      authOptions: const FlutterAuthClientOptions(
        authFlowType: AuthFlowType.pkce,
        autoRefreshToken: true,
      ),
    );
  }
}
