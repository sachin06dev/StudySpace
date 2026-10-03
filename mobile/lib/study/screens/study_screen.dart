import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/design_system/components/app_card.dart';
import '../../core/services/feedback_service.dart';
import '../../pomodoro/providers/pomodoro_provider.dart';
import '../../pomodoro/screens/pomodoro_screen.dart';
import '../../tasks/providers/tasks_provider.dart';
import '../../tasks/screens/tasks_screen.dart';
import '../providers/study_provider.dart';
import 'documents_screen.dart';
import 'notes_screen.dart';
import 'resources_screen.dart';
import 'video_library_screen.dart';

class StudyScreen extends StatefulWidget {
  const StudyScreen({super.key});

  @override
  State<StudyScreen> createState() => _StudyScreenState();
}

class _StudyScreenState extends State<StudyScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TasksProvider>().loadTasks();
      context.read<PomodoroProvider>().loadSessions();
      context.read<StudyProvider>().loadData();
    });
  }

  @override
  Widget build(BuildContext context) {
    final tasksProvider = context.watch<TasksProvider>();
    final pomodoroProvider = context.watch<PomodoroProvider>();
    final studyProvider = context.watch<StudyProvider>();

    final pendingTasks = tasksProvider.pendingTasks.length;
    final todayFocusSessions = pomodoroProvider.completedFocusSessionsToday;
    final savedVideosCount = studyProvider.savedVideos.length;
    final playlistsCount = studyProvider.savedPlaylists.length;
    final documentsCount = studyProvider.documents.length;
    final resourcesCount = studyProvider.resources.length;
    final notesCount = studyProvider.notes.length;

    final isTimerActive = pomodoroProvider.isRunning;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Study Hub',
          style: AppTypography.headingMd.copyWith(fontWeight: FontWeight.w800),
        ),
        elevation: 0,
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            await Future.wait([
              context.read<TasksProvider>().loadTasks(),
              context.read<PomodoroProvider>().loadSessions(),
              context.read<StudyProvider>().loadData(),
            ]);
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. Focus Hero Instrument
                _buildFocusHero(context, pomodoroProvider, isTimerActive),
                const SizedBox(height: AppSpacing.lg),

                // 2. LEARN & SYNTHESIZE Section
                _buildSectionLabel(context, 'LEARN & SYNTHESIZE'),
                const SizedBox(height: AppSpacing.sm),
                Row(
                  children: [
                    Expanded(
                      child: _buildStudyTile(
                        context,
                        title: 'Videos',
                        subtitle: '$savedVideosCount saved',
                        icon: Icons.video_library_outlined,
                        color: const Color(0xFF8B5CF6),
                        onTap: () {
                          FeedbackService.instance.selection();
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => const VideoLibraryScreen(initialTabIndex: 0),
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: _buildStudyTile(
                        context,
                        title: 'Playlists',
                        subtitle: '$playlistsCount series',
                        icon: Icons.playlist_play_rounded,
                        color: const Color(0xFF6366F1),
                        onTap: () {
                          FeedbackService.instance.selection();
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => const VideoLibraryScreen(initialTabIndex: 1),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.sm),
                _buildCompactRowTile(
                  context,
                  title: 'Timestamped Notes',
                  subtitle: '$notesCount lecture notes with video sync',
                  icon: Icons.edit_note_rounded,
                  color: AppColors.success,
                  countBadge: '$notesCount',
                  onTap: () {
                    FeedbackService.instance.selection();
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const NotesScreen()),
                    );
                  },
                ),
                const SizedBox(height: AppSpacing.sm),
                _buildCompactRowTile(
                  context,
                  title: 'Academic Vault',
                  subtitle: '$documentsCount files · PDFs, slides, and notes',
                  icon: Icons.folder_copy_outlined,
                  color: const Color(0xFFEC4899),
                  countBadge: '$documentsCount',
                  onTap: () {
                    FeedbackService.instance.selection();
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const DocumentsScreen()),
                    );
                  },
                ),
                const SizedBox(height: AppSpacing.lg),

                // 3. ORGANIZE & MANAGE Section
                _buildSectionLabel(context, 'ORGANIZE & MANAGE'),
                const SizedBox(height: AppSpacing.sm),
                _buildCompactRowTile(
                  context,
                  title: 'Tasks & Deadlines',
                  subtitle: pendingTasks == 0
                      ? 'All caught up · 0 pending'
                      : '$pendingTasks active assignment${pendingTasks > 1 ? 's' : ''}',
                  icon: Icons.check_circle_outline_rounded,
                  color: pendingTasks > 0 ? const Color(0xFFF59E0B) : AppColors.success,
                  countBadge: '$pendingTasks',
                  badgeColor: pendingTasks > 0 ? const Color(0xFFF59E0B) : AppColors.success,
                  onTap: () {
                    FeedbackService.instance.selection();
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const TasksScreen()),
                    );
                  },
                ),
                const SizedBox(height: AppSpacing.sm),
                _buildCompactRowTile(
                  context,
                  title: 'Resources & Reference Links',
                  subtitle: '$resourcesCount documentation and research links',
                  icon: Icons.language_rounded,
                  color: const Color(0xFF0284C7),
                  countBadge: '$resourcesCount',
                  onTap: () {
                    FeedbackService.instance.selection();
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const ResourcesScreen()),
                    );
                  },
                ),
                const SizedBox(height: AppSpacing.lg),

                // 4. TODAY'S PROGRESS SUMMARY
                _buildSectionLabel(context, "TODAY'S STUDY METRICS"),
                const SizedBox(height: AppSpacing.sm),
                Row(
                  children: [
                    Expanded(
                      child: AppCard(
                        padding: const EdgeInsets.all(AppSpacing.md),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: AppColors.primarySubtle(context),
                                borderRadius: AppRadii.md,
                              ),
                              child: Icon(Icons.timer_outlined, size: 20, color: AppColors.primary(context)),
                            ),
                            const SizedBox(width: AppSpacing.sm),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '$todayFocusSessions',
                                    style: AppTypography.headingSm.copyWith(
                                      color: AppColors.textPrimary(context),
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                  Text(
                                    'Focus Cycles',
                                    style: AppTypography.caption.copyWith(
                                      color: AppColors.textMuted(context),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: AppCard(
                        padding: const EdgeInsets.all(AppSpacing.md),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: AppColors.successBg(context),
                                borderRadius: AppRadii.md,
                              ),
                              child: Icon(Icons.task_alt_rounded, size: 20, color: AppColors.successText(context)),
                            ),
                            const SizedBox(width: AppSpacing.sm),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '${tasksProvider.completedTasks.length}',
                                    style: AppTypography.headingSm.copyWith(
                                      color: AppColors.textPrimary(context),
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                  Text(
                                    'Tasks Done',
                                    style: AppTypography.caption.copyWith(
                                      color: AppColors.textMuted(context),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.xl),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionLabel(BuildContext context, String label) {
    return Text(
      label,
      style: AppTypography.caption.copyWith(
        color: AppColors.textMuted(context),
        fontWeight: FontWeight.w700,
        letterSpacing: 0.8,
      ),
    );
  }

  Widget _buildFocusHero(
    BuildContext context,
    PomodoroProvider pomodoroProvider,
    bool isTimerActive,
  ) {
    final statusText = isTimerActive
        ? (pomodoroProvider.isPaused ? 'Focus Paused' : 'Focus Session Active')
        : 'Focus Session';
    final actionText = isTimerActive ? 'Open Timer' : 'Start Focus';

    return AppCard(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: isTimerActive
                      ? AppColors.warningBg(context)
                      : AppColors.primarySubtle(context),
                  borderRadius: AppRadii.full,
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color: isTimerActive ? Colors.orange : AppColors.primary(context),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      statusText.toUpperCase(),
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.6,
                        color: isTimerActive
                            ? AppColors.warningText(context)
                            : AppColors.primary(context),
                      ),
                    ),
                  ],
                ),
              ),
              if (isTimerActive) ...[
                Builder(
                  builder: (context) {
                    final mins = pomodoroProvider.remainingSeconds ~/ 60;
                    final secs = pomodoroProvider.remainingSeconds % 60;
                    final timerStr = '${mins.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
                    return Text(
                      timerStr,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        fontFeatures: const [FontFeature.tabularFigures()],
                        color: AppColors.textPrimary(context),
                      ),
                    );
                  },
                ),
              ],
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            'Precision Focus Instrument',
            style: AppTypography.headingSm.copyWith(
              color: AppColors.textPrimary(context),
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '25m focus intervals with synchronized logging to consistency metrics.',
            style: AppTypography.bodySm.copyWith(
              color: AppColors.textMuted(context),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          InkWell(
            onTap: () {
              FeedbackService.instance.selection();
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const PomodoroScreen()),
              );
            },
            borderRadius: AppRadii.md,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(
                color: AppColors.primary(context),
                borderRadius: AppRadii.md,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    isTimerActive ? Icons.timer_outlined : Icons.play_arrow_rounded,
                    size: 18,
                    color: Colors.white,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    actionText,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStudyTile(
    BuildContext context, {
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return AppCard(
      onTap: onTap,
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              borderRadius: AppRadii.md,
            ),
            child: Icon(icon, size: 20, color: color),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            title,
            style: AppTypography.bodyBold.copyWith(
              color: AppColors.textPrimary(context),
            ),
          ),
          const SizedBox(height: 2),
          Text(
            subtitle,
            style: AppTypography.caption.copyWith(
              color: AppColors.textMuted(context),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCompactRowTile(
    BuildContext context, {
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required String countBadge,
    Color? badgeColor,
    required VoidCallback onTap,
  }) {
    final bColor = badgeColor ?? AppColors.primary(context);

    return AppCard(
      onTap: onTap,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              borderRadius: AppRadii.md,
            ),
            child: Icon(icon, size: 20, color: color),
          ),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppTypography.bodyBold.copyWith(
                    color: AppColors.textPrimary(context),
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 1),
                Text(
                  subtitle,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppTypography.caption.copyWith(
                    color: AppColors.textMuted(context),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: AppSpacing.xs),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: bColor.withOpacity(0.12),
              borderRadius: AppRadii.full,
            ),
            child: Text(
              countBadge,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: bColor,
              ),
            ),
          ),
          const SizedBox(width: 4),
          Icon(Icons.chevron_right_rounded, size: 18, color: AppColors.textMuted(context)),
        ],
      ),
    );
  }
}
