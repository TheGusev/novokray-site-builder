/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import { normalizePhone, buildLeadBody, collectUtm } from "../leadSender";

describe("normalizePhone", () => {
  it("нормализует 8XXXXXXXXXX", () => {
    expect(normalizePhone("89939289488")).toBe("+79939289488");
  });
  it("нормализует форматированный номер", () => {
    expect(normalizePhone("+7 (993) 928-94-88")).toBe("+79939289488");
  });
  it("нормализует 10 цифр", () => {
    expect(normalizePhone("9939289488")).toBe("+79939289488");
  });
});

describe("buildLeadBody", () => {
  it("подставляет honeypot и нормализованный телефон", () => {
    const body = buildLeadBody({ type: "Заявка на обработку", phone: "8 993 928 94 88", pest: "Клопы" });
    expect(body.phone).toBe("+79939289488");
    expect(body.company).toBe("");
    expect(body.pest).toBe("Клопы");
    expect(typeof body.sentAt).toBe("string");
  });

  it("передаёт контекст заявки: форма, основание цены, документы", () => {
    const body = buildLeadBody({
      type: "Заявка на обработку",
      phone: "89939289488",
      pest: "Клопы",
      object: "2-комн. квартира",
      priceFrom: 2400,
      formName: "Форма в баннере",
      priceBasis: "Клопы · 2-комн. квартира — прайс калькулятора",
      docs: ["Договор", "Акт"],
    });
    expect(body.formName).toBe("Форма в баннере");
    expect(body.priceBasis).toContain("прайс калькулятора");
    expect(body.docs).toEqual(["Договор", "Акт"]);
    expect(body).toHaveProperty("referrer");
    expect(body).toHaveProperty("device");
    expect(body).toHaveProperty("utm");
  });
});

describe("collectUtm", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  it("читает метки из URL и сохраняет их на сессию", () => {
    window.history.replaceState({}, "", "/?utm_source=yandex&utm_campaign=klopy&yclid=123");
    expect(collectUtm()).toEqual({ utm_source: "yandex", utm_campaign: "klopy", yclid: "123" });
    window.history.replaceState({}, "", "/contacts");
    expect(collectUtm().utm_source).toBe("yandex");
  });

  it("возвращает пустой объект без меток", () => {
    expect(collectUtm()).toEqual({});
  });
});
