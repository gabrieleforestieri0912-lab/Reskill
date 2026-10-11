/// Singola voce di attività recente (bucket o fonte).
class ActivityItem {
  final String type; // 'bucket' | 'source'
  final String id;
  final String name;
  final String date;
  final String? sourceType;

  const ActivityItem({
    required this.type,
    required this.id,
    required this.name,
    required this.date,
    this.sourceType,
  });

  factory ActivityItem.fromJson(Map<String, dynamic> j) => ActivityItem(
        type: j['type'] as String? ?? 'bucket',
        id: j['id'] as String? ?? '',
        name: j['name'] as String? ?? '',
        date: j['date'] as String? ?? '',
        sourceType: j['sourceType'] as String?,
      );
}

/// Statistiche aggregate dell'utente (`/api/stats`).
class Stats {
  final int totalBuckets;
  final int totalSources;
  final int skillsGenerated;
  final Map<String, int> sourcesByType;
  final int totalCreditsUsed;
  final int planCredits;
  final int creditsRemaining;
  final String currentPlan;
  final List<ActivityItem> lastActivity;

  const Stats({
    required this.totalBuckets,
    required this.totalSources,
    required this.skillsGenerated,
    required this.sourcesByType,
    required this.totalCreditsUsed,
    required this.planCredits,
    required this.creditsRemaining,
    required this.currentPlan,
    required this.lastActivity,
  });

  factory Stats.fromJson(Map<String, dynamic> j) => Stats(
        totalBuckets: j['totalBuckets'] as int? ?? 0,
        totalSources: j['totalSources'] as int? ?? 0,
        skillsGenerated: j['skillsGenerated'] as int? ?? 0,
        sourcesByType: (j['sourcesByType'] as Map? ?? {}).map(
          (k, v) => MapEntry(k.toString(), (v as num?)?.toInt() ?? 0),
        ),
        totalCreditsUsed: j['totalCreditsUsed'] as int? ?? 0,
        planCredits: j['planCredits'] as int? ?? 0,
        creditsRemaining: j['creditsRemaining'] as int? ?? 0,
        currentPlan: j['currentPlan'] as String? ?? 'free',
        lastActivity: (j['lastActivity'] as List? ?? [])
            .map((e) => ActivityItem.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}
