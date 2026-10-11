/// Feature associate a un piano di abbonamento.
class PlanFeatures {
  final int maxBuckets;
  final int maxSources;
  final bool aiGeneration;
  final bool prioritySupport;
  final bool teamSharing;

  const PlanFeatures({
    required this.maxBuckets,
    required this.maxSources,
    required this.aiGeneration,
    required this.prioritySupport,
    required this.teamSharing,
  });

  factory PlanFeatures.fromJson(Map<String, dynamic> j) => PlanFeatures(
        maxBuckets: j['maxBuckets'] as int? ?? 0,
        maxSources: j['maxSources'] as int? ?? 0,
        aiGeneration: j['aiGeneration'] as bool? ?? false,
        prioritySupport: j['prioritySupport'] as bool? ?? false,
        teamSharing: j['teamSharing'] as bool? ?? false,
      );

  bool get unlimitedBuckets => maxBuckets == -1;
  bool get unlimitedSources => maxSources == -1;

  String get bucketLimitLabel =>
      unlimitedBuckets ? 'Illimitati' : '$maxBuckets bucket';

  String get sourceLimitLabel =>
      unlimitedSources ? 'Illimitate' : '$maxSources fonti';
}

/// Piano di abbonamento (da `lib/plans.ts` del backend).
class Plan {
  final String id;
  final String name;
  final int price;
  final int credits;
  final String currency;
  final String interval;
  final String? stripePriceId;
  final PlanFeatures features;

  const Plan({
    required this.id,
    required this.name,
    required this.price,
    required this.credits,
    required this.currency,
    required this.interval,
    this.stripePriceId,
    required this.features,
  });

  factory Plan.fromJson(Map<String, dynamic> j) => Plan(
        id: j['id'] as String? ?? 'free',
        name: j['name'] as String? ?? 'Free',
        price: j['price'] as int? ?? 0,
        credits: j['credits'] as int? ?? 0,
        currency: j['currency'] as String? ?? 'EUR',
        interval: j['interval'] as String? ?? 'month',
        stripePriceId: j['stripePriceId'] as String?,
        features: PlanFeatures.fromJson(
          (j['features'] as Map? ?? {}) as Map<String, dynamic>,
        ),
      );

  String get priceLabel =>
      price == 0 ? 'Gratis' : '€$price/${interval == 'month' ? 'mese' : interval}';
}
