import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:studyspace/attendance/models/subject_attendance.dart';
import 'package:studyspace/attendance/services/class_resolution_service.dart';
import 'package:studyspace/attendance/widgets/attendance_calendar_header.dart';
import 'package:studyspace/attendance/widgets/attendance_class_card.dart';
import 'package:studyspace/attendance/widgets/attendance_empty_state.dart';
import 'package:studyspace/attendance/widgets/attendance_filter_sheet.dart';
import 'package:studyspace/attendance/widgets/attendance_timeline.dart';
import 'package:studyspace/core/utils/user_name_resolver.dart';
import 'package:studyspace/timetable/models/subject.dart';

void main() {
  group('Attendance Redesign Widget Tests', () {
    testWidgets('AttendanceCalendarHeader renders week days and triggers selection', (tester) async {
      DateTime? selected;
      final testDate = DateTime(2026, 9, 14); // Monday

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AttendanceCalendarHeader(
              selectedDate: testDate,
              datesWithClasses: const {'2026-09-14', '2026-09-16'},
              onDateSelected: (d) => selected = d,
            ),
          ),
        ),
      );

      // Should show month name
      expect(find.text('September 2026'), findsOneWidget);

      // Tap on a date item (e.g. text '14')
      final day14 = find.text('14');
      expect(day14, findsOneWidget);
      await tester.tap(day14);
      await tester.pump();

      expect(selected, isNotNull);
      expect(selected!.day, 14);
    });

    testWidgets('AttendanceEmptyState renders title, message and action button', (tester) async {
      bool actionTapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AttendanceEmptyState(
              title: 'No classes today',
              message: 'Your schedule is clear.',
              actionLabel: 'Add class',
              onAction: () => actionTapped = true,
            ),
          ),
        ),
      );

      expect(find.text('No classes today'), findsOneWidget);
      expect(find.text('Your schedule is clear.'), findsOneWidget);
      expect(find.text('Add class'), findsOneWidget);

      await tester.tap(find.text('Add class'));
      expect(actionTapped, isTrue);
    });

    testWidgets('AttendanceClassCard renders un-marked state with Present and Absent buttons', (tester) async {
      final dummyClass = ResolvedClass(
        id: 'c1',
        slotId: 's1',
        subjectId: 'sub1',
        subjectName: 'Operating Systems',
        classType: 'theory',
        startTime: '09:00:00',
        endTime: '10:00:00',
        isExtra: false,
        isRescheduled: false,
        isCancelled: false,
        room: 'Lab 2',
        faculty: 'Dr. Linus',
      );

      final dummySubject = Subject(
        id: 'sub1',
        userId: 'u1',
        semesterId: 'sem1',
        name: 'Operating Systems',
      );

      final dummySummary = SubjectAttendanceSummary(
        subject: dummySubject,
        effectiveAttended: 8,
        effectiveTotal: 10,
        presentCount: 8,
        absentCount: 2,
        cancelledCount: 0,
        percentage: 80.0,
        targetPercentage: 75.0,
        bunkAllowance: 1,
        recoveryRequirement: 0,
        riskState: RiskState.safe,
        statusMessage: 'You can miss 1 class',
      );

      String? markedStatus;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AttendanceClassCard(
              resolvedClass: dummyClass,
              subjectSummary: dummySummary,
              onMarkAttendance: (st) => markedStatus = st,
              onClearAttendance: () {},
            ),
          ),
        ),
      );

      expect(find.text('Operating Systems'), findsOneWidget);
      expect(find.text('THEORY'), findsOneWidget); // Theory badge
      expect(find.text('You can miss 1 class'), findsOneWidget);
      expect(find.text('Present'), findsOneWidget);
      expect(find.text('Absent'), findsOneWidget);

      // Tap Present
      await tester.tap(find.text('Present'));
      expect(markedStatus, 'present');
    });

    testWidgets('AttendanceClassCard renders Present marked state with badge and change action', (tester) async {
      final dummyClass = ResolvedClass(
        id: 'c2',
        slotId: 's2',
        subjectId: 'sub2',
        subjectName: 'Computer Networks',
        classType: 'lab',
        startTime: '11:00:00',
        endTime: '13:00:00',
        isExtra: false,
        isRescheduled: false,
        isCancelled: false,
        attendanceStatus: 'present',
      );

      bool cleared = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AttendanceClassCard(
              resolvedClass: dummyClass,
              onMarkAttendance: (_) {},
              onClearAttendance: () => cleared = true,
            ),
          ),
        ),
      );

      expect(find.text('Computer Networks'), findsOneWidget);
      expect(find.text('Present'), findsOneWidget);
      expect(find.text('Absent'), findsOneWidget);
      expect(find.text('Cancel'), findsOneWidget);

      await tester.tap(find.text('Cancel'));
      expect(cleared, isTrue);
    });

    testWidgets('AttendanceFilterSheet displays options and executes onApply', (tester) async {
      String appliedValue = '';

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Builder(
              builder: (ctx) => ElevatedButton(
                onPressed: () {
                  AttendanceFilterSheet.show(
                    context: ctx,
                    title: 'Filter by Status',
                    options: const [
                      FilterOption(value: 'ALL', label: 'All Statuses'),
                      FilterOption(value: 'present', label: 'Present'),
                      FilterOption(value: 'absent', label: 'Absent'),
                    ],
                    selectedValue: 'ALL',
                    onApply: (v) => appliedValue = v,
                  );
                },
                child: const Text('Open Sheet'),
              ),
            ),
          ),
        ),
      );

      await tester.tap(find.text('Open Sheet'));
      await tester.pumpAndSettle();

      expect(find.text('Filter by Status'), findsOneWidget);
      expect(find.text('Present'), findsOneWidget);
      expect(find.text('Absent'), findsOneWidget);

      // Tap Present option
      await tester.tap(find.text('Present'));
      await tester.pump();

      // Tap Apply button
      await tester.tap(find.text('Apply'));
      await tester.pumpAndSettle();

      expect(appliedValue, 'present');
    });

    test('UserNameResolver correctly formats email local-part fallback', () {
      expect(UserNameResolver.formatEmailLocalPart('demo505user@example.com'), 'Demo505user');
      expect(UserNameResolver.formatEmailLocalPart('john.doe@university.edu'), 'John Doe');
      expect(UserNameResolver.formatEmailLocalPart('alex_smith@domain.org'), 'Alex Smith');
      expect(UserNameResolver.formatEmailLocalPart(null), 'Student');
      expect(UserNameResolver.formatEmailLocalPart(''), 'Student');
    });

    for (final width in [320.0, 360.0, 390.0, 412.0]) {
      testWidgets('AttendanceClassCard fits without overflow on ${width.toInt()}dp width', (tester) async {
        tester.view.physicalSize = Size(width * 2, 800 * 2);
        tester.view.devicePixelRatio = 2.0;
        addTearDown(() => tester.view.resetPhysicalSize());

        final dummyClass = ResolvedClass(
          id: 'c_$width',
          slotId: 's_$width',
          subjectId: 'sub_$width',
          subjectName: 'Mobile Software Engineering',
          classType: 'lecture',
          startTime: '09:00:00',
          endTime: '10:00:00',
          isExtra: false,
          isRescheduled: false,
          isCancelled: false,
          attendanceStatus: null,
        );

        await tester.pumpWidget(
          MaterialApp(
            home: Scaffold(
              body: SizedBox(
                width: width,
                child: AttendanceClassCard(
                  resolvedClass: dummyClass,
                  onMarkAttendance: (_) {},
                  onClearAttendance: () {},
                ),
              ),
            ),
          ),
        );

        expect(tester.takeException(), isNull);
        expect(find.text('Present'), findsOneWidget);
        expect(find.text('Absent'), findsOneWidget);
        expect(find.text('Cancel'), findsOneWidget);
      });
    }

    testWidgets('AttendanceTimeline renders multiple classes with full buttons and zero clipping', (tester) async {
      tester.view.physicalSize = const Size(390 * 2, 844 * 2);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      final class1 = ResolvedClass(
        id: 'c1',
        slotId: 's1',
        subjectId: 'sub1',
        subjectName: 'Object Oriented Programming Lab (OOP)',
        classType: 'lab',
        startTime: '08:30:00',
        endTime: '09:30:00',
        room: 'CT-03',
        faculty: 'Ms. Preeti Sharma (PS)',
        isExtra: false,
        isRescheduled: false,
        isCancelled: false,
        attendanceStatus: 'present',
      );

      final class2 = ResolvedClass(
        id: 'c2',
        slotId: 's2',
        subjectId: 'sub2',
        subjectName: 'Software Engineering LAB (SE)',
        classType: 'lab',
        startTime: '09:30:00',
        endTime: '10:30:00',
        room: 'CT-09',
        faculty: 'Ms. Khushi Parmar (KP)',
        isExtra: false,
        isRescheduled: false,
        isCancelled: false,
        attendanceStatus: null,
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: AttendanceTimeline(
                classes: [class1, class2],
                subjectSummaries: const {},
                onMarkAttendance: (_, __) {},
                onClearAttendance: (_) {},
              ),
            ),
          ),
        ),
      );

      expect(tester.takeException(), isNull);
      expect(find.text('Object Oriented Programming Lab (OOP)'), findsOneWidget);
      expect(find.text('Software Engineering LAB (SE)'), findsOneWidget);
      expect(find.text('Present'), findsNWidgets(2));
      expect(find.text('Absent'), findsNWidgets(2));
      expect(find.text('Cancel'), findsNWidgets(2));
    });
  });
}
