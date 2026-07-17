import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { SITE } from "@/data/site";
import { SERVICES } from "@/data/services";
import { POSTS } from "@/data/blog";
import { CITIES } from "@/data/cities";
import { DISTRICTS } from "@/data/districts";
import { DOCS } from "@/data/docs";

const HUB_SLUGS = ["unichtozhenie-vrediteley", "sanitarnaya-obrabotka", "obrabotka-uchastkov", "spec-uslugi"];
const BASE = SITE.domain;

export const Route = createFileRoute("/yandex-recrawl.txt")({
  server: {
    handlers: {
      GET: async () => {
        const section = (title: string, paths: string[]) =>
          [`# ${title} (${paths.length})`, ...paths.map((p) => `${BASE}${p}`), ""].join("\n");

        const priority1 = [
          "/",
          "/services",
          "/category/dezinfekciya-novosibirsk",
          "/price",
          "/garantii",
          "/kp",
          "/contacts",
          "/faq",
          "/o-kompanii",
          "/blog",
          "/karta-sayta",
          "/privacy",
          "/terms",
        ];
        const hubs = HUB_SLUGS.map((s) => `/uslugi/${s}`);
        const services = SERVICES.map((s) => `/services/${s.slug}`);
        const cities = CITIES.map((c) => `/gorod/${c.slug}`);
        const districts = DISTRICTS.map((d) => `/raion/${d.slug}`);
        const blog = POSTS.map((p) => `/blog/${p.slug}`);
        const docs = DOCS.map((d) => `/docs/${d.slug}`);

        const total =
          priority1.length + hubs.length + services.length + cities.length + districts.length + blog.length + docs.length;

        const body = [
          `# Список URL для переобхода в Яндекс.Вебмастере`,
          `# Домен: ${BASE}`,
          `# Всего: ${total} URL`,
          `# Сгенерировано: ${new Date().toISOString().slice(0, 10)}`,
          `# Использование: Яндекс.Вебмастер → Индексирование → Переобход страниц`,
          ``,
          section("Приоритет 1 · ключевые посадочные", priority1),
          section("Приоритет 2 · хабы услуг", hubs),
          section("Приоритет 3 · услуги", services),
          section("Приоритет 4 · города", cities),
          section("Приоритет 4 · районы", districts),
          section("Приоритет 5 · блог", blog),
          section("Приоритет 6 · документы", docs),
        ].join("\n");

        return new Response(body, {
          headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});