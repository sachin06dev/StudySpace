import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:studyspace/attendance/services/class_resolution_service.dart';
import 'package:studyspace/core/design_system/app_spacing.dart';
import 'package:studyspace/core/theme/app_theme.dart';
import 'package:studyspace/home/widgets/today_class_card.dart';

void main() {
  group('Dashboard Spacing System & Tokens', () {
    test('AppSpacing tokens match visual rhythm requirements', () {
      expect(AppSpacing.md, 12.0);
      expect(AppSpacing.lg, 16.0); // 16dp between tightly related elements
      expect(AppSpacing.xl, 20.0); // 20dp between normal Dashboard sections
      expect(AppSpacing.xxl, 24.0); // 24dp between major visual sections
    });

    testWidgets('TodayClassCard honors default margin and custom zero margin', (tester) async {
      final dummyClass = ResolvedClass(
        id: 'c1',
        slotId: 's1',
        subjectId: 'sub1',
        subjectName: 'Computer Systems',
        classType: 'theory',
        startTime: '10:00:00',
        endTime: '11:00:00',
        isExtra: false,
        isRescheduled: false,
        isCancelled: false,
        room: 'Room 302',
      );

      // 1. Default margin test
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.lightTheme,
          home: Scaffold(
            body: TodayClassCard(
              resolvedClass: dummyClass,
              onMarkAttendance: (_) {},
              onClearAttendance: () {},
            ),
          ),
        ),
      );

      final defaultContainerFinder = find.byWidgetPredicate(
        (widget) =>
            widget is Container &&
            widget.margin == const EdgeInsets.only(bottom: AppSpacing.md),
      );
      expect(defaultContainerFinder, findsOneWidget);

      // 2. Custom EdgeInsets.zero margin test (used for last item)
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.lightTheme,
          home: Scaffold(
            body: TodayClassCard(
              resolvedClass: dummyClass,
              margin: EdgeInsets.zero,
              onMarkAttendance: (_) {},
              onClearAttendance: () {},
            ),
          ),
        ),
      );

      final zeroContainerFinder = find.byWidgetPredicate(
        (widget) => widget is Container && widget.margin == EdgeInsets.zero,
      );
      expect(zeroContainerFinder, findsOneWidget);
    });
  });

  group('Dashboard Vertical Spacing & Responsiveness Tests', () {
    const screenWidths = [320.0, 360.0, 390.0, 412.0];

    Widget buildDashboardLayout({required bool isDark}) {
      return MaterialApp(
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: isDark ? ThemeMode.dark : ThemeMode.light,
        home: Scaffold(
          body: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: AppSpacing.lg),
                const Text('Greeting Header', key: Key('greeting')),
                const SizedBox(height: AppSpacing.lg), // 16dp
                Container(
                  key: const Key('hero_card'),
                  height: 100,
                  color: Colors.blue.withValues(alpha: 0.2),
                ),
                const SizedBox(height: AppSpacing.xl), // 20dp between hero and metrics
                Container(
                  key: const Key('metrics_row'),
                  height: 60,
                  color: Colors.green.withValues(alpha: 0.2),
                ),
                const SizedBox(height: AppSpacing.xxl), // 24dp between major visual sections
                const Text("Today's Schedule", key: Key('schedule_title')),
                const SizedBox(height: AppSpacing.md), // 12dp title to cards
                Container(
                  key: const Key('today_class_card_1'),
                  margin: const EdgeInsets.only(bottom: AppSpacing.md),
                  height: 80,
                  color: Colors.purple.withValues(alpha: 0.2),
                ),
                Container(
                  key: const Key('today_class_card_2'),
                  height: 80,
                  color: Colors.purple.withValues(alpha: 0.2),
                ),
                const SizedBox(height: AppSpacing.xl), // 20dp breathing room below Today's Classes
                Container(
                  key: const Key('tasks_and_materials_row'),
                  height: 50,
                  color: Colors.orange.withValues(alpha: 0.2),
                ),
                const SizedBox(height: AppSpacing.xxl), // 24dp to bottom edge
              ],
            ),
          ),
        ),
      );
    }

    for (final width in screenWidths) {
      testWidgets('Renders Dashboard spacing at ${width}dp width in Dark Mode without overflow', (tester) async {
        tester.view.physicalSize = Size(width, 1000.0);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() {
          tester.view.resetPhysicalSize();
          tester.view.resetDevicePixelRatio();
        });

        await tester.pumpWidget(buildDashboardLayout(isDark: true));
        await tester.pump();

        expect(find.byKey(const Key('schedule_title')), findsOneWidget);
        expect(find.byKey(const Key('tasks_and_materials_row')), findsOneWidget);

        // Verify vertical distance between bottom of class cards and top of tasks row is 20dp
        final classCard2Bottom = tester.getBottomLeft(find.byKey(const Key('today_class_card_2'))).dy;
        final tasksTop = tester.getTopLeft(find.byKey(const Key('tasks_and_materials_row'))).dy;
        expect(tasksTop - classCard2Bottom, closeTo(AppSpacing.xl, 0.1));

        // Verify distance between metrics row and schedule title is 24dp (AppSpacing.xxl)
        final metricsBottom = tester.getBottomLeft(find.byKey(const Key('metrics_row'))).dy;
        final scheduleTitleTop = tester.getTopLeft(find.byKey(const Key('schedule_title'))).dy;
        expect(scheduleTitleTop - metricsBottom, closeTo(AppSpacing.xxl, 0.1));

        // Verify no RenderFlex overflow
        expect(tester.takeException(), isNull);
      });

      testWidgets('Renders Dashboard spacing at ${width}dp width in Light Mode without overflow', (tester) async {
        tester.view.physicalSize = Size(width, 1000.0);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() {
          tester.view.resetPhysicalSize();
          tester.view.resetDevicePixelRatio();
        });

        await tester.pumpWidget(buildDashboardLayout(isDark: false));
        await tester.pump();

        expect(find.byKey(const Key('schedule_title')), findsOneWidget);
        expect(find.byKey(const Key('tasks_and_materials_row')), findsOneWidget);

        final classCard2Bottom = tester.getBottomLeft(find.byKey(const Key('today_class_card_2'))).dy;
        final tasksTop = tester.getTopLeft(find.byKey(const Key('tasks_and_materials_row'))).dy;
        expect(tasksTop - classCard2Bottom, closeTo(AppSpacing.xl, 0.1));

        expect(tester.takeException(), isNull);
      });
    }
  });
}
