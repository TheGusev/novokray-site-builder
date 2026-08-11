import { describe, it, expect } from "vitest";
import { POSTS } from "../blog";
import { getBlogOffer, BLOG_OFFERS } from "../blogPestMap";
import { SERVICES_INDEX } from "../servicesIndex";

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

  it("цены «от» совпадают с прайсом услуг", () => {
    for (const offer of Object.values(BLOG_OFFERS)) {
      const svc = SERVICES_INDEX.find((s) => s.slug === offer.service);
      expect(svc, `услуга ${offer.service}`).toBeTruthy();
      expect(offer.priceFrom).toBe(svc!.priceFrom);
    }
  });

  it("для неизвестной темы есть запасное предложение", () => {
    const fallback = getBlogOffer("unknown-cat", ["nope"]);
    expect(PEST_IDS).toContain(fallback.pest);
  });
});
