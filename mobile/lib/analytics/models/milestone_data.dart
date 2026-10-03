class MilestoneItem {
  final String id;
  final String title;
  final String description;
  final String category; // 'days', 'streak'
  final int target;
  final int current;
  final bool isUnlocked;
  final double progressPercent;
  final String icon;
  final String badgeColor;

  const MilestoneItem({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.target,
    required this.current,
    required this.isUnlocked,
    required this.progressPercent,
    required this.icon,
    required this.badgeColor,
  });
}

class MilestoneData {
  final List<MilestoneItem> milestones;
  final int unlockedCount;
  final int totalCount;

  const MilestoneData({
    required this.milestones,
    required this.unlockedCount,
    required this.totalCount,
  });

  factory MilestoneData.empty() {
    return const MilestoneData(
      milestones: [],
      unlockedCount: 0,
      totalCount: 0,
    );
  }
}
