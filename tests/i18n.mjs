// Deep translation parity: every leaf key in it must exist in en and vice versa.
import { readFileSync } from "node:fs";
function leaves(src, prefix = "") {
  const out = new Set();
  // crude object walk over lines: track brace depth with key stack (works for flat nested literals)
  const stack = [];
  for (const raw of src.split("\n")) {
    const line = raw.trim();
    let m = line.match(/^(\w+): \{$/);
    if (m) { stack.push(m[1]); continue; }
    if (line === "},") { stack.pop(); continue; }
    m = line.match(/^(\w+)([,:])/);
    if (m && !line.includes("=>") && !line.startsWith("import")) out.add([...stack, m[1]].join("."));
  }
  return out;
}
let fail = 0;
for (const [a, b] of [["translations/it.ts", "translations/en.ts"], ["mobile/translations/it.ts", "mobile/translations/en.ts"]]) {
  const ka = leaves(readFileSync(a, "utf8")), kb = leaves(readFileSync(b, "utf8"));
  const missB = [...ka].filter((k) => !kb.has(k)), missA = [...kb].filter((k) => !ka.has(k));
  if (missA.length || missB.length) {
    fail++;
    console.log(`FAIL ${a} vs ${b}`);
    if (missB.length) console.log("  missing in en:", missB.slice(0, 15).join(", "));
    if (missA.length) console.log("  missing in it:", missA.slice(0, 15).join(", "));
  } else console.log(`ok: ${a} vs ${b} (${ka.size} keys)`);
}
process.exit(fail ? 1 : 0);
