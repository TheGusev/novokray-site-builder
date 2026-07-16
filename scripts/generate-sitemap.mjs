// Generates public/sitemap.xml from route data for static Beget deployment.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const BASE = "https://dez-federation.ru";
const __dirname = dirname(fileURLToPath(import.meta.url));

async function load(p) {
  return (await import(resolve(__dirname, "..", p))).default ?? await import(resolve(__dirname, "..", p));
}

const { SERVICES: services } = await import("../src/data/services.ts").catch(() => ({ services: [] }));
const { POSTS: BLOG_POSTS } = await import("../src/data/blog.ts").catch(() => ({ BLOG_POSTS: [] }));
const { CITIES } = await import("../src/data/cities.ts").catch(() => ({ CITIES: [] }));
const { DISTRICTS } = await import("../src/data/districts.ts").catch(() => ({ DISTRICTS: [] }));
const { DOCS } = await import("../src/data/docs.ts").catch(() => ({ DOCS: [] }));

const staticPaths = [
  ["/", "1.0", "weekly"],
  ["/services", "0.9", "weekly"],
  ["/price", "0.9", "weekly"],
  ["/garantii", "0.7", "monthly"],
  ["/o-kompanii", "0.6", "monthly"],
  ["/contacts", "0.6", "monthly"],
  ["/blog", "0.9", "daily"],
  ["/faq", "0.6", "monthly"],
  ["/kp", "0.7", "monthly"],
  ["/dogovor/zapolnit", "0.5", "monthly"],
  ["/karta-sayta", "0.4", "monthly"],
  ["/privacy", "0.2", "yearly"],
  ["/terms", "0.2", "yearly"],
  ["/category/dezinfekciya-novosibirsk", "0.7", "monthly"],
];

const urls = [];
for (const [p, pr, ch] of staticPaths) urls.push({ loc: BASE + p, changefreq: ch, priority: pr });
for (const s of services || []) urls.push({ loc: `${BASE}/services/${s.slug}`, changefreq: "monthly", priority: "0.8" });
for (const s of services || []) urls.push({ loc: `${BASE}/uslugi/${s.slug}`, changefreq: "monthly", priority: "0.6" });
for (const b of BLOG_POSTS || []) urls.push({ loc: `${BASE}/blog/${b.slug}`, changefreq: "monthly", priority: "0.7" });
for (const c of CITIES || []) urls.push({ loc: `${BASE}/gorod/${c.slug}`, changefreq: "monthly", priority: "0.7" });
for (const d of DISTRICTS || []) urls.push({ loc: `${BASE}/raion/${d.slug}`, changefreq: "monthly", priority: "0.7" });
for (const d of DOCS || []) urls.push({ loc: `${BASE}/docs/${d.slug}`, changefreq: "yearly", priority: "0.5" });

const today = new Date().toISOString().slice(0, 10);
const xml = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
  ...urls.map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`),
  `</urlset>`,
].join("\n");

writeFileSync(resolve(__dirname, "..", "public/sitemap.xml"), xml);
console.log(`Wrote ${urls.length} URLs to public/sitemap.xml`);
