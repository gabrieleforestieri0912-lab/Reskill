import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter/services.dart';

import '../models/plan.dart';
import '../services/api_client.dart';
import '../theme/app_colors.dart';
import '../widgets/common.dart';
import '../config/plan_catalog.dart';

/// Schermata piani e abbonamento.
class PlansScreen extends StatefulWidget {
  const PlansScreen({super.key});

  @override
  State<PlansScreen> createState() => _PlansScreenState();
}

class _PlansScreenState extends State<PlansScreen> {
  Map<String, dynamic>? _subscription;
  bool _loading = true;
  String? _pendingPlan;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      _subscription = await Api.instance.getSubscription();
    } on ApiException catch (e) {
      _subscription = {'plan': 'free', 'planDetails': null, 'error': e.message};
    } catch (_) {
      _subscription = {'plan': 'free', 'planDetails': null};
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _upgrade(Plan plan) async {
    if (plan.id == 'free') return;
    setState(() => _pendingPlan = plan.id);
    try {
      final res = await Api.instance.createCheckout(plan.id);
      if (res['url'] != null && (res['url'] as String).isNotEmpty) {
        await Clipboard.setData(ClipboardData(text: res['url'] as String));
        if (mounted) {
          showSuccess(context, 'Link checkout copiato negli appunti');
        }
      } else if (res['message'] != null) {
        if (mounted) showSuccess(context, res['message'].toString());
      }
    } on ApiException catch (e) {
      if (mounted) showError(context, e.message);
    } catch (_) {
      if (mounted) showError(context, 'Errore di rete');
    } finally {
      if (mounted) setState(() => _pendingPlan = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final currentPlan = _subscription?['plan'] as String? ?? 'free';
    return Scaffold(
      appBar: AppBar(title: const Text('Piani')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                const Text(
                  'Scegli il tuo piano',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Genera più Skill e sblocca fonti illimitate.',
                  style: TextStyle(color: AppColors.textMuted, fontSize: 13),
                ),
                const SizedBox(height: 18),
                ...plansCatalog.map((plan) {
                  final isCurrent = plan.id == currentPlan;
                  final isPending = _pendingPlan == plan.id;
                  return _PlanCard(
                    plan: plan,
                    isCurrent: isCurrent,
                    pending: isPending,
                    onTap: isCurrent ? null : () => _upgrade(plan),
                  );
                }),
                const SizedBox(height: 20),
                Center(
                  child: TextButton(
                    onPressed: () => context.pop(),
                    child: const Text('Chiudi'),
                  ),
                ),
                const SizedBox(height: 40),
              ],
            ),
    );
  }
}

class _PlanCard extends StatelessWidget {
  final Plan plan;
  final bool isCurrent;
  final bool pending;
  final VoidCallback? onTap;

  const _PlanCard({
    required this.plan,
    required this.isCurrent,
    required this.pending,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: isCurrent
            ? AppColors.primary.withValues(alpha: 0.08)
            : AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isCurrent ? AppColors.primary : AppColors.border,
          width: isCurrent ? 1.5 : 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                plan.name,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const Spacer(),
              if (isCurrent)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text(
                    'Attuale',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: AppColors.onPrimary,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            plan.priceLabel,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w700,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _Feature(text: plan.features.bucketLimitLabel),
              _Feature(text: plan.features.sourceLimitLabel),
              _Feature(text: '${plan.credits} crediti'),
              if (plan.features.teamSharing)
                const _Feature(text: 'Condivisione team'),
              if (plan.features.prioritySupport)
                const _Feature(text: 'Supporto prioritario'),
            ],
          ),
          const SizedBox(height: 16),
          if (!isCurrent)
            GradientButton(
              label: pending ? 'Apertura checkout...' : 'Passa a ${plan.name}',
              loading: pending,
              onPressed: onTap,
            ),
        ],
      ),
    );
  }
}

class _Feature extends StatelessWidget {
  final String text;
  const _Feature({required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: AppColors.surfaceAlt,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        text,
        style: const TextStyle(fontSize: 12, color: AppColors.text),
      ),
    );
  }
}
