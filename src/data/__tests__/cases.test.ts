import { describe, it, expect } from "vitest";
import { WORK_CASES, caseFor, caseVideoExists } from "../cases";
import { WORK_VIDEOS } from "../videos";
import { LANDINGS, PESTS, OBJECTS, landingAnswer, landingOffers } from "../landings";

describe("кейсы из практики", () => {
  it("у каждого кейса есть реальный ролик", () => {
    for (const c of WORK_CASES) expect(caseVideoExists(c), c.video).toBe(true);
    expect(WORK_VIDEOS.length).toBeGreaterThan(0);
  });

  it("ключи вредителей и объектов существуют", () => {
    for (const c of WORK_CASES) {
      for (const p of c.pests) expect(PESTS[p], p).toBeTruthy();
      for (const o of c.objects) expect(OBJECTS[o], o).toBeTruthy();
    }
  });

  it("для каждой посадочной подбирается кейс", () => {
    for (const l of LANDINGS) expect(caseFor(l.pest, l.object), l.slug).toBeTruthy();
  });

  it("в кейсах нет выдуманных отзывов и оценок", () => {
    const text = JSON.stringify(WORK_CASES).toLowerCase();
    expect(text).not.toMatch(/отзыв|рейтинг|★|звёзд/);
  });
});

describe("прямые ответы и Offer посадочных", () => {
  it("ответ содержит цену, гарантию и график", () => {
    for (const l of LANDINGS) {
      const a = landingAnswer(l);
      expect(a, l.slug).toMatch(/от \d/);
      expect(a).toMatch(/Гарантия/);
      expect(a).toMatch(/07:00/);
      expect(a.split(/\s+/).length).toBeLessThan(90);
    }
  });

  it("на каждую строку прайса есть Offer с PriceSpecification", () => {
    for (const l of LANDINGS) {
      const offers = landingOffers(l, "https://novokray-site-builder.lovable.app/obrabotka/" + l.slug);
      expect(offers.length, l.slug).toBeGreaterThan(0);
      for (const o of offers) {
        expect(o.priceSpecification.minPrice).toBeGreaterThan(0);
        expect(o.priceSpecification.priceCurrency).toBe("RUB");
      }
    }
  });
});
