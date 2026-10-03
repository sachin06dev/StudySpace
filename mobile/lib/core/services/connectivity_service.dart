import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';

class ConnectivityService {
  static final ConnectivityService instance = ConnectivityService._internal();
  final Connectivity _connectivity = Connectivity();
  final StreamController<bool> _controller = StreamController<bool>.broadcast();

  bool _isOnline = true;
  bool get isOnline => _isOnline;
  Stream<bool> get onlineStream => _controller.stream;

  ConnectivityService._internal() {
    _connectivity.onConnectivityChanged.listen((results) {
      _updateStatus(results);
    });
    checkConnectivity();
  }

  void _updateStatus(List<ConnectivityResult> results) {
    final connected = results.any((r) => r != ConnectivityResult.none);
    if (_isOnline != connected) {
      _isOnline = connected;
      _controller.add(_isOnline);
    }
  }

  Future<bool> checkConnectivity() async {
    final results = await _connectivity.checkConnectivity();
    _isOnline = results.any((r) => r != ConnectivityResult.none);
    _controller.add(_isOnline);
    return _isOnline;
  }

  void dispose() {
    _controller.close();
  }
}
