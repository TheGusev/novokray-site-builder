import { describe, it, expect } from "vitest";
import { calcQuickPrice, MIN_TICKET, OBJECT_KINDS, PEST_OPTIONS } from "@/data/b2bPricing";

describe("b2bPricing.calcQuickPrice", () => {
  it("считает офис 100 м² × разовая обработка тараканов без НДС", () => {
    const office = OBJECT_KINDS.find((k) => k.key === "office")!;
    const tarakany = PEST_OPTIONS.find((p) => p.key === "tarakany")!;
    const r = calcQuickPrice({
      objectKind: "office",
      areaM2: 100,
      pests: ["tarakany"],
      withBarrier: false,
      vatIncluded: false,
      periodicity: "once",
    });
    const raw = 100 * office.ratePerM2 * tarakany.multiplier;
    expect(r.perVisit).toBe(Math.max(raw, MIN_TICKET));
    expect(r.perVisitVat).toBe(0);
    expect(r.perVisitTotal).toBe(r.perVisit);
    expect(r.visitsPerYear).toBe(1);
  });

  it("применяет минимальный чек при малой площади", () => {
    const r = calcQuickPrice({
      objectKind: "office",
      areaM2: 20,
      pests: ["tarakany"],
      withBarrier: false,
      vatIncluded: false,
      periodicity: "once",
    });
    expect(r.perVisit).toBe(MIN_TICKET);
    expect(r.minTicketApplied).toBe(true);
  });

  it("добавляет НДС 20% и корректно масштабирует годовой контракт", () => {
    const r = calcQuickPrice({
      objectKind: "catering",
      areaM2: 200,
      pests: ["kompleks"],
      withBarrier: false,
      vatIncluded: true,
      periodicity: "monthly",
    });
    expect(r.perVisitVat).toBe(Math.round(r.perVisit * 0.2));
    expect(r.perVisitTotal).toBe(r.perVisit + r.perVisitVat);
    expect(r.visitsPerYear).toBe(12);
    expect(r.perYearTotal).toBe(r.perVisitTotal * 12);
  });

  it("суммирует несколько видов работ и добавляет барьер", () => {
    const r = calcQuickPrice({
      objectKind: "warehouse",
      areaM2: 500,
      pests: ["gryzuny", "tarakany"],
      withBarrier: true,
      vatIncluded: false,
      periodicity: "quarterly",
    });
    expect(r.lines.length).toBeGreaterThanOrEqual(3); // 2 вредителя + барьер
    expect(r.visitsPerYear).toBe(4);
    expect(r.perYearTotal).toBe(r.perVisitTotal * 4);
  });

  it("не падает на пустом списке вредителей", () => {
    const r = calcQuickPrice({
      objectKind: "office",
      areaM2: 100,
      pests: [],
      withBarrier: false,
      vatIncluded: false,
      periodicity: "once",
    });
    expect(r.perVisit).toBe(0);
    expect(r.perYearTotal).toBe(0);
  });
});
