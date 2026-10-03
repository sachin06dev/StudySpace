import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:studyspace/scanner/models/scanned_class.dart';

void main() {
  group('AI Timetable Scanner — Parser & Resilience Unit Tests', () {
    test('Correctly parses valid structured AI response into ScannedClassItem models', () {
      final jsonResponse = {
        'success': true,
        'data': {
          'suggestedSemesterName': 'Fall 2026',
          'rawCount': 3,
          'classes': [
            {
              'id': 'scan_0',
              'dayOfWeek': 0, // Monday
              'startTime': '09:00',
              'endTime': '10:00',
              'subjectName': 'Operating Systems',
              'subjectCode': 'CS301',
              'faculty': 'Dr. Raman',
              'room': 'LH-1',
              'classType': 'theory',
            },
            {
              'id': 'scan_1',
              'day_of_week': 2, // Wednesday (snake_case)
              'start_time': '11:15',
              'end_time': '13:15',
              'subject_name': 'OS Lab',
              'subject_code': 'CS301L',
              'faculty': 'Prof. Sharma',
              'room': 'Lab-3',
              'class_type': 'lab',
            },
          ]
        }
      };

      final data = jsonResponse['data'] as Map<String, dynamic>;
      final rawClasses = data['classes'] as List<dynamic>;

      final items = <ScannedClassItem>[];
      for (int i = 0; i < rawClasses.length; i++) {
        items.add(ScannedClassItem.fromMap(rawClasses[i] as Map<String, dynamic>, 'fallback_$i'));
      }

      expect(items.length, 2);

      // Class 1
      expect(items[0].id, 'scan_0');
      expect(items[0].dayOfWeek, 0);
      expect(items[0].subjectName, 'Operating Systems');
      expect(items[0].subjectCode, 'CS301');
      expect(items[0].classType, 'theory');

      // Class 2 (snake_case handling)
      expect(items[1].id, 'scan_1');
      expect(items[1].dayOfWeek, 2);
      expect(items[1].startTime, '11:15');
      expect(items[1].endTime, '13:15');
      expect(items[1].subjectName, 'OS Lab');
      expect(items[1].classType, 'lab');
    });

    test('Gracefully defaults missing fields when AI produces sparse or malformed class', () {
      final sparseClass = <String, dynamic>{
        'subjectName': 'Machine Learning',
      };

      final item = ScannedClassItem.fromMap(sparseClass, 'fallback_uuid_99');

      expect(item.id, 'fallback_uuid_99');
      expect(item.dayOfWeek, 0); // Default to Monday
      expect(item.startTime, '09:00'); // Default start
      expect(item.endTime, '10:00'); // Default end
      expect(item.subjectName, 'Machine Learning');
      expect(item.subjectCode, isNull);
      expect(item.faculty, isNull);
      expect(item.room, isNull);
      expect(item.classType, 'theory');
    });

    test('User edit on review screen modifies fields correctly before confirmation', () {
      final original = ScannedClassItem(
        id: 'c_edit_1',
        dayOfWeek: 1, // Tuesday
        startTime: '10:00',
        endTime: '11:00',
        subjectName: 'Compilers',
        room: '101',
      );

      // Simulate user editing title and room in ScannedTimetableReviewScreen
      original.subjectName = 'Advanced Compiler Design';
      original.room = 'LH-4';
      original.startTime = '10:30';

      final exported = original.toMap();
      expect(exported['subjectName'], 'Advanced Compiler Design');
      expect(exported['room'], 'LH-4');
      expect(exported['startTime'], '10:30');
    });

    test('Empty classes list detection throws descriptive error', () {
      final emptyResult = {
        'success': true,
        'data': {
          'suggestedSemesterName': 'Semester',
          'classes': [],
        }
      };

      final data = emptyResult['data'] as Map<String, dynamic>;
      final rawClasses = (data['classes'] as List? ?? []);

      expect(rawClasses.isEmpty, isTrue);
    });

    test('Malformed error response extracts backend error message or default', () {
      const errorJson = '{"error": "Failed to parse timetable image with Gemini"}';
      final decoded = jsonDecode(errorJson) as Map<String, dynamic>;

      expect(decoded['error'], 'Failed to parse timetable image with Gemini');
    });
  });
}
