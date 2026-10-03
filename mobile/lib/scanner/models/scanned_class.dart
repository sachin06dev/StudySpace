class ScannedClassItem {
  String id;
  int dayOfWeek; // 0 = Monday ... 6 = Sunday
  String startTime; // HH:mm
  String endTime;   // HH:mm
  String subjectName;
  String? subjectCode;
  String? faculty;
  String? room;
  String classType; // 'theory', 'lab', 'tutorial', 'other'

  ScannedClassItem({
    required this.id,
    required this.dayOfWeek,
    required this.startTime,
    required this.endTime,
    required this.subjectName,
    this.subjectCode,
    this.faculty,
    this.room,
    this.classType = 'theory',
  });

  factory ScannedClassItem.fromMap(Map<String, dynamic> map, String fallbackId) {
    return ScannedClassItem(
      id: (map['id'] ?? fallbackId) as String,
      dayOfWeek: (map['dayOfWeek'] ?? map['day_of_week'] ?? map['day'] ?? 0) as int,
      startTime: (map['startTime'] ?? map['start_time'] ?? '09:00') as String,
      endTime: (map['endTime'] ?? map['end_time'] ?? '10:00') as String,
      subjectName: (map['subjectName'] ?? map['subject_name'] ?? map['subject'] ?? 'Class') as String,
      subjectCode: map['subjectCode'] ?? map['subject_code'],
      faculty: (map['faculty'] ?? map['teacher']) as String?,
      room: map['room'] as String?,
      classType: (map['classType'] ?? map['class_type'] ?? map['type'] ?? 'theory') as String,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'dayOfWeek': dayOfWeek,
      'startTime': startTime,
      'endTime': endTime,
      'subjectName': subjectName,
      'subjectCode': subjectCode,
      'faculty': faculty,
      'room': room,
      'classType': classType,
    };
  }
}
