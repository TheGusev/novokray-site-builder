import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

const src = readFileSync("src/components/site/Header.tsx", "utf8");
const nav = src.slice(src.indexOf("const NAV = ["), src.indexOf("] as const;"));

describe("шапка", () => {
  it("в десктоп-меню нет пункта «Контакты»", () => {
    expect(nav).not.toContain("/contacts");
    expect(nav).toContain("/video");
  });

  it("высота шапки фиксированная (без скачков при скролле)", () => {
    expect(src).toContain("flex h-16 items-center");
    expect(src).not.toContain('scrolled ? "h-14"');
  });
});
