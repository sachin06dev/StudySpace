import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../analytics/screens/analytics_screen.dart';
import '../../auth/providers/auth_provider.dart';
import '../../attendance/providers/attendance_provider.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/design_system/components/app_button.dart';
import '../../core/design_system/components/app_card.dart';
import '../../core/design_system/components/app_dialog.dart';
import '../../core/services/feedback_service.dart';
import '../../core/supabase/supabase_client.dart';
import '../../core/config/env_config.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/utils/user_name_resolver.dart';
import '../../timetable/screens/semester_management_screen.dart';
import '../../core/updater/update_dialog.dart';
import '../../core/updater/update_model.dart';
import '../../core/updater/updater_service.dart';
import 'devices_sessions_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _enableClassReminders = true;
  bool _enableAttendancePrompts = true;
  bool _enableMorningSummary = true;
  bool _isCheckingUpdate = false;

  Future<void> _manualCheckForUpdates(BuildContext context) async {
    if (_isCheckingUpdate) return;
    setState(() => _isCheckingUpdate = true);

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Checking for StudySpace updates...'),
        duration: Duration(seconds: 1),
      ),
    );

    try {
      final res = await UpdaterService.instance.checkForUpdates(force: true);
      if (!mounted) return;

      if (res.hasUpdate && res.latestRelease != null) {
        UpdateDialog.show(
          context,
          manifest: res.latestRelease!,
          isMandatory: res.isMandatory,
          currentBuild: res.currentVersion.versionCode,
        );
      } else if (res.errorMessage != null && res.errorMessage!.isNotEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Update check: ${res.errorMessage}'),
            backgroundColor: AppColors.warning,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              "You're using the latest version of StudySpace (v${res.currentVersion.versionName}).",
            ),
            backgroundColor: AppColors.success,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to check for updates: $e'),
            backgroundColor: AppColors.danger,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isCheckingUpdate = false);
      }
    }
  }

  void _showChangeTargetDialog(BuildContext context, AttendanceProvider provider) {
    final targetCtrl = TextEditingController(
      text: provider.defaultTarget.toStringAsFixed(0),
    );

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Default Attendance Target'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Subjects without a custom target will inherit this threshold.',
              style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted(ctx)),
            ),
            const SizedBox(height: AppSpacing.md),
            TextField(
              controller: targetCtrl,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Target %',
                suffixText: '%',
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
                // Persist to user_settings in Supabase
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
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  Future<void> _showApiEndpointDialog(BuildContext context) async {
    final currentUrl = await EnvConfig.getEffectiveWebApiBaseUrl();
    final urlCtrl = TextEditingController(text: currentUrl);

    if (!context.mounted) return;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Backend API Endpoint'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Configures where AI Timetable scans and server APIs connect. Defaults to production.',
              style: TextStyle(fontSize: 13),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: urlCtrl,
              decoration: const InputDecoration(
                labelText: 'API Base URL',
                hintText: 'https://studyspace4u.vercel.app',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 8),
            TextButton.icon(
              onPressed: () {
                urlCtrl.text = EnvConfig.webApiBaseUrl;
              },
              icon: const Icon(Icons.restore, size: 16),
              label: const Text('Reset to Production (Default)'),
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
              final newUrl = urlCtrl.text.trim();
              if (newUrl == EnvConfig.webApiBaseUrl || newUrl.isEmpty) {
                await EnvConfig.setCustomWebApiBaseUrl(null);
              } else {
                await EnvConfig.setCustomWebApiBaseUrl(newUrl);
              }
              if (ctx.mounted) {
                Navigator.of(ctx).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('API endpoint set to: ${newUrl.isEmpty ? EnvConfig.webApiBaseUrl : newUrl}')),
                );
                setState(() {});
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  void _confirmSignOut(BuildContext context) {
    AppDialog.show(
      context,
      title: 'Sign Out',
      message: 'Are you sure you want to sign out of StudySpace?',
      confirmLabel: 'Sign Out',
      cancelLabel: 'Cancel',
      confirmVariant: AppButtonVariant.danger,
      icon: Icons.logout_rounded,
      iconColor: AppColors.danger,
      onConfirm: () {
        context.read<AuthProvider>().signOut();
      },
    );
  }

  void _confirmDeleteData(BuildContext context) {
    AppDialog.show(
      context,
      title: 'Clear All Study Data?',
      message:
          'This will permanently delete all your attendance records, timetable slots, subjects, notes, and study tasks.\n\nYour account and login credentials will remain active, so you can start fresh.',
      confirmLabel: 'Clear All Data',
      cancelLabel: 'Cancel',
      confirmVariant: AppButtonVariant.danger,
      icon: Icons.cleaning_services_rounded,
      iconColor: AppColors.warning,
      onConfirm: () async {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Clearing all study data...'),
            duration: Duration(seconds: 4),
          ),
        );
        final auth = context.read<AuthProvider>();
        final success = await auth.deleteStudyData();
        if (context.mounted) {
          if (!success) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(auth.errorMessage ?? 'Failed to delete study data. Please try again.'),
                backgroundColor: AppColors.danger,
              ),
            );
          } else {
            try {
              context.read<AttendanceProvider>().loadData(forceRefresh: true);
            } catch (_) {}
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('All study data cleared successfully. Starting fresh!'),
                backgroundColor: AppColors.success,
              ),
            );
          }
        }
      },
    );
  }

  void _confirmDeleteAccount(BuildContext context) {
    AppDialog.show(
      context,
      title: 'Permanently Delete Account?',
      message:
          'WARNING: This is a permanent and irreversible action.\n\nAll your timetables, subjects, attendance history, notes, documents, and credentials will be permanently deleted from Supabase.\n\nYou will not be able to log in with this account again.',
      confirmLabel: 'Permanently Delete',
      cancelLabel: 'Cancel',
      confirmVariant: AppButtonVariant.danger,
      icon: Icons.delete_forever_rounded,
      iconColor: AppColors.danger,
      onConfirm: () async {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Permanently deleting account from Supabase...'),
            duration: Duration(seconds: 4),
          ),
        );
        final auth = context.read<AuthProvider>();
        final success = await auth.deleteAccount();
        if (context.mounted) {
          if (!success) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(auth.errorMessage ?? 'Failed to delete account from cloud. Please try again.'),
                backgroundColor: AppColors.danger,
              ),
            );
          } else {
            Navigator.of(context).popUntil((route) => route.isFirst);
          }
        }
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final attendanceProvider = context.watch<AttendanceProvider>();
    final themeProvider = context.watch<ThemeProvider>();
    final user = authProvider.user;
    final activeSem = attendanceProvider.activeSemester;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile & Settings'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // User info header
              AppCard(
                padding: const EdgeInsets.all(20),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 28,
                      backgroundColor: AppColors.primary(context).withValues(alpha: 0.15),
                      child: Icon(
                        Icons.person_rounded,
                        size: 32,
                        color: AppColors.primary(context),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            UserNameResolver.resolveDisplayName(user),
                            style: AppTypography.heading3.copyWith(
                              color: AppColors.textPrimary(context),
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          if (user?.email != null) ...[
                            const SizedBox(height: 2),
                            Text(
                              user!.email!,
                              style: AppTypography.caption.copyWith(
                                color: AppColors.textMuted(context),
                              ),
                            ),
                          ],
                          const SizedBox(height: 4),
                          Text(
                            activeSem != null ? 'Active: ${activeSem.name}' : 'No active semester',
                            style: AppTypography.caption.copyWith(
                              color: AppColors.primary(context),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Appearance & Theme Selector
              Text(
                'APPEARANCE & THEME',
                style: AppTypography.overline.copyWith(
                  color: AppColors.textMuted(context),
                ),
              ),
              const SizedBox(height: 8),
              AppCard(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.palette_outlined,
                          size: 20,
                          color: AppColors.primary(context),
                        ),
                        const SizedBox(width: 10),
                        Text(
                          'Theme Mode',
                          style: AppTypography.bodyBold.copyWith(
                            color: AppColors.textPrimary(context),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    // Segmented Theme Selection
                    Row(
                      children: [
                        _buildThemeOption(
                          context: context,
                          label: 'System',
                          icon: Icons.brightness_auto_rounded,
                          mode: ThemeMode.system,
                          currentMode: themeProvider.themeMode,
                          onTap: () => themeProvider.setThemeMode(ThemeMode.system),
                        ),
                        const SizedBox(width: 10),
                        _buildThemeOption(
                          context: context,
                          label: 'Light',
                          icon: Icons.light_mode_rounded,
                          mode: ThemeMode.light,
                          currentMode: themeProvider.themeMode,
                          onTap: () => themeProvider.setThemeMode(ThemeMode.light),
                        ),
                        const SizedBox(width: 10),
                        _buildThemeOption(
                          context: context,
                          label: 'Dark',
                          icon: Icons.dark_mode_rounded,
                          mode: ThemeMode.dark,
                          currentMode: themeProvider.themeMode,
                          onTap: () => themeProvider.setThemeMode(ThemeMode.dark),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Analytics & Performance
              Text(
                'ANALYTICS & INSIGHTS',
                style: AppTypography.overline.copyWith(
                  color: AppColors.textMuted(context),
                ),
              ),
              const SizedBox(height: 8),
              AppCard(
                padding: EdgeInsets.zero,
                child: ListTile(
                  leading: const Icon(Icons.insights_rounded, color: Color(0xFF6366F1)),
                  title: Text(
                    'Analytics & Progress',
                    style: AppTypography.bodyBold.copyWith(color: AppColors.textPrimary(context)),
                  ),
                  subtitle: Text(
                    'Consistency score, heatmap, and study rhythm',
                    style: AppTypography.caption.copyWith(color: AppColors.textMuted(context)),
                  ),
                  trailing: Icon(Icons.chevron_right, color: AppColors.textMuted(context)),
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const AnalyticsScreen()),
                    );
                  },
                ),
              ),

              const SizedBox(height: 24),

              // Academic Settings
              Text(
                'ACADEMIC PREFERENCES',
                style: AppTypography.overline.copyWith(
                  color: AppColors.textMuted(context),
                ),
              ),
              const SizedBox(height: 8),
              AppCard(
                padding: EdgeInsets.zero,
                child: Column(
                  children: [
                    ListTile(
                      leading: Icon(Icons.percent_rounded, color: AppColors.primary(context)),
                      title: Text(
                        'Attendance Target',
                        style: AppTypography.bodyBold.copyWith(color: AppColors.textPrimary(context)),
                      ),
                      subtitle: Text(
                        '${attendanceProvider.defaultTarget.toStringAsFixed(0)}% minimum',
                        style: AppTypography.caption.copyWith(color: AppColors.textMuted(context)),
                      ),
                      trailing: Icon(Icons.chevron_right, color: AppColors.textMuted(context)),
                      onTap: () => _showChangeTargetDialog(context, attendanceProvider),
                    ),
                    Divider(height: 1, color: AppColors.border(context)),
                    ListTile(
                      leading: Icon(Icons.school_outlined, color: AppColors.primary(context)),
                      title: Text(
                        'Active Semester',
                        style: AppTypography.bodyBold.copyWith(color: AppColors.textPrimary(context)),
                      ),
                      subtitle: Text(
                        activeSem?.name ?? 'Not set',
                        style: AppTypography.caption.copyWith(color: AppColors.textMuted(context)),
                      ),
                      trailing: Icon(Icons.chevron_right, color: AppColors.textMuted(context)),
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => const SemesterManagementScreen()),
                        );
                      },
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Notification Toggles
              Text(
                'NOTIFICATIONS',
                style: AppTypography.overline.copyWith(
                  color: AppColors.textMuted(context),
                ),
              ),
              const SizedBox(height: 8),
              AppCard(
                padding: EdgeInsets.zero,
                child: Column(
                  children: [
                    SwitchListTile(
                      value: _enableClassReminders,
                      title: Text(
                        'Class Reminders',
                        style: AppTypography.bodyBold.copyWith(color: AppColors.textPrimary(context)),
                      ),
                      subtitle: Text(
                        '10 minutes before class starts',
                        style: AppTypography.caption.copyWith(color: AppColors.textMuted(context)),
                      ),
                      activeColor: AppColors.primary(context),
                      onChanged: (val) => setState(() => _enableClassReminders = val),
                    ),
                    Divider(height: 1, color: AppColors.border(context)),
                    SwitchListTile(
                      value: _enableAttendancePrompts,
                      title: Text(
                        'Attendance Prompts',
                        style: AppTypography.bodyBold.copyWith(color: AppColors.textPrimary(context)),
                      ),
                      subtitle: Text(
                        'Check-in after class ends',
                        style: AppTypography.caption.copyWith(color: AppColors.textMuted(context)),
                      ),
                      activeColor: AppColors.primary(context),
                      onChanged: (val) => setState(() => _enableAttendancePrompts = val),
                    ),
                    Divider(height: 1, color: AppColors.border(context)),
                    SwitchListTile(
                      value: _enableMorningSummary,
                      title: Text(
                        'Daily Morning Digest',
                        style: AppTypography.bodyBold.copyWith(color: AppColors.textPrimary(context)),
                      ),
                      subtitle: Text(
                        'Schedule preview at 7:30 AM',
                        style: AppTypography.caption.copyWith(color: AppColors.textMuted(context)),
                      ),
                      activeColor: AppColors.primary(context),
                      onChanged: (val) => setState(() => _enableMorningSummary = val),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Interaction & Feedback
              Text(
                'INTERACTION & FEEDBACK',
                style: AppTypography.overline.copyWith(
                  color: AppColors.textMuted(context),
                ),
              ),
              const SizedBox(height: 8),
              AppCard(
                padding: EdgeInsets.zero,
                child: Consumer<FeedbackService>(
                  builder: (context, feedback, _) => Column(
                    children: [
                      SwitchListTile(
                        value: feedback.hapticsEnabled,
                        title: Text(
                          'Haptic Feedback',
                          style: AppTypography.bodyBold.copyWith(color: AppColors.textPrimary(context)),
                        ),
                        subtitle: Text(
                          'Subtle vibrations for attendance, tasks & timer',
                          style: AppTypography.caption.copyWith(color: AppColors.textMuted(context)),
                        ),
                        activeColor: AppColors.primary(context),
                        onChanged: (val) => feedback.setHapticsEnabled(val),
                      ),
                      Divider(height: 1, color: AppColors.border(context)),
                      SwitchListTile(
                        value: feedback.soundEnabled,
                        title: Text(
                          'Sound Feedback',
                          style: AppTypography.bodyBold.copyWith(color: AppColors.textPrimary(context)),
                        ),
                        subtitle: Text(
                          'Audio cues for Pomodoro completion and alerts',
                          style: AppTypography.caption.copyWith(color: AppColors.textMuted(context)),
                        ),
                        activeColor: AppColors.primary(context),
                        onChanged: (val) => feedback.setSoundEnabled(val),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 24),

              // Connectivity & Server
              Text(
                'CONNECTIVITY & SERVER',
                style: AppTypography.overline.copyWith(
                  color: AppColors.textMuted(context),
                ),
              ),
              const SizedBox(height: 8),
              AppCard(
                padding: EdgeInsets.zero,
                child: FutureBuilder<String>(
                  future: EnvConfig.getEffectiveWebApiBaseUrl(),
                  builder: (context, snapshot) {
                    final current = snapshot.data ?? EnvConfig.webApiBaseUrl;
                    final isProd = current == EnvConfig.webApiBaseUrl;
                    return ListTile(
                      leading: Icon(
                        Icons.cloud_sync_rounded,
                        color: isProd ? AppColors.primary(context) : AppColors.accentViolet,
                      ),
                      title: Text(
                        'Backend Server URL',
                        style: AppTypography.bodyBold.copyWith(color: AppColors.textPrimary(context)),
                      ),
                      subtitle: Text(
                        current,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: AppTypography.caption.copyWith(
                          color: isProd ? AppColors.textMuted(context) : AppColors.accentViolet,
                        ),
                      ),
                      trailing: const Icon(Icons.edit_outlined, size: 18),
                      onTap: () => _showApiEndpointDialog(context),
                    );
                  },
                ),
              ),
              const SizedBox(height: 12),

              // Connected Devices & Sessions Tile
              AppCard(
                padding: EdgeInsets.zero,
                child: ListTile(
                  leading: Icon(
                    Icons.devices_rounded,
                    color: AppColors.primary(context),
                  ),
                  title: Text(
                    'Devices & Sessions',
                    style: AppTypography.bodyBold.copyWith(color: AppColors.textPrimary(context)),
                  ),
                  subtitle: Text(
                    'Manage connected phones, laptops & web logins',
                    style: AppTypography.caption.copyWith(color: AppColors.textMuted(context)),
                  ),
                  trailing: const Icon(Icons.chevron_right_rounded, size: 20),
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => const DevicesSessionsScreen(),
                      ),
                    );
                  },
                ),
              ),

              const SizedBox(height: 12),

              // App Version & Updates Tile
              AppCard(
                padding: EdgeInsets.zero,
                child: FutureBuilder<InstalledVersionInfo>(
                  future: UpdaterService.instance.getInstalledVersion(),
                  builder: (context, snapshot) {
                    final versionInfo = snapshot.data?.toString() ?? 'StudySpace Android';
                    return ListTile(
                      leading: Icon(
                        Icons.system_update_rounded,
                        color: AppColors.primary(context),
                      ),
                      title: Text(
                        'App Updates',
                        style: AppTypography.bodyBold.copyWith(color: AppColors.textPrimary(context)),
                      ),
                      subtitle: Text(
                        'Installed: $versionInfo',
                        style: AppTypography.caption.copyWith(color: AppColors.textMuted(context)),
                      ),
                      trailing: _isCheckingUpdate
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : OutlinedButton(
                              onPressed: () => _manualCheckForUpdates(context),
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                shape: RoundedRectangleBorder(borderRadius: AppRadii.sm),
                              ),
                              child: const Text('Check Now', style: TextStyle(fontSize: 12)),
                            ),
                      onTap: () => _manualCheckForUpdates(context),
                    );
                  },
                ),
              ),

              const SizedBox(height: 32),

              // Sign out & Delete account
              Center(
                child: Column(
                  children: [
                    OutlinedButton.icon(
                      onPressed: () => _confirmSignOut(context),
                      icon: const Icon(Icons.logout_rounded, color: AppColors.danger),
                      label: const Text('Sign Out of StudySpace', style: TextStyle(color: AppColors.danger)),
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: AppColors.danger.withValues(alpha: 0.6), width: 1.2),
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: AppRadii.md),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextButton.icon(
                      onPressed: () => _confirmDeleteData(context),
                      icon: const Icon(Icons.cleaning_services_rounded, size: 16, color: AppColors.warning),
                      label: const Text(
                        'Clear All Study Data (Keep Account)',
                        style: TextStyle(
                          color: AppColors.warning,
                          fontSize: 12.5,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    const SizedBox(height: 6),
                    TextButton.icon(
                      onPressed: () => _confirmDeleteAccount(context),
                      icon: const Icon(Icons.delete_forever_rounded, size: 16, color: AppColors.danger),
                      label: Text(
                        'Permanently Delete Account',
                        style: TextStyle(
                          color: AppColors.danger.withValues(alpha: 0.8),
                          fontSize: 12.5,
                          fontWeight: FontWeight.w600,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildThemeOption({
    required BuildContext context,
    required String label,
    required IconData icon,
    required ThemeMode mode,
    required ThemeMode currentMode,
    required VoidCallback onTap,
  }) {
    final isSelected = currentMode == mode;
    final isDark = AppColors.isDark(context);

    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: AppRadii.md,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSelected
                ? AppColors.primary(context).withValues(alpha: isDark ? 0.25 : 0.12)
                : AppColors.surfaceMuted(context),
            borderRadius: AppRadii.md,
            border: Border.all(
              color: isSelected ? AppColors.primary(context) : AppColors.border(context),
              width: isSelected ? 1.8 : 1.0,
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                size: 20,
                color: isSelected ? AppColors.primary(context) : AppColors.textMuted(context),
              ),
              const SizedBox(height: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                  color: isSelected ? AppColors.primary(context) : AppColors.textMuted(context),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
