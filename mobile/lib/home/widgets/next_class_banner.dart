import 'package:flutter/material.dart';
import '../../attendance/services/class_resolution_service.dart';

class NextClassBanner extends StatelessWidget {
  final List<ResolvedClass> todayClasses;

  const NextClassBanner({
    super.key,
    required this.todayClasses,
  });

  ResolvedClass? _findNextClass() {
    final now = DateTime.now();
    final currentMinutes = now.hour * 60 + now.minute;

    for (final c in todayClasses) {
      if (c.isCancelled) continue;
      final parts = c.startTime.split(':');
      if (parts.length < 2) continue;
      final classMinutes = (int.tryParse(parts[0]) ?? 0) * 60 + (int.tryParse(parts[1]) ?? 0);

      // Next class starting in the future or unmarked
      if (classMinutes >= currentMinutes || c.attendanceStatus == null) {
        return c;
      }
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final nextClass = _findNextClass();
    if (nextClass == null) return const SizedBox.shrink();

    final theme = Theme.of(context);

    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            theme.colorScheme.primary,
            const Color(0xFF6366F1),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: theme.colorScheme.primary.withOpacity(0.25),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.18),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.timer_outlined,
              color: Colors.white,
              size: 24,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'NEXT CLASS',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.0,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  nextClass.subjectName,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  '${nextClass.startTime} · ${nextClass.room != null ? 'Room ${nextClass.room}' : 'No room assigned'}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
