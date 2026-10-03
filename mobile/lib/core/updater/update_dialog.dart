import 'dart:io';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import '../design_system/app_colors.dart';
import '../design_system/app_radii.dart';
import '../design_system/app_typography.dart';
import 'update_model.dart';
import 'updater_service.dart';

enum _UpdateState {
  prompt,
  downloading,
  verifying,
  needsPermission,
  error,
}

class UpdateDialog extends StatefulWidget {
  final AppReleaseManifest manifest;
  final bool isMandatory;
  final int currentBuild;

  const UpdateDialog({
    super.key,
    required this.manifest,
    required this.isMandatory,
    required this.currentBuild,
  });

  static Future<void> show(
    BuildContext context, {
    required AppReleaseManifest manifest,
    required bool isMandatory,
    required int currentBuild,
  }) {
    return showDialog<void>(
      context: context,
      barrierDismissible: !isMandatory,
      builder: (ctx) => UpdateDialog(
        manifest: manifest,
        isMandatory: isMandatory,
        currentBuild: currentBuild,
      ),
    );
  }

  @override
  State<UpdateDialog> createState() => _UpdateDialogState();
}

class _UpdateDialogState extends State<UpdateDialog> {
  _UpdateState _state = _UpdateState.prompt;
  double _progress = 0.0;
  int _receivedBytes = 0;
  int _totalBytes = 0;
  String? _errorMessage;
  File? _downloadedFile;

  @override
  Widget build(BuildContext context) {
    final isDark = AppColors.isDark(context);

    return PopScope(
      canPop: !widget.isMandatory && _state != _UpdateState.downloading,
      child: Dialog(
        shape: RoundedRectangleBorder(borderRadius: AppRadii.xl),
        backgroundColor: AppColors.surface(context),
        insetPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
        child: Container(
          padding: const EdgeInsets.all(24),
          constraints: const BoxConstraints(maxWidth: 420),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildHeader(context, isDark),
              const SizedBox(height: 16),
              _buildBody(context),
              const SizedBox(height: 24),
              _buildActions(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, bool isDark) {
    final iconColor = widget.isMandatory ? AppColors.warning : AppColors.primary(context);
    final iconBg = widget.isMandatory
        ? AppColors.warning.withValues(alpha: 0.15)
        : AppColors.primary(context).withValues(alpha: 0.15);

    return Row(
      children: [
        Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: iconBg,
            borderRadius: AppRadii.lg,
          ),
          child: Icon(
            widget.isMandatory ? Icons.warning_amber_rounded : Icons.system_update_rounded,
            color: iconColor,
            size: 24,
          ),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                widget.isMandatory ? 'Update Required' : 'New Update Available',
                style: AppTypography.title.copyWith(
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary(context),
                ),
              ),
              const SizedBox(height: 2),
              Text(
                'StudySpace v${widget.manifest.latestVersion} (Build ${widget.manifest.latestBuild})',
                style: AppTypography.caption.copyWith(
                  color: AppColors.textMuted(context),
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildBody(BuildContext context) {
    switch (_state) {
      case _UpdateState.prompt:
        return _buildPromptContent(context);
      case _UpdateState.downloading:
        return _buildDownloadingContent(context);
      case _UpdateState.verifying:
        return _buildVerifyingContent(context);
      case _UpdateState.needsPermission:
        return _buildPermissionContent(context);
      case _UpdateState.error:
        return _buildErrorContent(context);
    }
  }

  Widget _buildPromptContent(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.isMandatory)
          Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.warning.withValues(alpha: 0.12),
              borderRadius: AppRadii.md,
              border: Border.all(color: AppColors.warning.withValues(alpha: 0.3)),
            ),
            child: Row(
              children: [
                const Icon(Icons.info_outline, size: 16, color: AppColors.warning),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'This version is required to maintain synchronization with your university timetable & attendance.',
                    style: AppTypography.caption.copyWith(
                      color: AppColors.warning,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
        if (widget.manifest.releaseNotes.isNotEmpty) ...[
          Text(
            "What's New:",
            style: AppTypography.bodySmall.copyWith(
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary(context),
            ),
          ),
          const SizedBox(height: 8),
          Container(
            constraints: const BoxConstraints(maxHeight: 160),
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: widget.manifest.releaseNotes
                    .map(
                      (note) => Padding(
                        padding: const EdgeInsets.only(bottom: 6),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '• ',
                              style: TextStyle(
                                color: AppColors.primary(context),
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Expanded(
                              child: Text(
                                note,
                                style: AppTypography.caption.copyWith(
                                  color: AppColors.textSecondary(context),
                                  height: 1.35,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    )
                    .toList(),
              ),
            ),
          ),
        ] else ...[
          Text(
            'A new version of StudySpace is ready to install with performance enhancements and bug fixes.',
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.textSecondary(context),
            ),
          ),
        ],
        if (widget.manifest.apkSize > 0) ...[
          const SizedBox(height: 12),
          Text(
            'Download size: ${(widget.manifest.apkSize / (1024 * 1024)).toStringAsFixed(1)} MB',
            style: AppTypography.caption.copyWith(
              color: AppColors.textMuted(context),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildDownloadingContent(BuildContext context) {
    final mbReceived = (_receivedBytes / (1024 * 1024)).toStringAsFixed(1);
    final mbTotal = _totalBytes > 0
        ? (_totalBytes / (1024 * 1024)).toStringAsFixed(1)
        : (widget.manifest.apkSize / (1024 * 1024)).toStringAsFixed(1);
    final percent = (_progress * 100).toInt();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Downloading update...',
              style: AppTypography.bodySmall.copyWith(
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary(context),
              ),
            ),
            Text(
              '$percent%',
              style: AppTypography.bodySmall.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.primary(context),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        ClipRRect(
          borderRadius: AppRadii.full,
          child: LinearProgressIndicator(
            value: _progress > 0 ? _progress : null,
            backgroundColor: AppColors.surfaceMuted(context),
            color: AppColors.primary(context),
            minHeight: 8,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          '$mbReceived MB / $mbTotal MB',
          style: AppTypography.caption.copyWith(
            color: AppColors.textMuted(context),
          ),
        ),
      ],
    );
  }

  Widget _buildVerifyingContent(BuildContext context) {
    return Column(
      children: [
        const SizedBox(height: 8),
        const CircularProgressIndicator(),
        const SizedBox(height: 16),
        Text(
          'Verifying SHA-256 package checksum...',
          style: AppTypography.bodySmall.copyWith(
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary(context),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Ensuring package security and authenticity',
          style: AppTypography.caption.copyWith(
            color: AppColors.textMuted(context),
          ),
        ),
      ],
    );
  }

  Widget _buildPermissionContent(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Permission Required',
          style: AppTypography.bodySmall.copyWith(
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary(context),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'Android requires your permission to install updates directly for StudySpace. Tap "Open Settings" to enable "Allow from this source", then return to finish updating.',
          style: AppTypography.caption.copyWith(
            color: AppColors.textSecondary(context),
            height: 1.4,
          ),
        ),
      ],
    );
  }

  Widget _buildErrorContent(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Update Failed',
          style: AppTypography.bodySmall.copyWith(
            fontWeight: FontWeight.bold,
            color: AppColors.danger,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          _errorMessage ?? 'An unexpected error occurred during download.',
          style: AppTypography.caption.copyWith(
            color: AppColors.textSecondary(context),
          ),
        ),
      ],
    );
  }

  Widget _buildActions(BuildContext context) {
    switch (_state) {
      case _UpdateState.prompt:
        return Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            if (!widget.isMandatory) ...[
              TextButton(
                onPressed: () async {
                  // Persist dismissal so we don't spam the same version for 24 hours
                  try {
                    final prefs = await SharedPreferences.getInstance();
                    await prefs.setString(
                        'last_dismissed_version', widget.manifest.latestVersion);
                    await prefs.setInt(
                        'last_dismissed_ts', DateTime.now().millisecondsSinceEpoch);
                  } catch (_) {}
                  if (context.mounted) Navigator.of(context).pop();
                },
                child: const Text('Later'),
              ),
              const SizedBox(width: 8),
            ],
            ElevatedButton.icon(
              onPressed: _startDownload,
              icon: const Icon(Icons.download_rounded, size: 18),
              label: const Text('Update Now'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary(context),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: AppRadii.md),
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
              ),
            ),
          ],
        );

      case _UpdateState.downloading:
      case _UpdateState.verifying:
        return const SizedBox.shrink();

      case _UpdateState.needsPermission:
        return Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            if (!widget.isMandatory) ...[
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('Cancel'),
              ),
              const SizedBox(width: 8),
            ],
            ElevatedButton(
              onPressed: () async {
                await UpdaterService.instance.openInstallPermissionSettings();
                setState(() {});
              },
              child: const Text('Open Settings'),
            ),
            const SizedBox(width: 8),
            ElevatedButton(
              onPressed: _proceedWithInstall,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary(context),
                foregroundColor: Colors.white,
              ),
              child: const Text('Install Now'),
            ),
          ],
        );

      case _UpdateState.error:
        return Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Close'),
            ),
            const SizedBox(width: 8),
            // Fallback: open APK URL directly in browser if native install fails
            if (widget.manifest.apkUrl.isNotEmpty)
              TextButton.icon(
                onPressed: () async {
                  final uri = Uri.tryParse(widget.manifest.apkUrl);
                  if (uri != null) {
                    await launchUrl(uri, mode: LaunchMode.externalApplication);
                  }
                },
                icon: const Icon(Icons.open_in_browser_rounded, size: 16),
                label: const Text('Open in Browser'),
              ),
            const SizedBox(width: 8),
            ElevatedButton(
              onPressed: _startDownload,
              child: const Text('Retry'),
            ),
          ],
        );
    }
  }

  Future<void> _startDownload() async {
    setState(() {
      _state = _UpdateState.downloading;
      _progress = 0.0;
      _receivedBytes = 0;
      _errorMessage = null;
    });

    try {
      final file = await UpdaterService.instance.downloadApk(
        widget.manifest,
        onProgress: (progress, received, total) {
          if (mounted) {
            setState(() {
              _progress = progress;
              _receivedBytes = received;
              _totalBytes = total;
            });
          }
        },
      );

      if (!mounted) return;

      setState(() {
        _downloadedFile = file;
        _state = _UpdateState.verifying;
      });

      // Small delay for UI smoothness
      await Future.delayed(const Duration(milliseconds: 300));
      await _proceedWithInstall();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _state = _UpdateState.error;
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
      });
    }
  }

  Future<void> _proceedWithInstall() async {
    if (_downloadedFile == null) return;

    final canInstall = await UpdaterService.instance.canRequestPackageInstalls();
    if (!canInstall) {
      if (!mounted) return;
      setState(() {
        _state = _UpdateState.needsPermission;
      });
      return;
    }

    try {
      await UpdaterService.instance.installApk(_downloadedFile!);
      if (mounted && !widget.isMandatory) {
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _state = _UpdateState.error;
          _errorMessage = e.toString().replaceFirst('Exception: ', '');
        });
      }
    }
  }
}
