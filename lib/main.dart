import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:provider/provider.dart';

import 'app.dart';
import 'providers/auth_provider.dart';
import 'router/app_router.dart';
import 'services/supabase_client.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Carica le variabili d'ambiente (.env). È opzionale: se manca, AppConfig
  // ricade sui valori di default.
  try {
    await dotenv.load(fileName: '.env');
  } catch (_) {
    // File .env assente: i default sono sufficienti.
  }

  // Inizializza Supabase (no-op se le chiavi mancano nel .env).
  await SupabaseClientService.init();

  final auth = AuthProvider();
  await auth.load();

  final router = AppRouter.configure(auth);

  runApp(
    ChangeNotifierProvider<AuthProvider>.value(
      value: auth,
      child: ReskillApp(router: router),
    ),
  );
}
