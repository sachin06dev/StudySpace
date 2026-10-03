import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:youtube_player_iframe/youtube_player_iframe.dart';
import '../models/saved_video.dart';
import '../providers/study_provider.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/design_system/components/app_card.dart';
import '../../core/services/feedback_service.dart';

class VideoPlayerScreen extends StatefulWidget {
  final SavedVideo video;
  final int? initialTimestampSeconds;

  const VideoPlayerScreen({
    super.key,
    required this.video,
    this.initialTimestampSeconds,
  });

  static String extractCleanVideoId(String raw) {
    final trimmed = raw.trim();
    if (RegExp(r'^[a-zA-Z0-9_-]{11}$').hasMatch(trimmed)) {
      return trimmed;
    }
    // Handle Shorts
    final shortsMatch = RegExp(r'youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})', caseSensitive: false).firstMatch(trimmed);
    if (shortsMatch != null && shortsMatch.groupCount >= 1) {
      return shortsMatch.group(1)!;
    }
    // Handle Live
    final liveMatch = RegExp(r'youtube\.com\/live\/([a-zA-Z0-9_-]{11})', caseSensitive: false).firstMatch(trimmed);
    if (liveMatch != null && liveMatch.groupCount >= 1) {
      return liveMatch.group(1)!;
    }
    // Handle standard watch, embed, youtu.be
    final regExp = RegExp(
      r'(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})',
      caseSensitive: false,
    );
    final match = regExp.firstMatch(trimmed);
    if (match != null && match.groupCount >= 1) {
      return match.group(1)!;
    }
    // If invalid or not 11 chars (e.g. Postgres UUID), return empty string so validation fails gracefully
    if (trimmed.length != 11) {
      return '';
    }
    return trimmed;
  }

  @override
  State<VideoPlayerScreen> createState() => _VideoPlayerScreenState();
}

class _VideoPlayerScreenState extends State<VideoPlayerScreen> {
  late YoutubePlayerController _controller;
  late String _cleanVideoId;

  bool _hasError = false;
  String _errorMessage = '';
  final TextEditingController _noteInputCtrl = TextEditingController();
  int _capturedTimestampSeconds = 0;
  bool _isAddingNote = false;
  Timer? _progressTimer;

  int _lastKnownPositionSeconds = 0;

  @override
  void initState() {
    super.initState();
    _cleanVideoId = VideoPlayerScreen.extractCleanVideoId(widget.video.effectiveVideoId);
    _lastKnownPositionSeconds = (widget.initialTimestampSeconds != null && widget.initialTimestampSeconds! > 0)
        ? widget.initialTimestampSeconds!
        : widget.video.watchProgressSeconds;

    _initPlayer();
  }

  void _initPlayer() {
    _hasError = false;

    final isValidId = RegExp(r'^[a-zA-Z0-9_-]{11}$').hasMatch(_cleanVideoId);
    if (!isValidId) {
      _hasError = true;
      _errorMessage = _cleanVideoId.isEmpty
          ? 'Invalid or missing YouTube video ID. Video cannot be played.'
          : 'Invalid video ID format ($_cleanVideoId). Video may be deleted or private.';
      _controller = YoutubePlayerController(
        params: const YoutubePlayerParams(
          showFullscreenButton: false,
          showControls: false,
          mute: true,
        ),
      );
      return;
    }

    _controller = YoutubePlayerController.fromVideoId(
      videoId: _cleanVideoId,
      autoPlay: true,
      params: const YoutubePlayerParams(
        showFullscreenButton: true,
        showControls: true,
        mute: false,
        strictRelatedVideos: true,
        // origin is intentionally omitted: on mobile the WebView is not
        // served from a web host, so specifying an origin causes YouTube
        // to reject the embed as "Video unavailable".
      ),
    );

    // Auto-save watch progress every 15 seconds so the Continue Watching
    // shelf stays up-to-date even if the user closes the screen mid-video.
    _progressTimer = Timer.periodic(const Duration(seconds: 15), (_) async {
      if (!mounted) return;
      try {
        final currentSec = await _controller.currentTime;
        if (currentSec > 0 && mounted) {
          _lastKnownPositionSeconds = currentSec.toInt();
          context.read<StudyProvider>().updateVideoProgress(
                widget.video.id,
                _lastKnownPositionSeconds,
              );
        }
      } catch (_) {}
    });

    _controller.setFullScreenListener((isFullScreen) {
      debugPrint('YouTube FullScreen changed: $isFullScreen');
    });

    final targetStartSeconds = (widget.initialTimestampSeconds != null && widget.initialTimestampSeconds! > 0)
        ? widget.initialTimestampSeconds!
        : (widget.video.watchProgressSeconds > 0 ? widget.video.watchProgressSeconds : 0);

    bool hasInitialSeeked = false;
    _controller.listen((state) {
      if (state.hasError && mounted) {
        setState(() {
          _hasError = true;
          _errorMessage = 'Playback error: ${state.error.name}. Video may be private or restricted.';
        });
      }
      if (!hasInitialSeeked &&
          targetStartSeconds > 0 &&
          (state.playerState == PlayerState.playing || state.playerState == PlayerState.cued)) {
        hasInitialSeeked = true;
        _controller.seekTo(seconds: targetStartSeconds.toDouble(), allowSeekAhead: true);
      }
    });

    if (targetStartSeconds > 0) {
      Future.delayed(const Duration(milliseconds: 600), () {
        if (mounted && !hasInitialSeeked) {
          hasInitialSeeked = true;
          _controller.seekTo(seconds: targetStartSeconds.toDouble(), allowSeekAhead: true);
        }
      });
    }
  }

  void _saveFinalProgress() {
    if (_lastKnownPositionSeconds > 0 && mounted) {
      try {
        context.read<StudyProvider>().updateVideoProgress(
              widget.video.id,
              _lastKnownPositionSeconds,
            );
      } catch (_) {}
    }
  }

  @override
  void dispose() {
    _progressTimer?.cancel();
    _saveFinalProgress();
    _controller.close();
    _noteInputCtrl.dispose();
    super.dispose();
  }

  String _formatTimestamp(int totalSeconds) {
    final h = totalSeconds ~/ 3600;
    final m = (totalSeconds % 3600) ~/ 60;
    final s = totalSeconds % 60;
    final padM = m.toString().padLeft(2, '0');
    final padS = s.toString().padLeft(2, '0');
    if (h > 0) {
      return '$h:$padM:$padS';
    }
    return '$padM:$padS';
  }

  Future<void> _captureCurrentTimestamp() async {
    FeedbackService.instance.selection();
    try {
      final currentSec = await _controller.currentTime;
      setState(() {
        _capturedTimestampSeconds = currentSec.toInt();
        _isAddingNote = true;
      });
    } catch (_) {
      setState(() {
        _capturedTimestampSeconds = 0;
        _isAddingNote = true;
      });
    }
  }

  Future<void> _saveNote() async {
    final content = _noteInputCtrl.text.trim();
    if (content.isEmpty) return;

    FeedbackService.instance.light();
    final studyProvider = context.read<StudyProvider>();

    await studyProvider.addNote(
      videoId: widget.video.videoId,
      timestampSeconds: _capturedTimestampSeconds,
      content: content,
    );

    _noteInputCtrl.clear();
    setState(() {
      _isAddingNote = false;
    });
  }

  Future<void> _openInExternalYouTube() async {
    FeedbackService.instance.selection();
    if (!RegExp(r'^[a-zA-Z0-9_-]{11}$').hasMatch(_cleanVideoId)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Cannot open in YouTube: Invalid video ID.'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
      return;
    }

    final uri = Uri.parse('https://www.youtube.com/watch?v=$_cleanVideoId');
    try {
      final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (!launched) {
        await launchUrl(uri, mode: LaunchMode.platformDefault);
      }
    } catch (e) {
      debugPrint('Could not launch YouTube app, falling back to browser: $e');
      try {
        await launchUrl(uri, mode: LaunchMode.platformDefault);
      } catch (err) {
        debugPrint('Could not open YouTube URL: $err');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final studyProvider = context.watch<StudyProvider>();
    final notes = studyProvider.notes
        .where((n) => n.videoId == widget.video.videoId || n.videoId == _cleanVideoId)
        .toList()
      ..sort((a, b) => a.timestampSeconds.compareTo(b.timestampSeconds));

    return PopScope(
      canPop: true,
      onPopInvokedWithResult: (didPop, _) {
        if (didPop) _saveFinalProgress();
      },
      child: Scaffold(
      appBar: AppBar(
            title: Text(
              widget.video.title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: AppTypography.heading3.copyWith(fontWeight: FontWeight.bold),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.open_in_new_rounded),
                tooltip: 'Open in YouTube App',
                onPressed: _openInExternalYouTube,
              ),
            ],
          ),
          body: SafeArea(
            child: Column(
              children: [
                // 1. YouTube Player Box
                AspectRatio(
                  aspectRatio: 16 / 9,
                  child: Stack(
                    children: [
                      YoutubePlayer(controller: _controller),
                      if (_hasError)
                        Container(
                          color: Colors.black87,
                          padding: const EdgeInsets.all(20),
                          child: Center(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.error_outline_rounded, color: AppColors.danger, size: 40),
                                const SizedBox(height: 10),
                                Text(
                                  'Playback couldn\'t start',
                                  style: AppTypography.heading3.copyWith(color: Colors.white),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  _errorMessage.isNotEmpty ? _errorMessage : 'Video may be unavailable for embedding.',
                                  textAlign: TextAlign.center,
                                  style: AppTypography.caption.copyWith(color: Colors.white70),
                                ),
                                const SizedBox(height: 14),
                                Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    ElevatedButton.icon(
                                      onPressed: () {
                                        FeedbackService.instance.selection();
                                        setState(() {
                                          _initPlayer();
                                        });
                                      },
                                      icon: const Icon(Icons.refresh_rounded, size: 16),
                                      label: const Text('Retry'),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: AppColors.primary(context),
                                        foregroundColor: Colors.white,
                                      ),
                                    ),
                                    const SizedBox(width: 10),
                                    OutlinedButton.icon(
                                      onPressed: _openInExternalYouTube,
                                      icon: const Icon(Icons.open_in_new_rounded, size: 16, color: Colors.white),
                                      label: const Text('Open in YouTube', style: TextStyle(color: Colors.white)),
                                      style: OutlinedButton.styleFrom(
                                        side: const BorderSide(color: Colors.white38),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),
                ),

                // 2. Video Title & Channel Header
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: AppColors.card(context),
                    border: Border(bottom: BorderSide(color: AppColors.border(context))),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.video.title,
                        style: AppTypography.bodyBold.copyWith(
                          color: AppColors.textPrimary(context),
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        widget.video.channelName ?? 'YouTube Academic Lecture',
                        style: AppTypography.caption.copyWith(
                          color: AppColors.textMuted(context),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: _openInExternalYouTube,
                              icon: const Icon(Icons.open_in_new_rounded, size: 16),
                              label: const Text('Watch on YouTube'),
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: _captureCurrentTimestamp,
                              icon: const Icon(Icons.bookmark_add_rounded, size: 16),
                              label: const Text('Add Note'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primary(context),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                // 3. New Note Input Box (if active)
                if (_isAddingNote)
                  Container(
                    padding: const EdgeInsets.all(16),
                    color: AppColors.surfaceMuted(context),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.primary(context),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                _formatTimestamp(_capturedTimestampSeconds),
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Add Note at this moment',
                              style: AppTypography.bodyBold.copyWith(color: AppColors.textPrimary(context)),
                            ),
                            const Spacer(),
                            IconButton(
                              icon: const Icon(Icons.close_rounded, size: 20),
                              onPressed: () => setState(() => _isAddingNote = false),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _noteInputCtrl,
                          autofocus: true,
                          decoration: InputDecoration(
                            hintText: 'Key takeaway, formula, or reminder...',
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          ),
                          maxLines: 2,
                        ),
                        const SizedBox(height: 8),
                        Align(
                          alignment: Alignment.centerRight,
                          child: ElevatedButton(
                            onPressed: _saveNote,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary(context),
                              foregroundColor: Colors.white,
                            ),
                            child: const Text('Save Note'),
                          ),
                        ),
                      ],
                    ),
                  ),

                // 4. Timestamped Notes List
                Expanded(
                  child: notes.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.notes_rounded, size: 48, color: AppColors.textMuted(context).withValues(alpha: 0.5)),
                              const SizedBox(height: 12),
                              Text(
                                'No notes for this video yet',
                                style: AppTypography.bodyBold.copyWith(color: AppColors.textMuted(context)),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Tap "Add Note" while watching to save key insights with timestamps.',
                                textAlign: TextAlign.center,
                                style: AppTypography.caption.copyWith(color: AppColors.textMuted(context)),
                              ),
                            ],
                          ),
                        )
                      : ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: notes.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 8),
                          itemBuilder: (ctx, i) {
                            final note = notes[i];
                            return AppCard(
                              padding: const EdgeInsets.all(12),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  InkWell(
                                    onTap: () {
                                      FeedbackService.instance.selection();
                                      _controller.seekTo(
                                        seconds: note.timestampSeconds.toDouble(),
                                        allowSeekAhead: true,
                                      );
                                    },
                                    borderRadius: BorderRadius.circular(6),
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: AppColors.primarySubtle(context),
                                        borderRadius: BorderRadius.circular(6),
                                        border: Border.all(color: AppColors.primary(context).withValues(alpha: 0.3)),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(Icons.play_arrow_rounded, size: 14, color: AppColors.primary(context)),
                                          const SizedBox(width: 2),
                                          Text(
                                            note.formattedTimestamp,
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 12,
                                              color: AppColors.primary(context),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      note.content,
                                      style: AppTypography.body.copyWith(
                                        color: AppColors.textPrimary(context),
                                      ),
                                    ),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.delete_outline_rounded, size: 18),
                                    color: AppColors.textMuted(context),
                                    onPressed: () {
                                      FeedbackService.instance.selection();
                                      studyProvider.deleteNote(note.id);
                                    },
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                ),
              ],
            ),
          ),
        ),
      );
  }
}
