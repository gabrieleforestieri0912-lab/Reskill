import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:flutter/services.dart';

import '../config/app_config.dart';
import '../models/bucket.dart';
import '../models/source.dart';
import '../providers/bucket_provider.dart';
import '../services/api_client.dart';
import '../theme/app_colors.dart';
import '../widgets/common.dart';
import 'add_source_sheet.dart';
import 'skill_view_screen.dart';

/// Dettaglio di un bucket: fonti, generazione Skill e condivisione.
class BucketDetailScreen extends StatefulWidget {
  final String bucketId;
  const BucketDetailScreen({super.key, required this.bucketId});

  @override
  State<BucketDetailScreen> createState() => _BucketDetailScreenState();
}

class _BucketDetailScreenState extends State<BucketDetailScreen> {
  bool _generating = false;
  String? _genError;

  @override
  void initState() {
    super.initState();
    _ensureLoaded();
  }

  void _ensureLoaded() {
    final provider = Provider.of<BucketProvider>(context, listen: false);
    if (provider.byId(widget.bucketId) == null && !provider.loading) {
      provider.fetch();
    }
  }

  Future<void> _addSource() async {
    final result = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      builder: (_) => AddSourceSheet(bucketId: widget.bucketId),
    );
    if (result != null && result.isNotEmpty && mounted) {
      showSuccess(context, 'Fonte aggiunta');
    }
  }

  Future<void> _deleteSource(Source source) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Elimina fonte'),
        content: Text('Eliminare "${source.title}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Annulla'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppColors.danger),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Elimina'),
          ),
        ],
      ),
    );
    if (confirm != true) return;
    if (!mounted) return;
    try {
      await Provider.of<BucketProvider>(
        context,
        listen: false,
      ).deleteSource(widget.bucketId, source.id);
    } on ApiException catch (e) {
      if (mounted) showError(context, e.message);
    }
  }

  Future<void> _generate() async {
    final provider = Provider.of<BucketProvider>(context, listen: false);
    final bucket = provider.byId(widget.bucketId);
    if (bucket == null) return;
    if (bucket.sources.isEmpty) {
      showError(context, 'Aggiungi almeno una fonte prima di generare');
      return;
    }

    setState(() {
      _generating = true;
      _genError = null;
    });

    final summary = bucket.sources
        .map((s) => '# ${s.title}\n${s.content}')
        .join('\n\n')
        .trim();
    final prompt = '${bucket.name}. ${bucket.description}'.trim();

    try {
      final generated = await Api.instance.generateSkill(
        prompt: prompt,
        sourcesSummary: summary.length > 12000
            ? summary.substring(0, 12000)
            : summary,
        onChunk: (_) {},
        model: 'gpt-4o-mini',
      );

      final updated = await Api.instance.updateBucket(
        bucket.id,
        generatedSkill: generated,
      );
      provider.replace(updated);
      if (mounted) {
        setState(() => _generating = false);
        context.push(
          '/skill',
          extra: SkillViewData(
            title: bucket.name,
            markdown: generated,
            bucketId: bucket.id,
            canShare: true,
          ),
        );
      }
    } on ApiException catch (e) {
      setState(() {
        _genError = e.message;
        _generating = false;
      });
      if (e.upgrade && mounted) context.push('/plans');
      return;
    } catch (_) {
      setState(() {
        _genError = 'Errore di rete durante la generazione';
        _generating = false;
      });
      return;
    }
  }

  Future<void> _share() async {
    await Clipboard.setData(
      ClipboardData(text: AppConfig.shareUrl(widget.bucketId)),
    );
    if (mounted) showSuccess(context, 'Link copiato negli appunti');
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<BucketProvider>(context);
    final bucket = provider.byId(widget.bucketId);

    return Scaffold(
      appBar: AppBar(
        title: Text(bucket?.name ?? 'Bucket'),
        actions: [
          if (bucket?.hasSkill ?? false)
            IconButton(
              icon: const Icon(Icons.share_outlined),
              onPressed: _share,
              tooltip: 'Condividi',
            ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => provider.fetch(),
          ),
        ],
      ),
      body: _buildBody(bucket, provider),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _addSource,
        icon: const Icon(Icons.add_link),
        label: const Text('Aggiungi fonte'),
      ),
    );
  }

  Widget _buildBody(Bucket? bucket, BucketProvider provider) {
    if (bucket == null) {
      if (provider.loading) {
        return const Center(child: CircularProgressIndicator());
      }
      return const EmptyState(
        icon: Icons.error_outline,
        title: 'Bucket non trovato',
        subtitle: 'Potrebbe essere stato eliminato.',
      );
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          bucket.description,
          style: const TextStyle(color: AppColors.textMuted, fontSize: 13),
        ),
        const SizedBox(height: 14),
        Row(
          children: [
            Expanded(
              child: GradientButton(
                label: _generating ? 'Generazione...' : 'Genera Skill',
                icon: Icons.auto_awesome,
                loading: _generating,
                onPressed: _generating ? null : _generate,
              ),
            ),
            if (bucket.hasSkill) ...[
              const SizedBox(width: 10),
              IconButton.filled(
                onPressed: () => context.push(
                  '/skill',
                  extra: SkillViewData(
                    title: bucket.name,
                    markdown: bucket.generatedSkill!,
                    bucketId: bucket.id,
                    canShare: true,
                  ),
                ),
                icon: const Icon(Icons.visibility_outlined),
                tooltip: 'Apri Skill',
              ),
            ],
          ],
        ),
        if (_genError != null) ...[
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.danger.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              _genError!,
              style: const TextStyle(color: AppColors.danger, fontSize: 12.5),
            ),
          ),
        ],
        const SizedBox(height: 22),
        SectionHeader(title: 'Fonti (${bucket.sourceCount})'),
        const SizedBox(height: 10),
        if (bucket.sources.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 24),
            child: Text(
              'Nessuna fonte. Aggiungi un URL per iniziare.',
              style: TextStyle(color: AppColors.textMuted, fontSize: 13),
              textAlign: TextAlign.center,
            ),
          )
        else
          ...bucket.sources.map(
            (s) => _SourceTile(source: s, onDelete: () => _deleteSource(s)),
          ),
        const SizedBox(height: 40),
      ],
    );
  }
}

class _SourceTile extends StatelessWidget {
  final Source source;
  final VoidCallback onDelete;

  const _SourceTile({required this.source, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        leading: SourceTypeBadge(type: source.type),
        title: Text(
          source.title,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
        ),
        subtitle: Text(
          source.domain,
          style: const TextStyle(fontSize: 11, color: AppColors.textFaint),
        ),
        trailing: IconButton(
          icon: const Icon(Icons.delete_outline, color: AppColors.textFaint),
          onPressed: onDelete,
        ),
        onTap: () {
          if (source.url.isNotEmpty) {
            Clipboard.setData(ClipboardData(text: source.url));
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('URL copiato negli appunti')),
            );
          }
        },
      ),
    );
  }
}
