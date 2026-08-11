import { describe, it, expect } from "vitest";
import { buildMessage, hasContext } from "../leadMessage";

const now = new Date("2026-08-11T13:00:00Z");

describe("buildMessage", () => {
  const full = {
    type: "Заявка на обработку",
    name: "Иван",
    pest: "Клопы",
    object: "2-комн. квартира",
    priceFrom: 3500,
    priceBasis: "Клопы · 2-комн. квартира — прайс калькулятора",
    formName: "Форма в баннере",
    page: "https://dez-federation.ru/uslugi/klopy",
    utm: { utm_source: "yandex", utm_campaign: "klopy_nsk" },
    device: "мобильный",
  };

  it("содержит все данные заявки", () => {
    const msg = buildMessage(full, "+79069989888", now);
    for (const part of [
      "Заявка на обработку", "Имя: Иван", "Услуга: Клопы",
      "Объект: 2-комн. квартира", "Расчёт: от", "₽", "Форма: Форма в баннере",
      "uslugi/klopy", "utm_source=yandex", "Устройство: мобильный",
    ]) expect(msg).toContain(part);
    expect(msg).not.toContain("⚠️");
  });

  it("подставляет «не указано» вместо пропусков", () => {
    const msg = buildMessage({ type: "Заявка", formName: "Форма" }, "+79069989888", now);
    expect(msg).toContain("Имя: не указано");
    expect(msg).toContain("Услуга: не указано");
    expect(msg).toContain("Объект: не указано");
  });

  it("помечает заявку без контекста", () => {
    const msg = buildMessage({}, "+79069989888", now);
    expect(msg).toContain("⚠️ Заявка без контекста");
  });

  it("не помечает автотест деплоя", () => {
    const msg = buildMessage({ formName: "deploy-check" }, "+70000000000", now);
    expect(msg).toContain("Проверка канала");
    expect(msg).not.toContain("⚠️");
  });

  it("экранирует HTML в пользовательских полях", () => {
    const msg = buildMessage({ name: "<b>x</b>" }, "+79069989888", now);
    expect(msg).toContain("&lt;b&gt;x&lt;/b&gt;");
  });

  it("показывает запрошенные документы", () => {
    const msg = buildMessage({ type: "Запрос документов", org: "ООО Ромашка", inn: "5410169338", docs: ["Договор", "Акт"] }, "+79069989888", now);
    expect(msg).toContain("Организация: ООО Ромашка");
    expect(msg).toContain("Документы: Договор, Акт");
  });

  it("hasContext различает пустую и наполненную заявку", () => {
    expect(hasContext({})).toBe(false);
    expect(hasContext({ pest: "Клопы" })).toBe(true);
  });
});