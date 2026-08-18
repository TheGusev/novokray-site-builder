#!/usr/bin/env node
// Проверяет, что в статически сгенерированном HTML (STATIC_EXPORT) остался
// JSON-LD: разметка должна быть в исходнике страницы, без участия JS.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function outDir() {
  for (const c of ["dist/client", ".output/public", "dist"]) {
    const p = resolve(ROOT, c);
    if (existsSync(p)) return p;
  }
  return null;
}

function htmlFiles(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) htmlFiles(p, acc);
    else if (entry.endsWith(".html")) acc.push(p);
  }
  return acc;
}

const REQUIRED = [
  { match: (rel) => rel.startsWith("services/"), types: ["Service", "FAQPage", "BreadcrumbList"] },
  { match: (rel) => rel.startsWith("uslugi/"), types: ["OfferCatalog", "FAQPage", "BreadcrumbList"] },
  { match: (rel) => rel.startsWith("gorod/") || rel.startsWith("raion/"), types: ["LocalBusiness", "OfferCatalog", "FAQPage"] },
  { match: (rel) => rel.startsWith("obrabotka/"), types: ["Service", "Offer", "PriceSpecification", "FAQPage", "BreadcrumbList"] },
];

/** Все @id, объявленные узлами (с @type), и все ссылки { "@id": ... } без @type. */
function collectIds(value, ids, refs) {
  if (Array.isArray(value)) {
    for (const v of value) collectIds(v, ids, refs);
    return;
  }
  if (!value || typeof value !== "object") return;
  if (typeof value["@id"] === "string") {
    if (value["@type"]) ids.add(value["@id"]);
    else refs.add(value["@id"]);
  }
  for (const [k, v] of Object.entries(value)) {
    if (k === "@id" || k === "@type") continue;
    collectIds(v, ids, refs);
  }
}

function decodeEntities(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** Разбирает весь JSON-LD страницы и возвращает проблемы связности графа. */
function schemaGraphProblems(rel, html) {
  const problems = [];
  const ids = new Set();
  const refs = new Set();
  const blocks = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)];
  if (!blocks.length) return problems;
  for (const b of blocks) {
    let parsed;
    try {
      parsed = JSON.parse(decodeEntities(b[1].trim()));
    } catch {
      problems.push(`${rel}: JSON-LD не парсится`);
      continue;
    }
    collectIds(parsed, ids, refs);
  }
  for (const ref of refs) {
    if (/#(organization|website|localbusiness)$/i.test(ref)) continue;
    if (!ids.has(ref)) problems.push(`${rel}: висячая ссылка @id ${ref}`);
  }
  return problems;
}

async function main() {
  const OUT = outDir();
  if (!OUT) {
    console.log("[schema] нет собранной директории — проверка пропущена");
    return;
  }
  const { SITE } = await import(pathToFileURL(resolve(ROOT, "src/data/site.ts")).href);
  const files = htmlFiles(OUT);
  const problems = [];
  let checked = 0;

  for (const file of files) {
    const rel = file.slice(OUT.length + 1).replace(/(^|\/)index\.html$/, "").replace(/\.html$/, "");
    const html = readFileSync(file, "utf8");
    const head = html.split("</head>")[0] ?? "";
    problems.push(...schemaGraphProblems(rel, html));
    const rule = REQUIRED.find((r) => r.match(rel));
    if (!rule) continue;
    checked++;
    if (!/application\/ld\+json/.test(head)) {
      problems.push(`${rel}: нет JSON-LD в <head>`);
      continue;
    }
    for (const t of rule.types) {
      if (!html.includes(`&quot;${t}&quot;`) && !html.includes(`"${t}"`))
        problems.push(`${rel}: в статике нет узла ${t}`);
    }
    if (!html.includes(SITE.domain)) problems.push(`${rel}: в разметке нет абсолютных URL`);
  }

  if (problems.length) {
    console.error("[schema] проблемы в статическом HTML:\n" + problems.slice(0, 30).join("\n"));
    process.exit(1);
  }
  console.log(`[schema] JSON-LD найден в статике: проверено ${checked} страниц`);
}

main();
