// Static consistency tests — no server needed. Run: node tests-consistency.mjs (cwd = repo root)
import { readFileSync, existsSync } from "node:fs";
import assert from "node:assert";

let pass = 0, fail = 0;
function t(name, fn) {
  try { fn(); pass++; console.log("  ok:", name); }
  catch (e) { fail++; console.error("  FAIL:", name, "-", e.message.split("\n")[0]); }
}
const read = (p) => readFileSync(p, "utf-8");

// ---- 1. Plan parity: every paid plan id present in all catalogs ----
const planIds = ["free", "starter", "pro", "business", "enterprise"];
const catalogs = {
  "lib/plans.ts": read("lib/plans.ts"),
  "lib/site-data.ts": read("lib/site-data.ts"),
  "components/PlansSection.tsx": read("components/PlansSection.tsx"),
  "components/AccountPage.tsx": read("components/AccountPage.tsx"),
  "mobile/lib/plans.ts": read("mobile/lib/plans.ts"),
  "mobile/lib/site-data.ts": read("mobile/lib/site-data.ts"),
};
for (const [file, src] of Object.entries(catalogs)) {
  for (const id of planIds) {
    t(`${file} contains plan ${id}`, () => assert(src.includes(`"${id}"`) || src.includes(`'${id}'`), "missing"));
  }
}
// starter specs
t("starter price 7.99 in lib/plans.ts", () => assert(/starter: \{[^}]*price: 7\.99/s.test(read("lib/plans.ts"))));
t("starter credits 250 in lib/plans.ts", () => assert(/starter: \{[^}]*credits: 250/s.test(read("lib/plans.ts"))));
t("starter limits 5/30 in lib/plans.ts", () => assert(read("lib/plans.ts").includes("maxBuckets: 5, maxSources: 30")));
// credits match between lib/plans.ts and site-data pricingPlans
t("credits match plans.ts vs site-data", () => {
  const plans = read("lib/plans.ts"), site = read("lib/site-data.ts");
  for (const id of planIds) {
    const m1 = plans.match(new RegExp(id + ": \\{[^}]*credits: (\\d+)", "s"));
    const m2 = site.match(new RegExp('id: "' + id + '",\\s*credits: (\\d+)', "s"));
    assert(m1 && m2, `plan ${id} not found in both`);
    assert.equal(m1[1], m2[1], `plan ${id}: ${m1[1]} vs ${m2[1]}`);
  }
});

// ---- 2. Translation key parity it/en (web + mobile) ----
function keysOf(src) {
  // top-level section keys like "  account: {" — approximate via "<word>:" at 2-space indent
  return new Set([...src.matchAll(/^  (\w+): \{/gm)].map((m) => m[1]));
}
for (const pair of [["translations/it.ts", "translations/en.ts"], ["mobile/translations/it.ts", "mobile/translations/en.ts"]]) {
  t(`sections parity ${pair[0]} vs ${pair[1]}`, () => {
    const a = keysOf(read(pair[0])), b = keysOf(read(pair[1]));
    const missA = [...b].filter((k) => !a.has(k)), missB = [...a].filter((k) => !b.has(k));
    assert(!missA.length && !missB.length, `missing it:[${missA}] en:[${missB}]`);
  });
}

// ---- 3. Extension endpoints exist in backend ----
const backendRoutes = ["api/extract", "api/buckets", "api/sources", "api/stats", "api/stripe/checkout",
  "api/extension/me", "api/extension/send-code", "api/extension/verify", "api/extension/link-session"];
const extFiles = ["extension/shared.js", "extension/content.js", "extension/background.js", "extension/content-auth.js"];
const used = new Set();
for (const f of extFiles) {
  const src = read(f);
  for (const m of src.matchAll(/\/api\/[a-zA-Z0-9/_${}\-.]*/g)) used.add(m[0].replace(/\$\{[^}]*\}/g, ""));
}
t("extension endpoints all exist in backend", () => {
  const missing = [...used].filter((u) => {
    const norm = u.replace(/\/+/g, "/");
    return !backendRoutes.some((r) => norm.includes(r)) && !norm.includes("/api/auth/signout");
  });
  assert(!missing.length, "unknown endpoints: " + missing.join(","));
});

// ---- 4. Stripe unit_amount integer-safe ----
t("checkout uses Math.round(price*100)", () => assert(read("app/api/stripe/checkout/route.ts").includes("Math.round(plan.price * 100)")));

// ---- 5. CORS headers include extension + api key headers ----
t("CORS allows x-extension-token", () => assert(read("next.config.ts").includes("x-extension-token")));
t("CORS allows x-api-key", () => assert(read("next.config.ts").includes("x-api-key")));

// ---- 6. Manifest URLs use production domain ----
t("manifest has production domain", () => assert(read("extension/manifest.json").includes("reskill-skill.vercel.app")));
t("manifest has no reskill.app", () => assert(!read("extension/manifest.json").includes("reskill.app")));

// ---- 7. No leftover https://reskill.app in web/extension source (emails excluded) ----
t("no stale reskill.app URLs", () => {
  const files = ["app/layout.tsx", "app/sitemap.ts", "components/seo/JsonLd.tsx", "public/robots.txt",
    "extension/shared.js", "extension/content.js", "extension/background.js"];
  const bad = files.filter((f) => read(f).includes("https://reskill.app"));
  assert(!bad.length, "stale urls in: " + bad.join(","));
});

// ---- 8. Required env keys documented ----
t(".env has XKIRO_API_KEY", () => assert(read(".env").includes("XKIRO_API_KEY=")));
t(".env has STRIPE_STARTER_PRICE_ID", () => assert(read(".env").includes("STRIPE_STARTER_PRICE_ID=")));

// ---- 9. opencode.json rule present ----
t("opencode.json has auto-push rule", () => assert(read("opencode.json").toLowerCase().includes("push")));

// ---- 10. Extension plan labels match backend limits ----
t("extension labels match backend limits", () => {
  const s = read("extension/shared.js");
  assert(s.includes("15 bucket, 100 fonti"), "pro limits label");
  assert(s.includes("5 bucket, 30 fonti"), "starter limits label");
  assert(!s.includes("Accesso illimitato"), "stale unlimited claim");
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
