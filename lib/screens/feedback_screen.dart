import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import '../services/api_client.dart';
import '../widgets/common.dart';

/// Schermata invio feedback (bug, feature, feedback).
class FeedbackScreen extends StatefulWidget {
  const FeedbackScreen({super.key});

  @override
  State<FeedbackScreen> createState() => _FeedbackScreenState();
}

class _FeedbackScreenState extends State<FeedbackScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _msgCtrl = TextEditingController();
  String _type = 'feedback';
  bool _sending = false;

  @override
  void initState() {
    super.initState();
    final auth = Provider.of<AuthProvider>(context, listen: false);
    _nameCtrl.text = auth.name ?? '';
    _emailCtrl.text = auth.email ?? '';
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _msgCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _sending = true);
    try {
      await Api.instance.submitFeedback(
        name: _nameCtrl.text.trim(),
        email: _emailCtrl.text.trim(),
        message: _msgCtrl.text.trim(),
        type: _type,
      );
      if (mounted) {
        showSuccess(context, 'Feedback inviato, grazie!');
        context.pop();
      }
    } on ApiException catch (e) {
      if (mounted) showError(context, e.message);
    } catch (_) {
      if (mounted) showError(context, 'Errore di rete');
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Feedback')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Facci sapere cosa migliorare',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 16),
          Form(
            key: _formKey,
            child: Column(
              children: [
                TextFormField(
                  controller: _nameCtrl,
                  decoration: const InputDecoration(labelText: 'Nome'),
                  validator: (v) =>
                      v == null || v.trim().isEmpty ? 'Inserisci il nome' : null,
                ),
                const SizedBox(height: 12),
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
                DropdownButtonFormField<String>(
                    initialValue: _type,
                  decoration: const InputDecoration(labelText: 'Tipo'),
                  items: const [
                    DropdownMenuItem(value: 'bug', child: Text('Bug')),
                    DropdownMenuItem(value: 'feature', child: Text('Richiesta funzionalità')),
                    DropdownMenuItem(value: 'feedback', child: Text('Feedback')),
                    DropdownMenuItem(value: 'other', child: Text('Altro')),
                  ],
                  onChanged: (v) => setState(() => _type = v ?? 'feedback'),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _msgCtrl,
                  maxLines: 6,
                  decoration: const InputDecoration(
                    labelText: 'Messaggio',
                    alignLabelWithHint: true,
                  ),
                  validator: (v) {
                    if (v == null || v.trim().length < 10) {
                      return 'Minimo 10 caratteri';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),
                GradientButton(
                  label: 'Invia',
                  loading: _sending,
                  onPressed: _submit,
                ),
                const SizedBox(height: 40),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
