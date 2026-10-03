import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../models/semester.dart';
import '../providers/timetable_provider.dart';
import '../../attendance/providers/attendance_provider.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_icons.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/design_system/components/app_button.dart';
import '../../core/design_system/components/app_dialog.dart';
import '../../core/design_system/components/app_icon_button.dart';

class SemesterManagementScreen extends StatefulWidget {
  const SemesterManagementScreen({super.key});

  @override
  State<SemesterManagementScreen> createState() => _SemesterManagementScreenState();
}

class _SemesterManagementScreenState extends State<SemesterManagementScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TimetableProvider>().loadSemesters();
    });
  }

  void _showCreateSemesterDialog() {
    final nameCtrl = TextEditingController(text: 'Semester');
    DateTime startDate = DateTime.now();
    DateTime endDate = DateTime.now().add(const Duration(days: 120));
    final dateFmt = DateFormat('yyyy-MM-dd');

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: AppColors.card(context),
          shape: const RoundedRectangleBorder(borderRadius: AppRadii.lg),
          insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          title: Text(
            'Create New Semester',
            style: AppTypography.heading2.copyWith(
              color: AppColors.textPrimary(context),
            ),
          ),
          content: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 400),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  TextField(
                    controller: nameCtrl,
                    decoration: InputDecoration(
                      labelText: 'Semester Name*',
                      labelStyle: TextStyle(color: AppColors.textMuted(context)),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: AppRadii.md,
                        borderSide: BorderSide(color: AppColors.border(context)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: AppRadii.md,
                        borderSide: BorderSide(color: AppColors.primary(context), width: 2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  OutlinedButton.icon(
                    icon: Icon(AppIcons.attendance, size: 16, color: AppColors.primary(context)),
                    label: Text(
                      'Starts: ${dateFmt.format(startDate)}',
                      style: TextStyle(color: AppColors.textPrimary(context)),
                    ),
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(color: AppColors.border(context)),
                      shape: const RoundedRectangleBorder(borderRadius: AppRadii.md),
                      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                    ),
                    onPressed: () async {
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: startDate,
                        firstDate: DateTime(2020),
                        lastDate: DateTime(2035),
                      );
                      if (picked != null) setDialogState(() => startDate = picked);
                    },
                  ),
                  const SizedBox(height: 10),
                  OutlinedButton.icon(
                    icon: Icon(AppIcons.attendance, size: 16, color: AppColors.primary(context)),
                    label: Text(
                      'Ends: ${dateFmt.format(endDate)}',
                      style: TextStyle(color: AppColors.textPrimary(context)),
                    ),
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(color: AppColors.border(context)),
                      shape: const RoundedRectangleBorder(borderRadius: AppRadii.md),
                      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                    ),
                    onPressed: () async {
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: endDate,
                        firstDate: startDate,
                        lastDate: DateTime(2035),
                      );
                      if (picked != null) setDialogState(() => endDate = picked);
                    },
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: Text(
                'Cancel',
                style: TextStyle(color: AppColors.textMuted(context)),
              ),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary(context),
                foregroundColor: Colors.white,
                shape: const RoundedRectangleBorder(borderRadius: AppRadii.md),
              ),
              onPressed: () async {
                if (nameCtrl.text.trim().isEmpty) return;
                await context.read<TimetableProvider>().createSemester(
                      name: nameCtrl.text.trim(),
                      startDate: dateFmt.format(startDate),
                      endDate: dateFmt.format(endDate),
                      setActive: true,
                    );
                if (context.mounted) {
                  await context.read<AttendanceProvider>().loadData(forceRefresh: true);
                }
                if (ctx.mounted) Navigator.of(ctx).pop();
              },
              child: const Text('Create & Activate'),
            ),
          ],
        ),
      ),
    );
  }

  void _showEditSemesterDialog(Semester sem) {
    final nameCtrl = TextEditingController(text: sem.name);
    final dateFmt = DateFormat('yyyy-MM-dd');
    DateTime startDate = DateTime.tryParse(sem.startDate) ?? DateTime.now();
    DateTime endDate = DateTime.tryParse(sem.endDate) ?? DateTime.now().add(const Duration(days: 120));

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: AppColors.card(context),
          shape: const RoundedRectangleBorder(borderRadius: AppRadii.lg),
          insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          title: Text(
            'Edit Semester',
            style: AppTypography.heading2.copyWith(
              color: AppColors.textPrimary(context),
            ),
          ),
          content: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 400),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  TextField(
                    controller: nameCtrl,
                    decoration: InputDecoration(
                      labelText: 'Semester Name*',
                      labelStyle: TextStyle(color: AppColors.textMuted(context)),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: AppRadii.md,
                        borderSide: BorderSide(color: AppColors.border(context)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: AppRadii.md,
                        borderSide: BorderSide(color: AppColors.primary(context), width: 2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  OutlinedButton.icon(
                    icon: Icon(AppIcons.attendance, size: 16, color: AppColors.primary(context)),
                    label: Text(
                      'Starts: ${dateFmt.format(startDate)}',
                      style: TextStyle(color: AppColors.textPrimary(context)),
                    ),
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(color: AppColors.border(context)),
                      shape: const RoundedRectangleBorder(borderRadius: AppRadii.md),
                      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                    ),
                    onPressed: () async {
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: startDate,
                        firstDate: DateTime(2020),
                        lastDate: DateTime(2035),
                      );
                      if (picked != null) setDialogState(() => startDate = picked);
                    },
                  ),
                  const SizedBox(height: 10),
                  OutlinedButton.icon(
                    icon: Icon(AppIcons.attendance, size: 16, color: AppColors.primary(context)),
                    label: Text(
                      'Ends: ${dateFmt.format(endDate)}',
                      style: TextStyle(color: AppColors.textPrimary(context)),
                    ),
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(color: AppColors.border(context)),
                      shape: const RoundedRectangleBorder(borderRadius: AppRadii.md),
                      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                    ),
                    onPressed: () async {
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: endDate,
                        firstDate: startDate,
                        lastDate: DateTime(2035),
                      );
                      if (picked != null) setDialogState(() => endDate = picked);
                    },
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Historical attendance records remain preserved and linked to this semester.',
                    style: AppTypography.caption.copyWith(
                      color: AppColors.textMuted(context),
                    ),
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: Text(
                'Cancel',
                style: TextStyle(color: AppColors.textMuted(context)),
              ),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary(context),
                foregroundColor: Colors.white,
                shape: const RoundedRectangleBorder(borderRadius: AppRadii.md),
              ),
              onPressed: () async {
                final newName = nameCtrl.text.trim();
                if (newName.isEmpty) return;
                final newStart = dateFmt.format(startDate);
                final newEnd = dateFmt.format(endDate);
                if (endDate.isBefore(startDate)) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('End date cannot be before start date.')),
                  );
                  return;
                }

                if (newStart != sem.startDate || newEnd != sem.endDate) {
                  final proceed = await AppDialog.show(
                    context,
                    title: 'Adjust Semester Dates?',
                    message:
                        'Changing semester dates adjusts your academic calendar. Historical attendance linked to this semester will remain preserved.',
                    confirmLabel: 'Update Dates',
                    cancelLabel: 'Cancel',
                  );
                  if (proceed != true) return;
                }

                if (!mounted) return;
                final success = await context.read<TimetableProvider>().updateSemester(
                      semesterId: sem.id,
                      name: newName,
                      startDate: newStart,
                      endDate: newEnd,
                    );
                if (context.mounted && success) {
                  await context.read<AttendanceProvider>().loadData(forceRefresh: true);
                }
                if (ctx.mounted) Navigator.of(ctx).pop();
              },
              child: const Text('Save Changes'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _confirmDeleteSemester(Semester sem) async {
    final confirmed = await AppDialog.show(
      context,
      title: 'Delete semester?',
      message:
          'Are you sure you want to delete "${sem.name}"? This action cannot be undone and may remove or unlink associated subjects, timetables, and attendance records.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      confirmVariant: AppButtonVariant.danger,
      icon: AppIcons.trash,
      iconColor: AppColors.danger,
    );

    if (confirmed != true || !mounted) return;

    try {
      await context.read<TimetableProvider>().deleteSemester(sem.id);
      if (mounted) {
        await context.read<AttendanceProvider>().loadData(forceRefresh: true);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Semester "${sem.name}" deleted.'),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to delete semester: $e'),
            backgroundColor: AppColors.danger,
            behavior: SnackBarBehavior.floating,
            action: SnackBarAction(
              label: 'Retry',
              textColor: Colors.white,
              onPressed: () => _confirmDeleteSemester(sem),
            ),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<TimetableProvider>();
    final semesters = provider.allSemesters;
    final isAnyDeleting = provider.deletingSemesterId != null;

    return Scaffold(
      backgroundColor: AppColors.canvas(context),
      appBar: AppBar(
        backgroundColor: AppColors.canvas(context),
        elevation: 0,
        title: Text(
          'Semesters',
          style: AppTypography.heading2.copyWith(
            color: AppColors.textPrimary(context),
          ),
        ),
      ),
      body: SafeArea(
        child: semesters.isEmpty
            ? Center(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.school_outlined, size: 56, color: AppColors.textMuted(context)),
                      const SizedBox(height: 16),
                      Text(
                        'No semesters created yet.',
                        style: AppTypography.body.copyWith(
                          color: AppColors.textSecondary(context),
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 20),
                      AppButton(
                        label: 'Create Semester',
                        icon: AppIcons.plus,
                        isFullWidth: false,
                        onPressed: _showCreateSemesterDialog,
                      ),
                    ],
                  ),
                ),
              )
            : ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                itemCount: semesters.length,
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (ctx, i) {
                  final sem = semesters[i];
                  final isDeletingThis = provider.isDeletingSemester(sem.id);

                  return Card(
                    elevation: 0,
                    color: AppColors.card(context),
                    shape: RoundedRectangleBorder(
                      borderRadius: AppRadii.lg,
                      side: BorderSide(
                        color: sem.isActive
                            ? AppColors.primary(context)
                            : AppColors.border(context),
                        width: sem.isActive ? 2 : 1,
                      ),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          // Semester info (Name + Active badge + Dates)
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Row(
                                  children: [
                                    Flexible(
                                      child: Text(
                                        sem.name,
                                        style: AppTypography.heading3.copyWith(
                                          fontWeight: FontWeight.bold,
                                          color: AppColors.textPrimary(context),
                                        ),
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    if (sem.isActive) ...[
                                      const SizedBox(width: 8),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: AppColors.primary(context).withOpacity(0.12),
                                          borderRadius: AppRadii.sm,
                                        ),
                                        child: Text(
                                          'ACTIVE',
                                          style: TextStyle(
                                            color: AppColors.primary(context),
                                            fontWeight: FontWeight.bold,
                                            fontSize: 10,
                                            letterSpacing: 0.5,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '${sem.startDate} to ${sem.endDate}',
                                  style: AppTypography.caption.copyWith(
                                    color: AppColors.textMuted(context),
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          // Actions: Activate button (if inactive) + Delete button
                          if (!sem.isActive) ...[
                            TextButton(
                              onPressed: isAnyDeleting
                                  ? null
                                  : () async {
                                      await provider.switchActiveSemester(sem.id);
                                      if (mounted) {
                                        await context
                                            .read<AttendanceProvider>()
                                            .loadData(forceRefresh: true);
                                      }
                                    },
                              style: TextButton.styleFrom(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                minimumSize: const Size(44, 36),
                              ),
                              child: const Text('Activate'),
                            ),
                            const SizedBox(width: 4),
                          ],
                          AppIconButton(
                            icon: AppIcons.edit,
                            tooltip: 'Edit semester',
                            variant: AppIconButtonVariant.ghost,
                            color: AppColors.textSecondary(context),
                            size: 40,
                            iconSize: 20,
                            onPressed: isAnyDeleting
                                ? null
                                : () => _showEditSemesterDialog(sem),
                          ),
                          isDeletingThis
                              ? const SizedBox(
                                  width: 40,
                                  height: 40,
                                  child: Center(
                                    child: SizedBox(
                                      width: 18,
                                      height: 18,
                                      child: CircularProgressIndicator(strokeWidth: 2),
                                    ),
                                  ),
                                )
                              : AppIconButton(
                                  icon: AppIcons.trash,
                                  tooltip: 'Delete semester',
                                  variant: AppIconButtonVariant.ghost,
                                  color: AppColors.danger,
                                  size: 40,
                                  iconSize: 20,
                                  onPressed: isAnyDeleting
                                      ? null
                                      : () => _confirmDeleteSemester(sem),
                                ),
                        ],
                      ),
                    ),
                  );
                },
              ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showCreateSemesterDialog,
        backgroundColor: AppColors.primary(context),
        foregroundColor: Colors.white,
        child: const Icon(AppIcons.plus),
      ),
    );
  }
}
