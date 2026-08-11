import { describe, it, expect } from "vitest";
import { typo, typoPlain, NBSP } from "../typography";
import { POSTS } from "@/data/blog";
import { SERVICES_INDEX } from "@/data/servicesIndex";
import { SERVICES } from "@/data/services";
import { DOCS } from "@/data/docs";
import { CITIES } from "@/data/cities";
import { DISTRICTS } from "@/data/districts";
import { WORK_VIDEOS } from "@/data/videos";

describe("типографика", () => {
  it("прямые кавычки становятся ёлочками", () => {
    expect(typo('Услуга "Клопы" в работе')).toContain("«Клопы»");
    expect(typoPlain('он сказал "да"')).toBe("он сказал «да»");
  });

  it("вложенные кавычки — лапки", () => {
    expect(typoPlain('ООО "Компания "Дез" и Ко"')).toBe("ООО «Компания „Дез“ и Ко»");
  });

  it("дефис между словами превращается в длинное тире", () => {
    expect(typoPlain("Клопы - это проблема")).toBe("Клопы — это проблема");
    expect(typoPlain("Выезд – за час")).toBe("Выезд — за час");
  });

  it("дефис внутри слова не трогаем", () => {
    expect(typoPlain("по-русски из-за чего-то")).toBe("по-русски из-за чего-то");
    expect(typoPlain("СанПиН 2.4.3648-20")).toBe("СанПиН 2.4.3648-20");
    expect(typoPlain("тел. 3472-17")).toBe("тел. 3472-17");
  });

  it("числовой диапазон с пробелами сжимается в короткое тире", () => {
    expect(typoPlain("2 - 3 часа")).toBe("2\u20133 часа");
  });

  it("многоточие и знак умножения", () => {
    expect(typoPlain("Ждём... 2 x 3")).toBe("Ждём… 2\u00D73");
  });

  it("неразрывные пробелы в ценах, единицах и предлогах", () => {
    const t = typo("от 1 500 ₽ за 60 мин в квартире");
    expect(t).toContain(`1${NBSP}500${NBSP}₽`);
    expect(t).toContain(`60${NBSP}мин`);
    expect(t).toContain(`в${NBSP}квартире`);
  });

  it("№ и сокращения не отрываются", () => {
    expect(typo("Лицензия № 54.НС.01")).toContain(`№${NBSP}54.НС.01`);
    expect(typo("г. Новосибирск")).toContain(`г.${NBSP}Новосибирск`);
  });

  it("plain-режим не добавляет неразрывных пробелов", () => {
    expect(typoPlain("от 1 500 ₽ в квартире")).not.toContain(NBSP);
  });

  it("двойные пробелы и пробел перед знаками убираются", () => {
    expect(typoPlain("Текст  ещё , и вот !")).toBe("Текст ещё, и вот!");
  });

  it("функция идемпотентна", () => {
    const samples = [
      'Услуга "Клопы" - от 1 500 ₽ за 2 - 3 часа в квартире...',
      "Лицензия № 54.НС.01.003 от 2026 года — работаем по СанПиН 2.4.3648-20",
      "по-русски: 10–15 мин, 25%, 60 м²",
    ];
    for (const s of samples) {
      const once = typo(s);
      expect(typo(once)).toBe(once);
      const oncePlain = typoPlain(s);
      expect(typoPlain(oncePlain)).toBe(oncePlain);
    }
  });

  it("контент сайта проходит plain-нормализацию без изменений", () => {
    const problems: string[] = [];
    for (const p of POSTS) {
      for (const [field, text] of [["title", p.title], ["excerpt", p.excerpt]] as const) {
        if (typoPlain(text) !== text) problems.push(`${p.slug}:${field}`);
      }
      (p.faq ?? []).forEach((f, i) => {
        if (typoPlain(f.q) !== f.q) problems.push(`${p.slug}:faq[${i}].q`);
        if (typoPlain(f.a) !== f.a) problems.push(`${p.slug}:faq[${i}].a`);
      });
    }
    for (const s of SERVICES_INDEX) {
      if (typoPlain(s.h1) !== s.h1) problems.push(`svc:${s.slug}:h1`);
      if (typoPlain(s.metaDescription) !== s.metaDescription) problems.push(`svc:${s.slug}:meta`);
    }
    expect(problems, problems.slice(0, 15).join("; ")).toEqual([]);
  });

  // Всё, что уходит в <title>, meta и JSON-LD, должно быть типографски чистым
  // ещё в исходных данных: typo() к head не применяется намеренно.
  it("строки для meta и JSON-LD чисты и без неразрывных пробелов", () => {
    const problems: string[] = [];
    const check = (id: string, text?: string) => {
      if (!text) return;
      if (/[\u00A0\u202F]/.test(text)) problems.push(`${id}: неразрывный пробел`);
      if (typoPlain(text) !== text) problems.push(`${id}: типографика`);
    };

    for (const s of SERVICES) {
      check(`svc:${s.slug}:metaTitle`, s.metaTitle);
      check(`svc:${s.slug}:title`, s.title);
      check(`svc:${s.slug}:h1`, s.h1);
      check(`svc:${s.slug}:metaDescription`, s.metaDescription);
      s.keywords.forEach((k, i) => check(`svc:${s.slug}:kw[${i}]`, k));
      s.steps.forEach((st, i) => {
        check(`svc:${s.slug}:step[${i}].title`, st.title);
        check(`svc:${s.slug}:step[${i}].text`, st.text);
      });
      (s.faq ?? []).forEach((f, i) => {
        check(`svc:${s.slug}:faq[${i}].q`, f.q);
        check(`svc:${s.slug}:faq[${i}].a`, f.a);
      });
    }

    for (const p of POSTS) {
      check(`post:${p.slug}:title`, p.title);
      check(`post:${p.slug}:excerpt`, p.excerpt);
      p.tags.forEach((t, i) => check(`post:${p.slug}:tag[${i}]`, t));
      if (p.howto) {
        check(`post:${p.slug}:howto.name`, p.howto.name);
        p.howto.steps.forEach((st, i) => {
          check(`post:${p.slug}:howto[${i}].name`, st.name);
          check(`post:${p.slug}:howto[${i}].text`, st.text);
        });
      }
    }

    for (const d of DOCS) {
      check(`doc:${d.slug}:title`, d.title);
      check(`doc:${d.slug}:description`, d.description);
      check(`doc:${d.slug}:note`, d.note);
    }
    for (const c of CITIES) check(`city:${c.slug}`, c.description);
    for (const d of DISTRICTS) {
      check(`district:${d.slug}:full`, d.full);
      check(`district:${d.slug}:description`, d.description);
    }
    for (const v of WORK_VIDEOS) {
      check(`video:${v.slug}:title`, v.title);
      check(`video:${v.slug}:description`, v.description);
    }

    expect(problems, problems.slice(0, 15).join("; ")).toEqual([]);
  });
});
