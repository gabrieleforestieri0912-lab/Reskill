import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../providers/bucket_provider.dart';
import '../services/api_client.dart';
import '../theme/app_colors.dart';
import '../widgets/common.dart';

/// Sheet per aggiungere una fonte a un bucket a partire da un URL.
/// Se [bucketId] è nullo, crea automaticamente un nuovo bucket dalla fonte
/// (comportamento "come l'estensione": incolla il link e ottieni la Skill).
class AddSourceSheet extends StatefulWidget {
  final String? bucketId;
  const AddSourceSheet({super.key, this.bucketId});

  @override
  State<AddSourceSheet> createState() => _AddSourceSheetState();
}

class _AddSourceSheetState extends State<AddSourceSheet> {
  final _urlCtrl = TextEditingController();
  bool _loading = false;
  String? _error;
  Map<String, dynamic>? _preview;

  @override
  void dispose() {
    _urlCtrl.dispose();
    super.dispose();
  }

  Future<void> _extract() async {
    final url = _urlCtrl.text.trim();
    final parsed = Uri.tryParse(url);
    if (parsed == null || !parsed.hasScheme || parsed.host.isEmpty) {
      setState(
        () => _error = 'Inserisci un URL valido, ad esempio https://...',
      );
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      _preview = await Api.instance.extract(url);
      setState(() => _loading = false);
    } on ApiException catch (e) {
      setState(() {
        _error = e.message;
        _loading = false;
      });
    } catch (_) {
      setState(() {
        _error = 'Errore di rete durante l\'estrazione';
        _loading = false;
      });
    }
  }

  Future<void> _confirm() async {
    if (_preview == null) return;
    setState(() => _loading = true);
    final provider = Provider.of<BucketProvider>(context, listen: false);
    try {
      String bucketId = widget.bucketId ?? '';
      if (bucketId.isEmpty) {
        final title = (_preview!['title'] as String?)?.trim().isNotEmpty == true
            ? _preview!['title'] as String
            : ((_preview!['domain'] as String?) ?? 'Skill');
        final bucket = await provider.create(title, 'Skill generata da link');
        bucketId = bucket.id;
      }
      await provider.addSource(bucketId, {
        'type': _preview!['type'],
        'title': _preview!['title'],
        'url': _preview!['url'],
        'domain': _preview!['domain'],
        'date': _preview!['date'],
        'content': _preview!['content'],
        'skillMarkdown': '',
      });
      if (mounted) Navigator.pop(context, bucketId);
    } on ApiException catch (e) {
      setState(() {
        _error = e.message;
        _loading = false;
      });
      if (e.upgrade) {
        if (mounted) context.push('/plans');
      }
    } catch (_) {
      setState(() {
        _error = 'Errore di rete';
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
        left: 20,
        right: 20,
        top: 20,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              const Text(
                'Aggiungi fonte',
                style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700),
              ),
              const Spacer(),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: _urlCtrl,
                  decoration: const InputDecoration(
                    hintText: 'https://youtube.com/... , articolo, PDF...',
                  ),
                  onFieldSubmitted: (_) => _extract(),
                ),
              ),
              const SizedBox(width: 10),
              FilledButton(
                onPressed: _loading ? null : _extract,
                child: const Text('Estrai'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (_error != null)
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.danger.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                _error!,
                style: const TextStyle(color: AppColors.danger, fontSize: 12.5),
              ),
            ),
          if (_preview != null) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      SourceTypeBadge(type: _preview!['type'] as String),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _preview!['title'] as String? ?? '',
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    (_preview!['content'] as String? ?? '').length > 180
                        ? '${_preview!['content'].substring(0, 180)}...'
                        : _preview!['content'] as String? ?? '',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textMuted,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            GradientButton(
              label: 'Aggiungi al bucket',
              loading: _loading,
              onPressed: _confirm,
            ),
          ],
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}
