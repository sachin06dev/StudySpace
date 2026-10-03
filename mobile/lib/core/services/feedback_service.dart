import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';

class FeedbackService extends ChangeNotifier {
  static final FeedbackService instance = FeedbackService._internal();

  AudioPlayer? _audioPlayer;
  bool _hapticsEnabled = true;
  bool _soundEnabled = true;
  bool _isInitialized = false;

  bool get hapticsEnabled => _hapticsEnabled;
  bool get soundEnabled => _soundEnabled;

  FeedbackService._internal() {
    init();
  }

  Future<void> init() async {
    if (_isInitialized) return;
    try {
      final prefs = await SharedPreferences.getInstance();
      _hapticsEnabled = prefs.getBool('pref_haptics_enabled') ?? true;
      _soundEnabled = prefs.getBool('pref_sound_enabled') ?? true;
      _isInitialized = true;
      notifyListeners();
    } catch (e) {
      debugPrint('FeedbackService init error: $e');
    }
  }

  Future<void> setHapticsEnabled(bool enabled) async {
    _hapticsEnabled = enabled;
    notifyListeners();
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('pref_haptics_enabled', enabled);
    } catch (e) {
      debugPrint('Error saving haptics preference: $e');
    }
    if (enabled) {
      light();
    }
  }

  Future<void> setSoundEnabled(bool enabled) async {
    _soundEnabled = enabled;
    notifyListeners();
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('pref_sound_enabled', enabled);
    } catch (e) {
      debugPrint('Error saving sound preference: $e');
    }
    if (enabled) {
      playAlertSound();
    }
  }

  // --- Semantic Haptics ---

  void light() {
    if (!_hapticsEnabled) return;
    try {
      HapticFeedback.lightImpact();
    } catch (_) {}
  }

  void medium() {
    if (!_hapticsEnabled) return;
    try {
      HapticFeedback.mediumImpact();
    } catch (_) {}
  }

  void heavy() {
    if (!_hapticsEnabled) return;
    try {
      HapticFeedback.heavyImpact();
    } catch (_) {}
  }

  void selection() {
    if (!_hapticsEnabled) return;
    try {
      HapticFeedback.selectionClick();
    } catch (_) {}
  }

  void vibrate() {
    if (!_hapticsEnabled) return;
    try {
      HapticFeedback.vibrate();
    } catch (_) {}
  }

  // --- High Level Action Feedback ---

  void attendanceSuccess() {
    light();
  }

  void attendanceAbsent() {
    medium();
  }

  void classCancelled() {
    selection();
  }

  void taskToggle({required bool completed}) {
    if (completed) {
      medium();
    } else {
      selection();
    }
  }

  void pomodoroStart() {
    light();
  }

  void pomodoroPause() {
    selection();
  }

  void pomodoroComplete() {
    heavy();
    vibrate();
    playPomodoroChime();
  }

  void timetableSaved() {
    light();
  }

  void scanSuccess() {
    medium();
  }

  // --- Sound Feedback ---

  Future<void> playPomodoroChime() async {
    if (!_soundEnabled) return;
    try {
      _audioPlayer ??= AudioPlayer();
      await _audioPlayer!.stop();
      await _audioPlayer!.play(AssetSource('sounds/pomodoro_chime.mp3'), volume: 1.0);
    } catch (e) {
      debugPrint('AudioPlayer chime error: $e');
      playAlertSound();
    }
  }

  void playAlertSound() {
    if (!_soundEnabled) return;
    try {
      SystemSound.play(SystemSoundType.alert);
    } catch (e) {
      debugPrint('System sound play error: $e');
    }
  }
}
