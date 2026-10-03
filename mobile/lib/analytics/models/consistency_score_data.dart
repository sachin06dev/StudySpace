class ConsistencyScoreImprovement {
  final String title;
  final String action;
  final double pointsGain;
  final String category; // 'days', 'streak', 'goal'

  const ConsistencyScoreImprovement({
    required this.title,
    required this.action,
    required this.pointsGain,
    required this.category,
  });
}

class ConsistencyScoreData {
  final int overallScore; // 0 - 100
  final String ratingLabel;
  final double studyDaysScore; // max 40
  final double streakScore; // max 35
  final double goalScore; // max 25
  final int activeDaysLast30;
  final int currentStreak;
  final int weekStudyMinutes;
  final int goalMinutes;
  final List<ConsistencyScoreImprovement> improvements;

  const ConsistencyScoreData({
    required this.overallScore,
    required this.ratingLabel,
    required this.studyDaysScore,
    required this.streakScore,
    required this.goalScore,
    required this.activeDaysLast30,
    required this.currentStreak,
    required this.weekStudyMinutes,
    required this.goalMinutes,
    required this.improvements,
  });

  factory ConsistencyScoreData.empty() {
    return const ConsistencyScoreData(
      overallScore: 0,
      ratingLabel: 'Getting Started',
      studyDaysScore: 0.0,
      streakScore: 0.0,
      goalScore: 0.0,
      activeDaysLast30: 0,
      currentStreak: 0,
      weekStudyMinutes: 0,
      goalMinutes: 600,
      improvements: [],
    );
  }
}
