import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/design_system/components/app_button.dart';
import '../../core/design_system/components/app_chip.dart';
import '../../core/design_system/components/app_dialog.dart';
import '../../core/design_system/components/app_empty_state.dart';
import '../../core/design_system/components/app_loading_state.dart';
import '../../core/services/feedback_service.dart';
import '../../core/supabase/supabase_client.dart';
import '../models/saved_playlist.dart';
import '../models/saved_video.dart';
import '../providers/study_provider.dart';
import 'video_player_screen.dart';

class VideoLibraryScreen extends StatefulWidget {
  final int initialTabIndex;

  const VideoLibraryScreen({super.key, this.initialTabIndex = 0});

  @override
  State<VideoLibraryScreen> createState() => _VideoLibraryScreenState();
}

class _VideoLibraryScreenState extends State<VideoLibraryScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  String _selectedStatusFilter = 'all'; // all, in_progress, completed, saved

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: 2,
      vsync: this,
      initialIndex: widget.initialTabIndex,
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _showAddDialog() {
    final urlCtrl = TextEditingController();
    bool isPlaylist = _tabController.index == 1;
    bool isSubmitting = false;
    String? inlineError;

    bool isValidYoutubeInput(String text, bool playlistMode) {
      final clean = text.trim();
      if (clean.isEmpty) return false;
      if (playlistMode) {
        if (clean.contains('list=')) return true;
        if (RegExp(r'^[a-zA-Z0-9_-]{10,}$').hasMatch(clean)) return true;
        return false;
      } else {
        if (clean.contains('youtube.com') || clean.contains('youtu.be')) return true;
        if (RegExp(r'^[a-zA-Z0-9_-]{11}$').hasMatch(clean)) return true;
        return false;
      }
    }

    showDialog(
      context: context,
      barrierDismissible: !isSubmitting,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) {
          return AlertDialog(
            backgroundColor: AppColors.surface(context),
            shape: RoundedRectangleBorder(borderRadius: AppRadii.xl),
            title: Text(
              isPlaylist ? 'Add YouTube Playlist' : 'Add YouTube Video',
              style: AppTypography.headingMd.copyWith(fontWeight: FontWeight.w700),
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isPlaylist
                      ? 'Paste a YouTube playlist link to import full course series.'
                      : 'Paste a YouTube video link to save lectures and take timestamped notes.',
                  style: AppTypography.caption.copyWith(color: AppColors.textMuted(context)),
                ),
                const SizedBox(height: AppSpacing.md),
                TextField(
                  controller: urlCtrl,
                  autofocus: true,
                  enabled: !isSubmitting,
                  onChanged: (val) {
                    if (inlineError != null) {
                      setDialogState(() => inlineError = null);
                    }
                  },
                  decoration: InputDecoration(
                    labelText: isPlaylist ? 'Playlist URL' : 'YouTube Video URL',
                    hintText: isPlaylist ? 'https://youtube.com/playlist?list=...' : 'https://youtube.com/watch?v=...',
                    errorText: inlineError,
                    prefixIcon: const Icon(Icons.link_rounded, size: 20),
                    border: OutlineInputBorder(borderRadius: AppRadii.lg),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  ),
                ),
                if (isSubmitting) ...[
                  const SizedBox(height: AppSpacing.md),
                  Row(
                    children: [
                      const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        child: Text(
                          isPlaylist
                              ? 'Importing playlist and fetching lectures...'
                              : 'Fetching video details and adding to library...',
                          style: AppTypography.caption.copyWith(
                            color: AppColors.textMuted(context),
                            fontStyle: FontStyle.italic,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
            actions: [
              TextButton(
                onPressed: isSubmitting ? null : () => Navigator.of(ctx).pop(),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary(context),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: AppRadii.md),
                ),
                onPressed: isSubmitting
                    ? null
                    : () async {
                        final url = urlCtrl.text.trim();
                        if (url.isEmpty) {
                          setDialogState(() => inlineError = 'Please enter a valid YouTube link or ID');
                          return;
                        }
                        if (!isValidYoutubeInput(url, isPlaylist)) {
                          setDialogState(() => inlineError = isPlaylist
                              ? 'Enter a valid YouTube playlist URL (containing list=)'
                              : 'Enter a valid YouTube video URL or ID');
                          return;
                        }

                        setDialogState(() {
                          isSubmitting = true;
                          inlineError = null;
                        });

                        final provider = context.read<StudyProvider>();
                        final bool success;
                        if (isPlaylist) {
                          success = await provider.addPlaylistFromUrl(url);
                        } else {
                          success = await provider.addVideoFromUrl(url);
                        }

                        if (ctx.mounted) {
                          Navigator.of(ctx).pop();
                        }

                        if (mounted) {
                          final errMsg = provider.errorMessage;
                          final isDuplicate = errMsg != null && errMsg.toLowerCase().contains('already');
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(
                                success
                                    ? (isPlaylist ? 'Playlist added to library!' : 'Video added to library!')
                                    : (errMsg ?? 'Failed to add content.'),
                              ),
                              backgroundColor: success
                                  ? AppColors.success
                                  : (isDuplicate ? Colors.orange : AppColors.danger),
                              behavior: SnackBarBehavior.floating,
                            ),
                          );
                        }
                      },
                child: isSubmitting
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Text('Add to Library'),
              ),
            ],
          );
        },
      ),
    );
  }

  String _formatDuration(int totalSeconds) {
    final hours = totalSeconds ~/ 3600;
    final minutes = (totalSeconds % 3600) ~/ 60;
    final seconds = totalSeconds % 60;
    if (hours > 0) {
      return '${hours}h ${minutes}m';
    }
    return '${minutes}m ${seconds}s';
  }

  Future<void> _openPlaylistUrl(String playlistId) async {
    FeedbackService.instance.selection();
    final cleanId = playlistId.trim();
    if (cleanId.isEmpty) return;

    final uri = Uri.parse('https://www.youtube.com/playlist?list=$cleanId');
    try {
      final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (!launched) {
        await launchUrl(uri, mode: LaunchMode.platformDefault);
      }
    } catch (_) {}
  }

  void _showPlaylistCurriculumSheet(BuildContext context, SavedPlaylist playlist) {
    FeedbackService.instance.selection();

    final effectiveCatalogId = playlist.catalogPlaylistId.isNotEmpty
        ? playlist.catalogPlaylistId
        : (RegExp(r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$')
                .hasMatch(playlist.playlistId)
            ? playlist.playlistId
            : '');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface(context),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return DraggableScrollableSheet(
          initialChildSize: 0.65,
          minChildSize: 0.4,
          maxChildSize: 0.9,
          expand: false,
          builder: (_, scrollController) {
            return SingleChildScrollView(
              controller: scrollController,
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Grab handle
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: AppColors.textMuted(context).withValues(alpha: 0.3),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Playlist Header
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      ClipRRect(
                        borderRadius: AppRadii.md,
                        child: Container(
                          width: 80,
                          height: 56,
                          color: AppColors.surfaceRaised(context),
                          child: playlist.thumbnailUrl != null && playlist.thumbnailUrl!.isNotEmpty
                              ? Image.network(
                                  playlist.thumbnailUrl!,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => const Icon(Icons.playlist_play_rounded, size: 28),
                                )
                              : const Icon(Icons.playlist_play_rounded, size: 28),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              playlist.title,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: AppTypography.headingSm.copyWith(fontWeight: FontWeight.w700),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${playlist.channelName ?? 'YouTube'} · ${playlist.videoCount > 0 ? '${playlist.videoCount} lessons' : 'Course Playlist'}',
                              style: AppTypography.caption.copyWith(color: AppColors.textMuted(context)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Actions
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () {
                            Navigator.of(ctx).pop();
                            _openPlaylistUrl(playlist.effectivePlaylistId);
                          },
                          icon: const Icon(Icons.play_arrow_rounded, size: 20),
                          label: const Text('Open in YouTube'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary(context),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: AppRadii.md),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      IconButton(
                        icon: Icon(Icons.delete_outline_rounded, color: AppColors.danger),
                        tooltip: 'Remove Playlist',
                        onPressed: () {
                          Navigator.of(ctx).pop();
                          _confirmDeletePlaylist(context, playlist);
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  Text(
                    'SERIES DETAILS',
                    style: AppTypography.overline.copyWith(
                      letterSpacing: 1.0,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textMuted(context),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    playlist.description != null && playlist.description!.isNotEmpty
                        ? playlist.description!
                        : 'Curated YouTube video course saved to your personal StudySpace academic library.',
                    style: AppTypography.bodySm.copyWith(
                      color: AppColors.textMuted(context),
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 24),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'CURRICULUM LESSONS',
                        style: AppTypography.overline.copyWith(
                          letterSpacing: 1.0,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textMuted(context),
                        ),
                      ),
                      Text(
                        playlist.videoCount > 0
                            ? '${playlist.videoCount} ${playlist.videoCount == 1 ? 'lesson' : 'lessons'}'
                            : 'Lessons',
                        style: AppTypography.caption.copyWith(
                          color: AppColors.textMuted(context),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  FutureBuilder<List<Map<String, dynamic>>>(
                    future: effectiveCatalogId.isNotEmpty
                        ? SupabaseService.client
                            .from('playlist_items')
                            .select('id, position, video:youtube_videos(id, youtube_video_id, title, duration_seconds, channel_name, thumbnail_url)')
                            .eq('playlist_id', effectiveCatalogId)
                            .order('position', ascending: true)
                            .then((res) => (res as List).cast<Map<String, dynamic>>())
                            .catchError((_) => <Map<String, dynamic>>[])
                        : Future.value(<Map<String, dynamic>>[]),
                    builder: (context, snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return const Padding(
                          padding: EdgeInsets.symmetric(vertical: 24),
                          child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
                        );
                      }
                      final items = snapshot.data ?? [];
                      if (items.isEmpty) {
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          child: Text(
                            'All ${playlist.videoCount} lessons are accessible when opening this series in YouTube.',
                            style: AppTypography.bodySm.copyWith(color: AppColors.textMuted(context)),
                          ),
                        );
                      }
                      return ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: items.length,
                        separatorBuilder: (_, __) => Divider(height: 1, color: AppColors.border(context)),
                        itemBuilder: (ctx, index) {
                          final item = items[index];
                          final video = item['video'] as Map<String, dynamic>?;
                          final title = (video?['title'] ?? 'Lesson ${index + 1}') as String;
                          final durationSec = (video?['duration_seconds'] as num?)?.toInt();
                          final durationStr = durationSec != null && durationSec > 0
                              ? '${(durationSec ~/ 60).toString().padLeft(2, '0')}:${(durationSec % 60).toString().padLeft(2, '0')}'
                              : null;
                          final ytid = (video?['youtube_video_id'] ?? '') as String;

                          return ListTile(
                            dense: true,
                            contentPadding: EdgeInsets.zero,
                            leading: Container(
                              width: 28,
                              height: 28,
                              alignment: Alignment.center,
                              decoration: BoxDecoration(
                                color: AppColors.surfaceMuted(context),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                '${index + 1}',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.textPrimary(context),
                                ),
                              ),
                            ),
                            title: Text(
                              title,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                            ),
                            subtitle: durationStr != null
                                ? Text(durationStr, style: TextStyle(fontSize: 11, color: AppColors.textMuted(context)))
                                : null,
                            trailing: ytid.isNotEmpty
                                ? Icon(Icons.play_circle_outline_rounded, size: 22, color: AppColors.primary(context))
                                : null,
                            onTap: ytid.isNotEmpty
                                ? () {
                                    Navigator.of(ctx).pop();
                                    FeedbackService.instance.selection();
                                    Navigator.of(context).push(
                                      MaterialPageRoute(
                                        builder: (_) => VideoPlayerScreen(
                                          video: SavedVideo(
                                            id: (video?['id'] ?? '') as String,
                                            userId: SupabaseService.currentUserId ?? '',
                                            videoId: ytid,
                                            youtubeVideoId: ytid,
                                            title: title,
                                            channelName: playlist.channelName ?? 'YouTube',
                                            durationSeconds: durationSec ?? 0,
                                          ),
                                        ),
                                      ),
                                    );
                                  }
                                : null,
                          );
                        },
                      );
                    },
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _confirmDeleteVideo(BuildContext context, SavedVideo video) {
    AppDialog.show(
      context,
      title: 'Remove Video',
      description: 'Remove "${video.title}" from your saved videos library?',
      confirmLabel: 'Remove',
      cancelLabel: 'Cancel',
      confirmVariant: AppButtonVariant.danger,
      onConfirm: () async {
        FeedbackService.instance.medium();
        await context.read<StudyProvider>().deleteVideo(video.id);
      },
    );
  }

  void _confirmDeletePlaylist(BuildContext context, SavedPlaylist playlist) {
    AppDialog.show(
      context,
      title: 'Remove Playlist',
      description: 'Remove "${playlist.title}" from your saved playlists library?',
      confirmLabel: 'Remove',
      cancelLabel: 'Cancel',
      confirmVariant: AppButtonVariant.danger,
      onConfirm: () async {
        FeedbackService.instance.medium();
        await context.read<StudyProvider>().deletePlaylist(playlist.id);
      },
    );
  }

  List<SavedVideo> _filterVideos(List<SavedVideo> videos) {
    return videos.where((v) {
      if (_selectedStatusFilter != 'all') {
        if (_selectedStatusFilter == 'in_progress' && v.status != 'in_progress') return false;
        if (_selectedStatusFilter == 'completed' && v.status != 'completed') return false;
        if (_selectedStatusFilter == 'saved' && (v.status == 'in_progress' || v.status == 'completed')) return false;
      }
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final matchTitle = v.title.toLowerCase().contains(q);
        final matchChannel = (v.channelName ?? '').toLowerCase().contains(q);
        if (!matchTitle && !matchChannel) return false;
      }
      return true;
    }).toList();
  }

  List<SavedPlaylist> _filterPlaylists(List<SavedPlaylist> playlists) {
    return playlists.where((p) {
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final matchTitle = p.title.toLowerCase().contains(q);
        final matchChannel = (p.channelName ?? '').toLowerCase().contains(q);
        if (!matchTitle && !matchChannel) return false;
      }
      return true;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final provider = context.watch<StudyProvider>();

    final filteredVideos = _filterVideos(provider.savedVideos);
    final filteredPlaylists = _filterPlaylists(provider.savedPlaylists);

    // Continue Watching shelf: videos with progress > 0 and status != completed
    final continueVideos = provider.savedVideos
        .where((v) => v.watchProgressSeconds > 0 && v.status != 'completed')
        .toList();

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Study Media',
              style: AppTypography.headingMd.copyWith(fontWeight: FontWeight.w700),
            ),
            Text(
              '${provider.savedVideos.length} videos · ${provider.savedPlaylists.length} playlists',
              style: AppTypography.caption.copyWith(color: AppColors.textMuted(context)),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_outlined),
            tooltip: 'Refresh',
            onPressed: () => provider.loadData(),
          ),
        ],
        elevation: 0,
      ),
      floatingActionButton: FloatingActionButton(
        tooltip: _tabController.index == 1 ? 'Add Playlist' : 'Add Video',
        backgroundColor: AppColors.primary(context),
        foregroundColor: Colors.white,
        onPressed: _showAddDialog,
        child: Icon(
          _tabController.index == 1 ? Icons.playlist_add_rounded : Icons.video_call_rounded,
          size: 24,
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Search Input
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 6),
              child: TextField(
                controller: _searchController,
                onChanged: (val) => setState(() => _searchQuery = val.trim()),
                decoration: InputDecoration(
                  hintText: _tabController.index == 1
                      ? 'Search playlists by course or channel...'
                      : 'Search videos by title or instructor...',
                  prefixIcon: Icon(Icons.search_rounded, size: 20, color: AppColors.textMuted(context)),
                  suffixIcon: _searchQuery.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear, size: 18),
                          onPressed: () {
                            _searchController.clear();
                            setState(() => _searchQuery = '');
                          },
                        )
                      : null,
                  filled: true,
                  fillColor: AppColors.surfaceRaised(context),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  border: OutlineInputBorder(
                    borderRadius: AppRadii.lg,
                    borderSide: BorderSide(color: AppColors.border(context)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: AppRadii.lg,
                    borderSide: BorderSide(color: AppColors.border(context)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: AppRadii.lg,
                    borderSide: BorderSide(color: AppColors.primary(context), width: 1.5),
                  ),
                ),
              ),
            ),

            // Tab Bar
            Container(
              decoration: BoxDecoration(
                border: Border(
                  bottom: BorderSide(
                    color: AppColors.border(context),
                  ),
                ),
              ),
              child: TabBar(
                controller: _tabController,
                indicatorColor: AppColors.primary(context),
                labelColor: AppColors.primary(context),
                unselectedLabelColor: AppColors.textMuted(context),
                onTap: (_) => setState(() {}),
                tabs: [
                  Tab(text: 'Videos (${provider.savedVideos.length})'),
                  Tab(text: 'Playlists (${provider.savedPlaylists.length})'),
                ],
              ),
            ),

            // Tab Views
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  // Tab 1: Videos
                  _buildVideosTab(
                    context,
                    provider,
                    filteredVideos,
                    continueVideos,
                    isDark,
                  ),

                  // Tab 2: Playlists
                  _buildPlaylistsTab(
                    context,
                    provider,
                    filteredPlaylists,
                    isDark,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildVideosTab(
    BuildContext context,
    StudyProvider provider,
    List<SavedVideo> filteredVideos,
    List<SavedVideo> continueVideos,
    bool isDark,
  ) {
    if (provider.isLoading && provider.savedVideos.isEmpty) {
      return const Center(child: AppLoadingState(message: 'Loading study videos...'));
    }

    if (provider.savedVideos.isEmpty) {
      return Center(
        child: AppEmptyState(
          icon: Icons.video_library_outlined,
          title: 'No saved videos yet',
          message: 'Save academic lectures and YouTube course videos to review key concepts.',
          actionLabel: 'Add Video',
          onAction: _showAddDialog,
        ),
      );
    }

    return CustomScrollView(
      slivers: [
        // Filter Chips (All, In Progress, Completed, Saved)
        SliverToBoxAdapter(
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                _buildStatusChip('all', 'All Videos'),
                const SizedBox(width: 8),
                _buildStatusChip('in_progress', 'In Progress'),
                const SizedBox(width: 8),
                _buildStatusChip('completed', 'Completed'),
                const SizedBox(width: 8),
                _buildStatusChip('saved', 'Saved'),
              ],
            ),
          ),
        ),

        // Continue Watching Shelf (Only if no search and status is all or in_progress)
        if (_searchQuery.isEmpty &&
            (_selectedStatusFilter == 'all' || _selectedStatusFilter == 'in_progress') &&
            continueVideos.isNotEmpty) ...[
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
              child: Text(
                'CONTINUE WATCHING',
                style: AppTypography.overline.copyWith(
                  letterSpacing: 1.0,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textMuted(context),
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: SizedBox(
              height: 140,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: continueVideos.length,
                separatorBuilder: (_, __) => const SizedBox(width: 10),
                itemBuilder: (ctx, idx) => _buildContinueCard(ctx, continueVideos[idx], isDark),
              ),
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 14)),
        ],

        // Section Title
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  _searchQuery.isNotEmpty ? 'SEARCH RESULTS' : 'SAVED VIDEOS',
                  style: AppTypography.overline.copyWith(
                    letterSpacing: 1.0,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textMuted(context),
                  ),
                ),
                Text(
                  '${filteredVideos.length} items',
                  style: AppTypography.caption.copyWith(color: AppColors.textMuted(context)),
                ),
              ],
            ),
          ),
        ),

        // Videos List
        if (filteredVideos.isEmpty)
          SliverFillRemaining(
            hasScrollBody: false,
            child: Center(
              child: AppEmptyState(
                icon: Icons.search_off_rounded,
                title: 'No matching videos',
                message: 'Try a different search term or change your filter selection.',
              ),
            ),
          )
        else
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 80),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate(
                (ctx, i) => _buildVideoRow(ctx, filteredVideos[i], provider, isDark),
                childCount: filteredVideos.length,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildStatusChip(String key, String label) {
    final isSelected = _selectedStatusFilter == key;
    return AppChip(
      label: label,
      variant: isSelected ? AppChipTone.primary : AppChipTone.neutral,
      onTap: () {
        FeedbackService.instance.selection();
        setState(() => _selectedStatusFilter = key);
      },
    );
  }

  Widget _buildContinueCard(BuildContext context, SavedVideo video, bool isDark) {
    final progressRatio = video.durationSeconds > 0
        ? (video.watchProgressSeconds / video.durationSeconds).clamp(0.0, 1.0)
        : 0.0;

    return Container(
      width: 200,
      decoration: BoxDecoration(
        color: AppColors.surface(context),
        borderRadius: AppRadii.lg,
        border: Border.all(
          color: AppColors.border(context),
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: AppRadii.lg,
          onTap: () {
            FeedbackService.instance.selection();
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => VideoPlayerScreen(
                  video: video,
                  initialTimestampSeconds: video.watchProgressSeconds,
                ),
              ),
            );
          },
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Thumbnail with progress
              Stack(
                children: [
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                    child: Container(
                      height: 80,
                      width: double.infinity,
                      color: AppColors.surfaceRaised(context),
                      child: video.thumbnailUrl != null && video.thumbnailUrl!.isNotEmpty
                          ? Image.network(
                              video.thumbnailUrl!,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => const Center(child: Icon(Icons.play_circle_outline, size: 28)),
                            )
                          : const Center(child: Icon(Icons.play_circle_outline, size: 28)),
                    ),
                  ),
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    child: LinearProgressIndicator(
                      value: progressRatio,
                      minHeight: 3,
                      backgroundColor: Colors.black45,
                      valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary(context)),
                    ),
                  ),
                ],
              ),
              Padding(
                padding: const EdgeInsets.all(8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      video.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppTypography.bodySm.copyWith(fontWeight: FontWeight.w600),
                    ),
                    Text(
                      '${(progressRatio * 100).toInt()}% watched',
                      style: AppTypography.caption.copyWith(
                        fontSize: 11,
                        color: AppColors.primary(context),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildVideoRow(
    BuildContext context,
    SavedVideo video,
    StudyProvider provider,
    bool isDark,
  ) {
    final progressRatio = video.durationSeconds > 0
        ? (video.watchProgressSeconds / video.durationSeconds).clamp(0.0, 1.0)
        : 0.0;
    final noteCount = provider.notes.where((n) => n.videoId == video.videoId).length;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: AppColors.background(context),
        borderRadius: AppRadii.lg,
        border: Border.all(
          color: AppColors.border(context),
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: AppRadii.lg,
          onTap: () {
            FeedbackService.instance.selection();
            Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => VideoPlayerScreen(video: video)),
            );
          },
          child: Padding(
            padding: const EdgeInsets.all(10),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Thumbnail Box
                Stack(
                  children: [
                    ClipRRect(
                      borderRadius: AppRadii.md,
                      child: Container(
                        width: 96,
                        height: 64,
                        color: AppColors.surfaceRaised(context),
                        child: video.thumbnailUrl != null && video.thumbnailUrl!.isNotEmpty
                            ? Image.network(
                                video.thumbnailUrl!,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => const Center(
                                  child: Icon(Icons.play_circle_outline, size: 28),
                                ),
                              )
                            : const Center(child: Icon(Icons.video_collection_outlined, size: 28)),
                      ),
                    ),
                    if (video.durationSeconds > 0)
                      Positioned(
                        bottom: 4,
                        right: 4,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.black87,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            _formatDuration(video.durationSeconds),
                            style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w700),
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(width: 12),

                // Details
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        video.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: AppTypography.bodySm.copyWith(fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        video.channelName ?? 'YouTube',
                        style: AppTypography.caption.copyWith(
                          fontSize: 11,
                          color: AppColors.textMuted(context),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          _buildVideoStatusBadge(video.status, isDark),
                          if (noteCount > 0) ...[
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppColors.primarySubtle(context),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.edit_note_rounded, size: 12, color: AppColors.primary(context)),
                                  const SizedBox(width: 3),
                                  Text(
                                    '$noteCount',
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.primary(context),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ],
                      ),
                      if (video.durationSeconds > 0 && progressRatio > 0) ...[
                        const SizedBox(height: 6),
                        LinearProgressIndicator(
                          value: progressRatio,
                          backgroundColor: AppColors.surfaceRaised(context),
                          valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary(context)),
                          minHeight: 3,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ],
                    ],
                  ),
                ),

                // Actions Menu
                PopupMenuButton<String>(
                  icon: Icon(Icons.more_vert_rounded, size: 18, color: AppColors.textMuted(context)),
                  onSelected: (val) {
                    if (val == 'delete') _confirmDeleteVideo(context, video);
                  },
                  itemBuilder: (ctx) => [
                    PopupMenuItem(
                      value: 'delete',
                      child: Row(
                        children: [
                          Icon(Icons.delete_outline_rounded, size: 16, color: AppColors.danger),
                          const SizedBox(width: 8),
                          Text('Remove Video', style: TextStyle(color: AppColors.danger, fontSize: 13)),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildVideoStatusBadge(String status, bool isDark) {
    Color bg;
    Color fg;
    String label;

    switch (status) {
      case 'completed':
        bg = isDark ? const Color(0x2610B981) : const Color(0x1A10B981);
        fg = const Color(0xFF10B981);
        label = 'Completed';
        break;
      case 'in_progress':
        bg = isDark ? const Color(0x268B5CF6) : const Color(0x1A8B5CF6);
        fg = const Color(0xFF8B5CF6);
        label = 'In Progress';
        break;
      default:
        bg = isDark ? const Color(0x266B7280) : const Color(0x1A6B7280);
        fg = const Color(0xFF6B7280);
        label = 'Saved';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        label,
        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: fg),
      ),
    );
  }

  Widget _buildPlaylistsTab(
    BuildContext context,
    StudyProvider provider,
    List<SavedPlaylist> filteredPlaylists,
    bool isDark,
  ) {
    if (provider.isLoading && provider.savedPlaylists.isEmpty) {
      return const Center(child: AppLoadingState(message: 'Loading study playlists...'));
    }

    if (provider.savedPlaylists.isEmpty) {
      return Center(
        child: AppEmptyState(
          icon: Icons.playlist_play_rounded,
          title: 'No playlists saved yet',
          message: 'Import full YouTube course playlists and lecture series into your library.',
          actionLabel: 'Add Playlist',
          onAction: _showAddDialog,
        ),
      );
    }

    if (filteredPlaylists.isEmpty) {
      return Center(
        child: AppEmptyState(
          icon: Icons.search_off_rounded,
          title: 'No matching playlists',
          message: 'Try a different search keyword.',
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 80),
      itemCount: filteredPlaylists.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (ctx, i) {
        final playlist = filteredPlaylists[i];

        return Container(
          decoration: BoxDecoration(
            color: AppColors.surface(context),
            borderRadius: AppRadii.lg,
            border: Border.all(
              color: AppColors.border(context),
            ),
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              borderRadius: AppRadii.lg,
              onTap: () => _showPlaylistCurriculumSheet(context, playlist),
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Playlist Cover with Count Overlay
                    Stack(
                      children: [
                        ClipRRect(
                          borderRadius: AppRadii.md,
                          child: Container(
                            width: 96,
                            height: 64,
                            color: AppColors.surfaceRaised(context),
                            child: playlist.thumbnailUrl != null && playlist.thumbnailUrl!.isNotEmpty
                                ? Image.network(
                                    playlist.thumbnailUrl!,
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, __, ___) => const Center(
                                      child: Icon(Icons.playlist_play_rounded, size: 32),
                                    ),
                                  )
                                : const Center(child: Icon(Icons.playlist_play_rounded, size: 32)),
                          ),
                        ),
                        Positioned(
                          bottom: 4,
                          right: 4,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.black87,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.playlist_play_rounded, size: 10, color: Colors.white),
                                const SizedBox(width: 2),
                                Text(
                                  '${playlist.videoCount}',
                                  style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w700),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(width: 12),

                    // Details
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            playlist.title,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: AppTypography.bodySm.copyWith(fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            playlist.channelName ?? 'YouTube Channel',
                            style: AppTypography.caption.copyWith(
                              fontSize: 11,
                              color: AppColors.textMuted(context),
                            ),
                          ),
                          const SizedBox(height: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.primarySubtle(context),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              '${playlist.videoCount} lessons',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                color: AppColors.primary(context),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Actions Menu
                    PopupMenuButton<String>(
                      icon: Icon(Icons.more_vert_rounded, size: 18, color: AppColors.textMuted(context)),
                      onSelected: (val) {
                        if (val == 'open_youtube') {
                          _openPlaylistUrl(playlist.effectivePlaylistId);
                        } else if (val == 'delete') {
                          _confirmDeletePlaylist(context, playlist);
                        }
                      },
                      itemBuilder: (ctx) => [
                        const PopupMenuItem(
                          value: 'open_youtube',
                          child: Row(
                            children: [
                              Icon(Icons.open_in_new_rounded, size: 16),
                              SizedBox(width: 8),
                              Text('Open in YouTube', style: TextStyle(fontSize: 13)),
                            ],
                          ),
                        ),
                        PopupMenuItem(
                          value: 'delete',
                          child: Row(
                            children: [
                              Icon(Icons.delete_outline_rounded, size: 16, color: AppColors.danger),
                              SizedBox(width: 8),
                              Text('Remove Playlist', style: TextStyle(color: AppColors.danger, fontSize: 13)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
