class SavedPlaylist {
  final String id;
  final String userId;
  final String playlistId;
  final String catalogPlaylistId;
  final String title;
  final String? description;
  final String? thumbnailUrl;
  final String? channelName;
  final int videoCount;
  final String savedAt;

  const SavedPlaylist({
    required this.id,
    required this.userId,
    required this.playlistId,
    this.catalogPlaylistId = '',
    required this.title,
    this.description,
    this.thumbnailUrl,
    this.channelName,
    this.videoCount = 0,
    required this.savedAt,
  });

  /// Returns the clean YouTube playlist ID if valid, or empty string if it's a UUID/malformed.
  String get effectivePlaylistId {
    final trimmed = playlistId.trim();
    final uuidRegex = RegExp(r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$');
    if (uuidRegex.hasMatch(trimmed) || trimmed.length < 5) {
      return '';
    }
    return trimmed;
  }

  factory SavedPlaylist.fromMap(Map<String, dynamic> map) {
    final playlistObj = map['playlist'] as Map<String, dynamic>?;
    final ytCode = (playlistObj?['youtube_playlist_id'] ?? map['youtube_playlist_id'] ?? '') as String;
    
    // Catalog UUID points to youtube_playlists.id
    String catalogId = (map['catalog_playlist_id'] ?? '') as String;
    if (catalogId.isEmpty) {
      if (playlistObj != null && playlistObj['id'] != null) {
        catalogId = playlistObj['id'] as String;
      } else if (map['playlist_id'] != null) {
        final pIdStr = map['playlist_id'].toString();
        if (RegExp(r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$').hasMatch(pIdStr)) {
          catalogId = pIdStr;
        }
      }
    }

    // playlistId is the YouTube PL... code
    String pId = ytCode;
    if (pId.isEmpty) {
      if (map['playlist_id'] != null) {
        final pIdStr = map['playlist_id'].toString();
        if (!RegExp(r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$').hasMatch(pIdStr)) {
          pId = pIdStr;
        }
      }
    }

    return SavedPlaylist(
      id: map['id'] as String,
      userId: (map['user_id'] ?? '') as String,
      playlistId: pId,
      catalogPlaylistId: catalogId,
      title: (map['title'] ?? playlistObj?['title'] ?? 'YouTube Playlist') as String,
      description: (map['description'] ?? playlistObj?['description']) as String?,
      thumbnailUrl: (map['thumbnail_url'] ?? playlistObj?['thumbnail_url']) as String?,
      channelName: (map['channel_name'] ?? playlistObj?['channel_name']) as String?,
      videoCount: (map['video_count'] as num?)?.toInt() ?? (playlistObj?['video_count'] as num?)?.toInt() ?? 0,
      savedAt: (map['saved_at'] ?? map['created_at'] ?? DateTime.now().toIso8601String()) as String,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'user_id': userId,
      'playlist_id': playlistId,
      'catalog_playlist_id': catalogPlaylistId,
      'title': title,
      'description': description,
      'thumbnail_url': thumbnailUrl,
      'channel_name': channelName,
      'video_count': videoCount,
      'saved_at': savedAt,
    };
  }

  Map<String, dynamic> toSupabaseMap() {
    return {
      'id': id,
      'user_id': userId,
      'playlist_id': catalogPlaylistId.isNotEmpty ? catalogPlaylistId : playlistId,
      'saved_at': savedAt,
    };
  }
}
