import { describe, it, expect } from "vitest";
import { SEMANTIC_CORE, cannibalized, coreStats } from "../semanticCore";
import { getAllPaths } from "@/lib/all-routes";
import { LANDINGS, PESTS, OBJECTS, landingPrices, landingPriceFrom } from "../landings";

describe("семантическое ядро", () => {
  const paths = new Set(getAllPaths());

  it("каждая целевая страница существует в роутинге", () => {
    const missing = SEMANTIC_CORE.filter((c) => !paths.has(c.target)).map((c) => c.target);
    expect([...new Set(missing)]).toEqual([]);
  });

  it("нет каннибализации: один запрос — одна страница", () => {
    expect(cannibalized()).toEqual([]);
  });

  it("покрыты все частотные уровни", () => {
    const s = coreStats();
    expect(s.vch).toBeGreaterThan(3);
    expect(s.sch).toBeGreaterThan(10);
    expect(s.nch).toBeGreaterThan(30);
    expect(s.snch).toBeGreaterThan(10);
  });
});

describe("объектные посадочные", () => {
  it("slug уникальны", () => {
    const slugs = LANDINGS.map((l) => l.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("title и description уникальны и в пределах лимитов", () => {
    const titles = LANDINGS.map((l) => l.title);
    const descs = LANDINGS.map((l) => l.description);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descs).size).toBe(descs.length);
    for (const l of LANDINGS) {
      expect(l.title.length, l.slug).toBeLessThanOrEqual(90);
      expect(l.description.length, l.slug).toBeGreaterThan(80);
      expect(l.description.length, l.slug).toBeLessThanOrEqual(200);
      expect(l.h1.length, l.slug).toBeGreaterThan(15);
    }
  });

  it("измерения существуют и цена подтягивается из прайса", () => {
    for (const l of LANDINGS) {
      expect(PESTS[l.pest], l.slug).toBeTruthy();
      expect(OBJECTS[l.object], l.slug).toBeTruthy();
      expect(landingPrices(l).length, l.slug).toBeGreaterThan(0);
      expect(landingPriceFrom(l), l.slug).toBeGreaterThanOrEqual(1000);
    }
  });

  it("у каждой посадочной свои 2 вопроса, без дублей по сайту", () => {
    const all: string[] = [];
    for (const l of LANDINGS) {
      expect(l.faq.length, l.slug).toBeGreaterThanOrEqual(2);
      all.push(...l.faq.map((f) => f.q));
    }
    expect(new Set(all).size).toBe(all.length);
  });
});

describe("кластер срочности", () => {
  it("запросы «срочно/сегодня» ведут на существующие страницы и не дублируют друг друга", async () => {
    const urgent = SEMANTIC_CORE.filter((c) =>
      /срочн|сегодня|круглосуточ|выходн/.test(c.q),
    );
    expect(urgent.length).toBeGreaterThan(20);
    const paths = new Set(getAllPaths());
    for (const c of urgent) expect(paths.has(c.target), c.q).toBe(true);
    expect(cannibalized()).toEqual([]);
  });
});
