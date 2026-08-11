import { describe, expect, it } from "vitest";
import { isActiveParty, isValidInn, pickParty } from "../dadata.parse";

const suggestion = (data: Record<string, unknown>, value = "ООО РОМАШКА") => ({
  suggestions: [{ value, data }],
});

describe("isValidInn", () => {
  it("принимает 10 и 12 цифр", () => {
    expect(isValidInn("5410169338")).toBe(true);
    expect(isValidInn("540123456789")).toBe(true);
  });
  it("отклоняет мусор и неверную длину", () => {
    for (const bad of ["", "123", "54101693381", "54101693ab", " 5410169338"]) {
      expect(isValidInn(bad)).toBe(false);
    }
  });
});

describe("pickParty", () => {
  it("берёт короткое название с ОПФ и реквизиты", () => {
    const p = pickParty(
      suggestion({
        name: { short_with_opf: 'ООО "Ромашка"', full_with_opf: 'Общество с ограниченной ответственностью "Ромашка"' },
        inn: "5410169338",
        kpp: "541001001",
        ogrn: "1145476000000",
        address: { value: "г Новосибирск, ул Ленина, д 1" },
        management: { name: "Иванов Иван Иванович", post: "Директор" },
        state: { status: "ACTIVE" },
      }),
    );
    expect(p).toMatchObject({
      name: 'ООО "Ромашка"',
      inn: "5410169338",
      kpp: "541001001",
      managementPost: "Директор",
      status: "ACTIVE",
    });
    expect(isActiveParty(p!)).toBe(true);
  });

  it("ИП: нет КПП и руководителя, название берётся из value", () => {
    const p = pickParty(
      suggestion({ inn: "540123456789", ogrn: "314547600000000", state: { status: "ACTIVE" } }, "ИП Петров Пётр"),
    );
    expect(p?.name).toBe("ИП Петров Пётр");
    expect(p?.kpp).toBeUndefined();
    expect(p?.managementName).toBeUndefined();
  });

  it("ликвидированная организация помечается неактивной", () => {
    const p = pickParty(
      suggestion({ name: { short_with_opf: 'ООО "Старт"' }, inn: "5401000000", state: { status: "LIQUIDATED" } }),
    );
    expect(isActiveParty(p!)).toBe(false);
  });

  it("пустой ответ и мусор дают null", () => {
    expect(pickParty({ suggestions: [] })).toBeNull();
    expect(pickParty(null)).toBeNull();
    expect(pickParty({ suggestions: [{ data: {} }] })).toBeNull();
  });
});
