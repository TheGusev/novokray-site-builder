/**
 * Проверка графа перелинковки по живому dev-серверу.
 * Если сервер не поднят — блок пропускается (CI без сервера остаётся зелёным).
 */
import { describe, it, expect, beforeAll } from "vitest";
import {
  crawlGraph,
  brokenLinks,
  orphans,
  deadEnds,
  depths,
  anchorViolations,
  serviceLandingReciprocity,
  danglingSchemaRefs,
  type LinkGraph,
} from "../linkGraph";

const BASE = process.env["HEAD_TEST_BASE"] ?? "http://localhost:8080";
let up = false;
let graph: LinkGraph;

beforeAll(async () => {
  try {
    up = (await fetch(`${BASE}/`)).ok;
  } catch {
    up = false;
  }
  if (up) graph = await crawlGraph(BASE);
}, 240_000);

describe("граф внутренней перелинковки", () => {
  it("все страницы отвечают 200", () => {
    if (!up) return;
    const bad = [...graph.nodes.values()].filter((n) => n.status !== 200).map((n) => n.path);
    expect(bad).toEqual([]);
  });

  it("нет ссылок на несуществующие страницы", () => {
    if (!up) return;
    expect([...new Set(brokenLinks(graph).map((e) => `${e.from} → ${e.to}`))]).toEqual([]);
  });

  it("нет страниц-сирот", () => {
    if (!up) return;
    expect(orphans(graph)).toEqual([]);
  });

  it("нет тупиков без исходящих ссылок", () => {
    if (!up) return;
    expect(deadEnds(graph)).toEqual([]);
  });

  it("любая страница достижима не дальше 3 кликов от главной", () => {
    if (!up) return;
    const d = depths(graph);
    const far = [...graph.nodes.keys()].filter((p) => (d.get(p) ?? 99) > 3);
    expect(far).toEqual([]);
  });

  it("коммерческий анкор услуги ведёт только на страницу услуги", () => {
    if (!up) return;
    expect(anchorViolations(graph).map((e) => `${e.from} → ${e.to} (${e.anchor})`)).toEqual([]);
  });

  it("услуга и объектная посадочная ссылаются друг на друга", () => {
    if (!up) return;
    expect(serviceLandingReciprocity(graph)).toEqual([]);
  });

  it("в JSON-LD нет висячих ссылок @id", () => {
    if (!up) return;
    expect(danglingSchemaRefs(graph)).toEqual([]);
  });
});
