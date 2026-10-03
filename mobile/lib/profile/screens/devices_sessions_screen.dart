import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../auth/providers/auth_provider.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/design_system/components/app_card.dart';
import '../../core/design_system/components/app_dialog.dart';
import '../../core/supabase/supabase_client.dart';

class DevicesSessionsScreen extends StatefulWidget {
  const DevicesSessionsScreen({super.key});

  @override
  State<DevicesSessionsScreen> createState() => _DevicesSessionsScreenState();
}

class _DevicesSessionsScreenState extends State<DevicesSessionsScreen> {
  static const String _deviceIdKey = 'studyspace_mobile_device_id';
  String _currentDeviceId = '';
  List<Map<String, dynamic>> _devices = [];
  bool _isLoading = true;
  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    _initDeviceAndLoad();
  }

  Future<void> _initDeviceAndLoad() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      var id = prefs.getString(_deviceIdKey);
      if (id == null || id.isEmpty) {
        id = 'mobile_${DateTime.now().millisecondsSinceEpoch}_${(1000 + (DateTime.now().microsecond % 9000))}';
        await prefs.setString(_deviceIdKey, id);
      }
      _currentDeviceId = id;

      final client = SupabaseService.client;
      final user = client.auth.currentUser;
      if (user != null) {
        final platformName = Platform.isAndroid ? 'Android' : (Platform.isIOS ? 'iOS' : 'Mobile');
        final deviceName = '$platformName Phone (StudySpace App)';

        // Upsert current device record
        await client.from('user_devices').upsert({
          'user_id': user.id,
          'device_id': _currentDeviceId,
          'device_name': deviceName,
          'device_type': 'mobile',
          'platform': platformName,
          'browser': 'StudySpace App',
          'last_active_at': DateTime.now().toIso8601String(),
        }, onConflict: 'user_id,device_id');
      }

      await _fetchDevices();
    } catch (_) {
      // Gracefully handle offline or unmigrated table
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _fetchDevices() async {
    try {
      final client = SupabaseService.client;
      final user = client.auth.currentUser;
      if (user == null) {
        if (mounted) setState(() => _isLoading = false);
        return;
      }

      final data = await client
          .from('user_devices')
          .select()
          .eq('user_id', user.id)
          .eq('is_revoked', false)
          .order('last_active_at', ascending: false);

      if (mounted) {
        setState(() {
          _devices = List<Map<String, dynamic>>.from(data);
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _signOutOtherDevices(BuildContext context) async {
    AppDialog.show(
      context,
      title: 'Sign Out Other Devices',
      message: 'This will terminate active login sessions on all other phones, computers, and browsers. You will remain logged in on this device.',
      confirmLabel: 'Sign Out Others',
      cancelLabel: 'Cancel',
      icon: Icons.phonelink_erase_rounded,
      iconColor: AppColors.danger,
      onConfirm: () async {
        setState(() => _isProcessing = true);
        try {
          await context.read<AuthProvider>().signOutOtherDevices();

          // Clean up non-current device records
          final client = SupabaseService.client;
          final user = client.auth.currentUser;
          if (user != null) {
            await client
                .from('user_devices')
                .delete()
                .eq('user_id', user.id)
                .neq('device_id', _currentDeviceId);
          }

          await _fetchDevices();

          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Successfully signed out all other devices.')),
            );
          }
        } catch (e) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Error: $e')),
            );
          }
        } finally {
          if (mounted) {
            setState(() => _isProcessing = false);
          }
        }
      },
    );
  }

  Future<void> _removeDevice(Map<String, dynamic> device) async {
    final deviceId = device['device_id'] as String?;
    final id = device['id'] as String?;
    final name = device['device_name'] as String? ?? 'Device';
    if (deviceId == null && id == null) return;

    AppDialog.show(
      context,
      title: 'Remove Device',
      message: 'Are you sure you want to sign out and remove "$name"?',
      confirmLabel: 'Remove Device',
      cancelLabel: 'Cancel',
      icon: Icons.delete_outline_rounded,
      iconColor: AppColors.danger,
      onConfirm: () async {
        setState(() {
          _devices.removeWhere((d) => d['device_id'] == deviceId || d['id'] == id);
        });

        try {
          final client = SupabaseService.client;
          final user = client.auth.currentUser;
          if (user != null) {
            // 1. Mark is_revoked = true (triggers realtime event so target signs out immediately)
            if (deviceId != null) {
              await client
                  .from('user_devices')
                  .update({'is_revoked': true, 'last_active_at': DateTime.now().toUtc().toIso8601String()})
                  .eq('user_id', user.id)
                  .eq('device_id', deviceId);
            }

            // 2. Delete row
            if (deviceId != null) {
              await client
                  .from('user_devices')
                  .delete()
                  .eq('user_id', user.id)
                  .eq('device_id', deviceId);
            } else if (id != null) {
              await client
                  .from('user_devices')
                  .delete()
                  .eq('user_id', user.id)
                  .eq('id', id);
            }

            // 3. If no other device remains, revoke other sessions
            final remaining = await client
                .from('user_devices')
                .select('device_id')
                .eq('user_id', user.id)
                .eq('is_revoked', false);

            if (remaining.length <= 1) {
              try {
                if (mounted) {
                  await context.read<AuthProvider>().signOutOtherDevices();
                }
              } catch (_) {}
            }
          }

          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Successfully removed and signed out $name.')),
            );
          }
          await _fetchDevices();
        } catch (e) {
          await _fetchDevices();
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Failed to remove device: $e')),
            );
          }
        }
      },
    );
  }

  String _formatRelativeTime(String? dateStr) {
    if (dateStr == null) return 'Recently';
    try {
      final dt = DateTime.parse(dateStr).toLocal();
      final diff = DateTime.now().difference(dt);
      if (diff.inSeconds < 60) return 'Just now';
      if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
      if (diff.inHours < 24) return '${diff.inHours}h ago';
      if (diff.inDays == 1) return 'Yesterday';
      return '${diff.inDays} days ago';
    } catch (_) {
      return 'Recently';
    }
  }

  @override
  Widget build(BuildContext context) {
    final textPrimary = AppColors.textPrimary(context);
    final textMuted = AppColors.textMuted(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Devices & Sessions'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchDevices,
              child: ListView(
                padding: const EdgeInsets.all(AppSpacing.md),
                children: [
                  Text(
                    'SIGNED-IN DEVICES',
                    style: AppTypography.overline.copyWith(color: textMuted),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    'Manage all active phones, laptops, and web sessions connected to your StudySpace account.',
                    style: AppTypography.caption.copyWith(color: textMuted),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  if (_devices.isEmpty)
                    AppCard(
                      child: Center(
                        child: Text(
                          'No devices registered yet.',
                          style: AppTypography.body.copyWith(color: textMuted),
                        ),
                      ),
                    )
                  else
                    ..._devices.map((device) {
                      final isCurrent = device['device_id'] == _currentDeviceId;
                      final type = device['device_type'] as String? ?? 'web';
                      final name = device['device_name'] as String? ?? 'StudySpace Session';
                      final platform = device['platform'] as String? ?? 'Web';
                      final lastActive = _formatRelativeTime(device['last_active_at'] as String?);

                      IconData iconData = Icons.laptop_mac_rounded;
                      if (type == 'mobile') {
                        iconData = Icons.phone_android_rounded;
                      } else if (type == 'tablet') {
                        iconData = Icons.tablet_mac_rounded;
                      }

                      return Padding(
                        padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                        child: AppCard(
                          padding: const EdgeInsets.all(AppSpacing.sm),
                          child: Row(
                            children: [
                              Container(
                                width: 42,
                                height: 42,
                                decoration: BoxDecoration(
                                  color: isCurrent
                                      ? AppColors.primary(context).withValues(alpha: 0.12)
                                      : textMuted.withValues(alpha: 0.08),
                                  borderRadius: AppRadii.sm,
                                ),
                                child: Icon(
                                  iconData,
                                  color: isCurrent ? AppColors.primary(context) : textMuted,
                                  size: 22,
                                ),
                              ),
                              const SizedBox(width: AppSpacing.sm),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Flexible(
                                          child: Text(
                                            name,
                                            style: AppTypography.bodyBold.copyWith(color: textPrimary),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                        if (isCurrent) ...[
                                          const SizedBox(width: 6),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: AppColors.primary(context).withValues(alpha: 0.15),
                                              borderRadius: BorderRadius.circular(4),
                                            ),
                                            child: Text(
                                              'This Device',
                                              style: TextStyle(
                                                fontSize: 10,
                                                fontWeight: FontWeight.bold,
                                                color: AppColors.primary(context),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ],
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      'Platform: $platform • Active: $lastActive',
                                      style: AppTypography.caption.copyWith(color: textMuted),
                                    ),
                                  ],
                                ),
                              ),
                              if (!isCurrent)
                                IconButton(
                                  icon: const Icon(Icons.delete_outline_rounded, size: 20),
                                  color: AppColors.danger,
                                  tooltip: 'Remove Device',
                                  onPressed: () => _removeDevice(device),
                                ),
                            ],
                          ),
                        ),
                      );
                    }),
                  const SizedBox(height: AppSpacing.lg),
                  if (_devices.length > 1) ...[
                    OutlinedButton.icon(
                      onPressed: _isProcessing ? null : () => _signOutOtherDevices(context),
                      icon: const Icon(Icons.phonelink_erase_rounded, color: AppColors.danger),
                      label: Text(
                        _isProcessing ? 'Processing...' : 'Sign Out All Other Devices',
                        style: const TextStyle(color: AppColors.danger),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: AppColors.danger.withValues(alpha: 0.6), width: 1.2),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: AppRadii.md),
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      'Signing out other devices will invalidate their login tokens so only this phone remains authenticated.',
                      textAlign: TextAlign.center,
                      style: AppTypography.caption.copyWith(color: textMuted),
                    ),
                  ],
                ],
              ),
            ),
    );
  }
}
