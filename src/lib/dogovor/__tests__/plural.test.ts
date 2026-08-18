import { describe, it, expect } from "vitest";
import { monthsRu } from "../plural";
import { LEVEL_WARRANTY_MONTHS } from "@/data/treatmentCatalog";

describe("склонение месяцев", () => {
  it("правильные формы", () => {
    expect(monthsRu(1)).toBe("1 месяц");
    expect(monthsRu(2)).toBe("2 месяца");
    expect(monthsRu(3)).toBe("3 месяца");
    expect(monthsRu(5)).toBe("5 месяцев");
    expect(monthsRu(11)).toBe("11 месяцев");
    expect(monthsRu(12)).toBe("12 месяцев");
    expect(monthsRu(21)).toBe("21 месяц");
    expect(monthsRu(24)).toBe("24 месяца");
  });

  it("гарантия по степеням задана в месяцах и убывает", () => {
    expect(LEVEL_WARRANTY_MONTHS["1"]).toBe(3);
    expect(LEVEL_WARRANTY_MONTHS["2-3"]).toBe(2);
    expect(LEVEL_WARRANTY_MONTHS["4-5"]).toBe(1);
    Object.values(LEVEL_WARRANTY_MONTHS).forEach((m) => {
      expect(m).toBeGreaterThanOrEqual(1);
      expect(m).toBeLessThanOrEqual(36);
    });
  });
});