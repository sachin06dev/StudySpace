class Task {
  final String id;
  final String userId;
  final String title;
  final String? description;
  final String status; // 'pending' | 'completed'
  final String priority; // 'low' | 'medium' | 'high'
  final String? dueDate;
  final String? completedAt;
  final String? createdAt;
  final String? updatedAt;

  Task({
    required this.id,
    required this.userId,
    required this.title,
    this.description,
    this.status = 'pending',
    this.priority = 'medium',
    this.dueDate,
    this.completedAt,
    this.createdAt,
    this.updatedAt,
  });

  Task copyWith({
    String? id,
    String? userId,
    String? title,
    String? description,
    String? status,
    String? priority,
    String? dueDate,
    String? completedAt,
    String? createdAt,
    String? updatedAt,
  }) {
    return Task(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      title: title ?? this.title,
      description: description ?? this.description,
      status: status ?? this.status,
      priority: priority ?? this.priority,
      dueDate: dueDate ?? this.dueDate,
      completedAt: completedAt ?? this.completedAt,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  bool get isCompleted => status == 'completed';

  factory Task.fromMap(Map<String, dynamic> map) {
    return Task(
      id: map['id'] as String,
      userId: (map['user_id'] ?? '') as String,
      title: map['title'] as String,
      description: map['description'] as String?,
      status: (map['status'] ?? 'pending') as String,
      priority: (map['priority'] ?? 'medium') as String,
      dueDate: map['due_date'] as String?,
      completedAt: map['completed_at'] as String?,
      createdAt: map['created_at'] as String?,
      updatedAt: map['updated_at'] as String?,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'user_id': userId,
      'title': title,
      'description': description,
      'status': status,
      'priority': priority,
      'due_date': dueDate,
      'completed_at': completedAt,
      'created_at': createdAt,
      'updated_at': updatedAt,
    };
  }

  Map<String, dynamic> toSupabaseMap() {
    return {
      'id': id,
      'user_id': userId,
      'title': title,
      'description': description,
      'status': status,
      'priority': priority,
      'due_date': dueDate,
      'completed_at': completedAt,
    };
  }
}
