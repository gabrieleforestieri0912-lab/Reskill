import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../models/bucket.dart';
import '../providers/bucket_provider.dart';
import '../services/api_client.dart';
import '../theme/app_colors.dart';
import '../widgets/common.dart';

/// Elenco dei bucket dell'utente.
class BucketsScreen extends StatefulWidget {
  const BucketsScreen({super.key});

  @override
  State<BucketsScreen> createState() => _BucketsScreenState();
}

class _BucketsScreenState extends State<BucketsScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      if (!mounted) return;
      Provider.of<BucketProvider>(context, listen: false).fetch();
    });
  }

  Future<void> _createBucket() async {
    final nameCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    final result = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Nuovo bucket'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameCtrl,
              decoration: const InputDecoration(labelText: 'Nome'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: descCtrl,
              decoration:
                  const InputDecoration(labelText: 'Descrizione (opz.)'),
              maxLines: 2,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Annulla'),
          ),
          FilledButton(
            onPressed: () {
              if (nameCtrl.text.trim().isEmpty) return;
              Navigator.pop(
                ctx,
                nameCtrl.text.trim(),
              );
            },
            child: const Text('Crea'),
          ),
        ],
      ),
    );

    if (result == null) return;
    if (!mounted) return;
    final provider = Provider.of<BucketProvider>(context, listen: false);
    try {
      final bucket = await provider.create(result, descCtrl.text.trim());
      if (mounted) context.go('/bucket/${bucket.id}');
    } on ApiException catch (e) {
      if (mounted) showError(context, e.message);
    } catch (_) {
      if (mounted) showError(context, 'Errore di rete');
    }
  }

  Future<void> _delete(Bucket bucket) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Elimina bucket'),
        content: Text(
            'Sei sicuro di voler eliminare "${bucket.name}" e tutte le sue fonti?'),
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
      await Provider.of<BucketProvider>(context, listen: false)
          .delete(bucket.id);
    } on ApiException catch (e) {
      if (mounted) showError(context, e.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<BucketProvider>(context);
    return Scaffold(
      appBar: AppBar(title: const Text('I tuoi bucket')),
      body: _buildBody(provider),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _createBucket,
        icon: const Icon(Icons.add),
        label: const Text('Nuovo bucket'),
      ),
    );
  }

  Widget _buildBody(BucketProvider provider) {
    if (provider.loading && provider.buckets.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }
    if (provider.buckets.isEmpty) {
      return EmptyState(
        icon: Icons.folder_outlined,
        title: 'Nessun bucket',
        subtitle:
            'Crea un bucket e aggiungi fonti per generare la tua prima Skill.',
        action: GradientButton(
          label: 'Crea bucket',
          onPressed: _createBucket,
          block: false,
        ),
      );
    }
    return RefreshIndicator(
      onRefresh: () => provider.fetch(),
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: provider.buckets.length,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (_, i) {
          final b = provider.buckets[i];
          return _BucketCard(
            bucket: b,
            onTap: () => context.go('/bucket/${b.id}'),
            onDelete: () => _delete(b),
          );
        },
      ),
    );
  }
}

class _BucketCard extends StatelessWidget {
  final Bucket bucket;
  final VoidCallback onTap;
  final VoidCallback onDelete;

  const _BucketCard({
    required this.bucket,
    required this.onTap,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      bucket.name,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  if (bucket.hasSkill)
                    const Icon(Icons.verified, color: AppColors.success, size: 18),
                  const SizedBox(width: 8),
                  PopupMenuButton<String>(
                    onSelected: (v) => v == 'delete' ? onDelete() : null,
                    itemBuilder: (_) => [
                      const PopupMenuItem(
                        value: 'delete',
                        child: Text('Elimina',
                            style: TextStyle(color: AppColors.danger)),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                bucket.description,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                    fontSize: 13, color: AppColors.textMuted),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                children: [
                  Chip(
                    label: Text('${bucket.sourceCount} fonti'),
                    backgroundColor: AppColors.surfaceAlt,
                    labelStyle:
                        const TextStyle(fontSize: 11, color: AppColors.text),
                    visualDensity: VisualDensity.compact,
                  ),
                  if (bucket.hasSkill)
                    const Chip(
                      label: Text('Skill pronta'),
                      backgroundColor: Color(0x228CCB7A),
                      labelStyle:
                          TextStyle(fontSize: 11, color: AppColors.success),
                      visualDensity: VisualDensity.compact,
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
