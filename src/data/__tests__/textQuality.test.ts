import { describe, it, expect } from "vitest";
import { POSTS, BLOG_CATEGORIES } from "../blog";
import { SERVICES_INDEX } from "../servicesIndex";
import { WORK_VIDEOS } from "../videos";

/** Собираем все пользовательские строки сайта, которые ведём вручную. */
function collectTexts(): { where: string; text: string }[] {
  const out: { where: string; text: string }[] = [];
  for (const p of POSTS) {
    out.push({ where: `${p.slug}:title`, text: p.title });
    out.push({ where: `${p.slug}:excerpt`, text: p.excerpt });
    out.push({ where: `${p.slug}:body`, text: p.body });
    (p.faq ?? []).forEach((f, i) => {
      out.push({ where: `${p.slug}:faq[${i}].q`, text: f.q });
      out.push({ where: `${p.slug}:faq[${i}].a`, text: f.a });
    });
  }
  for (const c of BLOG_CATEGORIES) {
    out.push({ where: `cat:${c.slug}`, text: `${c.title}. ${c.description}` });
  }
  for (const s of SERVICES_INDEX) {
    out.push({ where: `svc:${s.slug}:h1`, text: s.h1 });
    out.push({ where: `svc:${s.slug}:meta`, text: s.metaDescription });
  }
  for (const v of WORK_VIDEOS) {
    out.push({ where: `video:${v.slug}`, text: `${v.title}. ${v.description ?? ""}` });
  }
  return out;
}

const TEXTS = collectTexts();

describe("качество текстов", () => {
  it("нет двойных пробелов и пробелов перед знаками препинания", () => {
    for (const { where, text } of TEXTS) {
      expect(/\S {2,}\S/.test(text), `${where}: двойной пробел`).toBe(false);
      expect(/\s[,;:!?](?=\s|$)/.test(text), `${where}: пробел перед знаком`).toBe(false);
    }
  });

  it("нет типовых орфографических ошибок", () => {
    const bad: [RegExp, string][] = [
      [/\bв течении\b/i, "в течении → в течение"],
      [/\bтоже время\b/i, "тоже время → то же время"],
      [/\bне\s+обходимо\b/i, "необходимо"],
      [/\bнужна\s+(уничтожение|озонирование|удаление)/i, "род: нужно"],
      [/\bнужен\s+(обработка|дезинфекция|сушка)/i, "род: нужна"],
      [/\s--\s/, "двойной дефис вместо тире"],
    ];
    for (const { where, text } of TEXTS) {
      for (const [re, msg] of bad) {
        expect(re.test(text), `${where}: ${msg}`).toBe(false);
      }
    }
  });

  it("заголовки статей и услуг без хвостовых точек и пробелов", () => {
    for (const p of POSTS) {
      expect(p.title).toBe(p.title.trim());
      expect(p.title.endsWith(".")).toBe(false);
      expect(p.excerpt.trim().length).toBeGreaterThan(40);
    }
    for (const s of SERVICES_INDEX) {
      expect(s.h1).toBe(s.h1.trim());
      expect(s.h1.endsWith(".")).toBe(false);
    }
  });

  it("цены и телефон в едином формате", () => {
    for (const { where, text } of TEXTS) {
      // цена «от 1900 ₽» должна писаться с неразрывной группировкой «1 900 ₽»
      expect(/\bот \d{4,}\s?₽/.test(text), `${where}: цена без пробела в разряде`).toBe(false);
      expect(/\+7\s?\(?9\d{2}\)?[\s-]?\d{3}/.test(text) === false || text.includes("906"), `${where}: устаревший телефон`).toBe(true);
    }
  });
});
