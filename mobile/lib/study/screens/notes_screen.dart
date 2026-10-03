import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/design_system/components/app_button.dart';
import '../../core/design_system/components/app_dialog.dart';
import '../../core/design_system/components/app_empty_state.dart';
import '../../core/services/feedback_service.dart';
import '../models/saved_video.dart';
import '../models/video_note.dart';
import '../providers/study_provider.dart';
import 'video_player_screen.dart';

class NotesScreen extends StatefulWidget {
  const NotesScreen({super.key});

  @override
  State<NotesScreen> createState() => _NotesScreenState();
}

class _NotesScreenState extends State<NotesScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  String? _selectedVideoFilter; // null = all videos

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _navigateToVideoNote(BuildContext context, VideoNote note, List<SavedVideo> savedVideos) {
    FeedbackService.instance.selection();

    // 1. Find matched video in savedVideos
    SavedVideo? matchedVideo;
    try {
      matchedVideo = savedVideos.firstWhere(
        (v) => v.videoId == note.videoId || (v.youtubeVideoId != null && v.youtubeVideoId == note.videoId),
      );
    } catch (_) {
      matchedVideo = null;
    }

    // 2. If not found in personal library, construct a minimal SavedVideo
    matchedVideo ??= SavedVideo(
      id: 'transient-${note.videoId}',
      userId: note.userId,
      videoId: note.videoId,
      title: note.videoTitle ?? 'Lecture Video',
      status: 'in_progress',
      watchProgressSeconds: note.timestampSeconds,
    );

    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => VideoPlayerScreen(
          video: matchedVideo!,
          initialTimestampSeconds: note.timestampSeconds,
        ),
      ),
    );
  }

  void _showAddNoteDialog() {
    final provider = context.read<StudyProvider>();
    final contentCtrl = TextEditingController();
    final timeHrCtrl = TextEditingController(text: '0');
    final timeMinCtrl = TextEditingController(text: '0');
    final timeSecCtrl = TextEditingController(text: '0');
    String? selectedVideoId = provider.savedVideos.isNotEmpty ? provider.savedVideos.first.videoId : null;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: Theme.of(ctx).colorScheme.surface,
          shape: RoundedRectangleBorder(borderRadius: AppRadii.xl),
          title: Text(
            'New Timestamped Note',
            style: AppTypography.headingMd.copyWith(fontWeight: FontWeight.w700),
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (provider.savedVideos.isNotEmpty) ...[
                  Text(
                    'ASSOCIATED VIDEO',
                    style: AppTypography.overline.copyWith(
                      color: AppColors.textMuted(context),
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    initialValue: selectedVideoId,
                    isExpanded: true,
                    decoration: InputDecoration(
                      border: OutlineInputBorder(borderRadius: AppRadii.lg),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                    items: provider.savedVideos
                        .map(
                          (v) => DropdownMenuItem(
                            value: v.videoId,
                            child: Text(
                              v.title,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: AppTypography.bodySm,
                            ),
                          ),
                        )
                        .toList(),
                    onChanged: (val) {
                      if (val != null) setDialogState(() => selectedVideoId = val);
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                ],
                Text(
                  'TIMESTAMP OFFSET',
                  style: AppTypography.overline.copyWith(
                    color: AppColors.textMuted(context),
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: timeHrCtrl,
                        keyboardType: TextInputType.number,
                        decoration: InputDecoration(
                          labelText: 'Hours',
                          border: OutlineInputBorder(borderRadius: AppRadii.lg),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                        ),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.xs),
                    Expanded(
                      child: TextField(
                        controller: timeMinCtrl,
                        keyboardType: TextInputType.number,
                        decoration: InputDecoration(
                          labelText: 'Minutes',
                          border: OutlineInputBorder(borderRadius: AppRadii.lg),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                        ),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.xs),
                    Expanded(
                      child: TextField(
                        controller: timeSecCtrl,
                        keyboardType: TextInputType.number,
                        decoration: InputDecoration(
                          labelText: 'Seconds',
                          border: OutlineInputBorder(borderRadius: AppRadii.lg),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.md),
                Text(
                  'NOTE CONTENT',
                  style: AppTypography.overline.copyWith(
                    color: AppColors.textMuted(context),
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 6),
                TextField(
                  controller: contentCtrl,
                  maxLines: 3,
                  decoration: InputDecoration(
                    hintText: 'Key formula, explanation, or exam reminder...',
                    border: OutlineInputBorder(borderRadius: AppRadii.lg),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary(context),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: AppRadii.md),
              ),
              onPressed: () async {
                final content = contentCtrl.text.trim();
                if (content.isEmpty) return;

                final hr = int.tryParse(timeHrCtrl.text.trim()) ?? 0;
                final min = int.tryParse(timeMinCtrl.text.trim()) ?? 0;
                final sec = int.tryParse(timeSecCtrl.text.trim()) ?? 0;
                final totalSec = (hr * 3600) + (min * 60) + sec;
                final videoId = selectedVideoId ?? 'general-notes';

                FeedbackService.instance.light();
                await provider.addNote(
                  videoId: videoId,
                  timestampSeconds: totalSec,
                  content: content,
                );

                if (ctx.mounted) Navigator.of(ctx).pop();
              },
              child: const Text('Save Note'),
            ),
          ],
        ),
      ),
    );
  }

  void _confirmDeleteNote(BuildContext context, VideoNote note) {
    AppDialog.show(
      context,
      title: 'Delete Timestamp Note',
      description: 'Are you sure you want to delete this note? This action cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      confirmVariant: AppButtonVariant.danger,
      onConfirm: () async {
        FeedbackService.instance.medium();
        await context.read<StudyProvider>().deleteNote(note.id);
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Note deleted'),
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      },
    );
  }

  List<VideoNote> _filterNotes(List<VideoNote> notes) {
    return notes.where((note) {
      if (_selectedVideoFilter != null && note.videoId != _selectedVideoFilter) {
        return false;
      }
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final matchContent = note.content.toLowerCase().contains(q);
        final matchTitle = (note.videoTitle ?? '').toLowerCase().contains(q);
        if (!matchContent && !matchTitle) {
          return false;
        }
      }
      return true;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final provider = context.watch<StudyProvider>();
    final allNotes = provider.notes;
    final filteredNotes = _filterNotes(allNotes);

    // List of unique videos that have notes
    final videoOptions = <String, String>{};
    for (final note in allNotes) {
      if (note.videoId.isNotEmpty) {
        videoOptions[note.videoId] = note.videoTitle ?? 'Video (${note.videoId.substring(0, 5)}...)';
      }
    }

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Timestamped Notes',
              style: AppTypography.headingMd.copyWith(fontWeight: FontWeight.w700),
            ),
            Text(
              '${allNotes.length} lecture notes',
              style: AppTypography.caption.copyWith(
                color: AppColors.textMuted(context),
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_outlined),
            onPressed: () => provider.loadData(),
          ),
        ],
        elevation: 0,
      ),
      floatingActionButton: FloatingActionButton(
        tooltip: 'Add Note',
        backgroundColor: AppColors.primary(context),
        foregroundColor: Colors.white,
        onPressed: _showAddNoteDialog,
        child: const Icon(Icons.note_add_outlined, size: 22),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // 1. Search Bar
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 6),
              child: TextField(
                controller: _searchController,
                onChanged: (val) => setState(() => _searchQuery = val.trim()),
                decoration: InputDecoration(
                  hintText: 'Search notes by concept or formula...',
                  prefixIcon: Icon(
                    Icons.search_rounded,
                    size: 20,
                    color: AppColors.textMuted(context),
                  ),
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
                  fillColor: AppColors.surfaceMuted(context),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  border: OutlineInputBorder(
                    borderRadius: AppRadii.lg,
                    borderSide: BorderSide(
                      color: AppColors.border(context),
                    ),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: AppRadii.lg,
                    borderSide: BorderSide(
                      color: AppColors.border(context),
                    ),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: AppRadii.lg,
                    borderSide: BorderSide(
                      color: AppColors.primary(context),
                      width: 1.5,
                    ),
                  ),
                ),
              ),
            ),

            // 2. Video Filter Bar (if multiple videos exist)
            if (videoOptions.length > 1)
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                child: Row(
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(right: 6),
                      child: FilterChip(
                        label: const Text('All Videos'),
                        selected: _selectedVideoFilter == null,
                        onSelected: (_) {
                          FeedbackService.instance.selection();
                          setState(() => _selectedVideoFilter = null);
                        },
                        selectedColor: AppColors.primarySubtle(context),
                        checkmarkColor: AppColors.primary(context),
                      ),
                    ),
                    ...videoOptions.entries.map((entry) {
                      final isSelected = _selectedVideoFilter == entry.key;
                      return Padding(
                        padding: const EdgeInsets.only(right: 6),
                        child: FilterChip(
                          label: Text(
                            entry.value,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          selected: isSelected,
                          onSelected: (_) {
                            FeedbackService.instance.selection();
                            setState(() => _selectedVideoFilter = entry.key);
                          },
                          selectedColor: AppColors.primarySubtle(context),
                          checkmarkColor: AppColors.primary(context),
                        ),
                      );
                    }),
                  ],
                ),
              ),

            // 3. Notes List or Empty State
            Expanded(
              child: filteredNotes.isEmpty
                  ? Center(
                      child: AppEmptyState(
                        icon: Icons.edit_note_rounded,
                        title: _searchQuery.isNotEmpty || _selectedVideoFilter != null
                            ? 'No matching notes'
                            : 'No timestamped notes yet',
                        message: _searchQuery.isNotEmpty || _selectedVideoFilter != null
                            ? 'Try searching with a different term or clearing your video filter.'
                            : 'Capture key formulas, insights, and lecture segments while watching videos.',
                        actionLabel: _searchQuery.isNotEmpty ? null : 'Add First Note',
                        onAction: _searchQuery.isNotEmpty ? null : _showAddNoteDialog,
                      ),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.fromLTRB(16, 8, 16, 80),
                      itemCount: filteredNotes.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (ctx, i) {
                        final note = filteredNotes[i];
                        return _buildNoteCard(ctx, note, provider.savedVideos, isDark);
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNoteCard(
    BuildContext context,
    VideoNote note,
    List<SavedVideo> savedVideos,
    bool isDark,
  ) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.card(context),
        borderRadius: AppRadii.lg,
        border: Border.all(
          color: AppColors.border(context),
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: AppRadii.lg,
          onTap: () => _navigateToVideoNote(context, note, savedVideos),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Clickable Timestamp Button (Seeks to video)
                InkWell(
                  onTap: () => _navigateToVideoNote(context, note, savedVideos),
                  borderRadius: BorderRadius.circular(6),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                    decoration: BoxDecoration(
                      color: AppColors.primarySubtle(context),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: AppColors.primary(context).withValues(alpha: 0.3),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.play_arrow_rounded,
                          size: 14,
                          color: AppColors.primary(context),
                        ),
                        const SizedBox(width: 2),
                        Text(
                          note.formattedTimestamp,
                          style: TextStyle(
                            fontFamily: 'monospace',
                            fontWeight: FontWeight.w700,
                            fontSize: 12,
                            color: AppColors.primary(context),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 12),

                // Note Content & Video Title
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        note.content,
                        style: AppTypography.bodySm.copyWith(
                          fontWeight: FontWeight.w500,
                          color: AppColors.textPrimary(context),
                        ),
                      ),
                      if (note.videoTitle != null && note.videoTitle!.isNotEmpty) ...[
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Icon(
                              Icons.smart_display_outlined,
                              size: 13,
                              color: AppColors.textMuted(context),
                            ),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                note.videoTitle!,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: AppTypography.caption.copyWith(
                                  fontSize: 11,
                                  color: AppColors.textMuted(context),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),

                // Delete Action
                IconButton(
                  icon: Icon(
                    Icons.delete_outline_rounded,
                    size: 18,
                    color: AppColors.textMuted(context),
                  ),
                  tooltip: 'Delete Note',
                  onPressed: () => _confirmDeleteNote(context, note),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
