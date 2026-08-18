/**
 * Граф внутренней перелинковки.
 *
 * Строится не по «модели», а по реально отрендеренному HTML: обходим все
 * маршруты из getAllPaths(), достаём внутренние ссылки и JSON-LD. Так граф
 * не расходится с шаблонами при любой правке разметки.
 *
 * Используется:
 *  - тестом src/data/__tests__/linkGraph.test.ts (по живому dev-серверу);
 *  - скриптом scripts/check-link-graph.mjs при статической сборке.
 */
import { getAllPaths } from "@/lib/all-routes";
import { SERVICE_ANCHOR } from "./interlinking";
import { LANDINGS, PESTS } from "./landings";

export interface GraphEdge {
  from: string;
  to: string;
  /** текст анкора (обрезанный) */
  anchor: string;
}

export interface PageNode {
  path: string;
  status: number;
  out: string[];
  in: string[];
  /** @id всех узлов JSON-LD страницы */
  jsonLdIds: string[];
  /** ссылки вида { "@id": "..." } внутри JSON-LD */
  jsonLdRefs: string[];
  /** типы узлов JSON-LD */
  jsonLdTypes: string[];
}

export interface LinkGraph {
  nodes: Map<string, PageNode>;
  edges: GraphEdge[];
}

/** Нормализуем ссылку: убираем домен, query, hash, финальный слэш. */
export function normalizePath(href: string): string | null {
  if (!href) return null;
  let h = href.trim();
  if (/^(mailto:|tel:|https?:\/\/(?!novokray-site-builder|dez-federation))/i.test(h)) return null;
  h = h.replace(/^https?:\/\/[^/]+/i, "");
  if (!h.startsWith("/")) return null;
  h = h.split("#")[0]!.split("?")[0]!;
  if (h.length > 1) h = h.replace(/\/+$/, "");
  if (/\.(xml|txt|png|jpe?g|webp|svg|mp4|ico|pdf|woff2?)$/i.test(h)) return null;
  if (h.startsWith("/api/") || h.startsWith("/media/") || h.startsWith("/assets/")) return null;
  return h || "/";
}

const LINK_RE = /<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
const LD_RE = /<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi;

function stripTags(s: string): string {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

function collect(value: unknown, ids: string[], refs: string[], types: string[]): void {
  if (Array.isArray(value)) {
    for (const v of value) collect(v, ids, refs, types);
    return;
  }
  if (!value || typeof value !== "object") return;
  const obj = value as Record<string, unknown>;
  const id = obj["@id"];
  if (typeof id === "string") {
    // Узел объявлен, если у него есть @type; иначе это ссылка на узел.
    if (obj["@type"]) ids.push(id);
    else refs.push(id);
  }
  const t = obj["@type"];
  if (typeof t === "string") types.push(t);
  if (Array.isArray(t)) types.push(...t.filter((x): x is string => typeof x === "string"));
  for (const [k, v] of Object.entries(obj)) {
    if (k === "@id" || k === "@type") continue;
    collect(v, ids, refs, types);
  }
}

/** Разбор одной страницы. */
export function parsePage(path: string, status: number, html: string): PageNode {
  const out: string[] = [];
  const anchors: Array<{ to: string; anchor: string }> = [];
  for (const m of html.matchAll(LINK_RE)) {
    const to = normalizePath(m[1]!);
    if (!to || to === path) continue;
    out.push(to);
    anchors.push({ to, anchor: stripTags(m[2] ?? "") });
  }
  const ids: string[] = [];
  const refs: string[] = [];
  const types: string[] = [];
  for (const m of html.matchAll(LD_RE)) {
    try {
      collect(JSON.parse(m[1]!.trim()), ids, refs, types);
    } catch {
      types.push("__invalid_json_ld__");
    }
  }
  const node: PageNode = {
    path,
    status,
    out: [...new Set(out)],
    in: [],
    jsonLdIds: [...new Set(ids)],
    jsonLdRefs: [...new Set(refs)],
    jsonLdTypes: [...new Set(types)],
  };
  (node as PageNode & { anchors: typeof anchors }).anchors = anchors;
  return node;
}

export async function crawlGraph(base: string, paths = getAllPaths()): Promise<LinkGraph> {
  const nodes = new Map<string, PageNode>();
  const edges: GraphEdge[] = [];
  const queue = [...new Set(paths.map((p) => normalizePath(p) ?? p))];

  const worker = async () => {
    for (;;) {
      const path = queue.shift();
      if (!path) return;
      const res = await fetch(`${base}${path}`);
      const html = res.ok ? await res.text() : "";
      nodes.set(path, parsePage(path, res.status, html));
    }
  };
  await Promise.all(Array.from({ length: 8 }, worker));

  for (const node of nodes.values()) {
    const anchors =
      (node as PageNode & { anchors?: Array<{ to: string; anchor: string }> }).anchors ?? [];
    for (const a of anchors) edges.push({ from: node.path, to: a.to, anchor: a.anchor });
    for (const to of node.out) nodes.get(to)?.in.push(node.path);
  }
  return { nodes, edges };
}

/* ------------------------------- анализ ---------------------------------- */

/** Ссылки на несуществующие страницы. */
export function brokenLinks(g: LinkGraph): GraphEdge[] {
  return g.edges.filter((e) => !g.nodes.has(e.to));
}

/** Страницы без входящих ссылок (сироты). */
export function orphans(g: LinkGraph): string[] {
  return [...g.nodes.values()].filter((n) => n.path !== "/" && n.in.length === 0).map((n) => n.path);
}

/** Страницы без исходящих внутренних ссылок (тупики). */
export function deadEnds(g: LinkGraph): string[] {
  return [...g.nodes.values()].filter((n) => n.out.length === 0).map((n) => n.path);
}

/** Глубина клика от главной. */
export function depths(g: LinkGraph): Map<string, number> {
  const d = new Map<string, number>([["/", 0]]);
  const q = ["/"];
  while (q.length) {
    const cur = q.shift()!;
    for (const to of g.nodes.get(cur)?.out ?? []) {
      if (!g.nodes.has(to) || d.has(to)) continue;
      d.set(to, d.get(cur)! + 1);
      q.push(to);
    }
  }
  return d;
}

/**
 * Правило анкоров: чисто коммерческий анкор услуги («уничтожение клопов»)
 * допустим только на ссылке в /services/<slug>. Если такой анкор ведёт на гео-
 * или объектную страницу — это каннибализация запроса.
 */
export function anchorViolations(g: LinkGraph): GraphEdge[] {
  const bad: GraphEdge[] = [];
  for (const e of g.edges) {
    const a = e.anchor.toLowerCase();
    for (const [slug, anchor] of Object.entries(SERVICE_ANCHOR)) {
      if (a !== anchor) continue;
      if (e.to !== `/services/${slug}`) bad.push(e);
    }
  }
  return bad;
}

/** Взаимность: услуга ↔ объектная посадочная. */
export function serviceLandingReciprocity(g: LinkGraph): string[] {
  const problems: string[] = [];
  for (const l of LANDINGS) {
    const landing = `/obrabotka/${l.slug}`;
    const service = `/services/${PESTS[l.pest]?.serviceSlug}`;
    const ln = g.nodes.get(landing);
    const sn = g.nodes.get(service);
    if (!ln || !sn) continue;
    if (!ln.out.includes(service)) problems.push(`${landing} → ${service}`);
    if (!sn.out.includes(landing)) problems.push(`${service} → ${landing}`);
  }
  return problems;
}

/** JSON-LD: ссылки @id, которые никуда не ведут на этой же странице. */
export function danglingSchemaRefs(g: LinkGraph): Array<{ path: string; ref: string }> {
  const out: Array<{ path: string; ref: string }> = [];
  for (const n of g.nodes.values()) {
    const declared = new Set(n.jsonLdIds);
    for (const ref of n.jsonLdRefs) {
      // Ссылки на общие сущности сайта (организация, сайт) объявлены в __root.
      if (/#(organization|website|localbusiness)$/i.test(ref)) continue;
      if (!declared.has(ref)) out.push({ path: n.path, ref });
    }
  }
  return out;
}
