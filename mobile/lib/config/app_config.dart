import 'package:flutter_dotenv/flutter_dotenv.dart';

/// Configurazione centralizzata dell'app.
///
/// Le URL puntano di default all'istanza locale del backend web Reskill.
/// Possono essere sovrascritte tramite il file `.env` (RESKILL_API_URL,
/// RESKILL_WEB_URL) o via `--dart-define` in fase di build.
class AppConfig {
  static String get apiBaseUrl {
    final fromEnv = dotenv.env['RESKILL_API_URL'];
    if (fromEnv != null && fromEnv.trim().isNotEmpty) return fromEnv.trim();
    return const String.fromEnvironment(
      'API_BASE_URL',
      defaultValue: 'http://10.0.2.2:3000',
    );
  }

  static String get appWebUrl {
    final fromEnv = dotenv.env['RESKILL_WEB_URL'];
    if (fromEnv != null && fromEnv.trim().isNotEmpty) return fromEnv.trim();
    return const String.fromEnvironment(
      'APP_WEB_URL',
      defaultValue: 'http://10.0.2.2:3000',
    );
  }

  /// Costruisce l'URL pubblico di condivisione di una Skill.
  static String shareUrl(String bucketId) => '$appWebUrl/share/$bucketId';
}
