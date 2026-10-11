/// Profilo utente di base (email + nome), mantenuto lato client.
class AppUser {
  final String email;
  final String? name;

  const AppUser({required this.email, this.name});

  AppUser copyWith({String? email, String? name}) =>
      AppUser(email: email ?? this.email, name: name ?? this.name);
}
