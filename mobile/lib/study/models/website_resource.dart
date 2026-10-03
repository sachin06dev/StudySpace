class WebsiteResource {
  final String id;
  final String userId;
  final String title;
  final String url;
  final String? description;
  final String? category; // 'documentation', 'course', 'reference', 'practice', 'college', 'other'
  final String? faviconUrl;
  final String createdAt;
  final String? updatedAt;

  const WebsiteResource({
    required this.id,
    required this.userId,
    required this.title,
    required this.url,
    this.description,
    this.category,
    this.faviconUrl,
    required this.createdAt,
    this.updatedAt,
  });

  /// Extracts the domain / hostname for clean card presentation.
  String get domain {
    try {
      final uri = Uri.parse(url);
      return uri.host.replaceFirst(RegExp(r'^www\.'), '');
    } catch (_) {
      return url;
    }
  }

  /// Extracts category or falls back to 'reference'.
  String get displayCategory {
    final cat = category?.trim().toLowerCase();
    if (cat == null || cat.isEmpty) return 'other';
    return cat;
  }

  /// Returns the stored faviconUrl or auto-generates a Google S2 favicon service URL.
  String get effectiveFaviconUrl {
    if (faviconUrl != null && faviconUrl!.isNotEmpty) return faviconUrl!;
    final d = domain;
    if (d.isNotEmpty && d.contains('.')) {
      return 'https://www.google.com/s2/favicons?domain=$d&sz=64';
    }
    return '';
  }

  factory WebsiteResource.fromMap(Map<String, dynamic> map) {
    return WebsiteResource(
      id: map['id'] as String,
      userId: (map['user_id'] ?? '') as String,
      title: (map['title'] ?? 'Untitled Resource') as String,
      url: (map['url'] ?? '') as String,
      description: map['description'] as String?,
      category: map['category'] as String?,
      faviconUrl: map['favicon_url'] as String?,
      createdAt: (map['created_at'] ?? DateTime.now().toIso8601String()) as String,
      updatedAt: map['updated_at'] as String?,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'user_id': userId,
      'title': title,
      'url': url,
      'description': description,
      'category': category,
      'favicon_url': faviconUrl,
      'created_at': createdAt,
      'updated_at': updatedAt,
    };
  }

  Map<String, dynamic> toSupabaseMap() {
    return {
      'id': id,
      'user_id': userId,
      'title': title,
      'url': url,
      'description': description,
      'category': category,
      'favicon_url': faviconUrl,
      'created_at': createdAt,
      'updated_at': updatedAt ?? DateTime.now().toIso8601String(),
    };
  }
}
