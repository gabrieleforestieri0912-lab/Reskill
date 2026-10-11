/// Fonte collegata a un bucket (YouTube, X/Twitter, Reddit, PDF, pagina web).
class Source {
  final String id;
  final String type;
  final String title;
  final String url;
  final String domain;
  final String date;
  final String content;
  final String skillMarkdown;
  final String bucketId;
  final String createdAt;
  final String updatedAt;
  final String? bucketName;

  const Source({
    required this.id,
    required this.type,
    required this.title,
    required this.url,
    required this.domain,
    required this.date,
    required this.content,
    required this.skillMarkdown,
    required this.bucketId,
    required this.createdAt,
    required this.updatedAt,
    this.bucketName,
  });

  factory Source.fromJson(Map<String, dynamic> j) => Source(
        id: j['id'] as String? ?? '',
        type: j['type'] as String? ?? 'webpage',
        title: j['title'] as String? ?? '',
        url: j['url'] as String? ?? '',
        domain: j['domain'] as String? ?? '',
        date: j['date'] as String? ?? '',
        content: j['content'] as String? ?? '',
        skillMarkdown: j['skillMarkdown'] as String? ?? '',
        bucketId: j['bucketId'] as String? ?? '',
        createdAt: j['createdAt'] as String? ?? '',
        updatedAt: j['updatedAt'] as String? ?? '',
        bucketName: j['bucketName'] as String?,
      );

  /// Etichetta leggibile per il tipo di fonte.
  static const Map<String, String> typeLabels = {
    'youtube': 'YouTube',
    'twitter': 'X / Twitter',
    'reddit': 'Reddit',
    'pdf': 'PDF',
    'webpage': 'Web',
    'article': 'Web',
  };

  String get typeLabel => typeLabels[type] ?? type.toUpperCase();
}
