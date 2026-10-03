import 'package:flutter/material.dart';
import '../services/class_resolution_service.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/services/feedback_service.dart';

class CancelClassSheet extends StatefulWidget {
  final ResolvedClass resolvedClass;
  final Function(String reason) onConfirm;

  const CancelClassSheet({
    super.key,
    required this.resolvedClass,
    required this.onConfirm,
  });

  static Future<void> show(
    BuildContext context, {
    required ResolvedClass resolvedClass,
    required Function(String reason) onConfirm,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => CancelClassSheet(
        resolvedClass: resolvedClass,
        onConfirm: onConfirm,
      ),
    );
  }

  @override
  State<CancelClassSheet> createState() => _CancelClassSheetState();
}

class _CancelClassSheetState extends State<CancelClassSheet> {
  final List<String> _presetReasons = [
    'Professor on leave',
    'Class cancelled by college',
    'College event / fest',
    'Holiday announced',
    'Other reason',
  ];

  late String _selectedReason;
  final TextEditingController _customReasonCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _selectedReason = _presetReasons.first;
  }

  @override
  void dispose() {
    _customReasonCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = AppColors.isDark(context);

    return Container(
      decoration: BoxDecoration(
        color: AppColors.card(context),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(AppRadii.xlVal)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.5 : 0.15),
            blurRadius: 20,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      padding: EdgeInsets.only(
        left: AppSpacing.lg,
        right: AppSpacing.lg,
        top: AppSpacing.md,
        bottom: MediaQuery.of(context).viewInsets.bottom + AppSpacing.xl,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 36,
              height: 4,
              margin: const EdgeInsets.only(bottom: AppSpacing.md),
              decoration: BoxDecoration(
                color: AppColors.textMuted(context).withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.danger.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.event_busy_rounded, color: AppColors.danger, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Cancel Class',
                      style: AppTypography.heading3.copyWith(
                        color: AppColors.textPrimary(context),
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${widget.resolvedClass.subjectName} (${widget.resolvedClass.startTime})',
                      style: AppTypography.caption.copyWith(
                        color: AppColors.textMuted(context),
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.md),
          Text(
            'Cancelling will exclude this class from your attendance percentage and suppress reminders.',
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.textMuted(context),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),

          // Reason chips
          Text(
            'REASON',
            style: AppTypography.overline.copyWith(
              color: AppColors.textMuted(context),
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _presetReasons.map((reason) {
              final isSelected = _selectedReason == reason;
              return ChoiceChip(
                label: Text(
                  reason,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    color: isSelected ? Colors.white : AppColors.textPrimary(context),
                  ),
                ),
                selected: isSelected,
                selectedColor: AppColors.danger,
                backgroundColor: AppColors.surfaceMuted(context),
                side: BorderSide(
                  color: isSelected
                      ? AppColors.danger
                      : AppColors.border(context),
                ),
                onSelected: (selected) {
                  if (selected) {
                    FeedbackService.instance.selection();
                    setState(() => _selectedReason = reason);
                  }
                },
              );
            }).toList(),
          ),

          if (_selectedReason == 'Other reason') ...[
            const SizedBox(height: AppSpacing.md),
            TextField(
              controller: _customReasonCtrl,
              autofocus: true,
              decoration: InputDecoration(
                hintText: 'Enter specific reason...',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              ),
            ),
          ],

          const SizedBox(height: AppSpacing.xl),

          // Action buttons
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    side: BorderSide(color: AppColors.border(context)),
                  ),
                  child: Text(
                    'Keep Class',
                    style: TextStyle(
                      color: AppColors.textPrimary(context),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () {
                    final reason = _selectedReason == 'Other reason' &&
                            _customReasonCtrl.text.trim().isNotEmpty
                        ? _customReasonCtrl.text.trim()
                        : _selectedReason;
                    FeedbackService.instance.classCancelled();
                    Navigator.of(context).pop();
                    widget.onConfirm(reason);
                  },
                  icon: const Icon(Icons.close_rounded, size: 18),
                  label: const Text('Cancel Class'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.danger,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
