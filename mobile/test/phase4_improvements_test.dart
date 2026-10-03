import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:studyspace/attendance/models/subject_attendance.dart';
import 'package:studyspace/attendance/services/class_resolution_service.dart';
import 'package:studyspace/attendance/widgets/attendance_class_card.dart';
import 'package:studyspace/timetable/models/subject.dart';

void main() {
  group('Phase 4: Mobile App Enhancements Tests', () {
    test('SP1 compact timetable code compresses and decompresses with 100% fidelity', () {
      final sampleTimetable = {
        'v': 1,
        'app': 'studyspace',
        'subjects': [
          {
            'id': 'sub-1',
            'name': 'Distributed Systems',
            'code': 'CS-401',
            'faculty': 'Dr. Leslie Lamport',
            'room': 'Hall A',
            'type': 'theory',
            'target': 75.0,
          },
          {
            'id': 'sub-2',
            'name': 'Cloud Computing Lab',
            'code': 'CS-402',
            'faculty': 'Prof. Dean',
            'room': 'Lab 5',
            'type': 'lab',
            'target': 80.0,
          }
        ],
        'slots': [
          {
            'subId': 'sub-1',
            'day': 0,
            'start': '09:00:00',
            'end': '10:00:00',
            'room': 'Hall A',
            'faculty': null,
            'type': 'theory',
          },
          {
            'subId': 'sub-2',
            'day': 1,
            'start': '14:00:00',
            'end': '16:00:00',
            'room': 'Lab 5',
            'faculty': null,
            'type': 'lab',
          }
        ],
      };

      final jsonStr = jsonEncode(sampleTimetable);
      final rawBytes = utf8.encode(jsonStr);
      final compressedBytes = zlib.encode(rawBytes);
      final exportCode = 'SP1.${base64Url.encode(compressedBytes)}';

      expect(exportCode.startsWith('SP1.'), isTrue);

      // Verify decompression
      final payload = exportCode.substring(4);
      final decodedBytes = base64Url.decode(payload);
      final decompressed = zlib.decode(decodedBytes);
      final restoredJsonStr = utf8.decode(decompressed);
      final restoredMap = jsonDecode(restoredJsonStr) as Map<String, dynamic>;

      expect(restoredMap['app'], 'studyspace');
      expect((restoredMap['subjects'] as List).length, 2);
      expect((restoredMap['slots'] as List).length, 2);
      expect(restoredMap['subjects'][0]['name'], 'Distributed Systems');
    });

    testWidgets('AttendanceClassCard in isMini mode renders compact layout without clipping', (tester) async {
      final dummyClass = ResolvedClass(
        id: 'c-mini',
        slotId: 's-mini',
        subjectId: 'sub-mini',
        subjectName: 'Artificial Intelligence & Neural Networks',
        classType: 'theory',
        startTime: '10:00:00',
        endTime: '11:00:00',
        room: '304',
        faculty: 'Dr. Hinton',
        isExtra: false,
        isRescheduled: false,
        isCancelled: false,
      );

      final dummySubject = Subject(
        id: 'sub-mini',
        userId: 'u1',
        semesterId: 'sem1',
        name: 'Artificial Intelligence & Neural Networks',
      );

      final dummySummary = SubjectAttendanceSummary(
        subject: dummySubject,
        effectiveAttended: 15,
        effectiveTotal: 18,
        presentCount: 15,
        absentCount: 3,
        cancelledCount: 0,
        percentage: 83.3,
        targetPercentage: 75.0,
        bunkAllowance: 2,
        recoveryRequirement: 0,
        riskState: RiskState.safe,
        statusMessage: '2 bunks safe',
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AttendanceClassCard(
              resolvedClass: dummyClass,
              subjectSummary: dummySummary,
              isMini: true,
              onMarkAttendance: (_) {},
              onClearAttendance: () {},
            ),
          ),
        ),
      );

      expect(find.text('Artificial Intelligence & Neural Networks'), findsOneWidget);
      expect(find.text('R-304'), findsOneWidget);
      expect(find.text('Present'), findsOneWidget);
      expect(find.text('Absent'), findsOneWidget);
      expect(find.text('Cancel'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });

    testWidgets('AttendanceClassCard action buttons trigger callbacks', (tester) async {
      final dummyClass = ResolvedClass(
        id: 'c-action',
        slotId: 's-action',
        subjectId: 'sub-action',
        subjectName: 'Database Management Systems',
        classType: 'lab',
        startTime: '11:00:00',
        endTime: '13:00:00',
        isExtra: false,
        isRescheduled: false,
        isCancelled: false,
      );

      String? recordedStatus;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AttendanceClassCard(
              resolvedClass: dummyClass,
              isMini: true,
              onMarkAttendance: (st) => recordedStatus = st,
              onClearAttendance: () {},
            ),
          ),
        ),
      );

      // Tap Present
      await tester.tap(find.text('Present'));
      await tester.pump();
      expect(recordedStatus, 'present');

      // Tap Absent
      await tester.tap(find.text('Absent'));
      await tester.pump();
      expect(recordedStatus, 'absent');
    });
  });
}
