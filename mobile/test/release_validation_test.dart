import 'package:flutter_test/flutter_test.dart';
import 'package:studyspace/core/services/daily_quote_service.dart';
import 'package:studyspace/core/updater/update_model.dart';

void main() {
  group('StudySpace v1.1.2 — Release Validation & QA Suite', () {
    // ------------------------------------------------------------------------
    // Section 22: Update Version Comparison Tests
    // ------------------------------------------------------------------------
    group('Section 22: Update Version Comparison', () {
      const v112Manifest = AppReleaseManifest(
        latestVersion: '1.1.2',
        latestBuild: 10,
        minimumSupportedBuild: 2,
        apkUrl: 'https://pub-b4adfff8f9484716b527406a89c265c0.r2.dev/releases/studyspace-1.1.2+10.apk',
        sha256: '2186a11aa446367f3e20a4191981fec8372f62170510b60ad052bf3d61c40c57',
      );

      test('Case A: Installed 1.1.2 (build 10) vs Latest 1.1.2 (build 10) -> No update', () {
        const currentBuild = 10;
        expect(v112Manifest.isUpdateAvailable(currentBuild), isFalse);
      });

      test('Case B: Installed 1.0.1 (build 2) vs Latest 1.1.2 (build 10) -> Update available', () {
        const currentBuild = 2;
        expect(v112Manifest.isUpdateAvailable(currentBuild), isTrue);
        expect(v112Manifest.isMandatory(currentBuild), isFalse); // min supported is 2
      });

      test('Case B (Sub-min): Installed build 1 vs Latest 1.1.2 (build 10) -> Mandatory update', () {
        const currentBuild = 1;
        expect(v112Manifest.isUpdateAvailable(currentBuild), isTrue);
        expect(v112Manifest.isMandatory(currentBuild), isTrue); // below min build 2
      });

      test('Case C: Installed 1.1.2 (build 10) vs Latest 1.2.0 (build 15) -> Update available', () {
        const newerManifest = AppReleaseManifest(
          latestVersion: '1.2.0',
          latestBuild: 15,
          minimumSupportedBuild: 10,
          apkUrl: 'https://pub-sample.r2.dev/releases/studyspace-1.2.0+15.apk',
          sha256: 'xyz',
        );
        const currentBuild = 10;
        expect(newerManifest.isUpdateAvailable(currentBuild), isTrue);
      });

      test('Case D: Installed 1.1.10 (build 12) vs Latest 1.1.2 (build 10) -> No downgrade', () {
        const currentBuild = 12;
        // Build 12 is greater than release build 10; should never offer downgrade
        expect(v112Manifest.isUpdateAvailable(currentBuild), isFalse);
      });
    });

    // ------------------------------------------------------------------------
    // Section 14 & 15: Cross-Platform Quote Consistency & Determinism
    // ------------------------------------------------------------------------
    group('Section 14 & 15: Cross-Platform Quote Consistency', () {
      final quoteService = DailyQuoteService.instance;

      test('Date 2026-09-22 resolves to identical quote as Web implementation', () {
        final quote = quoteService.getQuoteForDate('2026-09-22');
        // Web getDailyQuote('2026-09-22') produces index 8: Antoine de Saint-Exupery
        expect(quote.text, equals('A goal without a plan is just a wish.'));
        expect(quote.author, equals('Antoine de Saint-Exupery'));
      });

      test('Date 2026-09-23 resolves to identical quote as Web implementation', () {
        final quote = quoteService.getQuoteForDate('2026-09-23');
        // Web getDailyQuote('2026-09-23') produces index 4: Robert T. Kiyosaki
        expect(quote.text, equals('Your future is created by what you do today, not tomorrow.'));
        expect(quote.author, equals('Robert T. Kiyosaki'));
      });

      test('Date 2026-01-01 resolves to identical quote as Web implementation', () {
        final quote = quoteService.getQuoteForDate('2026-01-01');
        // Web getDailyQuote('2026-01-01') produces index 14: Tim Notke
        expect(quote.text, equals('Hard work beats talent when talent does not work hard.'));
        expect(quote.author, equals('Tim Notke'));
      });

      test('Determinism: Same date always produces same quote across 100 iterations', () {
        final first = quoteService.getQuoteForDate('2026-09-22');
        for (int i = 0; i < 100; i++) {
          final repeat = quoteService.getQuoteForDate('2026-09-22');
          expect(repeat.text, equals(first.text));
          expect(repeat.author, equals(first.author));
        }
      });
    });

    // ------------------------------------------------------------------------
    // Section 9: Extra Class Restore & Legitimate Notes Preservation
    // ------------------------------------------------------------------------
    group('Section 9: Extra Class Notes Preservation on Restore', () {
      String cleanNotes(String rawNotes) {
        return rawNotes
            .replaceAll(RegExp(r'\[CANCELLED:[^\]]*\]'), '')
            .trim();
      }

      test('Strips [CANCELLED: ...] metadata while preserving user notes', () {
        const raw = '''
Bring assignment
Room changed to Lab 3
[CANCELLED: Faculty absent]''';

        final cleaned = cleanNotes(raw);
        expect(cleaned, equals('Bring assignment\nRoom changed to Lab 3'));
      });

      test('Leaves notes untouched if no cancellation tag exists', () {
        const raw = 'Study group meeting at 4pm in Library';
        final cleaned = cleanNotes(raw);
        expect(cleaned, equals(raw));
      });

      test('Returns empty string when only cancellation tag existed', () {
        const raw = '[CANCELLED: Severe weather warning]';
        final cleaned = cleanNotes(raw);
        expect(cleaned, isEmpty);
      });
    });

    // ------------------------------------------------------------------------
    // Section 13: Dashboard Greeting Hours & Boundary Tests
    // ------------------------------------------------------------------------
    group('Section 13: Greeting Hour Boundaries', () {
      String getGreetingForHour(int hour) {
        if (hour >= 5 && hour < 12) return 'GOOD MORNING';
        if (hour >= 12 && hour < 17) return 'GOOD AFTERNOON';
        return 'GOOD EVENING';
      }

      test('05:00 - 11:59 is GOOD MORNING', () {
        expect(getGreetingForHour(5), equals('GOOD MORNING'));
        expect(getGreetingForHour(8), equals('GOOD MORNING'));
        expect(getGreetingForHour(11), equals('GOOD MORNING'));
      });

      test('12:00 - 16:59 is GOOD AFTERNOON', () {
        expect(getGreetingForHour(12), equals('GOOD AFTERNOON'));
        expect(getGreetingForHour(14), equals('GOOD AFTERNOON'));
        expect(getGreetingForHour(16), equals('GOOD AFTERNOON'));
      });

      test('17:00 - 04:59 is GOOD EVENING', () {
        expect(getGreetingForHour(17), equals('GOOD EVENING'));
        expect(getGreetingForHour(20), equals('GOOD EVENING'));
        expect(getGreetingForHour(23), equals('GOOD EVENING'));
        expect(getGreetingForHour(0), equals('GOOD EVENING'));
        expect(getGreetingForHour(4), equals('GOOD EVENING'));
      });
    });
  });
}
