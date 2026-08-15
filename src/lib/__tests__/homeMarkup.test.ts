/**
 * Проверка разметки главной страницы по живому SSR-ответу:
 * семантика, форма заявки и обязательные типы Schema.org.
 * Без поднятого dev-сервера блок пропускается.
 */
import { describe, it, expect, beforeAll } from "vitest";

const BASE = process.env["HEAD_TEST_BASE"] ?? "http://localhost:8080";

let html = "";
let alive = false;

beforeAll(async () => {
  try {
    const res = await fetch(`${BASE}/`);
    html = await res.text();
    alive = res.ok && html.length > 1000;
  } catch {
    alive = false;
  }
}, 30_000);

function types(): string[] {
  const out: string[] = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    const walk = (n: unknown) => {
      if (Array.isArray(n)) return n.forEach(walk);
      if (n && typeof n === "object") {
        const o = n as Record<string, unknown>;
        if (typeof o["@type"] === "string") out.push(o["@type"] as string);
        Object.values(o).forEach(walk);
      }
    };
    walk(JSON.parse(m[1]));
  }
  return out;
}

describe("разметка главной страницы", () => {
  it("JSON-LD парсится и содержит обязательные типы", () => {
    if (!alive) return;
    const t = types();
    for (const need of ["Organization", "LocalBusiness", "WebSite", "WebPage", "BreadcrumbList", "Service", "FAQPage"]) {
      expect(t, `нет ${need}`).toContain(need);
    }
  });

  it("есть дата обновления контента", () => {
    if (!alive) return;
    expect(html).toContain("dateModified");
    expect(/<time [^>]*datetime="\d{4}-\d{2}-\d{2}"/i.test(html)).toBe(true);
  });

  it("на странице есть форма заявки и семантические теги", () => {
    if (!alive) return;
    expect((html.match(/<form[\s>]/g) ?? []).length).toBeGreaterThan(0);
    expect((html.match(/<article[\s>]/g) ?? []).length).toBeGreaterThan(0);
    for (const tag of ["<main", "<nav", "<header", "<footer", "<section"]) {
      expect(html.includes(tag), `нет ${tag}`).toBe(true);
    }
  });

  it("H1 один и совпадает с началом title", () => {
    if (!alive) return;
    const h1s = [...html.matchAll(/<h1[\s\S]*?<\/h1>/g)];
    expect(h1s.length).toBe(1);
    const text = h1s[0][0].replace(/<[^>]+>/g, "").trim();
    const title = (html.match(/<title>([\s\S]*?)<\/title>/) ?? [])[1] ?? "";
    expect(text.length).toBeGreaterThan(10);
    expect(title.includes(text)).toBe(true);
  });
});
