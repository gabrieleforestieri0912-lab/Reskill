import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import '../services/api_client.dart';
import '../theme/app_colors.dart';
import '../widgets/common.dart';

/// Form di autenticazione riutilizzabile (login password e registrazione).
/// Non naviga: al successo l'[AuthProvider] notifica i listener e il widget
/// padre mostra la workspace.
class AuthForm extends StatefulWidget {
  const AuthForm({super.key});

  @override
  State<AuthForm> createState() => _AuthFormState();
}

class _AuthFormState extends State<AuthForm> {
  final _loginKey = GlobalKey<FormState>();
  final _registerKey = GlobalKey<FormState>();
  int _mode = 0; // 0 login, 1 registrati
  int _prevMode = 0;

  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();

  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final key = _mode == 1 ? _registerKey : _loginKey;
    if (!key.currentState!.validate()) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    final auth = Provider.of<AuthProvider>(context, listen: false);
    try {
      if (_mode == 0) {
        await auth.loginPassword(_emailCtrl.text.trim(), _passwordCtrl.text);
      } else {
        await auth.register(
          name: _nameCtrl.text.trim(),
          email: _emailCtrl.text.trim(),
          password: _passwordCtrl.text,
        );
        await auth.loginPassword(_emailCtrl.text.trim(), _passwordCtrl.text);
      }
      // Il provider notifica il cambio di stato: il padre mostra la workspace.
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (e) {
      setState(() => _error = 'Errore di rete. Verifica la connessione.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _switchMode(int i) {
    if (_mode == i) return;
    setState(() {
      _prevMode = _mode;
      _mode = i;
      _error = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 380),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 16),
                const Icon(Icons.auto_awesome,
                    size: 40, color: AppColors.primary),
                const SizedBox(height: 12),
                const Text(
                  'Reskill',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Genera Skill AI dalle tue fonti',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 13,
                    color: AppColors.textMuted,
                  ),
                ),
                const SizedBox(height: 24),
                if (_error != null)
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.danger.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                          color: AppColors.danger.withValues(alpha: 0.4)),
                    ),
                    child: Text(
                      _error!,
                      style: const TextStyle(
                          color: AppColors.danger, fontSize: 13),
                    ),
                  ),
                if (_error != null) const SizedBox(height: 16),
                AnimatedSwitcher(
                  duration: const Duration(milliseconds: 320),
                  switchInCurve: Curves.easeOutCubic,
                  switchOutCurve: Curves.easeInCubic,
                  transitionBuilder: (child, animation) {
                    final dir = _mode >= _prevMode ? 1.0 : -1.0;
                    return FadeTransition(
                      opacity: animation,
                      child: SlideTransition(
                        position: Tween<Offset>(
                          begin: Offset(0, 0.08 * dir),
                          end: Offset.zero,
                        ).animate(animation),
                        child: child,
                      ),
                    );
                  },
                  child: KeyedSubtree(
                    key: ValueKey<int>(_mode),
                    child: _buildForm(),
                  ),
                ),
                const SizedBox(height: 18),
                _buildSwitchLink(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSwitchLink() {
    final prompt = _mode == 0 ? 'Non hai un account? ' : 'Hai già un account? ';
    final action = _mode == 0 ? 'Registrati' : 'Accedi';
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          prompt,
          style: const TextStyle(
            fontSize: 12.5,
            color: AppColors.textMuted,
          ),
        ),
        GestureDetector(
          onTap: () => _switchMode(_mode == 0 ? 1 : 0),
          child: Text(
            action,
            style: const TextStyle(
              fontSize: 12.5,
              fontWeight: FontWeight.w600,
              color: AppColors.primary,
              decoration: TextDecoration.underline,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildForm() {
    final key = _mode == 1 ? _registerKey : _loginKey;
    return Form(
      key: key,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (_mode == 1) ...[
            TextFormField(
              controller: _nameCtrl,
              decoration: const InputDecoration(labelText: 'Nome'),
              validator: (v) =>
                  v == null || v.trim().isEmpty ? 'Inserisci il nome' : null,
            ),
            const SizedBox(height: 12),
          ],
          TextFormField(
            controller: _emailCtrl,
            keyboardType: TextInputType.emailAddress,
            decoration: const InputDecoration(labelText: 'Email'),
            validator: (v) {
              if (v == null || v.trim().isEmpty) return 'Inserisci l\'email';
              if (!v.contains('@')) return 'Email non valida';
              return null;
            },
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _passwordCtrl,
            obscureText: true,
            decoration: const InputDecoration(labelText: 'Password'),
            validator: (v) {
              if (v == null || v.length < 8) {
                return 'Minimo 8 caratteri';
              }
              return null;
            },
          ),
          if (_mode == 1)
            const Padding(
              padding: EdgeInsets.only(top: 6),
              child: Text(
                'La password deve contenere maiuscola, minuscola e numero.',
                style: TextStyle(fontSize: 11, color: AppColors.textFaint),
              ),
            ),
          const SizedBox(height: 20),
          GradientButton(
            label: _mode == 1 ? 'Crea account' : 'Accedi',
            loading: _loading,
            onPressed: _submit,
          ),
        ],
      ),
    );
  }
}
