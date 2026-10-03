import 'package:flutter/material.dart';
import '../app_colors.dart';
import '../app_radii.dart';
import '../app_typography.dart';

enum StatusPillType {
  safe,
  warning,
  critical,
  cancelled,
  info,
}

class StatusPill extends StatelessWidget {
  final String label;
  final StatusPillType type;
  final bool showDot;

  const StatusPill({
    super.key,
    required this.label,
    this.type = StatusPillType.safe,
    this.showDot = true,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = AppColors.isDark(context);

    Color bg;
    Color fg;
    Color border;
    Color dot;

    switch (type) {
      case StatusPillType.safe:
        bg = isDark ? AppColors.successBgDark : AppColors.successBgLight;
        fg = isDark ? AppColors.successTextDark : AppColors.successTextLight;
        border = isDark ? AppColors.successBorderDark : AppColors.successBorderLight;
        dot = AppColors.success;
        break;
      case StatusPillType.warning:
        bg = isDark ? AppColors.warningBgDark : AppColors.warningBgLight;
        fg = isDark ? AppColors.warningTextDark : AppColors.warningTextLight;
        border = isDark ? AppColors.warningBorderDark : AppColors.warningBorderLight;
        dot = AppColors.warning;
        break;
      case StatusPillType.critical:
        bg = isDark ? AppColors.dangerBgDark : AppColors.dangerBgLight;
        fg = isDark ? AppColors.dangerTextDark : AppColors.dangerTextLight;
        border = isDark ? AppColors.dangerBorderDark : AppColors.dangerBorderLight;
        dot = AppColors.danger;
        break;
      case StatusPillType.cancelled:
        bg = isDark ? AppColors.cancelledBgDark : AppColors.cancelledBgLight;
        fg = isDark ? AppColors.textMutedDark : AppColors.textMutedLight;
        border = isDark ? AppColors.borderSubtleDark : AppColors.borderSubtleLight;
        dot = isDark ? AppColors.textMutedDark : AppColors.textMutedLight;
        break;
      case StatusPillType.info:
        bg = isDark ? AppColors.infoBgDark : AppColors.infoBgLight;
        fg = isDark ? AppColors.infoTextDark : AppColors.infoTextLight;
        border = isDark ? AppColors.infoBorderDark : AppColors.infoBorderLight;
        dot = AppColors.info;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: AppRadii.full,
        border: Border.all(color: border, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showDot) ...[
            Container(
              width: 6,
              height: 6,
              decoration: BoxDecoration(
                color: dot,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 5),
          ],
          Flexible(
            child: Text(
              label,
              style: AppTypography.caption.copyWith(
                color: fg,
                fontWeight: FontWeight.w600,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}
