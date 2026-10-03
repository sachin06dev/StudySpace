import 'package:flutter/material.dart';
import '../models/monthly_summary_data.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/design_system/components/app_card.dart';

class MonthlySummaryCardWidget extends StatefulWidget {
  final MonthlySummaryData currentMonth;
  final Map<String, MonthlySummaryData> monthlySummaries;

  const MonthlySummaryCardWidget({
    super.key,
    required this.currentMonth,
    required this.monthlySummaries,
  });

  @override
  State<MonthlySummaryCardWidget> createState() => _MonthlySummaryCardWidgetState();
}

class _MonthlySummaryCardWidgetState extends State<MonthlySummaryCardWidget> {
  late String _selectedMonthKey;

  @override
  void initState() {
    super.initState();
    _selectedMonthKey = widget.currentMonth.monthKey;
  }

  @override
  void didUpdateWidget(covariant MonthlySummaryCardWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!widget.monthlySummaries.containsKey(_selectedMonthKey)) {
      _selectedMonthKey = widget.currentMonth.monthKey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final activeData = widget.monthlySummaries[_selectedMonthKey] ?? widget.currentMonth;

    return AppCard(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header & Month Selector
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Text('📅', style: TextStyle(fontSize: 16)),
                  const SizedBox(width: AppSpacing.xs),
                  Text(
                    'Monthly Focus',
                    style: AppTypography.headingSm.copyWith(
                      color: AppColors.textPrimary(context),
                    ),
                  ),
                ],
              ),
              if (widget.monthlySummaries.isNotEmpty)
                DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: widget.monthlySummaries.containsKey(_selectedMonthKey) ? _selectedMonthKey : null,
                    icon: Icon(Icons.arrow_drop_down, color: AppColors.primary(context)),
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primary(context)),
                    items: widget.monthlySummaries.entries.map((entry) {
                      return DropdownMenuItem<String>(
                        value: entry.key,
                        child: Text(entry.value.monthName),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) {
                        setState(() {
                          _selectedMonthKey = val;
                        });
                      }
                    },
                  ),
                ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),

          // 2x2 Grid of Monthly Metrics
          Row(
            children: [
              Expanded(
                child: _buildTile(
                  context,
                  title: 'Total Study Time',
                  value: activeData.formattedTotal,
                  icon: Icons.hourglass_bottom_rounded,
                  color: const Color(0xFF6366F1),
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: _buildTile(
                  context,
                  title: 'Active Study Days',
                  value: '${activeData.activeDays} days',
                  icon: Icons.calendar_today_rounded,
                  color: const Color(0xFF10B981),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Row(
            children: [
              Expanded(
                child: _buildTile(
                  context,
                  title: 'Daily Average',
                  value: activeData.formattedDailyAverage,
                  icon: Icons.trending_up_rounded,
                  color: const Color(0xFF3B82F6),
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: _buildTile(
                  context,
                  title: 'Pomodoros Done',
                  value: '${activeData.pomodoroCount}',
                  icon: Icons.check_circle_outline_rounded,
                  color: const Color(0xFFF59E0B),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTile(
    BuildContext context, {
    required String title,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surfaceMuted(context).withOpacity(0.4),
        borderRadius: AppRadii.md,
        border: Border.all(color: AppColors.border(context).withOpacity(0.6)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 14, color: color),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(fontSize: 10, color: AppColors.textMuted(context)),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary(context),
            ),
          ),
        ],
      ),
    );
  }
}
