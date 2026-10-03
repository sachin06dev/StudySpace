class AttendanceRecord {
  final String id;
  final String userId;
  final String semesterId;
  final String subjectId;
  final String? timetableSlotId;
  final String classDate; // YYYY-MM-DD
  final String startTime; // HH:mm:ss or HH:mm
  final String endTime;   // HH:mm:ss or HH:mm
  final String status;    // 'present', 'absent', 'cancelled'
  final String? notes;
  final String? createdAt;
  final String? updatedAt;

  AttendanceRecord({
    required this.id,
    required this.userId,
    required this.semesterId,
    required this.subjectId,
    this.timetableSlotId,
    required this.classDate,
    required this.startTime,
    required this.endTime,
    required this.status,
    this.notes,
    this.createdAt,
    this.updatedAt,
  });

  factory AttendanceRecord.fromMap(Map<String, dynamic> map) {
    return AttendanceRecord(
      id: map['id'] as String,
      userId: (map['user_id'] ?? '') as String,
      semesterId: map['semester_id'] as String,
      subjectId: map['subject_id'] as String,
      timetableSlotId: map['timetable_slot_id'] as String?,
      classDate: map['class_date'] as String,
      startTime: map['start_time'] as String,
      endTime: map['end_time'] as String,
      status: map['status'] as String,
      notes: map['notes'] as String?,
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
      'timetable_slot_id': timetableSlotId,
      'class_date': classDate,
      'start_time': startTime,
      'end_time': endTime,
      'status': status,
      'notes': notes,
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
      'timetable_slot_id': timetableSlotId,
      'class_date': classDate,
      'start_time': startTime,
      'end_time': endTime,
      'status': status,
      'notes': notes,
    };
  }
}
