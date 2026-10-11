import 'package:flutter/foundation.dart';

import '../services/api_client.dart';

/// Stato di autenticazione, specchiato dal backend web Reskill.
class AuthProvider extends ChangeNotifier {
  bool _loading = true;
  String? _email;
  String? _name;
  String? _method;

  bool get isAuthenticated => Api.instance.isAuthenticated;
  bool get loading => _loading;
  String? get email => _email ?? Api.instance.credentials['email'];
  String? get name => _name;
  String? get method => _method;

  Future<void> load() async {
    await Api.instance.load();
    final creds = Api.instance.credentials;
    _email = creds['email'];
    _name = creds['name'];
    _method = creds['method'];
    _loading = false;
    notifyListeners();
  }

  Future<void> register({
    required String name,
    required String email,
    required String password,
  }) async {
    await Api.instance.register(
      name: name,
      email: email,
      password: password,
    );
  }

  Future<void> loginPassword(String email, String password) async {
    await Api.instance.loginPassword(email, password);
    await _sync();
  }

  Future<void> _sync() async {
    final creds = Api.instance.credentials;
    _email = creds['email'];
    _name = creds['name'];
    _method = creds['method'];
    notifyListeners();
  }

  Future<void> updateProfile(String name) async {
    await Api.instance.updateProfile(name);
    _name = name;
    notifyListeners();
  }

  Future<void> logout() async {
    await Api.instance.logout();
    _email = null;
    _name = null;
    _method = null;
    notifyListeners();
  }
}
