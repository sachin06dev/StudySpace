import 'package:flutter/material.dart';
import '../../core/services/feedback_service.dart';
import 'attendance_tokens.dart';

/// SilverBook-inspired reusable filter bottom sheet.
/// Supports single-selection radio lists with explicit Apply and Clear all actions.
class AttendanceFilterSheet extends StatefulWidget {
  final String title;
  final List<FilterOption> options;
  final String selectedValue;
  final ValueChanged<String> onApply;

  const AttendanceFilterSheet({
    super.key,
    required this.title,
    required this.options,
    required this.selectedValue,
    required this.onApply,
  });

  static Future<void> show({
    required BuildContext context,
    required String title,
    required List<FilterOption> options,
    required String selectedValue,
    required ValueChanged<String> onApply,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => AttendanceFilterSheet(
        title: title,
        options: options,
        selectedValue: selectedValue,
        onApply: onApply,
      ),
    );
  }

  @override
  State<AttendanceFilterSheet> createState() => _AttendanceFilterSheetState();
}

class FilterOption {
  final String value;
  final String label;
  final IconData? icon;

  const FilterOption({
    required this.value,
    required this.label,
    this.icon,
  });
}

class _AttendanceFilterSheetState extends State<AttendanceFilterSheet> {
  late String _tempSelected;

  @override
  void initState() {
    super.initState();
    _tempSelected = widget.selectedValue;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = AttendanceTokens.isDark(context);

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.75,
      ),
      decoration: BoxDecoration(
        color: AttendanceTokens.card(context),
        borderRadius: AttendanceTokens.sheetRadius,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.6 : 0.2),
            blurRadius: 24,
            offset: const Offset(0, -6),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Top Handle
            Center(
              child: Container(
                width: 38,
                height: 4,
                margin: const EdgeInsets.only(top: 10, bottom: 8),
                decoration: BoxDecoration(
                  color: AttendanceTokens.border(context),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),

            // Header: Title & Close Button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    widget.title,
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.3,
                      color: AttendanceTokens.textPrimary(context),
                    ),
                  ),
                  InkWell(
                    onTap: () => Navigator.of(context).pop(),
                    borderRadius: BorderRadius.circular(20),
                    child: Padding(
                      padding: const EdgeInsets.all(4.0),
                      child: Icon(
                        Icons.close_rounded,
                        size: 20,
                        color: AttendanceTokens.textMuted(context),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            Divider(height: 1, color: AttendanceTokens.border(context)),

            // Options List
            Flexible(
              child: ListView.separated(
                shrinkWrap: true,
                padding: const EdgeInsets.symmetric(vertical: 8),
                itemCount: widget.options.length,
                separatorBuilder: (_, __) => Divider(
                  height: 1,
                  indent: 20,
                  endIndent: 20,
                  color: AttendanceTokens.border(context).withValues(alpha: 0.5),
                ),
                itemBuilder: (context, index) {
                  final opt = widget.options[index];
                  final isSelected = _tempSelected == opt.value;

                  return InkWell(
                    onTap: () {
                      FeedbackService.instance.selection();
                      setState(() {
                        _tempSelected = opt.value;
                      });
                    },
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                      child: Row(
                        children: [
                          if (opt.icon != null) ...[
                            Icon(
                              opt.icon,
                              size: 18,
                              color: isSelected
                                  ? AttendanceTokens.primaryBlue
                                  : AttendanceTokens.textMuted(context),
                            ),
                            const SizedBox(width: 12),
                          ],
                          Expanded(
                            child: Text(
                              opt.label,
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                color: isSelected
                                    ? AttendanceTokens.textPrimary(context)
                                    : AttendanceTokens.textSecondary(context),
                              ),
                            ),
                          ),
                          // Custom Radio Circle
                          Container(
                            width: 20,
                            height: 20,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: isSelected
                                    ? AttendanceTokens.primaryBlue
                                    : AttendanceTokens.border(context),
                                width: isSelected ? 6.0 : 1.5,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),

            Divider(height: 1, color: AttendanceTokens.border(context)),

            // Footer: Clear all & Apply
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 14, 20, 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  TextButton(
                    onPressed: () {
                      FeedbackService.instance.selection();
                      setState(() {
                        _tempSelected = 'ALL';
                      });
                    },
                    style: TextButton.styleFrom(
                      foregroundColor: AttendanceTokens.textMuted(context),
                    ),
                    child: const Text(
                      'Clear all',
                      style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      FeedbackService.instance.selection();
                      widget.onApply(_tempSelected);
                      Navigator.of(context).pop();
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AttendanceTokens.primaryBlue,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 12),
                      shape: const RoundedRectangleBorder(
                        borderRadius: AttendanceTokens.controlRadius,
                      ),
                    ),
                    child: const Text(
                      'Apply',
                      style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
