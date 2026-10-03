class Semester {
  final String id;
  final String userId;
  final String name;
  final String startDate; // YYYY-MM-DD
  final String endDate;   // YYYY-MM-DD
  final bool isActive;
  final String? createdAt;
  final String? updatedAt;

  Semester({
    required this.id,
    required this.userId,
    required this.name,
    required this.startDate,
    required this.endDate,
    required this.isActive,
    this.createdAt,
    this.updatedAt,
  });

  factory Semester.fromMap(Map<String, dynamic> map) {
    return Semester(
      id: map['id'] as String,
      userId: (map['user_id'] ?? '') as String,
      name: map['name'] as String,
      startDate: map['start_date'] as String,
      endDate: map['end_date'] as String,
      isActive: map['is_active'] is bool
          ? map['is_active'] as bool
          : (map['is_active'] == 1 || map['is_active'] == 'true'),
      createdAt: map['created_at'] as String?,
      updatedAt: map['updated_at'] as String?,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'user_id': userId,
      'name': name,
      'start_date': startDate,
      'end_date': endDate,
      'is_active': isActive ? 1 : 0,
      'created_at': createdAt,
      'updated_at': updatedAt,
    };
  }

  Map<String, dynamic> toSupabaseMap() {
    return {
      'id': id,
      'user_id': userId,
      'name': name,
      'start_date': startDate,
      'end_date': endDate,
      'is_active': isActive,
    };
  }
}
