class TimeOfDayData {
  final int morningMinutes; // 5 AM - 12 PM
  final int afternoonMinutes; // 12 PM - 5 PM
  final int eveningMinutes; // 5 PM - 9 PM
  final int nightMinutes; // 9 PM - 5 AM
  final int morningPomodoros;
  final int afternoonPomodoros;
  final int eveningPomodoros;
  final int nightPomodoros;
  final String? peakPeriod; // 'Morning', 'Afternoon', 'Evening', 'Night'
  final double? peakPercentage;
  final bool hasEnoughData;

  const TimeOfDayData({
    required this.morningMinutes,
    required this.afternoonMinutes,
    required this.eveningMinutes,
    required this.nightMinutes,
    required this.morningPomodoros,
    required this.afternoonPomodoros,
    required this.eveningPomodoros,
    required this.nightPomodoros,
    this.peakPeriod,
    this.peakPercentage,
    required this.hasEnoughData,
  });

  factory TimeOfDayData.empty() {
    return const TimeOfDayData(
      morningMinutes: 0,
      afternoonMinutes: 0,
      eveningMinutes: 0,
      nightMinutes: 0,
      morningPomodoros: 0,
      afternoonPomodoros: 0,
      eveningPomodoros: 0,
      nightPomodoros: 0,
      peakPeriod: null,
      peakPercentage: null,
      hasEnoughData: false,
    );
  }
}
