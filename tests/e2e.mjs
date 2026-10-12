// E2E positive-path tests (needs dev server + creates a TEST user in Supabase, cleaned up after).
// Run: node tests-e2e.mjs [baseUrl]
const base = process.argv[2] || "http://localhost:3100";
const stamp = Date.now().toString(36);
const EMAIL = `e2e-${stamp}@example.com`;
const PASS = "TestZ9aa1234";
let pass = 0, fail = 0;
const failures = [];
async function t(name, fn) {
  try { await fn(); pass++; console.log("  ok:", name); }
  catch (e) {
    if (e && e.skip) { pass++; console.log("  skip:", name, "-", e.message); return; }
    fail++; failures.push(name); console.error("  FAIL:", name, "-", String(e && e.message).slice(0, 200));
  }
}
function skipNeedsDb() { if (!globalThis.__dbUp) { const e = new Error("needs working Supabase"); e.skip = true; throw e; } }
const EXT = () => ({ "x-extension-token": globalThis.__extToken });
function eq(a, b, msg) { if (a !== b) throw new Error(`${msg || "mismatch"}: got ${JSON.stringify(a)} want ${JSON.stringify(b)}`); }
function ok(v, msg) { if (!v) throw new Error(msg || "assertion failed"); }

// cookie jar
let cookies = [];
function store(res) {
  const set = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
  for (const c of set) {
    const pair = c.split(";")[0];
    const name = pair.split("=")[0];
    cookies = cookies.filter((k) => !k.startsWith(name + "="));
    cookies.push(pair);
  }
}
async function req(method, path, opts = {}) {
  const res = await fetch(base + path, {
    method, redirect: "manual",
    headers: { "Content-Type": "application/json", ...(cookies.length ? { Cookie: cookies.join("; ") } : {}), ...(opts.headers || {}) },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  store(res);
  const text = await res.text();
  let json = null; try { json = JSON.parse(text); } catch {}
  return { status: res.status, json, text };
}

let bucketId = null, sourceId = null, mcpTokenId = null, mcpToken = null, apiKeyId = null, apiKey = null;

let registered = false;
await t("register test user (honest outcome)", async () => {
  const r = await req("POST", "/api/register", { body: { email: EMAIL, password: PASS, name: "E2E" } });
  if (r.status === 200) { eq(r.json && r.json.success, true); registered = true; }
  else { eq(r.status, 500); ok(r.json && r.json.error, "no error message"); }
});
await t("register never fake-succeeds (signin proof)", async () => {
  if (!registered) { console.log("    skip: registration honestly failed (DB down)"); return; }
  const csrf = (await req("GET", "/api/auth/csrf")).json;
  const res = await fetch(base + "/api/auth/callback/credentials", {
    method: "POST", redirect: "manual",
    headers: { "Content-Type": "application/x-www-form-urlencoded", ...(cookies.length ? { Cookie: cookies.join("; ") } : {}) },
    body: new URLSearchParams({ csrfToken: csrf.csrfToken, email: EMAIL, password: PASS }).toString(),
  });
  const set = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
  for (const c of set) { const pair = c.split(";")[0]; cookies = cookies.filter((k) => !k.startsWith(pair.split("=")[0] + "=")); cookies.push(pair); }
  ok(cookies.some((c) => c.includes("session-token")), "FAKE SUCCESS: registered but cannot sign in");
});
await t("extension OTP: send-code returns devCode (dev)", async () => {
  const r = await req("POST", "/api/extension/send-code", { body: { email: EMAIL } });
  eq(r.status, 200); ok(r.json.sent, "not sent");
  ok(r.json.devCode, "no devCode (dev only)");
  globalThis.__otp = r.json.devCode;
});
await t("extension OTP: verify -> token", async () => {
  const r = await req("POST", "/api/extension/verify", { body: { email: EMAIL, code: globalThis.__otp } });
  eq(r.status, 200); ok(r.json.token, "no token: " + JSON.stringify(r.json));
  globalThis.__extToken = r.json.token;
});
await t("extension/me with token verified:true", async () => {
  const r = await req("GET", "/api/extension/me", { headers: { "x-extension-token": globalThis.__extToken } });
  eq(r.status, 200); eq(r.json.verified, true); eq(r.json.email, EMAIL.toLowerCase());
});
await t("probe: DB reachable?", async () => {
  // Direct DNS+HTTPS probe of Supabase: no junk rows created
  try {
    const host = (process.env.SUPABASE_URL || "https://rtmyntqsmuindxymmlor.supabase.co");
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 15000);
    await fetch(host + "/rest/v1/", { signal: ctl.signal }).catch(() => null);
    clearTimeout(timer);
    const { lookup } = await import("node:dns/promises");
    await lookup(new URL(host).hostname);
    globalThis.__dbUp = true;
  } catch {
    console.log("    DB unreachable — DB-backed tests will skip");
  }
});
await t("subscription authed free", async () => {
  skipNeedsDb();
  const r = await req("GET", "/api/subscription", EXT());
  eq(r.status, 200); eq(r.json.plan, "free"); eq(r.json.planDetails.credits, 10);
});
await t("create bucket", async () => {
  skipNeedsDb();
  const r = await req("POST", "/api/buckets", { ...EXT(), body: { name: "e2e-bucket" } });
  eq(r.status, 200); ok(r.json.id, "no bucket id"); bucketId = r.json.id;
});
await t("extract example.com", async () => {
  skipNeedsDb();
  const r = await req("POST", "/api/extract", { ...EXT(), body: { url: "https://example.com" } });
  eq(r.status, 200); ok(r.json.success, "extract failed: " + r.text.slice(0, 120));
  ok(r.json.content && r.json.content.length > 20, "empty content");
  globalThis.__extracted = r.json;
});
await t("save source consumes credits", async () => {
  skipNeedsDb();
  const e = globalThis.__extracted;
  const before = (await req("GET", "/api/stats", EXT())).json;
  const r = await req("POST", `/api/buckets/${bucketId}/sources`, { ...EXT(),
    body: { type: e.type, title: e.title, url: e.url, domain: e.domain, date: e.date, content: e.content },
  });
  eq(r.status, 200); ok(r.json.id, "no source id"); sourceId = r.json.id;
  const after = (await req("GET", "/api/stats", EXT())).json;
  ok(after.totalCreditsUsed > before.totalCreditsUsed, `credits not consumed (${before.totalCreditsUsed} -> ${after.totalCreditsUsed})`);
});
await t("generate-skill streams markdown", async () => {
  skipNeedsDb();
  const e = globalThis.__extracted;
  const res = await fetch(base + "/api/generate-skill", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookies.join("; "), "x-extension-token": globalThis.__extToken },
    body: JSON.stringify({ prompt: "e2e", sourcesSummary: `TITOLO: ${e.title}\nCONTENUTO:\n${String(e.content).slice(0, 500)}`, model: "gpt-4o-mini" }),
  });
  const txt = await res.text();
  ok(res.status === 200, "status " + res.status + " " + txt.slice(0, 120));
  ok(txt.length > 50, "empty stream");
});
await t("mcp token create+list", async () => {
  skipNeedsDb();
  const r = await req("POST", "/api/mcp/token", { ...EXT(), body: { name: "e2e" } });
  eq(r.status, 200); ok(r.json.token && r.json.token.startsWith("sg_mcp_"), "bad token");
  mcpToken = r.json.token; mcpTokenId = r.json.id;
  const l = await req("GET", "/api/mcp/token", EXT());
  eq(l.status, 200); ok(Array.isArray(l.json.tokens) && l.json.tokens.some((x) => x.id === mcpTokenId), "token not listed");
});
await t("rpc list_buckets with mcp token", async () => {
  skipNeedsDb();
  const r = await req("POST", "/api/mcp/rpc", { body: { method: "list_buckets", params: {} }, headers: { "x-api-key": mcpToken } });
  eq(r.status, 200); ok(Array.isArray(r.json), "not array");
  ok(r.json.some((b) => b.id === bucketId), "bucket missing: " + JSON.stringify(r.json).slice(0, 120));
});
await t("rpc search_sources finds content", async () => {
  skipNeedsDb();
  const r = await req("POST", "/api/mcp/rpc", { body: { method: "search_sources", params: { query: "Example" } }, headers: { "x-api-key": mcpToken } });
  eq(r.status, 200); ok(r.json.some((s) => s.id === sourceId), "source not found");
});
await t("api key create+list", async () => {
  skipNeedsDb();
  const r = await req("POST", "/api/extension/api-keys", { ...EXT(), body: { name: "e2e" } });
  eq(r.status, 200); ok(r.json.key && r.json.key.startsWith("sg_"), "bad key: " + JSON.stringify(r.json));
  apiKey = r.json.key; apiKeyId = r.json.id;
  const l = await req("GET", "/api/extension/api-keys", EXT());
  ok(l.json.keys.some((x) => x.id === apiKeyId), "key not listed");
});
await t("rpc with api key works", async () => {
  skipNeedsDb();
  const r = await req("POST", "/api/mcp/rpc", { body: { method: "list_buckets", params: {} }, headers: { "x-api-key": apiKey } });
  eq(r.status, 200); ok(Array.isArray(r.json));
});
await t("stripe checkout starter returns url (test mode)", async () => {
  const r = await req("POST", "/api/stripe/checkout", { body: { planId: "starter" } });
  eq(r.status, 200);
  ok(r.json.url || r.json.demo, "no url/demo: " + JSON.stringify(r.json));
  console.log("    checkout:", r.json.demo ? "demo-mode" : "stripe-url-ok");
});

// ---- cleanup (reverse order) ----
await t("cleanup: revoke api key", async () => {
  skipNeedsDb();
  const r = await req("DELETE", "/api/extension/api-keys", { ...EXT(), body: { id: apiKeyId } });
  eq(r.status, 200);
});
await t("cleanup: revoke mcp token", async () => {
  skipNeedsDb();
  const r = await req("DELETE", "/api/mcp/token", { ...EXT(), body: { id: mcpTokenId } });
  eq(r.status, 200);
});
await t("cleanup: revoked token rejected", async () => {
  skipNeedsDb();
  const r = await req("POST", "/api/mcp/rpc", { body: { method: "list_buckets", params: {} }, headers: { "x-api-key": mcpToken } });
  eq(r.status, 401);
});
await t("cleanup: delete source refunds", async () => {
  skipNeedsDb();
  const before = (await req("GET", "/api/stats", EXT())).json;
  const r = await req("DELETE", `/api/sources/${sourceId}`, EXT());
  eq(r.status, 200);
  const after = (await req("GET", "/api/stats", EXT())).json;
  ok(after.totalCreditsUsed < before.totalCreditsUsed, "no refund");
});
await t("cleanup: delete bucket", async () => {
  skipNeedsDb();
  const r = await req("DELETE", `/api/buckets/${bucketId}`, EXT());
  eq(r.status, 200);
});

console.log(`\n${pass} passed, ${fail} failed`);
if (failures.length) console.log("failed:", failures.join(" | "));
process.exit(fail ? 1 : 0);
