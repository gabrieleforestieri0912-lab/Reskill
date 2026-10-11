import 'package:go_router/go_router.dart';

import '../providers/auth_provider.dart';
import '../screens/account_screen.dart';
import '../screens/bucket_detail_screen.dart';
import '../screens/buckets_screen.dart';
import '../screens/dashboard_screen.dart';
import '../screens/feedback_screen.dart';
import '../screens/home_shell.dart';
import '../screens/plans_screen.dart';
import '../screens/skill_view_screen.dart';

/// Configura il router dell'app.
///
/// L'app NON ha una landing page: si apre direttamente nella workspace
/// (`/home`). Se l'utente non è autenticato, la shell mostra il form di login
/// inline sopra la pagina di lavoro.
class AppRouter {
  static GoRouter configure(AuthProvider auth) {
    return GoRouter(
      initialLocation: '/home',
      refreshListenable: auth,
      redirect: (context, state) {
        final authed = auth.isAuthenticated;
        final loc = state.matchedLocation;
        // Le pagine protette fuori dalla shell rimandano alla workspace,
        // dove viene mostrato il form di autenticazione.
        if (!authed && loc != '/home') return '/home';
        return null;
      },
      routes: [
        StatefulShellRoute.indexedStack(
          branches: [
            StatefulShellBranch(
              routes: [
                GoRoute(
                  path: '/home',
                  builder: (context, state) => const DashboardScreen(),
                ),
              ],
            ),
            StatefulShellBranch(
              routes: [
                GoRoute(
                  path: '/buckets',
                  builder: (context, state) => const BucketsScreen(),
                ),
              ],
            ),
            StatefulShellBranch(
              routes: [
                GoRoute(
                  path: '/account',
                  builder: (context, state) => const AccountScreen(),
                ),
              ],
            ),
          ],
          builder: (context, state, nav) => HomeShell(navigator: nav),
        ),
        GoRoute(
          path: '/bucket/:id',
          builder: (context, state) =>
              BucketDetailScreen(bucketId: state.pathParameters['id']!),
        ),
        GoRoute(
          path: '/skill',
          builder: (context, state) =>
              SkillViewScreen(data: state.extra as SkillViewData),
        ),
        GoRoute(
          path: '/plans',
          builder: (context, state) => const PlansScreen(),
        ),
        GoRoute(
          path: '/feedback',
          builder: (context, state) => const FeedbackScreen(),
        ),
      ],
    );
  }
}
