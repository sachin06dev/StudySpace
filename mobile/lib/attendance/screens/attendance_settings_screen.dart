import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../auth/providers/auth_provider.dart';
import '../../core/database/database_helper.dart';
import '../../core/services/feedback_service.dart';
import '../../core/supabase/supabase_client.dart';
import '../../core/sync/sync_engine.dart';
import '../../core/theme/theme_provider.dart';
import '../providers/attendance_provider.dart';
import '../widgets/attendance_tokens.dart';
import '../../core/design_system/app_colors.dart';

/// SilverBook-inspired Attendance & Timetable Settings Screen.
/// Grouped into clean icon-led sections with a secure destructive action hierarchy.
class AttendanceSettingsScreen extends StatefulWidget {
  const AttendanceSettingsScreen({super.key});

  @override
  State<AttendanceSettingsScreen> createState() => _AttendanceSettingsScreenState();
}

class _AttendanceSettingsScreenState extends State<AttendanceSettingsScreen> {
  bool _upcomingClassReminders = true;
  bool _attendanceCheckInPrompts = true;

  void _showChangeTargetDialog(BuildContext context, AttendanceProvider provider) {
    final targetCtrl = TextEditingController(
      text: provider.defaultTarget.toStringAsFixed(0),
    );

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AttendanceTokens.card(ctx),
        shape: const RoundedRectangleBorder(borderRadius: AttendanceTokens.cardRadius),
        title: const Text('Default Target Percentage'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Subjects without a custom threshold will automatically inherit this target percentage.',
              style: TextStyle(fontSize: 13, color: AttendanceTokens.textMuted(ctx)),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: targetCtrl,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Target %',
                suffixText: '%',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              final newTarget = double.tryParse(targetCtrl.text.trim());
              if (newTarget != null && newTarget >= 0 && newTarget <= 100) {
                provider.setDefaultTarget(newTarget);
                final userId = SupabaseService.currentUserId;
                if (userId != null) {
                  await SupabaseService.client.from('user_settings').upsert({
                    'user_id': userId,
                    'default_attendance_target': newTarget,
                  });
                }
              }
              if (ctx.mounted) Navigator.of(ctx).pop();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AttendanceTokens.primaryBlue,
              foregroundColor: Colors.white,
            ),
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  Future<void> _confirmResetAttendanceData() async {
    FeedbackService.instance.medium();
    final bool? confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AttendanceTokens.card(ctx),
        shape: const RoundedRectangleBorder(borderRadius: AttendanceTokens.cardRadius),
        title: const Row(
          children: [
            Icon(Icons.warning_amber_rounded, color: AttendanceTokens.cancelled),
            SizedBox(width: 8),
            Text('Reset Attendance?'),
          ],
        ),
        content: Text(
          'This will permanently delete all marked attendance records for this semester.\n\nYour timetable slots and subject lists will be kept completely safe.\n\nAre you sure you want to proceed?',
          style: TextStyle(fontSize: 13.5, color: AttendanceTokens.textSecondary(ctx)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AttendanceTokens.absent,
              foregroundColor: Colors.white,
            ),
            child: const Text('Reset Records'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      final provider = context.read<AttendanceProvider>();
      final semId = provider.activeSemester?.id;
      if (semId != null) {
        final db = await DatabaseHelper.instance.database;
        await db.delete('cached_attendance_records', where: 'semester_id = ?', whereArgs: [semId]);
        if (SupabaseService.isAuthenticated) {
          await SupabaseService.client.from('attendance_records').delete().eq('semester_id', semId);
        }
        await provider.loadData(forceRefresh: true);
        FeedbackService.instance.selection();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Attendance records have been reset.')),
          );
        }
      }
    }
  }

  Future<void> _confirmDeleteStudyData() async {
    FeedbackService.instance.medium();
    final bool? confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AttendanceTokens.card(ctx),
        shape: const RoundedRectangleBorder(borderRadius: AttendanceTokens.cardRadius),
        title: const Row(
          children: [
            Icon(Icons.cleaning_services_rounded, color: AppColors.warning),
            SizedBox(width: 8),
            Text('Clear All Study Data?'),
          ],
        ),
        content: Text(
          'This will permanently delete all your attendance records, timetable slots, subjects, notes, and study tasks.\n\nYour account will stay logged in so you can start fresh.',
          style: TextStyle(fontSize: 13.5, color: AttendanceTokens.textSecondary(ctx)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.warning,
              foregroundColor: Colors.white,
            ),
            child: const Text('Clear All Data'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Clearing all study data...'),
          duration: Duration(seconds: 4),
        ),
      );

      final auth = context.read<AuthProvider>();
      final success = await auth.deleteStudyData();

      if (mounted) {
        if (!success) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(auth.errorMessage ?? 'Failed to delete study data. Please try again.'),
              backgroundColor: AttendanceTokens.absent,
            ),
          );
        } else {
          final provider = context.read<AttendanceProvider>();
          await provider.loadData(forceRefresh: true);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('All study data cleared successfully.'),
              backgroundColor: AttendanceTokens.present,
            ),
          );
        }
      }
    }
  }

  Future<void> _confirmDeleteAccount() async {
    FeedbackService.instance.heavy();
    final bool? confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AttendanceTokens.card(ctx),
        shape: const RoundedRectangleBorder(borderRadius: AttendanceTokens.cardRadius),
        title: const Row(
          children: [
            Icon(Icons.delete_forever_rounded, color: AttendanceTokens.absent),
            SizedBox(width: 8),
            Text('Delete Account?'),
          ],
        ),
        content: Text(
          'WARNING: This is a permanent and irreversible action.\n\nAll your subjects, timetables, attendance history, notes, and study data will be permanently wiped.\n\nDo you really want to delete your StudySpace account?',
          style: TextStyle(fontSize: 13.5, color: AttendanceTokens.textSecondary(ctx)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AttendanceTokens.absent,
              foregroundColor: Colors.white,
            ),
            child: const Text('Permanently Delete'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Permanently deleting account and all cloud data...'),
          duration: Duration(seconds: 4),
        ),
      );

      final auth = context.read<AuthProvider>();
      final success = await auth.deleteAccount();

      if (mounted) {
        if (!success) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(auth.errorMessage ?? 'Failed to delete account. Please try again.'),
              backgroundColor: AttendanceTokens.absent,
            ),
          );
        } else {
          Navigator.of(context).popUntil((route) => route.isFirst);
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final attendanceProvider = context.watch<AttendanceProvider>();
    final syncEngine = context.watch<SyncEngine>();
    final themeProvider = context.watch<ThemeProvider>();

    return Scaffold(
      backgroundColor: AttendanceTokens.bg(context),
      appBar: AppBar(
        backgroundColor: AttendanceTokens.bg(context),
        elevation: 0,
        title: Text(
          'Attendance Settings',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: AttendanceTokens.textPrimary(context),
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // SECTION: SYNC / BACKUP
              _buildSectionHeader('SYNC & BACKUP'),
              Container(
                decoration: BoxDecoration(
                  color: AttendanceTokens.card(context),
                  borderRadius: AttendanceTokens.cardRadius,
                  border: Border.all(color: AttendanceTokens.border(context)),
                ),
                child: Column(
                  children: [
                    ListTile(
                      leading: const Icon(Icons.cloud_sync_rounded, color: AttendanceTokens.primaryBlue),
                      title: const Text('Attendance Sync', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                      subtitle: Text(
                        syncEngine.state == SyncState.syncing
                            ? 'Syncing changes...'
                            : (syncEngine.pendingCount > 0
                                ? '${syncEngine.pendingCount} items pending sync'
                                : 'All changes synchronized'),
                        style: TextStyle(fontSize: 12, color: AttendanceTokens.textMuted(context)),
                      ),
                      trailing: TextButton(
                        onPressed: () {
                          FeedbackService.instance.selection();
                          syncEngine.processQueue();
                        },
                        child: const Text('Sync Now'),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // SECTION: ATTENDANCE THRESHOLDS
              _buildSectionHeader('ATTENDANCE RULES'),
              Container(
                decoration: BoxDecoration(
                  color: AttendanceTokens.card(context),
                  borderRadius: AttendanceTokens.cardRadius,
                  border: Border.all(color: AttendanceTokens.border(context)),
                ),
                child: Column(
                  children: [
                    ListTile(
                      leading: const Icon(Icons.tune_rounded, color: AttendanceTokens.primaryBlue),
                      title: const Text('Default Target', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                      subtitle: const Text('Baseline attendance requirement', style: TextStyle(fontSize: 12)),
                      trailing: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AttendanceTokens.primaryBlue.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          '${attendanceProvider.defaultTarget.toStringAsFixed(0)}%',
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                            color: AttendanceTokens.primaryBlue,
                          ),
                        ),
                      ),
                      onTap: () => _showChangeTargetDialog(context, attendanceProvider),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // SECTION: NOTIFICATIONS
              _buildSectionHeader('NOTIFICATIONS'),
              Container(
                decoration: BoxDecoration(
                  color: AttendanceTokens.card(context),
                  borderRadius: AttendanceTokens.cardRadius,
                  border: Border.all(color: AttendanceTokens.border(context)),
                ),
                child: Column(
                  children: [
                    SwitchListTile(
                      value: _upcomingClassReminders,
                      title: const Text('Upcoming Class Reminders', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                      subtitle: Text('10 minutes before class starts', style: TextStyle(fontSize: 12, color: AttendanceTokens.textMuted(context))),
                      onChanged: (v) => setState(() => _upcomingClassReminders = v),
                    ),
                    Divider(height: 1, color: AttendanceTokens.border(context)),
                    SwitchListTile(
                      value: _attendanceCheckInPrompts,
                      title: const Text('Attendance Check-In Prompts', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                      subtitle: Text('Prompt to mark attendance after class ends', style: TextStyle(fontSize: 12, color: AttendanceTokens.textMuted(context))),
                      onChanged: (v) => setState(() => _attendanceCheckInPrompts = v),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // SECTION: DISPLAY
              _buildSectionHeader('DISPLAY & THEME'),
              Container(
                decoration: BoxDecoration(
                  color: AttendanceTokens.card(context),
                  borderRadius: AttendanceTokens.cardRadius,
                  border: Border.all(color: AttendanceTokens.border(context)),
                ),
                child: Column(
                  children: [
                    ListTile(
                      leading: const Icon(Icons.brightness_4_rounded, color: AttendanceTokens.primaryBlue),
                      title: const Text('Theme Mode', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                      subtitle: Text(
                        themeProvider.themeMode == ThemeMode.dark
                            ? 'Dark theme active'
                            : (themeProvider.themeMode == ThemeMode.light
                                ? 'Light theme active'
                                : 'System default'),
                        style: TextStyle(fontSize: 12, color: AttendanceTokens.textMuted(context)),
                      ),
                      trailing: PopupMenuButton<ThemeMode>(
                        icon: const Icon(Icons.chevron_right_rounded),
                        onSelected: (mode) => themeProvider.setThemeMode(mode),
                        itemBuilder: (_) => const [
                          PopupMenuItem(value: ThemeMode.dark, child: Text('Dark (Recommended)')),
                          PopupMenuItem(value: ThemeMode.light, child: Text('Light')),
                          PopupMenuItem(value: ThemeMode.system, child: Text('System Default')),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 28),

              // SECTION: ACCOUNT & DATA (Destructive Hierarchy)
              _buildSectionHeader('ACCOUNT & DATA HIERARCHY'),
              Container(
                decoration: BoxDecoration(
                  color: AttendanceTokens.card(context),
                  borderRadius: AttendanceTokens.cardRadius,
                  border: Border.all(color: AttendanceTokens.border(context)),
                ),
                child: Column(
                  children: [
                    ListTile(
                      leading: const Icon(Icons.refresh_rounded, color: AttendanceTokens.cancelled),
                      title: const Text('Reset Attendance Records', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                      subtitle: Text('Deletes marked records but preserves subjects', style: TextStyle(fontSize: 12, color: AttendanceTokens.textMuted(context))),
                      onTap: _confirmResetAttendanceData,
                    ),
                    Divider(height: 1, color: AttendanceTokens.border(context)),
                    ListTile(
                      leading: const Icon(Icons.cleaning_services_rounded, color: AppColors.warning),
                      title: const Text('Clear All Study Data', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.warning)),
                      subtitle: Text('Wipes attendance, timetable, notes & keeps account', style: TextStyle(fontSize: 12, color: AttendanceTokens.textMuted(context))),
                      onTap: _confirmDeleteStudyData,
                    ),
                    Divider(height: 1, color: AttendanceTokens.border(context)),
                    ListTile(
                      leading: const Icon(Icons.delete_forever_rounded, color: AttendanceTokens.absent),
                      title: const Text('Delete Account', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AttendanceTokens.absent)),
                      subtitle: Text('Permanently wipes all student data and credentials', style: TextStyle(fontSize: 12, color: AttendanceTokens.textMuted(context))),
                      onTap: _confirmDeleteAccount,
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w800,
          letterSpacing: 1.0,
          color: AttendanceTokens.textMuted(context),
        ),
      ),
    );
  }
}
