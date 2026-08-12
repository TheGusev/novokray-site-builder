import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import routesJson from "./src/generated/routes.json" with { type: "json" };

// Все маршруты для prerender в статический HTML (для shared hosting без Node.js).
// Файл src/generated/routes.json обновляется скриптом scripts/build-routes-json.ts (prebuild).
const pages = (routesJson.paths as string[]).map((path) => ({ path }));

// STATIC_EXPORT=1 — сборка для нашего сервера (dez-federation.ru): без nitro,
// с пререндером всех страниц в готовый HTML.
// Без флага — обычная сборка Lovable: nitro собирает самодостаточный воркер,
// иначе в бандле остаётся внешний импорт h3 и сайт отвечает 502.
const staticExport = process.env["STATIC_EXPORT"] === "1";

export default defineConfig({
  ...(staticExport ? { nitro: false as const } : {}),
  tanstackStart: {
    pages,
    prerender: {
      enabled: staticExport,
      crawlLinks: false,
      autoSubfolderIndex: true,
      failOnError: false,
      concurrency: 4,
    },
  },
});
