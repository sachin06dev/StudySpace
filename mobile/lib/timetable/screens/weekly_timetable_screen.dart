import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../models/subject.dart';
import '../models/timetable_exception.dart';
import '../models/timetable_slot.dart';
import '../providers/timetable_provider.dart';
import '../widgets/add_extra_class_sheet.dart';
import '../widgets/add_slot_sheet.dart';
import '../../attendance/providers/attendance_provider.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/services/feedback_service.dart';
import '../../core/utils/time_formatter.dart';
import '../../scanner/screens/scan_timetable_screen.dart';
import 'exception_dialog.dart';
import 'semester_management_screen.dart';
import 'subject_management_screen.dart';

class _TimetableDisplayItem {
  final String id;
  final String? slotId;
  final String subjectId;
  final String subjectName;
  final String startTime;
  final String endTime;
  final String? room;
  final String? faculty;
  final String classType;
  final bool isExtra;
  final bool isCancelled;
  final TimetableSlot? slot;
  final TimetableException? exception;

  _TimetableDisplayItem({
    required this.id,
    this.slotId,
    required this.subjectId,
    required this.subjectName,
    required this.startTime,
    required this.endTime,
    this.room,
    this.faculty,
    required this.classType,
    required this.isExtra,
    required this.isCancelled,
    this.slot,
    this.exception,
  });
}

class WeeklyTimetableScreen extends StatefulWidget {
  const WeeklyTimetableScreen({super.key});

  @override
  State<WeeklyTimetableScreen> createState() => _WeeklyTimetableScreenState();
}

class _WeeklyTimetableScreenState extends State<WeeklyTimetableScreen> {
  late int _selectedDayIndex;
  final List<String> _days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  final List<String> _dayFullNames = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  @override
  void initState() {
    super.initState();
    // Default to today's day of week: 0 = Mon ... 6 = Sun
    _selectedDayIndex = (DateTime.now().weekday - 1) % 7;
  }

  DateTime _getDateForDayIndex(int dayIndex) {
    final now = DateTime.now();
    final currentIso = (now.weekday - 1) % 7;
    final diff = dayIndex - currentIso;
    return now.add(Duration(days: diff));
  }

  @override
  Widget build(BuildContext context) {
    final timetableProvider = context.watch<TimetableProvider>();
    final attendanceProvider = context.watch<AttendanceProvider>();

    final activeSem = timetableProvider.activeSemester ?? attendanceProvider.activeSemester;
    final subjects = timetableProvider.subjects.isNotEmpty
        ? timetableProvider.subjects
        : attendanceProvider.subjects;
    final slots = timetableProvider.slots.isNotEmpty
        ? timetableProvider.slots
        : attendanceProvider.slots;
    final exceptions = timetableProvider.exceptions.isNotEmpty
        ? timetableProvider.exceptions
        : attendanceProvider.exceptions;

    final subjectMap = <String, Subject>{};
    for (final s in subjects) {
      subjectMap[s.id] = s;
    }

    // Build items for current selected day
    final dayDate = _getDateForDayIndex(_selectedDayIndex);
    final dayDateStr = DateFormat('yyyy-MM-dd').format(dayDate);

    final cancelledSlotIds = <String>{};
    for (final ex in exceptions) {
      if (ex.exceptionType == 'cancelled' &&
          ex.exceptionDate == dayDateStr &&
          ex.timetableSlotId != null) {
        cancelledSlotIds.add(ex.timetableSlotId!);
      }
    }

    final items = <_TimetableDisplayItem>[];
    final daySlots = slots.where((s) => s.dayOfWeek == _selectedDayIndex).toList();

    for (final slot in daySlots) {
      final sub = subjectMap[slot.subjectId];
      final isCancelled = cancelledSlotIds.contains(slot.id);
      items.add(
        _TimetableDisplayItem(
          id: slot.id,
          slotId: slot.id,
          subjectId: slot.subjectId,
          subjectName: sub?.name ?? 'Unknown Subject',
          startTime: slot.startTime.length >= 5 ? slot.startTime.substring(0, 5) : slot.startTime,
          endTime: slot.endTime.length >= 5 ? slot.endTime.substring(0, 5) : slot.endTime,
          room: slot.roomOverride ?? sub?.defaultRoom,
          faculty: slot.facultyOverride ?? sub?.faculty,
          classType: slot.classTypeOverride ?? sub?.classType ?? 'theory',
          isExtra: false,
          isCancelled: isCancelled,
          slot: slot,
        ),
      );
    }

    // Include extra classes
    for (final ex in exceptions) {
      if (ex.exceptionType == 'extra' && ex.exceptionDate == dayDateStr && ex.subjectId != null) {
        final sub = subjectMap[ex.subjectId];
        final start = ex.startTime ?? '10:00';
        final end = ex.endTime ?? '11:00';
        items.add(
          _TimetableDisplayItem(
            id: ex.id,
            subjectId: ex.subjectId!,
            subjectName: sub?.name ?? 'Extra Class',
            startTime: start.length >= 5 ? start.substring(0, 5) : start,
            endTime: end.length >= 5 ? end.substring(0, 5) : end,
            room: ex.room ?? sub?.defaultRoom,
            faculty: ex.faculty ?? sub?.faculty,
            classType: 'extra',
            isExtra: true,
            isCancelled: false,
            exception: ex,
          ),
        );
      }
    }

    items.sort((a, b) => a.startTime.compareTo(b.startTime));

    return Scaffold(
      backgroundColor: AppColors.background(context),
      appBar: AppBar(
        titleSpacing: 20,
        backgroundColor: AppColors.background(context),
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Weekly Timetable',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w900,
                letterSpacing: -0.5,
                color: AppColors.textPrimary(context),
              ),
            ),
            if (activeSem != null)
              Text(
                activeSem.name,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: AppColors.primary(context),
                ),
              ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.document_scanner_rounded),
            tooltip: 'Scan Timetable with AI',
            onPressed: () {
              FeedbackService.instance.selection();
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const ScanTimetableScreen()),
              );
            },
          ),
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert_rounded),
            color: AppColors.card(context),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            onSelected: (val) {
              FeedbackService.instance.selection();
              if (val == 'extra') {
                AddExtraClassSheet.show(context, initialDate: dayDate);
              } else if (val == 'semesters') {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const SemesterManagementScreen()),
                );
              } else if (val == 'subjects') {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const SubjectManagementScreen()),
                );
              }
            },
            itemBuilder: (ctx) => [
              const PopupMenuItem(
                value: 'extra',
                child: Row(
                  children: [
                    Icon(Icons.add_circle_outline_rounded, size: 18),
                    SizedBox(width: 10),
                    Text('Schedule Extra Class'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'subjects',
                child: Row(
                  children: [
                    Icon(Icons.book_outlined, size: 18),
                    SizedBox(width: 10),
                    Text('Manage Subjects'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'semesters',
                child: Row(
                  children: [
                    Icon(Icons.school_outlined, size: 18),
                    SizedBox(width: 10),
                    Text('Manage Semesters'),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(width: 8),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          FeedbackService.instance.selection();
          if (activeSem != null) {
            AddSlotSheet.show(context, initialDay: _selectedDayIndex);
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Please select or create an active semester first.')),
            );
          }
        },
        backgroundColor: AppColors.primary(context),
        foregroundColor: Colors.white,
        elevation: 3,
        child: const Icon(Icons.add_rounded),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // 1. Day Selector Strip
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                physics: const BouncingScrollPhysics(),
                child: Row(
                  children: List.generate(7, (i) {
                    final isSelected = _selectedDayIndex == i;
                    final slotCount = slots.where((s) => s.dayOfWeek == i).length;

                    return Padding(
                      padding: const EdgeInsets.only(right: 6),
                      child: InkWell(
                        borderRadius: BorderRadius.circular(12),
                        onTap: () {
                          FeedbackService.instance.selection();
                          setState(() {
                            _selectedDayIndex = i;
                          });
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? AppColors.primary(context)
                                : AppColors.card(context),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isSelected
                                  ? AppColors.primary(context)
                                  : AppColors.border(context),
                            ),
                          ),
                          child: Row(
                            children: [
                              Text(
                                _days[i],
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w800,
                                  color: isSelected
                                      ? Colors.white
                                      : AppColors.textPrimary(context),
                                ),
                              ),
                              if (slotCount > 0) ...[
                                const SizedBox(width: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                  decoration: BoxDecoration(
                                    color: isSelected
                                        ? Colors.white.withValues(alpha: 0.25)
                                        : AppColors.surfaceRaised(context),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    '$slotCount',
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      color: isSelected
                                          ? Colors.white
                                          : AppColors.textMuted(context),
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ),
                    );
                  }),
                ),
              ),
            ),

            // 2. Day Subheading
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '${_dayFullNames[_selectedDayIndex]} Schedule',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary(context),
                    ),
                  ),
                  Text(
                    '${items.length} ${items.length == 1 ? 'class' : 'classes'}',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textMuted(context),
                    ),
                  ),
                ],
              ),
            ),

            // 3. Classes Vertical Timeline / List
            Expanded(
              child: items.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.calendar_today_outlined,
                            size: 40,
                            color: AppColors.textMuted(context).withValues(alpha: 0.5),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            'No Classes on ${_dayFullNames[_selectedDayIndex]}',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w800,
                              color: AppColors.textPrimary(context),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Tap + below to add a recurring class.',
                            style: TextStyle(
                              fontSize: 12,
                              color: AppColors.textMuted(context),
                            ),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                      itemCount: items.length,
                      itemBuilder: (context, index) {
                        final item = items[index];

                        return Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: InkWell(
                            borderRadius: AppRadii.lg,
                            onTap: () {
                              FeedbackService.instance.selection();
                              if (item.slot != null) {
                                AddSlotSheet.show(
                                  context,
                                  existingSlot: item.slot,
                                  initialDay: _selectedDayIndex,
                                );
                              } else if (item.exception != null) {
                                showDialog(
                                  context: context,
                                  builder: (_) => const ExceptionDialog(),
                                );
                              }
                            },
                            child: Container(
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: item.isCancelled
                                    ? AppColors.card(context).withValues(alpha: 0.6)
                                    : AppColors.card(context),
                                borderRadius: AppRadii.lg,
                                border: Border.all(
                                  color: item.isExtra
                                      ? AppColors.primary(context).withValues(alpha: 0.5)
                                      : item.isCancelled
                                          ? AppColors.dangerBorder(context).withValues(alpha: 0.5)
                                          : AppColors.border(context),
                                ),
                              ),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Time Column
                                  Container(
                                    width: 72,
                                    padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
                                    decoration: BoxDecoration(
                                      color: AppColors.surfaceRaised(context),
                                      borderRadius: AppRadii.md,
                                    ),
                                    child: Column(
                                      children: [
                                        Text(
                                          TimeFormatter.format12Hour(item.startTime),
                                          style: TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.w800,
                                            color: AppColors.textPrimary(context),
                                          ),
                                        ),
                                        Text(
                                          TimeFormatter.format12Hour(item.endTime),
                                          style: TextStyle(
                                            fontSize: 10,
                                            color: AppColors.textMuted(context),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(width: 12),

                                  // Details Column
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          children: [
                                            Expanded(
                                              child: Text(
                                                item.subjectName,
                                                style: TextStyle(
                                                  fontSize: 14,
                                                  fontWeight: FontWeight.w800,
                                                  color: item.isCancelled
                                                      ? AppColors.textMuted(context)
                                                      : AppColors.textPrimary(context),
                                                  decoration: item.isCancelled
                                                      ? TextDecoration.lineThrough
                                                      : null,
                                                ),
                                              ),
                                            ),
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                              decoration: BoxDecoration(
                                                color: item.isCancelled
                                                    ? AppColors.dangerBg(context)
                                                    : item.isExtra
                                                        ? AppColors.primarySubtle(context)
                                                        : AppColors.surfaceRaised(context),
                                                borderRadius: AppRadii.sm,
                                              ),
                                              child: Text(
                                                item.isCancelled
                                                    ? 'CANCELLED'
                                                    : item.isExtra
                                                        ? 'EXTRA'
                                                        : item.classType.toUpperCase(),
                                                style: TextStyle(
                                                  fontSize: 9,
                                                  fontWeight: FontWeight.w800,
                                                  letterSpacing: 0.5,
                                                  color: item.isCancelled
                                                      ? AppColors.dangerText(context)
                                                      : item.isExtra
                                                          ? AppColors.primary(context)
                                                          : AppColors.textMuted(context),
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 4),
                                        Row(
                                          children: [
                                            if (item.room != null && item.room!.isNotEmpty) ...[
                                              Icon(Icons.room_outlined, size: 13, color: AppColors.primary(context)),
                                              const SizedBox(width: 3),
                                              Text(
                                                'Room ${item.room}',
                                                style: TextStyle(
                                                  fontSize: 11,
                                                  fontWeight: FontWeight.w600,
                                                  color: AppColors.textSecondary(context),
                                                ),
                                              ),
                                              const SizedBox(width: 10),
                                            ],
                                            if (item.faculty != null && item.faculty!.isNotEmpty) ...[
                                              Icon(Icons.person_outline_rounded, size: 13, color: AppColors.textMuted(context)),
                                              const SizedBox(width: 3),
                                              Expanded(
                                                child: Text(
                                                  item.faculty!,
                                                  style: TextStyle(
                                                    fontSize: 11,
                                                    color: AppColors.textMuted(context),
                                                  ),
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ),
                                            ],
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(width: 4),
                                  Icon(
                                    Icons.edit_outlined,
                                    size: 16,
                                    color: AppColors.textMuted(context),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
