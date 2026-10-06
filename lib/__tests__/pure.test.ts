import { describe, expect, it } from "vitest";
import {
  PLANS,
  getPlanById,
  getPlanPrice,
  getStripeInterval,
  hasReachedBucketLimit,
  hasReachedSourceLimit,
} from "@/lib/plans";
import {
  buildExportFilename,
  DEFAULT_EXPORT_FOLDER,
  DEFAULT_EXPORT_PATH,
  sanitizePathSegment,
} from "@/lib/export-settings";
import { HOW_IT_WORKS_SLUGS, howItWorksGuides, getGuide } from "@/lib/how-it-works";
import { planComparison, pricingPlans } from "@/lib/site-data";

describe("plans", () => {
  it("i piani a pagamento stanno nel range 4.99 - 9.99", () => {
    for (const id of ["pro", "business"]) {
      expect(PLANS[id].price).toBeGreaterThanOrEqual(4.99);
      expect(PLANS[id].price).toBeLessThanOrEqual(9.99);
    }
  });

  it("getPlanById ritorna free per id sconosciuti", () => {
    expect(getPlanById("inesistente").id).toBe("free");
    expect(getPlanById("pro").name).toBe("Pro");
  });

  it("getPlanPrice distingue mensile e annuale", () => {
    const pro = getPlanById("pro");
    expect(getPlanPrice(pro, "monthly")).toBe(pro.price);
    expect(getPlanPrice(pro, "annual")).toBe(pro.annualPrice);
    expect(pro.annualPrice).toBeLessThan(pro.price * 12);
  });

  it("getStripeInterval mappa billing -> intervallo Stripe", () => {
    expect(getStripeInterval("monthly")).toBe("month");
    expect(getStripeInterval("annual")).toBe("year");
  });

  it("i limiti bucket/fonti funzionano", () => {
    expect(hasReachedBucketLimit("free", 0)).toBe(false);
    expect(hasReachedBucketLimit("free", 1)).toBe(true);
    expect(hasReachedSourceLimit("free", 3)).toBe(true);
    expect(hasReachedBucketLimit("enterprise", 9999)).toBe(false);
    expect(hasReachedSourceLimit("enterprise", 9999)).toBe(false);
  });
});

describe("export-settings", () => {
  it("sanitizePathSegment pulisce e usa fallback", () => {
    expect(sanitizePathSegment("  reskill/exports ", "fb")).toBe("reskill/exports");
    expect(sanitizePathSegment("../etc", "fb")).toBe("etc");
    expect(sanitizePathSegment("", "fb")).toBe("fb");
    expect(sanitizePathSegment("a//b", "fb")).toBe("a/b");
  });

  it("buildExportFilename costruisce path/cartella/nome.md", () => {
    expect(buildExportFilename("video test!", {})).toBe(
      `${DEFAULT_EXPORT_PATH}/${DEFAULT_EXPORT_FOLDER}/video test.md`
    );
    expect(
      buildExportFilename("x", { exportPath: "  mio/path ", exportFolder: "cartella" })
    ).toBe("mio/path/cartella/x.md");
  });
});

describe("how-it-works", () => {
  it("ha 5 guide con slug unici", () => {
    expect(howItWorksGuides).toHaveLength(5);
    const slugs = howItWorksGuides.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(5);
    expect([...HOW_IT_WORKS_SLUGS].sort()).toEqual([...slugs].sort());
  });

  it("la catena nextSlug è valida e termina", () => {
    for (const g of howItWorksGuides) {
      if (g.nextSlug) expect(getGuide(g.nextSlug)).toBeDefined();
      expect(g.sections.length).toBeGreaterThan(0);
      expect(g.checklist.length).toBeGreaterThan(0);
    }
    expect(howItWorksGuides[howItWorksGuides.length - 1].nextSlug).toBeNull();
  });

  it("getGuide ritorna undefined per slug sconosciuti", () => {
    expect(getGuide("non-esiste")).toBeUndefined();
  });
});

describe("pricing marketing data", () => {
  it("ogni piano ha target, prezzi e feature differenziate", () => {
    expect(pricingPlans.length).toBeGreaterThanOrEqual(3);
    for (const p of pricingPlans) {
      expect(p.features.length).toBeGreaterThan(3);
    }
    const all = pricingPlans.map((p) => p.id);
    expect(new Set(all).size).toBe(all.length);
  });

  it("la tabella comparativa copre tutti i piani", () => {
    expect(planComparison.length).toBeGreaterThan(5);
    for (const row of planComparison) {
      expect(row.label.length).toBeGreaterThan(0);
      expect(row.free.length).toBeGreaterThan(0);
      expect(row.pro.length).toBeGreaterThan(0);
      expect(row.business.length).toBeGreaterThan(0);
    }
  });
});
