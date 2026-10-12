-- ============================================================
-- Reskill — tabelle mancanti (il DB riattivato ha solo il core:
-- users, buckets, sources, user_subscriptions, feedbacks).
-- Esegui questo script nel SQL Editor di Supabase (una volta).
-- ============================================================

CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_codes_email_code_used
  ON verification_codes (email, code, used);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at
  ON verification_codes (expires_at);

CREATE TABLE IF NOT EXISTS extension_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_extension_tokens_token ON extension_tokens (token);
CREATE INDEX IF NOT EXISTS idx_extension_tokens_email ON extension_tokens (email);

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  name TEXT DEFAULT 'default',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  revoked BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_email ON api_keys (user_email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys (key_hash);

CREATE TABLE IF NOT EXISTS mcp_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  name TEXT DEFAULT 'default',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  revoked BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_mcp_tokens_user_email ON mcp_tokens (user_email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_mcp_tokens_key_hash ON mcp_tokens (key_hash);

CREATE TABLE IF NOT EXISTS rate_limits (
  id BIGSERIAL PRIMARY KEY,
  key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_key_created_at
  ON rate_limits (key, created_at);

-- ============================================================
-- Colonne crediti mancanti nel DB riattivato (schema datato).
-- Senza queste, tracciamento crediti e limiti piano non funzionano.
-- ============================================================

ALTER TABLE user_subscriptions
  ADD COLUMN IF NOT EXISTS credits_used INTEGER NOT NULL DEFAULT 0;

ALTER TABLE user_subscriptions
  ADD COLUMN IF NOT EXISTS credits_period_start TIMESTAMPTZ;
