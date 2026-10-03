import 'package:flutter/material.dart';
import '../app_colors.dart';
import '../app_radii.dart';
import '../app_typography.dart';
import 'app_button.dart';

class AppDialog extends StatelessWidget {
  final String title;
  final String? description;
  final String? message;
  final Widget? content;
  final String confirmLabel;
  final String cancelLabel;
  final AppButtonVariant confirmVariant;
  final VoidCallback? onConfirm;
  final VoidCallback? onCancel;
  final IconData? icon;
  final Color? iconColor;
  final List<Widget>? actions;

  const AppDialog({
    super.key,
    required this.title,
    this.description,
    this.message,
    this.content,
    this.confirmLabel = 'Confirm',
    this.cancelLabel = 'Cancel',
    this.confirmVariant = AppButtonVariant.primary,
    this.onConfirm,
    this.onCancel,
    this.icon,
    this.iconColor,
    this.actions,
  });

  static Future<bool?> show(
    BuildContext context, {
    required String title,
    String? description,
    String? message,
    Widget? content,
    String confirmLabel = 'Confirm',
    String cancelLabel = 'Cancel',
    AppButtonVariant confirmVariant = AppButtonVariant.primary,
    VoidCallback? onConfirm,
    IconData? icon,
    Color? iconColor,
    List<Widget>? actions,
  }) {
    final effectiveDesc = description ?? message ?? '';
    return showDialog<bool>(
      context: context,
      builder: (ctx) => AppDialog(
        title: title,
        description: effectiveDesc,
        content: content,
        confirmLabel: confirmLabel,
        cancelLabel: cancelLabel,
        confirmVariant: confirmVariant,
        onConfirm: () {
          Navigator.of(ctx).pop(true);
          onConfirm?.call();
        },
        onCancel: () => Navigator.of(ctx).pop(false),
        icon: icon,
        iconColor: iconColor,
        actions: actions,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: AppColors.card(context),
      shape: const RoundedRectangleBorder(borderRadius: AppRadii.lg),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (icon != null) ...[
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: (iconColor ?? AppColors.primary(context)).withOpacity(0.12),
                  borderRadius: AppRadii.md,
                ),
                child: Icon(icon, size: 24, color: iconColor ?? AppColors.primary(context)),
              ),
              const SizedBox(height: 16),
            ],
            Text(
              title,
              style: AppTypography.heading2.copyWith(
                color: AppColors.textPrimary(context),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              description ?? message ?? '',
              style: AppTypography.body.copyWith(
                color: AppColors.textMuted(context),
              ),
            ),
            if (content != null) ...[
              const SizedBox(height: 16),
              content!,
            ],
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: AppButton(
                    label: cancelLabel,
                    variant: AppButtonVariant.outline,
                    onPressed: onCancel ?? () => Navigator.of(context).pop(),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: AppButton(
                    label: confirmLabel,
                    variant: confirmVariant,
                    onPressed: onConfirm,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
