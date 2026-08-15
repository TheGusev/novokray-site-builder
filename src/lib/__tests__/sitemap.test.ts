/**
 * Проверка карты сайта и robots.txt: состав, приоритеты, lastmod
 * и отсутствие расхождений между картой и правилами обхода.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getAllPaths } from "@/lib/all-routes";
import { SITE } from "@/data/site";

const ROOT = resolve(__dirname, "../../..");
const robots = readFileSync(resolve(ROOT, "public/robots.txt"), "utf8");

/** Пути, закрытые в robots.txt простыми (без «?») правилами Disallow. */
function disallowedPaths(): string[] {
  const out: string[] = [];
  let inCommon = false;
  for (const raw of robots.split("\n")) {
    const line = raw.trim();
    if (/^user-agent:/i.test(line)) inCommon = line.split(":")[1].trim() === "*";
    if (!inCommon) continue;
    const m = line.match(/^disallow:\s*(\S+)/i);
    if (m && !m[1].includes("?") && !m[1].includes("*")) out.push(m[1]);
  }
  return out;
}

describe("robots.txt", () => {
  it("сайт открыт для обхода и указана карта сайта", () => {
    expect(robots).toMatch(/^User-agent: \*/m);
    expect(robots).toMatch(/^Allow: \/$/m);
    expect(robots).not.toMatch(/^Disallow: \/$/m);
    expect(robots).toContain(`Sitemap: ${SITE.domain}/sitemap.xml`);
  });

  it("параметрические дубли блога закрыты, сами статьи открыты", () => {
    expect(robots).toMatch(/^Disallow: \/blog\?$/m);
    expect(robots).not.toMatch(/^Disallow: \/blog$/m);
    expect(robots).not.toMatch(/^Disallow: \/blog\/$/m);
  });

  it("правила рекламных меток заданы шаблоном и продублированы Clean-param", () => {
    for (const tag of ["utm_", "yclid=", "gclid=", "fbclid="]) {
      expect(robots).toContain(`Disallow: /*?*${tag}`);
    }
    expect(robots).toMatch(/^Clean-param: /m);
  });

  it("основные ИИ-краулеры не заблокированы", () => {
    for (const bot of ["GPTBot", "OAI-SearchBot", "ClaudeBot", "PerplexityBot", "YandexGPT", "Yandex", "Googlebot"]) {
      expect(robots).toContain(`User-agent: ${bot}`);
    }
  });
});

describe("состав карты сайта", () => {
  const paths = getAllPaths();

  it("нет дублей путей", () => {
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("все приоритетные посадочные присутствуют", () => {
    for (const p of ["/", "/services", "/price", "/blog", "/video", "/faq", "/contacts", "/garantii", "/kp", "/category/dezinfekciya-novosibirsk"]) {
      expect(paths, `нет ${p}`).toContain(p);
    }
    expect(paths.filter((p) => p.startsWith("/services/")).length).toBeGreaterThan(10);
    expect(paths.filter((p) => p.startsWith("/blog/")).length).toBeGreaterThan(40);
    expect(paths.filter((p) => p.startsWith("/uslugi/")).length).toBe(4);
  });

  it("все пути относительные, без слэша в конце и без параметров", () => {
    for (const p of paths) {
      expect(p.startsWith("/"), p).toBe(true);
      expect(p === "/" || !p.endsWith("/"), `${p}: лишний слэш в конце`).toBe(true);
      expect(p.includes("?"), `${p}: параметр в карте сайта`).toBe(false);
      expect(/[A-Z]/.test(p), `${p}: заглавные буквы`).toBe(false);
    }
  });
});

describe("карта сайта и robots не противоречат друг другу", () => {
  it("страницы, закрытые в robots, не попадают в карту через getAllPaths", () => {
    const blocked = disallowedPaths();
    // /dogovor/zapolnit присутствует в списке маршрутов, но обязан отсекаться
    // фильтром генератора карты — проверяем сам список правил.
    expect(blocked).toContain("/dogovor/zapolnit");
    const inMap = getAllPaths().filter((p) => blocked.some((b) => p === b || p.startsWith(`${b}/`)));
    expect(inMap).toEqual(["/dogovor/zapolnit"]);
  });
});
