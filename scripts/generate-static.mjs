#!/usr/bin/env node
// Генерирует sitemap.xml, robots.txt (проверка), yandex-recrawl*.txt в dist/client/.
// Запускается после `vite build`.
import { mkdirSync, writeFileSync, existsSync, cpSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

async function loadData() {
  // dynamic import через ts-исходники — используем bun-совместимый путь
  const load = async (p) => (await import(pathToFileURL(resolve(ROOT, p)).href));
  const { SITE } = await load("src/data/site.ts");
  const { SERVICES } = await load("src/data/services.ts");
  const { CITIES } = await load("src/data/cities.ts");
  const { DISTRICTS } = await load("src/data/districts.ts");
  const { POSTS } = await load("src/data/blog.ts");
  const { DOCS } = await load("src/data/docs.ts");
  const { STATIC_PATHS, HUB_SLUGS } = await load("src/lib/all-routes.ts");
  return { SITE, SERVICES, CITIES, DISTRICTS, POSTS, DOCS, STATIC_PATHS, HUB_SLUGS };
}

function pickOutDir() {
  // Возможные локации client-выхода Vite/TanStack Start
  const candidates = [
    "dist/client",
    ".output/public",
    "dist",
  ];
  for (const c of candidates) {
    const p = resolve(ROOT, c);
    if (existsSync(p)) return p;
  }
  return resolve(ROOT, "dist");
}

async function main() {
  const { SITE, SERVICES, CITIES, DISTRICTS, POSTS, DOCS, STATIC_PATHS, HUB_SLUGS } = await loadData();
  const BASE = SITE.domain.replace(/\/$/, "");
  const today = new Date().toISOString().slice(0, 10);
  const OUT = pickOutDir();
  mkdirSync(OUT, { recursive: true });

  // --- sitemap.xml ---
  const entries = [
    { path: "/", changefreq: "weekly", priority: "1.0", lastmod: today },
    { path: "/services", changefreq: "weekly", priority: "0.9", lastmod: today },
    { path: "/category/dezinfekciya-novosibirsk", changefreq: "weekly", priority: "0.9", lastmod: today },
    { path: "/price", changefreq: "monthly", priority: "0.8", lastmod: today },
    { path: "/garantii", changefreq: "monthly", priority: "0.7", lastmod: today },
    { path: "/o-kompanii", changefreq: "monthly", priority: "0.6", lastmod: today },
    { path: "/contacts", changefreq: "monthly", priority: "0.7", lastmod: today },
    { path: "/faq", changefreq: "monthly", priority: "0.7", lastmod: today },
    { path: "/kp", changefreq: "monthly", priority: "0.7", lastmod: today },
    { path: "/blog", changefreq: "weekly", priority: "0.8", lastmod: today },
    { path: "/karta-sayta", changefreq: "monthly", priority: "0.3", lastmod: today },
    { path: "/privacy", changefreq: "yearly", priority: "0.2", lastmod: today },
    { path: "/terms", changefreq: "yearly", priority: "0.2", lastmod: today },
    ...HUB_SLUGS.map((slug) => ({ path: `/uslugi/${slug}`, changefreq: "weekly", priority: "0.85", lastmod: today })),
    ...CITIES.map((c) => ({ path: `/gorod/${c.slug}`, changefreq: "weekly", priority: "0.85", lastmod: today })),
    ...DISTRICTS.map((d) => ({ path: `/raion/${d.slug}`, changefreq: "weekly", priority: "0.8", lastmod: today })),
    ...SERVICES.map((s) => ({ path: `/services/${s.slug}`, changefreq: "weekly", priority: "0.9", lastmod: today })),
    ...POSTS.map((p) => ({ path: `/blog/${p.slug}`, changefreq: "monthly", priority: "0.6", lastmod: p.date })),
    ...DOCS.map((d) => ({ path: `/docs/${d.slug}`, changefreq: "yearly", priority: "0.4", lastmod: today })),
  ];
  const urls = entries.map((e) => [
    `  <url>`,
    `    <loc>${BASE}${e.path}</loc>`,
    e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
    e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
    e.priority ? `    <priority>${e.priority}</priority>` : null,
    `  </url>`,
  ].filter(Boolean).join("\n"));
  const sitemap = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
  writeFileSync(resolve(OUT, "sitemap.xml"), sitemap, "utf8");

  // --- yandex-recrawl.txt (абсолютные URL) ---
  const priority1 = STATIC_PATHS;
  const hubs = HUB_SLUGS.map((s) => `/uslugi/${s}`);
  const services = SERVICES.map((s) => `/services/${s.slug}`);
  const cities = CITIES.map((c) => `/gorod/${c.slug}`);
  const districts = DISTRICTS.map((d) => `/raion/${d.slug}`);
  const blog = POSTS.map((p) => `/blog/${p.slug}`);
  const docs = DOCS.map((d) => `/docs/${d.slug}`);

  const total = priority1.length + hubs.length + services.length + cities.length + districts.length + blog.length + docs.length;
  const section = (title, paths, mapper) => [`# ${title} (${paths.length})`, ...paths.map(mapper), ""].join("\n");
  const abs = (p) => `${BASE}${p}`;
  const rel = (p) => p;

  const header = [
    `# Список URL для переобхода в Яндекс.Вебмастере`,
    `# Домен: ${BASE}`,
    `# Всего: ${total} URL`,
    `# Сгенерировано: ${today}`,
    ``,
  ].join("\n");

  const buildBody = (mapper) => header + [
    section("Приоритет 1 · ключевые посадочные", priority1, mapper),
    section("Приоритет 2 · хабы услуг", hubs, mapper),
    section("Приоритет 3 · услуги", services, mapper),
    section("Приоритет 4 · города", cities, mapper),
    section("Приоритет 4 · районы", districts, mapper),
    section("Приоритет 5 · блог", blog, mapper),
    section("Приоритет 6 · документы", docs, mapper),
  ].join("\n");

  writeFileSync(resolve(OUT, "yandex-recrawl.txt"), buildBody(abs), "utf8");
  writeFileSync(resolve(OUT, "yandex-recrawl-rel.txt"), buildBody(rel), "utf8");

  // --- .htaccess (SPA fallback + HTTPS + кэш) ---
  const htaccess = `# Дез-Федерация — статический хостинг (Beget / Apache)
Options -MultiViews
RewriteEngine On

# HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Убираем завершающий слэш (кроме корня)
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.+)/$ /$1 [R=301,L]

# 1) Если запрошенный путь — это готовый файл или каталог, отдаём как есть
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# 2) Пытаемся отдать <path>.html (prerender)
RewriteCond %{DOCUMENT_ROOT}/$1.html -f
RewriteRule ^(.+)$ /$1.html [L]

# 3) Пытаемся отдать <path>/index.html
RewriteCond %{DOCUMENT_ROOT}/$1/index.html -f
RewriteRule ^(.+)$ /$1/index.html [L]

# 4) SPA-fallback — всё остальное на index.html
RewriteRule ^ /index.html [L]

# 404
ErrorDocument 404 /index.html

# Сжатие
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/plain text/xml text/javascript application/javascript application/json application/xml image/svg+xml application/rss+xml
</IfModule>

# Кэширование
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 5 minutes"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/jpeg "access plus 6 months"
  ExpiresByType image/png "access plus 6 months"
  ExpiresByType image/webp "access plus 6 months"
  ExpiresByType image/svg+xml "access plus 6 months"
  ExpiresByType font/woff2 "access plus 1 year"
  ExpiresByType application/font-woff2 "access plus 1 year"
  ExpiresByType application/pdf "access plus 1 month"
  ExpiresByType application/xml "access plus 1 hour"
</IfModule>

# Отключаем ETag (используем Expires)
<IfModule mod_headers.c>
  Header unset ETag
</IfModule>
FileETag None

# Безопасность
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Правильные MIME
AddType application/xml .xml
AddType text/plain .txt
AddDefaultCharset UTF-8
`;
  writeFileSync(resolve(OUT, ".htaccess"), htaccess, "utf8");

  console.log(`[generate-static] Записано в ${OUT}:`);
  console.log(`  sitemap.xml (${entries.length} URL)`);
  console.log(`  yandex-recrawl.txt (${total} URL, абсолютные)`);
  console.log(`  yandex-recrawl-rel.txt (${total} URL, относительные)`);
  console.log(`  .htaccess (SPA fallback + HTTPS + кэш)`);
}

main().catch((err) => {
  console.error("[generate-static] ошибка:", err);
  process.exit(1);
});