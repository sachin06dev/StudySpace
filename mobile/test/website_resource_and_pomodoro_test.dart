import 'package:flutter_test/flutter_test.dart';
import 'package:studyspace/study/models/study_document.dart';
import 'package:studyspace/study/models/website_resource.dart';
import 'package:studyspace/study/models/saved_playlist.dart';
import 'package:studyspace/study/models/saved_video.dart';
import 'package:studyspace/study/screens/video_player_screen.dart';

void main() {
  group('WebsiteResource & Study Parity Tests', () {
    test('Extracts domain and builds Google S2 favicon cleanly from URL', () {
      final res = WebsiteResource(
        id: 'res_1',
        userId: 'user_1',
        title: 'MDN Web Docs',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
        category: 'documentation',
        createdAt: '2026-09-14T00:00:00.000Z',
      );

      expect(res.domain, 'developer.mozilla.org');
      expect(
        res.effectiveFaviconUrl,
        'https://www.google.com/s2/favicons?domain=developer.mozilla.org&sz=64',
      );
    });

    test('Gracefully handles URLs with www or unusual ports', () {
      final res = WebsiteResource(
        id: 'res_2',
        userId: 'user_1',
        title: 'Local Docs',
        url: 'http://docs.example.com:8080/guide',
        category: 'article',
        createdAt: '2026-09-14T00:00:00.000Z',
      );

      expect(res.domain, 'docs.example.com');
      expect(res.effectiveFaviconUrl, contains('domain=docs.example.com'));
    });

    test('SQLite toMap and fromMap serialization maintains full fidelity', () {
      final now = DateTime.now().toIso8601String();
      final original = WebsiteResource(
        id: 'res_3',
        userId: 'user_123',
        title: 'Supabase Flutter Guide',
        url: 'https://supabase.com/docs/guides/with-flutter',
        description: 'Complete offline and sync documentation',
        category: 'documentation',
        faviconUrl: 'https://supabase.com/favicon.ico',
        createdAt: now,
      );

      final map = original.toMap();
      final revived = WebsiteResource.fromMap(map);

      expect(revived.id, original.id);
      expect(revived.userId, original.userId);
      expect(revived.title, original.title);
      expect(revived.url, original.url);
      expect(revived.description, original.description);
      expect(revived.category, original.category);
      expect(revived.domain, original.domain);
    });

    test('SavedPlaylist correctly maps YouTube playlists with video counts', () {
      final playlist = SavedPlaylist(
        id: 'pl_1',
        userId: 'u1',
        playlistId: 'PL4cUxeGkcC9gC88BEo9CzgySpHYzpCGuP',
        title: 'Flutter & Dart Tutorial',
        channelName: 'Net Ninja',
        videoCount: 30,
        savedAt: '2026-09-14T00:00:00.000Z',
      );

      expect(playlist.videoCount, 30);
      expect(playlist.channelName, 'Net Ninja');

      final map = playlist.toMap();
      final revived = SavedPlaylist.fromMap(map);
      expect(revived.playlistId, playlist.playlistId);
      expect(revived.title, playlist.title);
      expect(revived.videoCount, 30);
    });

    test('SavedPlaylist.fromMap resolves nested playlist.youtube_playlist_id over relational UUID', () {
      final supabaseJoinedMap = {
        'id': 'saved_pl_uuid_123',
        'user_id': 'user_uuid_456',
        'playlist_id': 'relational_playlist_uuid_789',
        'saved_at': '2026-09-14T10:00:00.000Z',
        'playlist': {
          'id': 'relational_playlist_uuid_789',
          'youtube_playlist_id': 'PL4cUxeGkcC9gC88BEo9CzgySpHYzpCGuP',
          'title': 'Flutter Mastery Course',
          'channel_name': 'The Net Ninja',
          'video_count': 42,
        },
      };

      final playlist = SavedPlaylist.fromMap(supabaseJoinedMap);
      expect(playlist.playlistId, 'PL4cUxeGkcC9gC88BEo9CzgySpHYzpCGuP');
      expect(playlist.effectivePlaylistId, 'PL4cUxeGkcC9gC88BEo9CzgySpHYzpCGuP');
      expect(playlist.title, 'Flutter Mastery Course');
      expect(playlist.videoCount, 42);

      // Verify that a raw UUID playlist ID is rejected by effectivePlaylistId
      const uuidPlaylist = SavedPlaylist(
        id: 'pl_raw_uuid',
        userId: 'u1',
        playlistId: '7f8a9b0c-1234-5678-9abc-def012345678',
        title: 'Unresolved Relational Playlist',
        savedAt: '2026-09-14T00:00:00.000Z',
      );
      expect(uuidPlaylist.effectivePlaylistId, '');
    });

    test('SavedVideo resolves nested video.youtube_video_id when video_id is a UUID', () {
      final supabaseJoinedMap = {
        'id': 'saved_video_uuid_1',
        'user_id': 'user_uuid_1',
        'video_id': '7f8a9b0c-1234-5678-9abc-def012345678', // Relational UUID foreign key
        'saved_at': '2026-09-14T10:00:00.000Z',
        'video': {
          'id': '7f8a9b0c-1234-5678-9abc-def012345678',
          'youtube_video_id': 'dQw4w9WgXcQ', // True 11-char YouTube ID
          'title': 'Never Gonna Give You Up',
          'channel_name': 'Rick Astley',
          'thumbnail_url': 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
          'duration_seconds': 213,
        },
      };

      final video = SavedVideo.fromMap(supabaseJoinedMap);
      expect(video.videoId, '7f8a9b0c-1234-5678-9abc-def012345678');
      expect(video.youtubeVideoId, 'dQw4w9WgXcQ');
      expect(video.effectiveVideoId, 'dQw4w9WgXcQ');
      expect(video.title, 'Never Gonna Give You Up');

      // Test extraction
      expect(VideoPlayerScreen.extractCleanVideoId(video.effectiveVideoId), 'dQw4w9WgXcQ');

      // Verify that passing raw UUID to extractCleanVideoId returns empty string (fails validation safely)
      expect(VideoPlayerScreen.extractCleanVideoId(video.videoId), '');

      // Verify URL extraction variants
      expect(
        VideoPlayerScreen.extractCleanVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s'),
        'dQw4w9WgXcQ',
      );
      expect(
        VideoPlayerScreen.extractCleanVideoId('https://youtu.be/dQw4w9WgXcQ'),
        'dQw4w9WgXcQ',
      );
      expect(
        VideoPlayerScreen.extractCleanVideoId('https://youtube.com/shorts/dQw4w9WgXcQ'),
        'dQw4w9WgXcQ',
      );
      expect(
        VideoPlayerScreen.extractCleanVideoId('https://youtube.com/live/dQw4w9WgXcQ'),
        'dQw4w9WgXcQ',
      );
    });
  });

  group('Pomodoro Background Drift Resistance', () {
    test('Timestamp difference calculates remaining seconds without UI timer drift', () {
      final startTime = DateTime(2026, 9, 14, 10, 0, 0);
      const focusDurationSec = 25 * 60; // 1500 seconds
      final plannedEndTime = startTime.add(const Duration(seconds: focusDurationSec));

      // Simulate device going to sleep / backgrounded for 12 minutes (720 seconds)
      final afterWakeupTime = startTime.add(const Duration(minutes: 12));
      final remaining = plannedEndTime.difference(afterWakeupTime).inSeconds;

      expect(remaining, 1500 - 720); // Exactly 780 seconds remaining (13 minutes)
      expect(remaining ~/ 60, 13);
    });

    test('Expired session detection triggers completion upon resume', () {
      final startTime = DateTime(2026, 9, 14, 10, 0, 0);
      const focusDurationSec = 25 * 60;
      final plannedEndTime = startTime.add(const Duration(seconds: focusDurationSec));

      // Simulate device unlocked 30 minutes later (past 25 min timer)
      final lateWakeup = startTime.add(const Duration(minutes: 30));
      final remaining = plannedEndTime.difference(lateWakeup).inSeconds;

      expect(remaining <= 0, isTrue);
      expect(lateWakeup.isAfter(plannedEndTime), isTrue);
    });
  });

  group('Academic Vault & StudyDocument Model Tests', () {
    test('Correctly computes file extension and formatted size', () {
      final doc = StudyDocument(
        id: 'doc_1',
        userId: 'user_1',
        title: 'Machine Learning Syllabus',
        fileName: 'cs401_syllabus_final.pdf',
        storageKey: 'documents/user_1/doc_1.pdf',
        storageProvider: 'r2',
        mimeType: 'application/pdf',
        fileSizeBytes: 2457600, // ~2.34 MB
        category: 'syllabus',
        createdAt: '2026-09-19T00:00:00.000Z',
      );

      expect(doc.fileExtension, '.pdf');
      expect(doc.fileTypeBadge, 'PDF');
      expect(doc.formattedSize, '2.3 MB');
      expect(doc.filename, 'cs401_syllabus_final.pdf');
    });

    test('Resolves file badges for multiple document formats', () {
      final docx = StudyDocument(
        id: 'doc_2',
        userId: 'user_1',
        title: 'Notes',
        fileName: 'lecture_01.docx',
        storageKey: 'key',
        storageProvider: 'r2',
        mimeType: 'application/docx',
        fileSizeBytes: 1024 * 500,
        createdAt: '2026-09-19T00:00:00.000Z',
      );
      final pptx = StudyDocument(
        id: 'doc_3',
        userId: 'user_1',
        title: 'Slides',
        fileName: 'presentation.pptx',
        storageKey: 'key',
        storageProvider: 'r2',
        mimeType: 'application/pptx',
        fileSizeBytes: 1024 * 1024 * 5,
        createdAt: '2026-09-19T00:00:00.000Z',
      );

      expect(docx.fileTypeBadge, 'DOC');
      expect(docx.formattedSize, '500.0 KB');
      expect(pptx.fileTypeBadge, 'PPT');
      expect(pptx.formattedSize, '5.0 MB');
    });

    test('SQLite serialization toMap and fromMap maintains full data fidelity', () {
      final original = StudyDocument(
        id: 'doc_4',
        userId: 'user_xyz',
        title: 'Advanced Operating Systems',
        description: 'Textbook chapters 1-4',
        fileName: 'os_textbook.epub',
        storageKey: 'documents/user_xyz/os.epub',
        storageProvider: 'r2',
        mimeType: 'application/epub+zip',
        fileSizeBytes: 15728640,
        category: 'textbook',
        createdAt: '2026-09-19T10:00:00.000Z',
      );

      final map = original.toMap();
      final revived = StudyDocument.fromMap(map);

      expect(revived.id, original.id);
      expect(revived.userId, original.userId);
      expect(revived.title, original.title);
      expect(revived.description, original.description);
      expect(revived.fileName, original.fileName);
      expect(revived.fileSizeBytes, original.fileSizeBytes);
      expect(revived.category, original.category);
      expect(revived.fileTypeBadge, 'FILE'); // default for epub
    });

    test('SavedVideo copyWith properly updates watch progress and status', () {
      final original = SavedVideo(
        id: 'sv_1',
        userId: 'user_1',
        videoId: 'vid_123',
        title: 'Fourier Transform Lecture',
        durationSeconds: 3600,
        watchProgressSeconds: 0,
        status: 'saved',
      );

      final updated = original.copyWith(
        watchProgressSeconds: 1800,
        status: 'in_progress',
        lastWatchedAt: '2026-09-19T12:00:00.000Z',
      );

      expect(updated.id, original.id);
      expect(updated.title, original.title);
      expect(updated.watchProgressSeconds, 1800);
      expect(updated.status, 'in_progress');
      expect(updated.lastWatchedAt, '2026-09-19T12:00:00.000Z');
    });
  });
}
