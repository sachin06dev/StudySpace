class Subject {
  final String id;
  final String userId;
  final String semesterId;
  final String name;
  final String? code;
  final String? faculty;
  final String? defaultRoom;
  final String classType; // 'theory', 'lab', 'tutorial', 'other'
  final double? credits;
  final double? targetPercentage;
  final int baselineAttended;
  final int baselineTotal;
  final bool isArchived;
  final String? createdAt;
  final String? updatedAt;

  Subject({
    required this.id,
    required this.userId,
    required this.semesterId,
    required this.name,
    this.code,
    this.faculty,
    this.defaultRoom,
    this.classType = 'theory',
    this.credits,
    this.targetPercentage,
    this.baselineAttended = 0,
    this.baselineTotal = 0,
    this.isArchived = false,
    this.createdAt,
    this.updatedAt,
  });

  factory Subject.empty() {
    return Subject(
      id: '',
      userId: '',
      semesterId: '',
      name: '',
    );
  }

  factory Subject.fromMap(Map<String, dynamic> map) {
    return Subject(
      id: map['id'] as String,
      userId: (map['user_id'] ?? '') as String,
      semesterId: map['semester_id'] as String,
      name: map['name'] as String,
      code: map['code'] as String?,
      faculty: map['faculty'] as String?,
      defaultRoom: map['default_room'] as String?,
      classType: (map['class_type'] ?? 'theory') as String,
      credits: map['credits'] != null ? (map['credits'] as num).toDouble() : null,
      targetPercentage: map['target_percentage'] != null
          ? (map['target_percentage'] as num).toDouble()
          : null,
      baselineAttended: (map['baseline_attended'] ?? 0) as int,
      baselineTotal: (map['baseline_total'] ?? 0) as int,
      isArchived: map['is_archived'] is bool
          ? map['is_archived'] as bool
          : (map['is_archived'] == 1),
      createdAt: map['created_at'] as String?,
      updatedAt: map['updated_at'] as String?,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'user_id': userId,
      'semester_id': semesterId,
      'name': name,
      'code': code,
      'faculty': faculty,
      'default_room': defaultRoom,
      'class_type': classType,
      'credits': credits,
      'target_percentage': targetPercentage,
      'baseline_attended': baselineAttended,
      'baseline_total': baselineTotal,
      'is_archived': isArchived ? 1 : 0,
      'created_at': createdAt,
      'updated_at': updatedAt,
    };
  }

  Map<String, dynamic> toSupabaseMap() {
    return {
      'id': id,
      'user_id': userId,
      'semester_id': semesterId,
      'name': name,
      'code': code,
      'faculty': faculty,
      'default_room': defaultRoom,
      'class_type': classType,
      'credits': credits,
      'target_percentage': targetPercentage,
      'baseline_attended': baselineAttended,
      'baseline_total': baselineTotal,
      'is_archived': isArchived,
    };
  }
}
