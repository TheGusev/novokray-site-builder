#!/usr/bin/env bun
/**
 * Проверка графа перелинковки по статической сборке (без dev-сервера).
 * Читает HTML из dist/client, строит граф ссылок и валидирует правила
 * из src/data/linkGraph.ts: сироты, тупики, битые ссылки, глубина, анкоры.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const {
  parsePage,
  brokenLinks,
  orphans,
  deadEnds,
  depths,
  anchorViolations,
  serviceLandingReciprocity,
} = await import(resolve(ROOT, "src/data/linkGraph.ts"));

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

const OUT = outDir();
if (!OUT) {
  console.log("[links] нет собранной директории — проверка пропущена");
  process.exit(0);
}

const nodes = new Map();
const edges = [];
for (const file of htmlFiles(OUT)) {
  let rel = "/" + file.slice(OUT.length + 1).replace(/(^|\/)index\.html$/, "").replace(/\.html$/, "");
  rel = rel.length > 1 ? rel.replace(/\/+$/, "") : "/";
  nodes.set(rel, parsePage(rel, 200, readFileSync(file, "utf8")));
}
for (const node of nodes.values()) {
  for (const a of node.anchors ?? []) edges.push({ from: node.path, to: a.to, anchor: a.anchor });
  for (const to of node.out) nodes.get(to)?.in.push(node.path);
}
const graph = { nodes, edges };

const d = depths(graph);
const problems = [
  ...[...new Set(brokenLinks(graph).map((e) => `${e.from} → ${e.to}`))].map((x) => `битая ссылка: ${x}`),
  ...orphans(graph).map((p) => `страница-сирота: ${p}`),
  ...deadEnds(graph).map((p) => `тупик без ссылок: ${p}`),
  ...[...nodes.keys()].filter((p) => (d.get(p) ?? 99) > 3).map((p) => `глубже 3 кликов: ${p}`),
  ...anchorViolations(graph).map((e) => `коммерческий анкор не на услугу: ${e.from} → ${e.to} (${e.anchor})`),
  ...serviceLandingReciprocity(graph).map((x) => `нет обратной ссылки: ${x}`),
];

if (problems.length) {
  console.error(`[links] проблем: ${problems.length}`);
  for (const p of problems.slice(0, 40)) console.error("  - " + p);
  process.exit(1);
}
console.log(`[links] ок: ${nodes.size} страниц, ${edges.length} внутренних ссылок`);
