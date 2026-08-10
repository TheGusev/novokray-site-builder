import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import { GOALS, serviceSlug, trackGoal, trackLead, YM_COUNTER_ID } from "@/lib/analytics";

describe("analytics", () => {
  const store = new Map<string, string>();
  const setupWindow = (search = "", ym?: unknown) => {
    (globalThis as Record<string, unknown>).window = {
      ym,
      location: { search, pathname: "/uslugi/klopy" },
      sessionStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => void store.set(k, v),
      },
    };
  };

  beforeEach(() => {
    store.clear();
    setupWindow();
  });

  afterAll(() => {
    delete (globalThis as Record<string, unknown>).window;
  });

  it("не падает, если Метрика не загрузилась", () => {
    expect(() => trackGoal(GOALS.leadHero)).not.toThrow();
  });

  it("превращает название услуги в латинский slug", () => {
    expect(serviceSlug("Клопы")).toBe("klopy");
    expect(serviceSlug("Клещи / комары")).toBe("kleschi_komary");
    expect(serviceSlug("")).toBe("other");
  });

  it("отправляет цель с контекстом страницы и utm", () => {
    const ym = vi.fn();
    setupWindow("?utm_source=yandex&utm_medium=cpc", ym);
    trackGoal(GOALS.docsRequest, { org: "ООО Тест" });
    expect(ym).toHaveBeenCalledTimes(1);
    const [id, action, name, params] = ym.mock.calls[0];
    expect(id).toBe(YM_COUNTER_ID);
    expect(action).toBe("reachGoal");
    expect(name).toBe("docs_request");
    expect(params).toMatchObject({ page: "/uslugi/klopy", utm_source: "yandex", org: "ООО Тест" });
  });

  it("лид шлёт цель формы и цель по услуге", () => {
    const ym = vi.fn();
    setupWindow("", ym);
    trackLead(GOALS.leadHero, "Тараканы", { object: "Кафе" });
    const names = ym.mock.calls.map((c) => c[2]);
    expect(names).toEqual(["lead_hero", "lead_tarakany"]);
  });

  it("без услуги отправляет только цель формы", () => {
    const ym = vi.fn();
    setupWindow("", ym);
    trackLead(GOALS.leadModal);
    expect(ym.mock.calls.map((c) => c[2])).toEqual(["lead_modal"]);
  });

  it("отправляет цели CTA первого экрана", () => {
    const ym = vi.fn();
    setupWindow("", ym);
    trackGoal(GOALS.heroCallClick);
    trackGoal(GOALS.heroCalcClick);
    trackGoal(GOALS.statsInfoOpen);
    expect(ym.mock.calls.map((c) => c[2])).toEqual([
      "hero_call_click",
      "hero_calc_click",
      "stats_info_open",
    ]);
  });
});