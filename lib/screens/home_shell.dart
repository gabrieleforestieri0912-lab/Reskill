import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import '../widgets/auth_form.dart';

/// Shell con bottom navigation (Dashboard, Bucket, Account).
///
/// Se l'utente non è autenticato mostra direttamente il form di login
/// (nessuna landing page separata): la "pagina di lavoro" è sempre visibile,
/// con i form sovrapposti finché non si accede.
class HomeShell extends StatelessWidget {
  final StatefulNavigationShell navigator;

  const HomeShell({super.key, required this.navigator});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);

    if (!auth.isAuthenticated) {
      return const Scaffold(
        body: AuthForm(),
      );
    }

    return Scaffold(
      body: navigator,
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigator.currentIndex,
        onDestinationSelected: (i) => navigator.goBranch(i),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard),
            label: 'Dashboard',
          ),
          NavigationDestination(
            icon: Icon(Icons.folder_outlined),
            selectedIcon: Icon(Icons.folder),
            label: 'Bucket',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Account',
          ),
        ],
      ),
    );
  }
}
