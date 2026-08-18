/**
 * Обход отрендеренных страниц: проверяем, что типографика не ломает meta и JSON-LD.
 * Тест работает по живому dev-серверу; если он не поднят — блок пропускается,
 * чтобы CI без сервера оставался зелёным (локально запускать при `bun run dev`).
 */
import { describe, it, expect, beforeAll } from "vitest";
import { SERVICES } from "@/data/services";
import { POSTS } from "@/data/blog";
import { DOCS } from "@/data/docs";
import { CITIES } from "@/data/cities";
import { DISTRICTS } from "@/data/districts";
import { SITE } from "@/data/site";
import { primaryVideoForService } from "@/data/videos";
import { SERVICES_INDEX } from "@/data/servicesIndex";

const BASE = process.env["HEAD_TEST_BASE"] ?? "http://localhost:8080";
const NBSP_RE = /[\u00A0\u202F]/;

const STATIC_PAGES = [
  "/",
  "/services",
  "/price",
  "/faq",
  "/blog?page=1",
  "/video",
  "/contacts",
  "/o-kompanii",
  "/garantii",
  "/privacy",
  "/terms",
  "/karta-sayta",
  "/kp",
  "/category/dezinfekciya-novosibirsk",
];
const HUBS = [
  "unichtozhenie-vrediteley",
  "sanitarnaya-obrabotka",
  "obrabotka-uchastkov",
  "spec-uslugi",
];

const urls = [
  ...STATIC_PAGES,
  ...HUBS.map((s) => `/uslugi/${s}`),
  ...SERVICES.map((s) => `/services/${s.slug}`),
  ...POSTS.map((p) => `/blog/${p.slug}`),
  ...DOCS.map((d) => `/docs/${d.slug}`),
  ...CITIES.map((c) => `/gorod/${c.slug}`),
  ...DISTRICTS.map((d) => `/raion/${d.slug}`),
];

function decode(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

async function online(): Promise<boolean> {
  try {
    const res = await fetch(BASE + "/", { signal: AbortSignal.timeout(4000) });
    return res.ok;
  } catch {
    return false;
  }
}

let up = false;
beforeAll(async () => {
  up = await online();
});

describe("meta и JSON-LD на отрендеренных страницах", () => {
  it("разметка валидна, без неразрывных пробелов и с абсолютным canonical", async () => {
    if (!up) return; // dev-сервер не запущен — пропускаем
    const problems: string[] = [];

    await Promise.all(
      urls.map(async (u) => {
        let html: string;
        try {
          const res = await fetch(BASE + u, { signal: AbortSignal.timeout(30000) });
          if (!res.ok) {
            problems.push(`${u}: HTTP ${res.status}`);
            return;
          }
          html = await res.text();
        } catch (e) {
          problems.push(`${u}: ${(e as Error).message}`);
          return;
        }

        const title = /<title>(.*?)<\/title>/s.exec(html)?.[1];
        if (!title) problems.push(`${u}: нет <title>`);
        else if (NBSP_RE.test(title) || title.includes("..."))
          problems.push(`${u}: title «${title}»`);

        for (const tag of html.match(/<meta[^>]*>/g) ?? []) {
          const content = /content="([^"]*)"/.exec(tag)?.[1];
          if (!content) continue;
          const isText =
            /name="(description|keywords|twitter:(title|description))"|property="og:(title|description)"/.test(
              tag,
            );
          if (!isText) continue;
          if (NBSP_RE.test(content))
            problems.push(`${u}: неразрывный пробел в ${tag.slice(0, 60)}`);
          if (content.includes("..."))
            problems.push(`${u}: троеточие точками в ${tag.slice(0, 60)}`);
        }

        const canon = [...html.matchAll(/rel="canonical"[^>]*href="([^"]*)"/g)].map((m) => m[1]);
        if (canon.length !== 1) problems.push(`${u}: canonical ×${canon.length}`);
        else if (!canon[0]!.startsWith("http"))
          problems.push(`${u}: относительный canonical ${canon[0]}`);
        else {
          const expected = SITE.domain + u.split("?")[0];
          if (canon[0] !== expected && !u.includes("?"))
            problems.push(`${u}: canonical ведёт на ${canon[0]}, ожидался ${expected}`);
        }

        const ogUrl = /property="og:url"[^>]*content="([^"]*)"/.exec(html)?.[1];
        if (ogUrl && canon[0] && ogUrl !== canon[0] && !u.includes("?"))
          problems.push(`${u}: og:url ${ogUrl} ≠ canonical ${canon[0]}`);

        const blocks = [
          ...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>(.*?)<\/script>/gs),
        ].map((m) => m[1]!);
        if (!blocks.length) problems.push(`${u}: нет JSON-LD`);
        for (const raw of blocks) {
          const json = decode(raw);
          try {
            const parsed = JSON.parse(json) as Record<string, unknown>;
            if (!parsed["@context"]) problems.push(`${u}: JSON-LD без @context`);
          } catch (e) {
            problems.push(`${u}: JSON-LD не парсится (${(e as Error).message})`);
          }
          if (NBSP_RE.test(json)) problems.push(`${u}: неразрывный пробел в JSON-LD`);
        }

        const needsVideo =
          u === "/video" ||
          u.startsWith("/gorod/") ||
          u.startsWith("/raion/") ||
          (u.startsWith("/services/") && !!primaryVideoForService(u.split("/")[2]!));
        if (needsVideo && !html.includes("VideoObject"))
          problems.push(`${u}: нет разметки VideoObject`);

        // BreadcrumbList: обязателен на всех страницах кроме главной.
        if (u !== "/" && !html.includes("BreadcrumbList"))
          problems.push(`${u}: нет разметки BreadcrumbList`);

        // Обязательные поля VideoObject по требованиям Google.
        for (const raw of blocks) {
          let parsed: unknown;
          try {
            parsed = JSON.parse(decode(raw));
          } catch {
            continue;
          }
          const nodes: Record<string, unknown>[] = [];
          const collect = (node: unknown) => {
            if (Array.isArray(node)) return node.forEach(collect);
            if (!node || typeof node !== "object") return;
            const obj = node as Record<string, unknown>;
            if (obj["@graph"]) collect(obj["@graph"]);
            if (obj["@type"] === "VideoObject") nodes.push(obj);
          };
          collect(parsed);
          for (const v of nodes) {
            for (const field of ["name", "description", "thumbnailUrl", "uploadDate", "contentUrl", "duration"]) {
              if (!v[field]) problems.push(`${u}: VideoObject без поля ${field}`);
            }
            const content = v["contentUrl"];
            if (typeof content === "string" && !content.startsWith("http"))
              problems.push(`${u}: VideoObject contentUrl не абсолютный (${content})`);
            const thumbs = v["thumbnailUrl"];
            const firstThumb = Array.isArray(thumbs) ? thumbs[0] : thumbs;
            if (typeof firstThumb === "string" && !firstThumb.startsWith("http"))
              problems.push(`${u}: VideoObject thumbnailUrl не абсолютный (${firstThumb})`);
            const dur = v["duration"];
            if (typeof dur === "string" && !/^PT(\d+H)?(\d+M)?(\d+S)?$/.test(dur))
              problems.push(`${u}: VideoObject duration «${dur}» не в формате ISO 8601`);
          }
        }

        // BreadcrumbList: позиции по порядку, item — абсолютный URL.
        for (const raw of blocks) {
          let parsed: unknown;
          try {
            parsed = JSON.parse(decode(raw));
          } catch {
            continue;
          }
          const lists: Record<string, unknown>[] = [];
          const collect = (node: unknown) => {
            if (Array.isArray(node)) return node.forEach(collect);
            if (!node || typeof node !== "object") return;
            const obj = node as Record<string, unknown>;
            if (obj["@graph"]) collect(obj["@graph"]);
            if (obj["@type"] === "BreadcrumbList") lists.push(obj);
          };
          collect(parsed);
          for (const list of lists) {
            const items = list["itemListElement"];
            if (!Array.isArray(items) || items.length < 2) {
              problems.push(`${u}: BreadcrumbList короче двух уровней`);
              continue;
            }
            items.forEach((it, i) => {
              const el = it as Record<string, unknown>;
              if (el["position"] !== i + 1) problems.push(`${u}: BreadcrumbList position ${String(el["position"])} ≠ ${i + 1}`);
              if (!el["name"]) problems.push(`${u}: BreadcrumbList без name на позиции ${i + 1}`);
              const item = el["item"];
              if (typeof item === "string" && !item.startsWith("http"))
                problems.push(`${u}: BreadcrumbList item не абсолютный (${item})`);
            });
          }
        }

        // Service / Offer: обязателен на страницах услуг, гео-страницах и каталогах.
        const needsService =
          u.startsWith("/services/") ||
          u.startsWith("/uslugi/") ||
          u.startsWith("/gorod/") ||
          u.startsWith("/raion/") ||
          u === "/services" ||
          u === "/category/dezinfekciya-novosibirsk";
        const services: Record<string, unknown>[] = [];
        for (const raw of blocks) {
          let parsed: unknown;
          try {
            parsed = JSON.parse(decode(raw));
          } catch {
            continue;
          }
          // @id дублируется только внутри одного блока: расширение узла
          // из другого блока (например LocalBusiness + отзывы) — валидно.
          const seenIds = new Set<string>();
          const collect = (node: unknown) => {
            if (Array.isArray(node)) return node.forEach(collect);
            if (!node || typeof node !== "object") return;
            const obj = node as Record<string, unknown>;
            if (obj["@graph"]) collect(obj["@graph"]);
            if (obj["itemListElement"]) collect(obj["itemListElement"]);
            if (obj["item"]) collect(obj["item"]);
            if (obj["@type"] === "Service") services.push(obj);
            const id = obj["@id"];
            if (typeof id === "string" && obj["@type"]) {
              if (seenIds.has(id)) problems.push(`${u}: дубль @id ${id}`);
              seenIds.add(id);
            }
          };
          collect(parsed);
        }
        if (needsService && !services.length) problems.push(`${u}: нет разметки Service`);

        const byTitle = new Map(SERVICES_INDEX.map((s) => [s.title, s.priceFrom]));
        for (const svc of services) {
          for (const field of ["name", "provider", "areaServed"]) {
            if (!svc[field]) problems.push(`${u}: Service «${String(svc["name"])}» без ${field}`);
          }
          const svcUrl = svc["url"];
          if (typeof svcUrl === "string" && !svcUrl.startsWith("http"))
            problems.push(`${u}: Service url не абсолютный (${svcUrl})`);
          const offers = svc["offers"] as Record<string, unknown> | undefined;
          const catalog = svc["hasOfferCatalog"] as Record<string, unknown> | undefined;
          if (!offers && !catalog) {
            problems.push(`${u}: Service «${String(svc["name"])}» без Offer`);
            continue;
          }
          if (offers) {
            const spec = offers["priceSpecification"] as Record<string, unknown> | undefined;
            if (!spec) problems.push(`${u}: Offer без priceSpecification`);
            else {
              if (spec["priceCurrency"] !== "RUB")
                problems.push(`${u}: Offer валюта ${String(spec["priceCurrency"])} ≠ RUB`);
              const price = spec["minPrice"] ?? spec["price"];
              if (typeof price !== "number" || !(price > 0))
                problems.push(`${u}: Offer цена не число (${String(price)})`);
              // цена в разметке должна совпадать с прайсом сайта
              const expected = byTitle.get(String(svc["serviceType"]));
              if (expected !== undefined && price !== expected)
                problems.push(
                  `${u}: цена «${String(svc["serviceType"])}» ${String(price)} ≠ прайс ${expected}`,
                );
            }
            if (!offers["availability"]) problems.push(`${u}: Offer без availability`);
          }
        }

        // LocalBusiness: NAP + график. Обязателен на гео-страницах и в общем графе.
        const lbs: Record<string, unknown>[] = [];
        const faqs: Record<string, unknown>[] = [];
        const catalogs: Record<string, unknown>[] = [];
        for (const raw of blocks) {
          let parsed: unknown;
          try {
            parsed = JSON.parse(decode(raw));
          } catch {
            continue;
          }
          const collect = (node: unknown) => {
            if (Array.isArray(node)) return node.forEach(collect);
            if (!node || typeof node !== "object") return;
            const obj = node as Record<string, unknown>;
            if (obj["@graph"]) collect(obj["@graph"]);
            if (obj["@type"] === "LocalBusiness") lbs.push(obj);
            if (obj["@type"] === "FAQPage") faqs.push(obj);
            if (obj["@type"] === "OfferCatalog") catalogs.push(obj);
          };
          collect(parsed);
        }

        const needsLocalBusiness = u.startsWith("/gorod/") || u.startsWith("/raion/");
        if (needsLocalBusiness && !lbs.length) problems.push(`${u}: нет разметки LocalBusiness`);
        for (const lb of lbs) {
          for (const field of ["name", "telephone", "address", "areaServed", "openingHoursSpecification"]) {
            if (!lb[field]) problems.push(`${u}: LocalBusiness без ${field}`);
          }
          if (lb["telephone"] !== SITE.phone)
            problems.push(`${u}: LocalBusiness телефон ${String(lb["telephone"])} ≠ ${SITE.phone}`);
        }

        // FAQPage: вопросы должны присутствовать в видимом тексте страницы.
        const needsFaq =
          u.startsWith("/gorod/") ||
          u.startsWith("/raion/") ||
          u.startsWith("/uslugi/") ||
          u === "/category/dezinfekciya-novosibirsk";
        if (needsFaq && !faqs.length) problems.push(`${u}: нет разметки FAQPage`);
        const text = decode(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ");
        for (const faq of faqs) {
          const entities = faq["mainEntity"];
          if (!Array.isArray(entities) || entities.length < 3) {
            problems.push(`${u}: FAQPage содержит меньше трёх вопросов`);
            continue;
          }
          for (const q of entities) {
            const obj = q as Record<string, unknown>;
            const name = obj["name"];
            const answer = (obj["acceptedAnswer"] as Record<string, unknown> | undefined)?.["text"];
            if (typeof name !== "string" || !name) {
              problems.push(`${u}: Question без name`);
              continue;
            }
            if (typeof answer !== "string" || !answer) problems.push(`${u}: «${name}» без ответа`);
            if (!text.includes(name.replace(/\s+/g, " ")))
              problems.push(`${u}: вопрос «${name}» отсутствует в видимом тексте`);
          }
        }

        // OfferCatalog: у каталогов должны быть позиции.
        const needsCatalog =
          u === "/price" ||
          u === "/category/dezinfekciya-novosibirsk" ||
          u.startsWith("/uslugi/") ||
          u.startsWith("/gorod/") ||
          u.startsWith("/raion/");
        if (needsCatalog && !catalogs.length) problems.push(`${u}: нет разметки OfferCatalog`);
        for (const cat of catalogs) {
          const items = cat["itemListElement"];
          if (!Array.isArray(items) || items.length === 0)
            problems.push(`${u}: OfferCatalog «${String(cat["name"])}» без позиций`);
        }
      }),
    );

    expect(problems, problems.slice(0, 20).join("\n")).toEqual([]);
  }, 120000);
});
