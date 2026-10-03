class PomodoroSession {
  final String id;
  final String userId;
  final String sessionType; // 'focus' | 'short_break' | 'long_break'
  final int plannedSeconds;
  final int actualSeconds;
  final String startedAt;
  final String? completedAt;
  final String status; // 'completed' | 'cancelled' | 'interrupted'
  final String? createdAt;

  PomodoroSession({
    required this.id,
    required this.userId,
    required this.sessionType,
    required this.plannedSeconds,
    this.actualSeconds = 0,
    required this.startedAt,
    this.completedAt,
    this.status = 'completed',
    this.createdAt,
  });

  factory PomodoroSession.fromMap(Map<String, dynamic> map) {
    return PomodoroSession(
      id: map['id'] as String,
      userId: (map['user_id'] ?? '') as String,
      sessionType: (map['session_type'] ?? 'focus') as String,
      plannedSeconds: (map['planned_seconds'] as num?)?.toInt() ?? 1500,
      actualSeconds: (map['actual_seconds'] as num?)?.toInt() ?? 0,
      startedAt: (map['started_at'] ?? '') as String,
      completedAt: map['completed_at'] as String?,
      status: (map['status'] ?? 'completed') as String,
      createdAt: map['created_at'] as String?,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'user_id': userId,
      'session_type': sessionType,
      'planned_seconds': plannedSeconds,
      'actual_seconds': actualSeconds,
      'started_at': startedAt,
      'completed_at': completedAt,
      'status': status,
      'created_at': createdAt,
    };
  }

  Map<String, dynamic> toSupabaseMap() {
    return {
      'id': id,
      'user_id': userId,
      'session_type': sessionType,
      'planned_seconds': plannedSeconds,
      'actual_seconds': actualSeconds,
      'started_at': startedAt,
      'completed_at': completedAt,
      'status': status,
    };
  }
}
