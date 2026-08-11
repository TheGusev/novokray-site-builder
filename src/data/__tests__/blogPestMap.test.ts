import { describe, it, expect } from "vitest";
import { POSTS } from "../blog";
import { getBlogOffer, BLOG_OFFERS } from "../blogPestMap";
import { PRICING } from "../leadPricing";

// id вредителей, доступные в LeadForm
const PEST_IDS = [
  "Клопы", "Тараканы", "Грызуны", "Блохи", "Муравьи", "Осы",
  "Клещи / комары", "Плесень", "Озонирование", "Сушка после потопа",
  "Борщевик", "Другое",
];

describe("сквиз-предложения в блоге", () => {
  it("каждая статья получает предложение с валидной темой", () => {
    for (const p of POSTS) {
      const offer = getBlogOffer(p.category, p.relatedServices);
      expect(PEST_IDS, `статья ${p.slug}`).toContain(offer.pest);
      expect(offer.heading.length).toBeGreaterThan(10);
      expect(offer.bullets.length).toBeGreaterThanOrEqual(2);
      expect(offer.service).toBeTruthy();
    }
  });

  it("предложение соответствует первой связанной услуге, если она известна", () => {
    for (const p of POSTS) {
      const first = p.relatedServices.find((s) => s in BLOG_OFFERS);
      if (first) expect(getBlogOffer(p.category, p.relatedServices).service).toBe(first);
    }
  });

  it("цены «от» неотрицательны и согласованы с прайсом там, где он есть", () => {
    for (const offer of Object.values(BLOG_OFFERS)) {
      expect(offer.priceFrom === null || offer.priceFrom > 0).toBe(true);
      const table = PRICING[offer.pest];
      if (table && offer.priceFrom && offer.pest !== "Другое") {
        const min = Math.min(...Object.values(table));
        expect(offer.priceFrom).toBeGreaterThanOrEqual(min);
      }
    }
  });

  it("для неизвестной темы есть запасное предложение", () => {
    const fallback = getBlogOffer("unknown-cat", ["nope"]);
    expect(PEST_IDS).toContain(fallback.pest);
  });
});
