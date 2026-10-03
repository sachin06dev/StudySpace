import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../models/task.dart';
import '../providers/tasks_provider.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/services/feedback_service.dart';

class AddTaskSheet extends StatefulWidget {
  final Task? existingTask;

  const AddTaskSheet({super.key, this.existingTask});

  static Future<void> show(BuildContext context, {Task? existingTask}) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => AddTaskSheet(existingTask: existingTask),
    );
  }

  @override
  State<AddTaskSheet> createState() => _AddTaskSheetState();
}

class _AddTaskSheetState extends State<AddTaskSheet> {
  final TextEditingController _titleCtrl = TextEditingController();
  final TextEditingController _descCtrl = TextEditingController();
  String _priority = 'medium';
  DateTime? _dueDate;
  bool _showDescription = false;

  final List<String> _priorities = ['low', 'medium', 'high'];

  @override
  void initState() {
    super.initState();
    if (widget.existingTask != null) {
      _titleCtrl.text = widget.existingTask!.title;
      _descCtrl.text = widget.existingTask!.description ?? '';
      _priority = widget.existingTask!.priority;
      if (widget.existingTask!.dueDate != null) {
        _dueDate = DateTime.tryParse(widget.existingTask!.dueDate!);
      }
      if (_descCtrl.text.isNotEmpty) {
        _showDescription = true;
      }
    }
  }

  @override
  void dispose() {
    _titleCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = AppColors.isDark(context);

    return Container(
      decoration: BoxDecoration(
        color: AppColors.card(context),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(AppRadii.xlVal)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.5 : 0.15),
            blurRadius: 20,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      padding: EdgeInsets.only(
        left: AppSpacing.lg,
        right: AppSpacing.lg,
        top: AppSpacing.md,
        bottom: MediaQuery.of(context).viewInsets.bottom + AppSpacing.xl,
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Drag handle
            Center(
              child: Container(
                width: 36,
                height: 4,
                margin: const EdgeInsets.only(bottom: AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.textMuted(context).withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  widget.existingTask != null ? 'Edit Task' : 'Quick Add Task',
                  style: AppTypography.heading3.copyWith(
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary(context),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded),
                  onPressed: () => Navigator.of(context).pop(),
                  color: AppColors.textMuted(context),
                ),
              ],
            ),

            const SizedBox(height: AppSpacing.sm),

            // Title input
            TextField(
              controller: _titleCtrl,
              autofocus: true,
              style: AppTypography.bodyBold.copyWith(fontSize: 16),
              decoration: InputDecoration(
                hintText: 'What do you need to study or complete?',
                hintStyle: AppTypography.body.copyWith(color: AppColors.textMuted(context)),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              ),
            ),

            const SizedBox(height: AppSpacing.md),

            // Priority Chips
            Row(
              children: [
                Text(
                  'PRIORITY:',
                  style: AppTypography.overline.copyWith(color: AppColors.textMuted(context)),
                ),
                const SizedBox(width: 10),
                ..._priorities.map((p) {
                  final isSelected = _priority == p;
                  Color chipColor;
                  if (p == 'high') {
                    chipColor = AppColors.danger;
                  } else if (p == 'medium') {
                    chipColor = AppColors.brandPrimary;
                  } else {
                    chipColor = AppColors.success;
                  }

                  return Padding(
                    padding: const EdgeInsets.only(right: 6.0),
                    child: ChoiceChip(
                      label: Text(
                        p[0].toUpperCase() + p.substring(1),
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                          color: isSelected ? Colors.white : AppColors.textPrimary(context),
                        ),
                      ),
                      selected: isSelected,
                      selectedColor: chipColor,
                      backgroundColor: AppColors.surfaceMuted(context),
                      side: BorderSide(
                        color: isSelected ? chipColor : AppColors.border(context),
                      ),
                      onSelected: (selected) {
                        if (selected) {
                          FeedbackService.instance.selection();
                          setState(() => _priority = p);
                        }
                      },
                    ),
                  );
                }),
              ],
            ),

            const SizedBox(height: AppSpacing.sm),

            // Due Date Row
            Row(
              children: [
                ActionChip(
                  avatar: const Icon(Icons.calendar_today_rounded, size: 14),
                  label: Text(
                    _dueDate != null
                        ? DateFormat('EEE, MMM d').format(_dueDate!)
                        : 'Set Due Date',
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                  ),
                  backgroundColor: _dueDate != null
                      ? AppColors.primary(context).withValues(alpha: 0.12)
                      : AppColors.surfaceMuted(context),
                  side: BorderSide(
                    color: _dueDate != null ? AppColors.primary(context) : AppColors.border(context),
                  ),
                  onPressed: () async {
                    FeedbackService.instance.selection();
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: _dueDate ?? DateTime.now(),
                      firstDate: DateTime.now().subtract(const Duration(days: 1)),
                      lastDate: DateTime.now().add(const Duration(days: 365)),
                    );
                    if (picked != null) {
                      setState(() => _dueDate = picked);
                    }
                  },
                ),
                if (_dueDate != null) ...[
                  const SizedBox(width: 4),
                  IconButton(
                    icon: const Icon(Icons.cancel, size: 18),
                    color: AppColors.textMuted(context),
                    onPressed: () => setState(() => _dueDate = null),
                  ),
                ],
                const Spacer(),
                TextButton(
                  onPressed: () => setState(() => _showDescription = !_showDescription),
                  child: Text(_showDescription ? '- Note' : '+ Note'),
                ),
              ],
            ),

            if (_showDescription) ...[
              const SizedBox(height: AppSpacing.sm),
              TextField(
                controller: _descCtrl,
                decoration: InputDecoration(
                  hintText: 'Additional details or notes...',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
                maxLines: 2,
              ),
            ],

            const SizedBox(height: AppSpacing.lg),

            ElevatedButton(
              onPressed: () async {
                final title = _titleCtrl.text.trim();
                if (title.isEmpty) return;

                FeedbackService.instance.taskToggle(completed: true);
                Navigator.of(context).pop();

                final provider = context.read<TasksProvider>();
                if (widget.existingTask != null) {
                  final updated = widget.existingTask!.copyWith(
                    title: title,
                    description: _descCtrl.text.trim().isNotEmpty ? _descCtrl.text.trim() : null,
                    priority: _priority,
                    dueDate: _dueDate != null ? DateFormat('yyyy-MM-dd').format(_dueDate!) : null,
                  );
                  await provider.updateTask(updated);
                } else {
                  await provider.addTask(
                    title: title,
                    description: _descCtrl.text.trim().isNotEmpty ? _descCtrl.text.trim() : null,
                    priority: _priority,
                    dueDate: _dueDate != null ? DateFormat('yyyy-MM-dd').format(_dueDate!) : null,
                  );
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary(context),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: Text(
                widget.existingTask != null ? 'Update Task' : 'Add Task',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
