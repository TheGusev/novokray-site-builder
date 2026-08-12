import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import routesJson from "./src/generated/routes.json" with { type: "json" };

// Все маршруты для prerender в статический HTML (для shared hosting без Node.js).
// Файл src/generated/routes.json обновляется скриптом scripts/build-routes-json.ts (prebuild).
const pages = (routesJson.paths as string[]).map((path) => ({ path }));

export default defineConfig({
  tanstackStart: {
    // Prerender всех маршрутов в готовые HTML-файлы.
    pages,
    prerender: {
      enabled: true,
      crawlLinks: false,
      autoSubfolderIndex: true,
      failOnError: false,
      concurrency: 4,
    },
  },
});
