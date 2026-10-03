import 'dart:convert';
import 'dart:io';
import 'package:crypto/crypto.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/env_config.dart';
import 'update_model.dart';

class UpdateCheckResult {
  final bool hasUpdate;
  final bool isMandatory;
  final InstalledVersionInfo currentVersion;
  final AppReleaseManifest? latestRelease;
  final String? errorMessage;

  const UpdateCheckResult({
    required this.hasUpdate,
    required this.isMandatory,
    required this.currentVersion,
    this.latestRelease,
    this.errorMessage,
  });
}

class UpdaterService {
  static const MethodChannel _channel = MethodChannel('com.studyspace.app/updater');

  static final UpdaterService instance = UpdaterService._internal();
  UpdaterService._internal();

  DateTime? _lastCheckTime;
  UpdateCheckResult? _cachedResult;

  /// Retrieves the current installed package version and build number from Android PackageManager.
  Future<InstalledVersionInfo> getInstalledVersion() async {
    try {
      if (!kIsWeb && Platform.isAndroid) {
        final res = await _channel.invokeMethod<Map<dynamic, dynamic>>('getAppVersionInfo');
        if (res != null) {
          return InstalledVersionInfo.fromMap(res);
        }
      }
    } catch (e) {
      debugPrint('[UpdaterService] Native getAppVersionInfo error: $e');
    }
    // Safe fallback for testing or initial environment
    return const InstalledVersionInfo(
      versionName: '1.1.3',
      versionCode: 11,
      packageName: 'com.studyspace.app',
    );
  }

  /// Returns true if the update dialog should be shown for the given [manifest].
  /// For optional updates, suppresses the dialog for 24 hours if the user already
  /// dismissed this version. Mandatory updates always return true.
  Future<bool> shouldShowUpdateDialog(AppReleaseManifest manifest, {required bool isMandatory}) async {
    if (isMandatory) return true;
    try {
      final prefs = await SharedPreferences.getInstance();
      final dismissedVersion = prefs.getString('last_dismissed_version');
      final dismissedTs = prefs.getInt('last_dismissed_ts');

      if (dismissedVersion == manifest.latestVersion && dismissedTs != null) {
        final dismissedAt = DateTime.fromMillisecondsSinceEpoch(dismissedTs);
        final hoursSince = DateTime.now().difference(dismissedAt).inHours;
        if (hoursSince < 24) {
          debugPrint('[UpdaterService] Suppressing update dialog for v${manifest.latestVersion} — dismissed ${hoursSince}h ago');
          return false;
        }
      }
    } catch (e) {
      debugPrint('[UpdaterService] shouldShowUpdateDialog check failed: $e');
    }
    return true;
  }

  /// Checks for available updates against the configured release bucket or backend endpoint.
  /// [force] bypasses throttle (throttled to at most once every 10 minutes on automatic launch).
  Future<UpdateCheckResult> checkForUpdates({bool force = false}) async {
    final now = DateTime.now();
    if (!force &&
        _lastCheckTime != null &&
        now.difference(_lastCheckTime!).inMinutes < 10 &&
        _cachedResult != null) {
      return _cachedResult!;
    }

    final installed = await getInstalledVersion();

    try {
      final baseUrl = await EnvConfig.getEffectiveReleaseBaseUrl();
      if (baseUrl.isEmpty) {
        return UpdateCheckResult(
          hasUpdate: false,
          isMandatory: false,
          currentVersion: installed,
          errorMessage: 'Release URL is not configured',
        );
      }

      // Determine manifest URL:
      // If baseUrl is R2 (e.g. *.r2.dev), target latest.json at root.
      // If baseUrl is web API, target /api/release/latest.
      final String manifestUrl;
      if (baseUrl.contains('r2.dev') || baseUrl.contains('r2.cloudflarestorage.com')) {
        manifestUrl = '$baseUrl/latest.json';
      } else {
        manifestUrl = baseUrl.endsWith('/api/release/latest')
            ? baseUrl
            : '$baseUrl/api/release/latest';
      }

      final response = await http
          .get(Uri.parse(manifestUrl), headers: {'Accept': 'application/json'})
          .timeout(const Duration(seconds: 6));

      if (response.statusCode != 200) {
        final err = 'Update check returned HTTP ${response.statusCode}';
        debugPrint('[UpdaterService] $err');
        return UpdateCheckResult(
          hasUpdate: false,
          isMandatory: false,
          currentVersion: installed,
          errorMessage: err,
        );
      }

      final dynamic decoded = jsonDecode(response.body);
      if (decoded is! Map<String, dynamic>) {
        throw const FormatException('Invalid release manifest JSON format');
      }

      final manifest = AppReleaseManifest.fromJson(decoded);

      // Security check: validate that apkUrl hostname is safe and matches the release host or same domain
      if (!_isApkUrlAllowed(manifest.apkUrl, baseUrl)) {
        final err = 'Rejected untrusted APK host: ${manifest.apkUrl}';
        debugPrint('[UpdaterService] $err');
        return UpdateCheckResult(
          hasUpdate: false,
          isMandatory: false,
          currentVersion: installed,
          errorMessage: err,
        );
      }

      final hasUpdate = manifest.isUpdateAvailable(installed.versionCode);
      final isMandatory = manifest.isMandatory(installed.versionCode);

      _lastCheckTime = now;
      _cachedResult = UpdateCheckResult(
        hasUpdate: hasUpdate,
        isMandatory: isMandatory,
        currentVersion: installed,
        latestRelease: manifest,
      );

      return _cachedResult!;
    } catch (e) {
      debugPrint('[UpdaterService] Update check failed: $e');
      return UpdateCheckResult(
        hasUpdate: false,
        isMandatory: false,
        currentVersion: installed,
        errorMessage: e.toString(),
      );
    }
  }

  /// Validates that the APK URL originates from an authorized release host.
  bool _isApkUrlAllowed(String apkUrl, String releaseBaseUrl) {
    try {
      final apkUri = Uri.parse(apkUrl);
      final baseUri = Uri.parse(releaseBaseUrl);

      // Relative path or same host
      if (!apkUri.hasScheme) return true;
      if (apkUri.host.toLowerCase() == baseUri.host.toLowerCase()) return true;

      // Allow official StudySpace domains and Cloudflare R2 development URLs
      final host = apkUri.host.toLowerCase();
      if (host.endsWith('.r2.dev') ||
          host.endsWith('studyspace4u.vercel.app') ||
          host.endsWith('studyspace.app')) {
        return true;
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  /// Downloads the release APK into the temporary cache directory with live progress feedback.
  Future<File> downloadApk(
    AppReleaseManifest manifest, {
    void Function(double progress, int receivedBytes, int totalBytes)? onProgress,
  }) async {
    final client = http.Client();
    File? tempFile;

    try {
      final request = http.Request('GET', Uri.parse(manifest.apkUrl));
      final streamedResponse = await client.send(request);

      if (streamedResponse.statusCode != 200) {
        throw HttpException(
          'Failed to download update APK: HTTP ${streamedResponse.statusCode}',
          uri: Uri.parse(manifest.apkUrl),
        );
      }

      final tempDir = await getTemporaryDirectory();
      final filename = 'studyspace-${manifest.latestVersion}+${manifest.latestBuild}.apk';
      tempFile = File(p.join(tempDir.path, filename));

      if (await tempFile.exists()) {
        await tempFile.delete();
      }

      final totalBytes = streamedResponse.contentLength ?? manifest.apkSize;
      int receivedBytes = 0;

      final sink = tempFile.openWrite();

      await for (final chunk in streamedResponse.stream) {
        sink.add(chunk);
        receivedBytes += chunk.length;
        if (totalBytes > 0 && onProgress != null) {
          final progress = (receivedBytes / totalBytes).clamp(0.0, 1.0);
          onProgress(progress, receivedBytes, totalBytes);
        }
      }

      await sink.flush();
      await sink.close();

      // Integrity Verification: Check SHA-256 Checksum
      if (manifest.sha256.isNotEmpty) {
        final isValid = await verifySha256(tempFile, manifest.sha256);
        if (!isValid) {
          if (await tempFile.exists()) {
            await tempFile.delete();
          }
          throw Exception(
            'Security Alert: APK SHA-256 checksum mismatch! Download aborted and purged.',
          );
        }
      }

      return tempFile;
    } catch (e) {
      if (tempFile != null && await tempFile.exists()) {
        try {
          await tempFile.delete();
        } catch (_) {}
      }
      rethrow;
    } finally {
      client.close();
    }
  }

  /// Calculates the SHA-256 hash of a downloaded file and verifies it matches expected value.
  Future<bool> verifySha256(File file, String expectedSha256) async {
    if (!await file.exists()) return false;
    final expected = expectedSha256.trim().toLowerCase();
    if (expected.isEmpty) return true;

    final bytes = await file.readAsBytes();
    final digest = sha256.convert(bytes);
    final calculated = digest.toString().toLowerCase();

    final matches = calculated == expected;
    if (!matches) {
      debugPrint('[UpdaterService] Checksum Mismatch! Expected: $expected, Computed: $calculated');
    }
    return matches;
  }

  /// Checks if Android 8.0+ has granted permission to install unknown apps.
  Future<bool> canRequestPackageInstalls() async {
    try {
      if (!kIsWeb && Platform.isAndroid) {
        final canInstall = await _channel.invokeMethod<bool>('canRequestPackageInstalls');
        return canInstall ?? true;
      }
    } catch (e) {
      debugPrint('[UpdaterService] canRequestPackageInstalls warning: $e');
    }
    return true;
  }

  /// Navigates user to Android system settings to grant permission to install unknown apps.
  Future<void> openInstallPermissionSettings() async {
    try {
      if (!kIsWeb && Platform.isAndroid) {
        await _channel.invokeMethod('openInstallPermissionSettings');
      }
    } catch (e) {
      debugPrint('[UpdaterService] openInstallPermissionSettings error: $e');
    }
  }

  /// Launches the native Android package installer using secure content URI via FileProvider.
  /// (Preserves all existing user SQLite databases, SharedPreferences, and tokens)
  Future<void> installApk(File apkFile) async {
    if (!await apkFile.exists()) {
      throw FileNotFoundException('APK file does not exist at ${apkFile.path}');
    }

    if (!kIsWeb && Platform.isAndroid) {
      final success = await _channel.invokeMethod<bool>('installApk', {
        'filePath': apkFile.path,
      });
      if (success != true) {
        throw Exception('Native Android installer failed to launch');
      }
    } else {
      debugPrint('[UpdaterService] Install simulated on non-Android platform: ${apkFile.path}');
    }
  }
}

class FileNotFoundException implements Exception {
  final String message;
  const FileNotFoundException(this.message);
  @override
  String toString() => 'FileNotFoundException: $message';
}
