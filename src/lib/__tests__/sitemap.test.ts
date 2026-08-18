/**
 * Sitemap: полнота, отсутствие конфликта с robots.txt и корректность видео-карты.
 * Источник правды — scripts/generate-static.mjs (список путей) и данные проекта.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { STATIC_PATHS, HUB_SLUGS } from "@/lib/all-routes";
import { WORK_VIDEOS } from "@/data/videos";

const ROOT = resolve(import.meta.dirname, "../../..");
const generator = readFileSync(resolve(ROOT, "scripts/generate-static.mjs"), "utf8");
const robots = readFileSync(resolve(ROOT, "public/robots.txt"), "utf8");

const pageBlock = generator.slice(
  generator.indexOf("const pageEntries"),
  generator.indexOf("const blogEntries"),
);
const literalPaths = [...pageBlock.matchAll(/path:\s*"([^"]+)"/g)].map((m) => m[1]!);
const templatePaths = [...pageBlock.matchAll(/path:\s*`([^`]+)`/g)].map((m) => m[1]!);

const disallowed = robots
  .split("\n")
  .filter((l) => l.trim().startsWith("Disallow:"))
  .map((l) => l.split(":")[1]!.trim())
  .filter(Boolean);

describe("sitemap", () => {
  it("включает все ключевые статические маршруты (кроме закрытых в robots)", () => {
    const blocked = (p: string) =>
      disallowed.some((d) => {
        const clean = d.replace(/\*/g, "");
        return clean !== "/" && p.startsWith(clean);
      });
    const missing = STATIC_PATHS.filter((p: string) => !blocked(p) && !literalPaths.includes(p));
    expect(missing, `нет в sitemap: ${missing.join(", ")}`).toEqual([]);
  });

  it("включает хабы, города, районы, услуги, документы и блог", () => {
    for (const t of ["/uslugi/${slug}", "/gorod/${c.slug}", "/raion/${d.slug}", "/services/${s.slug}", "/docs/${d.slug}"]) {
      expect(templatePaths, `нет шаблона ${t}`).toContain(t);
    }
    expect(generator).toContain("/blog/${p.slug}");
    expect(HUB_SLUGS.length).toBeGreaterThan(0);
  });

  it("не содержит URL, закрытых в robots.txt", () => {
    const conflicts = literalPaths.filter((p) =>
      disallowed.some((d) => {
        const clean = d.replace(/\*/g, "");
        return clean !== "/" && p.startsWith(clean);
      }),
    );
    expect(conflicts, `конфликт с robots: ${conflicts.join(", ")}`).toEqual([]);
  });

  it("страницы пагинации блога не попадают в sitemap (они закрыты в robots)", () => {
    expect(robots).toContain("Disallow: /blog?page=");
    expect(literalPaths.some((p) => p.includes("page="))).toBe(false);
  });

  it("генерирует индекс и три карты, включая видео", () => {
    for (const f of ["sitemap-pages.xml", "sitemap-blog.xml", "sitemap-video.xml", "sitemapindex"]) {
      expect(generator).toContain(f);
    }
    expect(generator).toContain("sitemap-video/1.1");
  });

  it("у каждого ролика есть данные для видео-карты", () => {
    for (const v of WORK_VIDEOS) {
      expect(v.title.length, v.slug).toBeGreaterThan(5);
      expect(v.description.length, v.slug).toBeGreaterThan(20);
      expect(v.poster.startsWith("/media/"), v.slug).toBe(true);
      expect(v.src.startsWith("/media/"), v.slug).toBe(true);
      expect(v.durationSec, v.slug).toBeGreaterThan(0);
    }
  });

  it("lastmod не подставляется датой сборки для обычных страниц", () => {
    expect(pageBlock.includes("lastmod: today")).toBe(false);
  });
});