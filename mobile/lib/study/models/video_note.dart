class VideoNote {
  final String id;
  final String userId;
  final String videoId;
  final int timestampSeconds;
  final String content;
  final String? createdAt;
  final String? videoTitle;

  VideoNote({
    required this.id,
    required this.userId,
    required this.videoId,
    required this.timestampSeconds,
    required this.content,
    this.createdAt,
    this.videoTitle,
  });

  String get formattedTimestamp {
    final hours = timestampSeconds ~/ 3600;
    final minutes = (timestampSeconds % 3600) ~/ 60;
    final seconds = timestampSeconds % 60;
    final padMin = minutes.toString().padLeft(2, '0');
    final padSec = seconds.toString().padLeft(2, '0');
    if (hours > 0) {
      return '$hours:$padMin:$padSec';
    }
    return '$padMin:$padSec';
  }

  factory VideoNote.fromMap(Map<String, dynamic> map) {
    final videoObj = map['video'] as Map<String, dynamic>?;

    return VideoNote(
      id: map['id'] as String,
      userId: (map['user_id'] ?? '') as String,
      videoId: (map['video_id'] ?? '') as String,
      timestampSeconds: (map['timestamp_seconds'] as num?)?.toInt() ?? 0,
      content: (map['content'] ?? '') as String,
      createdAt: map['created_at'] as String?,
      videoTitle: videoObj?['title'] as String?,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'user_id': userId,
      'video_id': videoId,
      'timestamp_seconds': timestampSeconds,
      'content': content,
      'created_at': createdAt,
    };
  }

  Map<String, dynamic> toSupabaseMap() {
    return {
      'id': id,
      'user_id': userId,
      'video_id': videoId,
      'timestamp_seconds': timestampSeconds,
      'content': content,
    };
  }
}
