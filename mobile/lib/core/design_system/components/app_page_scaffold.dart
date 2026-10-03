import 'package:flutter/material.dart';
import 'app_scaffold.dart';

/// Helper widget to establish standard responsive horizontal padding.
/// Compact (<360dp): 16dp
/// Standard (360-600dp): 20dp
/// Wide (>=600dp): 24dp
class AppPageScaffold extends StatelessWidget {
  final Widget body;
  final PreferredSizeWidget? appBar;
  final Widget? floatingActionButton;
  final Widget? bottomNavigationBar;
  final bool showSyncBanner;
  final bool scrollable;
  final EdgeInsetsGeometry? customPadding;

  const AppPageScaffold({
    super.key,
    required this.body,
    this.appBar,
    this.floatingActionButton,
    this.bottomNavigationBar,
    this.showSyncBanner = true,
    this.scrollable = true,
    this.customPadding,
  });

  static double horizontalPadding(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    if (width < 360) return 16.0;
    if (width >= 600) return 24.0;
    return 20.0;
  }

  @override
  Widget build(BuildContext context) {
    final hPad = horizontalPadding(context);
    final padding = customPadding ?? EdgeInsets.symmetric(horizontal: hPad, vertical: 16.0);

    Widget content = Padding(
      padding: padding,
      child: body,
    );

    if (scrollable) {
      content = SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
        child: content,
      );
    }

    return AppScaffold(
      appBar: appBar,
      showSyncBanner: showSyncBanner,
      floatingActionButton: floatingActionButton,
      bottomNavigationBar: bottomNavigationBar,
      body: content,
    );
  }
}
