import { SERVICES } from "../data/services";
import { CITIES } from "../data/cities";
import { DISTRICTS } from "../data/districts";
import { POSTS } from "../data/blog";
import { DOCS } from "../data/docs";
import { LANDINGS } from "../data/landings";

export const HUB_SLUGS = [
  "unichtozhenie-vrediteley",
  "sanitarnaya-obrabotka",
  "obrabotka-uchastkov",
  "spec-uslugi",
];

export const STATIC_PATHS: string[] = [
  "/",
  "/services",
  "/category/dezinfekciya-novosibirsk",
  "/price",
  "/garantii",
  "/o-kompanii",
  "/contacts",
  "/faq",
  "/kp",
  "/blog",
  "/video",
  "/karta-sayta",
  "/privacy",
  "/terms",
  "/dogovor/zapolnit",
];

export function getAllPaths(): string[] {
  return [
    ...STATIC_PATHS,
    ...HUB_SLUGS.map((s) => `/uslugi/${s}`),
    ...SERVICES.map((s) => `/services/${s.slug}`),
    ...CITIES.map((c) => `/gorod/${c.slug}`),
    ...DISTRICTS.map((d) => `/raion/${d.slug}`),
    ...POSTS.map((p) => `/blog/${p.slug}`),
    ...LANDINGS.map((l) => `/obrabotka/${l.slug}`),
    ...DOCS.map((d) => `/docs/${d.slug}`),
  ];
}