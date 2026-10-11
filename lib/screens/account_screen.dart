import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import '../services/api_client.dart';
import '../theme/app_colors.dart';
import '../widgets/common.dart';

/// Schermata account: profilo, piano, logout.
class AccountScreen extends StatefulWidget {
  const AccountScreen({super.key});

  @override
  State<AccountScreen> createState() => _AccountScreenState();
}

class _AccountScreenState extends State<AccountScreen> {
  bool _savingName = false;
  Map<String, dynamic>? _subscription;
  bool _loadingSub = true;

  @override
  void initState() {
    super.initState();
    _loadSubscription();
  }

  Future<void> _loadSubscription() async {
    try {
      _subscription = await Api.instance.getSubscription();
    } catch (_) {
      // ignore
    } finally {
      if (mounted) setState(() => _loadingSub = false);
    }
  }

  Future<void> _editName() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final ctrl = TextEditingController(text: auth.name ?? '');
    final name = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Modifica nome'),
        content: TextField(
          controller: ctrl,
          decoration: const InputDecoration(labelText: 'Nome'),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Annulla'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, ctrl.text.trim()),
            child: const Text('Salva'),
          ),
        ],
      ),
    );
    if (name == null || name.isEmpty) return;
    setState(() => _savingName = true);
    try {
      await auth.updateProfile(name);
      if (mounted) showSuccess(context, 'Nome aggiornato');
    } on ApiException catch (e) {
      if (mounted) showError(context, e.message);
    } finally {
      if (mounted) setState(() => _savingName = false);
    }
  }

  Future<void> _logout() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    await auth.logout();
    if (mounted) context.go('/home');
  }

  String _initial(String? value) {
    final trimmed = value?.trim() ?? '';
    return trimmed.isEmpty ? '?' : trimmed.substring(0, 1).toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Account')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          CircleAvatar(
            radius: 32,
            backgroundColor: AppColors.primary.withValues(alpha: 0.15),
            child: Text(
              _initial(auth.name ?? auth.email),
              style: const TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w700,
                color: AppColors.primary,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            auth.name ?? '—',
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
          ),
          Text(
            auth.email ?? '',
            textAlign: TextAlign.center,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 13),
          ),
          const SizedBox(height: 20),
          _Row(
            icon: Icons.badge_outlined,
            label: 'Nome',
            value: auth.name ?? '—',
            onTap: _savingName ? null : _editName,
          ),
          _Row(
            icon: Icons.email_outlined,
            label: 'Email',
            value: auth.email ?? '—',
          ),
          _Row(
            icon: Icons.workspace_premium_outlined,
            label: 'Piano',
            value: _loadingSub
                ? '...'
                : (_subscription?['planDetails']?['name'] as String? ?? 'Free'),
            onTap: () => context.push('/plans'),
          ),
          const SizedBox(height: 12),
          ListTile(
            leading: const Icon(Icons.star_outline, color: AppColors.primary),
            title: const Text('Gestisci piano'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push('/plans'),
          ),
          ListTile(
            leading: const Icon(
              Icons.feedback_outlined,
              color: AppColors.primary,
            ),
            title: const Text('Invia feedback'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push('/feedback'),
          ),
          const SizedBox(height: 20),
          GradientButton(label: 'Esci', icon: Icons.logout, onPressed: _logout),
          const SizedBox(height: 40),
        ],
      ),
    );
  }
}

class _Row extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final VoidCallback? onTap;

  const _Row({
    required this.icon,
    required this.label,
    required this.value,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: AppColors.primary),
      title: Text(
        label,
        style: const TextStyle(fontSize: 13, color: AppColors.textMuted),
      ),
      subtitle: Text(value, style: const TextStyle(fontSize: 14)),
      trailing: onTap != null ? const Icon(Icons.chevron_right) : null,
      onTap: onTap,
    );
  }
}
