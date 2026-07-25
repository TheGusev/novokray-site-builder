import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { getAllPaths } from "./src/lib/all-routes";

// Все маршруты для prerender в статический HTML (для shared hosting без Node.js).
const pages = getAllPaths().map((path) => ({ path }));

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
    // SPA-режим: клиентский роутинг после гидратации + fallback для несуществующих статических файлов.
    spa: {
      enabled: true,
      prerender: { enabled: true, outputPath: "/index.html" },
    },
  },
});
