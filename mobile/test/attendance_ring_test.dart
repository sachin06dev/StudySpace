import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:studyspace/attendance/widgets/attendance_ring.dart';

void main() {
  group('AttendanceRing Widget Tests', () {
    testWidgets('renders null percentage with fallback dash', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AttendanceRing(percentage: null),
          ),
        ),
      );

      expect(find.text('—'), findsOneWidget);
    });

    testWidgets('renders 0% percentage cleanly', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AttendanceRing(percentage: 0.0),
          ),
        ),
      );

      expect(find.text('0%'), findsOneWidget);
    });

    testWidgets('renders 100% percentage cleanly', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AttendanceRing(percentage: 100.0),
          ),
        ),
      );

      expect(find.text('100%'), findsOneWidget);
    });

    testWidgets('renders compact variant with correct dimensions', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AttendanceRing.compact(percentage: 85.0),
          ),
        ),
      );

      expect(find.text('85%'), findsOneWidget);
      final sizeFinder = find.byType(SizedBox).first;
      final SizedBox box = tester.widget(sizeFinder);
      expect(box.width, 30.0);
      expect(box.height, 30.0);
    });

    testWidgets('renders hero variant with larger size', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AttendanceRing.hero(percentage: 92.4),
          ),
        ),
      );

      expect(find.text('92%'), findsOneWidget);
      final sizeFinder = find.byType(SizedBox).first;
      final SizedBox box = tester.widget(sizeFinder);
      expect(box.width, 76.0);
      expect(box.height, 76.0);
    });
  });
}
