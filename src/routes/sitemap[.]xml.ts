import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { SITE } from "@/data/site";
import { SERVICES } from "@/data/services";
import { POSTS } from "@/data/blog";
import { CITIES } from "@/data/cities";
import { DISTRICTS } from "@/data/districts";

const HUB_SLUGS = ["unichtozhenie-vrediteley", "sanitarnaya-obrabotka", "obrabotka-uchastkov", "spec-uslugi"];

const BASE_URL = SITE.domain;

type ChangeFreq = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
interface Entry { path: string; lastmod?: string; changefreq?: ChangeFreq; priority?: string }

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const today = new Date().toISOString().slice(0, 10);
        const entries: Entry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0", lastmod: today },
          { path: "/services", changefreq: "weekly", priority: "0.9", lastmod: today },
          { path: "/category/dezinfekciya-novosibirsk", changefreq: "weekly", priority: "0.9", lastmod: today },
          { path: "/price", changefreq: "monthly", priority: "0.8", lastmod: today },
          { path: "/garantii", changefreq: "monthly", priority: "0.7", lastmod: today },
          { path: "/o-kompanii", changefreq: "monthly", priority: "0.6", lastmod: today },
          { path: "/contacts", changefreq: "monthly", priority: "0.7", lastmod: today },
          { path: "/faq", changefreq: "monthly", priority: "0.7", lastmod: today },
          { path: "/blog", changefreq: "weekly", priority: "0.8", lastmod: today },
          { path: "/karta-sayta", changefreq: "monthly", priority: "0.3", lastmod: today },
          { path: "/privacy", changefreq: "yearly", priority: "0.2", lastmod: today },
          { path: "/terms", changefreq: "yearly", priority: "0.2", lastmod: today },
          ...HUB_SLUGS.map((slug) => ({
            path: `/uslugi/${slug}`,
            changefreq: "weekly", priority: "0.85", lastmod: today,
          })),
          ...CITIES.map((c) => ({
            path: `/gorod/${c.slug}`,
            changefreq: "weekly", priority: "0.85", lastmod: today,
          })),
          ...DISTRICTS.map((d) => ({
            path: `/raion/${d.slug}`,
            changefreq: "weekly", priority: "0.8", lastmod: today,
          })),
          ...SERVICES.map((s) => ({
            path: `/services/${s.slug}`,
            changefreq: "weekly", priority: "0.9", lastmod: today,
          })),
          ...POSTS.map((p) => ({
            path: `/blog/${p.slug}`,
            changefreq: "monthly", priority: "0.6", lastmod: p.date,
          })),
        ];

        const urls = entries.map((e) => [
          `  <url>`,
          `    <loc>${BASE_URL}${e.path}</loc>`,
          e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
          e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
          e.priority ? `    <priority>${e.priority}</priority>` : null,
          `  </url>`,
        ].filter(Boolean).join("\n"));

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
