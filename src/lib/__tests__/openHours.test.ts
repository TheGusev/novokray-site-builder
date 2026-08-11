import { describe, it, expect } from "vitest";
import { isOpenNow, novosibirskHour, openStatusLabel } from "../openHours";

// Новосибирск = UTC+7 круглый год.
const utc = (h: number) => new Date(Date.UTC(2026, 7, 11, h, 30, 0));

describe("openHours", () => {
  it("переводит время в часовой пояс Новосибирска", () => {
    expect(novosibirskHour(utc(0))).toBe(7);
    expect(novosibirskHour(utc(20))).toBe(3);
  });

  it("открыто с 07:00 до 23:00", () => {
    expect(isOpenNow(utc(0))).toBe(true); // 07:30 НСК
    expect(isOpenNow(utc(15))).toBe(true); // 22:30 НСК
  });

  it("закрыто ночью", () => {
    expect(isOpenNow(utc(16))).toBe(false); // 23:30 НСК
    expect(isOpenNow(utc(22))).toBe(false); // 05:30 НСК
  });

  it("подпись зависит от времени", () => {
    expect(openStatusLabel(utc(5))).toBe("Сейчас принимаем звонки");
    expect(openStatusLabel(utc(22))).toBe("Перезвоним с 07:00");
  });
});