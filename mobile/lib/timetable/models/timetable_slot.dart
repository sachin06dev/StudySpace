class TimetableSlot {
  final String id;
  final String userId;
  final String semesterId;
  final String subjectId;
  final int dayOfWeek; // 0 = Mon ... 6 = Sun
  final String startTime; // HH:mm:ss or HH:mm
  final String endTime;   // HH:mm:ss or HH:mm
  final String? roomOverride;
  final String? facultyOverride;
  final String? classTypeOverride;
  final String? createdAt;
  final String? updatedAt;

  TimetableSlot({
    required this.id,
    required this.userId,
    required this.semesterId,
    required this.subjectId,
    required this.dayOfWeek,
    required this.startTime,
    required this.endTime,
    this.roomOverride,
    this.facultyOverride,
    this.classTypeOverride,
    this.createdAt,
    this.updatedAt,
  });

  TimetableSlot copyWith({
    String? id,
    String? userId,
    String? semesterId,
    String? subjectId,
    int? dayOfWeek,
    String? startTime,
    String? endTime,
    String? roomOverride,
    String? facultyOverride,
    String? classTypeOverride,
    String? createdAt,
    String? updatedAt,
  }) {
    return TimetableSlot(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      semesterId: semesterId ?? this.semesterId,
      subjectId: subjectId ?? this.subjectId,
      dayOfWeek: dayOfWeek ?? this.dayOfWeek,
      startTime: startTime ?? this.startTime,
      endTime: endTime ?? this.endTime,
      roomOverride: roomOverride ?? this.roomOverride,
      facultyOverride: facultyOverride ?? this.facultyOverride,
      classTypeOverride: classTypeOverride ?? this.classTypeOverride,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  factory TimetableSlot.fromMap(Map<String, dynamic> map) {
    return TimetableSlot(
      id: map['id'] as String,
      userId: (map['user_id'] ?? '') as String,
      semesterId: map['semester_id'] as String,
      subjectId: map['subject_id'] as String,
      dayOfWeek: map['day_of_week'] as int,
      startTime: map['start_time'] as String,
      endTime: map['end_time'] as String,
      roomOverride: map['room_override'] as String?,
      facultyOverride: map['faculty_override'] as String?,
      classTypeOverride: map['class_type_override'] as String?,
      createdAt: map['created_at'] as String?,
      updatedAt: map['updated_at'] as String?,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'user_id': userId,
      'semester_id': semesterId,
      'subject_id': subjectId,
      'day_of_week': dayOfWeek,
      'start_time': startTime,
      'end_time': endTime,
      'room_override': roomOverride,
      'faculty_override': facultyOverride,
      'class_type_override': classTypeOverride,
      'created_at': createdAt,
      'updated_at': updatedAt,
    };
  }

  Map<String, dynamic> toSupabaseMap() {
    return {
      'id': id,
      'user_id': userId,
      'semester_id': semesterId,
      'subject_id': subjectId,
      'day_of_week': dayOfWeek,
      'start_time': startTime,
      'end_time': endTime,
      'room_override': roomOverride,
      'faculty_override': facultyOverride,
      'class_type_override': classTypeOverride,
    };
  }
}
