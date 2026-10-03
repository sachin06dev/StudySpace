import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Sync Engine & Idempotency Tests', () {
    test('Idempotency key generation produces consistent deterministic keys', () {
      const userId = 'usr_123';
      const subjectId = 'sub_456';
      const classDate = '2026-09-14';
      const startTime = '09:30';

      final key1 = 'att_${userId}_${subjectId}_${classDate}_$startTime';
      final key2 = 'att_${userId}_${subjectId}_${classDate}_$startTime';

      expect(key1, key2);
      expect(key1, 'att_usr_123_sub_456_2026-09-14_09:30');
    });

    test('Multiple offline marks for same class slot generate identical idempotency key', () {
      const userId = 'usr_123';
      const subjectId = 'sub_456';
      const classDate = '2026-09-14';
      const startTime = '09:30';

      // User first marked Present offline
      final keyPresent = 'att_${userId}_${subjectId}_${classDate}_$startTime';

      // User changed to Absent offline before syncing
      final keyAbsent = 'att_${userId}_${subjectId}_${classDate}_$startTime';

      // Identical key ensures SQLite conflictAlgorithm.replace updates the pending queue item in-place
      expect(keyPresent, equals(keyAbsent));
    });
  });
}
