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
  const { LANDINGS } = await load("src/data/landings.ts");
  const { WORK_VIDEOS, VIDEO_UPLOAD_DATE } = await load("src/data/videos.ts");
  return { SITE, SERVICES, CITIES, DISTRICTS, POSTS, DOCS, STATIC_PATHS, HUB_SLUGS, WORK_VIDEOS, VIDEO_UPLOAD_DATE, LANDINGS };
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
  const { SITE, SERVICES, CITIES, DISTRICTS, POSTS, DOCS, STATIC_PATHS, HUB_SLUGS, WORK_VIDEOS, VIDEO_UPLOAD_DATE, LANDINGS } = await loadData();
  const BASE = SITE.domain.replace(/\/$/, "");
  const today = new Date().toISOString().slice(0, 10);
  const OUT = pickOutDir();
  mkdirSync(OUT, { recursive: true });

  const xmlEscape = (s) => String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");

  // --- sitemap-pages.xml (посадочные, без lastmod: настоящей даты изменения нет) ---
  const pageEntries = [
    { path: "/", changefreq: "weekly", priority: "1.0" },
    { path: "/services", changefreq: "weekly", priority: "0.9" },
    { path: "/category/dezinfekciya-novosibirsk", changefreq: "weekly", priority: "0.9" },
    { path: "/price", changefreq: "monthly", priority: "0.8" },
    { path: "/garantii", changefreq: "monthly", priority: "0.7" },
    { path: "/o-kompanii", changefreq: "monthly", priority: "0.6" },
    { path: "/contacts", changefreq: "monthly", priority: "0.7" },
    { path: "/faq", changefreq: "monthly", priority: "0.7" },
    { path: "/kp", changefreq: "monthly", priority: "0.7" },
    { path: "/blog", changefreq: "weekly", priority: "0.8" },
    { path: "/video", changefreq: "monthly", priority: "0.6" },
    { path: "/karta-sayta", changefreq: "monthly", priority: "0.3" },
    { path: "/privacy", changefreq: "yearly", priority: "0.2" },
    { path: "/terms", changefreq: "yearly", priority: "0.2" },
    ...HUB_SLUGS.map((slug) => ({ path: `/uslugi/${slug}`, changefreq: "weekly", priority: "0.85" })),
    ...CITIES.map((c) => ({ path: `/gorod/${c.slug}`, changefreq: "weekly", priority: "0.85" })),
    ...DISTRICTS.map((d) => ({ path: `/raion/${d.slug}`, changefreq: "weekly", priority: "0.8" })),
    ...SERVICES.map((s) => ({ path: `/services/${s.slug}`, changefreq: "weekly", priority: "0.9" })),
    ...LANDINGS.map((l) => ({ path: `/obrabotka/${l.slug}`, changefreq: "weekly", priority: "0.85" })),
    ...DOCS.map((d) => ({ path: `/docs/${d.slug}`, changefreq: "yearly", priority: "0.4" })),
  ];
  const blogEntries = POSTS.map((p) => ({ path: `/blog/${p.slug}`, changefreq: "monthly", priority: "0.6", lastmod: p.date }));

  const renderUrlset = (entries) => [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...entries.map((e) => [
      `  <url>`,
      `    <loc>${BASE}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ].filter(Boolean).join("\n")),
    `</urlset>`,
  ].join("\n");

  writeFileSync(resolve(OUT, "sitemap-pages.xml"), renderUrlset(pageEntries), "utf8");
  writeFileSync(resolve(OUT, "sitemap-blog.xml"), renderUrlset(blogEntries), "utf8");

  // --- sitemap-video.xml (расширение Google Video) ---
  // Все ролики живут на одной странице /video, поэтому это один <url> с несколькими <video:video>
  // (повторяющиеся <loc> в видео-карте недопустимы).
  const videoSitemap = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`,
    `  <url>`,
    `    <loc>${BASE}/video</loc>`,
    ...WORK_VIDEOS.map((v) => [
      `    <video:video>`,
      `      <video:thumbnail_loc>${BASE}${v.poster}</video:thumbnail_loc>`,
      `      <video:title>${xmlEscape(v.title)}</video:title>`,
      `      <video:description>${xmlEscape(v.description)}</video:description>`,
      `      <video:content_loc>${BASE}${v.src}</video:content_loc>`,
      `      <video:player_loc>${BASE}/video#${v.slug}</video:player_loc>`,
      `      <video:duration>${v.durationSec}</video:duration>`,
      `      <video:publication_date>${VIDEO_UPLOAD_DATE}</video:publication_date>`,
      `      <video:family_friendly>yes</video:family_friendly>`,
      `      <video:requires_subscription>no</video:requires_subscription>`,
      `      <video:live>no</video:live>`,
      ...v.tags.slice(0, 32).map((t) => `      <video:tag>${xmlEscape(t)}</video:tag>`),
      `    </video:video>`,
    ].join("\n")),
    `  </url>`,
    `</urlset>`,
  ].join("\n");
  writeFileSync(resolve(OUT, "sitemap-video.xml"), videoSitemap, "utf8");

  // --- sitemap.xml (индекс) ---
  const newestPost = POSTS.map((p) => p.date).filter(Boolean).sort().slice(-1)[0];
  const sitemapIndex = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    `  <sitemap><loc>${BASE}/sitemap-pages.xml</loc></sitemap>`,
    `  <sitemap><loc>${BASE}/sitemap-blog.xml</loc>${newestPost ? `<lastmod>${newestPost}</lastmod>` : ""}</sitemap>`,
    `  <sitemap><loc>${BASE}/sitemap-video.xml</loc><lastmod>${VIDEO_UPLOAD_DATE}</lastmod></sitemap>`,
    `</sitemapindex>`,
  ].join("\n");
  writeFileSync(resolve(OUT, "sitemap.xml"), sitemapIndex, "utf8");
  const entries = [...pageEntries, ...blogEntries];

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
  console.log(`  sitemap.xml (индекс из 3 карт)`);
  console.log(`  sitemap-pages.xml (${pageEntries.length} URL), sitemap-blog.xml (${blogEntries.length} URL), sitemap-video.xml (${WORK_VIDEOS.length} видео)`);
  console.log(`  всего страниц в картах: ${entries.length}`);
  console.log(`  yandex-recrawl.txt (${total} URL, абсолютные)`);
  console.log(`  yandex-recrawl-rel.txt (${total} URL, относительные)`);
  console.log(`  .htaccess (SPA fallback + HTTPS + кэш)`);
}

main().catch((err) => {
  console.error("[generate-static] ошибка:", err);
  process.exit(1);
});