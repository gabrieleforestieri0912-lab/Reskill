import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_markdown/flutter_markdown.dart';

import '../config/app_config.dart';
import '../theme/app_colors.dart';

/// Dati passati alla schermata di visualizzazione Skill.
class SkillViewData {
  final String title;
  final String markdown;
  final String? bucketId;
  final bool canShare;

  const SkillViewData({
    required this.title,
    required this.markdown,
    this.bucketId,
    this.canShare = false,
  });
}

/// Visualizza il Markdown di una Skill generata, con copia e condivisione.
class SkillViewScreen extends StatelessWidget {
  final SkillViewData data;
  const SkillViewScreen({super.key, required this.data});

  Future<void> _copy(BuildContext context) async {
    await Clipboard.setData(ClipboardData(text: data.markdown));
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Skill copiata negli appunti')),
      );
    }
  }

  Future<void> _share() async {
    if (data.bucketId == null) return;
    await Clipboard.setData(
      ClipboardData(text: AppConfig.shareUrl(data.bucketId!)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(data.title),
        actions: [
          IconButton(
            icon: const Icon(Icons.copy_outlined),
            onPressed: () => _copy(context),
            tooltip: 'Copia',
          ),
          if (data.canShare)
            IconButton(
              icon: const Icon(Icons.share_outlined),
              onPressed: _share,
              tooltip: 'Condividi',
            ),
        ],
      ),
      body: Markdown(
        data: data.markdown.isEmpty ? '_Skill vuota_' : data.markdown,
        padding: const EdgeInsets.all(16),
        styleSheet: MarkdownStyleSheet(
          h1: const TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w700,
            color: AppColors.text,
          ),
          h2: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppColors.primary,
          ),
          h3: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w700,
            color: AppColors.text,
          ),
          p: const TextStyle(fontSize: 14, color: AppColors.text, height: 1.5),
          code: TextStyle(
            fontSize: 13,
            backgroundColor: AppColors.surfaceAlt,
            color: AppColors.primaryBright,
            fontFamily: 'monospace',
          ),
          codeblockDecoration: BoxDecoration(
            color: AppColors.surfaceAlt,
            borderRadius: BorderRadius.circular(8),
          ),
          blockquote: const TextStyle(
            fontSize: 14,
            color: AppColors.textMuted,
            fontStyle: FontStyle.italic,
          ),
          listBullet: const TextStyle(color: AppColors.primary),
        ),
      ),
    );
  }
}
