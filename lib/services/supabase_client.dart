import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Configurazione Supabase per l'app Reskill.
///
/// Le credenziali sono lette dal file `.env` (caricato in [main] con
/// `flutter_dotenv`). Copia `.env.example` in `.env` e inserisci i valori
/// del progetto Supabase condiviso con il backend web.
class SupabaseConfig {
  static String get url => dotenv.env['SUPABASE_URL'] ?? '';
  static String get anonKey => dotenv.env['SUPABASE_ANON_KEY'] ?? '';

  static bool get isConfigured =>
      url.isNotEmpty && anonKey.isNotEmpty;
}

/// Wrapper di inizializzazione del client Supabase.
///
/// NOTA: il file `.env` contiene attualmente la SERVICE ROLE KEY del progetto
/// web (scelta esplicita per semplificare lo sviluppo). In produzione va
/// sostituita con la ANON KEY pubblica, altrimenti il client può aggirare le
/// Row Level Security.
class SupabaseClientService {
  static bool _initialized = false;

  static Future<void> init() async {
    if (!SupabaseConfig.isConfigured || _initialized) return;
    await Supabase.initialize(
      url: SupabaseConfig.url,
      publishableKey: SupabaseConfig.anonKey,
    );
    _initialized = true;
  }

  static SupabaseClient get client => Supabase.instance.client;
}
