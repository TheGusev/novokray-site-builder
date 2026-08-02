import { describe, it, expect } from "vitest";
import { SERVICES } from "../services";
import { SERVICES_INDEX } from "../servicesIndex";

describe("SERVICES_INDEX синхронизирован с каталогом услуг", () => {
  it("содержит те же услуги в том же порядке", () => {
    expect(SERVICES_INDEX.map((s) => s.slug)).toEqual(SERVICES.map((s) => s.slug));
  });

  it("совпадает по полям, которые используются в head()/JSON-LD", () => {
    SERVICES.forEach((s, i) => {
      const idx = SERVICES_INDEX[i];
      expect(idx.title).toBe(s.title);
      expect(idx.h1).toBe(s.h1);
      expect(idx.category).toBe(s.category);
      expect(idx.priority).toBe(s.priority);
      expect(idx.priceFrom).toBe(s.priceFrom);
      expect(idx.metaDescription).toBe(s.metaDescription);
    });
  });
});
