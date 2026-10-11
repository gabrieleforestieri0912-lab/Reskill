import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../config/app_config.dart';
import '../models/bucket.dart';
import '../models/source.dart';
import '../models/stats.dart';

/// Eccezione tipizzata per le chiamate API.
class ApiException implements Exception {
  final String message;
  final bool upgrade;
  final int? statusCode;

  ApiException(this.message, {this.upgrade = false, this.statusCode});
}

/// Estrae la coppia `name=value` di un cookie il cui nome contiene [contains]
/// dall'elenco degli header `set-cookie`.
String? _extractCookiePair(List<String>? setCookies, String contains) {
  if (setCookies == null) return null;
  for (final c in setCookies) {
    final idx = c.indexOf('=');
    if (idx == -1) continue;
    final name = c.substring(0, idx);
    if (name.contains(contains)) {
      final end = c.indexOf(';');
      return end == -1 ? c : c.substring(0, end);
    }
  }
  return null;
}

/// Client REST per il backend web Reskill.
///
/// Gestisce l'autenticazione tramite sessione NextAuth
/// (cookie `authjs.session-token`) con login password.
class ApiClient {
  ApiClient._() {
    _dio = Dio(BaseOptions(
      baseUrl: AppConfig.apiBaseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 30),
      headers: {'Accept': 'application/json'},
    ));
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        options.headers.addAll(_authHeaders);
        if (options.method == 'POST' ||
            options.method == 'PUT' ||
            options.method == 'PATCH') {
          options.headers['Content-Type'] ??= 'application/json';
        }
        handler.next(options);
      },
      onResponse: (response, handler) {
        _captureSessionCookie(response.headers);
        handler.next(response);
      },
    ));
  }

  static final ApiClient instance = ApiClient._();

  late final Dio _dio;

  // Stato di autenticazione persistito.
  String? _sessionCookie; // es. "authjs.session-token=abc"
  String? _extensionToken;
  String? _email;
  String? _name;
  String? _method;

  // ---------------------------------------------------------- persistenza

  Future<void> load() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _sessionCookie = prefs.getString('rk_session');
      _extensionToken = prefs.getString('rk_ext_token');
      _email = prefs.getString('rk_email');
      _name = prefs.getString('rk_name');
      _method = prefs.getString('rk_method');
    } catch (_) {
      // riparte non autenticato
    }
  }

  Future<void> _persist() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('rk_session', _sessionCookie ?? '');
      await prefs.setString('rk_ext_token', _extensionToken ?? '');
      await prefs.setString('rk_email', _email ?? '');
      await prefs.setString('rk_name', _name ?? '');
      await prefs.setString('rk_method', _method ?? '');
    } catch (_) {
      // meglio perdere la persistenza che bloccare la UI
    }
  }

  void _captureSessionCookie(Headers? headers) {
    final pair = _extractCookiePair(headers?['set-cookie'], 'session-token');
    if (pair != null) {
      _sessionCookie = pair;
      _persist();
    }
  }

  Map<String, String> get _authHeaders {
    if (_extensionToken != null) {
      return {'x-extension-token': _extensionToken!};
    }
    if (_sessionCookie != null) {
      return {'Cookie': _sessionCookie!};
    }
    return {};
  }

  bool get isAuthenticated =>
      _sessionCookie != null || _extensionToken != null;

  Map<String, String?> get credentials =>
      {'email': _email, 'name': _name, 'method': _method};

  Future<void> logout() async {
    _sessionCookie = null;
    _extensionToken = null;
    _email = null;
    _name = null;
    _method = null;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('rk_session');
      await prefs.remove('rk_ext_token');
      await prefs.remove('rk_email');
      await prefs.remove('rk_name');
      await prefs.remove('rk_method');
    } catch (_) {
      // ignore
    }
  }

  // ----------------------------------------------------------------- auth

  /// Registrazione di un nuovo utente. Lancia [ApiException] in caso di errore.
  Future<void> register({
    required String email,
    required String password,
    required String name,
  }) async {
    final res = await _dio.post('/api/register', data: {
      'email': email,
      'password': password,
      'name': name,
    });
    if (res.statusCode != 200) {
      throw ApiException(_errMessage(res), statusCode: res.statusCode);
    }
  }

  /// Login con email + password (flusso NextAuth credentials).
  Future<void> loginPassword(String email, String password) async {
    // 1. CSRF token
    final csrfResp = await _dio.get('/api/auth/csrf');
    final csrfToken = (csrfResp.data is Map)
        ? (csrfResp.data['csrfToken'] as String?)
        : null;
    final csrfCookie =
        _extractCookiePair(csrfResp.headers['set-cookie'], 'csrf');
    if (csrfToken == null) {
      throw ApiException('Impossibile avviare il login');
    }

    // 2. Callback credentials (non seguire il redirect: catturiamo il cookie di sessione)
    final resp = await _dio.post(
      '/api/auth/callback/credentials',
      data: {
        'csrfToken': csrfToken,
        'email': email,
        'password': password,
        'callbackUrl': '${AppConfig.apiBaseUrl}/',
        'json': 'true',
      },
      options: Options(
        contentType: 'application/x-www-form-urlencoded',
        followRedirects: false,
        headers: csrfCookie != null ? {'Cookie': csrfCookie} : null,
        validateStatus: (s) => s != null && (s < 400 || s == 302),
      ),
    );

    _captureSessionCookie(resp.headers);
    if (_sessionCookie == null) {
      throw ApiException('Email o password non validi');
    }
    _email = email.toLowerCase();
    _name = null;
    _method = 'session';
    _extensionToken = null;
    await _persist();
  }

  // --------------------------------------------------------------- buckets

  Future<List<Bucket>> getBuckets() async {
    final res = await _dio.get('/api/buckets');
    _assertOk(res);
    final list = (res.data as List? ?? [])
        .map((e) => Bucket.fromJson(e as Map<String, dynamic>))
        .toList();
    return list;
  }

  Future<Bucket> createBucket(String name, String description) async {
    final res = await _dio.post('/api/buckets', data: {
      'name': name,
      'description': description,
    });
    _assertOk(res);
    return Bucket.fromJson(res.data as Map<String, dynamic>);
  }

  Future<Bucket> updateBucket(
    String id, {
    String? generatedSkill,
    String? description,
    String? name,
  }) async {
    final body = <String, dynamic>{};
    if (generatedSkill != null) body['generatedSkill'] = generatedSkill;
    if (description != null) body['description'] = description;
    if (name != null) body['name'] = name;
    final res = await _dio.put('/api/buckets/$id', data: body);
    _assertOk(res);
    return Bucket.fromJson(res.data as Map<String, dynamic>);
  }

  Future<void> deleteBucket(String id) async {
    final res = await _dio.delete('/api/buckets/$id');
    _assertOk(res);
  }

  // ---------------------------------------------------------------- sources

  /// Estrae il contenuto da un URL (YouTube, X, Reddit, PDF, pagina web).
  Future<Map<String, dynamic>> extract(String url) async {
    final res = await _dio.post('/api/extract', data: {'url': url});
    _assertOk(res);
    return res.data as Map<String, dynamic>;
  }

  Future<Source> addSource(
    String bucketId,
    Map<String, dynamic> fields,
  ) async {
    final res = await _dio.post('/api/buckets/$bucketId/sources',
        data: fields);
    _assertOk(res);
    return Source.fromJson(res.data as Map<String, dynamic>);
  }

  Future<void> deleteSource(String id) async {
    final res = await _dio.delete('/api/sources/$id');
    _assertOk(res);
  }

  // ----------------------------------------------------------- subscription

  Future<Map<String, dynamic>> getSubscription() async {
    final res = await _dio.get('/api/subscription');
    _assertOk(res);
    return res.data as Map<String, dynamic>;
  }

  /// Avvia il checkout Stripe per un piano. Ritorna l'URL o un messaggio demo.
  Future<Map<String, dynamic>> createCheckout(String planId) async {
    final res = await _dio.post('/api/stripe/checkout', data: {
      'planId': planId,
    });
    if (res.statusCode != 200) {
      throw ApiException(_errMessage(res), statusCode: res.statusCode);
    }
    return res.data as Map<String, dynamic>;
  }

  // ------------------------------------------------------------------ stats

  Future<Stats> getStats() async {
    final res = await _dio.get('/api/stats');
    _assertOk(res);
    return Stats.fromJson(res.data as Map<String, dynamic>);
  }

  // ------------------------------------------------------------------ user

  Future<void> updateProfile(String name) async {
    final res = await _dio.patch('/api/user', data: {'name': name});
    _assertOk(res);
    _name = name;
    await _persist();
  }

  // --------------------------------------------------------------- feedback

  Future<void> submitFeedback({
    required String name,
    required String email,
    required String message,
    String type = 'feedback',
  }) async {
    final res = await _dio.post('/api/feedback', data: {
      'name': name,
      'email': email,
      'message': message,
      'type': type,
    });
    if (res.statusCode != 200) {
      throw ApiException(_errMessage(res), statusCode: res.statusCode);
    }
  }

  // ------------------------------------------------------- generate-skill

  /// Genera una Skill in streaming. [onChunk] riceve i frammenti di Markdown.
  /// Ritorna il Markdown completo. Lancia [ApiException] con `upgrade: true`
  /// se il piano non ha crediti sufficienti.
  Future<String> generateSkill({
    required String prompt,
    required String sourcesSummary,
    String model = 'gpt-4o-mini',
    required void Function(String chunk) onChunk,
  }) async {
    final resp = await _dio.post(
      '/api/generate-skill',
      data: {
        'prompt': prompt,
        'sourcesSummary': sourcesSummary,
        'model': model,
      },
      options: Options(
        responseType: ResponseType.stream,
        receiveTimeout: const Duration(seconds: 0),
      ),
    );

    final status = resp.statusCode ?? 500;
    final body = resp.data as ResponseBody;
    final buffer = <int>[];
    await for (final Uint8List chunk in body.stream) {
      buffer.addAll(chunk);
    }
    final text = utf8.decode(buffer);

    if (status != 200) {
      try {
        final json = jsonDecode(text) as Map<String, dynamic>;
        throw ApiException(
          json['error']?.toString() ?? 'Errore di generazione',
          upgrade: json['upgrade'] == true,
          statusCode: status,
        );
      } catch (e) {
        if (e is ApiException) rethrow;
        throw ApiException(text, statusCode: status);
      }
    }
    onChunk(text);
    return text;
  }

  // ------------------------------------------------------------- utilities

  void _assertOk(Response res) {
    if (res.statusCode == null || res.statusCode! >= 400) {
      throw ApiException(_errMessage(res), statusCode: res.statusCode);
    }
  }

  String _errMessage(Response res) {
    try {
      final data = res.data;
      if (data is Map && data['error'] != null) {
        return data['error'].toString();
      }
    } catch (_) {
      // ignora
    }
    return 'Errore di rete (${res.statusCode})';
  }
}

/// Accesso comodo al singleton [ApiClient].
class Api {
  static ApiClient get instance => ApiClient.instance;
}
