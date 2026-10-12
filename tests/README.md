# Test suite Reskill

Suite di test eseguite con `node` (nessuna dipendenza extra).

## Statici (senza server)

```bash
node tests/consistency.mjs   # parità piani, endpoint extension↔backend, env, CORS, dominio
node tests/i18n.mjs          # parità chiavi traduzioni it/en (web + mobile)
```

## HTTP (serve il dev server: `npx next dev -p 3100`)

```bash
node tests/http-part1.mjs http://localhost:3100   # auth gates + input malformati
node tests/http-part2.mjs http://localhost:3100   # validazioni, shape, pagine
```

## E2E (serve dev server + Supabase raggiungibile)

Crea un utente di test, esercita bucket/fonti/crediti/MCP/API keys/Stripe e
ripulisce tutto alla fine. Se Supabase non è raggiungibile, i test DB-backed
vengono skippati automaticamente.

```bash
node tests/e2e.mjs http://localhost:3100
SUPABASE_URL=https://xyz.supabase.co node tests/e2e.mjs http://localhost:3100
```

## MCP server (stdio)

```bash
printf '%s\n%s\n%s\n' \
 '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"t","version":"0"}}}' \
 '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
 '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' \
 | node mcp-server/index.js --token sg_mcp_test
```
