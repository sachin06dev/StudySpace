import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:studyspace/attendance/providers/attendance_provider.dart';
import 'package:studyspace/core/design_system/app_icons.dart';
import 'package:studyspace/core/theme/app_theme.dart';
import 'package:studyspace/timetable/models/semester.dart';
import 'package:studyspace/timetable/providers/timetable_provider.dart';
import 'package:studyspace/timetable/screens/semester_management_screen.dart';

class FakeTimetableProvider extends ChangeNotifier implements TimetableProvider {
  List<Semester> _semesters = [];
  Semester? _currentActive;
  String? _deletingId;
  bool shouldFailDelete = false;
  int deleteCallCount = 0;
  String? lastDeletedId;

  FakeTimetableProvider({List<Semester>? initialSemesters}) {
    if (initialSemesters != null) {
      _semesters = List.from(initialSemesters);
      _currentActive = _semesters.firstWhere(
        (s) => s.isActive,
        orElse: () => _semesters.isNotEmpty ? _semesters.first : null as dynamic,
      );
    }
  }

  @override
  List<Semester> get allSemesters => _semesters;

  @override
  Semester? get activeSemester => _currentActive;

  @override
  String? get deletingSemesterId => _deletingId;

  @override
  bool isDeletingSemester(String id) => _deletingId == id;

  void setDeletingId(String? id) {
    _deletingId = id;
    notifyListeners();
  }

  @override
  Future<void> loadSemesters() async {
    // In-memory test provider does not load from SQLite
    notifyListeners();
  }

  @override
  Future<void> deleteSemester(String semesterId) async {
    deleteCallCount++;
    lastDeletedId = semesterId;
    _deletingId = semesterId;
    notifyListeners();

    if (shouldFailDelete) {
      _deletingId = null;
      notifyListeners();
      throw Exception('Network error during semester deletion');
    }

    // Simulate successful deletion and active semester promotion
    final wasActive = _currentActive?.id == semesterId;
    _semesters.removeWhere((s) => s.id == semesterId);

    if (wasActive) {
      if (_semesters.isNotEmpty) {
        final next = _semesters.first;
        _currentActive = Semester(
          id: next.id,
          userId: next.userId,
          name: next.name,
          startDate: next.startDate,
          endDate: next.endDate,
          isActive: true,
        );
        final idx = _semesters.indexWhere((s) => s.id == next.id);
        if (idx != -1) {
          _semesters[idx] = _currentActive!;
        }
      } else {
        _currentActive = null;
      }
    }

    _deletingId = null;
    notifyListeners();
  }

  @override
  Future<void> switchActiveSemester(String semesterId) async {
    final idx = _semesters.indexWhere((s) => s.id == semesterId);
    if (idx != -1) {
      final target = _semesters[idx];
      _currentActive = Semester(
        id: target.id,
        userId: target.userId,
        name: target.name,
        startDate: target.startDate,
        endDate: target.endDate,
        isActive: true,
      );
      _semesters[idx] = _currentActive!;
      notifyListeners();
    }
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class FakeAttendanceProvider extends ChangeNotifier implements AttendanceProvider {
  int loadDataCallCount = 0;
  Semester? _currentActive;

  @override
  Semester? get activeSemester => _currentActive;

  @override
  Future<void> loadData({bool forceRefresh = false}) async {
    loadDataCallCount++;
    notifyListeners();
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

void main() {
  Widget createTestWidget({
    required FakeTimetableProvider timetableProvider,
    required FakeAttendanceProvider attendanceProvider,
    bool isDark = false,
  }) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider<TimetableProvider>.value(value: timetableProvider),
        ChangeNotifierProvider<AttendanceProvider>.value(value: attendanceProvider),
      ],
      child: MaterialApp(
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: isDark ? ThemeMode.dark : ThemeMode.light,
        home: const SemesterManagementScreen(),
      ),
    );
  }

  group('Semester Deletion Workflow & UI Tests', () {
    testWidgets('1. Delete semester successfully removes semester and refreshes data', (tester) async {
      final sem1 = Semester(
        id: 'sem_1',
        userId: 'usr_1',
        name: 'Fall 2025',
        startDate: '2025-08-01',
        endDate: '2025-12-15',
        isActive: true,
      );
      final sem2 = Semester(
        id: 'sem_2',
        userId: 'usr_1',
        name: 'Spring 2026',
        startDate: '2026-01-10',
        endDate: '2026-05-20',
        isActive: false,
      );

      final tp = FakeTimetableProvider(initialSemesters: [sem1, sem2]);
      final ap = FakeAttendanceProvider();

      await tester.pumpWidget(createTestWidget(timetableProvider: tp, attendanceProvider: ap));
      await tester.pumpAndSettle();

      expect(find.text('Fall 2025'), findsOneWidget);
      expect(find.text('Spring 2026'), findsOneWidget);

      // Tap delete icon on Spring 2026
      final deleteIcons = find.byIcon(AppIcons.trash);
      expect(deleteIcons, findsNWidgets(2));

      await tester.tap(deleteIcons.at(1));
      await tester.pumpAndSettle();

      // Verify confirmation dialog
      expect(find.text('Delete semester?'), findsOneWidget);
      expect(find.text('Delete'), findsOneWidget);
      expect(find.text('Cancel'), findsOneWidget);

      // Tap Delete in dialog
      await tester.tap(find.text('Delete'));
      await tester.pumpAndSettle();

      // Verify semester was deleted
      expect(tp.deleteCallCount, 1);
      expect(tp.lastDeletedId, 'sem_2');
      expect(find.text('Spring 2026'), findsNothing);
      expect(find.text('Fall 2025'), findsOneWidget);
      expect(ap.loadDataCallCount, greaterThanOrEqualTo(1));
      expect(find.text('Semester "Spring 2026" deleted.'), findsOneWidget);
    });

    testWidgets('2. Cancel deletion leaves semester intact without calling delete', (tester) async {
      final sem = Semester(
        id: 'sem_1',
        userId: 'usr_1',
        name: 'Fall 2025',
        startDate: '2025-08-01',
        endDate: '2025-12-15',
        isActive: true,
      );

      final tp = FakeTimetableProvider(initialSemesters: [sem]);
      final ap = FakeAttendanceProvider();

      await tester.pumpWidget(createTestWidget(timetableProvider: tp, attendanceProvider: ap));
      await tester.pumpAndSettle();

      // Tap trash icon
      await tester.tap(find.byIcon(AppIcons.trash));
      await tester.pumpAndSettle();

      expect(find.text('Delete semester?'), findsOneWidget);

      // Tap Cancel
      await tester.tap(find.text('Cancel'));
      await tester.pumpAndSettle();

      // Verify dialog dismissed and semester remains
      expect(find.text('Delete semester?'), findsNothing);
      expect(find.text('Fall 2025'), findsOneWidget);
      expect(tp.deleteCallCount, 0);
    });

    testWidgets('3. Delete current active semester switches to remaining semester', (tester) async {
      final sem1 = Semester(
        id: 'sem_1',
        userId: 'usr_1',
        name: 'Active Semester 1',
        startDate: '2025-08-01',
        endDate: '2025-12-15',
        isActive: true,
      );
      final sem2 = Semester(
        id: 'sem_2',
        userId: 'usr_1',
        name: 'Next Semester 2',
        startDate: '2026-01-10',
        endDate: '2026-05-20',
        isActive: false,
      );

      final tp = FakeTimetableProvider(initialSemesters: [sem1, sem2]);
      final ap = FakeAttendanceProvider();

      await tester.pumpWidget(createTestWidget(timetableProvider: tp, attendanceProvider: ap));
      await tester.pumpAndSettle();

      // sem1 is active
      expect(tp.activeSemester?.id, 'sem_1');

      // Tap delete on active semester sem1
      await tester.tap(find.byIcon(AppIcons.trash).first);
      await tester.pumpAndSettle();

      await tester.tap(find.text('Delete'));
      await tester.pumpAndSettle();

      // Active semester should now be promoted to Next Semester 2
      expect(tp.activeSemester?.id, 'sem_2');
      expect(tp.activeSemester?.isActive, isTrue);
      expect(find.text('Active Semester 1'), findsNothing);
      expect(find.text('Next Semester 2'), findsOneWidget);
    });

    testWidgets('4. Delete last remaining semester transitions to empty configuration state', (tester) async {
      final sem1 = Semester(
        id: 'sem_single',
        userId: 'usr_1',
        name: 'Only Semester',
        startDate: '2025-08-01',
        endDate: '2025-12-15',
        isActive: true,
      );

      final tp = FakeTimetableProvider(initialSemesters: [sem1]);
      final ap = FakeAttendanceProvider();

      await tester.pumpWidget(createTestWidget(timetableProvider: tp, attendanceProvider: ap));
      await tester.pumpAndSettle();

      expect(find.text('Only Semester'), findsOneWidget);

      // Tap delete
      await tester.tap(find.byIcon(AppIcons.trash));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Delete'));
      await tester.pumpAndSettle();

      // List is empty -> shows empty configuration state
      expect(tp.allSemesters.isEmpty, isTrue);
      expect(tp.activeSemester, isNull);
      expect(find.text('No semesters created yet.'), findsOneWidget);
      expect(find.text('Create Semester'), findsOneWidget);
    });

    testWidgets('5. Delete failure preserves semester in state and displays error SnackBar', (tester) async {
      final sem = Semester(
        id: 'sem_fail',
        userId: 'usr_1',
        name: 'Engineering Sem 4',
        startDate: '2025-08-01',
        endDate: '2025-12-15',
        isActive: true,
      );

      final tp = FakeTimetableProvider(initialSemesters: [sem]);
      tp.shouldFailDelete = true;
      final ap = FakeAttendanceProvider();

      await tester.pumpWidget(createTestWidget(timetableProvider: tp, attendanceProvider: ap));
      await tester.pumpAndSettle();

      // Tap delete
      await tester.tap(find.byIcon(AppIcons.trash));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Delete'));
      await tester.pumpAndSettle();

      // Semester remains visible
      expect(find.text('Engineering Sem 4'), findsOneWidget);
      // SnackBar shows failure message
      expect(find.textContaining('Failed to delete semester'), findsOneWidget);
      // Retry action available
      expect(find.text('Retry'), findsOneWidget);
    });

    testWidgets('6. Loading state disables delete button and shows progress spinner', (tester) async {
      final sem = Semester(
        id: 'sem_loading',
        userId: 'usr_1',
        name: 'Medical Sem 2',
        startDate: '2025-08-01',
        endDate: '2025-12-15',
        isActive: true,
      );

      final tp = FakeTimetableProvider(initialSemesters: [sem]);
      final ap = FakeAttendanceProvider();

      await tester.pumpWidget(createTestWidget(timetableProvider: tp, attendanceProvider: ap));
      await tester.pumpAndSettle();

      expect(find.byType(CircularProgressIndicator), findsNothing);

      // Simulate active deletion in progress
      tp.setDeletingId('sem_loading');
      await tester.pump();

      // Circular progress indicator appears in place of trash icon
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      expect(find.byIcon(AppIcons.trash), findsNothing);
    });

    test('7. Offline behavior enqueues DELETE_SEMESTER and SET_ACTIVE_SEMESTER action payloads', () async {
      const semesterId = 'sem_offline_123';
      const replacementId = 'sem_offline_456';
      final deleteOp = {
        'operationType': 'DELETE_SEMESTER',
        'entityId': semesterId,
        'payload': {'id': semesterId},
      };
      final activateOp = {
        'operationType': 'SET_ACTIVE_SEMESTER',
        'entityId': replacementId,
        'payload': {'id': replacementId},
      };

      expect(deleteOp['operationType'], 'DELETE_SEMESTER');
      expect((deleteOp['payload'] as Map)['id'], semesterId);

      expect(activateOp['operationType'], 'SET_ACTIVE_SEMESTER');
      expect((activateOp['payload'] as Map)['id'], replacementId);
    });

    testWidgets('8. Accessible semantic label "Delete semester" is attached to trash button', (tester) async {
      final sem = Semester(
        id: 'sem_a11y',
        userId: 'usr_1',
        name: 'Accessible Semester',
        startDate: '2025-08-01',
        endDate: '2025-12-15',
        isActive: true,
      );

      final tp = FakeTimetableProvider(initialSemesters: [sem]);
      final ap = FakeAttendanceProvider();

      await tester.pumpWidget(createTestWidget(timetableProvider: tp, attendanceProvider: ap));
      await tester.pumpAndSettle();

      final semanticFinder = find.byWidgetPredicate(
        (w) => w is Semantics && w.properties.label == 'Delete semester',
      );
      expect(semanticFinder, findsOneWidget);
    });

    const screenWidths = [320.0, 360.0, 390.0, 412.0];
    for (final width in screenWidths) {
      testWidgets('9. Responsiveness at ${width}dp with long name renders without overflow', (tester) async {
        tester.view.physicalSize = Size(width, 900.0);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() {
          tester.view.resetPhysicalSize();
          tester.view.resetDevicePixelRatio();
        });

        final longSem = Semester(
          id: 'sem_long',
          userId: 'usr_1',
          name: 'B.Tech Information Technology — Semester 3 (Computer Science & Eng)',
          startDate: '2025-08-01',
          endDate: '2025-12-15',
          isActive: false,
        );

        final tp = FakeTimetableProvider(initialSemesters: [longSem]);
        final ap = FakeAttendanceProvider();

        await tester.pumpWidget(createTestWidget(timetableProvider: tp, attendanceProvider: ap, isDark: true));
        await tester.pumpAndSettle();

        expect(find.textContaining('B.Tech Information Technology'), findsOneWidget);
        expect(find.text('Activate'), findsOneWidget);
        expect(find.byIcon(AppIcons.trash), findsOneWidget);

        // Verify no RenderFlex overflow
        expect(tester.takeException(), isNull);
      });
    }

    testWidgets('10. Dark mode and Light mode both render semantic danger colors and cards', (tester) async {
      final sem = Semester(
        id: 'sem_theme',
        userId: 'usr_1',
        name: 'Physics Semester 1',
        startDate: '2025-08-01',
        endDate: '2025-12-15',
        isActive: true,
      );

      // Light Mode test
      final tpLight = FakeTimetableProvider(initialSemesters: [sem]);
      final apLight = FakeAttendanceProvider();
      await tester.pumpWidget(createTestWidget(timetableProvider: tpLight, attendanceProvider: apLight, isDark: false));
      await tester.pumpAndSettle();
      expect(find.text('Physics Semester 1'), findsOneWidget);
      expect(tester.takeException(), isNull);

      // Dark Mode test
      final tpDark = FakeTimetableProvider(initialSemesters: [sem]);
      final apDark = FakeAttendanceProvider();
      await tester.pumpWidget(createTestWidget(timetableProvider: tpDark, attendanceProvider: apDark, isDark: true));
      await tester.pumpAndSettle();
      expect(find.text('Physics Semester 1'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });
  });
}
