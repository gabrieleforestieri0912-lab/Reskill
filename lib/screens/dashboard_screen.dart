import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../models/stats.dart';
import '../providers/auth_provider.dart';
import '../screens/add_source_sheet.dart';
import '../services/api_client.dart';
import '../theme/app_colors.dart';
import '../widgets/common.dart';

/// Dashboard: statistiche, crediti residui e attività recente.
class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  Stats? _stats;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      _stats = await Api.instance.getStats();
    } on ApiException catch (e) {
      _error = e.message;
    } catch (_) {
      _error = 'Errore di rete';
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  /// Apre la sheet per incollare un link e creare/subito una Skill.
  /// Speculare all'estensione browser: incolla l'URL, ottieni la Skill.
  Future<void> _openAddLink() async {
    final result = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (_) => const AddSourceSheet(),
    );
    if (result != null && mounted) context.go('/bucket/$result');
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Reskill'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _load,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Text(_error!,
                      style: const TextStyle(color: AppColors.danger)),
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      Text(
                        'Ciao${auth.name != null ? ' ${auth.name}' : ''} 👋',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        auth.email ?? '',
                        style: const TextStyle(
                            color: AppColors.textMuted, fontSize: 13),
                      ),
                      const SizedBox(height: 18),
                      _buildComposer(),
                      const SizedBox(height: 18),
                      Row(
                        children: [
                          StatTile(
                            label: 'Bucket',
                            value: '${_stats?.totalBuckets ?? 0}',
                            icon: Icons.folder_outlined,
                          ),
                          const SizedBox(width: 10),
                          StatTile(
                            label: 'Fonti',
                            value: '${_stats?.totalSources ?? 0}',
                            icon: Icons.link_outlined,
                          ),
                          const SizedBox(width: 10),
                          StatTile(
                            label: 'Skill',
                            value: '${_stats?.skillsGenerated ?? 0}',
                            icon: Icons.auto_awesome_outlined,
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      _buildCredits(),
                      const SizedBox(height: 22),
                      SectionHeader(
                        title: 'Attività recente',
                        trailing: TextButton(
                          onPressed: () => context.go('/buckets'),
                          child: const Text('Vedi bucket',
                              style: TextStyle(fontSize: 12.5)),
                        ),
                      ),
                      const SizedBox(height: 10),
                      _buildActivity(),
                      const SizedBox(height: 80),
                    ],
                  ),
                ),
    );
  }

  Widget _buildComposer() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.auto_awesome,
                  color: AppColors.primary, size: 18),
              const SizedBox(width: 8),
              const Text(
                'Crea una Skill da un link',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          const Text(
            'Incolla un URL (YouTube, articolo, PDF, social) e trasformalo in Markdown.',
            style: TextStyle(fontSize: 12.5, color: AppColors.textMuted),
          ),
          const SizedBox(height: 14),
          GradientButton(
            label: 'Inserisci link',
            onPressed: _openAddLink,
          ),
        ],
      ),
    );
  }

  Widget _buildCredits() {
    final credits = _stats?.creditsRemaining ?? 0;
    final total = _stats?.planCredits ?? 0;
    final ratio = total > 0 ? credits / total : 0.0;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Crediti reskill',
                  style: TextStyle(
                      fontSize: 13, color: AppColors.textMuted)),
              Text(
                _stats?.currentPlan.toUpperCase() ?? 'FREE',
                style: const TextStyle(
                    fontWeight: FontWeight.w700, color: AppColors.primary),
              ),
            ],
          ),
          const SizedBox(height: 10),
          LinearProgressIndicator(
            value: ratio.clamp(0.0, 1.0),
            backgroundColor: AppColors.surfaceAlt,
            color: AppColors.primary,
            minHeight: 8,
            borderRadius: BorderRadius.circular(4),
          ),
          const SizedBox(height: 8),
          Text(
            '$credits / $total crediti rimanenti',
            style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
          ),
        ],
      ),
    );
  }

  Widget _buildActivity() {
    final items = _stats?.lastActivity ?? [];
    if (items.isEmpty) {
      return const Text(
        'Nessuna attività ancora. Crea il tuo primo bucket!',
        style: TextStyle(color: AppColors.textMuted, fontSize: 13),
      );
    }
    return Column(
      children: items.take(12).map((item) {
        final isBucket = item.type == 'bucket';
        final date = _formatDate(item.date);
        return ListTile(
          contentPadding: EdgeInsets.zero,
          leading: Icon(
            isBucket ? Icons.folder_outlined : Icons.link_outlined,
            color: AppColors.primary,
          ),
          title: Text(
            item.name,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 14),
          ),
          subtitle: Text(
            isBucket ? 'Bucket • $date' : 'Fonte • $date',
            style: const TextStyle(fontSize: 11, color: AppColors.textFaint),
          ),
          onTap: isBucket ? () => context.go('/bucket/${item.id}') : null,
        );
      }).toList(),
    );
  }

  String _formatDate(String iso) {
    try {
      return DateFormat('dd MMM yyyy', 'it_IT')
          .format(DateTime.parse(iso).toLocal());
    } catch (_) {
      return iso;
    }
  }
}
