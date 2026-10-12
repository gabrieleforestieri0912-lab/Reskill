// HTTP API tests vs local dev server. Run: node tests-http.mjs [baseUrl]
const base = process.argv[2] || "http://localhost:3100";
let pass = 0, fail = 0;
const failures = [];
async function t(name, fn) {
  try { await fn(); pass++; console.log("  ok:", name); }
  catch (e) { fail++; failures.push(name); console.error("  FAIL:", name, "-", String(e.message).slice(0, 160)); }
}
function eq(a, b, msg) { if (a !== b) throw new Error(`${msg || "mismatch"}: got ${JSON.stringify(a)} want ${JSON.stringify(b)}`); }
async function req(method, path, opts = {}) {
  const res = await fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    body: opts.body !== undefined ? (typeof opts.body === "string" ? opts.body : JSON.stringify(opts.body)) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* html error page */ }
  return { status: res.status, json, text, isJson: !!json, isHtmlError: text.includes("__next_error__") };
}
function noCrash(r, name) {
  if (r.isHtmlError || r.status === 500) throw new Error(`${name}: HTTP 500 / error page`);
}

// ---- auth gates: no credential -> 401 JSON (never 500) ----
await t("buckets GET noauth 401", async () => { const r = await req("GET", "/api/buckets"); eq(r.status, 401); noCrash(r); });
await t("buckets POST noauth 401", async () => { const r = await req("POST", "/api/buckets", { body: { name: "x" } }); eq(r.status, 401); noCrash(r); });
await t("sources GET noauth 401", async () => { const r = await req("GET", "/api/sources"); eq(r.status, 401); noCrash(r); });
await t("sources DELETE noauth 401", async () => { const r = await req("DELETE", "/api/sources/abc"); eq(r.status, 401); noCrash(r); });
await t("extract POST noauth 401", async () => { const r = await req("POST", "/api/extract", { body: { url: "https://example.com" } }); eq(r.status, 401); noCrash(r); });
await t("mcp token GET noauth 401", async () => { const r = await req("GET", "/api/mcp/token"); eq(r.status, 401); noCrash(r); });
await t("api-keys GET noauth 401", async () => { const r = await req("GET", "/api/extension/api-keys"); eq(r.status, 401); noCrash(r); });
await t("user PATCH noauth 401", async () => { const r = await req("PATCH", "/api/user", { body: { name: "x" } }); eq(r.status, 401); noCrash(r); });
await t("rpc POST noauth 401", async () => { const r = await req("POST", "/api/mcp/rpc", { body: { method: "list_buckets" } }); eq(r.status, 401); noCrash(r); });
await t("rpc bad key 401", async () => {
  const r = await req("POST", "/api/mcp/rpc", { body: { method: "list_buckets" }, headers: { "x-api-key": "sg_mcp_ffffffffffffffffffffffffffffffffffffffffffffffff" } });
  eq(r.status, 401); noCrash(r);
});
await t("rpc GET 405", async () => { const r = await req("GET", "/api/mcp/rpc"); eq(r.status, 405); });

// ---- malformed input: 400/401, never 500 ----
await t("extract malformed body no crash", async () => { const r = await req("POST", "/api/extract", { body: "not-json{{{" }); if (r.status === 500 || r.isHtmlError) throw new Error("crashed"); });
await t("rpc malformed body no crash", async () => { const r = await req("POST", "/api/mcp/rpc", { body: "not-json{{{" }); if (r.status === 500 || r.isHtmlError) throw new Error("crashed"); });
await t("extract missing url no crash", async () => { const r = await req("POST", "/api/extract", { body: {}, headers: { "x-api-key": "sg_ffffffffffffffffffffffffffffffffffffffffffffffff" } }); if (r.status === 500 || r.isHtmlError) throw new Error("crashed"); });
await t("send-code invalid email 400", async () => { const r = await req("POST", "/api/extension/send-code", { body: { email: "not-an-email" } }); eq(r.status, 400); noCrash(r); });
await t("verify wrong code 400/401", async () => {
  const r = await req("POST", "/api/extension/verify", { body: { email: "nobody@example.com", code: "000000" } });
  if (![400, 401].includes(r.status)) throw new Error("status " + r.status); noCrash(r);
});
await t("extension/me no token verified:false", async () => {
  const r = await req("GET", "/api/extension/me"); eq(r.status, 200); eq(r.json && r.json.verified, false); noCrash(r);
});
await t("feedback invalid 400 (no insert)", async () => {
  const r = await req("POST", "/api/feedback", { body: { name: "t", email: "bad", type: "bug", message: "x" } });
  eq(r.status, 400); noCrash(r);
});
await t("register invalid 400", async () => {
  const r = await req("POST", "/api/register", { body: { email: "bad", password: "x" } });
  if (![400, 409, 429].includes(r.status)) throw new Error("status " + r.status); noCrash(r);
});
await t("checkout free plan message (no stripe call)", async () => {
  const r = await req("POST", "/api/stripe/checkout", { body: { planId: "free" } });
  eq(r.status, 200); eq(r.json && r.json.url, null); noCrash(r);
});
await t("subscription noauth free shape", async () => {
  const r = await req("GET", "/api/subscription"); eq(r.status, 200);
  eq(r.json && r.json.plan, "free"); if (!r.json.planDetails) throw new Error("missing planDetails"); noCrash(r);
});
await t("stats noauth shape", async () => {
  const r = await req("GET", "/api/stats"); eq(r.status, 200);
  for (const k of ["totalBuckets", "totalSources", "planCredits", "creditsRemaining", "currentPlan"]) {
    if (!(k in (r.json || {}))) throw new Error("missing " + k);
  }
  noCrash(r);
});
await t("generate-skill empty no crash", async () => {
  const r = await req("POST", "/api/generate-skill", { body: {} });
  if (r.status === 500 || r.isHtmlError) throw new Error("crashed (status " + r.status + ")");
});

// ---- pages ----
for (const p of ["/", "/faq", "/mcp", "/login", "/feedback"]) {
  await t(`page ${p} 200 no error`, async () => {
    const r = await fetch(base + p); const html = await r.text();
    eq(r.status, 200, p); if (html.includes("__next_error__")) throw new Error("error page");
  });
}
await t("page /dashboard redirects to login", async () => {
  const r = await fetch(base + "/dashboard", { redirect: "manual" });
  if (![307, 308, 302].includes(r.status)) throw new Error("status " + r.status);
});

console.log(`\n${pass} passed, ${fail} failed`);
if (failures.length) console.log("failed:", failures.join(" | "));
process.exit(fail ? 1 : 0);
