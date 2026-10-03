import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_colors.dart';
import '../app_typography.dart';
import '../../sync/sync_engine.dart';

class AppScaffold extends StatelessWidget {
  final PreferredSizeWidget? appBar;
  final String? title;
  final List<Widget>? actions;
  final Widget body;
  final Widget? floatingActionButton;
  final Widget? bottomNavigationBar;
  final bool showSyncBanner;

  const AppScaffold({
    super.key,
    this.appBar,
    this.title,
    this.actions,
    required this.body,
    this.floatingActionButton,
    this.bottomNavigationBar,
    this.showSyncBanner = true,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveAppBar = appBar ??
        (title != null
            ? AppBar(
                title: Text(
                  title!,
                  style: AppTypography.heading2.copyWith(
                    color: AppColors.textPrimary(context),
                  ),
                ),
                backgroundColor: AppColors.background(context),
                elevation: 0,
                scrolledUnderElevation: 0,
                actions: actions,
              )
            : null);

    return Scaffold(
      backgroundColor: AppColors.background(context),
      appBar: effectiveAppBar,
      floatingActionButton: floatingActionButton,
      bottomNavigationBar: bottomNavigationBar,
      body: SafeArea(
        child: Column(
          children: [
            if (showSyncBanner) const _OfflineSyncBanner(),
            Expanded(child: body),
          ],
        ),
      ),
    );
  }
}

class _OfflineSyncBanner extends StatelessWidget {
  const _OfflineSyncBanner();

  @override
  Widget build(BuildContext context) {
    return Consumer<SyncEngine>(
      builder: (context, syncEngine, _) {
        if (syncEngine.state == SyncState.offline) {
          final bg = AppColors.warningBg(context);
          final fg = AppColors.warningText(context);
          return Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            color: bg,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.wifi_off_rounded, size: 14, color: fg),
                const SizedBox(width: 8),
                Text(
                  syncEngine.pendingCount > 0
                      ? 'Offline — ${syncEngine.pendingCount} changes will sync when online'
                      : 'Offline — changes will sync when you\'re back online',
                  style: AppTypography.caption.copyWith(
                    color: fg,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          );
        }

        if (syncEngine.state == SyncState.syncing) {
          final bg = AppColors.primarySubtle(context);
          final fg = AppColors.primarySubtleText(context);
          return Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            color: bg,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                SizedBox(
                  width: 10,
                  height: 10,
                  child: CircularProgressIndicator(strokeWidth: 2, color: fg),
                ),
                const SizedBox(width: 8),
                Text(
                  'Syncing changes to StudySpace...',
                  style: AppTypography.caption.copyWith(
                    color: fg,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          );
        }

        return const SizedBox.shrink();
      },
    );
  }
}
