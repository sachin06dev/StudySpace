import 'dart:async';
import 'package:flutter/widgets.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';
import '../models/pomodoro_session.dart';
import '../../core/database/database_helper.dart';
import '../../core/realtime/realtime_sync_service.dart';
import '../../core/services/feedback_service.dart';
import '../../core/supabase/supabase_client.dart';
import '../../core/sync/sync_engine.dart';
import '../../notifications/services/notification_service.dart';

class PomodoroProvider extends ChangeNotifier with WidgetsBindingObserver {
  final DatabaseHelper _db = DatabaseHelper.instance;
  final NotificationService _notifications = NotificationService.instance;
  final FeedbackService _feedback = FeedbackService.instance;
  final _uuid = const Uuid();
  StreamSubscription<RealtimePomodoroEvent>? _pomodoroSub;

  // Mode: 'focus', 'short_break', 'long_break'
  String _currentMode = 'focus';
  String get currentMode => _currentMode;

  int _focusDurationMinutes = 25;
  int _shortBreakMinutes = 5;
  int _longBreakMinutes = 15;
  int _longBreakInterval = 4;

  int get focusDurationMinutes => _focusDurationMinutes;
  int get shortBreakMinutes => _shortBreakMinutes;
  int get longBreakMinutes => _longBreakMinutes;
  int get longBreakInterval => _longBreakInterval;

  String get activePresetName {
    if (_focusDurationMinutes == 25 && _shortBreakMinutes == 5 && _longBreakMinutes == 15) {
      return '25 / 5';
    } else if (_focusDurationMinutes == 50 && _shortBreakMinutes == 10 && _longBreakMinutes == 20) {
      return '50 / 10';
    } else if (_focusDurationMinutes == 90 && _shortBreakMinutes == 15 && _longBreakMinutes == 30) {
      return '90 / 15';
    }
    return 'Custom';
  }

  late int _remainingSeconds;
  int get remainingSeconds => _remainingSeconds;

  bool _isRunning = false;
  bool get isRunning => _isRunning;

  bool _isPaused = false;
  bool get isPaused => _isPaused;

  Timer? _ticker;
  String? _currentSessionId;
  DateTime? _sessionStartTime;
  DateTime? _plannedEndTime;

  List<PomodoroSession> _recentSessions = [];
  List<PomodoroSession> get recentSessions => _recentSessions;

  int get completedFocusSessionsToday {
    final nowStr = DateTime.now().toIso8601String().substring(0, 10);
    return _recentSessions
        .where((s) =>
            s.sessionType == 'focus' &&
            s.status == 'completed' &&
            s.startedAt.startsWith(nowStr))
        .length;
  }

  PomodoroProvider() {
    _remainingSeconds = _focusDurationMinutes * 60;
    WidgetsBinding.instance.addObserver(this);
    _initRealtimeListener();
    loadSessions();
    _loadConfig().then((_) => _restoreActiveSessionState());
  }

  void _initRealtimeListener() {
    _pomodoroSub?.cancel();
    _pomodoroSub = RealtimeSyncService.instance.pomodoroEvents.listen((_) {
      loadSessions();
      _loadConfig();
    });
  }

  Future<void> _loadConfig() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _focusDurationMinutes = prefs.getInt('pomo_cfg_focus') ?? 25;
      _shortBreakMinutes = prefs.getInt('pomo_cfg_short_break') ?? 5;
      _longBreakMinutes = prefs.getInt('pomo_cfg_long_break') ?? 15;
      _longBreakInterval = prefs.getInt('pomo_cfg_long_interval') ?? 4;
      if (!_isRunning && !_isPaused) {
        _remainingSeconds = totalDurationSeconds;
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error loading pomodoro config: $e');
    }
  }

  Future<void> applyPreset(String preset) async {
    if (preset == '25 / 5') {
      await setDurations(focus: 25, shortBreak: 5, longBreak: 15, longBreakInterval: 4);
    } else if (preset == '50 / 10') {
      await setDurations(focus: 50, shortBreak: 10, longBreak: 20, longBreakInterval: 4);
    } else if (preset == '90 / 15') {
      await setDurations(focus: 90, shortBreak: 15, longBreak: 30, longBreakInterval: 3);
    }
  }

  Future<void> setDurations({
    required int focus,
    required int shortBreak,
    required int longBreak,
    int? longBreakInterval,
  }) async {
    _focusDurationMinutes = focus.clamp(1, 180);
    _shortBreakMinutes = shortBreak.clamp(1, 60);
    _longBreakMinutes = longBreak.clamp(1, 90);
    if (longBreakInterval != null) {
      _longBreakInterval = longBreakInterval.clamp(1, 10);
    }

    if (!_isRunning && !_isPaused) {
      _remainingSeconds = totalDurationSeconds;
    }

    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt('pomo_cfg_focus', _focusDurationMinutes);
      await prefs.setInt('pomo_cfg_short_break', _shortBreakMinutes);
      await prefs.setInt('pomo_cfg_long_break', _longBreakMinutes);
      await prefs.setInt('pomo_cfg_long_interval', _longBreakInterval);
    } catch (e) {
      debugPrint('Error saving pomodoro config: $e');
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _syncTimerFromTimestamp();
    }
  }

  int get totalDurationSeconds {
    switch (_currentMode) {
      case 'short_break':
        return _shortBreakMinutes * 60;
      case 'long_break':
        return _longBreakMinutes * 60;
      case 'focus':
      default:
        return _focusDurationMinutes * 60;
    }
  }

  double get progress {
    final total = totalDurationSeconds;
    if (total == 0) return 0.0;
    return ((total - _remainingSeconds) / total).clamp(0.0, 1.0);
  }

  String get remainingFormatted {
    final m = _remainingSeconds ~/ 60;
    final s = _remainingSeconds % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  String get modeTitle {
    switch (_currentMode) {
      case 'short_break':
        return 'Short Break';
      case 'long_break':
        return 'Long Break';
      case 'focus':
      default:
        return 'Focus Session';
    }
  }

  void setMode(String mode) {
    if (_isRunning) {
      _finishCurrentSession(status: 'interrupted');
    }
    _currentMode = mode;
    _remainingSeconds = totalDurationSeconds;
    _isRunning = false;
    _isPaused = false;
    _plannedEndTime = null;
    _ticker?.cancel();
    _notifications.cancelPomodoroNotifications();
    _clearActiveSessionPersistence();
    notifyListeners();
  }

  void startTimer() {
    if (_isRunning) return;

    _isRunning = true;
    _isPaused = false;
    _sessionStartTime = DateTime.now();
    _plannedEndTime = _sessionStartTime!.add(Duration(seconds: _remainingSeconds));
    _currentSessionId = _uuid.v4();

    _feedback.pomodoroStart();
    _persistActiveSessionState();
    _updateOngoingNotification();

    // Schedule completion notification with sound and vibration
    _notifications.schedulePomodoroCompletionNotification(
      title: '$modeTitle Complete! 🎉',
      body: 'Your $modeTitle has finished. Great job staying focused!',
      completionTime: _plannedEndTime!,
    );

    _startTicker();
    notifyListeners();
  }

  void pauseTimer() {
    if (!_isRunning || _isPaused) return;

    _ticker?.cancel();
    _isPaused = true;
    _syncTimerFromTimestamp();
    _plannedEndTime = null;

    _feedback.pomodoroPause();
    _persistActiveSessionState();
    _updateOngoingNotification();
    _notifications.cancelNotification(3002); // cancel completion alert while paused

    notifyListeners();
  }

  void resumeTimer() {
    if (!_isRunning || !_isPaused) return;

    _isPaused = false;
    final now = DateTime.now();
    _plannedEndTime = now.add(Duration(seconds: _remainingSeconds));

    _feedback.pomodoroStart();
    _persistActiveSessionState();
    _updateOngoingNotification();

    // Re-schedule completion notification
    _notifications.schedulePomodoroCompletionNotification(
      title: '$modeTitle Complete! 🎉',
      body: 'Your $modeTitle has finished. Great job staying focused!',
      completionTime: _plannedEndTime!,
    );

    _startTicker();
    notifyListeners();
  }

  void resetTimer() {
    if (_isRunning) {
      _finishCurrentSession(status: 'cancelled');
    }
    _ticker?.cancel();
    _isRunning = false;
    _isPaused = false;
    _plannedEndTime = null;
    _remainingSeconds = totalDurationSeconds;

    _notifications.cancelPomodoroNotifications();
    _clearActiveSessionPersistence();
    notifyListeners();
  }

  void _startTicker() {
    _ticker?.cancel();
    _ticker = Timer.periodic(const Duration(seconds: 1), (timer) {
      _syncTimerFromTimestamp();
    });
  }

  /// Timestamp-based synchronization to ensure background sleep / doze mode never breaks timer
  void _syncTimerFromTimestamp() {
    if (!_isRunning || _isPaused || _plannedEndTime == null) return;

    final now = DateTime.now();
    final diff = _plannedEndTime!.difference(now).inSeconds;

    if (diff <= 0) {
      _ticker?.cancel();
      _isRunning = false;
      _isPaused = false;
      _remainingSeconds = 0;
      _plannedEndTime = null;

      final completedTitle = '$modeTitle Complete! 🎉';
      final completedBody = 'Your $modeTitle has finished. Great job staying focused!';

      _feedback.pomodoroComplete();
      _notifications.cancelPomodoroNotifications(includeCompletion: false);
      _notifications.showPomodoroCompletedNotification(
        title: completedTitle,
        body: completedBody,
      );
      _clearActiveSessionPersistence();

      _finishCurrentSession(status: 'completed');
      _remainingSeconds = totalDurationSeconds;
      notifyListeners();
    } else {
      if (_remainingSeconds != diff) {
        _remainingSeconds = diff;
        notifyListeners();
      }
    }
  }

  void _updateOngoingNotification() {
    if (!_isRunning) {
      _notifications.cancelPomodoroNotifications(includeCompletion: false);
      return;
    }

    final endMillis = _plannedEndTime?.millisecondsSinceEpoch ??
        DateTime.now().add(Duration(seconds: _remainingSeconds)).millisecondsSinceEpoch;

    _notifications.showOngoingPomodoroNotification(
      title: 'StudySpace • $modeTitle',
      body: _isPaused ? 'Paused ($remainingFormatted remaining)' : '$remainingFormatted remaining',
      plannedEndTimeMillis: endMillis,
      isPaused: _isPaused,
    );
  }

  Future<void> _finishCurrentSession({required String status}) async {
    if (_sessionStartTime == null || _currentSessionId == null) return;

    final userId = SupabaseService.currentUserId ?? 'offline-user';
    final now = DateTime.now();
    final actualSec = (totalDurationSeconds - _remainingSeconds).clamp(0, totalDurationSeconds);

    final session = PomodoroSession(
      id: _currentSessionId!,
      userId: userId,
      sessionType: _currentMode,
      plannedSeconds: totalDurationSeconds,
      actualSeconds: actualSec,
      startedAt: _sessionStartTime!.toIso8601String(),
      completedAt: now.toIso8601String(),
      status: status,
      createdAt: now.toIso8601String(),
    );

    _recentSessions.insert(0, session);
    notifyListeners();

    try {
      final db = await _db.database;
      await db.insert('cached_pomodoro_sessions', session.toMap());
    } catch (e) {
      debugPrint('Error caching pomodoro session: $e');
    }

    await SyncEngine.instance.queueOperation(
      operationType: 'UPSERT_POMODORO',
      entityId: session.id,
      payload: session.toSupabaseMap(),
    );

    SyncEngine.instance.sync();

    _currentSessionId = null;
    _sessionStartTime = null;
  }

  // --- Persistence & State Restoration ---

  Future<void> _persistActiveSessionState() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('pomo_is_running', _isRunning);
      await prefs.setBool('pomo_is_paused', _isPaused);
      await prefs.setString('pomo_mode', _currentMode);
      await prefs.setInt('pomo_remaining', _remainingSeconds);
      if (_sessionStartTime != null) {
        await prefs.setString('pomo_start_time', _sessionStartTime!.toIso8601String());
      }
      if (_plannedEndTime != null) {
        await prefs.setString('pomo_planned_end', _plannedEndTime!.toIso8601String());
      }
      if (_currentSessionId != null) {
        await prefs.setString('pomo_session_id', _currentSessionId!);
      }
    } catch (e) {
      debugPrint('Error persisting pomodoro active state: $e');
    }
  }

  Future<void> _clearActiveSessionPersistence() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('pomo_is_running');
      await prefs.remove('pomo_is_paused');
      await prefs.remove('pomo_mode');
      await prefs.remove('pomo_remaining');
      await prefs.remove('pomo_start_time');
      await prefs.remove('pomo_planned_end');
      await prefs.remove('pomo_session_id');
    } catch (e) {
      debugPrint('Error clearing pomodoro active state: $e');
    }
  }

  Future<void> _restoreActiveSessionState() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final isRunning = prefs.getBool('pomo_is_running') ?? false;
      if (!isRunning) return;

      final isPaused = prefs.getBool('pomo_is_paused') ?? false;
      final mode = prefs.getString('pomo_mode') ?? 'focus';
      final startStr = prefs.getString('pomo_start_time');
      final endStr = prefs.getString('pomo_planned_end');
      final sessionId = prefs.getString('pomo_session_id');
      final remaining = prefs.getInt('pomo_remaining') ?? (25 * 60);

      _currentMode = mode;
      _currentSessionId = sessionId ?? _uuid.v4();
      if (startStr != null) _sessionStartTime = DateTime.tryParse(startStr);

      if (isPaused) {
        _isRunning = true;
        _isPaused = true;
        _remainingSeconds = remaining;
        notifyListeners();
      } else if (endStr != null) {
        final plannedEnd = DateTime.tryParse(endStr);
        if (plannedEnd != null) {
          final now = DateTime.now();
          if (now.isAfter(plannedEnd)) {
            // Finished while app was closed!
            _remainingSeconds = 0;
            _finishCurrentSession(status: 'completed');
            _clearActiveSessionPersistence();
          } else {
            // Restore active countdown
            _isRunning = true;
            _isPaused = false;
            _plannedEndTime = plannedEnd;
            _remainingSeconds = plannedEnd.difference(now).inSeconds;
            _startTicker();
            _updateOngoingNotification();
            notifyListeners();
          }
        }
      }
    } catch (e) {
      debugPrint('Error restoring pomodoro active state: $e');
    }
  }

  Future<void> loadSessions() async {
    try {
      final db = await _db.database;
      final rows = await db.query('cached_pomodoro_sessions', orderBy: 'started_at DESC', limit: 50);
      if (rows.isNotEmpty) {
        _recentSessions = rows.map((r) => PomodoroSession.fromMap(r)).toList();
        notifyListeners();
      }

      if (SupabaseService.isAuthenticated) {
        final userId = SupabaseService.currentUserId;
        if (userId != null) {
          final res = await SupabaseService.client
              .from('pomodoro_sessions')
              .select()
              .eq('user_id', userId)
              .order('started_at', ascending: false)
              .limit(50);

          final remoteSessions = (res as List).map((r) => PomodoroSession.fromMap(r)).toList();
          _recentSessions = remoteSessions;

          await _db.cacheData(
            'cached_pomodoro_sessions',
            remoteSessions.map((s) => s.toMap()).toList(),
          );
          notifyListeners();
        }
      }
    } catch (e) {
      debugPrint('Error loading pomodoro sessions: $e');
    }
  }

  @override
  void dispose() {
    _pomodoroSub?.cancel();
    WidgetsBinding.instance.removeObserver(this);
    _ticker?.cancel();
    super.dispose();
  }
}
