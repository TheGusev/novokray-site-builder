import { describe, it, expect } from "vitest";
import {
  CATALOG,
  LEVEL_MULTIPLIER,
  LEVEL_WARRANTY_DAYS,
  UNIT_LIMITS,
  clampQty,
  getElementLimits,
  getPest,
  type InfestationLevel,
  type TreatmentElement,
} from "../treatmentCatalog";

const ALL_LEVELS: InfestationLevel[] = ["1", "2-3", "4-5"];
const ALLOWED_UNITS = new Set(Object.keys(UNIT_LIMITS));

describe("Каталог обработок — целостность данных", () => {
  it("у каждого вредителя есть имя, methodNote, препараты и работы", () => {
    expect(CATALOG.length).toBeGreaterThan(0);
    for (const p of CATALOG) {
      expect(p.key).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.methodNote.length).toBeGreaterThan(20);
      expect(p.preparations.length).toBeGreaterThan(0);
      expect(p.elements.length).toBeGreaterThan(0);
    }
  });

  it("ключи вредителей уникальны", () => {
    const keys = CATALOG.map((p) => p.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("id работ внутри каждого вредителя уникальны", () => {
    for (const p of CATALOG) {
      const ids = p.elements.map((e) => e.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("каждая работа использует валидную единицу измерения", () => {
    for (const p of CATALOG) {
      for (const el of p.elements) {
        expect(ALLOWED_UNITS.has(el.unit)).toBe(true);
        expect(el.basePrice).toBeGreaterThan(0);
      }
    }
  });

  it("getPest находит вредителя по ключу и возвращает undefined для несуществующего", () => {
    expect(getPest("klopy")?.name).toBe("Клопы");
    expect(getPest("несуществующий-ключ")).toBeUndefined();
  });
});

describe("Степень заражения — множитель цены и гарантия", () => {
  it("множители: 1→×1, 2-3→×1.5, 4-5→×2", () => {
    expect(LEVEL_MULTIPLIER["1"]).toBe(1.0);
    expect(LEVEL_MULTIPLIER["2-3"]).toBe(1.5);
    expect(LEVEL_MULTIPLIER["4-5"]).toBe(2.0);
  });

  it("гарантия: 1→90, 2-3→60, 4-5→30 дней", () => {
    expect(LEVEL_WARRANTY_DAYS["1"]).toBe(90);
    expect(LEVEL_WARRANTY_DAYS["2-3"]).toBe(60);
    expect(LEVEL_WARRANTY_DAYS["4-5"]).toBe(30);
  });

  it("множитель монотонно растёт со степенью заражения", () => {
    expect(LEVEL_MULTIPLIER["1"]).toBeLessThan(LEVEL_MULTIPLIER["2-3"]);
    expect(LEVEL_MULTIPLIER["2-3"]).toBeLessThan(LEVEL_MULTIPLIER["4-5"]);
  });

  it("гарантия монотонно убывает со степенью заражения", () => {
    expect(LEVEL_WARRANTY_DAYS["1"]).toBeGreaterThan(LEVEL_WARRANTY_DAYS["2-3"]);
    expect(LEVEL_WARRANTY_DAYS["2-3"]).toBeGreaterThan(LEVEL_WARRANTY_DAYS["4-5"]);
  });
});

describe("Связка степень заражения ↔ работы (levelLock)", () => {
  it("levelLock содержит только валидные значения степени", () => {
    for (const p of CATALOG) {
      for (const el of p.elements) {
        if (!el.levelLock) continue;
        for (const lvl of el.levelLock) {
          expect(ALL_LEVELS).toContain(lvl);
        }
        expect(new Set(el.levelLock).size).toBe(el.levelLock.length);
      }
    }
  });

  it("контрольный визит грызунов привязан к сильной степени (4-5)", () => {
    const gryzuny = getPest("gryzuny");
    const kontroll = gryzuny?.elements.find((e) => e.id === "kontroll");
    expect(kontroll?.levelLock).toEqual(["4-5"]);
  });

  it("гель-приманки и точки раскладки рекомендованы при лёгкой/средней степени, не при 4-5", () => {
    for (const p of CATALOG) {
      for (const el of p.elements) {
        if (el.id === "gel" || el.id === "primanka") {
          expect(el.levelLock).toBeDefined();
          expect(el.levelLock).not.toContain("4-5");
        }
      }
    }
  });
});

describe("Единицы измерения ↔ количество", () => {
  it("UNIT_LIMITS определены для всех используемых единиц", () => {
    const used = new Set<string>();
    for (const p of CATALOG) for (const el of p.elements) used.add(el.unit);
    for (const u of used) expect(UNIT_LIMITS[u]).toBeDefined();
  });

  it("clampQty подрезает значения ниже минимума", () => {
    const el: TreatmentElement = { id: "x", name: "x", unit: "шт", basePrice: 100 };
    const { min } = getElementLimits(el);
    expect(clampQty(-100, el)).toBe(min);
    expect(clampQty(0, el)).toBe(min);
  });

  it("clampQty подрезает значения выше максимума", () => {
    const el: TreatmentElement = { id: "x", name: "x", unit: "м.п.", basePrice: 50 };
    const { max } = getElementLimits(el);
    expect(clampQty(999999, el)).toBe(max);
  });

  it("clampQty возвращает min при нечисловом вводе (NaN/Infinity)", () => {
    const el: TreatmentElement = { id: "x", name: "x", unit: "м²", basePrice: 30 };
    const { min } = getElementLimits(el);
    expect(clampQty(NaN, el)).toBe(min);
    expect(clampQty(Infinity, el)).toBe(min);
  });

  it("clampQty округляет дробные значения", () => {
    const el: TreatmentElement = { id: "x", name: "x", unit: "шт", basePrice: 100 };
    expect(clampQty(3.4, el)).toBe(3);
    expect(clampQty(3.6, el)).toBe(4);
  });

  it("element-специфичные min/max/step переопределяют дефолтные UNIT_LIMITS", () => {
    const el: TreatmentElement = {
      id: "x",
      name: "x",
      unit: "шт",
      basePrice: 100,
      min: 5,
      max: 7,
      step: 1,
    };
    const lim = getElementLimits(el);
    expect(lim.min).toBe(5);
    expect(lim.max).toBe(7);
    expect(clampQty(1, el)).toBe(5);
    expect(clampQty(20, el)).toBe(7);
  });

  it("defaultQty каждой работы лежит в пределах допустимого диапазона", () => {
    for (const p of CATALOG) {
      for (const el of p.elements) {
        if (el.defaultQty === undefined) continue;
        const { min, max } = getElementLimits(el);
        expect(el.defaultQty).toBeGreaterThanOrEqual(min);
        expect(el.defaultQty).toBeLessThanOrEqual(max);
      }
    }
  });
});

describe("Уличные обработки (клещи / комары / мошка / мухи)", () => {
  const OUTDOOR_KEYS = ["kleshchi", "komary", "moshka"];

  it("все уличные вредители помечены outdoor=true", () => {
    for (const k of OUTDOOR_KEYS) {
      expect(getPest(k)?.outdoor).toBe(true);
    }
  });

  it("у клещей доступна единица «сотка» и базовый периметр в м.п.", () => {
    const p = getPest("kleshchi")!;
    const units = new Set(p.elements.map((e) => e.unit));
    expect(units.has("сотка")).toBe(true);
    expect(units.has("м.п.")).toBe(true);
  });

  it("у комаров доступны точки (водоём) и сотки (участок)", () => {
    const p = getPest("komary")!;
    const units = new Set(p.elements.map((e) => e.unit));
    expect(units.has("сотка")).toBe(true);
    expect(units.has("точка")).toBe(true);
  });

  it("уличные обработки используют профессиональные акарициды/инсектициды", () => {
    for (const k of OUTDOOR_KEYS) {
      const meds = getPest(k)!.preparations;
      const hasCore =
        meds.includes("Медилис-Ципер") ||
        meds.includes("Сипаз-Супер") ||
        meds.includes("Цифокс");
      expect(hasCore).toBe(true);
    }
  });

  it("барьерная защита определена для всех уличных вредителей", () => {
    for (const k of OUTDOOR_KEYS) {
      const p = getPest(k)!;
      expect(p.barrier).toBeDefined();
      expect(p.barrier!.basePrice).toBeGreaterThan(0);
    }
  });

  it("мухи присутствуют в каталоге с обработкой мусорных зон", () => {
    const muhi = getPest("muhi");
    expect(muhi).toBeDefined();
    expect(muhi!.elements.some((e) => e.id === "musor")).toBe(true);
  });
});

describe("Расчёт стоимости блока (фикстуры)", () => {
  // Хелпер расчёта блока — отражает логику builder'а договора
  function calcBlock(opts: {
    pestKey: string;
    level: InfestationLevel;
    items: Array<{ id: string; qty: number }>;
    withBarrier?: boolean;
  }): number {
    const p = getPest(opts.pestKey)!;
    const mult = LEVEL_MULTIPLIER[opts.level];
    let sum = 0;
    for (const it of opts.items) {
      const el = p.elements.find((e) => e.id === it.id)!;
      sum += el.basePrice * it.qty * mult;
    }
    if (opts.withBarrier && p.barrier) {
      sum += p.barrier.basePrice * mult;
    }
    return Math.round(sum);
  }

  it("клопы, степень 1: 1 кровать (600) + 10 м.п. плинтусов (50×10) = 1100 ₽", () => {
    expect(
      calcBlock({
        pestKey: "klopy",
        level: "1",
        items: [
          { id: "krovat", qty: 1 },
          { id: "plintus_pol", qty: 10 },
        ],
      }),
    ).toBe(1100);
  });

  it("клопы, степень 2-3 (×1.5): то же = 1650 ₽", () => {
    expect(
      calcBlock({
        pestKey: "klopy",
        level: "2-3",
        items: [
          { id: "krovat", qty: 1 },
          { id: "plintus_pol", qty: 10 },
        ],
      }),
    ).toBe(1650);
  });

  it("клопы, степень 4-5 (×2) + барьер: (600+500)·2 + 1500·2 = 5200 ₽", () => {
    expect(
      calcBlock({
        pestKey: "klopy",
        level: "4-5",
        items: [
          { id: "krovat", qty: 1 },
          { id: "shkaf", qty: 1 },
        ],
        withBarrier: true,
      }),
    ).toBe(5200);
  });

  it("клещи, участок 6 соток (350×6) + 50 м.п. периметра (40×50) = 4100 ₽ при степени 1", () => {
    expect(
      calcBlock({
        pestKey: "kleshchi",
        level: "1",
        items: [
          { id: "uchastok", qty: 6 },
          { id: "perimetr", qty: 50 },
        ],
      }),
    ).toBe(4100);
  });
});