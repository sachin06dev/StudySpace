class SavedVideo {
  final String id;
  final String userId;
  final String videoId;
  final String? youtubeVideoId;
  final String title;
  final String? channelName;
  final String? thumbnailUrl;
  final int durationSeconds;
  final int watchProgressSeconds;
  final String status; // 'saved' | 'in_progress' | 'completed'
  final String? lastWatchedAt;

  SavedVideo({
    required this.id,
    required this.userId,
    required this.videoId,
    this.youtubeVideoId,
    required this.title,
    this.channelName,
    this.thumbnailUrl,
    this.durationSeconds = 0,
    this.watchProgressSeconds = 0,
    this.status = 'saved',
    this.lastWatchedAt,
  });

  /// Returns the actual 11-character YouTube video ID when available, falling back to videoId.
  String get effectiveVideoId {
    if (youtubeVideoId != null && youtubeVideoId!.trim().isNotEmpty) {
      return youtubeVideoId!.trim();
    }
    return videoId.trim();
  }

  factory SavedVideo.fromMap(Map<String, dynamic> map) {
    // Check if video details are joined under 'video' key
    final videoObj = map['video'] as Map<String, dynamic>?;

    final ytId = (map['youtube_video_id'] ?? videoObj?['youtube_video_id']) as String?;

    return SavedVideo(
      id: map['id'] as String,
      userId: (map['user_id'] ?? '') as String,
      videoId: (map['video_id'] ?? '') as String,
      youtubeVideoId: ytId,
      title: (map['title'] ?? videoObj?['title'] ?? 'Untitled Video') as String,
      channelName: (map['channel_name'] ?? videoObj?['channel_name']) as String?,
      thumbnailUrl: (map['thumbnail_url'] ?? videoObj?['thumbnail_url']) as String?,
      durationSeconds: (map['duration_seconds'] ?? videoObj?['duration_seconds'] as num?)?.toInt() ?? 0,
      watchProgressSeconds: (map['watch_progress_seconds'] as num?)?.toInt() ?? 0,
      status: (map['status'] ?? 'saved') as String,
      lastWatchedAt: map['last_watched_at'] as String?,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'user_id': userId,
      'video_id': videoId,
      'youtube_video_id': youtubeVideoId ?? (effectiveVideoId != videoId ? effectiveVideoId : null),
      'title': title,
      'channel_name': channelName,
      'thumbnail_url': thumbnailUrl,
      'duration_seconds': durationSeconds,
      'watch_progress_seconds': watchProgressSeconds,
      'status': status,
      'last_watched_at': lastWatchedAt,
    };
  }

  SavedVideo copyWith({
    String? id,
    String? userId,
    String? videoId,
    String? youtubeVideoId,
    String? title,
    String? channelName,
    String? thumbnailUrl,
    int? durationSeconds,
    int? watchProgressSeconds,
    String? status,
    String? lastWatchedAt,
  }) {
    return SavedVideo(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      videoId: videoId ?? this.videoId,
      youtubeVideoId: youtubeVideoId ?? this.youtubeVideoId,
      title: title ?? this.title,
      channelName: channelName ?? this.channelName,
      thumbnailUrl: thumbnailUrl ?? this.thumbnailUrl,
      durationSeconds: durationSeconds ?? this.durationSeconds,
      watchProgressSeconds: watchProgressSeconds ?? this.watchProgressSeconds,
      status: status ?? this.status,
      lastWatchedAt: lastWatchedAt ?? this.lastWatchedAt,
    );
  }
}
