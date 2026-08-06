# SkillGrowth

Piattaforma per generare Skill AI (file Markdown strutturati) da fonti web, YouTube, PDF e social media. Le Skill vengono usate come contesto da agenti AI come Cursor, Claude, ChatGPT, MCP, Windsurf e GitHub Copilot.

## Stack

| Layer | Tecnologia |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Linguaggio | TypeScript (strict) |
| Styling | Tailwind CSS 4 |
| Database | Supabase (PostgreSQL) |
| Auth | NextAuth v5 (Google OAuth + Credenziali) |
| Pagamenti | Stripe |
| AI | SDK AI (`ai`, `@ai-sdk/openai`, `ollama-ai-provider`) |
| Email | Resend |

## Struttura del progetto

```
skillgrowth/
├── app/                          # Next.js App Router
│   ├── api/                      # API route handlers
│   │   ├── auth/                 # NextAuth handler
│   │   ├── buckets/              # CRUD bucket
│   │   ├── sources/              # CRUD fonti
│   │   ├── extension/            # Invio/verifica codice estensione
│   │   ├── extract/              # Estrazione contenuti web/YouTube
│   │   ├── feedback/             # Invio feedback utente
│   │   ├── generate-skill/       # Generazione Skill via AI
│   │   ├── register/             # Registrazione utente
│   │   ├── stats/                # Statistiche utente
│   │   ├── stripe/               # Checkout, portale, webhook
│   │   └── subscription/         # Stato abbonamento
│   ├── auth.ts                   # Configurazione NextAuth
│   ├── dashboard/                # Dashboard utente
│   ├── share/[id]/               # Pagina pubblica Skill
│   └── page.tsx                  # Landing page
├── components/                   # Componenti React
│   ├── sections/                 # Sezioni landing page
│   ├── PlansSection.tsx          # Card piani (dashboard)
│   └── DashboardWorkspace.tsx    # Workspace principale
├── lib/                          # Utility
│   ├── supabase.ts               # Client Supabase (server)
│   ├── plans.ts                  # Definizioni piani e limiti
│   └── site-data.ts              # Dati statici landing page
├── models/                       # Query e interfacce database
│   ├── User.ts
│   ├── Bucket.ts
│   ├── Source.ts
│   ├── Feedback.ts
│   └── UserSubscription.ts
└── supabase-schema.sql           # Schema PostgreSQL
```

## Schema database (Supabase)

### `users`
| Colonna | Tipo | Note |
|---------|------|------|
| id | UUID | PK, auto |
| email | TEXT | UNIQUE, lowercase |
| password | TEXT | bcrypt hash |
| name | TEXT | |
| created_at | TIMESTAMPTZ | auto |
| updated_at | TIMESTAMPTZ | auto |

### `buckets`
Raccoglitori di fonti. Ogni bucket genera una Skill.
| Colonna | Tipo | Note |
|---------|------|------|
| id | UUID | PK |
| name | TEXT | Nome del bucket |
| description | TEXT | |
| user_email | TEXT | Proprietario |
| generated_skill | TEXT | Markdown generato dall'AI |
| created_at / updated_at | TIMESTAMPTZ | |

### `sources`
Singole fonti collegate a un bucket (YouTube, X, Reddit, PDF, pagine web).
| Colonna | Tipo | Note |
|---------|------|------|
| id | UUID | PK |
| type | TEXT | youtube, x, reddit, pdf, article/web |
| title, url, domain | TEXT | Metadati |
| content | TEXT | Contenuto estratto |
| skill_markdown | TEXT | Versione Markdown |
| bucket_id | UUID | FK → buckets(id) ON DELETE CASCADE |

### `user_subscriptions`
Abbonamenti Stripe.
| Colonna | Tipo | Note |
|---------|------|------|
| user_id | TEXT | UNIQUE |
| plan | TEXT | free, starter, pro, business, enterprise |
| stripe_customer_id | TEXT | UNIQUE |
| stripe_subscription_id | TEXT | UNIQUE |
| stripe_current_period_end | TIMESTAMPTZ | |

## Flussi principali

### Autenticazione
- `app/auth.ts` → NextAuth con provider Google e Credenziali (email/password)
- `app/api/register/` → Registrazione con bcrypt + salvataggio in `users`
- Login via Google OAuth o credentials JWT

### Bucket e fonti
1. Utente crea un bucket (`POST /api/buckets`)
2. Aggiunge fonti (`POST /api/buckets/[id]/sources`) — contenuto estratto da YouTube, URL, PDF, social
3. Genera Skill (`POST /api/generate-skill`) — l'AI processa tutte le fonti del bucket e produce un file Markdown strutturato
4. La Skill è visualizzabile pubblicamente su `/share/[id]`

### Estensione browser
1. Utente inserisce email → `POST /api/extension/send-code` invia codice via Resend
2. Inserisce codice → `POST /api/extension/verify` lo convalida
3. L'estensione può salvare contenuti direttamente nei bucket dell'utente

### Abbonamenti (Stripe)
- `lib/plans.ts` definisce 5 piani con limiti di bucket/fonti
- `POST /api/stripe/checkout` crea sessione Stripe
- Webhook `POST /api/stripe/webhook` mantiene aggiornato `user_subscriptions`
- `GET /api/subscription` restituisce il piano corrente
- Limiti verificati via `hasReachedBucketLimit()` / `hasReachedSourceLimit()`

## Setup

```bash
# 1. Clona e installa
npm install

# 2. Copia .env.example in .env e inserisci:
#    - DATABASE_URL (MongoDB) oppure NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
#    - GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET (Google Cloud Console)
#    - RESEND_API_KEY (Resend)
#    - STRIPE_SECRET_KEY (Stripe)

# 3. Se usi Supabase: incolla supabase-schema.sql nell'SQL Editor

# 4. Avvia
npm run dev
```

## Comandi

| Comando | Descrizione |
|---------|-------------|
| `npm run dev` | Sviluppo con Turbopack |
| `npm run build` | Build produzione |
| `npm run lint` | ESLint |
