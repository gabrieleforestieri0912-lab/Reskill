import 'source.dart';

/// Raccoglitore di fonti. Ogni bucket genera una Skill.
class Bucket {
  final String id;
  final String name;
  final String description;
  final String userEmail;
  final String? generatedSkill;
  final String createdAt;
  final String updatedAt;
  final List<Source> sources;

  const Bucket({
    required this.id,
    required this.name,
    required this.description,
    required this.userEmail,
    this.generatedSkill,
    required this.createdAt,
    required this.updatedAt,
    required this.sources,
  });

  factory Bucket.fromJson(Map<String, dynamic> j) => Bucket(
        id: j['id'] as String? ?? '',
        name: j['name'] as String? ?? '',
        description: j['description'] as String? ?? '',
        userEmail: j['userEmail'] as String? ?? '',
        generatedSkill: j['generatedSkill'] as String?,
        createdAt: j['createdAt'] as String? ?? '',
        updatedAt: j['updatedAt'] as String? ?? '',
        sources: (j['sources'] as List? ?? [])
            .map((e) => Source.fromJson(e as Map<String, dynamic>))
            .toList(),
      );

  int get sourceCount => sources.length;

  bool get hasSkill =>
      generatedSkill != null && generatedSkill!.trim().isNotEmpty;
}
