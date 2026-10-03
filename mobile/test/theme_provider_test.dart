import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:studyspace/core/theme/theme_provider.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('ThemeProvider Tests', () {
    setUp(() {
      SharedPreferences.setMockInitialValues({});
    });

    test('Initial theme mode defaults to ThemeMode.system', () {
      final provider = ThemeProvider();
      expect(provider.themeMode, equals(ThemeMode.system));
    });

    test('Setting theme mode to Light updates state and notifies listeners', () async {
      final provider = ThemeProvider();
      bool notified = false;
      provider.addListener(() {
        notified = true;
      });

      await provider.setThemeMode(ThemeMode.light);

      expect(provider.themeMode, equals(ThemeMode.light));
      expect(notified, isTrue);

      final prefs = await SharedPreferences.getInstance();
      expect(prefs.getString('studyspace_theme_mode'), equals('light'));
    });

    test('Setting theme mode to Dark updates state and persists', () async {
      final provider = ThemeProvider();

      await provider.setThemeMode(ThemeMode.dark);

      expect(provider.themeMode, equals(ThemeMode.dark));

      final prefs = await SharedPreferences.getInstance();
      expect(prefs.getString('studyspace_theme_mode'), equals('dark'));
    });

    test('Loads existing saved theme mode preference from SharedPreferences', () async {
      SharedPreferences.setMockInitialValues({'studyspace_theme_mode': 'light'});

      final provider = ThemeProvider();
      // Wait for asynchronous _loadThemeMode to finish
      await Future<void>.delayed(const Duration(milliseconds: 50));

      expect(provider.themeMode, equals(ThemeMode.light));
    });

    testWidgets('isDark and isLight resolve properly in widget tree', (tester) async {
      final provider = ThemeProvider();

      await tester.pumpWidget(
        MaterialApp(
          themeMode: ThemeMode.light,
          home: ListenableBuilder(
            listenable: provider,
            builder: (context, _) {
              return Text(
                provider.isDark(context) ? 'Dark' : 'Light',
              );
            },
          ),
        ),
      );

      // Explicit light mode on provider
      await provider.setThemeMode(ThemeMode.light);
      await tester.pump();
      expect(find.text('Light'), findsOneWidget);

      // Explicit dark mode on provider
      await provider.setThemeMode(ThemeMode.dark);
      await tester.pump();
      expect(find.text('Dark'), findsOneWidget);
    });
  });
}
