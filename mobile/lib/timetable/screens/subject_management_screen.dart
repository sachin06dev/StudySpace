import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/subject.dart';
import '../providers/timetable_provider.dart';
import '../../attendance/providers/attendance_provider.dart';
import '../../core/design_system/design_system.dart';

class SubjectManagementScreen extends StatefulWidget {
  const SubjectManagementScreen({super.key});

  @override
  State<SubjectManagementScreen> createState() => _SubjectManagementScreenState();
}

class _SubjectManagementScreenState extends State<SubjectManagementScreen> {
  bool _showArchived = false;

  void _showSubjectDialog(BuildContext context, [Subject? existing]) {
    final nameCtrl = TextEditingController(text: existing?.name ?? '');
    final codeCtrl = TextEditingController(text: existing?.code ?? '');
    final facultyCtrl = TextEditingController(text: existing?.faculty ?? '');
    final roomCtrl = TextEditingController(text: existing?.defaultRoom ?? '');
    final targetCtrl = TextEditingController(
      text: existing?.targetPercentage != null ? '${existing!.targetPercentage!.toInt()}' : '',
    );
    final baseAttCtrl = TextEditingController(
      text: existing != null && existing.baselineAttended > 0 ? '${existing.baselineAttended}' : '',
    );
    final baseTotCtrl = TextEditingController(
      text: existing != null && existing.baselineTotal > 0 ? '${existing.baselineTotal}' : '',
    );
    String classType = existing?.classType ?? 'theory';

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: Theme.of(ctx).colorScheme.surface,
          shape: RoundedRectangleBorder(borderRadius: AppRadii.xl),
          title: Text(
            existing != null ? 'Edit Subject' : 'Add Subject',
            style: AppTypography.h3,
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                AppTextField(
                  controller: nameCtrl,
                  label: 'Subject Name*',
                  hint: 'e.g. Distributed Systems',
                ),
                const SizedBox(height: AppSpacing.md),
                Row(
                  children: [
                    Expanded(
                      child: AppTextField(
                        controller: codeCtrl,
                        label: 'Code',
                        hint: 'CS401',
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        initialValue: classType,
                        decoration: InputDecoration(
                          labelText: 'Type',
                          border: OutlineInputBorder(
                            borderRadius: AppRadii.md,
                          ),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                        ),
                        items: const [
                          DropdownMenuItem(value: 'theory', child: Text('Theory')),
                          DropdownMenuItem(value: 'lab', child: Text('Lab')),
                          DropdownMenuItem(value: 'tutorial', child: Text('Tutorial')),
                          DropdownMenuItem(value: 'other', child: Text('Other')),
                        ],
                        onChanged: (val) {
                          if (val != null) setDialogState(() => classType = val);
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.md),
                Row(
                  children: [
                    Expanded(
                      child: AppTextField(
                        controller: roomCtrl,
                        label: 'Default Room',
                        hint: 'Hall B',
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: AppTextField(
                        controller: facultyCtrl,
                        label: 'Faculty',
                        hint: 'Dr. Smith',
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.md),
                AppTextField(
                  controller: targetCtrl,
                  keyboardType: TextInputType.number,
                  label: 'Target % (leave blank to inherit default)',
                  hint: '75',
                ),
                const SizedBox(height: AppSpacing.md),
                Row(
                  children: [
                    Expanded(
                      child: AppTextField(
                        controller: baseAttCtrl,
                        keyboardType: TextInputType.number,
                        label: 'Baseline Attended',
                        hint: '0',
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: AppTextField(
                        controller: baseTotCtrl,
                        keyboardType: TextInputType.number,
                        label: 'Baseline Total',
                        hint: '0',
                      ),
                    ),
                  ],
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
              onPressed: () async {
                if (nameCtrl.text.trim().isEmpty) return;

                final target = double.tryParse(targetCtrl.text.trim());
                final baseAtt = int.tryParse(baseAttCtrl.text.trim()) ?? 0;
                final baseTot = int.tryParse(baseTotCtrl.text.trim()) ?? 0;

                final timetableProvider = context.read<TimetableProvider>();

                if (existing != null) {
                  final updated = Subject(
                    id: existing.id,
                    userId: existing.userId,
                    semesterId: existing.semesterId,
                    name: nameCtrl.text.trim(),
                    code: codeCtrl.text.trim().isNotEmpty ? codeCtrl.text.trim() : null,
                    faculty: facultyCtrl.text.trim().isNotEmpty ? facultyCtrl.text.trim() : null,
                    defaultRoom: roomCtrl.text.trim().isNotEmpty ? roomCtrl.text.trim() : null,
                    classType: classType,
                    targetPercentage: target,
                    baselineAttended: baseAtt,
                    baselineTotal: baseTot,
                    isArchived: existing.isArchived,
                  );
                  await timetableProvider.updateSubject(updated);
                } else {
                  await timetableProvider.addSubject(
                    name: nameCtrl.text.trim(),
                    code: codeCtrl.text.trim().isNotEmpty ? codeCtrl.text.trim() : null,
                    faculty: facultyCtrl.text.trim().isNotEmpty ? facultyCtrl.text.trim() : null,
                    defaultRoom: roomCtrl.text.trim().isNotEmpty ? roomCtrl.text.trim() : null,
                    classType: classType,
                    targetPercentage: target,
                    baselineAttended: baseAtt,
                    baselineTotal: baseTot,
                  );
                }

                if (context.mounted) {
                  await context.read<AttendanceProvider>().loadData(forceRefresh: true);
                }
                if (ctx.mounted) Navigator.of(ctx).pop();
              },
              child: const Text('Save'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _handleDeleteOrArchive(BuildContext context, Subject subject) async {
    final timetableProvider = context.read<TimetableProvider>();
    final attendanceProvider = context.read<AttendanceProvider>();

    final count = await timetableProvider.getAttendanceRecordCount(subject.id);

    if (!context.mounted) return;

    if (count > 0) {
      // Historical data exists -> Must Archive
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Archive Subject'),
          content: Text(
            '${subject.name} has $count recorded attendance log(s).\n\n'
            'To protect your attendance history and calculations, this subject cannot be permanently deleted. '
            'Archiving will remove its scheduled classes from your timetable while completely preserving your attendance data.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.warning,
                foregroundColor: Colors.white,
              ),
              onPressed: () async {
                Navigator.of(ctx).pop();
                await timetableProvider.archiveSubject(subject.id);
                await attendanceProvider.loadData(forceRefresh: true);
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('${subject.name} archived successfully')),
                  );
                }
              },
              child: const Text('Archive Subject'),
            ),
          ],
        ),
      );
    } else {
      // No historical data -> Safe hard delete
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Delete Subject'),
          content: Text(
            'Are you sure you want to permanently delete "${subject.name}"? '
            'This subject has no recorded attendance logs and will be permanently removed.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.error,
                foregroundColor: Colors.white,
              ),
              onPressed: () async {
                Navigator.of(ctx).pop();
                await timetableProvider.deleteSubject(subject.id);
                await attendanceProvider.loadData(forceRefresh: true);
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('${subject.name} deleted')),
                  );
                }
              },
              child: const Text('Delete Permanently'),
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final timetableProvider = context.watch<TimetableProvider>();
    final attendanceProvider = context.watch<AttendanceProvider>();

    final allSubjects = timetableProvider.subjects.isNotEmpty
        ? timetableProvider.subjects
        : attendanceProvider.subjects;

    final activeSubjects = allSubjects.where((s) => !s.isArchived).toList();
    final archivedSubjects = allSubjects.where((s) => s.isArchived).toList();
    final displaySubjects = _showArchived ? archivedSubjects : activeSubjects;

    return AppScaffold(
      title: 'Manage Subjects',
      actions: [
        if (archivedSubjects.isNotEmpty)
          IconButton(
            tooltip: _showArchived ? 'Show Active' : 'Show Archived (${archivedSubjects.length})',
            icon: Icon(
              _showArchived ? Icons.unarchive_outlined : Icons.archive_outlined,
              color: _showArchived ? AppColors.brandPrimary : null,
            ),
            onPressed: () {
              setState(() => _showArchived = !_showArchived);
            },
          ),
      ],
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.brandPrimary,
        onPressed: () => _showSubjectDialog(context),
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: displaySubjects.isEmpty
          ? AppEmptyState(
              icon: _showArchived ? Icons.archive_outlined : Icons.book_outlined,
              title: _showArchived ? 'No Archived Subjects' : 'No Subjects Added Yet',
              message: _showArchived
                  ? 'Subjects with historical records that you archive will show here.'
                  : 'Add your courses to manage classes and track attendance.',
              actionLabel: _showArchived ? null : 'Add Subject',
              onAction: _showArchived ? null : () => _showSubjectDialog(context),
            )
          : ListView.separated(
              padding: const EdgeInsets.all(AppSpacing.md),
              itemCount: displaySubjects.length,
              separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.sm),
              itemBuilder: (ctx, i) {
                final sub = displaySubjects[i];
                return AppCard(
                  child: ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Row(
                      children: [
                        Expanded(
                          child: Text(
                            sub.name,
                            style: AppTypography.bodyBold,
                          ),
                        ),
                        if (sub.isArchived)
                          const AppChip(
                            label: 'Archived',
                            variant: AppChipVariant.neutral,
                          ),
                      ],
                    ),
                    subtitle: Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(
                        '${sub.code ?? 'No Code'} · ${sub.classType.toUpperCase()}${sub.faculty != null ? ' · ${sub.faculty}' : ''}',
                        style: AppTypography.caption.copyWith(
                          color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                        ),
                      ),
                    ),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (sub.isArchived) ...[
                          IconButton(
                            icon: const Icon(Icons.unarchive_outlined, size: 20),
                            tooltip: 'Restore Subject',
                            onPressed: () async {
                              await timetableProvider.restoreSubject(sub.id);
                              await attendanceProvider.loadData(forceRefresh: true);
                            },
                          ),
                        ] else ...[
                          IconButton(
                            icon: const Icon(Icons.edit_outlined, size: 20),
                            onPressed: () => _showSubjectDialog(context, sub),
                          ),
                          IconButton(
                            icon: Icon(Icons.delete_outline, size: 20, color: AppColors.error),
                            onPressed: () => _handleDeleteOrArchive(context, sub),
                          ),
                        ],
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
