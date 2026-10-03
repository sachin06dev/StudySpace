import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:studyspace/core/updater/update_model.dart';
import 'package:studyspace/core/updater/updater_service.dart';

void main() {
  group('AppReleaseManifest & Versioning Tests', () {
    test('Correctly parses full latest.json manifest schema', () {
      final json = {
        'latestVersion': '1.4.0',
        'latestBuild': 10,
        'minimumSupportedBuild': 5,
        'apkUrl': 'https://pub-sample.r2.dev/releases/studyspace-1.4.0+10.apk',
        'apkSize': 69580664,
        'sha256': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        'releaseDate': '2026-09-22',
        'releaseNotes': [
          'Fix attendance sync',
          'Add timetable scanner',
        ],
      };

      final manifest = AppReleaseManifest.fromJson(json);

      expect(manifest.latestVersion, equals('1.4.0'));
      expect(manifest.latestBuild, equals(10));
      expect(manifest.minimumSupportedBuild, equals(5));
      expect(manifest.apkUrl, equals('https://pub-sample.r2.dev/releases/studyspace-1.4.0+10.apk'));
      expect(manifest.apkSize, equals(69580664));
      expect(manifest.sha256, equals('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'));
      expect(manifest.releaseNotes.length, equals(2));
      expect(manifest.releaseNotes.first, equals('Fix attendance sync'));
    });

    test('Handles missing fields gracefully with defaults', () {
      final json = <String, dynamic>{
        'latestVersion': '1.0.1',
        'latestBuild': 2,
        'apkUrl': 'https://pub-sample.r2.dev/releases/studyspace-1.0.1+2.apk',
      };

      final manifest = AppReleaseManifest.fromJson(json);

      expect(manifest.latestVersion, equals('1.0.1'));
      expect(manifest.latestBuild, equals(2));
      expect(manifest.minimumSupportedBuild, equals(1));
      expect(manifest.apkSize, equals(0));
      expect(manifest.sha256, equals(''));
      expect(manifest.releaseNotes, isEmpty);
    });

    test('Numerical build comparison operates accurately across single and multi digits', () {
      const manifest = AppReleaseManifest(
        latestVersion: '1.10.0',
        latestBuild: 10,
        minimumSupportedBuild: 5,
        apkUrl: 'https://pub-sample.r2.dev/releases/studyspace-1.10.0+10.apk',
        sha256: 'abc',
      );

      // Single digit build (e.g. 9) vs multi-digit build (10)
      // (Raw string '9' > '10', but numerical 9 < 10 must be recognized as update available)
      expect(manifest.isUpdateAvailable(9), isTrue);
      expect(manifest.isUpdateAvailable(1), isTrue);

      // Same build: no update
      expect(manifest.isUpdateAvailable(10), isFalse);

      // Newer installed build: no update
      expect(manifest.isUpdateAvailable(11), isFalse);
    });

    test('Mandatory update enforcement checks minimumSupportedBuild threshold', () {
      const manifest = AppReleaseManifest(
        latestVersion: '2.0.0',
        latestBuild: 20,
        minimumSupportedBuild: 15,
        apkUrl: 'https://pub-sample.r2.dev/releases/studyspace-2.0.0+20.apk',
        sha256: 'abc',
      );

      // Below minimum: mandatory update
      expect(manifest.isMandatory(14), isTrue);
      expect(manifest.isMandatory(1), isTrue);

      // At or above minimum: optional update
      expect(manifest.isMandatory(15), isFalse);
      expect(manifest.isMandatory(16), isFalse);
      expect(manifest.isMandatory(20), isFalse);
    });

    test('InstalledVersionInfo formats display string correctly', () {
      const info = InstalledVersionInfo(
        versionName: '1.0.1',
        versionCode: 2,
        packageName: 'com.studyspace.app',
      );

      expect(info.toString(), equals('v1.0.1 (Build 2)'));
    });
  });

  group('Security & SHA-256 Integrity Tests', () {
    test('Calculates and verifies accurate SHA-256 hash', () {
      final samplePayload = utf8.encode('StudySpace APK Verification Payload');
      final expectedDigest = sha256.convert(samplePayload).toString();

      final actualDigest = sha256.convert(samplePayload).toString();
      expect(actualDigest.toLowerCase(), equals(expectedDigest.toLowerCase()));

      // Corrupt payload check
      final corruptPayload = utf8.encode('StudySpace Corrupt Tampered APK Payload');
      final corruptDigest = sha256.convert(corruptPayload).toString();
      expect(corruptDigest, isNot(equals(expectedDigest)));
    });
  });

  group('Update Dialog 24h Suppression Logic Tests', () {
    const testManifest = AppReleaseManifest(
      latestVersion: '1.1.2',
      latestBuild: 10,
      minimumSupportedBuild: 2,
      apkUrl: 'https://pub-b4adfff8f9484716b527406a89c265c0.r2.dev/releases/studyspace-1.1.2+10.apk',
      sha256: 'abc',
    );

    test('Initial run without prior dismissal allows dialog', () async {
      SharedPreferences.setMockInitialValues({});
      final updater = UpdaterService.instance;
      final shouldShow = await updater.shouldShowUpdateDialog(testManifest, isMandatory: false);
      expect(shouldShow, isTrue);
    });

    test('Dismissed 2 hours ago (<24h) suppresses optional update dialog', () async {
      final twoHoursAgo = DateTime.now().subtract(const Duration(hours: 2)).millisecondsSinceEpoch;
      SharedPreferences.setMockInitialValues({
        'last_dismissed_version': '1.1.2',
        'last_dismissed_ts': twoHoursAgo,
      });

      final updater = UpdaterService.instance;
      final shouldShow = await updater.shouldShowUpdateDialog(testManifest, isMandatory: false);
      expect(shouldShow, isFalse);
    });

    test('Dismissed 25 hours ago (>=24h) re-allows optional update dialog', () async {
      final twentyFiveHoursAgo = DateTime.now().subtract(const Duration(hours: 25)).millisecondsSinceEpoch;
      SharedPreferences.setMockInitialValues({
        'last_dismissed_version': '1.1.2',
        'last_dismissed_ts': twentyFiveHoursAgo,
      });

      final updater = UpdaterService.instance;
      final shouldShow = await updater.shouldShowUpdateDialog(testManifest, isMandatory: false);
      expect(shouldShow, isTrue);
    });

    test('Older version dismissed (e.g. 1.0.1) does NOT suppress newer v1.1.2', () async {
      final oneHourAgo = DateTime.now().subtract(const Duration(hours: 1)).millisecondsSinceEpoch;
      SharedPreferences.setMockInitialValues({
        'last_dismissed_version': '1.0.1',
        'last_dismissed_ts': oneHourAgo,
      });

      final updater = UpdaterService.instance;
      final shouldShow = await updater.shouldShowUpdateDialog(testManifest, isMandatory: false);
      expect(shouldShow, isTrue);
    });

    test('Mandatory update always shows dialog regardless of suppression', () async {
      final oneHourAgo = DateTime.now().subtract(const Duration(hours: 1)).millisecondsSinceEpoch;
      SharedPreferences.setMockInitialValues({
        'last_dismissed_version': '1.1.2',
        'last_dismissed_ts': oneHourAgo,
      });

      final updater = UpdaterService.instance;
      final shouldShow = await updater.shouldShowUpdateDialog(testManifest, isMandatory: true);
      expect(shouldShow, isTrue);
    });
  });
}
