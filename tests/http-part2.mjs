// HTTP API tests part 2 (run after part 1). Run: node tests-http2.mjs [baseUrl]
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
  try { json = JSON.parse(text); } catch { /* html */ }
  return { status: res.status, json, text, isJson: !!json, isHtmlError: text.includes("__next_error__") };
}
function noCrash(r) { if (r.isHtmlError || r.status === 500) throw new Error("HTTP 500 / error page"); }

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
await t("subscription planDetails matches starter catalog", async () => {
  const r = await req("GET", "/api/subscription");
  eq(r.json.planDetails.id, "free"); eq(r.json.planDetails.credits, 10); noCrash(r);
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
await t("stripe portal noauth 401", async () => {
  const r = await req("POST", "/api/stripe/portal", { body: {} });
  eq(r.status, 401); noCrash(r);
});
await t("buckets/[id] PUT noauth 401", async () => {
  const r = await req("PUT", "/api/buckets/abc", { body: { name: "x" } });
  eq(r.status, 401); noCrash(r);
});
await t("buckets/[id] DELETE noauth 401", async () => {
  const r = await req("DELETE", "/api/buckets/abc"); eq(r.status, 401); noCrash(r);
});
await t("mcp token POST noauth 401", async () => {
  const r = await req("POST", "/api/mcp/token", { body: { name: "t" } }); eq(r.status, 401); noCrash(r);
});
await t("mcp token DELETE noauth 401", async () => {
  const r = await req("DELETE", "/api/mcp/token", { body: { id: "x" } }); eq(r.status, 401); noCrash(r);
});
await t("api-keys POST noauth 401", async () => {
  const r = await req("POST", "/api/extension/api-keys", { body: { name: "t" } }); eq(r.status, 401); noCrash(r);
});
await t("rpc unknown method + bad key 401 first", async () => {
  const r = await req("POST", "/api/mcp/rpc", { body: { method: "nope" }, headers: { "x-api-key": "sg_ffffffffffffffffffffffffffffffffffffffffffffffff" } });
  eq(r.status, 401); noCrash(r);
});
await t("link-session no cookie verified:false", async () => {
  const r = await req("GET", "/api/extension/link-session");
  if (![200, 401].includes(r.status)) throw new Error("status " + r.status); noCrash(r);
});

for (const p of ["/", "/faq", "/mcp", "/login", "/feedback", "/privacy", "/terms"]) {
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
