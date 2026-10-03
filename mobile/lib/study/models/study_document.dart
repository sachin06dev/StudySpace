class StudyDocument {
  final String id;
  final String userId;
  final String title;
  final String? description;
  final String fileName;
  final String storageKey;
  final String storageProvider;
  final String mimeType;
  final int fileSizeBytes;
  final String? category;
  final String createdAt;
  final String? updatedAt;

  StudyDocument({
    required this.id,
    required this.userId,
    required this.title,
    this.description,
    required this.fileName,
    required this.storageKey,
    required this.storageProvider,
    required this.mimeType,
    required this.fileSizeBytes,
    this.category,
    required this.createdAt,
    this.updatedAt,
  });

  factory StudyDocument.fromMap(Map<String, dynamic> map) {
    return StudyDocument(
      id: map['id'] as String,
      userId: (map['user_id'] ?? '') as String,
      title: (map['title'] ?? 'Untitled Document') as String,
      description: map['description'] as String?,
      fileName: (map['file_name'] ?? 'document') as String,
      storageKey: (map['storage_key'] ?? map['file_path'] ?? '') as String,
      storageProvider: (map['storage_provider'] ?? 'r2') as String,
      mimeType: (map['mime_type'] ?? 'application/octet-stream') as String,
      fileSizeBytes: (map['file_size_bytes'] as num?)?.toInt() ?? 0,
      category: map['category'] as String?,
      createdAt: (map['created_at'] ?? DateTime.now().toIso8601String()) as String,
      updatedAt: map['updated_at'] as String?,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'user_id': userId,
      'title': title,
      'description': description,
      'file_name': fileName,
      'storage_key': storageKey,
      'storage_provider': storageProvider,
      'mime_type': mimeType,
      'file_size_bytes': fileSizeBytes,
      'category': category,
      'created_at': createdAt,
      'updated_at': updatedAt,
    };
  }

  String get filename => fileName;

  String get fileExtension {
    final dotIndex = fileName.lastIndexOf('.');
    if (dotIndex == -1) return '';
    return fileName.substring(dotIndex).toLowerCase();
  }

  String get formattedSize {
    if (fileSizeBytes <= 0) return '0 B';
    if (fileSizeBytes < 1024) return '$fileSizeBytes B';
    if (fileSizeBytes < 1024 * 1024) {
      return '${(fileSizeBytes / 1024).toStringAsFixed(1)} KB';
    }
    return '${(fileSizeBytes / (1024 * 1024)).toStringAsFixed(1)} MB';
  }

  String get fileTypeBadge {
    final ext = fileExtension;
    switch (ext) {
      case '.pdf':
        return 'PDF';
      case '.doc':
      case '.docx':
        return 'DOC';
      case '.ppt':
      case '.pptx':
        return 'PPT';
      case '.xls':
      case '.xlsx':
      case '.csv':
        return 'SHEET';
      case '.txt':
      case '.md':
        return 'TXT';
      default:
        return 'FILE';
    }
  }
}
