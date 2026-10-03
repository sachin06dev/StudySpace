class TimetableException {
  final String id;
  final String userId;
  final String semesterId;
  final String? timetableSlotId;
  final String exceptionDate; // YYYY-MM-DD
  final String exceptionType; // 'cancelled', 'extra', 'rescheduled'
  final String? startTime;
  final String? endTime;
  final String? replacementDate;
  final String? replacementStartTime;
  final String? replacementEndTime;
  final String? subjectId;
  final String? room;
  final String? faculty;
  final String? notes;
  final String? createdAt;
  final String? updatedAt;

  TimetableException({
    required this.id,
    required this.userId,
    required this.semesterId,
    this.timetableSlotId,
    required this.exceptionDate,
    required this.exceptionType,
    this.startTime,
    this.endTime,
    this.replacementDate,
    this.replacementStartTime,
    this.replacementEndTime,
    this.subjectId,
    this.room,
    this.faculty,
    this.notes,
    this.createdAt,
    this.updatedAt,
  });

  factory TimetableException.fromMap(Map<String, dynamic> map) {
    return TimetableException(
      id: map['id'] as String,
      userId: (map['user_id'] ?? '') as String,
      semesterId: map['semester_id'] as String,
      timetableSlotId: map['timetable_slot_id'] as String?,
      exceptionDate: map['exception_date'] as String,
      exceptionType: map['exception_type'] as String,
      startTime: map['start_time'] as String?,
      endTime: map['end_time'] as String?,
      replacementDate: map['replacement_date'] as String?,
      replacementStartTime: map['replacement_start_time'] as String?,
      replacementEndTime: map['replacement_end_time'] as String?,
      subjectId: map['subject_id'] as String?,
      room: map['room'] as String?,
      faculty: map['faculty'] as String?,
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
      'timetable_slot_id': timetableSlotId,
      'exception_date': exceptionDate,
      'exception_type': exceptionType,
      'start_time': startTime,
      'end_time': endTime,
      'replacement_date': replacementDate,
      'replacement_start_time': replacementStartTime,
      'replacement_end_time': replacementEndTime,
      'subject_id': subjectId,
      'room': room,
      'faculty': faculty,
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
      'timetable_slot_id': timetableSlotId,
      'exception_date': exceptionDate,
      'exception_type': exceptionType,
      'start_time': startTime,
      'end_time': endTime,
      'replacement_date': replacementDate,
      'replacement_start_time': replacementStartTime,
      'replacement_end_time': replacementEndTime,
      'subject_id': subjectId,
      'room': room,
      'faculty': faculty,
      'notes': notes,
    };
  }
}
