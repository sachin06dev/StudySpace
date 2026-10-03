import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../models/task.dart';
import '../providers/tasks_provider.dart';
import '../widgets/add_task_sheet.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/design_system/components/app_button.dart';
import '../../core/design_system/components/app_card.dart';
import '../../core/services/feedback_service.dart';

class TasksScreen extends StatefulWidget {
  const TasksScreen({super.key});

  @override
  State<TasksScreen> createState() => _TasksScreenState();
}

class _TasksScreenState extends State<TasksScreen> {
  bool _showCompleted = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TasksProvider>().loadTasks();
    });
  }

  void _showTaskDialog([Task? existing]) {
    FeedbackService.instance.selection();
    AddTaskSheet.show(context, existingTask: existing);
  }

  bool _isOverdueOrToday(String? dateStr) {
    if (dateStr == null) return false;
    final parsed = DateTime.tryParse(dateStr);
    if (parsed == null) return false;
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final taskDate = DateTime(parsed.year, parsed.month, parsed.day);
    return taskDate.isBefore(today) || taskDate.isAtSameMomentAs(today);
  }

  bool _isOverdue(String? dateStr) {
    if (dateStr == null) return false;
    final parsed = DateTime.tryParse(dateStr);
    if (parsed == null) return false;
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final taskDate = DateTime(parsed.year, parsed.month, parsed.day);
    return taskDate.isBefore(today);
  }

  bool _isToday(String? dateStr) {
    if (dateStr == null) return false;
    final parsed = DateTime.tryParse(dateStr);
    if (parsed == null) return false;
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final taskDate = DateTime(parsed.year, parsed.month, parsed.day);
    return taskDate.isAtSameMomentAs(today);
  }

  Color _priorityColor(String priority) {
    switch (priority.toLowerCase()) {
      case 'high':
        return const Color(0xFFEF4444);
      case 'medium':
        return const Color(0xFFF59E0B);
      case 'low':
      default:
        return const Color(0xFF94A3B8);
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<TasksProvider>();
    final allTasks = provider.tasks;

    final todayAndOverdue = allTasks
        .where((t) => !t.isCompleted && t.dueDate != null && _isOverdueOrToday(t.dueDate))
        .toList();
    final upcomingAndBacklog = allTasks
        .where((t) => !t.isCompleted && (t.dueDate == null || !_isOverdueOrToday(t.dueDate)))
        .toList();
    final completed = allTasks.where((t) => t.isCompleted).toList();

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Tasks & Deadlines',
          style: AppTypography.headingMd.copyWith(fontWeight: FontWeight.w800),
        ),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.add_rounded),
            tooltip: 'Add Task',
            onPressed: () => _showTaskDialog(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.primary(context),
        foregroundColor: Colors.white,
        tooltip: 'Add Task',
        onPressed: () => _showTaskDialog(),
        child: const Icon(Icons.add_rounded),
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () => provider.loadTasks(),
          child: allTasks.isEmpty
              ? _buildEmptyState(context)
              : ListView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  children: [
                    // Quick-Add Trigger Bar
                    _buildQuickAddTrigger(context),
                    const SizedBox(height: AppSpacing.md),

                    // Metrics Strip
                    _buildMetricsStrip(context, todayAndOverdue.length, upcomingAndBacklog.length, completed.length),
                    const SizedBox(height: AppSpacing.lg),

                    // 1. TODAY & OVERDUE
                    if (todayAndOverdue.isNotEmpty) ...[
                      _buildSectionHeader(
                        context,
                        title: 'TODAY & OVERDUE',
                        count: todayAndOverdue.length,
                        isAlert: todayAndOverdue.any((t) => _isOverdue(t.dueDate)),
                      ),
                      const SizedBox(height: AppSpacing.xs),
                      ...todayAndOverdue.map((t) => _buildTaskRow(context, t, provider)),
                      const SizedBox(height: AppSpacing.lg),
                    ],

                    // 2. UPCOMING & BACKLOG
                    if (upcomingAndBacklog.isNotEmpty) ...[
                      _buildSectionHeader(
                        context,
                        title: 'UPCOMING & BACKLOG',
                        count: upcomingAndBacklog.length,
                      ),
                      const SizedBox(height: AppSpacing.xs),
                      ...upcomingAndBacklog.map((t) => _buildTaskRow(context, t, provider)),
                      const SizedBox(height: AppSpacing.lg),
                    ],

                    // 3. COMPLETED (Collapsible)
                    if (completed.isNotEmpty) ...[
                      InkWell(
                        onTap: () => setState(() => _showCompleted = !_showCompleted),
                        borderRadius: AppRadii.md,
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    'COMPLETED (${completed.length})',
                                    style: AppTypography.caption.copyWith(
                                      color: AppColors.textMuted(context),
                                      fontWeight: FontWeight.w700,
                                      letterSpacing: 0.8,
                                    ),
                                  ),
                                ],
                              ),
                              Icon(
                                _showCompleted
                                    ? Icons.keyboard_arrow_up_rounded
                                    : Icons.keyboard_arrow_down_rounded,
                                size: 20,
                                color: AppColors.textMuted(context),
                              ),
                            ],
                          ),
                        ),
                      ),
                      if (_showCompleted) ...[
                        const SizedBox(height: AppSpacing.xs),
                        ...completed.map((t) => _buildTaskRow(context, t, provider)),
                      ],
                    ],
                    const SizedBox(height: 80), // Padding for FAB
                  ],
                ),
        ),
      ),
    );
  }

  Widget _buildQuickAddTrigger(BuildContext context) {
    return AppCard(
      onTap: () => _showTaskDialog(),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      child: Row(
        children: [
          Icon(Icons.add_circle_outline_rounded, size: 20, color: AppColors.primary(context)),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Text(
              'Add a task or assignment...',
              style: AppTypography.bodySm.copyWith(
                color: AppColors.textMuted(context),
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: AppColors.surfaceMuted(context),
              borderRadius: AppRadii.sm,
            ),
            child: Text(
              'New',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: AppColors.textMuted(context),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricsStrip(BuildContext context, int todayCount, int upcomingCount, int completedCount) {
    return Row(
      children: [
        Expanded(
          child: _buildMiniStat(
            context,
            label: 'Due Soon',
            count: todayCount,
            color: todayCount > 0 ? const Color(0xFFEF4444) : AppColors.textMuted(context),
          ),
        ),
        const SizedBox(width: AppSpacing.xs),
        Expanded(
          child: _buildMiniStat(
            context,
            label: 'Upcoming',
            count: upcomingCount,
            color: AppColors.textPrimary(context),
          ),
        ),
        const SizedBox(width: AppSpacing.xs),
        Expanded(
          child: _buildMiniStat(
            context,
            label: 'Completed',
            count: completedCount,
            color: AppColors.success,
          ),
        ),
      ],
    );
  }

  Widget _buildMiniStat(BuildContext context, {required String label, required int count, required Color color}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.card(context),
        borderRadius: AppRadii.md,
        border: Border.all(color: AppColors.border(context)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: AppTypography.caption.copyWith(
              color: AppColors.textMuted(context),
              fontSize: 11,
            ),
          ),
          Text(
            '$count',
            style: AppTypography.bodyBold.copyWith(
              fontSize: 13,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(BuildContext context, {required String title, required int count, bool isAlert = false}) {
    return Row(
      children: [
        Text(
          '$title ($count)',
          style: AppTypography.caption.copyWith(
            color: isAlert ? const Color(0xFFEF4444) : AppColors.textMuted(context),
            fontWeight: FontWeight.w700,
            letterSpacing: 0.8,
          ),
        ),
      ],
    );
  }

  Widget _buildTaskRow(BuildContext context, Task task, TasksProvider provider) {
    final dotColor = _priorityColor(task.priority);
    final isOverdue = !task.isCompleted && _isOverdue(task.dueDate);
    final isToday = !task.isCompleted && _isToday(task.dueDate);

    return Dismissible(
      key: ValueKey(task.id),
      direction: DismissDirection.horizontal,
      background: Container(
        alignment: Alignment.centerLeft,
        padding: const EdgeInsets.only(left: 20),
        decoration: BoxDecoration(
          color: AppColors.successBg(context),
          borderRadius: AppRadii.md,
        ),
        child: Icon(Icons.check_rounded, color: AppColors.successText(context)),
      ),
      secondaryBackground: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        decoration: BoxDecoration(
          color: AppColors.dangerBg(context),
          borderRadius: AppRadii.md,
        ),
        child: Icon(Icons.delete_outline_rounded, color: AppColors.dangerText(context)),
      ),
      confirmDismiss: (direction) async {
        if (direction == DismissDirection.startToEnd) {
          FeedbackService.instance.taskToggle(completed: !task.isCompleted);
          provider.toggleTaskStatus(task);
          return false;
        } else {
          return await showDialog<bool>(
            context: context,
            builder: (ctx) => AlertDialog(
              title: const Text('Delete Task'),
              content: Text('Delete "${task.title}"?'),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(ctx).pop(false),
                  child: const Text('Cancel'),
                ),
                TextButton(
                  onPressed: () => Navigator.of(ctx).pop(true),
                  child: Text('Delete', style: TextStyle(color: AppColors.dangerText(context))),
                ),
              ],
            ),
          );
        }
      },
      onDismissed: (direction) {
        if (direction == DismissDirection.endToStart) {
          provider.deleteTask(task.id);
        }
      },
      child: Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: AppCard(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          onTap: () => _showTaskDialog(task),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Checkbox with accessible tap target
              GestureDetector(
                onTap: () {
                  FeedbackService.instance.taskToggle(completed: !task.isCompleted);
                  provider.toggleTaskStatus(task);
                },
                child: Container(
                  width: 22,
                  height: 22,
                  margin: const EdgeInsets.only(top: 2, right: 10),
                  decoration: BoxDecoration(
                    color: task.isCompleted ? AppColors.primary(context) : Colors.transparent,
                    borderRadius: BorderRadius.circular(5),
                    border: Border.all(
                      color: task.isCompleted ? AppColors.primary(context) : AppColors.border(context),
                      width: 1.5,
                    ),
                  ),
                  child: task.isCompleted
                      ? const Icon(Icons.check_rounded, size: 16, color: Colors.white)
                      : null,
                ),
              ),

              // Title, description and due info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        // Priority Dot Indicator
                        Container(
                          width: 7,
                          height: 7,
                          margin: const EdgeInsets.only(right: 6),
                          decoration: BoxDecoration(
                            color: dotColor,
                            shape: BoxShape.circle,
                          ),
                        ),
                        Expanded(
                          child: Text(
                            task.title,
                            style: AppTypography.bodyBold.copyWith(
                              decoration: task.isCompleted ? TextDecoration.lineThrough : null,
                              color: task.isCompleted
                                  ? AppColors.textMuted(context)
                                  : AppColors.textPrimary(context),
                              fontSize: 14,
                            ),
                          ),
                        ),
                      ],
                    ),
                    if (task.description != null && task.description!.isNotEmpty) ...[
                      const SizedBox(height: 3),
                      Text(
                        task.description!,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: AppTypography.bodyXs.copyWith(
                          color: AppColors.textMuted(context),
                        ),
                      ),
                    ],
                    if (task.dueDate != null) ...[
                      const SizedBox(height: 5),
                      Row(
                        children: [
                          Icon(
                            isOverdue
                                ? Icons.warning_amber_rounded
                                : isToday
                                    ? Icons.schedule_rounded
                                    : Icons.calendar_today_outlined,
                            size: 12,
                            color: isOverdue
                                ? const Color(0xFFEF4444)
                                : isToday
                                    ? const Color(0xFFF59E0B)
                                    : AppColors.textMuted(context),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            isOverdue
                                ? 'Overdue · ${_formatDueDate(task.dueDate!)}'
                                : isToday
                                    ? 'Due Today'
                                    : _formatDueDate(task.dueDate!),
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: (isOverdue || isToday) ? FontWeight.w700 : FontWeight.w500,
                              color: isOverdue
                                  ? const Color(0xFFEF4444)
                                  : isToday
                                      ? const Color(0xFFF59E0B)
                                      : AppColors.textMuted(context),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),

              // Quick Action / Menu
              IconButton(
                icon: const Icon(Icons.more_vert_rounded, size: 18),
                color: AppColors.textMuted(context),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                onPressed: () => _showTaskDialog(task),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatDueDate(String dateStr) {
    final dt = DateTime.tryParse(dateStr);
    if (dt == null) return dateStr;
    return DateFormat('MMM d').format(dt);
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.primarySubtle(context),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.task_alt_rounded,
                size: 36,
                color: AppColors.primary(context),
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            Text(
              'No tasks on your study agenda',
              style: AppTypography.headingSm.copyWith(
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary(context),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Add assignments, reading lists, or exam prep items to stay on schedule.',
              textAlign: TextAlign.center,
              style: AppTypography.bodySm.copyWith(
                color: AppColors.textMuted(context),
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            AppButton(
              label: 'Add First Task',
              icon: Icons.add_rounded,
              onPressed: () => _showTaskDialog(),
            ),
          ],
        ),
      ),
    );
  }
}
