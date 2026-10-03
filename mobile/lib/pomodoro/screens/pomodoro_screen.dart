import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/pomodoro_provider.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/design_system/components/app_card.dart';
import '../../core/services/feedback_service.dart';

class PomodoroScreen extends StatelessWidget {
  const PomodoroScreen({super.key});

  String _formatTime(int totalSeconds) {
    final minutes = totalSeconds ~/ 60;
    final seconds = totalSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  Color _getModeColor(String mode, BuildContext context) {
    switch (mode) {
      case 'short_break':
        return AppColors.success;
      case 'long_break':
        return const Color(0xFF0284C7);
      case 'focus':
      default:
        return AppColors.primary(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<PomodoroProvider>();
    final modeColor = _getModeColor(provider.currentMode, context);

    final isFocusMode = provider.currentMode == 'focus';
    final stateLabel = !provider.isRunning
        ? (isFocusMode ? 'READY TO FOCUS' : 'READY FOR BREAK')
        : provider.isPaused
            ? 'PAUSED'
            : (isFocusMode ? 'FOCUS IN PROGRESS' : 'REST & RECHARGE');

    final stateIcon = !provider.isRunning
        ? (isFocusMode ? Icons.play_arrow_rounded : Icons.coffee_rounded)
        : provider.isPaused
            ? Icons.pause_rounded
            : (isFocusMode ? Icons.center_focus_strong_rounded : Icons.self_improvement_rounded);

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Focus Instrument',
          style: AppTypography.headingMd.copyWith(fontWeight: FontWeight.w800),
        ),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.tune_rounded),
            tooltip: 'Timer Settings',
            onPressed: () => _showCustomDurationSheet(context, provider),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Column(
            children: [
              // 1. Mode Segmented Switcher
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: AppColors.surfaceMuted(context),
                  borderRadius: AppRadii.full,
                  border: Border.all(color: AppColors.border(context)),
                ),
                child: Row(
                  children: [
                    _buildModeTab(
                      context,
                      label: 'Focus (${provider.focusDurationMinutes}m)',
                      mode: 'focus',
                      isSelected: provider.currentMode == 'focus',
                      onTap: () {
                        FeedbackService.instance.selection();
                        provider.setMode('focus');
                      },
                    ),
                    _buildModeTab(
                      context,
                      label: 'Short (${provider.shortBreakMinutes}m)',
                      mode: 'short_break',
                      isSelected: provider.currentMode == 'short_break',
                      onTap: () {
                        FeedbackService.instance.selection();
                        provider.setMode('short_break');
                      },
                    ),
                    _buildModeTab(
                      context,
                      label: 'Long (${provider.longBreakMinutes}m)',
                      mode: 'long_break',
                      isSelected: provider.currentMode == 'long_break',
                      onTap: () {
                        FeedbackService.instance.selection();
                        provider.setMode('long_break');
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.sm),

              // 2. Presets Row
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildPresetChip(
                      context,
                      label: '25 / 5 Standard',
                      isSelected: provider.activePresetName == '25 / 5',
                      onTap: () {
                        FeedbackService.instance.selection();
                        provider.applyPreset('25 / 5');
                      },
                    ),
                    const SizedBox(width: 8),
                    _buildPresetChip(
                      context,
                      label: '50 / 10 Extended',
                      isSelected: provider.activePresetName == '50 / 10',
                      onTap: () {
                        FeedbackService.instance.selection();
                        provider.applyPreset('50 / 10');
                      },
                    ),
                    const SizedBox(width: 8),
                    _buildPresetChip(
                      context,
                      label: '90 / 15 Focus',
                      isSelected: provider.activePresetName == '90 / 15',
                      onTap: () {
                        FeedbackService.instance.selection();
                        provider.applyPreset('90 / 15');
                      },
                    ),
                    const SizedBox(width: 8),
                    _buildPresetChip(
                      context,
                      label: provider.activePresetName == 'Custom'
                          ? 'Custom (${provider.focusDurationMinutes}/${provider.shortBreakMinutes})'
                          : 'Custom...',
                      isSelected: provider.activePresetName == 'Custom',
                      isCustom: true,
                      onTap: () => _showCustomDurationSheet(context, provider),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.xl),

              // 3. DOMINANT TIMER INSTRUMENT
              Center(
                child: SizedBox(
                  width: 250,
                  height: 250,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      // Background Track
                      SizedBox(
                        width: 250,
                        height: 250,
                        child: CircularProgressIndicator(
                          value: 1.0,
                          strokeWidth: 9,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            AppColors.border(context),
                          ),
                        ),
                      ),

                      // Animated Progress Ring
                      SizedBox(
                        width: 250,
                        height: 250,
                        child: CircularProgressIndicator(
                          value: provider.progress,
                          strokeWidth: 9,
                          strokeCap: StrokeCap.round,
                          backgroundColor: Colors.transparent,
                          valueColor: AlwaysStoppedAnimation<Color>(modeColor),
                        ),
                      ),

                      // Central Content
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          // Status Pill
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: modeColor.withOpacity(0.12),
                              borderRadius: AppRadii.full,
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(stateIcon, size: 12, color: modeColor),
                                const SizedBox(width: 4),
                                Text(
                                  stateLabel,
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: 0.8,
                                    color: modeColor,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 8),

                          // Monospace Timer Digits
                          Text(
                            _formatTime(provider.remainingSeconds),
                            style: TextStyle(
                              fontSize: 54,
                              fontWeight: FontWeight.w900,
                              letterSpacing: -1.5,
                              fontFeatures: const [FontFeature.tabularFigures()],
                              color: AppColors.textPrimary(context),
                            ),
                          ),
                          const SizedBox(height: 8),

                          // Cycle Dots
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: List.generate(provider.longBreakInterval, (index) {
                              final cycleIndex = provider.completedFocusSessionsToday % provider.longBreakInterval;
                              final isCurrentOrPast = index < cycleIndex;
                              return Container(
                                margin: const EdgeInsets.symmetric(horizontal: 3),
                                width: 7,
                                height: 7,
                                decoration: BoxDecoration(
                                  color: isCurrentOrPast ? modeColor : AppColors.border(context),
                                  shape: BoxShape.circle,
                                ),
                              );
                            }),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.xl),

              // 4. Primary Actions
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (provider.isRunning) ...[
                    if (provider.isPaused)
                      Expanded(
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: modeColor,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: AppRadii.lg),
                            elevation: 0,
                          ),
                          icon: const Icon(Icons.play_arrow_rounded, size: 22),
                          label: const Text('Resume', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                          onPressed: () {
                            FeedbackService.instance.selection();
                            provider.resumeTimer();
                          },
                        ),
                      )
                    else
                      Expanded(
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFF59E0B),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: AppRadii.lg),
                            elevation: 0,
                          ),
                          icon: const Icon(Icons.pause_rounded, size: 22),
                          label: const Text('Pause', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                          onPressed: () {
                            FeedbackService.instance.selection();
                            provider.pauseTimer();
                          },
                        ),
                      ),
                    const SizedBox(width: AppSpacing.sm),
                    OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.textMuted(context),
                        side: BorderSide(color: AppColors.border(context)),
                        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: AppRadii.lg),
                      ),
                      icon: const Icon(Icons.rotate_left_rounded, size: 20),
                      label: const Text('Reset', style: TextStyle(fontWeight: FontWeight.w600)),
                      onPressed: () {
                        FeedbackService.instance.selection();
                        provider.resetTimer();
                      },
                    ),
                  ] else ...[
                    Expanded(
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: modeColor,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: AppRadii.lg),
                          elevation: 0,
                        ),
                        icon: const Icon(Icons.play_arrow_rounded, size: 24),
                        label: Text(
                          'Start ${isFocusMode ? 'Focus Session' : 'Break'}',
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
                        ),
                        onPressed: () {
                          FeedbackService.instance.selection();
                          provider.startTimer();
                        },
                      ),
                    ),
                  ],
                ],
              ),
              const SizedBox(height: AppSpacing.xl),

              // 5. Today's Performance Card
              Row(
                children: [
                  Expanded(
                    child: AppCard(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppColors.primarySubtle(context),
                              borderRadius: AppRadii.md,
                            ),
                            child: Icon(Icons.timer_outlined, size: 20, color: AppColors.primary(context)),
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '${provider.completedFocusSessionsToday}',
                                  style: AppTypography.headingSm.copyWith(
                                    fontWeight: FontWeight.w800,
                                    color: AppColors.textPrimary(context),
                                  ),
                                ),
                                Text(
                                  'Cycles Today',
                                  style: AppTypography.caption.copyWith(
                                    color: AppColors.textMuted(context),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: AppCard(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppColors.successBg(context),
                              borderRadius: AppRadii.md,
                            ),
                            child: Icon(Icons.schedule_rounded, size: 20, color: AppColors.successText(context)),
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '${provider.completedFocusSessionsToday * provider.focusDurationMinutes}m',
                                  style: AppTypography.headingSm.copyWith(
                                    fontWeight: FontWeight.w800,
                                    color: AppColors.textPrimary(context),
                                  ),
                                ),
                                Text(
                                  'Total Focus',
                                  style: AppTypography.caption.copyWith(
                                    color: AppColors.textMuted(context),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.xl),

              // 6. Recent Session Log
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'RECENT SESSIONS',
                    style: AppTypography.caption.copyWith(
                      color: AppColors.textMuted(context),
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.8,
                    ),
                  ),
                  if (provider.recentSessions.isNotEmpty)
                    TextButton(
                      onPressed: () => provider.loadSessions(),
                      child: Text('Refresh', style: TextStyle(color: AppColors.primary(context), fontSize: 12)),
                    ),
                ],
              ),
              const SizedBox(height: AppSpacing.xs),
              if (provider.recentSessions.isEmpty)
                AppCard(
                  padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                  child: Center(
                    child: Column(
                      children: [
                        Icon(Icons.history_rounded, size: 28, color: AppColors.textMuted(context)),
                        const SizedBox(height: 8),
                        Text(
                          'No sessions logged yet today',
                          style: AppTypography.bodySm.copyWith(color: AppColors.textMuted(context)),
                        ),
                      ],
                    ),
                  ),
                )
              else
                ...provider.recentSessions.take(5).map((s) {
                  final isDone = s.status == 'completed';
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: AppCard(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: isDone ? AppColors.successBg(context) : AppColors.surfaceMuted(context),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              isDone ? Icons.check_rounded : Icons.close_rounded,
                              size: 14,
                              color: isDone ? AppColors.successText(context) : AppColors.textMuted(context),
                            ),
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  s.sessionType.replaceAll('_', ' ').toUpperCase(),
                                  style: AppTypography.bodyBold.copyWith(fontSize: 13),
                                ),
                                Text(
                                  '${s.actualSeconds ~/ 60}m logged · ${s.status}',
                                  style: AppTypography.caption.copyWith(
                                    color: AppColors.textMuted(context),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Text(
                            s.startedAt.length >= 16 ? s.startedAt.substring(11, 16) : '',
                            style: AppTypography.caption.copyWith(
                              color: AppColors.textMuted(context),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }),
              const SizedBox(height: AppSpacing.xl),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildModeTab(
    BuildContext context, {
    required String label,
    required String mode,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    final modeColor = _getModeColor(mode, context);
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          padding: const EdgeInsets.symmetric(vertical: 9),
          decoration: BoxDecoration(
            color: isSelected ? modeColor : Colors.transparent,
            borderRadius: AppRadii.full,
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 12,
              fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
              color: isSelected ? Colors.white : AppColors.textMuted(context),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPresetChip(
    BuildContext context, {
    required String label,
    required bool isSelected,
    bool isCustom = false,
    required VoidCallback onTap,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary(context).withOpacity(isDark ? 0.25 : 0.12)
              : AppColors.surfaceMuted(context),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppColors.primary(context) : AppColors.border(context),
            width: isSelected ? 1.4 : 1.0,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (isCustom) ...[
              Icon(
                Icons.tune_rounded,
                size: 13,
                color: isSelected ? AppColors.primary(context) : AppColors.textMuted(context),
              ),
              const SizedBox(width: 5),
            ],
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? AppColors.primary(context) : AppColors.textPrimary(context),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showCustomDurationSheet(BuildContext context, PomodoroProvider provider) {
    int focus = provider.focusDurationMinutes;
    int shortBreak = provider.shortBreakMinutes;
    int longBreak = provider.longBreakMinutes;
    int interval = provider.longBreakInterval;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) => Container(
          decoration: BoxDecoration(
            color: AppColors.card(ctx),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.textMuted(ctx).withOpacity(0.3),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Focus Interval Settings',
                style: AppTypography.headingSm.copyWith(fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 16),
              _buildDurationRow(
                ctx,
                label: 'Focus Session',
                value: focus,
                unit: 'min',
                onDecrement: () => setSheetState(() => focus = (focus - 5).clamp(5, 120)),
                onIncrement: () => setSheetState(() => focus = (focus + 5).clamp(5, 120)),
              ),
              const SizedBox(height: 10),
              _buildDurationRow(
                ctx,
                label: 'Short Break',
                value: shortBreak,
                unit: 'min',
                onDecrement: () => setSheetState(() => shortBreak = (shortBreak - 1).clamp(1, 30)),
                onIncrement: () => setSheetState(() => shortBreak = (shortBreak + 1).clamp(1, 30)),
              ),
              const SizedBox(height: 10),
              _buildDurationRow(
                ctx,
                label: 'Long Break',
                value: longBreak,
                unit: 'min',
                onDecrement: () => setSheetState(() => longBreak = (longBreak - 5).clamp(5, 60)),
                onIncrement: () => setSheetState(() => longBreak = (longBreak + 5).clamp(5, 60)),
              ),
              const SizedBox(height: 10),
              _buildDurationRow(
                ctx,
                label: 'Cycles Until Long Break',
                value: interval,
                unit: 'cycles',
                onDecrement: () => setSheetState(() => interval = (interval - 1).clamp(2, 8)),
                onIncrement: () => setSheetState(() => interval = (interval + 1).clamp(2, 8)),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary(ctx),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: AppRadii.md),
                ),
                onPressed: () {
                  provider.setDurations(
                    focus: focus,
                    shortBreak: shortBreak,
                    longBreak: longBreak,
                    longBreakInterval: interval,
                  );
                  Navigator.pop(ctx);
                },
                child: const Text('Save Settings', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDurationRow(
    BuildContext context, {
    required String label,
    required int value,
    required String unit,
    required VoidCallback onDecrement,
    required VoidCallback onIncrement,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.surfaceMuted(context),
        borderRadius: AppRadii.md,
        border: Border.all(color: AppColors.border(context)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: AppTypography.bodyBold),
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.remove_circle_outline, size: 20),
                onPressed: onDecrement,
                color: AppColors.primary(context),
              ),
              SizedBox(
                width: 65,
                child: Text(
                  '$value $unit',
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.add_circle_outline, size: 20),
                onPressed: onIncrement,
                color: AppColors.primary(context),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
