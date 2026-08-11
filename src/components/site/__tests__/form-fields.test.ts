import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

/** Поля ввода должны задавать цвет текста явно: иначе внутри секций с белым
 *  текстом (герой, тёмные блоки) введённое имя и телефон становятся невидимыми. */
describe("видимость текста в полях форм", () => {
  const files = [
    "src/components/ui/input.tsx",
    "src/components/ui/textarea.tsx",
    "src/components/ui/select.tsx",
    "src/components/site/LeadForm.tsx",
    "src/components/site/DocsRequest.tsx",
    "src/routes/dogovor.zapolnit.tsx",
    "src/routes/kp.tsx",
  ];

  for (const f of files) {
    it(`${f}: у полей задан text-foreground`, () => {
      expect(read(f)).toContain("text-foreground");
    });
  }

  it("LeadForm использует единые классы полей", () => {
    const src = read("src/components/site/LeadForm.tsx");
    expect(src).toContain("FIELD_TEXT");
    expect(src).toContain("FIELD_PHONE");
    // ни одно поле формы не должно объявлять свои классы без цвета текста
    const raw = src.match(/className="[^"]*border-input[^"]*"/g) ?? [];
    for (const cls of raw) {
      if (cls.includes("h-4 w-4")) continue; // чекбокс
      expect(cls).toContain("text-foreground");
    }
  });

  it("глобальные стили фиксируют цвет при автозаполнении", () => {
    expect(read("src/styles.css")).toContain("-webkit-autofill");
  });
});
