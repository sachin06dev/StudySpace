import 'package:supabase_flutter/supabase_flutter.dart';

/// Shared utility for resolving user display name according to the StudySpace identity priority:
/// 1. Explicit display_name from user_metadata or profile
/// 2. user_metadata['name']
/// 3. user_metadata['full_name']
/// 4. Profile table display name (if provided)
/// 5. Cleanly formatted email local-part fallback (e.g. demo505user@example.com -> Demo505user)
class UserNameResolver {
  UserNameResolver._();

  /// Formats an email local-part into a readable name fallback.
  /// Example: 'demo505user' -> 'Demo505user', 'john.doe' -> 'John Doe'
  static String formatEmailLocalPart(String? email) {
    if (email == null || email.trim().isEmpty) {
      return 'Student';
    }

    final localPart = email.split('@').first.trim();
    if (localPart.isEmpty) {
      return 'Student';
    }

    // Replace dots, underscores, dashes with spaces if present
    if (localPart.contains(RegExp(r'[._-]'))) {
      final parts = localPart.split(RegExp(r'[._-]+'));
      final formatted = parts
          .where((p) => p.isNotEmpty)
          .map((p) => '${p[0].toUpperCase()}${p.substring(1)}')
          .join(' ');
      if (formatted.isNotEmpty) return formatted;
    }

    // Capitalize first letter: demo505user -> Demo505user
    return '${localPart[0].toUpperCase()}${localPart.substring(1)}';
  }

  /// Resolves the canonical display name from a Supabase [User].
  static String resolveDisplayName(User? user, {String? profileName}) {
    if (user == null) {
      return 'Student';
    }

    // 1. Explicit profileName if passed
    if (profileName != null && profileName.trim().isNotEmpty) {
      return profileName.trim();
    }

    final metadata = user.userMetadata;
    if (metadata != null) {
      // 1. display_name
      final displayName = metadata['display_name'] as String?;
      if (displayName != null && displayName.trim().isNotEmpty) {
        return displayName.trim();
      }

      // 2. name
      final name = metadata['name'] as String?;
      if (name != null && name.trim().isNotEmpty) {
        return name.trim();
      }

      // 3. full_name
      final fullName = metadata['full_name'] as String?;
      if (fullName != null && fullName.trim().isNotEmpty) {
        return fullName.trim();
      }
    }

    // 4. Fallback to formatted email local-part
    return formatEmailLocalPart(user.email);
  }
}
