import { describe, it, expect } from "vitest";
import { normalizePhone, buildLeadBody } from "../leadSender";

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
});
