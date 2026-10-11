# Reskill (app mobile)

Companion app Flutter per la piattaforma web **Reskill** (genera Skill AI da fonti web, YouTube, PDF e social media).

L'app mobile consuma le stesse API REST del backend web:

- **Auth** — Registrazione (`/api/register`) e login in due modalità:
  - Email + password (flusso NextAuth credentials, gestione cookie di sessione)
  - Codice email (passwordless: `/api/extension/send-code` + `/api/extension/verify`, usa header `x-extension-token`)
- **Bucket** — Elenco, creazione, eliminazione, aggiornamento (`/api/buckets`, `/api/buckets/[id]`)
- **Fonti** — Estrazione contenuti da URL (`/api/extract`) e salvataggio in un bucket (`/api/buckets/[id]/sources`)
- **Generazione Skill** — Chiamata streaming a `/api/generate-skill` che produce un file Markdown strutturato
- **Statistiche & Piano** — `/api/stats`, `/api/subscription`, upgrade via `/api/stripe/checkout`
- **Feedback** — `/api/feedback`

## Stack

| Layer | Tecnologia |
|-------|-----------|
| Framework | Flutter 3.x |
| Stato | `provider` (ChangeNotifier) |
| Rete | `dio` |
| Navigazione | `go_router` |
| Markdown | `flutter_markdown` |

## Setup

```bash
# 1. Copia le variabili d'ambiente
cp .env.example .env
#    Modifica RESKILL_API_URL con l'URL del backend web in esecuzione

# 2. Installa le dipendenze
flutter pub get

# 3. Avvia (emulatori Android/iOS o device)
flutter run
```

## Struttura

```
lib/
├── config/          # AppConfig (URL backend)
├── models/          # Bucket, Source, Plan, Stats, AppUser
├── services/        # ApiClient (unica fonte di verità per la rete)
├── providers/       # AuthProvider, BucketProvider
├── router/          # AppRouter (go_router)
├── theme/           # AppColors, AppTheme
├── screens/         # Auth, Dashboard, Buckets, BucketDetail, SkillView, Plans, Account, Feedback
└── widgets/         # Componenti riutilizzabili
```

## Configurazione backend

L'app mobile **condivide lo stesso database e gli stessi utenti del backend web**:
non serve creare un DB separato né credenziali dedicate. Basta avviare il backend web
(`Documenti/Progetti/Web/reskill`, `npm run dev`) e far puntare l'app alla sua istanza.

- Il backend web gira su `http://localhost:3000` (vedi `NEXTAUTH_URL` nel `.env` del web).
- Su **Android Emulator** l'alias `10.0.2.2` mappa `localhost` del PC → `RESKILL_API_URL=http://10.0.2.2:3000`.
- Su **iOS Simulator** usa `http://localhost:3000`.
- Su **dispositivo fisico** usa l'IP LAN della macchina (es. `http://192.168.1.10:3000`).

L'autenticazione avviene con gli **stessi account del sito web** (registrazione/login email,
oppure codice passwordless via estensione). Il backend accetta sia il cookie di sessione
NextAuth (`authjs.session-token`) sia l'header `x-extension-token`, quindi entrambi i flussi
di login dell'app funzionano contro il DB condiviso.

> Nota: il backend deve essere raggiungibile in chiaro (http) durante lo sviluppo.
> Su Android è già abilitato `android:usesCleartextTraffic="true"` nel `AndroidManifest.xml`.
> In produzione usa HTTPS e imposta `NEXTAUTH_URL` al dominio reale del web.
